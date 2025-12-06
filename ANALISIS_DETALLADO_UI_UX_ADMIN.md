# 📊 Análisis Detallado de UI/UX - Componentes Admin

## 🎯 Visión General

Este documento proporciona un análisis exhaustivo de todos los componentes de administración del proyecto Kampus, detallando su estructura, interacciones, gestión de estado, patrones de refresco y elementos de UI/UX.

---

## 🏗️ AdminDashboard.tsx - Contenedor Principal

### Propósito
Componente contenedor que gestiona la navegación por tabs y carga datos principales del sistema.

### Estructura de Estado

```typescript
// Estado Principal
const [activeTab, setActiveTab] = useState('overview')
const [visibleTabs, setVisibleTabs] = useState<string[]>([]) // Tabs visibles
const [hiddenTabs, setHiddenTabs] = useState<string[]>([])   // Tabs ocultos

// Datos Globales (vía hooks)
const { users, loading: usersLoading, refreshUsers } = useUsers()
const { courses, loading: coursesLoading, refreshCourses } = useCourses()
```

### Sistema de Navegación por Tabs

#### Características
1. **9 Tabs totales**:
   - Overview (Analíticas)
   - Users
   - Courses
   - Assignments
   - Enrollments
   - Messages
   - Activity Logs
   - Reports
   - Settings

2. **Sincronización con URL**:
   - Cada tab tiene un path asociado (`/admin/overview`, `/admin/users`, etc.)
   - Usa `react-router-dom` para sincronizar estado con URL
   - El cambio de tab actualiza la URL mediante `navigate(tab.path, { replace: true })`

3. **Responsive Tabs (Adaptativo)**:
   - **Algoritmo dinámico**: Calcula qué tabs mostrar según el ancho disponible
   - **Dropdown para tabs ocultos**: Si no caben todos, muestra botón "More" con dropdown
   - **Cálculo en tiempo real**: Se recalcula en cada resize del window
   - **Garantía mínima**: Siempre muestra al menos los primeros 3 tabs

#### Flujo de Visibilidad de Tabs

```
1. useEffect detecta cambios en ancho de pantalla
2. Calcula ancho disponible (containerWidth - dropdownButtonWidth - padding)
3. Itera sobre cada tab y suma anchos hasta exceder el disponible
4. Tabs que caben → visibleTabs[]
5. Tabs que no caben → hiddenTabs[]
6. Renderiza tabs visibles + dropdown con ocultos
```

**Implementación técnica**:
- Usa `useRef` para referenciar contenedores DOM
- `requestAnimationFrame` para cálculos post-render
- Múltiples intentos (hasta 10) para asegurar DOM ready
- `JSON.stringify` comparación para prevenir loops infinitos

### Gestión de Datos

**Carga inicial**:
- Carga `users` y `courses` al montar el componente
- Muestra `Loader2` mientras carga
- Datos pasados como props a componentes hijos

**Refresco de datos**:
- Componentes hijos pueden llamar a `refreshUsers()` o `refreshCourses()` via callbacks
- Ejemplo: `CourseManagement` recibe `onCourseUpdate={refreshCourses}`

### Patrones UI/UX

1. **Estilo de tab activo**:
   - Fondo primario (`var(--primary)`)
   - Sombra sutil (`boxShadow`)
   - Font weight 600
   - Z-index elevado

2. **Responsive Design**:
   - Tabs se adaptan automáticamente
   - Dropdown con iconos para tabs ocultos
   - Indicador visual del tab activo en dropdown también

---

## 👥 UserManagement.tsx - Gestión de Usuarios

### Propósito
CRUD completo de usuarios del sistema con búsqueda y filtros.

### Estructura de Estado

```typescript
// Filtros y Búsqueda
const [searchQuery, setSearchQuery] = useState('')
const [roleFilter, setRoleFilter] = useState<'all' | 'student' | 'teacher' | 'admin'>('all')

// Diálogos
const [showEditDialog, setShowEditDialog] = useState(false)
const [showDeleteDialog, setShowDeleteDialog] = useState(false)

// Selección y Edición
const [selectedUser, setSelectedUser] = useState<User | null>(null)
const [editedUser, setEditedUser] = useState<Partial<User>>({})
```

### Gestión de Datos

**Origen de datos**: Recibe `users: User[]` como prop desde `AdminDashboard`

**Filtrado**:
```typescript
const filteredUsers = users.filter(user => {
  const matchesSearch = 
    (user.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user.email || '').toLowerCase().includes(searchQuery.toLowerCase())
  const matchesRole = roleFilter === 'all' || user.role === roleFilter
  return matchesSearch && matchesRole
})
```

**Características del filtrado**:
- Búsqueda en tiempo real (onChange)
- Búsqueda case-insensitive
- Filtro por rol combinado con búsqueda
- Filtrado client-side (no requiere API calls)

### Interacciones del Usuario

