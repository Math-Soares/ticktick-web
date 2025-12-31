import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { api } from '../api/client'
import { AxiosError } from 'axios'

interface User {
    id: string
    email: string
    name?: string
}

interface AuthState {
    token: string | null
    user: User | null
    isAuthenticated: boolean
    isLoading: boolean
    error: string | null

    login: (email: string, password: string) => Promise<void>
    register: (email: string, password: string, name: string) => Promise<void>
    logout: () => void
    deleteAccount: () => Promise<void>
    clearError: () => void
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            token: null,
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,

            login: async (email, password) => {
                set({ isLoading: true, error: null })
                try {
                    const response = await api.post('/auth/login', { email, password })
                    const { accessToken, user } = response.data

                    set({
                        token: accessToken,
                        user,
                        isAuthenticated: true,
                        isLoading: false,
                    })
                } catch (error) {
                    const err = error as AxiosError<{ message: string }>;
                    set({
                        error: err.response?.data?.message || 'Login failed',
                        isLoading: false,
                    })
                    throw error
                }
            },

            register: async (email, password, name) => {
                set({ isLoading: true, error: null })
                try {
                    const response = await api.post('/auth/register', { email, password, name })
                    const { accessToken, user } = response.data

                    set({
                        token: accessToken,
                        user,
                        isAuthenticated: true,
                        isLoading: false,
                    })
                } catch (error) {
                    const err = error as AxiosError<{ message: string }>;
                    set({
                        error: err.response?.data?.message || 'Registration failed',
                        isLoading: false,
                    })
                    throw error
                }
            },

            logout: () => {
                set({
                    token: null,
                    user: null,
                    isAuthenticated: false,
                })
            },

            deleteAccount: async () => {
                set({ isLoading: true, error: null })
                try {
                    await api.delete('/auth/account')
                    set({
                        token: null,
                        user: null,
                        isAuthenticated: false,
                        isLoading: false,
                    })
                } catch (error) {
                    const err = error as AxiosError<{ message: string }>;
                    set({
                        error: err.response?.data?.message || 'Failed to delete account',
                        isLoading: false,
                    })
                    throw error
                }
            },

            clearError: () => set({ error: null }),
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({
                token: state.token,
                user: state.user,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
)
