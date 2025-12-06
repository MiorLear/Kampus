# Plan de Mejoras - Vista Teacher

## 📋 Resumen Ejecutivo

Este documento detalla el plan de implementación para mejorar la vista de Teacher, basado en el análisis detallado realizado en `ANALISIS_DETALLADO_UI_UX_TEACHER.md`.

### Objetivos
1. Conectar componentes con datos reales (3 componentes actualmente con mock)
2. Optimizar performance (eliminar N+1 queries)
3. Mejorar UX (debounce, paginación, skeletons, undo)
4. Completar funcionalidades faltantes (preview, drag & drop, validaciones)

### Priorización
- **Fase 1 (Crítica)**: Conectar datos reales y optimizar performance
- **Fase 2 (Importante)**: Mejoras de UX (debounce, paginación, skeletons)
- **Fase 3 (Adicional)**: Funcionalidades faltantes y mejoras menores
  
---

## 🔴 Fase 1: Conexión de Datos Reales y Optimización (Prioridad Crítica)

### ✅ Mejora 1.1: Conectar TeacherAnalytics a API Real

**Problema**: Componente usa datos completamente mock.

**Solución**: Crear endpoints de analytics y conectar componente.

#### Pasos de Implementación

1. **Crear endpoints de analytics en backend**
   ```python
   # backend/app/api/teacher_analytics.py
   @teacher_analytics_bp.get("/<teacher_id>/monthly-progress")
   @teacher_analytics_bp.get("/<teacher_id>/grade-distribution")
   @teacher_analytics_bp.get("/<teacher_id>/engagement")
   @teacher_analytics_bp.get("/<teacher_id>/top-students")
   @teacher_analytics_bp.get("/<teacher_id>/recent-activity")
   ```

2. **Crear servicio y repositorio**
   - `backend/app/repositories/teacher_analytics_repository.py`
   - `backend/app/services/teacher_analytics_service.py`

3. **Agregar métodos en ApiService**
   ```typescript
   // src/services/api.service.ts
   static async getTeacherMonthlyProgress(teacherId: string): Promise<any[]>
   static async getTeacherGradeDistribution(teacherId: string): Promise<any[]>
   static async getTeacherEngagement(teacherId: string): Promise<any[]>
   static async getTeacherTopStudents(teacherId: string): Promise<any[]>
   static async getTeacherRecentActivity(teacherId: string): Promise<any[]>
   ```

4. **Actualizar TeacherAnalytics.tsx**
   - Reemplazar `mockAnalyticsData` con llamadas API
   - Agregar loading states
   - Agregar error handling

**Archivos a crear/modificar**:
- `backend/app/api/teacher_analytics.py` (nuevo)
- `backend/app/repositories/teacher_analytics_repository.py` (nuevo)
- `backend/app/services/teacher_analytics_service.py` (nuevo)
- `src/services/api.service.ts`
- `src/components/teacher/TeacherAnalytics.tsx`

**Tiempo estimado**: 4-5 horas

**Criterios de Aceptación**:
- ✅ Componente carga datos reales desde API
- ✅ Loading states funcionan correctamente
- ✅ Error handling muestra mensajes apropiados
- ✅ Charts se actualizan con datos reales
- ✅ Stats cards muestran datos reales

---

### ✅ Mejora 1.2: Conectar RosterManager a API Real

**Problema**: Componente usa estudiantes mock, acciones no persisten.

**Solución**: Cargar enrollments reales y conectar acciones a API.

#### Pasos de Implementación

1. **Cargar datos reales**
   ```typescript
   // En RosterManager.tsx
   const loadRoster = async () => {
     // Cargar enrollments del curso
     const enrollments = await ApiService.getEnrollmentsByCourse(course.id);
     
     // Cargar datos de usuarios (students)
     const studentIds = enrollments.map(e => e.student_id);
     const students = await Promise.all(
       studentIds.map(id => ApiService.getUser(id))
     );
     
     // Combinar datos
     setStudents(combineEnrollmentAndStudentData(enrollments, students));
   };
   ```

