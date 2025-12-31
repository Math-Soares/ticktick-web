import { useState, useRef, useEffect } from 'react'
import { X, List, Kanban, LayoutDashboard, Crown, ChevronDown, ListTodo } from 'lucide-react'
import { useListStore } from '../../stores/listStore'

interface CreateListModalProps {
    onClose: () => void
}

const COLORS = [
    { name: 'Gray', value: '#a1a1aa' },
    { name: 'Red', value: '#ef4444' },
    { name: 'Orange', value: '#f97316' },
    { name: 'Yellow', value: '#f59e0b' },
    { name: 'Green', value: '#22c55e' },
    { name: 'Cyan', value: '#06b6d4' },
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Indigo', value: '#6366f1' },
    { name: 'Purple', value: '#a855f7' },
    { name: 'Pink', value: '#ec4899' },
]

const VIEW_TYPES = [
    { id: 'list', icon: <List size={20} />, label: 'List' },
    { id: 'kanban', icon: <Kanban size={20} />, label: 'Kanban' },
    { id: 'timeline', icon: <LayoutDashboard size={20} />, label: 'Timeline', isPremium: true },
]

export default function CreateListModal({ onClose }: CreateListModalProps) {
    const { createList, isLoading } = useListStore()
    const [name, setName] = useState('')
    const [color, setColor] = useState(COLORS[7].value) // Default to Indigo
    const [viewType, setViewType] = useState('list')
    const modalRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                onClose()
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [onClose])

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault()
        if (!name.trim()) return

        await createList({ name: name.trim(), color })
        onClose()
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 p-4">
            <div
                ref={modalRef}
                className="w-full max-w-md bg-bg-secondary rounded-2xl shadow-2xl border border-border overflow-hidden animate-in zoom-in-95 duration-200"
            >
                {/* Header */}
                <div className="px-6 py-4 flex items-center justify-between border-b border-border/50">
                    <h2 className="text-lg font-bold">Add List</h2>
                    <button
                        onClick={onClose}
                        className="p-1.5 hover:bg-bg-tertiary rounded-lg transition-colors text-zinc-500 hover:text-text"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Name Input with Icon Wrapper */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-3 p-3 bg-bg-tertiary/50 border border-border focus-within:border-primary/50 rounded-xl transition-all">
                            <div className="w-8 h-8 flex items-center justify-center text-zinc-500">
                                <ListTodo size={20} />
                            </div>
                            <input
                                autoFocus
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Name"
                                className="flex-1 bg-transparent border-none outline-none text-base placeholder:text-zinc-600"
                            />
                        </div>
                    </div>

                    {/* Color Selection */}
                    <div className="space-y-3">
                        <label className="text-sm font-semibold text-zinc-400 px-1 uppercase tracking-wider">List Color</label>
                        <div className="flex flex-wrap gap-3 px-1">
                            {COLORS.map((c) => (
                                <button
                                    key={c.value}
                                    type="button"
                                    onClick={() => setColor(c.value)}
                                    className={`w-7 h-7 rounded-full transition-all relative ${color === c.value ? 'scale-125 ring-2 ring-white ring-offset-4 ring-offset-bg-secondary' : 'hover:scale-110'}`}
                                    style={{ backgroundColor: c.value }}
                                >
                                    {color === c.value && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-1.5 h-1.5 bg-white rounded-full" />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* View Type Selection */}
                    <div className="space-y-3">
                        <label className="text-sm font-semibold text-zinc-400 px-1 uppercase tracking-wider">View Type</label>
                        <div className="flex gap-3">
                            {VIEW_TYPES.map((type) => (
                                <button
                                    key={type.id}
                                    type="button"
                                    disabled={type.isPremium}
                                    onClick={() => setViewType(type.id)}
                                    className={`flex-1 flex items-center justify-center py-2.5 rounded-xl border transition-all relative group
                                        ${viewType === type.id
                                            ? 'bg-primary/10 border-primary text-primary'
                                            : 'bg-bg-tertiary/30 border-border text-zinc-500 hover:bg-bg-tertiary/50'
                                        } ${type.isPremium ? 'opacity-60 cursor-not-allowed' : ''}`}
                                >
                                    {type.icon}
                                    {type.isPremium && (
                                        <div className="absolute -top-1 -right-1 bg-yellow-500 text-black p-0.5 rounded-full shadow-lg">
                                            <Crown size={10} fill="currentColor" />
                                        </div>
                                    )}
                                    <span className="sr-only">{type.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Placeholder Selects to match TickTick exactly */}
                    <div className="grid grid-cols-1 gap-4">
                        <div className="flex items-center justify-between p-3 bg-bg-tertiary/30 border border-border/50 rounded-xl text-sm text-zinc-400">
                            <span>Folder</span>
                            <div className="flex items-center gap-2">
                                <span className="text-zinc-500 italic">None</span>
                                <ChevronDown size={14} />
                            </div>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-bg-tertiary/30 border border-border/50 rounded-xl text-sm text-zinc-400">
                            <span>List Type</span>
                            <div className="flex items-center gap-2">
                                <span className="text-zinc-500">Task List</span>
                                <ChevronDown size={14} />
                            </div>
                        </div>
                    </div>

                    {/* Footer Buttons */}
                    <div className="flex gap-3 pt-4 border-t border-border/50">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 text-zinc-400 font-bold hover:bg-bg-tertiary rounded-xl transition-all active:scale-[0.98]"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading || !name.trim()}
                            className="flex-1 py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100"
                        >
                            {isLoading ? 'Creating...' : 'Add'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
