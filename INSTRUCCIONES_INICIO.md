# 🚀 Cómo Levantar el Proyecto Kampus

## 📋 Requisitos Previos

- Node.js v18 o superior
- npm o yarn
- Cuenta de Firebase configurada
- (Opcional) Google Cloud CLI para desarrollo local

---

## 🏗️ Estructura del Proyecto

Ahora el proyecto tiene **2 partes**:

1. **Frontend** (React + TypeScript + Vite) - Puerto 3000 (o el configurado)
2. **Backend** (Flask + Python) - Puerto 8000

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
VITE_API_URL=http://localhost:8000
```

### Paso 3: Instalar Dependencias del Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### Paso 4: Configurar Firebase Admin SDK

**Opción A: Service Account (Recomendado)**

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto
3. Ve a **Project Settings** → **Service Accounts**
4. Click en **Generate New Private Key**
5. Descarga el archivo JSON
6. Guárdalo como `backend/firebase-service-account.json`

### Paso 5: Configurar Variables de Entorno del Backend

Crear archivo `.env` en `backend/`:

```env
FRONTEND_URL=http://localhost:3000
FIREBASE_CREDENTIALS_PATH=firebase-service-account.json
```

### Paso 6: Levantar el Backend

**Terminal 1 - Backend:**

```bash
cd backend
python run.py
```

Deberías ver:
```
 * Running on http://0.0.0.0:8000
 * Debug mode: on
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

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

---

## ✅ Verificar que Todo Funciona

### 1. Verificar Backend

Abrir en el navegador:
- http://localhost:8000/health

Deberías ver:
```json
{
  "status": "ok",
  "message": "API is running"
}
```

### 2. Verificar Frontend

Abrir en el navegador:
- http://localhost:3000 (o el puerto configurado)

Deberías ver la aplicación funcionando.

### 3. Verificar API (Opcional)

Abre la consola del navegador (F12) cuando estés logueado y ejecuta:

```javascript
// Probar API (desde la consola o usar Postman)
fetch('http://localhost:8000/users')
  .then(res => res.json())
  .then(data => console.log('Users:', data));
```

O usar curl:
```bash
curl http://localhost:8000/users
curl http://localhost:8000/courses
curl http://localhost:8000/assignments
```

---

## 🔄 Comandos Útiles

### Backend

```bash
cd backend

# Activar entorno virtual
source venv/bin/activate  # Windows: venv\Scripts\activate

# Desarrollo (con hot reload)
python run.py

# Verificar instalación
python -c "from app import create_app; app = create_app(); print('App created successfully')"
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
- Verifica que el archivo `firebase-service-account.json` existe en `backend/`
- Verifica que el path en `backend/.env` sea correcto
- Verifica que el archivo JSON sea válido

### Error: "CORS blocked"
- Verifica que el backend esté corriendo
- Verifica que `FRONTEND_URL` en `backend/.env` sea correcto
- Verifica que los headers CORS estén configurados correctamente

### Error: "Connection refused" al llamar API
- Verifica que el backend esté corriendo (`python run.py` en la carpeta backend)
- Verifica que el puerto 8000 no esté en uso
- Verifica `VITE_API_URL` en el `.env` del frontend (debe ser `http://localhost:8000`)

### Error: "ModuleNotFoundError: No module named 'flask'"
- Verifica que hayas instalado las dependencias: `pip install -r requirements.txt`
- Verifica que el entorno virtual esté activado

### Puerto ya en uso

**Backend (puerto 8000):**
```bash
# Cambiar puerto en backend/run.py
app.run(host="0.0.0.0", port=8001, debug=True)
```

**Frontend (puerto 3000):**
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


