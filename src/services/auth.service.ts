import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  User as FirebaseUser,
  signInWithPopup,
  GoogleAuthProvider,
  ActionCodeSettings,
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { ApiService } from './api.service';

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
      console.log('🔄 Attempting to create user with email:', email);
      
      // Create auth user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      console.log('✅ User created successfully:', user.uid);

      // Update display name
      await updateProfile(user, { displayName: name });

      // Create user profile through backend API
      const userProfile: UserProfile = {
        id: user.uid,
        name,
        email,
        role,
        created_at: new Date().toISOString(),
      };

      try {
        // Create profile through backend
        await ApiService.createUserProfile(user.uid, userProfile);
      } catch (profileError: any) {
        console.error('Error creating user profile through API:', profileError);
        // If backend fails, we still have the auth user, but profile creation failed
        // The user can still log in and the profile can be created later
        throw new Error('Account created but failed to create profile. Please contact support.');
      }

      // Send verification email BEFORE signing out
      // This is critical - the user must be authenticated to send the verification email
      try {
        // Reload user to ensure we have the latest state
        await user.reload();
        
        // Configure action code settings for better email delivery
        const actionCodeSettings: ActionCodeSettings = {
          url: `${window.location.origin}/auth?email=${encodeURIComponent(email)}`,
          handleCodeInApp: false, // Use default email handler
        };
        
        console.log('📧 Sending verification email to:', email);
        console.log('📧 Action code URL:', actionCodeSettings.url);
        console.log('📧 User UID:', user.uid);
        console.log('📧 User email verified status:', user.emailVerified);
        
        // Send verification email with action code settings
        await sendEmailVerification(user, actionCodeSettings);
        
        console.log('✅ Email verification sent successfully to:', email);
        console.log('📬 Please check your inbox and spam folder');
        console.log('⏰ Email may take a few minutes to arrive');
      } catch (verificationError: any) {
        // Log detailed error information
        console.error('❌ Email verification failed:', verificationError);
        console.error('Error code:', verificationError.code);
        console.error('Error message:', verificationError.message);
        console.error('User email:', user.email);
        console.error('User emailVerified:', user.emailVerified);
        
        // Check for specific error codes
        if (verificationError.code === 'auth/too-many-requests') {
          throw new Error('Too many verification emails sent. Please wait a few minutes before trying again.');
        } else if (verificationError.code === 'auth/user-not-found') {
          throw new Error('User account not found. Please try registering again.');
        } else if (verificationError.code === 'auth/invalid-email') {
          throw new Error('Invalid email address. Please check your email and try again.');
        }
        
        // For other errors, still create the user but inform about the issue
        console.warn('⚠️ Account created but verification email failed. User can request a new email later.');
        // Don't throw here - let the user be created and they can request verification later
      }

      // Sign out the user immediately after registration to force email verification
      await signOut(auth);

      return userProfile;
    } catch (error: any) {
      // Log detailed error information
      console.error('❌ Registration error:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      console.error('Error details:', {
        email,
        hasPassword: !!password,
        passwordLength: password?.length,
        name,
        role
      });
      
      // Handle specific Firebase errors
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('An account with this email already exists. Please try logging in instead.');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Invalid email address. Please check your email and try again.');
      } else if (error.code === 'auth/weak-password') {
        throw new Error('Password should be at least 6 characters');
      } else if (error.code === 'auth/operation-not-allowed') {
        throw new Error('Email/password accounts are not enabled. Please contact support.');
      } else if (error.code === 'auth/network-request-failed') {
        throw new Error('Network error. Please check your internet connection and try again.');
      } else if (error.code === 'auth/too-many-requests') {
        throw new Error('Too many requests. Please wait a few minutes and try again.');
      } else if (error.code === 'auth/invalid-api-key') {
        throw new Error('Invalid Firebase configuration. Please contact support.');
      } else if (error.code === 'auth/unauthorized-domain') {
        throw new Error('This domain is not authorized. Please contact support.');
      }
      
      // For unknown errors, provide more context
      const errorMessage = error.message || 'Error creating account';
      console.error('Unknown error during registration:', errorMessage);
      throw new Error(`Registration failed: ${errorMessage}. Please try again or contact support if the problem persists.`);
    }
  }

  // Login user
  static async login(email: string, password: string): Promise<UserProfile> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Check if email is verified
      if (!user.emailVerified) {
        // Sign out the user immediately
        await signOut(auth);
        throw new Error('EMAIL_NOT_VERIFIED');
      }

      // Retry logic to get user profile from API (may take a moment after registration)
      let userProfile = await ApiService.getUser(user.uid) as UserProfile | null;
      let retries = 0;
      const maxRetries = 5;
      const retryDelay = 500; // 500ms

      while (!userProfile && retries < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        userProfile = await ApiService.getUser(user.uid) as UserProfile | null;
        retries++;
      }

      if (!userProfile) {
        // If profile still doesn't exist, create it with basic info from Firebase Auth
        console.warn('User profile not found, creating basic profile through API');
        const basicProfile: UserProfile = {
          id: user.uid,
          name: user.displayName || email.split('@')[0],
          email: user.email || email,
          role: 'student', // Default role
          created_at: new Date().toISOString(),
        };

        try {
          await ApiService.createUserProfile(user.uid, basicProfile);
          return basicProfile;
        } catch (createError: any) {
          console.error('Error creating basic profile:', createError);
          // Return the basic profile anyway - it will be created on next login
          return basicProfile;
        }
      }

      return userProfile;
    } catch (error: any) {
      // Handle specific Firebase errors
      if (error.message === 'EMAIL_NOT_VERIFIED') {
        throw new Error('Please verify your email address before signing in. Check your inbox for the verification link.');
      } else if (error.code === 'auth/user-not-found') {
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
      return await ApiService.getUser(uid) as UserProfile | null;
    } catch (error: any) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }

  // Login with Google
  static async loginWithGoogle(): Promise<UserProfile> {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user profile exists through API
      let existingProfile = await ApiService.getUser(user.uid) as UserProfile | null;

      if (!existingProfile) {
        // Create user profile if it doesn't exist
        const userProfile: UserProfile = {
          id: user.uid,
          name: user.displayName || user.email?.split('@')[0] || 'User',
          email: user.email || '',
          role: 'student', // Default role for Google sign-in
          photo_url: user.photoURL || undefined,
          created_at: new Date().toISOString(),
        };

        await ApiService.createUserProfile(user.uid, userProfile);
        return userProfile;
      }

      // Update photo_url if available and not set
      if (user.photoURL && !existingProfile.photo_url) {
        await ApiService.updateUser(user.uid, { photo_url: user.photoURL });
        existingProfile.photo_url = user.photoURL;
      }

      return existingProfile;
    } catch (error: any) {
      // Handle specific Firebase errors
      if (error.code === 'auth/popup-closed-by-user') {
        throw new Error('Sign-in popup was closed');
      } else if (error.code === 'auth/popup-blocked') {
        throw new Error('Popup was blocked by browser');
      } else if (error.code === 'auth/cancelled-popup-request') {
        throw new Error('Only one popup request is allowed at a time');
      }
      throw new Error(error.message || 'Error signing in with Google');
    }
  }

  // Resend verification email
  static async resendVerificationEmail(email: string, password: string): Promise<void> {
    try {
      // Sign in temporarily to get the user
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Check if already verified
      if (user.emailVerified) {
        await signOut(auth);
        throw new Error('Email is already verified');
      }

      // Reload user to ensure we have the latest state
      await user.reload();
      
      // Configure action code settings for better email delivery
      const actionCodeSettings: ActionCodeSettings = {
        url: `${window.location.origin}/auth?email=${encodeURIComponent(email)}`,
        handleCodeInApp: false, // Use default email handler
      };
      
      console.log('📧 Resending verification email to:', email);
      console.log('📧 Action code URL:', actionCodeSettings.url);
      
      // Send verification email with action code settings
      await sendEmailVerification(user, actionCodeSettings);
      
      console.log('✅ Verification email resent successfully to:', email);
      console.log('📬 Please check your inbox and spam folder');
      console.log('⏰ Email may take a few minutes to arrive');

      // Sign out again
      await signOut(auth);
    } catch (error: any) {
      // Make sure to sign out on error
      try {
        await signOut(auth);
      } catch (signOutError) {
        // Ignore sign out errors
      }

      if (error.message === 'Email is already verified') {
        throw error;
      } else if (error.code === 'auth/user-not-found') {
        throw new Error('No account found with this email');
      } else if (error.code === 'auth/wrong-password') {
        throw new Error('Incorrect password');
      } else if (error.code === 'auth/too-many-requests') {
        throw new Error('Too many requests. Please try again later');
      }
      throw new Error(error.message || 'Error sending verification email');
    }
  }

  // Update user profile
  static async updateUserProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
    try {
      await ApiService.updateUser(uid, data);
    } catch (error: any) {
      throw new Error(error.message || 'Error updating profile');
    }
  }
}
