import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Bot, CalendarClock, CheckCircle2, Clock, Loader2, MessageSquarePlus, Plus, Send, Sparkles, Trophy } from 'lucide-react'
import { AIService } from '../services/AIService'
import { TaskService } from '../services/TaskService'
import { ProfileService } from '../services/ProfileService'
import { ResourceService } from '../services/ResourceService'

const quickPrompts = [
    'PRIO, faz um mini relatório da minha produtividade.',
    'PRIO, quais tarefas estão mais urgentes agora?',
    'PRIO, cria uma tarefa para revisar meu código com defeito amanhã.',
    'PRIO, organiza meu cronograma automático para hoje.'
]

const initialMessages = [
    {
        role: 'assistant',
        content: 'Olá! Sou o PRIO. Vamos organizar o teu dia juntos? Posso ajudar-te a escolher prioridades, criar tarefas e transformar o teu progresso num plano simples.'
    }
]

const CHAT_STORAGE_KEY = 'prioriza_prio_chats'
const WORK_DAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']
const TASK_STATUSES = ['A Fazer', 'Em Progresso', 'Feito']

function createChat() {
    return {
        id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
        title: 'Novo chat',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: initialMessages
    }
}

function getChatTitle(messages = []) {
    const firstUserMessage = messages.find(message => message.role === 'user')?.content
    if (!firstUserMessage) return 'Novo chat'
    return firstUserMessage.replace(/^PRIO,\s*/i, '').slice(0, 42)
}

function tomorrowAt(hour = 18, minute = 0) {
    const date = new Date()
    date.setDate(date.getDate() + 1)
    date.setHours(hour, minute, 0, 0)
    return date.toISOString()
}

function extractRequestedTime(message = '') {
    if (/\bmeio[ -]?dia\b/i.test(message)) return { hour: 12, minute: 0 }

    const hourMatch = message.match(/\b(?:às?|as|ao|pelas?|por volta das?)?\s*(\d{1,2})(?::(\d{2}))?\s*(?:h|horas?)\b/i)
        || message.match(/\b(?:às?|as|ao|pelas?)?\s*(\d{1,2}):(\d{2})\b/i)
    if (!hourMatch) return null

    return {
        hour: Math.max(0, Math.min(23, Number(hourMatch[1]))),
        minute: Math.max(0, Math.min(59, Number(hourMatch[2] || 0)))
    }
}

function hasDeadlineInMessage(message = '') {
    return Boolean(
        extractRequestedTime(message)
        || /\b(hoje|amanh|prazo|até|ate|segunda|terça|terca|quarta|quinta|sexta|sábado|sabado|domingo)\b/i.test(message)
        || /\b\d{1,2}[/-]\d{1,2}(?:[/-]\d{2,4})?\b/.test(message)
    )
}

function normalizeDueDateFromMessage(message = '', modelDueDate = null) {
    if (!hasDeadlineInMessage(message)) return null

    const requestedTime = extractRequestedTime(message)
    if (!requestedTime) return modelDueDate

    let dueDate = modelDueDate ? new Date(modelDueDate) : new Date()
    if (Number.isNaN(dueDate.getTime())) dueDate = new Date()

    const now = new Date()
    if (/amanh/i.test(message)) {
        dueDate = new Date(now)
        dueDate.setDate(now.getDate() + 1)
    } else if (/\bhoje\b/i.test(message) || !modelDueDate) {
        dueDate = new Date(now)
    }

    dueDate.setHours(requestedTime.hour, requestedTime.minute, 0, 0)
    return dueDate.toISOString()
}

function wantsCreateTask(message = '') {
    return /\b(cria|crie|criar|adiciona|adicione|nova tarefa)\b/i.test(message)
}

function wantsResources(message = '') {
    return /\b(link|links|recurso|recursos|vídeo|vídeos|video|videos|youtube|material|materiais|diário de bordo)\b/i.test(message)
}

function wantsStatusChange(message = '') {
    return /\b(estado|status)\b/i.test(message)
        && /\b(a fazer|em progresso|feito|concluíd[ao]|concluir)\b/i.test(message)
}

