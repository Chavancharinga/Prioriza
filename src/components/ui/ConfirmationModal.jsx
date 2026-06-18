import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'

export default function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Confirmar",
    cancelText = "Cancelar",
    type = "info" // 'info', 'success', 'danger'
}) {
    if (!isOpen || typeof document === 'undefined') return null

    const config = {
        info: {
            icon: Info,
            color: 'text-(--color-prioriza-blue)',
            bg: 'bg-[rgba(30,58,138,0.10)]',
            button: 'btn-3d-primary'
        },
        success: {
            icon: CheckCircle2,
            color: 'text-(--color-prioriza-blue)',
            bg: 'bg-[rgba(30,58,138,0.10)]',
            button: 'btn-3d-primary'
        },
        danger: {
            icon: AlertTriangle,
            color: 'text-red-600',
            bg: 'bg-red-50',
            button: 'btn-3d-danger'
        }
    }

    const style = config[type] || config.info
    const Icon = style.icon

    return createPortal(
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/45 backdrop-blur-md p-4">
            {/* Backdrop click */}
            <div className="absolute inset-0" onClick={onClose} />

            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                transition={{ type: "spring", stiffness: 350, damping: 25 }}
                className="bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8 border-2 border-slate-200 scale-100 relative overflow-hidden z-10"
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors z-20"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Body Content */}
                <div className="relative z-10 flex flex-col items-center text-center mt-2">
                    <div className={`p-4 rounded-2xl ${style.bg} ${style.color} mb-5`}>
                        <Icon className="w-8 h-8" />
                    </div>

                    <h3 className="font-black tracking-tight leading-tight mb-3 z-10 text-xl text-gray-900 dark:text-white">
                        {title}
                    </h3>

                    {/* Pre-formatted Message body for lists and lines */}
                    <div className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed text-sm max-w-sm whitespace-pre-line font-medium">
                        {message}
                    </div>
                </div>

                {/* Footer buttons */}
                <div className={`relative z-10 grid gap-3 mt-4 ${cancelText ? 'grid-cols-2' : 'grid-cols-1'}`}>
                    {cancelText && (
                        <button
                            onClick={onClose}
                            className="btn-3d-secondary w-full py-3 text-sm font-black flex items-center justify-center cursor-pointer"
                        >
                            <span>{cancelText}</span>
                        </button>
                    )}
                    <button
                        onClick={onConfirm || onClose}
                        className={`w-full py-3 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer ${style.button}`}
                    >
                        <span>{confirmText}</span>
                    </button>
                </div>
            </motion.div>
        </div>,
        document.body
    )
}
