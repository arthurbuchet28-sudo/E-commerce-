-- Phase 10 — newsletter: double opt-in, welcome sequence, one-click unsubscribe, purge.
-- Principles:
-- - Subscribers are not members: the table is reachable only through the service role
--   (server actions and route handlers), never by anon/authenticated clients.
-- - Confirmation tokens are single-use, expire, and are stored hashed (SHA-256).
-- - The access token (unsubscribe + resource links) is random and only used in e-mails.
-- - Proof of consent: consent_log row (kind 'newsletter', text version) at confirmation.

create table public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique check (email = lower(email) and char_length(email) <= 320),
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'unsubscribed')),
  source text not null default 'site' check (source ~ '^[a-z0-9-]{1,40}$'),
  consent_text_version text not null,
  requested_at timestamptz not null default now(),
  confirm_token_hash text unique,
  confirm_expires_at timestamptz,
  confirmed_at timestamptz,
  unsubscribed_at timestamptz,
  access_token text not null unique default encode(extensions.gen_random_bytes(24), 'hex'),
  -- Welcome sequence: last e-mail sent (0 = none) and when the next one is due.
  sequence_step integer not null default 0 check (sequence_step >= 0),
  next_email_at timestamptz
);

create index newsletter_due_idx on public.newsletter_subscribers (next_email_at)
  where status = 'confirmed' and next_email_at is not null;

alter table public.consent_log
  add column subscriber_id uuid references public.newsletter_subscribers (id) on delete set null;

-- ---------------------------------------------------------------------------
-- Functions (service role only)
-- ---------------------------------------------------------------------------

-- Subscription request: (re)starts the double opt-in unless already confirmed.
create function public.newsletter_request(
  p_email text,
  p_source text,
  p_consent_version text,
  p_token_hash text,
  p_ttl_hours integer
)
returns jsonb
language plpgsql
set search_path = ''
as $$
declare
  v_row public.newsletter_subscribers;
begin
  select * into v_row from public.newsletter_subscribers where email = lower(trim(p_email)) for update;
  if v_row.status = 'confirmed' then
    return jsonb_build_object('action', 'already_confirmed');
  end if;
  insert into public.newsletter_subscribers (email, source, consent_text_version, confirm_token_hash, confirm_expires_at)
  values (lower(trim(p_email)), p_source, p_consent_version, p_token_hash, now() + make_interval(hours => p_ttl_hours))
  on conflict (email) do update set
    status = 'pending',
    source = excluded.source,
    consent_text_version = excluded.consent_text_version,
    requested_at = now(),
    confirm_token_hash = excluded.confirm_token_hash,
    confirm_expires_at = excluded.confirm_expires_at,
    unsubscribed_at = null;
  return jsonb_build_object('action', 'send_confirmation');
end;
$$;

-- Read-only check used by the confirmation page (link scanners must not confirm).
create function public.newsletter_token_status(p_token_hash text)
returns text
language sql
stable
set search_path = ''
as $$
  select coalesce(
    (select case when confirm_expires_at < now() then 'expired' else 'valid' end
     from public.newsletter_subscribers
     where confirm_token_hash = p_token_hash and status = 'pending'),
    'invalid'
  );
$$;

-- Confirmation (explicit click): consent logged, welcome sequence starts now.
create function public.newsletter_confirm(p_token_hash text)
returns jsonb
language plpgsql
set search_path = ''
as $$
declare
  v_row public.newsletter_subscribers;
begin
  select * into v_row from public.newsletter_subscribers
    where confirm_token_hash = p_token_hash and status = 'pending' for update;
  if v_row.id is null then
    return jsonb_build_object('status', 'invalid');
  end if;
  if v_row.confirm_expires_at < now() then
    return jsonb_build_object('status', 'expired');
  end if;
  update public.newsletter_subscribers set
    status = 'confirmed', confirmed_at = now(), confirm_token_hash = null, confirm_expires_at = null,
    sequence_step = 0, next_email_at = now()
  where id = v_row.id;
  insert into public.consent_log (subscriber_id, kind, text_version)
  values (v_row.id, 'newsletter', v_row.consent_text_version);
  return jsonb_build_object('status', 'confirmed', 'id', v_row.id, 'email', v_row.email, 'accessToken', v_row.access_token);
