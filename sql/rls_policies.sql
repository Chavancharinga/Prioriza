-- Row Level Security Policies for Prioriza

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PROFILES POLICIES
-- ============================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);

-- Users can insert their own profile (on signup)
CREATE POLICY "Users can insert own profile"
ON profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- ============================================
-- TASKS POLICIES
-- ============================================

-- Users can view their own tasks
CREATE POLICY "Users can view own tasks"
ON tasks FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own tasks
CREATE POLICY "Users can insert own tasks"
ON tasks FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own tasks
CREATE POLICY "Users can update own tasks"
ON tasks FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own tasks
CREATE POLICY "Users can delete own tasks"
ON tasks FOR DELETE
USING (auth.uid() = user_id);

-- ============================================
-- NOTES POLICIES
-- ============================================

-- Users can view notes for their own tasks
CREATE POLICY "Users can view notes for own tasks"
ON notes FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM tasks
        WHERE tasks.id = notes.task_id
        AND tasks.user_id = auth.uid()
    )
);

-- Users can insert notes for their own tasks
CREATE POLICY "Users can insert notes for own tasks"
ON notes FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM tasks
        WHERE tasks.id = notes.task_id
        AND tasks.user_id = auth.uid()
    )
);

-- Users can update notes for their own tasks
CREATE POLICY "Users can update notes for own tasks"
ON notes FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM tasks
        WHERE tasks.id = notes.task_id
        AND tasks.user_id = auth.uid()
    )
);

-- Users can delete notes for their own tasks
CREATE POLICY "Users can delete notes for own tasks"
ON notes FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM tasks
        WHERE tasks.id = notes.task_id
        AND tasks.user_id = auth.uid()
    )
);

-- ============================================
-- RESOURCES POLICIES
-- ============================================

-- Users can view resources for their own tasks
CREATE POLICY "Users can view resources for own tasks"
ON resources FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM tasks
        WHERE tasks.id = resources.task_id
        AND tasks.user_id = auth.uid()
    )
);

-- Users can insert resources for their own tasks
CREATE POLICY "Users can insert resources for own tasks"
ON resources FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM tasks
        WHERE tasks.id = resources.task_id
        AND tasks.user_id = auth.uid()
    )
);

-- Users can update resources for their own tasks
CREATE POLICY "Users can update resources for own tasks"
ON resources FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM tasks
        WHERE tasks.id = resources.task_id
        AND tasks.user_id = auth.uid()
    )
);

-- Users can delete resources for their own tasks
CREATE POLICY "Users can delete resources for own tasks"
ON resources FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM tasks
        WHERE tasks.id = resources.task_id
        AND tasks.user_id = auth.uid()
    )
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Index for faster task queries
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_parent_id ON tasks(parent_id);

-- Index for notes and resources
CREATE INDEX IF NOT EXISTS idx_notes_task_id ON notes(task_id);
CREATE INDEX IF NOT EXISTS idx_resources_task_id ON resources(task_id);

-- ============================================
-- TRIGGERS FOR AUTOMATIC TIMESTAMPS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for profiles
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- GRANT PERMISSIONS
-- ============================================

-- Grant authenticated users access to tables
GRANT ALL ON profiles TO authenticated;
GRANT ALL ON tasks TO authenticated;
GRANT ALL ON notes TO authenticated;
GRANT ALL ON resources TO authenticated;

-- ============================================
-- COMMENT DOCUMENTATION
-- ============================================

COMMENT ON POLICY "Users can view own profile" ON profiles IS 'Allow users to view their own profile data';
COMMENT ON POLICY "Users can view own tasks" ON tasks IS 'Allow users to view only their own tasks';
COMMENT ON POLICY "Users can view notes for own tasks" ON notes IS 'Allow users to view notes only for tasks they own';
COMMENT ON POLICY "Users can view resources for own tasks" ON resources IS 'Allow users to view resources only for tasks they own';
