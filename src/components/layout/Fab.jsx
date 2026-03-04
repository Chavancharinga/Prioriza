import { Plus } from 'lucide-react'

export default function Fab({ onClick }) {
    return (
        <button
            onClick={onClick}
            className="group fixed bottom-20 right-4 z-40 flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-primary-500 via-prioriza-purple to-prioriza-pink text-white shadow-2xl shadow-primary-500/40 transition-all hover:scale-110 hover:shadow-prioriza-purple/60 active:scale-95 sm:bottom-6 sm:right-6"
        >
            <Plus className="h-7 w-7 stroke-[2.5] transition-transform group-hover:rotate-90" />
            <div className="absolute -top-1 -right-1 flex h-6 w-6">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-prioriza-pink opacity-75" />
                <span className="relative inline-flex h-6 w-6 items-center justify-center rounded-full bg-linear-to-br from-prioriza-pink to-prioriza-coral text-[10px] font-bold ring-2 ring-white">
                    +
                </span>
            </div>
        </button>
    )
}
