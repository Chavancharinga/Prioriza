import { Home, ListTodo, Calendar, Settings } from 'lucide-react'

const tabs = [
    { id: 'home', label: 'Início', icon: Home },
    { id: 'tarefas', label: 'Tarefas', icon: ListTodo },
    { id: 'cronograma', label: 'Agenda', icon: Calendar },
    { id: 'configuracoes', label: 'Config', icon: Settings },
]

export default function BottomNav({ activeTab, onTabChange }) {
    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-neutral-200 bg-white/80 pb-safe backdrop-blur-xl sm:hidden">
            <div className="grid grid-cols-4">
                {tabs.map((tab) => {
                    const Icon = tab.icon
                    const isActive = activeTab === tab.id

                    return (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className="relative flex flex-col items-center gap-1.5 px-3 py-3 transition-all active:scale-95"
                        >
                            {/* Active Indicator */}
                            {isActive && (
                                <div className="absolute top-0 left-1/2 h-1 w-12 -translate-x-1/2 rounded-b-full bg-linear-to-r from-primary-500 to-prioriza-purple" />
                            )}

                            {/* Icon */}
                            <div className={`relative transition-all ${isActive ? 'scale-110' : ''}`}>
                                <Icon className={`h-6 w-6 transition-all ${isActive ? 'stroke-[2.5] text-primary-500' : 'stroke-2 text-neutral-500'}`} />
                                {isActive && (
                                    <div className="absolute inset-0 -z-10 animate-ping rounded-lg bg-primary-500/20" />
                                )}
                            </div>

                            {/* Label */}
                            <span className={`text-xs transition-all ${isActive ? 'font-semibold text-primary-500' : 'font-medium text-neutral-500'}`}>
                                {tab.label}
                            </span>
                        </button>
                    )
                })}
            </div>
        </nav>
    )
}
