# 📋 Perfiles de Usuario - Sistema Kampus

Este documento describe los 3 tipos de perfiles de usuario en el sistema Kampus y cómo están estructurados.

## 🎯 Tipos de Perfiles

El sistema Kampus soporta tres tipos de usuarios:

1. **Estudiante (Student)** - Usuarios que toman cursos
2. **Profesor (Teacher)** - Usuarios que imparten cursos
3. **Administrador (Admin)** - Usuarios que gestionan el sistema

---

## 👨‍🎓 1. PERFIL DE ESTUDIANTE

### Descripción
El perfil de estudiante está diseñado para usuarios que se inscriben y toman cursos en la plataforma. Incluye toda la información académica, estadísticas de progreso y preferencias de aprendizaje.

### Campos Principales

#### Información Personal Básica
- `name`: Nombre completo
- `email`: Correo electrónico
- `photo_url`: URL de foto de perfil
- `phone`: Teléfono de contacto
- `date_of_birth`: Fecha de nacimiento
- `gender`: Género (male, female, other, prefer_not_to_say)
- `address`: Dirección completa (calle, ciudad, estado, país, código postal)

#### Información Académica
- `student_id`: Matrícula o código de estudiante
- `enrollment_year`: Año de ingreso
- `expected_graduation`: Fecha esperada de graduación
- `program`: Carrera o programa de estudios (ej: "Ingeniería en Sistemas")
- `semester`: Semestre actual
- `academic_level`: Nivel académico (beginner, intermediate, advanced)

#### Contacto de Emergencia
```typescript
emergency_contact: {
  name: "María López",
  relationship: "Madre",
  phone: "+52 555-1234",
  email: "maria.lopez@email.com"
}
```

#### Estadísticas Académicas
```typescript
stats: {
  total_courses_enrolled: 5,        // Cursos inscritos
  total_courses_completed: 2,       // Cursos completados
  average_grade: 8.5,               // Promedio general
  total_assignments_submitted: 15,  // Tareas entregadas
  total_assignments_pending: 3,     // Tareas pendientes
  attendance_rate: 95,              // % de asistencia
  total_study_hours: 120            // Horas de estudio
}
```

#### Preferencias de Aprendizaje
- `learning_style`: Estilo de aprendizaje (visual, auditory, kinesthetic, reading_writing)
- `interests`: Array de intereses (ej: ["programación", "diseño", "matemáticas"])
- `goals`: Objetivos académicos

#### Accesibilidad
```typescript
accessibility_needs: {
  requires_captions: true,          // Necesita subtítulos
  requires_screen_reader: false,    // Lector de pantalla
  color_blind_mode: false,          // Modo daltónico
  other: "Requiere fuente grande"
}
```

### Ejemplo de Uso

```typescript
import { UserProfileService } from './services/user-profile.service';

// Crear un nuevo estudiante
const nuevoEstudiante = await UserProfileService.createStudentProfile(userId, {
  name: "Juan Pérez",
  email: "juan.perez@email.com",
  phone: "+52 555-1234",
  student_id: "ST-2024-001",
  enrollment_year: 2024,
  program: "Ingeniería en Software",
  semester: 1,
  academic_level: "beginner",
  interests: ["programación", "inteligencia artificial"],
  learning_style: "visual"
});

// Actualizar estadísticas
await UserProfileService.updateStudentStats(userId, {
  total_courses_enrolled: 3,
  average_grade: 9.0
});
```

---

## 👨‍🏫 2. PERFIL DE PROFESOR

### Descripción
El perfil de profesor está diseñado para usuarios que crean e imparten cursos. Incluye información profesional, credenciales académicas, especialización y estadísticas de enseñanza.

### Campos Principales

#### Información Profesional
- `employee_id`: Número de empleado
- `hire_date`: Fecha de contratación
- `department`: Departamento (ej: "Ciencias de la Computación")
- `position`: Puesto (ej: "Profesor Titular", "Profesor Auxiliar")

