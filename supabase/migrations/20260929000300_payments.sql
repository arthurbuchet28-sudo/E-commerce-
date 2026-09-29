-- Phase 9 — payments: orders, Stripe events, invoices, online withdrawal, consent log.
-- Principles:
-- - Access to a paid course is granted ONLY by fulfill_order(), called by the signed Stripe
--   webhook (service role). The success page never grants anything.
-- - Every Stripe event is recorded once (stripe_events): webhooks are idempotent.
-- - Invoices are numbered without gaps (counter row locked per year and kind) and store a
--   snapshot of the seller, buyer and lines, so they never change afterwards.
-- - Orders and invoices survive account deletion (user_id set null): accounting records must
--   be kept. Figures (withdrawal period) are passed by the app from src/data/reference.ts.

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------
create function public.order_reference()
returns text
language plpgsql
volatile
set search_path = ''
as $$
declare
  -- No 0/O/1/I/L: the reference is typed by hand in the withdrawal form.
  v_alphabet constant text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  v_bytes bytea := extensions.gen_random_bytes(8);
  v_ref text := 'PV-';
begin
  for i in 0..7 loop
    v_ref := v_ref || substr(v_alphabet, (get_byte(v_bytes, i) % 31) + 1, 1);
  end loop;
  return v_ref;
end;
$$;

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique default public.order_reference(),
  user_id uuid references public.profiles (id) on delete set null,
  email text not null check (char_length(email) <= 320),
  customer_name text check (char_length(customer_name) <= 120),
  status text not null default 'pending'
    check (status in ('pending', 'paid', 'expired', 'withdrawn', 'refunded')),
  amount_cents integer not null check (amount_cents > 0),
  currency text not null default 'eur' check (currency = 'eur'),
  cgv_version text not null,
  cgv_accepted_at timestamptz not null,
  -- Express consent to immediate access + express waiver of the withdrawal right.
  immediate_access boolean not null,
  waiver_at timestamptz,
  waiver_text_version text,
  stripe_session_id text unique,
  stripe_payment_intent text,
  created_at timestamptz not null default now(),
  paid_at timestamptz,
  constraint orders_waiver_consistent check (
    (immediate_access and waiver_at is not null and waiver_text_version is not null)
    or (not immediate_access and waiver_at is null and waiver_text_version is null)
  )
);

create index orders_user_idx on public.orders (user_id, created_at desc);
create index orders_payment_intent_idx on public.orders (stripe_payment_intent);

create table public.order_items (
  order_id uuid not null references public.orders (id) on delete cascade,
  course_id uuid not null references public.courses (id) on delete restrict,
  title text not null,
  unit_price_cents integer not null check (unit_price_cents > 0),
  primary key (order_id, course_id)
);

alter table public.enrollments
  add column starts_at timestamptz not null default now(),
  add column revoked_at timestamptz,
  add constraint enrollments_order_fk foreign key (order_id) references public.orders (id) on delete set null;

comment on column public.enrollments.starts_at is
  'Without the express waiver, a purchased course opens at the end of the withdrawal period.';

create table public.stripe_events (
  id text primary key,
  type text not null,
  received_at timestamptz not null default now()
);

create table public.invoice_counters (
  year integer not null,
  kind text not null check (kind in ('invoice', 'credit_note')),
  last_number integer not null default 0,
  primary key (year, kind)
);

create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  number text not null unique,
  kind text not null check (kind in ('invoice', 'credit_note')),
  order_id uuid not null references public.orders (id) on delete restrict,
  issued_at timestamptz not null default now(),
  -- Frozen snapshot: seller, buyer, lines, totals, legal mentions.
  data jsonb not null,
  unique (order_id, kind)
);

create table public.withdrawals (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references public.orders (id) on delete restrict,
  consumer_name text not null check (char_length(consumer_name) between 1 and 120),
  email text not null,
  requested_at timestamptz not null default now(),
  ack_sent_at timestamptz,
  refund_status text not null default 'pending' check (refund_status in ('pending', 'succeeded', 'failed')),
  stripe_refund_id text,
  refunded_at timestamptz
);

create table public.consent_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete set null,
  order_id uuid references public.orders (id) on delete set null,
  kind text not null check (kind in ('cgu', 'cgv', 'waiver', 'newsletter')),
  text_version text not null,
  created_at timestamptz not null default now()
);

create index consent_log_user_idx on public.consent_log (user_id);