2. **Crear endpoints para approve/reject enrollment**
   ```python
   # backend/app/api/enrollments.py (agregar)
   @enrollments_bp.put("/<enrollment_id>/approve")
   @enrollments_bp.put("/<enrollment_id>/reject")
   ```

3. **Conectar acciones**
   - `approveStudent()` → `ApiService.approveEnrollment()`
   - `rejectStudent()` → `ApiService.rejectEnrollment()`
   - `sendMessage()` → Integrar con sistema de mensajes

4. **Cargar progreso real**
   - Obtener progress de cada estudiante usando `ApiService.getCourseProgress()`

**Archivos a modificar**:
- `backend/app/api/enrollments.py` (agregar endpoints)
- `backend/app/services/enrollments_service.py` (agregar métodos)
- `src/services/api.service.ts` (agregar métodos)
- `src/components/teacher/RosterManager.tsx`

**Tiempo estimado**: 3-4 horas

**Criterios de Aceptación**:
- ✅ Muestra estudiantes reales del curso
- ✅ Approve/Reject persiste en backend
- ✅ Progreso de estudiantes es real
- ✅ Datos se refrescan después de acciones

---

### ✅ Mejora 1.3: Conectar EvaluationBuilder a API Real

**Problema**: Evaluaciones son mock, no se guardan en backend.

**Solución**: Crear endpoints de evaluations y conectar todas las operaciones CRUD.

#### Pasos de Implementación

1. **Crear endpoints de evaluations**
   ```python
   # backend/app/api/evaluations.py (nuevo)
   @evaluations_bp.get("/courses/<course_id>/evaluations")
   @evaluations_bp.post("/courses/<course_id>/evaluations")
   @evaluations_bp.get("/<evaluation_id>")
   @evaluations_bp.put("/<evaluation_id>")
   @evaluations_bp.delete("/<evaluation_id>")
   ```

2. **Crear repositorio y servicio**
   - `backend/app/repositories/evaluations_repository.py`
   - `backend/app/services/evaluations_service.py`

3. **Actualizar EvaluationBuilder**
   - Reemplazar `mockEvaluations` con llamadas API
   - Conectar `saveEvaluation()` a API
   - Agregar loading states
   - Agregar error handling

4. **Implementar validaciones**
   - Al menos 1 pregunta requerida
   - Puntos > 0
   - Passing grade entre 0-100

**Archivos a crear/modificar**:
- `backend/app/api/evaluations.py` (nuevo)
- `backend/app/repositories/evaluations_repository.py` (nuevo)
- `backend/app/services/evaluations_service.py` (nuevo)
- `src/services/api.service.ts`
- `src/components/teacher/EvaluationBuilder.tsx`

**Tiempo estimado**: 5-6 horas

**Criterios de Aceptación**:
- ✅ Evaluaciones se guardan en backend
- ✅ CRUD completo funciona
- ✅ Validaciones previenen datos inválidos
- ✅ Loading states funcionan
- ✅ Datos persisten después de refresh

---

### ✅ Mejora 1.4: Optimizar N+1 Queries en TeacherDashboard

**Problema**: `loadData()` hace múltiples llamadas API en loops.

**Solución**: Usar endpoints "getAll" y filtrar client-side.

#### Pasos de Implementación

1. **Optimizar loadData()**
   ```typescript
   // Cambiar de:
   const enrollmentsPromises = courses.map(c => 
     ApiService.getEnrollmentsByCourse(c.id)
   );
   
   // A:
   const allEnrollments = await ApiService.getAllEnrollments();
   const courseEnrollments = allEnrollments.filter(e => 
     courses.some(c => c.id === e.course_id)
   );
   ```

2. **Aplicar mismo patrón para assignments y submissions**
   ```typescript
   const allAssignments = await ApiService.getAllAssignments();
   const teacherAssignments = allAssignments.filter(a =>
     courses.some(c => c.id === a.course_id)
   );
   
   const allSubmissions = await ApiService.getAllSubmissions();
   const pendingSubmissions = allSubmissions.filter(s =>
     teacherAssignments.some(a => a.id === s.assignment_id) &&
     (s.grade === undefined || s.grade === null)
   );
   ```

