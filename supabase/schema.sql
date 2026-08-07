-- ============================================================
-- OmniDecision AI — Supabase Database Schema
-- Run this in: Supabase Dashboard > SQL Editor > New Query
-- ============================================================

-- 1. Decisions Table
create table if not exists public.decisions (
  id            uuid default gen_random_uuid() primary key,
  user_id       uuid references auth.users(id) on delete cascade not null,
  title         text not null default 'Untitled Strategic Decision',
  problem_statement text default '',
  industry      text default 'Enterprise Strategy',
  status        text default 'draft',
  criteria      jsonb default '[]'::jsonb,
  options       jsonb default '[]'::jsonb,
  scenario_modifiers jsonb default '{"marketDownturn": false, "costInflationPercent": 0, "stringentCompliance": false}'::jsonb,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- 2. Enable Row Level Security (critical!)
alter table public.decisions enable row level security;

-- 3. RLS Policies — users can only access their own decisions
create policy "Users can view own decisions"
  on public.decisions for select
  using (auth.uid() = user_id);

create policy "Users can insert own decisions"
  on public.decisions for insert
  with check (auth.uid() = user_id);

create policy "Users can update own decisions"
  on public.decisions for update
  using (auth.uid() = user_id);

create policy "Users can delete own decisions"
  on public.decisions for delete
  using (auth.uid() = user_id);

-- 4. Auto-update trigger for updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger decisions_updated_at
  before update on public.decisions
  for each row execute function public.handle_updated_at();

-- 5. Seed demo decision (optional — run separately after creating a user account)
-- Replace 'YOUR_USER_ID' with your actual user UUID from auth.users table
-- insert into public.decisions (user_id, title, problem_statement, industry, status, criteria, options)
-- values (
--   'YOUR_USER_ID',
--   'Enterprise AI & Cloud Infrastructure Selection',
--   'Evaluate enterprise-grade cloud AI platforms...',
--   'Technology & Enterprise SaaS',
--   'analyzed',
--   '[{"id":"crit_cost","name":"Total Cost of Ownership (TCO)","weight":0.30,"type":"cost","unit":"USD/mo"},{"id":"crit_latency","name":"Inference Latency SLA","weight":0.25,"type":"benefit","unit":"ms"},{"id":"crit_security","name":"Security & Compliance","weight":0.20,"type":"benefit","unit":"score 1-10"},{"id":"crit_flexibility","name":"Multi-Model Flexibility","weight":0.15,"type":"benefit","unit":"score 1-10"},{"id":"crit_rampup","name":"Dev Team Time-to-Deploy","weight":0.10,"type":"benefit","unit":"weeks"}]'::jsonb,
--   '[{"id":"opt_gcp","name":"Google Cloud Platform (Vertex AI)","description":"Managed Vertex AI pipelines","scores":{"crit_cost":7.5,"crit_latency":9.2,"crit_security":9.0,"crit_flexibility":8.5,"crit_rampup":9.0},"risks":["Minor vendor lock-in"]},{"id":"opt_aws","name":"Amazon Web Services (Bedrock)","description":"AWS Bedrock unified API","scores":{"crit_cost":6.8,"crit_latency":8.5,"crit_security":9.5,"crit_flexibility":8.0,"crit_rampup":7.5},"risks":["Rate limits during peak hours"]},{"id":"opt_selfhost","name":"Self-Hosted Hybrid (vLLM)","description":"Open-source models on Kubernetes","scores":{"crit_cost":9.0,"crit_latency":7.0,"crit_security":7.0,"crit_flexibility":9.5,"crit_rampup":4.0},"risks":["High maintenance overhead"]}]'::jsonb
-- );
