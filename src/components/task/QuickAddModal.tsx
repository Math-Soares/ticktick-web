import { useState, useRef, useEffect } from 'react'
import { X, Sparkles } from 'lucide-react'
import { useTaskStore } from '../../stores/taskStore'
import { useListStore } from '../../stores/listStore'

interface QuickAddModalProps {
    onClose: () => void
}

export default function QuickAddModal({ onClose }: QuickAddModalProps) {
    const [input, setInput] = useState('')
    const [selectedListId, setSelectedListId] = useState<string>('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    const quickAdd = useTaskStore((state) => state.quickAdd)
    const lists = useListStore((state) => state.lists)

    useEffect(() => {
        inputRef.current?.focus()
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!input.trim() || isSubmitting) return

        setIsSubmitting(true)
        try {
            await quickAdd(input.trim(), selectedListId || undefined)
            setInput('')
            onClose()
        } catch (error) {
            console.error('Failed to add task:', error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            onClose()
        }
    }

    return (
        <div
            className="fixed inset-0 bg-black/50 flex items-start justify-center pt-32 z-50"
            onClick={onClose}
        >
            <div
                className="w-full max-w-xl bg-bg-secondary rounded-xl shadow-2xl border border-border animate-fade-in"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                    <div className="flex items-center gap-2 text-primary">
                        <Sparkles size={18} />
                        <span className="text-sm font-medium">Quick Add (NLP)</span>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-bg-tertiary rounded transition-colors"
                    >
                        <X size={18} className="text-zinc-400" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-4">
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder='Try: "Pagar conta amanhã 14h #finanças !!!"'
                        className="w-full px-4 py-3 bg-bg-tertiary rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />

                    {/* List selector */}
                    <div className="flex items-center gap-4 mt-4">
                        <label className="text-sm text-zinc-400">List:</label>
                        <select
                            value={selectedListId}
                            onChange={(e) => setSelectedListId(e.target.value)}
                            className="flex-1 px-3 py-2 bg-bg-tertiary rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            <option value="">Inbox</option>
                            {lists.filter(l => l.name.toLowerCase() !== 'inbox').map((list) => (
                                <option key={list.id} value={list.id}>
                                    {list.name}
                                </option>
                            ))}
                        </select>

                        <button
                            type="submit"
                            disabled={!input.trim() || isSubmitting}
                            className="px-4 py-2 bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
                        >
                            {isSubmitting ? 'Adding...' : 'Add Task'}
                        </button>
                    </div>

                    {/* Hints */}
                    <div className="mt-4 text-xs text-zinc-500">
                        <p className="mb-1">💡 Dicas de NLP:</p>
                        <ul className="list-disc list-inside space-y-0.5 text-zinc-600">
                            <li>"Reunião amanhã 14h" → Data e hora automáticas</li>
                            <li>"Pagar conta a cada 5 do mês" → Recorrência mensal</li>
                            <li>"#trabalho" → Adiciona tag</li>
                            <li>"!!!" → Prioridade alta (!, !!, !!!)</li>
                        </ul>
                    </div>
                </form>
            </div>
        </div>
    )
}
