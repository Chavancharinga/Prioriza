import { useEffect, useMemo, useState } from 'react'
import { LayoutGrid, LayoutList, Network, Plus, Search } from 'lucide-react'
import { TaskService } from '../services/TaskService'
import { GamificationService } from '../services/GamificationService'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import TaskList from '../components/tasks/TaskList'
import KanbanBoard from '../components/tasks/KanbanBoard'
import TreeView from '../components/tasks/TreeView'
import TaskModal from '../components/tasks/TaskModal'
import TaskDetailsModal from '../components/tasks/TaskDetailsModal'
import ConfirmationModal from '../components/ui/ConfirmationModal'

const views = [
    { id: 'list', label: 'Lista', icon: LayoutList },
    { id: 'kanban', label: 'Kanban', icon: LayoutGrid },
    { id: 'tree', label: 'Árvore', icon: Network },
]

const filters = [
    { value: 'all', label: 'Todas' },
    { value: 'pending', label: 'A fazer' },
    { value: 'in_progress', label: 'Em foco' },
    { value: 'completed', label: 'Feitas' },
]

export default function Tasks({ profile, onNavigate }) {
    const [activeView, setActiveView] = useState('list')
    const [tasks, setTasks] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [taskToEdit, setTaskToEdit] = useState(null)
    const [isDetailsOpen, setIsDetailsOpen] = useState(false)
    const [selectedTaskId, setSelectedTaskId] = useState(null)
    const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, taskId: null })

    useEffect(() => {
        loadTasks()
    }, [])

    async function loadTasks() {
        try {
            setLoading(true)
            const data = await TaskService.getTasks()
            setTasks(data || [])
        } catch (err) {
            console.error('Error loading tasks:', err)
        } finally {
            setLoading(false)
        }
    }

    const filteredTasks = useMemo(() => {
        const query = searchQuery.trim().toLowerCase()

        return tasks.filter((task) => {
            const matchesSearch = !query || task.title.toLowerCase().includes(query)
            const matchesStatus = statusFilter === 'all' ||
                (statusFilter === 'pending' && task.status === 'A Fazer') ||
                (statusFilter === 'in_progress' && task.status === 'Em Progresso') ||
                (statusFilter === 'completed' && task.status === 'Feito') ||
                task.status === statusFilter

            return matchesSearch && matchesStatus
        })
    }, [searchQuery, statusFilter, tasks])

    async function handleCreateTask(taskData) {
        try {
            const newTask = await TaskService.createTask(taskData)
            setTasks([newTask, ...tasks])
            setIsModalOpen(false)
        } catch (err) {
            console.error('Error creating task:', err)
            alert('Falha ao criar tarefa')
        }
    }

    async function handleUpdateTask(taskData) {
        if (!taskToEdit) return
        try {
            const updatedTask = await TaskService.updateTask(taskToEdit.id, taskData)
            setTasks(tasks.map(task => task.id === taskToEdit.id ? updatedTask : task))
            setIsModalOpen(false)
            setTaskToEdit(null)
        } catch (err) {
            console.error('Error updating task:', err)
            alert('Falha ao atualizar tarefa')
        }
    }

    async function handleConfirmDelete() {
        const taskId = deleteConfirm.taskId
        if (!taskId) return

        try {
            await TaskService.deleteTask(taskId)
            setTasks(tasks.filter(task => task.id !== taskId))
        } catch (err) {
            console.error('Error deleting task:', err)
            alert('Falha ao excluir tarefa')
        } finally {
            setDeleteConfirm({ isOpen: false, taskId: null })
        }
    }

    function openCreateModal() {
        setTaskToEdit(null)
        setIsModalOpen(true)
    }

    function openEditModal(task) {
        setTaskToEdit(task)
        setIsModalOpen(true)
    }

    function handleTaskClick(task) {
        setSelectedTaskId(task.id)
        setIsDetailsOpen(true)
    }

    async function handleStatusChange(id, status) {
        try {
            const targetTask = tasks.find(task => task.id === id)
            const isCompleting = status === 'Feito' && targetTask?.status !== 'Feito'

            if (isCompleting && targetTask) {
                const details = await TaskService.getTaskDetails(id)
                const totalChecklist = details?.checklist_items?.length || 0
                const completedChecklist = details?.checklist_items?.filter(item => item.is_completed).length || 0
                const pendingChecklist = totalChecklist - completedChecklist

                await TaskService.updateStatus(id, status)
                setTasks(tasks.map(task => task.id === id ? { ...task, status } : task))

                if (pendingChecklist > 0) {
                    alert(`A tarefa foi concluída, mas ainda tem ${pendingChecklist} item(ns) pendente(s) na checklist. Nenhum XP foi concedido.`)
                    return
                }

                const priorityXp = (6 - (targetTask.priority || 3)) * 20
                const result = await GamificationService.awardXp(priorityXp)
                if (result?.levelUp) {
                    alert(`Subiu de nível. Você alcançou o nível ${result.newLevel}.`)
                }
                return
            }

            await TaskService.updateStatus(id, status)
            setTasks(tasks.map(task => task.id === id ? { ...task, status } : task))
        } catch (err) {
            console.error('Error moving task:', err)
            alert('Erro ao mover tarefa')
        }
    }

    return (
        <div className="space-y-5">
            <Card className="p-3 sm:p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex gap-1 rounded-2xl border border-slate-200 bg-slate-50 p-1">
                        {views.map((view) => {
                            const Icon = view.icon
                            const isActive = activeView === view.id

                            return (
                                <button
                                    key={view.id}
                                    type="button"
                                    onClick={() => setActiveView(view.id)}
                                    className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-extrabold transition-all ${isActive
                                        ? 'bg-white text-slate-950 shadow-sm'
                                        : 'text-slate-500 hover:bg-white/70 hover:text-slate-800'
                                        }`}
                                >
                                    <Icon className="h-4 w-4" />
                                    <span>{view.label}</span>
                                </button>
                            )
                        })}
                    </div>

                    <div className="grid grid-cols-12 gap-2.5 lg:flex lg:w-auto lg:items-center">
                        <div className="relative col-span-12 sm:col-span-6 lg:w-72">
                            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input
                                type="search"
                                placeholder="Buscar tarefa"
                                value={searchQuery}
                                onChange={(event) => setSearchQuery(event.target.value)}
                                className="h-11 w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-3 text-sm font-semibold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                            />
                        </div>

                        <select
                            value={statusFilter}
                            onChange={(event) => setStatusFilter(event.target.value)}
                            className="col-span-6 h-11 rounded-2xl border border-slate-200 bg-white px-3 text-sm font-extrabold text-slate-700 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100 sm:col-span-3 lg:w-32"
                        >
                            {filters.map(filter => (
                                <option key={filter.value} value={filter.value}>{filter.label}</option>
                            ))}
                        </select>

                        <Button variant="primary" onClick={openCreateModal} className="col-span-6 h-11 justify-center gap-2 px-4 text-sm sm:col-span-3">
                            <Plus className="h-4 w-4" />
                            Nova
                        </Button>
                    </div>
                </div>
            </Card>

            <div className="min-h-[400px]">
                {activeView === 'list' && (
                    <TaskList
                        tasks={filteredTasks}
                        loading={loading}
                        onEdit={openEditModal}
                        onDelete={(id) => setDeleteConfirm({ isOpen: true, taskId: id })}
                        onTaskClick={handleTaskClick}
                    />
                )}

                {activeView === 'kanban' && (
                    <KanbanBoard
                        tasks={filteredTasks}
                        loading={loading}
                        onEdit={openEditModal}
                        onDelete={(id) => setDeleteConfirm({ isOpen: true, taskId: id })}
                        onTaskClick={handleTaskClick}
                        onStatusChange={handleStatusChange}
                    />
                )}

                {activeView === 'tree' && (
                    <TreeView
                        tasks={filteredTasks}
                        loading={loading}
                        onTaskClick={handleTaskClick}
                    />
                )}
            </div>

            <TaskModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={taskToEdit ? handleUpdateTask : handleCreateTask}
                taskToEdit={taskToEdit}
            />

            <TaskDetailsModal
                taskId={selectedTaskId}
                isOpen={isDetailsOpen}
                onClose={() => setIsDetailsOpen(false)}
                onUpdate={loadTasks}
                onNavigate={onNavigate}
                profile={profile}
            />

            <ConfirmationModal
                isOpen={deleteConfirm.isOpen}
                onClose={() => setDeleteConfirm({ isOpen: false, taskId: null })}
                onConfirm={handleConfirmDelete}
                title="Excluir tarefa"
                message="Tem certeza de que deseja excluir esta tarefa? Esta ação não pode ser desfeita."
                confirmText="Excluir"
                cancelText="Cancelar"
                type="danger"
            />
        </div>
    )
}
