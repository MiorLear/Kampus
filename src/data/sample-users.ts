/**
 * Usuarios de ejemplo para cada perfil
 * Útil para desarrollo, testing y demostración
 */

import {
  StudentProfile,
  TeacherProfile,
  AdminProfile,
  CreateStudentInput,
  CreateTeacherInput,
  CreateAdminInput,
} from '../types/user-profiles';

// ========== ESTUDIANTES DE EJEMPLO ==========

export const SAMPLE_STUDENTS: Partial<CreateStudentInput>[] = [
  {
    name: "María González",
    email: "maria.gonzalez@kampus.edu",
    status: "active",
    phone: "+52 555-1001",
    date_of_birth: "2003-05-15",
    gender: "female",
    student_id: "ST-2024-001",
    enrollment_year: 2024,
    program: "Ingeniería en Software",
    semester: 3,
    academic_level: "intermediate",
    learning_style: "visual",
    interests: ["programación", "inteligencia artificial", "diseño web"],
    goals: [
      "Graduarme con honores",
      "Conseguir una pasantía en una empresa tech",
      "Aprender desarrollo mobile"
    ],
    emergency_contact: {
      name: "Pedro González",
      relationship: "Padre",
      phone: "+52 555-2001",
      email: "pedro.gonzalez@email.com"
    },
    stats: {
      total_courses_enrolled: 5,
      total_courses_completed: 2,
      average_grade: 9.2,
      total_assignments_submitted: 28,
      total_assignments_pending: 3,
      attendance_rate: 95,
      total_study_hours: 180
    }
  },
  {
    name: "Carlos Ramírez",
    email: "carlos.ramirez@kampus.edu",
    status: "active",
    phone: "+52 555-1002",
    date_of_birth: "2004-08-22",
    gender: "male",
    student_id: "ST-2024-002",
    enrollment_year: 2024,
    program: "Ciencias de la Computación",
    semester: 2,
    academic_level: "beginner",
    learning_style: "kinesthetic",
    interests: ["videojuegos", "realidad virtual", "machine learning"],
    goals: [
      "Crear mi propio videojuego",
      "Participar en hackathons"
    ],
    emergency_contact: {
      name: "Ana Ramírez",
      relationship: "Madre",
      phone: "+52 555-2002",
    },
    stats: {
      total_courses_enrolled: 4,
      total_courses_completed: 0,
      average_grade: 8.5,
      total_assignments_submitted: 15,
      total_assignments_pending: 2,
      attendance_rate: 88,
      total_study_hours: 90
    }
  },
  {
    name: "Laura Martínez",
    email: "laura.martinez@kampus.edu",
    status: "active",
    phone: "+52 555-1003",
    date_of_birth: "2002-12-10",
    gender: "female",
    student_id: "ST-2023-045",
    enrollment_year: 2023,
    program: "Ingeniería en Datos",
    semester: 5,
    academic_level: "advanced",
    learning_style: "reading_writing",
    interests: ["data science", "estadística", "visualización de datos"],
    goals: [
      "Especializarme en Big Data",
      "Publicar un paper",
      "Trabajar en investigación"
    ],
    emergency_contact: {
      name: "Roberto Martínez",
      relationship: "Padre",
      phone: "+52 555-2003",
    },
    stats: {
      total_courses_enrolled: 8,
      total_courses_completed: 6,
      average_grade: 9.5,
      total_assignments_submitted: 52,
      total_assignments_pending: 1,
      attendance_rate: 98,
      total_study_hours: 350
    },
    accessibility_needs: {
      requires_captions: true,
      requires_screen_reader: false,
      color_blind_mode: false,
    }
  }
];

// ========== PROFESORES DE EJEMPLO ==========

