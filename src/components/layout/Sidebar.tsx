import { useNavigate, useLocation } from 'react-router-dom'
import {
    Inbox,
    Plus,
    CheckCircle,
    Trash2,
    ChevronDown,
    ChevronRight,
    Tag,
    Flag,
    CalendarDays,
    CalendarRange
} from 'lucide-react'
import { useListStore } from '../../stores/listStore'
import { useTaskStore } from '../../stores/taskStore'
import { useState, useMemo, ReactNode } from 'react'
import { isToday, isAfter, isBefore, addDays, startOfDay, endOfDay, parseISO } from 'date-fns'
import CreateListModal from '../list/CreateListModal'

export default function Sidebar() {
    const navigate = useNavigate()
    const location = useLocation()
    const { lists } = useListStore()
    const { tasks } = useTaskStore()

    // Counts for Smart Lists
    const smartCounts = useMemo(() => {
        const today = startOfDay(new Date())
        const nextWeek = endOfDay(addDays(today, 7))

        return {
            inbox: tasks.filter(t => !t.deletedAt && !t.completedAt).length,
            today: tasks.filter(t => t.dueDate && isToday(parseISO(t.dueDate)) && !t.deletedAt && !t.completedAt).length,
            next7days: tasks.filter(t => {
                if (!t.dueDate || t.deletedAt || t.completedAt) return false
                const date = parseISO(t.dueDate)
                return (isAfter(date, today) || isToday(date)) && isBefore(date, nextWeek)
            }).length,
            completed: tasks.filter(t => t.completedAt && !t.deletedAt).length,
        }
    }, [tasks])

    // Collapsible states
    const [expandedSections, setExpandedSections] = useState({
        lists: true,
        filters: true,
        tags: true,
    })

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

    const toggleSection = (section: keyof typeof expandedSections) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
    }

    // Extract unique tags from all tasks
    const allTags = useMemo(() => {
        const tagSet = new Set<string>()
        tasks.forEach(t => {
            if (t.tags) {
                t.tags.split(',').map(tag => tag.trim()).forEach(tag => {
                    if (tag) tagSet.add(tag)
                })
            }
        })
        return Array.from(tagSet).sort()
    }, [tasks])

    return (
        <div className="h-full flex flex-col p-4 select-none">
            {/* Smart Lists */}
            <div className="mb-6">
                <SidebarItem
                    icon={<Inbox size={18} className="text-blue-400" />}
                    label="Inbox"
                    count={smartCounts.inbox}
                    active={location.pathname === '/tasks/inbox'}
                    onClick={() => navigate('/tasks/inbox')}
                />
                <SidebarItem
                    icon={<CalendarDays size={18} className="text-yellow-500" />}
                    label="Today"
                    count={smartCounts.today}
                    active={location.pathname === '/tasks/today'}
                    onClick={() => navigate('/tasks/today')}
                />
                <SidebarItem
                    icon={<CalendarRange size={18} className="text-purple-500" />}
                    label="Next 7 Days"
                    count={smartCounts.next7days}
                    active={location.pathname === '/tasks/next7days'}
                    onClick={() => navigate('/tasks/next7days')}
                />
                <SidebarItem
                    icon={<CheckCircle size={18} className="text-green-500" />}
                    label="Completed"
                    count={smartCounts.completed}
                    active={location.pathname === '/tasks/completed'}
                    onClick={() => navigate('/tasks/completed')}
                />
                <SidebarItem
                    icon={<Trash2 size={18} className="text-zinc-500" />}
                    label="Trash"
                    active={location.pathname === '/tasks/trash'}
                    onClick={() => navigate('/tasks/trash')}
                />
            </div>

            <div className="flex-1 overflow-auto space-y-2 pr-2 custom-scrollbar">
                {/* User Lists */}
                <CollapsibleSection
                    title="Lists"
                    isExpanded={expandedSections.lists}
                    onToggle={() => toggleSection('lists')}
                    onAdd={() => setIsCreateModalOpen(true)}
                >
                    {lists.filter(l => l.name.toLowerCase() !== 'inbox').map((list) => (
                        <SidebarItem
                            key={list.id}
                            icon={
                                <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: list.color }}
                                />
                            }
                            label={list.name}
                            count={list._count?.tasks}
                            active={location.pathname === `/tasks/${list.id}`}
                            onClick={() => navigate(`/tasks/${list.id}`)}
                        />
                    ))}
                </CollapsibleSection>

                {/* Filters */}
                <CollapsibleSection
                    title="Filters"
                    isExpanded={expandedSections.filters}
                    onToggle={() => toggleSection('filters')}
                >
                    <SidebarItem
                        icon={<Flag size={14} className="text-red-500" />}
                        label="Priority !!!"
                        onClick={() => { }}
                    />
                    <SidebarItem
                        icon={<Flag size={14} className="text-orange-500" />}
                        label="Priority !!"
                        onClick={() => { }}
                    />
                    <SidebarItem
                        icon={<Flag size={14} className="text-blue-500" />}
                        label="Priority !"
                        onClick={() => { }}
                    />
                </CollapsibleSection>

                {/* Tags */}
                <CollapsibleSection
                    title="Tags"
                    isExpanded={expandedSections.tags}
                    onToggle={() => toggleSection('tags')}
                >
                    {allTags.length > 0 ? (
                        allTags.map(tag => (
                            <SidebarItem
                                key={tag}
                                icon={<Tag size={14} className="text-zinc-500" />}
                                label={tag}
                                onClick={() => { }}
                            />
                        ))
                    ) : (
                        <p className="text-[10px] text-zinc-600 px-8 py-2 italic font-medium">No tags added yet</p>
                    )}
                </CollapsibleSection>
            </div>

            {isCreateModalOpen && (
                <CreateListModal onClose={() => setIsCreateModalOpen(false)} />
            )}
        </div>
    )
}

