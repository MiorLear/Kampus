# 🚀 Guía de Migración Completa a Backend

## ✅ Lo que Ya Está Migrado

### Backend Implementado
- ✅ Repositorio de Módulos (`ModulesRepository`)
- ✅ Repositorio de Progreso (`UserProgressRepository`, `CourseProgressRepository`)
- ✅ Servicios: Modules y Progress
- ✅ Controladores: Modules y Progress
- ✅ Rutas API: `/api/modules` y `/api/progress`

### Frontend Migrado
- ✅ `CourseViewer` - Ahora usa `ApiService`
- ✅ `StudentDashboard` - Usa `ApiService` para módulos y progreso
- ✅ `ApiService` - Métodos completos para módulos y progreso

---

## 📡 Endpoints Disponibles

### Módulos

```
GET  /api/modules/courses/:courseId/modules  - Obtener módulos de un curso
GET  /api/modules/:id                       - Obtener un módulo
POST /api/modules/courses/:courseId/modules - Crear módulo
PUT  /api/modules/:id                       - Actualizar módulo
DELETE /api/modules/:id                     - Eliminar módulo
```

### Progreso

```
POST /api/progress/access                   - Guardar acceso a módulo
POST /api/progress                          - Guardar progreso parcial
POST /api/progress/complete                 - Marcar módulo completo
GET  /api/progress/module/:courseId/:moduleId - Obtener progreso de módulo
GET  /api/progress/course/:courseId         - Obtener progreso de todos los módulos
GET  /api/progress/course/:courseId/summary - Obtener resumen del curso
```

**Nota:** El `userId` viene automáticamente del token de autenticación, no se envía en los requests.

---

## 🔧 Configuración Necesaria

### 1. Índices de Firestore

Para que las queries funcionen correctamente, necesitas crear estos índices en Firestore:

**Índice para course_modules:**
```
Collection: course_modules
Fields:
  - course_id (Ascending)
  - order (Ascending)
```

**Índice para user_progress:**
```
Collection: user_progress
Fields:
  - user_id (Ascending)
  - course_id (Ascending)
  - module_id (Ascending)
```

**Índice para course_progress:**
```
Collection: course_progress
Fields:
  - user_id (Ascending)
  - course_id (Ascending)
```

**Cómo crear índices:**
1. Ve a Firebase Console → Firestore Database → Indexes
2. Click en "Create Index"
3. O usa el archivo `firestore.indexes.json` (ya existe en el proyecto)

---

## 🧪 Probar que Funciona

### 1. Verificar Backend

Terminal Backend:
```bash
cd backend
npm run dev
```

Debe mostrar:
```
🚀 Backend server running on port 5000
```

### 2. Verificar Endpoint de Módulos

```bash
# Obtener token de Firebase (desde consola del navegador cuando estés logueado)
TOKEN="tu_token_aqui"

# Probar obtener módulos de un curso
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:5000/api/modules/courses/COURSE_ID/modules
```

### 3. Verificar Frontend

1. Inicia el frontend: `npm run dev`
2. Logueate como estudiante
3. Abre un curso
4. Los módulos deben cargarse desde el backend

---

## 🐛 Troubleshooting

### Error: "Failed to load course modules"

**Causa:** Backend no está corriendo o hay error en la conexión

**Solución:**
1. Verifica que el backend esté corriendo en puerto 5000
2. Verifica `VITE_API_URL` en `.env` del frontend
3. Revisa la consola del navegador para ver el error exacto
4. Revisa los logs del backend

### Error: "Unauthorized"

**Causa:** Token no válido o expirado

**Solución:**
1. Cierra sesión y vuelve a loguearte
2. Verifica que el token se esté enviando correctamente
3. Revisa el interceptor de axios en `src/api/client.ts`

### Error: "Index error" en Firestore

**Causa:** Falta el índice compuesto

**Solución:**
1. Crea el índice en Firebase Console
2. O espera a que se cree automáticamente (puede tardar unos minutos)

### Los módulos no aparecen

**Causa 1:** El curso no tiene módulos creados
**Solución:** Crea módulos desde el editor de cursos del profesor

**Causa 2:** Error en la query de Firestore
**Solución:** Verifica los logs del backend, puede ser que falte un índice

**Causa 3:** El endpoint está devolviendo error
**Solución:** Revisa la respuesta en Network tab del navegador

---

## 📝 Cambios Realizados

### Backend
- ✅ `modules.repository.ts` - Repositorio de módulos
- ✅ `progress.repository.ts` - Repositorio de progreso
- ✅ `modules.service.ts` - Servicio de módulos
- ✅ `progress.service.ts` - Servicio de progreso
- ✅ `modules.controller.ts` - Controlador de módulos
- ✅ `progress.controller.ts` - Controlador de progreso
- ✅ `modules.routes.ts` - Rutas de módulos
- ✅ `progress.routes.ts` - Rutas de progreso

### Frontend
- ✅ `api.service.ts` - Métodos para módulos y progreso
- ✅ `CourseViewer.tsx` - Migrado a usar `ApiService`
- ✅ `StudentDashboard.tsx` - Migrado a usar `ApiService`
- ✅ `api/endpoints.ts` - Endpoints actualizados

---

## ✨ Ventajas de Usar Backend

1. **Seguridad**: Validación y autorización en el servidor
2. **Consistencia**: Lógica de negocio centralizada
3. **Escalabilidad**: Fácil agregar cache, optimizaciones, etc.
4. **Mantenibilidad**: Código más organizado
5. **Flexibilidad**: Puedes cambiar la BD sin afectar el frontend

---

## 🔮 Próximos Pasos

1. Migrar Courses completamente
2. Migrar Enrollments
3. Migrar Assignments
4. Migrar Submissions
5. Agregar validaciones con express-validator
6. Agregar rate limiting
7. Implementar cache (opcional)