end;
$$;

-- One-click unsubscribe (idempotent). Returns the e-mail, or null for an unknown token.
create function public.newsletter_unsubscribe(p_access_token text)
returns text
language plpgsql
set search_path = ''
as $$
declare
  v_email text;
begin
  update public.newsletter_subscribers set
    status = 'unsubscribed',
    unsubscribed_at = coalesce(unsubscribed_at, now()),
    next_email_at = null,
    confirm_token_hash = null
  where access_token = p_access_token
  returning email into v_email;
  return v_email;
end;
$$;

-- Due welcome e-mails. Each claimed row is leased for an hour, so a crashed run is retried
-- later and two concurrent runs never send the same e-mail.
create function public.newsletter_claim_due(p_max_step integer, p_limit integer)
returns table (id uuid, email text, sequence_step integer, access_token text)
language plpgsql
set search_path = ''
as $$
begin
  return query
  with due as (
    select s.id from public.newsletter_subscribers s
    where s.status = 'confirmed' and s.next_email_at <= now() and s.sequence_step < p_max_step
    order by s.next_email_at
    limit p_limit
    for update skip locked
  )
  update public.newsletter_subscribers s set next_email_at = now() + interval '1 hour'
  from due where s.id = due.id
  returning s.id, s.email, s.sequence_step, s.access_token;
end;
$$;

-- Records a sent e-mail; p_next_at null ends the sequence.
create function public.newsletter_advance(p_id uuid, p_step integer, p_next_at timestamptz)
returns void
language sql
set search_path = ''
as $$
  update public.newsletter_subscribers
    set sequence_step = p_step, next_email_at = p_next_at
  where id = p_id and status = 'confirmed';
$$;

-- Retention: unconfirmed requests and old unsubscriptions are deleted.
create function public.newsletter_purge(p_pending_days integer, p_unsubscribed_days integer)
returns jsonb
language plpgsql
set search_path = ''
as $$
declare
  v_pending integer;
  v_unsubscribed integer;
begin
  delete from public.newsletter_subscribers
    where status = 'pending' and requested_at < now() - make_interval(days => p_pending_days);
  get diagnostics v_pending = row_count;
  delete from public.newsletter_subscribers
    where status = 'unsubscribed' and unsubscribed_at < now() - make_interval(days => p_unsubscribed_days);
  get diagnostics v_unsubscribed = row_count;
  return jsonb_build_object('pending', v_pending, 'unsubscribed', v_unsubscribed);
end;
$$;

-- ---------------------------------------------------------------------------
-- RLS and grants: no policy, service role only.
-- ---------------------------------------------------------------------------
alter table public.newsletter_subscribers enable row level security;
grant all on public.newsletter_subscribers to service_role;

revoke all on function public.newsletter_request(text, text, text, text, integer) from public;
revoke all on function public.newsletter_token_status(text) from public;
revoke all on function public.newsletter_confirm(text) from public;
revoke all on function public.newsletter_unsubscribe(text) from public;
revoke all on function public.newsletter_claim_due(integer, integer) from public;
revoke all on function public.newsletter_advance(uuid, integer, timestamptz) from public;
revoke all on function public.newsletter_purge(integer, integer) from public;
grant execute on function public.newsletter_request(text, text, text, text, integer),
  public.newsletter_token_status(text), public.newsletter_confirm(text),
  public.newsletter_unsubscribe(text), public.newsletter_claim_due(integer, integer),
  public.newsletter_advance(uuid, integer, timestamptz), public.newsletter_purge(integer, integer)
  to service_role;
