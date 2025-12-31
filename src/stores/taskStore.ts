import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { api } from '../api/client'
import { AxiosError } from 'axios'
import { useListStore } from './listStore'

export interface Attachment {
    id: string
    filename: string
    mimeType: string
    size: number
    createdAt: string
}

export interface Task {
    id: string
    title: string
    description?: string
    priority: number
    dueDate?: string
    dueTime?: string
    endTime?: string
    completedAt?: string
    recurrenceRule?: string
    listId?: string
    estimatedPomos: number
    completedPomos: number
    tags: string
    deletedAt?: string
    attachments?: Attachment[]
    list?: {
        id: string
        name: string
        color: string
    }
}

interface TaskState {
    tasks: Task[]
    trashTasks: Task[]
    completedTasks: Task[]
    isLoading: boolean
    error: string | null

    fetchTasks: () => Promise<void>
    fetchByList: (listId: string) => Promise<void>
    fetchCompleted: () => Promise<void>
    fetchTrash: () => Promise<void>
    quickAdd: (input: string, listId?: string) => Promise<Task>
    createTask: (data: Partial<Task>) => Promise<Task>
    updateTask: (id: string, data: Partial<Task>) => Promise<void>
    completeTask: (id: string) => Promise<void>
    uncompleteTask: (id: string) => Promise<void>
    deleteTask: (id: string) => Promise<void>
    restoreTask: (id: string) => Promise<void>
    permanentDeleteTask: (id: string) => Promise<void>
    clearTrash: () => Promise<void>
    moveToList: (taskId: string, listId: string | null) => Promise<void>

    // Attachment methods
    uploadAttachment: (taskId: string, file: File) => Promise<Attachment>
    deleteAttachment: (taskId: string, attachmentId: string) => Promise<void>
    fetchAttachments: (taskId: string) => Promise<Attachment[]>

    // Real-time handlers
    handleTaskCreated: (task: Task) => void
    handleTaskUpdated: (task: Task) => void
    handleTaskCompleted: (task: Task) => void
    handleTaskDeleted: (data: { id: string }) => void
}

