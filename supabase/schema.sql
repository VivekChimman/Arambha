-- ┌───────────────────────────────────────────────────────────────────────────┐
-- │  PROPOSAL — review before running. Arambha persistence, minimal first cut.   │
-- │  Run in the Supabase SQL editor. Nothing in the app writes to these tables    │
-- │  yet — the persistence code will be wired only AFTER these exist and you've   │
-- │  confirmed (CLAUDE.md: verify the schema is migrated, never assume).          │
-- └───────────────────────────────────────────────────────────────────────────┘

-- Extensions ------------------------------------------------------------------
create extension if not exists "pgcrypto"; -- for gen_random_uuid()

-- Generated roadmaps ----------------------------------------------------------
-- Stores each intake + the roadmap we produced. No raw PII: IPs are salted+hashed
-- (IP_HASH_SALT), region is a coarse band, and answers are the enumerated options
-- only. DPDP posture stays low-exposure.
create table if not exists public.roadmaps (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  answers      jsonb not null,        -- validated intake answers (option values only)
  roadmap      jsonb not null,        -- the assembled roadmap we returned
  provider     text,                  -- 'deterministic' | 'anthropic' | 'openai' | ...
  region       text,                  -- 'india' | 'global'
  ip_hash      text                   -- salted + hashed, never a raw IP
);

create index if not exists roadmaps_created_at_idx on public.roadmaps (created_at desc);

-- Row Level Security ----------------------------------------------------------
-- Deny by default. The server writes with the SERVICE ROLE key, which bypasses
-- RLS; the anon key gets no access at all. No public reads.
alter table public.roadmaps enable row level security;
-- (Intentionally no policies for anon/authenticated → all such access is denied.)

-- Later: a `pathways` table to move the verified library out of lib/pathways.ts,
-- plus a `pathways_draft` review queue fed by the research pipeline. Add when we
-- build that milestone.
