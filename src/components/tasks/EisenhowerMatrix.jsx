import { useMemo } from 'react'
import { AlertTriangle, Calendar, Clock, Target, ArrowDown, Trash2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const URGENCY_HOURS = 48 // Task is "urgent" if due within this window

function classifyTask(task) {
    const now = new Date()
    const isImportant = task.priority <= 2 // P1 or P2
    let isUrgent = false

    if (task.due_date) {
        const due = new Date(task.due_date)
        const hoursLeft = (due - now) / (1000 * 60 * 60)
        isUrgent = hoursLeft <= URGENCY_HOURS || hoursLeft < 0
    }

    // In Progress tasks are considered urgent (user committed to them)
    if (task.status === 'Em Progresso') isUrgent = true

    if (isImportant && isUrgent) return 'do'       // Q1: Do First
    if (isImportant && !isUrgent) return 'schedule' // Q2: Schedule
    if (!isImportant && isUrgent) return 'delegate'  // Q3: Delegate
    return 'eliminate'                                // Q4: Eliminate
}

const quadrants = [
    {
        key: 'do',
        label: 'FAZER JÁ',
        description: 'Urgente + Importante',
        icon: AlertTriangle,
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        headerBg: 'bg-red-500',
        dotColor: 'bg-red-500',
    },
    {
        key: 'schedule',
        label: 'AGENDAR',
        description: 'Importante, sem pressa',
        icon: Calendar,
        color: 'text-amber-600',
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-200',
        headerBg: 'bg-amber-500',
        dotColor: 'bg-amber-500',
    },
    {
        key: 'delegate',
        label: 'DELEGAR',
        description: 'Urgente, pouca importância',
        icon: ArrowDown,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        headerBg: 'bg-blue-500',
        dotColor: 'bg-blue-500',
    },
    {
        key: 'eliminate',
        label: 'ELIMINAR',
        description: 'Nem urgente, nem importante',
        icon: Trash2,
        color: 'text-slate-400',
        bgColor: 'bg-gray-50',
        borderColor: 'border-(--color-border)',
        headerBg: 'bg-gray-400',
        dotColor: 'bg-gray-400',
    },
]

const priorityColors = {
    1: 'bg-rose-600',
    2: 'bg-red-500',
    3: 'bg-orange-500',
    4: 'bg-yellow-500',
    5: 'bg-blue-500',
}

const priorityLabels = { 1: 'P1', 2: 'P2', 3: 'P3', 4: 'P4', 5: 'P5' }

export default function EisenhowerMatrix({ tasks, onTaskClick }) {
    const classified = useMemo(() => {
        const activeTasks = tasks.filter(t => t.status !== 'Feito')
        const result = { do: [], schedule: [], delegate: [], eliminate: [] }

        activeTasks.forEach(task => {
            const quadrant = classifyTask(task)
            result[quadrant].push(task)
        })

        // Sort each quadrant by priority then due date
        Object.keys(result).forEach(key => {
            result[key].sort((a, b) => {
                if (a.priority !== b.priority) return a.priority - b.priority
                if (a.due_date && b.due_date) return new Date(a.due_date) - new Date(b.due_date)
                if (a.due_date) return -1
                if (b.due_date) return 1
                return 0
            })
        })

        return result
    }, [tasks])

    const totalActive = Object.values(classified).reduce((sum, arr) => sum + arr.length, 0)

    return (
        <div className="space-y-4">
            {/* Legend bar */}
            <div className="flex flex-wrap gap-3 items-center text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                <span>Eixo Vertical: Importância (P1-P2 = Alta)</span>
                <span className="text-gray-300">|</span>
                <span>Eixo Horizontal: Urgência (prazo ≤ 48h = Urgente)</span>
                <span className="text-gray-300">|</span>
                <span>{totalActive} tarefas ativas</span>
            </div>

            {/* Matrix Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quadrants.map((q, qi) => {
                    const Icon = q.icon
                    const items = classified[q.key]

                    return (
                        <motion.div
                            key={q.key}
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: qi * 0.05 }}
                            className={`rounded-2xl border ${q.borderColor} overflow-hidden ${q.bgColor} flex flex-col min-h-[200px]`}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between px-4 py-3">
                                <div className="flex items-center gap-2">
                                    <div className={`p-1.5 rounded-lg ${q.headerBg} bg-opacity-15`}>
                                        <Icon className={`w-4 h-4 ${q.color}`} />
                                    </div>
                                    <div>
                                        <h3 className={`text-xs font-black tracking-wider ${q.color}`}>{q.label}</h3>
                                        <p className="text-[9px] text-gray-400 font-medium">{q.description}</p>
                                    </div>
                                </div>
                                <span className={`text-xs font-black ${q.color} opacity-60`}>{items.length}</span>
                            </div>

                            {/* Tasks */}
                            <div className="flex-1 px-3 pb-3 space-y-1.5 overflow-y-auto max-h-[300px]">
                                {items.length === 0 ? (
                                    <div className="flex items-center justify-center h-20 text-[10px] text-gray-400 font-medium">
                                        Nenhuma tarefa
                                    </div>
                                ) : (
                                    <AnimatePresence>
                                        {items.map((task, i) => {
                                            const isOverdue = task.due_date && new Date(task.due_date) < new Date()
                                            const daysLeft = task.due_date 
                                                ? Math.ceil((new Date(task.due_date) - new Date()) / (1000 * 60 * 60 * 24))
                                                : null

                                            return (
                                                <motion.div
                                                    key={task.id}
                                                    initial={{ opacity: 0, y: 5 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: i * 0.02 }}
                                                    onClick={() => onTaskClick?.(task)}
                                                    className={`flex items-center gap-3 bg-[#111A2C]/80 backdrop-blur-xl/80 backdrop-blur-md rounded-xl px-3 py-2.5 cursor-pointer shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/5/50 transition-all hover:shadow-md hover:-translate-y-px ${isOverdue ? 'ring-1 ring-red-300' : ''}`}
                                                >
                                                    <div className={`w-2 h-2 rounded-full shrink-0 ${priorityColors[task.priority] || 'bg-gray-400'}`} />
                                                    
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs font-semibold text-gray-800 truncate">{task.title}</p>
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            <span className="text-[9px] font-bold text-gray-400">{priorityLabels[task.priority]}</span>
                                                            {task.estimated_minutes > 0 && (
                                                                <span className="text-[9px] text-gray-400 flex items-center gap-0.5">
                                                                    <Clock className="w-2.5 h-2.5" />{task.estimated_minutes}m
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {daysLeft !== null && (
                                                        <span className={`text-[9px] font-bold shrink-0 ${
                                                            isOverdue ? 'text-red-500' :
                                                            daysLeft === 0 ? 'text-amber-600' :
                                                            daysLeft <= 3 ? 'text-orange-500' :
                                                            'text-gray-400'
                                                        }`}>
                                                            {isOverdue ? `${Math.abs(daysLeft)}d atrás` :
                                                             daysLeft === 0 ? 'Hoje' :
                                                             daysLeft === 1 ? 'Amanhã' :
                                                             `${daysLeft}d`}
                                                        </span>
                                                    )}
                                                </motion.div>
                                            )
                                        })}
                                    </AnimatePresence>
                                )}
                            </div>
                        </motion.div>
                    )
                })}
            </div>
        </div>
    )
}
