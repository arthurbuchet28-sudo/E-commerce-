-- Operations: last run of each scheduled job, shown on the status page (/statut) and in the
-- back-office. Written and read by the server only (service role); no personal data.

create table public.job_runs (
  job text primary key check (char_length(job) between 1 and 60),
  last_run_at timestamptz not null default now(),
  ok boolean not null,
  -- Counters only (e-mails sent, rows purged): never personal data.
  summary jsonb not null default '{}'::jsonb
);

alter table public.job_runs enable row level security;
-- No policy: anon and authenticated roles have no access at all.
grant all on public.job_runs to service_role;
