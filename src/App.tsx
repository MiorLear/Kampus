import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useAuth } from './hooks/useAuth';
import { Toaster } from './components/ui/sonner';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProfilePage } from './pages/ProfilePage';

function AppRoutes() {
  const { user, logout } = useAuth();

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background">
        {user && <Navigation user={user} onLogout={logout} />}
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          
          {/* Student Routes */}
          <Route
            path="/mycourses"
            element={
              <ProtectedRoute requiredRole="student">
                <DashboardPage defaultTab="courses" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/assignments"
            element={
              <ProtectedRoute requiredRole="student">
                <DashboardPage defaultTab="assignments" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/browse"
            element={
              <ProtectedRoute requiredRole="student">
                <DashboardPage defaultTab="browse" />
              </ProtectedRoute>
            }
          />
          
          {/* Admin Routes */}
          <Route
            path="/admin/overview"
            element={
              <ProtectedRoute requiredRole="admin">
                <DashboardPage defaultTab="overview" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute requiredRole="admin">
                <DashboardPage defaultTab="users" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/courses"
            element={
              <ProtectedRoute requiredRole="admin">
                <DashboardPage defaultTab="courses" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/assignments"
            element={
              <ProtectedRoute requiredRole="admin">
                <DashboardPage defaultTab="assignments" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/enrollments"
            element={
              <ProtectedRoute requiredRole="admin">
                <DashboardPage defaultTab="enrollments" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/messages"
            element={
              <ProtectedRoute requiredRole="admin">
                <DashboardPage defaultTab="messages" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/activity"
            element={
              <ProtectedRoute requiredRole="admin">
                <DashboardPage defaultTab="activity" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <ProtectedRoute requiredRole="admin">
                <DashboardPage defaultTab="reports" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <ProtectedRoute requiredRole="admin">
                <DashboardPage defaultTab="settings" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="admin">
                <Navigate to="/admin/overview" replace />
              </ProtectedRoute>
            }
          />
          
          {/* Teacher Routes */}
          <Route
            path="/teacher/courses"
            element={
              <ProtectedRoute requiredRole="teacher">
                <DashboardPage defaultTab="courses" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/assignments"
            element={
              <ProtectedRoute requiredRole="teacher">
                <DashboardPage defaultTab="assignments" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/students"
            element={
              <ProtectedRoute requiredRole="teacher">
                <DashboardPage defaultTab="students" />
              </ProtectedRoute>
            }
          />
          
          {/* Generic Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
        <Toaster />
      </div>
    </BrowserRouter>
  );
}

export default AppRoutes;
