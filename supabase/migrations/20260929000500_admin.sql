-- Phase 11 — back-office. Admins act with their own session: every write goes through RLS
-- policies gated by public.is_admin() (defence in depth: the pages also check the role).
-- Aggregates over all members are security-definer functions that refuse non-admins.

-- ---------------------------------------------------------------------------
-- Course structure: admin writes
-- ---------------------------------------------------------------------------
create policy "courses: admin write" on public.courses
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "modules: admin write" on public.modules
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "lessons: admin write" on public.lessons
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "lesson_resources: admin all" on public.lesson_resources
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "quiz_questions: admin write" on public.quiz_questions
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

grant insert, update, delete on public.courses, public.modules, public.lessons,
  public.lesson_resources to authenticated;
-- Answers stay unreadable through the API (column grant); admins read them via
-- admin_quiz_questions() and may write them.
grant insert, update, delete on public.quiz_questions to authenticated;

-- A lesson always belongs to a module of its own course.
create function public.lessons_same_course()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if not exists (select 1 from public.modules m where m.id = new.module_id and m.course_id = new.course_id) then
    raise exception 'module_of_other_course' using errcode = '23514';
  end if;
  return new;
end;
$$;

create trigger lessons_same_course before insert or update on public.lessons
  for each row execute function public.lessons_same_course();

-- ---------------------------------------------------------------------------
-- Sales and subscribers: admin reads
-- ---------------------------------------------------------------------------
create policy "orders: admin read" on public.orders
  for select to authenticated using (public.is_admin());
create policy "order_items: admin read" on public.order_items
  for select to authenticated using (public.is_admin());
create policy "invoices: admin read" on public.invoices
  for select to authenticated using (public.is_admin());
create policy "withdrawals: admin read" on public.withdrawals
  for select to authenticated using (public.is_admin());
create policy "enrollments: admin read" on public.enrollments
  for select to authenticated using (public.is_admin());

create policy "newsletter_subscribers: admin read" on public.newsletter_subscribers
  for select to authenticated using (public.is_admin());
-- Never the access token (unsubscribe links) nor the confirmation token.
grant select (id, email, status, source, consent_text_version, requested_at, confirmed_at,
  unsubscribed_at, sequence_step) on public.newsletter_subscribers to authenticated;

-- ---------------------------------------------------------------------------
-- Admin functions
-- ---------------------------------------------------------------------------
create function public.assert_admin()
returns void
language plpgsql
stable
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'admin_only' using errcode = '42501';
  end if;
end;
$$;

-- Quiz questions with their answers, for editing.
create function public.admin_quiz_questions(p_module_id uuid)
returns setof public.quiz_questions
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  perform public.assert_admin();
  return query select * from public.quiz_questions where module_id = p_module_id order by position;
end;
$$;

-- Moves a module, lesson or question one place up (-1) or down (+1) among its siblings.
create function public.admin_move(p_kind text, p_id uuid, p_direction integer)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_pos integer;
  v_parent uuid;
  v_other uuid;
  v_other_pos integer;
begin
  perform public.assert_admin();
  if p_direction not in (-1, 1) then
    raise exception 'invalid_direction' using errcode = '22023';
  end if;
  if p_kind = 'module' then
    select position, course_id into v_pos, v_parent from public.modules where id = p_id;
    select id, position into v_other, v_other_pos from public.modules
      where course_id = v_parent and (case when p_direction < 0 then position < v_pos else position > v_pos end)
      order by case when p_direction < 0 then -position else position end limit 1;
    if v_other is null then return; end if;
    update public.modules set position = -1 where id = p_id;
    update public.modules set position = v_pos where id = v_other;
    update public.modules set position = v_other_pos where id = p_id;
  elsif p_kind = 'lesson' then
    select position, module_id into v_pos, v_parent from public.lessons where id = p_id;
    select id, position into v_other, v_other_pos from public.lessons
      where module_id = v_parent and (case when p_direction < 0 then position < v_pos else position > v_pos end)
      order by case when p_direction < 0 then -position else position end limit 1;
    if v_other is null then return; end if;
    update public.lessons set position = -1 where id = p_id;
    update public.lessons set position = v_pos where id = v_other;
    update public.lessons set position = v_other_pos where id = p_id;
  elsif p_kind = 'question' then
    select position, module_id into v_pos, v_parent from public.quiz_questions where id = p_id;
    select id, position into v_other, v_other_pos from public.quiz_questions
      where module_id = v_parent and (case when p_direction < 0 then position < v_pos else position > v_pos end)
      order by case when p_direction < 0 then -position else position end limit 1;
    if v_other is null then return; end if;
    update public.quiz_questions set position = -1 where id = p_id;
    update public.quiz_questions set position = v_pos where id = v_other;
    update public.quiz_questions set position = v_other_pos where id = p_id;
  else
    raise exception 'invalid_kind' using errcode = '22023';
  end if;
end;
$$;

