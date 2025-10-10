import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import {
  UserProfile,
  StudentProfile,
  TeacherProfile,
  AdminProfile,
  CreateStudentInput,
  CreateTeacherInput,
  CreateAdminInput,
  UpdateStudentInput,
  UpdateTeacherInput,
  UpdateAdminInput,
  DEFAULT_USER_STATUS,
  DEFAULT_PREFERENCES,
  DEFAULT_STUDENT_STATS,
  DEFAULT_TEACHER_STATS,
  DEFAULT_ADMIN_PERMISSIONS,
  SUPER_ADMIN_PERMISSIONS,
  isStudentProfile,
  isTeacherProfile,
  isAdminProfile,
} from '../types/user-profiles';

/**
 * Servicio para gestionar perfiles de usuario mejorados
 */
export class UserProfileService {
  
  // ========== CREAR PERFILES ==========
  
  /**
   * Crea un perfil de estudiante completo
   */
  static async createStudentProfile(
    userId: string,
    input: Partial<CreateStudentInput>
  ): Promise<StudentProfile> {
    const now = new Date().toISOString();
    
    const studentProfile: StudentProfile = {
      id: userId,
      email: input.email || '',
      name: input.name || '',
      role: 'student',
      status: input.status || DEFAULT_USER_STATUS,
      created_at: now,
      updated_at: now,
      email_verified: false,
      
      // Datos opcionales con valores por defecto
      phone: input.phone,
      date_of_birth: input.date_of_birth,
      gender: input.gender,
      address: input.address,
      photo_url: input.photo_url,
      
      preferences: input.preferences || DEFAULT_PREFERENCES,
      
      // Información académica específica de estudiante
      student_id: input.student_id,
      enrollment_year: input.enrollment_year,
      expected_graduation: input.expected_graduation,
      program: input.program,
      semester: input.semester,
      academic_level: input.academic_level || 'beginner',
      
      emergency_contact: input.emergency_contact,
      stats: input.stats || DEFAULT_STUDENT_STATS,
      learning_style: input.learning_style,
      interests: input.interests || [],
      goals: input.goals || [],
      accessibility_needs: input.accessibility_needs,
    };
    
    await setDoc(doc(db, 'users', userId), studentProfile);
    return studentProfile;
  }
  
  /**
   * Crea un perfil de profesor completo
   */
  static async createTeacherProfile(
    userId: string,
    input: Partial<CreateTeacherInput>
  ): Promise<TeacherProfile> {
    const now = new Date().toISOString();
    
    const teacherProfile: TeacherProfile = {
      id: userId,
      email: input.email || '',
      name: input.name || '',
      role: 'teacher',
      status: input.status || DEFAULT_USER_STATUS,
      created_at: now,
      updated_at: now,
      email_verified: false,
      
      phone: input.phone,
      date_of_birth: input.date_of_birth,
      gender: input.gender,
      address: input.address,
      photo_url: input.photo_url,
      
      preferences: input.preferences || DEFAULT_PREFERENCES,
      
      // Información profesional específica de profesor
      employee_id: input.employee_id,
      hire_date: input.hire_date,
      department: input.department,
      position: input.position,
      
      education: input.education || [],
      certifications: input.certifications || [],
      specializations: input.specializations || [],
      subjects_taught: input.subjects_taught || [],
      
      bio: input.bio,
      office_location: input.office_location,
      office_hours: input.office_hours || [],
      
      stats: input.stats || DEFAULT_TEACHER_STATS,
      teaching_preferences: input.teaching_preferences,
      research: input.research,
    };
    
    await setDoc(doc(db, 'users', userId), teacherProfile);
    return teacherProfile;
  }
  
  /**
   * Crea un perfil de administrador completo
   */
  static async createAdminProfile(
    userId: string,
    input: Partial<CreateAdminInput>,
    isSuperAdmin: boolean = false
  ): Promise<AdminProfile> {
    const now = new Date().toISOString();
    
    const adminProfile: AdminProfile = {
      id: userId,
      email: input.email || '',
      name: input.name || '',
      role: 'admin',
      status: input.status || DEFAULT_USER_STATUS,
      created_at: now,
      updated_at: now,
      email_verified: false,
      
      phone: input.phone,
      date_of_birth: input.date_of_birth,
      gender: input.gender,
      address: input.address,
      photo_url: input.photo_url,
      
      preferences: input.preferences || DEFAULT_PREFERENCES,
      
      // Información administrativa específica
      admin_level: input.admin_level || (isSuperAdmin ? 'super_admin' : 'admin'),
      employee_id: input.employee_id,
      department: input.department,
      position: input.position,
      
      permissions: input.permissions || (isSuperAdmin ? SUPER_ADMIN_PERMISSIONS : DEFAULT_ADMIN_PERMISSIONS),
      
      responsibilities: input.responsibilities || [],
      managed_departments: input.managed_departments || [],
      
      work_phone: input.work_phone,
      work_email: input.work_email,
      office_location: input.office_location,
      
      stats: input.stats || {
        total_actions_performed: 0,
        users_managed: 0,
        courses_approved: 0,
        reports_generated: 0,
        issues_resolved: 0,
      },
      
      admin_preferences: input.admin_preferences || {
        default_view: 'dashboard',
        receive_system_alerts: true,
        receive_user_reports: true,
        notification_frequency: 'realtime',
      },
    };
    
    await setDoc(doc(db, 'users', userId), adminProfile);
    return adminProfile;
  }
  
