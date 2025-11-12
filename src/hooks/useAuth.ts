import { useState, useEffect } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from '../config/firebase';
import { AuthService, UserProfile } from '../services/auth.service';

export function useAuth() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      setError(null);

      if (firebaseUser) {
        try {
          // Retry logic to get user profile from Firestore
          // This handles cases where the profile might not be immediately available after registration
          let userProfile = await AuthService.getUserProfile(firebaseUser.uid);
          let retries = 0;
          const maxRetries = 5;
          const retryDelay = 300; // 300ms

          // If profile not found, retry a few times (helps with registration timing)
          while (!userProfile && retries < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, retryDelay));
            userProfile = await AuthService.getUserProfile(firebaseUser.uid);
            retries++;
          }

          // If profile still doesn't exist after retries, create a basic one
          if (!userProfile && firebaseUser) {
            console.warn('User profile not found, creating basic profile');
            const basicProfile = {
              id: firebaseUser.uid,
              name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
              email: firebaseUser.email || '',
              role: 'student' as const,
              created_at: new Date().toISOString(),
            };
            
            try {
              await AuthService.updateUserProfile(firebaseUser.uid, basicProfile);
              userProfile = basicProfile;
            } catch (updateError) {
              console.error('Error creating basic profile:', updateError);
            }
          }

          if (userProfile) {
            setUser(userProfile);
            setFirebaseUser(firebaseUser);
          } else {
            console.error('Could not load user profile after retries');
            setError('Error loading user profile');
            setUser(null);
            setFirebaseUser(null);
          }
        } catch (err: any) {
          console.error('Error fetching user profile:', err);
          setError(err.message || 'Error loading user profile');
          // Clear user on error to prevent stale state
          setUser(null);
          setFirebaseUser(null);
        }
      } else {
        setUser(null);
        setFirebaseUser(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const register = async (email: string, password: string, name: string, role?: 'student' | 'teacher' | 'admin') => {
    try {
      setError(null);
      const userProfile = await AuthService.register(email, password, name, role);
      return userProfile;
    } catch (err: any) {
      setError(err.message || 'Registration failed');
      throw err;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      const userProfile = await AuthService.login(email, password);
      return userProfile;
    } catch (err: any) {
      setError(err.message || 'Login failed');
      throw err;
    }
  };

  const logout = async () => {
    try {
      setError(null);
      await AuthService.logout();
    } catch (err: any) {
      setError(err.message || 'Logout failed');
      throw err;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setError(null);
      await AuthService.resetPassword(email);
    } catch (err: any) {
      setError(err.message || 'Password reset failed');
      throw err;
    }
  };

  return {
    user,
    firebaseUser,
    loading,
    error,
    register,
    login,
    logout,
    resetPassword,
    isAuthenticated: !!user,
  };
}
