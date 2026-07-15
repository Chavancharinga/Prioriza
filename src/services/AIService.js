import { supabase } from '../lib/supabase'

const AI_API_BASE_URL = import.meta.env.PROD ? '' : (import.meta.env.VITE_AI_API_URL || 'http://localhost:8000')

async function requestTaskInsight(taskId, mode) {
    const { data: { session } } = await supabase.auth.getSession()
    const headers = { 'Content-Type': 'application/json' }
    if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`
    }

    const response = await fetch(`${AI_API_BASE_URL}/ai/task-insight`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
            task_id: taskId,
            mode
        })
    })

    const payload = await response.json().catch(() => ({}))

    if (!response.ok) {
        throw new Error(payload?.detail || 'Falha ao consultar a IA do Prioriza.')
    }

    return payload
}

async function prioChat(payload) {
    const { data: { session } } = await supabase.auth.getSession()
    const headers = { 'Content-Type': 'application/json' }
    if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`
    }

    const response = await fetch(`${AI_API_BASE_URL}/ai/prio-chat`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
    })

    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
        throw new Error(data?.detail || 'Falha ao conversar com o PRIO.')
    }

    return data
}

async function getLinkPreview(url) {
    const { data: { session } } = await supabase.auth.getSession()
    const headers = { 'Content-Type': 'application/json' }
    if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`
    }

    const response = await fetch(`${AI_API_BASE_URL}/ai/link-preview`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ url })
    })

    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
        throw new Error(data?.detail || 'Não foi possível carregar a pré-visualização do link.')
    }

    return data
}

export const AIService = {
    requestTaskInsight,
    prioChat,
    getLinkPreview,

    suggestSubtasks(taskId) {
        return requestTaskInsight(taskId, 'subtasks')
    },

    summarizeNotes(taskId) {
        return requestTaskInsight(taskId, 'summary')
    }
}