#### 1. Búsqueda
- **Input con ícono**: Ícono de búsqueda (`Search`) posicionado absolutamente a la izquierda
- **Placeholder**: "Search users..."
- **Comportamiento**: Filtra mientras escribe (debounce implícito en render)

#### 2. Filtro por Rol
- **Select dropdown** con opciones:
  - All Roles
  - Students
  - Teachers
  - Admins
- **Actualización inmediata**: La tabla se actualiza al cambiar el filtro

#### 3. Tabla de Usuarios

**Columnas**:
- Name
- Email
- Role (con Badge coloreado)
- Created (fecha formateada)
- Actions (Dropdown menu)

**Badges de Rol**:
```typescript
const getRoleBadgeVariant = (role: string) => {
  switch (role) {
    case 'admin': return 'destructive'    // Rojo
    case 'teacher': return 'default'      // Azul primario
    case 'student': return 'secondary'    // Gris
    default: return 'outline'
  }
}
```

#### 4. Acciones por Usuario

**Dropdown Menu** (`MoreVertical`):
- **Edit**: Abre diálogo de edición
- **Delete**: Abre diálogo de confirmación

### Diálogos Modales

#### Dialog de Edición

**Características**:
- Tamaño grande: `70vw` width, `max-h-[90vh]` height
- Scroll interno si contenido excede
- Campos editables:
  - Name (Input)
  - Email (Input type="email")
  - Role (Select: student/teacher/admin)
- Botones: Cancel y Save Changes

**Flujo de edición**:
```
1. Usuario hace clic en "Edit"
2. handleEditUser() carga datos en editedUser state
3. Abre showEditDialog = true
4. Usuario edita campos
5. handleSaveUser() llama a ApiService.updateUser()
6. Muestra toast de éxito
7. window.location.reload() ⚠️ (hard refresh)
```

**⚠️ Problema identificado**: Usa `window.location.reload()` que recarga toda la página. Debería usar callback de refresh.

#### Dialog de Eliminación

**Características**:
- `AlertDialog` (confirmación destructiva)
- Muestra nombre del usuario a eliminar
- Botones: Cancel y Delete (estilo destructivo)
- Confirmación requerida antes de eliminar

**Flujo de eliminación**:
```
1. Usuario hace clic en "Delete"
2. setSelectedUser(user) + setShowDeleteDialog(true)
3. Usuario confirma
4. handleDeleteUser() llama a ApiService.deleteUser()
5. window.location.reload() ⚠️
```

### Refresh de Datos

**Problema actual**: Usa `window.location.reload()` después de editar/eliminar.

**Mejora sugerida**: 
- El componente debería recibir callback `onUserUpdate` desde `AdminDashboard`
- Llamar `refreshUsers()` en lugar de reload completo

### UI/UX Patterns

1. **Contador de resultados**: "Showing X of Y users" al final de la tabla
2. **Estado vacío**: Mensaje "No users found" con colspan cuando filteredUsers.length === 0
3. **Responsive**: Inputs y selects adaptan tamaño en móvil
4. **Feedback visual**: Badges coloreados por rol
5. **Accesibilidad**: Labels asociados a inputs

---

## 📚 CourseManagement.tsx - Gestión de Cursos

### Propósito
CRUD completo de cursos con estadísticas en tiempo real y gestión de módulos/asignaciones.

### Estructura de Estado

```typescript
// Filtros
const [searchQuery, setSearchQuery] = useState('')

// Selección y Diálogos
const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
const [showDetailsDialog, setShowDetailsDialog] = useState(false)
const [showEditDialog, setShowEditDialog] = useState(false)
const [showDeleteDialog, setShowDeleteDialog] = useState(false)
const [showCreateDialog, setShowCreateDialog] = useState(false)
const [showAssignmentsDialog, setShowAssignmentsDialog] = useState(false)
const [showModulesDialog, setShowModulesDialog] = useState(false)

// Formularios
const [editTitle, setEditTitle] = useState('')
const [editDescription, setEditDescription] = useState('')
const [editCoverImage, setEditCoverImage] = useState<string | null>(null)
const [newCourseTitle, setNewCourseTitle] = useState('')
const [newCourseDescription, setNewCourseDescription] = useState('')
const [newCourseTeacherId, setNewCourseTeacherId] = useState('')
const [newCourseCoverImage, setNewCourseCoverImage] = useState<string | null>(null)

// Estados de carga
const [isUpdating, setIsUpdating] = useState(false)
const [isCreating, setIsCreating] = useState(false)

// Estadísticas calculadas
const [courseStats, setCourseStats] = useState<Record<string, any>>({})
```

### Gestión de Datos y Estadísticas

#### Carga de Estadísticas

