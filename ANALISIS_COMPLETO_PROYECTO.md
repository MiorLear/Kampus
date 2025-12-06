# 📊 Análisis Completo del Proyecto Kampus

## 🏗️ Estructura General del Proyecto

### Arquitectura
El proyecto **Kampus** es un LMS (Learning Management System) con arquitectura **full-stack separada**:

- **Frontend**: React 18 + TypeScript + Vite (puerto 3000)
- **Backend**: Flask (Python) + Firebase Firestore (puerto 8000)
- **Base de Datos**: Firebase Firestore
- **Autenticación**: Firebase Auth con tokens JWT

### Migración Reciente
- ✅ Backend migrado de TypeScript a **Python/Flask**
- ✅ Frontend permanece en **TypeScript/React**
- ⚠️ Backend Python aún no tiene middleware de autenticación implementado (extracción de `student_id` del token)

---

## 📁 Estructura de Carpetas

```
Kampus/
├── src/                          # Frontend (React + TypeScript)
│   ├── components/
│   │   ├── admin/               # 14 componentes de administración
│   │   ├── teacher/             # 5 componentes de profesor
│   │   ├── student/             # 3 componentes de estudiante
│   │   ├── auth/                # Autenticación
│   │   ├── profiles/            # Sistema de perfiles
│   │   └── ui/                  # Componentes UI reutilizables (Shadcn)
│   ├── services/
│   │   ├── api.service.ts       # Servicio API (comunicación con backend)
│   │   ├── firestore.service.ts # Servicio Firestore (legacy)
│   │   └── auth.service.ts      # Servicio de autenticación
│   ├── hooks/
│   │   └── useFirestore.ts      # Hooks personalizados
│   ├── pages/
│   │   ├── DashboardPage.tsx    # Página principal
│   │   ├── LoginPage.tsx        # Página de login
│   │   └── ProfilePage.tsx      # Página de perfil
│   └── api/
│       ├── client.ts            # Cliente HTTP (Axios)
│       └── endpoints.ts         # Definición de endpoints
│
├── backend/                      # Backend (Flask + Python)
│   ├── app/
│   │   ├── api/                 # API Layer (Blueprints Flask)
│   │   ├── services/            # Service Layer (Lógica de negocio)
│   │   └── repositories/        # Repository Layer (Acceso a datos)
│   └── run.py                   # Servidor de desarrollo
│
└── [documentación].md           # Múltiples archivos de documentación
```

---

## 👨‍💼 Análisis de Componentes de ADMIN

### Componentes Disponibles (14 archivos)

1. **AdminDashboard.tsx** - Dashboard principal
2. **UserManagement.tsx** - Gestión de usuarios (CRUD)
3. **CourseManagement.tsx** - Gestión de cursos
4. **AssignmentManagement.tsx** - Gestión de asignaciones
5. **EnrollmentManagement.tsx** - Gestión de inscripciones
6. **MessageManagement.tsx** - Gestión de mensajes
7. **AdminAnalytics.tsx** - Analíticas del sistema
8. **ActivityLogs.tsx** - Registros de actividad
9. **ReportsExport.tsx** - Exportación de reportes
10. **SystemSettings.tsx** - Configuración del sistema
11. **AssignmentEditor.tsx** - Editor de asignaciones
12. **CourseAssignmentsDialog.tsx** - Diálogo de asignaciones de curso
13. **CourseModulesDialog.tsx** - Diálogo de módulos de curso
14. **CoverImageUpload.tsx** - Subida de imágenes de portada

### Dashboard de Admin

**Tabs disponibles:**
- `overview` - Vista general con analíticas
- `users` - Gestión de usuarios
- `courses` - Gestión de cursos
- `assignments` - Gestión de asignaciones
- `enrollments` - Gestión de inscripciones
- `messages` - Gestión de mensajes
- `activity` - Registros de actividad
- `reports` - Exportación de reportes
- `settings` - Configuración del sistema

### Elementos UI/UX de Admin

#### 1. **UserManagement.tsx**
- **Tabla de usuarios** con búsqueda y filtros por rol
- **Funcionalidades**:
  - Búsqueda por nombre/email
  - Filtro por rol (student/teacher/admin/all)
  - Edición de usuarios (diálogo modal)
  - Eliminación de usuarios (confirmación)
  - Visualización de datos: nombre, email, rol, fecha de creación
- **Componentes UI utilizados**:
  - `Table` (Shadcn)
  - `Dialog` para edición
  - `AlertDialog` para confirmación de eliminación
  - `Select` para filtros de rol
  - `Input` para búsqueda
  - `Badge` para roles

#### 2. **CourseManagement.tsx**
- **Gestión completa de cursos**:
  - Listado de cursos con estadísticas (estudiantes, progreso promedio, asignaciones)
  - Búsqueda de cursos
  - Creación de nuevos cursos
  - Edición de cursos (título, descripción, imagen de portada)
  - Eliminación de cursos
  - Diálogos modales para:
    - Asignaciones del curso (`CourseAssignmentsDialog`)
    - Módulos del curso (`CourseModulesDialog`)
    - Detalles del curso
