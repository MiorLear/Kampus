import React, { useState, useEffect } from 'react';
import { AuthPage } from './components/auth/AuthPage';
import { StudentDashboard } from './components/student/StudentDashboard';
import { TeacherDashboard } from './components/teacher/TeacherDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { Navigation } from './components/Navigation';

type UserRole = 'student' | 'teacher' | 'admin';
type AuthState = 'login' | 'register' | 'forgot-password' | 'email-verification';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authState, setAuthState] = useState<AuthState>('login');

  // Mock authentication - replace with real auth later
  const handleLogin = (email: string, password: string, role?: UserRole) => {
    // Mock user creation
    const user: User = {
      id: '1',
      name: email.split('@')[0],
      email,
      role: role || 'student',
    };
    setCurrentUser(user);
    setIsAuthenticated(true);
  };

  const handleRegister = (name: string, email: string, password: string) => {
    const user: User = {
      id: '1',
      name,
      email,
      role: 'student',
    };
    setCurrentUser(user);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    setAuthState('login');
  };

  if (!isAuthenticated) {
    return (
      <AuthPage
        authState={authState}
        onAuthStateChange={setAuthState}
        onLogin={handleLogin}
        onRegister={handleRegister}
      />
    );
  }

  const renderDashboard = () => {
    if (!currentUser) return null;

    switch (currentUser.role) {
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