# 🚀 Cómo Levantar el Proyecto Kampus

## 📋 Requisitos Previos

- Node.js v18 o superior
- npm o yarn
- Cuenta de Firebase configurada
- (Opcional) Google Cloud CLI para desarrollo local

---

## 🏗️ Estructura del Proyecto

Ahora el proyecto tiene **2 partes**:

1. **Frontend** (React + Vite) - Puerto 5173
2. **Backend** (Express + TypeScript) - Puerto 5000

---

## ⚡ Inicio Rápido (Opción 1: Sin Backend por ahora)

Si quieres levantar solo el frontend **sin cambios** (usa Firestore directo):

```bash
# En la raíz del proyecto
npm install
npm run dev
```

El frontend estará en: `http://localhost:5173`

---

## 🔧 Inicio Completo (Backend + Frontend)

### Paso 1: Instalar Dependencias del Frontend

```bash
# En la raíz del proyecto
npm install axios
npm install
```

### Paso 2: Configurar Variables de Entorno

**Frontend** - Crear o actualizar `.env` en la raíz:

```env
# Frontend .env
VITE_FIREBASE_API_KEY=tu_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu_proyecto_id
VITE_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
VITE_FIREBASE_APP_ID=tu_app_id
VITE_API_URL=http://localhost:5000/api
```

### Paso 3: Instalar Dependencias del Backend

```bash
cd backend
npm install
```

### Paso 4: Configurar Firebase Admin SDK

**Opción A: Service Account (Recomendado)**

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto
3. Ve a **Project Settings** → **Service Accounts**
4. Click en **Generate New Private Key**
5. Descarga el archivo JSON
6. Guárdalo como `backend/firebase-service-account.json`

**Opción B: Application Default Credentials (Desarrollo Local)**

```bash
# Instalar Google Cloud CLI (si no lo tienes)
# Windows: https://cloud.google.com/sdk/docs/install-sdk#windows
# Mac: brew install google-cloud-sdk
# Linux: https://cloud.google.com/sdk/docs/install-sdk#linux

# Autenticarse
gcloud auth application-default login
```

Luego descomenta la sección de Application Default Credentials en `backend/src/config/firebase.ts`.

### Paso 5: Configurar Variables de Entorno del Backend

```bash
cd backend
cp .env.example .env
```

Editar `backend/.env`:

```env
PORT=5000
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

### Paso 6: Levantar el Backend

**Terminal 1 - Backend:**

```bash
cd backend
npm run dev
```

Deberías ver:
```
🚀 Backend server running on port 5000
📡 API available at http://localhost:5000/api
❤️  Health check at http://localhost:5000/health
```

### Paso 7: Levantar el Frontend

**Terminal 2 - Frontend:**

```bash
# En la raíz del proyecto
npm run dev
```

Deberías ver:
```
  VITE v6.3.5  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

---

## ✅ Verificar que Todo Funciona

### 1. Verificar Backend

Abrir en el navegador:
- http://localhost:5000/health

Deberías ver:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "service": "kampus-backend"
}
```

### 2. Verificar Frontend

Abrir en el navegador:
- http://localhost:5173

Deberías ver la aplicación funcionando.

### 3. Verificar API (Opcional)

Abre la consola del navegador (F12) cuando estés logueado y ejecuta:

```javascript
// Obtener token
const user = firebase.auth().currentUser;
const token = await user.getIdToken();
console.log('Token:', token);

// Probar API (desde la consola o usar Postman)
fetch('http://localhost:5000/api/users', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
  .then(res => res.json())
  .then(data => console.log('Users:', data));
```

---

## 🔄 Comandos Útiles

### Backend

```bash
cd backend

# Desarrollo (con hot reload)
npm run dev

# Build para producción
npm run build

# Ejecutar build de producción
npm start

# Type checking
npm run type-check
```

### Frontend

```bash
# Desarrollo
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview
```

---

## 🚨 Solución de Problemas

### Error: "Cannot find module 'axios'"
```bash
npm install axios
```

### Error: "Firebase Admin SDK not initialized"
- Verifica que tengas configurado el Service Account o Application Default Credentials
- Verifica la configuración en `backend/src/config/firebase.ts`

### Error: "CORS blocked"
- Verifica que `FRONTEND_URL` en `backend/.env` sea `http://localhost:5173`
- Verifica que el backend esté corriendo en el puerto 5000

### Error: "Connection refused" al llamar API
- Verifica que el backend esté corriendo (`npm run dev` en la carpeta backend)
- Verifica que el puerto 5000 no esté en uso
- Verifica `VITE_API_URL` en el `.env` del frontend

### Error: "Unauthorized" en las llamadas API
- Verifica que estés logueado en el frontend
- Verifica que el token se esté enviando correctamente (revisa `src/api/client.ts`)

### Puerto ya en uso

**Backend (puerto 5000):**
```bash
# Cambiar puerto en backend/.env
PORT=5001
```

**Frontend (puerto 5173):**
```bash
# Cambiar en vite.config.ts o usar flag
npm run dev -- --port 3001
```

---

## 📝 Notas Importantes

1. **Orden de inicio**: Siempre inicia el backend primero, luego el frontend
2. **Autenticación**: El frontend necesita estar logueado para que las llamadas API funcionen
3. **Migración gradual**: Puedes usar el sistema antiguo (FirestoreService) mientras migras a la API
4. **Puertos**: Si cambias los puertos, actualiza las configuraciones correspondientes

---

## 🎯 Próximos Pasos

Una vez que todo esté funcionando:

1. **Migrar hooks gradualmente** - Cambiar de `FirestoreService` a `ApiService`
2. **Implementar más endpoints** - Courses, Enrollments, Assignments, etc.
3. **Testing** - Probar que todos los endpoints funcionen correctamente
4. **Deploy** - Preparar para producción

---

## 🆘 ¿Necesitas Ayuda?

Si encuentras algún problema:

1. Revisa los logs del backend (Terminal 1)
2. Revisa los logs del frontend (Terminal 2)
3. Revisa la consola del navegador (F12)
4. Verifica las variables de entorno
5. Verifica que Firebase esté configurado correctamente


