-- ============================================================================
-- OPERATION: NO MATTER WHAT — Supabase schema
-- Paste this whole file into Supabase Dashboard → SQL Editor → Run.
-- Safe to run more than once.
-- ============================================================================

-- Her saved progress (one row). Piccalito's HQ page reads this live.
create table if not exists public.quest_state (
  player text primary key,
  state jsonb not null,
  updated_at timestamptz not null default now()
);

-- Live transmissions from Piccalito's HQ: hint messages + remote unlocks.
create table if not exists public.gm_messages (
  id bigint generated always as identity primary key,
  kind text not null check (kind in ('msg', 'unlock')),
  body text,
  lock_id text,
  created_at timestamptz not null default now()
);

-- The private hotline between Chutyymiii and Piccalito.
create table if not exists public.chat_messages (
  id bigint generated always as identity primary key,
  sender text not null check (sender in ('Chutyymiii', 'Piccalito')),
  body text not null check (char_length(body) <= 2000),
  secret boolean not null default false,
  auto boolean not null default false,
  chapter int,
  created_at timestamptz not null default now()
);

create table if not exists public.love_notes (
  id uuid primary key default gen_random_uuid(),
  sender text not null default 'Chutyymiii',
  message text not null,
  created_at timestamptz not null default now()
);

-- Only links are stored (Google Drive share links), never image files.
create table if not exists public.memory_photos (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  caption text not null,
  chapter_tag text default 'Our Memory',
  created_at timestamptz not null default now()
);

alter table public.quest_state enable row level security;
alter table public.gm_messages enable row level security;
alter table public.chat_messages enable row level security;
alter table public.love_notes enable row level security;
alter table public.memory_photos enable row level security;

-- This is a private two-person game using the public anon key, so access is open.
drop policy if exists "open quest_state" on public.quest_state;
create policy "open quest_state" on public.quest_state for all using (true) with check (true);
drop policy if exists "open gm_messages" on public.gm_messages;
create policy "open gm_messages" on public.gm_messages for all using (true) with check (true);
drop policy if exists "open love_notes" on public.love_notes;
create policy "open love_notes" on public.love_notes for all using (true) with check (true);
drop policy if exists "open memory_photos" on public.memory_photos;
create policy "open memory_photos" on public.memory_photos for all using (true) with check (true);
drop policy if exists "open chat_messages" on public.chat_messages;
create policy "open chat_messages" on public.chat_messages for all using (true) with check (true);

-- Realtime: new chat messages appear instantly (the app also polls as a fallback).
do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'chat_messages') then
    alter publication supabase_realtime add table public.chat_messages;
  end if;
end $$;
