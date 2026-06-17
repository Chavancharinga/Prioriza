import { useEffect, useMemo, useState } from 'react'
import { Calendar, CheckCircle2, Circle, Clock3, Plus, Star, Trophy } from 'lucide-react'
import { TaskService } from '../services/TaskService'
import Button from '../components/ui/Button'
import TaskModal from '../components/tasks/TaskModal'
import TaskDetailsModal from '../components/tasks/TaskDetailsModal'
import Skeleton from '../components/ui/Skeleton'

const statusColumns = [
    { id: 'A Fazer', label: 'A fazer', icon: Circle },
    { id: 'Em Progresso', label: 'Em foco', icon: Clock3 },
    { id: 'Feito', label: 'Feito', icon: CheckCircle2 },
]

const priorityStyles = {
    1: 'border-red-100 bg-red-50 text-red-600',
    2: 'border-red-100 bg-red-50 text-red-600',
    3: 'border-amber-100 bg-amber-50 text-amber-700',
    4: 'border-slate-200 bg-slate-50 text-slate-500',
    5: 'border-slate-200 bg-slate-50 text-slate-500',
}

function formatDate(date) {
    if (!date) return ''
    return new Date(date).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' })
}

export default function Home({ profile, onNavigate }) {
    const [tasks, setTasks] = useState([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isDetailsOpen, setIsDetailsOpen] = useState(false)
    const [selectedTaskId, setSelectedTaskId] = useState(null)

    async function loadData() {
        try {
            const data = await TaskService.getTasks()
            setTasks(data || [])
        } catch (err) {
            console.error('Error loading home data:', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadData()
    }, [])

    const todayTasks = useMemo(() => {
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        return tasks.filter(task => {
            if (!task.due_date) return false
            const dueDate = new Date(task.due_date)
            dueDate.setHours(0, 0, 0, 0)
            return dueDate.getTime() === today.getTime() || (dueDate.getTime() < today.getTime() && task.status !== 'Feito')
        })
    }, [tasks])

    const upcomingTasks = todayTasks
        .filter(task => task.status !== 'Feito')
        .sort((first, second) => first.priority - second.priority)

    const stats = {
        total: tasks.length,
        done: tasks.filter(task => task.status === 'Feito').length,
        focus: tasks.filter(task => task.status === 'Em Progresso').length,
        overdue: tasks.filter(task => task.status !== 'Feito' && task.due_date && new Date(task.due_date) < new Date()).length,
    }

    async function handleCreateTask(taskData) {
        try {
            await TaskService.createTask(taskData)
            setIsModalOpen(false)
            loadData()
        } catch (err) {
            console.error('Error creating task:', err)
            alert(`Falha ao criar tarefa: ${err.message || JSON.stringify(err)}`)
        }
    }

    function handleTaskClick(task) {
        setSelectedTaskId(task.id)
        setIsDetailsOpen(true)
    }

    if (loading) {
        return (
            <div className="grid grid-cols-12 gap-5 pb-10">
                <div className="col-span-12 flex justify-end">
                    <Skeleton className="h-10 w-40 rounded-xl" />
                </div>
                <div className="col-span-12 xl:col-span-9 space-y-5">
                    <Skeleton.Card className="p-6 rounded-[24px]">
                        <Skeleton className="h-5 w-28 mb-6" />
                        <div className="space-y-3">
                            {[...Array(3)].map((_, index) => <Skeleton key={index} className="h-16 w-full rounded-2xl" />)}
                        </div>
                    </Skeleton.Card>
                </div>
                <div className="col-span-12 xl:col-span-3">
                    <Skeleton.Card className="p-5 rounded-[24px]">
                        <Skeleton.Text lines={4} />
                    </Skeleton.Card>
                </div>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-12 gap-5 pb-10">
            <div className="col-span-12 flex justify-end">
                <Button variant="primary" onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    Nova tarefa
                </Button>
            </div>

            <div className="col-span-12 xl:col-span-9 space-y-5">
                <section className="card-3d p-5 sm:p-6">
                    <div className="mb-5 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <Trophy className="h-5 w-5 text-blue-600" />
                            <h2 className="text-lg font-black text-slate-900">Hoje</h2>
                        </div>
                        <span className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-slate-500">
                            {upcomingTasks.length} abertas
                        </span>
                    </div>

                    {upcomingTasks.length === 0 ? (
                        <div className="flex flex-col items-center gap-3 py-10 text-center">
                            <CheckCircle2 className="h-10 w-10 text-emerald-600" />
                            <p className="text-sm font-black text-slate-500">Dia limpo. Bom trabalho.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {upcomingTasks.slice(0, 5).map(task => {
                                const xpReward = (6 - (task.priority || 3)) * 20
                                return (
                                    <button
                                        key={task.id}
                                        type="button"
                                        onClick={() => handleTaskClick(task)}
                                        className="flex w-full items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 text-left transition hover:-translate-y-0.5 hover:border-slate-300"
                                    >
                                        <div className="flex min-w-0 items-center gap-3">
                                            <span className="grid h-5 w-5 shrink-0 place-items-center rounded-lg border-2 border-slate-300" />
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-black text-slate-800">{task.title}</p>
                                                <div className="mt-1 flex items-center gap-2">
                                                    <span className={`rounded-lg border px-2 py-0.5 text-[9px] font-black ${priorityStyles[task.priority] || priorityStyles[4]}`}>
                                                        P{task.priority}
                                                    </span>
                                                    {task.due_date && <span className="text-[11px] font-bold text-slate-400">{formatDate(task.due_date)}</span>}
                                                </div>
                                            </div>
                                        </div>
                                        <span className="flex shrink-0 items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-black text-slate-600">
                                            <Star className="h-3.5 w-3.5" />
                                            +{xpReward} XP
                                        </span>
                                    </button>
                                )
                            })}
                        </div>
                    )}
                </section>

                <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    {statusColumns.map(column => {
                        const Icon = column.icon
                        const statusTasks = todayTasks.filter(task => task.status === column.id)

                        return (
                            <div key={column.id} className="space-y-3">
                                <div className="flex items-center gap-2 px-1 text-[11px] font-black uppercase tracking-widest text-slate-500">
                                    <Icon className="h-4 w-4" />
                                    {column.label}
                                </div>
                                {statusTasks.slice(0, 4).map(task => (
                                    <button
                                        key={task.id}
                                        type="button"
                                        onClick={() => handleTaskClick(task)}
                                        className="card-3d w-full p-4 text-left transition hover:-translate-y-0.5"
                                    >
                                        <div className="mb-3 flex items-center justify-between gap-2">
                                            <span className={`rounded-lg border px-2 py-0.5 text-[10px] font-black ${priorityStyles[task.priority] || priorityStyles[4]}`}>
                                                P{task.priority}
                                            </span>
                                            {task.due_date && <span className="text-[10px] font-bold text-slate-400">{formatDate(task.due_date)}</span>}
                                        </div>
                                        <p className="line-clamp-2 text-sm font-black text-slate-800">{task.title}</p>
                                        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-100">
                                            <div
                                                className={`h-full rounded-full ${task.status === 'Feito' ? 'bg-emerald-500' : 'bg-blue-600'}`}
                                                style={{ width: `${task.status === 'Feito' ? 100 : (task.progress || 0)}%` }}
                                            />
                                        </div>
                                    </button>
                                ))}
                                {statusTasks.length === 0 && (
                                    <div className="rounded-2xl border border-dashed border-slate-200 bg-white/70 py-6 text-center text-xs font-bold text-slate-400">
                                        Vazio
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </section>
            </div>

            <aside className="col-span-12 space-y-5 xl:col-span-3">
                <section className="card-3d p-5">
                    <h3 className="mb-4 text-sm font-black text-slate-900">Progresso</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                            <Calendar className="mb-2 h-5 w-5 text-slate-600" />
                            <p className="text-[10px] font-black uppercase text-slate-500">Total</p>
                            <p className="text-2xl font-black text-slate-900">{stats.total}</p>
                        </div>
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                            <CheckCircle2 className="mb-2 h-5 w-5 text-emerald-600" />
                            <p className="text-[10px] font-black uppercase text-slate-500">Feitas</p>
                            <p className="text-2xl font-black text-slate-900">{stats.done}</p>
                        </div>
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                            <Clock3 className="mb-2 h-5 w-5 text-blue-600" />
                            <p className="text-[10px] font-black uppercase text-slate-500">Foco</p>
                            <p className="text-2xl font-black text-slate-900">{stats.focus}</p>
                        </div>
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                            <Circle className="mb-2 h-5 w-5 text-red-600" />
                            <p className="text-[10px] font-black uppercase text-slate-500">Atrasos</p>
                            <p className="text-2xl font-black text-slate-900">{stats.overdue}</p>
                        </div>
                    </div>
                </section>

                <section className="card-3d p-5">
                    <h3 className="mb-4 text-sm font-black text-slate-900">Recentes</h3>
                    <div className="space-y-3">
                        {tasks.filter(task => task.status === 'Feito').slice(0, 3).map(task => (
                            <button
                                key={task.id}
                                type="button"
                                onClick={() => handleTaskClick(task)}
                                className="w-full rounded-2xl border border-slate-200 bg-white p-3 text-left transition hover:border-slate-300"
                            >
                                <p className="truncate text-xs font-black text-slate-800">{task.title}</p>
                                <p className="mt-1 text-[11px] font-bold text-slate-400">{Math.round((task.time_spent || 0) / 60)}m foco</p>
                            </button>
                        ))}
                        {tasks.filter(task => task.status === 'Feito').length === 0 && (
                            <p className="py-5 text-center text-xs font-bold text-slate-400">Nada concluído ainda.</p>
                        )}
                    </div>
                </section>
            </aside>

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
        </div>
    )
}
