# Sistema de Progreso de Estudiantes

## 📊 Funcionalidades Implementadas

### 1. Guardado Automático de Acceso

**Cuándo se guarda:**
- Automáticamente cuando un estudiante accede a un módulo
- Al cambiar de módulo
- Al cargar el curso

**Qué se guarda:**
- `last_accessed_at`: Última vez que accedió al módulo
- `times_accessed`: Número de veces que ha accedido al módulo
- `progress_percentage`: Porcentaje de progreso (inicialmente 0%)

**Método:** `FirestoreService.saveModuleAccess()`

---

### 2. Progreso Parcial (Videos)

**Para videos locales (MP4, WebM, etc.):**
- Tracking completo del tiempo de visualización
- Se guarda cada ~10 segundos
- Calcula porcentaje automáticamente basado en tiempo visto vs duración total

**Para videos externos (YouTube, Vimeo):**
- Tracking básico (marca como iniciado cuando se carga)
- No es posible trackear tiempo exacto por limitaciones de las APIs

**Qué se guarda:**
- `video_time_watched`: Tiempo visto en segundos
- `video_duration`: Duración total del video
- `progress_percentage`: Porcentaje calculado automáticamente

**Método:** `FirestoreService.saveModuleProgress()`

---

### 3. Tiempo de Visualización

**Cuándo se guarda:**
- Al cambiar de módulo
- Al cerrar el curso
- Calculado automáticamente desde el momento que accede

**Qué se guarda:**
- `time_spent`: Tiempo total en segundos que pasó viendo el módulo

---

### 4. Marcado Manual como Completado

**Cuándo se usa:**
- El estudiante hace click en "Mark Complete"
- Al avanzar al siguiente módulo (opcional)

**Qué se guarda:**
- `completed: true`
- `completed_at`: Fecha y hora de completado
- `progress_percentage: 100`

**Método:** `FirestoreService.markModuleComplete()`

---

## 🗄️ Estructura de Datos

### Collection: `user_progress`

```typescript
{
  id: string;
  user_id: string;
  course_id: string;
  module_id: string;
  completed: boolean;              // Si está completado
  completed_at?: string;           // Fecha de completado
  progress_percentage: number;     // 0-100
  last_accessed_at: string;        // Último acceso
  time_spent?: number;             // Tiempo total en segundos
  video_time_watched?: number;     // Para videos: tiempo visto
  video_duration?: number;         // Para videos: duración total
  times_accessed?: number;         // Número de accesos
}
```

### Collection: `course_progress`

```typescript
{
  id: string;
  user_id: string;
  course_id: string;
  total_modules: number;
  completed_modules: number;
  progress_percentage: number;      // 0-100
  last_accessed_at: string;
  updated_at: string;
}
```

---

## 🎯 Flujo de Guardado

### Al Acceder a un Módulo

```
Estudiante selecciona módulo
    ↓
useEffect detecta cambio
    ↓
FirestoreService.saveModuleAccess()
    ↓
Crea o actualiza user_progress
    ↓
Actualiza course_progress
```

### Durante Visualización de Video

```
Video se reproduce
    ↓
Cada ~10 segundos: onProgress
    ↓
FirestoreService.saveModuleProgress()
    ↓
Actualiza progress_percentage
    ↓
UI se actualiza en tiempo real
```

### Al Cambiar de Módulo

```
Estudiante cambia de módulo
    ↓
useEffect cleanup guarda time_spent del módulo anterior
    ↓
Nuevo useEffect guarda acceso al nuevo módulo
```

---

## 📱 Indicadores Visuales

### En la Lista de Módulos

- ✅ **CheckCircle verde**: Módulo completado
- ⭕ **Circle gris**: Módulo no iniciado
- 📊 **Barra de progreso**: Si tiene progreso parcial (no completado)
- 🔢 **"X% visto"**: Porcentaje de progreso
- 📈 **"Visitado X veces"**: Si ha accedido más de una vez

### En el Módulo Actual (Videos)

- 📊 **Barra de progreso**: Si tiene progreso parcial

---

## 🔧 Métodos Disponibles

### `FirestoreService.saveModuleAccess()`
Guarda acceso básico a un módulo.

```typescript
await FirestoreService.saveModuleAccess(
  userId: string,
  courseId: string,
  moduleId: string,
  progressPercentage?: number
);
```

### `FirestoreService.saveModuleProgress()`
Guarda progreso detallado (para videos, tiempo, etc.).

```typescript
await FirestoreService.saveModuleProgress(
  userId: string,
  courseId: string,
  moduleId: string,
  {
    progress_percentage?: number;
    video_time_watched?: number;
    video_duration?: number;
    time_spent?: number;
  }
);
```

### `FirestoreService.markModuleComplete()`
Marca un módulo como completamente terminado.

```typescript
await FirestoreService.markModuleComplete(
  userId: string,
  courseId: string,
  moduleId: string
);
```

---

## 🚀 Próximas Mejoras

1. **Tracking de videos de YouTube/Vimeo avanzado**
   - Usar YouTube/Vimeo APIs para tracking preciso

2. **Progreso para PDFs**
   - Tracking de páginas vistas
   - Scroll position

3. **Notificaciones**
   - Recordatorios de módulos no completados
   - Felicitaciones al completar cursos

4. **Estadísticas avanzadas**
   - Tiempo promedio por módulo
   - Tiempo total de estudio
   - Módulos más visitados

5. **Reanudación automática**
   - Recordar último módulo visto
   - Continuar desde donde se quedó

---

## 💡 Uso desde Componentes

```typescript
// En cualquier componente de estudiante
import { FirestoreService } from '../services/firestore.service';

// Guardar acceso automático
await FirestoreService.saveModuleAccess(userId, courseId, moduleId);

// Guardar progreso de video
await FirestoreService.saveModuleProgress(userId, courseId, moduleId, {
  video_time_watched: 120,  // 2 minutos
  video_duration: 600,      // 10 minutos total
});

// Marcar como completo
await FirestoreService.markModuleComplete(userId, courseId, moduleId);
```

---

## ⚠️ Notas Importantes

1. **Errores silenciosos**: El guardado de progreso no interrumpe la experiencia si falla
2. **Optimización**: El guardado se hace de forma asíncrona y no bloquea la UI
3. **Actualización automática**: El progreso del curso se actualiza automáticamente
4. **Persistencia**: Todo se guarda en Firestore, se mantiene entre sesiones


