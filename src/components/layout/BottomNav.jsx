import { LayoutDashboard, ListTodo, Calendar, BarChart3, Bot, User } from 'lucide-react'

const tabs = [
    { id: 'dashboard', label: 'Início', icon: LayoutDashboard },
    { id: 'tasks', label: 'Tarefas', icon: ListTodo },
    { id: 'planning', label: 'Planejar', icon: Calendar },
    { id: 'analytics', label: 'Análise', icon: BarChart3 },
    { id: 'prio', label: 'PRIO', icon: Bot },
    { id: 'profile', label: 'Perfil', icon: User },
]

export default function BottomNav({ activeTab, onTabChange }) {
    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-(--color-border) bg-white/95 pb-safe backdrop-blur-xl lg:hidden shadow-[0_-4px_24px_rgba(15,23,42,0.05)]">
            <div className="grid grid-cols-6 h-16">
                {tabs.map((tab) => {
                    const Icon = tab.icon
                    const isActive = activeTab === tab.id

                    return (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className="relative flex flex-col items-center justify-center gap-1 px-1 transition-all active:scale-95 cursor-pointer"
                        >
                            {/* Active Indicator Bar at Top */}
                            {isActive && (
                                <div className="absolute top-0 left-1/2 h-[3px] w-9 -translate-x-1/2 rounded-b-full bg-blue-600" />
                            )}

                            {/* Icon */}
                            <div className="relative transition-all duration-200">
                                <Icon className={`h-5 w-5 transition-all duration-200 ${isActive ? 'stroke-[2.5] text-(--color-prioriza-blue)' : 'stroke-2 text-(--color-text-muted)'}`} />
                            </div>

                            {/* Label */}
                            <span className={`text-[10px] tracking-tight transition-all duration-200 ${isActive ? 'font-black text-(--color-prioriza-blue)' : 'font-bold text-(--color-text-muted)'}`}>
                                {tab.label}
                            </span>
                        </button>
                    )
                })}
            </div>
        </nav>
    )
}
