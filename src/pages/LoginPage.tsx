import { Navigate, useLocation } from 'react-router-dom';
import { AuthPage } from '../components/auth/AuthPage';
import { useAuth } from '../hooks/useAuth';
import { Toaster } from '../components/ui/sonner';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';

export function LoginPage() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [authState, setAuthState] = useState<'login' | 'register' | 'forgot-password' | 'email-verification'>('login');

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

  // If user is already logged in, redirect to appropriate dashboard based on role
  if (user) {
    const from = (location.state as any)?.from?.pathname;
    if (from) {
      return <Navigate to={from} replace />;
    }
    // Redirect based on role
    const roleBasedPath = 
      user.role === 'admin' ? '/admin/overview' :
      user.role === 'teacher' ? '/teacher/courses' :
      '/dashboard';
    return <Navigate to={roleBasedPath} replace />;
  }

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

