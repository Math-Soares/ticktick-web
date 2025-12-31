import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    addMonths,
    subMonths,
    addDays,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useTaskStore } from '../stores/taskStore'

type ViewMode = 'Month' | 'Week' | 'Day' | 'Agenda' | 'Multi-Day' | 'Multi-Week'

const HOUR_HEIGHT = 80
const START_HOUR = 8

const getTaskPosition = (dueTime?: string, endTime?: string) => {
    if (!dueTime) return { top: 0, height: HOUR_HEIGHT, isAllDay: true }
    try {
        const [startH, startM] = dueTime.split(':').map(Number)
        const relativeHour = startH - START_HOUR
        const top = (relativeHour * HOUR_HEIGHT) + (startM / 60 * HOUR_HEIGHT)

        let height = HOUR_HEIGHT // Default 1h
        if (endTime) {
            const [endH, endM] = endTime.split(':').map(Number)
            const durationInMinutes = (endH * 60 + endM) - (startH * 60 + startM)
            if (durationInMinutes > 0) {
                height = (durationInMinutes / 60) * HOUR_HEIGHT
            }
        }

        return { top, height, isAllDay: false }
    } catch (e) {
        return { top: 0, height: HOUR_HEIGHT, isAllDay: true }
    }
}

const formatTimeRange = (dueTime?: string, endTime?: string) => {
    if (!dueTime) return 'Todo o dia'
    try {
        const start = dueTime
        let end = endTime
        if (!end) {
            const [hours, minutes] = dueTime.split(':').map(Number)
            const endHours = (hours + 1) % 24
            end = `${endHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
        }
        return `${start} - ${end}`
    } catch {
        return dueTime
    }
}

export default function CalendarPage() {
    const [currentDate, setCurrentDate] = useState(new Date())
    const [viewMode, setViewMode] = useState<ViewMode>('Month')
    const tasks = useTaskStore((state) => state.tasks)

    const days = useMemo(() => {
        if (viewMode === 'Month') {
            const start = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 0 })
            const end = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 0 })
            return eachDayOfInterval({ start, end })
        }
        if (viewMode === 'Week') {
            const start = startOfWeek(currentDate, { weekStartsOn: 0 })
            const end = endOfWeek(currentDate, { weekStartsOn: 0 })
            return eachDayOfInterval({ start, end })
        }
        if (viewMode === 'Day') {
            return [currentDate]
        }
        if (viewMode === 'Agenda') {
            return eachDayOfInterval({ start: currentDate, end: addDays(currentDate, 6) })
        }
        if (viewMode === 'Multi-Day') {
            return eachDayOfInterval({ start: currentDate, end: addDays(currentDate, 2) })
        }
        if (viewMode === 'Multi-Week') {
            const start = startOfWeek(currentDate, { weekStartsOn: 0 })
            return eachDayOfInterval({ start, end: addDays(start, 13) })
        }
        return []
    }, [currentDate, viewMode])

    const tasksByDate = useMemo(() => {
        const map = new Map<string, typeof tasks>()
        tasks.forEach((task) => {
            if (task.dueDate) {
                const key = task.dueDate.split('T')[0]
                const existing = map.get(key) || []
                map.set(key, [...existing, task])
            }
        })
        return map
    }, [tasks])

    const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

    return (
        <div className="p-8 pb-24 relative min-h-[calc(100vh-56px)]">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold">
                        {viewMode === 'Day'
                            ? format(currentDate, "d 'de' MMMM yyyy", { locale: ptBR })
                            : viewMode === 'Multi-Day'
                                ? `Próximos 3 dias`
                                : format(currentDate, 'MMMM yyyy', { locale: ptBR })}
                    </h1>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => {
                                if (viewMode === 'Month') setCurrentDate(subMonths(currentDate, 1))
                                else if (viewMode === 'Week') setCurrentDate(addDays(currentDate, -7))
                                else if (viewMode === 'Multi-Week') setCurrentDate(addDays(currentDate, -14))
                                else if (viewMode === 'Multi-Day') setCurrentDate(addDays(currentDate, -3))
                                else if (viewMode === 'Agenda') setCurrentDate(addDays(currentDate, -7))
                                else setCurrentDate(addDays(currentDate, -1))
                            }}
                            className="p-2 hover:bg-bg-tertiary rounded-lg transition-colors"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <button
                            onClick={() => setCurrentDate(new Date())}
                            className="px-3 py-1 text-sm hover:bg-bg-tertiary rounded-lg transition-colors text-zinc-400 font-medium"
                        >
                            Hoje
                        </button>
                        <button
                            onClick={() => {
                                if (viewMode === 'Month') setCurrentDate(addMonths(currentDate, 1))
                                else if (viewMode === 'Week') setCurrentDate(addDays(currentDate, 7))
                                else if (viewMode === 'Multi-Week') setCurrentDate(addDays(currentDate, 14))
                                else if (viewMode === 'Multi-Day') setCurrentDate(addDays(currentDate, 3))
                                else if (viewMode === 'Agenda') setCurrentDate(addDays(currentDate, 7))
                                else setCurrentDate(addDays(currentDate, 1))
                            }}
                            className="p-2 hover:bg-bg-tertiary rounded-lg transition-colors"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>

                {/* Content Rendering based on Mode */}
                {viewMode === 'Month' || viewMode === 'Week' || viewMode === 'Multi-Week' ? (
                    <>
                        {/* Grid Header (Week names) */}
                        <div className="grid grid-cols-7 gap-1 mb-1">
                            {weekDays.map((day) => (
                                <div
                                    key={day}
                                    className="text-center text-xs font-semibold text-zinc-500 py-2 uppercase tracking-wider"
                                >
                                    {day}
                                </div>
                            ))}
                        </div>
                        {/* Grid (Month / Week / Multi-Week) */}
                        <div className={`grid grid-cols-7 gap-1 ${viewMode === 'Multi-Week' ? 'grid-rows-2' : ''}`}>
                            {days.map((day) => {
                                const dateKey = format(day, 'yyyy-MM-dd')
                                const dayTasks = tasksByDate.get(dateKey) || []
                                const isToday = isSameDay(day, new Date())
                                const isCurrentMonth = isSameMonth(day, currentDate)

                                return (
                                    <div
                                        key={dateKey}
                                        className={`rounded-2xl border transition-all ${viewMode === 'Month' ? 'min-h-[120px]' : viewMode === 'Multi-Week' ? 'min-h-[160px]' : 'min-h-[400px]'
                                            } p-3 ${isCurrentMonth || viewMode !== 'Month'
                                                ? 'bg-bg-secondary/50 border-border hover:border-primary/50'
                                                : 'bg-bg/20 border-transparent opacity-30 px-3'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <div
                                                className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full transition-colors ${isToday
                                                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                                    : 'text-zinc-400'
                                                    }`}
                                            >
                                                {format(day, 'd')}
                                            </div>
                                            {(viewMode === 'Week' || viewMode === 'Multi-Week') && (
                                                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-tighter">
                                                    {format(day, 'EEE', { locale: ptBR })}
                                                </span>
                                            )}
                                        </div>

                                        <div className="space-y-1.5">
                                            {dayTasks.map((task) => (
                                                <div
                                                    key={task.id}
                                                    className={`text-[11px] font-medium p-1.5 rounded-lg truncate transition-all ${task.completedAt
                                                        ? 'bg-zinc-800/50 line-through text-zinc-600'
                                                        : 'bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20'
                                                        }`}
                                                >
                                                    {task.title}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </>
                ) : viewMode === 'Day' || viewMode === 'Multi-Day' ? (
                    <div className="flex gap-4">
                        {/* Time labels axis */}
                        <div className="w-16 flex flex-col pt-[104px]" style={{ gap: `${HOUR_HEIGHT - 14}px` }}>
                            {Array.from({ length: 15 }, (_, i) => i + START_HOUR).map(hour => (
                                <span key={hour} className="text-[10px] text-zinc-600 font-bold text-right pr-4 h-[14px]">
                                    {hour.toString().padStart(2, '0')}:00
                                </span>
                            ))}
                        </div>
                        {/* Columns */}
                        <div className={`flex-1 grid gap-4 ${viewMode === 'Day' ? 'grid-cols-1' : 'grid-cols-3'}`}>
                            {days.map(day => {
                                const dateKey = format(day, 'yyyy-MM-dd')
                                const dayTasks = tasksByDate.get(dateKey) || []
                                const isToday = isSameDay(day, new Date())

                                return (
                                    <div key={dateKey} className="flex flex-col">
                                        <div className="text-center mb-4 h-16 flex flex-col justify-center">
                                            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full self-center ${isToday ? 'bg-primary/20 text-primary' : 'text-zinc-500'}`}>
                                                <span className="text-xl font-bold">{format(day, 'd')}</span>
                                                <span className="text-xs font-bold uppercase">{format(day, 'EEE', { locale: ptBR })}</span>
                                            </div>
                                        </div>
                                        <div
                                            className="flex-1 bg-bg-secondary/30 rounded-3xl border border-border relative overflow-hidden"
                                            style={{ height: `${15 * HOUR_HEIGHT}px` }}
                                        >
                                            {/* Hourly lines grid background */}
                                            <div className="absolute inset-0 pointer-events-none">
                                                {Array.from({ length: 15 }).map((_, i) => (
                                                    <div
                                                        key={i}
                                                        className="border-b border-white/5"
                                                        style={{ height: `${HOUR_HEIGHT}px` }}
                                                    />
                                                ))}
                                            </div>
                                            {/* Tasks */}
                                            <div className="relative h-full w-full p-2 z-10">
                                                {dayTasks.map(task => {
                                                    const pos = getTaskPosition(task.dueTime, task.endTime)
                                                    return (
                                                        <div
                                                            key={task.id}
                                                            className={`absolute left-2 right-2 p-3 rounded-2xl border-l-4 transition-all hover:scale-[1.02] hover:z-20 shadow-lg ${task.completedAt
                                                                ? 'bg-zinc-800/50 border-zinc-600 text-zinc-500 line-through'
                                                                : 'bg-primary/10 border-primary text-primary'
                                                                }`}
                                                            style={{
                                                                top: `${pos.isAllDay ? 0 : pos.top}px`,
                                                                height: `${pos.height - 8}px`, // Slight gap between cards
                                                                borderLeftColor: !task.completedAt && task.list?.color ? task.list.color : undefined
                                                            }}
                                                        >
                                                            <div className="text-[10px] opacity-60 font-bold mb-0.5">
                                                                {formatTimeRange(task.dueTime, task.endTime)}
                                                            </div>
                                                            <div className="text-sm font-bold truncate">{task.title}</div>
                                                        </div>
                                                    )
                                                })}
                                                {dayTasks.length === 0 && (
                                                    <div className="h-full flex items-center justify-center opacity-5 italic text-sm">
                                                        Livre
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                ) : viewMode === 'Agenda' ? (
                    <div className="max-w-4xl mx-auto space-y-8">
                        {days.map(day => {
                            const dateKey = format(day, 'yyyy-MM-dd')
                            const dayTasks = tasksByDate.get(dateKey) || []
                            const isToday = isSameDay(day, new Date())

                            return (
                                <div key={dateKey} className="flex gap-12">
                                    {/* Date Left info */}
                                    <div className="w-16 pt-2 flex flex-col items-center">
                                        <span className={`text-3xl font-bold ${isToday ? 'text-primary' : 'text-text'}`}>{format(day, 'd')}</span>
                                        <span className="text-xs font-bold text-zinc-500 uppercase">{format(day, 'EEE', { locale: ptBR })}</span>
                                    </div>

                                    {/* Timeline & Tasks */}
                                    <div className="flex-1 relative pb-8">
                                        {/* Vertical line and dots */}
                                        <div className="absolute left-[-24px] top-6 bottom-0 w-[2px] bg-zinc-800">
                                            <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-4 border-bg ${isToday ? 'bg-primary' : 'bg-zinc-700'}`} />
                                        </div>

                                        <div className="space-y-4">
                                            {dayTasks.length > 0 ? (
                                                dayTasks.map(task => (
                                                    <div
                                                        key={task.id}
                                                        className={`flex items-center gap-4 p-4 rounded-2xl border-l-[6px] transition-all hover:translate-x-1 ${task.completedAt
                                                            ? 'bg-bg-secondary/30 border-zinc-700 text-zinc-600 line-through'
                                                            : 'bg-bg-secondary border-primary/40 text-text'
                                                            }`}
                                                        style={!task.completedAt && task.list?.color ? { borderLeftColor: task.list.color } : {}}
                                                    >
                                                        <div className="w-24 text-[11px] font-bold text-zinc-500">
                                                            {formatTimeRange(task.dueTime, task.endTime)}
                                                        </div>
                                                        <div className="flex-1 font-bold">
                                                            {task.title}
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="py-4 text-sm text-zinc-600 italic">No tasks for this day</div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                ) : null}
            </div>

            {/* Bottom Navigation Switcher */}
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
                <div className="bg-bg-secondary/90 backdrop-blur-xl border border-border p-1.5 rounded-full flex items-center shadow-2xl">
                    <ViewButton
                        active={viewMode === 'Month'}
                        onClick={() => setViewMode('Month')}
                        label="Month"
                    />
                    <ViewButton
                        active={viewMode === 'Week'}
                        onClick={() => setViewMode('Week')}
                        label="Week"
                    />
                    <ViewButton
                        active={viewMode === 'Day'}
                        onClick={() => setViewMode('Day')}
                        label="Day"
                    />
                    <ViewButton
                        active={viewMode === 'Agenda'}
                        onClick={() => setViewMode('Agenda')}
                        label="Agenda"
                    />
                    <ViewButton
                        active={viewMode === 'Multi-Day'}
                        onClick={() => setViewMode('Multi-Day')}
                        label="Multi-Day"
                    />
                    <ViewButton
                        active={viewMode === 'Multi-Week'}
                        onClick={() => setViewMode('Multi-Week')}
                        label="Multi-Week"
                    />
                </div>
            </div>
        </div>
    )
}

function ViewButton({
    active,
    onClick,
    label
}: {
    active: boolean
    onClick: () => void
    label: string
}) {
    return (
        <button
            onClick={onClick}
            className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${active
                ? 'bg-bg-tertiary text-text shadow-inner'
                : 'text-zinc-500 hover:text-text'
                }`}
        >
            {label}
        </button>
    )
}
