import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
export const REMEMBER_LOGIN_KEY = 'prioriza_remember_login'

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables. Please check your .env.local file.')
}

function getStorageTarget() {
    if (typeof window === 'undefined') return null
    const rememberLogin = window.localStorage.getItem(REMEMBER_LOGIN_KEY)
    return rememberLogin === 'false' ? window.sessionStorage : window.localStorage
}

const authStorage = {
    getItem(key) {
        if (typeof window === 'undefined') return null
        const target = getStorageTarget()
        return target?.getItem(key) || window.localStorage.getItem(key) || window.sessionStorage.getItem(key)
    },
    setItem(key, value) {
        if (typeof window === 'undefined') return
        const target = getStorageTarget() || window.localStorage
        const other = target === window.localStorage ? window.sessionStorage : window.localStorage
        target.setItem(key, value)
        other.removeItem(key)
    },
    removeItem(key) {
        if (typeof window === 'undefined') return
        window.localStorage.removeItem(key)
        window.sessionStorage.removeItem(key)
    },
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: authStorage,
    },
})
