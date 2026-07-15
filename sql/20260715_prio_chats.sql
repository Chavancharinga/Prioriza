create table if not exists public.prio_chats (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    client_id text not null check (char_length(client_id) between 1 and 100),
    title text not null default 'Novo chat',
    messages jsonb not null default '[]'::jsonb,
    pending_task_creation boolean not null default false,
    created_at timestamptz not null default timezone('utc', now()),
    updated_at timestamptz not null default timezone('utc', now()),
    unique (user_id, client_id)
);

create index if not exists prio_chats_user_updated_idx
    on public.prio_chats (user_id, updated_at desc);

alter table public.prio_chats enable row level security;

drop policy if exists "Users can read their PRIO chats" on public.prio_chats;
drop policy if exists "Users can create their PRIO chats" on public.prio_chats;
drop policy if exists "Users can update their PRIO chats" on public.prio_chats;
drop policy if exists "Users can delete their PRIO chats" on public.prio_chats;

create policy "Users can read their PRIO chats"
    on public.prio_chats for select to authenticated
    using ((select auth.uid()) = user_id);

create policy "Users can create their PRIO chats"
    on public.prio_chats for insert to authenticated
    with check ((select auth.uid()) = user_id);

create policy "Users can update their PRIO chats"
    on public.prio_chats for update to authenticated
    using ((select auth.uid()) = user_id)
    with check ((select auth.uid()) = user_id);

create policy "Users can delete their PRIO chats"
    on public.prio_chats for delete to authenticated
    using ((select auth.uid()) = user_id);

grant select, insert, update, delete on public.prio_chats to authenticated;
