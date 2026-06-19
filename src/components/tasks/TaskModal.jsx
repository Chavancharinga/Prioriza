import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, Calendar, Clock, AlertTriangle, Save } from 'lucide-react'
import Button from '../ui/Button'
import Card from '../ui/Card'

export default function TaskModal({ isOpen, onClose, onSubmit, taskToEdit = null }) {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        priority: 3, // Default Medium
        status: 'A Fazer',
        due_date: '',
        reminder: '',
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
                due_date: taskToEdit.due_date ? new Date(taskToEdit.due_date).toISOString().slice(0, 16) : '',
                reminder: taskToEdit.reminder ? new Date(taskToEdit.reminder).toISOString().slice(0, 16) : '',
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
                reminder: '',
                estimated_minutes: 30
            })
        }
    }, [taskToEdit, isOpen])

    if (!isOpen || typeof document === 'undefined') return null

    const handleSubmit = (e) => {
        e.preventDefault()
        // Format dates correctly for Supabase (or leave as ISO string from input datetime-local)
        // input type="datetime-local" gives "YYYY-MM-DDTHH:mm" which is ISO compatible
        const payload = {
            ...formData,
            due_date: formData.due_date ? new Date(formData.due_date).toISOString() : null,
            reminder: formData.reminder ? new Date(formData.reminder).toISOString() : null,
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
                                    type="datetime-local"
                                    value={formData.due_date}
                                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4" /> Lembrete
                                </label>
                                <input
                                    type="datetime-local"
                                    value={formData.reminder}
                                    onChange={(e) => setFormData({ ...formData, reminder: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                                />
                            </div>
                        </div>

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
