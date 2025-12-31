import { useMemo } from 'react'
import { subDays, format, startOfWeek, addDays } from 'date-fns'

interface HabitHeatmapProps {
    logs: { date: string | Date }[]
    color: string
}

export default function HabitHeatmap({ logs, color }: HabitHeatmapProps) {
    // Generate last 12 weeks (~84 days) roughly to fit nicely
    const daysToRender = 84 // 12 weeks * 7 days

    const calendarData = useMemo(() => {
        const today = new Date()
        // Align to start of week to make the grid look square and aligned like GitHub
        // We want the LAST column to be the current week.
        const endDay = addDays(startOfWeek(today, { weekStartsOn: 0 }), 6) // End of this week
        const startDay = subDays(endDay, daysToRender - 1)

        const days = []
        for (let i = 0; i < daysToRender; i++) {
            const date = addDays(startDay, i)
            const dateStr = format(date, 'yyyy-MM-dd')

            // Allow string or Date objects in logs
            const isCompleted = logs.some(log => {
                const logDate = typeof log.date === 'string' ? log.date.split('T')[0] : format(log.date, 'yyyy-MM-dd')
                return logDate === dateStr
            })

            days.push({
                date,
                isCompleted
            })
        }
        return days
    }, [logs, daysToRender])

    return (
        <div className="flex flex-col gap-2">
            <div className="text-xs text-zinc-500 font-medium ml-1">Consistency (Last 3 Months)</div>
            <div className="grid grid-flow-col grid-rows-7 gap-1 w-fit">
                {calendarData.map((day, i) => (
                    <div
                        key={i}
                        className={`w-2.5 h-2.5 rounded-sm transition-all duration-300 ${day.isCompleted
                            ? 'opacity-100 scale-100'
                            : 'bg-bg-tertiary/50 scale-90 hover:scale-100'
                            }`}
                        style={{
                            backgroundColor: day.isCompleted ? color : undefined
                        }}
                        title={`${format(day.date, 'dd/MM/yyyy')}${day.isCompleted ? ' ✅' : ''}`}
                    />
                ))}
            </div>
        </div>
    )
}