**useEffect principal** (línea 76-148):
```typescript
useEffect(() => {
  const loadStats = async () => {
    // 1. Inicializa stats vacíos para todos los cursos
    // 2. Carga TODAS las inscripciones y asignaciones en paralelo
    const [allEnrollments, allAssignments] = await Promise.all([
      ApiService.getAllEnrollments(),
      ApiService.getAllAssignments()
    ])
    
    // 3. Agrupa por course_id
    const enrollmentsByCourse = {}
    const assignmentsByCourse = {}
    
    // 4. Calcula estadísticas por curso
    courses.forEach((course) => {
      const enrollments = enrollmentsByCourse[course.id] || []
      const assignments = assignmentsByCourse[course.id] || []
      
      stats[course.id] = {
        totalStudents: enrollments.length,
        averageProgress: Math.round(
          enrollments.reduce((sum, e) => sum + (e.progress || 0), 0) / enrollments.length
        ) || 0,
        totalAssignments: assignments.length,
      }
    })
    
    setCourseStats(stats)
  }
  loadStats()
}, [courses]) // Solo cuando cambia courses
```

**Optimización implementada**:
- ✅ **Una sola llamada** a `getAllEnrollments()` y `getAllAssignments()` en lugar de N llamadas por curso
- ✅ **Agrupación client-side** después de cargar
- ✅ **Cálculo en paralelo** con `Promise.all`
- ✅ **Inicialización temprana**: Stats por defecto se muestran mientras cargan

### Tabla de Cursos

**Columnas** (responsive):
- **Course** (siempre visible):
  - Imagen de portada (16x16, solo desktop)
  - Título
  - Descripción (truncada con `line-clamp-1`)
  - Info móvil: teacher + estudiantes (solo mobile)
  
- **Teacher** (`hidden sm:table-cell`)
- **Students** (`hidden md:table-cell`) con ícono Users
- **Avg Progress** (`hidden lg:table-cell`):
  - Progress bar visual
  - Porcentaje texto
- **Created** (`hidden lg:table-cell`)
- **Actions** (siempre visible)

**Renderizado de Imagen**:
```typescript
{course.cover_image_url && (
  <div className="hidden sm:block w-16 h-16 rounded-md overflow-hidden border">
    <img src={course.cover_image_url} alt={course.title} />
  </div>
)}
```

### Botón "Create Course"

**Estilo especial**:
- Gradiente animado: `linear-gradient(to right, #2563eb, #4f46e5)`
- Hover effect: Cambia a tono más oscuro
- Sombra: `shadow-lg hover:shadow-xl`
- Transición: `transition-all duration-200`

**Implementación**:
```typescript
<Button 
  style={{ 
    background: 'linear-gradient(to right, #2563eb, #4f46e5)',
    color: 'white',
    border: 'none'
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.background = 'linear-gradient(to right, #1d4ed8, #4338ca)'
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.background = 'linear-gradient(to right, #2563eb, #4f46e5)'
  }}
>
```

### Diálogos Modales

#### 1. Dialog de Detalles (Course Details)

**Contenido**:
- Imagen de portada (si existe) - 48px altura
- Descripción completa
- Grid 2 columnas: Teacher, Created
- Cards de estadísticas: Students, Avg Progress, Assignments
- Botones de acción:
  - "Manage Assignments" → Abre `CourseAssignmentsDialog`
  - "Manage Modules" → Abre `CourseModulesDialog`

**Refresh implícito**: Los stats se recalculan cuando cambia `courses` prop

#### 2. Dialog de Edición

**Formulario**:
- Title (Input, requerido)
- Description (Textarea, 5 rows)
- Información read-only: Teacher, Created
- CoverImageUpload component
- Botones: Cancel, Update Course

**Validación**:
- Title no puede estar vacío
- Botón deshabilitado si `!editTitle.trim()`

**Refresh**:
```typescript
if (onCourseUpdate) {
  onCourseUpdate() // ✅ Llama a refreshCourses del padre
}
```

#### 3. Dialog de Creación

**Formulario**:
- Title (requerido)
- Description
- Teacher (Select, requerido) - Filtra usuarios con rol 'teacher' o 'admin'
- CoverImageUpload
- Mensaje de advertencia si no hay teachers disponibles

**Validación**:
- Title requerido
- TeacherId requerido
- Botón deshabilitado hasta que ambos estén completos

**Estados de carga**:
```typescript
{isCreating ? (
  <>
    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
    Creating...
  </>
) : (
  <>
    <Plus className="mr-2 h-4 w-4" />
    Create Course
  </>
)}
```

### Refresh de Datos

**Patrón correcto implementado**:
- Usa callback `onCourseUpdate` pasado desde `AdminDashboard`
- No hace hard refresh
- Los stats se recalculan automáticamente cuando `courses` cambia

**Flujo**:
```
1. Usuario edita/crea curso
2. ApiService.updateCourse() / createCourse()
3. onCourseUpdate() → refreshCourses() en AdminDashboard
4. courses prop se actualiza
5. useEffect detecta cambio en courses
6. loadStats() recalcula estadísticas
```