3. **Agrupar por course_id client-side**
   - Usar `reduce` o `groupBy` para organizar datos

**Archivos a modificar**:
- `src/components/teacher/TeacherDashboard.tsx`

**Tiempo estimado**: 1-2 horas

**Criterios de Aceptación**:
- ✅ Solo 3 llamadas API totales (enrollments, assignments, submissions)
- ✅ Filtrado y agrupación funcionan correctamente
- ✅ Performance mejorada notablemente
- ✅ Datos se muestran correctamente

---

## 🟡 Fase 2: Mejoras de UX (Prioridad Media)

### ✅ Mejora 2.1: Agregar Debounce en Búsquedas

**Problema**: Búsquedas se ejecutan en cada keystroke.

**Solución**: Usar hook `useDebounce` ya creado.

#### Pasos de Implementación

1. **CourseEditor - Búsqueda de módulos**
   ```typescript
   import { useDebounce } from '../../hooks/useDebounce';
   
   const [searchQuery, setSearchQuery] = useState('');
   const debouncedSearchQuery = useDebounce(searchQuery, 300);
   
   // Usar debouncedSearchQuery en filter
   modules.filter(m => 
     m.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
   )
   ```

2. **RosterManager - Búsqueda de estudiantes**
   ```typescript
   const [searchTerm, setSearchTerm] = useState('');
   const debouncedSearchTerm = useDebounce(searchTerm, 300);
   
   // Usar debouncedSearchTerm en filter
   ```

**Archivos a modificar**:
- `src/components/teacher/CourseEditor.tsx`
- `src/components/teacher/RosterManager.tsx`

**Tiempo estimado**: 30 minutos

**Criterios de Aceptación**:
- ✅ Búsquedas se ejecutan 300ms después de dejar de escribir
- ✅ No hay delay perceptible
- ✅ Reduce renders innecesarios

---

### ✅ Mejora 2.2: Implementar Paginación

**Problema**: Listas pueden ser largas sin paginación.

**Solución**: Usar hook `usePagination` ya creado.

#### Componentes a Paginar

1. **CourseEditor - Lista de módulos**
2. **RosterManager - Lista de estudiantes**
3. **TeacherDashboard - Listas de assignments/submissions**

#### Pasos de Implementación

1. **Agregar hook usePagination**
   ```typescript
   import { usePagination } from '../../hooks/usePagination';
   
   const [itemsPerPage, setItemsPerPage] = useState(10);
   const {
     paginatedItems,
     currentPage,
     totalPages,
     goToPage,
     nextPage,
     prevPage,
     setItemsPerPage,
     startIndex,
     endIndex,
     totalItems,
   } = usePagination(filteredItems, { itemsPerPage });
   ```

2. **Agregar controles de paginación**
   - Usar componente `Pagination` de shadcn/ui
   - Selector de items por página
   - Información "Showing X to Y of Z"

**Archivos a modificar**:
- `src/components/teacher/CourseEditor.tsx`
- `src/components/teacher/RosterManager.tsx`
- `src/components/teacher/TeacherDashboard.tsx`

**Tiempo estimado**: 2-3 horas

**Criterios de Aceptación**:
- ✅ Tablas muestran máximo N items por página
- ✅ Controles de paginación funcionan
- ✅ Selector de items por página funciona
- ✅ Filtros resetean paginación a página 1

---

### ✅ Mejora 2.3: Agregar Skeletons durante Carga

**Problema**: Falta feedback visual durante carga.

**Solución**: Usar componente `Skeleton` de shadcn/ui.

#### Componentes a Mejorar

1. **CourseEditor** - Durante `loadModules()`
2. **RosterManager** - Durante carga de estudiantes
3. **TeacherDashboard** - Durante `loadData()`
4. **TeacherAnalytics** - Durante carga de analytics

#### Pasos de Implementación

1. **Importar Skeleton**
   ```typescript
   import { Skeleton } from '../ui/skeleton';
   ```

