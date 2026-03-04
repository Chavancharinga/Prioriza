import { motion } from 'framer-motion'
import { Play } from 'lucide-react'

// Specific colors from the reference image
const colors = {
    blue: { bg: 'bg-[#4F86F9]', shadow: 'shadow-blue-200' },
    purple: { bg: 'bg-[#9858FA]', shadow: 'shadow-purple-200' },
    pink: { bg: 'bg-[#F255A1]', shadow: 'shadow-pink-200' },
    orange: { bg: 'bg-[#FBB938]', shadow: 'shadow-orange-200' },
}

export default function ProgressBar({ letter, task, percentage, color = 'blue', status, startOffset = 0, width = 100 }) {
    const theme = colors[color]

    return (
        <div className="flex items-center gap-4 py-3 group">
            {/* 1. Circle Icon (A, B, C...) */}
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${theme.bg} text-white font-bold text-sm shadow-md`}>
                {letter}
            </div>

            {/* 2. Task Details (Left of bar) */}
            <div className="w-48 flex flex-col justify-center">
                <span className="text-[11px] font-extrabold text-[#1F2937] uppercase tracking-wide leading-tight">{task}</span>
                <span className="text-[10px] text-gray-400 font-medium">Incididunt ut labore</span>
            </div>

            {/* 3. The Bar Container */}
            <div className="flex-1 relative h-12">
                {/* The Colored Pill Bar */}
                <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: `${width}%`, opacity: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className={`absolute top-1 bottom-1 rounded-full ${theme.bg} shadow-lg ${theme.shadow} flex items-center px-4 justify-between`}
                    style={{ left: `${startOffset}%` }}
                >
                    {/* Toggle Switch Design inside bar */}
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-5 bg-black/10 rounded-full p-0.5 relative backdrop-blur-sm">
                            <div className="w-4 h-4 bg-white rounded-full shadow-sm absolute right-1" />
                        </div>
                        <span className="text-white text-[10px] font-bold tracking-wide mix-blend-plus-lighter">{status}</span>
                    </div>

                    <span className="text-white font-bold text-sm pr-2">{percentage}%</span>
                </motion.div>
            </div>
        </div>
    )
}