- **Componentes UI utilizados**:
  - `Card` para tarjetas de curso
  - `Progress` para mostrar progreso promedio
  - `Badge` para estados
  - `Dialog` para modales
  - `Input`, `Textarea` para formularios
  - `CoverImageUpload` para imágenes

#### 3. **EnrollmentManagement.tsx**
- **Gestión de inscripciones**:
  - Tabla de todas las inscripciones del sistema
  - Búsqueda por estudiante/curso
  - Filtro por curso
  - Visualización de progreso con barra de progreso
  - Desinscripción de estudiantes
- **Componentes UI utilizados**:
  - `Table` con columnas: Estudiante, Curso, Progreso, Fecha de inscripción
  - `Progress` para mostrar progreso visual
  - `Badge` para estados de progreso

#### 4. **CourseAssignmentsDialog.tsx**
- **Diálogo modal** para gestionar asignaciones de un curso específico
- **Funcionalidades**:
  - Listado de asignaciones
  - Búsqueda de asignaciones
  - Creación de nuevas asignaciones
  - Edición de asignaciones
  - Eliminación de asignaciones
  - Vista de detalles
- **Componentes UI utilizados**:
  - `Dialog` de tamaño grande (70vw)
  - `Table` para listado
  - `AssignmentEditor` integrado
  - `Badge` para estados (Overdue, Due Soon, etc.)

#### 5. **AdminAnalytics.tsx**
- Dashboard de analíticas del sistema
- Métricas generales del LMS

---

## 👨‍🏫 Análisis de Componentes de TEACHER

### Componentes Disponibles (5 archivos)

1. **TeacherDashboard.tsx** - Dashboard principal
2. **CourseEditor.tsx** - Editor completo de cursos
3. **EvaluationBuilder.tsx** - Constructor de evaluaciones
4. **RosterManager.tsx** - Gestión de estudiantes
5. **TeacherAnalytics.tsx** - Analíticas del profesor

### Dashboard de Teacher

**Tabs disponibles:**
- `overview` - Vista general con estadísticas
- `courses` - Mis cursos
- `assignments` - Asignaciones
- `grading` - Calificación de trabajos

### Elementos UI/UX de Teacher

#### 1. **TeacherDashboard.tsx**
- **Dashboard principal** con:
  - **Estadísticas en cards**:
    - Total de cursos
    - Total de estudiantes
    - Total de asignaciones
    - Pendientes de calificar
  - **Funcionalidades principales**:
    - Crear nuevo curso (diálogo modal)
    - Listar cursos con estadísticas
    - Agregar asignaciones a cursos
    - Editar cursos (título, descripción, imagen)
    - Ver detalles de curso
    - Gestionar asignaciones
    - Revisar y calificar submissions pendientes
- **Componentes UI utilizados**:
  - `Card` para estadísticas y contenido
  - `Button` para acciones
  - `Dialog` para modales
  - `Tabs` para navegación
  - `Badge` para estados
  - `Progress` para visualización de datos

#### 2. **CourseEditor.tsx**
- Editor completo para crear/editar cursos
- Permite agregar módulos y contenido

#### 3. **RosterManager.tsx**
- Gestión de lista de estudiantes
- Vista de estudiantes inscritos en cursos

---

## 🎓 Análisis de Componentes de STUDENT (Browse Courses)

### Componentes Disponibles (3 archivos)

1. **StudentDashboard.tsx** - Dashboard principal
2. **CourseViewer.tsx** - Visualizador de cursos
3. **EvaluationPlayer.tsx** - Reproductor de evaluaciones

### Dashboard de Student

**Tabs disponibles:**
- `overview` - Vista general con estadísticas personales
- `courses` - Mis cursos inscritos
- `browse` - **Browse Courses** (explorar cursos disponibles)
- `assignments` - Asignaciones personales

### Browse Courses (Tab `browse`)

**Ubicación**: `StudentDashboard.tsx` - TabsContent value="browse" (línea 774)

**Funcionalidades:**
- **Búsqueda de cursos**: Input de búsqueda por título, descripción o instructor
- **Listado de cursos disponibles**:
  - Filtra cursos donde el estudiante NO está inscrito
  - Muestra: título, instructor, descripción, imagen de portada
  - Botón "Enroll" para cada curso
- **Estados**:
  - Si no hay cursos: mensaje informativo
  - Si hay cursos: grid de cards con información

**Componentes UI utilizados:**
- `Card` para cada curso
- `Input` con ícono de búsqueda
- `Button` para enroll
- `Badge` para estados (si aplica)

