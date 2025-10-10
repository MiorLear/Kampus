# 🎨 Diagrama Visual de Perfiles de Usuario

Este documento proporciona una visualización de la estructura de los perfiles de usuario en Kampus.

---

## 📐 Jerarquía de Perfiles

```
                    ┌──────────────────┐
                    │   BaseUser       │
                    │  (Campos Base)   │
                    └────────┬─────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
              ▼              ▼              ▼
      ┌───────────┐  ┌───────────┐  ┌───────────┐
      │  Student  │  │  Teacher  │  │   Admin   │
      │  Profile  │  │  Profile  │  │  Profile  │
      └───────────┘  └───────────┘  └───────────┘
```

---

## 👨‍🎓 Estructura del Perfil de Estudiante

```
StudentProfile
├── 📋 Información Base
│   ├── id, name, email
│   ├── role: "student"
│   ├── status: active/inactive/suspended/pending
│   └── photo_url, phone, date_of_birth, gender
│
├── 🎓 Información Académica
│   ├── student_id (matrícula)
│   ├── enrollment_year
│   ├── program (carrera)
│   ├── semester
│   └── academic_level (beginner/intermediate/advanced)
│
├── 📊 Estadísticas
│   ├── total_courses_enrolled
│   ├── total_courses_completed
│   ├── average_grade
│   ├── total_assignments_submitted
│   ├── total_assignments_pending
│   ├── attendance_rate
│   └── total_study_hours
│
├── 🎯 Preferencias de Aprendizaje
│   ├── learning_style
│   ├── interests []
│   └── goals []
│
├── 👨‍👩‍👧 Contacto de Emergencia
│   ├── name
│   ├── relationship
│   ├── phone
│   └── email
│
└── ♿ Accesibilidad
    ├── requires_captions
    ├── requires_screen_reader
    ├── color_blind_mode
    └── other
```

---

## 👨‍🏫 Estructura del Perfil de Profesor

```
TeacherProfile
├── 📋 Información Base
│   ├── id, name, email
│   ├── role: "teacher"
│   ├── status: active/inactive/suspended/pending
│   └── photo_url, phone
│
├── 💼 Información Profesional
│   ├── employee_id
│   ├── hire_date
│   ├── department
│   └── position
│
├── 🎓 Educación
│   └── education []
│       ├── degree
│       ├── institution
│       ├── field_of_study
│       └── graduation_year
│
├── 📜 Certificaciones
│   └── certifications []
│       ├── name
│       ├── issuer
│       ├── date_obtained
│       └── expiry_date
│
├── 🔬 Especialización
│   ├── specializations []
│   ├── subjects_taught []
│   └── bio
│
├── 📍 Oficina y Disponibilidad
│   ├── office_location
│   └── office_hours []
│       ├── day
│       ├── start_time
│       └── end_time
│
├── 📊 Estadísticas de Enseñanza
│   ├── total_courses_taught
│   ├── total_students_taught
│   ├── average_student_rating
│   ├── total_assignments_created
│   ├── total_assignments_graded
│   └── pending_grading
│
├── ⚙️ Preferencias de Enseñanza
│   ├── max_students_per_course
│   ├── preferred_subjects []
│   └── grading_scale
│
└── 🔬 Investigación (Opcional)
    ├── areas []
    └── publications []
        ├── title
        ├── year
        ├── journal
        └── url
```

---

## 👨‍💼 Estructura del Perfil de Administrador

```
AdminProfile
├── 📋 Información Base
│   ├── id, name, email
│   ├── role: "admin"
│   ├── status: active/inactive/suspended/pending
│   └── photo_url, phone
│
├── 🛡️ Nivel Administrativo
│   └── admin_level
│       ├── super_admin (acceso total)
│       ├── admin (acceso estándar)
│       └── moderator (acceso limitado)
│
├── 💼 Información Administrativa
│   ├── employee_id
│   ├── department
│   ├── position
│   ├── work_phone
│   ├── work_email
│   └── office_location
│
├── 🔐 Sistema de Permisos
│   └── permissions
│       ├── manage_users
│       ├── manage_courses
│       ├── manage_content
│       ├── view_analytics
│       ├── manage_settings
│       ├── manage_payments
│       ├── manage_reports
│       ├── access_logs
│       └── system_configuration
│
├── 📋 Responsabilidades
│   ├── responsibilities []
│   └── managed_departments []
│
├── 📊 Estadísticas Administrativas
│   ├── total_actions_performed
│   ├── users_managed
│   ├── courses_approved
│   ├── reports_generated
│   ├── issues_resolved
│   └── last_activity
│
├── ⚙️ Preferencias de Admin
│   ├── default_view
│   ├── receive_system_alerts
│   ├── receive_user_reports
│   └── notification_frequency
│
└── 🔍 Auditoría
    ├── last_login_ip
    └── login_history []
        ├── timestamp
        ├── ip_address
        └── device
```

