// src/services/auth.ts
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

// 👇 Importa SIEMPRE desde firebase (app, db y provider)
import { auth, db, googleProvider } from '../firebase';

// Utilidad: elimina undefined antes de guardar
const clean = <T extends Record<string, any>>(o: T) =>
  JSON.parse(JSON.stringify(o)) as T;

type ProviderKind = 'google' | 'password';

async function upsertUserDoc(u: User, provider: ProviderKind) {
  const ref = doc(db, 'users', u.uid);
  const snap = await getDoc(ref);

  const base = clean({
    email: u.email ?? null,
    displayName: u.displayName ?? null,
    photoURL: u.photoURL ?? null,
    provider,
    updatedAt: serverTimestamp(),
  });

  await setDoc(
    ref,
    snap.exists()
      ? base
      : {
          ...base,
          createdAt: serverTimestamp(), // solo si no existía
        },
    { merge: true }
  );
}

/** Login con Google (popup) + upsert del doc del usuario */
export async function loginWithGoogle(): Promise<User> {
  const { user } = await signInWithPopup(auth, googleProvider);
  await upsertUserDoc(user, 'google');
  return user;
}

/** Login con email/password */
export async function loginWithEmailPassword(email: string, password: string) {
  const { user } = await signInWithEmailAndPassword(auth, email, password);
  await upsertUserDoc(user, 'password'); // asegura doc
  return user;
}

/** Registro con email/password */
export async function registerWithEmailPassword(
  email: string,
  password: string
) {
  const { user } = await createUserWithEmailAndPassword(auth, email, password);
  await upsertUserDoc(user, 'password');
  return user;
}

/** Cerrar sesión */
export async function logout() {
  await signOut(auth);
}

/** Listener del estado de auth */
export function onAuthChange(cb: (user: User | null) => void) {
  return onAuthStateChanged(auth, cb);
}
