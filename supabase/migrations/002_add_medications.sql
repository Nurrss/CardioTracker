-- Add medications JSONB column to visits table
-- Stores prescribed baseline medications per visit

alter table public.visits
  add column if not exists medications jsonb default null;
