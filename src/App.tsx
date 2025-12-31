import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import Layout from './components/layout/Layout'
import CommandMenu from './components/layout/CommandMenu'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import TasksPage from './pages/TasksPage'
import CalendarPage from './pages/CalendarPage'
import HabitsPage from './pages/HabitsPage'
import MatrixPage from './pages/MatrixPage'
import PomodoroPage from './pages/PomodoroPage'
import StatsPage from './pages/StatsPage'
import AIPage from './pages/AIPage'

function PublicRoute({ children }: { children: React.ReactNode }) {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

    if (isAuthenticated) {
        return <Navigate to="/tasks" replace />
    }

    return <>{children}</>
}

function PrivateRoute({ children }: { children: React.ReactNode }) {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />
    }

    return <>{children}</>
}

function App() {
    return (
        <Routes>
            <Route
                path="/login"
                element={
                    <PublicRoute>
                        <LoginPage />
                    </PublicRoute>
                }
            />
            <Route
                path="/register"
                element={
                    <PublicRoute>
                        <RegisterPage />
                    </PublicRoute>
                }
            />
            <Route
                path="/*"
                element={
                    <PrivateRoute>
                        <Layout>
                            <CommandMenu />
                            <Routes>
                                <Route path="/" element={<Navigate to="/tasks" replace />} />
                                <Route path="/tasks" element={<TasksPage />} />
                                <Route path="/tasks/:listId" element={<TasksPage />} />
                                <Route path="/calendar" element={<CalendarPage />} />
                                <Route path="/pomodoro" element={<PomodoroPage />} />
                                <Route path="/habits" element={<HabitsPage />} />
                                <Route path="/matrix" element={<MatrixPage />} />
                                <Route path="/stats" element={<StatsPage />} />
                                <Route path="/ai" element={<AIPage />} />
                            </Routes>
                        </Layout>
                    </PrivateRoute>
                }
            />
        </Routes>
    )
}

export default App