2. **Crear skeleton de tabla**
   ```typescript
   {loading ? (
     <div className="space-y-4">
       <Table>
         <TableHeader>...</TableHeader>
         <TableBody>
           {Array.from({ length: 5 }).map((_, i) => (
             <TableRow key={i}>
               <TableCell><Skeleton className="h-4 w-32" /></TableCell>
               ...
             </TableRow>
           ))}
         </TableBody>
       </Table>
     </div>
   ) : (
     // Contenido real
   )}
   ```

**Archivos a modificar**:
- `src/components/teacher/CourseEditor.tsx`
- `src/components/teacher/RosterManager.tsx`
- `src/components/teacher/TeacherDashboard.tsx`
- `src/components/teacher/TeacherAnalytics.tsx`

**Tiempo estimado**: 1-2 horas

**Criterios de Aceptación**:
- ✅ Skeletons se muestran durante carga inicial
- ✅ Estructura de skeleton replica la tabla real
- ✅ Animación de pulso visible

---

### ✅ Mejora 2.4: Mejorar Loading States

**Problema**: Solo hay loading inicial, no durante refresh.

**Solución**: Agregar estados de loading durante operaciones asíncronas.

#### Pasos de Implementación

1. **Agregar estados de loading**
   ```typescript
   const [isRefreshing, setIsRefreshing] = useState(false);
   const [isCreating, setIsCreating] = useState(false);
   const [isUpdating, setIsUpdating] = useState(false);
   ```

2. **Mostrar indicadores durante operaciones**
   ```typescript
   <Button disabled={isCreating}>
     {isCreating ? (
       <>
         <Loader2 className="mr-2 h-4 w-4 animate-spin" />
         Creating...
       </>
     ) : (
       <>
         <Plus className="mr-2 h-4 w-4" />
         Create
       </>
     )}
   </Button>
   ```

**Archivos a modificar**:
- Todos los componentes de teacher

**Tiempo estimado**: 1 hora

**Criterios de Aceptación**:
- ✅ Botones muestran loading durante submit
- ✅ Botones se deshabilitan durante operaciones
- ✅ Indicadores visuales claros

---

## 🟢 Fase 3: Funcionalidades Adicionales (Prioridad Baja)

### ✅ Mejora 3.1: Optimizar Drag & Drop en CourseEditor

**Problema**: Actualiza todos los módulos, no solo los afectados.

**Solución**: Solo actualizar módulos que cambiaron de posición.

#### Pasos de Implementación

1. **Identificar solo módulos afectados**
   ```typescript
   const handleDrop = async (e: React.DragEvent, targetModuleId: string) => {
     // ... lógica de reordenamiento ...
     
     // Identificar solo módulos que cambiaron
     const changedModules = updatedModules.filter((module, index) => 
       modules[index]?.order !== module.order
     );
     
     // Solo actualizar los que cambiaron
     await Promise.all(
       changedModules.map(module => 
         ApiService.updateModule(module.id, { order: module.order })
       )
     );
   };
   ```

2. **Opcional: Batch update endpoint**
   - Crear endpoint `PUT /api/modules/batch-update` para actualizar múltiples módulos en una sola llamada

**Archivos a modificar**:
- `src/components/teacher/CourseEditor.tsx`
- Opcional: `backend/app/api/modules.py`

**Tiempo estimado**: 1-2 horas

**Criterios de Aceptación**:
- ✅ Solo actualiza módulos que cambiaron
- ✅ Menos llamadas API durante drag & drop
- ✅ Performance mejorada

---

### ✅ Mejora 3.2: Implementar Undo para Acciones Destructivas

**Problema**: No hay forma de deshacer eliminaciones.

**Solución**: Toast con acción de undo usando Sonner.

#### Acciones a Mejorar

1. **CourseEditor** - Eliminar módulo
2. **EvaluationBuilder** - Eliminar pregunta
3. **RosterManager** - Rechazar estudiante

#### Pasos de Implementación

