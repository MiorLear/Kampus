// src/routes/AuthPageContainer.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  sendPasswordResetEmail,
  updateProfile,
} from "firebase/auth";
import { auth, googleProvider } from "../firebase";
import { ensureUserDoc } from "../services/user";
import { AuthPage } from "../components/auth/AuthPage";

type Role = "student" | "teacher" | "admin";

function pathByRole(role: Role) {
  return `/dashboard/${role}`;
}

const AuthPageContainer: React.FC = () => {
  const [state, setState] = React.useState<
    "login" | "register" | "forgot-password" | "email-verification"
  >("login");
  const [loading, setLoading] = React.useState(false);
  const navigate = useNavigate();

  const mapAuthError = (e: any): string => {
    const code: string = e?.code || "";
    switch (code) {
      case "auth/email-already-in-use":
        return "That email is already in use.";
      case "auth/invalid-email":
        return "Please enter a valid email.";
      case "auth/weak-password":
        return "Password is too weak (min 6 chars).";
      case "auth/user-not-found":
      case "auth/wrong-password":
        return "Invalid email or password.";
      case "auth/popup-blocked":
        return "The popup was blocked. We'll try a redirect instead.";
      case "auth/popup-closed-by-user":
        return "Google sign-in was cancelled. Please try again.";
      case "auth/cancelled-popup-request":
        return "Google sign-in was cancelled. Please try again.";
      case "auth/operation-not-supported-in-this-environment":
        return "Google sign-in is not supported in this environment.";
      case "auth/account-exists-with-different-credential":
        return "An account already exists with this email. Please sign in with your password instead.";
      case "auth/network-request-failed":
        return "Network error. Check your connection and try again.";
      case "auth/too-many-requests":
        return "Too many attempts. Please try again later.";
      default:
        return e?.message ?? "Unexpected error. Please try again.";
    }
  };

  async function onLogin(email: string, password: string, role?: Role) {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate(pathByRole(role ?? "student"), { replace: true });
    } catch (e) {
      const msg = mapAuthError(e);
      console.error("[Auth] onLogin error:", e);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }

  async function onRegister(
    name: string,
    email: string,
    password: string,
    role: Role = "student"
  ) {
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      if (name?.trim()) {
        await updateProfile(cred.user, { displayName: name.trim() });
      }
      await ensureUserDoc(cred.user.uid, {
        role,
        email,
        displayName: name || null,
        // createdAt es opcional; tu service puede poner serverTimestamp()
      });
      navigate(pathByRole(role), { replace: true });
    } catch (e) {
      const msg = mapAuthError(e);
      console.error("[Auth] onRegister error:", e);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }

  async function onForgotPassword(email: string) {
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (e) {
      const msg = mapAuthError(e);
      console.error("[Auth] onForgotPassword error:", e);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }

  async function onGoogleSignIn(role: Role = "student") {
    setLoading(true);
    console.log("Starting Google sign-in with role:", role);
    
    try {
      console.log("Attempting popup authentication...");
      const cred = await signInWithPopup(auth, googleProvider);
      console.log("Google authentication successful:", cred.user.email);
      
      // Try to save user doc to Firestore, but don't fail if it doesn't work
      try {
        console.log("Saving user to Firestore...");
        await ensureUserDoc(cred.user.uid, {
          role,
          email: cred.user.email ?? null,
          displayName: cred.user.displayName ?? null,
        });
        console.log("User saved to Firestore successfully");
      } catch (firestoreError) {
        console.warn("Could not save user to Firestore, continuing with authentication:", firestoreError);
        // Continue with authentication even if Firestore fails
      }
      
      console.log("Navigating to dashboard...");
      navigate(pathByRole(role), { replace: true });
    } catch (e: any) {
      console.error("Google sign-in error:", e);
      
      if (
        e?.code === "auth/popup-blocked" ||
        e?.code === "auth/operation-not-supported-in-this-environment"
      ) {
        console.log("Popup blocked, trying redirect...");
        try {
          await signInWithRedirect(auth, googleProvider);
          return;
        } catch (redirectError) {
          console.error("Redirect also failed:", redirectError);
          throw new Error("Both popup and redirect authentication failed");
        }
      }
      const msg = mapAuthError(e);
      console.error("[Auth] onGoogleSignIn error:", e);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthPage
      authState={state}
      onAuthStateChange={setState}
      onLogin={onLogin}
      onRegister={onRegister}
      onForgotPassword={onForgotPassword}
      onGoogleSignIn={onGoogleSignIn}
      // loading={loading} // descomenta si tu <AuthPage> lo acepta
    />
  );
};

export default AuthPageContainer;