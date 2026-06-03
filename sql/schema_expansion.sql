-- ============================================
-- EXPANSÃO DO SCHEMA DO PRIORIZA
-- Execute no Supabase SQL Editor
-- ============================================

-- 1. Habilitar pgvector extension se possível (ignora erro se já estiver ativa ou sem permissão de superuser)
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Tabela de sub-tarefas (checklist_items)
CREATE TABLE IF NOT EXISTS public.checklist_items (
  id uuid default uuid_generate_v4() primary key,
  task_id uuid references public.tasks(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  is_completed boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- 3. Renomear e Garantir a tabela de notas (task_notes)
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'notes') THEN
    ALTER TABLE public.notes RENAME TO task_notes;
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.task_notes (
  id uuid default uuid_generate_v4() primary key,
  task_id uuid references public.tasks(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 4. Adicionar colunas de time tracking na tabela de tarefas
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS timer_started_at timestamp with time zone;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS time_spent int default 0;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS completed_at timestamp with time zone;

-- 5. Tabela de junção para backlinks/links bidirecionais (item_relations)
CREATE TABLE IF NOT EXISTS public.item_relations (
  id uuid default uuid_generate_v4() primary key,
  origin_id uuid not null,
  target_id uuid not null,
  relation_type text default 'link',
  created_at timestamp with time zone default timezone('utc'::text, now()),
  UNIQUE(origin_id, target_id)
);

-- 6. Tabela de sessões de Pomodoro completadas (pomodoro_sessions)
CREATE TABLE IF NOT EXISTS public.pomodoro_sessions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  task_id uuid references public.tasks(id) on delete cascade,
  duration_seconds int not null,
  completed_at timestamp with time zone default timezone('utc'::text, now())
);

-- 7. Adicionar colunas de RPG/Gamificação no perfil de usuário
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS xp int default 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS level int default 1;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS streak int default 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_activity_date date;

-- 8. Tabela de Embeddings para Contexto IA / RAG (node_embeddings)
CREATE TABLE IF NOT EXISTS public.node_embeddings (
  id uuid default uuid_generate_v4() primary key,
  node_id uuid not null,
  node_type text not null, -- 'task', 'note', 'checklist'
  content text not null,
  embedding vector(1536), -- Standard OpenAI dimension
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 9. Habilitar RLS em todas as novas tabelas
ALTER TABLE public.checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.item_relations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pomodoro_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.node_embeddings ENABLE ROW LEVEL SECURITY;

-- 10. Políticas RLS para checklist_items
CREATE POLICY "Users can view own checklist items" ON public.checklist_items
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own checklist items" ON public.checklist_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own checklist items" ON public.checklist_items
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own checklist items" ON public.checklist_items
  FOR DELETE USING (auth.uid() = user_id);

-- 11. Políticas RLS para task_notes
CREATE POLICY "Users can view own task notes" ON public.task_notes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own task notes" ON public.task_notes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own task notes" ON public.task_notes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own task notes" ON public.task_notes
  FOR DELETE USING (auth.uid() = user_id);

-- 12. Políticas RLS para item_relations (Backlinks)
CREATE POLICY "Users can view item relations" ON public.item_relations
  FOR SELECT USING (true); -- Public select, details managed in app logic or task checks

CREATE POLICY "Users can insert item relations" ON public.item_relations
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can delete item relations" ON public.item_relations
  FOR DELETE USING (true);

-- 13. Políticas RLS para pomodoro_sessions
CREATE POLICY "Users can view own pomodoros" ON public.pomodoro_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own pomodoros" ON public.pomodoro_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own pomodoros" ON public.pomodoro_sessions
  FOR DELETE USING (auth.uid() = user_id);

-- 14. Políticas RLS para node_embeddings
CREATE POLICY "Users can view embeddings" ON public.node_embeddings
  FOR SELECT USING (true);

CREATE POLICY "Users can insert embeddings" ON public.node_embeddings
  FOR INSERT WITH CHECK (true);

-- 15. Criar View para telemetria (tempo planejado vs tempo real por prioridade)
CREATE OR REPLACE VIEW public.telemetry_time_by_priority AS
SELECT
  t.user_id,
  t.priority,
  count(t.id) as task_count,
  sum(coalesce(t.estimated_minutes, 0)) * 60 as total_estimated_seconds,
  sum(coalesce(t.time_spent, 0)) as total_stopwatch_seconds,
  sum(coalesce(ps.duration_seconds, 0)) as total_pomodoro_seconds
FROM public.tasks t
LEFT JOIN public.pomodoro_sessions ps ON t.id = ps.task_id
GROUP BY t.user_id, t.priority;

-- 16. Criar Índices de performance
CREATE INDEX IF NOT EXISTS idx_checklist_items_task_id ON checklist_items(task_id);
CREATE INDEX IF NOT EXISTS idx_task_notes_task_id ON task_notes(task_id);
CREATE INDEX IF NOT EXISTS idx_item_relations_origin ON item_relations(origin_id);
CREATE INDEX IF NOT EXISTS idx_item_relations_target ON item_relations(target_id);
CREATE INDEX IF NOT EXISTS idx_pomodoro_sessions_task_id ON pomodoro_sessions(task_id);
CREATE INDEX IF NOT EXISTS idx_node_embeddings_node_id ON node_embeddings(node_id);

-- 17. Permissões de acesso
GRANT ALL ON public.checklist_items TO authenticated;
GRANT ALL ON public.task_notes TO authenticated;
GRANT ALL ON public.item_relations TO authenticated;
GRANT ALL ON public.pomodoro_sessions TO authenticated;
GRANT ALL ON public.node_embeddings TO authenticated;
GRANT ALL ON public.telemetry_time_by_priority TO authenticated;