function cleanTaskTitle(rawTitle = '') {
    return rawTitle
        .replace(/^PRIO,?\s*/i, '')
        .replace(/\b(quero|preciso|podes?|pode|por favor|cria|crie|criar|adiciona|adicione|uma|um|nova|novo|tarefa|task|para)\b/gi, ' ')
        .replace(/\s+/g, ' ')
        .trim()
}

function isGenericTaskTitle(title = '') {
    const normalized = cleanTaskTitle(title).toLowerCase()
    return !normalized || normalized.length < 4 || ['quero', 'criar', 'tarefa', 'nova tarefa', 'nova tarefa criada pelo prio'].includes(normalized)
}

function buildTaskDetailsReply() {
    return [
        'Consigo criar a tarefa, mas preciso do objetivo concreto para não criar uma tarefa genérica.',
        'Responde com: 1) o que deve ser feito, 2) prazo ou urgência, 3) tempo aproximado ou se queres que eu estime.'
    ].join(' ')
}

function normalizePriority(priority) {
    const value = Number(priority)
    if (Number.isNaN(value)) return 3
    return Math.min(5, Math.max(1, value))
}

function normalizeTime(hour, minute = '00') {
    const hourValue = Math.min(23, Math.max(0, Number(hour) || 0))
    const minuteValue = Math.min(59, Math.max(0, Number(minute) || 0))
    return `${String(hourValue).padStart(2, '0')}:${String(minuteValue).padStart(2, '0')}`
}

function extractWorkDays(message) {
    const text = message.toLowerCase()
    if (/segunda\s+a\s+sexta|seg\s+a\s+sex|dias?\s+úteis|semana/.test(text)) {
        return ['Seg', 'Ter', 'Qua', 'Qui', 'Sex']
    }

    const matches = [
        [/segunda|seg\b/, 'Seg'],
        [/terça|terca|ter\b/, 'Ter'],
        [/quarta|qua\b/, 'Qua'],
        [/quinta|qui\b/, 'Qui'],
        [/sexta|sex\b/, 'Sex'],
        [/sábado|sabado|sáb|sab\b/, 'Sáb'],
        [/domingo|dom\b/, 'Dom']
    ]

    const days = matches.filter(([pattern]) => pattern.test(text)).map(([, day]) => day)
    return days.length ? days : WORK_DAYS
}

function buildWorkHoursAction(message) {
    if (!/\b(hor[aá]rio|horarios|disponibilidade|trabalho|agenda|calend[aá]rio)\b/i.test(message)) return null

    const timeRange = message.match(/(?:das|de)\s*(\d{1,2})(?::?(\d{2}))?\s*(?:h)?\s*(?:às|as|até|ate|-|a)\s*(\d{1,2})(?::?(\d{2}))?\s*(?:h)?/i)
    if (!timeRange) return null

    const start = normalizeTime(timeRange[1], timeRange[2] || '00')
    const end = normalizeTime(timeRange[3], timeRange[4] || '00')
    if (start >= end) return null

    const workHours = extractWorkDays(message).reduce((acc, day) => {
        acc[day] = [{ start, end }]
        return acc
    }, {})

    return {
        type: 'update_work_hours',
        work_hours: workHours
    }
}

function summarizeTasks(tasks = []) {
    return tasks.map(task => ({
        id: task.id,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        due_date: task.due_date,
        estimated_minutes: task.estimated_minutes,
        time_spent: task.time_spent,
        completed_at: task.completed_at,
        subtasks_count: task.subtasks?.length || 0
    }))
}