1. **Ejemplo para eliminar módulo**
   ```typescript
   const handleDeleteModule = async () => {
     const moduleToDelete = { ...selectedModule };
     
     try {
       await ApiService.deleteModule(selectedModule.id);
       
       toast.success('Module deleted successfully', {
         action: {
           label: 'Undo',
           onClick: async () => {
             try {
               // Recrear módulo
               await ApiService.createModule(course.id, moduleToDelete);
               toast.success('Module restored');
               loadModules();
             } catch (error) {
               toast.error('Failed to restore module');
             }
           }
         },
         duration: 5000,
       });
       
       loadModules();
     } catch (error) {
       toast.error('Failed to delete module');
     }
   };
   ```

**Archivos a modificar**:
- `src/components/teacher/CourseEditor.tsx`
- `src/components/teacher/EvaluationBuilder.tsx`
- `src/components/teacher/RosterManager.tsx`

**Tiempo estimado**: 1-2 horas

**Criterios de Aceptación**:
- ✅ Toast muestra botón "Undo"
- ✅ Undo restaura el elemento eliminado
- ✅ Duración de 5 segundos

---

### ✅ Mejora 3.3: Implementar Preview en EvaluationBuilder

**Problema**: Botón preview presente pero no funcional.

**Solución**: Crear componente de preview que muestre la evaluación como la vería un estudiante.

#### Pasos de Implementación

1. **Crear componente EvaluationPreview**
   ```typescript
   // src/components/teacher/EvaluationPreview.tsx
   export function EvaluationPreview({ evaluation }: { evaluation: Evaluation }) {
     // Mostrar evaluación como la vería un estudiante
     // Sin opciones de edición
   }
   ```

2. **Agregar estado y modal**
   ```typescript
   const [showPreview, setShowPreview] = useState(false);
   
   <Button onClick={() => setShowPreview(true)}>
     <Eye className="mr-2 h-4 w-4" />
     Preview
   </Button>
   
   <Dialog open={showPreview} onOpenChange={setShowPreview}>
     <DialogContent className="max-w-4xl">
       <EvaluationPreview evaluation={selectedEvaluation} />
     </DialogContent>
   </Dialog>
   ```

**Archivos a crear/modificar**:
- `src/components/teacher/EvaluationPreview.tsx` (nuevo)
- `src/components/teacher/EvaluationBuilder.tsx`

**Tiempo estimado**: 2-3 horas

**Criterios de Aceptación**:
- ✅ Preview muestra evaluación completa
- ✅ Vista similar a la que vería estudiante
- ✅ Muestra todas las preguntas
- ✅ Muestra configuraciones (time limit, attempts, etc.)

---

### ✅ Mejora 3.4: Implementar Drag & Drop de Preguntas

**Problema**: UI muestra `GripVertical` pero drag & drop no funciona.

**Solución**: Implementar HTML5 Drag & Drop API similar a CourseEditor.

#### Pasos de Implementación

1. **Agregar handlers de drag & drop**
   ```typescript
   const [draggedQuestion, setDraggedQuestion] = useState<string | null>(null);
   
   const handleDragStart = (e: React.DragEvent, questionId: string) => {
     setDraggedQuestion(questionId);
   };
   
   const handleDrop = (e: React.DragEvent, targetQuestionId: string) => {
     // Reordenar preguntas
     // Actualizar order en backend
   };
   ```

2. **Agregar atributos draggable**
   ```typescript
   <div
     draggable
     onDragStart={(e) => handleDragStart(e, question.id)}
     onDragOver={handleDragOver}
     onDrop={(e) => handleDrop(e, question.id)}
   >
     ...
   </div>
   ```

**Archivos a modificar**:
- `src/components/teacher/EvaluationBuilder.tsx`

**Tiempo estimado**: 1-2 horas

**Criterios de Aceptación**:
- ✅ Preguntas se pueden reordenar arrastrando
- ✅ Order se persiste en backend
- ✅ Feedback visual durante drag

---

### ✅ Mejora 3.5: Agregar Validaciones en EvaluationBuilder

**Problema**: Puede guardar evaluaciones sin preguntas o datos inválidos.

**Solución**: Agregar validaciones antes de guardar.

#### Validaciones a Implementar

