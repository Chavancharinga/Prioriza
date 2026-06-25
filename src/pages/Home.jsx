import { useState, useEffect } from 'react'
import { Calendar, CheckCircle2, Plus, Lightbulb, Star, Trophy } from 'lucide-react'
import { TaskService } from '../services/TaskService'
import Button from '../components/ui/Button'
import TaskModal from '../components/tasks/TaskModal'
import TaskDetailsModal from '../components/tasks/TaskDetailsModal'
import Skeleton from '../components/ui/Skeleton'
import ConfirmationModal from '../components/ui/ConfirmationModal'

export default function Home({ profile, onNavigate }) {
    const [tasks, setTasks] = useState([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [stats, setStats] = useState({
        todo: 0,
        inProgress: 0,
        done: 0,
        total: 0
    })

    // Details Modal
    const [isDetailsOpen, setIsDetailsOpen] = useState(false)
    const [selectedTaskId, setSelectedTaskId] = useState(null)
    const [feedback, setFeedback] = useState({ isOpen: false, title: '', message: '', type: 'info' })

    useEffect(() => {
        loadData()
    }, [])

    async function loadData() {
        try {
            const data = await TaskService.getTasks()
            setTasks(data || [])

            // Calculate stats
            const s = {
                todo: data.filter(t => t.status === 'A Fazer').length,
                inProgress: data.filter(t => t.status === 'Em Progresso').length,
                done: data.filter(t => t.status === 'Feito').length,
                total: data.length
            }
            setStats(s)
        } catch (err) {
            console.error('Error loading home data:', err)
        } finally {
            setLoading(false)
        }
    }

    async function handleCreateTask(taskData) {
        try {
            await TaskService.createTask(taskData)
            setIsModalOpen(false)
            loadData() // Reload to update stats and timeline
            setFeedback({
                isOpen: true,
                type: 'success',
                title: 'Tarefa Criada!',
                message: 'A sua tarefa foi adicionada com sucesso e o lembrete programado.'
            })
        } catch (err) {
            console.error('Error creating task:', err)
            setFeedback({
                isOpen: true,
                type: 'danger',
                title: 'Falha ao criar tarefa',
                message: err.message || 'Não foi possível criar a tarefa. Tente novamente.'
            })
        }
    }

    function handleTaskClick(task) {
        setSelectedTaskId(task.id)
        setIsDetailsOpen(true)
    }

    // Get tasks that are due today or overdue and not completed
    const todayTasks = tasks.filter(t => {
        if (!t.due_date) return false
        const d = new Date(t.due_date)
        const today = new Date()
        d.setHours(0, 0, 0, 0)
        today.setHours(0, 0, 0, 0)
        return d.getTime() === today.getTime() || (d.getTime() < today.getTime() && t.status !== 'Feito')
    })

    // Get upcoming tasks for today (sorted by priority)
    const upcomingTasks = todayTasks
        .filter(t => t.status !== 'Feito')
        .sort((a, b) => a.priority - b.priority)

    const priorityColors = {
        1: { bg: 'bg-red-600', text: 'text-red-600', border: 'border-red-600' },
        2: { bg: 'bg-orange-500', text: 'text-orange-500', border: 'border-orange-500' },
        3: { bg: 'bg-amber-400', text: 'text-amber-600', border: 'border-amber-400' },
        4: { bg: 'bg-lime-500', text: 'text-lime-600', border: 'border-lime-500' },
        5: { bg: 'bg-green-500', text: 'text-green-600', border: 'border-green-500' }
    }

    if (loading) {
        return (
            <div className="grid grid-cols-12 gap-6 lg:gap-8 h-full pb-10">
                {/* Top action button skeleton */}
                <div className="col-span-12 flex justify-end">
                    <Skeleton className="h-10 w-48 rounded-xl" />
                </div>

                {/* LEFT COLUMN: banner, timeline & kanban */}
                <div className="col-span-12 xl:col-span-9 flex flex-col gap-6 lg:gap-8">

                    {/* Timeline Card */}
                    <Skeleton.Card className="p-4 sm:p-6 lg:p-8 shadow-[0_2px_40px_-10px_rgba(0,0,0,0.05)] rounded-[24px] sm:rounded-[32px] lg:rounded-[40px]">
                        <Skeleton className="h-5 w-36 mb-6" />
                        <div className="space-y-5">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="space-y-2">
                                    <div className="flex justify-between">
                                        <Skeleton className="h-3.5 w-1/3" />
                                        <Skeleton className="h-3 w-12" />
                                    </div>
                                    <Skeleton className="h-2 w-full" />
                                </div>
                            ))}
                        </div>
                    </Skeleton.Card>

                    {/* Kanban Columns (Preview) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
                        {['A Fazer', 'Em Progresso', 'Feito'].map((status) => (
                            <div key={status} className="flex flex-col gap-3">
                                <Skeleton className="h-4 w-24 mx-auto lg:mx-0 mb-1" />
                                {[...Array(2)].map((_, cardIndex) => (
                                    <Skeleton.Card key={cardIndex} className="p-5 shadow-[0_2px_20px_-5px_rgba(0,0,0,0.03)] rounded-[20px]">
                                        <div className="flex justify-between items-start mb-3">
                                            <Skeleton className="h-4 w-8 rounded-full" />
                                            <Skeleton className="h-3.5 w-12" />
                                        </div>
                                        <Skeleton.Text lines={2} className="mb-4" />
                                        <Skeleton className="h-1.5 w-full" />
                                    </Skeleton.Card>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>

                {/* RIGHT COLUMN: stats */}
                <div className="col-span-12 xl:col-span-3 flex flex-col sm:flex-row xl:flex-col gap-6 lg:pt-4">
                    {/* Overview Widget */}
                    <div className="flex-1 xl:flex-none w-full">
                        <Skeleton className="h-4 w-24 mb-4 pl-2" />
                        <Skeleton.Card className="p-6 shadow-[0_2px_30px_-5px_rgba(0,0,0,0.03)] rounded-[30px] space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Skeleton.Circle size="h-10 w-10" />
                                    <Skeleton className="h-4 w-12" />
                                </div>
                                <Skeleton className="h-6 w-6" />
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Skeleton.Circle size="h-10 w-10" />
                                    <Skeleton className="h-4 w-16" />
                                </div>
                                <Skeleton className="h-6 w-6" />
                            </div>
                        </Skeleton.Card>
                    </div>

                    {/* Performance Widget */}
                    <div className="flex-1 xl:flex-none w-full">
                        <Skeleton className="h-4 w-44 mb-4 pl-2" />
                        <Skeleton.Card className="p-6 shadow-[0_2px_30px_-5px_rgba(0,0,0,0.03)] rounded-[30px] space-y-4">
                            {[...Array(2)].map((_, i) => (
                                <div key={i} className="space-y-2 border-b border-(--color-border-light) pb-3 last:border-0 last:pb-0">
                                    <div className="flex justify-between">
                                        <Skeleton className="h-4 w-28" />
                                        <Skeleton className="h-4 w-12" />
                                    </div>
                                    <div className="flex justify-between">
                                        <Skeleton className="h-3 w-12" />
                                        <Skeleton className="h-3 w-10" />
                                    </div>
                                    <Skeleton className="h-1.5 w-full" />
                                </div>
                            ))}
                        </Skeleton.Card>
                    </div>
                </div>
            </div>
        )
    }


    return (
        <div className="grid grid-cols-12 gap-6 lg:gap-8 h-full pb-10 relative">
            {/* Header / Quick Action Row */}
            <div className="col-span-12 flex justify-end">
                <Button variant="primary" onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 shrink-0">
                    <Plus className="w-5 h-5" />
                    <span>Nova Tarefa</span>
                </Button>
            </div>

            {/* LEFT COLUMN: Daily Quests & Kanban */}
            <div className="col-span-12 xl:col-span-9 flex flex-col gap-6 lg:gap-8">

                {/* Missões Diárias (XP & Progresso) */}
                <div className="card-3d p-5 sm:p-6 lg:p-8 relative overflow-hidden">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2.5">
                            <Trophy className="w-5.5 h-5.5 text-blue-500" />
                            <h3 className="text-lg font-black text-(--color-text-primary)">Missões de Hoje</h3>
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 bg-slate-100 border-2 border-slate-200 px-3 py-1 rounded-xl">
                            {upcomingTasks.length} Pendentes
                        </span>
                    </div>

                    {upcomingTasks.length === 0 ? (
                        <div className="text-center py-10 flex flex-col items-center gap-3">
                            <CheckCircle2 className="w-12 h-12 text-emerald-500 animate-bounce" />
                            <p className="font-black text-slate-500 text-sm">Todas as missões concluídas por hoje! Bom trabalho!</p>
                        </div>
                    ) : (
                        <div className="max-h-[398px] space-y-3.5 overflow-y-auto pr-1">
                            {upcomingTasks.map((task) => {
                                const xpReward = (6 - (task.priority || 3)) * 20
                                const shieldColor = {
                                    1: 'bg-red-50 text-red-700 border-red-200',
                                    2: 'bg-orange-50 text-orange-700 border-orange-200',
                                    3: 'bg-amber-50 text-amber-700 border-amber-200',
                                    4: 'bg-lime-50 text-lime-700 border-lime-200',
                                    5: 'bg-green-50 text-green-700 border-green-200',
                                }[task.priority] || 'bg-slate-50 text-slate-600 border-slate-200'

                                return (
                                    <div
                                        key={task.id}
                                        onClick={() => handleTaskClick(task)}
                                        className="flex items-center justify-between p-3.5 bg-white border-2 border-slate-100 hover:border-slate-300 rounded-2xl cursor-pointer transition-all duration-150 hover:-translate-y-0.5 active:translate-y-0 shadow-2xs"
                                    >
                                        <div className="flex items-center gap-3.5 min-w-0">
                                            {/* Checkbox Icon */}
                                            <div className="w-5 h-5 rounded-lg border-2 border-slate-300 flex items-center justify-center shrink-0 hover:border-blue-500 transition-colors">
                                                <div className="w-2.5 h-2.5 rounded-sm bg-transparent" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-black text-slate-700 truncate">{task.title}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-lg border ${shieldColor}`}>
                                                        P{task.priority}
                                                    </span>
                                                    {task.due_date && (
                                                        <span className="text-[10px] text-slate-400 font-bold">
                                                            {new Date(task.due_date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* XP reward badge */}
                                        <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-xl text-amber-600 font-black text-xs shrink-0 shadow-3xs">
                                            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                                            <span>+{xpReward} XP</span>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>

                {/* Kanban Section (Preview) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
                    {['A Fazer', 'Em Progresso', 'Feito'].map((status) => {
                        const statusTasks = todayTasks.filter(t => t.status === status)

                        return (
                            <div key={status} className="flex flex-col gap-3">
                                <h4 className="text-[9px] font-black text-(--color-text-muted) uppercase tracking-widest text-center lg:text-left pl-1">{status}</h4>

                                <div className="max-h-[588px] space-y-3 overflow-y-auto pr-1">
                                {statusTasks.map((task) => (
                                    <div
                                        key={task.id}
                                        onClick={() => handleTaskClick(task)}
                                        className="card-3d p-5 cursor-pointer hover:-translate-y-1 transition-all duration-300"
                                        title="Clique para abrir o espaço de trabalho (Pomodoro, Notas, Checklists)"
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full bg-(--color-surface-elevated) ${priorityColors[task.priority]?.text || 'text-(--color-text-muted)'}`}>
                                                P{task.priority}
                                            </span>
                                            {task.due_date && (
                                                <span className="text-[10px] font-bold text-gray-400">
                                                    {new Date(task.due_date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) }
                                                </span>
                                            )}
                                        </div>

                                        <p className="text-[11px] font-bold text-(--color-text-secondary) mb-4 line-clamp-2">{task.title}</p>

                                        <div className="flex items-center gap-3 text-(--color-text-muted)">
                                            <div className="h-1.5 flex-1 bg-(--color-surface-elevated) rounded-full overflow-hidden">
                                                <div
                                                    className="h-full rounded-full bg-(--color-prioriza-blue)"
                                                    style={{ width: `${task.status === 'Feito' ? 100 : (task.progress || 0)}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {statusTasks.length === 0 && (
                                    <div className="text-center py-5 text-xs font-bold text-(--color-text-muted) border-2 border-dashed border-(--color-border) rounded-2xl bg-white/50">
                                        Vazio
                                    </div>
                                )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* RIGHT COLUMN: Stats */}
            <div className="col-span-12 xl:col-span-3 flex flex-col sm:flex-row xl:flex-col gap-6 pt-0 lg:pt-4">

                {/* 2. Overview Widget */}
                <div className="flex-1 xl:flex-none">
                    <h3 className="text-sm font-bold text-(--color-text-primary) mb-4 pl-2">Progresso de Tarefas</h3>
                    <div className="card-3d p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-blue-50 border-2 border-blue-100 flex items-center justify-center text-blue-600">
                                    <Calendar className="w-5 h-5" />
                                </div>
                                <span className="text-xs font-black text-slate-500 uppercase tracking-wide">Total</span>
                            </div>
                            <span className="text-lg font-black text-(--color-text-primary)">{stats.total}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-emerald-50 border-2 border-emerald-100 flex items-center justify-center text-emerald-600">
                                    <CheckCircle2 className="w-5 h-5" />
                                </div>
                                <span className="text-xs font-black text-slate-500 uppercase tracking-wide">Concluídas</span>
                            </div>
                            <span className="text-lg font-black text-(--color-text-primary)">{stats.done}</span>
                        </div>
                    </div>
                </div>

                {/* 3. Performance Widget */}
                <div className="flex-1 xl:flex-none">
                    <h3 className="text-sm font-bold text-(--color-text-primary) mb-4 pl-2">Últimas Conquistas</h3>
                    <div className="card-3d p-6">
                        {tasks.filter(t => t.status === 'Feito').slice(0, 3).length === 0 ? (
                            <p className="text-xs text-center text-gray-400 py-4 font-bold">Nenhuma tarefa concluída ainda.</p>
                        ) : (
                            <div className="space-y-4">
                                {tasks.filter(t => t.status === 'Feito').slice(0, 3).map(task => {
                                    const estimated = (task.estimated_minutes || 0) * 60
                                    const actual = task.time_spent || 0
                                    const diff = estimated > 0 ? ((actual - estimated) / estimated) * 100 : 0
                                    const isLate = diff > 10
                                    const isFast = diff < -10

                                    return (
                                        <div key={task.id} className="border-b border-gray-100 last:border-0 pb-3 last:pb-0">
                                            <div className="flex justify-between items-start mb-1 min-w-0">
                                                <span className="text-xs font-black text-slate-700 truncate pr-2" title={task.title}>{task.title}</span>
                                                <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded border shrink-0 ${
                                                    isLate ? 'bg-red-50 text-red-600 border-red-200' : isFast ? 'bg-green-50 text-green-600 border-green-200' : 'bg-blue-50 text-blue-600 border-blue-200'
                                                }`}>
                                                    {isLate ? 'Atrasado' : isFast ? 'Rápido' : 'No Alvo'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-[10px] font-bold text-slate-400 mt-1">
                                                <span>Foco: {Math.round(actual / 60)}m</span>
                                                <span className="text-amber-500 font-extrabold">+{(6 - (task.priority || 3)) * 20} XP</span>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <TaskModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleCreateTask}
            />

            <TaskDetailsModal
                taskId={selectedTaskId}
                isOpen={isDetailsOpen}
                onClose={() => setIsDetailsOpen(false)}
                onUpdate={loadData}
                onNavigate={onNavigate}
                profile={profile}
            />

            <ConfirmationModal
                isOpen={feedback.isOpen}
                onClose={() => setFeedback(prev => ({ ...prev, isOpen: false }))}
                onConfirm={() => setFeedback(prev => ({ ...prev, isOpen: false }))}
                title={feedback.title}
                message={feedback.message}
                confirmText="Entendido"
                cancelText={null}
                type={feedback.type}
            />
        </div>
    )
}