export const useTaskStore = create<TaskState>()(
    devtools(
        (set) => ({
            tasks: [],
            trashTasks: [],
            completedTasks: [],
            isLoading: false,
            error: null,

            fetchTasks: async () => {
                set({ isLoading: true, error: null })
                try {
                    const response = await api.get('/tasks')
                    set({ tasks: response.data, isLoading: false })
                } catch (error) {
                    const err = error as AxiosError<{ message: string }>;
                    set({ error: err.message, isLoading: false })
                }
            },

            fetchByList: async (listId) => {
                set({ isLoading: true, error: null })
                try {
                    const response = await api.get(`/tasks/list/${listId}`)
                    set({ tasks: response.data, isLoading: false })
                } catch (error) {
                    const err = error as AxiosError<{ message: string }>;
                    set({ error: err.message, isLoading: false })
                }
            },

            fetchCompleted: async () => {
                set({ isLoading: true, error: null })
                try {
                    const response = await api.get('/tasks/completed')
                    set({ completedTasks: response.data, isLoading: false })
                } catch (error) {
                    const err = error as AxiosError<{ message: string }>;
                    set({ error: err.message, isLoading: false })
                }
            },

            fetchTrash: async () => {
                set({ isLoading: true, error: null })
                try {
                    const response = await api.get('/tasks/trash')
                    set({ trashTasks: response.data, isLoading: false })
                } catch (error) {
                    const err = error as AxiosError<{ message: string }>;
                    set({ error: err.message, isLoading: false })
                }
            },

            quickAdd: async (input, listId) => {
                const response = await api.post('/tasks/quick-add', { input, listId })
                const newTask = response.data
                set((state) => ({
                    tasks: [newTask, ...state.tasks.filter(t => t.id !== newTask.id)]
                }))
                useListStore.getState().fetchLists()
                return newTask
            },

            createTask: async (data) => {
                const response = await api.post('/tasks', data)
                const newTask = response.data
                set((state) => ({
                    tasks: [newTask, ...state.tasks.filter(t => t.id !== newTask.id)]
                }))
                useListStore.getState().fetchLists()
                return newTask
            },

            updateTask: async (id, data) => {
                await api.put(`/tasks/${id}`, data)
                set((state) => ({
                    tasks: state.tasks.map((t) =>
                        t.id === id ? { ...t, ...data } : t
                    ),
                    trashTasks: state.trashTasks.map((t) =>
                        t.id === id ? { ...t, ...data } : t
                    ),
                    completedTasks: state.completedTasks.map((t) =>
                        t.id === id ? { ...t, ...data } : t
                    ),
                }))
                useListStore.getState().fetchLists()
            },

            completeTask: async (id) => {
                await api.post(`/tasks/${id}/complete`)
                set((state) => {
                    const task = state.tasks.find(t => t.id === id) || state.completedTasks.find(t => t.id === id)
                    const updatedTask = task ? { ...task, completedAt: new Date().toISOString() } : null

                    return {
                        tasks: state.tasks.map((t) =>
                            t.id === id ? { ...t, completedAt: new Date().toISOString() } : t
                        ),
                        completedTasks: updatedTask
                            ? [updatedTask, ...state.completedTasks.filter(t => t.id !== id)]
                            : state.completedTasks
                    }
                })
                useListStore.getState().fetchLists()
            },

            uncompleteTask: async (id) => {
                await api.post(`/tasks/${id}/uncomplete`)
                set((state) => ({
                    tasks: state.tasks.map((t) =>
                        t.id === id ? { ...t, completedAt: undefined } : t
                    ),
                    completedTasks: state.completedTasks.filter(t => t.id !== id)
                }))
                useListStore.getState().fetchLists()
            },

            deleteTask: async (id) => {
                await api.delete(`/tasks/${id}`)
                set((state) => {
                    const taskToDelete = state.tasks.find(t => t.id === id) || state.completedTasks.find(t => t.id === id)
                    return {
                        tasks: state.tasks.filter((t) => t.id !== id),
                        completedTasks: state.completedTasks.filter((t) => t.id !== id),
                        trashTasks: taskToDelete
                            ? [{ ...taskToDelete, deletedAt: new Date().toISOString() }, ...state.trashTasks]
                            : state.trashTasks
                    }
                })
                useListStore.getState().fetchLists()
            },

            restoreTask: async (id) => {
                await api.post(`/tasks/${id}/restore`)
                set((state) => {
                    const taskToRestore = state.trashTasks.find(t => t.id === id)
                    return {
                        trashTasks: state.trashTasks.filter((t) => t.id !== id),
                        tasks: taskToRestore
                            ? [{ ...taskToRestore, deletedAt: undefined }, ...state.tasks]
                            : state.tasks
                    }
                })
                useListStore.getState().fetchLists()
            },

            permanentDeleteTask: async (id) => {
                await api.delete(`/tasks/${id}/permanent`)
                set((state) => ({
                    tasks: state.tasks.filter((t) => t.id !== id),
                    trashTasks: state.trashTasks.filter((t) => t.id !== id),
                    completedTasks: state.completedTasks.filter((t) => t.id !== id),
                }))
                useListStore.getState().fetchLists()
            },

            clearTrash: async () => {
                await api.delete('/tasks/trash/clear')
                set({ trashTasks: [] })
                useListStore.getState().fetchLists()
            },

            moveToList: async (taskId, listId) => {
                await api.put(`/tasks/${taskId}/move`, { listId })
                set((state) => ({
                    tasks: state.tasks.map((t) =>
                        t.id === taskId ? { ...t, listId: listId || undefined } : t
                    ),
                    completedTasks: state.completedTasks.map((t) =>
                        t.id === taskId ? { ...t, listId: listId || undefined } : t
                    ),
                }))
                useListStore.getState().fetchLists()
            },

            uploadAttachment: async (taskId, file) => {
                const formData = new FormData()
                formData.append('file', file)
                const response = await api.post(`/tasks/${taskId}/attachments`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                })
                const attachment = response.data
                set((state) => ({
                    tasks: state.tasks.map((t) =>
                        t.id === taskId
                            ? { ...t, attachments: [...(t.attachments || []), attachment] }
                            : t
                    ),
                }))
                return attachment
            },

            deleteAttachment: async (taskId, attachmentId) => {
                await api.delete(`/attachments/${attachmentId}`)
                set((state) => ({
                    tasks: state.tasks.map((t) =>
                        t.id === taskId
                            ? { ...t, attachments: (t.attachments || []).filter(a => a.id !== attachmentId) }
                            : t
                    ),
                }))
            },

            fetchAttachments: async (taskId) => {
                const response = await api.get(`/tasks/${taskId}/attachments`)
                const attachments = response.data
                set((state) => ({
                    tasks: state.tasks.map((t) =>
                        t.id === taskId ? { ...t, attachments } : t
                    ),
                }))
                return attachments
            },

            handleTaskCreated: (task) => {
                useListStore.getState().fetchLists()
                set((state) => {
                    const exists = state.tasks.some((t) => t.id === task.id)
                    if (exists) return {
                        tasks: state.tasks.map(t => t.id === task.id ? task : t)
                    }
                    if (task.completedAt) {
                        return {
                            tasks: [task, ...state.tasks],
                            completedTasks: [task, ...state.completedTasks.filter(t => t.id !== task.id)]
                        }
                    }
                    return { tasks: [task, ...state.tasks] }
                })
            },

            handleTaskUpdated: (task) => {
                useListStore.getState().fetchLists()
                set((state) => {
                    if (task.deletedAt) {
                        return {
                            tasks: state.tasks.filter(t => t.id !== task.id),
                            completedTasks: state.completedTasks.filter(t => t.id !== task.id),
                            trashTasks: [task, ...state.trashTasks.filter(t => t.id !== task.id)]
                        }
                    } else if (task.completedAt) {
                        return {
                            tasks: [task, ...state.tasks.filter(t => t.id !== task.id)],
                            completedTasks: [task, ...state.completedTasks.filter(t => t.id !== task.id)],
                            trashTasks: state.trashTasks.filter(t => t.id !== task.id)
                        }
                    } else {
                        return {
                            tasks: [task, ...state.tasks.filter(t => t.id !== task.id)],
                            completedTasks: state.completedTasks.filter(t => t.id !== task.id),
                            trashTasks: state.trashTasks.filter(t => t.id !== task.id)
                        }
                    }
                })
            },

            handleTaskCompleted: (task) => {
                useListStore.getState().fetchLists()
                set((state) => ({
                    tasks: state.tasks.map((t) => (t.id === task.id ? task : t)),
                    completedTasks: [task, ...state.completedTasks.filter(t => t.id !== task.id)],
                    trashTasks: state.trashTasks.map((t) => (t.id === task.id ? task : t)),
                }))
            },

            handleTaskDeleted: ({ id }) => {
                useListStore.getState().fetchLists()
                set((state) => ({
                    tasks: state.tasks.filter((t) => t.id !== id),
                    trashTasks: state.trashTasks.filter((t) => t.id !== id),
                    completedTasks: state.completedTasks.filter((t) => t.id !== id),
                }))
            },
        }),
        { name: 'task-store' }
    )
)
