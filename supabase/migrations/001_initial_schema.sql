-- CardioTracker: patients & visits
-- Run in Supabase SQL Editor or via Supabase CLI

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- patients
-- ---------------------------------------------------------------------------
create table if not exists public.patients (
  id uuid primary key default gen_random_uuid(),
  iin text not null unique,
  full_name text not null,
  gender text not null check (gender in ('male', 'female')),
  birth_date date not null,
  phone text,
  blood_type text,
  address text,
  nurse_id text, -- local staff id until Supabase Auth (doctor/nurse from app)
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists patients_iin_idx on public.patients (iin);
create index if not exists patients_nurse_id_idx on public.patients (nurse_id);

-- ---------------------------------------------------------------------------
-- visits
-- ---------------------------------------------------------------------------
create table if not exists public.visits (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients (id) on delete cascade,
  visit_date date not null default current_date,
  next_visit_date date,
  visit_type text default 'Плановый осмотр',
  ef_lv numeric(5, 2),
  six_min_test integer,
  functional_class text, -- ФК I–IV (auto from six_min_test)
  nt_pro_bnp numeric(10, 2),
  ecg_text text,
  ecg_flags jsonb not null default '{}'::jsonb,
  height numeric(5, 2),
  weight numeric(5, 2),
  bmi numeric(5, 2),
  hemoglobin numeric(6, 2),
  hematocrit numeric(5, 2),
  urea numeric(6, 2),
  creatinine numeric(6, 2),
  alt numeric(6, 2),
  ast numeric(6, 2),
  ast_alt_ratio numeric(5, 2),
  risk_group text check (risk_group in ('A', 'B', 'C', 'D')),
  conclusion text,
  created_by text, -- local staff id
  created_by_role text check (created_by_role in ('doctor', 'nurse')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists visits_patient_id_idx on public.visits (patient_id);
create index if not exists visits_visit_date_idx on public.visits (visit_date desc);

-- ---------------------------------------------------------------------------
-- updated_at trigger
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists patients_set_updated_at on public.patients;
create trigger patients_set_updated_at
  before update on public.patients
  for each row execute function public.set_updated_at();

drop trigger if exists visits_set_updated_at on public.visits;
create trigger visits_set_updated_at
  before update on public.visits
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- RLS (open for dev — tighten when Supabase Auth is connected)
-- ---------------------------------------------------------------------------
alter table public.patients enable row level security;
alter table public.visits enable row level security;

drop policy if exists "patients_all_dev" on public.patients;
create policy "patients_all_dev"
  on public.patients for all
  using (true)
  with check (true);

drop policy if exists "visits_all_dev" on public.visits;
create policy "visits_all_dev"
  on public.visits for all
  using (true)
  with check (true);

-- Refresh PostgREST schema cache so API sees new tables immediately
notify pgrst, 'reload schema';