---

## 🔄 Flujo de Datos - Estudiante

```
┌──────────────┐
│   Usuario    │
│  (Estudiante)│
└──────┬───────┘
       │
       ▼
┌─────────────────────────────────┐
│  Firebase Authentication        │
│  - email                        │
│  - password                     │
└──────┬──────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│  Firestore - Collection: users  │
│                                 │
│  StudentProfile {               │
│    id: "abc123"                 │
│    role: "student"              │
│    student_id: "ST-2024-001"    │
│    stats: {                     │
│      average_grade: 9.2         │
│      total_courses_enrolled: 5  │
│    }                            │
│  }                              │
└──────┬──────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│  UI Components                  │
│  - StudentDashboard             │
│  - CourseViewer                 │
│  - EvaluationPlayer             │
└─────────────────────────────────┘
```

---

## 🔄 Flujo de Datos - Profesor

```
┌──────────────┐
│   Usuario    │
│  (Profesor)  │
└──────┬───────┘
       │
       ▼
┌─────────────────────────────────┐
│  Firebase Authentication        │
└──────┬──────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│  Firestore - Collection: users  │
│                                 │
│  TeacherProfile {               │
│    id: "xyz789"                 │
│    role: "teacher"              │
│    department: "CS"             │
│    stats: {                     │
│      total_courses_taught: 12   │
│      pending_grading: 15        │
│    }                            │
│  }                              │
└──────┬──────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│  UI Components                  │
│  - TeacherDashboard             │
│  - CourseEditor                 │
│  - EvaluationBuilder            │
│  - RosterManager                │
└─────────────────────────────────┘
```

---

## 🔄 Flujo de Datos - Administrador

```
┌──────────────┐
│   Usuario    │
│   (Admin)    │
└──────┬───────┘
       │
       ▼
┌─────────────────────────────────┐
│  Firebase Authentication        │
└──────┬──────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│  Firestore - Collection: users  │
│                                 │
│  AdminProfile {                 │
│    id: "admin001"               │
│    role: "admin"                │
│    admin_level: "super_admin"   │
│    permissions: {               │
│      manage_users: true         │
│      system_config: true        │
│    }                            │
│  }                              │
└──────┬──────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│  Permission Check               │
│  hasPermission(userId, perm)    │
└──────┬──────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│  UI Components                  │
│  - AdminDashboard               │
│  - UserManagement               │
│  - CourseManagement             │
│  - SystemSettings               │
│  - ActivityLogs                 │
└─────────────────────────────────┘
```

---

## 🔐 Sistema de Permisos - Flujo de Verificación

```
                    ┌──────────────┐
                    │   Acción     │
                    │  Solicitada  │
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐
                    │ ¿Es Admin?   │
                    └──────┬───────┘
                           │
                  ┌────────┴────────┐
                  │                 │
               NO │                 │ SÍ
                  ▼                 ▼
          ┌──────────┐      ┌─────────────────┐
          │ Denegar  │      │ Obtener Perfil  │
          │ Acceso   │      │   de Admin      │
          └──────────┘      └────────┬─────────┘
                                     │
                                     ▼
                            ┌─────────────────┐
                            │ Verificar       │
                            │ Permiso         │
                            │ Específico      │
                            └────────┬─────────┘
                                     │
                            ┌────────┴────────┐
                            │                 │
                         NO │                 │ SÍ
                            ▼                 ▼
                    ┌──────────┐      ┌──────────┐
                    │ Denegar  │      │ Permitir │
                    │ Acceso   │      │ Acción   │
                    └──────────┘      └──────────┘
```

---

## 📊 Actualización de Estadísticas - Eventos

```
ESTUDIANTE:
  Evento                          → Estadística Actualizada
  ────────────────────────────────────────────────────────
  ✓ Se inscribe a curso           → total_courses_enrolled++
  ✓ Completa un curso             → total_courses_completed++
  ✓ Entrega una tarea             → total_assignments_submitted++
  ✓ Recibe calificación           → Recalcular average_grade
  ✓ Registra asistencia           → Recalcular attendance_rate
  ✓ Sesión de estudio             → total_study_hours += horas

PROFESOR:
  Evento                          → Estadística Actualizada
  ────────────────────────────────────────────────────────
  ✓ Publica un curso              → total_courses_taught++
  ✓ Estudiante se inscribe        → total_students_taught++
  ✓ Crea una tarea                → total_assignments_created++
  ✓ Califica una tarea            → total_assignments_graded++
                                    pending_grading--
  ✓ Recibe rating de estudiante   → Recalcular average_student_rating

ADMINISTRADOR:
  Evento                          → Estadística Actualizada
  ────────────────────────────────────────────────────────
  ✓ Gestiona un usuario           → users_managed++
  ✓ Aprueba/rechaza curso         → courses_approved++
  ✓ Genera un reporte             → reports_generated++
  ✓ Resuelve un problema          → issues_resolved++
  ✓ Cualquier acción              → total_actions_performed++
```

