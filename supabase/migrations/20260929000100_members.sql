-- Phase 7 — member area: profiles, saved progress, saved simulations.
-- Principles: RLS on every table, explicit GRANTs (auto_expose_new_tables = false),
-- users only ever reach their own rows, roles cannot be self-assigned.

-- ---------------------------------------------------------------------------
-- Profiles (1–1 with auth.users, deleted with the account)
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text check (char_length(display_name) <= 80),
  role text not null default 'member' check (role in ('member', 'admin')),
  -- When the user accepted the CGU, and which version (consent log).
  cgu_accepted_at timestamptz,
  cgu_version text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'Member profile. Role changes only through the service role (back-office).';

alter table public.profiles enable row level security;

create policy "profiles: read own" on public.profiles
  for select to authenticated using (id = (select auth.uid()));

create policy "profiles: update own" on public.profiles
  for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));

grant select on public.profiles to authenticated;
-- Column-level grant: a member can rename themself but never change their role.
grant update (display_name, updated_at) on public.profiles to authenticated;
grant all on public.profiles to service_role;

-- Profile created automatically at sign-up, from the metadata sent by the sign-up form.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name, cgu_accepted_at, cgu_version)
  values (
    new.id,
    nullif(left(new.raw_user_meta_data ->> 'display_name', 80), ''),
    (new.raw_user_meta_data ->> 'cgu_accepted_at')::timestamptz,
    new.raw_user_meta_data ->> 'cgu_version'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();

-- Helper for later policies (back-office). Security definer so it can read roles
-- without being blocked by RLS; returns false for anonymous callers.
create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles where id = (select auth.uid()) and role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Saved progress (path « Se lancer », launch checklist), last write wins
-- ---------------------------------------------------------------------------
create table public.user_progress (
  user_id uuid not null references public.profiles (id) on delete cascade,
  key text not null check (key in ('parcours', 'checklist-lancement')),
  data jsonb not null,
  -- Client-side timestamp of the change, used for last-write-wins between devices.
  client_updated_at timestamptz not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, key),
  check (pg_column_size(data) <= 16384)
);

alter table public.user_progress enable row level security;

create policy "user_progress: read own" on public.user_progress
  for select to authenticated using (user_id = (select auth.uid()));
create policy "user_progress: insert own" on public.user_progress
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy "user_progress: update own" on public.user_progress
  for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "user_progress: delete own" on public.user_progress
  for delete to authenticated using (user_id = (select auth.uid()));

grant select, insert, update, delete on public.user_progress to authenticated;
grant all on public.user_progress to service_role;

create trigger user_progress_touch before update on public.user_progress
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- Saved simulations of the tools
-- ---------------------------------------------------------------------------
create table public.saved_simulations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  tool text not null check (tool in ('calculateur-prix-marge', 'simulateur-micro-entreprise', 'seuil-de-rentabilite')),
  title text not null check (char_length(title) between 1 and 80),
  inputs jsonb not null check (pg_column_size(inputs) <= 4096),
  created_at timestamptz not null default now()
);

create index saved_simulations_user_idx on public.saved_simulations (user_id, created_at desc);

alter table public.saved_simulations enable row level security;

create policy "saved_simulations: read own" on public.saved_simulations
  for select to authenticated using (user_id = (select auth.uid()));
create policy "saved_simulations: insert own" on public.saved_simulations
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy "saved_simulations: delete own" on public.saved_simulations
  for delete to authenticated using (user_id = (select auth.uid()));

grant select, insert, delete on public.saved_simulations to authenticated;
grant all on public.saved_simulations to service_role;

-- At most 50 simulations per member (data minimisation, abuse prevention).
create function public.limit_saved_simulations()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select count(*) from public.saved_simulations where user_id = new.user_id) >= 50 then
    raise exception 'simulation_limit_reached' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

create trigger saved_simulations_limit before insert on public.saved_simulations
  for each row execute function public.limit_saved_simulations();