function buildLocalReport(tasks = [], profile = {}) {
    const total = tasks.length
    const done = tasks.filter(task => task.status === 'Feito').length
    const progress = tasks.filter(task => task.status === 'Em Progresso').length
    const overdue = tasks.filter(task => task.status !== 'Feito' && task.due_date && new Date(task.due_date) < new Date()).length
    const highPriority = tasks.filter(task => task.status !== 'Feito' && Number(task.priority) <= 2).length
    const completion = total ? Math.round((done / total) * 100) : 0

    return [
        `Mini relatório: você está no nível ${profile?.level || 1}, com ${profile?.xp || 0} XP.`,
        `Tarefas: ${done}/${total} concluídas (${completion}%).`,
        progress ? `${progress} tarefa(s) em progresso agora.` : 'Nenhuma tarefa está em progresso neste momento.',
        overdue ? `Atenção: ${overdue} tarefa(s) atrasada(s) podem custar XP.` : 'Sem atraso crítico detectado. Boa!',
        highPriority ? `Prioridade: foque nas ${highPriority} tarefa(s) P1/P2 pendentes.` : 'Não vi pendências P1/P2 no topo.'
    ].join(' ')
}

function buildPriorityQuestionsReply(message) {
    if (!/\b(prioridade|priorizar|mais importante|ordem|foco)\b/i.test(message)) return null

    return [
        'Para definir a prioridade com rigor, responde a estas 3 perguntas:',
        '1) Qual é o prazo real e o que acontece se não for feito?',
        '2) Que impacto esta tarefa tem no teu objetivo principal de hoje ou da semana?',
        '3) Quanto tempo/esforço precisa e existe algum bloqueio?',
        'Com isso eu classifico em P1-P5, preparo a ordem de execução, checklist e tempo estimado.'
    ].join(' ')
}

function buildFallbackAction(message) {
    const workHoursAction = buildWorkHoursAction(message)
    if (workHoursAction) return workHoursAction

    const text = message.toLowerCase()
    if (!wantsCreateTask(message)) return null

    const titleMatch = message.match(/(?:para|tarefa)\s+(.+?)(?:\s+amanh[ãa]|\s+hoje|\s+até|\s+prazo|$)/i)
    const extractedTitle = cleanTaskTitle(titleMatch?.[1] || '')
    const title = extractedTitle || cleanTaskTitle(message)
    if (isGenericTaskTitle(title)) return null
    const dueDate = normalizeDueDateFromMessage(
        message,
        /amanh[ãa]/i.test(message) ? tomorrowAt() : null
    )

    return {
        type: 'create_task',
        task: {
            title: title.charAt(0).toUpperCase() + title.slice(1),
            description: 'Tarefa criada por conversa com o PRIO. Ajuste os detalhes manualmente se quiser.',
            priority: text.includes('urgente') || text.includes('crítico') || text.includes('critico') ? 1 : 3,
            estimated_minutes: 30,
            due_date: dueDate,
            checklist: [
                'Confirmar o objetivo da tarefa',
                'Executar a alteração principal',
                'Testar e registrar o resultado'
            ],
            note: 'Nota do PRIO: estimativa e checklist sugeridos automaticamente. Você pode editar tudo manualmente.'
        }
    }
}

