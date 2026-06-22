import { useCallback, useState } from 'react'
import { ChevronRight, ChevronDown, Circle, CheckCircle2, Clock, ListChecks } from 'lucide-react'
import { TaskService } from '../../services/TaskService'
import Card from '../ui/Card'
import EmptyState from '../ui/EmptyState'

const priorityColors = {
    1: {
        card: 'border-l-red-600 bg-red-50/70',
        badge: 'bg-red-100 text-red-700',
    },
    2: {
        card: 'border-l-orange-500 bg-orange-50/70',
        badge: 'bg-orange-100 text-orange-700',
    },
    3: {
        card: 'border-l-amber-400 bg-amber-50/70',
        badge: 'bg-amber-100 text-amber-700',
    },
    4: {
        card: 'border-l-lime-500 bg-lime-50/70',
        badge: 'bg-lime-100 text-lime-700',
    },
    5: {
        card: 'border-l-green-500 bg-green-50/70',
        badge: 'bg-green-100 text-green-700',
    },
}

const statusIcons = {
    'A Fazer': Circle,
    'Em Progresso': Clock,
    'Feito': CheckCircle2,
}

function getTaskChildren(task, allTasks) {
    const nested = Array.isArray(task.subtasks) ? task.subtasks : []
    const linked = allTasks.filter(t => t.parent_id === task.id)
    const knownIds = new Set()
    return [...nested, ...linked].filter(child => {
        if (!child?.id || knownIds.has(child.id)) return false
        knownIds.add(child.id)
        return true
    })
}

function TaskNode({ task, level = 0, children, onTaskClick, allTasks, checklistByTask, loadingChecklist, onToggleChecklist }) {
    const [expanded, setExpanded] = useState(false)
    const hasChildren = children && children.length > 0
    const StatusIcon = statusIcons[task.status] || Circle
    const checklist = checklistByTask[task.id] || task.checklist_items || []
    const hasChecklist = checklist.length > 0
    const canExpand = hasChecklist || hasChildren
    const isLoadingChecklist = loadingChecklist[task.id]
    const style = priorityColors[task.priority] || { card: 'border-l-neutral-300 bg-white', badge: 'bg-neutral-100 text-neutral-700' }

    async function handleToggle() {
        if (!canExpand) {
            onTaskClick?.(task)
            return
        }

        const nextExpanded = !expanded
        setExpanded(nextExpanded)
        if (nextExpanded && !hasChecklist) {
            await onToggleChecklist(task.id)
        }
    }

    return (
        <div>
            <div
                onClick={handleToggle}
                className={`group flex items-center gap-2 rounded-lg border-l-4 border-y border-r border-neutral-200 p-3 transition-all hover:shadow-sm cursor-pointer ${style.card}`}
                style={{ marginLeft: `${level * 20}px` }}
                title="Clique para abrir a checklist desta tarefa"
            >
                {canExpand && (
                    <button
                        onClick={(e) => { e.stopPropagation(); handleToggle() }}
                        className="flex h-5 w-5 items-center justify-center rounded text-(--color-prioriza-blue) hover:bg-white/70"
                        aria-label={expanded ? 'Fechar checklist' : 'Abrir checklist'}
                    >
                        {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </button>
                )}

                {hasChildren ? (
                    <ListChecks className="h-4 w-4 text-(--color-prioriza-blue)" />
                ) : (
                    <StatusIcon className={`h-4 w-4 ${task.status === 'Feito' ? 'text-(--color-prioriza-blue)' : task.status === 'Em Progresso' ? 'text-(--color-prioriza-blue)' : 'text-neutral-400'}`} />
                )}

                <div className="flex-1 min-w-0">
                    <h4 className={`text-sm font-medium truncate ${task.status === 'Feito' ? 'text-neutral-400 line-through' : 'text-neutral-900'}`}>
                        {task.title}
                    </h4>
                </div>

                <button
                    onClick={(e) => {
                        e.stopPropagation()
                        onTaskClick?.(task)
                    }}
                    className="hidden sm:inline-flex rounded-full bg-white/80 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-(--color-prioriza-blue) shadow-sm hover:bg-white"
                    type="button"
                >
                    Abrir
                </button>

                {task.due_date && (
                    <span className="text-[10px] text-neutral-400 font-medium hidden sm:inline">
                        {new Date(task.due_date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                    </span>
                )}

                <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${style.badge}`}>
                    P{task.priority}
                </span>
            </div>

            {expanded && (
                <div
                    className="mt-2 space-y-2 rounded-2xl border border-white/80 bg-white/70 p-3 shadow-sm"
                    style={{ marginLeft: `${(level + 1) * 20}px` }}
                >
                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-500">
                        <ListChecks className="h-4 w-4 text-(--color-prioriza-blue)" />
                        Checklist
                    </div>

                    {isLoadingChecklist && (
                        <p className="text-xs font-semibold text-slate-400">A carregar checklist...</p>
                    )}

                    {!isLoadingChecklist && checklist.length > 0 && (
                        <div className="space-y-1.5">
                            {checklist.map(item => (
                                <div key={item.id} className="flex items-center gap-2 rounded-xl bg-white/80 px-3 py-2 text-xs">
                                    {item.is_completed ? (
                                        <CheckCircle2 className="h-4 w-4 shrink-0 text-(--color-prioriza-blue)" />
                                    ) : (
                                        <Circle className="h-4 w-4 shrink-0 text-slate-400" />
                                    )}
                                    <span className={item.is_completed ? 'text-slate-400 line-through' : 'font-semibold text-slate-700'}>
                                        {item.content}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}

                    {hasChildren && (
                        <div className="space-y-2 border-t border-slate-100 pt-2">
                            <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">Subtarefas</div>
                            {children.map((child) => (
                                <TaskNode
                                    key={child.id}
                                    task={child}
                                    level={level + 1}
                                    onTaskClick={onTaskClick}
                                    allTasks={allTasks}
                                    children={getTaskChildren(child, allTasks)}
                                    checklistByTask={checklistByTask}
                                    loadingChecklist={loadingChecklist}
                                    onToggleChecklist={onToggleChecklist}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default function TreeView({ tasks, loading, onTaskClick }) {
    const [checklistByTask, setChecklistByTask] = useState({})
    const [loadingChecklist, setLoadingChecklist] = useState({})

    const loadChecklist = useCallback(async (taskId) => {
        if (Object.prototype.hasOwnProperty.call(checklistByTask, taskId) || loadingChecklist[taskId]) return

        try {
            setLoadingChecklist(prev => ({ ...prev, [taskId]: true }))
            const details = await TaskService.getTaskDetails(taskId)
            setChecklistByTask(prev => ({ ...prev, [taskId]: details?.checklist_items || [] }))
        } catch (error) {
            console.error('Error loading checklist:', error)
            setChecklistByTask(prev => ({ ...prev, [taskId]: [] }))
        } finally {
            setLoadingChecklist(prev => ({ ...prev, [taskId]: false }))
        }
    }, [checklistByTask, loadingChecklist])

    if (loading) {
        return (
            <Card>
                {/* label placeholder aria-label */}
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
                {/* label placeholder aria-label */}
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
            {/* label placeholder aria-label */}
            <div className="space-y-2">
                {rootTasks.map((task) => (
                    <TaskNode
                        key={task.id}
                        task={task}
                        allTasks={tasks}
                        children={getTaskChildren(task, tasks)}
                        onTaskClick={onTaskClick}
                        checklistByTask={checklistByTask}
                        loadingChecklist={loadingChecklist}
                        onToggleChecklist={loadChecklist}
                    />
                ))}
            </div>
        </Card>
    )
}
