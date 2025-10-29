# Arquitectura del Proyecto Kampus

## 📐 Visión General

Kampus es un **Learning Management System (LMS)** construido con una arquitectura moderna basada en **React 18**, **TypeScript**, y **Firebase**. El proyecto sigue un patrón de arquitectura por **capas** con separación clara de responsabilidades.

---

## 🏗️ Estructura de Capas

```
┌─────────────────────────────────────────────────┐
│           PRESENTATION LAYER                    │
│  (Componentes React - UI/UX)                   │
├─────────────────────────────────────────────────┤
│           APPLICATION LAYER                      │
│  (Hooks personalizados - Lógica de negocio)    │
├─────────────────────────────────────────────────┤
│           SERVICE LAYER                          │
│  (Servicios - Abstracción de Firebase)         │
├─────────────────────────────────────────────────┤
│           DATA LAYER                             │
│  (Firebase Firestore/Auth/Storage)             │
└─────────────────────────────────────────────────┘
```

---

## 📁 Estructura de Carpetas

```
src/
├── components/          # Capa de Presentación
│   ├── admin/          # Componentes específicos de admin
│   ├── teacher/        # Componentes específicos de teacher
│   ├── student/        # Componentes específicos de student
│   ├── auth/           # Componentes de autenticación
│   ├── profiles/       # Sistema de perfiles
│   └── ui/             # Componentes UI reutilizables (Shadcn)
│
├── hooks/              # Capa de Aplicación
│   ├── useAuth.ts      # Hook de autenticación
│   └── useFirestore.ts # Hooks para datos de Firestore
│
├── services/           # Capa de Servicios
│   ├── auth.service.ts      # Servicio de autenticación
│   ├── firestore.service.ts # Servicio de base de datos
│   ├── user-profile.service.ts
│   └── seed.service.ts
│
├── config/             # Configuración
│   └── firebase.ts     # Configuración de Firebase
│
├── types/              # Tipos TypeScript
│   └── user-profiles.ts
│
├── utils/              # Utilidades
│   ├── firebase-helpers.ts
│   └── seed-profiles.ts
│
├── styles/             # Estilos globales
│   └── globals.css
│
├── App.tsx             # Componente raíz
└── main.tsx            # Punto de entrada
```

---

## 🔄 Flujo de Datos

### 1. Autenticación

```
Usuario → AuthPage → AuthService → Firebase Auth
                                ↓
                         Firestore (users)
                                ↓
                         useAuth Hook
                                ↓
                         App.tsx (Routing)
```

**Flujo detallado:**
1. Usuario ingresa credenciales en `AuthPage`
2. `AuthService` interactúa con Firebase Auth
3. Se crea/actualiza perfil en Firestore (`users` collection)
4. `useAuth` hook escucha cambios de estado de autenticación
5. `App.tsx` redirige según el rol del usuario
6. Se carga el dashboard correspondiente (lazy loading)

### 2. Datos de Firestore

```
Componente → useFirestore Hook → FirestoreService → Firestore DB
            (useCourses,      (FirestoreService    (Collections:
             useUsers, etc.)    class methods)      courses,
                                                     users,
                                                     etc.)
```

**Ejemplo concreto:**
```typescript
// En un componente
const { courses, loading } = useCourses(teacherId);

// Hook personalizado
export function useCourses(teacherId?: string) {
  const [courses, setCourses] = useState<Course[]>([]);
  useEffect(() => {
    const data = teacherId
      ? await FirestoreService.getCoursesByTeacher(teacherId)
      : await FirestoreService.getAllCourses();
    setCourses(data);
  }, [teacherId]);
  return { courses, loading, error, refreshCourses };
}

// Servicio
static async getCoursesByTeacher(teacherId: string): Promise<Course[]> {
  const q = query(collection(db, 'courses'), where('teacher_id', '==', teacherId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}
```

---

## 🧩 Capas Detalladas

### Capa 1: Presentation Layer (Componentes)

#### Componentes por Rol

