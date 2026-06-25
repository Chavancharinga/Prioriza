import { useState } from 'react'
import { REMEMBER_LOGIN_KEY, supabase } from '../lib/supabase'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import { CheckCircle2, AlertTriangle } from 'lucide-react'

export default function Auth({ onLogin }) {
    const [isLogin, setIsLogin] = useState(true)
    const [isForgotPassword, setIsForgotPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState(null)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [fullName, setFullName] = useState('')
    const [username, setUsername] = useState('')
    const [rememberLogin, setRememberLogin] = useState(() => {
        if (typeof window === 'undefined') return true
        return window.localStorage.getItem(REMEMBER_LOGIN_KEY) !== 'false'
    })

    const handleAuth = async (e) => {
        e.preventDefault()
        setLoading(true)
        setMessage(null)

        const cleanEmail = email.trim()

        try {
            if (typeof window !== 'undefined') {
                window.localStorage.setItem(REMEMBER_LOGIN_KEY, rememberLogin ? 'true' : 'false')
            }

            if (isForgotPassword) {
                const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
                    redirectTo: `${window.location.origin}/`,
                })
                if (error) throw error
                setMessage({ type: 'success', text: 'Email de recuperação enviado! Verifique sua caixa de entrada.' })
                setLoading(false)
                return
            }

            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({
                    email: cleanEmail,
                    password,
                })
                if (error) throw error
            } else {
                const { data, error } = await supabase.auth.signUp({
                    email: cleanEmail,
                    password,
                    options: {
                        data: {
                            full_name: fullName.trim(),
                            username: username.trim()
                        }
                    }
                })
                if (error) throw error

                if (data?.session) {
                    setMessage({ type: 'success', text: 'Conta criada e logada com sucesso!' })
                    onLogin?.()
                    return
                }

                setMessage({ type: 'success', text: 'Conta criada! Verifique seu email para ativar a conta antes de entrar.' })
            }
            if (isLogin) onLogin()
        } catch (error) {
            let errorMsg = error.message
            if (errorMsg.includes('Invalid login credentials')) {
                errorMsg = 'Credenciais inválidas. Verifique seu email e senha.'
            } else if (errorMsg.includes('Email not confirmed')) {
                errorMsg = 'Email não confirmado. Verifique sua caixa de entrada.'
            }
            setMessage({ type: 'error', text: errorMsg })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div
            className="min-h-screen flex items-center justify-center p-4"
            style={{
                backgroundImage: 'var(--prioriza-app-background)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                backgroundAttachment: 'fixed',
            }}
        >
            <div className="max-w-lg w-full">
                <Card className="p-8 sm:p-10 md:p-12 min-h-[680px] flex flex-col justify-between bg-white/95">
                    <div className="text-center mb-8">
                        <img
                            src={`${import.meta.env.BASE_URL}logo.png`}
                            alt="Prioriza"
                            className="w-[168px] max-w-full h-auto mx-auto object-contain"
                        />
                        <p className="mt-3 text-sm font-medium text-slate-500">
                            Gerencie suas tarefas com eficiência
                        </p>
                    </div>

                    <form onSubmit={handleAuth} className="space-y-6 flex-1 flex flex-col justify-center">
                        {!isLogin && !isForgotPassword && (
                            <>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700">Nome Completo</label>
                                    <input
                                        type="text"
                                        required
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        className="mt-2 block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium shadow-sm placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                                        placeholder="Seu nome completo"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Nome de Usuário (Username)</label>
                                    <input
                                        type="text"
                                        required
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="mt-2 block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium shadow-sm placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                                        placeholder="Ex: joao_silva"
                                    />
                                </div>
                            </>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="mt-2 block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium shadow-sm placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                            />
                        </div>

                        {!isForgotPassword && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Senha</label>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="mt-2 block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium shadow-sm placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                                />
                            </div>
                        )}

                        {isLogin && !isForgotPassword && (
                            <label className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
                                <span className="flex flex-col">
                                    <span>Permanecer logado</span>
                                    <span className="text-xs font-medium text-slate-500">Mantém sua sessão ao atualizar a página.</span>
                                </span>
                                <input
                                    type="checkbox"
                                    checked={rememberLogin}
                                    onChange={(e) => setRememberLogin(e.target.checked)}
                                    className="h-5 w-5 rounded border-slate-300 text-blue-600 accent-blue-600"
                                />
                            </label>
                        )}

                        {message && (
                            <div className={`p-3 rounded-2xl flex items-center gap-2 text-sm font-medium ${message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-slate-50 text-slate-700'}`}>
                                {message.type === 'error' ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                                {message.text}
                            </div>
                        )}

                        <Button
                            type="submit"
                            variant="primary"
                            loading={loading}
                            className="w-full flex justify-center"
                        >
                            {isForgotPassword ? 'Enviar Link' : isLogin ? 'Entrar' : 'Cadastrar'}
                        </Button>
                    </form>

                    <div className="mt-6 text-center space-y-3 flex flex-col">
                        {!isForgotPassword && isLogin && (
                            <button
                                type="button"
                                onClick={() => {
                                    setIsForgotPassword(true)
                                    setMessage(null)
                                }}
                                className="text-sm font-semibold text-slate-600 hover:text-blue-600"
                            >
                                Esqueci a minha senha
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={() => {
                                if (isForgotPassword) {
                                    setIsForgotPassword(false)
                                    setIsLogin(true)
                                } else {
                                    setIsLogin(!isLogin)
                                }
                                setMessage(null)
                            }}
                            className="text-sm font-semibold text-slate-600 hover:text-blue-600"
                        >
                            {isForgotPassword ? 'Voltar ao Login' : isLogin ? 'Não tem uma conta? Cadastre-se' : 'Já tem uma conta? Entre'}
                        </button>
                    </div>
                </Card>
            </div>
        </div>
    )
}
