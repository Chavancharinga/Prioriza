import { useState, useEffect, useMemo } from 'react'
import { TrendingUp, Clock, CheckCircle2, Target, Activity, Trophy, Award } from 'lucide-react'
import { TaskService } from '../services/TaskService'
import Skeleton from '../components/ui/Skeleton'

const priorityLabels = { 1: 'Crítica', 2: 'Alta', 3: 'Média', 4: 'Baixa', 5: 'Mínima' }
const priorityColors = {
    1: { bg: 'bg-red-600', light: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
    2: { bg: 'bg-orange-500', light: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
    3: { bg: 'bg-amber-400', light: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
    4: { bg: 'bg-lime-500', light: 'bg-lime-50', text: 'text-lime-700', border: 'border-lime-200' },
    5: { bg: 'bg-green-500', light: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
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
                {/* Header Skeleton */}
                <div className="space-y-2">
                    <Skeleton className="h-8 w-64 rounded-xl" />
                    <Skeleton className="h-4 w-96 rounded-lg" />
                </div>

                {/* KPI Cards Skeleton */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="card-3d p-5 flex flex-col justify-between h-32">
                            <div className="flex items-center justify-between mb-4">
                                <Skeleton className="h-4 w-16" />
                                <Skeleton.Circle size="h-8 w-8" className="rounded-xl" />
                            </div>
                            <Skeleton className="h-8 w-12" />
                        </div>
                    ))}
                </div>

                {/* Main Charts area Skeleton */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
                    <div className="card-3d p-6 lg:p-8 h-96 flex flex-col justify-between">
                        <Skeleton className="h-6 w-40 mb-6" />
                        <div className="flex justify-center items-center my-auto">
                            <Skeleton.Circle size="h-40 w-40" />
                        </div>
                        <div className="grid grid-cols-3 gap-3 mt-4">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="p-2.5 rounded-2xl border-2 border-slate-200 bg-slate-50 flex flex-col items-center justify-center">
                                    <Skeleton className="h-3 w-12 mb-1" />
                                    <Skeleton className="h-5 w-6" />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="card-3d p-6 lg:p-8 h-96 flex flex-col justify-between">
                        <Skeleton className="h-6 w-48 mb-6" />
                        <div className="space-y-5 my-auto">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="space-y-2">
                                    <div className="flex justify-between">
                                        <Skeleton className="h-4 w-24" />
                                        <Skeleton className="h-4 w-12" />
                                    </div>
                                    <Skeleton className="h-4 w-full rounded-full" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6 lg:space-y-8">
            {/* Header */}
            <div>
                <p className="text-sm font-bold text-slate-600">
                    Acompanhe suas estatísticas de produtividade e telemetria de tempo.
                </p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {[
                    { label: 'Total', value: stats.total, icon: Target, iconBg: 'bg-blue-50', iconColor: 'text-blue-500' },
                    { label: 'Concluídas', value: stats.done, icon: CheckCircle2, iconBg: 'bg-emerald-50', iconColor: 'text-emerald-500' },
                    { label: 'Em Progresso', value: stats.inProgress, icon: Activity, iconBg: 'bg-orange-50', iconColor: 'text-orange-500' },
                    { label: 'Atrasadas', value: stats.overdue, icon: Clock, iconBg: 'bg-rose-50', iconColor: 'text-rose-500' },
                    { label: 'Últimos 7 dias', value: stats.recentlyCompleted, icon: TrendingUp, iconBg: 'bg-cyan-50', iconColor: 'text-cyan-500' },
                ].map((kpi, i) => {
                    const Icon = kpi.icon
                    return (
                        <div key={i} className="card-3d p-5 flex flex-col justify-between">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wider">{kpi.label}</span>
                                <div className={`w-8 h-8 rounded-xl ${kpi.iconBg} flex items-center justify-center border-2 border-slate-100`}>
                                    <Icon className={`w-4 h-4 ${kpi.iconColor}`} />
                                </div>
                            </div>
                            <div>
                                <div className="text-3xl font-black text-[#3C3C3C] tracking-tight">{kpi.value}</div>
                            </div>
                        </div>
                    )
                })}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
                {/* Completion Rate */}
                <div className="card-3d p-6 lg:p-8">
                    <h3 className="text-xl font-black text-[#3C3C3C] tracking-tight mb-6 flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-yellow-500" /> Taxa de Conclusão
                    </h3>

                    <div className="flex items-center justify-center mb-8">
                        <div className="relative w-40 h-40">
                            {/* SVG Circle */}
                            <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                                <circle cx="60" cy="60" r="52" fill="none" stroke="#f3f4f6" strokeWidth="12" />
                                <circle
                                    cx="60" cy="60" r="52" fill="none"
                                    stroke="#1E3A8A" strokeWidth="12"
                                    strokeLinecap="round"
                                    strokeDasharray={`${2 * Math.PI * 52}`}
                                    strokeDashoffset={`${2 * Math.PI * 52 * (1 - stats.completionRate / 100)}`}
                                    className="transition-all duration-1000"
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <Trophy className="w-6 h-6 text-yellow-500 mb-0.5 animate-bounce" style={{ animationDuration: '3s' }} />
                                <span className="text-3xl font-black text-[#3C3C3C]">{stats.completionRate}%</span>
                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Completo</span>
                            </div>
                        </div>
                    </div>

                    {/* Status Breakdown */}
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { label: 'A Fazer', value: stats.todo },
                            { label: 'Foco', value: stats.inProgress },
                            { label: 'Feito', value: stats.done },
                        ].map((s, i) => (
                            <div key={i} className="rounded-2xl border border-[rgba(30,58,138,0.24)] bg-[rgba(30,58,138,0.08)] p-2.5 text-center shadow-[0_2px_0_rgba(0,0,0,0.03)]">
                                <span className="block text-[10px] font-extrabold uppercase tracking-wider text-(--color-prioriza-blue)">{s.label}</span>
                                <span className="text-xl font-black text-[#3C3C3C] mt-0.5 block">{s.value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Priority Distribution */}
                <div className="card-3d p-6 lg:p-8">
                    <h3 className="text-xl font-black text-[#3C3C3C] tracking-tight mb-6 flex items-center gap-2">
                        <Award className="w-5 h-5 text-orange-500" /> Distribuição por Prioridade
                    </h3>

                    <div className="space-y-5">
                        {stats.byPriority.map(p => {
                            const maxCount = Math.max(...stats.byPriority.map(x => x.count), 1)
                            const percentage = (p.count / maxCount) * 100
                            const colors = priorityColors[p.priority]

                            return (
                                <div key={p.priority}>
                                    <div className="flex justify-between items-center mb-1.5">
                                        <div className="flex items-center gap-2">
                                            <span className={`text-xs font-black px-2 py-0.5 rounded-full border-2 ${colors?.border} ${colors?.text} bg-white shadow-[0_2px_0_rgba(0,0,0,0.03)]`}>
                                                P{p.priority}
                                            </span>
                                            <span className="text-sm font-extrabold text-[#3C3C3C]">{p.label}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                                            <span>{p.count} total</span>
                                            <span className="text-gray-300">•</span>
                                            <span className="text-emerald-600">{p.doneCount} feitas</span>
                                        </div>
                                    </div>
                                    <div className="h-4 bg-gray-100 border-2 border-gray-200 rounded-full overflow-hidden shadow-inner">
                                        <div
                                            className={`h-full rounded-full ${colors.bg} border-r-2 border-black/10 transition-all duration-700`}
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Telemetry Dashboard: Planned vs Actual */}
                <div className="card-3d p-6 lg:p-8 col-span-1 xl:col-span-2">
                    <h3 className="text-xl font-black text-[#3C3C3C] tracking-tight mb-1 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-blue-500" /> Telemetria de Tempo: Planejado vs. Executado
                    </h3>
                    <p className="text-xs font-bold text-gray-400 mb-6">Comparação direta por prioridade entre estimativa teórica e ciclos concluídos.</p>

                    <div className="space-y-6">
                        {[1, 2, 3, 4, 5].map(p => {
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
                                <div key={p} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                                    <div className="md:col-span-3 flex items-center gap-2">
                                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border-2 ${colors?.border} ${colors?.text} bg-white shadow-[0_2px_0_rgba(0,0,0,0.03)]`}>
                                            P{p}
                                        </span>
                                        <span className="text-xs font-extrabold text-[#3C3C3C] truncate">{priorityLabels[p]}</span>
                                    </div>
                                    <div className="md:col-span-9 space-y-2">
                                        {/* Estimated Bar */}
                                        <div className="flex items-center gap-3">
                                            <div className="h-3.5 bg-blue-50 border-2 border-blue-100 rounded-full flex-1 overflow-hidden shadow-inner">
                                                <div className="h-full bg-blue-500 border-r-2 border-black/10 rounded-full transition-all duration-500" style={{ width: estWidth }} />
                                            </div>
                                            <span className="text-xs font-black text-blue-600 w-14 text-right">{estimatedMin}m</span>
                                        </div>
                                        {/* Actual Bar */}
                                        <div className="flex items-center gap-3">
                                            <div className="h-3.5 bg-emerald-50 border-2 border-emerald-100 rounded-full flex-1 overflow-hidden shadow-inner">
                                                <div className="h-full bg-emerald-500 border-r-2 border-black/10 rounded-full transition-all duration-500" style={{ width: actWidth }} />
                                            </div>
                                            <span className="text-xs font-black text-emerald-600 w-14 text-right">{actualMin}m</span>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                    <div className="flex flex-wrap justify-end gap-6 mt-6 border-t border-slate-100 pt-4">
                        <div className="flex items-center gap-2 bg-blue-50/50 px-3 py-1.5 rounded-xl border border-blue-100">
                            <div className="w-3.5 h-3.5 bg-blue-500 rounded border border-blue-600" />
                            <span className="text-xs font-extrabold text-blue-700">Tempo Planejado (Estimado)</span>
                        </div>
                        <div className="flex items-center gap-2 bg-emerald-50/50 px-3 py-1.5 rounded-xl border border-emerald-100">
                            <div className="w-3.5 h-3.5 bg-emerald-500 rounded border border-emerald-600" />
                            <span className="text-xs font-extrabold text-emerald-700">Tempo Executado (Foco Logado)</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Row: Time & Performance */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="card-3d p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-9 h-9 bg-blue-50 border-2 border-blue-100 rounded-xl flex items-center justify-center">
                            <Clock className="w-4 h-4 text-blue-500" />
                        </div>
                        <h3 className="text-base font-extrabold text-[#3C3C3C]">Tempo Médio por Tarefa</h3>
                    </div>
                    <div className="text-4xl font-black text-[#3C3C3C] mb-1">
                        {formatSeconds(stats.avgTimeSpent)}
                    </div>
                    <p className="text-xs font-bold text-gray-400 mt-2">
                        Baseado em {tasks.filter(t => t.status === 'Feito' && t.time_spent > 0).length} tarefa(s) com tempo registrado.
                    </p>
                </div>

                <div className="card-3d p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-9 h-9 bg-emerald-50 border-2 border-emerald-100 rounded-xl flex items-center justify-center">
                            <TrendingUp className="w-4 h-4 text-emerald-500" />
                        </div>
                        <h3 className="text-base font-extrabold text-[#3C3C3C]">Produtividade Recente</h3>
                    </div>
                    <div className="text-4xl font-black text-[#3C3C3C] mb-1">
                        {stats.recentlyCompleted}
                    </div>
                    <p className="text-xs font-bold text-gray-400 mt-2">
                        Tarefas concluídas com sucesso nos últimos 7 dias.
                    </p>
                </div>
            </div>
        </div>
    )
}
