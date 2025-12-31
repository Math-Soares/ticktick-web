import { useEffect, useState, useRef } from 'react'
import { Sparkles, RefreshCw, X } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { api } from '../../api/client'

interface BriefingData {
    briefing: string
    timestamp: string
}

export default function DailyBriefingCard() {
    const [data, setData] = useState<BriefingData | null>(null)
    const [loading, setLoading] = useState(true)
    const [visible, setVisible] = useState(true)

    const initialized = useRef(false)

    useEffect(() => {
        const fetchBriefing = async () => {
            const today = new Date().toLocaleDateString('pt-BR')
            const cacheKey = 'ticktick_ai_briefing'
            const cached = localStorage.getItem(cacheKey)

            if (cached) {
                try {
                    const parsed = JSON.parse(cached)
                    if (parsed.date === today) {
                        console.log('Using cached briefing')
                        setData(parsed.data)
                        setLoading(false)
                        return
                    }
                } catch (e) {
                    console.error('Cache parse error', e)
                }
            }

            try {
                const res = await api.get('/ai/briefing')
                setData(res.data)

                // Save to cache
                localStorage.setItem(cacheKey, JSON.stringify({
                    date: today,
                    data: res.data
                }))
            } catch (error) {
                console.error("Briefing failed", error)
            } finally {
                setLoading(false)
            }
        }

        // Prevent double fetch with a simple flag check or just rely on the effect
        // In StrictMode, this acts twice. The first one will start fetching. 
        // We can use a ref to track if we already started a fetch for this mount.
        if (!initialized.current) {
            initialized.current = true
            fetchBriefing()
        }
    }, [])

    if (!visible) return null

    return (
        <div className="mb-6 relative group transform transition-all hover:scale-[1.01] duration-300">
            {/* Glow Effect */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl opacity-30 group-hover:opacity-100 blur transition duration-1000"></div>

            <div className="relative bg-bg-secondary rounded-xl p-6 border border-border/50 shadow-xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg text-white shadow-lg shadow-indigo-500/30">
                            <Sparkles size={18} className="animate-pulse" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-400">
                                Daily Briefing
                            </h3>
                            <p className="text-xs text-zinc-500 font-medium">Your AI Productivity Coach</p>
                        </div>
                    </div>

                    <button
                        onClick={() => setVisible(false)}
                        className="p-1 hover:bg-bg-tertiary rounded-lg text-zinc-500 transition-colors"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Content */}
                <div className="prose prose-invert prose-sm max-w-none text-zinc-300">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-8 gap-3 animate-pulse">
                            <RefreshCw className="animate-spin text-purple-500" size={24} />
                            <span className="text-xs text-zinc-500 font-mono">Analyzing tasks & habits...</span>
                        </div>
                    ) : (
                        <div className="animate-fade-in text-sm leading-relaxed">
                            <ReactMarkdown>{data?.briefing || "Ready to conquer the day?"}</ReactMarkdown>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
