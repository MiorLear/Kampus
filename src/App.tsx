import React from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AuthPage } from './components/auth/AuthPage';
import { StudentDashboard } from './components/student/StudentDashboard';
import { TeacherDashboard } from './components/teacher/TeacherDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { Navigation } from './components/Navigation';
import { logout } from './services/auth';
import type { Role } from './lib/types';

type AuthState = 'login' | 'register' | 'forgot-password' | 'email-verification' | 'password-reset-sent';

interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
}

function AppContent() {
  const { user, role, loading } = useAuth();
  const [authState, setAuthState] = React.useState<AuthState>('login');

  const handleLogout = async () => {
    try {
      await logout();
      setAuthState('login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <AuthPage
        authState={authState}
        onAuthStateChange={setAuthState}
      />
    );
  }

  // Create user object for dashboard components
  const currentUser: User = {
    id: user.uid,
    name: user.displayName || user.email?.split('@')[0] || 'User',
    email: user.email || '',
    role: role || 'student',
    avatar: user.photoURL || undefined,
  };

  const renderDashboard = () => {
    switch (role) {
      case 'student':
        return <StudentDashboard user={currentUser} />;
      case 'teacher':
        return <TeacherDashboard user={currentUser} />;
      case 'admin':
        return <AdminDashboard user={currentUser} />;
      default:
        return <StudentDashboard user={currentUser} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation user={currentUser} onLogout={handleLogout} />
      <main className="pt-16">
        {renderDashboard()}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}