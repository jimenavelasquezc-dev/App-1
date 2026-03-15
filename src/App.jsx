import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import { ExceptionsProvider } from './context/ExceptionsContext.jsx'
import { CommissionsProvider } from './context/CommissionsContext.jsx'
import { FiltersProvider } from './context/FiltersContext.jsx'
import ProtectedRoute from './router/ProtectedRoute.jsx'
import AppLayout from './layouts/AppLayout.jsx'
import LoginPage from './pages/LoginPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import ExceptionRequestPage from './pages/ExceptionRequestPage.jsx'
import ExceptionQueuePage from './pages/ExceptionQueuePage.jsx'
import ExceptionDetailPage from './pages/ExceptionDetailPage.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CommissionsProvider>
          <FiltersProvider>
          <ExceptionsProvider>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<DashboardPage />} />
                <Route
                  path="exceptions/new"
                  element={
                    <ProtectedRoute allowedRoles={['rep']}>
                      <ExceptionRequestPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="exceptions"
                  element={
                    <ProtectedRoute allowedRoles={['manager', 'data_person']}>
                      <ExceptionQueuePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="exceptions/:id"
                  element={
                    <ProtectedRoute allowedRoles={['manager', 'data_person']}>
                      <ExceptionDetailPage />
                    </ProtectedRoute>
                  }
                />
              </Route>
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </ExceptionsProvider>
          </FiltersProvider>
        </CommissionsProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
