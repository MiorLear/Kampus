# Guía de Migración: Backend Separado

## 📋 Pasos para Implementar

### Paso 1: Instalar Dependencias del Backend

```bash
cd backend
npm install
```

### Paso 2: Configurar Firebase Admin SDK

**Opción A: Usar Service Account (Recomendado para Producción)**

1. Ir a Firebase Console → Project Settings → Service Accounts
2. Generar nueva clave privada
3. Descargar el archivo JSON
4. Guardarlo como `backend/firebase-service-account.json`
5. Descomentar la sección de service account en `backend/src/config/firebase.ts`

**Opción B: Application Default Credentials (Para Desarrollo Local)**

```bash
# Instalar Google Cloud CLI si no está instalado
# https://cloud.google.com/sdk/docs/install

# Autenticarse
gcloud auth application-default login
```

### Paso 3: Configurar Variables de Entorno

```bash
cd backend
cp .env.example .env
# Editar .env con tus valores
```

### Paso 4: Instalar Dependencias del Frontend

```bash
# En la raíz del proyecto
npm install axios
```

### Paso 5: Agregar Variable de Entorno en Frontend

Crear o actualizar `.env` en la raíz:

```env
VITE_API_URL=http://localhost:5000/api
```

### Paso 6: Ejecutar Backend

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

### Paso 7: Probar el Health Check

```bash
curl http://localhost:5000/health
```

Deberías recibir:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "service": "kampus-backend"
}
```

### Paso 8: Probar Endpoint de Usuarios

Primero necesitas un token de autenticación. Puedes obtenerlo desde la consola del navegador cuando estés logueado:

```javascript
// En la consola del navegador
const user = firebase.auth().currentUser;
const token = await user.getIdToken();
console.log(token);
```

Luego:
```bash
curl -H "Authorization: Bearer TU_TOKEN_AQUI" http://localhost:5000/api/users
```

---

## 🔄 Migración Gradual de Componentes

### Actualizar Hooks para Usar ApiService

Ejemplo: `useUsers` hook

**ANTES:**
```typescript
import { FirestoreService } from '../services/firestore.service';

export function useUsers(role?: string) {
  const [users, setUsers] = useState<User[]>([]);
  
  useEffect(() => {
    const fetchUsers = async () => {
      const data = role
        ? await FirestoreService.getUsersByRole(role)
        : await FirestoreService.getAllUsers();
      setUsers(data);
    };
    fetchUsers();
  }, [role]);
}
```

**DESPUÉS:**
```typescript
import { ApiService } from '../services/api.service';

export function useUsers(role?: 'student' | 'teacher' | 'admin') {
  const [users, setUsers] = useState<User[]>([]);
  
  useEffect(() => {
    const fetchUsers = async () => {
      const data = await ApiService.getAllUsers(role);
      setUsers(data);
    };
    fetchUsers();
  }, [role]);
}
```

---

## ✅ Checklist de Migración

### Backend
- [ ] Instalar dependencias
- [ ] Configurar Firebase Admin SDK
- [ ] Configurar variables de entorno
- [ ] Probar servidor (health check)
- [ ] Implementar repositorios restantes
- [ ] Implementar servicios restantes
- [ ] Implementar controladores restantes
- [ ] Implementar rutas restantes
- [ ] Testing de endpoints

### Frontend
- [ ] Instalar axios
- [ ] Configurar apiClient
- [ ] Crear ApiService con todos los métodos
- [ ] Actualizar hooks para usar ApiService
- [ ] Actualizar componentes que usan FirestoreService directamente
- [ ] Testing de integración

---

## 🧪 Testing

### Probar Endpoint de Usuarios desde Frontend

```typescript
// En la consola del navegador (cuando estés logueado)
import { ApiService } from './services/api.service';
const users = await ApiService.getAllUsers();
console.log(users);
```

---

## 🚨 Troubleshooting

### Error: "Firebase Admin SDK not initialized"
- Verificar que la configuración de Firebase Admin esté correcta
- Verificar que las credenciales estén disponibles

### Error: "CORS blocked"
- Verificar que `FRONTEND_URL` en `.env` del backend sea correcta
- Verificar que el frontend esté corriendo en ese puerto

### Error: "Unauthorized" en requests
- Verificar que el token esté siendo enviado correctamente
- Verificar que el usuario esté autenticado
- Verificar que el token no esté expirado

---

## 📚 Próximos Pasos

1. Completar todos los repositorios (enrollments, assignments, etc.)
2. Agregar validaciones con express-validator
3. Agregar logging (Winston o similar)
4. Agregar rate limiting
5. Agregar cache (Redis) si es necesario
6. Deploy backend a producción (Cloud Run, Railway, etc.)


