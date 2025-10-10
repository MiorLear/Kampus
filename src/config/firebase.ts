import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDoAP5kVdoUV3l1XMGBTnWZGyrZiWdDCvY",
  authDomain: "kampus-21cfc.firebaseapp.com",
  projectId: "kampus-21cfc",
  storageBucket: "kampus-21cfc.firebasestorage.app",
  messagingSenderId: "555890426295",
  appId: "1:555890426295:web:735fced2717b67e1dc2832",
  measurementId: "G-J0NZS6CY98"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
