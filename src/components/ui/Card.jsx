import { motion } from 'framer-motion'

export default function Card({ title, subtitle, children, className = '' }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className={`relative overflow-hidden rounded-[24px] border border-white dark:border-(--color-border) bg-white dark:bg-(--color-surface-card) p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-none ${className}`}
        >
            {(title || subtitle) && (
                <div className="mb-6">
                    {subtitle && (
                        <p className="text-xs font-extrabold uppercase tracking-widest text-neutral-400 dark:text-neutral-500 mb-1.5">
                            {subtitle}
                        </p>
                    )}
                    {title && (
                        <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">
                            {title}
                        </h3>
                    )}
                </div>
            )}
            {children}
        </motion.div>
    )
}

