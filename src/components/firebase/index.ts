// src/components/firebase/index.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// 🔍 Diagnóstico: imprime la config real
console.table(firebaseConfig);

// Evita apps duplicadas y garantiza 1 sola instancia
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Auth + provider
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// 🔍 Más diagnóstico para verificar que conectó bien
console.log("Auth projectId:", auth.app.options.projectId);
console.log("Auth authDomain:", auth.app.options.authDomain);