**Estudiante (`components/student/`)**
- `StudentDashboard.tsx` - Dashboard principal
- `CourseViewer.tsx` - Visualizador de cursos con módulos
- `EvaluationPlayer.tsx` - Reproductor de evaluaciones

**Maestro (`components/teacher/`)**
- `TeacherDashboard.tsx` - Dashboard principal
- `CourseEditor.tsx` - Editor completo de cursos
- `EvaluationBuilder.tsx` - Constructor de evaluaciones
- `RosterManager.tsx` - Gestión de estudiantes
- `TeacherAnalytics.tsx` - Analíticas del maestro

**Administrador (`components/admin/`)**
- `AdminDashboard.tsx` - Dashboard principal
- `UserManagement.tsx` - CRUD de usuarios
- `CourseManagement.tsx` - Gestión de cursos
- `EnrollmentManagement.tsx` - Gestión de inscripciones
- `AssignmentManagement.tsx` - Gestión de asignaciones
- `AdminAnalytics.tsx` - Analíticas del sistema
- `SystemSettings.tsx` - Configuración
- `ActivityLogs.tsx` - Registros de actividad
- `MessageManagement.tsx` - Mensajería
- `ReportsExport.tsx` - Exportación de reportes

#### Componentes UI Base (`components/ui/`)

Biblioteca de componentes basada en **Radix UI** y **Shadcn/ui**:
- Componentes accesibles y estilizados
- Consistencia visual en toda la aplicación
- Temas personalizables (Tailwind CSS)

#### Sistema de Perfiles (`components/profiles/`)

Arquitectura modular con:
- `BaseProfile/` - Perfil base compartido
- `extensions/` - Extensiones específicas por rol
- `editors/` - Editores de información del perfil
- `ProfileRouter.tsx` - Enrutamiento de perfiles

### Capa 2: Application Layer (Hooks)

#### `useAuth` Hook

**Responsabilidades:**
- Estado global de autenticación
- Sincronización con Firebase Auth
- Carga de perfil de usuario desde Firestore
- Métodos: `login`, `register`, `logout`, `resetPassword`

**Implementación:**
```typescript
export function useAuth() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userProfile = await AuthService.getUserProfile(firebaseUser.uid);
        setUser(userProfile);
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);
  
  return { user, loading, login, logout, register, ... };
}
```

#### Hooks de Firestore (`useFirestore.ts`)

**Hooks disponibles:**
- `useCourses(teacherId?)` - Obtener cursos (todos o por profesor)
- `useCourse(courseId)` - Obtener un curso específico
- `useEnrollments(studentId?, courseId?)` - Inscripciones
- `useAssignments(courseId)` - Asignaciones de un curso
- `useSubmissions(assignmentId?, studentId?)` - Envíos
- `useUsers(role?)` - Usuarios (todos o por rol)
- `useAnalytics(type, id?)` - Analíticas

**Patrón de implementación:**
```typescript
export function useCourses(teacherId?: string) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const data = teacherId
          ? await FirestoreService.getCoursesByTeacher(teacherId)
          : await FirestoreService.getAllCourses();
        setCourses(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [teacherId]);

  const refreshCourses = async () => {
    // Lógica de refresco
  };

  return { courses, loading, error, refreshCourses };
}
```

### Capa 3: Service Layer

#### AuthService (`services/auth.service.ts`)

**Responsabilidades:**
- Crear usuarios en Firebase Auth
- Autenticar usuarios
- Gestionar sesiones
- Resetear contraseñas
- Sincronizar perfiles con Firestore

**Métodos principales:**
```typescript
class AuthService {
  static async register(email, password, name, role)
  static async login(email, password)
  static async logout()
  static async resetPassword(email)
  static async getUserProfile(uid)
  static async updateUserProfile(uid, data)
}
```

#### FirestoreService (`services/firestore.service.ts`)

