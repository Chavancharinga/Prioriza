import { motion } from 'framer-motion'
import { AlertTriangle, X } from 'lucide-react'

const types = {
    success: {
        bg: 'bg-[rgba(30,58,138,0.10)]',
        border: 'border-(--color-prioriza-blue)',
        text: 'text-(--color-prioriza-blue)',
        icon: 'text-(--color-prioriza-blue)',
    },
    error: {
        bg: 'bg-gradient-to-r from-critical/10 to-high/10',
        border: 'border-critical',
        text: 'text-critical',
        icon: 'text-critical',
    },
    warning: {
        bg: 'bg-[rgba(30,58,138,0.10)]',
        border: 'border-(--color-prioriza-blue)',
        text: 'text-(--color-prioriza-blue)',
        icon: 'text-(--color-prioriza-blue)',
    },
    info: {
        bg: 'bg-[rgba(30,58,138,0.10)]',
        border: 'border-(--color-prioriza-blue)',
        text: 'text-(--color-prioriza-blue)',
        icon: 'text-(--color-prioriza-blue)',
    },
}

export default function Toast({ type = 'info', message, onClose }) {
    const style = types[type]

    return (
        <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`flex items-start gap-3 rounded-xl border-l-4 ${style.border} ${style.bg} p-4 shadow-xl backdrop-blur-sm`}
        >
            <AlertTriangle className={`h-5 w-5 ${style.icon} mt-0.5 shrink-0`} strokeWidth={2} />
            <p className={`flex-1 text-sm font-medium ${style.text}`}>{message}</p>
            {onClose && (
                <button
                    onClick={onClose}
                    className={`shrink-0 rounded-lg p-1 transition-colors hover:bg-neutral-900/10 ${style.text}`}
                >
                    <X className="h-4 w-4" />
                </button>
            )}
        </motion.div>
    )
}
