-- Phase 8 — courses (LMS).
-- Structure (courses, modules, lessons, quiz) lives here and is edited from the back-office
-- (phase 11); lesson texts are MDX files in the repository (content/formations/…), rendered
-- server-side only after an access check. Access, progress, attempts and certificates are
-- per-member data protected by RLS. Quiz answers are never readable by clients: grading
-- happens in a security-definer function.

-- ---------------------------------------------------------------------------
-- Catalogue
-- ---------------------------------------------------------------------------
create table public.courses (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]{3,80}$'),
  code text not null,
  title text not null,
  summary text not null,
  objectives text[] not null default '{}',
  audience text not null,
  prerequisites text[] not null default '{}',
  level text not null check (level in ('debutant', 'intermediaire')),
  is_free boolean not null default false,
  -- TTC, in cents; null for free courses.
  price_cents integer check (price_cents is null or price_cents > 0),
  access_months integer not null default 24 check (access_months > 0),
  faq jsonb not null default '[]',
  status text not null default 'draft' check (status in ('draft', 'published')),
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (is_free = (price_cents is null))
);

create table public.modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses (id) on delete cascade,
  position integer not null,
  title text not null,
  pass_score integer not null default 80 check (pass_score between 0 and 100),
  -- Maintained by trigger: lets the public programme show quizzes without exposing questions.
  question_count integer not null default 0,
  unique (course_id, position)
);

create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses (id) on delete cascade,
  module_id uuid not null references public.modules (id) on delete cascade,
  position integer not null,
  slug text not null check (slug ~ '^[a-z0-9-]{3,80}$'),
  title text not null,
  duration_min integer not null check (duration_min > 0),
  has_video boolean not null default false,
  -- Video id at the hosting provider (Bunny Stream); null until uploaded.
  video_id text,
  -- Path of the lesson text, relative to content/formations/.
  mdx_path text not null,
  is_preview boolean not null default false,
  unique (course_id, slug),
  unique (module_id, position)
);

create table public.lesson_resources (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons (id) on delete cascade,
  label text not null,
  -- Object path in the private "ressources" Storage bucket.
  storage_path text not null,
  position integer not null default 0
);

create table public.quiz_questions (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.modules (id) on delete cascade,
  position integer not null,
  prompt text not null,
  choices text[] not null check (cardinality(choices) between 2 and 6),
  correct_index integer not null,
  explanation text not null,
  unique (module_id, position),
  check (correct_index >= 0 and correct_index < cardinality(choices))
);

create function public.sync_question_count()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.modules m
  set question_count = (select count(*) from public.quiz_questions q where q.module_id = m.id)
  where m.id in (coalesce(new.module_id, old.module_id), coalesce(old.module_id, new.module_id));
  return null;
end;
$$;

create trigger quiz_questions_count after insert or update or delete on public.quiz_questions
  for each row execute function public.sync_question_count();

-- ---------------------------------------------------------------------------
-- Member data
-- ---------------------------------------------------------------------------
create table public.enrollments (
  user_id uuid not null references public.profiles (id) on delete cascade,
  course_id uuid not null references public.courses (id) on delete restrict,
  source text not null check (source in ('free', 'purchase', 'admin')),
  -- Filled by the Stripe webhook (phase 9).
  order_id uuid,
  created_at timestamptz not null default now(),
  expires_at timestamptz,
  primary key (user_id, course_id)
);

create table public.lesson_progress (
  user_id uuid not null references public.profiles (id) on delete cascade,
  lesson_id uuid not null references public.lessons (id) on delete cascade,
  course_id uuid not null references public.courses (id) on delete cascade,
  completed_at timestamptz,
  last_seen_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);

create table public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  module_id uuid not null references public.modules (id) on delete cascade,
  score integer not null check (score between 0 and 100),
  passed boolean not null,
  answers jsonb not null,
  created_at timestamptz not null default now()
);

create index quiz_attempts_user_module_idx on public.quiz_attempts (user_id, module_id, created_at desc);

