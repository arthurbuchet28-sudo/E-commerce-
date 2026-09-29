-- RLS and function tests for courses (run with `supabase test db`). Relies on seed.sql.
begin;
create extension if not exists pgtap with schema extensions;
select plan(20);


insert into auth.users (id, email, raw_user_meta_data)
values ('33333333-3333-3333-3333-333333333333', 'c@example.test', '{"display_name":"Karim"}');

-- Anonymous visitors see the published catalogue, nothing else.
set local role anon;
select is((select count(*) from public.courses)::int, 2, 'anon sees published courses');
select ok((select count(*) from public.lessons) > 0, 'anon sees the programme');
select throws_ok($$ select prompt from public.quiz_questions $$, '42501', null, 'anon cannot read quiz questions');
reset role;

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"33333333-3333-3333-3333-333333333333","role":"authenticated"}', true);

select throws_ok($$ select correct_index from public.quiz_questions $$, '42501', null, 'answers are never readable');
select is((select count(*) from public.quiz_questions)::int, 0, 'no questions without access');
select throws_ok($$ insert into public.enrollments (user_id, course_id, source) values ('33333333-3333-3333-3333-333333333333', '00000000-0000-4000-8000-000000000f10', 'admin') $$, '42501', null, 'cannot grant oneself access');
select throws_ok($$ select public.enroll_free('00000000-0000-4000-8000-000000000f10') $$, 'P0001', 'not_free', 'cannot enroll for free in a paid course');
select throws_ok($$ insert into public.lesson_progress (user_id, lesson_id, course_id) values ('33333333-3333-3333-3333-333333333333', '00000000-0000-4000-8000-000000000b01', '00000000-0000-4000-8000-000000000f10') $$, '42501', null, 'no progress on a paid course without access');
select throws_ok($$ select public.submit_quiz('00000000-0000-4000-8000-000000000f11', array[1,0,0]) $$, '42501', 'no_access', 'no quiz on a paid course without access');
-- Spoofing: claiming a free course id for a paid lesson is corrected by the trigger.
select lives_ok($$ select public.enroll_free('00000000-0000-4000-8000-000000000f00') $$, 'can enroll in the free course');
select throws_ok($$ insert into public.lesson_progress (user_id, lesson_id, course_id) values ('33333333-3333-3333-3333-333333333333', '00000000-0000-4000-8000-000000000b01', '00000000-0000-4000-8000-000000000f00') $$, '42501', null, 'course id cannot be spoofed');

select is((select count(*) from public.quiz_questions)::int, 8, 'questions of the free course are readable');
select throws_ok($$ select public.issue_certificate('00000000-0000-4000-8000-000000000f00') $$, 'P0001', 'not_completed', 'no certificate before completion');

-- Complete every lesson of the free course.
insert into public.lesson_progress (user_id, lesson_id, course_id, completed_at)
select '33333333-3333-3333-3333-333333333333', id, course_id, now() from public.lessons where course_id = '00000000-0000-4000-8000-000000000f00';

select is((public.submit_quiz('00000000-0000-4000-8000-000000000f01', array[0,0,0,0]) ->> 'passed')::boolean, false, 'a failed quiz is recorded as failed');
select is((public.submit_quiz('00000000-0000-4000-8000-000000000f01', array[1,0,2,0]) ->> 'score')::int, 100, 'quiz graded server-side');
select throws_ok($$ select public.issue_certificate('00000000-0000-4000-8000-000000000f00') $$, 'P0001', 'not_completed', 'every module quiz must be passed');
select throws_ok($$ select public.submit_quiz('00000000-0000-4000-8000-000000000f02', array[1]) $$, 'P0001', 'invalid_answers', 'one answer per question');
select is((public.submit_quiz('00000000-0000-4000-8000-000000000f02', array[1,1,0,0]) ->> 'passed')::boolean, true, 'second quiz passed');
select ok(public.issue_certificate('00000000-0000-4000-8000-000000000f00') is not null, 'certificate issued once completed');
select is((select holder_name from public.certificates), 'Karim', 'certificate carries the member name');

select * from finish();
rollback;
