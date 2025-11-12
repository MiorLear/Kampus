# Documentación de la API - Kampus Backend

## 📡 Base URL

```
http://localhost:8000
```

---

## 🔌 Endpoints Disponibles

### Índice de API

**`GET /`**
- Retorna un índice JSON con todos los endpoints disponibles
- **Response:** `200 OK`
- **Body:**
```json
{
  "message": "Kampus API",
  "endpoints": {
    "users": [...],
    "courses": [...],
    "modules": [...],
    "enrollments": [...],
    "progress": [...],
    "assignments": [...]
  }
}
```

### Health Check

**`GET /health`**
- Verifica que el servidor esté corriendo
- **Response:** `200 OK`
- **Body:**
```json
{
  "status": "ok",
  "message": "API is running"
}
```

---

## 👥 Users Endpoints

### Listar Usuarios

**`GET /users`**
- Lista todos los usuarios
- **Query Parameters:**
  - `role` (opcional): Filtrar por rol (`student`, `teacher`, `admin`)
- **Response:** `200 OK`
- **Body:**
```json
[
  {
    "id": "user_id",
    "email": "user@example.com",
    "name": "User Name",
    "role": "student",
    "photo_url": "https://...",
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

**Ejemplo:**
```bash
curl http://localhost:8000/users
curl "http://localhost:8000/users?role=student"
```

### Obtener Usuario

**`GET /users/<user_id>`**
- Obtiene un usuario específico
- **Path Parameters:**
  - `user_id`: ID del usuario
- **Response:** `200 OK` o `404 Not Found`
- **Body:**
```json
{
  "id": "user_id",
  "email": "user@example.com",
  "name": "User Name",
  "role": "student",
  "photo_url": "https://...",
  "created_at": "2024-01-01T00:00:00Z"
}
```

**Ejemplo:**
```bash
curl http://localhost:8000/users/user_id
```

### Actualizar Usuario

**`PUT /users/<user_id>`**
- Actualiza un usuario
- **Path Parameters:**
  - `user_id`: ID del usuario
- **Request Body:**
```json
{
  "name": "New Name",
  "email": "newemail@example.com",
  "role": "teacher"
}
```
- **Response:** `200 OK` o `404 Not Found`
- **Body:**
```json
{
  "message": "User updated successfully",
  "id": "user_id"
}
```

**Ejemplo:**
```bash
curl -X PUT http://localhost:8000/users/user_id \
  -H "Content-Type: application/json" \
  -d '{"name": "New Name"}'
