-- Phase 12 — proof of choices on trackers (CNIL): one row per decision, no IP address.
-- Only used once a tracker requiring consent exists (none in v1). Service role only.

create table public.cookie_consents (
  id uuid primary key default gen_random_uuid(),
  -- Random identifier stored in the visitor's browser with their choices.
  visitor_id uuid not null,
  version text not null check (char_length(version) <= 40),
  choices jsonb not null,
  created_at timestamptz not null default now()
);

create index cookie_consents_visitor_idx on public.cookie_consents (visitor_id, created_at desc);

alter table public.cookie_consents enable row level security;
grant all on public.cookie_consents to service_role;

-- Retention of proofs, called by the daily job.
create function public.purge_cookie_consents(p_months integer)
returns integer
language plpgsql
set search_path = ''
as $$
declare
  v_count integer;
begin
  delete from public.cookie_consents where created_at < now() - make_interval(months => p_months);
  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

revoke all on function public.purge_cookie_consents(integer) from public;
grant execute on function public.purge_cookie_consents(integer) to service_role;
