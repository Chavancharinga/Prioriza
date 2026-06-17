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
                    background: 'linear-gradient(180deg, rgba(255,255,255,0.86), rgba(245,249,255,0.74))',
                    backdropFilter: 'blur(22px)',
                    borderRight: '0',
                    boxShadow: '18px 0 46px rgba(49, 91, 255, 0.08)'
                }}
            >
                {/* Logo */}
                <div className="mb-6 flex items-center justify-center w-full px-0.5">
                    <img 
                        src={`${import.meta.env.BASE_URL}logo.png`} 
                        alt="Prioriza" 
                        className="w-[68px] h-auto object-contain scale-[1.2] transition-all duration-200 drop-shadow-[0_10px_22px_rgba(49,91,255,0.10)]" 
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
                                    background: isActive ? 'linear-gradient(135deg, rgba(49, 91, 255, 0.14), rgba(18, 189, 231, 0.12))' : 'transparent',
                                    border: '0',
                                    boxShadow: isActive ? '0 16px 34px rgba(49, 91, 255, 0.16)' : 'none',
                                }}
                                onMouseEnter={e => {
                                    if (!isActive) {
                                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.72)'
                                        e.currentTarget.style.boxShadow = '0 12px 28px rgba(17, 24, 39, 0.08)'
                                        e.currentTarget.style.color = 'var(--color-text-primary)'
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
