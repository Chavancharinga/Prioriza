const AI_API_BASE_URL = import.meta.env.VITE_AI_API_URL || 'http://127.0.0.1:8000'

async function requestTaskInsight(taskId, mode) {
    const response = await fetch(`${AI_API_BASE_URL}/ai/task-insight`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
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

export const AIService = {
    requestTaskInsight,

    suggestSubtasks(taskId) {
        return requestTaskInsight(taskId, 'subtasks')
    },

    summarizeNotes(taskId) {
        return requestTaskInsight(taskId, 'summary')
    }
}