function CollapsibleSection({
    title,
    children,
    isExpanded,
    onToggle,
    onAdd
}: {
    title: string;
    children: ReactNode;
    isExpanded: boolean;
    onToggle: () => void;
    onAdd?: () => void;
}) {
    return (
        <div className="mb-2">
            <div
                className="flex items-center justify-between px-2 py-1.5 hover:bg-bg-tertiary/30 rounded-lg cursor-pointer group transition-colors"
                onClick={onToggle}
            >
                <div className="flex items-center gap-2">
                    {isExpanded ? (
                        <ChevronDown size={14} className="text-zinc-500 transition-transform" />
                    ) : (
                        <ChevronRight size={14} className="text-zinc-500 transition-transform" />
                    )}
                    <h3 className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">
                        {title}
                    </h3>
                </div>
                {onAdd && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            onAdd()
                        }}
                        className="p-1 hover:bg-bg-tertiary rounded transition-all opacity-0 group-hover:opacity-100"
                    >
                        <Plus size={14} className="text-zinc-500" />
                    </button>
                )}
            </div>
            {isExpanded && <div className="mt-1 flex flex-col gap-0.5">{children}</div>}
        </div>
    )
}

function SidebarItem({
    icon,
    label,
    count,
    active,
    onClick,
}: {
    icon: React.ReactNode
    label: string
    count?: number
    active?: boolean
    onClick: () => void
}) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-3 py-1.5 rounded-lg transition-all text-left group ${active
                ? 'bg-primary/10 text-primary'
                : 'hover:bg-bg-tertiary/50 text-zinc-400 hover:text-zinc-200'
                }`}
        >
            <div className={`transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110 opacity-70 group-hover:opacity-100'}`}>
                {icon}
            </div>
            <span className={`flex-1 text-sm font-medium ${active ? 'font-semibold' : ''}`}>{label}</span>
            {count !== undefined && count > 0 && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full bg-bg-tertiary text-zinc-500 font-bold group-hover:text-zinc-300 transition-colors`}>
                    {count}
                </span>
            )}
        </button>
    )
}
