import { useState, useEffect } from 'react'
import { Sun, Moon } from 'lucide-react'

export default function ThemeToggle() {
    const [isDark, setIsDark] = useState(() => {
        if (typeof window === 'undefined') return false
        const saved = localStorage.getItem('prioriza-theme')
        if (saved) return saved === 'dark'
        return window.matchMedia('(prefers-color-scheme: dark)').matches
    })

    useEffect(() => {
        const root = document.documentElement
        if (isDark) {
            root.classList.add('dark')
            localStorage.setItem('prioriza-theme', 'dark')
        } else {
            root.classList.remove('dark')
            localStorage.setItem('prioriza-theme', 'light')
        }
    }, [isDark])

    return (
        <button
            onClick={() => setIsDark(!isDark)}
            className="p-2.5 rounded-xl transition-all duration-300 hover:scale-110 active:scale-95
                bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700
                dark:bg-gray-800 dark:text-yellow-400 dark:hover:bg-gray-700"
            title={isDark ? 'Modo Claro' : 'Modo Escuro'}
            aria-label={isDark ? 'Alternar para modo claro' : 'Alternar para modo escuro'}
        >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
    )
}
