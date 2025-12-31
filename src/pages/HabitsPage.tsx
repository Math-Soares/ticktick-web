import { useEffect, useState } from 'react'
import { Plus, Flame, Trash2, Loader2, ChevronDown } from 'lucide-react'
import { useHabitStore } from '../stores/habitStore'
import { useUIStore } from '../stores/uiStore'
import { startOfWeek, addDays, format, isSameDay } from 'date-fns'
import confetti from 'canvas-confetti'
import HabitHeatmap from '../components/habit/HabitHeatmap'

export default function HabitsPage() {
    const { habits, isLoading, fetchHabits, deleteHabit, logCompletion, removeLog } = useHabitStore()
    const { setCreateHabitOpen } = useUIStore()
    const [expandedHabitId, setExpandedHabitId] = useState<string | null>(null)

    useEffect(() => {
        fetchHabits()
    }, [fetchHabits])

    const weekStart = startOfWeek(new Date(), { weekStartsOn: 0 }) // 0 = Sunday
    const weekDates = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
    const weekDays = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']
    const today = new Date()

    const handleDelete = async (id: string, name: string) => {
        if (window.confirm(`Tem certeza que deseja remover o hábito "${name}"?`)) {
            await deleteHabit(id)
        }
    }

    const handleToggle = async (habitId: string, date: Date, isCompleted: boolean, color: string) => {
        const dateStr = format(date, 'yyyy-MM-dd')
        if (isCompleted) {
            await removeLog(habitId, dateStr)
        } else {
            // Trigger Confetti
            confetti({
                particleCount: 50,
                spread: 60,
                origin: { y: 0.7 },
                colors: [color, '#ffffff'] // Use habit color
            })
            await logCompletion(habitId, dateStr)
        }
    }

    const isLogged = (habitLogs: any[] = [], date: Date) => {
        const targetStr = format(date, 'yyyy-MM-dd')
        return habitLogs.some(log => log.date.split('T')[0] === targetStr)
    }

    if (isLoading && habits.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="animate-spin text-primary" size={32} />
            </div>
        )
    }

    return (
        <div className="p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">Habits</h1>
                        <p className="text-zinc-500 mt-2 font-medium">Build lasting habits</p>
                    </div>
                    <button
                        onClick={() => setCreateHabitOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark rounded-lg transition-colors text-white"
                    >
                        <Plus size={18} />
                        <span>New Habit</span>
                    </button>
                </div>

                {/* Week Header */}
                <div className="grid grid-cols-[1fr_repeat(7,48px)] gap-2 mb-4 text-center p-4 pr-12 justify-items-center">
                    <div></div> {/* Spacer for habit info column */}
                    {weekDays.map((day, i) => (
                        <div
                            key={i}
                            className={`text-sm font-medium py-2 ${isSameDay(weekDates[i], today) ? 'text-primary font-bold' : 'text-zinc-500'
                                }`}
                        >
                            {day}
                        </div>
                    ))}
                </div>

                {/* Habits Grid */}
                <div className="space-y-3">
                    {habits.map((habit) => {
                        // Interactive confetti + Expandable logic
                        const isExpanded = expandedHabitId === habit.id

                        return (
                            <div
                                key={habit.id}
                                className="bg-bg-secondary rounded-xl p-0 relative transition-all duration-300 hover:shadow-lg hover:shadow-black/20"
                            >
                                <div className="grid grid-cols-[1fr_repeat(7,48px)] gap-2 items-center p-4 pr-12 justify-items-center">
                                    {/* Habit Info with Expand Toggle */}
                                    <div
                                        className="flex items-center gap-3 min-w-0 overflow-hidden justify-self-start cursor-pointer select-none"
                                        onClick={() => setExpandedHabitId(isExpanded ? null : habit.id)}
                                    >
                                        <div className={`p-1 rounded-lg transition-colors ${isExpanded ? 'bg-bg-tertiary' : 'hover:bg-bg-tertiary'}`}>
                                            <ChevronDown size={16} className={`text-zinc-500 transition-transform duration-300 ${isExpanded ? 'rotate-180' : '-rotate-90'}`} />
                                        </div>
                                        <span className="text-2xl flex-shrink-0">{habit.icon}</span>
                                        <div className="min-w-0">
                                            <div className="font-medium truncate">{habit.name}</div>
                                            <div className="flex items-center gap-1 text-sm text-orange-400">
                                                <Flame size={14} />
                                                <span>{habit.currentStreak} days</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Week Checkboxes */}
                                    {weekDates.map((date, i) => {
                                        const isCompleted = isLogged(habit.logs, date)
                                        const isTodayDate = isSameDay(date, today)

                                        return (
                                            <button
                                                key={i}
                                                onClick={() => handleToggle(habit.id, date, isCompleted, habit.color)}
                                                className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center transition-all duration-300 ${isCompleted
                                                    ? 'bg-green-500 border-green-500 scale-100'
                                                    : isTodayDate
                                                        ? 'border-primary hover:bg-primary/20 scale-100'
                                                        : 'border-zinc-700 hover:border-zinc-500 hover:bg-zinc-800/50 scale-95 hover:scale-100'
                                                    }`}
                                                style={
                                                    isCompleted
                                                        ? { backgroundColor: habit.color, borderColor: habit.color }
                                                        : undefined
                                                }
                                                title={isCompleted ? "Desmarcar" : "Marcar como feito"}
                                            >
                                                {isCompleted && <span className="text-white text-lg animate-fade-in-up">✓</span>}
                                            </button>
                                        )
                                    })}

                                    {/* Delete Action */}
                                    <button
                                        onClick={() => handleDelete(habit.id, habit.name)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 opacity-0 hover:opacity-100 hover:bg-red-500/20 rounded-lg transition-all text-red-500"
                                        title="Remover hábito"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>

                                {/* Expanded View: Heatmap */}
                                <div className={`grid transition-all duration-500 ease-in-out ${isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                                    <div className="overflow-hidden">
                                        <div className="p-4 pt-0 border-t border-zinc-800/50 mx-4 mt-2">
                                            <div className="py-4">
                                                <HabitHeatmap logs={habit.logs || []} color={habit.color} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Empty State */}
                {habits.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-zinc-500">No habits yet</p>
                        <p className="text-zinc-600 text-sm mt-1">
                            Create your first habit to start tracking
                        </p>
                    </div>
                )}
                {/* Create Habit Modal - Moved to Layout */}
            </div>
        </div>
    )
}

