import { useState, useEffect, useRef } from 'react'
import {
    X, Calendar, Clock, CheckSquare, MessageSquare,
    MoreVertical, Trash2, Plus, Send, AlertTriangle,
    Play, Pause, Save, ArrowLeft, CheckCircle, RotateCcw
} from 'lucide-react'
import { TaskService } from '../../services/TaskService'
import Button from '../ui/Button'
import ConfirmationModal from '../ui/ConfirmationModal'

export default function TaskDetailsModal({ taskId, isOpen, onClose, onUpdate }) {

    const [task, setTask] = useState(null)
    const [loading, setLoading] = useState(true)
    const [newItem, setNewItem] = useState('')
    const [newNote, setNewNote] = useState('')

    // Timer state
    const [elapsedTime, setElapsedTime] = useState(0)
    const [hasChanges, setHasChanges] = useState(false)
    const [showExitAlert, setShowExitAlert] = useState(false)
    const [confirmation, setConfirmation] = useState({ isOpen: false, type: 'info', title: '', message: '', onConfirm: () => { } })
    const timerRef = useRef(null)

    useEffect(() => {
        if (isOpen && taskId) {
            loadTaskDetails()
            setHasChanges(false)
        } else {
            console.log('Resetting task details')
            setTask(null)
            setElapsedTime(0)
            stopLocalTimer()
            setNewNote('')
            setNewItem('')
            setLoading(false)
            setHasChanges(false)
        }
        return () => stopLocalTimer()
    }, [isOpen, taskId])




    // Timer Effect
    useEffect(() => {
        if (task?.timer_started_at) {
            startLocalTimer()
        } else {
            stopLocalTimer()
            if (task) {
                setElapsedTime(task.time_spent || 0)
            }
        }
    }, [task?.timer_started_at, task?.time_spent])

    async function loadTaskDetails(silent = false) {
        try {
            if (!silent) setLoading(true)
            const data = await TaskService.getTaskDetails(taskId)

            setTask(data)
            if (data?.timer_started_at) {
                const start = new Date(data.timer_started_at)
                const now = new Date()
                const currentSession = Math.round((now - start) / 1000)
                setElapsedTime((data.time_spent || 0) + currentSession)
            } else {
                setElapsedTime(data?.time_spent || 0)
            }
        } catch (error) {
            console.error('Error loading task:', error)
        } finally {
            setLoading(false)
        }
    }

    async function handleSave() {
        try {
            // 1. Save Note if exists
            if (newNote.trim()) {
                await TaskService.createNote(taskId, newNote)
                setNewItem('')
                setNewNote('')
            }

            // 2. Stop Timer if running
            if (task?.timer_started_at) {
                const updatedTask = await TaskService.stopTimer(task.id, task.time_spent, task.timer_started_at)
                setTask({ ...task, ...updatedTask })
            }

            // 3. Notify parent of updates
            onUpdate?.()
            setHasChanges(false)
        } catch (error) {
            console.error('Error saving:', error)
        }
    }

    function handleComplete() {
        setConfirmation({
            isOpen: true,
            type: 'success',
            title: 'Concluir Tarefa',
            message: 'Tem certeza que deseja marcar esta tarefa como concluída? O cronômetro será parado.',
            confirmText: 'Concluir Tarefa',
            onConfirm: async () => {
                try {
                    // 1. Save Note if exists
                    if (newNote.trim()) {
                        await TaskService.createNote(taskId, newNote)
                        setNewItem('')
                        setNewNote('')
                    }

                    // 2. Complete Task
                    await TaskService.completeTask(task.id, task.time_spent, task.timer_started_at)

                    onUpdate?.()
                    onClose()
                } catch (error) {
                    console.error('Error completing task:', JSON.stringify(error, null, 2))
                    alert(`Erro ao concluir tarefa: ${error.message || error.details || 'Erro desconhecido'}`)

                } finally {
                    setConfirmation(prev => ({ ...prev, isOpen: false }))
                }
            }
        })
    }



    function startLocalTimer() {
        if (timerRef.current) return

        timerRef.current = setInterval(() => {
            const start = new Date(task.timer_started_at)
            const now = new Date()
            const currentSession = Math.round((now - start) / 1000)
            setElapsedTime((task.time_spent || 0) + currentSession)
        }, 1000)
    }

    function stopLocalTimer() {
        if (timerRef.current) {
            clearInterval(timerRef.current)
            timerRef.current = null
        }
    }

    function formatTime(seconds) {
        if (!seconds) return '00:00:00'
        const h = Math.floor(seconds / 3600)
        const m = Math.floor((seconds % 3600) / 60)
        const s = seconds % 60
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    }

    async function handleToggleTimer() {
        try {
            if (task.timer_started_at) {
                // Stop
                const updatedTask = await TaskService.stopTimer(task.id, task.time_spent, task.timer_started_at)
                setTask({ ...task, ...updatedTask }) // Merge updates
            } else {
                // Start
                const updatedTask = await TaskService.startTimer(task.id)
                setTask({ ...task, ...updatedTask })
            }
            onUpdate?.()
            setHasChanges(true)
        } catch (error) {
            console.error('Error toggling timer:', error)
        }
    }

    // Alert State
    // const [showExitAlert, setShowExitAlert] = useState(false) // Already defined at top

    function handleBack() {
        // Check for unsaved state or any session activity
        const isTimerRunning = !!task?.timer_started_at
        const hasUnsavedNote = !!newNote.trim()

        if (isTimerRunning || hasUnsavedNote || hasChanges) {
            setShowExitAlert(true)
        } else {
            onClose()
        }
    }

    // Checklist handlers
    async function handleAddCheckitem(e) {
        e.preventDefault()
        if (!newItem.trim()) return
        try {
            const newItemObj = await TaskService.createChecklistItem(task.id, newItem)

            // Optimistic update or reload silent
            // Since we need the ID for updates, let's just append the returned object
            setTask(prev => ({
                ...prev,
                checklist_items: [...(prev.checklist_items || []), newItemObj]
            }))

            setNewItem('')
            setHasChanges(true)
        } catch (error) {
            console.error('Error adding item:', error)
        }
    }

    async function handleToggleCheckitem(itemId, isCompleted) {
        try {
            const updatedItem = await TaskService.updateChecklistItem(itemId, { is_completed: !isCompleted })
            setTask(prev => ({
                ...prev,
                checklist_items: prev.checklist_items.map(item =>
                    item.id === itemId ? updatedItem : item
                )
            }))
            setHasChanges(true)
        } catch (error) {
            console.error('Error updating item:', error)
        }
    }

    async function handleDeleteCheckitem(itemId) {
        try {
            await TaskService.deleteChecklistItem(itemId)
            setTask(prev => ({
                ...prev,
                checklist_items: prev.checklist_items.filter(item => item.id !== itemId)
            }))
            setHasChanges(true)
        } catch (error) {
            console.error('Error deleting item:', error)
        }
    }

    // Note handlers
    async function handleAddNote(e) {
        e.preventDefault()
        if (!newNote.trim()) return
        try {
            // Note: createNote returns the note, not the task. We need to reload or manually update state.
            // Simplified: reload task to get fresh notes
            await TaskService.createNote(task.id, newNote)
            setNewNote('')
            loadTaskDetails(true) // Silent reload
            setHasChanges(true)
        } catch (error) {
            console.error('Error adding note:', error)
        }
    }

    function handleDeleteNote(noteId) {
        setConfirmation({
            isOpen: true,
            type: 'danger',
            title: 'Excluir Nota',
            message: 'Esta ação não pode ser desfeita. Deseja realmente excluir esta nota?',
            confirmText: 'Excluir',
            onConfirm: async () => {
                try {
                    await TaskService.deleteNote(noteId)
                    loadTaskDetails(true) // Silent reload
                    setHasChanges(true)
                } catch (error) {
                    console.error('Error deleting note:', error)
                } finally {
                    setConfirmation(prev => ({ ...prev, isOpen: false }))
                }
            }
        })
    }


    if (!isOpen) return null

    return (
        // Changed: Removed backdrop and centering. Now fixed full screen white background.
        <div className="fixed inset-0 z-50 bg-gray-50 flex flex-col animate-in fade-in zoom-in-95 duration-200">

            {/* Custom Exit Alert Modal */}
            {showExitAlert && (
                <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 border border-gray-100 animate-in zoom-in-95 duration-200 scale-100">
                        <div className="flex items-center gap-3 mb-4 text-amber-600">
                            <div className="p-2 bg-amber-50 rounded-full">
                                <AlertTriangle className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">Atenção!</h3>
                        </div>

                        <p className="text-gray-600 mb-6 leading-relaxed">
                            Você realizou alterações ou tem atividades em andamento.
                            <br /><br />
                            <strong>É necessário salvar para confirmar seu progresso antes de sair.</strong>
                        </p>

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={() => {
                                    handleSave().then(() => {
                                        setShowExitAlert(false)
                                        onClose()
                                    })
                                }}
                                className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-gray-200"
                            >
                                <Save className="w-4 h-4" />
                                Salvar e Sair
                            </button>
                            <button
                                onClick={() => setShowExitAlert(false)}
                                className="w-full py-3 bg-white text-gray-500 border border-gray-200 rounded-xl font-bold text-sm hover:bg-gray-50 transition-colors"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirmation Modal */}
            <ConfirmationModal
                isOpen={confirmation.isOpen}
                onClose={() => setConfirmation(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmation.onConfirm}
                title={confirmation.title}
                message={confirmation.message}
                type={confirmation.type}
                confirmText={confirmation.confirmText}
            />

            {/* Header - Full Width */}
            <div className="bg-white border-b border-gray-200 shadow-sm shrink-0 z-10">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                        <button
                            onClick={handleBack}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors mr-2"
                        >
                            <ArrowLeft className="w-6 h-6" />
                        </button>

                        {loading ? (
                            <div className="h-6 w-64 bg-gray-200 rounded animate-pulse"></div>
                        ) : task ? (
                            <div className="flex items-center gap-4">
                                <h2 className="text-xl font-bold text-gray-900 truncate max-w-md" title={task.title}>{task.title}</h2>
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold 
                                    ${task.status === 'Feito' ? 'bg-green-100 text-green-700' :
                                        task.status === 'Em Progresso' ? 'bg-blue-100 text-blue-700' :
                                            'bg-gray-100 text-gray-700'}`}>
                                    {task.status}
                                </span>
                            </div>
                        ) : (
                            <div className="text-red-500 font-medium text-sm">Erro ao carregar tarefa.</div>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleSave}
                            disabled={!task}
                            className="px-5 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 flex items-center gap-2 shadow-lg shadow-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
                        >
                            <Save className="w-4 h-4" />
                            Salvar
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content - Scrollable Workspace */}
            <div className="flex-1 overflow-y-auto">
                <main className="max-w-7xl mx-auto p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {loading ? (
                        <div className="col-span-12 flex justify-center py-32">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                    ) : task ? (
                        <>
                            {/* Left Column: Timer & Metadata (Sticky on Desktop) */}
                            <div className="lg:col-span-4 space-y-6">
                                {/* Timer Widget - Hero Style */}
                                <div className="bg-linear-to-br from-blue-600 to-indigo-700 rounded-2xl p-8 text-white shadow-2xl shadow-blue-900/20 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-8 opacity-10">
                                        <Clock className="w-32 h-32" />
                                    </div>

                                    <div className="relative z-10 flex flex-col items-center text-center">
                                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-blue-50 text-xs font-bold uppercase tracking-wider mb-4 backdrop-blur-sm">
                                            <Clock className="w-3 h-3" />
                                            Modo Foco
                                        </div>

                                        <div className="text-6xl font-mono font-bold mb-8 tracking-tight tabular-nums drop-shadow-sm">
                                            {formatTime(elapsedTime)}
                                        </div>

                                        {/* Estimated Progress would go here if we had variables defined */}

                                        <button
                                            onClick={handleToggleTimer}
                                            disabled={task.status === 'Feito'}
                                            className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all transform active:scale-95 shadow-xl ${task.status === 'Feito'
                                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                                                : task.timer_started_at
                                                    ? 'bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/20'
                                                    : 'bg-white text-blue-600 hover:bg-blue-50 hover:shadow-2xl'
                                                }`}
                                        >
                                            {task.status === 'Feito' ? (
                                                <>
                                                    <CheckCircle className="w-6 h-6" /> TAREFA CONCLUÍDA
                                                </>
                                            ) : task.timer_started_at ? (
                                                <>
                                                    <Pause className="w-6 h-6 fill-current" /> PAUSAR FOCADO
                                                </>
                                            ) : task.time_spent > 0 ? (
                                                <>
                                                    <Play className="w-6 h-6 fill-current" /> CONTINUAR FOCO
                                                </>
                                            ) : (
                                                <>
                                                    <Play className="w-6 h-6 fill-current" /> INICIAR MISSÃO
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Smart Metadata Grid */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                        <p className="text-xs text-gray-500 uppercase font-bold mb-2">Estimativa Total</p>
                                        <div className="flex items-center gap-2 text-gray-900">
                                            <Clock className="w-5 h-5 text-gray-400" />
                                            <span className="text-xl font-bold">{task.estimated_minutes || 0}m</span>
                                        </div>
                                    </div>
                                    <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                        <p className="text-xs text-gray-500 uppercase font-bold mb-2">Prioridade</p>
                                        <div className="flex items-center gap-2">
                                            <div className={`w-3 h-3 rounded-full ${task.priority === 1 ? 'bg-red-500' :
                                                task.priority === 2 ? 'bg-orange-500' :
                                                    task.priority === 3 ? 'bg-yellow-500' :
                                                        'bg-blue-500'
                                                }`}></div>
                                            <span className="text-sm font-bold text-gray-900">
                                                {task.priority === 1 ? 'Crítica' :
                                                    task.priority === 2 ? 'Alta' :
                                                        task.priority === 3 ? 'Média' : 'Baixa'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="col-span-2 bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex items-center gap-3">
                                            <Calendar className={`w-5 h-5 ${task.due_date ? 'text-blue-500' : 'text-gray-400'}`} />
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase font-bold">Prazo Final</p>
                                                <p className="text-sm font-medium text-gray-900">
                                                    {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'Sem prazo definido'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Middle Column: Details & Checklist */}
                            <div className="lg:col-span-5 space-y-8">
                                {/* Description Box */}
                                <div>
                                    <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <div className="p-1.5 bg-gray-100 rounded-lg text-gray-500"><MessageSquare className="w-4 h-4" /></div>
                                        O que deve ser feito?
                                    </h3>
                                    <div className="text-gray-600 text-sm whitespace-pre-wrap leading-relaxed bg-white p-6 rounded-2xl border border-gray-100 shadow-sm min-h-[120px]">
                                        {task.description || <span className="text-gray-400 italic">Nenhuma descrição detalhada.</span>}
                                    </div>
                                </div>

                                {/* Interactive Checklist */}
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                            <div className="p-1.5 bg-gray-100 rounded-lg text-gray-500"><CheckSquare className="w-4 h-4" /></div>
                                            Checklist de Execução
                                        </h3>
                                        <span className="text-xs font-bold px-3 py-1 bg-gray-100 rounded-full text-gray-600">
                                            {task.checklist_items?.filter(i => i.is_completed).length}/{task.checklist_items?.length}
                                        </span>
                                    </div>

                                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                        {/* Progress Bar */}
                                        {task.checklist_items?.length > 0 && (
                                            <div className="h-1.5 w-full bg-gray-50">
                                                <div
                                                    className="h-full bg-green-500 transition-all duration-300"
                                                    style={{ width: `${(task.checklist_items.filter(i => i.is_completed).length / task.checklist_items.length) * 100}%` }}
                                                ></div>
                                            </div>
                                        )}

                                        <div className="p-5 space-y-2">
                                            {task.checklist_items?.map(item => (
                                                <div key={item.id} className="flex items-start gap-3 group py-2 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 rounded-lg transition-colors px-2 -mx-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={item.is_completed}
                                                        onChange={() => handleToggleCheckitem(item.id, item.is_completed)}
                                                        className="mt-1 w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                                    />
                                                    <span className={`text-sm flex-1 wrap-break-word transition-all ${item.is_completed ? 'text-gray-400 line-through decoration-gray-300' : 'text-gray-700 font-medium'}`}>
                                                        {item.content}
                                                    </span>
                                                    <button
                                                        onClick={() => handleDeleteCheckitem(item.id)}
                                                        className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-red-50 rounded-md"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}

                                            <form onSubmit={handleAddCheckitem} className="flex gap-2 pt-4">
                                                <div className="relative flex-1">
                                                    <div className="absolute left-3 top-3 w-4 h-4 text-gray-400">
                                                        <Plus className="w-full h-full" />
                                                    </div>
                                                    <input
                                                        type="text"
                                                        value={newItem}
                                                        onChange={(e) => setNewItem(e.target.value)}
                                                        disabled={task.status === 'Feito'}
                                                        placeholder={task.status === 'Feito' ? "Tarefa concluída" : "Adicionar sub-tarefa..."}
                                                        className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all focus:bg-white disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                                                    />
                                                </div>
                                                <button
                                                    type="submit"
                                                    disabled={!newItem.trim() || task.status === 'Feito'}
                                                    className="p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all shadow-sm active:scale-95 flex items-center justify-center"
                                                >
                                                    <Plus className="w-5 h-5" />
                                                </button>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Work Log / Notes */}
                            <div className="lg:col-span-3 flex flex-col h-full min-h-[500px]">
                                <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <div className="p-1.5 bg-gray-100 rounded-lg text-gray-500"><MoreVertical className="w-4 h-4" /></div>
                                    Diário de Bordo
                                </h3>

                                <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden h-[600px] lg:h-auto sticky top-6">
                                    {/* History */}
                                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/30">
                                        {task.task_notes?.length === 0 && (
                                            <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-3 px-6 text-center">
                                                <div className="bg-gray-100 p-3 rounded-full">
                                                    <MessageSquare className="w-6 h-6 text-gray-300" />
                                                </div>
                                                <p className="text-xs">O diário está vazio. Registre suas atividades aqui para manter o histórico.</p>
                                            </div>
                                        )}

                                        {task.task_notes?.map(note => (
                                            <div key={note.id} className="flex gap-3 animate-in slide-in-from-bottom-2 duration-300">
                                                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-[10px] font-bold shrink-0 mt-1 shadow-sm">
                                                    U
                                                </div>
                                                <div className="flex-1">
                                                    <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-gray-100 shadow-sm relative group hover:shadow-md transition-all">
                                                        <p className="text-xs text-gray-700 whitespace-pre-wrap leading-relaxed">{note.content}</p>
                                                        <span className="text-[10px] text-gray-400 mt-2 block font-medium">
                                                            {new Date(note.created_at).toLocaleString([], { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}
                                                        </span>
                                                        <button
                                                            onClick={() => handleDeleteNote(note.id)}
                                                            className="absolute top-2 right-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                                                        >
                                                            <Trash2 className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Input Area */}
                                    <div className="p-3 bg-white border-t border-gray-100 relative shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                                        <form onSubmit={handleAddNote} className="relative">
                                            <textarea
                                                value={newNote}
                                                onChange={(e) => setNewNote(e.target.value)}
                                                disabled={task.status === 'Feito'}
                                                placeholder={task.status === 'Feito' ? "Tarefa concluída. Não é possível adicionar notas." : "Registrar atividade..."}
                                                className="w-full pl-4 pr-12 py-3 text-sm bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none h-24 focus:bg-white transition-all shadow-inner disabled:opacity-60 disabled:cursor-not-allowed"
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' && !e.shiftKey) {
                                                        e.preventDefault();
                                                        if (newNote.trim()) handleAddNote(e);
                                                    }
                                                }}
                                            />
                                            <button
                                                type="submit"
                                                disabled={!newNote.trim() || task.status === 'Feito'}
                                                className="absolute bottom-3 right-3 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all shadow-md shadow-blue-500/20 active:scale-90"
                                            >
                                                <Send className="w-4 h-4" />
                                            </button>
                                        </form>
                                        <div className="flex items-center justify-between mt-2 px-1">
                                            <p className="text-[10px] text-gray-400">
                                                Shift+Enter para pular linha
                                            </p>

                                            {/* Finish Task Button */}
                                            {task.status !== 'Feito' && (
                                                <button
                                                    onClick={handleComplete}
                                                    className="px-3 py-1.5 rounded-lg font-bold text-xs bg-green-50 text-green-700 hover:bg-green-100 transition-all flex items-center gap-1.5"
                                                    title="Concluir Tarefa"
                                                >
                                                    <CheckCircle className="w-3.5 h-3.5" />
                                                    Concluir
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : null}
                </main>
            </div>
        </div>
    )
}

