-- Back-office: admin rights and refusals for members (run with `supabase test db`).
begin;
create extension if not exists pgtap with schema extensions;
select plan(21);

insert into auth.users (id, email, raw_user_meta_data) values
  ('66666666-6666-6666-6666-666666666666', 'admin@example.test', '{"display_name":"Admin"}'),
  ('77777777-7777-7777-7777-777777777777', 'membre@example.test', '{"display_name":"Membre"}');
update public.profiles set role = 'admin' where id = '66666666-6666-6666-6666-666666666666';
insert into public.newsletter_subscribers (email, consent_text_version) values ('abonne@example.test', 'v1');
insert into public.contact_messages (name, email, topic, message) values ('Léa', 'lea@example.test', 'question', 'Bonjour, une question.');

-- A member cannot use any admin capability.
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"77777777-7777-7777-7777-777777777777","role":"authenticated"}', true);
select throws_ok($$ insert into public.courses (slug, code, title, summary, audience, level) values ('pirate', 'X', 'X', 'X', 'X', 'debutant') $$, '42501', null, 'member cannot create a course');
select is((select count(*) from public.courses where status = 'draft')::int, 0, 'member does not see drafts');
update public.courses set title = 'Piraté';
select is((select count(*) from public.courses where title = 'Piraté')::int, 0, 'member updates nothing');
select throws_ok($$ select * from public.admin_quiz_questions('00000000-0000-4000-8000-000000000f01') $$, '42501', 'admin_only', 'member cannot read answers');
select throws_ok($$ select * from public.admin_students('', 10, 0) $$, '42501', 'admin_only', 'member cannot list students');
select throws_ok($$ select public.admin_dashboard(14) $$, '42501', 'admin_only', 'member cannot read the dashboard');
select is((select count(*) from public.newsletter_subscribers)::int, 0, 'member cannot read subscribers');
select is((select count(*) from public.contact_messages)::int, 0, 'member cannot read contact messages');

-- The admin.
select set_config('request.jwt.claims', '{"sub":"66666666-6666-6666-6666-666666666666","role":"authenticated"}', true);
select lives_ok($$ insert into public.courses (id, slug, code, title, summary, audience, level, price_cents) values ('00000000-0000-4000-8000-00000000aaaa', 'nouvelle-formation', 'F9', 'Nouvelle', 'Résumé', 'Tous', 'debutant', 3900) $$, 'admin creates a course');
select lives_ok($$ insert into public.modules (id, course_id, position, title) values ('00000000-0000-4000-8000-00000000aab1', '00000000-0000-4000-8000-00000000aaaa', 1, 'M1'), ('00000000-0000-4000-8000-00000000aab2', '00000000-0000-4000-8000-00000000aaaa', 2, 'M2') $$, 'admin adds modules');
select throws_ok($$ insert into public.lessons (course_id, module_id, position, slug, title, duration_min, mdx_path) values ('00000000-0000-4000-8000-00000000aaaa', '00000000-0000-4000-8000-000000000f01', 1, 'test', 'Test', 5, 'x.mdx') $$, '23514', 'module_of_other_course', 'a lesson cannot use a module of another course');
select lives_ok($$ select public.admin_move('module', '00000000-0000-4000-8000-00000000aab2', -1) $$, 'admin reorders modules');
select is((select position from public.modules where id = '00000000-0000-4000-8000-00000000aab2'), 1, 'module moved up');
select is((select correct_index from public.admin_quiz_questions('00000000-0000-4000-8000-000000000f01') limit 1), 1, 'admin reads answers');
select ok((select count(*) from public.admin_students('example.test', 50, 0)) >= 2, 'admin lists students with e-mails');
select ok(public.admin_dashboard(14) ? 'sales', 'admin reads the dashboard');
select is((select count(*) from public.newsletter_subscribers where email = 'abonne@example.test')::int, 1, 'admin reads subscribers');
select throws_ok($$ select access_token from public.newsletter_subscribers $$, '42501', null, 'unsubscribe tokens stay private');
select ok((select count(*) from public.contact_messages) >= 1, 'admin reads contact messages');
select throws_ok($$ update public.contact_messages set message = 'x' $$, '42501', null, 'admin can only mark messages as handled');
select throws_ok($$ update public.profiles set role = 'member' where id = '77777777-7777-7777-7777-777777777777' $$, '42501', null, 'roles are changed only by the service role');

select * from finish();
rollback;