export const SAMPLE_TEACHERS: Partial<CreateTeacherInput>[] = [
  {
    name: "Dr. Roberto Sánchez",
    email: "roberto.sanchez@kampus.edu",
    status: "active",
    phone: "+52 555-3001",
    employee_id: "EMP-2018-025",
    hire_date: "2018-08-15",
    department: "Ciencias de la Computación",
    position: "Profesor Titular",
    bio: "Doctor en Ciencias de la Computación con más de 15 años de experiencia en enseñanza e investigación. Especializado en Machine Learning y Deep Learning.",
    education: [
      {
        degree: "Doctorado en Ciencias de la Computación",
        institution: "Universidad Nacional Autónoma",
        field_of_study: "Machine Learning",
        graduation_year: 2015
      },
      {
        degree: "Maestría en Inteligencia Artificial",
        institution: "Instituto Tecnológico Superior",
        field_of_study: "Inteligencia Artificial",
        graduation_year: 2010
      },
      {
        degree: "Licenciatura en Ingeniería en Sistemas",
        institution: "Universidad Politécnica",
        field_of_study: "Sistemas Computacionales",
        graduation_year: 2006
      }
    ],
    certifications: [
      {
        name: "TensorFlow Developer Certificate",
        issuer: "Google",
        date_obtained: "2022-03-15",
      },
      {
        name: "AWS Machine Learning Specialty",
        issuer: "Amazon Web Services",
        date_obtained: "2021-09-20",
        expiry_date: "2024-09-20"
      }
    ],
    specializations: ["Machine Learning", "Deep Learning", "Computer Vision", "NLP"],
    subjects_taught: [
      "Inteligencia Artificial",
      "Machine Learning Avanzado",
      "Procesamiento de Lenguaje Natural",
      "Visión por Computadora"
    ],
    office_location: "Edificio A, Piso 3, Oficina 305",
    office_hours: [
      { day: "Lunes", start_time: "14:00", end_time: "16:00" },
      { day: "Miércoles", start_time: "14:00", end_time: "16:00" },
      { day: "Viernes", start_time: "10:00", end_time: "12:00" }
    ],
    stats: {
      total_courses_taught: 24,
      total_students_taught: 680,
      average_student_rating: 4.8,
      total_assignments_created: 156,
      total_assignments_graded: 892,
      pending_grading: 12
    },
    teaching_preferences: {
      max_students_per_course: 35,
      preferred_subjects: ["Machine Learning", "Inteligencia Artificial"],
      grading_scale: "percentage"
    },
    research: {
      areas: ["Machine Learning", "Computer Vision", "Deep Learning"],
      publications: [
        {
          title: "Deep Learning aplicado al diagnóstico médico",
          year: 2023,
          journal: "IEEE Transactions on Medical Imaging",
          url: "https://doi.org/10.1109/example"
        },
        {
          title: "Transfer Learning en clasificación de imágenes",
          year: 2022,
          journal: "Journal of Machine Learning Research"
        }
      ]
    }
  },
  {
    name: "Mtra. Patricia López",
    email: "patricia.lopez@kampus.edu",
    status: "active",
    phone: "+52 555-3002",
    employee_id: "EMP-2020-042",
    hire_date: "2020-01-10",
    department: "Ingeniería de Software",
    position: "Profesora Asociada",
    bio: "Maestra en Ingeniería de Software con amplia experiencia en desarrollo web y mobile. Apasionada por la enseñanza de tecnologías modernas.",
    education: [
      {
        degree: "Maestría en Ingeniería de Software",
        institution: "Instituto Tecnológico",
        field_of_study: "Desarrollo de Software",
        graduation_year: 2018
      },
      {
        degree: "Ingeniería en Sistemas Computacionales",
        institution: "Universidad del Valle",
        field_of_study: "Sistemas",
        graduation_year: 2013
      }
    ],
    certifications: [
      {
        name: "Meta React Developer",
        issuer: "Meta (Facebook)",
        date_obtained: "2023-05-10",
      },
      {
        name: "Google Cloud Professional Developer",
        issuer: "Google Cloud",
        date_obtained: "2022-11-15",
        expiry_date: "2024-11-15"
      }
    ],
    specializations: ["Web Development", "Mobile Development", "React", "Node.js"],
    subjects_taught: [
      "Desarrollo Web",
      "Desarrollo Mobile",
      "Arquitectura de Software",
      "Programación Frontend"
    ],
    office_location: "Edificio B, Piso 2, Oficina 210",
    office_hours: [
      { day: "Martes", start_time: "15:00", end_time: "17:00" },
      { day: "Jueves", start_time: "15:00", end_time: "17:00" }
    ],
    stats: {
      total_courses_taught: 12,
      total_students_taught: 340,
      average_student_rating: 4.6,
      total_assignments_created: 78,
      total_assignments_graded: 425,
      pending_grading: 8
    },
    teaching_preferences: {
      max_students_per_course: 30,
      preferred_subjects: ["Desarrollo Web", "React"],
      grading_scale: "percentage"
    }
  },
  {
    name: "Ing. Miguel Torres",
    email: "miguel.torres@kampus.edu",
    status: "active",
    phone: "+52 555-3003",
    employee_id: "EMP-2019-033",
    hire_date: "2019-06-01",
    department: "Bases de Datos",
    position: "Profesor Auxiliar",
    bio: "Ingeniero con experiencia en diseño y administración de bases de datos. Enfocado en enseñar SQL, NoSQL y arquitecturas de datos modernas.",
    education: [
      {
        degree: "Ingeniería en Sistemas",
        institution: "Universidad Tecnológica",
        field_of_study: "Sistemas de Información",
        graduation_year: 2016
      }
    ],
    certifications: [
      {
        name: "MongoDB Certified Developer",
        issuer: "MongoDB Inc.",
        date_obtained: "2022-08-20",
      },
      {
        name: "Oracle Database Administrator",
        issuer: "Oracle",
        date_obtained: "2021-03-10",
      }
    ],
    specializations: ["Bases de Datos", "SQL", "NoSQL", "Data Architecture"],
    subjects_taught: [
      "Bases de Datos Fundamentales",
      "Bases de Datos Avanzadas",
      "NoSQL",
      "Diseño de Bases de Datos"
    ],
    office_location: "Edificio A, Piso 2, Oficina 215",
    office_hours: [
      { day: "Lunes", start_time: "16:00", end_time: "18:00" },
      { day: "Miércoles", start_time: "16:00", end_time: "18:00" }
    ],
    stats: {
      total_courses_taught: 8,
      total_students_taught: 220,
      average_student_rating: 4.5,
      total_assignments_created: 45,
      total_assignments_graded: 280,
      pending_grading: 5
    },
    teaching_preferences: {
      max_students_per_course: 28,
      preferred_subjects: ["Bases de Datos", "SQL"],
      grading_scale: "percentage"
    }
  }
];

