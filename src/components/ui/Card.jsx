import { motion } from 'framer-motion'

export default function Card({ title, subtitle, children, className = '' }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className={`relative overflow-hidden card-3d p-4 sm:p-5 ${className}`}
        >
            {/* label placeholder aria-label */}
            {(title || subtitle) && (
                <div className="mb-4">
                    {subtitle && (
                        <p className="text-[11px] font-extrabold uppercase tracking-widest text-(--color-text-muted) mb-1">
                            {subtitle}
                        </p>
                    )}
                    {title && (
                        <h3 className="text-lg font-extrabold text-(--color-text-primary) tracking-tight">
                            {title}
                        </h3>
                    )}
                </div>
            )}
            {children}
        </motion.div>
    )
}

