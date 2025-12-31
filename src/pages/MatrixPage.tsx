import { useEffect } from 'react'
import { useTaskStore, Task } from '../stores/taskStore'
import { Check, Flag } from 'lucide-react'

export default function MatrixPage() {
    const { tasks, fetchTasks, completeTask, uncompleteTask } = useTaskStore()

    useEffect(() => {
        fetchTasks()
    }, [fetchTasks])

    // Filter active (non-deleted, non-completed) tasks for each quadrant
    const activeTasks = tasks.filter(t => !t.deletedAt && !t.completedAt)

    const urgentImportant = activeTasks.filter(t => t.priority === 3)
    const notUrgentImportant = activeTasks.filter(t => t.priority === 2)
    const urgentNotImportant = activeTasks.filter(t => t.priority === 1)
    const notUrgentNotImportant = activeTasks.filter(t => t.priority === 0 || !t.priority)

    return (
        <div className="p-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold">Eisenhower Matrix</h1>
                    <p className="text-zinc-500 mt-2 font-medium">Prioritize your tasks by importance and urgency</p>
                </div>

                <div className="grid grid-cols-2 grid-rows-2 gap-6 h-[calc(100vh-240px)]">
                    {/* Quadrant 1: Urgent & Important (!!!) */}
                    <Quadrant
                        title="Urgent & Important"
                        subtitle="Do it now"
                        tasks={urgentImportant}
                        colorClass="border-red-500"
                        titleColor="text-red-500"
                        onToggleTask={async (task) => {
                            if (task.completedAt) await uncompleteTask(task.id)
                            else await completeTask(task.id)
                        }}
                    />

                    {/* Quadrant 2: Not Urgent & Important (!!) -> Orange */}
                    <Quadrant
                        title="Not Urgent & Important"
                        subtitle="Schedule it"
                        tasks={notUrgentImportant}
                        colorClass="border-orange-500"
                        titleColor="text-orange-500"
                        onToggleTask={async (task) => {
                            if (task.completedAt) await uncompleteTask(task.id)
                            else await completeTask(task.id)
                        }}
                    />

                    {/* Quadrant 3: Urgent & Not Important (!) -> Blue */}
                    <Quadrant
                        title="Urgent & Not Important"
                        subtitle="Delegate it"
                        tasks={urgentNotImportant}
                        colorClass="border-blue-500"
                        titleColor="text-blue-500"
                        onToggleTask={async (task) => {
                            if (task.completedAt) await uncompleteTask(task.id)
                            else await completeTask(task.id)
                        }}
                    />

                    {/* Quadrant 4: Not Urgent & Not Important (none) */}
                    <Quadrant
                        title="Not Urgent & Not Important"
                        subtitle="Eliminate it"
                        tasks={notUrgentNotImportant}
                        colorClass="border-zinc-500"
                        titleColor="text-zinc-500"
                        onToggleTask={async (task) => {
                            if (task.completedAt) await uncompleteTask(task.id)
                            else await completeTask(task.id)
                        }}
                    />
                </div>
            </div>
        </div>
    )
}

function Quadrant({
    title,
    subtitle,
    tasks,
    colorClass,
    titleColor,
    onToggleTask
}: {
    title: string
    subtitle: string
    tasks: Task[]
    colorClass: string
    titleColor: string
    onToggleTask: (task: Task) => void
}) {
    return (
        <div className={`bg-bg-secondary rounded-2xl border-l-[6px] ${colorClass} p-6 flex flex-col min-h-0 shadow-xl shadow-black/10`}>
            <div className="mb-4">
                <h2 className={`text-xl font-bold ${titleColor}`}>{title}</h2>
                <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">{subtitle}</p>
            </div>

            <div className="flex-1 overflow-auto space-y-1 pr-2 custom-scrollbar">
                {tasks.length === 0 ? (
                    <div className="h-full flex items-center justify-center opacity-20 italic text-sm">
                        No tasks in this quadrant
                    </div>
                ) : (
                    tasks.map(task => (
                        <div
                            key={task.id}
                            className={`group flex items-center gap-3 p-2 rounded-lg hover:bg-bg-tertiary transition-all cursor-pointer ${task.completedAt ? 'opacity-50' : ''}`}
                            onClick={() => onToggleTask(task)}
                        >
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${task.completedAt ? 'bg-primary border-primary' : 'border-zinc-600 group-hover:border-primary'}`}>
                                {task.completedAt && <Check size={10} className="text-white" />}
                            </div>
                            <span className={`text-sm truncate flex-1 ${task.completedAt ? 'line-through text-zinc-500' : ''}`}>
                                {task.title}
                            </span>
                            {task.priority > 0 && (
                                <Flag size={12} className={titleColor} />
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
