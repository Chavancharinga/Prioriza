import { motion } from 'framer-motion'

export default function Card({ title, subtitle, children, className = '' }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className={`relative overflow-hidden card-3d p-6 ${className}`}
        >
            {/* label placeholder aria-label */}
            {(title || subtitle) && (
                <div className="mb-6">
                    {subtitle && (
                        <p className="text-xs font-extrabold uppercase tracking-widest text-(--color-text-muted) mb-1.5">
                            {subtitle}
                        </p>
                    )}
                    {title && (
                        <h3 className="text-xl font-bold text-(--color-text-primary) tracking-tight">
                            {title}
                        </h3>
                    )}
                </div>
            )}
            {children}
        </motion.div>
    )
}

