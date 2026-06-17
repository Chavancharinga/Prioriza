import { useState } from 'react'
import { AlertTriangle, CheckCircle2 } from 'lucide-react'
import { REMEMBER_LOGIN_KEY, supabase } from '../lib/supabase'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'

export default function Auth({ onLogin }) {
    const [isLogin, setIsLogin] = useState(true)
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

    const handleAuth = async (event) => {
        event.preventDefault()
        setLoading(true)
        setMessage(null)

        try {
            if (typeof window !== 'undefined') {
                window.localStorage.setItem(REMEMBER_LOGIN_KEY, rememberLogin ? 'true' : 'false')
            }

            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({
                    email: email.trim(),
                    password,
                })
                if (error) throw error
                onLogin?.()
                return
            }

            const { data, error } = await supabase.auth.signUp({
                email: email.trim(),
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
                setMessage({ type: 'success', text: 'Conta criada e logada com sucesso.' })
                onLogin?.()
                return
            }

            setMessage({ type: 'success', text: 'Conta criada. Verifique seu email antes de entrar.' })
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

    const inputClass = 'mt-2 h-12 block w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100'

    return (
        <div
            className="min-h-screen flex items-center justify-center p-4"
            style={{
                backgroundImage: `url("${encodeURI(`${import.meta.env.BASE_URL}fundo do login e site.png`)}")`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
            }}
        >
            <div className="w-full max-w-lg">
                <Card className="min-h-[660px] bg-white/95 p-7 sm:p-9 md:p-11 flex flex-col justify-between">
                    <div className="mb-7 text-center">
                        <img
                            src={`${import.meta.env.BASE_URL}logo.png`}
                            alt="Prioriza"
                            className="mx-auto h-auto w-[150px] max-w-full object-contain"
                        />
                        <p className="mt-3 text-sm font-semibold text-slate-500">
                            Gerencie suas tarefas com eficiência
                        </p>
                    </div>

                    <form onSubmit={handleAuth} className="flex flex-1 flex-col justify-center space-y-5">
                        {!isLogin && (
                            <>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700">Nome completo</label>
                                    <input
                                        type="text"
                                        required
                                        value={fullName}
                                        onChange={(event) => setFullName(event.target.value)}
                                        className={inputClass}
                                        placeholder="Seu nome completo"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700">Nome de usuário</label>
                                    <input
                                        type="text"
                                        required
                                        value={username}
                                        onChange={(event) => setUsername(event.target.value)}
                                        className={inputClass}
                                        placeholder="Ex: joao_silva"
                                    />
                                </div>
                            </>
                        )}

                        <div>
                            <label className="block text-sm font-bold text-slate-700">Email</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700">Senha</label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                className={inputClass}
                            />
                        </div>

                        {isLogin && (
                            <label className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700">
                                <span className="flex flex-col">
                                    <span>Permanecer logado</span>
                                    <span className="text-xs font-medium text-slate-500">Mantém sua sessão ao atualizar a página.</span>
                                </span>
                                <input
                                    type="checkbox"
                                    checked={rememberLogin}
                                    onChange={(event) => setRememberLogin(event.target.checked)}
                                    className="h-5 w-5 rounded border-slate-300 accent-blue-600"
                                />
                            </label>
                        )}

                        {message && (
                            <div className={`flex items-center gap-2 rounded-2xl p-3 text-sm font-semibold ${message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-slate-50 text-slate-700'}`}>
                                {message.type === 'error' ? <AlertTriangle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                                {message.text}
                            </div>
                        )}

                        <Button type="submit" variant="primary" loading={loading} className="w-full justify-center">
                            {isLogin ? 'Entrar' : 'Cadastrar'}
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <button
                            type="button"
                            onClick={() => {
                                setIsLogin(!isLogin)
                                setMessage(null)
                            }}
                            className="text-sm font-bold text-slate-600 transition hover:text-slate-950"
                        >
                            {isLogin ? 'Não tem uma conta? Cadastre-se' : 'Já tem uma conta? Entre'}
                        </button>
                    </div>
                </Card>
            </div>
        </div>
    )
}