---

## 📝 AssignmentManagement.tsx - Gestión de Asignaciones

### Propósito
CRUD completo de asignaciones de todos los cursos con filtros y estados.

### Estructura de Estado

```typescript
// Filtros
const [searchQuery, setSearchQuery] = useState('')
const [courseFilter, setCourseFilter] = useState<string>('all')

// Datos
const [assignments, setAssignments] = useState<Assignment[]>([])
const [loading, setLoading] = useState(true)

// Diálogos
const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null)
const [showDetailsDialog, setShowDetailsDialog] = useState(false)
const [showDeleteDialog, setShowDeleteDialog] = useState(false)
const [showEditorDialog, setShowEditorDialog] = useState(false)
const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null)
```

### Carga de Datos

**Inicialización**:
```typescript
useEffect(() => {
  loadAssignments()
}, []) // Solo una vez al montar
```

**Función de carga**:
```typescript
const loadAssignments = async () => {
  setLoading(true)
  const allAssignments = await ApiService.getAllAssignments()
  setAssignments(allAssignments || [])
  setLoading(false)
}
```

**⚠️ No se recarga automáticamente** cuando cambian `courses` o `users`. Solo al montar.

### Filtrado Avanzado

**Búsqueda multi-campo**:
```typescript
const filteredAssignments = assignments.filter(assignment => {
  const course = courses.find(c => c.id === assignment.course_id)
  const teacher = users.find(u => u.id === course?.teacher_id)
  
  const matchesSearch = 
    assignment.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    assignment.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    teacher?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  
  const matchesCourse = courseFilter === 'all' || assignment.course_id === courseFilter
  
  return matchesSearch && matchesCourse
})
```

**Características**:
- Búsqueda en: título, descripción, nombre del curso, nombre del profesor
- Filtro por curso combinado
- Búsqueda case-insensitive

### Tabla de Asignaciones

**Columnas**:
- **Assignment**: Título + descripción (truncada)
- **Course**: Nombre del curso (lookup)
- **Teacher**: Nombre del profesor (lookup anidado)
- **Due Date**: Fecha formateada o "No due date"
- **Status**: Badge con estado calculado
- **Actions**: Dropdown menu

### Sistema de Estados (Status Badges)

**Cálculo de estado**:
```typescript
const getStatusBadge = (dueDate?: string) => {
  if (!dueDate) return <Badge variant="secondary">No Due Date</Badge>
  
  const due = new Date(dueDate)
  const now = new Date()
  const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  
  if (diffDays < 0) return <Badge variant="destructive">Overdue</Badge>
  if (diffDays <= 3) return <Badge variant="destructive">Due Soon</Badge>
  if (diffDays <= 7) return <Badge variant="default">Due This Week</Badge>
  return <Badge variant="secondary">Upcoming</Badge>
}
```

**Estados visuales**:
- **Overdue** (rojo): Pasada la fecha límite
- **Due Soon** (rojo): ≤3 días
- **Due This Week** (azul): 4-7 días
- **Upcoming** (gris): >7 días
- **No Due Date** (gris): Sin fecha

### AssignmentEditor Component

**Integración**:
- Componente reutilizable usado tanto aquí como en `CourseAssignmentsDialog`
- Recibe props: `open`, `onOpenChange`, `assignment`, `courses`, `onSave`

**Flujo de guardado**:
```
1. Usuario edita/crea en AssignmentEditor
2. AssignmentEditor llama a ApiService.create/update
3. Llama a onSave() callback
4. handleEditorSave() en AssignmentManagement
5. loadAssignments() refresca la lista
6. Cierra el editor
```

**Refresh correcto**: ✅ Llama a `loadAssignments()` después de guardar

### Dialog de Detalles

**Información mostrada**:
- Descripción completa
- Course (nombre)
- Teacher (nombre)
- Due Date
- Created date

**Sin acciones**: Solo lectura, sin edición directa

---

## ✅ EnrollmentManagement.tsx - Gestión de Inscripciones

### Propósito
Visualización y gestión de todas las inscripciones de estudiantes a cursos.

### Estructura de Estado

```typescript
// Filtros
const [searchQuery, setSearchQuery] = useState('')
const [courseFilter, setCourseFilter] = useState<string>('all')

// Datos
const [enrollments, setEnrollments] = useState<Enrollment[]>([])
const [loading, setLoading] = useState(true)
```

### Carga de Datos

**Inicialización**:
```typescript
useEffect(() => {
  loadEnrollments()
}, []) // Solo una vez al montar
```

**Optimización**: ✅ Usa `getAllEnrollments()` en una sola llamada

### Filtrado

**Búsqueda multi-campo**:
```typescript
const filteredEnrollments = enrollments.filter(enrollment => {
  const student = users.find(u => u.id === enrollment.student_id)
  const course = courses.find(c => c.id === enrollment.course_id)
  
  const matchesSearch = 
    student?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course?.title?.toLowerCase().includes(searchQuery.toLowerCase())
  
  const matchesCourse = courseFilter === 'all' || enrollment.course_id === courseFilter
  
  return matchesSearch && matchesCourse
})
```