create table public.certificates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  course_id uuid not null references public.courses (id) on delete restrict,
  serial text not null unique,
  holder_name text not null,
  issued_at timestamptz not null default now(),
  unique (user_id, course_id)
);

-- ---------------------------------------------------------------------------
-- Access helpers
-- ---------------------------------------------------------------------------
create function public.has_access(p_course_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.is_admin() or exists (
    select 1 from public.enrollments e
    where e.user_id = (select auth.uid())
      and e.course_id = p_course_id
      and (e.expires_at is null or e.expires_at > now())
  );
$$;

revoke all on function public.has_access(uuid) from public;
grant execute on function public.has_access(uuid) to authenticated, service_role;

-- Free, published courses: a member enrolls themself (no expiry).
create function public.enroll_free(p_course_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select auth.uid()) is null then
    raise exception 'not_authenticated' using errcode = '28000';
  end if;
  if not exists (select 1 from public.courses where id = p_course_id and is_free and status = 'published') then
    raise exception 'not_free' using errcode = 'P0001';
  end if;
  insert into public.enrollments (user_id, course_id, source)
  values ((select auth.uid()), p_course_id, 'free')
  on conflict do nothing;
end;
$$;

revoke all on function public.enroll_free(uuid) from public;
grant execute on function public.enroll_free(uuid) to authenticated;

-- Grades a quiz server-side (answers stay secret), stores the attempt, returns the correction.
create function public.submit_quiz(p_module_id uuid, p_answers integer[])
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_course uuid;
  v_pass integer;
  v_total integer;
  v_correct integer;
  v_score integer;
  v_result jsonb;
begin
  select m.course_id, m.pass_score into v_course, v_pass from public.modules m where m.id = p_module_id;
  if v_course is null or not public.has_access(v_course) then
    raise exception 'no_access' using errcode = '42501';
  end if;
  select count(*) into v_total from public.quiz_questions where module_id = p_module_id;
  if v_total = 0 or cardinality(p_answers) <> v_total then
    raise exception 'invalid_answers' using errcode = 'P0001';
  end if;

  select
    count(*) filter (where q.correct_index = p_answers[q.rn]),
    jsonb_agg(jsonb_build_object(
      'questionId', q.id,
      'chosen', p_answers[q.rn],
      'correctIndex', q.correct_index,
      'correct', q.correct_index = p_answers[q.rn],
      'explanation', q.explanation
    ) order by q.rn)
  into v_correct, v_result
  from (
    select qq.*, row_number() over (order by qq.position) as rn
    from public.quiz_questions qq where qq.module_id = p_module_id
  ) q;

  v_score := round(100.0 * v_correct / v_total);
  insert into public.quiz_attempts (user_id, module_id, score, passed, answers)
  values ((select auth.uid()), p_module_id, v_score, v_score >= v_pass, to_jsonb(p_answers));

  return jsonb_build_object('score', v_score, 'passed', v_score >= v_pass, 'passScore', v_pass, 'questions', v_result);
end;
$$;

revoke all on function public.submit_quiz(uuid, integer[]) from public;
grant execute on function public.submit_quiz(uuid, integer[]) to authenticated;

-- Completion of a course: every lesson completed and every module quiz passed.
create function public.course_completed(p_course_id uuid, p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    not exists (
      select 1 from public.lessons l
      where l.course_id = p_course_id
        and not exists (
          select 1 from public.lesson_progress lp
          where lp.lesson_id = l.id and lp.user_id = p_user_id and lp.completed_at is not null
        )
    )
    and not exists (
      select 1 from public.modules m
      where m.course_id = p_course_id
        and exists (select 1 from public.quiz_questions q where q.module_id = m.id)
        and not exists (
          select 1 from public.quiz_attempts a where a.module_id = m.id and a.user_id = p_user_id and a.passed
        )
    );
$$;

revoke all on function public.course_completed(uuid, uuid) from public;

-- Issues (once) the « attestation de suivi » when the course is completed.
create function public.issue_certificate(p_course_id uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := (select auth.uid());
  v_id uuid;
  v_name text;
begin
  if v_user is null or not public.has_access(p_course_id) then
    raise exception 'no_access' using errcode = '42501';
  end if;
  select id into v_id from public.certificates where user_id = v_user and course_id = p_course_id;
  if v_id is not null then
    return v_id;
  end if;
  if not public.course_completed(p_course_id, v_user) then
    raise exception 'not_completed' using errcode = 'P0001';
  end if;
  select coalesce(nullif(display_name, ''), 'Membre') into v_name from public.profiles where id = v_user;
  insert into public.certificates (user_id, course_id, serial, holder_name)
  values (v_user, p_course_id, 'PV-' || to_char(now(), 'YYYY') || '-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10)), v_name)
  returning id into v_id;
  return v_id;
end;
$$;

revoke all on function public.issue_certificate(uuid) from public;
grant execute on function public.issue_certificate(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.courses enable row level security;
alter table public.modules enable row level security;
alter table public.lessons enable row level security;
alter table public.lesson_resources enable row level security;
alter table public.quiz_questions enable row level security;
alter table public.enrollments enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.certificates enable row level security;

-- The catalogue policies call is_admin() for anonymous visitors too (it returns false).
grant execute on function public.is_admin() to anon;

-- Published catalogue: public.
create policy "courses: read published" on public.courses
  for select to anon, authenticated using (status = 'published' or public.is_admin());
create policy "modules: read published" on public.modules
  for select to anon, authenticated using (exists (select 1 from public.courses c where c.id = course_id and (c.status = 'published' or public.is_admin())));
create policy "lessons: read published" on public.lessons
  for select to anon, authenticated using (exists (select 1 from public.courses c where c.id = course_id and (c.status = 'published' or public.is_admin())));
-- Questions (without answers, see column grants) for members with access.
create policy "quiz_questions: read with access" on public.quiz_questions
  for select to authenticated using (exists (select 1 from public.modules m where m.id = module_id and public.has_access(m.course_id)));
-- Resource list for members with access (files are served by a signed URL).
create policy "lesson_resources: read with access" on public.lesson_resources
  for select to authenticated using (exists (select 1 from public.lessons l where l.id = lesson_id and public.has_access(l.course_id)));

create policy "enrollments: read own" on public.enrollments
  for select to authenticated using (user_id = (select auth.uid()));

create policy "lesson_progress: read own" on public.lesson_progress
  for select to authenticated using (user_id = (select auth.uid()));
create policy "lesson_progress: write own with access" on public.lesson_progress
  for insert to authenticated with check (user_id = (select auth.uid()) and public.has_access(course_id));
create policy "lesson_progress: update own with access" on public.lesson_progress
  for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()) and public.has_access(course_id));

create policy "quiz_attempts: read own" on public.quiz_attempts
  for select to authenticated using (user_id = (select auth.uid()));

create policy "certificates: read own" on public.certificates
  for select to authenticated using (user_id = (select auth.uid()));

-- Keep lesson_progress.course_id consistent with the lesson (prevents spoofing access checks).
create function public.lesson_progress_course()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.course_id := (select l.course_id from public.lessons l where l.id = new.lesson_id);
  return new;
end;
$$;

create trigger lesson_progress_course before insert or update on public.lesson_progress
  for each row execute function public.lesson_progress_course();

-- ---------------------------------------------------------------------------
-- Grants (auto_expose_new_tables = false)
-- ---------------------------------------------------------------------------
grant select on public.courses, public.modules, public.lessons to anon, authenticated;
grant select on public.lesson_resources to authenticated;
-- Questions without correct_index / explanation.
grant select (id, module_id, position, prompt, choices) on public.quiz_questions to authenticated;
grant select on public.enrollments, public.quiz_attempts, public.certificates to authenticated;
grant select, insert, update on public.lesson_progress to authenticated;
grant all on public.courses, public.modules, public.lessons, public.lesson_resources, public.quiz_questions,
  public.enrollments, public.lesson_progress, public.quiz_attempts, public.certificates to service_role;

create trigger courses_touch before update on public.courses
  for each row execute function public.touch_updated_at();
