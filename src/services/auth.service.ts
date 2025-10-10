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

      // Send verification email
      await sendEmailVerification(user);

      // Create user profile in Firestore
      const userProfile: UserProfile = {
        id: user.uid,
        name,
        email,
        role,
        created_at: new Date().toISOString(),
      };

      await setDoc(doc(db, 'users', user.uid), userProfile);

      return userProfile;
    } catch (error: any) {
      throw new Error(error.message || 'Error creating account');
    }
  }

  // Login user
  static async login(email: string, password: string): Promise<UserProfile> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Get user profile from Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (!userDoc.exists()) {
        throw new Error('User profile not found');
      }

      return userDoc.data() as UserProfile;
    } catch (error: any) {
      throw new Error(error.message || 'Error signing in');
    }
  }

  // Logout user
  static async logout(): Promise<void> {
    try {
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
