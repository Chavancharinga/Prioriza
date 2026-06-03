import { useState, useEffect, useMemo } from 'react'
import { BarChart3, TrendingUp, Clock, CheckCircle2, Target, Activity } from 'lucide-react'
import { TaskService } from '../services/TaskService'
import Skeleton from '../components/ui/Skeleton'

const priorityLabels = { 1: 'Crítica', 2: 'Alta', 3: 'Média', 4: 'Baixa', 5: 'Mínima' }
const priorityColors = {
    1: { bg: 'bg-rose-600', light: 'bg-rose-100', text: 'text-rose-700' },
    2: { bg: 'bg-red-500', light: 'bg-red-100', text: 'text-red-600' },
    3: { bg: 'bg-orange-500', light: 'bg-orange-100', text: 'text-orange-700' },
    4: { bg: 'bg-yellow-500', light: 'bg-yellow-100', text: 'text-yellow-700' },
    5: { bg: 'bg-blue-500', light: 'bg-blue-100', text: 'text-blue-700' },
}

export default function Analytics() {
    const [tasks, setTasks] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadTasks()
    }, [])

    async function loadTasks() {
        try {
            const tasksData = await TaskService.getTasks()
            setTasks(tasksData || [])
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
        return (
            <div className="space-y-6 lg:space-y-8">
                {/* KPI Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                    {[...Array(5)].map((_, i) => (
                        <Skeleton.Card key={i} className="p-5">
                            <div className="flex items-center gap-3 mb-3">
                                <Skeleton.Circle size="h-9 w-9" className="rounded-xl" />
                                <Skeleton className="h-4 w-12" />
                            </div>
                            <Skeleton className="h-7 w-16 mb-1" />
                        </Skeleton.Card>
                    ))}
                </div>

                {/* Main Charts area */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Chart 1 skeleton */}
                    <Skeleton.Card className="h-80">
                        <Skeleton className="h-5 w-44 mb-6" />
                        <div className="flex items-end justify-between h-48 px-4">
                            {[...Array(5)].map((_, i) => (
                                <Skeleton key={i} className="w-12 rounded-t-md" style={{ height: `${20 + i * 15}%` }} />
                            ))}
                        </div>
                    </Skeleton.Card>

                    {/* Chart 2 skeleton */}
                    <Skeleton.Card className="h-80">
                        <Skeleton className="h-5 w-32 mb-6" />
                        <div className="space-y-4">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="space-y-2">
                                    <div className="flex justify-between">
                                        <Skeleton className="h-3.5 w-16" />
                                        <Skeleton className="h-3.5 w-8" />
                                    </div>
                                    <Skeleton className="h-2 w-full" />
                                </div>
                            ))}
                        </div>
                    </Skeleton.Card>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6 lg:space-y-8">
            {/* label placeholder aria-label */}
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

                {/* Telemetry Dashboard: Planned vs Actual */}
                <div className="bg-white rounded-[24px] sm:rounded-[32px] p-6 lg:p-8 shadow-[0_2px_40px_-10px_rgba(0,0,0,0.05)] col-span-1 xl:col-span-2">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Telemetria de Tempo: Planejado vs. Executado</h3>
                    <p className="text-xs text-gray-400 mb-6">Comparação direta por prioridade (P1 a P5) entre estimativa teórica e ciclos Pomodoro concluídos.</p>

                    <div className="space-y-6">
                        {[1, 2, 3, 4, 5].map(p => {
                            // Calculate estimated vs actual minutes directly from tasks to avoid view duplication bugs
                            const estimatedMin = Math.round(
                                tasks
                                    .filter(t => t.priority === p)
                                    .reduce((acc, t) => acc + (t.estimated_minutes || 0), 0)
                            )
                            const actualMin = Math.round(
                                tasks
                                    .filter(t => t.priority === p)
                                    .reduce((acc, t) => acc + (t.time_spent || 0), 0) / 60
                            )
                            
                            // Find the max value across all priorities for scaling (minimum of 60 minutes)
                            const allPrioritiesMax = [1, 2, 3, 4, 5].map(pr => {
                                const est = tasks.filter(t => t.priority === pr).reduce((acc, t) => acc + (t.estimated_minutes || 0), 0)
                                const act = tasks.filter(t => t.priority === pr).reduce((acc, t) => acc + (t.time_spent || 0), 0) / 60
                                return Math.max(est, act)
                            })
                            const maxVal = Math.max(...allPrioritiesMax, 60)
                            
                            const estWidth = `${Math.min(100, (estimatedMin / maxVal) * 100)}%`
                            const actWidth = `${Math.min(100, (actualMin / maxVal) * 100)}%`
                            const colors = priorityColors[p]

                            return (
                                <div key={p} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center border-b border-neutral-50 pb-4 last:border-0 last:pb-0">
                                    <div className="md:col-span-3 flex items-center gap-2">
                                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${colors?.light} ${colors?.text}`}>
                                            P{p}
                                        </span>
                                        <span className="text-xs font-bold text-gray-600 truncate">{priorityLabels[p]}</span>
                                    </div>
                                    <div className="md:col-span-9 space-y-1.5">
                                        {/* Estimated Bar */}
                                        <div className="flex items-center gap-2">
                                            <div className="h-2.5 bg-blue-50 rounded-full flex-1 overflow-hidden">
                                                <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: estWidth }} />
                                            </div>
                                            <span className="text-[10px] font-bold text-blue-600 w-12 text-right">{estimatedMin}m</span>
                                        </div>
                                        {/* Actual Bar */}
                                        <div className="flex items-center gap-2">
                                            <div className="h-2.5 bg-emerald-50 rounded-full flex-1 overflow-hidden">
                                                <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: actWidth }} />
                                            </div>
                                            <span className="text-[10px] font-bold text-emerald-600 w-12 text-right">{actualMin}m</span>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                    <div className="flex flex-wrap justify-end gap-6 mt-6 border-t border-neutral-100 pt-4">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-blue-500 rounded" />
                            <span className="text-xs font-semibold text-gray-500">Tempo Planejado (Estimado)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-emerald-500 rounded" />
                            <span className="text-xs font-semibold text-gray-500">Tempo Executado (Foco Logado)</span>
                        </div>
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
