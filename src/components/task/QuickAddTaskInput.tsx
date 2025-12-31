import { useState, useRef, useEffect } from 'react'
import { Plus, CornerDownLeft } from 'lucide-react'
import { useTaskStore } from '../../stores/taskStore'
import { useParams } from 'react-router-dom'

export default function QuickAddTaskInput() {
    const [input, setInput] = useState('')
    const [isFocused, setIsFocused] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    const quickAdd = useTaskStore((state) => state.quickAdd)
    const { listId } = useParams()

    // Determine context for new task
    // If we are in a specific list context (that allows adding), we might pass it?
    // The current quickAdd logic in QuickAddModal implies explicit selection or NLP.
    // Ideally, if I'm in "Work" list, adding a task adds it to "Work".
    // For now, let's keep it simple: it goes to inbox unless NLP specifies otherwise,
    // OR pass listId if valid custom list.
    const validListId = (listId && !['inbox', 'today', 'next7days', 'completed', 'trash'].includes(listId)) ? listId : undefined

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Global '/' shortcut to focus
            if (e.key === '/' && !isFocused && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
                e.preventDefault()
                inputRef.current?.focus()
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isFocused])

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault()
        if (!input.trim() || isSubmitting) return

        setIsSubmitting(true)
        try {
            await quickAdd(input.trim(), validListId)
            setInput('')
            // Keep focus for rapid entry? Or blur? Linear keeps focus.
            // Let's keep focus.
        } catch (error) {
            console.error('Failed to add task:', error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleInputKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            inputRef.current?.blur()
            setIsFocused(false)
        }
    }

    return (
        <div
            className={`
                group relative flex items-center gap-3 px-4 py-3 mb-6
                rounded-xl border transition-all duration-200
                ${isFocused
                    ? 'bg-bg-secondary border-primary/50 shadow-lg shadow-primary/5'
                    : 'bg-bg-secondary/50 border-border hover:bg-bg-secondary hover:border-border'
                }
            `}
        >
            <div className={`
                transition-colors duration-200
                ${isFocused ? 'text-primary' : 'text-zinc-500'}
            `}>
                <Plus size={20} />
            </div>

            <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleInputKeyDown}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                onSubmit={handleSubmit}
                // Handle Enter via form wrapping or keydown? 
                // Let's us onKeyDown for enter to be safe if not in form, 
                // but actually wrapping in <form> is semantic. 
                // Wait, I can just use onKeyDown in input for everything.
                onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                        handleSubmit()
                    }
                }}
                placeholder={isFocused ? 'Describe your task... (e.g., "Meeting tomorrow 10am #work")' : 'Add task...'}
                className="flex-1 bg-transparent border-none outline-none focus:outline-none focus:ring-0 text-base placeholder:text-zinc-500 text-text"
            />

            <div className="flex items-center gap-2">
                {input.trim() && (
                    <button
                        onClick={() => handleSubmit()}
                        disabled={isSubmitting}
                        className="flex items-center gap-1.5 px-2 py-1 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-semibold rounded-md transition-colors"
                    >
                        <span>Add</span>
                        <CornerDownLeft size={12} />
                    </button>
                )}

                {!input.trim() && !isFocused && (
                    <div className="hidden md:flex items-center justify-center gap-1 w-6 h-6 rounded-md bg-bg-tertiary border border-border text-[10px] font-bold text-zinc-500">
                        <span>/</span>
                    </div>
                )}
            </div>
        </div>
    )
}