### Tabla de Inscripciones

**Columnas**:
- **Student**: Nombre del estudiante
- **Course**: Nombre del curso
- **Progress**: Progress bar + porcentaje con color
- **Enrolled**: Fecha de inscripción
- **Actions**: Botón para desinscribir

### Visualización de Progreso

**Progress Bar**:
```typescript
<Progress value={enrollment.progress} className="w-24" />
<span className={`text-sm ${getProgressColor(enrollment.progress)}`}>
  {enrollment.progress}%
</span>
```

**Colores por rango**:
```typescript
const getProgressColor = (progress: number) => {
  if (progress >= 75) return 'text-green-600'   // Verde
  if (progress >= 50) return 'text-blue-600'    // Azul
  if (progress >= 25) return 'text-yellow-600'  // Amarillo
  return 'text-red-600'                         // Rojo
}
```

**Leyenda visual**: Incluye indicadores de color al final de la tabla explicando los rangos

### Acción de Desinscripción

**Flujo**:
```
1. Usuario hace clic en botón UserX
2. handleUnenroll(enrollmentId)
3. ApiService.unenrollStudent(enrollmentId)
4. loadEnrollments() refresca lista
5. Toast de éxito
```

**Sin confirmación**: ⚠️ Elimina directamente sin diálogo de confirmación

**Refresh**: ✅ Correcto, recarga después de eliminar

---

## 💬 MessageManagement.tsx - Gestión de Mensajes

### Propósito
Sistema completo de mensajería: ver, enviar, marcar como leído, eliminar mensajes.

### Estructura de Estado

```typescript
// Filtros
const [searchQuery, setSearchQuery] = useState('')
const [statusFilter, setStatusFilter] = useState<'all' | 'read' | 'unread'>('all')

// Datos
const [messages, setMessages] = useState<Message[]>([])
const [loading, setLoading] = useState(true)

// Diálogos
const [showDetailsDialog, setShowDetailsDialog] = useState(false)
const [showDeleteDialog, setShowDeleteDialog] = useState(false)
const [showCreateDialog, setShowCreateDialog] = useState(false)

// Formulario de envío
const [receiverSearch, setReceiverSearch] = useState('')
const [selectedReceiver, setSelectedReceiver] = useState<string>('')
const [messageContent, setMessageContent] = useState('')
const [isSending, setIsSending] = useState(false)

// Selección
const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
```

### Carga de Datos

**Dependencia condicional**:
```typescript
useEffect(() => {
  if (users.length > 0) {
    loadMessages()
  }
}, [users]) // Solo cuando hay users disponibles
```

**Filtrado de mensajes válidos**:
```typescript
const validMessages = allMessages.filter((msg: any) => 
  msg && msg.sender_id && msg.receiver_id && msg.content
)
```

### Búsqueda de Receptor (Crear Mensaje)

**Características avanzadas**:
1. **Input de búsqueda** que filtra usuarios en tiempo real
2. **Lista desplegable** con resultados filtrados:
   - Avatar circular con inicial del nombre
   - Nombre y email
   - Badge con rol
   - Highlight al pasar mouse
3. **Selección**: Al hacer clic, se selecciona y muestra en badge
4. **Botón "Change"**: Para cambiar de receptor

**Filtrado de usuarios**:
```typescript
const filteredUsers = users.filter(user => {
  if (!receiverSearch.trim()) return true
  const searchLower = receiverSearch.toLowerCase()
  return (
    user.name.toLowerCase().includes(searchLower) ||
    user.email.toLowerCase().includes(searchLower) ||
    user.role.toLowerCase().includes(searchLower)
  )
}).filter(user => user.id !== currentUser?.id) // Excluye usuario actual
```

**UI del selector**:
- Input con ícono de búsqueda
- Lista con max-height y scroll
- Cada usuario clickeable con hover effect
- Badge de selección cuando hay receptor elegido

### Tabla de Mensajes

**Columnas**:
- **From**: Nombre del remitente con ícono User
- **To**: Nombre del destinatario con ícono Mail
- **Message**: Preview truncado (100 caracteres)
- **Status**: Badge "Read" o "Unread"
- **Sent**: Fecha con ícono Clock
- **Actions**: Dropdown menu

### Acciones Disponibles

1. **View Details**: Muestra contenido completo
2. **Mark as Read**: Solo si está unread (opción condicional)
3. **Delete**: Eliminar mensaje

### Dialog de Crear Mensaje

**Formulario**:
- Búsqueda de receptor (sistema avanzado descrito arriba)
- Textarea para contenido (6 rows)
- Contador de caracteres
- Validación: Receptor y contenido requeridos