**Estructura del servicio:**
```typescript
class FirestoreService {
  // ========== USERS ==========
  static async getUser(userId)
  static async getAllUsers()
  static async getUsersByRole(role)
  static async updateUser(userId, data)
  static async deleteUser(userId)
  
  // ========== COURSES ==========
  static async createCourse(course)
  static async getCourse(courseId)
  static async getAllCourses()
  static async getCoursesByTeacher(teacherId)
  static async updateCourse(courseId, updates)
  static async deleteCourse(courseId)
  
  // ========== COURSE MODULES ==========
  static async addCourseModule(courseId, module)
  static async getCourseModules(courseId)
  static async updateCourseModule(moduleId, updates)
  static async deleteCourseModule(moduleId)
  
  // ========== ENROLLMENTS ==========
  static async enrollStudent(enrollment)
  static async getEnrollmentsByStudent(studentId)
  static async getEnrollmentsByCourse(courseId)
  
  // ========== ASSIGNMENTS ==========
  static async createAssignment(assignment)
  static async getAssignmentsByCourse(courseId)
  
  // ========== SUBMISSIONS ==========
  static async createSubmission(submission)
  static async getSubmissionsByAssignment(assignmentId)
  static async getSubmissionsByStudent(studentId)
  
  // ========== USER PROGRESS ==========
  static async markModuleComplete(userId, courseId, moduleId)
  static async getCourseProgress(userId, courseId)
  static async updateCourseProgress(userId, courseId)
  
  // ========== ANALYTICS ==========
  static async getStudentAnalytics(studentId)
  static async getTeacherAnalytics(teacherId)
  static async getCourseAnalytics(courseId)
  static async getSystemAnalytics()
}
```

**Características:**
- Métodos estáticos (no requiere instanciación)
- Manejo de errores consistente
- Transformación de datos Firestore a tipos TypeScript
- Queries optimizadas con filtros

### Capa 4: Data Layer (Firebase)

#### Firebase Configuration (`config/firebase.ts`)

```typescript
// Inicialización de Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
```

#### Estructura de Collections en Firestore

```
users/                    # Perfiles de usuario
  {userId}/
    - email, name, role, etc.

courses/                  # Cursos
  {courseId}/
    - title, description, teacher_id, etc.

course_modules/           # Módulos de curso
  {moduleId}/
    - course_id, title, type, content, order, etc.

enrollments/              # Inscripciones
  {enrollmentId}/
    - student_id, course_id, progress, etc.

assignments/              # Asignaciones
  {assignmentId}/
    - course_id, title, description, due_date, etc.

submissions/              # Envíos de estudiantes
  {submissionId}/
    - assignment_id, student_id, grade, etc.

user_progress/            # Progreso por módulo
  {progressId}/
    - user_id, course_id, module_id, completed, etc.

course_progress/           # Progreso por curso
  {progressId}/
    - user_id, course_id, total_modules, completed_modules, etc.

announcements/            # Anuncios
  {announcementId}/
    - course_id, title, message, etc.

messages/                 # Mensajes
  {messageId}/
    - sender_id, receiver_id, content, read, etc.

activity_logs/            # Logs de actividad
  {logId}/
    - user_id, action, timestamp, metadata, etc.
```

---

## 🛠️ Tecnologías y Stack

### Frontend Core
- **React 18.3.1** - Biblioteca UI
- **TypeScript** - Tipado estático
- **Vite 6.3.5** - Build tool y dev server

### UI Framework
- **Tailwind CSS** - Estilos utility-first
- **Radix UI** - Componentes accesibles sin estilos
- **Shadcn/ui** - Sistema de diseño basado en Radix
- **Lucide React** - Iconos
- **Sonner** - Sistema de notificaciones toast

### Backend & Database
- **Firebase Auth** - Autenticación de usuarios
- **Firestore** - Base de datos NoSQL
- **Firebase Storage** - Almacenamiento de archivos

### Formularios y Validación
- **React Hook Form 7.55.0** - Gestión de formularios
- **Zod** (implícito) - Validación de esquemas

### Utilidades
- **Recharts 2.15.2** - Gráficos y visualizaciones
- **date-fns** (implícito) - Manejo de fechas
- **clsx** - Utilidad para nombres de clases

