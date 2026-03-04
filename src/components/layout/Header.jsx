import { Search, Bell, User, LogOut, Settings, HelpCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'

export default function Header() {
    const [searchOpen, setSearchOpen] = useState(false)
    const [profileOpen, setProfileOpen] = useState(false)

    return (
        <header className="sticky top-0 z-50 border-b border-neutral-200 bg-white/80 backdrop-blur-xl">
            <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
                {/* Logo */}
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <img
                            src={`${import.meta.env.BASE_URL}logo.png`}
                            alt="Prioriza"
                            className="h-9 w-9 object-contain"
                        />
                        <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-linear-to-br from-prioriza-blue to-prioriza-purple" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-neutral-900">
                            Prioriza
                        </h1>
                        <p className="hidden text-xs text-neutral-500 sm:block">
                            Organize. Priorize. Conquiste.
                        </p>
                    </div>
                </div>

                {/* Search - Desktop */}
                <div className="hidden flex-1 max-w-md lg:block">
                    <div className="relative group">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400 transition-colors group-focus-within:text-primary-500" />
                        <input
                            type="search"
                            placeholder="Buscar tarefas, eventos..."
                            className="h-10 w-full rounded-xl border border-neutral-200 bg-neutral-50/50 pl-10 pr-4 text-sm text-neutral-900 outline-none transition-all placeholder:text-neutral-400 hover:border-neutral-300 hover:bg-white focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-500/10"
                        />
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    {/* Search - Mobile */}
                    <button
                        onClick={() => setSearchOpen(!searchOpen)}
                        className="flex h-10 w-10 items-center justify-center rounded-xl text-neutral-600 transition-all hover:bg-neutral-100 hover:text-neutral-900 active:scale-95 lg:hidden"
                    >
                        <Search className="h-5 w-5" />
                    </button>

                    {/* Notifications */}
                    <button className="relative flex h-10 w-10 items-center justify-center rounded-xl text-neutral-600 transition-all hover:bg-neutral-100 hover:text-neutral-900 active:scale-95">
                        <Bell className="h-5 w-5" />
                        <span className="absolute right-1.5 top-1.5 flex h-2 w-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-critical opacity-75" />
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-critical ring-2 ring-white" />
                        </span>
                    </button>

                    {/* Profile Menu */}
                    <div className="relative">
                        <button
                            onClick={() => setProfileOpen(!profileOpen)}
                            className="group flex items-center gap-2 rounded-xl transition-all hover:bg-neutral-50 active:scale-95"
                        >
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-primary-500 via-prioriza-purple to-prioriza-pink font-semibold text-white shadow-lg shadow-primary-500/25 ring-2 ring-white transition-all group-hover:shadow-xl group-hover:shadow-primary-500/40">
                                <span className="text-sm">U</span>
                            </div>
                            <div className="hidden flex-col items-start lg:flex">
                                <span className="text-sm font-semibold text-neutral-900">Usuário</span>
                                <span className="text-xs text-neutral-500">usuario@email.com</span>
                            </div>
                        </button>

                        {/* Dropdown Menu */}
                        <AnimatePresence>
                            {profileOpen && (
                                <>
                                    {/* Backdrop */}
                                    <div
                                        className="fixed inset-0 z-40"
                                        onClick={() => setProfileOpen(false)}
                                    />

                                    {/* Menu */}
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                        transition={{ duration: 0.15 }}
                                        className="absolute right-0 top-12 z-50 w-64 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-2xl"
                                    >
                                        {/* User Info */}
                                        <div className="border-b border-neutral-100 bg-linear-to-br from-neutral-50 to-white p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-primary-500 via-prioriza-purple to-prioriza-pink font-bold text-white shadow-lg">
                                                    U
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold text-neutral-900 truncate">
                                                        Usuário
                                                    </p>
                                                    <p className="text-xs text-neutral-500 truncate">
                                                        usuario@email.com
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Menu Items */}
                                        <div className="p-2">
                                            <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-neutral-700 transition-all hover:bg-neutral-50 hover:text-neutral-900 active:scale-[0.98]">
                                                <User className="h-4 w-4" />
                                                <span>Meu Perfil</span>
                                            </button>
                                            <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-neutral-700 transition-all hover:bg-neutral-50 hover:text-neutral-900 active:scale-[0.98]">
                                                <Settings className="h-4 w-4" />
                                                <span>Configurações</span>
                                            </button>
                                            <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-neutral-700 transition-all hover:bg-neutral-50 hover:text-neutral-900 active:scale-[0.98]">
                                                <HelpCircle className="h-4 w-4" />
                                                <span>Ajuda & Suporte</span>
                                            </button>
                                        </div>

                                        {/* Logout */}
                                        <div className="border-t border-neutral-100 p-2">
                                            <button className="flex w-full items-center gap-3 rounded-lg bg-critical/5 px-3 py-2.5 text-sm font-semibold text-critical transition-all hover:bg-critical/10 active:scale-[0.98]">
                                                <LogOut className="h-4 w-4" />
                                                <span>Sair da Conta</span>
                                            </button>
                                        </div>
                                    </motion.div>
                                </>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* Mobile Search Modal */}
            <AnimatePresence>
                {searchOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="border-t border-neutral-200 bg-white p-4 lg:hidden"
                    >
                        <div className="relative">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                            <input
                                type="search"
                                placeholder="Buscar tarefas, eventos..."
                                autoFocus
                                className="h-12 w-full rounded-xl border border-neutral-200 bg-neutral-50 pl-10 pr-4 text-sm text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-500/10"
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    )
}
