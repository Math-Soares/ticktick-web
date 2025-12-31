import { ReactNode, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Calendar,
    CheckSquare,
    LogOut,
    Settings,
    Target,
    Timer,
    Grid3X3,
    BarChart2,
    Sparkles,
} from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import { useListStore } from '../../stores/listStore'
import { useTaskStore } from '../../stores/taskStore'
import { useUIStore } from '../../stores/uiStore'
import { useTaskSocket } from '../../hooks/useTaskSocket'
import QuickAddModal from '../task/QuickAddModal'
import SettingsModal from '../settings/SettingsModal'
import CreateHabitModal from '../habit/CreateHabitModal'

interface LayoutProps {
    children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
    const navigate = useNavigate()
    const logout = useAuthStore((state) => state.logout)
    const fetchLists = useListStore((state) => state.fetchLists)
    const fetchTasks = useTaskStore((state) => state.fetchTasks)
    const { quickAddOpen, setQuickAddOpen, theme, createHabitOpen, setCreateHabitOpen } = useUIStore()
    const [settingsOpen, setSettingsOpen] = useState(false)

    // Connect to WebSocket for real-time updates
    useTaskSocket()

    useEffect(() => {
        fetchLists()
        fetchTasks()
    }, [fetchLists, fetchTasks])

    // Apply theme to document
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme)
        if (theme === 'light') {
            document.documentElement.classList.add('light-theme')
        } else {
            document.documentElement.classList.remove('light-theme')
        }
    }, [theme])

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    return (
        <div className="flex flex-col h-screen bg-bg">
            {/* Top Header */}
            <header className="h-14 bg-bg-secondary border-b border-border flex items-center justify-between px-4 shrink-0">
                <div className="flex items-center gap-6">
                    {/* App Title */}
                    <div className="flex items-center gap-2 pr-4 border-r border-border h-8">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold">T</span>
                        </div>
                        <span className="font-semibold text-lg">TickTick</span>
                    </div>

                    <nav className="flex items-center gap-1">
                        <NavButton
                            icon={<CheckSquare size={18} />}
                            label="Tasks"
                            onClick={() => navigate('/tasks')}
                        />
                        <NavButton
                            icon={<Calendar size={18} />}
                            label="Calendar"
                            onClick={() => navigate('/calendar')}
                        />
                        <NavButton
                            icon={<Timer size={18} />}
                            label="Pomodoro"
                            onClick={() => navigate('/pomodoro')}
                        />
                        <NavButton
                            icon={<Grid3X3 size={18} />}
                            label="Matrix"
                            onClick={() => navigate('/matrix')}
                        />
                        <NavButton
                            icon={<Target size={18} />}
                            label="Habit"
                            onClick={() => navigate('/habits')}
                        />
                        <NavButton
                            icon={<BarChart2 size={18} />}
                            label="Statistics"
                            onClick={() => navigate('/stats')}
                        />
                        <NavButton
                            icon={<Sparkles size={18} />}
                            label="AI"
                            onClick={() => navigate('/ai')}
                        />
                    </nav>
                </div>

                <div className="flex items-center gap-2">
                    {/* Settings Button */}
                    <button
                        onClick={() => setSettingsOpen(true)}
                        className="p-2 hover:bg-bg-tertiary rounded-lg transition-colors text-zinc-400 hover:text-text"
                        title="Configurações"
                    >
                        <Settings size={20} />
                    </button>

                    {/* Logout Button */}
                    <button
                        onClick={handleLogout}
                        className="p-2 hover:bg-bg-tertiary rounded-lg transition-colors text-zinc-400 hover:text-text"
                        title="Sair"
                    >
                        <LogOut size={20} />
                    </button>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 overflow-auto relative">
                {children}
            </main>

            {/* Quick Add Modal */}
            {quickAddOpen && (
                <QuickAddModal onClose={() => setQuickAddOpen(false)} />
            )}

            {/* Settings Modal */}
            {settingsOpen && (
                <SettingsModal onClose={() => setSettingsOpen(false)} />
            )}

            {/* Create Habit Modal */}
            {createHabitOpen && (
                <CreateHabitModal onClose={() => setCreateHabitOpen(false)} />
            )}
        </div>
    )
}

function NavButton({
    icon,
    label,
    onClick,
}: {
    icon: ReactNode
    label: string
    onClick: () => void
}) {
    return (
        <button
            onClick={onClick}
            className="flex items-center gap-2 px-3 py-2 hover:bg-bg-tertiary rounded-lg transition-colors text-zinc-400 hover:text-text"
        >
            {icon}
            <span className="hidden md:inline text-sm">{label}</span>
        </button>
    )
}
