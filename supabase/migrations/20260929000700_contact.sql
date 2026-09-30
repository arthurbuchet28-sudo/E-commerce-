-- Contact form messages. Written by the server (service role) after validation and rate
-- limiting; read by admins in the back-office; purged by the daily job.

create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 120),
  email text not null check (char_length(email) <= 320),
  topic text not null check (topic in ('question', 'erreur', 'formation', 'donnees', 'accessibilite', 'autre')),
  message text not null check (char_length(message) between 10 and 5000),
  created_at timestamptz not null default now(),
  handled_at timestamptz
);

create index contact_messages_created_idx on public.contact_messages (created_at desc);

alter table public.contact_messages enable row level security;

create policy "contact_messages: admin read" on public.contact_messages
  for select to authenticated using (public.is_admin());
create policy "contact_messages: admin update" on public.contact_messages
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

grant select, update (handled_at) on public.contact_messages to authenticated;
grant all on public.contact_messages to service_role;

create function public.purge_contact_messages(p_months integer)
returns integer
language plpgsql
set search_path = ''
as $$
declare
  v_count integer;
begin
  delete from public.contact_messages where created_at < now() - make_interval(months => p_months);
  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

revoke all on function public.purge_contact_messages(integer) from public;
grant execute on function public.purge_contact_messages(integer) to service_role;
