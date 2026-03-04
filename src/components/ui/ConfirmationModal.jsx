import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react'

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
    if (!isOpen) return null

    const config = {
        info: {
            icon: Info,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
            button: 'bg-blue-600 hover:bg-blue-700'
        },
        success: {
            icon: CheckCircle2,
            color: 'text-green-600',
            bg: 'bg-green-50',
            button: 'bg-green-600 hover:bg-green-700'
        },
        danger: {
            icon: AlertTriangle,
            color: 'text-red-600',
            bg: 'bg-red-50',
            button: 'bg-red-600 hover:bg-red-700'
        }
    }

    const style = config[type] || config.info
    const Icon = style.icon

    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 border border-gray-100 animate-in zoom-in-95 duration-200 scale-100 relative">

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-4 mb-4">
                    <div className={`p-3 rounded-full ${style.bg} ${style.color}`}>
                        <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 leading-tight">{title}</h3>
                </div>

                <p className="text-gray-600 mb-8 leading-relaxed text-sm">
                    {message}
                </p>

                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={onClose}
                        className="w-full py-2.5 bg-white text-gray-700 border border-gray-200 rounded-xl font-bold text-sm hover:bg-gray-50 transition-colors"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`w-full py-2.5 text-white rounded-xl font-bold text-sm transition-colors shadow-lg shadow-gray-200 ${style.button}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    )
}
