-- RLS and function tests for orders, invoices and withdrawals (run with `supabase test db`).
-- Relies on seed.sql (F1 = paid course 00000000-0000-4000-8000-000000000f10, 4900 cents).
begin;
create extension if not exists pgtap with schema extensions;
select plan(40);

insert into auth.users (id, email, raw_user_meta_data) values
  ('44444444-4444-4444-4444-444444444444', 'd@example.test', '{"display_name":"Nadia"}'),
  ('55555555-5555-5555-5555-555555555555', 'e@example.test', '{}');

create temporary table t (key text primary key, value jsonb);
grant all on t to authenticated;

set local role anon;
select throws_ok($$ select * from public.orders $$, '42501', null, 'anon cannot read orders');
select throws_ok($$ select public.withdrawal_lookup('PV-AAAAAAAA', 'd@example.test', 14) $$, '42501', null, 'anon cannot call the withdrawal lookup directly');
reset role;

-- Buyer D: immediate access with the express waiver.
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"44444444-4444-4444-4444-444444444444","role":"authenticated"}', true);
select throws_ok($$ select public.create_order('les-bases-du-e-commerce', true, 'cgv-1', 'waiver-1') $$, 'P0001', 'not_for_sale', 'free courses cannot be bought');
select throws_ok($$ select public.create_order('trouver-et-valider-son-produit', true, 'cgv-1', '') $$, 'P0001', 'missing_consent', 'immediate access requires the waiver text version');
insert into t values ('d', public.create_order('trouver-et-valider-son-produit', true, 'cgv-1', 'waiver-1'));
select matches((select value ->> 'reference' from t where key = 'd'), '^PV-[A-HJ-NP-Z2-9]{8}$', 'order reference is generated');
select is((select (value ->> 'amountCents')::int from t where key = 'd'), 4900, 'price comes from the database');
select is((select count(*) from public.consent_log)::int, 2, 'CGV and waiver consents are logged');
select ok((select waiver_at is not null from public.orders), 'waiver is timestamped');
select throws_ok($$ insert into public.orders (email, amount_cents, cgv_version, cgv_accepted_at, immediate_access) values ('x@x.test', 1, 'v', now(), false) $$, '42501', null, 'cannot insert an order directly');
select throws_ok($$ update public.orders set status = 'paid' $$, '42501', null, 'cannot mark an order as paid');
select throws_ok($$ select public.fulfill_order('evt_x', 'cs_x', 'pi_x', 4900, 'eur', 14, '{}') $$, '42501', null, 'cannot fulfill an order');
select throws_ok($$ select * from public.stripe_events $$, '42501', null, 'stripe events are private');
select ok(not public.has_access('00000000-0000-4000-8000-000000000f10'), 'no access before payment');
reset role;

-- Buyer E: no waiver, access deferred to the end of the withdrawal period.
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"55555555-5555-5555-5555-555555555555","role":"authenticated"}', true);
insert into t values ('e', public.create_order('trouver-et-valider-son-produit', false, 'cgv-1', null));
select is((select count(*) from public.orders)::int, 1, 'a member only sees their own orders');
reset role;