---

## 🎨 Interfaz de Usuario por Rol

```
┌────────────────────────────────────────────────────┐
│              ESTUDIANTE DASHBOARD                  │
├────────────────────────────────────────────────────┤
│                                                    │
│  👤 Perfil                    📊 Estadísticas     │
│  ├─ Foto                      ├─ Promedio: 9.2   │
│  ├─ Nombre                    ├─ Cursos: 5/8     │
│  ├─ Matrícula                 └─ Tareas: 28/31   │
│  └─ Programa                                      │
│                                                    │
│  📚 Mis Cursos                 📝 Tareas          │
│  ├─ Curso 1 [90%]             ├─ Tarea 1 [Due]   │
│  ├─ Curso 2 [75%]             ├─ Tarea 2         │
│  └─ Curso 3 [60%]             └─ Tarea 3         │
│                                                    │
└────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────┐
│              PROFESOR DASHBOARD                    │
├────────────────────────────────────────────────────┤
│                                                    │
│  👤 Perfil                    📊 Estadísticas     │
│  ├─ Foto                      ├─ Cursos: 12      │
│  ├─ Nombre                    ├─ Estudiantes: 340│
│  ├─ Departamento              └─ Por calificar: 15│
│  └─ Especialización                               │
│                                                    │
│  📚 Mis Cursos                 ✏️ Calificar      │
│  ├─ Curso A [35 alumnos]      ├─ Tarea 1 (10)    │
│  ├─ Curso B [28 alumnos]      ├─ Tarea 2 (5)     │
│  └─ Curso C [30 alumnos]      └─ Examen 1 (0)    │
│                                                    │
│  🏢 Horario de Oficina                            │
│  ├─ Lunes 14:00-16:00                            │
│  └─ Miércoles 14:00-16:00                        │
│                                                    │
└────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────┐
│              ADMIN DASHBOARD                       │
├────────────────────────────────────────────────────┤
│                                                    │
│  👤 Perfil                    📊 Sistema          │
│  ├─ Nombre                    ├─ Usuarios: 850   │
│  ├─ Nivel: Super Admin        ├─ Cursos: 120     │
│  └─ Departamento              └─ Activos: 680    │
│                                                    │
│  👥 Gestión                   📈 Analíticas       │
│  ├─ Usuarios                  ├─ Por departamento│
│  ├─ Cursos                    ├─ Por mes         │
│  ├─ Contenido                 └─ Tendencias      │
│  └─ Reportes                                      │
│                                                    │
│  🔐 Permisos                  🔍 Logs             │
│  ├─ Usuarios ✓                ├─ Últimas acciones│
│  ├─ Cursos ✓                  ├─ Errores         │
│  ├─ Config ✓                  └─ Alertas         │
│  └─ Sistema ✓                                     │
│                                                    │
└────────────────────────────────────────────────────┘
```

---

## 🔄 Ciclo de Vida de un Usuario

```
    ┌────────────┐
    │  Registro  │
    └─────┬──────┘
          │
          ▼
    ┌────────────┐         ┌──────────────┐
    │  Pending   │────────>│  Verificar   │
    │  (Estado)  │         │    Email     │
    └────────────┘         └──────┬───────┘
                                  │
                                  ▼
                          ┌──────────────┐
                          │    Active    │
                          │   (Estado)   │
                          └──────┬───────┘
                                 │
                    ┌────────────┼────────────┐
                    │                         │
                    ▼                         ▼
            ┌──────────────┐         ┌──────────────┐
            │   Inactive   │         │  Suspended   │
            │   (Estado)   │         │   (Estado)   │
            └──────┬───────┘         └──────┬───────┘
                   │                        │
                   └────────────┬───────────┘
                                │
                                ▼
                        ┌──────────────┐
                        │  Reactivar   │
                        │   o Borrar   │
                        └──────────────┘
```

---

## 📋 Resumen de Archivos Creados

```
Kampus/
│
├── 📄 PERFILES_DE_USUARIO.md         (Documentación completa)
├── 📄 QUICK_REFERENCE.md             (Referencia rápida)
├── 📄 DIAGRAMA_PERFILES.md           (Este archivo)
│
├── src/
│   ├── types/
│   │   └── 📝 user-profiles.ts       (Definiciones TypeScript)
│   │
│   ├── services/
│   │   └── 🔧 user-profile.service.ts (Servicios CRUD)
│   │
│   ├── data/
│   │   └── 👥 sample-users.ts        (Usuarios de ejemplo)
│   │
│   ├── utils/
│   │   └── 🌱 seed-profiles.ts       (Script de seeding)
│   │
│   └── components/
│       └── 🎨 SeedProfiles.tsx       (UI para seeding)
│
└── 📄 README.md                       (Actualizado con info de perfiles)
```

---

**Fecha:** Octubre 2024  
**Versión:** 1.0.0

