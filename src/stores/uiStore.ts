import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface UIState {
    sidebarOpen: boolean
    quickAddOpen: boolean
    selectedTaskId: string | null
    theme: 'dark' | 'light'

    toggleSidebar: () => void
    setSidebarOpen: (open: boolean) => void
    toggleQuickAdd: () => void
    setQuickAddOpen: (open: boolean) => void
    createHabitOpen: boolean
    toggleCreateHabit: () => void
    setCreateHabitOpen: (open: boolean) => void
    setSelectedTask: (id: string | null) => void
    setTheme: (theme: 'dark' | 'light') => void
}

export const useUIStore = create<UIState>()(
    devtools(
        (set) => ({
            sidebarOpen: true,
            quickAddOpen: false,
            createHabitOpen: false,
            selectedTaskId: null,
            theme: 'dark',

            toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
            setSidebarOpen: (open) => set({ sidebarOpen: open }),
            toggleQuickAdd: () => set((state) => ({ quickAddOpen: !state.quickAddOpen })),
            setQuickAddOpen: (open) => set({ quickAddOpen: open }),
            toggleCreateHabit: () => set((state) => ({ createHabitOpen: !state.createHabitOpen })),
            setCreateHabitOpen: (open) => set({ createHabitOpen: open }),
            setSelectedTask: (id) => set({ selectedTaskId: id }),
            setTheme: (theme) => set({ theme }),
        }),
        { name: 'ui-store' }
    )
)