**Flujo de Enrollment:**
1. Usuario hace clic en "Enroll"
2. Se llama a `handleEnroll(courseId)` (línea 357)
3. Verifica si ya está inscrito
4. Llama a `ApiService.enrollStudent()` con:
   - `student_id`: `user.id`
   - `course_id`: `courseId`
   - `progress`: 0
5. Actualiza lista de cursos e inscripciones

---

## ⚠️ Problema Identificado: Enrollment

### Error Actual
```
"course_id and student_id are required" (400 Bad Request)
```

### Causa Raíz

**Backend Python** (`backend/app/api/enrollments.py` línea 43-44):
```python
if not course_id or not student_id:
    return jsonify({"error": "course_id and student_id are required"}), 400
```

**Frontend** (`src/services/api.service.ts` línea 240-245):
```typescript
static async enrollStudent(data: { student_id: string; course_id: string; progress?: number }): Promise<string> {
  const payload = {
    course_id: data.course_id,
    progress: data.progress || 0
  };
  // ❌ student_id NO se está enviando en el payload
  const response = await apiClient.post(API_ENDPOINTS.ENROLLMENTS, payload);
```

### Problema
El frontend está diseñado para que `student_id` venga del token de autenticación, pero el backend Python **aún no tiene middleware de autenticación** implementado para extraer el `student_id` del token.

**Solución temporal**: Enviar `student_id` explícitamente en el payload hasta que se implemente el middleware de autenticación en el backend Python.

---

## 🔌 API Endpoints Disponibles

### Backend Python (`/api`)

- **Users**: `/users`, `/users/<id>`, `/users?role=<role>`, `/users/stats`
- **Courses**: `/courses`, `/courses?teacher_id=<id>`, `/courses/<id>`
- **Enrollments**: `/enrollments?student_id=<id>`, `/enrollments?course_id=<id>`, `POST /enrollments`
- **Assignments**: `/assignments`, `/assignments?course_id=<id>`, `/assignments/<id>`
- **Submissions**: `/submissions`, `/submissions?assignment_id=<id>`, `/submissions?student_id=<id>`
- **Modules**: `/modules/courses/<course_id>/modules`
- **Progress**: `/progress/access`, `/progress`, `/progress/complete`, `/progress/course/<user_id>/<course_id>`
- **Messages**: `/messages`, `/messages?sender_id=<id>`, `/messages?recipient_id=<id>`

---

## 🎨 Sistema de UI

### Librería de Componentes
- **Shadcn UI** - Componentes reutilizables basados en Radix UI
- Componentes en `src/components/ui/`:
  - `Button`, `Card`, `Dialog`, `Table`, `Input`, `Select`, `Badge`, `Progress`, `Tabs`, etc.

### Patrones de Diseño
- **Modales/Dialogs**: Para formularios y detalles
- **Tablas**: Para listados con acciones
- **Cards**: Para presentación de información
- **Badges**: Para estados y categorías
- **Progress bars**: Para visualización de progreso

---

## 🔄 Flujo de Datos

### Frontend → Backend
1. Usuario interactúa con UI
2. Componente llama a `ApiService.method()`
3. `ApiService` usa `apiClient` (Axios)
4. Interceptor agrega token Firebase al header `Authorization: Bearer <token>`
5. Request al backend Python en `http://localhost:8000/api/...`

### Backend Python → Firestore
1. Recibe request en blueprint Flask
2. Llama a `Service.enroll()` (lógica de negocio)
3. Service llama a `Repository.create()` (acceso a datos)
4. Repository interactúa con Firebase Firestore
5. Retorna respuesta JSON

---

## 📝 Recomendaciones

### Prioridad Alta
1. ✅ **Arreglar enrollment**: Enviar `student_id` en payload temporalmente
2. ⚠️ **Implementar middleware de autenticación** en backend Python para extraer `user_id` del token
3. 🔍 **Unificar autenticación**: Decidir si `student_id` viene del token o del payload

### Prioridad Media
- Revisar y migrar más funcionalidades del backend TypeScript al Python
- Documentar todos los endpoints del backend Python
- Implementar validación de permisos por rol

### Prioridad Baja
- Optimizar carga de datos en componentes con muchas peticiones
- Agregar tests unitarios
- Mejorar manejo de errores con mensajes más descriptivos

---

## 📊 Resumen de Componentes por Rol

| Rol | Componentes | Tabs en Dashboard | Funcionalidades Principales |
|-----|------------|-------------------|----------------------------|
| **Admin** | 14 | 9 | Gestión completa del sistema, usuarios, cursos, asignaciones, inscripciones, mensajes, analíticas |
| **Teacher** | 5 | 4 | Gestión de cursos propios, asignaciones, calificación, analíticas de enseñanza |
| **Student** | 3 | 4 | Visualización de cursos, inscripción, progreso, asignaciones personales |

---

*Análisis generado el: $(date)*
*Proyecto: Kampus - Learning Management System*

