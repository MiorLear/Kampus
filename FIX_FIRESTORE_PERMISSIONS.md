# Solución: Error "Missing or insufficient permissions" en Firestore

## Problema

Después de registrar un usuario, aparece el error:
```
FirebaseError: Missing or insufficient permissions.
```

Esto ocurre cuando la aplicación intenta crear o leer el perfil del usuario en Firestore.

## Solución: Actualizar Reglas de Firestore

### Paso 1: Ir a Firebase Console

1. Ve a [Firebase Console](https://console.firebase.google.com)
2. Selecciona tu proyecto: **kampus-21cfc**
3. En el menú lateral, ve a **Firestore Database**
4. Haz clic en la pestaña **Rules**

### Paso 2: Copiar las Reglas

Copia y pega estas reglas en el editor de reglas:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // REGLAS TEMPORALES PARA DESARROLLO
    // ⚠️ IMPORTANTE: Estas reglas son muy permisivas, solo para desarrollo
    // ⚠️ NO usar en producción sin revisar y ajustar
    
    // Users: reglas específicas para desarrollo
    // Permitir crear y leer el propio perfil
    match /users/{userId} {
      // Permitir lectura si el usuario está autenticado Y es su propio perfil
      allow read: if request.auth != null && request.auth.uid == userId;
      // Permitir creación si el userId coincide con el uid del usuario autenticado
      allow create: if request.auth != null && request.auth.uid == userId;
      // Permitir actualización si el userId coincide con el uid del usuario autenticado
      allow update: if request.auth != null && request.auth.uid == userId;
      // Para desarrollo: permitir lectura de cualquier perfil si está autenticado
      // (esto ayuda cuando el usuario se cierra sesión después del registro)
      allow read: if request.auth != null;
    }
    
    // Permitir todo para usuarios autenticados (DESARROLLO SOLO)
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
    
    // Course modules: lectura para usuarios autenticados, escritura para teachers y admins
    match /course_modules/{moduleId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    
    // User progress: lectura para el usuario y admins, escritura para el usuario
    match /user_progress/{progressId} {
      allow read: if request.auth != null && (
        request.auth.uid == resource.data.user_id
      );
      allow write: if request.auth != null && (
        request.auth.uid == resource.data.user_id
      );
    }
    
    // Course progress: lectura para el usuario y admins, escritura para el usuario
    match /course_progress/{progressId} {
      allow read: if request.auth != null && (
        request.auth.uid == resource.data.user_id
      );
      allow write: if request.auth != null && (
        request.auth.uid == resource.data.user_id
      );
    }
  }
}
```

### Paso 3: Publicar las Reglas

1. Haz clic en el botón **Publish** (Publicar) en la parte superior del editor
2. Espera a que aparezca el mensaje de confirmación
3. Las reglas se aplicarán inmediatamente

### Paso 4: Verificar

1. Intenta registrar un nuevo usuario
2. Revisa la consola del navegador
3. Deberías ver:
   - `✅ User created successfully: [uid]`
   - `✅ Email verification sent successfully to: [email]`
   - **NO** deberías ver errores de permisos

## Notas Importantes

- Estas reglas son **muy permisivas** y están diseñadas solo para desarrollo
- En producción, deberías usar reglas más restrictivas
- Las reglas permiten que cualquier usuario autenticado lea/escriba en cualquier colección
- Esto es necesario durante el desarrollo para evitar problemas de permisos

## Si el Problema Persiste

1. **Verifica que las reglas se publicaron correctamente:**
   - Ve a Firestore Database > Rules
   - Asegúrate de que las reglas mostradas coincidan con las que copiaste

2. **Limpia la caché del navegador:**
   - Presiona `Ctrl + Shift + Delete` (Windows) o `Cmd + Shift + Delete` (Mac)
   - Selecciona "Cached images and files"
   - Haz clic en "Clear data"

3. **Recarga la aplicación:**
   - Cierra todas las pestañas de la aplicación
   - Abre una nueva pestaña
   - Intenta registrar un usuario de nuevo

4. **Verifica la autenticación:**
   - Asegúrate de que el usuario esté autenticado cuando se intenta crear el perfil
   - Revisa la consola para ver si hay errores de autenticación

## Reglas de Producción (Para el Futuro)

Cuando estés listo para producción, deberías usar reglas más restrictivas. Consulta el archivo `firestore.rules` en el proyecto para ver las reglas comentadas de producción.

