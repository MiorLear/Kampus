// src/lib/firebase-debug.ts
// Debug utility to check Firebase configuration

export function checkFirebaseConfig() {
  const requiredVars = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN', 
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID'
  ];

  const missing = requiredVars.filter(key => !import.meta.env[key]);
  
  if (missing.length > 0) {
    console.error('Missing Firebase environment variables:', missing);
    return false;
  }

  console.log('✅ All Firebase environment variables are present');
  return true;
}

export function logFirebaseStatus() {
  console.group('🔧 Firebase Debug Info');
  console.log('Environment:', import.meta.env.MODE);
  console.log('Firebase config present:', checkFirebaseConfig());
  console.groupEnd();
}

