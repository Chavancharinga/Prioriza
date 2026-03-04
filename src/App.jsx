import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { supabase } from './lib/supabase'
import Sidebar from './components/layout/Sidebar'
import DashboardHeader from './components/layout/DashboardHeader'
import Home from './pages/Home'
import Tasks from './pages/Tasks'
import Auth from './pages/Auth'
import Planning from './pages/Planning'
import Analytics from './pages/Analytics'
import Profile from './components/dashboard/Profile'
import { ProfileService } from './services/ProfileService'

export default function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activePage, setActivePage] = useState('dashboard')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true) // Start collapsed (desktop) or hidden (mobile)
  const [profile, setProfile] = useState(null)

  const loadProfile = useCallback(async () => {
    try {
      const data = await ProfileService.getProfile()
      setProfile(data)
    } catch (error) {
      console.error('Error loading app profile:', error)
    }
  }, [])

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) loadProfile()
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) {
        loadProfile()
      } else {
        setProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [loadProfile])

  // Auto-collapse sidebar logic for responsive behavior
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarCollapsed(true) // Ensure it's hidden on mobile initially
      }
    }

    // Initial check
    if (window.innerWidth < 1024) setSidebarCollapsed(true)

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const pageConfig = {
    dashboard: {
      title: 'Gerenciamento de Tarefas',
      breadcrumb: ['Tarefas', 'Hoje'],
      component: Home,
    },
    tasks: {
      title: 'Lista de Tarefas',
      breadcrumb: ['Tarefas', 'Todas'],
      component: Tasks,
    },
    planning: {
      title: 'Planejamento',
      breadcrumb: ['Planejamento', 'Calendário'],
      component: Planning,
    },
    analytics: {
      title: 'Análise',
      breadcrumb: ['Análise', 'Visão Geral'],
      component: Analytics,
    },
    profile: {
      title: 'Meu Perfil',
      breadcrumb: ['Configurações', 'Perfil'],
      component: Profile,
    },
  }

  const config = pageConfig[activePage] || pageConfig.dashboard
  const PageComponent = config.component

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-(--color-surface)"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
  }

  if (!session) {
    return <Auth onLogin={() => { }} />
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] dark:bg-(--color-surface) font-sans text-gray-900 dark:text-gray-100 overflow-x-hidden selection:bg-blue-100 dark:selection:bg-blue-900 transition-colors duration-300">
      <Sidebar
        activeItem={activePage}
        onItemChange={setActivePage}
        collapsed={sidebarCollapsed}
        onCollapse={setSidebarCollapsed}
      />

      <div
        className="transition-all duration-300 ease-in-out"
        style={{ marginLeft: typeof window !== 'undefined' && window.innerWidth >= 1024 ? '80px' : '0px' }}
      >
        <DashboardHeader
          title={config.title}
          breadcrumb={config.breadcrumb}
          onNavigate={setActivePage}
          profile={profile}
        />

        <main className="px-4 sm:px-6 lg:px-8 pb-10 max-w-[1920px] mx-auto w-full">
          <PageComponent profile={profile} onProfileUpdate={loadProfile} />
        </main>
      </div>
    </div>
  )
}
