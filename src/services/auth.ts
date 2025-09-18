import { auth, db, googleProvider } from "@/lib/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  User,
  updateProfile
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import type { Role, UserDoc } from "@/lib/types";

export async function signUpEmail(
  email: string,
  password: string,
  role: Role = "student",
  displayName?: string
) {
  console.log('Starting user registration:', { email, role, displayName });
  
  try {
    // Check if Firebase is configured
    if (!auth.app.options.apiKey || auth.app.options.apiKey === 'placeholder_api_key') {
      throw new Error('Firebase is not properly configured. Please set up your .env file with real Firebase credentials.');
    }

    const cred = await createUserWithEmailAndPassword(auth, email, password);
    console.log('User created in Firebase Auth:', cred.user.uid);
    
    if (displayName) {
      await updateProfile(cred.user, { displayName });
      console.log('Display name updated:', displayName);
    }
    
    await createUserDoc(cred.user, role);
    console.log('User document created in Firestore');
    
    return cred.user;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
}

export async function signInEmail(email: string, password: string) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export async function signInGoogle(roleDefault: Role = "student") {
  const cred = await signInWithPopup(auth, googleProvider);
  // crea doc si no existe
  const ref = doc(db, "users", cred.user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) await createUserDoc(cred.user, roleDefault);
  return cred.user;
}

export function logout() {
  return signOut(auth);
}

async function createUserDoc(user: User, role: Role) {
  console.log('Creating user document for:', user.uid);
  
  try {
    const ref = doc(db, "users", user.uid);
    const userDoc: UserDoc = {
      uid: user.uid,
      email: user.email ?? "",
      displayName: user.displayName ?? undefined,
      photoURL: user.photoURL ?? undefined,
      role,
      createdAt: Date.now(),
    };
    
    console.log('User document data:', userDoc);
    await setDoc(ref, { ...userDoc, createdAt: serverTimestamp() }, { merge: true });
    console.log('User document successfully created in Firestore');
  } catch (error) {
    console.error('Error creating user document:', error);
    throw error;
  }
}
