create extension if not exists pgcrypto;

create table if not exists public.employees (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  password_hash text,
  hourly_wage numeric(10, 2) not null default 0,
  day_hours numeric(5, 2) not null default 8.5,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.employees
add column if not exists password_hash text;

create table if not exists public.timesheet_entries (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employees(id) on delete cascade,
  work_date date not null,
  day_name text not null,
  in_time time,
  out_time time,
  duration_minutes integer not null default 0,
  decimal_hours numeric(8, 1) not null default 0,
  total_day numeric(8, 2) not null default 0,
  amount integer not null default 0,
  hourly_wage numeric(10, 2) not null default 0,
  day_hours numeric(5, 2) not null default 8.5,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (employee_id, work_date)
);

alter table public.employees enable row level security;
alter table public.timesheet_entries enable row level security;

drop policy if exists "Allow public employee reads" on public.employees;
drop policy if exists "Allow public employee inserts" on public.employees;
drop policy if exists "Allow public employee updates" on public.employees;
drop policy if exists "Allow public timesheet reads" on public.timesheet_entries;
drop policy if exists "Allow public timesheet inserts" on public.timesheet_entries;
drop policy if exists "Allow public timesheet updates" on public.timesheet_entries;

create policy "Allow public employee reads"
on public.employees for select
to anon
using (true);

create policy "Allow public employee inserts"
on public.employees for insert
to anon
with check (true);

create policy "Allow public employee updates"
on public.employees for update
to anon
using (true)
with check (true);

create policy "Allow public timesheet reads"
on public.timesheet_entries for select
to anon
using (true);

create policy "Allow public timesheet inserts"
on public.timesheet_entries for insert
to anon
with check (true);

create policy "Allow public timesheet updates"
on public.timesheet_entries for update
to anon
using (true)
with check (true);
