import { useMemo } from 'react'
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
} from 'recharts'
import { format, subDays, isSameDay, startOfDay } from 'date-fns'
import { useTaskStore } from '../stores/taskStore'
import { useHabitStore } from '../stores/habitStore'
import {
    CheckCircle2,
    Flame,
    Zap,
    Calendar,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react'

const PRIORITY_COLORS = {
    3: '#ef4444', // Urgent (Red)
    2: '#f97316', // Medium (Orange)
    1: '#3b82f6', // Low (Blue)
    0: '#71717a', // None (Zinc)
}

export default function StatsPage() {
    const { tasks } = useTaskStore()
    const { habits } = useHabitStore()

    // 1. Task Completion Trends (Last 7 Days)
    const completionTrendData = useMemo(() => {
        const last7Days = Array.from({ length: 7 }).map((_, i) => subDays(startOfDay(new Date()), 6 - i))

        return last7Days.map(date => {
            const dayTasks = tasks.filter(t =>
                t.completedAt && isSameDay(new Date(t.completedAt), date)
            )
            return {
                name: format(date, 'EEE'),
                count: dayTasks.length,
            }
        })
    }, [tasks])

    // 2. Priority Distribution
    const priorityData = useMemo(() => {
        const counts = { 3: 0, 2: 0, 1: 0, 0: 0 }
        tasks.filter(t => !t.deletedAt).forEach(t => {
            const p = t.priority || 0
            counts[p as keyof typeof counts]++
        })

        return [
            { name: 'Urgent', value: counts[3], priority: 3 },
            { name: 'Medium', value: counts[2], priority: 2 },
            { name: 'Low', value: counts[1], priority: 1 },
            { name: 'None', value: counts[0], priority: 0 },
        ].filter(d => d.value > 0)
    }, [tasks])

    // 3. Habit Consistency (Top 5 Habits)
    const habitData = useMemo(() => {
        return habits.slice(0, 5).map(h => ({
            name: h.name,
            streak: h.currentStreak,
            color: h.color,
        }))
    }, [habits])

    // 4. Summaries (KPIs)
    const totalCompleted = tasks.filter(t => t.completedAt).length
    const currentStreak = Math.max(...habits.map(h => h.currentStreak), 0)
    const bestStreak = Math.max(...habits.map(h => h.longestStreak), 0)

    return (
        <div className="p-8 pb-24 bg-bg/30 min-h-full">
            <div className="max-w-6xl mx-auto">
                <div className="mb-10">
                    <h1 className="text-3xl font-bold text-text tracking-tight">Productivity Dashboard</h1>
                    <p className="text-zinc-500 mt-2 font-medium">Visualization of your task and habit performance</p>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    <KPICard
                        title="Completed Tasks"
                        value={totalCompleted}
                        icon={<CheckCircle2 className="text-green-500" size={20} />}
                        trend={+12}
                    />
                    <KPICard
                        title="Current Streak"
                        value={`${currentStreak}d`}
                        icon={<Flame className="text-orange-500" size={20} />}
                    />
                    <KPICard
                        title="Best Streak"
                        value={`${bestStreak}d`}
                        icon={<Zap className="text-yellow-500" size={20} />}
                    />
                    <KPICard
                        title="Active Habits"
                        value={habits.length}
                        icon={<Calendar className="text-blue-500" size={20} />}
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Completion Trend */}
                    <div className="lg:col-span-2 bg-bg-secondary/50 border border-border p-8 rounded-[32px] shadow-xl backdrop-blur-sm">
                        <h2 className="text-xl font-bold text-text mb-8">Task Completion Trend</h2>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={completionTrendData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#71717a', fontSize: 12 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#71717a', fontSize: 12 }}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'var(--color-bg-secondary)',
                                            border: '1px solid var(--color-border)',
                                            borderRadius: '12px',
                                            color: 'var(--color-text)'
                                        }}
                                        itemStyle={{ color: 'var(--color-text)' }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="count"
                                        stroke="#3b82f6"
                                        strokeWidth={4}
                                        dot={{ fill: '#3b82f6', strokeWidth: 2, r: 6 }}
                                        activeDot={{ r: 8, strokeWidth: 0 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Priority Breakdown */}
                    <div className="bg-bg-secondary/50 border border-border p-8 rounded-[32px] shadow-xl backdrop-blur-sm">
                        <h2 className="text-xl font-bold text-text mb-8">Task Priorities</h2>
                        <div className="h-[300px] w-full flex items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={priorityData}
                                        innerRadius={80}
                                        outerRadius={100}
                                        paddingAngle={8}
                                        dataKey="value"
                                    >
                                        {priorityData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={PRIORITY_COLORS[entry.priority as keyof typeof PRIORITY_COLORS]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'var(--color-bg-secondary)',
                                            border: '1px solid var(--color-border)',
                                            borderRadius: '12px',
                                            color: 'var(--color-text)'
                                        }}
                                        itemStyle={{ color: 'var(--color-text)' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="grid grid-cols-2 gap-3 mt-4">
                            {priorityData.map((d) => (
                                <div key={d.name} className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PRIORITY_COLORS[d.priority as keyof typeof PRIORITY_COLORS] }} />
                                    <span className="text-xs text-zinc-400 font-medium">{d.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Habit Performance */}
                    <div className="lg:col-span-3 bg-bg-secondary/50 border border-border p-8 rounded-[32px] shadow-xl backdrop-blur-sm">
                        <h2 className="text-xl font-bold text-text mb-8">Top Habit Streaks</h2>
                        <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={habitData} layout="vertical">
                                    <XAxis type="number" hide />
                                    <YAxis
                                        dataKey="name"
                                        type="category"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#fff', fontSize: 13, fontWeight: 600 }}
                                        width={100}
                                    />
                                    <Tooltip
                                        cursor={{ fill: 'transparent' }}
                                        contentStyle={{
                                            backgroundColor: 'var(--color-bg-secondary)',
                                            border: '1px solid var(--color-border)',
                                            borderRadius: '12px',
                                            color: 'var(--color-text)'
                                        }}
                                        itemStyle={{ color: 'var(--color-text)' }}
                                    />
                                    <Bar
                                        dataKey="streak"
                                        radius={[0, 10, 10, 0]}
                                        barSize={32}
                                    >
                                        {habitData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function KPICard({ title, value, icon, trend }: { title: string; value: string | number; icon: React.ReactNode; trend?: number }) {
    return (
        <div className="bg-bg-secondary/50 border border-border p-6 rounded-3xl shadow-lg hover:bg-bg-secondary transition-all group">
            <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-bg-tertiary rounded-2xl group-hover:scale-110 transition-transform">
                    {icon}
                </div>
                {trend !== undefined && (
                    <div className={`flex items-center gap-1 text-xs font-bold ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {trend > 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                        {Math.abs(trend)}%
                    </div>
                )}
            </div>
            <div className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-1">{title}</div>
            <div className="text-3xl font-black text-text">{value}</div>
        </div>
    )
}