---

## 🎯 Patrones Arquitectónicos

### 1. **Separación de Responsabilidades**
- Presentación separada de lógica de negocio
- Servicios independientes de componentes
- Hooks como capa intermedia

### 2. **Service Pattern**
- Clases estáticas para acceso a datos
- Abstracción de Firebase
- Transformación de datos centralizada

### 3. **Custom Hooks Pattern**
- Lógica reutilizable encapsulada
- Estado y efectos centralizados
- Facilita testing y mantenimiento

### 4. **Component Composition**
- Componentes pequeños y reutilizables
- Composición sobre herencia
- Props drilling minimizado

### 5. **Lazy Loading**
- Code splitting por rutas
- Carga bajo demanda de dashboards
- Mejora de rendimiento inicial

### 6. **Type Safety**
- TypeScript en todo el proyecto
- Interfaces bien definidas
- Type guards para perfiles

---

## 🔐 Sistema de Autenticación

### Flujo de Autenticación

```
1. Usuario visita AuthPage
   ↓
2. Selecciona Login o Register
   ↓
3. AuthService interactúa con Firebase Auth
   ↓
4. Firebase Auth crea/valida usuario
   ↓
5. Se crea/actualiza documento en Firestore (users/{userId})
   ↓
6. useAuth hook detecta cambio de estado
   ↓
7. Carga perfil desde Firestore
   ↓
8. App.tsx redirige según rol:
   - student → StudentDashboard
   - teacher → TeacherDashboard
   - admin → AdminDashboard
```

### Gestión de Roles

**Roles disponibles:**
- `student` - Estudiante
- `teacher` - Profesor
- `admin` - Administrador

**Almacenamiento:**
- Rol guardado en Firestore (`users/{userId}.role`)
- Validación en tiempo de ejecución
- Routing basado en rol en `App.tsx`

---

## 📦 Sistema de Build

### Vite Configuration

**Optimizaciones:**
- Code splitting por vendors:
  - `react-vendor` - React y React DOM
  - `firebase` - SDK de Firebase
  - `radix-ui` - Componentes UI
- Lazy loading de dashboards
- Tree shaking automático
- Minificación en producción

### Scripts Disponibles

```json
{
  "dev": "vite",           // Servidor de desarrollo (puerto 3000)
  "build": "vite build",    // Build de producción
  "preview": "vite preview", // Preview del build
  "start": "node server.js"  // Servidor Express (si aplica)
}
```

---

## 🔄 Flujo de Renderizado

### App.tsx - Componente Raíz

```
App.tsx
├── useAuth() → Estado de autenticación
├── if loading → Spinner
├── if !user → AuthPage
└── if user → Navigation + Dashboard
    ├── switch(user.role)
    │   ├── 'student' → StudentDashboard (lazy)
    │   ├── 'teacher' → TeacherDashboard (lazy)
    │   └── 'admin' → AdminDashboard (lazy)
    └── ProfilePage (lazy, si viewState === 'profile')
```

### Routing

**Sistema de routing personalizado:**
- No usa React Router (implementación manual)
- Estado basado en `viewState` en App.tsx
- Navegación mediante componentes de estado

**Estados:**
- `dashboard` - Vista principal (dashboard por rol)
- `profile` - Vista de perfil

---

## 📊 Tipos y Interfaces

### User Profiles (`types/user-profiles.ts`)

**Arquitectura de tipos:**
```typescript
BaseUser (común a todos)
  ├── StudentProfile
  ├── TeacherProfile
  └── AdminProfile

Union Type: UserProfile
```

**Características:**
- Type guards para validación de perfiles
- Tipos separados por rol
- Props opcionales bien definidas
- Constantes de default values

### Firestore Types (`services/firestore.service.ts`)

**Interfaces principales:**
- `User` - Usuario básico
- `Course` - Curso
- `CourseModule` - Módulo de curso
- `Enrollment` - Inscripción
- `Assignment` - Asignación
- `Submission` - Envío
- `UserProgress` - Progreso por módulo
- `CourseProgress` - Progreso por curso
- `Message` - Mensaje
- `ActivityLog` - Log de actividad

