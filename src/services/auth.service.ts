import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

export type UserRole = 'student' | 'teacher' | 'admin';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  photo_url?: string;
  created_at: string;
}

export class AuthService {
  // Register new user
  static async register(
    email: string,
    password: string,
    name: string,
    role: UserRole = 'student'
  ): Promise<UserProfile> {
    try {
      // Create auth user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update display name
      await updateProfile(user, { displayName: name });

      // Create user profile in Firestore FIRST (before email verification)
      const userProfile: UserProfile = {
        id: user.uid,
        name,
        email,
        role,
        created_at: new Date().toISOString(),
      };

      // Use setDoc to ensure the profile is created (merge ensures it doesn't overwrite if exists)
      await setDoc(doc(db, 'users', user.uid), userProfile, { merge: true });

      // Verify the write completed by reading it back
      const verifyDoc = await getDoc(doc(db, 'users', user.uid));
      if (!verifyDoc.exists()) {
        // Retry if write didn't complete
        await setDoc(doc(db, 'users', user.uid), userProfile);
      }

      // Send verification email (this might take a moment, so we do it after creating the profile)
      try {
        await sendEmailVerification(user);
      } catch (verificationError: any) {
        // If email verification fails, we still want to create the user
        console.warn('Email verification failed:', verificationError);
      }

      return userProfile;
    } catch (error: any) {
      // Handle specific Firebase errors
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('An account with this email already exists');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Invalid email address');
      } else if (error.code === 'auth/weak-password') {
        throw new Error('Password should be at least 6 characters');
      } else if (error.code === 'auth/operation-not-allowed') {
        throw new Error('Email/password accounts are not enabled');
      }
      throw new Error(error.message || 'Error creating account');
    }
  }

  // Login user
  static async login(email: string, password: string): Promise<UserProfile> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Retry logic to get user profile from Firestore (may take a moment after registration)
      let userDoc = await getDoc(doc(db, 'users', user.uid));
      let retries = 0;
      const maxRetries = 5;
      const retryDelay = 500; // 500ms

      while (!userDoc.exists() && retries < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        userDoc = await getDoc(doc(db, 'users', user.uid));
        retries++;
      }

      if (!userDoc.exists()) {
        // If profile still doesn't exist, create it with basic info from Firebase Auth
        console.warn('User profile not found in Firestore, creating basic profile');
        const basicProfile: UserProfile = {
          id: user.uid,
          name: user.displayName || email.split('@')[0],
          email: user.email || email,
          role: 'student', // Default role
          created_at: new Date().toISOString(),
        };

        try {
          await setDoc(doc(db, 'users', user.uid), basicProfile);
          // Verify it was created
          const verifyDoc = await getDoc(doc(db, 'users', user.uid));
          if (verifyDoc.exists()) {
            return verifyDoc.data() as UserProfile;
          }
          return basicProfile;
        } catch (createError: any) {
          console.error('Error creating basic profile:', createError);
          // Return the basic profile anyway - it will be created on next login
          return basicProfile;
        }
      }

      const profileData = userDoc.data() as UserProfile;
      return profileData;
    } catch (error: any) {
      // Handle specific Firebase errors
      if (error.code === 'auth/user-not-found') {
        throw new Error('No account found with this email');
      } else if (error.code === 'auth/wrong-password') {
        throw new Error('Incorrect password');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Invalid email address');
      } else if (error.code === 'auth/too-many-requests') {
        throw new Error('Too many failed attempts. Please try again later');
      } else if (error.code === 'auth/user-disabled') {
        throw new Error('This account has been disabled');
      }
      throw new Error(error.message || 'Error signing in');
    }
  }

  // Logout user
  static async logout(): Promise<void> {
    try {
      // Mark that user is logging out so we can reset view state on next login
      sessionStorage.setItem('wasLoggedOut', 'true');
      await signOut(auth);
    } catch (error: any) {
      throw new Error(error.message || 'Error signing out');
    }
  }

  // Reset password
  static async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      throw new Error(error.message || 'Error sending reset email');
    }
  }

  // Get user profile
  static async getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      
      if (!userDoc.exists()) {
        return null;
      }

      return userDoc.data() as UserProfile;
    } catch (error: any) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }

  // Update user profile
  static async updateUserProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
    try {
      await setDoc(doc(db, 'users', uid), data, { merge: true });
    } catch (error: any) {
      throw new Error(error.message || 'Error updating profile');
    }
  }
}
