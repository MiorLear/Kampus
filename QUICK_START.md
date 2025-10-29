# ⚡ Inicio Rápido - Kampus

## 🎯 Levantar el Proyecto en 3 Pasos

### Paso 1: Instalar Dependencias

```bash
# Instalar frontend y backend
npm run install:all
```

### Paso 2: Configurar Variables de Entorno

**Frontend** - `.env` en la raíz:
```env
VITE_FIREBASE_API_KEY=tu_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu_proyecto_id
VITE_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
VITE_FIREBASE_APP_ID=tu_app_id
VITE_API_URL=http://localhost:5000/api
```

**Backend** - `backend/.env`:
```bash
cd backend && cp .env.example .env
```

Editar `backend/.env`:
```env
PORT=5000
FRONTEND_URL=http://localhost:5173
```

**Firebase Admin SDK:**
1. Ve a Firebase Console → Service Accounts
2. Descarga clave privada → `backend/firebase-service-account.json`

### Paso 3: Iniciar

**Opción A: Todo junto (2 terminales)**

Terminal 1:
```bash
cd backend && npm run dev
```

Terminal 2:
```bash
npm run dev
```

**Opción B: Solo Frontend (sin backend)**
```bash
npm run dev
```

## ✅ Verificar

- Backend: http://localhost:5000/health
- Frontend: http://localhost:5173

## 📚 Más Info

- [INSTRUCCIONES_INICIO.md](./INSTRUCCIONES_INICIO.md) - Guía completa
- [MIGRACION_BACKEND.md](./MIGRACION_BACKEND.md) - Migración paso a paso


