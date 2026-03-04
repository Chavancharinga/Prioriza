import { useState, useEffect, useRef } from 'react'
import { User, Mail, Globe, Save, Upload, Loader2, Camera, Calendar, CheckCircle2 } from 'lucide-react'
import { ProfileService } from '../../services/ProfileService'
import { TaskService } from '../../services/TaskService'
import Button from '../ui/Button'
import Card from '../ui/Card'
import ConfirmationModal from '../ui/ConfirmationModal'

export default function Profile({ profile: appProfile, onProfileUpdate }) {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
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
        email: ''
    })
    const [stats, setStats] = useState({ total: 0, done: 0 })
    const fileInputRef = useRef(null)

    useEffect(() => {
        loadProfile()
    }, [appProfile]) // Update internal state if app-wide profile changed

    async function loadProfile() {
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
                email: userProfile.email || '' // Read-only from Auth
            })
            setStats({ total, done })
        } catch (error) {
            console.error('Error loading profile:', error)
        } finally {
            setLoading(false)
        }
    }

    async function handleUpdateProfile(e) {
        e.preventDefault()
        try {
            setSaving(true)
            const updates = {
                username: profile.username,
                full_name: profile.full_name,
                avatar_url: profile.avatar_url,
                updated_at: new Date(),
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
            <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Meu Perfil</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left Column: Avatar & Stats */}
                <div className="space-y-6">
                    <Card className="p-6 text-center space-y-4">
                        <div className="relative inline-block group">
                            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-blue-50 mx-auto bg-gray-100 flex items-center justify-center">
                                {profile.avatar_url ? (
                                    <img
                                        src={profile.avatar_url}
                                        alt="Avatar"
                                        className="w-full h-full object-cover"
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
                                accept="image/*"
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
                                        value={profile.full_name}
                                        onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                        placeholder="Seu nome"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                                    <input
                                        type="text"
                                        value={profile.username}
                                        onChange={(e) => setProfile({ ...profile, username: e.target.value })}
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
                </div>
            </div>

            <ConfirmationModal
                isOpen={confirmation.isOpen}
                type={confirmation.type}
                title={confirmation.title}
                message={confirmation.message}
                onConfirm={confirmation.onConfirm}
                onCancel={() => setConfirmation(prev => ({ ...prev, isOpen: false }))}
            />
        </div>
    )
}
