import { useState, useEffect, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Calendar, Clock } from 'lucide-react'
import { TaskService } from '../services/TaskService'

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const MONTHS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']

const priorityDotColors = {
    1: 'bg-red-500',
    2: 'bg-orange-500',
    3: 'bg-yellow-500',
    4: 'bg-blue-500',
    5: 'bg-green-500',
}

export default function Planning() {
    const [tasks, setTasks] = useState([])
    const [loading, setLoading] = useState(true)
    const [currentDate, setCurrentDate] = useState(new Date())
    const [selectedDate, setSelectedDate] = useState(null)

    useEffect(() => {
        loadTasks()
    }, [])

    async function loadTasks() {
        try {
            const data = await TaskService.getTasks()
            setTasks(data || [])
        } catch (err) {
            console.error('Error loading tasks for planning:', err)
        } finally {
            setLoading(false)
        }
    }

    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()

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

    function getTasksForDate(date) {
        const dateStr = date.toISOString().split('T')[0]
        return tasks.filter(t => {
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

    function prevMonth() {
        setCurrentDate(new Date(year, month - 1, 1))
    }

    function nextMonth() {
        setCurrentDate(new Date(year, month + 1, 1))
    }

    const selectedTasks = selectedDate ? getTasksForDate(selectedDate) : []

    if (loading) {
        return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
    }

    return (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8">
            {/* Calendar */}
            <div className="xl:col-span-8">
                <div className="bg-white rounded-[24px] sm:rounded-[32px] p-4 sm:p-6 lg:p-8 shadow-[0_2px_40px_-10px_rgba(0,0,0,0.05)]">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl sm:text-2xl font-black text-gray-900">
                            {MONTHS[month]} {year}
                        </h2>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => { setCurrentDate(new Date()); setSelectedDate(new Date()) }}
                                className="px-3 py-1.5 text-xs font-bold text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                            >
                                Hoje
                            </button>
                            <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                                <ChevronLeft className="w-5 h-5 text-gray-600" />
                            </button>
                            <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                                <ChevronRight className="w-5 h-5 text-gray-600" />
                            </button>
                        </div>
                    </div>

                    {/* Weekday Headers */}
                    <div className="grid grid-cols-7 mb-2">
                        {WEEKDAYS.map(day => (
                            <div key={day} className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-wider py-2">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 gap-1">
                        {calendarDays.map((day, i) => {
                            const dayTasks = getTasksForDate(day.date)
                            const hasTask = dayTasks.length > 0
                            const today = isToday(day.date)
                            const selected = isSelected(day.date)

                            return (
                                <button
                                    key={i}
                                    onClick={() => setSelectedDate(day.date)}
                                    className={`relative aspect-square flex flex-col items-center justify-start pt-2 rounded-xl transition-all text-sm font-medium
                                        ${!day.isCurrentMonth ? 'text-gray-300' : 'text-gray-700'}
                                        ${today ? 'bg-blue-50 text-blue-700 font-bold' : ''}
                                        ${selected ? 'ring-2 ring-blue-500 bg-blue-50' : ''}
                                        ${!selected && day.isCurrentMonth ? 'hover:bg-gray-50' : ''}
                                    `}
                                >
                                    <span className={`text-sm ${today ? 'bg-blue-600 text-white w-7 h-7 rounded-full flex items-center justify-center' : ''}`}>
                                        {day.date.getDate()}
                                    </span>

                                    {/* Task Dots */}
                                    {hasTask && (
                                        <div className="flex gap-0.5 mt-1 flex-wrap justify-center max-w-[80%]">
                                            {dayTasks.slice(0, 3).map((t, j) => (
                                                <div
                                                    key={j}
                                                    className={`w-1.5 h-1.5 rounded-full ${priorityDotColors[t.priority] || 'bg-gray-400'}`}
                                                />
                                            ))}
                                            {dayTasks.length > 3 && (
                                                <span className="text-[8px] text-gray-400 font-bold">+{dayTasks.length - 3}</span>
                                            )}
                                        </div>
                                    )}
                                </button>
                            )
                        })}
                    </div>
                </div>
            </div>

            {/* Selected Day Detail */}
            <div className="xl:col-span-4">
                <div className="bg-white rounded-[24px] sm:rounded-[32px] p-6 shadow-[0_2px_40px_-10px_rgba(0,0,0,0.05)] sticky top-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-blue-500" />
                        {selectedDate
                            ? selectedDate.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })
                            : 'Selecione um dia'
                        }
                    </h3>

                    {!selectedDate ? (
                        <p className="text-sm text-gray-400 text-center py-8">
                            Clique num dia do calendário para ver as tarefas agendadas.
                        </p>
                    ) : selectedTasks.length === 0 ? (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Calendar className="w-8 h-8 text-gray-300" />
                            </div>
                            <p className="text-sm text-gray-400 font-medium">Nenhuma tarefa para este dia</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {selectedTasks.map(task => (
                                <div
                                    key={task.id}
                                    className={`p-4 rounded-xl border-l-4 border border-gray-100 hover:shadow-md transition-shadow
                                        ${task.priority === 1 ? 'border-l-red-500' :
                                            task.priority === 2 ? 'border-l-orange-500' :
                                                task.priority === 3 ? 'border-l-yellow-500' :
                                                    task.priority === 4 ? 'border-l-blue-500' : 'border-l-green-500'
                                        }
                                    `}
                                >
                                    <div className="flex items-start justify-between mb-1">
                                        <h4 className="text-sm font-bold text-gray-800 line-clamp-2">{task.title}</h4>
                                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ml-2
                                            ${task.status === 'Feito' ? 'bg-green-100 text-green-700' :
                                                task.status === 'Em Progresso' ? 'bg-blue-100 text-blue-700' :
                                                    'bg-gray-100 text-gray-600'
                                            }`}>
                                            {task.status}
                                        </span>
                                    </div>
                                    {task.description && (
                                        <p className="text-xs text-gray-500 line-clamp-2 mb-2">{task.description}</p>
                                    )}
                                    <div className="flex items-center gap-3 text-[10px] text-gray-400">
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {task.estimated_minutes ? `${task.estimated_minutes}min` : 'Sem estimativa'}
                                        </span>
                                        <span className="font-bold">P{task.priority}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
