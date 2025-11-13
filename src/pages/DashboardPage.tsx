import { Suspense, lazy } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Loader2 } from 'lucide-react';
import { InitializeData } from '../components/InitializeData';
import { useState, useEffect } from 'react';

const StudentDashboard = lazy(() => import('../components/student/StudentDashboard').then(module => ({ default: module.StudentDashboard })));
const TeacherDashboard = lazy(() => import('../components/teacher/TeacherDashboard').then(module => ({ default: module.TeacherDashboard })));
const AdminDashboard = lazy(() => import('../components/admin/AdminDashboard'));

interface DashboardPageProps {
  defaultTab?: string;
}

export function DashboardPage({ defaultTab }: DashboardPageProps = {}) {
  const { user } = useAuth();
  const [showInitialize, setShowInitialize] = useState(false);

  useEffect(() => {
    if (user) {
      const hasInitialized = localStorage.getItem(`initialized_${user.id}`);
      if (!hasInitialized && (user.role === 'teacher' || user.role === 'admin')) {
        setShowInitialize(true);
      }
    }
  }, [user]);

  if (!user) return null;

  const renderDashboard = () => {
    const DashboardComponent = () => {
      switch (user.role) {
        case 'student':
          return <StudentDashboard user={user} defaultTab={defaultTab} />;
        case 'teacher':
          return <TeacherDashboard user={user} defaultTab={defaultTab} />;
        case 'admin':
          return <AdminDashboard user={user} defaultTab={defaultTab} />;
        default:
          return <StudentDashboard user={user} defaultTab={defaultTab} />;
      }
    };

    return (
      <Suspense fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      }>
        <DashboardComponent />
      </Suspense>
    );
  };

  const handleInitializeComplete = () => {
    if (user) {
      localStorage.setItem(`initialized_${user.id}`, 'true');
    }
    setShowInitialize(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="pt-16 px-4 sm:px-6 lg:px-8">
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
    </div>
  );
}