  // ========== OBTENER PERFILES ==========
  
  /**
   * Obtiene cualquier perfil de usuario
   */
  static async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const docSnap = await getDoc(doc(db, 'users', userId));
      
      if (!docSnap.exists()) {
        return null;
      }
      
      return docSnap.data() as UserProfile;
    } catch (error) {
      console.error('Error al obtener perfil de usuario:', error);
      return null;
    }
  }
  
  // ========== ACTUALIZAR PERFILES ==========
  
  /**
   * Actualiza un perfil de estudiante
   */
  static async updateStudentProfile(
    userId: string,
    updates: UpdateStudentInput
  ): Promise<void> {
    const updateData = {
      ...updates,
      updated_at: new Date().toISOString(),
    };
    
    await updateDoc(doc(db, 'users', userId), updateData as any);
  }
  
  /**
   * Actualiza un perfil de profesor
   */
  static async updateTeacherProfile(
    userId: string,
    updates: UpdateTeacherInput
  ): Promise<void> {
    const updateData = {
      ...updates,
      updated_at: new Date().toISOString(),
    };
    
    await updateDoc(doc(db, 'users', userId), updateData as any);
  }
  
  /**
   * Actualiza un perfil de administrador
   */
  static async updateAdminProfile(
    userId: string,
    updates: UpdateAdminInput
  ): Promise<void> {
    const updateData = {
      ...updates,
      updated_at: new Date().toISOString(),
    };
    
    await updateDoc(doc(db, 'users', userId), updateData as any);
  }
  
  /**
   * Actualiza la fecha de último login
   */
  static async updateLastLogin(userId: string): Promise<void> {
    await updateDoc(doc(db, 'users', userId), {
      last_login: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }
  
  /**
   * Actualiza el estado del usuario
   */
  static async updateUserStatus(
    userId: string,
    status: 'active' | 'inactive' | 'suspended' | 'pending'
  ): Promise<void> {
    await updateDoc(doc(db, 'users', userId), {
      status,
      updated_at: new Date().toISOString(),
    });
  }
  
  // ========== ACTUALIZAR ESTADÍSTICAS ==========
  
  /**
   * Actualiza las estadísticas de un estudiante
   */
  static async updateStudentStats(
    userId: string,
    stats: Partial<StudentProfile['stats']>
  ): Promise<void> {
    const currentProfile = await this.getUserProfile(userId);
    
    if (!currentProfile || !isStudentProfile(currentProfile)) {
      throw new Error('Perfil de estudiante no encontrado');
    }
    
    const updatedStats = {
      ...currentProfile.stats,
      ...stats,
    };
    
    await updateDoc(doc(db, 'users', userId), {
      stats: updatedStats,
      updated_at: new Date().toISOString(),
    });
  }
  
  /**
   * Actualiza las estadísticas de un profesor
   */
  static async updateTeacherStats(
    userId: string,
    stats: Partial<TeacherProfile['stats']>
  ): Promise<void> {
    const currentProfile = await this.getUserProfile(userId);
    
    if (!currentProfile || !isTeacherProfile(currentProfile)) {
      throw new Error('Perfil de profesor no encontrado');
    }
    
    const updatedStats = {
      ...currentProfile.stats,
      ...stats,
    };
    
    await updateDoc(doc(db, 'users', userId), {
      stats: updatedStats,
      updated_at: new Date().toISOString(),
    });
  }
  
  /**
   * Actualiza las estadísticas de un administrador
   */
  static async updateAdminStats(
    userId: string,
    stats: Partial<AdminProfile['stats']>
  ): Promise<void> {
    const currentProfile = await this.getUserProfile(userId);
    
    if (!currentProfile || !isAdminProfile(currentProfile)) {
      throw new Error('Perfil de administrador no encontrado');
    }
    
    const updatedStats = {
      ...currentProfile.stats,
      ...stats,
    };
    
    await updateDoc(doc(db, 'users', userId), {
      stats: updatedStats,
      updated_at: new Date().toISOString(),
    });
  }
  
  // ========== PERMISOS (para administradores) ==========
  
  /**
   * Verifica si un administrador tiene un permiso específico
   */
  static async hasPermission(
    userId: string,
    permission: keyof AdminProfile['permissions']
  ): Promise<boolean> {
    const profile = await this.getUserProfile(userId);
    
    if (!profile || !isAdminProfile(profile)) {
      return false;
    }
    
    return profile.permissions[permission] || false;
  }
  
  /**
   * Actualiza los permisos de un administrador
   */
  static async updateAdminPermissions(
    userId: string,
    permissions: Partial<AdminProfile['permissions']>
  ): Promise<void> {
    const currentProfile = await this.getUserProfile(userId);
    
    if (!currentProfile || !isAdminProfile(currentProfile)) {
      throw new Error('Perfil de administrador no encontrado');
    }
    
    const updatedPermissions = {
      ...currentProfile.permissions,
      ...permissions,
    };
    
    await updateDoc(doc(db, 'users', userId), {
      permissions: updatedPermissions,
      updated_at: new Date().toISOString(),
    });
  }
}