-- Fixed-window rate limiting for public forms (withdrawal lookup), keyed by a hash.
create table public.rate_limits (
  key text not null,
  window_start timestamptz not null,
  hits integer not null default 1,
  primary key (key, window_start)
);

-- ---------------------------------------------------------------------------
-- Access: purchases may start later (no waiver) and are revoked on withdrawal/refund.
-- ---------------------------------------------------------------------------
create or replace function public.has_access(p_course_id uuid)
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
      and e.starts_at <= now()
      and e.revoked_at is null
      and (e.expires_at is null or e.expires_at > now())
  );
$$;

-- ---------------------------------------------------------------------------
-- Checkout (member): creates a pending order at the price stored in the database.
-- ---------------------------------------------------------------------------
create function public.create_order(
  p_course_slug text,
  p_immediate_access boolean,
  p_cgv_version text,
  p_waiver_text_version text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := (select auth.uid());
  v_email text;
  v_name text;
  v_course public.courses;
  v_order public.orders;
  v_now timestamptz := now();
begin
  if v_user is null then
    raise exception 'not_authenticated' using errcode = '28000';
  end if;
  select * into v_course from public.courses
    where slug = p_course_slug and status = 'published' and not is_free and price_cents > 0;
  if v_course.id is null then
    raise exception 'not_for_sale' using errcode = 'P0001';
  end if;
  if exists (
    select 1 from public.enrollments e
    where e.user_id = v_user and e.course_id = v_course.id and e.revoked_at is null
      and (e.expires_at is null or e.expires_at > v_now)
  ) then
    raise exception 'already_owned' using errcode = 'P0001';
  end if;
  if coalesce(p_cgv_version, '') = '' or (p_immediate_access and coalesce(p_waiver_text_version, '') = '') then
    raise exception 'missing_consent' using errcode = 'P0001';
  end if;

  select u.email into v_email from auth.users u where u.id = v_user;
  select p.display_name into v_name from public.profiles p where p.id = v_user;

  insert into public.orders (
    user_id, email, customer_name, amount_cents, cgv_version, cgv_accepted_at,
    immediate_access, waiver_at, waiver_text_version
  ) values (
    v_user, v_email, v_name, v_course.price_cents, p_cgv_version, v_now,
    p_immediate_access,
    case when p_immediate_access then v_now end,
    case when p_immediate_access then p_waiver_text_version end
  ) returning * into v_order;

  insert into public.order_items (order_id, course_id, title, unit_price_cents)
  values (v_order.id, v_course.id, v_course.title, v_course.price_cents);

  insert into public.consent_log (user_id, order_id, kind, text_version, created_at)
  values (v_user, v_order.id, 'cgv', p_cgv_version, v_now);
  if p_immediate_access then
    insert into public.consent_log (user_id, order_id, kind, text_version, created_at)
    values (v_user, v_order.id, 'waiver', p_waiver_text_version, v_now);
  end if;

  return jsonb_build_object(
    'orderId', v_order.id,
    'reference', v_order.reference,
    'email', v_order.email,
    'amountCents', v_order.amount_cents,
    'title', v_course.title
  );
end;
$$;

-- ---------------------------------------------------------------------------
-- Service-role helpers (Stripe webhook, withdrawal function)
-- ---------------------------------------------------------------------------

-- Next gap-free number: F2026-00001 (invoice) or AV2026-00001 (credit note).
create function public.next_invoice_number(p_kind text, p_at timestamptz)
returns text
language plpgsql
set search_path = ''
as $$
declare
  v_year integer := extract(year from p_at at time zone 'Europe/Paris');
  v_n integer;
begin
  insert into public.invoice_counters (year, kind, last_number) values (v_year, p_kind, 1)
  on conflict (year, kind) do update set last_number = public.invoice_counters.last_number + 1
  returning last_number into v_n;
  return case p_kind when 'invoice' then 'F' else 'AV' end
    || v_year::text || '-' || lpad(v_n::text, 5, '0');
end;
$$;

-- Issues (once) the invoice or credit note of an order, with a frozen snapshot.
create function public.issue_invoice(p_order_id uuid, p_kind text, p_seller jsonb)
returns uuid
language plpgsql
set search_path = ''
as $$
declare
  v_id uuid;
  v_order public.orders;
  v_now timestamptz := now();
begin
  select id into v_id from public.invoices where order_id = p_order_id and kind = p_kind;
  if v_id is not null then
    return v_id;
  end if;
  select * into v_order from public.orders where id = p_order_id;
  insert into public.invoices (number, kind, order_id, issued_at, data)
  values (
    public.next_invoice_number(p_kind, v_now),
    p_kind,
    p_order_id,
    v_now,
    jsonb_build_object(
      'seller', p_seller,
      'buyer', jsonb_build_object('name', v_order.customer_name, 'email', v_order.email),
      'orderReference', v_order.reference,
      'paidAt', v_order.paid_at,
      'currency', v_order.currency,
      'totalCents', v_order.amount_cents,
      'relatedInvoice', (select number from public.invoices where order_id = p_order_id and kind = 'invoice'),
      'lines', (
        select coalesce(jsonb_agg(jsonb_build_object('title', i.title, 'quantity', 1, 'unitPriceCents', i.unit_price_cents) order by i.title), '[]'::jsonb)
        from public.order_items i where i.order_id = p_order_id
      )
    )
  ) returning id into v_id;
  return v_id;
end;
$$;

-- checkout.session.completed: marks the order paid, opens access, issues the invoice.
-- Returns {status: fulfilled | duplicate | unknown_order | already_processed | amount_mismatch}.
create function public.fulfill_order(
  p_event_id text,
  p_session_id text,
  p_payment_intent text,
  p_amount_cents integer,
  p_currency text,
  p_withdrawal_days integer,
  p_seller jsonb
)
returns jsonb
language plpgsql
set search_path = ''
as $$
declare
  v_order public.orders;
  v_now timestamptz := now();
  v_starts timestamptz;
  v_invoice uuid;
begin
  insert into public.stripe_events (id, type) values (p_event_id, 'checkout.session.completed')
  on conflict do nothing;
  if not found then
    return jsonb_build_object('status', 'duplicate');
  end if;

  select * into v_order from public.orders where stripe_session_id = p_session_id for update;
  if v_order.id is null then
    return jsonb_build_object('status', 'unknown_order');
  end if;
  -- An expired order can still be paid (session completed just before expiring).
  if v_order.status not in ('pending', 'expired') then
    return jsonb_build_object('status', 'already_processed', 'orderId', v_order.id);
  end if;
  if v_order.amount_cents <> p_amount_cents or v_order.currency <> lower(p_currency) then
    return jsonb_build_object('status', 'amount_mismatch', 'orderId', v_order.id);
  end if;

  update public.orders
    set status = 'paid', paid_at = v_now, stripe_payment_intent = p_payment_intent
    where id = v_order.id
    returning * into v_order;

  v_starts := case when v_order.immediate_access then v_now
                   else v_now + make_interval(days => p_withdrawal_days) end;

  if v_order.user_id is not null then
    insert into public.enrollments (user_id, course_id, source, order_id, starts_at, expires_at, revoked_at)
    select v_order.user_id, i.course_id, 'purchase', v_order.id, v_starts,
           v_starts + make_interval(months => c.access_months), null
    from public.order_items i join public.courses c on c.id = i.course_id
    where i.order_id = v_order.id
    on conflict (user_id, course_id) do update
      set source = 'purchase', order_id = excluded.order_id, starts_at = excluded.starts_at,
          expires_at = excluded.expires_at, revoked_at = null;
  end if;

  v_invoice := public.issue_invoice(v_order.id, 'invoice', p_seller);

  return jsonb_build_object(
    'status', 'fulfilled',
    'orderId', v_order.id,
    'reference', v_order.reference,
    'email', v_order.email,
    'customerName', v_order.customer_name,
    'amountCents', v_order.amount_cents,
    'immediateAccess', v_order.immediate_access,
    'waiverAt', v_order.waiver_at,
    'paidAt', v_order.paid_at,
    'accessStartsAt', v_starts,
    'invoiceId', v_invoice,
    'items', (select jsonb_agg(jsonb_build_object('title', i.title, 'slug', c.slug, 'accessMonths', c.access_months))
              from public.order_items i join public.courses c on c.id = i.course_id
              where i.order_id = v_order.id)
  );
end;
$$;

-- checkout.session.expired: the pending order will never be paid.
create function public.expire_order(p_event_id text, p_session_id text)
returns jsonb
language plpgsql
set search_path = ''
as $$
begin
  insert into public.stripe_events (id, type) values (p_event_id, 'checkout.session.expired')
  on conflict do nothing;
  if not found then
    return jsonb_build_object('status', 'duplicate');
  end if;
  update public.orders set status = 'expired'
    where stripe_session_id = p_session_id and status = 'pending';
  return jsonb_build_object('status', case when found then 'expired' else 'ignored' end);
end;
$$;

-- Withdrawal eligibility of a paid order:
-- eligible | not_paid | already_withdrawn | period_over | waived (immediate access requested
-- with express waiver, and the course has been started).
-- [À VÉRIFIER — art. L221-28 13° C. conso] « exécution commencée » = first lesson opened.
create function public.withdrawal_eligibility(p_order_id uuid, p_withdrawal_days integer)
returns text
language sql
stable
set search_path = ''
as $$
  select case
    when o.status in ('withdrawn', 'refunded') then 'already_withdrawn'
    when o.status <> 'paid' then 'not_paid'
    when now() > o.paid_at + make_interval(days => p_withdrawal_days) then 'period_over'
    when o.immediate_access and exists (
      select 1 from public.lesson_progress lp
      join public.order_items i on i.course_id = lp.course_id and i.order_id = o.id
      where lp.user_id = o.user_id and lp.last_seen_at >= o.paid_at
    ) then 'waived'
    else 'eligible'
  end
  from public.orders o where o.id = p_order_id;
$$;

-- Step 1 of the withdrawal function: identifies an order by reference + e-mail (no login).
create function public.withdrawal_lookup(p_reference text, p_email text, p_withdrawal_days integer)
returns jsonb
language plpgsql
stable
set search_path = ''
as $$
declare
  v_order public.orders;
begin
  select * into v_order from public.orders
    where reference = upper(trim(p_reference)) and lower(email) = lower(trim(p_email));
  if v_order.id is null or v_order.status in ('pending', 'expired') then
    return null;
  end if;
  return jsonb_build_object(
    'reference', v_order.reference,
    'paidAt', v_order.paid_at,
    'amountCents', v_order.amount_cents,
    'immediateAccess', v_order.immediate_access,
    'deadline', v_order.paid_at + make_interval(days => p_withdrawal_days),
    'eligibility', public.withdrawal_eligibility(v_order.id, p_withdrawal_days),
    'titles', (select jsonb_agg(i.title order by i.title) from public.order_items i where i.order_id = v_order.id)
  );
end;
$$;

-- Step 2: records the withdrawal, closes access and issues the credit note.
create function public.request_withdrawal(
  p_reference text,
  p_email text,
  p_consumer_name text,
  p_withdrawal_days integer,
  p_seller jsonb
)
returns jsonb
language plpgsql
set search_path = ''
as $$
declare
  v_order public.orders;
  v_eligibility text;
  v_withdrawal public.withdrawals;
begin
  select * into v_order from public.orders
    where reference = upper(trim(p_reference)) and lower(email) = lower(trim(p_email))
    for update;
  if v_order.id is null then
    return jsonb_build_object('status', 'not_found');
  end if;
  v_eligibility := public.withdrawal_eligibility(v_order.id, p_withdrawal_days);
  if v_eligibility <> 'eligible' then
    return jsonb_build_object('status', v_eligibility);
  end if;

  insert into public.withdrawals (order_id, consumer_name, email)
  values (v_order.id, left(trim(p_consumer_name), 120), v_order.email)
  returning * into v_withdrawal;
  update public.orders set status = 'withdrawn' where id = v_order.id;
  update public.enrollments set revoked_at = v_withdrawal.requested_at
    where order_id = v_order.id and revoked_at is null;
  perform public.issue_invoice(v_order.id, 'credit_note', p_seller);

  return jsonb_build_object(
    'status', 'withdrawn',
    'withdrawalId', v_withdrawal.id,
    'reference', v_order.reference,
    'email', v_order.email,
    'requestedAt', v_withdrawal.requested_at,
    'amountCents', v_order.amount_cents,
    'paymentIntent', v_order.stripe_payment_intent,
    'titles', (select jsonb_agg(i.title order by i.title) from public.order_items i where i.order_id = v_order.id)
  );
end;
$$;

-- charge.refunded: a full refund made outside the withdrawal function (Stripe dashboard)
-- closes access and issues the credit note; a refund of a withdrawal is simply confirmed.
create function public.record_refund(
  p_event_id text,
  p_payment_intent text,
  p_amount_refunded integer,
  p_refund_id text,
  p_seller jsonb
)
returns jsonb
language plpgsql
set search_path = ''
as $$
declare
  v_order public.orders;
begin
  insert into public.stripe_events (id, type) values (p_event_id, 'charge.refunded')
  on conflict do nothing;
  if not found then
    return jsonb_build_object('status', 'duplicate');
  end if;
  select * into v_order from public.orders where stripe_payment_intent = p_payment_intent for update;
  if v_order.id is null then
    return jsonb_build_object('status', 'unknown_order');
  end if;
  if p_amount_refunded < v_order.amount_cents then
    -- Partial refunds are handled by hand (back-office, phase 11).
    return jsonb_build_object('status', 'partial', 'orderId', v_order.id);
  end if;
  update public.withdrawals
    set refund_status = 'succeeded', refunded_at = coalesce(refunded_at, now()),
        stripe_refund_id = coalesce(stripe_refund_id, p_refund_id)
    where order_id = v_order.id;
  if v_order.status = 'paid' then
    update public.orders set status = 'refunded' where id = v_order.id;
    update public.enrollments set revoked_at = now() where order_id = v_order.id and revoked_at is null;
    perform public.issue_invoice(v_order.id, 'credit_note', p_seller);
  end if;
  return jsonb_build_object('status', 'refunded', 'orderId', v_order.id);
end;
$$;

-- Returns true when the call is allowed (at most p_max hits per window).
create function public.rate_limit(p_key text, p_max integer, p_window_seconds integer)
returns boolean
language plpgsql
set search_path = ''
as $$
declare
  v_window timestamptz := to_timestamp(floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds);
  v_hits integer;
begin
  -- Old windows are useless: purge them as we go (keeps the table tiny, no cron needed).
  delete from public.rate_limits where window_start < now() - interval '1 day';
  insert into public.rate_limits (key, window_start) values (p_key, v_window)
  on conflict (key, window_start) do update set hits = public.rate_limits.hits + 1
  returning hits into v_hits;
  return v_hits <= p_max;
end;
$$;

-- ---------------------------------------------------------------------------
-- RLS and grants
-- ---------------------------------------------------------------------------
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.stripe_events enable row level security;
alter table public.invoice_counters enable row level security;
alter table public.invoices enable row level security;
alter table public.withdrawals enable row level security;
alter table public.consent_log enable row level security;
alter table public.rate_limits enable row level security;

create policy "orders: read own" on public.orders
  for select to authenticated using (user_id = (select auth.uid()));
create policy "order_items: read own" on public.order_items
  for select to authenticated using (exists (select 1 from public.orders o where o.id = order_id and o.user_id = (select auth.uid())));
create policy "invoices: read own" on public.invoices
  for select to authenticated using (exists (select 1 from public.orders o where o.id = order_id and o.user_id = (select auth.uid())));
create policy "withdrawals: read own" on public.withdrawals
  for select to authenticated using (exists (select 1 from public.orders o where o.id = order_id and o.user_id = (select auth.uid())));
create policy "consent_log: read own" on public.consent_log
  for select to authenticated using (user_id = (select auth.uid()));
-- stripe_events, invoice_counters, rate_limits: no policy, service role only.

grant select on public.orders, public.order_items, public.invoices, public.withdrawals, public.consent_log to authenticated;
grant all on public.orders, public.order_items, public.stripe_events, public.invoice_counters, public.invoices,
  public.withdrawals, public.consent_log, public.rate_limits to service_role;

revoke all on function public.order_reference() from public;
revoke all on function public.create_order(text, boolean, text, text) from public;
revoke all on function public.next_invoice_number(text, timestamptz) from public;
revoke all on function public.issue_invoice(uuid, text, jsonb) from public;
revoke all on function public.fulfill_order(text, text, text, integer, text, integer, jsonb) from public;
revoke all on function public.expire_order(text, text) from public;
revoke all on function public.withdrawal_eligibility(uuid, integer) from public;
revoke all on function public.withdrawal_lookup(text, text, integer) from public;
revoke all on function public.request_withdrawal(text, text, text, integer, jsonb) from public;
revoke all on function public.record_refund(text, text, integer, text, jsonb) from public;
revoke all on function public.rate_limit(text, integer, integer) from public;

grant execute on function public.create_order(text, boolean, text, text) to authenticated;
grant execute on function public.order_reference(), public.next_invoice_number(text, timestamptz),
  public.issue_invoice(uuid, text, jsonb),
  public.fulfill_order(text, text, text, integer, text, integer, jsonb), public.expire_order(text, text),
  public.withdrawal_eligibility(uuid, integer), public.withdrawal_lookup(text, text, integer),
  public.request_withdrawal(text, text, text, integer, jsonb),
  public.record_refund(text, text, integer, text, jsonb), public.rate_limit(text, integer, integer)
  to service_role;
