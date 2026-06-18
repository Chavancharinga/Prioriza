import { useState, useEffect, useRef, useCallback } from 'react'
import { User, Mail, Globe, Save, Upload, Loader2, Camera, Calendar, CheckCircle2, Trash2, Plus, LogOut } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { ProfileService } from '../../services/ProfileService'
import { TaskService } from '../../services/TaskService'
import Button from '../ui/Button'
import Card from '../ui/Card'
import ConfirmationModal from '../ui/ConfirmationModal'
import Skeleton from '../ui/Skeleton'

export default function Profile({ profile: appProfile, onProfileUpdate }) {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [generatingMocks, setGeneratingMocks] = useState(false)
    const [confirmation, setConfirmation] = useState({
        isOpen: false,
        type: 'info',
        title: '',
        message: '',
        onConfirm: () => { }
    })
    const [profile, setProfile] = useState({
        username: '',
        full_name: '',
        avatar_url: '',
        email: '',
        preferências: {}
    })
    const [stats, setStats] = useState({ total: 0, done: 0 })
    const fileInputRef = useRef(null)

    const loadProfile = useCallback(async () => {
        try {
            setLoading(true)

            // Use appProfile if available, otherwise fetch
            const userProfile = appProfile || await ProfileService.getProfile()

            // Fetch basic stats for the profile view
            const tasks = await TaskService.getTasks()
            const total = tasks.length
            const done = tasks.filter(t => t.status === 'Feito').length

            setProfile({
                username: userProfile.username || '',
                full_name: userProfile.full_name || '',
                avatar_url: userProfile.avatar_url || '',
                email: userProfile.email || '',
                preferências: userProfile.preferências || {}
            })
            setStats({ total, done })
        } catch (error) {
            console.error('Error loading profile:', error)
        } finally {
            setLoading(false)
        }
    }, [appProfile])

    useEffect(() => {
        loadProfile()
    }, [loadProfile]) // Update internal state if app-wide profile changed

    async function handleUpdateProfile(e) {
        e.preventDefault()
        try {
            setSaving(true)
            const updates = {
                username: profile.username.slice(0, 30),
                full_name: profile.full_name.slice(0, 30),
                avatar_url: profile.avatar_url,
                preferências: profile.preferências || {},
                updated_at: new Date().toISOString(),
            }
            await ProfileService.updateProfile(updates)

            // Trigger app-wide refresh
            if (onProfileUpdate) await onProfileUpdate()

            setConfirmation({
                isOpen: true,
                type: 'success',
                title: 'Perfil Atualizado',
                message: 'Suas informações foram salvas com sucesso.',
                onConfirm: () => setConfirmation(prev => ({ ...prev, isOpen: false }))
            })
        } catch (error) {
            console.error('Error updating profile:', error)
            setConfirmation({
                isOpen: true,
                type: 'error',
                title: 'Erro ao Atualizar',
                message: 'Não foi possível salvar suas alterações. Tente novamente.',
                onConfirm: () => setConfirmation(prev => ({ ...prev, isOpen: false }))
            })
        } finally {
            setSaving(false)
        }
    }

    function updateSlot(day, index, field, value) {
        setProfile(prev => {
            const prefs = { ...prev.preferências }
            const hours = { ...prefs.work_hours }
            const slots = [...(hours[day] || [])]
            slots[index] = { ...slots[index], [field]: value }
            hours[day] = slots
            prefs.work_hours = hours
            return { ...prev, preferências: prefs }
        })
    }

    function removeSlot(day, index) {
        setProfile(prev => {
            const prefs = { ...prev.preferências }
            const hours = { ...prefs.work_hours }
            const slots = (hours[day] || []).filter((_, i) => i !== index)
            hours[day] = slots
            prefs.work_hours = hours
            return { ...prev, preferências: prefs }
        })
    }

    function addSlot(day) {
        setProfile(prev => {
            const prefs = { ...prev.preferências }
            const hours = { ...prefs.work_hours }
            const slots = [...(hours[day] || []), { start: '09:00', end: '17:00' }]
            hours[day] = slots
            prefs.work_hours = hours
            return { ...prev, preferências: prefs }
        })
    }

    async function handleGenerateMockTasks() {
        try {
            setGeneratingMocks(true)
            await TaskService.generateMockTasks()
            
            setConfirmation({
                isOpen: true,
                type: 'success',
                title: 'Dados de Teste Gerados',
                message: 'Inserimos várias tarefas com tempos, estimativas, checklist e prioridades variadas em sua conta para você testar.',
                onConfirm: () => {
                    setConfirmation(prev => ({ ...prev, isOpen: false }))
                    loadProfile()
                }
            })
        } catch (err) {
            console.error('Error generating mock tasks:', err)
            setConfirmation({
                isOpen: true,
                type: 'danger',
                title: 'Erro ao Gerar Tarefas',
                message: err.message,
                onConfirm: () => setConfirmation(prev => ({ ...prev, isOpen: false })),
                cancelText: null
            })
        } finally {
            setGeneratingMocks(false)
        }
    }

    async function handleLogout() {
        setConfirmation({
            isOpen: true,
            type: 'danger',
            title: 'Sair da conta',
            message: 'Tem certeza que deseja sair da sua conta agora?',
            confirmText: 'Sair da conta',
            cancelText: 'Cancelar',
            onConfirm: async () => {
                try {
                    setConfirmation(prev => ({ ...prev, isOpen: false }))
                    await supabase.auth.signOut()
                } catch (error) {
                    console.error('Error logging out:', error)
                    setConfirmation({
                        isOpen: true,
                        type: 'error',
                        title: 'Erro ao sair',
                        message: 'Não foi possível encerrar a sessão. Tente novamente.',
                        onConfirm: () => setConfirmation(prev => ({ ...prev, isOpen: false }))
                    })
                }
            }
        })
    }

    async function handleAvatarUpload(event) {
        try {
            setSaving(true)
            if (!event.target.files || event.target.files.length === 0) {
                throw new Error('Você deve selecionar uma imagem para fazer upload.')
            }

            const file = event.target.files[0]
            const publicUrl = await ProfileService.uploadAvatar(file)

            setProfile(prev => ({ ...prev, avatar_url: publicUrl }))

            // Auto-save after upload
            await ProfileService.updateProfile({ avatar_url: publicUrl })

            // Trigger app-wide refresh
            if (onProfileUpdate) await onProfileUpdate()

            setConfirmation({
                isOpen: true,
                type: 'success',
                title: 'Foto Atualizada',
                message: 'Sua foto de perfil foi atualizada com sucesso.',
                onConfirm: () => setConfirmation(prev => ({ ...prev, isOpen: false }))
            })
        } catch (error) {
            setConfirmation({
                isOpen: true,
                type: 'error',
                title: 'Erro no Upload',
                message: error.message.includes('Bucket not found')
                    ? 'O bucket de armazenamento "avatars" não foi encontrado. Por favor, crie-o no painel do Supabase.'
                    : `Não foi possível fazer upload da imagem: ${error.message}`,
                onConfirm: () => setConfirmation(prev => ({ ...prev, isOpen: false }))
            })
        } finally {
            setSaving(false)
        }
    }

    if (loading && !profile.username) {
        return (
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Left Column Skeleton */}
                    <div className="space-y-6">
                        <Skeleton.Card className="text-center space-y-4">
                            <Skeleton.Circle size="w-32 h-32 mx-auto" />
                            <div className="space-y-2">
                                <Skeleton className="h-5 w-32 mx-auto" />
                                <Skeleton className="h-4 w-20 mx-auto" />
                            </div>
                        </Skeleton.Card>
                        <Skeleton.Card className="space-y-4">
                            <Skeleton className="h-4 w-24 mb-4" />
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <Skeleton className="h-4 w-28" />
                                    <Skeleton className="h-4 w-8" />
                                </div>
                                <div className="flex justify-between">
                                    <Skeleton className="h-4 w-20" />
                                    <Skeleton className="h-4 w-8" />
                                </div>
                                <Skeleton className="h-2 w-full" />
                            </div>
                        </Skeleton.Card>
                    </div>

                    {/* Right Column Skeleton (span-2) */}
                    <div className="md:col-span-2 space-y-6">
                        <Skeleton.Card className="space-y-4">
                            <Skeleton className="h-5 w-48 mb-4" />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Skeleton className="h-3 w-16" />
                                    <Skeleton className="h-10 w-full rounded-lg" />
                                </div>
                                <div className="space-y-2">
                                    <Skeleton className="h-3 w-16" />
                                    <Skeleton className="h-10 w-full rounded-lg" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Skeleton className="h-3 w-28" />
                                <Skeleton className="h-10 w-full rounded-lg" />
                            </div>
                        </Skeleton.Card>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left Column: Avatar & Stats */}
                <div className="space-y-6">
                    <Card className="p-6 text-center space-y-4">
                        <div className="relative inline-block group">
                            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-blue-50 mx-auto bg-white flex items-center justify-center">
                                {profile.avatar_url ? (
                                    <img
                                        src={profile.avatar_url}
                                        alt="Avatar"
                                        className="w-full h-full object-contain bg-white p-2"
                                    />
                                ) : (
                                    <User className="w-16 h-16 text-gray-400" />
                                )}
                            </div>
                            <button
                                onClick={() => fileInputRef.current.click()}
                                className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition w-10 h-10 flex items-center justify-center"
                                title="Alterar foto"
                            >
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                            </button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleAvatarUpload}
                                accept="image/*,.ico"
                                aria-label="Upload do avatar"
                                className="hidden"
                            />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">{profile.full_name || 'Usuário'}</h2>
                            <p className="text-sm text-gray-500">@{profile.username || 'username'}</p>
                        </div>
                    </Card>

                    <Card className="p-6">
                        <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                            Eficiência
                        </h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500">Total de Tarefas</span>
                                <span className="font-bold text-gray-900">{stats.total}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500">Concluídas</span>
                                <span className="font-bold text-green-600">{stats.done}</span>
                            </div>
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden mt-2">
                                <div
                                    className="h-full bg-blue-600"
                                    style={{ width: `${stats.total ? (stats.done / stats.total) * 100 : 0}%` }}
                                ></div>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6 space-y-4">
                        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                            <Plus className="w-4 h-4 text-blue-600" />
                            Ações de Desenvolvedor
                        </h3>
                        <p className="text-xs text-gray-500 leading-relaxed">
                            Gere dados fictícios no banco de dados para testar os cronômetros, gráficos de telemetria e o autoplanejamento.
                        </p>
                        <Button
                            onClick={handleGenerateMockTasks}
                            disabled={generatingMocks}
                            variant="secondary"
                            className="w-full flex items-center justify-center gap-2 border-dashed border-2 hover:border-solid py-2 text-xs font-bold"
                            type="button"
                        >
                            {generatingMocks ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                            Gerar Tarefas de Teste
                        </Button>
                        <Button
                            onClick={handleLogout}
                            variant="danger"
                            className="w-full flex items-center justify-center gap-2 py-2 text-xs font-bold"
                            type="button"
                        >
                            <LogOut className="w-4 h-4" />
                            Sair da conta
                        </Button>
                    </Card>
                </div>

                {/* Right Column: Edit Form */}
                <div className="md:col-span-2">
                    <Card className="p-6 md:p-8">
                        <form onSubmit={handleUpdateProfile} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Nome Completo</label>
                                    <input
                                        type="text"
                                        maxLength={30}
                                        value={profile.full_name}
                                        onChange={(e) => setProfile({ ...profile, full_name: e.target.value.slice(0, 30) })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                        placeholder="Seu nome"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                                    <input
                                        type="text"
                                        maxLength={30}
                                        value={profile.username}
                                        onChange={(e) => setProfile({ ...profile, username: e.target.value.slice(0, 30) })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                        placeholder="username"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                <div className="relative">
                                    <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="email"
                                        value={profile.email}
                                        disabled
                                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed"
                                    />
                                </div>
                                <p className="text-xs text-gray-400 mt-1">O email não pode ser alterado.</p>
                            </div>

                            <div className="pt-4 flex justify-end">
                                <Button
                                    type="submit"
                                    variant="primary"
                                    loading={saving}
                                    className="flex items-center gap-2"
                                >
                                    <Save className="w-4 h-4" />
                                    Salvar Alterações
                                </Button>
                            </div>
                        </form>
                    </Card>

                    <Card className="p-6 md:p-8 space-y-6 mt-6">
                        <div>
                            <h3 className="text-sm font-bold text-gray-900 mb-1 flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-blue-600" />
                                Horários de Trabalho Disponíveis
                            </h3>
                            <p className="text-xs text-gray-500">Configure as faixas de horários livres em cada dia da semana para autoplanejar seu calendário.</p>
                        </div>
                        
                        <div className="space-y-4">
                            {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map(day => {
                                const slots = profile.preferências?.work_hours?.[day] || []
                                return (
                                    <div key={day} className="flex flex-col sm:flex-row sm:items-start gap-4 border-b border-gray-100 pb-4 last:border-0">
                                        <span className="w-12 text-xs font-bold text-gray-700 pt-2 shrink-0">{day}</span>
                                        <div className="flex-1 space-y-2">
                                            {slots.map((slot, index) => (
                                                <div key={index} className="flex items-center gap-2">
                                                    <input
                                                        type="time"
                                                        value={slot.start}
                                                        aria-label="Hora de início"
                                                        onChange={(e) => updateSlot(day, index, 'start', e.target.value)}
                                                        className="px-3 py-1 border border-gray-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                                    />
                                                    <span className="text-gray-400 text-xs">até</span>
                                                    <input
                                                        type="time"
                                                        value={slot.end}
                                                        aria-label="Hora de fim"
                                                        onChange={(e) => updateSlot(day, index, 'end', e.target.value)}
                                                        className="px-3 py-1 border border-gray-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeSlot(day, index)}
                                                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            ))}
                                            {slots.length === 0 && (
                                                <p className="text-xs text-gray-400 italic pt-1">Sem horários configurados (Indisponível)</p>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => addSlot(day)}
                                                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 hover:underline mt-1"
                                            >
                                                <Plus className="w-3 h-3" /> Adicionar Intervalo
                                            </button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </Card>
                </div>
            </div>

            <ConfirmationModal
                isOpen={confirmation.isOpen}
                type={confirmation.type}
                title={confirmation.title}
                message={confirmation.message}
                onConfirm={confirmation.onConfirm}
                onCancel={() => setConfirmation(prev => ({ ...prev, isOpen: false }))}
                cancelText={confirmation.cancelText === undefined ? null : confirmation.cancelText}
            />
        </div>
    )
}
