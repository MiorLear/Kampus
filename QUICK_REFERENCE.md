# 📋 Referencia Rápida - Perfiles de Usuario Kampus

## 🆚 Comparación de Perfiles

| Característica | 👨‍🎓 Estudiante | 👨‍🏫 Profesor | 👨‍💼 Admin |
|----------------|-----------------|----------------|-------------|
| **Acceso a cursos** | ✅ Ver y tomar | ✅ Crear y gestionar | ✅ Ver todos |
| **Calificaciones** | ✅ Ver las suyas | ✅ Asignar y ver | ✅ Ver todas |
| **Gestión de usuarios** | ❌ | ❌ | ✅ |
| **Analíticas** | ✅ Personales | ✅ De sus cursos | ✅ Del sistema |
| **Permisos configurables** | ❌ | ❌ | ✅ |
| **Estadísticas incluidas** | ✅ Académicas | ✅ Enseñanza | ✅ Administrativas |

---

## 👨‍🎓 Perfil de Estudiante - Vista Rápida

### Campos Clave
```typescript
{
  role: 'student',
  student_id: "ST-2024-001",
  program: "Ingeniería en Software",
  semester: 3,
  academic_level: "intermediate",
  
  stats: {
    average_grade: 9.2,
    total_courses_enrolled: 5,
    total_courses_completed: 2
  }
}
```

### Casos de Uso
- 📚 Inscribirse a cursos
- 📝 Entregar tareas
- 📊 Ver progreso académico
- 🎯 Establecer metas de aprendizaje

---

## 👨‍🏫 Perfil de Profesor - Vista Rápida

### Campos Clave
```typescript
{
  role: 'teacher',
  employee_id: "EMP-2020-042",
  department: "Ciencias de la Computación",
  position: "Profesor Titular",
  
  education: [
    {
      degree: "Doctorado",
      field_of_study: "Machine Learning"
    }
  ],
  
  stats: {
    total_courses_taught: 12,
    average_student_rating: 4.8,
    pending_grading: 15
  }
}
```

### Casos de Uso
- 📖 Crear y publicar cursos
- ✏️ Crear tareas y exámenes
- ✅ Calificar trabajos
- 📈 Ver estadísticas de estudiantes
- 👥 Gestionar roster de clase

---

## 👨‍💼 Perfil de Administrador - Vista Rápida

### Niveles de Admin
1. **Super Admin** - Acceso total
2. **Admin** - Acceso estándar
3. **Moderator** - Acceso limitado

### Campos Clave
```typescript
{
  role: 'admin',
  admin_level: 'super_admin',
  
  permissions: {
    manage_users: true,
    manage_courses: true,
    view_analytics: true,
    system_configuration: true
  },
  
  stats: {
    users_managed: 850,
    courses_approved: 120,
    issues_resolved: 340
  }
}
```

### Casos de Uso
- 👥 Gestionar usuarios (crear, editar, desactivar)
- 📚 Aprobar/rechazar cursos
- 📊 Ver analíticas del sistema
- ⚙️ Configurar el sistema
- 📝 Generar reportes
- 🔍 Revisar logs de actividad

---

## 🚀 Acciones Comunes por Rol

### Estudiante
```typescript
// Ver mi progreso
const stats = await UserProfileService.getUserProfile(studentId);
console.log(`Promedio: ${stats.stats?.average_grade}`);

// Actualizar cuando completo un curso
await UserProfileService.updateStudentStats(studentId, {
  total_courses_completed: stats.stats.total_courses_completed + 1
});
```

### Profesor
```typescript
// Ver mis estadísticas de enseñanza
const profile = await UserProfileService.getUserProfile(teacherId);
console.log(`Estudiantes enseñados: ${profile.stats?.total_students_taught}`);

// Actualizar cuando califico tareas
await UserProfileService.updateTeacherStats(teacherId, {
  total_assignments_graded: current + 1,
  pending_grading: pending - 1
});
```

### Administrador
```typescript
// Verificar permisos
const canManage = await UserProfileService.hasPermission(
  adminId, 
  'manage_users'
);

// Actualizar permisos
await UserProfileService.updateAdminPermissions(adminId, {
  manage_settings: true,
  system_configuration: false
});
```

---

## 📊 Estadísticas por Perfil

