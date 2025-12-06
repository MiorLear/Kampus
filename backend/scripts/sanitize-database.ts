/**
 * Script para sanitizar la base de datos de Firestore
 * Elimina todos los datos excepto el usuario especificado
 * 
 * Uso: npm run sanitize
 * o: npx ts-node scripts/sanitize-database.ts
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import * as path from 'path';
import * as fs from 'fs';

// Email del usuario que se debe mantener
const TARGET_EMAIL = 'miguelledezma005@gmail.com';

// Colecciones a limpiar
const COLLECTIONS_TO_CLEAN = [
  'users',
  'courses',
  'enrollments',
  'assignments',
  'submissions',
  'announcements',
  'messages',
  'activity_logs',
  'course_modules',
  'user_progress',
  'course_progress',
];

// Inicializar Firebase Admin
function initializeFirebaseAdmin() {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  const serviceAccountPath = path.join(__dirname, '../firebase-service-account.json');
  
  if (!fs.existsSync(serviceAccountPath)) {
    throw new Error(`Service account file not found at: ${serviceAccountPath}`);
  }

  const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

  return initializeApp({
    credential: cert(serviceAccount),
  });
}

async function sanitizeDatabase() {
  console.log('🚀 Iniciando sanitización de la base de datos...\n');

  try {
    // Inicializar Firebase Admin
    const app = initializeFirebaseAdmin();
    const db = getFirestore(app);
    const auth = getAuth(app);

    console.log('✅ Firebase Admin inicializado\n');

    // 1. Buscar el usuario objetivo por email
    console.log(`🔍 Buscando usuario con email: ${TARGET_EMAIL}...`);
    
    let targetUser: any = null;
    let targetUserId: string | null = null;

    try {
      // Buscar en Firebase Auth
      const userRecord = await auth.getUserByEmail(TARGET_EMAIL);
      targetUserId = userRecord.uid;
      console.log(`✅ Usuario encontrado en Firebase Auth: ${targetUserId}\n`);
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        console.log(`⚠️  Usuario no encontrado en Firebase Auth. Buscando en Firestore...\n`);
        
        // Buscar en Firestore
        const usersSnapshot = await db.collection('users').where('email', '==', TARGET_EMAIL).get();
        
        if (usersSnapshot.empty) {
          throw new Error(`❌ Usuario con email ${TARGET_EMAIL} no encontrado en Firestore ni en Firebase Auth`);
        }
        
        const userDoc = usersSnapshot.docs[0];
        targetUserId = userDoc.id;
        targetUser = userDoc.data();
        console.log(`✅ Usuario encontrado en Firestore: ${targetUserId}\n`);
      } else {
        throw error;
      }
    }

    // Verificar que el usuario existe en Firestore
    if (!targetUser) {
      const userDoc = await db.collection('users').doc(targetUserId!).get();
      if (!userDoc.exists) {
        throw new Error(`❌ Usuario ${targetUserId} no existe en la colección 'users'`);
      }
      targetUser = userDoc.data();
    }

    console.log(`📋 Usuario a mantener:`);
    console.log(`   - ID: ${targetUserId}`);
    console.log(`   - Email: ${targetUser.email}`);
    console.log(`   - Nombre: ${targetUser.name}`);
    console.log(`   - Rol: ${targetUser.role}\n`);

    // 2. Confirmar antes de proceder
    console.log('⚠️  ADVERTENCIA: Este script eliminará TODOS los datos excepto el usuario especificado.');
    console.log('⚠️  Esto incluye:');
    console.log('   - Todos los usuarios excepto el objetivo');
    console.log('   - Todos los cursos');
    console.log('   - Todas las inscripciones');
    console.log('   - Todas las asignaciones');
    console.log('   - Todas las entregas');
    console.log('   - Todos los anuncios');
    console.log('   - Todos los mensajes');
    console.log('   - Todos los logs de actividad');
    console.log('   - Todos los módulos de curso');
    console.log('   - Todo el progreso de usuarios\n');

    // 3. Limpiar cada colección
    let totalDeleted = 0;

    for (const collectionName of COLLECTIONS_TO_CLEAN) {
      console.log(`🧹 Limpiando colección: ${collectionName}...`);
      
      try {
        const collectionRef = db.collection(collectionName);
        const snapshot = await collectionRef.get();
        
        let deletedCount = 0;
        let batch = db.batch();
        let batchCount = 0;
        const BATCH_SIZE = 500; // Firestore permite máximo 500 operaciones por batch

        for (const doc of snapshot.docs) {
          // Si es la colección 'users', mantener solo el usuario objetivo
          if (collectionName === 'users') {
            if (doc.id !== targetUserId) {
              batch.delete(doc.ref);
              deletedCount++;
              batchCount++;
            }
          } else {
            // Para otras colecciones, eliminar todo
            batch.delete(doc.ref);
            deletedCount++;
            batchCount++;
          }

          // Ejecutar batch cuando alcance el límite
          if (batchCount >= BATCH_SIZE) {
            await batch.commit();
            batch = db.batch(); // Crear nuevo batch
            batchCount = 0;
          }
        }

        // Ejecutar batch final si hay documentos pendientes
        if (batchCount > 0) {
          await batch.commit();
        }

        totalDeleted += deletedCount;
        console.log(`   ✅ Eliminados ${deletedCount} documentos de ${collectionName}\n`);
      } catch (error: any) {
        console.error(`   ❌ Error al limpiar ${collectionName}:`, error.message);
        // Continuar con la siguiente colección
      }
    }

    // 4. Limpiar usuarios de Firebase Auth (excepto el objetivo)
    console.log('🧹 Limpiando usuarios de Firebase Auth...');
    try {
      let authDeletedCount = 0;
      let nextPageToken: string | undefined;
      
      do {
        const listUsersResult = await auth.listUsers(1000, nextPageToken);
        
        for (const userRecord of listUsersResult.users) {
          if (userRecord.uid !== targetUserId && userRecord.email !== TARGET_EMAIL) {
            try {
              await auth.deleteUser(userRecord.uid);
              authDeletedCount++;
            } catch (error: any) {
              console.error(`   ⚠️  No se pudo eliminar usuario ${userRecord.uid}:`, error.message);
            }
          }
        }
        
        nextPageToken = listUsersResult.pageToken;
      } while (nextPageToken);

      console.log(`   ✅ Eliminados ${authDeletedCount} usuarios de Firebase Auth\n`);
    } catch (error: any) {
      console.error(`   ❌ Error al limpiar Firebase Auth:`, error.message);
    }

    // 5. Resumen final
    console.log('═══════════════════════════════════════════════════════');
    console.log('✅ SANITIZACIÓN COMPLETADA');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`📊 Total de documentos eliminados: ${totalDeleted}`);
    console.log(`👤 Usuario mantenido: ${TARGET_EMAIL} (${targetUserId})`);
    console.log('═══════════════════════════════════════════════════════\n');

  } catch (error: any) {
    console.error('\n❌ ERROR:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Ejecutar el script
if (require.main === module) {
  sanitizeDatabase()
    .then(() => {
      console.log('✨ Script finalizado exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error fatal:', error);
      process.exit(1);
    });
}

export { sanitizeDatabase };

