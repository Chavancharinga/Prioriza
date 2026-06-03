import { LayoutDashboard, ListTodo, Calendar, BarChart3, User } from 'lucide-react'

const tabs = [
    { id: 'dashboard', label: 'Início', icon: LayoutDashboard },
    { id: 'tasks', label: 'Tarefas', icon: ListTodo },
    { id: 'planning', label: 'Planejar', icon: Calendar },
    { id: 'analytics', label: 'Análise', icon: BarChart3 },
    { id: 'profile', label: 'Perfil', icon: User },
]

export default function BottomNav({ activeTab, onTabChange }) {
    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-[#1a1d27]/95 pb-safe backdrop-blur-xl lg:hidden shadow-[0_-4px_24px_rgba(0,0,0,0.04)] dark:shadow-[0_-4px_24px_rgba(0,0,0,0.2)]">
            <div className="grid grid-cols-5 h-16">
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
                                <div className="absolute top-0 left-1/2 h-[3px] w-10 -translate-x-1/2 rounded-b-full bg-linear-to-r from-blue-500 to-cyan-400" />
                            )}

                            {/* Icon */}
                            <div className={`relative transition-all duration-200 ${isActive ? 'scale-110' : ''}`}>
                                <Icon className={`h-5 w-5 transition-all duration-200 ${isActive ? 'stroke-[2.5] text-blue-600 dark:text-blue-400' : 'stroke-2 text-neutral-400 dark:text-neutral-500'}`} />
                            </div>

                            {/* Label */}
                            <span className={`text-[10px] tracking-tight transition-all duration-200 ${isActive ? 'font-black text-blue-600 dark:text-blue-400' : 'font-bold text-neutral-400 dark:text-neutral-500'}`}>
                                {tab.label}
                            </span>
                        </button>
                    )
                })}
            </div>
        </nav>
    )
}
