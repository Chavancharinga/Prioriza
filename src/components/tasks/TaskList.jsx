import { CheckCircle2, Circle, Clock, Pencil, Trash2 } from 'lucide-react'
import Card from '../ui/Card'
import EmptyState from '../ui/EmptyState'
import Button from '../ui/Button'

const priorityColors = {
    1: 'border-l-critical bg-red-50',
    2: 'border-l-high bg-orange-50',
    3: 'border-l-medium bg-yellow-50',
    4: 'border-l-low bg-blue-50',
    5: 'border-l-minimal bg-green-50',
}

const statusIcons = {
    'A Fazer': Circle,
    'Em Progresso': Clock,
    'Feito': CheckCircle2,
}

export default function TaskList({ tasks, loading, onEdit, onDelete, onTaskClick }) {
    if (loading) {
        return (
            <Card>
                <div className="space-y-2">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="skeleton h-16 rounded-lg" />
                    ))}
                </div>
            </Card>
        )
    }

    if (tasks.length === 0) {
        return (
            <Card>
                <EmptyState
                    icon={Circle}
                    title="Nenhuma tarefa encontrada"
                    description="Crie uma nova tarefa para começar"
                />
            </Card>
        )
    }

    return (
        <Card>
            <div className="space-y-2">
                {tasks.map((task) => {
                    const StatusIcon = statusIcons[task.status] || Circle

                    return (
                        <div
                            key={task.id}
                            onClick={() => onTaskClick && onTaskClick(task)}
                            className={`group flex items-center gap-3 rounded-lg border-l-4 border-y border-r border-neutral-200 p-3 transition-all hover:shadow-sm cursor-pointer ${priorityColors[task.priority] || 'border-l-neutral-300'
                                }`}
                        >
                            <StatusIcon className="h-5 w-5 text-neutral-400" />

                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-medium text-neutral-900 truncate">
                                    {task.title}
                                </h4>
                                {task.description && (
                                    <p className="text-xs text-neutral-500 truncate">
                                        {task.description}
                                    </p>
                                )}
                            </div>

                            <div className="flex items-center gap-2">
                                {task.due_date && (
                                    <span className="hidden sm:inline text-xs text-neutral-500">
                                        {new Date(task.due_date).toLocaleDateString('pt-BR', {
                                            day: '2-digit',
                                            month: 'short',
                                        })}
                                    </span>
                                )}
                                <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-700">
                                    P{task.priority}
                                </span>

                                <div className="flex items-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => onEdit(task)}
                                        className="p-1.5 text-neutral-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                    >
                                        <Pencil className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => onDelete(task.id)}
                                        className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </Card>
    )
}
