import { Check, Trash2, Flag, RotateCcw, Edit2 } from 'lucide-react'
import { Task, useTaskStore } from '../../stores/taskStore'
import { useListStore } from '../../stores/listStore'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useState } from 'react'
import EditTaskModal from './EditTaskModal'

interface TaskCardProps {
    task: Task
}

export default function TaskCard({ task }: TaskCardProps) {
    const {
        completeTask,
        uncompleteTask,
        deleteTask,
        restoreTask,
        permanentDeleteTask,
    } = useTaskStore()

    const { lists } = useListStore()
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)

    const isCompleted = !!task.completedAt
    const isTrash = !!task.deletedAt

    const handleToggle = () => {
        if (isTrash) return
        if (isCompleted) {
            uncompleteTask(task.id)
        } else {
            completeTask(task.id)
        }
    }

    const handleDelete = () => {
        if (isTrash) {
            if (confirm('Permanently delete this task? This cannot be undone.')) {
                permanentDeleteTask(task.id)
            }
        } else {
            if (confirm('Move this task to trash?')) {
                deleteTask(task.id)
            }
        }
    }

    const handleRestore = () => {
        restoreTask(task.id)
    }

    const priorityColors = ['', 'text-blue-400', 'text-yellow-400', 'text-red-400']

    return (
        <div
            className={`group flex items-start gap-4 p-4 mb-3 rounded-xl hover:bg-bg-tertiary/50 transition-all border border-transparent hover:border-zinc-800 ${isCompleted || isTrash ? 'opacity-60' : ''
                }`}
        >
            {/* Checkbox / Restore */}
            {isTrash ? (
                <button
                    onClick={handleRestore}
                    className="mt-1 flex-shrink-0 w-5 h-5 flex items-center justify-center text-zinc-500 hover:text-primary transition-colors"
                    title="Restore task"
                >
                    <RotateCcw size={18} />
                </button>
            ) : (
                <button
                    onClick={handleToggle}
                    className={`mt-1 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${isCompleted
                        ? 'bg-primary border-primary'
                        : 'border-zinc-500 hover:border-primary'
                        }`}
                >
                    {isCompleted && <Check size={12} className="text-white" />}
                </button>
            )}

            {/* Content area: Clickable to edit */}
            <div
                className="flex-1 min-w-0 cursor-pointer"
                onClick={() => !isTrash && setIsEditModalOpen(true)}
            >
                <div className="flex items-start gap-2">
                    <span
                        className={`text-[15px] leading-relaxed ${isCompleted ? 'line-through text-zinc-500 font-normal' : 'font-semibold text-[var(--color-text)]'
                            } ${isTrash ? 'text-zinc-500' : ''}`}
                    >
                        {task.title}
                    </span>

                    {/* Priority */}
                    {task.priority > 0 && !isTrash && (
                        <Flag size={14} className={priorityColors[task.priority]} fill="currentColor" />
                    )}

                    {!isTrash && (
                        <Edit2
                            size={12}
                            className="mt-1 text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity"
                        />
                    )}
                </div>

                {/* Meta */}
                <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-zinc-500 font-normal">
                    {task.dueDate && (
                        <span>
                            {format(parseISO(task.dueDate), "d 'de' MMM", { locale: ptBR })}
                            {task.dueTime && ` ${task.dueTime}`}
                        </span>
                    )}

                    {/* List Indicator */}
                    {!isTrash && (
                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-bg-tertiary/30">
                            {(() => {
                                const currentList = task.listId ? lists.find(l => l.id === task.listId) : null;
                                return (
                                    <>
                                        <span
                                            className="w-2 h-2 rounded-full"
                                            style={{ backgroundColor: currentList?.color || '#a1a1aa' }}
                                        />
                                        <span className={currentList ? 'text-zinc-400 font-medium' : 'text-zinc-500 italic'}>
                                            {currentList?.name || 'Inbox'}
                                        </span>
                                    </>
                                );
                            })()}
                        </div>
                    )}

                    {task.tags && task.tags.length > 0 && (
                        <div className="flex gap-1">
                            {task.tags.split(',').filter(Boolean).map((tag) => (
                                <span
                                    key={tag}
                                    className="px-1.5 py-0.5 bg-primary/10 text-primary/80 rounded text-[10px] font-bold border border-primary/10"
                                >
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    )}

                    {task.recurrenceRule && (
                        <span className="text-primary">🔄</span>
                    )}

                    {isTrash && task.deletedAt && (
                        <span className="text-red-400 border border-red-400/20 px-1.5 py-0.5 rounded-full bg-red-400/5">
                            Deleted: {format(new Date(task.deletedAt), "d/MM HH:mm")}
                        </span>
                    )}
                </div>
            </div>

            {/* Actions */}
            <button
                onClick={handleDelete}
                className={`p-1.5 hover:bg-red-500/20 rounded-lg transition-all ${isTrash ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                title={isTrash ? "Delete permanently" : "Move to trash"}
            >
                <Trash2 size={16} className="text-red-400" />
            </button>

            {isEditModalOpen && (
                <EditTaskModal task={task} onClose={() => setIsEditModalOpen(false)} />
            )}
        </div>
    )
}
