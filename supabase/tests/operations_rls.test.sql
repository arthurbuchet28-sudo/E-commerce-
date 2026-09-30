-- Operations tables: invisible to visitors and members (run with `supabase test db`).
begin;
create extension if not exists pgtap with schema extensions;
select plan(4);

insert into public.job_runs (job, ok, summary) values ('test-pgtap', true, '{"sent":1}');

set local role anon;
select throws_ok($$ select * from public.job_runs $$, '42501', null, 'visitors cannot read job runs');

set local role authenticated;
select throws_ok($$ select * from public.job_runs $$, '42501', null, 'members cannot read job runs');
select throws_ok($$ insert into public.job_runs (job, ok) values ('x', true) $$, '42501', null, 'members cannot write job runs');

reset role;
select is((select ok from public.job_runs where job = 'test-pgtap'), true, 'the service role writes job runs');

select * from finish();
rollback;
