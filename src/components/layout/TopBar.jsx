import { Home, ListTodo, Calendar, Settings } from 'lucide-react'
import { motion } from 'framer-motion'

const tabs = [
    { id: 'home', label: 'Início', icon: Home },
    { id: 'tarefas', label: 'Tarefas', icon: ListTodo },
    { id: 'cronograma', label: 'Agenda', icon: Calendar },
    { id: 'configuracoes', label: 'Configurações', icon: Settings },
]

export default function TopBar({ activeTab, onTabChange }) {
    return (
        <nav className="hidden sm:block">
            <div className="relative flex gap-1.5 rounded-2xl border border-neutral-200 bg-white p-1.5 shadow-sm">
                {tabs.map((tab) => {
                    const Icon = tab.icon
                    const isActive = activeTab === tab.id

                    return (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className={`relative z-10 flex flex-1 items-center justify-center gap-2.5 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${isActive
                                ? 'text-white'
                                : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 active:scale-[0.98]'
                                }`}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute inset-0 rounded-xl bg-linear-to-r from-primary-500 to-prioriza-purple shadow-lg shadow-primary-500/30"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                            <Icon className={`relative z-10 h-4 w-4 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                            <span className="relative z-10 hidden md:inline">{tab.label}</span>
                        </button>
                    )
                })}
            </div>
        </nav>
    )
}
