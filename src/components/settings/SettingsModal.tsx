import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, User, Palette, Moon, Sun } from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import { useUIStore } from '../../stores/uiStore'

interface SettingsModalProps {
    onClose: () => void
}

type Tab = 'account' | 'appearance'

export default function SettingsModal({ onClose }: SettingsModalProps) {
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState<Tab>('account')
    const { user, deleteAccount } = useAuthStore()
    const { theme, setTheme } = useUIStore()

    const handleDeleteAccount = async () => {
        if (confirm('TEM CERTEZA? Esta ação é irreversível e TODOS os seus dados serão apagados permanentemente.')) {
            try {
                await deleteAccount()
                onClose()
                navigate('/login')
            } catch {
                alert('Ocorreu um erro ao excluir a conta. Tente novamente.')
            }
        }
    }

    const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
        { id: 'account', label: 'Conta', icon: <User size={18} /> },
        { id: 'appearance', label: 'Aparência', icon: <Palette size={18} /> },
    ]

    return (
        <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={onClose}
        >
            <div
                className="w-full max-w-2xl bg-bg-secondary rounded-xl shadow-2xl border border-border animate-fade-in flex overflow-hidden"
                style={{ height: '450px' }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Sidebar */}
                <div className="w-48 bg-bg border-r border-border p-4">
                    <h2 className="text-lg font-semibold mb-4">Settings</h2>
                    <nav className="space-y-1">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-sm transition-colors ${activeTab === tab.id
                                    ? 'bg-primary/20 text-primary'
                                    : 'text-zinc-400 hover:bg-bg-tertiary hover:text-text'
                                    }`}
                            >
                                {tab.icon}
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                        <h3 className="font-medium">
                            {tabs.find((t) => t.id === activeTab)?.label}
                        </h3>
                        <button
                            onClick={onClose}
                            className="p-1 hover:bg-bg-tertiary rounded transition-colors"
                        >
                            <X size={20} className="text-zinc-400" />
                        </button>
                    </div>

                    {/* Tab Content */}
                    <div className="flex-1 p-6 overflow-auto">
                        {activeTab === 'account' && (
                            <AccountTab user={user} onDeleteAccount={handleDeleteAccount} />
                        )}
                        {activeTab === 'appearance' && (
                            <AppearanceTab theme={theme} setTheme={setTheme} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

function AccountTab({
    user,
    onDeleteAccount
}: {
    user: { id: string; email: string } | null;
    onDeleteAccount: () => void;
}) {
    return (
        <div className="space-y-6">
            {/* Avatar */}
            <div className="flex flex-col items-center mb-6">
                <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center text-3xl font-bold text-white mb-3">
                    {user?.email?.charAt(0).toUpperCase() || 'U'}
                </div>
                <p className="text-lg font-medium">{user?.email || 'Usuário'}</p>
            </div>

            {/* Account Info */}
            <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-border">
                    <span className="text-zinc-400">Email</span>
                    <span className="text-sm">{user?.email || '-'}</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-border">
                    <span className="text-zinc-400">ID da Conta</span>
                    <span className="text-sm font-mono text-zinc-500">{user?.id?.slice(0, 12) || '-'}...</span>
                </div>
            </div>

            {/* Delete Account */}
            <div className="pt-6">
                <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5">
                    <h4 className="text-sm font-bold text-red-500 mb-2 uppercase tracking-wider">Zona de Perigo</h4>
                    <p className="text-xs text-zinc-500 mb-4">
                        Ao excluir sua conta, todos os seus dados (tarefas, listas, hábitos e estatísticas) serão removidos permanentemente. Esta ação não pode ser desfeita.
                    </p>
                    <button
                        onClick={onDeleteAccount}
                        className="w-full py-2 px-4 bg-red-500 hover:bg-red-600 text-white text-sm font-bold rounded-lg transition-all active:scale-[0.98] shadow-lg shadow-red-500/20"
                    >
                        Excluir Minha Conta
                    </button>
                </div>
            </div>
        </div>
    )
}

function AppearanceTab({
    theme,
    setTheme,
}: {
    theme: 'dark' | 'light'
    setTheme: (theme: 'dark' | 'light') => void
}) {
    return (
        <div className="space-y-6">
            <div>
                <h4 className="text-sm font-medium mb-4">Tema</h4>
                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={() => setTheme('light')}
                        className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${theme === 'light'
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:border-zinc-600'
                            }`}
                    >
                        <Sun size={24} className={theme === 'light' ? 'text-primary' : 'text-zinc-400'} />
                        <div className="text-left">
                            <p className="font-medium">Claro</p>
                            <p className="text-xs text-zinc-500">Tema claro</p>
                        </div>
                    </button>

                    <button
                        onClick={() => setTheme('dark')}
                        className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${theme === 'dark'
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:border-zinc-600'
                            }`}
                    >
                        <Moon size={24} className={theme === 'dark' ? 'text-primary' : 'text-zinc-400'} />
                        <div className="text-left">
                            <p className="font-medium">Escuro</p>
                            <p className="text-xs text-zinc-500">Tema escuro</p>
                        </div>
                    </button>
                </div>
            </div>

            <p className="text-xs text-zinc-500 mt-6">
                O tema selecionado será salvo automaticamente nas suas preferências.
            </p>
        </div>
    )
}