-- Members list with their e-mail (auth.users is not exposed to the API).
create function public.admin_students(p_search text, p_limit integer, p_offset integer)
returns table (
  id uuid,
  email text,
  display_name text,
  role text,
  created_at timestamptz,
  courses integer,
  paid_orders integer,
  last_activity timestamptz,
  total bigint
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  perform public.assert_admin();
  return query
  with matching as (
    select p.id, u.email::text as email, p.display_name, p.role, p.created_at
    from public.profiles p join auth.users u on u.id = p.id
    where coalesce(p_search, '') = ''
      or u.email ilike '%' || p_search || '%'
      or p.display_name ilike '%' || p_search || '%'
  )
  select m.id, m.email, m.display_name, m.role, m.created_at,
    (select count(*)::int from public.enrollments e where e.user_id = m.id and e.revoked_at is null),
    (select count(*)::int from public.orders o where o.user_id = m.id and o.status = 'paid'),
    (select max(lp.last_seen_at) from public.lesson_progress lp where lp.user_id = m.id),
    count(*) over ()
  from matching m
  order by m.created_at desc
  limit p_limit offset p_offset;
end;
$$;

-- Dashboard figures. p_inactive_days: a learner who has not finished and has not opened a
-- lesson for that long is counted as having dropped out, at their first unfinished lesson.
create function public.admin_dashboard(p_inactive_days integer)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_since timestamptz := now() - interval '30 days';
begin
  perform public.assert_admin();
  return jsonb_build_object(
    'sales', (
      select jsonb_build_object(
        'paidCount', count(*) filter (where status = 'paid'),
        'paidCents', coalesce(sum(amount_cents) filter (where status = 'paid'), 0),
        'paidCount30', count(*) filter (where status = 'paid' and paid_at >= v_since),
        'paidCents30', coalesce(sum(amount_cents) filter (where status = 'paid' and paid_at >= v_since), 0),
        'refundedCount', count(*) filter (where status in ('withdrawn', 'refunded')),
        'refundedCents', coalesce(sum(amount_cents) filter (where status in ('withdrawn', 'refunded')), 0)
      ) from public.orders
    ),
    'members', (
      select jsonb_build_object(
        'total', count(*),
        'last30', count(*) filter (where created_at >= v_since)
      ) from public.profiles
    ),
    'newsletter', (
      select jsonb_build_object(
        'confirmed', count(*) filter (where status = 'confirmed'),
        'pending', count(*) filter (where status = 'pending'),
        'unsubscribed', count(*) filter (where status = 'unsubscribed')
      ) from public.newsletter_subscribers
    ),
    'pendingRefunds', (
      select count(*) from public.withdrawals where refund_status <> 'succeeded'
    ),
    'courses', coalesce((
      select jsonb_agg(stats order by stats ->> 'position', stats ->> 'title') from (
        select jsonb_build_object(
          'id', c.id,
          'title', c.title,
          'position', c.position,
          'lessons', (select count(*) from public.lessons l where l.course_id = c.id),
          'enrolled', (select count(*) from public.enrollments e where e.course_id = c.id and e.revoked_at is null),
          'started', (
            select count(distinct lp.user_id) from public.lesson_progress lp
            join public.enrollments e on e.user_id = lp.user_id and e.course_id = c.id and e.revoked_at is null
            where lp.course_id = c.id
          ),
          'completed', (
            select count(*) from public.enrollments e
            where e.course_id = c.id and e.revoked_at is null
              and exists (select 1 from public.lessons l where l.course_id = c.id)
              and not exists (
                select 1 from public.lessons l where l.course_id = c.id
                  and not exists (select 1 from public.lesson_progress lp
                                  where lp.lesson_id = l.id and lp.user_id = e.user_id and lp.completed_at is not null)
              )
          ),
          'dropOffs', coalesce((
            select jsonb_agg(jsonb_build_object('lessonId', d.lesson_id, 'title', d.title, 'learners', d.n) order by d.n desc, d.title)
            from (
              select stuck.lesson_id, l.title, count(*) as n
              from (
                select e.user_id, (
                  select l2.id from public.lessons l2
                  join public.modules m2 on m2.id = l2.module_id
                  where l2.course_id = c.id
                    and not exists (select 1 from public.lesson_progress lp
                                    where lp.lesson_id = l2.id and lp.user_id = e.user_id and lp.completed_at is not null)
                  order by m2.position, l2.position limit 1
                ) as lesson_id
                from public.enrollments e
                where e.course_id = c.id and e.revoked_at is null
                  and exists (select 1 from public.lesson_progress lp where lp.user_id = e.user_id and lp.course_id = c.id)
                  and (select max(lp.last_seen_at) from public.lesson_progress lp
                       where lp.user_id = e.user_id and lp.course_id = c.id) < now() - make_interval(days => p_inactive_days)
              ) stuck
              join public.lessons l on l.id = stuck.lesson_id
              group by stuck.lesson_id, l.title
            ) d
          ), '[]'::jsonb)
        ) as stats
        from public.courses c
      ) s
    ), '[]'::jsonb)
  );
end;
$$;

revoke all on function public.assert_admin() from public;
revoke all on function public.admin_quiz_questions(uuid) from public;
revoke all on function public.admin_move(text, uuid, integer) from public;
revoke all on function public.admin_students(text, integer, integer) from public;
revoke all on function public.admin_dashboard(integer) from public;
grant execute on function public.assert_admin(), public.admin_quiz_questions(uuid),
  public.admin_move(text, uuid, integer), public.admin_students(text, integer, integer),
  public.admin_dashboard(integer) to authenticated;
