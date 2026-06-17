import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from './lib/supabase'
import Sidebar from './components/layout/Sidebar'
import BottomNav from './components/layout/BottomNav'
import DashboardHeader from './components/layout/DashboardHeader'
import Home from './pages/Home'
import Tasks from './pages/Tasks'
import Auth from './pages/Auth'
import Planning from './pages/Planning'
import Analytics from './pages/Analytics'
import PrioChat from './pages/PrioChat'
import Profile from './components/dashboard/Profile'
import { ProfileService } from './services/ProfileService'
import { GamificationService } from './services/GamificationService'
import Skeleton from './components/ui/Skeleton'
import ConfirmationModal from './components/ui/ConfirmationModal'

export default function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activePage, setActivePage] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('prioriza_active_page')
      return saved && ['dashboard', 'tasks', 'planning', 'analytics', 'prio', 'profile'].includes(saved) ? saved : 'dashboard'
    }
    return 'dashboard'
  })
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => typeof window !== 'undefined' ? window.innerWidth < 1024 : true) // Start collapsed (desktop) or hidden (mobile)
  const [profile, setProfile] = useState(null)
  const [alertConfig, setAlertConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    confirmText: 'Entendido',
    cancelText: null,
    onConfirm: null
  })

  // Force clean slate theme, disable dark mode
  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.classList.remove('dark')
      localStorage.removeItem('prioriza-theme')
    }
  }, [])

  useEffect(() => {
    if (typeof document === 'undefined') return

    const backgroundUrl = 'var(--prioriza-app-background)'
    const applyBackground = () => {
      document.documentElement.style.backgroundImage = backgroundUrl
      document.documentElement.style.backgroundSize = 'cover'
      document.documentElement.style.backgroundPosition = 'center top'
      document.documentElement.style.backgroundRepeat = 'no-repeat'
      document.documentElement.style.backgroundAttachment = 'fixed'
      document.documentElement.style.backgroundColor = 'var(--color-surface)'

      document.body.style.backgroundImage = backgroundUrl
      document.body.style.backgroundSize = 'cover'
      document.body.style.backgroundPosition = 'center top'
      document.body.style.backgroundRepeat = 'no-repeat'
      document.body.style.backgroundAttachment = 'fixed'
      document.body.style.backgroundColor = 'var(--color-surface)'
      document.body.style.minHeight = '100vh'
    }

    const clearBackground = () => {
      document.documentElement.style.backgroundImage = ''
      document.documentElement.style.backgroundSize = ''
      document.documentElement.style.backgroundPosition = ''
      document.documentElement.style.backgroundRepeat = ''
      document.documentElement.style.backgroundAttachment = ''
      document.documentElement.style.backgroundColor = ''

      document.body.style.backgroundImage = ''
      document.body.style.backgroundSize = ''
      document.body.style.backgroundPosition = ''
      document.body.style.backgroundRepeat = ''
      document.body.style.backgroundAttachment = ''
      document.body.style.backgroundColor = ''
      document.body.style.minHeight = ''
    }

    if (session) {
      applyBackground()
      return clearBackground
    }

    clearBackground()
  }, [session])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('prioriza_active_page', activePage)
    }
  }, [activePage])

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Intercept native browser alert
    const originalAlert = window.alert
    window.alert = (message) => {
      let type = 'info'
      let title = 'Alerta'
      let finalMessage = String(message || '')

      if (finalMessage.includes('\n')) {
        const parts = finalMessage.split('\n')
        title = parts[0].trim()
        finalMessage = parts.slice(1).join('\n').trim()
      }

      const searchStr = (title + ' ' + finalMessage).toLowerCase()
      if (searchStr.includes('erro') || searchStr.includes('falha') || searchStr.includes('expirado') || searchStr.includes('penalidade') || searchStr.includes('atraso')) {
        type = 'danger'
      } else if (searchStr.includes('subiu de nível') || searchStr.includes('sucesso') || searchStr.includes('parabéns') || searchStr.includes('vitória')) {
        type = 'success'
      }

      window.dispatchEvent(new CustomEvent('app-alert', {
        detail: {
          title: title || (type === 'danger' ? 'Ops!' : 'Alerta'),
          message: finalMessage,
          type,
          confirmText: 'Entendido',
          cancelText: null
        }
      }))
    }

    const handleAppAlert = (e) => {
      const { title, message, type, confirmText, cancelText, onConfirm } = e.detail || {}
      setAlertConfig({
        isOpen: true,
        title: title || 'Alerta',
        message: message || '',
        type: type || 'info',
        confirmText: confirmText || 'Entendido',
        cancelText: cancelText || null,
        onConfirm: onConfirm || null
      })
    }

    window.addEventListener('app-alert', handleAppAlert)
    return () => {
      window.alert = originalAlert
      window.removeEventListener('app-alert', handleAppAlert)
    }
  }, [])


  const loadProfile = useCallback(async () => {
    try {
      const data = await ProfileService.getProfile()
      setProfile(data)
      await GamificationService.checkOverdueTasksAndPenalize()
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

  useEffect(() => {
    const handleXpUpdate = () => {
      loadProfile()
    }
    const handleOverduePenalty = (e) => {
      const { tasks, deduction } = e.detail
      const titles = tasks.map(t => `"${t.title}"`).join(', ')
      alert(`PRAZO EXPIRADO!\n\nAs seguintes tarefas passaram do prazo sem conclusão: ${titles}.\nVocê perdeu ${deduction} XP de penalidade. Acelere suas entregas!`)
      loadProfile()
    }
    window.addEventListener('xp-updated', handleXpUpdate)
    window.addEventListener('tasks-overdue-penalty', handleOverduePenalty)
    return () => {
      window.removeEventListener('xp-updated', handleXpUpdate)
      window.removeEventListener('tasks-overdue-penalty', handleOverduePenalty)
    }
  }, [loadProfile])

  // Auto-collapse sidebar logic for responsive behavior
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarCollapsed(true) // Ensure it's hidden on mobile initially
      }
    }

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
    prio: {
      title: 'PRIO',
      breadcrumb: ['Assistente', 'Chat'],
      component: PrioChat,
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
    return (
      <div className="min-h-screen bg-(--color-surface) flex">
        {/* Sidebar Skeleton */}
        <div className="hidden lg:block w-20 border-r border-white/5 p-4 space-y-6 shrink-0" style={{ backgroundColor: 'var(--color-sidebar-bg)' }}>
          <Skeleton.Circle size="h-10 w-10 mx-auto" />
          <div className="space-y-6 pt-10">
            {[...Array(5)].map((_, i) => (
              <Skeleton.Circle key={i} size="h-10 w-10 mx-auto" />
            ))}
          </div>
        </div>

        {/* Content Panel Skeleton */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header Skeleton */}
          <div className="h-20 bg-(--color-surface-card) border-b border-(--color-border) px-4 sm:px-6 lg:px-8 flex items-center justify-between shrink-0">
            <div className="space-y-2">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-5 w-48" />
            </div>
            <div className="flex items-center gap-4">
              <Skeleton className="h-5 w-32 hidden sm:block" />
              <Skeleton.Circle size="h-10 w-10" />
            </div>
          </div>

          {/* Main Area Skeleton */}
          <div className="p-4 sm:p-6 lg:p-8 max-w-[1920px] w-full mx-auto flex-1 overflow-y-auto">
            <div className="grid grid-cols-12 gap-6 lg:gap-8 h-full pb-10">
              {/* Quick Action Button */}
              <div className="col-span-12 flex justify-end">
                <Skeleton className="h-10 w-48 rounded-xl" />
              </div>

              {/* LEFT COLUMN: banner, timeline & kanban */}
              <div className="col-span-12 xl:col-span-9 flex flex-col gap-6 lg:gap-8">

                {/* Timeline Card */}
                <Skeleton.Card className="p-4 sm:p-6 lg:p-8 shadow-[0_2px_40px_-10px_rgba(0,0,0,0.05)] rounded-[24px] sm:rounded-[32px] lg:rounded-[40px]">
                  <Skeleton className="h-5 w-36 mb-6" />
                  <div className="space-y-5">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="space-y-2">
                        <div className="flex justify-between">
                          <Skeleton className="h-3.5 w-1/3" />
                          <Skeleton className="h-3 w-12" />
                        </div>
                        <Skeleton className="h-2 w-full" />
                      </div>
                    ))}
                  </div>
                </Skeleton.Card>

                {/* Kanban Columns (Preview) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
                  {['A Fazer', 'Em Progresso', 'Feito'].map((status) => (
                    <div key={status} className="flex flex-col gap-3">
                      <Skeleton className="h-4 w-24 mx-auto lg:mx-0 mb-1" />
                      {[...Array(2)].map((_, cardIndex) => (
                        <Skeleton.Card key={cardIndex} className="p-5 shadow-[0_2px_20px_-5px_rgba(0,0,0,0.03)] rounded-[20px]">
                          <div className="flex justify-between items-start mb-3">
                            <Skeleton className="h-4 w-8 rounded-full" />
                            <Skeleton className="h-3.5 w-12" />
                          </div>
                          <Skeleton.Text lines={2} className="mb-4" />
                          <Skeleton className="h-1.5 w-full" />
                        </Skeleton.Card>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              {/* RIGHT COLUMN: stats */}
              <div className="col-span-12 xl:col-span-3 flex flex-col sm:flex-row xl:flex-col gap-6 lg:pt-4">
                {/* Overview Widget */}
                <div className="flex-1 xl:flex-none w-full">
                  <Skeleton className="h-4 w-24 mb-4 pl-2" />
                  <Skeleton.Card className="p-6 shadow-[0_2px_30px_-5px_rgba(0,0,0,0.03)] rounded-[30px] space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Skeleton.Circle size="h-10 w-10" />
                        <Skeleton className="h-4 w-12" />
                      </div>
                      <Skeleton className="h-6 w-6" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Skeleton.Circle size="h-10 w-10" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                      <Skeleton className="h-6 w-6" />
                    </div>
                  </Skeleton.Card>
                </div>

                {/* Performance Widget */}
                <div className="flex-1 xl:flex-none w-full">
                  <Skeleton className="h-4 w-44 mb-4 pl-2" />
                  <Skeleton.Card className="p-6 shadow-[0_2px_30px_-5px_rgba(0,0,0,0.03)] rounded-[30px] space-y-4">
                    {[...Array(2)].map((_, i) => (
                      <div key={i} className="space-y-2 border-b border-(--color-border-light) pb-3 last:border-0 last:pb-0">
                        <div className="flex justify-between">
                          <Skeleton className="h-4 w-28" />
                          <Skeleton className="h-4 w-12" />
                        </div>
                        <div className="flex justify-between">
                          <Skeleton className="h-3 w-12" />
                          <Skeleton className="h-3 w-10" />
                        </div>
                        <Skeleton className="h-1.5 w-full" />
                      </div>
                    ))}
                  </Skeleton.Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!session) {
    return <Auth onLogin={() => { }} />
  }

  return (
    <div className="min-h-screen font-sans text-(--color-text-primary) overflow-x-hidden selection:bg-blue-100 transition-colors duration-300">
      <Sidebar
        activeItem={activePage}
        onItemChange={setActivePage}
        collapsed={sidebarCollapsed}
        onCollapse={setSidebarCollapsed}
      />

      <div className="relative min-h-screen transition-all duration-300 ease-in-out lg:pl-20 pl-0">
        <div className="relative z-10">
          <DashboardHeader
            title={config.title}
            breadcrumb={config.breadcrumb}
            onNavigate={setActivePage}
            profile={profile}
          />

          <main className="px-4 sm:px-6 lg:px-8 pb-20 lg:pb-10 max-w-[1920px] mx-auto w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={activePage}
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
              >
                <PageComponent
                  profile={profile}
                  onProfileUpdate={loadProfile}
                  onNavigate={setActivePage}
                />
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>

      <BottomNav activeTab={activePage} onTabChange={setActivePage} />

      <ConfirmationModal
        isOpen={alertConfig.isOpen}
        onClose={() => setAlertConfig(prev => ({ ...prev, isOpen: false }))}
        onConfirm={() => {
          setAlertConfig(prev => ({ ...prev, isOpen: false }))
          if (alertConfig.onConfirm) alertConfig.onConfirm()
        }}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        confirmText={alertConfig.confirmText}
        cancelText={alertConfig.cancelText}
      />
    </div>
  )
}
