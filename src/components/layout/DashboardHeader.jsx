import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Flame, Trophy, Star, Palmtree, X, TrendingUp, TrendingDown, Clock, CheckCircle2 } from 'lucide-react'
import { TaskService } from '../../services/TaskService'

const XP_PER_LEVEL = 1000

function estimateTaskXp(task, now = new Date()) {
    const priority = Number(task?.priority || 3)
    const baseXp = Math.max(50, (6 - priority) * 50)
    const dueDate = task?.due_date ? new Date(task.due_date) : null
    const completedDate = task?.completed_at ? new Date(task.completed_at) : null

    if (task?.status === 'Feito') {
        if (dueDate && completedDate && completedDate > dueDate) return -100
        return baseXp + (dueDate ? 150 : 0)
    }

    if (dueDate && dueDate < now) return -100
    return baseXp + (dueDate ? 150 : 0)
}

function formatShortDate(value) {
    if (!value) return 'Sem prazo'
    return new Intl.DateTimeFormat('pt-PT', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
    }).format(new Date(value))
}

function buildXpStats(tasks = [], profile = {}) {
    const now = new Date()
    const completedTasks = tasks.filter(task => task.status === 'Feito')
    const pendingTasks = tasks.filter(task => task.status !== 'Feito')
    const overdueTasks = pendingTasks.filter(task => task.due_date && new Date(task.due_date) < now)

    const completedGain = completedTasks.reduce((total, task) => total + Math.max(0, estimateTaskXp(task, now)), 0)
    const completedLoss = completedTasks.reduce((total, task) => total + Math.min(0, estimateTaskXp(task, now)), 0)
    const pendingPotential = pendingTasks
        .filter(task => !overdueTasks.some(overdue => overdue.id === task.id))
        .reduce((total, task) => total + Math.max(0, estimateTaskXp(task, now)), 0)
    const overduePenalty = overdueTasks.length * -50
    const nextLevelXp = Math.max(0, XP_PER_LEVEL - (profile?.xp || 0))

    return {
        currentXp: profile?.xp || 0,
        level: profile?.level || 1,
        nextLevelXp,
        completedGain,
        completedLoss,
        pendingPotential,
        overduePenalty,
        completedTasks: completedTasks
            .map(task => ({ ...task, xpValue: estimateTaskXp(task, now) }))
            .sort((a, b) => new Date(b.completed_at || b.updated_at || 0) - new Date(a.completed_at || a.updated_at || 0))
            .slice(0, 5),
        pendingTasks: pendingTasks
            .map(task => ({ ...task, xpValue: estimateTaskXp(task, now) }))
            .sort((a, b) => Math.abs(b.xpValue) - Math.abs(a.xpValue))
            .slice(0, 5),
        overdueTasks
    }
}

