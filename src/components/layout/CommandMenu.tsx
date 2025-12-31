import { useEffect, useState } from 'react'
import { Command } from 'cmdk'
import { useNavigate } from 'react-router-dom'
import {
    Calendar,
    CheckSquare,
    LayoutGrid,
    Inbox,
    Zap,
    Moon,
    Sun,
    Timer,
    Sparkles,
    Search
} from 'lucide-react'
import { useUIStore } from '../../stores/uiStore'

export default function CommandMenu() {
    const [open, setOpen] = useState(false)
    const navigate = useNavigate()
    const { setQuickAddOpen, theme, setTheme, setCreateHabitOpen } = useUIStore()

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setOpen((open) => !open)
            }
        }

        document.addEventListener('keydown', down)
        return () => document.removeEventListener('keydown', down)
    }, [])

    const runCommand = (command: () => void) => {
        command()
        setOpen(false)
    }

    return (
        <Command.Dialog
            open={open}
            onOpenChange={setOpen}
            label="Global Command Menu"
            className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] bg-black/40 backdrop-blur-sm animate-in fade-in active:animate-out fade-out"
        >
            <div className="w-full max-w-xl bg-bg-secondary rounded-xl shadow-2xl border border-border overflow-hidden animate-in zoom-in-95">
                <div className="flex items-center border-b border-border px-4" cmdk-input-wrapper="">
                    <Search className="w-5 h-5 text-zinc-500 mr-2" />
                    <Command.Input
                        placeholder="Type a command or search..."
                        className="flex-1 h-14 bg-transparent outline-none focus:outline-none focus-visible:outline-none ring-0 focus:ring-0 border-none text-lg text-text placeholder:text-zinc-500"
                    />
                    <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-zinc-500 bg-bg-tertiary px-1.5 py-0.5 rounded border border-border">
                        <span className="text-xs">Esc</span>
                    </div>
                </div>

                <Command.List className="max-h-[300px] overflow-y-auto p-2 scroll-py-2 custom-scrollbar">
                    <Command.Empty className="p-4 text-center text-sm text-zinc-500">
                        No results found.
                    </Command.Empty>

                    <Command.Group heading="Navigation" className="text-xs font-medium text-zinc-500 mb-2 px-2">
                        <Command.Item
                            onSelect={() => runCommand(() => navigate('/tasks/inbox'))}
                            className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm text-text cursor-pointer hover:bg-bg-tertiary aria-selected:bg-primary/20 aria-selected:text-primary transition-colors data-[selected=true]:bg-primary/10 data-[selected=true]:text-primary"
                        >
                            <Inbox className="w-4 h-4" />
                            <span>Inbox</span>
                        </Command.Item>
                        <Command.Item
                            onSelect={() => runCommand(() => navigate('/tasks/today'))}
                            className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm text-text cursor-pointer hover:bg-bg-tertiary aria-selected:bg-primary/20 aria-selected:text-primary transition-colors data-[selected=true]:bg-primary/10 data-[selected=true]:text-primary"
                        >
                            <CheckSquare className="w-4 h-4" />
                            <span>Today</span>
                        </Command.Item>
                        <Command.Item
                            onSelect={() => runCommand(() => navigate('/calendar'))}
                            className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm text-text cursor-pointer hover:bg-bg-tertiary aria-selected:bg-primary/20 aria-selected:text-primary transition-colors data-[selected=true]:bg-primary/10 data-[selected=true]:text-primary"
                        >
                            <Calendar className="w-4 h-4" />
                            <span>Calendar</span>
                        </Command.Item>
                        <Command.Item
                            onSelect={() => runCommand(() => navigate('/matrix'))}
                            className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm text-text cursor-pointer hover:bg-bg-tertiary aria-selected:bg-primary/20 aria-selected:text-primary transition-colors data-[selected=true]:bg-primary/10 data-[selected=true]:text-primary"
                        >
                            <LayoutGrid className="w-4 h-4" />
                            <span>Eisenhower Matrix</span>
                        </Command.Item>
                        <Command.Item
                            onSelect={() => runCommand(() => navigate('/habits'))}
                            className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm text-text cursor-pointer hover:bg-bg-tertiary aria-selected:bg-primary/20 aria-selected:text-primary transition-colors data-[selected=true]:bg-primary/10 data-[selected=true]:text-primary"
                        >
                            <Zap className="w-4 h-4" />
                            <span>Habits</span>
                        </Command.Item>
                        <Command.Item
                            onSelect={() => runCommand(() => navigate('/pomodoro'))}
                            className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm text-text cursor-pointer hover:bg-bg-tertiary aria-selected:bg-primary/20 aria-selected:text-primary transition-colors data-[selected=true]:bg-primary/10 data-[selected=true]:text-primary"
                        >
                            <Timer className="w-4 h-4" />
                            <span>Pomodoro</span>
                        </Command.Item>
                        <Command.Item
                            onSelect={() => runCommand(() => navigate('/ai'))}
                            className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm text-text cursor-pointer hover:bg-bg-tertiary aria-selected:bg-primary/20 aria-selected:text-primary transition-colors data-[selected=true]:bg-primary/10 data-[selected=true]:text-primary"
                        >
                            <Sparkles className="w-4 h-4" />
                            <span>AI Chat</span>
                        </Command.Item>
                    </Command.Group>

                    <Command.Separator className="h-px bg-border my-2" />

                    <Command.Group heading="Actions" className="text-xs font-medium text-zinc-500 mb-2 px-2">
                        <Command.Item
                            onSelect={() => runCommand(() => setQuickAddOpen(true))}
                            className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm text-text cursor-pointer hover:bg-bg-tertiary aria-selected:bg-primary/20 aria-selected:text-primary transition-colors data-[selected=true]:bg-primary/10 data-[selected=true]:text-primary"
                        >
                            <CheckSquare className="w-4 h-4" />
                            <span>New Task</span>
                            <span className="ml-auto text-[10px] text-zinc-400 bg-bg-tertiary px-1.5 py-0.5 rounded border border-border">Q</span>
                        </Command.Item>
                        <Command.Item
                            onSelect={() => runCommand(() => setCreateHabitOpen(true))}
                            className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm text-text cursor-pointer hover:bg-bg-tertiary aria-selected:bg-primary/20 aria-selected:text-primary transition-colors data-[selected=true]:bg-primary/10 data-[selected=true]:text-primary"
                        >
                            <Zap className="w-4 h-4" />
                            <span>New Habit</span>
                        </Command.Item>
                        <Command.Item
                            onSelect={() => runCommand(() => setTheme(theme === 'dark' ? 'light' : 'dark'))}
                            className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm text-text cursor-pointer hover:bg-bg-tertiary aria-selected:bg-primary/20 aria-selected:text-primary transition-colors data-[selected=true]:bg-primary/10 data-[selected=true]:text-primary"
                        >
                            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                            <span>Toggle Theme</span>
                        </Command.Item>
                    </Command.Group>
                </Command.List>

                <div className="border-t border-border p-2 bg-bg-tertiary/50 text-[10px] text-zinc-500 flex items-center justify-between px-4">
                    <div className="flex gap-2">
                        <span>Navigate</span>
                        <span className="flex gap-1">
                            <kbd className="bg-bg-secondary border border-border rounded px-1">↑</kbd>
                            <kbd className="bg-bg-secondary border border-border rounded px-1">↓</kbd>
                        </span>
                    </div>
                    <div className="flex gap-2">
                        <span>Select</span>
                        <kbd className="bg-bg-secondary border border-border rounded px-1">Enter</kbd>
                    </div>
                </div>
            </div>
        </Command.Dialog>
    )
}
