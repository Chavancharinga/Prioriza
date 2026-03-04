import { useState, useEffect, useMemo } from 'react'
import { BarChart3, TrendingUp, Clock, CheckCircle2, Target, Activity } from 'lucide-react'
import { TaskService } from '../services/TaskService'

const priorityLabels = { 1: 'Crítica', 2: 'Alta', 3: 'Média', 4: 'Baixa', 5: 'Mínima' }
const priorityColors = {
    1: { bg: 'bg-red-500', light: 'bg-red-100', text: 'text-red-700' },
    2: { bg: 'bg-orange-500', light: 'bg-orange-100', text: 'text-orange-700' },
    3: { bg: 'bg-yellow-500', light: 'bg-yellow-100', text: 'text-yellow-700' },
    4: { bg: 'bg-blue-500', light: 'bg-blue-100', text: 'text-blue-700' },
    5: { bg: 'bg-green-500', light: 'bg-green-100', text: 'text-green-700' },
}

export default function Analytics() {
    const [tasks, setTasks] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadTasks()
    }, [])

    async function loadTasks() {
        try {
            const data = await TaskService.getTasks()
            setTasks(data || [])
        } catch (err) {
            console.error('Error loading analytics data:', err)
        } finally {
            setLoading(false)
        }
    }

    const stats = useMemo(() => {
        const total = tasks.length
        const done = tasks.filter(t => t.status === 'Feito').length
        const inProgress = tasks.filter(t => t.status === 'Em Progresso').length
        const todo = tasks.filter(t => t.status === 'A Fazer').length
        const completionRate = total > 0 ? Math.round((done / total) * 100) : 0

        // Priority distribution
        const byPriority = [1, 2, 3, 4, 5].map(p => ({
            priority: p,
            label: priorityLabels[p],
            count: tasks.filter(t => t.priority === p).length,
            doneCount: tasks.filter(t => t.priority === p && t.status === 'Feito').length,
        }))

        // Completed in last 7 days
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
        const recentlyCompleted = tasks.filter(t =>
            t.status === 'Feito' && t.completed_at && new Date(t.completed_at) >= sevenDaysAgo
        ).length

        // Average time spent (on completed tasks with time_spent > 0)
        const completedWithTime = tasks.filter(t => t.status === 'Feito' && t.time_spent > 0)
        const avgTimeSpent = completedWithTime.length > 0
            ? Math.round(completedWithTime.reduce((acc, t) => acc + t.time_spent, 0) / completedWithTime.length)
            : 0

        // Overdue tasks
        const now = new Date()
        const overdue = tasks.filter(t =>
            t.status !== 'Feito' && t.due_date && new Date(t.due_date) < now
        ).length

        return { total, done, inProgress, todo, completionRate, byPriority, recentlyCompleted, avgTimeSpent, overdue }
    }, [tasks])

    function formatSeconds(seconds) {
        if (!seconds) return '0m'
        const h = Math.floor(seconds / 3600)
        const m = Math.floor((seconds % 3600) / 60)
        if (h > 0) return `${h}h ${m}m`
        return `${m}m`
    }

    if (loading) {
        return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
    }

    return (
        <div className="space-y-6 lg:space-y-8">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {[
                    { label: 'Total', value: stats.total, icon: Target, iconBg: 'bg-blue-50', iconColor: 'text-blue-600' },
                    { label: 'Concluídas', value: stats.done, icon: CheckCircle2, iconBg: 'bg-green-50', iconColor: 'text-green-600' },
                    { label: 'Em Progresso', value: stats.inProgress, icon: Activity, iconBg: 'bg-amber-50', iconColor: 'text-amber-600' },
                    { label: 'Atrasadas', value: stats.overdue, icon: Clock, iconBg: 'bg-red-50', iconColor: 'text-red-600' },
                    { label: 'Últimos 7 dias', value: stats.recentlyCompleted, icon: TrendingUp, iconBg: 'bg-cyan-50', iconColor: 'text-cyan-600' },
                ].map((kpi, i) => {
                    const Icon = kpi.icon
                    return (
                        <div key={i} className="bg-white rounded-[20px] p-5 shadow-[0_2px_30px_-5px_rgba(0,0,0,0.03)]">
                            <div className="flex items-center gap-3 mb-3">
                                <div className={`w-9 h-9 rounded-xl ${kpi.iconBg} flex items-center justify-center`}>
                                    <Icon className={`w-4 h-4 ${kpi.iconColor}`} />
                                </div>
                            </div>
                            <div className="text-2xl font-black text-gray-900">{kpi.value}</div>
                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-1">{kpi.label}</div>
                        </div>
                    )
                })}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
                {/* Completion Rate */}
                <div className="bg-white rounded-[24px] sm:rounded-[32px] p-6 lg:p-8 shadow-[0_2px_40px_-10px_rgba(0,0,0,0.05)]">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Taxa de Conclusão</h3>

                    <div className="flex items-center justify-center mb-8">
                        <div className="relative w-40 h-40">
                            {/* SVG Circle */}
                            <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                                <circle cx="60" cy="60" r="52" fill="none" stroke="#f3f4f6" strokeWidth="12" />
                                <circle
                                    cx="60" cy="60" r="52" fill="none"
                                    stroke="#3b82f6" strokeWidth="12"
                                    strokeLinecap="round"
                                    strokeDasharray={`${2 * Math.PI * 52}`}
                                    strokeDashoffset={`${2 * Math.PI * 52 * (1 - stats.completionRate / 100)}`}
                                    className="transition-all duration-1000"
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-3xl font-black text-gray-900">{stats.completionRate}%</span>
                                <span className="text-[10px] text-gray-400 font-bold uppercase">Completo</span>
                            </div>
                        </div>
                    </div>

                    {/* Status Breakdown */}
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { label: 'A Fazer', value: stats.todo, color: 'bg-gray-200' },
                            { label: 'Em Progresso', value: stats.inProgress, color: 'bg-blue-500' },
                            { label: 'Feito', value: stats.done, color: 'bg-green-500' },
                        ].map((s, i) => (
                            <div key={i} className="text-center">
                                <div className="flex items-center justify-center gap-1.5 mb-1">
                                    <div className={`w-2 h-2 rounded-full ${s.color}`} />
                                    <span className="text-[10px] font-bold text-gray-500 uppercase">{s.label}</span>
                                </div>
                                <span className="text-lg font-bold text-gray-900">{s.value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Priority Distribution */}
                <div className="bg-white rounded-[24px] sm:rounded-[32px] p-6 lg:p-8 shadow-[0_2px_40px_-10px_rgba(0,0,0,0.05)]">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Distribuição por Prioridade</h3>

                    <div className="space-y-5">
                        {stats.byPriority.map(p => {
                            const maxCount = Math.max(...stats.byPriority.map(x => x.count), 1)
                            const percentage = (p.count / maxCount) * 100
                            const colors = priorityColors[p.priority]

                            return (
                                <div key={p.priority}>
                                    <div className="flex justify-between items-center mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${colors.light} ${colors.text}`}>
                                                P{p.priority}
                                            </span>
                                            <span className="text-sm font-medium text-gray-700">{p.label}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <span className="font-bold">{p.count}</span>
                                            <span className="text-gray-300">|</span>
                                            <span className="text-green-600">{p.doneCount} feitas</span>
                                        </div>
                                    </div>
                                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${colors.bg} transition-all duration-700`}
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>

            {/* Bottom Row: Time & Performance */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-white rounded-[24px] p-6 shadow-[0_2px_40px_-10px_rgba(0,0,0,0.05)]">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-blue-50 rounded-xl">
                            <Clock className="w-5 h-5 text-blue-600" />
                        </div>
                        <h3 className="text-sm font-bold text-gray-900">Tempo Médio por Tarefa</h3>
                    </div>
                    <div className="text-3xl font-black text-gray-900 mb-1">
                        {formatSeconds(stats.avgTimeSpent)}
                    </div>
                    <p className="text-xs text-gray-400">
                        Baseado em {tasks.filter(t => t.status === 'Feito' && t.time_spent > 0).length} tarefa(s) concluída(s) com tempo registrado
                    </p>
                </div>

                <div className="bg-white rounded-[24px] p-6 shadow-[0_2px_40px_-10px_rgba(0,0,0,0.05)]">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-green-50 rounded-xl">
                            <TrendingUp className="w-5 h-5 text-green-600" />
                        </div>
                        <h3 className="text-sm font-bold text-gray-900">Produtividade Recente</h3>
                    </div>
                    <div className="text-3xl font-black text-gray-900 mb-1">
                        {stats.recentlyCompleted}
                    </div>
                    <p className="text-xs text-gray-400">
                        Tarefas concluídas nos últimos 7 dias
                    </p>
                </div>
            </div>
        </div>
    )
}
