import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Flame, Trophy, Star, Zap, Palmtree } from 'lucide-react'

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

    // Initialize displayed stats when profile loads
    useEffect(() => {
        if (profile && displayedXp === null) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
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
                // eslint-disable-next-line react-hooks/set-state-in-effect
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

    return (
        <header className="px-4 sm:px-6 lg:px-8 pt-6 pb-2 flex flex-col gap-4 lg:gap-6">
            {/* Top Navigation Row */}
            <div className="flex justify-between items-center">
                {/* Logo / Menu Mobile */}
                <div className="flex items-center gap-3 lg:hidden">
                    <img src={`${import.meta.env.BASE_URL}logo.png`} alt="Prioriza" className="h-16 sm:h-20 w-auto object-contain drop-shadow-[0_2px_8px_rgba(37,99,235,0.12)]" />
                </div>

                {/* Greeting & Gamification Section (Desktop) */}
                <div className="hidden lg:flex ml-auto items-center gap-4 text-sm text-(--color-text-muted) font-medium">
                    {/* Duolingo Gamification Widget */}
                    <div className="flex items-center gap-3">
                        {/* Streak Pill */}
                        <motion.div 
                            whileHover={{ y: -2 }}
                            whileTap={{ y: 1 }}
                            className="flex items-center gap-2 bg-orange-50 border-2 border-orange-300 border-b-[5px] border-b-orange-400 px-4 py-2 rounded-2xl text-orange-600 font-black shadow-sm cursor-pointer" 
                            title="Sua Ofensiva (Dias seguidos)"
                        >
                            <Flame className="h-5 w-5 fill-orange-500 text-orange-500 animate-pulse drop-shadow-[0_1.5px_0_rgba(194,65,12,0.3)]" />
                            <span className="text-sm font-black tracking-tight">{profile?.streak || 0}d</span>
                        </motion.div>
                        
                        {/* XP Progress Pill */}
                        <motion.div 
                            whileHover={{ y: -2 }}
                            whileTap={{ y: 1 }}
                            className="flex items-center gap-3 bg-blue-50 border-2 border-blue-300 border-b-[5px] border-b-blue-400 px-4 py-2 rounded-2xl text-blue-600 font-black shadow-sm cursor-pointer" 
                            title={`XP do Nível: ${displayedXp !== null ? displayedXp : (profile?.xp || 0)}/1000`}
                        >
                            <motion.div 
                                id="level-bar-trophy-desktop" 
                                animate={{ scale: desktopTrophyScale }} 
                                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                                className="shrink-0"
                            >
                                <Trophy className="h-5 w-5 text-amber-500 fill-amber-500 drop-shadow-[0_1.5px_0_rgba(180,83,9,0.3)]" />
                            </motion.div>
                            <div className="flex flex-col justify-center">
                                <span className="text-[10px] font-black uppercase text-blue-700 leading-none tracking-wider">
                                    Nível {displayedLevel !== null ? displayedLevel : (profile?.level || 1)}
                                </span>
                                <div className="mt-1 h-3 w-32 bg-blue-100 border border-blue-200 rounded-full overflow-hidden shadow-inner flex items-center">
                                    <div
                                        className="h-full bg-blue-500 border-r-2 border-black/10 transition-all duration-300 rounded-full"
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
                                className="flex items-center gap-2 bg-emerald-50 border-2 border-emerald-300 border-b-[5px] border-b-emerald-400 px-4 py-2 rounded-2xl text-emerald-600 font-black shadow-sm cursor-pointer animate-bounce" 
                                title="Você está com tudo em dia! Recompensa de folga ativada."
                            >
                                <Palmtree className="w-5 h-5 text-emerald-600 fill-emerald-600 shrink-0 drop-shadow-[0_1.5px_0_rgba(4,120,87,0.3)]" />
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
                    className="flex items-center gap-1.5 bg-orange-50 border-2 border-orange-300 border-b-[5px] border-b-orange-400 px-3 py-1.5 rounded-2xl text-orange-600 font-black flex-1 justify-center shadow-xs" 
                    title="Sua Ofensiva (Dias seguidos)"
                >
                    <Flame className="h-4.5 w-4.5 fill-orange-500 text-orange-500 animate-pulse drop-shadow-[0_1.5px_0_rgba(194,65,12,0.3)]" />
                    <span className="text-xs font-black">{profile?.streak || 0}d</span>
                </div>
                
                {/* XP Progress Pill */}
                <div 
                    className="flex items-center gap-2 bg-blue-50 border-2 border-blue-300 border-b-[5px] border-b-blue-400 px-3 py-1.5 rounded-2xl text-blue-600 font-black flex-2 justify-center shadow-xs" 
                    title={`XP do Nível: ${displayedXp !== null ? displayedXp : (profile?.xp || 0)}/1000`}
                >
                    <motion.div 
                        id="level-bar-trophy-mobile" 
                        animate={{ scale: mobileTrophyScale }} 
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                        className="shrink-0"
                    >
                        <Trophy className="h-4 w-4 text-amber-500 fill-amber-500 drop-shadow-[0_1.5px_0_rgba(180,83,9,0.3)]" />
                    </motion.div>
                    <div className="flex flex-col flex-1 max-w-[120px]">
                        <span className="text-[8px] font-black uppercase text-blue-700 leading-none">
                            Nível {displayedLevel !== null ? displayedLevel : (profile?.level || 1)}
                        </span>
                        <div className="mt-1 h-2 w-full bg-blue-100 border border-blue-200/50 rounded-full overflow-hidden shadow-inner flex items-center">
                            <div
                                className="h-full bg-blue-500 border-r-2 border-black/10 transition-all duration-300 rounded-full"
                                style={{ width: `${Math.min(100, (((displayedXp !== null ? displayedXp : (profile?.xp || 0)) / 1000) * 100))}%` }}
                            />
                        </div>
                    </div>
                </div>
                
                {/* Rest Reward Pill */}
                {(displayedLevel !== null ? displayedLevel : (profile?.level || 1)) >= 10 && (displayedXp !== null ? displayedXp : (profile?.xp || 0)) >= 1000 && (
                    <div className="flex items-center gap-1 bg-emerald-50 border-2 border-emerald-300 border-b-[5px] border-b-emerald-400 px-2.5 py-1.5 rounded-2xl text-emerald-600 font-black shadow-xs animate-bounce" title="Você está com tudo em dia! Recompensa de folga ativada.">
                        <Palmtree className="w-4 h-4 text-emerald-600 fill-emerald-600 shrink-0 drop-shadow-[0_1.5px_0_rgba(4,120,87,0.3)]" />
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

                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-(--color-text-primary) tracking-tight mt-1">{title}</h1>
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
                        className="fixed z-200 pointer-events-none flex items-center gap-1.5 bg-linear-to-r from-emerald-500 to-teal-500 text-white font-extrabold px-3.5 py-1.5 rounded-full shadow-[0_4px_12px_rgba(16,185,129,0.2)] border border-emerald-500/20 text-xs"
                    >
                        <Star className="w-3.5 h-3.5 fill-white text-emerald-400 animate-spin-slow animate-pulse" />
                        <span>+{p.amount} XP</span>
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
        </header>
    )
}