**Estados del botón**:
- Deshabilitado si no hay receptor o contenido
- Muestra spinner "Sending..." mientras envía
- Gradiente azul cuando activo

**Flujo de envío**:
```
1. Usuario completa formulario
2. handleSendMessage() valida
3. setIsSending(true)
4. ApiService.createMessage({ sender_id, receiver_id, content })
5. Toast de éxito
6. loadMessages() refresca lista
7. Limpia formulario
8. Cierra diálogo
```

### Dialog de Detalles

**Información completa**:
- From, To (nombres)
- Sent (fecha)
- Status (read/unread)
- Message Content (en caja destacada con `bg-muted`)

---

## 📊 AdminAnalytics.tsx - Analíticas del Sistema

### Propósito
Dashboard de métricas y gráficos del sistema.

### Estructura de Estado

```typescript
const [enrollmentData, setEnrollmentData] = useState<any[]>([])
const [courseData, setCourseData] = useState<any[]>([])
const [loading, setLoading] = useState(true)
```

### Carga de Datos

**useEffect**:
```typescript
useEffect(() => {
  loadAnalytics()
}, [users, courses]) // Se recalcula cuando cambian users o courses
```

**Función de carga**:
```typescript
const loadAnalytics = async () => {
  // 1. Carga datos de inscripciones por curso (Top 10)
  const courseEnrollments = await Promise.all(
    courses.slice(0, 10).map(async (course) => {
      const enrollments = await ApiService.getEnrollmentsByCourse(course.id)
      return {
        name: course.title.length > 20 ? course.title.substring(0, 20) + '...' : course.title,
        students: enrollments.length,
        avgProgress: enrollments.length > 0
          ? enrollments.reduce((sum, e) => sum + e.progress, 0) / enrollments.length
          : 0,
      }
    })
  )
  
  // 2. Prepara datos de distribución de roles
  const roleData = [
    { name: 'Students', value: students.length, color: '#3b82f6' },
    { name: 'Teachers', value: teachers.length, color: '#10b981' },
    { name: 'Admins', value: admins.length, color: '#ef4444' },
  ]
}
```

**⚠️ Optimización pendiente**: Hace N llamadas API (una por curso). Podría usar `getAllEnrollments()` y agrupar.

### Cards de Resumen

**4 Cards principales**:
1. **Total Users**: 
   - Número total
   - Desglose: Students, Teachers, Admins
2. **Total Courses**
3. **Student/Teacher Ratio**: Calculado como `students.length / teachers.length`
4. **Avg Courses/Teacher**: Calculado como `courses.length / teachers.length`

### Gráficos (Recharts)

#### 1. Pie Chart - Distribución de Usuarios

**Datos**: `enrollmentData` (roleData)
**Características**:
- Labels con porcentajes
- Colores personalizados por rol
- Tooltip interactivo
- Responsive container

#### 2. Bar Chart - Inscripciones por Curso

**Datos**: `courseData` (Top 10 cursos)
**Características**:
- X-axis con labels rotados (-45°)
- Y-axis con número de estudiantes
- Bar azul (`#3b82f6`)
- Grid con líneas punteadas

#### 3. Progress Bars - Distribución de Roles

**Implementación**:
- Progress component de Shadcn
- 3 barras (Students, Teachers, Admins)
- Colores de fondo diferentes por rol
- Porcentajes calculados

#### 4. Line Chart - Progreso Promedio por Curso

**Datos**: `courseData`
**Características**:
- Línea verde (`#10b981`)
- Y-axis de 0 a 100%
- Muestra progreso promedio de estudiantes por curso

---

## 📋 CourseAssignmentsDialog.tsx - Asignaciones de Curso

### Propósito
Dialog modal para gestionar asignaciones de un curso específico.

### Características Únicas

**Tamaño del diálogo**: `70vw` width, `max-h-[90vh]` height
**Scroll interno**: `overflow-y-auto` en el contenido

### Carga de Datos

**useEffect condicional**:
```typescript
useEffect(() => {
  if (open && course) {
    loadAssignments()
  }
}, [open, course]) // Solo carga cuando está abierto y hay curso
```

**Optimización**: ✅ Usa `getAssignmentsByCourse(course.id)` específico

### Tabla de Asignaciones

**Columnas**:
- Title + Description (truncada)
- Due Date
- Status (badge con estados)
- Created
- Actions

**Estados**: Mismo sistema de badges que `AssignmentManagement`

### Integración con AssignmentEditor

**Props especiales**:
```typescript
<AssignmentEditor
  courses={course ? [course] : []} // Solo el curso actual
  dialogClassName="max-h-[90vh] !w-[70vw]"
  dialogStyle={{ maxWidth: '70vw', width: '70vw' }}
/>
```

**Refresh**: ✅ Llama a `loadAssignments()` después de guardar

---

## 📄 CourseModulesDialog.tsx - Módulos de Curso

