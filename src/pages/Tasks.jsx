import { useState, useEffect } from 'react'
import { LayoutList, LayoutGrid, Network, Search, Plus } from 'lucide-react'
import { TaskService } from '../services/TaskService'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import TaskList from '../components/tasks/TaskList'
import KanbanBoard from '../components/tasks/KanbanBoard'
import TreeView from '../components/tasks/TreeView'
import TaskModal from '../components/tasks/TaskModal'
import TaskDetailsModal from '../components/tasks/TaskDetailsModal'

const views = [
    { id: 'list', label: 'Lista', icon: LayoutList },
    { id: 'kanban', label: 'Kanban', icon: LayoutGrid },
    { id: 'tree', label: 'Árvore', icon: Network },
]

export default function Tasks() {
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
            alert('Falha ao criar tarefa')
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
            alert('Falha ao atualizar tarefa')
        }
    }

    async function handleDeleteTask(taskId) {
        if (!window.confirm('Tem certeza que deseja excluir esta tarefa?')) return
        try {
            await TaskService.deleteTask(taskId)
            setTasks(tasks.filter(t => t.id !== taskId))
        } catch (err) {
            console.error('Error deleting task:', err)
            alert('Falha ao excluir tarefa')
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
                    <div className="flex gap-1 rounded-lg border border-neutral-200 bg-neutral-50 p-1 overflow-x-auto">
                        {views.map((view) => {
                            const Icon = view.icon
                            const isActive = activeView === view.id

                            return (
                                <button
                                    key={view.id}
                                    onClick={() => setActiveView(view.id)}
                                    className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-all ${isActive
                                        ? 'bg-white text-neutral-900 shadow-sm'
                                        : 'text-neutral-600 hover:text-neutral-900'
                                        }`}
                                >
                                    <Icon className="h-4 w-4" />
                                    <span className="hidden sm:inline">{view.label}</span>
                                </button>
                            )
                        })}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                        {/* Search */}
                        <div className="relative flex-1 sm:w-64">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                            <input
                                type="search"
                                placeholder="Buscar tarefas..."
                                value={searchQuery}
                                onClick={(e) => e.stopPropagation()}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="h-9 w-full rounded-lg border border-neutral-200 bg-white pl-9 pr-3 text-sm outline-none transition-all placeholder:text-neutral-400 hover:border-neutral-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>

                        {/* Filter */}
                        <select
                            value={statusFilter}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="h-9 rounded-lg border border-neutral-200 bg-white px-3 text-sm font-medium text-neutral-700 outline-none transition-all hover:border-neutral-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        >
                            <option value="all">Todas</option>
                            <option value="pending">A Fazer</option>
                            <option value="in_progress">Em Progresso</option>
                            <option value="completed">Concluídas</option>
                        </select>

                        {/* Add Button */}
                        <Button variant="primary" onClick={openCreateModal} className="h-9 flex items-center justify-center gap-2 px-4 whitespace-nowrap">
                            <Plus className="w-4 h-4" />
                            <span className="hidden sm:inline">Nova Tarefa</span>
                            <span className="sm:hidden">Adicionar</span>
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
                                await TaskService.updateStatus(id, status)
                                setTasks(tasks.map(t => t.id === id ? { ...t, status } : t))
                            } catch (err) {
                                alert('Erro ao mover tarefa')
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
            />
        </div>
    )
}
