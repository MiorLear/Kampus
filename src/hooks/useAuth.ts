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
          // Get user profile from Firestore
          const userProfile = await AuthService.getUserProfile(firebaseUser.uid);
          setUser(userProfile);
          setFirebaseUser(firebaseUser);
        } catch (err: any) {
          console.error('Error fetching user profile:', err);
          setError(err.message || 'Error loading user profile');
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
