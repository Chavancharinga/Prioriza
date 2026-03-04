import { motion } from 'framer-motion'
import { AlertTriangle, X } from 'lucide-react'

const types = {
    success: {
        bg: 'bg-gradient-to-r from-minimal/10 to-low/10',
        border: 'border-minimal',
        text: 'text-minimal',
        icon: 'text-minimal',
    },
    error: {
        bg: 'bg-gradient-to-r from-critical/10 to-high/10',
        border: 'border-critical',
        text: 'text-critical',
        icon: 'text-critical',
    },
    warning: {
        bg: 'bg-gradient-to-r from-medium/10 to-high/10',
        border: 'border-medium',
        text: 'text-medium',
        icon: 'text-medium',
    },
    info: {
        bg: 'bg-gradient-to-r from-primary-500/10 to-prioriza-blue/10',
        border: 'border-primary-500',
        text: 'text-primary-600',
        icon: 'text-primary-500',
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
