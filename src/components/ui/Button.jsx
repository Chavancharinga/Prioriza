import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'

const variants = {
    primary: 'btn-3d-primary',
    ghost: 'bg-transparent text-neutral-600 hover:bg-slate-100 rounded-xl',
    outline: 'btn-3d-secondary',
    secondary: 'btn-3d-secondary',
    danger: 'btn-3d-danger',
}

export default function Button({ children, variant = 'primary', disabled = false, loading = false, className = '', ...props }) {
    const is3d = ['primary', 'outline', 'secondary', 'danger'].includes(variant)
    const hoverAnimation = is3d ? {} : { scale: 1.02 }
    const tapAnimation = is3d ? {} : { scale: 0.98 }

    return (
        <motion.button
            whileHover={disabled || loading ? {} : hoverAnimation}
            whileTap={disabled || loading ? {} : tapAnimation}
            disabled={disabled || loading}
            className={`inline-flex items-center justify-center gap-2.5 px-5 py-2.5 text-sm font-semibold tracking-tight transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-500/20 disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
            {...props}
        >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {children}
        </motion.button>
    )
}