### Propósito
Gestión completa de módulos de un curso con drag-and-drop para reordenar.

### Características Avanzadas

#### Drag and Drop

**Implementación**:
```typescript
// Estados
const [draggedModule, setDraggedModule] = useState<string | null>(null)

// Handlers
const handleDragStart = (e: React.DragEvent, moduleId: string) => {
  setDraggedModule(moduleId)
  e.dataTransfer.effectAllowed = 'move'
}

const handleDragOver = (e: React.DragEvent) => {
  e.preventDefault()
  e.dataTransfer.dropEffect = 'move'
}

const handleDrop = async (e: React.DragEvent, targetModuleId: string) => {
  e.preventDefault()
  
  // 1. Reordena en el array local
  const newModules = [...modules]
  const [draggedItem] = newModules.splice(draggedIndex, 1)
  newModules.splice(targetIndex, 0, draggedItem)
  
  // 2. Actualiza order de todos los módulos
  const updatedModules = newModules.map((module, index) => ({
    ...module,
    order: index,
  }))
  
  // 3. Actualiza estado visual inmediatamente
  setModules(updatedModules)
  
  // 4. Persiste en backend
  for (const module of updatedModules) {
    await ApiService.updateModule(module.id, { order: module.order })
  }
  
  // 5. Revertir en caso de error
}
```

**UI de Drag**:
- Ícono `GripVertical` en cada fila
- Cursor `move` al pasar sobre el grip
- Filas con `draggable={true}`

#### Tipos de Módulos

**Tipos soportados**:
- `text`: Contenido de texto (HTML)
- `video`: Video (URL)
- `pdf`: Documento PDF (file_url)
- `image`: Imagen (file_url)
- `link`: Enlace externo (URL)
- `assignment`: Asignación

**Íconos por tipo**:
```typescript
const getModuleIcon = (type: CourseModule['type']) => {
  switch (type) {
    case 'text': return <FileText />
    case 'video': return <Video />
    case 'pdf': return <File />
    case 'image': return <Image />
    case 'link': return <Link />
    case 'assignment': return <FileText />
  }
}
```

### Tabla de Módulos

**Columnas**:
- Grip (para drag)
- Module: Ícono + título + order
- Type: Badge
- Content Preview: HTML sanitizado, truncado
- Duration
- Actions

### Diálogos

#### Create Module Dialog
- Formulario completo con campos dinámicos según tipo
- Validación: Título requerido
- Campos condicionales según tipo de módulo

#### Edit Module Dialog
- Mismo formulario pero pre-llenado
- Edición directa del objeto `editingModule`

---

## 🎯 Patrones Comunes Identificados

### 1. Patrón de Carga de Datos

**Variante A - Carga única al montar**:
```typescript
useEffect(() => {
  loadData()
}, [])
```

**Variante B - Recarga reactiva**:
```typescript
useEffect(() => {
  loadData()
}, [dependency]) // Se recalcula cuando cambia dependencia
```

**Variante C - Condicional**:
```typescript
useEffect(() => {
  if (condition) {
    loadData()
  }
}, [condition])
```

### 2. Patrón de Refresh

**✅ Correcto** (callbacks):
```typescript
// En componente hijo
onUpdate?.() // Llama callback del padre

// En componente padre
<ChildComponent onUpdate={refreshData} />
```

**⚠️ Incorrecto** (hard refresh):
```typescript
window.location.reload() // Recarga toda la página
```

### 3. Patrón de Filtrado

**Filtrado client-side**:
- Filtra array local
- Búsqueda case-insensitive
- Combinación de múltiples filtros
- Actualización en tiempo real

### 4. Patrón de Diálogos Modales

**Estructura típica**:
```typescript
// Estados
const [showDialog, setShowDialog] = useState(false)
const [selectedItem, setSelectedItem] = useState<Type | null>(null)

// Handler
const handleAction = (item: Type) => {
  setSelectedItem(item)
  setShowDialog(true)
}

// Dialog
<Dialog open={showDialog} onOpenChange={setShowDialog}>
  {/* Contenido */}
</Dialog>
```

### 5. Patrón de Estados de Carga

**Estados booleanos**:
```typescript
const [loading, setLoading] = useState(true)
const [isUpdating, setIsUpdating] = useState(false)
const [isCreating, setIsCreating] = useState(false)
```

**UI de carga**:
- Spinner (`Loader2`) durante carga
- Botones deshabilitados durante operaciones
- Texto dinámico ("Creating...", "Updating...")

### 6. Patrón de Optimización de APIs

**Antes** (N llamadas):
```typescript
for (const item of items) {
  const data = await ApiService.getData(item.id)
}
```

**Después** (1 llamada):
```typescript
const allData = await ApiService.getAllData()
// Agrupar client-side
const grouped = allData.reduce((acc, item) => {
  acc[item.parent_id] = acc[item.parent_id] || []
  acc[item.parent_id].push(item)
  return acc
}, {})
```

