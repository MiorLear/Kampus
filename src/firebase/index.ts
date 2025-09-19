// src/firebase/index.ts
/// <reference types="vite/client" />
import { initializeApp, getApp, getApps, type FirebaseOptions } from 'firebase/app';
import {
  initializeAuth,
  indexedDBLocalPersistence,
  browserLocalPersistence,
  browserPopupRedirectResolver,
  getAuth,
  GoogleAuthProvider,
  type Auth,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// ---------- Vars requeridas ----------
const REQUIRED = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
] as const;

type ReqKey = (typeof REQUIRED)[number];
const getEnv = (k: ReqKey) =>
  (import.meta.env as unknown as Record<string, string | undefined>)[k];

const missing = REQUIRED.filter((k) => !getEnv(k));
if (missing.length) {
  throw new Error(`[Firebase] Faltan variables en .env.local: ${missing.join(', ')}`);
}

// ---------- Config ----------
const firebaseConfig: FirebaseOptions = {
  apiKey: getEnv('VITE_FIREBASE_API_KEY')!,
  authDomain: getEnv('VITE_FIREBASE_AUTH_DOMAIN')!,
  projectId: getEnv('VITE_FIREBASE_PROJECT_ID')!,
  storageBucket: getEnv('VITE_FIREBASE_STORAGE_BUCKET')!,
  messagingSenderId: getEnv('VITE_FIREBASE_MESSAGING_SENDER_ID')!,
  appId: getEnv('VITE_FIREBASE_APP_ID')!,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID, // opcional
};

// Chequeo rápido
if (!firebaseConfig.apiKey || !firebaseConfig.apiKey.startsWith('AIza')) {
  throw new Error(`[Firebase] apiKey no parece válida: ${firebaseConfig.apiKey ?? '(vacía)'}`);
}

// Debug (opcional)
const mask = (s?: string, keep = 6) =>
  !s ? '(vacío)' : s.length <= keep ? s : `${s.slice(0, keep)}…(${s.length})`;
if (import.meta.env.DEV) {
  console.groupCollapsed('[Firebase] Config cargado');
  console.table({
    apiKey: mask(firebaseConfig.apiKey),
    authDomain: firebaseConfig.authDomain ?? '(vacío)',
    projectId: firebaseConfig.projectId ?? '(vacío)',
    storageBucket: firebaseConfig.storageBucket ?? '(vacío)',
    messagingSenderId: firebaseConfig.messagingSenderId ?? '(vacío)',
    appId: firebaseConfig.appId ?? '(vacío)',
    measurementId: firebaseConfig.measurementId ?? '(none)',
  });
  console.groupEnd();
}

// ---------- App única (HMR) ----------
export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// ---------- Auth ----------
let auth: Auth;
try {
  auth = initializeAuth(app, {
    persistence: [indexedDBLocalPersistence, browserLocalPersistence],
    popupRedirectResolver: browserPopupRedirectResolver,
  });
} catch {
  auth = getAuth(app);
}

// ---------- Exports ----------
export { auth };
export const db = getFirestore(app);

// Configure Google provider with proper scopes
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');
googleProvider.setCustomParameters({
  prompt: 'select_account'
});
