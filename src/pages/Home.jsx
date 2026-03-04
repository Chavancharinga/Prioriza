import { useState, useEffect } from 'react'
import { Calendar, CheckCircle2, Plus } from 'lucide-react'
import { TaskService } from '../services/TaskService'
import Button from '../components/ui/Button'
import TaskModal from '../components/tasks/TaskModal'
import TaskDetailsModal from '../components/tasks/TaskDetailsModal'

export default function Home() {
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
        } catch (err) {
            console.error('Error creating task:', err)
            alert(`Falha ao criar tarefa: ${err.message || JSON.stringify(err)}`)
        }
    }

    function handleTaskClick(task) {
        setSelectedTaskId(task.id)
        setIsDetailsOpen(true)
    }

    // Get upcoming tasks for timeline (sorted by due date)
    const upcomingTasks = tasks
        .filter(t => t.due_date && t.status !== 'Feito')
        .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
        .slice(0, 5)

    const priorityColors = {
        1: { bg: 'bg-red-500', text: 'text-red-500', border: 'border-red-500' },
        2: { bg: 'bg-orange-500', text: 'text-orange-500', border: 'border-orange-500' },
        3: { bg: 'bg-yellow-500', text: 'text-yellow-500', border: 'border-yellow-500' },
        4: { bg: 'bg-blue-500', text: 'text-blue-500', border: 'border-blue-500' },
        5: { bg: 'bg-green-500', text: 'text-green-500', border: 'border-green-500' }
    }

    if (loading) {
        return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
    }

    return (
        <div className="grid grid-cols-12 gap-6 lg:gap-8 h-full pb-10 relative">
            {/* Quick Action - Floating or Top Right */}
            <div className="col-span-12 flex justify-end">
                <Button variant="primary" onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 shadow-xl shadow-blue-500/20">
                    <Plus className="w-5 h-5" />
                    <span>Nova Tarefa Rápida</span>
                </Button>
            </div>

            {/* LEFT COLUMN: Main Chart & Kanban */}
            <div className="col-span-12 xl:col-span-9 flex flex-col gap-6 lg:gap-8">

                {/* Timeline Section */}
                <div className="bg-white rounded-[24px] sm:rounded-[32px] lg:rounded-[40px] p-4 sm:p-6 lg:p-8 shadow-[0_2px_40px_-10px_rgba(0,0,0,0.05)] relative overflow-hidden overflow-x-auto">
                    <div className="min-w-[600px]">
                        <h3 className="text-lg font-bold text-gray-900 mb-6">Próximas Entregas</h3>

                        {upcomingTasks.length === 0 ? (
                            <p className="text-center text-gray-400 py-10">Nenhuma tarefa agendada</p>
                        ) : (
                            <div className="space-y-4">
                                {upcomingTasks.map((task, i) => {
                                    const progress = task.progress || 0
                                    const barColor = priorityColors[task.priority]?.bg || 'bg-blue-500'

                                    return (
                                        <div
                                            key={task.id}
                                            className="relative cursor-pointer hover:opacity-80 transition-opacity"
                                            onClick={() => handleTaskClick(task)}
                                        >
                                            <div className="flex justify-between text-xs font-bold text-gray-500 mb-1">
                                                <span>{task.title}</span>
                                                <span>{new Date(task.due_date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}</span>
                                            </div>
                                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${barColor}`}
                                                    style={{ width: `${Math.max(5, progress)}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Kanban Section (Preview) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
                    {['A Fazer', 'Em Progresso', 'Feito'].map((status) => {
                        const statusTasks = tasks.filter(t => t.status === status).slice(0, 3)

                        return (
                            <div key={status} className="flex flex-col gap-3">
                                <h4 className="text-[10px] font-extrabold text-gray-300 uppercase tracking-[0.2em] text-center lg:text-left pl-1">{status}</h4>

                                {statusTasks.map((task) => (
                                    <div
                                        key={task.id}
                                        onClick={() => handleTaskClick(task)}
                                        className="bg-white rounded-[20px] p-5 shadow-[0_2px_20px_-5px_rgba(0,0,0,0.03)] hover:-translate-y-1 transition-transform duration-300 cursor-pointer"
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 ${priorityColors[task.priority]?.text || 'text-gray-500'}`}>
                                                P{task.priority}
                                            </span>
                                            {task.due_date && (
                                                <span className="text-[10px] font-bold text-gray-400">
                                                    {new Date(task.due_date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                                                </span>
                                            )}
                                        </div>

                                        <p className="text-[11px] font-bold text-gray-700 mb-4 line-clamp-2">{task.title}</p>

                                        <div className="flex items-center gap-3 text-gray-300">
                                            <div className="h-1 flex-1 bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${task.status === 'Feito' ? 'bg-green-400' : 'bg-blue-400'}`}
                                                    style={{ width: `${task.status === 'Feito' ? 100 : (task.progress || 0)}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {statusTasks.length === 0 && (
                                    <div className="text-center py-4 text-xs text-gray-300 border-2 border-dashed border-gray-100 rounded-xl">
                                        Vazio
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* RIGHT COLUMN: Stats */}
            <div className="col-span-12 xl:col-span-3 flex flex-col sm:flex-row xl:flex-col gap-6 pt-0 lg:pt-4">

                {/* 1. Overview Widget */}
                <div className="flex-1 xl:flex-none">
                    <h3 className="text-sm font-bold text-gray-900 mb-4 pl-2">Visão Geral</h3>
                    <div className="bg-white rounded-[30px] p-6 shadow-[0_2px_30px_-5px_rgba(0,0,0,0.03)] space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                                    <Calendar className="w-5 h-5" />
                                </div>
                                <span className="text-sm font-medium text-gray-600">Total</span>
                            </div>
                            <span className="text-xl font-bold text-gray-900">{stats.total}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                                    <CheckCircle2 className="w-5 h-5" />
                                </div>
                                <span className="text-sm font-medium text-gray-600">Concluídas</span>
                            </div>
                            <span className="text-xl font-bold text-gray-900">{stats.done}</span>
                        </div>
                    </div>
                </div>

                {/* 2. Performance Widget (NEW) */}
                <div className="flex-1 xl:flex-none">
                    <h3 className="text-sm font-bold text-gray-900 mb-4 pl-2">Desempenho (Últimas 5)</h3>
                    <div className="bg-white rounded-[30px] p-6 shadow-[0_2px_30px_-5px_rgba(0,0,0,0.03)]">
                        {tasks.filter(t => t.status === 'Feito').slice(0, 5).length === 0 ? (
                            <p className="text-xs text-center text-gray-400 py-4">Nenhuma tarefa concluída ainda.</p>
                        ) : (
                            <div className="space-y-4">
                                {tasks.filter(t => t.status === 'Feito').slice(0, 5).map(task => {
                                    const estimated = (task.estimated_minutes || 0) * 60
                                    const actual = task.time_spent || 0
                                    const diff = estimated > 0 ? ((actual - estimated) / estimated) * 100 : 0
                                    const isLate = diff > 10 // >10% over
                                    const isFast = diff < -10 // >10% under

                                    // Duration (Days)
                                    const start = new Date(task.created_at)
                                    const end = task.completed_at ? new Date(task.completed_at) : new Date()
                                    const days = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)))

                                    return (
                                        <div key={task.id} className="border-b border-gray-50 last:border-0 pb-3 last:pb-0">
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="text-xs font-bold text-gray-700 truncate max-w-[120px]" title={task.title}>{task.title}</span>
                                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${isLate ? 'bg-red-50 text-red-600' : isFast ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-600'}`}>
                                                    {isLate ? 'Atrasado' : isFast ? 'Rápido' : 'No Prazo'}
                                                </span>
                                            </div>

                                            <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                                                <span>Est: {task.estimated_minutes || 0}m</span>
                                                <span>Real: {Math.round(actual / 60)}m</span>
                                            </div>

                                            {/* Mini Bar Comparison */}
                                            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden flex">
                                                <div className="bg-gray-300 h-full" style={{ width: '50%' }}></div> {/* Baseline/Est */}
                                                <div
                                                    className={`h-full ${isLate ? 'bg-red-400' : 'bg-green-400'}`}
                                                    style={{ width: `${Math.min(100, (actual / (estimated || 1)) * 50)}%` }}
                                                ></div>
                                            </div>

                                            <div className="text-[9px] text-gray-300 mt-1 text-right">
                                                Duração: {days} dia(s)
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* 3. Efficiency Widget (Simplified) */}
                <div className="flex-1 xl:flex-none">
                    {/* ... keep existing circular chart if desired, or replace ... */}
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
            />
        </div>
    )
}
