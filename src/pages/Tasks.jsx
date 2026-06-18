import { useState, useEffect } from 'react'
import { LayoutList, LayoutGrid, Network, Search, Plus, Lightbulb } from 'lucide-react'
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
    { id: 'tree', label: '\u00c1rvore', icon: Network },
]

export default function Tasks({ profile, onNavigate }) {
    const [activeView, setActiveView] = useState('list')
    const [tasks, setTasks] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')

    // Create/Edit Modal
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [taskToEdit, setTaskToEdit] = useState(null)

    // Details Modal
    const [isDetailsOpen, setIsDetailsOpen] = useState(false)
    const [selectedTaskId, setSelectedTaskId] = useState(null)
    const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, taskId: null })
    const [feedback, setFeedback] = useState({ isOpen: false, title: '', message: '', type: 'info' })

    function showFeedback(title, message, type = 'info') {
        setFeedback({ isOpen: true, title, message, type })
    }

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

    async function handleCreateTask(taskData) {
        try {
            const newTask = await TaskService.createTask(taskData)
            setTasks([newTask, ...tasks])
            setIsModalOpen(false)
        } catch (err) {
            console.error('Error creating task:', err)
            showFeedback('Falha ao criar tarefa', 'N\u00e3o foi poss\u00edvel criar a tarefa. Tente novamente.', 'danger')
        }
    }

    async function handleUpdateTask(taskData) {
        if (!taskToEdit) return
        try {
            const updatedTask = await TaskService.updateTask(taskToEdit.id, taskData)
            setTasks(tasks.map(t => t.id === taskToEdit.id ? updatedTask : t))
            setIsModalOpen(false)
            setTaskToEdit(null)
        } catch (err) {
            console.error('Error updating task:', err)
            showFeedback('Falha ao atualizar tarefa', 'N\u00e3o foi poss\u00edvel guardar as altera\u00e7\u00f5es. Tente novamente.', 'danger')
        }
    }

    function handleDeleteTask(taskId) {
        setDeleteConfirm({ isOpen: true, taskId })
    }

    async function handleConfirmDelete() {
        const taskId = deleteConfirm.taskId
        if (!taskId) return
        try {
            await TaskService.deleteTask(taskId)
            setTasks(tasks.filter(t => t.id !== taskId))
        } catch (err) {
            console.error('Error deleting task:', err)
            showFeedback('Falha ao excluir tarefa', 'N\u00e3o foi poss\u00edvel excluir a tarefa. Tente novamente.', 'danger')
        } finally {
            setDeleteConfirm({ isOpen: false, taskId: null })
        }
    }

    function openCreateModal() {
        setTaskToEdit(null)
        setIsModalOpen(true)
    }

    function openEditModal(task) {
        // Prevent event bubbling if triggered from row click
        setTaskToEdit(task)
        setIsModalOpen(true)
    }

    function handleTaskClick(task) {
        setSelectedTaskId(task.id)
        setIsDetailsOpen(true)
    }

    const filteredTasks = tasks.filter((task) => {
        const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase())
        // Map UI filter values to database values if needed, or keep consistent
        const matchesStatus = statusFilter === 'all' ||
            (statusFilter === 'pending' && task.status === 'A Fazer') ||
            (statusFilter === 'in_progress' && task.status === 'Em Progresso') ||
            (statusFilter === 'completed' && task.status === 'Feito') ||
            task.status === statusFilter
        return matchesSearch && matchesStatus
    })

    return (
        <div className="space-y-6">
            {/* Toolbar */}
            <Card>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    {/* View Switcher */}
                    <div className="flex gap-1.5 rounded-2xl border-2 border-slate-200 bg-slate-100 p-1 overflow-x-auto shrink-0">
                        {views.map((view) => {
                            const Icon = view.icon
                            const isActive = activeView === view.id

                            return (
                                <button
                                    key={view.id}
                                    onClick={() => setActiveView(view.id)}
                                    className={`flex items-center gap-2 rounded-xl px-4 py-1.5 text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${isActive
                                        ? 'bg-white text-slate-800 border-b-[3px] border-slate-300'
                                        : 'text-slate-500 hover:text-slate-800'
                                        }`}
                                >
                                    <Icon className="h-4.5 w-4.5" />
                                    <span className="hidden sm:inline">{view.label}</span>
                                </button>
                            )
                        })}
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-12 gap-2.5 w-full sm:flex sm:w-auto sm:items-center">
                        {/* Search */}
                        <div className="relative col-span-6 sm:w-64">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                            <input
                                type="search"
                                placeholder="Buscar..."
                                value={searchQuery}
                                onClick={(e) => e.stopPropagation()}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="h-10 w-full rounded-2xl border-2 border-slate-200 bg-white pl-9 pr-3 text-sm font-bold text-slate-700 outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500"
                            />
                        </div>

                        {/* Filter */}
                        <select
                            value={statusFilter}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="h-10 col-span-3 rounded-2xl border-2 border-slate-200 bg-white px-3 text-xs font-black uppercase tracking-wider text-slate-600 outline-none transition-all hover:border-slate-300 focus:border-blue-500 cursor-pointer"
                        >
                            <option value="all">Todas</option>
                            <option value="pending">A Fazer</option>
                            <option value="in_progress">Progresso</option>
                            <option value="completed">Conclu\u00eddas</option>
                        </select>

                        {/* Add Button */}
                        <Button variant="primary" onClick={openCreateModal} className="h-10 col-span-3 flex items-center justify-center gap-1.5 px-3 text-xs sm:text-sm">
                            <Plus className="w-4.5 h-4.5" />
                            <span>Nova</span>
                        </Button>
                    </div>
                </div>
            </Card>

            {/* View Content */}
            <div className="min-h-[400px]">
                {activeView === 'list' && (
                    <TaskList
                        tasks={filteredTasks}
                        loading={loading}
                        onEdit={(t) => {
                            // Stop propagation of the click to row
                            openEditModal(t)
                        }}
                        onDelete={(id) => {
                            handleDeleteTask(id)
                        }}
                        onTaskClick={handleTaskClick}
                    />
                )}
                {activeView === 'kanban' && (
                    <KanbanBoard
                        tasks={filteredTasks}
                        loading={loading}
                        onEdit={(t) => openEditModal(t)}
                        onDelete={(id) => handleDeleteTask(id)}
                        onTaskClick={handleTaskClick}
                        onStatusChange={async (id, status) => {
                            try {
                                const targetTask = tasks.find(t => t.id === id)
                                const isCompleting = status === 'Feito' && targetTask?.status !== 'Feito'
                                
                                if (isCompleting && targetTask) {
                                    // Fetch checklist items for this task first
                                    const details = await TaskService.getTaskDetails(id)
                                    const totalChecklist = details?.checklist_items?.length || 0
                                    const completedChecklist = details?.checklist_items?.filter(i => i.is_completed).length || 0
                                    const pendingChecklist = totalChecklist - completedChecklist

                                    await TaskService.updateStatus(id, status)
                                    setTasks(tasks.map(t => t.id === id ? { ...t, status } : t))

                                    if (pendingChecklist > 0) {
                                        showFeedback('Tarefa concluída sem XP', `A tarefa foi movida para "Feito", mas existem ${pendingChecklist} sub-tarefa(s) pendente(s) na checklist. Nenhum ponto de XP foi concedido.`, 'info')
                                    } else {
                                        const priorityXp = (6 - (targetTask.priority || 3)) * 20
                                        const res = await GamificationService.awardXp(priorityXp)
                                        if (res && res.levelUp) {
                                            showFeedback('Subiu de nível', `Você alcançou o nível ${res.newLevel}. Continue assim!`, 'success')
                                        }
                                    }
                                } else {
                                    await TaskService.updateStatus(id, status)
                                    setTasks(tasks.map(t => t.id === id ? { ...t, status } : t))
                                }
                            } catch (err) {
                                console.error('Error moving task:', err)
                                showFeedback('Erro ao mover tarefa', 'Não foi possível atualizar o estado da tarefa. Tente novamente.', 'danger')
                            }
                        }}
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

            {/* Create/Edit Modal */}
            <TaskModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={taskToEdit ? handleUpdateTask : handleCreateTask}
                taskToEdit={taskToEdit}
            />

            {/* Details Modal */}
            <TaskDetailsModal
                taskId={selectedTaskId}
                isOpen={isDetailsOpen}
                onClose={() => setIsDetailsOpen(false)}
                onUpdate={loadTasks} // Reload tasks in background to keep data fresh
                onNavigate={onNavigate}
                profile={profile}
            />

            <ConfirmationModal
                isOpen={deleteConfirm.isOpen}
                onClose={() => setDeleteConfirm({ isOpen: false, taskId: null })}
                onConfirm={handleConfirmDelete}
                title="Excluir Tarefa"
                message="Tem certeza de que deseja excluir esta tarefa? Esta a\u00e7\u00e3o n\u00e3o pode ser desfeita."
                confirmText="Excluir"
                cancelText="Cancelar"
                type="danger"
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
