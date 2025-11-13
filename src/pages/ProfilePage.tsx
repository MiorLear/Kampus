import { Suspense, lazy } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const ProfilePageLazy = lazy(() => import('../components/profiles/ProfilePage').then(module => ({ default: module.ProfilePage })));

export function ProfilePage() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <main className="pt-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <Link
              to="/dashboard"
              className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-2 mb-4"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
          </div>
          <Suspense fallback={
            <div className="min-h-[400px] bg-background flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
                <p className="text-muted-foreground">Loading profile...</p>
              </div>
            </div>
          }>
            <ProfilePageLazy userId={user.id} currentUserId={user.id} />
          </Suspense>
        </div>
      </main>
    </div>
  );
}

