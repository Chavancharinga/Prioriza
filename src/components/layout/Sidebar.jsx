import {
    LayoutDashboard,
    ListTodo,
    Calendar,
    BarChart3,
    Bot,
    User
} from 'lucide-react'
import { motion } from 'framer-motion'

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
                <div className="mb-8 flex items-center justify-center w-full px-1">
                    <img 
                        src={`${import.meta.env.BASE_URL}logo.png`} 
                        alt="Prioriza" 
                        className="w-[58px] h-auto object-contain transition-all duration-200 drop-shadow-[0_6px_16px_rgba(15,23,42,0.08)]" 
                    />
                </div>

                {/* Navigation Icons */}
                <nav className="flex-1 flex flex-col gap-3 w-full px-3 overflow-y-auto overflow-x-hidden pb-safe">
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
                                className="relative flex items-center justify-center w-12 h-12 mx-auto rounded-2xl transition-all duration-150 group cursor-pointer"
                                style={{
                                    color: isActive ? 'var(--color-sidebar-active)' : 'var(--color-sidebar-text)',
                                    backgroundColor: isActive ? 'rgba(29, 78, 216, 0.08)' : 'transparent',
                                    border: isActive ? '1px solid rgba(29, 78, 216, 0.18)' : '1px solid transparent',
                                    borderBottom: isActive ? '4px solid rgba(29, 78, 216, 0.28)' : '1px solid transparent',
                                }}
                                onMouseEnter={e => {
                                    if (!isActive) {
                                        e.currentTarget.style.backgroundColor = 'var(--color-sidebar-hover)'
                                        e.currentTarget.style.borderColor = '#E5E7EB'
                                        e.currentTarget.style.borderBottomColor = '#D1D5DB'
                                        e.currentTarget.style.borderBottomWidth = '3px'
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

                <div className="mt-auto h-8 border-t border-(--color-border) w-full" />
            </motion.aside>
        </>
    )
}