#### Educación y Credenciales
```typescript
education: [
  {
    degree: "Doctorado en Ciencias de la Computación",
    institution: "Universidad Nacional",
    field_of_study: "Inteligencia Artificial",
    graduation_year: 2018
  },
  {
    degree: "Maestría en Software Engineering",
    institution: "Instituto Tecnológico",
    field_of_study: "Desarrollo de Software",
    graduation_year: 2014
  }
]
```

```typescript
certifications: [
  {
    name: "AWS Certified Solutions Architect",
    issuer: "Amazon Web Services",
    date_obtained: "2023-06-15",
    expiry_date: "2026-06-15"
  }
]
```

#### Especialización
- `specializations`: Array de especializaciones (ej: ["Machine Learning", "Web Development"])
- `subjects_taught`: Materias que imparte (ej: ["Programación", "Algoritmos", "Bases de Datos"])

#### Información de Contacto y Disponibilidad
- `bio`: Biografía profesional
- `office_location`: Ubicación de oficina (ej: "Edificio A, Piso 3, Oficina 301")

```typescript
office_hours: [
  {
    day: "Lunes",
    start_time: "14:00",
    end_time: "16:00"
  },
  {
    day: "Miércoles",
    start_time: "14:00",
    end_time: "16:00"
  }
]
```

#### Estadísticas de Enseñanza
```typescript
stats: {
  total_courses_taught: 12,           // Cursos impartidos
  total_students_taught: 350,         // Estudiantes enseñados
  average_student_rating: 4.7,        // Calificación promedio
  total_assignments_created: 85,      // Tareas creadas
  total_assignments_graded: 420,      // Tareas calificadas
  pending_grading: 15                 // Por calificar
}
```

#### Preferencias de Enseñanza
```typescript
teaching_preferences: {
  max_students_per_course: 30,
  preferred_subjects: ["Programación", "Machine Learning"],
  grading_scale: "percentage"  // o "letter", "points"
}
```

#### Investigación (Opcional)
```typescript
research: {
  areas: ["Machine Learning", "Computer Vision"],
  publications: [
    {
      title: "Deep Learning aplicado a reconocimiento de imágenes",
      year: 2023,
      journal: "IEEE Transactions",
      url: "https://doi.org/..."
    }
  ]
}
```

### Ejemplo de Uso

```typescript
// Crear un nuevo profesor
const nuevoProfesor = await UserProfileService.createTeacherProfile(userId, {
  name: "Dra. Ana García",
  email: "ana.garcia@kampus.edu",
  employee_id: "EMP-2020-042",
  department: "Ciencias de la Computación",
  position: "Profesora Titular",
  bio: "Doctora en Ciencias de la Computación con 15 años de experiencia...",
  specializations: ["Machine Learning", "Data Science"],
  subjects_taught: ["Inteligencia Artificial", "Machine Learning"],
  office_location: "Edificio B, Piso 2, Oficina 205"
});

// Actualizar estadísticas de enseñanza
await UserProfileService.updateTeacherStats(userId, {
  total_courses_taught: 15,
  total_students_taught: 450,
  average_student_rating: 4.8
});
```

---

## 👨‍💼 3. PERFIL DE ADMINISTRADOR

### Descripción
El perfil de administrador está diseñado para usuarios que gestionan el sistema, usuarios, cursos y configuraciones. Incluye niveles de permisos y capacidades de auditoría.

### Niveles de Administrador
- `super_admin`: Acceso total al sistema
- `admin`: Acceso administrativo estándar
- `moderator`: Acceso limitado de moderación

### Campos Principales

#### Información Administrativa
- `admin_level`: Nivel de administrador
- `employee_id`: Número de empleado
- `department`: Departamento administrativo
- `position`: Puesto (ej: "Director de Sistemas", "Administrador de Plataforma")

#### Permisos del Sistema
```typescript
permissions: {
  manage_users: true,              // Gestionar usuarios
  manage_courses: true,            // Gestionar cursos
  manage_content: true,            // Gestionar contenido
  view_analytics: true,            // Ver analíticas
  manage_settings: true,           // Configuración del sistema
  manage_payments: false,          // Gestionar pagos
  manage_reports: true,            // Generar reportes
  access_logs: true,               // Acceder logs
  system_configuration: true       // Configuración avanzada
}
```