// ========== ADMINISTRADORES DE EJEMPLO ==========

export const SAMPLE_ADMINS: Partial<CreateAdminInput>[] = [
  {
    name: "Lic. Fernando Méndez",
    email: "fernando.mendez@kampus.edu",
    status: "active",
    phone: "+52 555-4001",
    admin_level: "super_admin",
    employee_id: "ADM-2017-001",
    department: "Dirección de Tecnología",
    position: "Director de Sistemas",
    work_phone: "+52 555-4001 ext. 101",
    work_email: "fernando.mendez@kampus.edu",
    office_location: "Edificio Administrativo, Piso 3, Oficina 301",
    responsibilities: [
      "Dirección general de sistemas",
      "Supervisión de infraestructura tecnológica",
      "Gestión de personal técnico",
      "Toma de decisiones estratégicas"
    ],
    managed_departments: [
      "Tecnología",
      "Soporte Técnico",
      "Desarrollo",
      "Seguridad Informática"
    ],
    stats: {
      total_actions_performed: 2450,
      users_managed: 850,
      courses_approved: 120,
      reports_generated: 85,
      issues_resolved: 340,
    },
    admin_preferences: {
      default_view: "analytics",
      receive_system_alerts: true,
      receive_user_reports: true,
      notification_frequency: "realtime"
    }
  },
  {
    name: "Lic. Sandra Morales",
    email: "sandra.morales@kampus.edu",
    status: "active",
    phone: "+52 555-4002",
    admin_level: "admin",
    employee_id: "ADM-2019-005",
    department: "Administración Académica",
    position: "Administradora de Plataforma",
    work_phone: "+52 555-4002 ext. 205",
    work_email: "sandra.morales@kampus.edu",
    office_location: "Edificio Administrativo, Piso 2, Oficina 210",
    responsibilities: [
      "Gestión de usuarios y perfiles",
      "Aprobación de cursos",
      "Soporte a profesores",
      "Generación de reportes académicos"
    ],
    managed_departments: [
      "Ciencias de la Computación",
      "Ingeniería",
      "Matemáticas"
    ],
    permissions: {
      manage_users: true,
      manage_courses: true,
      manage_content: true,
      view_analytics: true,
      manage_settings: false,
      manage_reports: true,
      access_logs: true,
      system_configuration: false
    },
    stats: {
      total_actions_performed: 1580,
      users_managed: 450,
      courses_approved: 85,
      reports_generated: 52,
      issues_resolved: 180,
    },
    admin_preferences: {
      default_view: "users",
      receive_system_alerts: true,
      receive_user_reports: true,
      notification_frequency: "hourly"
    }
  },
  {
    name: "Mtro. Jorge Castillo",
    email: "jorge.castillo@kampus.edu",
    status: "active",
    phone: "+52 555-4003",
    admin_level: "moderator",
    employee_id: "ADM-2021-012",
    department: "Soporte Académico",
    position: "Moderador de Contenido",
    work_phone: "+52 555-4003 ext. 315",
    work_email: "jorge.castillo@kampus.edu",
    office_location: "Edificio B, Piso 1, Oficina 105",
    responsibilities: [
      "Moderación de contenido",
      "Revisión de cursos",
      "Atención a reportes de usuarios",
      "Soporte básico a estudiantes"
    ],
    managed_departments: [
      "Ciencias de la Computación"
    ],
    permissions: {
      manage_users: false,
      manage_courses: false,
      manage_content: true,
      view_analytics: true,
      manage_settings: false,
      manage_reports: false,
      access_logs: false,
      system_configuration: false
    },
    stats: {
      total_actions_performed: 680,
      users_managed: 0,
      courses_approved: 0,
      reports_generated: 15,
      issues_resolved: 120,
    },
    admin_preferences: {
      default_view: "courses",
      receive_system_alerts: false,
      receive_user_reports: true,
      notification_frequency: "daily"
    }
  }
];

// ========== FUNCIÓN HELPER PARA GENERAR USUARIOS ==========

/**
 * Obtiene todos los usuarios de ejemplo
 */
export function getAllSampleUsers() {
  return {
    students: SAMPLE_STUDENTS,
    teachers: SAMPLE_TEACHERS,
    admins: SAMPLE_ADMINS
  };
}

/**
 * Obtiene un usuario de ejemplo por email
 */
export function getSampleUserByEmail(email: string) {
  const allUsers = [
    ...SAMPLE_STUDENTS,
    ...SAMPLE_TEACHERS,
    ...SAMPLE_ADMINS
  ];
  
  return allUsers.find(user => user.email === email);
}

/**
 * Obtiene usuarios de ejemplo por rol
 */
export function getSampleUsersByRole(role: 'student' | 'teacher' | 'admin') {
  switch (role) {
    case 'student':
      return SAMPLE_STUDENTS;
    case 'teacher':
      return SAMPLE_TEACHERS;
    case 'admin':
      return SAMPLE_ADMINS;
    default:
      return [];
  }
}

