// ========== USER PROFILE TYPES ==========
// Sistema de perfiles mejorado para Kampus

export type UserRole = 'student' | 'teacher' | 'admin';
export type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending';

// ========== BASE USER (Común para todos) ==========
export interface BaseUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  
  // Información personal
  photo_url?: string;
  phone?: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postal_code?: string;
  };
  
  // Metadata del sistema
  created_at: string;
  updated_at: string;
  last_login?: string;
  email_verified: boolean;
  
  // Preferencias
  preferences?: {
    language: 'es' | 'en';
    timezone: string;
    notifications_enabled: boolean;
    theme: 'light' | 'dark' | 'auto';
  };
}

// ========== PERFIL DE ESTUDIANTE ==========
export interface StudentProfile extends BaseUser {
  role: 'student';
  
  // Información académica
  student_id?: string; // Matrícula o código de estudiante
  enrollment_year?: number;
  expected_graduation?: string;
  
  // Programa académico
  program?: string; // Carrera o programa de estudios
  semester?: number;
  academic_level?: 'beginner' | 'intermediate' | 'advanced';
  
  // Información de contacto de emergencia
  emergency_contact?: {
    name: string;
    relationship: string;
    phone: string;
    email?: string;
  };
  
  // Estadísticas académicas
  stats?: {
    total_courses_enrolled: number;
    total_courses_completed: number;
    average_grade: number;
    total_assignments_submitted: number;
    total_assignments_pending: number;
    attendance_rate?: number;
    total_study_hours?: number;
  };
  
  // Configuración del estudiante
  learning_style?: 'visual' | 'auditory' | 'kinesthetic' | 'reading_writing';
  interests?: string[];
  goals?: string[];
  
  // Accesibilidad
  accessibility_needs?: {
    requires_captions: boolean;
    requires_screen_reader: boolean;
    color_blind_mode: boolean;
    other?: string;
  };
}

// ========== PERFIL DE PROFESOR ==========
export interface TeacherProfile extends BaseUser {
  role: 'teacher';
  
  // Información profesional
  employee_id?: string;
  hire_date?: string;
  department?: string;
  position?: string; // Profesor Titular, Auxiliar, etc.
  
  // Educación y credenciales
  education?: {
    degree: string; // Licenciatura, Maestría, Doctorado
    institution: string;
    field_of_study: string;
    graduation_year: number;
  }[];
  
  certifications?: {
    name: string;
    issuer: string;
    date_obtained: string;
    expiry_date?: string;
  }[];
  
  // Especialización
  specializations?: string[];
  subjects_taught?: string[];
  
  // Bio profesional
  bio?: string;
  office_location?: string;
  office_hours?: {
    day: string;
    start_time: string;
    end_time: string;
  }[];
  
  // Estadísticas de enseñanza
  stats?: {
    total_courses_taught: number;
    total_students_taught: number;
    average_student_rating?: number;
    total_assignments_created: number;
    total_assignments_graded: number;
    pending_grading: number;
  };
  
  // Configuración de profesor
  teaching_preferences?: {
    max_students_per_course?: number;
    preferred_subjects?: string[];
    grading_scale?: 'percentage' | 'letter' | 'points';
  };
  
  // Investigación (opcional)
  research?: {
    areas: string[];
    publications?: {
      title: string;
      year: number;
      journal?: string;
      url?: string;
    }[];
  };
}

// ========== PERFIL DE ADMINISTRADOR ==========
export interface AdminProfile extends BaseUser {
  role: 'admin';
  
  // Información administrativa
  admin_level: 'super_admin' | 'admin' | 'moderator';
  employee_id?: string;
  department?: string;
  position?: string;
  
  // Permisos y accesos
  permissions: {
    manage_users: boolean;
    manage_courses: boolean;
    manage_content: boolean;
    view_analytics: boolean;
    manage_settings: boolean;
    manage_payments?: boolean;
    manage_reports: boolean;
    access_logs: boolean;
    system_configuration: boolean;
  };
  
  // Áreas de responsabilidad
  responsibilities?: string[];
  managed_departments?: string[];
  
  // Información de contacto profesional
  work_phone?: string;
  work_email?: string;
  office_location?: string;
  
  // Estadísticas administrativas
  stats?: {
    total_actions_performed: number;
    users_managed: number;
    courses_approved: number;
    reports_generated: number;
    issues_resolved: number;
    last_activity?: string;
  };
  
  // Configuración del administrador
  admin_preferences?: {
    default_view: 'dashboard' | 'users' | 'courses' | 'analytics';
    receive_system_alerts: boolean;
    receive_user_reports: boolean;
    notification_frequency: 'realtime' | 'hourly' | 'daily';
  };
  
  // Auditoría
  audit_trail?: {
    last_login_ip?: string;
    login_history?: {
      timestamp: string;
      ip_address: string;
      device: string;
    }[];
  };
}

// ========== UNION TYPE para todos los perfiles ==========
export type UserProfile = StudentProfile | TeacherProfile | AdminProfile;

// ========== TYPE GUARDS ==========
export function isStudentProfile(user: UserProfile): user is StudentProfile {
  return user.role === 'student';
}

export function isTeacherProfile(user: UserProfile): user is TeacherProfile {
  return user.role === 'teacher';
}

export function isAdminProfile(user: UserProfile): user is AdminProfile {
  return user.role === 'admin';
}

// ========== HELPER TYPES para crear nuevos usuarios ==========
export type CreateStudentInput = Omit<StudentProfile, 'id' | 'created_at' | 'updated_at' | 'email_verified'>;
export type CreateTeacherInput = Omit<TeacherProfile, 'id' | 'created_at' | 'updated_at' | 'email_verified'>;
export type CreateAdminInput = Omit<AdminProfile, 'id' | 'created_at' | 'updated_at' | 'email_verified'>;

// ========== TIPOS para actualización parcial ==========
export type UpdateStudentInput = Partial<Omit<StudentProfile, 'id' | 'role' | 'created_at'>>;
export type UpdateTeacherInput = Partial<Omit<TeacherProfile, 'id' | 'role' | 'created_at'>>;
export type UpdateAdminInput = Partial<Omit<AdminProfile, 'id' | 'role' | 'created_at'>>;

// ========== CONSTANTES útiles ==========
export const DEFAULT_USER_STATUS: UserStatus = 'active';

export const DEFAULT_PREFERENCES = {
  language: 'es' as const,
  timezone: 'America/Mexico_City',
  notifications_enabled: true,
  theme: 'light' as const,
};

export const DEFAULT_STUDENT_STATS = {
  total_courses_enrolled: 0,
  total_courses_completed: 0,
  average_grade: 0,
  total_assignments_submitted: 0,
  total_assignments_pending: 0,
};

export const DEFAULT_TEACHER_STATS = {
  total_courses_taught: 0,
  total_students_taught: 0,
  total_assignments_created: 0,
  total_assignments_graded: 0,
  pending_grading: 0,
};

export const DEFAULT_ADMIN_PERMISSIONS = {
  manage_users: true,
  manage_courses: true,
  manage_content: true,
  view_analytics: true,
  manage_settings: false,
  manage_reports: true,
  access_logs: true,
  system_configuration: false,
};

export const SUPER_ADMIN_PERMISSIONS = {
  manage_users: true,
  manage_courses: true,
  manage_content: true,
  view_analytics: true,
  manage_settings: true,
  manage_reports: true,
  access_logs: true,
  system_configuration: true,
};