#### Responsabilidades
```typescript
responsibilities: [
  "Gestión de usuarios",
  "Supervisión de cursos",
  "Generación de reportes mensuales",
  "Soporte técnico nivel 2"
]

managed_departments: [
  "Ciencias de la Computación",
  "Ingeniería",
  "Matemáticas"
]
```

#### Contacto Profesional
- `work_phone`: Teléfono de trabajo
- `work_email`: Email corporativo
- `office_location`: Ubicación de oficina

#### Estadísticas Administrativas
```typescript
stats: {
  total_actions_performed: 1250,    // Acciones realizadas
  users_managed: 580,               // Usuarios gestionados
  courses_approved: 45,             // Cursos aprobados
  reports_generated: 32,            // Reportes generados
  issues_resolved: 95,              // Problemas resueltos
  last_activity: "2024-01-15T10:30:00Z"
}
```

#### Preferencias Administrativas
```typescript
admin_preferences: {
  default_view: "dashboard",              // Vista por defecto
  receive_system_alerts: true,            // Alertas del sistema
  receive_user_reports: true,             // Reportes de usuarios
  notification_frequency: "realtime"      // realtime, hourly, daily
}
```

#### Auditoría y Seguridad
```typescript
audit_trail: {
  last_login_ip: "192.168.1.100",
  login_history: [
    {
      timestamp: "2024-01-15T09:00:00Z",
      ip_address: "192.168.1.100",
      device: "Chrome on Windows"
    }
  ]
}
```

### Ejemplo de Uso

```typescript
// Crear un nuevo administrador
const nuevoAdmin = await UserProfileService.createAdminProfile(userId, {
  name: "Carlos Rodríguez",
  email: "carlos.rodriguez@kampus.edu",
  admin_level: "admin",
  employee_id: "ADM-2021-005",
  department: "Tecnología",
  position: "Administrador de Plataforma",
  responsibilities: [
    "Gestión de usuarios",
    "Configuración del sistema"
  ]
});

// Crear un super administrador (acceso completo)
const superAdmin = await UserProfileService.createAdminProfile(
  userId,
  { name: "...", email: "..." },
  true  // isSuperAdmin = true
);

// Verificar permisos
const tienePermiso = await UserProfileService.hasPermission(
  userId,
  'manage_users'
);

// Actualizar permisos
await UserProfileService.updateAdminPermissions(userId, {
  manage_settings: true,
  system_configuration: false
});
```

---

## 🔄 Campos Comunes a Todos los Perfiles

Todos los perfiles heredan estos campos base:

### Estado del Usuario
```typescript
status: "active" | "inactive" | "suspended" | "pending"
```

### Preferencias del Usuario
```typescript
preferences: {
  language: "es" | "en",              // Idioma
  timezone: "America/Mexico_City",    // Zona horaria
  notifications_enabled: true,        // Notificaciones
  theme: "light" | "dark" | "auto"    // Tema visual
}
```

### Metadata del Sistema
- `created_at`: Fecha de creación
- `updated_at`: Última actualización
- `last_login`: Último inicio de sesión
- `email_verified`: Email verificado (true/false)

---

## 🚀 Guía de Implementación

### 1. Importar los tipos y servicios

```typescript
import { 
  StudentProfile, 
  TeacherProfile, 
  AdminProfile 
} from './types/user-profiles';
import { UserProfileService } from './services/user-profile.service';
```

### 2. Crear un usuario según su rol

```typescript
// Estudiante
const student = await UserProfileService.createStudentProfile(userId, {
  name: "...",
  email: "...",
  program: "Ingeniería en Software"
});

// Profesor
const teacher = await UserProfileService.createTeacherProfile(userId, {
  name: "...",
  email: "...",
  department: "Ciencias de la Computación"
});

// Administrador
const admin = await UserProfileService.createAdminProfile(userId, {
  name: "...",
  email: "...",
  admin_level: "admin"
});
```

### 3. Obtener y actualizar perfiles