---

## 🎨 Sistema de Estilos

### Tailwind CSS

**Configuración:**
- Utility-first CSS
- Clases predefinidas
- Modo dark/light support (con next-themes)
- Responsive design incluido

### Shadcn/ui Components

**Ventajas:**
- Componentes accesibles (ARIA)
- Personalizables vía Tailwind
- TypeScript nativo
- Composable

---

## 🔍 Manejo de Estado

### Estado Local
- `useState` para estado de componente
- Estado derivado cuando es posible
- Mínima dependencia de estado global

### Estado Global (implícito)
- `useAuth` hook - Estado de autenticación
- Firestore en tiempo real (potencial para listeners)

### Estado de Servidor
- Datos siempre frescos desde Firestore
- Sin cache local (a futuro se puede agregar)
- Re-fetch en acciones del usuario

---

## 🚀 Optimizaciones

### Performance
1. **Lazy Loading**
   - Dashboards cargados bajo demanda
   - Code splitting automático

2. **Memoización**
   - React.memo en componentes pesados (potencial)
   - useMemo para cálculos costosos (potencial)

3. **Queries Optimizadas**
   - Filtros en Firestore
   - Índices compuestos cuando necesario

4. **Bundle Size**
   - Code splitting por vendor
   - Tree shaking automático

### SEO (Potencial)
- Meta tags (futuro)
- SSR/SSG (futuro con Next.js si se migra)

---

## 🧪 Testing (Estructura Preparada)

**Pendiente de implementar:**
- Unit tests para servicios
- Integration tests para hooks
- E2E tests para flujos críticos

---

## 📝 Convenciones de Código

### Nombres
- Componentes: PascalCase (`StudentDashboard.tsx`)
- Hooks: camelCase con prefijo `use` (`useAuth.ts`)
- Servicios: camelCase con sufijo `.service.ts`
- Tipos: PascalCase (`UserProfile`, `Course`)

### Estructura de Archivos
- Un componente por archivo
- Tipos relacionados en el mismo archivo o `types/`
- Hooks en `hooks/`
- Servicios en `services/`

### Imports
- React primero
- Librerías externas
- Componentes internos
- Tipos e interfaces
- Utilidades

---

## 🔮 Extensiones Futuras

### Arquitectura
1. **State Management**
   - Implementar Zustand o Redux Toolkit si crece complejidad

2. **API Layer**
   - Abstracción adicional para llamadas a Firebase
   - Interceptors para logging/errores

3. **Caching Layer**
   - React Query para cache inteligente
   - Optimistic updates

4. **Testing**
   - Jest + React Testing Library
   - Cypress para E2E

5. **Error Boundaries**
   - Manejo de errores a nivel de aplicación

6. **Monitoring**
   - Sentry o similar para error tracking
   - Analytics de uso

---

## 📚 Recursos y Documentación

### Documentos del Proyecto
- `README.md` - Guía de inicio
- `PERFILES_DE_USUARIO.md` - Sistema de perfiles
- `ANALISIS_VISTAS.md` - Análisis de dashboards
- `ARQUITECTURA_PROYECTO.md` - Este documento

### Configuración Externa
- `firebase.json` - Configuración de Firebase
- `firestore.rules` - Reglas de seguridad
- `vite.config.ts` - Configuración de build

---

## ✅ Conclusión

La arquitectura de Kampus es **moderna, escalable y mantenible**. Sigue principios SOLID y separación de responsabilidades, facilitando:

- **Desarrollo**: Fácil agregar nuevas features
- **Testing**: Componentes y servicios testeables
- **Mantenimiento**: Código organizado y predecible
- **Escalabilidad**: Preparado para crecer

El uso de TypeScript garantiza **type safety** y reduce errores en tiempo de ejecución, mientras que la arquitectura por capas permite **desarrollo en paralelo** y **refactoring seguro**.

