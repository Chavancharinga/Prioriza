import { useState } from 'react'
import { ChevronRight, ChevronDown, Circle, CheckCircle2, Clock } from 'lucide-react'
import Card from '../ui/Card'
import EmptyState from '../ui/EmptyState'

const priorityColors = {
    1: 'border-l-red-500 bg-red-50/50',
    2: 'border-l-orange-500 bg-orange-50/50',
    3: 'border-l-yellow-500 bg-yellow-50/50',
    4: 'border-l-blue-500 bg-blue-50/50',
    5: 'border-l-green-500 bg-green-50/50',
}

const priorityLabels = {
    1: 'Crítica',
    2: 'Alta',
    3: 'Média',
    4: 'Baixa',
    5: 'Mínima',
}

const statusIcons = {
    'A Fazer': Circle,
    'Em Progresso': Clock,
    'Feito': CheckCircle2,
}

function TaskNode({ task, level = 0, children, onTaskClick }) {
    const [expanded, setExpanded] = useState(true)
    const hasChildren = children && children.length > 0
    const StatusIcon = statusIcons[task.status] || Circle

    return (
        <div>
            <div
                onClick={() => onTaskClick?.(task)}
                className={`group flex items-center gap-2 rounded-lg border-l-4 border-y border-r border-neutral-200 p-3 transition-all hover:shadow-sm cursor-pointer ${priorityColors[task.priority] || ''
                    }`}
                style={{ marginLeft: `${level * 24}px` }}
            >
                {hasChildren ? (
                    <button
                        onClick={(e) => { e.stopPropagation(); setExpanded(!expanded) }}
                        className="flex h-5 w-5 items-center justify-center rounded hover:bg-neutral-100"
                    >
                        {expanded ? (
                            <ChevronDown className="h-4 w-4 text-neutral-500" />
                        ) : (
                            <ChevronRight className="h-4 w-4 text-neutral-500" />
                        )}
                    </button>
                ) : (
                    <div className="w-5" />
                )}

                <StatusIcon className={`h-4 w-4 ${task.status === 'Feito' ? 'text-green-500' : task.status === 'Em Progresso' ? 'text-blue-500' : 'text-neutral-400'}`} />

                <div className="flex-1 min-w-0">
                    <h4 className={`text-sm font-medium truncate ${task.status === 'Feito' ? 'text-neutral-400 line-through' : 'text-neutral-900'}`}>
                        {task.title}
                    </h4>
                </div>

                {task.due_date && (
                    <span className="text-[10px] text-neutral-400 font-medium hidden sm:inline">
                        {new Date(task.due_date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                    </span>
                )}

                <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${task.priority === 1 ? 'bg-red-100 text-red-700' :
                    task.priority === 2 ? 'bg-orange-100 text-orange-700' :
                        task.priority === 3 ? 'bg-yellow-100 text-yellow-700' :
                            task.priority === 4 ? 'bg-blue-100 text-blue-700' :
                                'bg-green-100 text-green-700'
                    }`}>
                    P{task.priority}
                </span>
            </div>

            {hasChildren && expanded && (
                <div className="mt-2 space-y-2">
                    {children.map((child) => (
                        <TaskNode key={child.id} task={child} level={level + 1} onTaskClick={onTaskClick} children={tasks?.filter?.(t => t.parent_id === child.id) || []} />
                    ))}
                </div>
            )}
        </div>
    )
}

// Keep a flat reference for deep children lookup
let _allTasks = []

export default function TreeView({ tasks, loading, onTaskClick }) {
    _allTasks = tasks

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

    const rootTasks = tasks.filter((t) => !t.parent_id)

    return (
        <Card>
            <div className="space-y-2">
                {rootTasks.map((task) => (
                    <TaskNode
                        key={task.id}
                        task={task}
                        children={tasks.filter((t) => t.parent_id === task.id)}
                        onTaskClick={onTaskClick}
                    />
                ))}
            </div>
        </Card>
    )
}