```typescript
// Obtener perfil
const profile = await UserProfileService.getUserProfile(userId);

// Actualizar según el tipo
if (profile?.role === 'student') {
  await UserProfileService.updateStudentProfile(userId, {
    semester: 3,
    academic_level: "intermediate"
  });
}

// Actualizar último login
await UserProfileService.updateLastLogin(userId);

// Cambiar estado
await UserProfileService.updateUserStatus(userId, "active");
```

### 4. Type Guards (Verificar tipo de perfil)

```typescript
import { isStudentProfile, isTeacherProfile, isAdminProfile } from './types/user-profiles';

const profile = await UserProfileService.getUserProfile(userId);

if (isStudentProfile(profile)) {
  console.log(`Estudiante: ${profile.student_id}`);
  console.log(`Promedio: ${profile.stats?.average_grade}`);
}

if (isTeacherProfile(profile)) {
  console.log(`Profesor: ${profile.department}`);
  console.log(`Cursos impartidos: ${profile.stats?.total_courses_taught}`);
}

if (isAdminProfile(profile)) {
  console.log(`Admin nivel: ${profile.admin_level}`);
  console.log(`Permisos: ${JSON.stringify(profile.permissions)}`);
}
```

---

## 📊 Casos de Uso Comunes

### Estudiante se inscribe a un curso

```typescript
// Actualizar estadísticas cuando un estudiante se inscribe
await UserProfileService.updateStudentStats(studentId, {
  total_courses_enrolled: currentStats.total_courses_enrolled + 1
});
```

### Profesor califica tareas

```typescript
// Actualizar estadísticas cuando un profesor califica
await UserProfileService.updateTeacherStats(teacherId, {
  total_assignments_graded: currentStats.total_assignments_graded + 1,
  pending_grading: currentStats.pending_grading - 1
});
```

### Admin aprueba un curso

```typescript
// Actualizar estadísticas de administrador
await UserProfileService.updateAdminStats(adminId, {
  courses_approved: currentStats.courses_approved + 1,
  total_actions_performed: currentStats.total_actions_performed + 1
});
```

---

## 🔐 Seguridad y Permisos

### Verificación de permisos para administradores

```typescript
// Verificar antes de realizar acción administrativa
const canManageUsers = await UserProfileService.hasPermission(
  adminId,
  'manage_users'
);

if (canManageUsers) {
  // Proceder con la acción
} else {
  throw new Error('No tienes permiso para esta acción');
}
```

---

## 📝 Notas Importantes

1. **Campos Opcionales**: Muchos campos son opcionales para facilitar el onboarding inicial. Puedes completarlos gradualmente.

2. **Estadísticas Automáticas**: Las estadísticas deben actualizarse automáticamente cuando ocurren eventos relevantes (inscripciones, calificaciones, etc.).

3. **Validación**: Implementa validación en el frontend antes de enviar datos al servicio.

4. **Privacidad**: Respeta la privacidad de los usuarios. No todos los campos deben ser visibles para todos los roles.

5. **Extensibilidad**: La estructura permite agregar campos adicionales sin afectar los existentes.

---

## 🔄 Migración de Perfiles Antiguos

Si tienes usuarios con la estructura antigua, puedes migrarlos:

```typescript
// Ejemplo de migración de perfil simple a perfil completo
async function migrateOldProfile(oldProfile: any) {
  const userId = oldProfile.id;
  
  if (oldProfile.role === 'student') {
    await UserProfileService.createStudentProfile(userId, {
      name: oldProfile.name,
      email: oldProfile.email,
      photo_url: oldProfile.photo_url,
      status: 'active',
      academic_level: 'beginner'
    });
  }
  // Similar para teacher y admin...
}
```

---

## 📚 Recursos Adicionales

- Ver `src/types/user-profiles.ts` para todas las definiciones de tipos
- Ver `src/services/user-profile.service.ts` para todos los métodos disponibles
- Consulta `firestore.rules` para las reglas de seguridad de Firebase

---

**Fecha de última actualización**: Octubre 2024  
**Versión**: 1.0.0