export default function DashboardHeader({ title, breadcrumb, onNavigate, profile }) {
    // Store coordinates of the user's last click to spawn particles
    const lastClickRef = useRef({ x: typeof window !== 'undefined' ? window.innerWidth / 2 : 500, y: typeof window !== 'undefined' ? window.innerHeight / 2 : 500 })

    useEffect(() => {
        const handleGlobalClick = (e) => {
            lastClickRef.current = { x: e.clientX, y: e.clientY }
        }
        window.addEventListener('mousedown', handleGlobalClick)
        return () => window.removeEventListener('mousedown', handleGlobalClick)
    }, [])

    const [displayedXp, setDisplayedXp] = useState(null)
    const [displayedLevel, setDisplayedLevel] = useState(null)
    const [desktopTrophyScale, setDesktopTrophyScale] = useState(1)
    const [mobileTrophyScale, setMobileTrophyScale] = useState(1)
    const [particles, setParticles] = useState([])
    const [sparkles, setSparkles] = useState([])
    const [xpPanelOpen, setXpPanelOpen] = useState(false)
    const [xpPanelLoading, setXpPanelLoading] = useState(false)
    const [xpPanelStats, setXpPanelStats] = useState(() => buildXpStats([], profile))

    // Initialize displayed stats when profile loads
    useEffect(() => {
        if (profile && displayedXp === null) {
            setDisplayedXp(profile.xp)
            setDisplayedLevel(profile.level)
        }
    }, [profile, displayedXp])

    const targetStatsRef = useRef({ level: 1, xp: 0 })
    const progressIntervalRef = useRef(null)

    // Clear progress interval on unmount
    useEffect(() => {
        return () => {
            if (progressIntervalRef.current) {
                clearInterval(progressIntervalRef.current)
            }
        }
    }, [])

    useEffect(() => {
        if (profile) {
            targetStatsRef.current = { level: profile.level, xp: profile.xp }
            // If no active particles are flying and no animation is running, sync immediately
            if (particles.length === 0 && !progressIntervalRef.current) {
                setDisplayedXp(profile.xp)
                setDisplayedLevel(profile.level)
            }
        }
    }, [profile, particles.length])

    // Custom animator loop to fill the level bar incrementally (60fps)
    const animateProgressBar = (fromLevel, fromXp, toLevel, toXp) => {
        // Clear any running progress animation to avoid multiple intervals overlapping
        if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current)
        }

        let currentLvl = fromLevel
        let currentX = fromXp
        
        progressIntervalRef.current = setInterval(() => {
            if (currentLvl === toLevel && currentX === toXp) {
                clearInterval(progressIntervalRef.current)
                progressIntervalRef.current = null
                return
            }
            
            if (currentLvl < toLevel) {
                currentX += 20
                if (currentX >= 1000) {
                    currentX = 0
                    currentLvl += 1
                }
            } else if (currentLvl > toLevel) {
                currentX -= 20
                if (currentX <= 0) {
                    currentX = 1000
                    currentLvl -= 1
                }
            } else {
                if (currentX < toXp) {
                    currentX = Math.min(toXp, currentX + 15)
                } else {
                    currentX = Math.max(toXp, currentX - 15)
                }
            }
            
            setDisplayedXp(currentX)
            setDisplayedLevel(currentLvl)
        }, 16)
    }

    useEffect(() => {
        const handleXpChanged = (e) => {
            const amount = e.detail?.amount
            if (amount === undefined || amount === 0) return

            // Calculate start coordinates (click coordinates)
            const startX = e.detail?.x !== undefined && e.detail?.x !== null ? e.detail.x : lastClickRef.current.x
            const startY = e.detail?.y !== undefined && e.detail?.y !== null ? e.detail.y : lastClickRef.current.y

            // Target coordinates (Level Bar)
            const targetEl = document.getElementById('level-bar-trophy-desktop') || document.getElementById('level-bar-trophy-mobile')
            let endX = window.innerWidth - 150
            let endY = 50
            if (targetEl) {
                const rect = targetEl.getBoundingClientRect()
                endX = rect.left + rect.width / 2
                endY = rect.top + rect.height / 2
            }

            const id = Math.random()
            setParticles(prev => [...prev, {
                id,
                amount,
                startX,
                startY,
                endX,
                endY
            }])
        }
        window.addEventListener('xp-changed', handleXpChanged)
        return () => window.removeEventListener('xp-changed', handleXpChanged)
    }, [displayedXp, displayedLevel])

    const handleParticleReach = (p) => {
        // 1. Remove particle
        setParticles(prev => prev.filter(item => item.id !== p.id))

        // 2. Pulse the corresponding trophy icon
        const isMobile = window.innerWidth < 1024
        if (isMobile) {
            setMobileTrophyScale([1, 1.4, 1])
            setTimeout(() => setMobileTrophyScale(1), 300)
        } else {
            setDesktopTrophyScale([1, 1.4, 1])
            setTimeout(() => setDesktopTrophyScale(1), 300)
        }

        // 3. Spawn sparkles
        spawnSparkles(p.endX, p.endY)

        // 4. Animate the progress bar to target
        const target = targetStatsRef.current
        
        // Calculate expected local target in case data hasn't arrived yet
        let localTargetXp = (displayedXp || 0) + p.amount
        let localTargetLvl = displayedLevel || 1
        if (p.amount >= 0) {
            while (localTargetXp >= 1000 && localTargetLvl < 10) {
                localTargetXp -= 1000
                localTargetLvl += 1
            }
            if (localTargetLvl >= 10 && localTargetXp > 1000) {
                localTargetXp = 1000
            }
        } else {
            while (localTargetXp < 0 && localTargetLvl > 1) {
                localTargetLvl -= 1
                localTargetXp += 1000
            }
            if (localTargetXp < 0) {
                localTargetXp = 0
            }
        }

        const finalLvl = target.level !== localTargetLvl && profile ? target.level : localTargetLvl
        const finalXp = target.xp !== localTargetXp && profile ? target.xp : localTargetXp

        animateProgressBar(displayedLevel || 1, displayedXp || 0, finalLvl, finalXp)
    }

    const spawnSparkles = (x, y) => {
        const newSparkles = Array.from({ length: 12 }).map((_, i) => {
            const angle = (i / 12) * 2 * Math.PI + (Math.random() - 0.5) * 0.4
            const distance = 25 + Math.random() * 35
            return {
                id: Math.random(),
                startX: x,
                startY: y,
                endX: x + Math.cos(angle) * distance,
                endY: y + Math.sin(angle) * distance,
                color: ['#F59E0B', '#10B981', '#3B82F6', '#EF4444', '#EC4899', '#06B6D4'][i % 6]
            }
        })
        setSparkles(prev => [...prev, ...newSparkles])
    }

    const openXpPanel = async () => {
        setXpPanelOpen(true)
        setXpPanelLoading(true)
        try {
            const tasks = await TaskService.getTasks()
            setXpPanelStats(buildXpStats(tasks, {
                ...profile,
                xp: displayedXp !== null ? displayedXp : profile?.xp,
                level: displayedLevel !== null ? displayedLevel : profile?.level
            }))
        } catch (error) {
            console.error('Error loading XP panel:', error)
            setXpPanelStats(buildXpStats([], profile))
        } finally {
            setXpPanelLoading(false)
        }
    }

    const handleXpKeyDown = (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            openXpPanel()
        }
    }

    return (
        <header className="px-4 sm:px-6 lg:px-8 pt-5 pb-2 flex flex-col gap-4 lg:gap-5">
            {/* Top Navigation Row */}
            <div className="flex justify-between items-center">
                {/* Logo / Menu Mobile */}
                <div className="flex items-center gap-3 lg:hidden">
                    <img src={`${import.meta.env.BASE_URL}logo.png`} alt="Prioriza" className="h-12 w-auto object-contain drop-shadow-[0_6px_16px_rgba(15,23,42,0.08)]" />
                </div>

                {/* Greeting & Gamification Section (Desktop) */}
                <div className="hidden lg:flex ml-auto items-center gap-4 text-sm text-(--color-text-muted) font-medium">
                    {/* Duolingo Gamification Widget */}
                    <div className="flex items-center gap-3">
                        {/* Streak Pill */}
                        <motion.div 
                            whileHover={{ y: -2 }}
                            whileTap={{ y: 1 }}
                            className="flex items-center gap-2 bg-white border border-slate-200 border-b-4 border-b-slate-200 px-3.5 py-2 rounded-2xl text-slate-700 font-extrabold shadow-sm cursor-pointer" 
                            title="Sua Ofensiva (Dias seguidos)"
                        >
                            <Flame className="h-4.5 w-4.5 text-orange-500" />
                            <span className="text-sm tracking-tight">{profile?.streak || 0}d</span>
                        </motion.div>
                        
                        {/* XP Progress Pill */}
                        <motion.div 
                            whileHover={{ y: -2 }}
                            whileTap={{ y: 1 }}
                            onClick={openXpPanel}
                            onKeyDown={handleXpKeyDown}
                            role="button"
                            tabIndex={0}
                            className="flex items-center gap-3 bg-white border border-slate-200 border-b-4 border-b-slate-200 px-3.5 py-2 rounded-2xl text-slate-700 font-extrabold shadow-sm cursor-pointer" 
                            title={`XP do Nível: ${displayedXp !== null ? displayedXp : (profile?.xp || 0)}/1000`}
                        >
                            <motion.div 
                                id="level-bar-trophy-desktop" 
                                animate={{ scale: desktopTrophyScale }} 
                                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                                className="shrink-0"
                            >
                                <Trophy className="h-5 w-5 text-blue-600" />
                            </motion.div>
                            <div className="flex flex-col justify-center">
                                <span className="text-[10px] font-black uppercase text-slate-500 leading-none tracking-wider">
                                    Nível {displayedLevel !== null ? displayedLevel : (profile?.level || 1)}
                                </span>
                                <div className="mt-1 h-2.5 w-32 bg-slate-100 border border-slate-200 rounded-full overflow-hidden flex items-center">
                                    <div
                                        className="h-full bg-blue-600 transition-all duration-300 rounded-full"
                                        style={{ width: `${Math.min(100, (((displayedXp !== null ? displayedXp : (profile?.xp || 0)) / 1000) * 100))}%` }}
                                    />
                                </div>
                            </div>
                        </motion.div>

                        {/* Rest Reward Pill */}
                        {(displayedLevel !== null ? displayedLevel : (profile?.level || 1)) >= 10 && (displayedXp !== null ? displayedXp : (profile?.xp || 0)) >= 1000 && (
                            <motion.div 
                                whileHover={{ y: -2 }}
                                whileTap={{ y: 1 }}
                                className="flex items-center gap-2 bg-white border border-slate-200 border-b-4 border-b-slate-200 px-3.5 py-2 rounded-2xl text-emerald-700 font-black shadow-sm cursor-pointer" 
                                title="Você está com tudo em dia! Recompensa de folga ativada."
                            >
                                <Palmtree className="w-5 h-5 text-emerald-600 shrink-0" />
                                <span className="text-[10px] uppercase font-black tracking-wider">Folga</span>
                            </motion.div>
                        )}
                    </div>
                </div>

                {/* User Profile */}
                <motion.div
                    whileHover={{ y: -2 }}
                    whileTap={{ y: 1 }}
                    onClick={() => onNavigate?.('profile')}
                    className="flex items-center gap-3.5 lg:ml-6 lg:pl-6 lg:border-l lg:border-slate-200 cursor-pointer group"
                >
                    <div className="text-right hidden sm:block">
                        <div className="text-sm font-black text-slate-700 leading-tight group-hover:text-blue-600 transition-colors">
                            {profile?.full_name || 'Usuário'}
                        </div>
                        <div className="text-[10px] text-slate-400 font-bold tracking-tight">
                            {profile?.username ? `@${profile.username}` : (profile?.email || 'Organize seu dia')}
                        </div>
                    </div>
                    {/* Profile Frame */}
                    <div className="border-2 border-slate-200 rounded-full p-[3px] bg-white shadow-sm transition-all duration-200 group-hover:border-blue-300 group-hover:shadow-md shrink-0">
                        <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-linear-to-tr from-[#00C6FB] to-[#005BEA] flex items-center justify-center text-white font-black relative overflow-hidden shadow-inner">
                            {profile?.avatar_url ? (
                                <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover rounded-full" />
                            ) : (
                                <span className="relative z-10 text-sm">{profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}</span>
                            )}
                            <div className="absolute top-0 right-0 w-3.5 h-3.5 bg-white/25 rounded-bl-full"></div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Mobile Gamification Widget */}
            <div className="flex lg:hidden items-center justify-center gap-3 px-1 mt-1">
                {/* Streak Pill */}
                <div 
                    className="flex items-center gap-1.5 bg-white border border-slate-200 border-b-4 border-b-slate-200 px-3 py-1.5 rounded-2xl text-slate-700 font-black flex-1 justify-center shadow-xs" 
                    title="Sua Ofensiva (Dias seguidos)"
                >
                    <Flame className="h-4.5 w-4.5 text-orange-500" />
                    <span className="text-xs font-black">{profile?.streak || 0}d</span>
                </div>
                
                {/* XP Progress Pill */}
                <div 
                    onClick={openXpPanel}
                    onKeyDown={handleXpKeyDown}
                    role="button"
                    tabIndex={0}
                    className="flex items-center gap-2 bg-white border border-slate-200 border-b-4 border-b-slate-200 px-3 py-1.5 rounded-2xl text-slate-700 font-black flex-2 justify-center shadow-xs" 
                    title={`XP do Nível: ${displayedXp !== null ? displayedXp : (profile?.xp || 0)}/1000`}
                >
                    <motion.div 
                        id="level-bar-trophy-mobile" 
                        animate={{ scale: mobileTrophyScale }} 
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                        className="shrink-0"
                    >
                        <Trophy className="h-4 w-4 text-blue-600" />
                    </motion.div>
                    <div className="flex flex-col flex-1 max-w-[120px]">
                        <span className="text-[8px] font-black uppercase text-slate-500 leading-none">
                            Nível {displayedLevel !== null ? displayedLevel : (profile?.level || 1)}
                        </span>
                        <div className="mt-1 h-2 w-full bg-slate-100 border border-slate-200 rounded-full overflow-hidden flex items-center">
                            <div
                                className="h-full bg-blue-600 transition-all duration-300 rounded-full"
                                style={{ width: `${Math.min(100, (((displayedXp !== null ? displayedXp : (profile?.xp || 0)) / 1000) * 100))}%` }}
                            />
                        </div>
                    </div>
                </div>
                
                {/* Rest Reward Pill */}
                {(displayedLevel !== null ? displayedLevel : (profile?.level || 1)) >= 10 && (displayedXp !== null ? displayedXp : (profile?.xp || 0)) >= 1000 && (
                    <div className="flex items-center gap-1 bg-white border border-slate-200 border-b-4 border-b-slate-200 px-2.5 py-1.5 rounded-2xl text-emerald-700 font-black shadow-xs" title="Você está com tudo em dia! Recompensa de folga ativada.">
                        <Palmtree className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="text-[8px] font-black uppercase tracking-wider">Folga</span>
                    </div>
                )}
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

                <h1 className="text-2xl sm:text-3xl lg:text-[2rem] font-black text-(--color-text-primary) tracking-tight mt-1">{title}</h1>
            </div>

            {/* Flying XP Particles */}
            <AnimatePresence>
                {particles.map(p => (
                    <motion.div
                        key={p.id}
                        initial={{ x: p.startX, y: p.startY, opacity: 0, scale: 0.2 }}
                        animate={{
                            x: [p.startX, p.startX + (p.endX - p.startX) * 0.15, p.endX],
                            y: [p.startY, p.startY - 120, p.endY],
                            opacity: [0, 1, 1, 0.9, 0.2],
                            scale: [0.3, 1.3, 1, 0.5]
                        }}
                        exit={{ opacity: 0 }}
                        transition={{
                            duration: 1.3,
                            ease: [0.19, 1, 0.22, 1]
                        }}
                        onAnimationComplete={() => handleParticleReach(p)}
                        className="fixed z-200 pointer-events-none flex items-center gap-1.5 bg-slate-900 text-white font-extrabold px-3.5 py-1.5 rounded-full shadow-[0_8px_24px_rgba(15,23,42,0.2)] border border-white/10 text-xs"
                    >
                        <Star className="w-3.5 h-3.5 text-white" />
                        <span>{p.amount > 0 ? '+' : ''}{p.amount} XP</span>
                    </motion.div>
                ))}
            </AnimatePresence>

            {/* Particle Burst Sparkles on Reach */}
            <AnimatePresence>
                {sparkles.map(s => (
                    <motion.div
                        key={s.id}
                        initial={{ x: s.startX, y: s.startY, opacity: 1, scale: 1.5 }}
                        animate={{ x: s.endX, y: s.endY, opacity: 0, scale: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.8, ease: [0.1, 0.8, 0.25, 1] }}
                        onAnimationComplete={() => setSparkles(prev => prev.filter(item => item.id !== s.id))}
                        className="fixed z-200 pointer-events-none w-2 h-2 rounded-full"
                        style={{ 
                            backgroundColor: s.color,
                            boxShadow: `0 0 8px ${s.color}`
                        }}
                    />
                ))}
            </AnimatePresence>

            <AnimatePresence>
                {xpPanelOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[250] flex items-start justify-center bg-slate-950/30 px-4 py-8 backdrop-blur-sm sm:items-center"
                        onClick={() => setXpPanelOpen(false)}
                    >
                        <motion.div
                            initial={{ y: 24, opacity: 0, scale: 0.96 }}
                            animate={{ y: 0, opacity: 1, scale: 1 }}
                            exit={{ y: 16, opacity: 0, scale: 0.97 }}
                            transition={{ type: 'spring', stiffness: 260, damping: 24 }}
                            className="w-full max-w-3xl overflow-hidden rounded-[32px] border-2 border-white bg-white shadow-[0_24px_80px_rgba(15,23,42,0.25)]"
                            onClick={event => event.stopPropagation()}
                        >
                            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
                                <div>
                                    <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-500">Carteira de XP</p>
                                    <h2 className="text-2xl font-black text-slate-900">Nível {xpPanelStats.level} · {xpPanelStats.currentXp}/1000 XP</h2>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setXpPanelOpen(false)}
                                    className="grid h-10 w-10 place-items-center rounded-2xl border-2 border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-900"
                                    aria-label="Fechar painel de XP"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="max-h-[75vh] space-y-5 overflow-y-auto p-6">
                                <div className="h-3.5 overflow-hidden rounded-full border border-slate-200 bg-slate-100">
                                    <div
                                        className="h-full rounded-full bg-blue-600"
                                        style={{ width: `${Math.min(100, (xpPanelStats.currentXp / XP_PER_LEVEL) * 100)}%` }}
                                    />
                                </div>

                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                                    <div className="rounded-3xl border border-blue-100 bg-blue-50 p-4">
                                        <Clock className="mb-2 h-5 w-5 text-blue-600" />
                                        <p className="text-[10px] font-black uppercase text-slate-500">Próximo nível</p>
                                        <p className="text-2xl font-black text-slate-900">{xpPanelStats.nextLevelXp}</p>
                                        <p className="text-xs font-bold text-slate-500">XP restantes</p>
                                    </div>
                                    <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-4">
                                        <TrendingUp className="mb-2 h-5 w-5 text-emerald-600" />
                                        <p className="text-[10px] font-black uppercase text-slate-500">Já ganhou</p>
                                        <p className="text-2xl font-black text-slate-900">+{xpPanelStats.completedGain}</p>
                                        <p className="text-xs font-bold text-slate-500">XP concluído</p>
                                    </div>
                                    <div className="rounded-3xl border border-amber-100 bg-amber-50 p-4">
                                        <Star className="mb-2 h-5 w-5 fill-amber-500 text-amber-500" />
                                        <p className="text-[10px] font-black uppercase text-slate-500">Pode ganhar</p>
                                        <p className="text-2xl font-black text-slate-900">+{xpPanelStats.pendingPotential}</p>
                                        <p className="text-xs font-bold text-slate-500">XP pendente</p>
                                    </div>
                                    <div className="rounded-3xl border border-rose-100 bg-rose-50 p-4">
                                        <TrendingDown className="mb-2 h-5 w-5 text-rose-600" />
                                        <p className="text-[10px] font-black uppercase text-slate-500">Perdas</p>
                                        <p className="text-2xl font-black text-slate-900">{xpPanelStats.overduePenalty + xpPanelStats.completedLoss}</p>
                                        <p className="text-xs font-bold text-slate-500">XP por atraso</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                                    <div className="rounded-3xl border border-slate-200 p-4">
                                        <div className="mb-3 flex items-center gap-2">
                                            <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                                            <h3 className="font-black text-slate-900">Próximos ganhos</h3>
                                        </div>
                                        <div className="space-y-2">
                                            {xpPanelLoading ? (
                                                <p className="text-sm font-bold text-slate-500">Calculando XP...</p>
                                            ) : xpPanelStats.pendingTasks.length ? (
                                                xpPanelStats.pendingTasks.map(task => (
                                                    <div key={task.id} className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-3 py-2">
                                                        <div className="min-w-0">
                                                            <p className="truncate text-sm font-black text-slate-800">{task.title}</p>
                                                            <p className="text-[11px] font-bold text-slate-400">{formatShortDate(task.due_date)}</p>
                                                        </div>
                                                        <span className={`rounded-full px-2.5 py-1 text-xs font-black ${task.xpValue < 0 ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'}`}>
                                                            {task.xpValue > 0 ? '+' : ''}{task.xpValue} XP
                                                        </span>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-sm font-bold text-slate-500">Nenhuma tarefa pendente com XP previsto.</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="rounded-3xl border border-slate-200 p-4">
                                        <div className="mb-3 flex items-center gap-2">
                                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                            <h3 className="font-black text-slate-900">Últimos resultados</h3>
                                        </div>
                                        <div className="space-y-2">
                                            {xpPanelLoading ? (
                                                <p className="text-sm font-bold text-slate-500">Buscando histórico...</p>
                                            ) : xpPanelStats.completedTasks.length ? (
                                                xpPanelStats.completedTasks.map(task => (
                                                    <div key={task.id} className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-3 py-2">
                                                        <div className="min-w-0">
                                                            <p className="truncate text-sm font-black text-slate-800">{task.title}</p>
                                                            <p className="text-[11px] font-bold text-slate-400">{formatShortDate(task.completed_at)}</p>
                                                        </div>
                                                        <span className={`rounded-full px-2.5 py-1 text-xs font-black ${task.xpValue < 0 ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                                            {task.xpValue > 0 ? '+' : ''}{task.xpValue} XP
                                                        </span>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-sm font-bold text-slate-500">Ainda não há tarefas concluídas no histórico.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    )
}
