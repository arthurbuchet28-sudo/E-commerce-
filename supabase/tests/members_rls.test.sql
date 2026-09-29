-- RLS tests for the member area (run with `supabase test db`).
begin;
create extension if not exists pgtap with schema extensions;
select plan(16);

-- Two members
insert into auth.users (id, email, raw_user_meta_data)
values
  ('11111111-1111-1111-1111-111111111111', 'a@example.test', '{"display_name":"Alice","cgu_version":"v1","cgu_accepted_at":"2026-09-29T10:00:00Z"}'),
  ('22222222-2222-2222-2222-222222222222', 'b@example.test', '{}');

select is((select display_name from public.profiles where id = '11111111-1111-1111-1111-111111111111'), 'Alice', 'profile created by trigger');
select is((select cgu_version from public.profiles where id = '11111111-1111-1111-1111-111111111111'), 'v1', 'CGU acceptance recorded');

insert into public.saved_simulations (user_id, tool, title, inputs)
values ('22222222-2222-2222-2222-222222222222', 'seuil-de-rentabilite', 'B', '{}');
insert into public.user_progress (user_id, key, data, client_updated_at)
values ('22222222-2222-2222-2222-222222222222', 'parcours', '{}', now());

-- As Alice
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}', true);

select is((select count(*) from public.profiles)::int, 1, 'sees only her own profile');
select is((select count(*) from public.saved_simulations)::int, 0, 'cannot read others simulations');
select is((select count(*) from public.user_progress)::int, 0, 'cannot read others progress');

select lives_ok($$ update public.profiles set display_name = 'Alice B' where id = '11111111-1111-1111-1111-111111111111' $$, 'can rename herself');
select throws_ok($$ update public.profiles set role = 'admin' where id = '11111111-1111-1111-1111-111111111111' $$, '42501', null, 'cannot change her role');
update public.profiles set display_name = 'Hacked' where id = '22222222-2222-2222-2222-222222222222';

select lives_ok($$ insert into public.saved_simulations (user_id, tool, title, inputs) values ('11111111-1111-1111-1111-111111111111', 'calculateur-prix-marge', 'Mon prix', '{"price":"39"}') $$, 'can save her simulation');
select throws_ok($$ insert into public.saved_simulations (user_id, tool, title, inputs) values ('22222222-2222-2222-2222-222222222222', 'calculateur-prix-marge', 'x', '{}') $$, '42501', null, 'cannot save for someone else');
select throws_ok($$ insert into public.saved_simulations (user_id, tool, title, inputs) values ('11111111-1111-1111-1111-111111111111', 'outil-inconnu', 'x', '{}') $$, '23514', null, 'unknown tool rejected');

select lives_ok($$ insert into public.user_progress (user_id, key, data, client_updated_at) values ('11111111-1111-1111-1111-111111111111', 'parcours', '{"a":[true]}', now()) $$, 'can save her progress');
select throws_ok($$ insert into public.user_progress (user_id, key, data, client_updated_at) values ('11111111-1111-1111-1111-111111111111', 'autre', '{}', now()) $$, '23514', null, 'unknown progress key rejected');

delete from public.saved_simulations where user_id = '22222222-2222-2222-2222-222222222222';
select is(public.is_admin(), false, 'a member is not admin');

-- As anonymous
reset role;
set local role anon;
select throws_ok($$ select count(*) from public.profiles $$, '42501', null, 'anonymous has no access to profiles');

-- Back as owner: others untouched, cascade on account deletion
reset role;
select is((select display_name from public.profiles where id = '22222222-2222-2222-2222-222222222222'), null, 'other profile not modified');
delete from auth.users where id = '11111111-1111-1111-1111-111111111111';
select is((select count(*) from public.saved_simulations where user_id = '11111111-1111-1111-1111-111111111111')::int, 0, 'data deleted with the account');

select * from finish();
rollback;
