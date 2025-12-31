import { useState, useRef, useEffect } from 'react'
import { X, Calendar, Clock, Flag, Tag, ListTodo, Trash2, Check } from 'lucide-react'
import { Task, useTaskStore } from '../../stores/taskStore'
import { useListStore } from '../../stores/listStore'
import { parseISO, format } from 'date-fns'
import TaskAttachments from './TaskAttachments'

interface EditTaskModalProps {
    task: Task
    onClose: () => void
}

const PRIORITIES = [
    { value: 0, label: 'None', color: 'text-zinc-500' },
    { value: 1, label: 'Low', color: 'text-blue-400' },
    { value: 2, label: 'Medium', color: 'text-yellow-400' },
    { value: 3, label: 'High', color: 'text-red-400' },
]

export default function EditTaskModal({ task, onClose }: EditTaskModalProps) {
    const { updateTask, deleteTask } = useTaskStore()
    const { lists } = useListStore()

    const [title, setTitle] = useState(task.title)
    const [description, setDescription] = useState(task.description || '')
    const [priority, setPriority] = useState(task.priority)
    const [dueDate, setDueDate] = useState(task.dueDate ? format(parseISO(task.dueDate), 'yyyy-MM-dd') : '')
    const [dueTime, setDueTime] = useState(task.dueTime || '')
    const [endTime, setEndTime] = useState(task.endTime || '')
    const [listId, setListId] = useState(task.listId || '')
    const [tags, setTags] = useState(task.tags || '')

    const [isSaving, setIsSaving] = useState(false)
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

    // Auto-set endTime to 1 hour after dueTime
    useEffect(() => {
        if (dueTime && !endTime) {
            const [hours, minutes] = dueTime.split(':').map(Number)
            const d = new Date()
            d.setHours(hours + 1)
            d.setMinutes(minutes)
            setEndTime(`${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`)
        }
    }, [dueTime])

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault()
        if (!title.trim()) return

        setIsSaving(true)
        try {
            let isoDate = undefined
            if (dueDate) {
                const dateObj = new Date(dueDate + 'T12:00:00')
                isoDate = dateObj.toISOString()
            }

            await updateTask(task.id, {
                title: title.trim(),
                description: description.trim() || undefined,
                priority,
                dueDate: isoDate,
                dueTime: dueTime || undefined,
                endTime: endTime || undefined,
                listId: listId || undefined,
                tags: tags.trim() || '',
            })
            onClose()
        } catch (error) {
            console.error('Failed to update task:', error)
        } finally {
            setIsSaving(false)
        }
    }

    const handleDelete = () => {
        if (confirm('Move this task to trash?')) {
            deleteTask(task.id)
            onClose()
        }
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 p-4">
            <div
                ref={modalRef}
                className="w-full max-w-2xl bg-bg-secondary rounded-2xl shadow-2xl border border-border overflow-hidden animate-in zoom-in-95 duration-200"
            >
                {/* Header */}
                <div className="px-6 py-4 flex items-center justify-between border-b border-border/50">
                    <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-lg bg-primary/10 text-primary`}>
                            <ListTodo size={18} />
                        </div>
                        <h2 className="text-lg font-bold">Edit Task</h2>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleDelete}
                            className="p-1.5 hover:bg-red-500/10 rounded-lg transition-colors text-zinc-500 hover:text-red-400 group"
                            title="Delete Task"
                        >
                            <Trash2 size={20} />
                        </button>
                        <button
                            onClick={onClose}
                            className="p-1.5 hover:bg-bg-tertiary rounded-lg transition-colors text-zinc-500 hover:text-text"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Left Column: Content */}
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest pl-1">Title</label>
                                <input
                                    autoFocus
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="What needs to be done?"
                                    className="w-full bg-bg-tertiary border border-border focus:border-primary/50 rounded-xl px-4 py-3 outline-none transition-all text-lg text-[var(--color-text)] placeholder:text-zinc-500 shadow-inner"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest pl-1">Description</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Add some details..."
                                    rows={5}
                                    className="w-full bg-bg-tertiary border border-border focus:border-primary/50 rounded-xl px-4 py-3 outline-none transition-all resize-none placeholder:text-zinc-500 text-sm text-[var(--color-text)] shadow-inner"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest pl-1">Tags</label>
                                <div className="relative group">
                                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-primary transition-colors" size={16} />
                                    <input
                                        type="text"
                                        value={tags}
                                        onChange={(e) => setTags(e.target.value)}
                                        placeholder="Add tags..."
                                        className="w-full bg-bg-tertiary border border-border focus:border-primary/50 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none transition-all text-[var(--color-text)] placeholder:text-zinc-500 shadow-inner"
                                    />
                                </div>
                                <p className="text-[10px] text-zinc-500 mt-1 ml-1 flex items-center gap-1">
                                    <span className="w-1 h-1 rounded-full bg-primary/40" />
                                    Separate tags with commas (ex: work, urgent, gym)
                                </p>
                            </div>

                            {/* Attachments Section */}
                            <TaskAttachments taskId={task.id} />
                        </div>

                        {/* Right Column: Meta */}
                        <div className="space-y-6">
                            {/* Priority Selection */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest pl-1">Priority</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {PRIORITIES.map((p) => (
                                        <button
                                            key={p.value}
                                            type="button"
                                            onClick={() => setPriority(p.value)}
                                            className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all text-sm
                                                ${priority === p.value
                                                    ? 'bg-primary/10 border-primary text-primary font-bold shadow-lg shadow-primary/5'
                                                    : 'bg-bg-tertiary border-border text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-800'
                                                }`}
                                        >
                                            <Flag size={14} className={p.color} fill={priority === p.value ? 'currentColor' : 'none'} />
                                            {p.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Date & Time */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest pl-1">Schedule</label>
                                <div className="space-y-3">
                                    <div className="relative group">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-primary transition-colors" size={16} />
                                        <input
                                            type="date"
                                            value={dueDate}
                                            onChange={(e) => setDueDate(e.target.value)}
                                            className="w-full bg-bg-tertiary border border-border focus:border-primary/50 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none transition-all text-[var(--color-text)] shadow-inner [color-scheme:dark] dark:[color-scheme:dark] light:[color-scheme:light]"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1.5">
                                            <span className="text-[10px] font-bold text-zinc-500 uppercase ml-1">Start</span>
                                            <div className="relative group">
                                                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-primary transition-colors" size={14} />
                                                <input
                                                    type="time"
                                                    value={dueTime}
                                                    onChange={(e) => setDueTime(e.target.value)}
                                                    className="w-full bg-bg-tertiary border border-border focus:border-primary/50 rounded-xl py-2.5 pl-9 pr-3 text-sm focus:outline-none transition-all text-[var(--color-text)] shadow-inner [color-scheme:dark] dark:[color-scheme:dark] light:[color-scheme:light]"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <span className="text-[10px] font-bold text-zinc-500 uppercase ml-1">End</span>
                                            <div className="relative group">
                                                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-primary transition-colors" size={14} />
                                                <input
                                                    type="time"
                                                    value={endTime}
                                                    onChange={(e) => setEndTime(e.target.value)}
                                                    className="w-full bg-bg-tertiary border border-border focus:border-primary/50 rounded-xl py-2.5 pl-9 pr-3 text-sm focus:outline-none transition-all text-[var(--color-text)] shadow-inner [color-scheme:dark] dark:[color-scheme:dark] light:[color-scheme:light]"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* List Selection */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest pl-1">List</label>
                                <div className="relative group">
                                    <ListTodo className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-primary transition-colors" size={16} />
                                    <select
                                        value={listId}
                                        onChange={(e) => setListId(e.target.value)}
                                        className="w-full bg-bg-tertiary border border-border focus:border-primary/50 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none appearance-none transition-all text-[var(--color-text)] shadow-inner"
                                    >
                                        <option value="" className="bg-bg-secondary text-[var(--color-text)]">Inbox</option>
                                        {lists.filter(l => l.name.toLowerCase() !== 'inbox').map((list) => (
                                            <option key={list.id} value={list.id} className="bg-bg-secondary text-[var(--color-text)]">
                                                {list.name}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" size={14} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Buttons */}
                    <div className="flex gap-3 pt-8 mt-8 border-t border-border/50">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2.5 text-zinc-400 font-bold hover:bg-bg-tertiary rounded-xl transition-all active:scale-[0.98]"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving || !title.trim()}
                            className="flex-1 py-2.5 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isSaving ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Check size={18} />
                                    Save Changes
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

function ChevronDown({ className, size }: { className?: string, size?: number }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size || 24}
            height={size || 24}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="m6 9 6 6 6-6" />
        </svg>
    )
}
