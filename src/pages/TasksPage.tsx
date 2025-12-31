import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, useParams } from 'react-router-dom'
import { Loader2, Trash2, CalendarDays, CalendarRange, Inbox } from 'lucide-react'
import Sidebar from '../components/layout/Sidebar'
import TaskCard from '../components/task/TaskCard'
import QuickAddTaskInput from '../components/task/QuickAddTaskInput'
import DailyBriefingCard from '../components/task/DailyBriefingCard'
import { useTaskStore } from '../stores/taskStore'
import { useListStore } from '../stores/listStore'
import { useUIStore } from '../stores/uiStore'

import { isToday, isAfter, isBefore, addDays, startOfDay, endOfDay, parseISO } from 'date-fns'

export default function TasksPage() {
    const { listId } = useParams()
    const navigate = useNavigate()
    const {
        tasks,
        trashTasks,
        completedTasks,
        isLoading,
        fetchTasks,
        fetchCompleted,
        fetchTrash
    } = useTaskStore()
    const { lists, deleteList } = useListStore()
    const { sidebarOpen } = useUIStore()

    const handleDeleteList = async () => {
        if (!listId || listId === 'completed' || listId === 'trash' || ['inbox', 'today', 'next7days'].includes(listId)) return

        if (confirm(`Are you sure you want to delete this list? All tasks within it will be moved to the Trash. \n\nNote: If restored from trash, these tasks will appear in "Inbox".`)) {
            await deleteList(listId)
            navigate('/tasks/inbox')
            fetchTasks()
        }
    }

    useEffect(() => {
        if (listId === 'completed') {
            fetchCompleted()
        } else if (listId === 'trash') {
            fetchTrash()
        } else {
            fetchTasks()
        }
    }, [listId, fetchTasks, fetchCompleted, fetchTrash])

    const currentList = (listId && !['completed', 'trash', 'inbox', 'today', 'next7days'].includes(listId))
        ? lists.find((l) => l.id === listId)
        : null

    const isTrash = listId === 'trash'
    const isCompletedView = listId === 'completed'
    const isTodayView = listId === 'today'
    const isNext7DaysView = listId === 'next7days'
    const isInboxView = listId === 'inbox' || !listId
    const isCustomList = !!currentList

    // Use specific pools for specific views to preserve the global active pool 'tasks' for sidebar counts
    const sourcePool = isTrash ? trashTasks : isCompletedView ? completedTasks : tasks

    const filteredTasks = sourcePool.filter(task => {
        if (isTrash || isCompletedView) return true
        if (isInboxView) return !task.deletedAt
        if (isTodayView) return task.dueDate && isToday(parseISO(task.dueDate)) && !task.deletedAt
        if (isNext7DaysView) {
            if (!task.dueDate || task.deletedAt) return false
            const date = parseISO(task.dueDate)
            const today = startOfDay(new Date())
            const nextWeek = endOfDay(addDays(today, 7))
            return (isAfter(date, today) || isToday(date)) && isBefore(date, nextWeek)
        }
        if (isCustomList) return task.listId === listId && !task.deletedAt
        return true
    })

    const incompleteTasks = filteredTasks.filter((t) => !t.completedAt)
    const completedTasksList = filteredTasks.filter((t) => t.completedAt)

    const viewTitle = isTrash ? 'Trash'
        : isCompletedView ? 'Completed'
            : isInboxView ? 'Inbox'
                : isTodayView ? 'Today'
                    : isNext7DaysView ? 'Next 7 Days'
                        : currentList ? currentList.name
                            : 'Tasks'

    return (
        <div className="flex h-full">
            {/* Local Sidebar - Now stays visible regardless of loading state */}
            <aside
                className={`${sidebarOpen ? 'w-64' : 'w-0'
                    } transition-all duration-300 overflow-hidden bg-bg-secondary border-r border-border shrink-0`}
            >
                <div className="w-64">
                    <Sidebar />
                </div>
            </aside>

            {/* Content Area */}
            <div className="flex-1 overflow-auto p-8">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="mb-8 flex items-end justify-between">
                        <div>
                            <h1 className="text-3xl font-bold flex items-center gap-4">
                                {currentList ? (
                                    <>
                                        <span
                                            className="w-5 h-5 rounded-full"
                                            style={{ backgroundColor: currentList.color }}
                                        />
                                        {currentList.name}
                                    </>
                                ) : isTodayView ? (
                                    <>
                                        <CalendarDays size={32} className="text-yellow-500" />
                                        Today
                                    </>
                                ) : isNext7DaysView ? (
                                    <>
                                        <CalendarRange size={32} className="text-purple-500" />
                                        Next 7 Days
                                    </>
                                ) : isInboxView ? (
                                    <>
                                        <Inbox size={32} className="text-blue-400" />
                                        Inbox
                                    </>
                                ) : (
                                    viewTitle
                                )}
                            </h1>
                            <p className="text-zinc-500 mt-2 font-medium">
                                {isTrash
                                    ? `${filteredTasks.length} item${filteredTasks.length !== 1 ? 's' : ''} in trash`
                                    : isCompletedView
                                        ? `${filteredTasks.length} task${filteredTasks.length !== 1 ? 's' : ''} completed`
                                        : `${incompleteTasks.length} task${incompleteTasks.length !== 1 ? 's' : ''} remaining`
                                }
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            {currentList && (
                                <button
                                    onClick={handleDeleteList}
                                    className="p-2 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                                    title="Delete List"
                                >
                                    <Trash2 size={20} />
                                </button>
                            )}



                            {isTrash && filteredTasks.length > 0 && (
                                <button
                                    onClick={() => {
                                        if (confirm('Permanently delete all tasks in trash? This cannot be undone.')) {
                                            useTaskStore.getState().clearTrash()
                                        }
                                    }}
                                    className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-sm font-semibold rounded-xl transition-colors border border-red-500/20 active:scale-95"
                                >
                                    Clear Trash
                                </button>
                            )}
                        </div>
                    </div>

                    {/* AI Daily Briefing - Only on Today View */}
                    {isTodayView && (
                        <DailyBriefingCard />
                    )}

                    {/* Quick Add Input */}
                    {!isTrash && !isCompletedView && (
                        <QuickAddTaskInput />
                    )}

                    {/* Task List - Loading happens here now */}
                    <div className="space-y-3">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-20">
                                <Loader2 className="animate-spin text-primary" size={32} />
                            </div>
                        ) : filteredTasks.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-20 bg-bg-secondary/30 rounded-3xl border border-dashed border-border"
                            >
                                <p className="text-zinc-400 text-lg font-medium">No tasks found</p>
                                {isTrash ? null : (
                                    <p className="text-zinc-500 text-sm mt-2">
                                        Click the <span className="text-primary">Add Task</span> button to get started
                                    </p>
                                )}
                            </motion.div>
                        ) : (
                            <>
                                {(isTrash || isCompletedView) ? (
                                    <AnimatePresence mode="popLayout">
                                        {filteredTasks.map((task) => (
                                            <motion.div
                                                key={task.id}
                                                layout
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                <TaskCard task={task} />
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                ) : (
                                    <>
                                        <AnimatePresence mode="popLayout">
                                            {incompleteTasks.map((task) => (
                                                <motion.div
                                                    key={task.id}
                                                    layout
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, scale: 0.95 }}
                                                    transition={{ duration: 0.2 }}
                                                >
                                                    <TaskCard task={task} />
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>

                                        {completedTasksList.length > 0 && (
                                            <motion.div layout className="pt-8">
                                                <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-4 px-2">
                                                    Completed ({completedTasksList.length})
                                                </h3>
                                                <div className="space-y-3 opacity-60 hover:opacity-100 transition-opacity">
                                                    <AnimatePresence mode="popLayout">
                                                        {completedTasksList.map((task) => (
                                                            <motion.div
                                                                key={task.id}
                                                                layout
                                                                initial={{ opacity: 0 }}
                                                                animate={{ opacity: 1 }}
                                                                exit={{ opacity: 0 }}
                                                            >
                                                                <TaskCard task={task} />
                                                            </motion.div>
                                                        ))}
                                                    </AnimatePresence>
                                                </div>
                                            </motion.div>
                                        )}
                                    </>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
