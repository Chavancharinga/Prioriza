import { useState, useEffect } from 'react'
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
        estimated_minutes: ''
    })

    useEffect(() => {
        if (taskToEdit) {
            setFormData({
                title: taskToEdit.title || '',
                description: taskToEdit.description || '',
                priority: taskToEdit.priority || 3,
                status: taskToEdit.status || 'A Fazer',
                due_date: taskToEdit.due_date ? new Date(taskToEdit.due_date).toISOString().slice(0, 16) : '',
                reminder: taskToEdit.reminder ? new Date(taskToEdit.reminder).toISOString().slice(0, 16) : '',
                estimated_minutes: taskToEdit.estimated_minutes || ''
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
                estimated_minutes: ''
            })
        }
    }, [taskToEdit, isOpen])

    if (!isOpen) return null

    const handleSubmit = (e) => {
        e.preventDefault()
        // Format dates correctly for Supabase (or leave as ISO string from input datetime-local)
        // input type="datetime-local" gives "YYYY-MM-DDTHH:mm" which is ISO compatible
        const payload = {
            ...formData,
            due_date: formData.due_date ? new Date(formData.due_date).toISOString() : null,
            reminder: formData.reminder ? new Date(formData.reminder).toISOString() : null,
            estimated_minutes: formData.estimated_minutes ? parseInt(formData.estimated_minutes) : null
        }
        onSubmit(payload)
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl animate-in fade-in zoom-in duration-200">
                <form onSubmit={handleSubmit}>
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-100">
                        <h2 className="text-xl font-bold text-gray-900">
                            {taskToEdit ? 'Editar Tarefa' : 'Nova Tarefa'}
                        </h2>
                        <button
                            type="button"
                            onClick={onClose}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
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
                                        { bg: 'bg-red-500', value: 1, label: 'Crítica' },
                                        { bg: 'bg-orange-500', value: 2, label: 'Alta' },
                                        { bg: 'bg-yellow-400', value: 3, label: 'Média' },
                                        { bg: 'bg-blue-500', value: 4, label: 'Baixa' },
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
                                                    ? 'ring-4 ring-offset-2 scale-110 !ring-blue-200 dark:!ring-blue-900 border-2 border-white dark:border-[var(--color-surface)]'
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
                                    min="0"
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
                            <div className="flex bg-gray-100 p-1 rounded-lg">
                                {['A Fazer', 'Em Progresso', 'Feito'].map((s) => (
                                    <button
                                        key={s}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, status: s })}
                                        className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${formData.status === s
                                            ? 'bg-white text-blue-600 shadow-sm'
                                            : 'text-gray-500 hover:text-gray-700'
                                            }`}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
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
        </div>
    )
}
