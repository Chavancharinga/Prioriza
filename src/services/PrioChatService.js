import { supabase } from '../lib/supabase'

const MAX_CHATS = 12

function toChat(row) {
    return {
        id: row.client_id,
        title: row.title || 'Novo chat',
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        pendingTaskCreation: Boolean(row.pending_task_creation),
        messages: Array.isArray(row.messages) && row.messages.length ? row.messages : []
    }
}

export const PrioChatService = {
    async getChats() {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Utilizador não autenticado.')

        const { data, error } = await supabase
            .from('prio_chats')
            .select('client_id, title, messages, created_at, updated_at, pending_task_creation')
            .eq('user_id', user.id)
            .order('updated_at', { ascending: false })
            .limit(MAX_CHATS)

        if (error) throw error
        return (data || []).map(toChat)
    },

    async saveChats(chats) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Utilizador não autenticado.')

        const payload = chats.slice(0, MAX_CHATS).map(chat => ({
            user_id: user.id,
            client_id: chat.id,
            title: chat.title || 'Novo chat',
            messages: Array.isArray(chat.messages) ? chat.messages : [],
            pending_task_creation: Boolean(chat.pendingTaskCreation),
            created_at: chat.createdAt || new Date().toISOString(),
            updated_at: chat.updatedAt || new Date().toISOString()
        }))

        if (!payload.length) return

        const { error } = await supabase
            .from('prio_chats')
            .upsert(payload, { onConflict: 'user_id,client_id' })

        if (error) throw error
    }
}
