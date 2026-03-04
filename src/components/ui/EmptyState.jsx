import { motion } from 'framer-motion'

export default function EmptyState({ icon: Icon, title, description, action }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-16 px-4 text-center"
        >
            {/* Animated Icon Circle */}
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                className="relative mb-6"
            >
                <div className="absolute inset-0 animate-ping rounded-full bg-primary-500/20" />
                <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-linear-to-br from-primary-100 to-prioriza-purple/10 ring-4 ring-primary-500/10">
                    <Icon className="h-10 w-10 text-primary-500" strokeWidth={1.5} />
                </div>
            </motion.div>

            {/* Content */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-2"
            >
                <h3 className="text-lg font-semibold text-neutral-900">{title}</h3>
                {description && (
                    <p className="max-w-sm text-sm text-neutral-500">{description}</p>
                )}
            </motion.div>

            {/* Action Button */}
            {action && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mt-6"
                >
                    {action}
                </motion.div>
            )}
        </motion.div>
    )
}
