import { motion } from 'framer-motion'
import { AlertCircle, RefreshCw } from 'lucide-react'
import Button from './Button'

export default function ErrorState({ message, onRetry }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-16 px-4 text-center"
        >
            {/* Error Icon */}
            <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="relative mb-6"
            >
                <div className="absolute inset-0 animate-pulse rounded-full bg-critical/20" />
                <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-linear-to-br from-critical/10 to-high/10 ring-4 ring-critical/10">
                    <AlertCircle className="h-10 w-10 text-critical" strokeWidth={1.5} />
                </div>
            </motion.div>

            {/* Content */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="space-y-2"
            >
                <h3 className="text-lg font-semibold text-neutral-900">Algo deu errado</h3>
                <p className="max-w-sm text-sm text-neutral-500">
                    {message || 'Não foi possível carregar os dados. Tente novamente.'}
                </p>
            </motion.div>

            {/* Retry Button */}
            {onRetry && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mt-6"
                >
                    <Button onClick={onRetry} variant="outline">
                        <RefreshCw className="h-4 w-4" />
                        Tentar Novamente
                    </Button>
                </motion.div>
            )}
        </motion.div>
    )
}
