/**
 * Utilidad para poblar la base de datos con perfiles de usuario de ejemplo
 * Útil para desarrollo y testing
 */

import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebase';
import { UserProfileService } from '../services/user-profile.service';
import { 
  SAMPLE_STUDENTS, 
  SAMPLE_TEACHERS, 
  SAMPLE_ADMINS 
} from '../data/sample-users';

// Password por defecto para usuarios de ejemplo
const DEFAULT_PASSWORD = 'Kampus2024!';

interface SeedResult {
  success: boolean;
  userId?: string;
  email: string;
  role: string;
  error?: string;
}

/**
 * Crea un usuario de ejemplo en Firebase Auth y Firestore
 */
async function createSampleUser(
  userData: any,
  role: 'student' | 'teacher' | 'admin'
): Promise<SeedResult> {
  try {
    // 1. Crear usuario en Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      userData.email,
      DEFAULT_PASSWORD
    );
    const userId = userCredential.user.uid;

    // 2. Crear perfil en Firestore según el rol
    switch (role) {
      case 'student':
        await UserProfileService.createStudentProfile(userId, {
          ...userData,
          email_verified: true
        });
        break;
      
      case 'teacher':
        await UserProfileService.createTeacherProfile(userId, {
          ...userData,
          email_verified: true
        });
        break;
      
      case 'admin':
        const isSuperAdmin = userData.admin_level === 'super_admin';
        await UserProfileService.createAdminProfile(
          userId,
          {
            ...userData,
            email_verified: true
          },
          isSuperAdmin
        );
        break;
    }

    return {
      success: true,
      userId,
      email: userData.email,
      role
    };
  } catch (error: any) {
    console.error(`Error creando usuario ${userData.email}:`, error);
    return {
      success: false,
      email: userData.email,
      role,
      error: error.message
    };
  }
}

/**
 * Pobla la base de datos con todos los estudiantes de ejemplo
 */
export async function seedStudents(): Promise<SeedResult[]> {
  console.log('🎓 Creando estudiantes de ejemplo...');
  const results: SeedResult[] = [];

  for (const student of SAMPLE_STUDENTS) {
    const result = await createSampleUser(student, 'student');
    results.push(result);
    
    if (result.success) {
      console.log(`✅ Estudiante creado: ${result.email}`);
    } else {
      console.log(`❌ Error creando estudiante: ${result.email} - ${result.error}`);
    }
  }

  return results;
}

/**
 * Pobla la base de datos con todos los profesores de ejemplo
 */
export async function seedTeachers(): Promise<SeedResult[]> {
  console.log('👨‍🏫 Creando profesores de ejemplo...');
  const results: SeedResult[] = [];

  for (const teacher of SAMPLE_TEACHERS) {
    const result = await createSampleUser(teacher, 'teacher');
    results.push(result);
    
    if (result.success) {
      console.log(`✅ Profesor creado: ${result.email}`);
    } else {
      console.log(`❌ Error creando profesor: ${result.email} - ${result.error}`);
    }
  }

  return results;
}

/**
 * Pobla la base de datos con todos los administradores de ejemplo
 */
export async function seedAdmins(): Promise<SeedResult[]> {
  console.log('👨‍💼 Creando administradores de ejemplo...');
  const results: SeedResult[] = [];

  for (const admin of SAMPLE_ADMINS) {
    const result = await createSampleUser(admin, 'admin');
    results.push(result);
    
    if (result.success) {
      console.log(`✅ Administrador creado: ${result.email}`);
    } else {
      console.log(`❌ Error creando administrador: ${result.email} - ${result.error}`);
    }
  }

  return results;
}

/**
 * Pobla la base de datos con TODOS los usuarios de ejemplo
 */
export async function seedAllProfiles(): Promise<{
  students: SeedResult[];
  teachers: SeedResult[];
  admins: SeedResult[];
  summary: {
    total: number;
    successful: number;
    failed: number;
  };
}> {
  console.log('🚀 Iniciando población de base de datos con perfiles de ejemplo...\n');

  const students = await seedStudents();
  console.log('');
  
  const teachers = await seedTeachers();
  console.log('');
  
  const admins = await seedAdmins();
  console.log('');

  const allResults = [...students, ...teachers, ...admins];
  const successful = allResults.filter(r => r.success).length;
  const failed = allResults.filter(r => !r.success).length;

  console.log('📊 RESUMEN DE POBLACIÓN:');
  console.log(`   Total de usuarios: ${allResults.length}`);
  console.log(`   ✅ Exitosos: ${successful}`);
  console.log(`   ❌ Fallidos: ${failed}`);
  console.log('');
  console.log(`🔑 Contraseña por defecto para todos los usuarios: ${DEFAULT_PASSWORD}`);

  return {
    students,
    teachers,
    admins,
    summary: {
      total: allResults.length,
      successful,
      failed
    }
  };
}

/**
 * Obtiene credenciales de acceso para testing
 */
export function getTestCredentials() {
  return {
    students: SAMPLE_STUDENTS.map(s => ({
      email: s.email,
      password: DEFAULT_PASSWORD,
      name: s.name
    })),
    teachers: SAMPLE_TEACHERS.map(t => ({
      email: t.email,
      password: DEFAULT_PASSWORD,
      name: t.name
    })),
    admins: SAMPLE_ADMINS.map(a => ({
      email: a.email,
      password: DEFAULT_PASSWORD,
      name: a.name
    }))
  };
}

/**
 * Imprime las credenciales de acceso para testing
 */
export function printTestCredentials() {
  const credentials = getTestCredentials();
  
  console.log('\n📝 CREDENCIALES DE ACCESO PARA TESTING\n');
  console.log('=' .repeat(60));
  
  console.log('\n👨‍🎓 ESTUDIANTES:');
  credentials.students.forEach((cred, index) => {
    console.log(`\n${index + 1}. ${cred.name}`);
    console.log(`   Email: ${cred.email}`);
    console.log(`   Password: ${cred.password}`);
  });
  
  console.log('\n👨‍🏫 PROFESORES:');
  credentials.teachers.forEach((cred, index) => {
    console.log(`\n${index + 1}. ${cred.name}`);
    console.log(`   Email: ${cred.email}`);
    console.log(`   Password: ${cred.password}`);
  });
  
  console.log('\n👨‍💼 ADMINISTRADORES:');
  credentials.admins.forEach((cred, index) => {
    console.log(`\n${index + 1}. ${cred.name}`);
    console.log(`   Email: ${cred.email}`);
    console.log(`   Password: ${cred.password}`);
  });
  
  console.log('\n' + '='.repeat(60) + '\n');
}

