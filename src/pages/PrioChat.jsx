import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Bot, CalendarClock, CheckCircle2, Clock, Loader2, Plus, Send, Sparkles, Trophy } from 'lucide-react'
import { AIService } from '../services/AIService'
import { TaskService } from '../services/TaskService'

const quickPrompts = [
    'PRIO, faz um mini relatório da minha produtividade.',
    'PRIO, quais tarefas estão mais urgentes agora?',
    'PRIO, cria uma tarefa para revisar meu código com defeito amanhã.',
    'PRIO, organiza meu cronograma automático para hoje.'
]

const initialMessages = [
    {
        role: 'assistant',
        content: 'Olá, eu sou o PRIO. Posso analisar suas tarefas, montar um mini relatório, sugerir checklist e criar tarefas por conversa.'
    }
]

function tomorrowAt(hour = 18, minute = 0) {
    const date = new Date()
    date.setDate(date.getDate() + 1)
    date.setHours(hour, minute, 0, 0)
    return date.toISOString()
}

function normalizePriority(priority) {
    const value = Number(priority)
    if (Number.isNaN(value)) return 3
    return Math.min(5, Math.max(1, value))
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

function buildFallbackAction(message) {
    const text = message.toLowerCase()
    const wantsCreate = /\b(cria|crie|criar|adiciona|adicione|nova tarefa)\b/i.test(message)
    if (!wantsCreate) return null

    const titleMatch = message.match(/(?:para|tarefa)\s+(.+?)(?:\s+amanh[ãa]|\s+hoje|\s+até|\s+prazo|$)/i)
    const extractedTitle = titleMatch?.[1]?.trim()
    const title = extractedTitle || message.replace(/prio,?/i, '').replace(/crie|cria|criar|uma tarefa|nova tarefa/gi, '').trim() || 'Nova tarefa criada pelo PRIO'
    const dueDate = /amanh[ãa]/i.test(message) ? tomorrowAt() : null

    return {
        type: 'create_task',
        task: {
            title: title.charAt(0).toUpperCase() + title.slice(1),
            description: 'Tarefa criada por conversa com o PRIO. Ajuste os detalhes manualmente se quiser.',
            priority: text.includes('urgente') || text.includes('crítico') || text.includes('critico') ? 1 : 3,
            estimated_minutes: text.includes('rápido') || text.includes('rapido') ? 30 : 60,
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
    if (!['create_task', 'update_last_task'].includes(action.type)) return null

    return {
        type: action.type,
        task: {
            title: action.task?.title || 'Nova tarefa criada pelo PRIO',
            description: action.task?.description || '',
            priority: normalizePriority(action.task?.priority),
            estimated_minutes: Number(action.task?.estimated_minutes) || 60,
            due_date: action.task?.due_date || null,
            checklist: Array.isArray(action.task?.checklist) ? action.task.checklist.filter(Boolean).slice(0, 8) : [],
            note: action.task?.note || ''
        }
    }
}

export default function PrioChat({ profile }) {
    const [tasks, setTasks] = useState([])
    const [messages, setMessages] = useState(initialMessages)
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const [lastCreatedTask, setLastCreatedTask] = useState(null)
    const messagesEndRef = useRef(null)

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

            return `Tarefa criada: "${created.title}" · P${created.priority} · ${created.estimated_minutes || 60}min${dueText}.`
        }

        if (action.type === 'update_last_task' && lastCreatedTask?.id) {
            const updated = await TaskService.updateTask(lastCreatedTask.id, {
                title: action.task.title || lastCreatedTask.title,
                description: action.task.description || lastCreatedTask.description,
                priority: action.task.priority,
                estimated_minutes: action.task.estimated_minutes,
                due_date: action.task.due_date
            })

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

        return null
    }

    const sendMessage = async (forcedMessage) => {
        const message = (forcedMessage || input).trim()
        if (!message || loading) return

        setInput('')
        setLoading(true)
        setMessages(prev => [...prev, { role: 'user', content: message }])

        try {
            const taskSnapshot = await loadTasks()
            let response

            try {
                response = await AIService.prioChat({
                    message,
                    tasks: summarizeTasks(taskSnapshot),
                    profile,
                    history: messages.slice(-8),
                    last_created_task: lastCreatedTask
                })
            } catch (error) {
                const fallbackAction = buildFallbackAction(message)
                response = {
                    reply: fallbackAction
                        ? 'Consigo criar isso agora mesmo. Como o backend da IA não respondeu, usei meu modo local: sugeri checklist, nota e estimativa automática.'
                        : buildLocalReport(taskSnapshot, profile),
                    action: fallbackAction
                }
                console.warn('PRIO local fallback:', error)
            }

            setMessages(prev => [...prev, { role: 'assistant', content: response.reply || buildLocalReport(taskSnapshot, profile) }])
            const actionResult = await applyAction(response.action)
            if (actionResult) {
                setMessages(prev => [...prev, { role: 'assistant', content: actionResult }])
            }
        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', content: `Não consegui concluir agora: ${error.message}` }])
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_360px]">
            <section className="overflow-hidden rounded-[28px] border border-white/80 bg-white/90 shadow-[0_18px_45px_rgba(17,24,39,0.06)] backdrop-blur-xl">
                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                    <div className="flex items-center gap-3">
                        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-600 text-white shadow-sm">
                            <Bot className="h-6 w-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">PRIO</h2>
                            <p className="text-sm font-bold text-slate-500">Assistente pessoal de tarefas e produtividade</p>
                        </div>
                    </div>
                    <span className="hidden rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600 sm:inline-flex">IA pronta</span>
                </div>

                <div className="h-[58vh] min-h-[430px] space-y-4 overflow-y-auto px-5 py-6">
                    {messages.map((message, index) => (
                        <div key={`${message.role}-${index}`} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[82%] rounded-[24px] px-4 py-3 text-sm leading-relaxed shadow-sm ${message.role === 'user' ? 'bg-blue-600 text-white' : 'border border-slate-100 bg-white text-slate-700'}`}>
                                <p className="whitespace-pre-wrap font-medium">{message.content}</p>
                            </div>
                        </div>
                    ))}

                    {loading && (
                        <div className="flex justify-start">
                            <div className="flex items-center gap-2 rounded-[24px] border border-slate-100 bg-white px-4 py-3 text-sm font-bold text-slate-500 shadow-sm">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                PRIO está pensando...
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <div className="border-t border-slate-100 bg-slate-50/70 p-4">
                    <div className="mb-3 flex flex-wrap gap-2">
                        {quickPrompts.map(prompt => (
                            <button
                                key={prompt}
                                type="button"
                                onClick={() => sendMessage(prompt)}
                                className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:border-blue-200 hover:text-blue-600"
                            >
                                {prompt.replace('PRIO, ', '')}
                            </button>
                        ))}
                    </div>

                    <div className="flex gap-3">
                        <textarea
                            value={input}
                            onChange={event => setInput(event.target.value)}
                            onKeyDown={event => {
                                if (event.key === 'Enter' && !event.shiftKey) {
                                    event.preventDefault()
                                    sendMessage()
                                }
                            }}
                            placeholder="Ex: PRIO, crie uma tarefa para corrigir uma função do meu código amanhã."
                            className="min-h-14 flex-1 resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                        />
                        <button
                            type="button"
                            onClick={() => sendMessage()}
                            disabled={loading || !input.trim()}
                            className="grid h-14 w-14 place-items-center rounded-2xl bg-blue-600 text-white shadow-sm transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                            aria-label="Enviar mensagem para o PRIO"
                        >
                            <Send className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </section>

            <aside className="space-y-4">
                <div className="rounded-[28px] border border-white/80 bg-white/90 p-5 shadow-[0_18px_45px_rgba(17,24,39,0.06)] backdrop-blur-xl">
                    <div className="mb-4 flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-blue-600" />
                        <h3 className="font-bold text-slate-900">Resumo</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-2xl bg-blue-50 p-4">
                            <p className="text-[10px] font-black uppercase text-slate-500">Total</p>
                            <p className="text-2xl font-black text-slate-900">{stats.total}</p>
                        </div>
                        <div className="rounded-2xl bg-emerald-50 p-4">
                            <p className="text-[10px] font-black uppercase text-slate-500">Feitas</p>
                            <p className="text-2xl font-black text-slate-900">{stats.done}</p>
                        </div>
                        <div className="rounded-2xl bg-amber-50 p-4">
                            <p className="text-[10px] font-black uppercase text-slate-500">Foco</p>
                            <p className="text-2xl font-black text-slate-900">{stats.progress}</p>
                        </div>
                        <div className="rounded-2xl bg-rose-50 p-4">
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
