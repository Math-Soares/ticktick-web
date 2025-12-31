import { useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuthStore } from '../stores/authStore'
import { useTaskStore } from '../stores/taskStore'

export function useTaskSocket() {
    const socketRef = useRef<Socket | null>(null)
    const token = useAuthStore((state) => state.token)
    const {
        handleTaskCreated,
        handleTaskUpdated,
        handleTaskCompleted,
        handleTaskDeleted,
    } = useTaskStore()

    useEffect(() => {
        if (!token) return

        // Connect to WebSocket
        const socketUrl = import.meta.env.VITE_SOCKET_URL || ''
        const socket = io(`${socketUrl}/tasks`, {
            auth: { token },
        })

        socket.on('connect', () => {
            // Connected
        })

        socket.on('disconnect', () => {
            // Disconnected
        })


        // Listen for task events
        socket.on('task:created', handleTaskCreated)
        socket.on('task:updated', handleTaskUpdated)
        socket.on('task:completed', handleTaskCompleted)
        socket.on('task:deleted', handleTaskDeleted)
        socket.on('task:moved', handleTaskUpdated)
        socket.on('task:reordered', handleTaskUpdated)

        socketRef.current = socket

        return () => {
            socket.disconnect()
        }
    }, [token, handleTaskCreated, handleTaskUpdated, handleTaskCompleted, handleTaskDeleted])

    return socketRef.current
}
