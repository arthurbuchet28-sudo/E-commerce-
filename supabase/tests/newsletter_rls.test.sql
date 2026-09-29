-- Newsletter: access control and double opt-in functions (run with `supabase test db`).
begin;
create extension if not exists pgtap with schema extensions;
select plan(21);

set local role anon;
select throws_ok($$ select * from public.newsletter_subscribers $$, '42501', null, 'anon cannot read subscribers');
select throws_ok($$ select public.newsletter_request('a@b.test', 'site', 'v1', 'h', 1) $$, '42501', null, 'anon cannot call functions directly');
reset role;
set local role authenticated;
select throws_ok($$ select * from public.newsletter_subscribers $$, '42501', null, 'members cannot read subscribers');
reset role;

-- Double opt-in.
select is(public.newsletter_request(' Lea@Example.test ', 'accueil', 'v1', 'hash-1', 168) ->> 'action', 'send_confirmation', 'request creates a pending subscriber');
select is((select email from public.newsletter_subscribers where confirm_token_hash = 'hash-1'), 'lea@example.test', 'e-mail stored in lower case');
select is(public.newsletter_token_status('hash-1'), 'valid', 'token is valid');
select is(public.newsletter_token_status('nope'), 'invalid', 'unknown token is invalid');
select is((select count(*) from public.consent_log c join public.newsletter_subscribers s on s.id = c.subscriber_id where s.email = 'lea@example.test')::int, 0, 'no consent before confirmation');
select is(public.newsletter_confirm('hash-1') ->> 'status', 'confirmed', 'confirmation succeeds');
select is((select count(*) from public.consent_log c join public.newsletter_subscribers s on s.id = c.subscriber_id where s.email = 'lea@example.test' and c.kind = 'newsletter' and c.text_version = 'v1')::int, 1, 'consent logged with its version');
select is(public.newsletter_confirm('hash-1') ->> 'status', 'invalid', 'token is single-use');
select is(public.newsletter_request('lea@example.test', 'site', 'v1', 'hash-2', 168) ->> 'action', 'already_confirmed', 'no new confirmation for a confirmed address');

-- Expiry.
select public.newsletter_request('old@example.test', 'site', 'v1', 'hash-3', 168);
update public.newsletter_subscribers set confirm_expires_at = now() - interval '1 minute' where email = 'old@example.test';
select is(public.newsletter_confirm('hash-3') ->> 'status', 'expired', 'expired token refused');

-- Sequence claim and advance.
select is((select count(*) from public.newsletter_claim_due(5, 10000) where email = 'lea@example.test')::int, 1, 'confirmed subscriber is due');
select is((select count(*) from public.newsletter_claim_due(5, 10000) where email = 'lea@example.test')::int, 0, 'claimed rows are leased');
select public.newsletter_advance((select id from public.newsletter_subscribers where email = 'lea@example.test'), 5, null);
update public.newsletter_subscribers set next_email_at = now() - interval '1 day' where email = 'lea@example.test';
select is((select count(*) from public.newsletter_claim_due(5, 10000) where email = 'lea@example.test')::int, 0, 'finished sequence is not claimed');

-- Unsubscribe.
select is(public.newsletter_unsubscribe((select access_token from public.newsletter_subscribers where email = 'lea@example.test')), 'lea@example.test', 'one-click unsubscribe');
select is((select status from public.newsletter_subscribers where email = 'lea@example.test'), 'unsubscribed', 'status is unsubscribed');
select is(public.newsletter_unsubscribe('unknown'), null, 'unknown token does nothing');

-- Purge.
update public.newsletter_subscribers set requested_at = now() - interval '31 days' where email = 'old@example.test';
select ok((public.newsletter_purge(30, 1095) ->> 'pending')::int >= 1, 'old pending requests purged');
select is((select count(*) from public.newsletter_subscribers where email = 'old@example.test')::int, 0, 'purged row is gone');

select * from finish();
rollback;
