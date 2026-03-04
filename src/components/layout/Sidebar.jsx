import {
    LayoutDashboard,
    ListTodo,
    Calendar,
    BarChart3,
    Menu,
    X,
    User
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import ThemeToggle from '../ui/ThemeToggle'

const menuItems = [
    { id: 'dashboard', label: 'Início', icon: LayoutDashboard },
    { id: 'tasks', label: 'Tarefas', icon: ListTodo },
    { id: 'planning', label: 'Planejamento', icon: Calendar },
    { id: 'analytics', label: 'Análise', icon: BarChart3 },
    { id: 'profile', label: 'Perfil', icon: User },
]

export default function Sidebar({ activeItem, onItemChange, collapsed, onCollapse }) {
    return (
        <>
            {/* Mobile Overlay */}
            <AnimatePresence>
                {!collapsed && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => onCollapse(true)}
                        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <motion.aside
                className={`fixed left-0 top-0 z-50 h-screen bg-white dark:bg-(--color-surface-card) transition-all duration-300 ease-in-out flex flex-col items-center py-6 border-r border-neutral-100 dark:border-(--color-border) ${collapsed ? '-translate-x-full lg:translate-x-0' : 'translate-x-0'
                    }`}
                style={{ width: '80px' }}
            >
                {/* Logo (Desktop) */}
                <div className="mb-8 hidden lg:flex items-center justify-center w-full">
                    <img src="/logo.png" alt="Prioriza" className="h-16 w-auto object-contain" />
                </div>

                {/* Hamburger / Menu Trigger (Mobile Close) */}
                <button
                    onClick={() => onCollapse(!collapsed)}
                    className="mb-6 p-2 text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors lg:hidden"
                >
                    <X className="h-6 w-6" />
                </button>

                {/* Navigation Icons */}
                <nav className="flex-1 flex flex-col gap-4 sm:gap-6 w-full px-2 overflow-y-auto overflow-x-hidden pb-safe">
                    {menuItems.map((item) => {
                        const Icon = item.icon
                        const isActive = activeItem === item.id

                        return (
                            <button
                                key={item.id}
                                onClick={() => {
                                    onItemChange(item.id);
                                    if (window.innerWidth < 1024) onCollapse(true);
                                }}
                                title={item.label}
                                className={`relative flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 mx-auto rounded-xl transition-all duration-200 group ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50 dark:hover:text-gray-200 dark:hover:bg-gray-800'
                                    }`}
                            >
                                {isActive && (
                                    <div className="absolute -left-3 top-1/2 -translate-y-1/2 h-8 w-1 rounded-r-full bg-blue-600 dark:bg-blue-400 hidden lg:block" />
                                )}

                                <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${isActive ? 'stroke-2' : 'stroke-[1.5px]'}`} />

                                <span className="hidden lg:block absolute left-14 bg-gray-900 dark:bg-gray-700 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                                    {item.label}
                                </span>
                            </button>
                        )
                    })}
                </nav>

                {/* Theme Toggle (Bottom) */}
                <div className="mt-4 mb-2">
                    <ThemeToggle />
                </div>
            </motion.aside>

            {/* Mobile Toggle Button (Fixed) */}
            <button
                onClick={() => onCollapse(false)}
                className={`fixed left-4 top-6 z-40 p-2 bg-white dark:bg-(--color-surface-card) rounded-lg shadow-sm border border-neutral-100 dark:border-(--color-border) lg:hidden ${!collapsed ? 'hidden' : ''}`}
            >
                <Menu className="h-6 w-6 text-neutral-600 dark:text-neutral-300" />
            </button>
        </>
    )
}

