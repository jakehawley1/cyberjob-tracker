-- Run this in your Supabase SQL editor (supabase.com > your project > SQL Editor)

create table if not exists jobs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  org text not null,
  location text default '',
  salary text default '',
  source text default 'governmentjobs.com',
  url text default '',
  date_applied date,
  status text default 'applied',
  clearance text default 'none',
  tags text[] default '{}',
  notes text default '',
  resume_version text default '',
  match_score integer,
  timeline jsonb default '[]',
  created_at timestamptz default now()
);

-- Enable Row Level Security (we keep it simple — no auth for now)
alter table jobs enable row level security;

-- Allow all operations (add auth later if you want login)
create policy "Allow all" on jobs for all using (true) with check (true);
