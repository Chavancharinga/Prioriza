import { useState, useEffect, useRef } from 'react'
import {
    X, Calendar, Clock, CheckSquare, MessageSquare,
    MoreVertical, Trash2, Plus, Send, AlertTriangle,
    Play, Pause, Save, ArrowLeft, CheckCircle, RotateCcw,
    Activity, Sparkles, Loader2, ArrowRight
} from 'lucide-react'
import { TaskService } from '../../services/TaskService'
import { GamificationService } from '../../services/GamificationService'
import { AIService } from '../../services/AIService'
import Button from '../ui/Button'
import ConfirmationModal from '../ui/ConfirmationModal'
import RichTextEditor from '../ui/RichTextEditor'
import { motion, AnimatePresence } from 'framer-motion'

export default function TaskDetailsModal({ taskId, isOpen, onClose, onUpdate, onNavigate, profile }) {
    const workspaceBackgroundImage = encodeURI(`${import.meta.env.BASE_URL}fundo do login e site.png`)

    const [currentTaskId, setCurrentTaskId] = useState(taskId)
    const [task, setTask] = useState(null)
    const [loading, setLoading] = useState(true)
    const [newItem, setNewItem] = useState('')
    const [newNote, setNewNote] = useState('')

    // Bidirectional links states
    const [backlinks, setBacklinks] = useState([])
    const [outgoingLinks, setOutgoingLinks] = useState([])
    const [allTasksForSuggestions, setAllTasksForSuggestions] = useState([])
    const [suggestions, setSuggestions] = useState([])
    const [showSuggestions, setShowSuggestions] = useState(false)

    // Pomodoro Timer state
    const [pomodoroMode, setPomodoroMode] = useState('focus') // 'focus' | 'break'
    const [timeLeft, setTimeLeft] = useState(1500) // 1500 seconds (25 mins)
    const [isPomodoroActive, setIsPomodoroActive] = useState(false)
    const [completedCycles, setCompletedCycles] = useState(0)
    const [hasChanges, setHasChanges] = useState(false)
    const [showExitAlert, setShowExitAlert] = useState(false)
    const [confirmation, setConfirmation] = useState({ isOpen: false, type: 'info', title: '', message: '', onConfirm: () => { } })

    // Rich Text notes description
    const [descriptionHtml, setDescriptionHtml] = useState('')

    // Stopwatch session tracking
    const [sessionTimeSpent, setSessionTimeSpent] = useState(0)

    // AI Suggestions Panel states
    const [aiLoading, setAiLoading] = useState(false)
    const [aiResponse, setAiResponse] = useState(null)
    const [aiError, setAiError] = useState('')

    // Toast notification state
    const [showToast, setShowToast] = useState(false)
    const toastTimeoutRef = useRef(null)

    useEffect(() => {
        setCurrentTaskId(taskId)
    }, [taskId])

    useEffect(() => {
        if (isOpen && currentTaskId) {
            loadTaskDetails()
            setHasChanges(false)
            // Load suggestions once when modal opens
            TaskService.getTasks().then(data => {
                setAllTasksForSuggestions(data || [])
            }).catch(console.error)
        } else {
            console.log('Resetting task details')
            setTask(null)
            setDescriptionHtml('')
            setNewNote('')
            setNewItem('')
            setBacklinks([])
            setOutgoingLinks([])
            setShowSuggestions(false)
            setLoading(false)
            setHasChanges(false)
            // Reset Pomodoro
            setPomodoroMode('focus')
            setTimeLeft(1500)
            setIsPomodoroActive(false)
            setCompletedCycles(0)
            setSessionTimeSpent(0)
            setAiResponse(null)
            setAiLoading(false)
            setAiError('')
        }
        return () => setIsPomodoroActive(false)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, currentTaskId])

    // Pomodoro & Stopwatch Ticker Effect
    useEffect(() => {
        let interval = null
        if (isPomodoroActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft(prev => prev - 1)
                if (pomodoroMode === 'focus') {
                    setSessionTimeSpent(prev => prev + 1)
                }
            }, 1000)
        } else if (timeLeft === 0 && isPomodoroActive) {
            handlePomodoroCompletion()
        }
        return () => clearInterval(interval)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isPomodoroActive, timeLeft, pomodoroMode])

    async function handlePomodoroCompletion() {
        setIsPomodoroActive(false)
        
        if (pomodoroMode === 'focus') {
            try {
                // Log session in Supabase (25 mins = 1500s)
                await TaskService.logPomodoroSession(currentTaskId, 1500)
                
                // Increment local task duration
                const updatedTimeSpent = (task.time_spent || 0) + 1500
                await TaskService.updateTask(currentTaskId, { time_spent: updatedTimeSpent })
                setTask(prev => ({ ...prev, time_spent: updatedTimeSpent }))
                
                setCompletedCycles(prev => prev + 1)
                setSessionTimeSpent(0) // Reset stopwatch focus session seconds since logged
                
                // Award XP & Streak
                try {
                    const result = await GamificationService.awardXp(50) // 50 XP per pomodoro session
                    if (result && result.levelUp) {
                        setConfirmation({
                            isOpen: true,
                            type: 'success',
                            title: 'SUBIU DE NÍVEL!',
                            message: `Parabéns! Você alcançou o Nível ${result.newLevel}! Continue com a consistência!`,
                            confirmText: 'Vamos lá!',
                            onConfirm: () => setConfirmation(prev => ({ ...prev, isOpen: false }))
                        })
                    }
                } catch (gameErr) {
                    console.error('Error awarding Pomodoro XP:', gameErr)
                }

                // Switch to Break
                setConfirmation({
                    isOpen: true,
                    type: 'info',
                    title: 'Ciclo de Foco Concluído!',
                    message: 'Ótimo trabalho! Hora de fazer um intervalo de 5 minutos.',
                    confirmText: 'Iniciar Intervalo',
                    onConfirm: () => {
                        setConfirmation(prev => ({ ...prev, isOpen: false }))
                        setPomodoroMode('break')
                        setTimeLeft(300)
                        setIsPomodoroActive(true)
                    }
                })
            } catch (err) {
                console.error('Error logging pomodoro:', err)
            }
        } else {
            // Break completed
            setConfirmation({
                isOpen: true,
                type: 'info',
                title: 'Intervalo Concluído!',
                message: 'Hora de voltar ao trabalho! Pronto para mais um ciclo de foco?',
                confirmText: 'Iniciar Foco',
                onConfirm: () => {
                    setConfirmation(prev => ({ ...prev, isOpen: false }))
                    setPomodoroMode('focus')
                    setTimeLeft(1500)
                    setIsPomodoroActive(true)
                }
            })
        }
        onUpdate?.()
    }

    async function loadTaskDetails(silent = false) {
        try {
            if (!silent) setLoading(true)
            const data = await TaskService.getTaskDetails(currentTaskId)

            setTask(data)
            setDescriptionHtml(data?.description || '')
            
            // Load relations
            const [bls, outLinks] = await Promise.all([
                TaskService.getBacklinks(currentTaskId),
                TaskService.getOutgoingLinks(currentTaskId)
            ])
            setBacklinks(bls)
            setOutgoingLinks(outLinks)
        } catch (error) {
            console.error('Error loading task:', error)
        } finally {
            setLoading(false)
        }
    }

    async function handleSave() {
        try {
            setHasChanges(false)

            const promises = []

            if (sessionTimeSpent > 0 && task) {
                const secondsToSave = sessionTimeSpent
                const updatedTimeSpent = (task.time_spent || 0) + secondsToSave
                setTask(prev => ({ ...prev, time_spent: updatedTimeSpent }))
                setSessionTimeSpent(0)
                promises.push(TaskService.updateTask(currentTaskId, { time_spent: updatedTimeSpent }))
            }

            if (task) {
                promises.push(TaskService.updateTask(currentTaskId, { description: descriptionHtml }))
            }

            if (newNote.trim()) {
                const noteText = newNote
                setNewNote('')
                
                // Optimistically append note
                const tempId = Math.random()
                const tempNote = {
                    id: tempId,
                    content: noteText,
                    created_at: new Date().toISOString()
                }
                setTask(prev => ({
                    ...prev,
                    task_notes: [...(prev.task_notes || []), tempNote]
                }))
                
                promises.push(
                    TaskService.createNote(currentTaskId, noteText)
                        .then(realNote => {
                            setTask(prev => ({
                                ...prev,
                                task_notes: prev.task_notes.map(n => n.id === tempId ? realNote : n)
                            }))
                        })
                )
            }

            // Run in parallel background, update silent when complete
            Promise.all(promises).then(() => {
                loadTaskDetails(true)
                onUpdate?.()
                
                // Show success toast notification
                if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current)
                setShowToast(true)
                toastTimeoutRef.current = setTimeout(() => setShowToast(false), 3000)
            }).catch(err => {
                console.error("Background save failed:", err)
            })

        } catch (error) {
            console.error('Error saving:', error)
        }
    }

    function executeCompletion(finalXpAward, feedbackMessage, isPenalty, noCelebration = false) {
        // Optimistically calculate projected Level & XP
        const currentXp = profile?.xp || 0
        const currentLevel = profile?.level || 1
        let projectedXp = currentXp + finalXpAward
        let projectedLevel = currentLevel
        let levelUp = false

        if (finalXpAward >= 0) {
            while (projectedXp >= 1000 && projectedLevel < 10) {
                projectedXp -= 1000
                projectedLevel += 1
                levelUp = true
            }
            if (projectedLevel >= 10 && projectedXp > 1000) {
                projectedXp = 1000
            }
        } else {
            while (projectedXp < 0 && projectedLevel > 1) {
                projectedLevel -= 1
                projectedXp += 1000
            }
            if (projectedXp < 0) {
                projectedXp = 0
            }
        }

        let levelMsg = ''
        if (levelUp) {
            levelMsg = `\n\nSUBIU DE NÍVEL!\nVocê alcançou o Nível ${projectedLevel}!`
        } else if (projectedLevel < currentLevel) {
            levelMsg = `\n\nLEVEL DOWN!\nVocê caiu para o Nível ${projectedLevel} devido às penalidades.`
        }

        // Immediately display celebration ConfirmationModal
        setConfirmation({
            isOpen: true,
            type: noCelebration ? 'info' : (isPenalty ? 'danger' : 'success'),
            title: noCelebration ? 'Tarefa Concluída' : (isPenalty ? 'Tarefa Concluída com Atraso' : 'Parabéns!'),
            message: `${feedbackMessage}${levelMsg}`,
            confirmText: 'Ok',
            onConfirm: () => {
                setConfirmation(prev => ({ ...prev, isOpen: false }))
                onClose()
                if (onNavigate && !isPenalty) {
                    // Change menu on completion! Redirect to planning
                    onNavigate('planning')
                }
            }
        })

        // Run database writes in background in parallel
        setIsPomodoroActive(false)
        const finalTimeSpent = (task.time_spent || 0) + sessionTimeSpent
        setSessionTimeSpent(0)

        const bgPromises = []

        if (newNote.trim()) {
            bgPromises.push(TaskService.createNote(currentTaskId, newNote))
            setNewItem('')
            setNewNote('')
        }

        bgPromises.push(TaskService.completeTask(task.id, finalTimeSpent, null))
        bgPromises.push(TaskService.updateTask(currentTaskId, { description: descriptionHtml }))
        bgPromises.push(GamificationService.awardXp(finalXpAward))

        Promise.all(bgPromises).then(() => {
            onUpdate?.()
        }).catch(err => {
            console.error("Background task completion failed:", err)
        })
    }

    function handleComplete() {
        const totalChecklist = task?.checklist_items?.length || 0
        const completedChecklist = task?.checklist_items?.filter(i => i.is_completed).length || 0
        const pendingChecklist = totalChecklist - completedChecklist

        if (pendingChecklist > 0) {
            setConfirmation({
                isOpen: true,
                type: 'danger',
                title: 'Sub-tarefas Pendentes!',
                message: `Esta tarefa possui ${pendingChecklist} sub-tarefa(s) pendente(s) na checklist.\n\nSe concluir agora, isso não será considerado uma vitória e você não ganhará pontos de XP por esta tarefa.\n\nDeseja concluir sem ganhar pontos (0 XP) ou prefere voltar e terminar a checklist?`,
                confirmText: 'Concluir sem XP',
                cancelText: 'Voltar e Terminar',
                onConfirm: () => {
                    setConfirmation(prev => ({ ...prev, isOpen: false }))
                    executeCompletion(0, 'Tarefa concluída sem vitória (0 XP concedidos devido a checklist pendente).', false, true)
                }
            })
        } else {
            setConfirmation({
                isOpen: true,
                type: 'info',
                title: 'Concluir Tarefa',
                message: 'Tem certeza que deseja marcar esta tarefa como concluída? O cronômetro será parado.',
                confirmText: 'Concluir Tarefa',
                onConfirm: () => {
                    setConfirmation(prev => ({ ...prev, isOpen: false }))
                    const priorityXp = (6 - (task.priority || 3)) * 50
                    let finalXpAward = priorityXp
                    let feedbackMessage = ''
                    let isPenalty = false

                    if (task.due_date) {
                        const now = new Date()
                        const due = new Date(task.due_date)
                        if (now <= due) {
                            finalXpAward += 150
                            feedbackMessage = `Sensacional! Tarefa concluída antes do prazo. Você ganhou ${priorityXp} XP (prioridade) + 150 XP de bônus de pontualidade!`
                        } else {
                            finalXpAward = -100
                            isPenalty = true
                            feedbackMessage = `Tarefa concluída após o prazo! Você perdeu 100 XP de penalidade.`
                        }
                    } else {
                        feedbackMessage = `Tarefa concluída com sucesso! Você ganhou ${priorityXp} XP de prioridade.`
                    }

                    executeCompletion(finalXpAward, feedbackMessage, isPenalty, false)
                }
            })
        }
    }

    function handleReactivate() {
        setConfirmation({
            isOpen: true,
            type: 'info',
            title: 'Reativar Tarefa',
            message: 'Deseja reativar esta tarefa e movê-la de volta para "Em Progresso"?',
            confirmText: 'Reativar',
            onConfirm: async () => {
                try {
                    await TaskService.updateTask(task.id, {
                        status: 'Em Progresso',
                        completed_at: null
                    })
                    await loadTaskDetails(true)
                    onUpdate?.()
                    setConfirmation({
                        isOpen: true,
                        type: 'success',
                        title: 'Tarefa Reativada',
                        message: 'A tarefa está ativa novamente. Você pode continuar trabalhando nela!',
                        confirmText: 'Ok',
                        onConfirm: () => setConfirmation(prev => ({ ...prev, isOpen: false }))
                    })
                } catch (error) {
                    console.error('Error reactivating task:', error)
                    setConfirmation({
                        isOpen: true,
                        type: 'danger',
                        title: 'Erro ao Reativar Tarefa',
                        message: error.message || 'Erro desconhecido',
                        confirmText: 'Ok',
                        cancelText: null,
                        onConfirm: () => setConfirmation(prev => ({ ...prev, isOpen: false }))
                    })
                }
            }
        })
    }

    // AI suggestions handlers
    async function handleSuggestSubtasks() {
        setAiLoading(true)
        setAiResponse(null)
        setAiError('')
        try {
            const response = await AIService.suggestSubtasks(task.id)
            setAiResponse(response)
        } catch (error) {
            setAiError(error.message || 'Falha ao gerar sugestões com a IA.')
        } finally {
            setAiLoading(false)
        }
    }

    async function handleSummarizeNotes() {
        setAiLoading(true)
        setAiResponse(null)
        setAiError('')
        try {
            const response = await AIService.summarizeNotes(task.id)
            setAiResponse(response)
        } catch (error) {
            setAiError(error.message || 'Falha ao resumir as anotações com a IA.')
        } finally {
            setAiLoading(false)
        }
    }

    async function handleAddSuggestedSubtask(content) {
        try {
            const newItemObj = await TaskService.createChecklistItem(task.id, content)
            setTask(prev => ({
                ...prev,
                checklist_items: [...(prev.checklist_items || []), newItemObj]
            }))
            setAiResponse(prev => {
                if (!prev || prev.type !== 'subtasks') return prev
                return {
                    ...prev,
                    items: prev.items.filter(item => item !== content)
                }
            })
            setHasChanges(true)
        } catch (err) {
            console.error('Error adding suggested subtask:', err)
        }
    }

    function handleToggleTimer() {
        setIsPomodoroActive(!isPomodoroActive)
        setHasChanges(true)
    }

    function handleResetTimer() {
        setIsPomodoroActive(false)
        setTimeLeft(pomodoroMode === 'focus' ? 1500 : 300)
    }

    function handleSkipTimer() {
        setIsPomodoroActive(false)
        const nextMode = pomodoroMode === 'focus' ? 'break' : 'focus'
        setPomodoroMode(nextMode)
        setTimeLeft(nextMode === 'focus' ? 1500 : 300)
    }

    function formatTime(seconds) {
        const m = Math.floor(seconds / 60)
        const s = seconds % 60
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    }

    function formatSeconds(seconds) {
        if (!seconds) return '0s'
        const h = Math.floor(seconds / 3600)
        const m = Math.floor((seconds % 3600) / 60)
        const s = seconds % 60
        if (h > 0) return `${h}h ${m}m ${s}s`
        if (m > 0) return `${m}m ${s}s`
        return `${s}s`
    }

    function handleBack() {
        const isTimerRunning = isPomodoroActive
        const hasUnsavedNote = !!newNote.trim()
        const hasUnsavedRichText = descriptionHtml !== (task?.description || '')

        if (isTimerRunning || hasUnsavedNote || hasUnsavedRichText || hasChanges || sessionTimeSpent > 0) {
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
        const noteText = newNote
        setNewNote('')

        try {
            // Optimistically append note
            const tempId = Math.random()
            const tempNote = {
                id: tempId,
                content: noteText,
                created_at: new Date().toISOString()
            }
            setTask(prev => ({
                ...prev,
                task_notes: [...(prev.task_notes || []), tempNote]
            }))

            const realNote = await TaskService.createNote(task.id, noteText)

            // Replace temporary note with the real one from db
            setTask(prev => ({
                ...prev,
                task_notes: prev.task_notes.map(n => n.id === tempId ? realNote : n)
            }))
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

    function handleNoteChange(e) {
        const val = e.target.value
        setNewNote(val)

        const cursorPosition = e.target.selectionStart
        const textBeforeCursor = val.slice(0, cursorPosition)
        const openBracketIndex = textBeforeCursor.lastIndexOf('[[')
        const closeBracketIndex = textBeforeCursor.lastIndexOf(']]')

        if (openBracketIndex > closeBracketIndex) {
            const query = textBeforeCursor.slice(openBracketIndex + 2).toLowerCase()
            const filtered = allTasksForSuggestions.filter(t =>
                t.title.toLowerCase().includes(query) && t.id !== currentTaskId
            )
            setSuggestions(filtered)
            setShowSuggestions(filtered.length > 0)
        } else {
            setShowSuggestions(false)
        }
    }

    function handleSelectSuggestion(suggestedTask) {
        const openBracketIndex = newNote.lastIndexOf('[[')
        if (openBracketIndex !== -1) {
            const startText = newNote.slice(0, openBracketIndex)
            const completedNote = startText + `[[${suggestedTask.title}]] `
            setNewNote(completedNote)
        }
        setShowSuggestions(false)
    }


    if (!isOpen) return null

    return (
        // Full-screen workspace with dark mode support
        <div
            className="fixed inset-0 z-50 flex flex-col animate-in fade-in zoom-in-95 duration-200 overflow-hidden bg-(--color-surface)"
        >
            {!loading && task && (
                <div
                    aria-hidden="true"
                    className="pointer-events-none fixed inset-0 z-0"
                    style={{
                        backgroundImage: `url("${workspaceBackgroundImage}")`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center top',
                        backgroundRepeat: 'no-repeat',
                        transform: 'translateZ(0)',
                    }}
                />
            )}

            <div className="relative z-10 flex flex-col flex-1 min-h-0">

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
                onConfirm={confirmation.onConfirm || (() => setConfirmation(prev => ({ ...prev, isOpen: false })))}
                title={confirmation.title}
                message={confirmation.message}
                type={confirmation.type}
                confirmText={confirmation.confirmText}
                cancelText={confirmation.cancelText === undefined ? null : confirmation.cancelText}
            />

            {/* Header - Full Width */}
            <div className="bg-white border-b-2 border-slate-200 shadow-sm shrink-0 z-10">
                <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                        <button
                            onClick={handleBack}
                            className="p-2 text-slate-600 bg-white border-2 border-slate-200 border-b-[4px] border-b-slate-350 active:translate-y-[2px] active:border-b-[2px] rounded-xl mr-2 shrink-0 flex items-center justify-center transition-all"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
 
                        {loading ? (
                            <div className="h-6 w-64 bg-gray-200 rounded animate-pulse"></div>
                        ) : task ? (
                            <div className="flex items-center gap-4 min-w-0">
                                <h2 className="text-sm sm:text-base md:text-xl font-black text-slate-800 truncate max-w-[100px] sm:max-w-xs md:max-w-md" title={task.title}>{task.title}</h2>
                                <span className={`hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold shrink-0 
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
 
                    <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                        {task && task.status !== 'Feito' && (
                            <button
                                onClick={handleComplete}
                                className="px-3.5 py-2 sm:px-5 sm:py-2 bg-emerald-500 text-white rounded-2xl text-xs sm:text-sm font-black border-2 border-emerald-600 border-b-[5px] border-b-emerald-700 flex items-center gap-2 transition-all cursor-pointer active:translate-y-[2px] active:border-b-[2px]"
                            >
                                <CheckCircle className="w-4 h-4" />
                                <span className="hidden md:inline">Concluir</span>
                            </button>
                        )}
                        {task && task.status === 'Feito' && (!task.due_date || new Date() <= new Date(task.due_date)) && (
                            <button
                                onClick={handleReactivate}
                                className="px-3.5 py-2 sm:px-5 sm:py-2 bg-blue-500 text-white rounded-2xl text-xs sm:text-sm font-black border-2 border-blue-600 border-b-[5px] border-b-blue-700 flex items-center gap-2 transition-all cursor-pointer active:translate-y-[2px] active:border-b-[2px]"
                            >
                                <RotateCcw className="w-4 h-4" />
                                <span className="hidden md:inline">Ativar</span>
                            </button>
                        )}
                        <button
                            onClick={handleSave}
                            disabled={!task}
                            className="px-3.5 py-2 sm:px-5 sm:py-2 bg-slate-900 text-white rounded-2xl text-xs sm:text-sm font-black border-2 border-slate-950 border-b-[5px] border-b-slate-950 flex items-center gap-2 transition-all cursor-pointer active:translate-y-[2px] active:border-b-[2px] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Save className="w-4 h-4" />
                            <span className="hidden md:inline">Salvar</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content - Scrollable Workspace */}
            <div className="flex-1 overflow-y-auto">
                <main className="max-w-[1600px] mx-auto p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {loading ? (
                        <div className="col-span-12 flex justify-center py-32">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                    ) : task ? (
                        <>
                            {/* Left Column: Timer & Metadata (Sticky on Desktop) */}
                            <div className="lg:col-span-3 space-y-6 order-2 lg:order-none">
                                {/* Timer Widget - Hero Style */}
                                <div className={`bg-linear-to-br rounded-3xl p-8 text-white relative overflow-hidden transition-all duration-500 border-2 border-b-[6px] shadow-sm ${
                                    pomodoroMode === 'focus' 
                                        ? 'from-rose-500 to-red-600 border-red-700 border-b-red-800' 
                                        : 'from-emerald-500 to-green-600 border-green-700 border-b-green-800'
                                }`}>
                                    <div className="absolute top-0 right-0 p-8 opacity-10">
                                        <Clock className="w-32 h-32" />
                                    </div>

                                    <div className="relative z-10 flex flex-col items-center text-center">
                                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-black uppercase tracking-wider mb-2 backdrop-blur-sm">
                                            <Clock className="w-3 h-3" />
                                            {pomodoroMode === 'focus' ? 'Foco Pomodoro' : 'Intervalo'}
                                        </div>

                                        <div className="text-[10px] font-bold text-white/70 uppercase mb-3 tracking-widest">
                                            Ciclos concluídos: {completedCycles}
                                        </div>

                                        <div className="text-6xl font-mono font-bold mb-6 tracking-tight tabular-nums drop-shadow-sm">
                                            {formatTime(timeLeft)}
                                        </div>

                                        <button
                                            onClick={handleToggleTimer}
                                            disabled={task.status === 'Feito'}
                                            className={`w-full py-3.5 rounded-xl font-black text-base flex items-center justify-center gap-3 transition-all ${
                                                task.status === 'Feito'
                                                    ? 'bg-white/20 text-white/50 cursor-not-allowed shadow-none'
                                                    : isPomodoroActive
                                                        ? 'bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md active:translate-y-[1px]'
                                                        : pomodoroMode === 'focus'
                                                            ? 'bg-white text-red-600 border-2 border-red-100 border-b-[5px] border-b-red-200 hover:bg-red-50 cursor-pointer active:translate-y-[2px] active:border-b-[2px]'
                                                            : 'bg-white text-emerald-600 border-2 border-emerald-100 border-b-[5px] border-b-emerald-200 hover:bg-emerald-50 cursor-pointer active:translate-y-[2px] active:border-b-[2px]'
                                            }`}
                                        >
                                            {task.status === 'Feito' ? (
                                                <>
                                                    <CheckCircle className="w-6 h-6" /> TAREFA CONCLUÍDA
                                                </>
                                            ) : isPomodoroActive ? (
                                                <>
                                                    <Pause className="w-6 h-6 fill-current" /> PAUSAR TIMER
                                                </>
                                            ) : (
                                                <>
                                                    <Play className="w-6 h-6 fill-current" /> INICIAR {pomodoroMode === 'focus' ? 'FOCO' : 'BREAK'}
                                                </>
                                            )}
                                        </button>

                                        {task.status !== 'Feito' && (
                                            <div className="flex gap-2 w-full mt-4">
                                                <button
                                                    onClick={handleResetTimer}
                                                    className="flex-1 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all border-2 border-white/10 border-b-[4px] border-b-white/20 active:translate-y-[1px] active:border-b-[2px]"
                                                >
                                                    Reiniciar
                                                </button>
                                                <button
                                                    onClick={handleSkipTimer}
                                                    className="flex-1 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all border-2 border-white/10 border-b-[4px] border-b-white/20 active:translate-y-[1px] active:border-b-[2px]"
                                                >
                                                    Pular
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Progresso de Foco Real (Stopwatch) */}
                                <div className="card-3d p-5 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="p-1 bg-amber-50 rounded text-amber-600">
                                                <Activity className="w-4 h-4" />
                                            </div>
                                            <h4 className="text-xs text-gray-500 uppercase font-bold">
                                                Cronômetro de Foco Real
                                            </h4>
                                        </div>
                                        {isPomodoroActive && pomodoroMode === 'focus' && (
                                            <span className="flex h-2 w-2 relative">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                            </span>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 border-b border-gray-150 pb-3">
                                        <div>
                                            <p className="text-[10px] text-gray-400 uppercase font-bold">Nesta Sessão</p>
                                            <p className="text-lg font-black text-slate-800 font-mono">{formatTime(sessionTimeSpent)}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-gray-400 uppercase font-bold">Tempo Total</p>
                                            <p className="text-lg font-black text-slate-800 font-mono">{formatSeconds((task.time_spent || 0) + sessionTimeSpent)}</p>
                                        </div>
                                    </div>

                                    {/* Progression against estimation */}
                                    <div>
                                        <div className="flex justify-between items-center mb-1.5 text-[10px]">
                                            <span className="text-gray-400 font-bold uppercase">Meta de Estimativa</span>
                                            <span className="text-gray-600 font-black">
                                                {task.estimated_minutes ? `${task.estimated_minutes}m` : 'Sem meta'}
                                            </span>
                                        </div>
                                        {task.estimated_minutes ? (
                                            (() => {
                                                const totalSeconds = (task.time_spent || 0) + sessionTimeSpent
                                                const estimatedSeconds = task.estimated_minutes * 60
                                                const percent = Math.min(100, Math.round((totalSeconds / estimatedSeconds) * 100))
                                                const isOver = totalSeconds > estimatedSeconds
                                                return (
                                                    <div className="space-y-1.5">
                                                        <div className="h-2.5 w-full bg-slate-100 border border-slate-200 rounded-full overflow-hidden flex items-center p-[0.5px] shadow-inner">
                                                            <div
                                                                className={`h-full rounded-full transition-all duration-300 ${isOver ? 'bg-linear-to-r from-orange-400 to-amber-500' : 'bg-linear-to-r from-blue-400 to-indigo-500'}`}
                                                                style={{ width: `${percent}%` }}
                                                            />
                                                        </div>
                                                        <div className="flex justify-between text-[9px] font-medium">
                                                            <span className="text-gray-400">{percent}% do planejado</span>
                                                            {isOver && <span className="text-orange-600 font-bold">Estimativa excedida!</span>}
                                                        </div>
                                                    </div>
                                                )
                                            })()
                                        ) : (
                                            <p className="text-[10px] text-gray-400 italic">
                                                Defina uma estimativa nas configurações para acompanhar sua meta.
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Smart Metadata Grid */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="card-3d p-5">
                                        <p className="text-xs text-gray-500 uppercase font-bold mb-2">Estimativa Total</p>
                                        <div className="flex items-center gap-2 text-(--color-text-primary)">
                                            <Clock className="w-5 h-5 text-gray-400" />
                                            <span className="text-xl font-bold">{task.estimated_minutes || 0}m</span>
                                        </div>
                                    </div>
                                    <div className="card-3d p-5">
                                        <p className="text-xs text-gray-500 uppercase font-bold mb-2">Prioridade</p>
                                        <div className="flex items-center gap-2">
                                            <div className={`w-3 h-3 rounded-full ${
                                                task.priority === 1 ? 'bg-rose-600' :
                                                task.priority === 2 ? 'bg-red-500' :
                                                task.priority === 3 ? 'bg-orange-500' :
                                                task.priority === 4 ? 'bg-yellow-500' :
                                                'bg-blue-500'
                                            }`}></div>
                                            <span className="text-sm font-bold text-(--color-text-primary)">
                                                {task.priority === 1 ? 'Crítica' :
                                                    task.priority === 2 ? 'Alta' :
                                                        task.priority === 3 ? 'Média' :
                                                            task.priority === 4 ? 'Baixa' : 'Mínima'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="col-span-2 card-3d p-5">
                                        <div className="flex items-center gap-3">
                                            <Calendar className={`w-5 h-5 ${task.due_date ? 'text-blue-500' : 'text-gray-400'}`} />
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase font-bold">Prazo Final</p>
                                                <p className="text-sm font-medium text-(--color-text-primary)">
                                                    {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'Sem prazo definido'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Bidirectional Links Widget */}
                                <div className="card-3d p-5 space-y-4">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1 bg-blue-50 rounded text-blue-500">
                                            <Activity className="w-4 h-4" />
                                        </div>
                                        <h4 className="text-xs text-gray-500 uppercase font-bold">
                                            Referências Bidirecionais
                                        </h4>
                                    </div>
                                    <div className="space-y-3">
                                        <div>
                                            <h5 className="text-[10px] text-gray-400 uppercase font-extrabold mb-1">Mencionam esta tarefa (Backlinks)</h5>
                                            {backlinks.length === 0 ? (
                                                <p className="text-xs text-gray-400 italic">Nenhum backlink registrado.</p>
                                            ) : (
                                                <div className="space-y-1">
                                                    {backlinks.map(bl => (
                                                        <button
                                                            key={bl.id}
                                                            onClick={() => setCurrentTaskId(bl.id)}
                                                            className="block text-left text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline truncate w-full"
                                                        >
                                                            • {bl.title}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <div className="border-t border-gray-100 pt-3">
                                            <h5 className="text-[10px] text-gray-400 uppercase font-extrabold mb-1">Mencionadas nesta tarefa (Outgoing)</h5>
                                            {outgoingLinks.length === 0 ? (
                                                <p className="text-xs text-gray-400 italic">Nenhuma tarefa linkada nas notas.</p>
                                            ) : (
                                                <div className="space-y-1">
                                                    {outgoingLinks.map(ol => (
                                                        <button
                                                            key={ol.id}
                                                            onClick={() => setCurrentTaskId(ol.id)}
                                                            className="block text-left text-xs font-semibold text-green-600 hover:text-green-800 hover:underline truncate w-full"
                                                        >
                                                            • {ol.title}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Middle Column: Details & Checklist */}
                            <div className="lg:col-span-5 space-y-8 order-1 lg:order-none">
                                {/* Rich Text Notes Notepad */}
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                                            <MessageSquare className="w-4 h-4" />
                                        </div>
                                        <h4 className="text-xs text-slate-500 uppercase font-bold tracking-wider">
                                            Bloco de Notas
                                        </h4>
                                    </div>
                                    <div className="card-3d overflow-hidden h-[400px] flex flex-col">
                                        <RichTextEditor
                                            content={descriptionHtml}
                                            onChange={(html) => {
                                                setDescriptionHtml(html)
                                                setHasChanges(true)
                                            }}
                                            placeholder="Digite aqui anotações importantes para a tarefa... coloque texto em negrito, H1, H2, itálico, ou use o marca-textos!"
                                        />
                                    </div>
                                </div>
 
                                {/* Interactive Checklist */}
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
                                                <CheckSquare className="w-4 h-4" />
                                            </div>
                                            <h4 className="text-xs text-slate-500 uppercase font-bold tracking-wider">
                                                Checklist
                                            </h4>
                                        </div>
                                        <span className="text-xs font-bold px-3 py-1 bg-slate-100 border border-slate-200 rounded-full text-slate-600 shadow-inner">
                                            {task.checklist_items?.filter(i => i.is_completed).length}/{task.checklist_items?.length || 0}
                                        </span>
                                    </div>

                                    <div className="card-3d overflow-hidden flex flex-col h-[380px]">
                                        {/* Always-visible Clean Progress Bar */}
                                        <div className="p-4 bg-slate-50/50 border-b border-slate-100 shrink-0">
                                            <div className="flex items-center justify-between mb-1.5 text-[10px]">
                                                <span className="text-slate-400 font-extrabold uppercase tracking-wider">Progresso da Checklist</span>
                                                <span className="text-slate-600 font-black">
                                                    {task.checklist_items?.length > 0
                                                        ? `${Math.round((task.checklist_items.filter(i => i.is_completed).length / task.checklist_items.length) * 100)}%`
                                                        : '0%'
                                                    }
                                                </span>
                                            </div>
                                            <div className="h-3.5 w-full bg-slate-100 border border-slate-200 rounded-full overflow-hidden flex items-center p-[0.5px] shadow-inner">
                                                <div
                                                    className="h-full bg-linear-to-r from-emerald-400 to-green-500 rounded-full transition-all duration-300"
                                                    style={{
                                                        width: `${task.checklist_items?.length > 0
                                                            ? (task.checklist_items.filter(i => i.is_completed).length / task.checklist_items.length) * 100
                                                            : 0}%`
                                                    }}
                                                />
                                            </div>
                                            {task.checklist_items?.length === 0 && (
                                                <p className="text-[10px] text-slate-400 italic mt-1.5">Nenhum item adicionado ainda.</p>
                                            )}
                                        </div>

                                        {/* Scrollable list of items */}
                                        <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-2">
                                            {task.checklist_items?.map(item => (
                                                <div key={item.id} className="flex items-start gap-3 group py-2 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 rounded-lg transition-colors px-2 -mx-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={item.is_completed}
                                                        onChange={() => handleToggleCheckitem(item.id, item.is_completed)}
                                                        className="mt-1 w-5 h-5 rounded-lg border-2 border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer transition-all active:scale-90"
                                                    />
                                                    <span className={`text-sm flex-1 wrap-break-word transition-all ${item.is_completed ? 'text-gray-400 line-through decoration-gray-300' : 'text-slate-700 font-bold'}`}>
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
                                            {task.checklist_items?.length === 0 && (
                                                <div className="h-full flex items-center justify-center text-gray-400 italic text-xs py-8">
                                                    Nenhuma sub-tarefa adicionada.
                                                </div>
                                            )}
                                        </div>

                                        {/* Fixed input form at bottom */}
                                        <div className="p-4 border-t border-slate-100 bg-white shrink-0">
                                            <form onSubmit={handleAddCheckitem} className="flex gap-2">
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
                                                        className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 transition-all focus:bg-white disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                                                    />
                                                </div>
                                                <button
                                                    type="submit"
                                                    disabled={!newItem.trim() || task.status === 'Feito'}
                                                    className="px-4 py-2 bg-blue-500 text-white rounded-xl text-sm font-black border-2 border-blue-600 border-b-[4px] border-b-blue-700 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:translate-y-0 disabled:active:border-b-[4px] transition-all cursor-pointer active:translate-y-[2px] active:border-b-[2px] flex items-center justify-center"
                                                >
                                                    <Plus className="w-5 h-5" />
                                                </button>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: AI Copilot & Diário de Bordo */}
                            <div className="lg:col-span-4 space-y-6 order-3 lg:order-none">
                                {/* AI Copilot Card */}
                                <div className="card-3d p-5 space-y-4">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                                            <Sparkles className="w-4 h-4" />
                                        </div>
                                        <h4 className="text-xs text-slate-500 uppercase font-bold tracking-wider">Copiloto de IA</h4>
                                    </div>

                                    <p className="text-[11px] text-gray-550 leading-relaxed">
                                        Olá! Sou o seu assistente de produtividade. Posso analisar suas anotações e propor sub-tarefas para você focar.
                                    </p>

                                    <div className="flex flex-col gap-2">
                                        <button
                                            onClick={handleSuggestSubtasks}
                                            disabled={aiLoading || task.status === 'Feito'}
                                            className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black border-2 border-slate-950 border-b-[4px] border-b-slate-950 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:translate-y-0 disabled:active:border-b-[4px] transition-all cursor-pointer active:translate-y-[2px] active:border-b-[2px] flex items-center justify-center gap-1.5"
                                        >
                                            {aiLoading && aiResponse === null ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                                            Sugerir sub-tarefas
                                        </button>
                                        <button
                                            onClick={handleSummarizeNotes}
                                            disabled={aiLoading || task.status === 'Feito'}
                                            className="w-full py-2.5 bg-white text-slate-700 border-2 border-slate-200 border-b-[4px] border-b-slate-300 rounded-xl text-xs font-black hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:translate-y-0 disabled:active:border-b-[4px] transition-all cursor-pointer active:translate-y-[2px] active:border-b-[2px] flex items-center justify-center gap-1.5"
                                        >
                                            {aiLoading && aiResponse === null ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <MessageSquare className="w-3.5 h-3.5" />}
                                            Resumir anotações
                                        </button>
                                    </div>

                                    {aiError && (
                                        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
                                            {aiError}
                                        </div>
                                    )}

                                    {/* AI Response Display */}
                                    {aiLoading && (
                                        <div className="flex items-center justify-center gap-2 py-4 text-xs text-slate-400">
                                            <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                                            <span>Analisando contexto...</span>
                                        </div>
                                    )}

                                    {aiResponse && (
                                        <div className="bg-slate-50/50 rounded-2xl p-4 border-2 border-slate-150 text-xs animate-in fade-in duration-300 max-h-[220px] overflow-y-auto">
                                            <h5 className="font-bold text-slate-800 mb-2 flex items-center gap-1">
                                                <Sparkles className="w-3 h-3 text-blue-500" />
                                                {aiResponse.title}
                                            </h5>
                                            
                                            {aiResponse.type === 'subtasks' ? (
                                                <div className="space-y-2">
                                                    {aiResponse.items.length === 0 ? (
                                                        <p className="text-[10px] text-slate-400 italic">Todas as sugestões foram adicionadas!</p>
                                                    ) : (
                                                        aiResponse.items.map((item, index) => (
                                                            <div key={index} className="flex items-center justify-between gap-2 p-1.5 bg-white rounded border border-slate-100 hover:border-blue-200 transition-colors">
                                                                <span className="text-[10px] text-slate-600 leading-snug">{item}</span>
                                                                <button
                                                                    onClick={() => handleAddSuggestedSubtask(item)}
                                                                    className="p-1 text-blue-600 hover:bg-blue-50 rounded shrink-0"
                                                                    title="Adicionar à Checklist"
                                                                >
                                                                    <Plus className="w-3.5 h-3.5" />
                                                                </button>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                            ) : (
                                                <p className="text-[10px] text-slate-600 leading-relaxed whitespace-pre-wrap">{aiResponse.text}</p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Diário de Bordo */}
                                <div className="card-3d flex flex-col h-[400px] overflow-hidden sticky top-6">
                                    <div className="p-4 border-b border-slate-100 flex items-center justify-between shrink-0">
                                        <h4 className="text-xs text-slate-500 uppercase font-bold tracking-wider flex items-center gap-2">
                                            <MessageSquare className="w-4 h-4 text-blue-500" />
                                            Diário de Bordo
                                        </h4>
                                    </div>

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
                                                <div className="w-6 h-6 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-600 text-[10px] font-black shrink-0 mt-1 shadow-xs">
                                                    U
                                                </div>
                                                <div className="flex-1">
                                                    <div className="bg-white p-3.5 rounded-2xl rounded-tl-none border-2 border-slate-100 shadow-xs relative group hover:border-slate-200 transition-all">
                                                        <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">{note.content}</p>
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
                                    <div className="p-3.5 bg-white border-t border-slate-100 relative shrink-0">
                                        <form onSubmit={handleAddNote} className="relative">
                                            <textarea
                                                value={newNote}
                                                onChange={handleNoteChange}
                                                disabled={task.status === 'Feito'}
                                                placeholder={task.status === 'Feito' ? "Tarefa concluída. Não é possível adicionar notas." : "Registrar atividade (use [[ para linkar)..."}
                                                className="w-full pl-4 pr-12 py-3 text-sm bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 resize-none h-24 focus:bg-white transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' && !e.shiftKey) {
                                                        e.preventDefault();
                                                        if (newNote.trim()) handleAddNote(e);
                                                    }
                                                }}
                                            />
                                            {showSuggestions && (
                                                <div className="absolute left-0 bottom-full mb-1 w-full max-h-40 overflow-y-auto bg-white border border-gray-200 rounded-xl shadow-xl z-25 p-2 space-y-1">
                                                    <p className="text-[9px] text-gray-400 font-extrabold px-2 py-1 uppercase tracking-wider">Linkar tarefa:</p>
                                                    {suggestions.map(sug => (
                                                        <button
                                                            key={sug.id}
                                                            type="button"
                                                            onClick={() => handleSelectSuggestion(sug)}
                                                            className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors font-medium truncate"
                                                        >
                                                            {sug.title}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                            <button
                                                type="submit"
                                                disabled={!newNote.trim() || task.status === 'Feito'}
                                                className="absolute bottom-3 right-3 p-2.5 bg-blue-500 text-white rounded-xl font-black border-2 border-blue-600 border-b-[4px] border-b-blue-700 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:translate-y-0 disabled:active:border-b-[4px] transition-all cursor-pointer active:translate-y-[2px] active:border-b-[2px] flex items-center justify-center"
                                            >
                                                <Send className="w-4 h-4" />
                                            </button>
                                        </form>
                                        <div className="flex items-center justify-between mt-2 px-1">
                                            <p className="text-[10px] text-gray-400">
                                                Shift+Enter para pular linha
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : null}
                </main>
            </div>

            <AnimatePresence>
                {showToast && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9, x: 20 }}
                        animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95, x: 10 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        className="fixed bottom-6 right-6 z-100 flex items-center gap-3 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-slate-800"
                    >
                        <div className="p-1 bg-emerald-500 rounded-full text-white">
                            <CheckCircle className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-bold leading-tight text-white">Progresso Salvo</span>
                            <span className="text-[10px] text-slate-400 font-medium mt-0.5">As alterações foram salvas com sucesso</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            </div>
        </div>
    )
}

