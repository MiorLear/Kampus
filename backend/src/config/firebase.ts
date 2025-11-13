import { initializeApp, cert, getApps, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';
import * as path from 'path';

let app: App;
let db: Firestore;
let auth: Auth;

// Inicializar Firebase Admin SDK
function initializeFirebaseAdmin() {
  if (getApps().length > 0) {
    app = getApps()[0];
    db = getFirestore(app);
    auth = getAuth(app);
    return;
  }

  // OPCIÓN 1: Usar service account JSON (recomendado para producción)
  try {
    const serviceAccountPath = path.join(__dirname, '../../firebase-service-account.json');
    const serviceAccount = require(serviceAccountPath);
    
    app = initializeApp({
      credential: cert(serviceAccount),
    });
    console.log('✅ Firebase Admin initialized with service account');
  } catch (error) {
    console.warn('⚠️  Service account file not found, trying Application Default Credentials');
    
    // OPCIÓN 2: Usar Application Default Credentials (Google Cloud)
    // Para desarrollo local, puedes usar:
    // gcloud auth application-default login
    try {
      app = initializeApp({
        // Firebase Admin usará las credenciales por defecto del entorno
      });
      console.log('✅ Firebase Admin initialized with Application Default Credentials');
    } catch (defaultError) {
      console.error('❌ Error initializing Firebase Admin:', defaultError);
      throw defaultError;
    }
  }

  db = getFirestore(app);
  auth = getAuth(app);
}

// Inicializar al cargar el módulo
initializeFirebaseAdmin();

export { app, db, auth };


