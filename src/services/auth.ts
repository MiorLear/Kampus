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
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  if (displayName) await updateProfile(cred.user, { displayName });
  await createUserDoc(cred.user, role);
  return cred.user;
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
  const ref = doc(db, "users", user.uid);
  const userDoc: UserDoc = {
    uid: user.uid,
    email: user.email ?? "",
    displayName: user.displayName ?? undefined,
    photoURL: user.photoURL ?? undefined,
    role,
    createdAt: Date.now(),
  };
  await setDoc(ref, { ...userDoc, createdAt: serverTimestamp() }, { merge: true });
}
