import { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { X, Calendar, Clock, AlertTriangle, Save } from 'lucide-react'
import Button from '../ui/Button'
import Card from '../ui/Card'

function autoFormatDate(raw) {
    const digits = raw.replace(/\D/g, '').slice(0, 8)
    if (digits.length <= 2) return digits
    if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`
}

function autoFormatTime(raw) {
    const digits = raw.replace(/\D/g, '').slice(0, 4)
    if (digits.length <= 2) return digits
    return `${digits.slice(0, 2)}:${digits.slice(2)}`
}

function formatDateForInput(value) {
    if (!value) return ''
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return ''
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
}

function formatTimeForInput(value) {
    if (!value) return ''
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return ''
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

function parseDateTimeToIso(dateText, timeText, defaultTime = '23:59') {
    const cleanDate = String(dateText || '').trim()
    if (!cleanDate) return null

    const currentYear = new Date().getFullYear()
    const normalized = cleanDate.replace(/\s+/g, '')
    let day
    let month
    let year = currentYear

    const isoMatch = normalized.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/)
    const ptMatch = normalized.match(/^(\d{1,2})[/-](\d{1,2})(?:[/-](\d{2,4}))?$/)

    if (isoMatch) {
        year = Number(isoMatch[1])
        month = Number(isoMatch[2])
        day = Number(isoMatch[3])
    } else if (ptMatch) {
        day = Number(ptMatch[1])
        month = Number(ptMatch[2])
        if (ptMatch[3]) {
            year = Number(ptMatch[3])
            if (year < 100) year += 2000
        }
    } else {
        throw new Error('Use a data no formato dd/mm, por exemplo 21/07. O ano é preenchido automaticamente.')
    }

    if (year < currentYear) year = currentYear

    const cleanTime = String(timeText || defaultTime).trim() || defaultTime
    const timeMatch = cleanTime.match(/^(\d{1,2}):(\d{2})$/)
    if (!timeMatch) throw new Error('Use a hora no formato HH:mm ou deixe em branco.')

    const hour = Number(timeMatch[1])
    const minute = Number(timeMatch[2])
    const parsed = new Date(year, month - 1, day, hour, minute, 0, 0)
    const validDate =
        parsed.getFullYear() === year &&
        parsed.getMonth() === month - 1 &&
        parsed.getDate() === day &&
        hour >= 0 &&
        hour <= 23 &&
        minute >= 0 &&
        minute <= 59

    if (!validDate) throw new Error('Data inválida. Use dia/mês correto, por exemplo 21/07.')
    return parsed.toISOString()
}

export default function TaskModal({ isOpen, onClose, onSubmit, taskToEdit = null }) {
    const [dateError, setDateError] = useState('')
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        priority: 3, // Default Medium
        status: 'A Fazer',
        due_date: '',
        due_time: '',
        reminder: '',
        reminder_time: '',
        estimated_minutes: 30
    })

    useEffect(() => {
        if (taskToEdit) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setFormData({
                title: taskToEdit.title || '',
                description: taskToEdit.description || '',
                priority: taskToEdit.priority || 3,
                status: taskToEdit.status || 'A Fazer',
                due_date: formatDateForInput(taskToEdit.due_date),
                due_time: formatTimeForInput(taskToEdit.due_date),
                reminder: formatDateForInput(taskToEdit.reminder),
                reminder_time: formatTimeForInput(taskToEdit.reminder),
                estimated_minutes: taskToEdit.estimated_minutes || 30
            })
        } else {
            // Reset form for create mode
            setFormData({
                title: '',
                description: '',
                priority: 3,
                status: 'A Fazer',
                due_date: '',
                due_time: '',
                reminder: '',
                reminder_time: '',
                estimated_minutes: 30
            })
        }
        setDateError('')
    }, [taskToEdit, isOpen])

    if (!isOpen || typeof document === 'undefined') return null

    const handleSubmit = (e) => {
        e.preventDefault()
        setDateError('')

        let dueDate = null
        let reminderDate = null
        try {
            dueDate = parseDateTimeToIso(formData.due_date, formData.due_time, '23:59')
            reminderDate = parseDateTimeToIso(formData.reminder, formData.reminder_time, '09:00')

            // Anti-error: prevent setting past dates so user doesn't lose XP
            if (dueDate) {
                const dueObj = new Date(dueDate)
                const now = new Date()
                now.setHours(0, 0, 0, 0) // Start of today
                
                if (dueObj < now) {
                    const isExistingPastDate = taskToEdit && taskToEdit.due_date && 
                        new Date(taskToEdit.due_date).getTime() === dueObj.getTime()
                        
                    if (!isExistingPastDate) {
                        throw new Error('Essa data já não é válida.')
                    }
                }
            }
        } catch (error) {
            setDateError(error.message)
            return
        }

        const payload = {
            title: formData.title,
            description: formData.description,
            priority: formData.priority,
            status: formData.status,
            due_date: dueDate,
            reminder: reminderDate,
            estimated_minutes: formData.estimated_minutes ? parseInt(formData.estimated_minutes) : 30
        }
        onSubmit(payload)
    }

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(30,58,138,0.42)] p-4 backdrop-blur-md">
            <div className="w-full max-w-lg overflow-hidden rounded-[2rem] border border-white/80 bg-white/35 shadow-[0_24px_80px_rgba(15,23,42,0.18)] backdrop-blur-2xl animate-in fade-in zoom-in duration-200">
                <form onSubmit={handleSubmit}>
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-white/70 p-6">
                        <h2 className="text-xl font-bold text-slate-900">
                            {taskToEdit ? 'Editar Tarefa' : 'Nova Tarefa'}
                        </h2>
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-xl bg-white/70 p-2 text-slate-500 shadow-sm transition-colors hover:bg-white hover:text-slate-900"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="max-h-[70vh] space-y-4 overflow-y-auto p-6">
                        {/* Title */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                            <input
                                type="text"
                                required
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                placeholder="O que precisa ser feito?"
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all h-24 resize-none"
                                placeholder="Detalhes adicionais..."
                            />
                        </div>

                        {/* Priority & Minutes */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Prioridade</label>
                                <div className="flex items-center gap-3 h-10">
                                    {[
                                        { bg: 'bg-red-600', value: 1, label: 'Crítica' },
                                        { bg: 'bg-orange-500', value: 2, label: 'Alta' },
                                        { bg: 'bg-amber-400', value: 3, label: 'Média' },
                                        { bg: 'bg-lime-500', value: 4, label: 'Baixa' },
                                        { bg: 'bg-green-500', value: 5, label: 'Mínima' }
                                    ].map((opt) => (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, priority: opt.value })}
                                            title={opt.label}
                                            className={`w-6 h-6 rounded-full transition-all duration-200 shadow-sm
                                                ${opt.bg} 
                                                ${formData.priority === opt.value
                                                    ? 'ring-4 ring-offset-2 scale-110 ring-blue-200! dark:ring-blue-900! border-2 border-white dark:border-(--color-surface)'
                                                    : 'hover:scale-110 opacity-70 hover:opacity-100 border border-black/10'
                                                }`}
                                        />
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Est. Minutos</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={formData.estimated_minutes}
                                    onChange={(e) => setFormData({ ...formData, estimated_minutes: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                    placeholder="Ex: 30"
                                />
                            </div>
                        </div>

                        {/* Dates */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                                    <Calendar className="w-4 h-4" /> Prazo Final
                                </label>
                                <input
                                    type="text"
                                    value={formData.due_date}
                                    onChange={(e) => setFormData({ ...formData, due_date: autoFormatDate(e.target.value) })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                                    placeholder="dd/mm/aaaa"
                                    inputMode="numeric"
                                    maxLength={10}
                                />
                                <input
                                    type="text"
                                    value={formData.due_time}
                                    onChange={(e) => setFormData({ ...formData, due_time: autoFormatTime(e.target.value) })}
                                    className="mt-2 w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                                    placeholder="HH:mm"
                                    inputMode="numeric"
                                    maxLength={5}
                                    aria-label="Hora opcional do prazo"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4" /> Lembrete
                                </label>
                                <input
                                    type="text"
                                    value={formData.reminder}
                                    onChange={(e) => setFormData({ ...formData, reminder: autoFormatDate(e.target.value) })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                                    placeholder="dd/mm/aaaa"
                                    inputMode="numeric"
                                    maxLength={10}
                                />
                                <input
                                    type="text"
                                    value={formData.reminder_time}
                                    onChange={(e) => setFormData({ ...formData, reminder_time: autoFormatTime(e.target.value) })}
                                    className="mt-2 w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                                    placeholder="HH:mm"
                                    inputMode="numeric"
                                    maxLength={5}
                                    aria-label="Hora opcional do lembrete"
                                />
                            </div>
                        </div>

                        {dateError && (
                            <div className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-900">
                                {dateError}
                            </div>
                        )}

                        {/* Status */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <div className="flex rounded-xl bg-white/45 p-1">
                                {['A Fazer', 'Em Progresso', 'Feito'].map((s) => (
                                    <button
                                        key={s}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, status: s })}
                                        className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${formData.status === s
                                            ? 'bg-white text-(--color-prioriza-blue) shadow-sm'
                                            : 'text-slate-500 hover:text-slate-700'
                                            }`}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-3 border-t border-white/70 p-6">
                        <Button variant="secondary" onClick={onClose} type="button">
                            Cancelar
                        </Button>
                        <Button variant="primary" type="submit" className="flex items-center gap-2">
                            <Save className="w-4 h-4" />
                            {taskToEdit ? 'Salvar Alterações' : 'Criar Tarefa'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    )
}
