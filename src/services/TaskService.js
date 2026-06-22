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
                checklist_items(*),
                subtasks:tasks(*, checklist_items(*))
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
                estimated_minutes: Number(taskData.estimated_minutes) > 0
                    ? Number(taskData.estimated_minutes)
                    : 30,
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
        if (!user) throw new Error('User not authenticated')

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

        // Parse bidirectional links like [[Task Title]]
        const linkRegex = /\[\[(.*?)\]\]/g
        let match
        const matches = []
        while ((match = linkRegex.exec(content)) !== null) {
            if (match[1] && match[1].trim()) {
                matches.push(match[1].trim())
            }
        }

        if (matches.length > 0) {
            for (const targetTitle of matches) {
                try {
                    // Try to find matching task title for this user
                    const { data: matchedTasks } = await supabase
                        .from('tasks')
                        .select('id')
                        .eq('title', targetTitle)
                        .eq('user_id', user.id)
                        .limit(1)

                    if (matchedTasks && matchedTasks.length > 0) {
                        const targetId = matchedTasks[0].id
                        // Insert relation
                        await supabase
                            .from('item_relations')
                            .upsert({
                                origin_id: taskId,
                                target_id: targetId,
                                relation_type: 'link'
                            }, { onConflict: 'origin_id,target_id' })
                    }
                } catch (err) {
                    console.error('Error establishing backlink relation:', err)
                }
            }
        }

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

    // Bidirectional Links & Backlinks Queries
    async getBacklinks(taskId) {
        try {
            const { data: relations, error: relError } = await supabase
                .from('item_relations')
                .select('origin_id')
                .eq('target_id', taskId)

            if (relError) throw relError
            if (!relations || relations.length === 0) return []

            const originIds = relations.map(r => r.origin_id)

            const { data: tasks, error: taskError } = await supabase
                .from('tasks')
                .select('id, title, priority, status')
                .in('id', originIds)

            if (taskError) throw taskError
            return tasks || []
        } catch (err) {
            console.error('Error fetching backlinks:', err)
            return []
        }
    },

    async getOutgoingLinks(taskId) {
        try {
            const { data: relations, error: relError } = await supabase
                .from('item_relations')
                .select('target_id')
                .eq('origin_id', taskId)

            if (relError) throw relError
            if (!relations || relations.length === 0) return []

            const targetIds = relations.map(r => r.target_id)

            const { data: tasks, error: taskError } = await supabase
                .from('tasks')
                .select('id, title, priority, status')
                .in('id', targetIds)

            if (taskError) throw taskError
            return tasks || []
        } catch (err) {
            console.error('Error fetching outgoing links:', err)
            return []
        }
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
    },

    // Log Completed Pomodoro Session
    async logPomodoroSession(taskId, durationSeconds) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('User not authenticated')

        const { data, error } = await supabase
            .from('pomodoro_sessions')
            .insert([{
                user_id: user.id,
                task_id: taskId,
                duration_seconds: durationSeconds,
                completed_at: new Date().toISOString()
            }])
            .select('*')
            .single()

        if (error) throw error
        return data
    },

    // Fetch telemetry stats
    async getTelemetryStats() {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('User not authenticated')

        const { data, error } = await supabase
            .from('telemetry_time_by_priority')
            .select('*')
            .eq('user_id', user.id)

        if (error) throw error
        return data || []
    },

    // Generate mock tasks for testing
    async generateMockTasks() {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('User not authenticated')

        const mockTasks = [
            { title: 'Estudar Banco de Dados Relacionais', description: 'Ler capítulo 4 do livro de PostgreSQL e praticar comandos DDL.', priority: 3, status: 'A Fazer', estimated_minutes: 60, time_spent: 0 },
            { title: 'Corrigir Bug na Autenticação JWT', description: 'Investigar timeout no middleware e adicionar tratamento de erro no refresh token.', priority: 1, status: 'Em Progresso', estimated_minutes: 45, time_spent: 900 },
            { title: 'Prototipar Layout da Landing Page', description: 'Criar wireframe no Figma sem usar roxo! Focar na paleta HSL e espaçamentos modernos.', priority: 2, status: 'A Fazer', estimated_minutes: 120, time_spent: 0 },
            { title: 'Ajustar Responsividade no Header', description: 'Corrigir overflow do menu hambúrguer em telas menores que 360px.', priority: 4, status: 'Feito', estimated_minutes: 30, time_spent: 1800, completed_at: new Date(Date.now() - 3600000 * 24).toISOString() },
            { title: 'Escrever Testes Unitários de Gamificação', description: 'Validar ganho de XP com mocks e testar fluxo de level-up.', priority: 2, status: 'Feito', estimated_minutes: 90, time_spent: 5400, completed_at: new Date(Date.now() - 3600000 * 48).toISOString() },
            { title: 'Otimizar Consultas Slow no Postgres', description: 'Adicionar índices nas tabelas tasks e checklist_items.', priority: 1, status: 'A Fazer', estimated_minutes: 45, time_spent: 0 },
            { title: 'Planejamento Semanal de Sprints', description: 'Revisar backlog de bugs e definir prioridades para a próxima entrega.', priority: 3, status: 'Feito', estimated_minutes: 60, time_spent: 3600, completed_at: new Date(Date.now() - 3600000 * 72).toISOString() },
            { title: 'Exercício Diário de Foco e Alongamento', description: 'Pausa ativa de 15 minutos com exercícios e caminhada leve.', priority: 5, status: 'A Fazer', estimated_minutes: 15, time_spent: 0 },
            { title: 'Revisão de Código de Seguros API', description: 'Validar endpoints e garantir RLS ativo em todas as novas tabelas.', priority: 2, status: 'Em Progresso', estimated_minutes: 90, time_spent: 2700 }
        ]

        const now = new Date()
        mockTasks[0].due_date = new Date(now.getTime() + 3600000 * 24 * 2).toISOString()
        mockTasks[1].due_date = new Date(now.getTime() + 3600000 * 4).toISOString()
        mockTasks[2].due_date = new Date(now.getTime() + 3600000 * 24 * 5).toISOString()
        mockTasks[3].due_date = new Date(now.getTime() - 3600000 * 24).toISOString()
        mockTasks[5].due_date = new Date(now.getTime() - 3600000 * 24 * 2).toISOString()
        mockTasks[8].due_date = new Date(now.getTime() + 3600000 * 48).toISOString()

        const createdTasks = []
        for (const t of mockTasks) {
            const { data, error } = await supabase
                .from('tasks')
                .insert([{
                    ...t,
                    user_id: user.id
                }])
                .select()
                .single()
            if (error) {
                console.error('Error inserting mock task:', error)
            } else if (data) {
                createdTasks.push(data)
                
                if (data.title.includes('Estudar')) {
                    await supabase.from('checklist_items').insert([
                        { task_id: data.id, user_id: user.id, content: 'Ler Introdução', is_completed: true },
                        { task_id: data.id, user_id: user.id, content: 'Executar laboratório DDL', is_completed: false },
                        { task_id: data.id, user_id: user.id, content: 'Fazer notas de estudo', is_completed: false }
                    ])
                } else if (data.title.includes('Layout')) {
                    await supabase.from('checklist_items').insert([
                        { task_id: data.id, user_id: user.id, content: 'Desenhar wireframe mobile', is_completed: false },
                        { task_id: data.id, user_id: user.id, content: 'Desenhar wireframe desktop', is_completed: false }
                    ])
                }
                
                if (data.status === 'Em Progresso' || data.status === 'Feito') {
                    await supabase.from('task_notes').insert([
                        { task_id: data.id, user_id: user.id, content: 'Iniciei o desenvolvimento local. Conexão restabelecida.' }
                    ])
                }
            }
        }
        return createdTasks
    }
}
