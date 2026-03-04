import { User } from 'lucide-react'

function getGreeting() {
    const hour = new Date().getHours()
    if (hour < 12) return 'Bom dia'
    if (hour < 18) return 'Boa tarde'
    return 'Boa noite'
}

export default function DashboardHeader({ title, breadcrumb, onNavigate, profile }) {
    const greeting = getGreeting()

    return (
        <header className="px-4 sm:px-6 lg:px-8 pt-6 pb-2 flex flex-col gap-4 lg:gap-6">
            {/* Top Navigation Row */}
            <div className="flex justify-between items-center">
                {/* Logo / Menu Mobile */}
                <div className="flex items-center gap-3 lg:hidden">
                    <img src={`${import.meta.env.BASE_URL}logo.png`} alt="Prioriza" className="h-8 w-auto object-contain" />
                </div>

                {/* Greeting (Desktop) */}
                <div className="hidden lg:flex ml-auto items-center text-sm text-gray-400 dark:text-gray-500 font-medium">
                    {greeting}, <span className="text-gray-700 dark:text-gray-200 font-bold ml-1">{profile?.full_name?.split(' ')[0] || 'Usuário'}</span>
                </div>

                {/* User Profile */}
                <div
                    onClick={() => onNavigate?.('profile')}
                    className="flex items-center gap-3 lg:ml-8 lg:pl-6 lg:border-l lg:border-gray-200 dark:lg:border-gray-700 cursor-pointer group"
                >
                    <div className="text-right hidden sm:block">
                        <div className="text-sm font-extrabold text-gray-900 dark:text-gray-100 leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {profile?.full_name || 'Usuário'}
                        </div>
                        <div className="text-[10px] text-gray-400 font-medium truncate max-w-[120px]">
                            {profile?.username ? `@${profile.username}` : (profile?.email || 'Organize seu dia')}
                        </div>
                    </div>
                    <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-2xl bg-linear-to-tr from-[#00C6FB] to-[#005BEA] flex items-center justify-center text-white font-bold relative overflow-hidden shadow-lg shadow-blue-200 shrink-0 group-hover:scale-105 transition-transform">
                        {profile?.avatar_url ? (
                            <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            <span className="relative z-10">{profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : <User className="w-5 h-5" />}</span>
                        )}
                        <div className="absolute top-0 right-0 w-4 h-4 bg-white/20 rounded-bl-full"></div>
                    </div>
                </div>
            </div>

            {/* Page Title Row */}
            <div className="flex flex-col gap-1">
                <div className="flex items-center flex-wrap gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    {breadcrumb.map((crumb, i) => (
                        <span key={i} className={`flex items-center ${i === breadcrumb.length - 1 ? 'text-blue-600' : ''}`}>
                            {i > 0 && <span className="mx-2 text-gray-300">/</span>}
                            {crumb}
                        </span>
                    ))}
                </div>

                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#111827] dark:text-white tracking-tight mt-1">{title}</h1>
            </div>
        </header>
    )
}
