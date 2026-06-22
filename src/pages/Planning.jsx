import { useState, useEffect, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Calendar, Clock, AlertTriangle, CheckCircle, ExternalLink } from 'lucide-react'
import { TaskService } from '../services/TaskService'
import { ProfileService } from '../services/ProfileService'
import Skeleton from '../components/ui/Skeleton'

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const MONTHS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']

const priorityDotColors = {
    1: 'bg-red-600',
    2: 'bg-orange-500',
    3: 'bg-amber-400',
    4: 'bg-lime-500',
    5: 'bg-green-500',
}

export default function Planning() {
    const [tasks, setTasks] = useState([])
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)
    const [currentDate, setCurrentDate] = useState(new Date())
    const [selectedDate, setSelectedDate] = useState(new Date()) // Default to today's date
    const [viewMode, setViewMode] = useState(() => {
        if (typeof window !== 'undefined' && window.innerWidth < 768) return 'day'
        return 'month'
    }) // 'month', 'week', 'day'
    const [sortBy, setSortBy] = useState('planning') // 'planning', 'due_date', 'priority', 'duration'

    useEffect(() => {
        loadData()
    }, [])

    async function loadData() {
        try {
            setLoading(true)
            const [tasksData, profileData] = await Promise.all([
                TaskService.getTasks(),
                ProfileService.getProfile()
            ])
            setTasks(tasksData || [])
            setProfile(profileData || null)
        } catch (err) {
            console.error('Error loading data for planning:', err)
        } finally {
            setLoading(false)
        }
    }

    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()

    // 1. Task Rollover: Incomplete tasks whose due_date is in the past roll over to today
    const processedTasks = useMemo(() => {
        const todayStr = new Date().toISOString().split('T')[0]
        return tasks.map(t => {
            if (!t.due_date) return t
            const dueStr = t.due_date.split('T')[0]
            if (t.status !== 'Feito' && dueStr < todayStr) {
                return {
                    ...t,
                    original_due_date: t.due_date,
                    due_date: `${todayStr}T${t.due_date.split('T')[1] || '23:59:59'}`
                }
            }
            return t
        })
    }, [tasks])

    const calendarDays = useMemo(() => {
        const firstDay = new Date(year, month, 1)
        const lastDay = new Date(year, month + 1, 0)
        const startPad = firstDay.getDay()
        const totalDays = lastDay.getDate()

        const days = []

        // Padding for start of month
        for (let i = 0; i < startPad; i++) {
            const prevDate = new Date(year, month, -startPad + i + 1)
            days.push({ date: prevDate, isCurrentMonth: false })
        }

        // Days of the month
        for (let i = 1; i <= totalDays; i++) {
            days.push({ date: new Date(year, month, i), isCurrentMonth: true })
        }

        // Padding for end of month (fill to 42 = 6 rows)
        const remaining = 42 - days.length
        for (let i = 1; i <= remaining; i++) {
            days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false })
        }

        return days
    }, [year, month])

    const weekDays = useMemo(() => {
        const start = new Date(currentDate)
        const day = start.getDay() // 0 is Sunday
        start.setDate(start.getDate() - day)
        
        const days = []
        for (let i = 0; i < 7; i++) {
            const d = new Date(start)
            d.setDate(start.getDate() + i)
            days.push(d)
        }
        return days
    }, [currentDate])

    const displayDays = useMemo(() => {
        if (viewMode === 'month') {
            return calendarDays
        } else if (viewMode === 'week') {
            return weekDays.map(d => ({ date: d, isCurrentMonth: d.getMonth() === month }))
        } else {
            return [{ date: currentDate, isCurrentMonth: true }]
        }
    }, [viewMode, calendarDays, weekDays, currentDate, month])

    const headerTitle = useMemo(() => {
        if (viewMode === 'month') {
            return `${MONTHS[month]} ${year}`
        } else if (viewMode === 'week') {
            const start = weekDays[0]
            const end = weekDays[6]
            if (start.getMonth() === end.getMonth()) {
                return `${start.getDate()} - ${end.getDate()} de ${MONTHS[start.getMonth()]} ${start.getFullYear()}`
            }
            return `${start.getDate()} de ${MONTHS[start.getMonth()]} - ${end.getDate()} de ${MONTHS[end.getMonth()]} ${end.getFullYear()}`
        } else {
            return currentDate.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })
        }
    }, [viewMode, currentDate, weekDays, month, year])

    function getTasksForDate(date) {
        const dateStr = date.toISOString().split('T')[0]
        return processedTasks.filter(t => {
            if (!t.due_date) return false
            return t.due_date.split('T')[0] === dateStr
        })
    }

    function isToday(date) {
        const today = new Date()
        return date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear()
    }

    function isSelected(date) {
        if (!selectedDate) return false
        return date.getDate() === selectedDate.getDate() &&
            date.getMonth() === selectedDate.getMonth() &&
            date.getFullYear() === selectedDate.getFullYear()
    }

    function handlePrev() {
        if (viewMode === 'month') {
            setCurrentDate(new Date(year, month - 1, 1))
        } else if (viewMode === 'week') {
            const next = new Date(currentDate)
            next.setDate(next.getDate() - 7)
            setCurrentDate(next)
        } else {
            const next = new Date(currentDate)
            next.setDate(next.getDate() - 1)
            setCurrentDate(next)
            setSelectedDate(next)
        }
    }

    function handleNext() {
        if (viewMode === 'month') {
            setCurrentDate(new Date(year, month + 1, 1))
        } else if (viewMode === 'week') {
            const next = new Date(currentDate)
            next.setDate(next.getDate() + 7)
            setCurrentDate(next)
        } else {
            const next = new Date(currentDate)
            next.setDate(next.getDate() + 1)
            setCurrentDate(next)
            setSelectedDate(next)
        }
    }

    // Global Multi-Day Task Scheduler & Splitter
    const globalSchedule = useMemo(() => {
        if (!profile || processedTasks.length === 0) return {}

        const dayMap = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

        // 1. Get all incomplete tasks with due dates
        const incompleteTasks = processedTasks
            .filter(t => t.status !== 'Feito' && t.due_date)
            .map(t => ({
                ...t,
                remainingMinutes: t.estimated_minutes || 30
            }))

        // Sort globally: Critical priority first (1 is most critical), then by due date
        incompleteTasks.sort((a, b) => {
            const prioA = a.priority || 3
            const prioB = b.priority || 3
            if (prioA !== prioB) return prioA - prioB
            return new Date(a.due_date) - new Date(b.due_date)
        })

        const scheduleByDate = {} // dateStr -> { slots: [], scheduled: [], waitlist: [] }
        
        // We will schedule for a window of 60 days starting from 7 days ago (to support past views within range)
        const startDate = new Date()
        startDate.setDate(startDate.getDate() - 7)

        for (let dayOffset = 0; dayOffset < 60; dayOffset++) {
            const currentDate = new Date(startDate)
            currentDate.setDate(startDate.getDate() + dayOffset)
            const dateStr = currentDate.toISOString().split('T')[0]
            const dayOfWeek = dayMap[currentDate.getDay()]
            const slots = profile.preferências?.work_hours?.[dayOfWeek] || []

            // Sort slots chronologically
            const sortedSlots = [...slots].map(s => {
                const [sh, sm] = s.start.split(':').map(Number)
                const [eh, em] = s.end.split(':').map(Number)
                return {
                    startStr: s.start,
                    endStr: s.end,
                    startMinutes: sh * 60 + sm,
                    endMinutes: eh * 60 + em,
                }
            }).sort((a, b) => a.startMinutes - b.startMinutes)

            scheduleByDate[dateStr] = {
                slots: sortedSlots,
                scheduled: [],
                waitlist: []
            }
        }

        // Active scheduling starts from today's midnight (proactive planning)
        const planStartDateStr = new Date().toISOString().split('T')[0]
        const planStartDate = new Date(planStartDateStr)

        for (const task of incompleteTasks) {
            const taskDueStr = task.due_date.split('T')[0]
            
            // Overdue tasks are planned starting today
            let schedDate = taskDueStr < planStartDateStr ? new Date(planStartDate) : new Date(planStartDateStr)
            let remaining = task.remainingMinutes

            while (remaining > 0) {
                const dateStr = schedDate.toISOString().split('T')[0]
                
                // If we went beyond the task's due date, the remaining portion goes to the waitlist of the due date day
                if (dateStr > taskDueStr) {
                    const destDate = taskDueStr < planStartDateStr ? planStartDateStr : taskDueStr
                    if (scheduleByDate[destDate]) {
                        // Check if task is already in waitlist
                        const alreadyInWaitlist = scheduleByDate[destDate].waitlist.find(t => t.id === task.id)
                        if (!alreadyInWaitlist) {
                            scheduleByDate[destDate].waitlist.push({
                                ...task,
                                remainingMinutes: remaining
                            })
                        }
                    }
                    break
                }

                if (scheduleByDate[dateStr]) {
                    const dayData = scheduleByDate[dateStr]
                    
                    if (dayData.slots.length > 0) {
                        // Sum up allocated minutes on this day so far
                        const allocatedToday = dayData.scheduled.reduce((sum, item) => {
                            return sum + item.allocations.reduce((s, a) => s + a.minutes, 0)
                        }, 0)

                        const totalCapacity = dayData.slots.reduce((sum, slot) => {
                            return sum + (slot.endMinutes - slot.startMinutes)
                        }, 0)

                        const availableToday = totalCapacity - allocatedToday

                        if (availableToday > 0) {
                            const allocate = Math.min(remaining, availableToday)
                            const allocations = []
                            let minutesToAllocate = allocate

                            for (const slot of dayData.slots) {
                                // Find previous allocations in this specific slot
                                let previousAllocationsInSlot = 0
                                dayData.scheduled.forEach(item => {
                                    item.allocations.forEach(a => {
                                        const [ah, am] = a.start.split(':').map(Number)
                                        const aStartMinutes = ah * 60 + am
                                        if (aStartMinutes >= slot.startMinutes && aStartMinutes < slot.endMinutes) {
                                            previousAllocationsInSlot += a.minutes
                                        }
                                    })
                                })

                                const slotPointer = slot.startMinutes + previousAllocationsInSlot
                                const slotAvailable = slot.endMinutes - slotPointer

                                if (slotAvailable > 0 && minutesToAllocate > 0) {
                                    const slotAlloc = Math.min(minutesToAllocate, slotAvailable)
                                    
                                    const formatTimeFromMinutes = (m) => {
                                        const hours = Math.floor(m / 60).toString().padStart(2, '0')
                                        const mins = (m % 60).toString().padStart(2, '0')
                                        return `${hours}:${mins}`
                                    }

                                    allocations.push({
                                        start: formatTimeFromMinutes(slotPointer),
                                        end: formatTimeFromMinutes(slotPointer + slotAlloc),
                                        minutes: slotAlloc
                                    })

                                    minutesToAllocate -= slotAlloc
                                }
                            }

                            if (allocations.length > 0) {
                                dayData.scheduled.push({
                                    ...task,
                                    allocations,
                                    partiallyScheduled: (remaining - allocate) > 0 || (task.estimated_minutes > allocate),
                                    remainingMinutes: remaining - allocate
                                })
                                remaining -= allocate
                            }
                        }
                    }
                }

                // Move pointer to next day
                schedDate.setDate(schedDate.getDate() + 1)
                
                // Safety cutoff (100 days max lookup)
                if (schedDate - planStartDate > 1000 * 60 * 60 * 24 * 100) {
                    break
                }
            }
        }

        return scheduleByDate
    }, [processedTasks, profile])

    const autoplannedData = useMemo(() => {
        if (!selectedDate || !profile) return { slots: [], scheduled: [], waitlist: [], completed: [] }

        const dateStr = selectedDate.toISOString().split('T')[0]
        const daySchedule = globalSchedule[dateStr] || { slots: [], scheduled: [], waitlist: [] }
        
        // Filter completed tasks for selectedDate
        const completed = processedTasks.filter(t => {
            if (t.status !== 'Feito' || !t.completed_at) return false
            return t.completed_at.split('T')[0] === dateStr
        })

        return {
            slots: daySchedule.slots,
            scheduled: daySchedule.scheduled,
            waitlist: daySchedule.waitlist,
            completed
        }
    }, [selectedDate, globalSchedule, processedTasks, profile])

    // Categorization: Sort scheduled & waitlist lists by the user's preference
    const sortedScheduled = useMemo(() => {
        const list = [...autoplannedData.scheduled]
        if (sortBy === 'due_date') {
            return list.sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
        } else if (sortBy === 'priority') {
            return list.sort((a, b) => (a.priority || 3) - (b.priority || 3))
        } else if (sortBy === 'duration') {
            return list.sort((a, b) => (b.estimated_minutes || 0) - (a.estimated_minutes || 0))
        }
        return list
    }, [autoplannedData.scheduled, sortBy])

    const sortedWaitlist = useMemo(() => {
        const list = [...autoplannedData.waitlist]
        if (sortBy === 'due_date') {
            return list.sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
        } else if (sortBy === 'priority') {
            return list.sort((a, b) => (a.priority || 3) - (b.priority || 3))
        } else if (sortBy === 'duration') {
            return list.sort((a, b) => (b.estimated_minutes || 0) - (a.estimated_minutes || 0))
        }
        return list
    }, [autoplannedData.waitlist, sortBy])

    if (loading) {
        return (
            <div className="grid grid-cols-1 gap-6 lg:gap-8 xl:grid-cols-[minmax(0,1fr)_360px] 2xl:grid-cols-[minmax(0,1fr)_400px]">
                {/* Calendar skeleton */}
                <div className="min-w-0">
                    <Skeleton.Card className="p-4 sm:p-6 lg:p-8 rounded-[24px] sm:rounded-[32px] shadow-[0_2px_40px_-10px_rgba(0,0,0,0.05)]">
                        {/* Header row */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                            <Skeleton className="h-8 w-48" />
                            <div className="flex gap-2">
                                <Skeleton className="h-7 w-32" />
                                <Skeleton className="h-7 w-20" />
                            </div>
                        </div>

                        {/* Weekday headers */}
                        <div className="grid grid-cols-7 gap-1 text-center mb-2">
                            {[...Array(7)].map((_, i) => (
                                <Skeleton key={i} className="h-4 w-12 mx-auto" />
                            ))}
                        </div>

                        {/* Calendar grid */}
                        <div className="grid grid-cols-7 gap-1 sm:gap-2">
                            {[...Array(35)].map((_, i) => (
                                <div key={i} className="min-h-[80px] sm:min-h-[100px] bg-neutral-50/50 dark:bg-neutral-800/10 rounded-xl p-2 border border-neutral-100/50 dark:border-neutral-700/10 flex flex-col justify-between">
                                    <Skeleton className="h-4 w-4" />
                                    <div className="flex gap-1 justify-center">
                                        <Skeleton.Circle size="h-1.5 w-1.5" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Skeleton.Card>
                </div>

                {/* Planning sidebar skeleton */}
                <div className="min-w-0 space-y-6">
                    <Skeleton.Card className="p-6 rounded-[24px] sm:rounded-[32px] shadow-[0_2px_40px_-10px_rgba(0,0,0,0.05)]">
                        <Skeleton className="h-5 w-32 mb-4" />
                        <div className="space-y-3">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="p-3 border border-neutral-100 dark:border-neutral-700/50 rounded-xl space-y-2">
                                    <Skeleton className="h-4 w-3/4" />
                                    <div className="flex justify-between">
                                        <Skeleton className="h-3 w-16" />
                                        <Skeleton className="h-3 w-12" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Skeleton.Card>
                </div>
            </div>
        )
    }


    return (
        <div className="grid grid-cols-1 items-stretch gap-6 lg:gap-8 xl:grid-cols-[minmax(0,1fr)_360px] 2xl:grid-cols-[minmax(0,1fr)_400px]">
            {/* Calendar */}
            <div className="min-h-0 min-w-0">
                <div className="h-full bg-white rounded-[24px] sm:rounded-[32px] p-4 sm:p-6 lg:p-8 shadow-[0_2px_40px_-10px_rgba(0,0,0,0.05)]">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                        <h2 className="text-xl sm:text-2xl font-black text-gray-900">
                            {headerTitle}
                        </h2>
                        
                        <div className="flex flex-wrap items-center gap-3">
                            {/* View Switcher Tabs */}
                            <div className="flex bg-gray-100 rounded-lg p-0.5 border border-gray-200">
                                <button
                                    onClick={() => setViewMode('day')}
                                    className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${viewMode === 'day' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
                                >
                                    Hoje
                                </button>
                                <button
                                    onClick={() => setViewMode('week')}
                                    className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${viewMode === 'week' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
                                >
                                    Semana
                                </button>
                                <button
                                    onClick={() => setViewMode('month')}
                                    className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${viewMode === 'month' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
                                >
                                    Mês
                                </button>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => { setCurrentDate(new Date()); setSelectedDate(new Date()) }}
                                    className="px-2.5 py-1.5 text-xs font-bold text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                                >
                                    Ir p/ Hoje
                                </button>
                                <button onClick={handlePrev} className="p-1.5 hover:bg-gray-100 rounded-xl transition-colors">
                                    <ChevronLeft className="w-5 h-5 text-gray-600" />
                                </button>
                                <button onClick={handleNext} className="p-1.5 hover:bg-gray-100 rounded-xl transition-colors">
                                    <ChevronRight className="w-5 h-5 text-gray-600" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Weekday Headers */}
                    {viewMode !== 'day' && (
                        <div className={`grid grid-cols-7 mb-2 ${viewMode === 'week' ? 'hidden md:grid' : ''}`}>
                            {WEEKDAYS.map(day => (
                                <div key={day} className="text-center text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-wider py-2">
                                    {day}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Calendar Grid */}
                    {viewMode === 'month' ? (
                        <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
                            {displayDays.map((day, i) => {
                                const dayTasks = getTasksForDate(day.date)
                                const hasTask = dayTasks.length > 0
                                const today = isToday(day.date)
                                const selected = isSelected(day.date)

                                return (
                                    <button
                                        key={i}
                                        onClick={() => setSelectedDate(day.date)}
                                        className={`relative aspect-square flex flex-col items-center justify-start pt-1 sm:pt-2 rounded-lg sm:rounded-xl transition-all text-xs sm:text-sm font-medium
                                            ${!day.isCurrentMonth ? 'text-gray-300' : 'text-gray-700'}
                                            ${today ? 'bg-blue-50 text-blue-700 font-bold' : ''}
                                            ${selected ? 'ring-[3px] ring-(--color-prioriza-blue) bg-[rgba(30,58,138,0.10)]' : ''}
                                            ${!selected && day.isCurrentMonth ? 'hover:bg-gray-50' : ''}
                                        `}
                                    >
                                        <span className={`w-5 h-5 sm:w-7 sm:h-7 text-[10px] sm:text-sm flex items-center justify-center rounded-full ${today ? 'bg-blue-600 text-white shadow-xs' : ''}`}>
                                            {day.date.getDate()}
                                        </span>

                                        {/* Task Dots */}
                                        {hasTask && (
                                            <div className="flex gap-0.5 mt-0.5 sm:mt-1 flex-wrap justify-center max-w-[90%]">
                                                {dayTasks.slice(0, 3).map((t, j) => (
                                                    <div
                                                        key={j}
                                                        className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full ${priorityDotColors[t.priority] || 'bg-gray-400'}`}
                                                    />
                                                ))}
                                                {dayTasks.length > 3 && (
                                                    <span className="text-[7px] sm:text-[8px] text-gray-400 font-bold">+{dayTasks.length - 3}</span>
                                                )}
                                            </div>
                                        )}
                                    </button>
                                )
                            })}
                        </div>
                    ) : viewMode === 'week' ? (
                        <div className="grid grid-cols-1 md:grid-cols-7 gap-3 py-2">
                            {weekDays.map((dayDate, idx) => {
                                const dateStr = dayDate.toISOString().split('T')[0]
                                const daySchedule = globalSchedule[dateStr] || { slots: [], scheduled: [], waitlist: [] }
                                const isDayToday = isToday(dayDate)
                                const isDaySelected = isSelected(dayDate)

                                return (
                                    <div
                                        key={idx}
                                        onClick={() => setSelectedDate(dayDate)}
                                        className={`p-3 md:p-4 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col md:min-h-[350px]
                                            ${isDaySelected 
                                                ? 'border-(--color-prioriza-blue) bg-[rgba(30,58,138,0.10)] ring-2 ring-[rgba(30,58,138,0.30)]' 
                                                : 'border-gray-100 hover:border-gray-200 bg-white hover:shadow-xs'
                                            }
                                        `}
                                    >
                                        {/* Day Header */}
                                        <div className="flex md:flex-col items-center md:items-start justify-between gap-3 md:gap-1.5 pb-2 md:pb-3 border-b border-gray-100 dark:border-neutral-700/30">
                                            <div className="flex items-center md:flex-col md:items-start gap-3 md:gap-1">
                                                <span className={`text-sm font-black px-2.5 py-1 rounded-lg text-center min-w-[36px]
                                                    ${isDayToday 
                                                        ? 'bg-blue-600 text-white shadow-sm' 
                                                        : 'bg-gray-100 text-gray-700'
                                                    }
                                                `}>
                                                    {dayDate.getDate()}
                                                </span>
                                                <div className="flex flex-col">
                                                    <span className="md:hidden text-xs font-bold text-gray-800 leading-tight">
                                                        {dayDate.toLocaleDateString('pt-BR', { weekday: 'long' })}
                                                    </span>
                                                    <span className="hidden md:inline text-[10px] font-black text-gray-500 uppercase tracking-wider">
                                                        {dayDate.toLocaleDateString('pt-BR', { weekday: 'short' })}
                                                    </span>
                                                    <p className="text-[9px] text-gray-400 font-medium md:hidden mt-0.5">
                                                        {daySchedule.slots.length > 0
                                                            ? daySchedule.slots.map(s => `${s.startStr} - ${s.endStr}`).join(', ')
                                                            : 'Sem horário (Folga)'
                                                        }
                                                    </p>
                                                </div>
                                            </div>

                                            {daySchedule.scheduled.length > 0 && (
                                                <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                                                    {daySchedule.scheduled.length} {daySchedule.scheduled.length === 1 ? 'Tarefa' : 'Tarefas'}
                                                </span>
                                            )}
                                        </div>

                                        {/* Day Tasks List */}
                                        <div className="flex-1 mt-3">
                                            {daySchedule.scheduled.length > 0 ? (
                                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-2">
                                                    {daySchedule.scheduled.map((task) => (
                                                        <div key={task.id} className="p-2 bg-gray-50/30 border border-gray-100 rounded-xl flex flex-col gap-0.5">
                                                            <div className="flex justify-between items-center text-[8px] font-bold text-gray-400">
                                                                <span className="text-blue-700">
                                                                    {task.allocations.map(al => `${al.start}-${al.end}`).join(', ')}
                                                                </span>
                                                                <span>
                                                                    {task.estimated_minutes}m
                                                                </span>
                                                            </div>
                                                            <h5 className="text-[10px] font-bold text-gray-800 line-clamp-2 leading-tight">{task.title}</h5>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-[10px] text-gray-400 italic mt-2 pl-12 md:pl-0 md:text-center md:mt-6">Nenhuma tarefa.</p>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    ) : (
                        <div className="space-y-4 py-2">
                            {/* Configured Hours Header */}
                            <div className="flex items-center justify-between p-4 bg-blue-50/30 rounded-2xl border border-blue-100/30">
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-blue-600" />
                                    <div>
                                        <h4 className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Horário Disponível Configurado</h4>
                                        <p className="text-xs font-black text-blue-900 mt-0.5">
                                            {autoplannedData.slots.length > 0
                                                ? autoplannedData.slots.map(s => `${s.startStr} às ${s.endStr}`).join(', ')
                                                : 'Nenhum horário de trabalho configurado'
                                            }
                                        </p>
                                    </div>
                                </div>
                                <span className="text-[10px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md font-bold">
                                    {autoplannedData.slots.length > 0 ? 'Foco Ativo' : 'Folga'}
                                </span>
                            </div>

                            {/* Timeline of Tasks */}
                            <div className="space-y-3 mt-4">
                                {autoplannedData.slots.length === 0 ? (
                                    <div className="text-center py-10 text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-100">
                                        <p className="text-xs font-medium">Nenhum horário de trabalho configurado para este dia da semana.</p>
                                        <a href="#/profile" className="text-xs text-blue-500 font-bold hover:underline mt-1 inline-block">Configurar no Perfil</a>
                                    </div>
                                ) : autoplannedData.scheduled.length === 0 ? (
                                    <div className="text-center py-10 text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-100">
                                        <p className="text-xs font-medium">Nenhuma tarefa agendada para hoje.</p>
                                    </div>
                                ) : (
                                    <div className="relative border-l border-blue-100 pl-5 ml-3 space-y-4">
                                        {autoplannedData.scheduled.map((item) => (
                                            <div key={item.id} className="relative group">
                                                {/* Timeline bullet */}
                                                <div className="absolute -left-[25px] top-1.5 w-2.5 h-2.5 rounded-full bg-white border-2 border-blue-500 group-hover:bg-blue-600 transition-colors shadow-xs" />
                                                
                                                <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-xs hover:shadow-md transition-all duration-300">
                                                    <div className="flex justify-between items-start gap-4 mb-1">
                                                        <div>
                                                            <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest">
                                                                {item.allocations.map(al => `${al.start} - ${al.end}`).join(', ')}
                                                            </span>
                                                            <h4 className="text-xs font-bold text-gray-900 mt-0.5 leading-snug">{item.title}</h4>
                                                        </div>
                                                        <span className="text-[9px] font-bold text-gray-400 px-1.5 py-0.5 bg-gray-50 rounded">
                                                            P{item.priority}
                                                        </span>
                                                    </div>
                                                    <p className="text-[10px] text-gray-400 line-clamp-1 mb-2">{item.description || 'Sem descrição'}</p>
                                                    
                                                    <div className="flex items-center justify-between text-[9px] text-gray-400 font-medium">
                                                        <span>Estimado: {item.estimated_minutes || 30}m</span>
                                                        {item.partiallyScheduled && (
                                                            <span className="text-[8px] font-black text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded">
                                                                Dividido: +{item.remainingMinutes}m pendentes
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Selected Day Detail */}
            <div className="min-h-0 min-w-0 overflow-hidden">
                <div className="sticky top-6 h-full min-h-0 overflow-y-auto rounded-[24px] bg-white p-6 shadow-[0_2px_40px_-10px_rgba(0,0,0,0.05)] sm:rounded-[32px]">
                    <div className="space-y-6">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-blue-500" />
                            {selectedDate
                                ? selectedDate.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })
                                : 'Selecione um dia'
                            }
                        </h3>
                        {selectedDate && (
                            <p className="text-xs text-gray-400 font-medium">
                                Cronograma calculado dinamicamente baseado na sua disponibilidade de horários.
                            </p>
                        )}
                    </div>

                    {!selectedDate ? (
                        <p className="text-sm text-gray-400 text-center py-8">
                            Clique num dia do calendário para ver as tarefas agendadas e a alocação de horários.
                        </p>
                    ) : (
                        <>
                            {/* Sorting / Categorization Select */}
                            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between gap-3">
                                <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider">
                                    Categorizar por:
                                </span>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    aria-label="Categorizar por"
                                    className="text-xs font-bold text-gray-600 bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                                >
                                    <option value="planning">Horário Planejado</option>
                                    <option value="due_date">Prazo (Limite)</option>
                                    <option value="priority">Prioridade</option>
                                    <option value="duration">Tempo de Execução</option>
                                </select>
                            </div>

                            {/* Work Hours Config Callout */}
                            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col gap-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider flex items-center gap-1.5">
                                        <Clock className="w-3.5 h-3.5" />
                                        Disponibilidade de Trabalho
                                    </span>
                                </div>
                                {autoplannedData.slots.length > 0 ? (
                                    <div className="flex flex-wrap gap-1.5 mt-1">
                                        {autoplannedData.slots.map((s, idx) => (
                                            <span key={idx} className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg">
                                                {s.startStr} - {s.endStr}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="space-y-2 mt-1">
                                        <p className="text-xs text-gray-500 leading-relaxed">
                                            Você não possui horários disponíveis configurados para este dia de semana.
                                        </p>
                                        <a
                                            href="#/profile"
                                            onClick={() => window.location.hash = '#/profile'}
                                            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 hover:underline"
                                        >
                                            Configurar no Perfil <ExternalLink className="w-3 h-3" />
                                        </a>
                                    </div>
                                )}
                            </div>

                            {/* Autoplanned Timeline */}
                            <div className="space-y-4">
                                <h4 className="text-xs font-extrabold text-gray-400 uppercase tracking-wider">Cronograma Planejado</h4>
                                {autoplannedData.slots.length === 0 ? (
                                    <p className="text-xs text-gray-400 italic">Configure seus horários de trabalho no perfil para ativar o cronograma.</p>
                                ) : sortedScheduled.length === 0 ? (
                                    <p className="text-xs text-gray-400 italic">Nenhuma tarefa agendada que caiba nos horários de hoje.</p>
                                ) : (
                                    <div className="relative border-l-2 border-gray-100 pl-4 ml-2 space-y-5">
                                        {sortedScheduled.map((item) => (
                                            <div key={item.id} className="relative group">
                                                {/* Timeline Bullet */}
                                                <div className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-white border-2 border-blue-500 group-hover:bg-blue-500 transition-colors" />
                                                
                                                <div className="p-3.5 rounded-xl border border-gray-100 bg-white hover:shadow-md transition-shadow">
                                                    <div className="flex flex-col gap-1.5 mb-2">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">
                                                                {item.allocations.map(al => `${al.start}-${al.end}`).join(', ')}
                                                            </span>
                                                            <span className="text-[9px] font-bold text-gray-400 uppercase">
                                                                {item.estimated_minutes ? `${item.estimated_minutes}m` : '30m est'}
                                                            </span>
                                                        </div>
                                                        <h5 className="text-xs font-bold text-gray-800 leading-snug line-clamp-2">{item.title}</h5>
                                                    </div>

                                                    {/* Prazo & Rollover Badge */}
                                                    {item.due_date && (
                                                        <div className="text-[9px] font-medium text-gray-400 mb-2 flex items-center gap-1 flex-wrap">
                                                            <Clock className="w-3 h-3 text-gray-300" />
                                                            {item.original_due_date ? (
                                                                <span className="text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded font-bold">
                                                                    Rolou de {new Date(item.original_due_date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                                                                </span>
                                                            ) : (
                                                                <span>Prazo: {new Date(item.due_date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                                                            )}
                                                        </div>
                                                    )}
                                                    
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-1.5">
                                                            <div className={`w-2 h-2 rounded-full ${priorityDotColors[item.priority] || 'bg-gray-400'}`} />
                                                            <span className="text-[9px] font-bold text-gray-500 uppercase">P{item.priority}</span>
                                                        </div>
                                                        {item.partiallyScheduled && (
                                                            <span className="text-[9px] font-extrabold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded">
                                                                Parcial (+{item.remainingMinutes}m pendentes)
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Waitlist / Unscheduled Tasks */}
                            {sortedWaitlist.length > 0 && (
                                <div className="space-y-3 pt-2 border-t border-gray-50">
                                    <h4 className="text-xs font-extrabold text-orange-600 uppercase tracking-wider flex items-center gap-1.5">
                                        <AlertTriangle className="w-4 h-4" />
                                        Fila de Espera (Excedentes)
                                    </h4>
                                    <p className="text-[10px] text-gray-400 leading-relaxed">
                                        Essas tarefas estão agendadas para hoje mas excederam a sua carga horária configurada.
                                    </p>
                                    <div className="space-y-2">
                                        {sortedWaitlist.map(task => (
                                            <div key={task.id} className="p-3 bg-orange-50/30 border border-orange-100 rounded-xl flex items-center justify-between gap-3">
                                                <div className="min-w-0">
                                                    <h5 className="text-xs font-bold text-gray-800 truncate">{task.title}</h5>
                                                    <p className="text-[9px] text-gray-400 mt-0.5">
                                                        Est. {task.estimated_minutes || 30}m • Prioridade P{task.priority}
                                                        {task.due_date && ` • Prazo: ${new Date(task.due_date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`}
                                                    </p>
                                                    {task.original_due_date && (
                                                        <p className="text-[9px] text-amber-600 font-bold mt-0.5">
                                                            Rolou de {new Date(task.original_due_date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className={`w-2.5 h-2.5 rounded-full ${priorityDotColors[task.priority] || 'bg-gray-400'} shrink-0`} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Completed Today */}
                            {autoplannedData.completed.length > 0 && (
                                <div className="space-y-3 pt-2 border-t border-gray-50">
                                    <h4 className="text-xs font-extrabold text-emerald-600 uppercase tracking-wider flex items-center gap-1.5">
                                        <CheckCircle className="w-4 h-4" />
                                        Concluídas Hoje
                                    </h4>
                                    <div className="space-y-2">
                                        {autoplannedData.completed.map(task => (
                                            <div key={task.id} className="p-3 bg-emerald-50/20 border border-emerald-100/50 rounded-xl flex items-center justify-between gap-3">
                                                <div className="min-w-0">
                                                    <h5 className="text-xs font-semibold text-gray-500 line-through truncate">{task.title}</h5>
                                                    <p className="text-[9px] text-gray-400 mt-0.5">Concluída! {task.estimated_minutes ? `${task.estimated_minutes}m` : '30m est'}</p>
                                                </div>
                                                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                    </div>
                </div>
            </div>
        </div>
    )
}
