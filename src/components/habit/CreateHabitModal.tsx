import { useState } from 'react'
import { X, Loader2 } from 'lucide-react'
import { useHabitStore } from '../../stores/habitStore'

interface CreateHabitModalProps {
    onClose: () => void
}

const ICONS = ['🎯', '🏃', '📚', '🧘', '💧', '🍎', '💪', '🧠', '🎹', '🎨', '🚀', '🌱']
const COLORS = [
    '#6366f1', // Indigo
    '#ec4899', // Pink
    '#ef4444', // Red
    '#f59e0b', // Amber
    '#10b981', // Emerald
    '#06b6d4', // Cyan
    '#3b82f6', // Blue
    '#8b5cf6', // Violet
]

export default function CreateHabitModal({ onClose }: CreateHabitModalProps) {
    const createHabit = useHabitStore((state) => state.createHabit)
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        icon: '🎯',
        color: '#6366f1',
        frequency: 'DAILY',
        targetCount: 1,
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.name.trim()) return

        setIsLoading(true)
        try {
            await createHabit({
                ...formData,
                targetDays: '0,1,2,3,4,5,6', // Default to every day for now
            })
            onClose()
        } catch (error) {
            console.error('Failed to create habit:', error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-bg-secondary w-full max-w-md rounded-2xl shadow-2xl border border-border overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-border">
                    <h2 className="text-xl font-bold">New Habit</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-bg-tertiary rounded-lg transition-colors text-zinc-400"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Name */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-400">Habit Name</label>
                        <input
                            autoFocus
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Ex: Exercício Diário"
                            className="w-full bg-bg-tertiary border border-border rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors"
                            required
                        />
                    </div>

                    {/* Icon Selection */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-400">Icon</label>
                        <div className="flex flex-wrap gap-2">
                            {ICONS.map((icon) => (
                                <button
                                    key={icon}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, icon })}
                                    className={`w-10 h-10 flex items-center justify-center text-xl rounded-lg transition-all ${formData.icon === icon
                                        ? 'bg-primary/20 border-2 border-primary scale-110'
                                        : 'bg-bg-tertiary border border-border hover:border-zinc-500'
                                        }`}
                                >
                                    {icon}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Color Selection */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-400">Color</label>
                        <div className="flex flex-wrap gap-3">
                            {COLORS.map((color) => (
                                <button
                                    key={color}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, color })}
                                    className={`w-6 h-6 rounded-full transition-all ${formData.color === color
                                        ? 'ring-2 ring-white ring-offset-2 ring-offset-bg-secondary scale-110'
                                        : 'hover:scale-110'
                                        }`}
                                    style={{ backgroundColor: color }}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 bg-zinc-800/50 hover:bg-zinc-800 text-zinc-300 [.light-theme_&]:bg-zinc-100 [.light-theme_&]:text-zinc-700 [.light-theme_&]:hover:bg-zinc-200 rounded-xl font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading || !formData.name.trim()}
                            className="flex-1 px-4 py-3 bg-primary hover:bg-primary-dark text-white disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <Loader2 size={20} className="animate-spin" />
                            ) : (
                                'Create Habit'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
