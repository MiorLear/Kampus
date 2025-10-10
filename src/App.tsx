  import React, { useState, useEffect } from 'react';
  import { AuthPage } from './components/auth/AuthPage';
  import { StudentDashboard } from './components/student/StudentDashboard';
  import { TeacherDashboard } from './components/teacher/TeacherDashboard';
  import { AdminDashboard } from './components/admin/AdminDashboard';
  import { Navigation } from './components/Navigation';
  import { InitializeData } from './components/InitializeData';
  import { useAuth } from './hooks/useAuth';
  import { Toaster } from './components/ui/sonner';
  import { Loader2 } from 'lucide-react';
  
  type AuthState = 'login' | 'register' | 'forgot-password' | 'email-verification';
  
  export default function App() {
    const { user, loading, logout } = useAuth();
    const [authState, setAuthState] = useState<AuthState>('login');
    const [showInitialize, setShowInitialize] = useState(false);
  
    // Check if this is a new user (you can implement your own logic here)
    useEffect(() => {
      if (user) {
        // Check localStorage to see if we've already shown the initialize dialog
        const hasInitialized = localStorage.getItem(`initialized_${user.id}`);
        if (!hasInitialized && (user.role === 'teacher' || user.role === 'admin')) {
          setShowInitialize(true);
        }
      }
    }, [user]);
  
    if (loading) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      );
    }
  
    if (!user) {
      return (
        <>
          <AuthPage
            authState={authState}
            onAuthStateChange={setAuthState}
          />
          <Toaster />
        </>
      );
    }
  
    const handleInitializeComplete = () => {
      if (user) {
        localStorage.setItem(`initialized_${user.id}`, 'true');
      }
      setShowInitialize(false);
    };
  
    const renderDashboard = () => {
      switch (user.role) {
        case 'student':
          return <StudentDashboard user={user} />;
        case 'teacher':
          return <TeacherDashboard user={user} />;
        case 'admin':
          return <AdminDashboard user={user} />;
        default:
          return <StudentDashboard user={user} />;
      }
    };
  
    return (
      <div className="min-h-screen bg-background">
        <Navigation user={user} onLogout={logout} />
        <main className="pt-16">
          {renderDashboard()}
        </main>
        {showInitialize && user && (
          <InitializeData
            userId={user.id}
            userName={user.name}
            userRole={user.role}
            onComplete={handleInitializeComplete}
          />
        )}
        <Toaster />
      </div>
    );
  }