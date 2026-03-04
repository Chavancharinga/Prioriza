import { useState } from 'react'
import { supabase } from '../lib/supabase'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import { CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react'

export default function Auth({ onLogin }) {
    const [isLogin, setIsLogin] = useState(true)
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState(null)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const handleAuth = async (e) => {
        e.preventDefault()
        setLoading(true)
        setMessage(null)

        const cleanEmail = email.trim()

        try {
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
                })
                if (error) throw error

                // Check if session was created immediately (auto-confirm enabled)
                if (data?.session) {
                    setMessage({ type: 'success', text: 'Conta criada e logada com sucesso!' })
                    onLogin?.()
                    return
                }

                // If no session, email confirmation is likely required
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
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="max-w-md w-full">
                <div className="text-center mb-8">
                    <img src={`${import.meta.env.BASE_URL}logo.png`} alt="Prioriza" className="h-12 w-auto mx-auto mb-4 object-contain" />
                    <h2 className="text-3xl font-extrabold text-gray-900">
                        {isLogin ? 'Bem-vindo de volta' : 'Crie sua conta'}
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Gerencie suas tarefas com eficiência
                    </p>
                </div>

                <Card className="p-8">
                    <form onSubmit={handleAuth} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400
                                focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Senha</label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400
                                focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            />
                        </div>

                        {message && (
                            <div className={`p-3 rounded-md flex items-center gap-2 text-sm ${message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
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
                            {isLogin ? 'Entrar' : 'Cadastrar'}
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <button
                            onClick={() => {
                                setIsLogin(!isLogin)
                                setMessage(null)
                            }}
                            className="text-sm font-medium text-blue-600 hover:text-blue-500"
                        >
                            {isLogin ? 'Não tem uma conta? Cadastre-se' : 'Já tem uma conta? Entre'}
                        </button>
                    </div>
                </Card>
            </div>
        </div>
    )
}
