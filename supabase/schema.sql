-- ┌───────────────────────────────────────────────────────────────────────────┐
-- │  Arambha schema — run in the Supabase SQL editor (once).                     │
-- │  Covers: profiles, subscriptions + quota, reports (history), chat messages.  │
-- │  RLS: every row is user-scoped; only the owner reads/writes. The server      │
-- │  (service-role key) bypasses RLS for webhook/admin writes.                    │
-- └───────────────────────────────────────────────────────────────────────────┘

create extension if not exists "pgcrypto";

-- ── profiles ─────────────────────────────────────────────────────────────────
-- One row per auth user. Holds the PERMANENT intake fields + free-trial counter.
create table if not exists public.profiles (
  id                uuid primary key references auth.users(id) on delete cascade,
  email             text,
  age_band          text,         -- permanent
  education_level   text,         -- permanent
  region            text,         -- permanent
  free_reports_used int  not null default 0,   -- free-trial usage (limit 1)
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- Auto-create a profile when a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── subscriptions ────────────────────────────────────────────────────────────
-- Monthly plan: ₹199 / 10 reports. reports_used resets each billing period
-- (on the DODO renewal webhook). Written by the server (service role) only.
create table if not exists public.subscriptions (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid not null references auth.users(id) on delete cascade,
  dodo_subscription_id  text unique,
  dodo_customer_id      text,
  status                text not null default 'inactive', -- active | cancelled | past_due | inactive
  quota_limit           int  not null default 10,
  reports_used          int  not null default 0,
  current_period_end    timestamptz,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);
create index if not exists subscriptions_user_idx on public.subscriptions (user_id);

-- ── reports (history) ────────────────────────────────────────────────────────
create table if not exists public.reports (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  title       text,
  mode        text not null default 'seeker',  -- seeker | builder
  answers     jsonb not null,                  -- the intake snapshot for this report
  roadmap     jsonb not null,                  -- the generated roadmap (with sources)
  created_at  timestamptz not null default now()
);
create index if not exists reports_user_idx on public.reports (user_id, created_at desc);

-- ── chat messages (follow-ups) ───────────────────────────────────────────────
create table if not exists public.chat_messages (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  report_id   uuid references public.reports(id) on delete cascade,
  role        text not null,   -- user | assistant
  content     text not null,
  created_at  timestamptz not null default now()
);
create index if not exists chat_messages_report_idx on public.chat_messages (report_id, created_at);

-- ── Row Level Security ───────────────────────────────────────────────────────
alter table public.profiles       enable row level security;
alter table public.subscriptions  enable row level security;
alter table public.reports        enable row level security;
alter table public.chat_messages  enable row level security;

-- Owner-only access (service role bypasses RLS automatically).
create policy "own profile"      on public.profiles      for all using (auth.uid() = id)      with check (auth.uid() = id);
create policy "own subscription" on public.subscriptions for select using (auth.uid() = user_id);
create policy "own reports"      on public.reports       for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own messages"     on public.chat_messages for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
