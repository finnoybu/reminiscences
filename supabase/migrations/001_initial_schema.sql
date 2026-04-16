-- Reading progress (synced from localStorage for logged-in users)
create table public.reading_progress (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  chapter_slug text not null,
  scroll_position float default 0,
  percent float default 0,
  last_read_at timestamptz default now(),
  unique (user_id, chapter_slug)
);

-- Bookmarks
create table public.bookmarks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  chapter_slug text not null,
  scroll_position float not null,
  label text,
  created_at timestamptz default now()
);

-- Annotations (personal notes on text selections)
create table public.annotations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  chapter_slug text not null,
  text_selection text not null,
  note text default '',
  selection_start int,
  selection_end int,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Errata reports
create table public.errata_reports (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  chapter_slug text not null,
  text_selection text not null,
  description text not null,
  status text default 'pending' check (status in ('pending', 'reviewed', 'accepted', 'rejected')),
  created_at timestamptz default now()
);

-- Purchases (tracks Stripe payments for digital downloads)
create table public.purchases (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  product_id text not null,
  stripe_session_id text unique,
  amount_cents int not null,
  currency text default 'usd',
  created_at timestamptz default now()
);

-- Row Level Security: users can only access their own data
alter table public.reading_progress enable row level security;
alter table public.bookmarks enable row level security;
alter table public.annotations enable row level security;
alter table public.errata_reports enable row level security;
alter table public.purchases enable row level security;

-- RLS policies
create policy "Users read own progress" on public.reading_progress for select using (auth.uid() = user_id);
create policy "Users write own progress" on public.reading_progress for insert with check (auth.uid() = user_id);
create policy "Users update own progress" on public.reading_progress for update using (auth.uid() = user_id);

create policy "Users read own bookmarks" on public.bookmarks for select using (auth.uid() = user_id);
create policy "Users write own bookmarks" on public.bookmarks for insert with check (auth.uid() = user_id);
create policy "Users delete own bookmarks" on public.bookmarks for delete using (auth.uid() = user_id);

create policy "Users read own annotations" on public.annotations for select using (auth.uid() = user_id);
create policy "Users write own annotations" on public.annotations for insert with check (auth.uid() = user_id);
create policy "Users update own annotations" on public.annotations for update using (auth.uid() = user_id);
create policy "Users delete own annotations" on public.annotations for delete using (auth.uid() = user_id);

create policy "Users read own errata" on public.errata_reports for select using (auth.uid() = user_id);
create policy "Users write own errata" on public.errata_reports for insert with check (auth.uid() = user_id);

create policy "Users read own purchases" on public.purchases for select using (auth.uid() = user_id);
