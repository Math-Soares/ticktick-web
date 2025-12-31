import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { api } from '../api/client'
import { AxiosError } from 'axios'

export interface Habit {
    id: string
    name: string
    description?: string
    icon: string
    color: string
    frequency: string
    targetDays: string
    targetCount: number
    currentStreak: number
    longestStreak: number
    logs?: HabitLog[]
}

export interface HabitLog {
    id: string
    habitId: string
    date: string
    count: number
    notes?: string
}

interface HabitState {
    habits: Habit[]
    isLoading: boolean
    error: string | null

    fetchHabits: () => Promise<void>
    createHabit: (data: Partial<Habit>) => Promise<Habit>
    updateHabit: (id: string, data: Partial<Habit>) => Promise<void>
    deleteHabit: (id: string) => Promise<void>
    logCompletion: (habitId: string, date?: string, notes?: string) => Promise<void>
    removeLog: (habitId: string, date: string) => Promise<void>
}

export const useHabitStore = create<HabitState>()(
    devtools(
        (set) => ({
            habits: [],
            isLoading: false,
            error: null,

            fetchHabits: async () => {
                set({ isLoading: true, error: null })
                try {
                    const response = await api.get('/habits')
                    set({ habits: response.data, isLoading: false })
                } catch (error) {
                    const err = error as AxiosError<{ message: string }>;
                    set({ error: err.message, isLoading: false })
                }
            },

            createHabit: async (data) => {
                set({ isLoading: true, error: null })
                try {
                    const response = await api.post('/habits', data)
                    const habit = response.data
                    set((state) => ({ habits: [...state.habits, habit], isLoading: false }))
                    return habit
                } catch (error) {
                    const err = error as AxiosError<{ message: string }>;
                    set({ error: err.message, isLoading: false })
                    throw error
                }
            },

            updateHabit: async (id, data) => {
                try {
                    const response = await api.put(`/habits/${id}`, data)
                    const updatedHabit = response.data
                    set((state) => ({
                        habits: state.habits.map((h) => (h.id === id ? updatedHabit : h)),
                    }))
                } catch (error) {
                    const err = error as AxiosError;
                    set({ error: err.message })
                }
            },

            deleteHabit: async (id) => {
                try {
                    await api.delete(`/habits/${id}`)
                    set((state) => ({
                        habits: state.habits.filter((h) => h.id !== id),
                    }))
                } catch (error) {
                    const err = error as AxiosError;
                    set({ error: err.message })
                }
            },

            logCompletion: async (habitId, date, notes) => {
                try {
                    await api.post(`/habits/${habitId}/log`, { date, notes })
                    // Refresh habits to get updated streaks and logs
                    const response = await api.get('/habits')
                    set({ habits: response.data })
                } catch (error) {
                    const err = error as AxiosError<{ message: string }>;
                    set({ error: err.message })
                }
            },

            removeLog: async (habitId, date) => {
                try {
                    await api.delete(`/habits/${habitId}/log/${date}`)
                    // Refresh habits
                    const response = await api.get('/habits')
                    set({ habits: response.data })
                } catch (error) {
                    const err = error as AxiosError<{ message: string }>;
                    set({ error: err.message })
                }
            },
        }),
        { name: 'habit-store' }
    )
)