-- Webhook (service role).
update public.orders set stripe_session_id = 'cs_test_d' where id = (select (value ->> 'orderId')::uuid from t where key = 'd');
update public.orders set stripe_session_id = 'cs_test_e' where id = (select (value ->> 'orderId')::uuid from t where key = 'e');
select is(public.fulfill_order('evt_1', 'cs_test_d', 'pi_d', 100, 'eur', 14, '{"legalName":"X"}') ->> 'status', 'amount_mismatch', 'a wrong amount is refused');
select is(public.fulfill_order('evt_2', 'cs_test_d', 'pi_d', 4900, 'eur', 14, '{"legalName":"X"}') ->> 'status', 'fulfilled', 'paid order is fulfilled');
select is(public.fulfill_order('evt_2', 'cs_test_d', 'pi_d', 4900, 'eur', 14, '{"legalName":"X"}') ->> 'status', 'duplicate', 'a replayed event is ignored');
select is(public.fulfill_order('evt_3', 'cs_unknown', 'pi_z', 4900, 'eur', 14, '{}') ->> 'status', 'unknown_order', 'unknown session is ignored');
select matches((select number from public.invoices i join public.orders o on o.id = i.order_id where o.stripe_session_id = 'cs_test_d'), '^F[0-9]{4}-[0-9]{5}$', 'invoice numbered');
select is((select data -> 'seller' ->> 'legalName' from public.invoices i join public.orders o on o.id = i.order_id where o.stripe_session_id = 'cs_test_d'), 'X', 'invoice snapshot stores the seller');
select is(public.fulfill_order('evt_4', 'cs_test_e', 'pi_e', 4900, 'eur', 14, '{}') ->> 'status', 'fulfilled', 'deferred order is fulfilled');

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"44444444-4444-4444-4444-444444444444","role":"authenticated"}', true);
select ok(public.has_access('00000000-0000-4000-8000-000000000f10'), 'immediate access after payment');
select is((select count(*) from public.invoices)::int, 1, 'buyer reads their invoice');
select set_config('request.jwt.claims', '{"sub":"55555555-5555-5555-5555-555555555555","role":"authenticated"}', true);
select ok(not public.has_access('00000000-0000-4000-8000-000000000f10'), 'without waiver, access opens after the withdrawal period');
select throws_ok($$ select public.create_order('trouver-et-valider-son-produit', false, 'cgv-1', null) $$, 'P0001', 'already_owned', 'cannot buy a course twice');
reset role;

-- Withdrawal function.
select is(public.withdrawal_eligibility((select (value ->> 'orderId')::uuid from t where key = 'd'), 14), 'eligible', 'waiver alone does not remove the right before the course is started');
insert into public.lesson_progress (user_id, lesson_id, course_id)
values ('44444444-4444-4444-4444-444444444444', '00000000-0000-4000-8000-000000000b01', '00000000-0000-4000-8000-000000000f10');
select is(public.withdrawal_eligibility((select (value ->> 'orderId')::uuid from t where key = 'd'), 14), 'waived', 'started course with waiver: no withdrawal');
select is(public.withdrawal_lookup((select value ->> 'reference' from t where key = 'e'), 'wrong@example.test', 14), null, 'lookup needs the matching e-mail');
select is(public.withdrawal_lookup(lower((select value ->> 'reference' from t where key = 'e')), ' E@example.test ', 14) ->> 'eligibility', 'eligible', 'lookup is case-insensitive');
select is(public.request_withdrawal((select value ->> 'reference' from t where key = 'e'), 'e@example.test', 'Élise', 14, '{}') ->> 'status', 'withdrawn', 'withdrawal recorded');
select ok((select revoked_at is not null from public.enrollments where user_id = '55555555-5555-5555-5555-555555555555' and course_id = '00000000-0000-4000-8000-000000000f10'), 'access closed after withdrawal');
select matches((select number from public.invoices i join public.orders o on o.id = i.order_id where o.stripe_session_id = 'cs_test_e' and kind = 'credit_note'), '^AV[0-9]{4}-[0-9]{5}$', 'credit note issued');
select is(public.request_withdrawal((select value ->> 'reference' from t where key = 'e'), 'e@example.test', 'Élise', 14, '{}') ->> 'status', 'already_withdrawn', 'cannot withdraw twice');

update public.orders set paid_at = now() - interval '15 days' where stripe_session_id = 'cs_test_d';
select is(public.withdrawal_eligibility((select (value ->> 'orderId')::uuid from t where key = 'd'), 14), 'period_over', 'no withdrawal after the period');

-- Refund from the Stripe dashboard closes access.
select is(public.record_refund('evt_5', 'pi_d', 4900, 're_1', '{}') ->> 'status', 'refunded', 'full refund recorded');
select ok((select revoked_at is not null from public.enrollments where user_id = '44444444-4444-4444-4444-444444444444' and course_id = '00000000-0000-4000-8000-000000000f10'), 'access closed after refund');

-- Rate limiting and expired sessions.
select ok(public.rate_limit('test-key', 2, 60), 'first hit allowed');
select ok(public.rate_limit('test-key', 2, 60), 'second hit allowed');
select ok(not public.rate_limit('test-key', 2, 60), 'third hit refused');
update public.orders set stripe_session_id = 'cs_test_x', status = 'pending' where stripe_session_id = 'cs_test_e';
select is(public.expire_order('evt_6', 'cs_test_x') ->> 'status', 'expired', 'expired session closes the pending order');

select * from finish();
rollback;
