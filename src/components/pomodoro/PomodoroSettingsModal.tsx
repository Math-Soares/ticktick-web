import { X } from 'lucide-react'
import { useState } from 'react'

interface PomodoroSettingsModalProps {
    onClose: () => void
}

export default function PomodoroSettingsModal({ onClose }: PomodoroSettingsModalProps) {
    // Local state for settings (mocked for UI demonstration as per request)
    const [pomoDuration, setPomoDuration] = useState(25)
    const [shortBreak, setShortBreak] = useState(5)
    const [longBreak, setLongBreak] = useState(15)
    const [longBreakInterval, setLongBreakInterval] = useState(4)

    const [autoStartPomo, setAutoStartPomo] = useState(false)
    const [autoStartBreak, setAutoStartBreak] = useState(false)
    const [soundEnabled, setSoundEnabled] = useState(true)

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 p-4">
            <div className="w-full max-w-sm bg-bg-secondary rounded-2xl shadow-2xl border border-border overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border/50">
                    <h2 className="text-lg font-bold text-text">Focus Settings</h2>
                    <button
                        onClick={onClose}
                        className="p-1 text-zinc-500 hover:text-text hover:bg-bg-tertiary rounded-lg transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-8 max-h-[80vh] overflow-y-auto custom-scrollbar">
                    {/* Timer Option */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-text">Timer Option</h3>

                        <div className="space-y-3 p-4 bg-bg-tertiary/30 rounded-xl">
                            <SettingInput
                                label="Pomo Duration"
                                value={pomoDuration}
                                onChange={setPomoDuration}
                                unit="Minutes"
                            />
                            <SettingInput
                                label="Short Break Duration"
                                value={shortBreak}
                                onChange={setShortBreak}
                                unit="Minutes"
                            />
                            <SettingInput
                                label="Long Break Duration"
                                value={longBreak}
                                onChange={setLongBreak}
                                unit="Minutes"
                            />
                            <SettingInput
                                label="Pomos per long break"
                                value={longBreakInterval}
                                onChange={setLongBreakInterval}
                                unit="Pomo"
                            />
                        </div>
                    </div>

                    {/* Auto-Start */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-text">Auto-Start</h3>

                        <div className="space-y-1 p-4 bg-bg-tertiary/30 rounded-xl">
                            <SettingToggle
                                label="Next Pomo"
                                checked={autoStartPomo}
                                onChange={setAutoStartPomo}
                            />
                            <SettingToggle
                                label="Break"
                                checked={autoStartBreak}
                                onChange={setAutoStartBreak}
                            />
                        </div>
                    </div>

                    {/* Pomo Sound */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-text">Pomo Sound</h3>

                        <div className="p-4 bg-bg-tertiary/30 rounded-xl">
                            <SettingToggle
                                label="Pomo Sound"
                                checked={soundEnabled}
                                onChange={setSoundEnabled}
                            />
                        </div>
                    </div>
                </div>

                {/* Footer (Optional, mostly for explicit save if needed, but per screenshot just X works usually or auto-save) */}
                {/* We'll stick to the screenshot design which implies a simple modal, likely auto-save or just view for now */}
            </div>
        </div>
    )
}

// Subcomponents for cleaner code
function SettingInput({ label, value, onChange, unit }: { label: string, value: number, onChange: (v: number) => void, unit: string }) {
    return (
        <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-400">{label}</span>
            <div className="flex items-center gap-2">
                <input
                    type="number"
                    value={value}
                    onChange={(e) => onChange(Number(e.target.value))}
                    className="w-16 px-2 py-1 text-sm bg-bg-secondary border border-border rounded-lg text-text focus:border-primary focus:outline-none text-right transition-colors"
                />
                <span className="text-sm text-zinc-500 w-12">{unit}</span>
            </div>
        </div>
    )
}

function SettingToggle({ label, checked, onChange }: { label: string, checked: boolean, onChange: (v: boolean) => void }) {
    return (
        <div className="flex items-center justify-between py-2">
            <span className="text-sm text-zinc-400">{label}</span>
            <button
                onClick={() => onChange(!checked)}
                className={`w-11 h-6 rounded-full transition-colors relative ${checked ? 'bg-primary' : 'bg-zinc-700'
                    }`}
            >
                <div
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${checked ? 'left-6' : 'left-1'
                        }`}
                />
            </button>
        </div>
    )
}
