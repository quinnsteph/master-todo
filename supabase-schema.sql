-- Create todos table
create table if not exists public.todos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  text text not null,
  completed boolean not null default false,
  source text, -- Where the TODO came from (git-hook, cron, manual)
  path text,   -- File path if applicable
  via text,    -- Additional context
  created_at timestamp with time zone not null default now()
);

-- Create index for performance
create index if not exists idx_todos_user on public.todos(user_id);

-- Enable Row Level Security
alter table public.todos enable row level security;

-- Create policy so users can only see/edit their own todos
create policy "Users can manage own todos" on public.todos
  for all using (user_id = auth.uid()) 
  with check (user_id = auth.uid());

-- Optional: Enable Google OAuth in Supabase Dashboard
-- Go to Authentication → Providers → Google