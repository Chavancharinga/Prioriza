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
                    background: 'linear-gradient(180deg, #071B34 0%, #042E59 68%, #061626 100%)',
                    borderRight: '1px solid rgba(4, 182, 186, 0.18)',
                    boxShadow: '18px 0 48px rgba(4, 46, 89, 0.24)'
                }}
            >
                {/* Logo */}
                <div className="mb-6 flex items-center justify-center w-[62px] rounded-2xl bg-white/95 px-1.5 py-2 shadow-[0_14px_30px_rgba(4,46,89,0.22)]">
                    <img 
                        src={`${import.meta.env.BASE_URL}logo.png`} 
                        alt="Prioriza" 
                        className="w-[56px] h-auto object-contain transition-all duration-200" 
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
                                    color: isActive ? '#071B34' : 'var(--color-sidebar-text)',
                                    background: isActive ? 'linear-gradient(135deg, #04B6BA 0%, #A7F3FF 100%)' : 'transparent',
                                    border: '0',
                                    boxShadow: isActive ? '0 14px 30px rgba(4, 182, 186, 0.24), inset 0 1px 0 rgba(255, 255, 255, 0.35)' : 'none',
                                }}
                                onMouseEnter={e => {
                                    if (!isActive) {
                                        e.currentTarget.style.background = 'rgba(4, 182, 186, 0.14)'
                                        e.currentTarget.style.boxShadow = '0 12px 26px rgba(4, 182, 186, 0.12)'
                                        e.currentTarget.style.color = '#FFFFFF'
                                    }
                                }}
                                onMouseLeave={e => {
                                    if (!isActive) {
                                        e.currentTarget.style.background = 'transparent'
                                        e.currentTarget.style.boxShadow = 'none'
                                        e.currentTarget.style.color = 'var(--color-sidebar-text)'
                                    }
                                }}
                            >
                                <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${isActive ? 'stroke-2' : 'stroke-[2px]'}`} />

                                <span className="absolute left-16 bg-slate-900 text-white text-[10px] font-semibold px-2.5 py-1.5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-md">
                                    {item.label}
                                </span>
                            </button>
                        )
                    })}
                </nav>

                {/* Priority Legend (Desktop only, at the bottom of sidebar) */}
                <div className="mt-auto pt-6 border-t border-(--color-border) w-full flex flex-col items-center gap-4 pb-2">
                    {[
                        { priority: 5, label: 'Mínima', color: 'bg-green-500', tooltip: 'Prioridade Mínima (P5)' },
                        { priority: 4, label: 'Baixa', color: 'bg-lime-500', tooltip: 'Prioridade Baixa (P4)' },
                        { priority: 3, label: 'Média', color: 'bg-amber-400', tooltip: 'Prioridade Média (P3)' },
                        { priority: 2, label: 'Alta', color: 'bg-orange-500', tooltip: 'Prioridade Alta (P2)' },
                        { priority: 1, label: 'Crítica', color: 'bg-red-600', tooltip: 'Prioridade Crítica (P1)' },
                    ].map((p) => (
                        <div key={p.priority} className="relative group cursor-help">
                            <div className={`w-[16px] h-[16px] rounded-full ${p.color} border border-white shadow-sm hover:scale-110 transition-transform`} />
                            
                            {/* Custom Tooltip */}
                            <span className="absolute left-12 top-1/2 -translate-y-1/2 bg-slate-900 text-white text-[10px] font-semibold px-2.5 py-1.5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-md">
                                {p.tooltip}
                            </span>
                        </div>
                    ))}
                </div>
            </motion.aside>
        </>
    )
}