function normalizeAction(action) {
    if (!action || typeof action !== 'object') return null
    if (!['create_task', 'update_last_task', 'update_task', 'update_work_hours', 'add_resources'].includes(action.type)) return null

    if (action.type === 'update_work_hours') {
        const workHours = action.work_hours && typeof action.work_hours === 'object' ? action.work_hours : {}
        const normalizedHours = Object.entries(workHours).reduce((acc, [day, slots]) => {
            if (!WORK_DAYS.includes(day) || !Array.isArray(slots)) return acc
            const cleanSlots = slots
                .map(slot => {
                    const [startHour, startMinute = '00'] = String(slot?.start || '').split(':')
                    const [endHour, endMinute = '00'] = String(slot?.end || '').split(':')
                    return {
                        start: normalizeTime(startHour, startMinute),
                        end: normalizeTime(endHour, endMinute)
                    }
                })
                .filter(slot => slot.start < slot.end)
                .slice(0, 3)
            if (cleanSlots.length) acc[day] = cleanSlots
            return acc
        }, {})

        return Object.keys(normalizedHours).length
            ? { type: 'update_work_hours', work_hours: normalizedHours }
            : null
    }

    if (action.type === 'add_resources') {
        const resources = (Array.isArray(action.task?.resources) ? action.task.resources : action.resources || [])
            .filter(resource => /^https?:\/\//i.test(String(resource?.url || '').trim()))
            .slice(0, 6)
        return resources.length ? {
            type: 'add_resources',
            taskId: action.task?.id || action.taskId || null,
            resources
        } : null
    }

    const rawTask = action.task && typeof action.task === 'object' ? action.task : {}
    const isCreateAction = action.type === 'create_task'
    const title = isCreateAction ? (rawTask.title || 'Nova tarefa criada pelo PRIO') : (rawTask.title || null)
    if (isCreateAction && isGenericTaskTitle(title)) return null

    return {
        type: action.type,
        task: {
            id: rawTask.id || null,
            title,
            description: typeof rawTask.description === 'string' ? rawTask.description : (isCreateAction ? '' : null),
            priority: Number.isInteger(Number(rawTask.priority)) ? normalizePriority(rawTask.priority) : (isCreateAction ? 3 : null),
            estimated_minutes: Number(rawTask.estimated_minutes) > 0 ? Number(rawTask.estimated_minutes) : (isCreateAction ? 30 : null),
            due_date: rawTask.due_date || null,
            status: TASK_STATUSES.includes(rawTask.status) ? rawTask.status : null,
            checklist: Array.isArray(rawTask.checklist) ? rawTask.checklist.filter(Boolean).slice(0, 8) : [],
            note: rawTask.note || ''
        }
    }
}

function buildTaskUpdatePayload(task = {}) {
    const updates = {}
    if (task.title) updates.title = task.title
    if (typeof task.description === 'string') updates.description = task.description
    if (task.priority) updates.priority = task.priority
    if (task.estimated_minutes) updates.estimated_minutes = task.estimated_minutes
    if (task.due_date) updates.due_date = task.due_date
    if (TASK_STATUSES.includes(task.status)) updates.status = task.status
    return updates
}

function parseEmbeddedPrioResponse(response) {
    const rawReply = response?.reply
    if (typeof rawReply !== 'string') return response

    const content = rawReply.trim()
    if (!content.startsWith('{') && !content.startsWith('```')) return response

    try {
        const cleanedContent = content
            .replace(/^```(?:json)?\s*/i, '')
            .replace(/\s*```$/, '')
        const firstObject = cleanedContent.match(/\{[\s\S]*\}/)?.[0] || cleanedContent
        let parsed = JSON.parse(firstObject)
        if (typeof parsed === 'string') parsed = JSON.parse(parsed)

        if (parsed && typeof parsed === 'object' && typeof parsed.reply === 'string') {
            return {
                ...response,
                ...parsed,
                action: parsed.action ?? response.action
            }
        }
    } catch {
        return {
            ...response,
            reply: 'Tive um problema técnico a organizar a resposta. Podes enviar a mensagem novamente?'
        }
    }

    return response
}

function normalizePrioResponse(response, message) {
    const parsedResponse = parseEmbeddedPrioResponse(response)
    const rawAction = parsedResponse?.action
    const actionWithResourceIntent = wantsResources(message)
        && rawAction?.task
        && (Array.isArray(rawAction.task.resources) || Array.isArray(rawAction.resources))
        ? { ...rawAction, type: 'add_resources' }
        : rawAction
    let normalizedAction = normalizeAction(actionWithResourceIntent)
    if (normalizedAction?.task) {
        normalizedAction = {
            ...normalizedAction,
            task: {
                ...normalizedAction.task,
                due_date: normalizeDueDateFromMessage(message, normalizedAction.task.due_date)
            }
        }
    }
    if (wantsCreateTask(message) && !normalizedAction) {
        return {
            reply: buildTaskDetailsReply(),
            action: null
        }
    }

    if (wantsResources(message) && !normalizedAction) {
        return {
            ...parsedResponse,
            reply: 'Ainda não consegui identificar a tarefa e os links a adicionar. Indica o nome da tarefa ou pede os recursos para a última tarefa criada.',
            action: null
        }
    }

    if (wantsStatusChange(message) && (!normalizedAction || !normalizedAction.task?.status)) {
        return {
            ...parsedResponse,
            reply: 'Ainda não consegui confirmar a alteração de estado. Indica o nome da tarefa e o estado desejado: A Fazer, Em Progresso ou Feito.',
            action: null
        }
    }

    return {
        ...parsedResponse,
        action: normalizedAction
    }
}

export default function PrioChat({ profile, onProfileUpdate }) {
    const [tasks, setTasks] = useState([])
    const [chats, setChats] = useState(() => {
        if (typeof window === 'undefined') return [createChat()]
        try {
            const saved = JSON.parse(localStorage.getItem(CHAT_STORAGE_KEY) || '[]')
            return Array.isArray(saved) && saved.length ? saved : [createChat()]
        } catch {
            return [createChat()]
        }
    })
    const [activeChatId, setActiveChatId] = useState(() => {
        if (typeof window === 'undefined') return null
        try {
            const saved = JSON.parse(localStorage.getItem(CHAT_STORAGE_KEY) || '[]')
            return Array.isArray(saved) && saved[0]?.id ? saved[0].id : null
        } catch {
            return null
        }
    })
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const [lastCreatedTask, setLastCreatedTask] = useState(null)
    const messagesEndRef = useRef(null)

    const activeChat = useMemo(() => chats.find(chat => chat.id === activeChatId) || chats[0] || createChat(), [activeChatId, chats])
    const messages = activeChat.messages || initialMessages

    useEffect(() => {
        if (!activeChatId && chats[0]?.id) setActiveChatId(chats[0].id)
    }, [activeChatId, chats])

    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(chats.slice(0, 12)))
        }
    }, [chats])

    const stats = useMemo(() => {
        const total = tasks.length
        const done = tasks.filter(task => task.status === 'Feito').length
        const progress = tasks.filter(task => task.status === 'Em Progresso').length
        const overdue = tasks.filter(task => task.status !== 'Feito' && task.due_date && new Date(task.due_date) < new Date()).length
        return { total, done, progress, overdue }
    }, [tasks])

    const loadTasks = useCallback(async () => {
        const data = await TaskService.getTasks()
        setTasks(data || [])
        return data || []
    }, [])

    useEffect(() => {
        loadTasks().catch(error => console.error('Error loading PRIO tasks:', error))
    }, [loadTasks])

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    function updateActiveChatMessages(updater, chatId = activeChat.id) {
        setChats(prev => prev.map(chat => {
            if (chat.id !== chatId) return chat
            const nextMessages = typeof updater === 'function' ? updater(chat.messages || initialMessages) : updater
            return {
                ...chat,
                title: getChatTitle(nextMessages),
                updatedAt: new Date().toISOString(),
                messages: nextMessages
            }
        }))
    }

    function handleNewChat() {
        const chat = createChat()
        setChats(prev => [chat, ...prev].slice(0, 12))
        setActiveChatId(chat.id)
        setInput('')
    }

    const applyAction = async (rawAction) => {
        const action = normalizeAction(rawAction)
        if (!action) return null

        if (action.type === 'create_task') {
            const created = await TaskService.createTask({
                title: action.task.title,
                description: action.task.description,
                priority: action.task.priority,
                status: 'A Fazer',
                estimated_minutes: action.task.estimated_minutes,
                due_date: action.task.due_date
            })

            for (const item of action.task.checklist) {
                await TaskService.createChecklistItem(created.id, item)
            }

            if (action.task.note) {
                await TaskService.createNote(created.id, action.task.note)
            }

            setLastCreatedTask(created)
            await loadTasks()

            const dueText = created.due_date
                ? ` · prazo ${new Intl.DateTimeFormat('pt-PT', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(created.due_date))}`
                : ''

            return `Tarefa criada: "${created.title}" · P${created.priority} · ${created.estimated_minutes || 30}min${dueText}.`
        }

        if (action.type === 'update_work_hours') {
            const currentPreferences = profile?.['preferências'] || {}
            const currentWorkHours = currentPreferences.work_hours || {}
            const nextPreferences = {
                ...currentPreferences,
                work_hours: {
                    ...currentWorkHours,
                    ...action.work_hours
                }
            }

            await ProfileService.updateProfile({ preferências: nextPreferences })
            await onProfileUpdate?.()

            const days = Object.entries(action.work_hours)
                .map(([day, slots]) => `${day} ${slots.map(slot => `${slot.start}-${slot.end}`).join(', ')}`)
                .join('; ')

            return `Horários de trabalho atualizados: ${days}. O cronograma automático passa a usar esta disponibilidade.`
        }

        if (action.type === 'add_resources' && action.taskId) {
            const added = []
            const journalLines = []
            for (const resource of action.resources) {
                try {
                    await ResourceService.createResource(action.taskId, resource.url, resource.title || '')
                    added.push(resource.title || resource.url)
                } catch (err) {
                    console.error('Error adding resource:', err)
                }
                journalLines.push(`- ${resource.title || 'Recurso'}: ${resource.url}`)
            }

            await TaskService.createNote(action.taskId, `Recursos adicionados pelo PRIO:\n${journalLines.join('\n')}`)
            await loadTasks()
            return `Adicionei ${action.resources.length} link(s) ao Diário de Bordo: ${action.resources.map(resource => resource.title || resource.url).join(', ')}.`
        }

        if (action.type === 'update_last_task' && lastCreatedTask?.id) {
            const updates = buildTaskUpdatePayload(action.task)
            if (Object.keys(updates).length === 0) return null
            const updated = await TaskService.updateTask(lastCreatedTask.id, updates)

            for (const item of action.task.checklist) {
                await TaskService.createChecklistItem(updated.id, item)
            }

            if (action.task.note) {
                await TaskService.createNote(updated.id, action.task.note)
            }

            setLastCreatedTask(updated)
            await loadTasks()
            return `Atualizei a última tarefa: "${updated.title}".`
        }

        if (action.type === 'update_task' && action.task?.id) {
            const updates = buildTaskUpdatePayload(action.task)
            if (Object.keys(updates).length === 0) return null
            const updated = await TaskService.updateTask(action.task.id, updates)

            for (const item of action.task.checklist) {
                await TaskService.createChecklistItem(updated.id, item)
            }

            if (action.task.note) {
                await TaskService.createNote(updated.id, action.task.note)
            }

            await loadTasks()
            return `Atualizei a tarefa solicitada: "${updated.title || 'Sem título'}".`
        }

        return null
    }

    const sendMessage = async (forcedMessage) => {
        const message = (forcedMessage || input).trim()
        if (!message || loading) return

        const chatId = activeChat.id

        setInput('')
        setLoading(true)
        updateActiveChatMessages(prev => [...prev, { role: 'user', content: message }], chatId)

        try {
            const taskSnapshot = await loadTasks()
            let response

            try {
                response = await AIService.prioChat({
                    message,
                    tasks: summarizeTasks(taskSnapshot),
                    profile,
                    capabilities: ['create_task', 'update_last_task', 'update_task', 'update_work_hours', 'add_resources', 'suggest_schedule', 'report_productivity'],
                    history: messages.slice(-8),
                    last_created_task: lastCreatedTask
                })
            } catch (error) {
                const fallbackAction = buildFallbackAction(message)
                const priorityReply = buildPriorityQuestionsReply(message)
                const fallbackReply = fallbackAction?.type === 'update_work_hours'
                    ? 'Consigo atualizar esse horário agora. Como o backend da IA não respondeu, usei o modo local e apliquei a disponibilidade no seu perfil.'
                    : fallbackAction
                        ? 'Consigo criar isso agora mesmo. Como o backend da IA não respondeu, usei meu modo local: sugeri checklist, nota e estimativa automática.'
                        : priorityReply || buildLocalReport(taskSnapshot, profile)
                response = {
                    reply: fallbackReply,
                    action: fallbackAction
                }
                if (!fallbackAction && wantsCreateTask(message)) {
                    response = {
                        reply: buildTaskDetailsReply(),
                        action: null
                    }
                }
                console.warn('PRIO local fallback:', error)
            }

            response = normalizePrioResponse(response, message)
            updateActiveChatMessages(prev => [...prev, { role: 'assistant', content: response.reply || buildLocalReport(taskSnapshot, profile) }], chatId)
            const actionResult = await applyAction(response.action)
            if (actionResult) {
                updateActiveChatMessages(prev => [...prev, { role: 'assistant', content: actionResult }], chatId)
            }
        } catch (error) {
            updateActiveChatMessages(prev => [...prev, { role: 'assistant', content: `Não consegui concluir agora: ${error.message}` }], chatId)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="grid grid-cols-1 gap-4 overflow-visible pb-24 sm:gap-6 sm:pb-0 xl:grid-cols-[minmax(0,1fr)_360px]">
            <section className="flex h-[calc(100dvh-250px)] min-h-[420px] min-w-0 flex-col overflow-hidden rounded-[28px] border border-white/80 bg-white/90 shadow-[0_18px_45px_rgba(17,24,39,0.06)] backdrop-blur-xl sm:h-auto sm:min-h-[620px]">
                <div className="flex flex-col gap-3 border-b border-slate-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                    <div className="flex items-center gap-3">
                        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-(--color-prioriza-blue) text-white shadow-sm sm:h-12 sm:w-12">
                            <Bot className="h-6 w-6" />
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-xl font-bold text-slate-900">PRIO</h2>
                            <p className="line-clamp-2 text-xs font-bold text-slate-500 sm:text-sm">Assistente pessoal de tarefas e produtividade</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={handleNewChat}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-(--color-prioriza-blue) px-4 py-2 text-xs font-black text-white shadow-sm sm:w-auto"
                    >
                        <MessageSquarePlus className="h-4 w-4" />
                        Novo chat
                    </button>
                </div>

                <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-5 sm:px-5 sm:py-6">
                    {messages.map((message, index) => (
                        <div key={`${message.role}-${index}`} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[88%] rounded-xl px-4 py-3 text-sm leading-relaxed shadow-sm sm:max-w-[82%] ${message.role === 'user' ? 'bg-(--color-prioriza-blue) text-white' : 'border border-slate-100 bg-white text-slate-700'}`}>
                                <p className="whitespace-pre-wrap font-medium">{message.content}</p>
                            </div>
                        </div>
                    ))}

                    {loading && (
                        <div className="flex justify-start">
                            <div className="flex items-center gap-2 rounded-xl border border-slate-100 bg-white px-4 py-3 text-sm font-bold text-slate-500 shadow-sm">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                PRIO está pensando...
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <div className="shrink-0 border-t border-slate-100 bg-slate-50/70 p-3 sm:p-4">
                    <div className="mb-3 flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible">
                        {quickPrompts.map(prompt => (
                            <button
                                key={prompt}
                                type="button"
                                onClick={() => sendMessage(prompt)}
                                className="shrink-0 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:border-[rgba(30,58,138,0.28)] hover:text-(--color-prioriza-blue)"
                            >
                                {prompt.replace('PRIO, ', '')}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-end gap-2 sm:gap-3">
                        <textarea
                            value={input}
                            onChange={event => setInput(event.target.value)}
                            onKeyDown={event => {
                                if (event.key === 'Enter' && !event.shiftKey) {
                                    event.preventDefault()
                                    sendMessage()
                                }
                            }}
                            placeholder=""
                            className="min-h-14 max-h-20 min-w-0 flex-1 resize-none rounded-2xl border border-slate-400 shadow-sm bg-white px-4 py-3 text-sm font-medium outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20"
                        />
                        <button
                            type="button"
                            onClick={() => sendMessage()}
                            disabled={loading || !input.trim()}
                            className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-(--color-prioriza-blue) text-white shadow-sm transition disabled:cursor-not-allowed disabled:opacity-50"
                            aria-label="Enviar mensagem para o PRIO"
                        >
                            <Send className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </section>

            <aside className="min-w-0 space-y-4 pb-6 lg:pb-0">
                <div className="rounded-[28px] border border-white/80 bg-white/90 p-5 shadow-[0_18px_45px_rgba(17,24,39,0.06)] backdrop-blur-xl">
                    <div className="mb-4 flex items-center justify-between gap-2">
                        <h3 className="font-bold text-slate-900">Histórico</h3>
                        <span className="rounded-full bg-[rgba(30,58,138,0.10)] px-2 py-1 text-[10px] font-black text-(--color-prioriza-blue)">{chats.length}</span>
                    </div>
                    <div className="max-h-56 space-y-2 overflow-y-auto">
                        {chats.map(chat => (
                            <button
                                key={chat.id}
                                type="button"
                                onClick={() => setActiveChatId(chat.id)}
                                className={`w-full rounded-2xl px-3 py-2 text-left text-xs font-bold transition ${chat.id === activeChat.id ? 'bg-[rgba(30,58,138,0.12)] text-(--color-prioriza-blue)' : 'bg-white/70 text-slate-600 hover:bg-white'}`}
                            >
                                <span className="block truncate">{chat.title}</span>
                                <span className="mt-0.5 block text-[10px] font-semibold text-slate-400">
                                    {new Date(chat.updatedAt).toLocaleDateString('pt-PT')}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="rounded-[28px] border border-white/80 bg-white/90 p-5 shadow-[0_18px_45px_rgba(17,24,39,0.06)] backdrop-blur-xl">
                    <div className="mb-4 flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-blue-600" />
                        <h3 className="font-bold text-slate-900">Resumo</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-2xl bg-[rgba(30,58,138,0.10)] p-4">
                            <p className="text-[10px] font-black uppercase text-slate-500">Total</p>
                            <p className="text-2xl font-black text-slate-900">{stats.total}</p>
                        </div>
                        <div className="rounded-2xl bg-[rgba(30,58,138,0.10)] p-4">
                            <p className="text-[10px] font-black uppercase text-slate-500">Feitas</p>
                            <p className="text-2xl font-black text-slate-900">{stats.done}</p>
                        </div>
                        <div className="rounded-2xl bg-[rgba(30,58,138,0.10)] p-4">
                            <p className="text-[10px] font-black uppercase text-slate-500">Foco</p>
                            <p className="text-2xl font-black text-slate-900">{stats.progress}</p>
                        </div>
                        <div className="rounded-2xl bg-[rgba(30,58,138,0.10)] p-4">
                            <p className="text-[10px] font-black uppercase text-slate-500">Atrasos</p>
                            <p className="text-2xl font-black text-slate-900">{stats.overdue}</p>
                        </div>
                    </div>
                </div>

                <div className="rounded-[28px] border border-white/80 bg-white/90 p-5 shadow-[0_18px_45px_rgba(17,24,39,0.06)] backdrop-blur-xl">
                    <div className="mb-4 flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-blue-600" />
                        <h3 className="font-bold text-slate-900">PRIO ajuda com</h3>
                    </div>
                    <div className="space-y-3 text-sm font-medium text-slate-600">
                        <p className="flex gap-2"><CheckCircle2 className="h-4 w-4 shrink-0 text-blue-600" /> Produtividade e XP.</p>
                        <p className="flex gap-2"><Plus className="h-4 w-4 shrink-0 text-blue-600" /> Tarefas por conversa.</p>
                        <p className="flex gap-2"><CalendarClock className="h-4 w-4 shrink-0 text-blue-600" /> Prazos e cronograma.</p>
                        <p className="flex gap-2"><Clock className="h-4 w-4 shrink-0 text-blue-600" /> Estimativas editáveis.</p>
                    </div>
                </div>
            </aside>
        </div>
    )
}
