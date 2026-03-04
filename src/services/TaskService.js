import { supabase } from '../lib/supabase'

export const TaskService = {
    // Fetch all tasks for the current user
    async getTasks() {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('User not authenticated')

        const { data, error } = await supabase
            .from('tasks')
            .select(`
        *,
        subtasks:tasks(*)
      `)
            .eq('user_id', user.id)
            .is('parent_id', null) // Fetch top-level tasks
            .order('created_at', { ascending: false })

        if (error) throw error
        return data
    },

    // Create a new task
    async createTask(taskData) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('User not authenticated')

        const { data, error } = await supabase
            .from('tasks')
            .insert([{
                ...taskData,
                user_id: user.id,
                created_at: new Date().toISOString()
            }])
            .select()
            .single()

        if (error) throw error
        return data
    },

    // Update a task
    async updateTask(id, updates) {
        const { data, error } = await supabase
            .from('tasks')
            .update(updates)
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return data
    },

    // Delete a task
    async deleteTask(id) {
        const { error } = await supabase
            .from('tasks')
            .delete()
            .eq('id', id)

        if (error) throw error
        return true
    },

    // Toggle task status (simple transition)
    async updateStatus(id, status) {
        return this.updateTask(id, { status })
    },

    // Get tasks by date range (for timeline)
    async getTasksByDateRange(startDate, endDate) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('User not authenticated')

        const { data, error } = await supabase
            .from('tasks')
            .select('*')
            .eq('user_id', user.id)
            .gte('due_date', startDate)
            .lte('due_date', endDate)
            .order('due_date', { ascending: true })

        if (error) throw error
        return data
    },

    // --- ENRICHMENT FEATURES (Phase 8) ---

    // Get full task details including checklist and notes
    async getTaskDetails(taskId) {
        const { data, error } = await supabase
            .from('tasks')
            .select(`
                *,
                checklist_items(*),
                task_notes(*)
            `)
            .eq('id', taskId)
            .order('created_at', { foreignTable: 'checklist_items', ascending: true })
            .order('created_at', { foreignTable: 'task_notes', ascending: false })
            .single()

        if (error) throw error
        return data
    },

    // Checklist Items
    async createChecklistItem(taskId, content) {
        const { data: { user } } = await supabase.auth.getUser()
        const { data, error } = await supabase
            .from('checklist_items')
            .insert([{
                task_id: taskId,
                content,
                user_id: user.id
            }])
            .select('*')

            .single()

        if (error) throw error
        return data
    },

    async updateChecklistItem(id, updates) {
        const { data, error } = await supabase
            .from('checklist_items')
            .update(updates)
            .eq('id', id)
            .select('*')

            .single()

        if (error) throw error
        return data
    },

    async deleteChecklistItem(id) {
        const { error } = await supabase
            .from('checklist_items')
            .delete()
            .eq('id', id)

        if (error) throw error
        return true
    },

    // Notes
    async createNote(taskId, content) {
        const { data: { user } } = await supabase.auth.getUser()
        const { data, error } = await supabase
            .from('task_notes')
            .insert([{
                task_id: taskId,
                content,
                user_id: user.id
            }])
            .select('*')
            .single()

        if (error) throw error
        return data
    },

    async deleteNote(id) {
        const { error } = await supabase
            .from('task_notes')
            .delete()
            .eq('id', id)

        if (error) throw error
        return true
    },

    // Time Tracking
    async startTimer(taskId) {
        const { data, error } = await supabase
            .from('tasks')
            .update({
                timer_started_at: new Date().toISOString(),
                status: 'Em Progresso' // Auto-move to In Progress
            })
            .eq('id', taskId)
            .select('*')

            .single()

        if (error) throw error
        return data
    },

    async stopTimer(taskId, timeSpentSoFar, startedAt) {
        // Calculate new duration in seconds
        let newTotal = parseInt(timeSpentSoFar) || 0
        const now = new Date()
        const start = new Date(startedAt)

        if (!isNaN(start.getTime())) {
            const sessionSeconds = Math.round((now - start) / 1000)
            if (sessionSeconds > 0) {
                newTotal += sessionSeconds
            }
        }

        const { data, error } = await supabase
            .from('tasks')
            .update({
                time_spent: newTotal,
                timer_started_at: null
            })
            .eq('id', taskId)
            .select('*')
            .single()

        if (error) throw error
        return data
    },

    // Complete Task (Stop timer + Mark as Done)
    async completeTask(taskId, timeSpentSoFar, startedAt) {
        let newTotal = parseInt(timeSpentSoFar) || 0

        // If timer was running, add the final session
        if (startedAt) {
            const now = new Date()
            const start = new Date(startedAt)

            // Safety check for valid date
            if (!isNaN(start.getTime())) {
                const sessionSeconds = Math.round((now - start) / 1000)
                if (sessionSeconds > 0) {
                    newTotal += sessionSeconds
                }
            }
        }

        const { data, error } = await supabase
            .from('tasks')
            .update({
                status: 'Feito',
                completed_at: new Date().toISOString(),
                time_spent: newTotal,
                timer_started_at: null
            })
            .eq('id', taskId)
            .select('*') // Explicit select

        if (error) throw error
        return data?.[0]
    }
}
