import { AlertTriangle, CheckCircle2, Info, X, Trophy, Sparkles, Star } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'

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
    const [particles, setParticles] = useState([])

    useEffect(() => {
        if (isOpen && type === 'success') {
            const newParticles = Array.from({ length: 20 }).map((_, i) => {
                const angle = (i / 20) * 2 * Math.PI + (Math.random() - 0.5) * 0.4
                const distance = 90 + Math.random() * 120
                return {
                    id: i,
                    x: Math.cos(angle) * distance,
                    y: Math.sin(angle) * distance - 20,
                    rotate: Math.random() * 360,
                    scale: 0.4 + Math.random() * 0.8,
                    color: ['#F59E0B', '#10B981', '#3B82F6', '#EF4444', '#EC4899', '#06B6D4', '#10B981'][i % 7]
                }
            })
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setParticles(newParticles)
        } else {
            setParticles([])
        }
    }, [isOpen, type])

    if (!isOpen) return null

    const config = {
        info: {
            icon: Info,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
            button: 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'
        },
        success: {
            icon: CheckCircle2,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
            button: 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-emerald-500/25'
        },
        danger: {
            icon: AlertTriangle,
            color: 'text-red-600',
            bg: 'bg-red-50',
            button: 'bg-red-600 hover:bg-red-700 shadow-red-500/20'
        }
    }

    const style = config[type] || config.info
    const Icon = style.icon

    const isSuccess = type === 'success'

    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/45 backdrop-blur-md p-4">
            {/* Backdrop click */}
            <div className="absolute inset-0" onClick={onClose} />

            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                transition={{ type: "spring", stiffness: 350, damping: 25 }}
                className={`bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8 border border-gray-100 dark:border-neutral-800 scale-100 relative overflow-hidden z-10
                    ${isSuccess ? 'ring-2 ring-amber-400/40 dark:ring-amber-400/20 shadow-amber-500/10' : ''}`}
            >
                {/* Decorative Sunburst for Success */}
                {isSuccess && (
                    <div className="absolute inset-x-0 -top-24 pointer-events-none flex items-center justify-center z-0">
                        {/* Soft ambient glow */}
                        <motion.div
                            animate={{ scale: [1, 1.25, 1], opacity: [0.15, 0.35, 0.15] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute w-64 h-64 bg-amber-400 rounded-full blur-3xl opacity-20"
                        />
                        {/* Spinning SVG Rays */}
                        <motion.svg
                            animate={{ rotate: 360 }}
                            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                            className="w-56 h-56 text-amber-400/15 dark:text-amber-400/10 fill-current"
                            viewBox="0 0 100 100"
                        >
                            <path d="M50 50 L50 0 L53 40 L85 15 L56 44 L100 50 L56 56 L85 85 L53 60 L50 100 L47 60 L15 85 L44 56 L0 50 L44 44 L15 15 L47 40 Z" />
                        </motion.svg>
                    </div>
                )}

                {/* Confetti Particles dispersion on success */}
                {isSuccess && particles.map((p) => (
                    <motion.div
                        key={p.id}
                        initial={{ x: 0, y: 0, opacity: 1, scale: 0, rotate: 0 }}
                        animate={{ x: p.x, y: p.y, opacity: 0, scale: p.scale, rotate: p.rotate }}
                        transition={{ duration: 1.6, ease: [0.1, 0.8, 0.25, 1], delay: 0.1 }}
                        className="absolute left-[50%] top-[35%] w-3 h-3 rounded-xs pointer-events-none z-20"
                        style={{ backgroundColor: p.color }}
                    />
                ))}

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors z-20"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Body Content */}
                <div className="relative z-10 flex flex-col items-center text-center mt-2">
                    
                    {isSuccess ? (
                        /* Hero celebration badge */
                        <div className="relative flex justify-center mb-6">
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <motion.div
                                    animate={{ scale: [1, 1.25, 1], opacity: [0.3, 0.6, 0.3] }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                    className="w-20 h-20 bg-amber-400/25 rounded-full blur-md"
                                />
                            </div>
                            
                            <motion.div
                                initial={{ scale: 0, rotate: -35 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: "spring", stiffness: 260, damping: 14, delay: 0.05 }}
                                className="relative z-10 p-5 bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-500 rounded-2xl shadow-xl shadow-amber-500/30 border-2 border-amber-300 text-white"
                            >
                                <Trophy className="w-12 h-12 drop-shadow-[0_2px_6px_rgba(0,0,0,0.15)]" />
                            </motion.div>
                            
                            {/* Orbiting sparkles */}
                            <motion.div
                                animate={{ y: [0, -6, 0], x: [0, 5, 0], rotate: 15 }}
                                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
                                className="absolute -top-3 -right-3 text-yellow-400"
                            >
                                <Sparkles className="w-6 h-6 fill-current" />
                            </motion.div>
                            
                            <motion.div
                                animate={{ y: [0, 6, 0], x: [0, -5, 0], rotate: -15 }}
                                transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                                className="absolute -bottom-2 -left-3 text-amber-500"
                            >
                                <Star className="w-5 h-5 fill-current" />
                            </motion.div>
                        </div>
                    ) : (
                        /* Generic header for info/danger */
                        <div className={`p-4 rounded-2xl ${style.bg} ${style.color} mb-5`}>
                            <Icon className="w-8 h-8" />
                        </div>
                    )}

                    <h3 className={`font-black tracking-tight leading-tight mb-3 z-10
                        ${isSuccess ? 'text-2xl text-amber-500 dark:text-amber-400' : 'text-xl text-gray-900 dark:text-white'}`}>
                        {title}
                    </h3>

                    {/* Pre-formatted Message body for lists and lines */}
                    <div className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed text-sm max-w-sm whitespace-pre-line font-medium">
                        {message}
                    </div>
                </div>

                {/* Footer buttons */}
                <div className="relative z-10 grid grid-cols-2 gap-3 mt-2">
                    <button
                        onClick={onClose}
                        className="w-full py-3 bg-white dark:bg-neutral-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-neutral-700 rounded-2xl font-bold text-sm hover:bg-gray-50 dark:hover:bg-neutral-700/60 transition-colors active:scale-98"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`w-full py-3 text-white rounded-2xl font-bold text-sm transition-all shadow-md active:scale-98 flex items-center justify-center gap-1.5 cursor-pointer ${style.button}`}
                    >
                        {isSuccess && <Sparkles className="w-4 h-4 fill-current shrink-0" />}
                        <span>{confirmText}</span>
                    </button>
                </div>
            </motion.div>
        </div>
    )
}
