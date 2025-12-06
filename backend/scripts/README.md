# Scripts de Utilidad

## sanitize-database.ts

Script para limpiar completamente la base de datos de Firestore y Firebase Auth, manteniendo solo un usuario específico.

### ⚠️ ADVERTENCIA

Este script es **DESTRUCTIVO**. Eliminará:
- Todos los usuarios excepto el especificado
- Todos los cursos
- Todas las inscripciones
- Todas las asignaciones
- Todas las entregas
- Todos los anuncios
- Todos los mensajes
- Todos los logs de actividad
- Todos los módulos de curso
- Todo el progreso de usuarios

**NO SE PUEDE DESHACER**. Asegúrate de tener un backup antes de ejecutar este script.

### Uso

1. Asegúrate de tener el archivo `firebase-service-account.json` en la raíz del directorio `backend/`

2. Edita el script si necesitas cambiar el email del usuario a mantener:
   ```typescript
   const TARGET_EMAIL = 'miguelledezma005@gmail.com';
   ```

3. Ejecuta el script:
   ```bash
   cd backend
   npm run sanitize
   ```

   O directamente con ts-node:
   ```bash
   npx ts-node scripts/sanitize-database.ts
   ```

### Qué hace el script

1. **Busca el usuario objetivo** por email en Firebase Auth y Firestore
2. **Elimina todos los documentos** de las siguientes colecciones:
   - `users` (excepto el usuario objetivo)
   - `courses`
   - `enrollments`
   - `assignments`
   - `submissions`
   - `announcements`
   - `messages`
   - `activity_logs`
   - `course_modules`
   - `user_progress`
   - `course_progress`
3. **Elimina todos los usuarios** de Firebase Auth excepto el objetivo
4. **Muestra un resumen** de la operación

### Requisitos

- Node.js instalado
- Dependencias del proyecto instaladas (`npm install`)
- Archivo `firebase-service-account.json` con credenciales válidas
- Permisos de administrador en Firebase

### Salida del script

El script mostrará:
- Progreso de la limpieza por colección
- Número de documentos eliminados
- Resumen final con el total de eliminaciones
- Confirmación del usuario mantenido

### Ejemplo de salida

```
🚀 Iniciando sanitización de la base de datos...

✅ Firebase Admin inicializado

🔍 Buscando usuario con email: miguelledezma005@gmail.com...
✅ Usuario encontrado en Firebase Auth: abc123xyz

📋 Usuario a mantener:
   - ID: abc123xyz
   - Email: miguelledezma005@gmail.com
   - Nombre: Miguel Ledezma
   - Rol: admin

⚠️  ADVERTENCIA: Este script eliminará TODOS los datos excepto el usuario especificado.
...

🧹 Limpiando colección: users...
   ✅ Eliminados 45 documentos de users

🧹 Limpiando colección: courses...
   ✅ Eliminados 12 documentos de courses

...

═══════════════════════════════════════════════════════
✅ SANITIZACIÓN COMPLETADA
═══════════════════════════════════════════════════════
📊 Total de documentos eliminados: 234
👤 Usuario mantenido: miguelledezma005@gmail.com (abc123xyz)
═══════════════════════════════════════════════════════
```

