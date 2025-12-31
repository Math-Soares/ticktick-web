import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { api } from '../api/client'

export interface List {
    id: string
    name: string
    color: string
    icon?: string
    position: number
    _count?: {
        tasks: number
    }
}

interface ListState {
    lists: List[]
    activeListId: string | null
    isLoading: boolean

    fetchLists: () => Promise<void>
    createList: (data: { name: string; color?: string; icon?: string }) => Promise<List>
    updateList: (id: string, data: Partial<List>) => Promise<void>
    deleteList: (id: string) => Promise<void>
    setActiveList: (id: string | null) => void
}

export const useListStore = create<ListState>()(
    devtools(
        (set) => ({
            lists: [],
            activeListId: null,
            isLoading: false,

            fetchLists: async () => {
                set({ isLoading: true })
                try {
                    const response = await api.get('/lists')
                    set({ lists: response.data, isLoading: false })
                } catch {
                    set({ isLoading: false })
                }
            },

            createList: async (data) => {
                const response = await api.post('/lists', data)
                const list = response.data
                set((state) => ({ lists: [...state.lists, list] }))
                return list
            },

            updateList: async (id, data) => {
                await api.put(`/lists/${id}`, data)
                set((state) => ({
                    lists: state.lists.map((l) => (l.id === id ? { ...l, ...data } : l)),
                }))
            },

            deleteList: async (id) => {
                await api.delete(`/lists/${id}`)
                set((state) => ({
                    lists: state.lists.filter((l) => l.id !== id),
                    activeListId: state.activeListId === id ? null : state.activeListId,
                }))
            },

            setActiveList: (id) => set({ activeListId: id }),
        }),
        { name: 'list-store' }
    )
)