---

## 🔄 Flujos de Datos Complejos

### Flujo 1: Editar Curso

```
Usuario → Click "Edit" 
→ handleEditCourse(course)
→ setSelectedCourse(course)
→ setEditTitle(course.title)
→ setShowEditDialog(true)
→ Usuario edita campos
→ Click "Update Course"
→ handleUpdateCourse()
→ setIsUpdating(true)
→ ApiService.updateCourse(id, data)
→ onCourseUpdate() callback
→ refreshCourses() en AdminDashboard
→ courses prop actualiza
→ useEffect en CourseManagement detecta cambio
→ loadStats() recalcula estadísticas
→ UI se actualiza
```

### Flujo 2: Crear Asignación desde CourseAssignmentsDialog

```
Usuario → Click "Create Assignment"
→ handleCreateAssignment()
→ setEditingAssignment(null)
→ setShowEditorDialog(true)
→ AssignmentEditor se abre
→ Usuario completa formulario
→ Click "Save"
→ ApiService.createAssignment(data)
→ onSave() callback
→ handleEditorSave()
→ loadAssignments() refresca lista
→ setShowEditorDialog(false)
→ Tabla actualizada
```

### Flujo 3: Reordenar Módulos (Drag & Drop)

```
Usuario → Drag module A
→ handleDragStart(e, moduleId)
→ setDraggedModule(moduleId)
→ Drop en posición B
→ handleDrop(e, targetModuleId)
→ Reordena array local
→ setModules(updatedModules) [update optimista]
→ Bucle: ApiService.updateModule(id, { order })
→ Si éxito: toast.success
→ Si error: loadModules() [revertir]
```

---

## 🎨 Elementos UI/UX Destacados

### 1. Gradientes Animados
- Botones de acción principal
- Hover effects con cambio de tono
- Transiciones suaves

### 2. Badges de Estado
- Colores semánticos (rojo=destructivo, azul=info, etc.)
- Variantes consistentes (destructive, default, secondary)

### 3. Progress Bars
- Visualización de progreso
- Colores por rango
- Combinación con porcentaje numérico

### 4. Tablas Responsivas
- Columnas ocultas con clases `hidden md:table-cell`
- Información condensada en móvil
- Scroll horizontal en tablas anchas

### 5. Diálogos Modales
- Tamaños consistentes (`70vw` para grandes, `max-w-2xl` para medianos)
- Scroll interno cuando es necesario
- Overlay con backdrop

### 6. Feedback Visual
- Toasts de éxito/error (Sonner)
- Estados de carga (spinners)
- Botones deshabilitados durante operaciones
- Contadores de resultados

### 7. Búsqueda en Tiempo Real
- Filtrado instantáneo
- Búsqueda multi-campo
- Sin necesidad de botón "Buscar"

---

## 📝 Recomendaciones de Mejora

### Prioridad Alta

1. **Eliminar `window.location.reload()`**:
   - UserManagement usa reload después de editar/eliminar
   - Debería usar callbacks como CourseManagement

2. **Optimizar AdminAnalytics**:
   - Hace N llamadas a `getEnrollmentsByCourse()`
   - Debería usar `getAllEnrollments()` y agrupar

3. **Agregar confirmación en EnrollmentManagement**:
   - Desinscripción sin confirmación puede ser accidental

### Prioridad Media

4. **Agregar paginación** en tablas grandes
5. **Implementar debounce** en búsquedas (aunque ya es suficientemente rápido)
6. **Caché de datos** para evitar recargas innecesarias

### Prioridad Baja

7. **Añadir skeletons** durante carga inicial
8. **Implementar undo** para acciones destructivas
9. **Mejorar accesibilidad** (ARIA labels, keyboard navigation)

---

## 📊 Resumen de Métricas de UI

| Componente | Diálogos | Estados | API Calls | Refresh Pattern |
|-----------|----------|---------|-----------|----------------|
| AdminDashboard | 0 | 3 | 2 (inicial) | Callbacks |
| UserManagement | 2 | 4 | 0 (props) | ❌ Hard reload |
| CourseManagement | 5 | 10+ | 2 (optimizado) | ✅ Callbacks |
| AssignmentManagement | 3 | 6 | 1 (inicial) | ✅ Manual |
| EnrollmentManagement | 0 | 4 | 1 (inicial) | ✅ Manual |
| MessageManagement | 3 | 8 | 1 (condicional) | ✅ Manual |
| AdminAnalytics | 0 | 3 | N+2 (no optimizado) | ✅ Reactivo |
| CourseAssignmentsDialog | 3 | 6 | 1 (condicional) | ✅ Manual |
| CourseModulesDialog | 3 | 8 | Variable (D&D) | ✅ Manual |

---

*Análisis generado: $(date)*
*Proyecto: Kampus - Learning Management System*
*Última actualización: Análisis completo de todos los componentes Admin*

