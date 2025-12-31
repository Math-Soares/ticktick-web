import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Sparkles, Loader2, Calendar, Plus } from 'lucide-react'
import { api } from '../api/client'
import { useTaskStore } from '../stores/taskStore'
import { clsx } from 'clsx'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface Message {
    role: 'user' | 'assistant' | 'system'
    content: string
}

export default function AIPage() {
    const [input, setInput] = useState('')
    const [messages, setMessages] = useState<Message[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const fetchTasks = useTaskStore(state => state.fetchTasks)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages, isLoading])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!input.trim() || isLoading) return

        const userMessage = input.trim()
        setInput('')
        setMessages(prev => [...prev, { role: 'user', content: userMessage }])
        setIsLoading(true)

        try {
            const response = await api.post('/ai/chat', {
                message: userMessage,
                history: messages.slice(-10), // Keep context manageable
            })

            const aiMessage = response.data
            setMessages(prev => [...prev, { role: 'assistant', content: aiMessage.content }])

            // Refresh tasks in case the AI modified anything
            fetchTasks()
        } catch (error) {
            console.error('AI Error:', error)
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'Desculpe, tive um problema ao processar sua solicitação. Verifique se a chave da API do Groq está configurada corretamente.'
            }])
        } finally {
            setIsLoading(false)
        }
    }

    const MessageContent = ({ content }: { content: string }) => {
        // Replace <br> tags with newlines to ensure proper markdown rendering
        const sanitizedContent = content.replace(/<br\s*\/?>/gi, '\n')

        return (
            <div className="prose prose-sm max-w-none text-text dark:prose-invert">
                <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                        ul: (props) => <ul className="list-disc pl-4 space-y-1 my-2" {...props} />,
                        ol: (props) => <ol className="list-decimal pl-4 space-y-1 my-2" {...props} />,
                        li: (props) => <li className="pl-1" {...props} />,
                        p: (props) => <p className="mb-2 last:mb-0 leading-relaxed" {...props} />,
                        strong: (props) => <strong className="font-bold text-text" {...props} />,
                        a: (props) => <a className="text-primary hover:underline transition-colors" target="_blank" rel="noopener noreferrer" {...props} />,
                        code: (props) => <code className="bg-bg-tertiary px-1.5 py-0.5 rounded text-xs font-mono text-primary border border-border" {...props} />,
                        pre: (props) => <pre className="bg-bg-secondary p-4 rounded-xl border border-border overflow-x-auto my-3 text-xs custom-scrollbar" {...props} />,
                        blockquote: (props) => <blockquote className="border-l-2 border-primary/50 pl-4 py-1 italic text-text-secondary bg-bg-tertiary/20 rounded-r-lg" {...props} />,
                    }}
                >
                    {sanitizedContent}
                </ReactMarkdown>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-[calc(100vh-64px)] relative overflow-hidden bg-bg transition-colors duration-300">
            {/* Header */}
            <div className="absolute top-0 inset-x-0 z-30 p-6 bg-gradient-to-b from-bg to-transparent pointer-events-none">
                <div className="max-w-4xl mx-auto flex items-center gap-4 pointer-events-auto">
                    <div className="p-3 bg-bg-secondary/50 backdrop-blur-xl border border-border rounded-2xl text-primary shadow-2xl shadow-primary/10 group hover:scale-105 transition-transform duration-500">
                        <Sparkles size={24} className="group-hover:animate-spin-slow" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-text tracking-tight">AI Assistant</h1>
                        <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <p className="text-text-secondary text-xs font-medium tracking-wide uppercase">Online & Ready</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto scrollbar-hide pt-32 pb-40 px-4">
                <div className="max-w-3xl mx-auto space-y-8">
                    {messages.length === 0 && (
                        <div className="mt-12 text-center space-y-10 animate-in fade-in zoom-in duration-700 slide-in-from-bottom-8">
                            <div className="flex justify-center relative">
                                <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full opacity-50 animate-pulse-slow" />
                                <div className="relative p-8 bg-bg-secondary/50 backdrop-blur-2xl border border-border rounded-[2.5rem] shadow-2xl ring-1 ring-border/5">
                                    <Bot size={80} className="text-primary drop-shadow-[0_0_15px_rgba(var(--color-primary-rgb),0.5)]" />
                                </div>
                            </div>

                            <div className="space-y-4 max-w-lg mx-auto">
                                <h2 className="text-3xl font-bold text-text">
                                    Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}
                                </h2>
                                <p className="text-text-secondary text-base leading-relaxed font-light">
                                    I'm your personal productivity architect. I can organize your agenda, optimize your tasks, or just chat.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto px-4">
                                <SuggestionCard
                                    icon={<Calendar size={20} className="text-blue-500" />}
                                    title="Optimize Schedule"
                                    description="Reorganize my tasks for better flow"
                                    onClick={() => setInput("Can you evaluate my tasks for today and suggest a better schedule?")}
                                />
                                <SuggestionCard
                                    icon={<Plus size={20} className="text-emerald-500" />}
                                    title="Quick Capture"
                                    description="Add a task for gym tomorrow at 6PM"
                                    onClick={() => setInput("Add a task for Gym tomorrow at 6pm with High priority")}
                                />
                            </div>
                        </div>
                    )}

                    {messages.map((msg, i) => (
                        <div
                            key={i}
                            className={clsx(
                                "flex gap-5 animate-in fade-in slide-in-from-bottom-4 duration-500",
                                msg.role === 'user' ? "flex-row-reverse" : "flex-row"
                            )}
                        >
                            <div className={clsx(
                                "w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-lg ring-2 ring-border/20",
                                msg.role === 'user'
                                    ? "bg-gradient-to-br from-primary to-indigo-600 text-white"
                                    : "bg-bg-secondary border border-border text-primary"
                            )}>
                                {msg.role === 'user' ? <User size={18} /> : <Sparkles size={18} />}
                            </div>

                            <div className={clsx(
                                "max-w-[85%] px-6 py-4 text-[15px] leading-7 shadow-xl backdrop-blur-sm",
                                msg.role === 'user'
                                    ? "bg-gradient-to-br from-primary/90 to-indigo-600/90 text-white rounded-[1.5rem] rounded-tr-sm border border-white/10"
                                    : "bg-bg-secondary/80 border border-border text-text rounded-[1.5rem] rounded-tl-sm"
                            )}>
                                {msg.role === 'user' ? msg.content : <MessageContent content={msg.content} />}
                            </div>
                        </div>
                    ))}

                    {isLoading && (
                        <div className="flex gap-5 animate-pulse">
                            <div className="w-10 h-10 rounded-full bg-bg-secondary flex items-center justify-center border border-border">
                                <Sparkles size={18} className="text-primary/50" />
                            </div>
                            <div className="bg-bg-secondary border border-border px-6 py-4 rounded-[1.5rem] rounded-tl-sm flex items-center gap-3">
                                <Loader2 size={18} className="animate-spin text-primary" />
                                <span className="text-text-secondary font-medium tracking-wide text-xs uppercase">Thinking...</span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input Area */}
            <div className="absolute bottom-0 inset-x-0 p-6 z-40 bg-gradient-to-t from-bg via-bg/95 to-transparent pt-20 pointer-events-none">
                <div className="max-w-3xl mx-auto pointer-events-auto">
                    <form onSubmit={handleSubmit} className="relative group">
                        <div className="absolute inset-0 bg-primary/20 rounded-[2rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="relative flex items-center bg-bg-secondary/80 backdrop-blur-2xl border border-border rounded-[2rem] shadow-2xl ring-1 ring-border/5 hover:ring-primary/30 focus-within:ring-primary focus-within:ring-2 focus-within:bg-bg-secondary transition-all">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask AI to organize your life..."
                                className="w-full bg-transparent px-8 py-5 outline-none focus:outline-none focus:ring-0 text-text placeholder:text-text-secondary text-lg"
                            />
                            <button
                                type="submit"
                                disabled={!input.trim() || isLoading}
                                className="mr-3 p-3 flex items-center justify-center bg-gradient-to-br from-primary to-indigo-600 hover:brightness-110 text-white rounded-full transition-all active:scale-90 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none shadow-lg shadow-primary/25"
                            >
                                <Send size={20} />
                            </button>
                        </div>
                    </form>
                    <p className="text-[10px] text-text-secondary mt-4 text-center font-medium tracking-[0.2em] uppercase opacity-60">
                        Powered by GPT-OSS • TickTick AI
                    </p>
                </div>
            </div>
        </div>
    )
}

function SuggestionCard({ icon, title, description, onClick }: { icon: any, title: string, description: string, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className="flex flex-col items-start p-5 bg-bg-secondary/50 hover:bg-bg-secondary border border-border hover:border-primary/30 rounded-3xl transition-all text-left group backdrop-blur-sm"
        >
            <div className="p-3 bg-bg-tertiary rounded-2xl mb-4 border border-border group-hover:scale-110 group-hover:bg-bg-tertiary/80 transition-all duration-300">
                {icon}
            </div>
            <h3 className="text-base font-bold text-text mb-1.5 group-hover:text-primary transition-colors">{title}</h3>
            <p className="text-xs text-text-secondary leading-relaxed group-hover:text-text-secondary/80">{description}</p>
        </button>
    )
}
