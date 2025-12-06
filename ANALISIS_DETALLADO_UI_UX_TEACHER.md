# Análisis Detallado UI/UX - Vista Teacher

## 📋 Índice

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [TeacherDashboard - Componente Principal](#teacherdashboard)
3. [CourseEditor - Editor de Módulos](#courseeditor)
4. [TeacherAnalytics - Analytics y Métricas](#teacheranalytics)
5. [RosterManager - Gestión de Estudiantes](#rostermanager)
6. [EvaluationBuilder - Constructor de Evaluaciones](#evaluationbuilder)
7. [Problemas Identificados](#problemas-identificados)
8. [Recomendaciones de Mejora](#recomendaciones-de-mejora)

---

## Resumen Ejecutivo

### Componentes Analizados
1. **TeacherDashboard** - Dashboard principal con tabs (Overview, My Courses, Assignments, Grading)
2. **CourseEditor** - Editor de módulos de curso con drag & drop
3. **TeacherAnalytics** - Analytics con datos mock (no conectado a API real)
4. **RosterManager** - Gestión de estudiantes con datos mock
5. **EvaluationBuilder** - Constructor de evaluaciones/quiz con datos mock

### Estado General
- ✅ **Bien implementado**: Navegación con tabs responsivos, gestión de cursos y assignments
- ⚠️ **Datos mock**: 3 componentes usan datos hardcodeados (Analytics, RosterManager, EvaluationBuilder)
- ⚠️ **Optimización necesaria**: Múltiples llamadas API en loops (similar a admin pre-optimización)
- ✅ **Patrones consistentes**: Uso de shadcn/ui, toast notifications, dialogs

### Arquitectura de Datos
- **TeacherDashboard**: Usa hooks `useCourses`, `useAssignments`, `useSubmissions`, `useEnrollments`
- **CourseEditor**: Usa `ApiService.getCourseModules()` directamente
- **Otros componentes**: Datos mock, no conectados a API

---

## TeacherDashboard

### 📊 Estructura General

**Ubicación**: `src/components/teacher/TeacherDashboard.tsx`  
**Líneas**: ~1100 líneas  
**Props**: `{ user: UserProfile, defaultTab?: string }`

### Estado y Gestión de Datos

#### Estados Principales
```typescript
const [activeTab, setActiveTab] = useState(defaultTab || 'overview');
const [showCreateCourse, setShowCreateCourse] = useState(false);
const [showCreateAssignment, setShowCreateAssignment] = useState(false);
const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
const [showAssignmentEditor, setShowAssignmentEditor] = useState(false);
const [editingAssignment, setEditingAssignment] = useState<any>(null);
const [showCourseDetails, setShowCourseDetails] = useState(false);
const [selectedCourseDetails, setSelectedCourseDetails] = useState<any>(null);
const [showCourseEditor, setShowCourseEditor] = useState(false);
const [editingCourse, setEditingCourse] = useState<any>(null);
const [showEditCourseDialog, setShowEditCourseDialog] = useState(false);
```

#### Datos y Hooks
- `useCourses(user.id)` - Cursos del teacher (hook personalizado)
- `useEnrollments()` - Hook para enrollments (no usado directamente, solo refreshEnrollments)
- Estados locales: `courseEnrollments`, `allAssignments`, `pendingSubmissions`

### 🔄 Patrón de Carga de Datos

#### Función `loadData` (Líneas 258-312)
```typescript
const loadData = useCallback(async () => {
  // PROBLEMA: Múltiples llamadas API en loops
  // 1. Loop sobre cursos para obtener enrollments
  const enrollmentsPromises = courses.map(c => 
    ApiService.getEnrollmentsByCourse(c.id).catch(() => [])
  );
  const enrollmentsArrays = await Promise.all(enrollmentsPromises);
  
  // 2. Loop sobre cursos para obtener assignments
  const assignmentsPromises = courses.map(c => 
    ApiService.getAssignmentsByCourse(c.id).catch(() => [])
  );
  
  // 3. Loop sobre assignments para obtener submissions
  const submissionsPromises = assignments.map(a => 
    ApiService.getSubmissionsByAssignment(a.id).catch(() => [])
  );
}, [courses]);
```

**Problema identificado**: Similar a `AdminAnalytics` antes de optimizar. Si hay 10 cursos con 5 assignments cada uno:
- 10 llamadas para enrollments
- 10 llamadas para assignments
- 50 llamadas para submissions
- **Total: ~70 llamadas API** ❌

**Optimización recomendada**:
- Usar `ApiService.getAllEnrollments()` una vez
- Usar `ApiService.getAllAssignments()` una vez
- Filtrar client-side por `course_id` y `assignment_id`

#### Refresh de Datos
- `refreshCourses()` - Se llama después de crear/editar curso
- `loadData()` - Se llama después de crear assignment
- `useEffect(() => loadData(), [loadData])` - Se ejecuta cuando cambian los cursos

**Problema**: El `useEffect` depende de `loadData`, que depende de `courses`. Esto puede causar renders innecesarios.

### 🎨 UI/UX Elements

#### Tabs Responsivos (Líneas 117-223)
- Sistema dinámico de tabs que se ocultan en pantallas pequeñas
- Dropdown "More" para tabs ocultos
- Sincronización con URL (`useLocation`, `useNavigate`)
- **Bien implementado**: Algoritmo similar al de admin

#### Tabs Disponibles
1. **Overview** (`/dashboard`) - Vista general con cursos recientes y pending grading
2. **My Courses** (`/teacher/courses`) - Lista completa de cursos
3. **Assignments** (`/teacher/assignments`) - Todos los assignments
4. **Grading** (`/teacher/grading`) - Submissions pendientes de calificar

#### Stats Cards (Líneas 489-533)
- Total Courses
- Total Students (suma de todos los enrollments)
- Total Assignments
- Pending Grading (submissions sin grade)

### 🔧 Funcionalidades

#### Crear Curso
- Dialog simple (Líneas 452-486)
- Campos: `title`, `description`
- Llama a `ApiService.createCourse()`
- Refresca con `refreshCourses()`

#### Crear Assignment
- Dialog simple (Líneas 832-875)
- Campos: `title`, `description`, `due_date` (opcional)
- Requiere seleccionar curso primero
- Llama a `ApiService.createAssignment()`
- Refresca con `loadData()`

#### Editar Curso
- Dialog completo (Líneas 1038-1096)
- Campos: `title`, `description`, `cover_image_url` (via `CoverImageUpload`)
- Usa `ApiService.updateCourse()`
- Refresca con `refreshCourses()`

#### Ver Detalles de Curso
- Dialog modal (Líneas 900-1035)
- Muestra: descripción, stats (students, assignments), acciones rápidas
- Lista assignments recientes
- Botones para agregar assignment o editar curso

### ⚠️ Problemas Identificados

1. **N+1 Query Problem** - Múltiples llamadas API en loops
2. **No hay debounce** - Búsquedas (si se implementan) no tienen debounce
3. **No hay paginación** - Listas pueden ser largas sin paginación
4. **Estados duplicados** - `selectedCourse` y `selectedCourseDetails` podrían consolidarse
5. **Manejo de errores** - Algunos `.catch(() => [])` ocultan errores reales
6. **Loading states** - Solo muestra loading inicial, no durante refresh

### 💡 Interacciones con Otros Componentes

- **AssignmentEditor** - Componente compartido con admin para editar assignments
- **CourseEditor** - Componente propio para editar módulos de curso
- **CoverImageUpload** - Componente compartido con admin

---

## CourseEditor

### 📊 Estructura General

**Ubicación**: `src/components/teacher/CourseEditor.tsx`  
**Líneas**: ~830 líneas  
**Props**: `{ course: Course, onBack: () => void }`

### Estado y Gestión de Datos

#### Estados Principales
```typescript
const [modules, setModules] = useState<CourseModule[]>([]);
const [loading, setLoading] = useState(true);
const [searchQuery, setSearchQuery] = useState('');
const [showAddModule, setShowAddModule] = useState(false);
const [editingModule, setEditingModule] = useState<CourseModule | null>(null);
const [selectedModule, setSelectedModule] = useState<CourseModule | null>(null);
const [showDeleteDialog, setShowDeleteDialog] = useState(false);
const [draggedModule, setDraggedModule] = useState<string | null>(null);
```

#### Carga de Datos
- `loadModules()` - Carga módulos con `ApiService.getCourseModules(course.id)`
- Se ejecuta en `useEffect` cuando cambia `course.id`
- Ordena módulos por `order` field

### 🎨 UI/UX Elements

#### Tabs
1. **Modules** - Lista de módulos en tabla con drag & drop
2. **Preview** - Vista previa del curso como lo vería el estudiante

#### Tabla de Módulos
- Columnas: Drag handle, Module (con icono), Type, Content Preview, Duration, Actions
- Drag & drop para reordenar (Líneas 182-230)
- Filtrado por búsqueda en tiempo real (sin debounce)

#### Tipos de Módulo Soportados
1. **text** - Contenido HTML/rich text
2. **video** - Videos (YouTube, Vimeo, o archivos directos)
3. **pdf** - Documentos PDF
4. **image** - Imágenes
5. **link** - Enlaces externos
6. **assignment** - Asignaciones

### 🔧 Funcionalidades

#### Agregar Módulo
- Dialog completo (Líneas 581-690)
- Campos dinámicos según tipo de módulo
- Validación: requiere `title`
- Llama a `ApiService.createModule()`
- Refresca con `loadModules()`

#### Editar Módulo
- Dialog completo (Líneas 693-804)
- Misma estructura que agregar
- Llama a `ApiService.updateModule()`
- Refresca con `loadModules()`

#### Eliminar Módulo
- Dialog de confirmación (Líneas 807-826)
- Llama a `ApiService.deleteModule()`
- Refresca con `loadModules()`

#### Reordenar Módulos (Drag & Drop)
- **Implementación**: HTML5 Drag & Drop API
- Actualiza orden optimísticamente en UI
- Luego actualiza en backend (una llamada por módulo afectado)
- **Problema**: Si hay 10 módulos y se reordena el primero al último, se hacen 10 llamadas API

### ⚠️ Problemas Identificados

1. **Drag & Drop ineficiente** - Actualiza todos los módulos en backend, no solo los afectados
2. **No hay debounce** - Búsqueda se ejecuta en cada keystroke
3. **No hay paginación** - Si hay muchos módulos, la tabla puede ser larga
4. **Preview no es interactivo** - Solo muestra contenido, no simula experiencia de estudiante
5. **Manejo de errores básico** - Solo `toast.error()`, no hay rollback en drag & drop
6. **Video embeds** - Parsing de URLs de YouTube/Vimeo podría ser más robusto

### 💡 Características Destacadas

- ✅ Soporte múltiple de tipos de contenido
- ✅ Preview visual del curso
- ✅ Drag & drop funcional
- ✅ Iconos distintos por tipo de módulo

---

## TeacherAnalytics

### 📊 Estructura General

**Ubicación**: `src/components/teacher/TeacherAnalytics.tsx`  
**Líneas**: ~290 líneas  
**Props**: `{ courses: Course[] }`

### ⚠️ Estado Crítico: Datos Mock

**Este componente NO está conectado a la API real**. Usa datos hardcodeados:

```typescript
const mockAnalyticsData = {
  monthlyProgress: [...], // Datos hardcodeados
  gradeDistribution: [...], // Datos hardcodeados
  studentEngagement: [...] // Datos hardcodeados
};
```

### 🎨 UI/UX Elements

#### Stats Cards (Líneas 72-124)
1. **Total Students** - Suma de `enrolledStudents` de todos los cursos
2. **Avg Completion** - Promedio de `completionRate`
3. **Active Courses** - Cursos con status 'published'
4. **Avg Study Time** - Hardcodeado: "2.5h"

#### Charts (Recharts)
1. **Monthly Progress** - BarChart con enrollments y completions
2. **Grade Distribution** - PieChart con rangos de calificaciones
3. **Student Engagement** - LineChart con estudiantes activos y assignments completados

#### Listas
- **Top Performing Students** - Hardcodeado
- **Recent Activity** - Hardcodeado

### ⚠️ Problemas Identificados

1. **Datos completamente mock** - No hay integración con API
2. **Props no usadas correctamente** - Recibe `courses` pero solo calcula stats básicos
3. **Datos hardcodeados** - Monthly progress, grades, engagement son estáticos
4. **No hay loading states** - Asume datos siempre disponibles
5. **No hay error handling** - No hay manejo de errores porque no hay API calls

### 💡 Recomendaciones

**ALTA PRIORIDAD**: Conectar a API real o crear endpoints necesarios:
- `/api/analytics/teacher/:teacher_id/monthly-progress`
- `/api/analytics/teacher/:teacher_id/grade-distribution`
- `/api/analytics/teacher/:teacher_id/engagement`
- `/api/analytics/teacher/:teacher_id/top-students`
- `/api/analytics/teacher/:teacher_id/recent-activity`

---

## RosterManager

### 📊 Estructura General

**Ubicación**: `src/components/teacher/RosterManager.tsx`  
**Líneas**: ~425 líneas  
**Props**: `{ course: Course, onBack: () => void }`

### ⚠️ Estado Crítico: Datos Mock

**Este componente NO está conectado a la API real**. Usa datos hardcodeados:

```typescript
const mockStudents: Student[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    enrollmentStatus: 'approved',
    progress: 65,
    // ... más campos mock
  },
  // ... más estudiantes mock
];
```

### 🎨 UI/UX Elements

#### Stats Cards (Líneas 146-200)
1. **Total Students** - Estudiantes aprobados
2. **Pending Approval** - Enrollments pendientes
3. **Average Progress** - Promedio de progreso
4. **Completion Rate** - Estudiantes con 100% progreso

#### Tabs
1. **All Students** - Todos los estudiantes
2. **Approved** - Solo aprobados
3. **Pending** - Solo pendientes (con badge de contador)

#### Funcionalidades
- ✅ Búsqueda por nombre/email (sin debounce)
- ✅ Filtro por status
- ✅ Aprobar/Rechazar enrollment (solo actualiza estado local, no API)
- ✅ Enviar mensaje (mock, solo console.log)
- ✅ Ver progreso de estudiantes
- ✅ Badges de status (approved/pending/rejected)

### ⚠️ Problemas Identificados

1. **Datos completamente mock** - No hay integración con API
2. **Acciones no persisten** - Approve/Reject solo actualiza estado local
3. **No hay paginación** - Si hay muchos estudiantes, la lista puede ser larga
4. **No hay debounce** - Búsqueda se ejecuta en cada keystroke
5. **Funciones mock** - `sendMessage()` solo hace console.log
6. **No hay loading states** - Asume datos siempre disponibles
7. **Datos incompletos** - No muestra información real de enrollments del curso

### 💡 Recomendaciones

**ALTA PRIORIDAD**: Conectar a API real:
- Cargar enrollments reales del curso con `ApiService.getEnrollmentsByCourse(course.id)`
- Conectar con API de users para obtener datos de estudiantes
- Implementar endpoints para approve/reject enrollments
- Integrar con sistema de mensajes real

---

## EvaluationBuilder

### 📊 Estructura General

**Ubicación**: `src/components/teacher/EvaluationBuilder.tsx`  
**Líneas**: ~630 líneas  
**Props**: `{ course: Course, onBack: () => void }`

### ⚠️ Estado Crítico: Datos Mock

**Este componente NO está conectado a la API real**. Usa datos hardcodeados:

```typescript
const mockEvaluations: Evaluation[] = [
  {
    id: '1',
    title: 'HTML & CSS Fundamentals Quiz',
    // ... más campos mock
    questions: [...]
  },
  // ... más evaluaciones mock
];
```

### 🎨 UI/UX Elements

#### Vistas Principales
1. **Lista de Evaluaciones** - Grid de cards (Líneas 553-628)
2. **Editor de Evaluación** - Formulario completo (Líneas 306-551)
3. **Editor de Pregunta** - Formulario para preguntas (Líneas 200-304)

#### Tipos de Evaluación
1. **Quiz** - Con time limit, attempts, passing grade
2. **Assignment** - Sin time limit obligatorio

#### Tipos de Pregunta
1. **Multiple Choice** - Con opciones y respuesta correcta
2. **Open Ended** - Pregunta abierta

#### Funcionalidades
- ✅ Crear nueva evaluación
- ✅ Agregar/editar/eliminar preguntas
- ✅ Configurar time limit, attempts, passing grade
- ✅ Marcar respuestas correctas en MCQ
- ✅ Drag & drop para reordenar preguntas (UI solo, no implementado)
- ✅ Preview (botón presente pero no implementado)
- ✅ Publicar/Despublicar (solo cambia estado local)

### ⚠️ Problemas Identificados

1. **Datos completamente mock** - No hay integración con API
2. **No persiste en backend** - `saveEvaluation()` solo actualiza estado local
3. **Preview no implementado** - Botón presente pero sin funcionalidad
4. **Drag & drop de preguntas** - UI muestra `GripVertical` pero no funciona
5. **No hay validación** - Puede guardar evaluaciones sin preguntas
6. **Puntos totales** - Se calcula pero no se valida
7. **Due date** - Campo presente pero no se usa en lógica

### 💡 Recomendaciones

**ALTA PRIORIDAD**: Conectar a API real:
- Crear endpoints para evaluations/quizzes:
  - `POST /api/courses/:course_id/evaluations`
  - `GET /api/courses/:course_id/evaluations`
  - `PUT /api/evaluations/:evaluation_id`
  - `DELETE /api/evaluations/:evaluation_id`
- Implementar persistencia real
- Implementar preview funcional
- Agregar validaciones (al menos 1 pregunta, puntos > 0, etc.)

---

## Problemas Identificados

### 🔴 Críticos (Alta Prioridad)

1. **Datos Mock en 3 Componentes**
   - `TeacherAnalytics` - Datos completamente hardcodeados
   - `RosterManager` - Estudiantes mock, acciones no persisten
   - `EvaluationBuilder` - Evaluaciones mock, no se guardan

2. **N+1 Query Problem en TeacherDashboard**
   - Múltiples llamadas API en loops
   - Debería usar `getAllEnrollments()`, `getAllAssignments()`, `getAllSubmissions()`

3. **Falta de Persistencia**
   - Acciones en RosterManager y EvaluationBuilder solo actualizan estado local

### 🟡 Importantes (Prioridad Media)

4. **Falta Debounce en Búsquedas**
   - `CourseEditor` - Búsqueda de módulos
   - `RosterManager` - Búsqueda de estudiantes

5. **Falta Paginación**
   - `CourseEditor` - Lista de módulos puede ser larga
   - `RosterManager` - Lista de estudiantes puede ser larga
   - `TeacherDashboard` - Listas de assignments/submissions

6. **Drag & Drop Ineficiente**
   - `CourseEditor` - Actualiza todos los módulos, no solo los afectados

7. **Falta Loading States**
   - Múltiples componentes no muestran loading durante refresh
   - Solo muestran loading inicial

8. **No hay Skeletons**
   - Falta feedback visual durante carga

### 🟢 Mejoras Menores (Prioridad Baja)

9. **Estados Duplicados**
   - `selectedCourse` y `selectedCourseDetails` en TeacherDashboard

10. **Manejo de Errores Básico**
    - Algunos `.catch(() => [])` ocultan errores reales

11. **Falta Undo en Acciones Destructivas**
    - Eliminar módulo, eliminar pregunta, rechazar estudiante

12. **Preview No Implementado**
    - `EvaluationBuilder` - Botón preview sin funcionalidad

13. **Falta Accesibilidad**
    - ARIA labels faltantes en algunos botones
    - Keyboard navigation no optimizada

---

## Recomendaciones de Mejora

### Fase 1: Conectar Datos Reales (Crítico)

1. **TeacherAnalytics**
   - Crear endpoints de analytics en backend
   - Conectar componente a API real
   - Implementar loading states y error handling

2. **RosterManager**
   - Cargar enrollments reales del curso
   - Cargar datos de usuarios (students)
   - Implementar approve/reject enrollment endpoints
   - Conectar acciones a API

3. **EvaluationBuilder**
   - Crear endpoints de evaluations/quizzes
   - Implementar persistencia real
   - Conectar todas las operaciones CRUD a API

### Fase 2: Optimizaciones de Performance

4. **TeacherDashboard - Optimizar loadData()**
   ```typescript
   // Cambiar de:
   courses.map(c => ApiService.getEnrollmentsByCourse(c.id))
   
   // A:
   const allEnrollments = await ApiService.getAllEnrollments();
   const enrollmentsByCourse = allEnrollments.filter(e => 
     courses.some(c => c.id === e.course_id)
   );
   ```

5. **CourseEditor - Optimizar Drag & Drop**
   - Solo actualizar módulos que cambiaron de posición
   - Batch updates en una sola llamada API si es posible

6. **Agregar Debounce**
   - Búsquedas en CourseEditor
   - Búsquedas en RosterManager

### Fase 3: Mejoras de UX

7. **Paginación**
   - CourseEditor modules table
   - RosterManager students list
   - TeacherDashboard assignments/submissions lists

8. **Skeletons**
   - Agregar durante carga inicial
   - Agregar durante refresh

9. **Loading States Mejorados**
   - Indicadores durante operaciones asíncronas
   - Botones disabled durante submit

10. **Undo para Acciones Destructivas**
    - Eliminar módulo
    - Eliminar pregunta
    - Rechazar estudiante

### Fase 4: Funcionalidades Faltantes

11. **Preview de Evaluaciones**
    - Implementar vista previa funcional
    - Mostrar cómo vería el estudiante el quiz

12. **Drag & Drop de Preguntas**
    - Completar implementación en EvaluationBuilder
    - Persistir orden en backend

13. **Mejoras de Accesibilidad**
    - ARIA labels completos
    - Keyboard navigation mejorada
    - Focus indicators claros

---

## Resumen de Métricas

### Componentes
- **Total**: 5 componentes
- **Conectados a API**: 2 (TeacherDashboard, CourseEditor)
- **Con datos mock**: 3 (TeacherAnalytics, RosterManager, EvaluationBuilder)

### Líneas de Código
- **TeacherDashboard**: ~1100 líneas
- **CourseEditor**: ~830 líneas
- **TeacherAnalytics**: ~290 líneas
- **RosterManager**: ~425 líneas
- **EvaluationBuilder**: ~630 líneas
- **Total**: ~3275 líneas

### Problemas por Categoría
- **Críticos**: 3
- **Importantes**: 8
- **Mejoras Menores**: 5

### Prioridades
1. **P0 (Crítico)**: Conectar datos reales (3 componentes)
2. **P1 (Alta)**: Optimizar N+1 queries en TeacherDashboard
3. **P2 (Media)**: Debounce, paginación, skeletons
4. **P3 (Baja)**: Accesibilidad, undo, previews

---

*Análisis generado el: $(date)*  
*Proyecto: Kampus - Learning Management System*  
*Última actualización: Análisis completo de todos los componentes Teacher*
