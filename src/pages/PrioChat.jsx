import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Bot, CalendarClock, CheckCircle2, Clock, Loader2, Plus, Send, Trophy } from 'lucide-react'
import { AIService } from '../services/AIService'
import { TaskService } from '../services/TaskService'

const quickPrompts = [
    'PRIO, faz um mini relatório da minha produtividade.',
    'PRIO, quais tarefas estão mais urgentes agora?',
    'PRIO, cria uma tarefa para revisar meu código com defeito amanhã.',
]

const initialMessages = [
    {
        role: 'assistant',
        content: 'Olá, eu sou o PRIO. Posso analisar suas tarefas, resumir produtividade e criar tarefas por conversa.'
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
        `Mini relatório: nível ${profile?.level || 1}, ${profile?.xp || 0} XP.`,
        `Progresso: ${done}/${total} tarefas concluídas (${completion}%).`,
        progress ? `${progress} tarefa(s) em foco agora.` : 'Nenhuma tarefa em foco agora.',
        overdue ? `${overdue} tarefa(s) atrasada(s) precisam de atenção.` : 'Sem atrasos críticos.',
        highPriority ? `Prioridade: foque nas ${highPriority} tarefa(s) P1/P2.` : 'Sem P1/P2 pendente no topo.'
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
                'Confirmar o objetivo',
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
                        ? 'Consigo criar isso agora. Usei o modo local: checklist, nota e estimativa sugeridos.'
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
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
            <section className="card-3d overflow-hidden bg-white/95">
                <div className="flex flex-col gap-3 border-b border-slate-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                    <div className="flex items-center gap-3">
                        <div className="grid h-11 w-11 place-items-center rounded-2xl border border-slate-200 bg-slate-50 text-blue-600">
                            <Bot className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-950">PRIO</h2>
                            <p className="text-sm font-semibold text-slate-500">Seu assistente de tarefas</p>
                        </div>
                    </div>
                    <span className="w-fit rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-black text-slate-600">IA pronta</span>
                </div>

                <div className="h-[58vh] min-h-[420px] space-y-4 overflow-y-auto px-4 py-5 sm:px-5">
                    {messages.map((message, index) => (
                        <div key={`${message.role}-${index}`} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[86%] rounded-3xl px-4 py-3 text-sm leading-relaxed shadow-sm ${message.role === 'user'
                                ? 'bg-slate-950 text-white'
                                : 'border border-slate-200 bg-white text-slate-700'
                                }`}>
                                <p className="whitespace-pre-wrap font-semibold">{message.content}</p>
                            </div>
                        </div>
                    ))}

                    {loading && (
                        <div className="flex justify-start">
                            <div className="flex items-center gap-2 rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-500 shadow-sm">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                PRIO está pensando...
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <div className="border-t border-slate-100 bg-slate-50/80 p-4">
                    <div className="mb-3 flex flex-wrap gap-2">
                        {quickPrompts.map(prompt => (
                            <button
                                key={prompt}
                                type="button"
                                onClick={() => sendMessage(prompt)}
                                className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-extrabold text-slate-600 transition hover:border-slate-300 hover:text-slate-950"
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
                            placeholder="Peça um relatório, cronograma ou nova tarefa..."
                            className="min-h-14 flex-1 resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                        />
                        <button
                            type="button"
                            onClick={() => sendMessage()}
                            disabled={loading || !input.trim()}
                            className="grid h-14 w-14 place-items-center rounded-2xl bg-slate-950 text-white shadow-[0_4px_0_#020617] transition hover:bg-slate-800 active:translate-y-1 active:shadow-none disabled:cursor-not-allowed disabled:opacity-50"
                            aria-label="Enviar mensagem para o PRIO"
                        >
                            <Send className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </section>

            <aside className="space-y-4">
                <div className="card-3d bg-white/95 p-5">
                    <div className="mb-4 flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-blue-600" />
                        <h3 className="font-black text-slate-950">Resumo</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            ['Total', stats.total],
                            ['Feitas', stats.done],
                            ['Foco', stats.progress],
                            ['Atrasos', stats.overdue],
                        ].map(([label, value]) => (
                            <div key={label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                <p className="text-[10px] font-black uppercase tracking-wide text-slate-500">{label}</p>
                                <p className="text-2xl font-black text-slate-950">{value}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="card-3d bg-white/95 p-5">
                    <h3 className="mb-4 font-black text-slate-950">Comandos úteis</h3>
                    <div className="space-y-3 text-sm font-bold text-slate-600">
                        <p className="flex gap-2"><CheckCircle2 className="h-4 w-4 shrink-0 text-blue-600" /> Relatórios curtos de produtividade.</p>
                        <p className="flex gap-2"><Plus className="h-4 w-4 shrink-0 text-blue-600" /> Criação de tarefa por conversa.</p>
                        <p className="flex gap-2"><CalendarClock className="h-4 w-4 shrink-0 text-blue-600" /> Prazos como hoje ou amanhã.</p>
                        <p className="flex gap-2"><Clock className="h-4 w-4 shrink-0 text-blue-600" /> Estimativas editáveis.</p>
                    </div>
                </div>
            </aside>
        </div>
    )
}