1. **Evaluación debe tener al menos 1 pregunta**
2. **Todas las preguntas deben tener texto**
3. **Puntos > 0**
4. **Passing grade entre 0-100**
5. **MCQ debe tener al menos 2 opciones**
6. **MCQ debe tener respuesta correcta marcada**

#### Pasos de Implementación

1. **Función de validación**
   ```typescript
   const validateEvaluation = (evaluation: Evaluation): string[] => {
     const errors: string[] = [];
     
     if (evaluation.questions.length === 0) {
       errors.push('Evaluation must have at least one question');
     }
     
     evaluation.questions.forEach((q, index) => {
       if (!q.question.trim()) {
         errors.push(`Question ${index + 1} must have text`);
       }
       if (q.points <= 0) {
         errors.push(`Question ${index + 1} must have points > 0`);
       }
       if (q.type === 'multiple-choice') {
         if (!q.options || q.options.length < 2) {
           errors.push(`Question ${index + 1} must have at least 2 options`);
         }
         if (!q.correctAnswer) {
           errors.push(`Question ${index + 1} must have a correct answer`);
         }
       }
     });
     
     if (evaluation.passingGrade < 0 || evaluation.passingGrade > 100) {
       errors.push('Passing grade must be between 0 and 100');
     }
     
     return errors;
   };
   ```

2. **Usar en saveEvaluation**
   ```typescript
   const saveEvaluation = () => {
     const errors = validateEvaluation(selectedEvaluation);
     if (errors.length > 0) {
       toast.error(errors.join(', '));
       return;
     }
     // ... guardar ...
   };
   ```

**Archivos a modificar**:
- `src/components/teacher/EvaluationBuilder.tsx`

**Tiempo estimado**: 1 hora

**Criterios de Aceptación**:
- ✅ Validaciones previenen guardar datos inválidos
- ✅ Mensajes de error claros
- ✅ Validación en tiempo real opcional

---

### ✅ Mejora 3.6: Mejoras de Accesibilidad

**Problema**: Faltan ARIA labels y mejoras de navegación por teclado.

**Solución**: Agregar ARIA labels y mejorar keyboard navigation.

#### Pasos de Implementación

1. **Agregar ARIA labels a botones sin texto**
   ```typescript
   <Button aria-label="Edit module">
     <Edit className="h-4 w-4" />
   </Button>
   ```

2. **Mejorar navegación por teclado**
   - Asegurar que todos los elementos interactivos sean focusables
   - Agregar focus indicators
   - Soporte de Enter/Space para acciones

**Archivos a modificar**:
- Todos los componentes de teacher

**Tiempo estimado**: 2-3 horas

**Criterios de Aceptación**:
- ✅ ARIA labels en todos los botones iconos
- ✅ Navegación por teclado funciona
- ✅ Focus indicators visibles

---

### ✅ Mejora 3.7: Hacer Modales Más Anchos

**Problema**: Algunos modales son estrechos para el contenido.

**Solución**: Aumentar ancho de modales similares a admin.

#### Modales a Mejorar

1. **CourseEditor** - Dialog de agregar/editar módulo
2. **EvaluationBuilder** - Dialogs de evaluación y preguntas
3. **RosterManager** - Si hay modales

#### Pasos de Implementación

1. **Cambiar className de DialogContent**
   ```typescript
   // De:
   <DialogContent className="max-w-2xl">
   
   // A:
   <DialogContent className="max-w-4xl w-[90vw]">
   ```

**Archivos a modificar**:
- `src/components/teacher/CourseEditor.tsx`
- `src/components/teacher/EvaluationBuilder.tsx`

**Tiempo estimado**: 15 minutos

**Criterios de Aceptación**:
- ✅ Modales más anchos para mejor legibilidad
- ✅ Responsive en móviles

---

## 📅 Cronograma Sugerido

### Sprint 1 (2-3 días) - Crítico
- ✅ Mejora 1.4: Optimizar N+1 Queries (rápida, alto impacto)
- ✅ Mejora 1.1: Conectar TeacherAnalytics
- ✅ Mejora 1.2: Conectar RosterManager

### Sprint 2 (2-3 días) - Crítico
- ✅ Mejora 1.3: Conectar EvaluationBuilder
- ✅ Mejora 2.1: Agregar Debounce
- ✅ Mejora 2.3: Agregar Skeletons