```

### Eliminar Usuario

**`DELETE /users/<user_id>`**
- Elimina un usuario
- **Path Parameters:**
  - `user_id`: ID del usuario
- **Response:** `200 OK` o `404 Not Found`
- **Body:**
```json
{
  "message": "User deleted successfully",
  "id": "user_id"
}
```

**Ejemplo:**
```bash
curl -X DELETE http://localhost:8000/users/user_id
```

### Estadísticas de Usuarios

**`GET /users/stats`**
- Obtiene estadísticas de usuarios
- **Response:** `200 OK`
- **Body:**
```json
{
  "total": 100,
  "students": 70,
  "teachers": 20,
  "admins": 10
}
```

**Ejemplo:**
```bash
curl http://localhost:8000/users/stats
```

---

## 📚 Courses Endpoints

### Listar Cursos

**`GET /courses`**
- Lista todos los cursos
- **Query Parameters:**
  - `teacher_id` (opcional): Filtrar por profesor
- **Response:** `200 OK`
- **Body:**
```json
[
  {
    "id": "course_id",
    "title": "Course Title",
    "description": "Course Description",
    "teacher_id": "teacher_id",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
]
```

**Ejemplo:**
```bash
curl http://localhost:8000/courses
curl "http://localhost:8000/courses?teacher_id=teacher_id"
```

### Obtener Curso

**`GET /courses/<course_id>`**
- Obtiene un curso específico
- **Path Parameters:**
  - `course_id`: ID del curso
- **Response:** `200 OK` o `404 Not Found`
- **Body:**
```json
{
  "id": "course_id",
  "title": "Course Title",
  "description": "Course Description",
  "teacher_id": "teacher_id",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

**Ejemplo:**
```bash
curl http://localhost:8000/courses/course_id
```

---

## 📖 Modules Endpoints

### Listar Módulos de un Curso

**`GET /modules/courses/<course_id>/modules`**
- Lista todos los módulos de un curso
- **Path Parameters:**
  - `course_id`: ID del curso
- **Response:** `200 OK`
- **Body:**
```json
[
  {
    "id": "module_id",
    "course_id": "course_id",
    "title": "Module Title",
    "type": "text",
    "content": "Module Content",
    "order": 1,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
]
```

**Ejemplo:**
```bash
curl http://localhost:8000/modules/courses/course_id/modules
```

---

## 📝 Enrollments Endpoints

### Listar Inscripciones

**`GET /enrollments`**
- Lista inscripciones
- **Query Parameters:**
  - `student_id` (opcional): Filtrar por estudiante
  - `course_id` (opcional): Filtrar por curso
  - Si no se proporcionan parámetros, retorna array vacío
- **Response:** `200 OK`
- **Body:**
```json
[
  {
    "id": "enrollment_id",
    "student_id": "student_id",
    "course_id": "course_id",
    "enrolled_at": "2024-01-01T00:00:00Z",
    "progress": 75
  }
]
```

**Ejemplo:**
```bash
curl "http://localhost:8000/enrollments?student_id=student_id"
curl "http://localhost:8000/enrollments?course_id=course_id"
```

### Crear Inscripción

**`POST /enrollments`**
- Crea una nueva inscripción
- **Request Body:**
```json
{
  "student_id": "student_id",
  "course_id": "course_id",
  "progress": 0
}
```
- **Response:** `201 Created` o `400 Bad Request`
- **Body:**
```json
{
  "id": "enrollment_id"
}
```

**Ejemplo:**
```bash
curl -X POST http://localhost:8000/enrollments \
  -H "Content-Type: application/json" \
  -d '{"student_id": "student_id", "course_id": "course_id", "progress": 0}'
```

---

## 📊 Progress Endpoints

### Guardar Acceso a Módulo

**`POST /progress/access`**
- Guarda el acceso de un usuario a un módulo
- **Request Body:**
```json
{
  "user_id": "user_id",
  "course_id": "course_id",
  "module_id": "module_id",
  "progress_percentage": 0
}
```
O en camelCase:
```json
{
  "userId": "user_id",
  "courseId": "course_id",
  "moduleId": "module_id",
  "progressPercentage": 0
}
```
- **Response:** `200 OK` o `400 Bad Request`
- **Body:**
```json
{
  "message": "Module access saved"
}
```

**Ejemplo:**
```bash
curl -X POST http://localhost:8000/progress/access \
  -H "Content-Type: application/json" \
  -d '{"userId": "user_id", "courseId": "course_id", "moduleId": "module_id"}'
```

### Guardar Progreso Parcial

**`POST /progress`**
- Guarda el progreso parcial de un usuario en un módulo
- **Request Body:**
```json
{
  "user_id": "user_id",
  "course_id": "course_id",
  "module_id": "module_id",
  "progress_data": {
    "video_time_watched": 120,
    "video_duration": 600,
    "time_spent": 300
  }
}
```
O en camelCase:
```json
{
  "userId": "user_id",
  "courseId": "course_id",
  "moduleId": "module_id",
  "progressData": {
    "videoTimeWatched": 120,
    "videoDuration": 600,
    "timeSpent": 300
  }
}
```
- **Response:** `200 OK` o `400 Bad Request`
- **Body:**
```json
{
  "message": "Module progress saved"
}
```

**Ejemplo:**
```bash
curl -X POST http://localhost:8000/progress \
  -H "Content-Type: application/json" \
  -d '{"userId": "user_id", "courseId": "course_id", "moduleId": "module_id", "progressData": {}}'
```

### Marcar Módulo como Completado

**`POST /progress/complete`**
- Marca un módulo como completado
- **Request Body:**
```json
{
  "user_id": "user_id",
  "course_id": "course_id",
  "module_id": "module_id"
}
```
O en camelCase:
```json
{
  "userId": "user_id",
  "courseId": "course_id",
  "moduleId": "module_id"
}
```
- **Response:** `200 OK` o `400 Bad Request`
- **Body:**
```json
{
  "message": "Module marked complete"
}
```

**Ejemplo:**
```bash
curl -X POST http://localhost:8000/progress/complete \
  -H "Content-Type: application/json" \
  -d '{"userId": "user_id", "courseId": "course_id", "moduleId": "module_id"}'
```

### Obtener Progreso de Módulo

**`GET /progress/module/<course_id>/<module_id>?userId=<user_id>`**
- Obtiene el progreso de un usuario en un módulo específico
- **Path Parameters:**
  - `course_id`: ID del curso
  - `module_id`: ID del módulo
- **Query Parameters:**
  - `userId` (requerido): ID del usuario
- **Response:** `200 OK` o `404 Not Found`
- **Body:**
```json
{
  "id": "progress_id",
  "user_id": "user_id",
  "course_id": "course_id",
  "module_id": "module_id",
  "completed": true,
  "progress_percentage": 100,
  "time_spent": 300,
  "times_accessed": 5,
  "last_accessed": "2024-01-01T00:00:00Z"
}
```

**Ejemplo:**
```bash
curl "http://localhost:8000/progress/module/course_id/module_id?userId=user_id"
```

### Obtener Progreso por Módulo del Curso

**`GET /progress/course/<course_id>?userId=<user_id>`**
- Obtiene el progreso de un usuario en todos los módulos de un curso
- **Path Parameters:**
  - `course_id`: ID del curso
- **Query Parameters:**
  - `userId` (requerido): ID del usuario
- **Response:** `200 OK`
- **Body:**
```json
[
  {
    "id": "progress_id",
    "user_id": "user_id",
    "course_id": "course_id",
    "module_id": "module_id",
    "completed": true,
    "progress_percentage": 100,
    "time_spent": 300,
    "times_accessed": 5,
    "last_accessed": "2024-01-01T00:00:00Z"
  }
]
```

**Ejemplo:**
```bash
curl "http://localhost:8000/progress/course/course_id?userId=user_id"
```

### Obtener Resumen del Curso

**`GET /progress/course/<course_id>/summary?userId=<user_id>`**
- Obtiene un resumen del progreso de un usuario en un curso
- **Path Parameters:**
  - `course_id`: ID del curso
- **Query Parameters:**
  - `userId` (requerido): ID del usuario
- **Response:** `200 OK`
- **Body:**
```json
{
  "user_id": "user_id",
  "course_id": "course_id",
  "total_modules": 10,
  "completed_modules": 7,
  "progress_percentage": 70
}
```

**Ejemplo:**
```bash
curl "http://localhost:8000/progress/course/course_id/summary?userId=user_id"
```

---

## 📋 Assignments Endpoints

### Listar Assignments

**`GET /assignments`**
- Lista todos los assignments
- **Query Parameters:**
  - `course_id` (opcional): Filtrar por curso
- **Response:** `200 OK`
- **Body:**
```json
[
  {
    "id": "assignment_id",
    "course_id": "course_id",
    "title": "Assignment Title",
    "description": "Assignment Description",
    "due_date": "2024-01-01T00:00:00Z",
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

**Ejemplo:**
```bash
curl http://localhost:8000/assignments
curl "http://localhost:8000/assignments?course_id=course_id"
```

### Obtener Assignment

**`GET /assignments/<assignment_id>`**
- Obtiene un assignment específico
- **Path Parameters:**
  - `assignment_id`: ID del assignment
- **Response:** `200 OK` o `404 Not Found`
- **Body:**
```json
{
  "id": "assignment_id",
  "course_id": "course_id",
  "title": "Assignment Title",
  "description": "Assignment Description",
  "due_date": "2024-01-01T00:00:00Z",
  "created_at": "2024-01-01T00:00:00Z"
}
```

**Ejemplo:**
```bash
curl http://localhost:8000/assignments/assignment_id
```

### Crear Assignment

**`POST /assignments`**
- Crea un nuevo assignment
- **Request Body:**
```json
{
  "course_id": "course_id",
  "title": "Assignment Title",
  "description": "Assignment Description",
  "due_date": "2024-01-01T00:00:00Z"
}
```
- **Response:** `201 Created` o `400 Bad Request`
- **Body:**
```json
{
  "message": "Assignment created successfully",
  "id": "assignment_id"
}
```

**Ejemplo:**
```bash
curl -X POST http://localhost:8000/assignments \
  -H "Content-Type: application/json" \
  -d '{"course_id": "course_id", "title": "Assignment Title", "description": "Assignment Description"}'
```

### Actualizar Assignment

**`PUT /assignments/<assignment_id>`**
- Actualiza un assignment
- **Path Parameters:**
  - `assignment_id`: ID del assignment
- **Request Body:**
```json
{
  "title": "Updated Title",
  "description": "Updated Description",
  "due_date": "2024-01-01T00:00:00Z"
}
```
- **Response:** `200 OK` o `404 Not Found`
- **Body:**
```json
{
  "message": "Assignment updated successfully",
  "id": "assignment_id"
}
```

**Ejemplo:**
```bash
curl -X PUT http://localhost:8000/assignments/assignment_id \
  -H "Content-Type: application/json" \
  -d '{"title": "Updated Title"}'
```

### Eliminar Assignment

**`DELETE /assignments/<assignment_id>`**
- Elimina un assignment
- **Path Parameters:**
  - `assignment_id`: ID del assignment
- **Response:** `200 OK` o `404 Not Found`
- **Body:**
```json
{
  "message": "Assignment deleted successfully",
  "id": "assignment_id"
}
```

**Ejemplo:**
```bash
curl -X DELETE http://localhost:8000/assignments/assignment_id
```

---

## 🔐 Autenticación

### Headers Requeridos

**Nota:** Actualmente el backend no valida tokens de Firebase. Esto se implementará en la siguiente fase.

**Planeado:**
- Header `Authorization: Bearer <token>` será requerido para rutas protegidas
- El token será validado usando `firebase_admin.auth.verify_id_token`
- El `user_id` será extraído del token

---

## 🚨 Códigos de Error

### Errores HTTP

| Código | Descripción |
|--------|-------------|
| `200 OK` | Request exitoso |
| `201 Created` | Recurso creado exitosamente |
| `400 Bad Request` | Request inválido (faltan parámetros, datos inválidos) |
| `404 Not Found` | Recurso no encontrado |
| `500 Internal Server Error` | Error del servidor |

### Estructura de Error

```json
{
  "error": "Error message",
  "details": "Additional error details (opcional)"
}
```

### Ejemplos de Errores

**400 Bad Request:**
```json
{
  "error": "Missing required field: course_id"
}
```

**404 Not Found:**
```json
{
  "error": "User not found"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Failed to fetch users",
  "details": "Error details"
}
```

---

## 🔄 CORS

### Configuración

El backend está configurado para permitir requests desde cualquier origen en desarrollo:

- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH`
- `Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With`
- `Access-Control-Max-Age: 3600`

### Preflight Requests

El backend maneja automáticamente las requests OPTIONS (preflight) para CORS.

---

## 📝 Notas

### Formato de Fechas

Todas las fechas están en formato ISO 8601:
```
2024-01-01T00:00:00Z
```

### Formato de IDs

Todos los IDs son strings de Firestore.

### Parámetros Opcionales vs Requeridos

- **Query Parameters:** Opcionales a menos que se indique lo contrario
- **Path Parameters:** Siempre requeridos
- **Request Body:** Depende del endpoint (ver documentación específica)

### Compatibilidad de Naming

Algunos endpoints aceptan tanto `snake_case` como `camelCase`:
- `user_id` / `userId`
- `course_id` / `courseId`
- `module_id` / `moduleId`
- `progress_percentage` / `progressPercentage`
- `progress_data` / `progressData`

---

## 🧪 Ejemplos de Uso

### Obtener Todos los Usuarios

```bash
curl http://localhost:8000/users
```

### Obtener Usuarios por Rol

```bash
curl "http://localhost:8000/users?role=student"
```

### Crear Assignment

```bash
curl -X POST http://localhost:8000/assignments \
  -H "Content-Type: application/json" \
  -d '{
    "course_id": "course_id",
    "title": "Assignment Title",
    "description": "Assignment Description"
  }'
```

### Obtener Progreso de Curso

```bash
curl "http://localhost:8000/progress/course/course_id?userId=user_id"
```

---

## 📚 Recursos Adicionales

- [BACKEND_ARCHITECTURE.md](./BACKEND_ARCHITECTURE.md) - Arquitectura del backend
- [BACKEND_SETUP.md](./BACKEND_SETUP.md) - Guía de configuración
- [backend/README.md](./backend/README.md) - README del backend

