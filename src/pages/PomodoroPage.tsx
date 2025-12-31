import { useState, useEffect, useRef } from 'react'
import { Plus, Settings2, Play, Pause, RotateCcw, ChevronRight } from 'lucide-react'
import PomodoroSettingsModal from '../components/pomodoro/PomodoroSettingsModal'

type TimerMode = 'Pomo' | 'Stopwatch'

export default function PomodoroPage() {
    const [mode, setMode] = useState<TimerMode>('Pomo')
    const [isActive, setIsActive] = useState(false)
    const [timeLeft, setTimeLeft] = useState(25 * 60) // 25 minutes in seconds
    const [stopwatchTime, setStopwatchTime] = useState(0)
    const [isSettingsOpen, setIsSettingsOpen] = useState(false)
    const timerRef = useRef<number | null>(null)

    // Format seconds into MM:SS
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    useEffect(() => {
        if (isActive) {
            timerRef.current = window.setInterval(() => {
                if (mode === 'Pomo') {
                    setTimeLeft((prev) => {
                        if (prev <= 0) {
                            if (timerRef.current) clearInterval(timerRef.current)
                            setIsActive(false)
                            return 0
                        }
                        return prev - 1
                    })
                } else {
                    setStopwatchTime((prev) => prev + 1)
                }
            }, 1000)
        } else {
            if (timerRef.current) clearInterval(timerRef.current)
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current)
        }
    }, [isActive, mode])

    const toggleTimer = () => setIsActive(!isActive)

    const resetTimer = () => {
        setIsActive(false)
        if (mode === 'Pomo') {
            setTimeLeft(25 * 60)
        } else {
            setStopwatchTime(0)
        }
    }

    const switchMode = (newMode: TimerMode) => {
        if (mode === newMode) return
        setMode(newMode)
        setIsActive(false)
    }

    // Circular progress for Pomo mode
    const progress = mode === 'Pomo' ? (timeLeft / (25 * 60)) * 100 : 0
    const circumference = 2 * Math.PI * 120 // radius = 120

    return (
        <div className="flex h-[calc(100vh-56px)] overflow-hidden">
            {isSettingsOpen && <PomodoroSettingsModal onClose={() => setIsSettingsOpen(false)} />}

            {/* Left Section: Timer */}
            <div className="flex-1 flex flex-col p-8 border-r border-border bg-bg/30">
                <div className="flex items-center justify-between mb-12 relative z-30">
                    <h1 className="text-2xl font-bold text-text tracking-tight">Pomodoro</h1>

                    <div className="flex items-center p-1 bg-bg-tertiary rounded-full shadow-inner">
                        <button
                            onClick={() => switchMode('Pomo')}
                            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${mode === 'Pomo' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-300'
                                }`}
                        >
                            Pomo
                        </button>
                        <button
                            onClick={() => switchMode('Stopwatch')}
                            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${mode === 'Stopwatch' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-300'
                                }`}
                        >
                            Stopwatch
                        </button>
                    </div>

                    <div className="flex items-center gap-3">
                        <button className="p-2 hover:bg-bg-tertiary rounded-lg text-zinc-400 transition-colors cursor-pointer">
                            <Plus size={20} />
                        </button>
                        <button
                            onClick={() => setIsSettingsOpen(true)}
                            className="p-2 hover:bg-bg-tertiary rounded-lg text-zinc-400 transition-colors cursor-pointer"
                        >
                            <Settings2 size={20} />
                        </button>
                    </div>
                </div>

                <div className="flex-1 flex flex-col items-center justify-center relative z-10">
                    <div className="flex items-center gap-1 text-zinc-500 text-sm font-bold mb-8 opacity-60 hover:opacity-100 cursor-pointer transition-opacity">
                        Focus <ChevronRight size={14} />
                    </div>

                    <div className="relative w-[320px] h-[320px] flex items-center justify-center">
                        {/* Circular Progress (SVG) */}
                        <svg className="absolute inset-0 w-full h-full -rotate-90">
                            <circle
                                cx="160"
                                cy="160"
                                r="120"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="8"
                                className="text-zinc-800/30"
                            />
                            {mode === 'Pomo' && (
                                <circle
                                    cx="160"
                                    cy="160"
                                    r="120"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="8"
                                    strokeDasharray={circumference}
                                    strokeDashoffset={circumference - (progress / 100) * circumference}
                                    strokeLinecap="round"
                                    className="text-primary transition-all duration-1000"
                                />
                            )}
                            {mode === 'Stopwatch' && (
                                // Render tick marks for stopwatch mode
                                Array.from({ length: 60 }).map((_, i) => {
                                    const activeSecond = stopwatchTime % 60;
                                    const isCurrentTick = activeSecond === i;

                                    return (
                                        <line
                                            key={i}
                                            x1="160"
                                            y1="40"
                                            x2="160"
                                            y2="52"
                                            transform={`rotate(${i * 6} 160 160)`}
                                            stroke="currentColor"
                                            strokeWidth={isCurrentTick ? "3" : "1.5"}
                                            className={isCurrentTick ? 'text-primary' : (i % 5 === 0 ? 'text-zinc-500' : 'text-zinc-800/40')}
                                        />
                                    )
                                })
                            )}
                        </svg>

                        <div className="text-7xl font-bold tracking-tighter text-text font-mono z-10">
                            {mode === 'Pomo' ? formatTime(timeLeft) : formatTime(stopwatchTime)}
                        </div>
                    </div>

                    <div className="mt-16 flex flex-col items-center">
                        <button
                            onClick={toggleTimer}
                            className={`w-48 py-4 px-8 rounded-full font-bold text-lg transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3 ${isActive
                                ? 'bg-zinc-800 text-white hover:bg-zinc-700'
                                : 'bg-primary text-white hover:bg-primary-dark shadow-primary/20'
                                }`}
                        >
                            {isActive ? <Pause fill="currentColor" size={24} /> : <Play fill="currentColor" size={24} />}
                            {isActive ? 'Pause' : 'Start'}
                        </button>

                        <div className="h-12 flex items-center justify-center mt-4">
                            {(isActive || (mode === 'Pomo' && timeLeft < 25 * 60) || (mode === 'Stopwatch' && stopwatchTime > 0)) && (
                                <button
                                    onClick={resetTimer}
                                    className="text-zinc-500 hover:text-zinc-300 text-sm font-bold flex items-center gap-2 transition-colors py-2"
                                >
                                    <RotateCcw size={16} /> Reset
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Section: Overview */}
            <div className="w-[400px] flex flex-col p-8 bg-bg/10 overflow-y-auto">
                <div className="mb-12">
                    <h2 className="text-lg font-bold text-text mb-6">Overview</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <StatCard label="Today's Pomo" value="0" />
                        <StatCard label="Today's Focus" value="0m" />
                        <StatCard label="Total Pomo" value="0" />
                        <StatCard label="Total Focus Duration" value="0m" />
                    </div>
                </div>

                <div className="flex-1 flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-text">Focus Record</h2>
                        <button className="p-1 hover:bg-bg-tertiary rounded text-zinc-500 transition-colors">
                            <Plus size={18} />
                        </button>
                    </div>

                    <div className="flex-1 flex flex-col items-center justify-center p-12 text-center opacity-40">
                        <div className="w-48 h-48 mb-6 relative">
                            <div className="absolute inset-0 bg-primary/10 rounded-full blur-3xl animate-pulse" />
                            <div className="relative z-10 flex items-center justify-center h-full">
                                <div className="p-6 bg-zinc-800 rounded-2xl shadow-2xl">
                                    <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                                </div>
                            </div>
                        </div>
                        <p className="text-zinc-500 font-bold">No focus record yet</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

function StatCard({ label, value }: { label: string; value: string }) {
    return (
        <div className="bg-bg-secondary/50 border border-border/50 p-4 rounded-2xl hover:bg-bg-secondary transition-colors group">
            <div className="text-[10px] uppercase tracking-wider font-bold text-zinc-500 mb-2 group-hover:text-primary transition-colors">
                {label}
            </div>
            <div className="text-2xl font-bold text-text tracking-tight">
                {value}
            </div>
        </div>
    )
}
