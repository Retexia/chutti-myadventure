-- ============================================================================
-- OPERATION: NO MATTER WHAT — CHUTYYMIII & PICCALITO ANNIVERSARY SUPABASE SCHEMA
-- Paste and run this entire script in your Supabase Dashboard -> SQL Editor
-- ============================================================================

create table if not exists public.quest_progress (
  id uuid primary key default gen_random_uuid(),
  player_name text not null default 'chutyymiii',
  current_stage int not null default 0,
  unlocked_stages int[] not null default '{0}',
  kisses_collected int not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.love_notes (
  id uuid primary key default gen_random_uuid(),
  sender text not null default 'Chutyymiii',
  message text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.memory_photos (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  caption text not null,
  chapter_tag text default 'Our Memory',
  created_at timestamptz not null default now()
);

alter table public.quest_progress enable row level security;
alter table public.love_notes enable row level security;
alter table public.memory_photos enable row level security;

create policy "Public access quest_progress" on public.quest_progress for all using (true) with check (true);
create policy "Public access love_notes" on public.love_notes for all using (true) with check (true);
create policy "Public access memory_photos" on public.memory_photos for all using (true) with check (true);

-- Optional: Create a public Supabase Storage bucket named 'memories' for your Google Drive photos
insert into storage.buckets (id, name, public)
values ('memories', 'memories', true)
on conflict (id) do nothing;

create policy "Public read access for memories bucket"
on storage.objects for select
using ( bucket_id = 'memories' );

create policy "Public upload access for memories bucket"
on storage.objects for insert
with check ( bucket_id = 'memories' );