### 👨‍🎓 Estudiante
- `total_courses_enrolled` - Cursos inscritos
- `total_courses_completed` - Cursos completados
- `average_grade` - Promedio general
- `total_assignments_submitted` - Tareas entregadas
- `total_assignments_pending` - Tareas pendientes
- `attendance_rate` - % de asistencia
- `total_study_hours` - Horas de estudio

### 👨‍🏫 Profesor
- `total_courses_taught` - Cursos impartidos
- `total_students_taught` - Estudiantes enseñados
- `average_student_rating` - Calificación promedio
- `total_assignments_created` - Tareas creadas
- `total_assignments_graded` - Tareas calificadas
- `pending_grading` - Por calificar

### 👨‍💼 Administrador
- `total_actions_performed` - Acciones realizadas
- `users_managed` - Usuarios gestionados
- `courses_approved` - Cursos aprobados
- `reports_generated` - Reportes generados
- `issues_resolved` - Problemas resueltos

---

## 🔐 Matriz de Permisos (Admins)

| Permiso | Super Admin | Admin | Moderator |
|---------|-------------|-------|-----------|
| `manage_users` | ✅ | ✅ | ❌ |
| `manage_courses` | ✅ | ✅ | ❌ |
| `manage_content` | ✅ | ✅ | ✅ |
| `view_analytics` | ✅ | ✅ | ✅ |
| `manage_settings` | ✅ | ❌ | ❌ |
| `manage_reports` | ✅ | ✅ | ❌ |
| `access_logs` | ✅ | ✅ | ❌ |
| `system_configuration` | ✅ | ❌ | ❌ |

---

## 📝 Usuarios de Ejemplo

### Estudiantes
| Nombre | Email | Nivel | Programa |
|--------|-------|-------|----------|
| María González | maria.gonzalez@kampus.edu | Intermediate | Ingeniería en Software |
| Carlos Ramírez | carlos.ramirez@kampus.edu | Beginner | Ciencias de la Computación |
| Laura Martínez | laura.martinez@kampus.edu | Advanced | Ingeniería en Datos |

### Profesores
| Nombre | Email | Departamento | Especialidad |
|--------|-------|--------------|--------------|
| Dr. Roberto Sánchez | roberto.sanchez@kampus.edu | Ciencias de la Computación | Machine Learning |
| Mtra. Patricia López | patricia.lopez@kampus.edu | Ingeniería de Software | Web Development |
| Ing. Miguel Torres | miguel.torres@kampus.edu | Bases de Datos | SQL/NoSQL |

### Administradores
| Nombre | Email | Nivel | Área |
|--------|-------|-------|------|
| Lic. Fernando Méndez | fernando.mendez@kampus.edu | Super Admin | Dirección de Tecnología |
| Lic. Sandra Morales | sandra.morales@kampus.edu | Admin | Administración Académica |
| Mtro. Jorge Castillo | jorge.castillo@kampus.edu | Moderator | Soporte Académico |

**Contraseña para todos:** `Kampus2024!`

---

## 🔄 Flujos Comunes

### Estudiante se inscribe a un curso
1. Usuario selecciona curso
2. Sistema verifica disponibilidad
3. Crea enrollment
4. **Actualiza stats del estudiante:**
   ```typescript
   updateStudentStats(studentId, {
     total_courses_enrolled: current + 1
   })
   ```

### Profesor califica una tarea
1. Profesor revisa submission
2. Asigna calificación
3. Guarda feedback
4. **Actualiza stats del profesor:**
   ```typescript
   updateTeacherStats(teacherId, {
     total_assignments_graded: current + 1,
     pending_grading: pending - 1
   })
   ```

### Admin aprueba un curso
1. Admin revisa curso pendiente
2. Verifica permisos: `hasPermission(adminId, 'manage_courses')`
3. Aprueba/rechaza curso
4. **Actualiza stats del admin:**
   ```typescript
   updateAdminStats(adminId, {
     courses_approved: current + 1,
     total_actions_performed: actions + 1
   })
   ```

---

## 📚 Recursos

- 📖 [PERFILES_DE_USUARIO.md](./PERFILES_DE_USUARIO.md) - Documentación completa
- 💻 `src/types/user-profiles.ts` - Definiciones de tipos
- 🔧 `src/services/user-profile.service.ts` - Servicios
- 👥 `src/data/sample-users.ts` - Usuarios de ejemplo
- 🌱 `src/utils/seed-profiles.ts` - Script de seeding

---

**Última actualización:** Octubre 2024

