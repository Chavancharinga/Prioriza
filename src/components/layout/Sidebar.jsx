import {
    LayoutDashboard,
    ListTodo,
    Calendar,
    BarChart3,
    Menu,
    X,
    Bot,
    User
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const menuItems = [
    { id: 'dashboard', label: 'Início', icon: LayoutDashboard },
    { id: 'tasks', label: 'Tarefas', icon: ListTodo },
    { id: 'planning', label: 'Planejamento', icon: Calendar },
    { id: 'analytics', label: 'Análise', icon: BarChart3 },
    { id: 'prio', label: 'PRIO', icon: Bot },
    { id: 'profile', label: 'Perfil', icon: User },
]

// eslint-disable-next-line no-unused-vars
export default function Sidebar({ activeItem, onItemChange, collapsed, onCollapse }) {
    return (
        <>
            {/* Sidebar - Light/Medium Grey (Brand Identity) */}
            <motion.aside
                className="fixed left-0 top-0 z-50 h-screen flex flex-col items-center py-6 hidden lg:flex"
                style={{
                    width: '80px',
                    backgroundColor: 'var(--color-sidebar-bg)',
                    borderRight: '2px solid var(--color-border)'
                }}
            >
                {/* Logo */}
                <div className="mb-6 flex items-center justify-center w-full px-0.5">
                    <img 
                        src={`${import.meta.env.BASE_URL}logo.png`} 
                        alt="Prioriza" 
                        className="w-[68px] h-auto object-contain scale-[1.25] hover:scale-[1.35] active:scale-[1.15] transition-all duration-200 drop-shadow-[0_3px_10px_rgba(37,99,235,0.15)]" 
                    />
                </div>

                {/* Navigation Icons */}
                <nav className="flex-1 flex flex-col gap-5 w-full px-3 overflow-y-auto overflow-x-hidden pb-safe">
                    {menuItems.map((item) => {
                        const Icon = item.icon
                        const isActive = activeItem === item.id

                        return (
                            <button
                                key={item.id}
                                onClick={() => {
                                    onItemChange(item.id);
                                }}
                                title={item.label}
                                aria-label={item.label}
                                className="relative flex items-center justify-center w-12 h-12 mx-auto rounded-2xl transition-all duration-100 group cursor-pointer"
                                style={{
                                    color: isActive ? 'var(--color-sidebar-active)' : 'var(--color-sidebar-text)',
                                    backgroundColor: isActive ? 'rgba(37, 99, 235, 0.08)' : 'transparent',
                                    border: isActive ? '2px solid var(--color-prioriza-blue)' : '2px solid transparent',
                                    borderBottom: isActive ? '5px solid #1D4ED8' : '2px solid transparent',
                                }}
                                onMouseEnter={e => {
                                    if (!isActive) {
                                        e.currentTarget.style.backgroundColor = 'var(--color-sidebar-hover)'
                                        e.currentTarget.style.borderColor = '#E5E7EB'
                                        e.currentTarget.style.borderBottomColor = '#D1D5DB'
                                        e.currentTarget.style.borderBottomWidth = '4px'
                                        e.currentTarget.style.color = 'var(--color-text-primary)'
                                    }
                                }}
                                onMouseLeave={e => {
                                    if (!isActive) {
                                        e.currentTarget.style.backgroundColor = 'transparent'
                                        e.currentTarget.style.borderColor = 'transparent'
                                        e.currentTarget.style.borderBottomColor = 'transparent'
                                        e.currentTarget.style.borderBottomWidth = '2px'
                                        e.currentTarget.style.color = 'var(--color-sidebar-text)'
                                    }
                                }}
                            >
                                <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${isActive ? 'stroke-2' : 'stroke-[2px]'}`} />

                                <span className="absolute left-16 bg-slate-800 text-white text-[10px] font-extrabold uppercase px-2.5 py-1.5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-md">
                                    {item.label}
                                </span>
                            </button>
                        )
                    })}
                </nav>

                {/* Priority Legend (Desktop only, at the bottom of sidebar) */}
                <div className="mt-auto pt-6 border-t border-(--color-border) w-full flex flex-col items-center gap-4 pb-2">
                    {[
                        { priority: 5, label: 'Mínima', color: 'bg-blue-500', tooltip: 'Prioridade Mínima (P5)' },
                        { priority: 4, label: 'Baixa', color: 'bg-yellow-500', tooltip: 'Prioridade Baixa (P4)' },
                        { priority: 3, label: 'Média', color: 'bg-orange-500', tooltip: 'Prioridade Média (P3)' },
                        { priority: 2, label: 'Alta', color: 'bg-red-500', tooltip: 'Prioridade Alta (P2)' },
                        { priority: 1, label: 'Crítica', color: 'bg-rose-600', tooltip: 'Prioridade Crítica (P1)' },
                    ].map((p) => (
                        <div key={p.priority} className="relative group cursor-help">
                            <div className={`w-[18px] h-[18px] rounded-full ${p.color} border-2 border-white shadow-[0_1px_3px_rgba(0,0,0,0.2)] hover:scale-125 transition-transform`} />
                            
                            {/* Custom Tooltip */}
                            <span className="absolute left-12 top-1/2 -translate-y-1/2 bg-slate-800 text-white text-[10px] font-extrabold uppercase px-2.5 py-1.5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-md">
                                {p.tooltip}
                            </span>
                        </div>
                    ))}
                </div>
            </motion.aside>
        </>
    )
}