### Sprint 3 (1-2 días) - Importante
- ✅ Mejora 2.2: Implementar Paginación
- ✅ Mejora 2.4: Mejorar Loading States

### Sprint 4 (Opcional - 2-3 días)
- ✅ Mejora 3.1: Optimizar Drag & Drop
- ✅ Mejora 3.2: Implementar Undo
- ✅ Mejora 3.3: Preview de Evaluaciones

### Sprint 5 (Opcional - 1-2 días)
- ✅ Mejora 3.4: Drag & Drop de Preguntas
- ✅ Mejora 3.5: Validaciones
- ✅ Mejora 3.6: Accesibilidad
- ✅ Mejora 3.7: Modales más anchos

---

## ✅ Checklist de Implementación

### Fase 1 (Prioridad Crítica)
- [ ] Mejora 1.1: Conectar TeacherAnalytics a API Real
- [ ] Mejora 1.2: Conectar RosterManager a API Real
- [ ] Mejora 1.3: Conectar EvaluationBuilder a API Real
- [ ] Mejora 1.4: Optimizar N+1 Queries en TeacherDashboard

### Fase 2 (Prioridad Media)
- [ ] Mejora 2.1: Agregar Debounce en Búsquedas
- [ ] Mejora 2.2: Implementar Paginación
- [ ] Mejora 2.3: Agregar Skeletons durante Carga
- [ ] Mejora 2.4: Mejorar Loading States

### Fase 3 (Prioridad Baja)
- [ ] Mejora 3.1: Optimizar Drag & Drop en CourseEditor
- [ ] Mejora 3.2: Implementar Undo para Acciones Destructivas
- [ ] Mejora 3.3: Implementar Preview en EvaluationBuilder
- [ ] Mejora 3.4: Implementar Drag & Drop de Preguntas
- [ ] Mejora 3.5: Agregar Validaciones en EvaluationBuilder
- [ ] Mejora 3.6: Mejoras de Accesibilidad
- [ ] Mejora 3.7: Hacer Modales Más Anchos

---

## 🧪 Estrategia de Testing

### Unit Tests
- Hooks personalizados (si se crean nuevos)
- Funciones de validación
- Funciones de transformación de datos

### Integration Tests
- Flujos completos de crear/editar/eliminar
- Verificar que datos se persisten correctamente
- Verificar optimizaciones de API

### Manual Testing
- Probar cada mejora individualmente
- Verificar que no hay regresiones
- Probar edge cases (0 items, muchos items, etc.)
- Verificar que datos mock fueron reemplazados

---

## 📝 Notas Técnicas

### Dependencias
- Backend debe tener endpoints para analytics y evaluations
- Frontend ya tiene hooks `useDebounce` y `usePagination` creados
- Componentes UI de shadcn/ui disponibles

### Consideraciones
- Mantener retrocompatibilidad durante migración de mock a real
- No romper funcionalidad existente
- Documentar cambios importantes
- Commit atómico por mejora

### Riesgos
- Migración de datos mock puede introducir bugs
- Endpoints nuevos requieren testing exhaustivo
- Cambios en múltiples componentes pueden introducir regresiones

---

## 🚀 Orden Recomendado de Implementación

1. **Primero**: Mejora 1.4 (Optimizar N+1) - Rápida y de alto impacto
2. **Segundo**: Mejora 1.2 (RosterManager) - Relativamente simple, conecta a endpoints existentes
3. **Tercero**: Mejora 1.1 (TeacherAnalytics) - Requiere nuevos endpoints pero importante
4. **Cuarto**: Mejora 1.3 (EvaluationBuilder) - Más compleja, requiere múltiples endpoints
5. **Quinto**: Fase 2 (Debounce, Paginación, Skeletons) - Mejoras de UX
6. **Opcional**: Fase 3 - Funcionalidades adicionales según necesidad

---

*Plan creado: $(date)*  
*Última actualización: Plan completo de mejoras Teacher*  
*Autor: Análisis de UI/UX Teacher*

