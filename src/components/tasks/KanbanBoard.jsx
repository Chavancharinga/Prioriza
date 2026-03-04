import { Circle, Clock, CheckCircle2, Pencil, Trash2 } from 'lucide-react'
import Card from '../ui/Card'

const columns = [
    { id: 'A Fazer', label: 'A Fazer', icon: Circle, color: 'border-neutral-300' },
    { id: 'Em Progresso', label: 'Em Progresso', icon: Clock, color: 'border-blue-300' },
    { id: 'Feito', label: 'Feito', icon: CheckCircle2, color: 'border-green-300' },
]

const priorityColors = {
    1: 'border-l-red-500',
    2: 'border-l-orange-500',
    3: 'border-l-yellow-500',
    4: 'border-l-blue-500',
    5: 'border-l-green-500',
}

export default function KanbanBoard({ tasks, loading, onEdit, onDelete, onStatusChange, onTaskClick }) {
    if (loading) {
        return (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {columns.map((col) => (
                    <Card key={col.id} title={col.label}>
                        <div className="space-y-2">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="skeleton h-20 rounded-lg" />
                            ))}
                        </div>
                    </Card>
                ))}
            </div>
        )
    }

    const handleDragStart = (e, taskId) => {
        e.dataTransfer.setData('taskId', taskId)
    }

    const handleDragOver = (e) => {
        e.preventDefault()
    }

    const handleDrop = (e, status) => {
        e.preventDefault()
        const taskId = e.dataTransfer.getData('taskId')
        if (taskId) {
            onStatusChange(taskId, status)
        }
    }

    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {columns.map((column) => {
                const Icon = column.icon
                const columnTasks = tasks.filter((t) => t.status === column.id)

                return (
                    <div
                        key={column.id}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, column.id)}
                        className="h-full"
                    >
                        <Card
                            title={
                                <div className="flex items-center gap-2">
                                    <Icon className="h-4 w-4" />
                                    <span>{column.label}</span>
                                    <span className="ml-auto rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600">
                                        {columnTasks.length}
                                    </span>
                                </div>
                            }
                            className={`h-full border-t-4 ${column.color}`}
                        >
                            <div className="space-y-3 min-h-[200px]">
                                {columnTasks.length === 0 ? (
                                    <p className="py-8 text-center text-sm text-neutral-400 border-2 border-dashed border-neutral-100 rounded-lg">
                                        Solte aqui
                                    </p>
                                ) : (
                                    columnTasks.map((task) => (
                                        <div
                                            key={task.id}
                                            draggable={task.status !== 'Feito'}
                                            onDragStart={(e) => handleDragStart(e, task.id)}
                                            onClick={() => onTaskClick && onTaskClick(task)}
                                            className={`group relative rounded-lg border-l-4 border-y border-r border-neutral-200 bg-white p-3 shadow-sm transition-all ${task.status !== 'Feito' ? 'cursor-grab active:cursor-grabbing hover:shadow-md hover:-translate-y-1' : 'cursor-pointer opacity-80 bg-gray-50'
                                                } ${priorityColors[task.priority] || 'border-l-neutral-300'
                                                }`}
                                        >
                                            <div className="flex justify-between items-start">
                                                <h4 className="text-sm font-medium text-neutral-900 line-clamp-2 mb-1">
                                                    {task.title}
                                                </h4>
                                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2 bg-white/90 rounded shadow-sm">
                                                    <button onClick={() => onEdit(task)} className="p-1 hover:text-blue-600"><Pencil className="w-3 h-3" /></button>
                                                    <button onClick={() => onDelete(task.id)} className="p-1 hover:text-red-600"><Trash2 className="w-3 h-3" /></button>
                                                </div>
                                            </div>

                                            {task.description && (
                                                <p className="text-xs text-neutral-500 line-clamp-2 mb-2">
                                                    {task.description}
                                                </p>
                                            )}

                                            <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-50">
                                                {task.due_date && (
                                                    <span className="text-[10px] text-neutral-400 font-medium">
                                                        {new Date(task.due_date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                                                    </span>
                                                )}
                                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${task.priority === 1 ? 'bg-red-100 text-red-700' :
                                                    task.priority === 2 ? 'bg-orange-100 text-orange-700' :
                                                        'bg-gray-100 text-gray-600'
                                                    }`}>
                                                    P{task.priority}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </Card>
                    </div>
                )
            })}
        </div>
    )
}
