-- ============================================
-- SCHEMA COMPLETO DO PRIORIZA
-- Execute no Supabase SQL Editor
-- ============================================

-- 1. Criar extensão UUID se não existir
create extension if not exists "uuid-ossp";

-- 2. Tabela de perfis de usuário
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  preferências jsonb default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- 3. Tabela de tarefas
create table public.tasks (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text,
  priority int check (priority >= 1 and priority <= 5) default 3,
  status text default 'A Fazer',
  due_date timestamp with time zone,
  reminder timestamp with time zone,
  progress int default 0 check (progress >= 0 and progress <= 100),
  parent_id uuid references public.tasks(id),
  is_ai_generated boolean default false,
  estimated_minutes int,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- 4. Tabela de notas
create table public.notes (
  id uuid default uuid_generate_v4() primary key,
  task_id uuid references public.tasks(id) on delete cascade not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 5. Tabela de recursos/links
create table public.resources (
  id uuid default uuid_generate_v4() primary key,
  task_id uuid references public.tasks(id) on delete cascade not null,
  title text,
  url text not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 6. Habilitar RLS em todas as tabelas
alter table public.profiles enable row level security;
alter table public.tasks enable row level security;
alter table public.notes enable row level security;
alter table public.resources enable row level security;

-- 7. Políticas RLS para profiles
create policy "Users can view own profile"
  on profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

create policy "Users can insert own profile"
  on profiles for insert with check (auth.uid() = id);

-- 8. Políticas RLS para tasks
create policy "Users can view own tasks"
  on tasks for select using (auth.uid() = user_id);

create policy "Users can insert own tasks"
  on tasks for insert with check (auth.uid() = user_id);

create policy "Users can update own tasks"
  on tasks for update using (auth.uid() = user_id);

create policy "Users can delete own tasks"
  on tasks for delete using (auth.uid() = user_id);

-- 9. Políticas RLS para notes
create policy "Users can view own notes"
  on notes for select using (
    exists (select 1 from tasks where tasks.id = notes.task_id and tasks.user_id = auth.uid())
  );

create policy "Users can insert own notes"
  on notes for insert with check (
    exists (select 1 from tasks where tasks.id = notes.task_id and tasks.user_id = auth.uid())
  );

create policy "Users can delete own notes"
  on notes for delete using (
    exists (select 1 from tasks where tasks.id = notes.task_id and tasks.user_id = auth.uid())
  );

-- 10. Políticas RLS para resources
create policy "Users can view own resources"
  on resources for select using (
    exists (select 1 from tasks where tasks.id = resources.task_id and tasks.user_id = auth.uid())
  );

create policy "Users can insert own resources"
  on resources for insert with check (
    exists (select 1 from tasks where tasks.id = resources.task_id and tasks.user_id = auth.uid())
  );

create policy "Users can delete own resources"
  on resources for delete using (
    exists (select 1 from tasks where tasks.id = resources.task_id and tasks.user_id = auth.uid())
  );

-- 11. Criar índices para performance
create index if not exists idx_tasks_user_id on tasks(user_id);
create index if not exists idx_tasks_status on tasks(status);
create index if not exists idx_tasks_due_date on tasks(due_date);
create index if not exists idx_tasks_parent_id on tasks(parent_id);
create index if not exists idx_notes_task_id on notes(task_id);
create index if not exists idx_resources_task_id on resources(task_id);

-- 12. Grant permissions
grant all on public.profiles to authenticated;
grant all on public.tasks to authenticated;
grant all on public.notes to authenticated;
grant all on public.resources to authenticated;

-- 13. Trigger para criar perfil automáticamente ao criar usuário
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for row execute procedure public.handle_new_user();

-- ============================================
-- PRONTO!Execute tudo acima no SQL Editor
-- ============================================