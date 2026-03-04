import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'

const variants = {
    primary: 'bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 active:shadow-md',
    ghost: 'bg-transparent text-neutral-700 hover:bg-neutral-100 active:bg-neutral-200',
    outline: 'border-2 border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50 hover:border-blue-500 active:bg-neutral-100',
    danger: 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40',
}

export default function Button({ children, variant = 'primary', disabled = false, loading = false, className = '', ...props }) {
    return (
        <motion.button
            whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
            whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
            disabled={disabled || loading}
            className={`inline-flex items-center justify-center gap-2.5 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-500/20 disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
            {...props}
        >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {children}
        </motion.button>
    )
}
