# Propuesta: Separación Backend y Firestore Calls

## 🎯 Objetivos

1. **Separar responsabilidades**: Backend lógica de negocio, Frontend solo UI
2. **Mejor seguridad**: Validaciones y reglas de negocio en el servidor
3. **Escalabilidad**: Facilita futuros cambios (cambiar DB, agregar cache, etc.)
4. **Testing**: Más fácil testear lógica separada
5. **API reutilizable**: Posibilidad de usar el mismo backend para móvil, etc.

---

## 🏗️ Arquitectura Propuesta

### Estructura Actual vs Propuesta

**ACTUAL:**
```
Frontend
  └── FirestoreService (llamadas directas a Firestore)
       └── Firebase Firestore
```

**PROPUESTA:**
```
Frontend                    Backend                    Data Layer
  └── ApiClient            └── API Routes            └── Repositories
       └── useApi              └── Controllers            └── Firestore
                                   └── Services               └── Firebase
                                       └── Repositories
```

---

## 📁 Nueva Estructura de Carpetas

```
proyecto/
├── frontend/                    # Carpeta del frontend (o renombrar src/)
│   ├── src/
│   │   ├── api/                # NUEVO - Cliente API
│   │   │   ├── client.ts       # Configuración del cliente HTTP
│   │   │   ├── endpoints.ts    # Definición de endpoints
│   │   │   └── types.ts        # Tipos de requests/responses
│   │   ├── services/           # MODIFICADO - Ahora usa API
│   │   │   ├── api.service.ts  # Servicio que llama al backend
│   │   │   └── auth.service.ts # Auth sigue directo a Firebase Auth
│   │   └── hooks/
│   │       └── useApi.ts       # Hook para llamadas API
│   └── ...
│
├── backend/                    # NUEVO - Carpeta del backend
│   ├── src/
│   │   ├── server.ts           # Entrada del servidor Express
│   │   ├── config/
│   │   │   └── firebase.ts    # Config Firebase Admin SDK
│   │   ├── routes/             # Rutas de la API
│   │   │   ├── index.ts
│   │   │   ├── users.routes.ts
│   │   │   ├── courses.routes.ts
│   │   │   ├── enrollments.routes.ts
│   │   │   ├── assignments.routes.ts
│   │   │   └── analytics.routes.ts
│   │   ├── controllers/        # Controladores (lógica HTTP)
│   │   │   ├── users.controller.ts
│   │   │   ├── courses.controller.ts
│   │   │   └── ...
│   │   ├── services/           # Lógica de negocio
│   │   │   ├── users.service.ts
│   │   │   ├── courses.service.ts
│   │   │   └── ...
│   │   ├── repositories/       # Acceso a datos (Firestore)
│   │   │   ├── base.repository.ts
│   │   │   ├── users.repository.ts
│   │   │   ├── courses.repository.ts
│   │   │   └── ...
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts    # Verificación de tokens
│   │   │   ├── error.middleware.ts   # Manejo de errores
│   │   │   └── validation.middleware.ts
│   │   ├── utils/
│   │   │   ├── errors.ts
│   │   │   └── validators.ts
│   │   └── types/
│   │       └── index.ts
│   ├── package.json
│   └── tsconfig.json
│
└── shared/                     # OPCIONAL - Tipos compartidos
    └── types/
        ├── user.types.ts
        ├── course.types.ts
        └── index.ts
```

---

## 🛠️ Tecnologías Recomendadas

### Backend
- **Express.js** (ya instalado) - Framework web
- **Firebase Admin SDK** - Para operaciones server-side en Firestore
- **TypeScript** - Mismo stack que frontend
- **express-validator** - Validación de requests
- **cors** - Manejo de CORS
- **dotenv** - Variables de entorno

### Frontend
- **axios** o **fetch** - Cliente HTTP
- **React Query** (opcional pero recomendado) - Para cache y estado de API

---

## 💻 Implementación Paso a Paso

### FASE 1: Setup Backend Básico

#### 1.1 Crear estructura backend/

```bash
mkdir backend
cd backend
npm init -y
npm install express firebase-admin cors dotenv express-validator
npm install -D typescript @types/express @types/node @types/cors ts-node nodemon
```

#### 1.2 Backend tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

#### 1.3 Backend package.json scripts

```json
{
  "scripts": {
    "dev": "nodemon --exec ts-node src/server.ts",
    "build": "tsc",
    "start": "node dist/server.ts"
  }
}
```

---

### FASE 2: Configuración Firebase Admin

#### 2.1 backend/src/config/firebase.ts

```typescript
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// OPCIÓN 1: Usar service account (recomendado para producción)
const serviceAccount = require('../firebase-service-account.json');

// OPCIÓN 2: Usar Application Default Credentials (para desarrollo)
// Simplemente no pases nada y usa las credenciales del entorno

if (getApps().length === 0) {
  initializeApp({
    credential: cert(serviceAccount),
    // O para desarrollo local:
    // credential: applicationDefault(),
  });
}

export const db = getFirestore();
```

---

### FASE 3: Capa de Repositorios (Data Access)

#### 3.1 backend/src/repositories/base.repository.ts

```typescript
import { db } from '../config/firebase';
import { CollectionReference, DocumentReference } from 'firebase-admin/firestore';

export abstract class BaseRepository<T> {
  protected collection: CollectionReference;

  constructor(collectionName: string) {
    this.collection = db.collection(collectionName);
  }

  async findById(id: string): Promise<T | null> {
    try {
      const doc = await this.collection.doc(id).get();
      if (!doc.exists) return null;
      return { id: doc.id, ...doc.data() } as T;
    } catch (error) {
      console.error(`Error getting ${this.collection.path}/${id}:`, error);
      throw error;
    }
  }

  async findAll(): Promise<T[]> {
    try {
      const snapshot = await this.collection.get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
    } catch (error) {
      console.error(`Error getting all from ${this.collection.path}:`, error);
      throw error;
    }
  }

  async create(data: Omit<T, 'id'>): Promise<string> {
    try {
      const docRef = await this.collection.add({
        ...data,
        created_at: new Date().toISOString(),
      });
      return docRef.id;
    } catch (error) {
      console.error(`Error creating in ${this.collection.path}:`, error);
      throw error;
    }
  }

  async update(id: string, data: Partial<T>): Promise<void> {
    try {
      await this.collection.doc(id).update({
        ...data,
        updated_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error(`Error updating ${this.collection.path}/${id}:`, error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.collection.doc(id).delete();
    } catch (error) {
      console.error(`Error deleting ${this.collection.path}/${id}:`, error);
      throw error;
    }
  }

  async findBy(field: string, value: any): Promise<T[]> {
    try {
      const snapshot = await this.collection.where(field, '==', value).get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
    } catch (error) {
      console.error(`Error finding by ${field} in ${this.collection.path}:`, error);
      throw error;
    }
  }
}
```

#### 3.2 Ejemplo: backend/src/repositories/users.repository.ts

```typescript
import { BaseRepository } from './base.repository';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'teacher' | 'admin';
  photo_url?: string;
  created_at: string;
}

export class UsersRepository extends BaseRepository<User> {
  constructor() {
    super('users');
  }

  async findByRole(role: 'student' | 'teacher' | 'admin'): Promise<User[]> {
    return this.findBy('role', role);
  }

  async findByEmail(email: string): Promise<User | null> {
    const users = await this.findBy('email', email);
    return users.length > 0 ? users[0] : null;
  }
}
```

#### 3.3 Ejemplo: backend/src/repositories/courses.repository.ts

```typescript
import { BaseRepository } from './base.repository';
import { db } from '../config/firebase';

export interface Course {
  id: string;
  title: string;
  description: string;
  teacher_id: string;
  created_at: string;
  updated_at: string;
}

export class CoursesRepository extends BaseRepository<Course> {
  constructor() {
    super('courses');
  }

  async findByTeacher(teacherId: string): Promise<Course[]> {
    return this.findBy('teacher_id', teacherId);
  }

  async getModules(courseId: string) {
    const modulesSnapshot = await db
      .collection('course_modules')
      .where('course_id', '==', courseId)
      .orderBy('order')
      .get();
    
    return modulesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }
}
```

---

### FASE 4: Capa de Servicios (Lógica de Negocio)

#### 4.1 backend/src/services/users.service.ts

```typescript
import { UsersRepository } from '../repositories/users.repository';
import { User } from '../repositories/users.repository';

export class UsersService {
  private usersRepo: UsersRepository;

  constructor() {
    this.usersRepo = new UsersRepository();
  }

  async getUser(userId: string): Promise<User | null> {
    return this.usersRepo.findById(userId);
  }

  async getAllUsers(): Promise<User[]> {
    return this.usersRepo.findAll();
  }

  async getUsersByRole(role: 'student' | 'teacher' | 'admin'): Promise<User[]> {
    return this.usersRepo.findByRole(role);
  }

  async updateUser(userId: string, data: Partial<User>): Promise<void> {
    // Validaciones de negocio aquí
    if (data.email && !this.isValidEmail(data.email)) {
      throw new Error('Invalid email format');
    }
    
    await this.usersRepo.update(userId, data);
  }

  async deleteUser(userId: string): Promise<void> {
    // Verificar si el usuario tiene cursos asignados, etc.
    // Lógica de negocio antes de eliminar
    
    await this.usersRepo.delete(userId);
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
```

---

### FASE 5: Controladores (HTTP Layer)

#### 5.1 backend/src/controllers/users.controller.ts

```typescript
import { Request, Response, NextFunction } from 'express';
import { UsersService } from '../services/users.service';

export class UsersController {
  private usersService: UsersService;

  constructor() {
    this.usersService = new UsersService();
  }

  getUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const user = await this.usersService.getUser(id);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      res.json(user);
    } catch (error) {
      next(error);
    }
  };

  getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const role = req.query.role as string | undefined;
      
      const users = role
        ? await this.usersService.getUsersByRole(role as any)
        : await this.usersService.getAllUsers();
      
      res.json(users);
    } catch (error) {
      next(error);
    }
  };

  updateUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      await this.usersService.updateUser(id, updates);
      
      res.json({ message: 'User updated successfully' });
    } catch (error) {
      next(error);
    }
  };

  deleteUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      
      await this.usersService.deleteUser(id);
      
      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      next(error);
    }
  };
}
```

---

### FASE 6: Rutas API

#### 6.1 backend/src/routes/users.routes.ts

```typescript
import { Router } from 'express';
import { UsersController } from '../controllers/users.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validateUpdateUser } from '../middleware/validation.middleware';

const router = Router();
const usersController = new UsersController();

// Todos los endpoints requieren autenticación
router.use(authenticate);

router.get('/:id', usersController.getUser);
router.get('/', usersController.getAllUsers);
router.put('/:id', validateUpdateUser, usersController.updateUser);
router.delete('/:id', usersController.deleteUser);

export default router;
```

#### 6.2 backend/src/routes/index.ts

```typescript
import { Router } from 'express';
import usersRoutes from './users.routes';
import coursesRoutes from './courses.routes';
import enrollmentsRoutes from './enrollments.routes';
import assignmentsRoutes from './assignments.routes';
import analyticsRoutes from './analytics.routes';

const router = Router();

router.use('/users', usersRoutes);
router.use('/courses', coursesRoutes);
router.use('/enrollments', enrollmentsRoutes);
router.use('/assignments', assignmentsRoutes);
router.use('/analytics', analyticsRoutes);

export default router;
```

---

### FASE 7: Middleware de Autenticación

#### 7.1 backend/src/middleware/auth.middleware.ts

```typescript
import { Request, Response, NextFunction } from 'express';
import { getAuth } from 'firebase-admin/auth';

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split('Bearer ')[1];
    
    // Verificar token con Firebase Admin
    const decodedToken = await getAuth().verifyIdToken(token);
    
    // Agregar user info al request
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
    };
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

// Extender tipo Request para incluir user
declare global {
  namespace Express {
    interface Request {
      user?: {
        uid: string;
        email?: string;
      };
    }
  }
}
```

---

### FASE 8: Servidor Express

#### 8.1 backend/src/server.ts

```typescript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes from './routes';
import { errorHandler } from './middleware/error.middleware';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api', apiRoutes);

// Error handling
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
});
```

---

### FASE 9: Cliente API en Frontend

#### 9.1 frontend/src/api/client.ts

```typescript
import axios, { AxiosInstance, AxiosError } from 'axios';
import { auth } from '../config/firebase';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token de autenticación
apiClient.interceptors.request.use(
  async (config) => {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejo de errores
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token inválido o expirado
      // Redirigir a login o refrescar token
    }
    return Promise.reject(error);
  }
);
```

#### 9.2 frontend/src/api/endpoints.ts

```typescript
export const API_ENDPOINTS = {
  // Users
  USERS: '/users',
  USER_BY_ID: (id: string) => `/users/${id}`,
  
  // Courses
  COURSES: '/courses',
  COURSE_BY_ID: (id: string) => `/courses/${id}`,
  COURSES_BY_TEACHER: (teacherId: string) => `/courses?teacher_id=${teacherId}`,
  
  // Enrollments
  ENROLLMENTS: '/enrollments',
  ENROLLMENT_BY_ID: (id: string) => `/enrollments/${id}`,
  
  // Assignments
  ASSIGNMENTS: '/assignments',
  ASSIGNMENT_BY_ID: (id: string) => `/assignments/${id}`,
  
  // Analytics
  ANALYTICS_STUDENT: (studentId: string) => `/analytics/student/${studentId}`,
  ANALYTICS_TEACHER: (teacherId: string) => `/analytics/teacher/${teacherId}`,
  ANALYTICS_COURSE: (courseId: string) => `/analytics/course/${courseId}`,
  ANALYTICS_SYSTEM: '/analytics/system',
} as const;
```

#### 9.3 frontend/src/services/api.service.ts

```typescript
import { apiClient } from '../api/client';
import { API_ENDPOINTS } from '../api/endpoints';
import { User, Course, Enrollment, Assignment } from '../services/firestore.service';

export class ApiService {
  // ========== USERS ==========
  static async getUser(userId: string): Promise<User | null> {
    const response = await apiClient.get(API_ENDPOINTS.USER_BY_ID(userId));
    return response.data;
  }

  static async getAllUsers(role?: string): Promise<User[]> {
    const params = role ? { role } : {};
    const response = await apiClient.get(API_ENDPOINTS.USERS, { params });
    return response.data;
  }

  static async updateUser(userId: string, data: Partial<User>): Promise<void> {
    await apiClient.put(API_ENDPOINTS.USER_BY_ID(userId), data);
  }

  static async deleteUser(userId: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.USER_BY_ID(userId));
  }

  // ========== COURSES ==========
  static async getAllCourses(teacherId?: string): Promise<Course[]> {
    const params = teacherId ? { teacher_id: teacherId } : {};
    const response = await apiClient.get(API_ENDPOINTS.COURSES, { params });
    return response.data;
  }

  static async getCourse(courseId: string): Promise<Course | null> {
    const response = await apiClient.get(API_ENDPOINTS.COURSE_BY_ID(courseId));
    return response.data;
  }

  static async createCourse(course: Omit<Course, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
    const response = await apiClient.post(API_ENDPOINTS.COURSES, course);
    return response.data.id;
  }

  // ... más métodos
}
```

#### 9.4 Actualizar hooks para usar ApiService

```typescript
// frontend/src/hooks/useFirestore.ts
import { ApiService } from '../services/api.service';

export function useCourses(teacherId?: string) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const data = await ApiService.getAllCourses(teacherId);
        setCourses(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [teacherId]);

  return { courses, loading, error, refreshCourses };
}
```

---

## 🔄 Plan de Migración Gradual

### Opción A: Migración Completa (Recomendada)

1. **Semana 1**: Setup backend básico y repositorios
2. **Semana 2**: Implementar endpoints de Users
3. **Semana 3**: Implementar endpoints de Courses
4. **Semana 4**: Implementar endpoints restantes
5. **Semana 5**: Actualizar frontend y testing

### Opción B: Migración Parcial (Híbrida)

Mantener ambos sistemas en paralelo:

```typescript
// frontend/src/services/api.service.ts
export class ApiService {
  // Usar backend para algunas operaciones
  static async getUser = ApiService.getUser;
  static async getAllUsers = ApiService.getAllUsers;
  
  // Mantener FirestoreService para otras
  static async getCourseModules = FirestoreService.getCourseModules;
}
```

---

## 📊 Ventajas de esta Arquitectura

1. **Seguridad**: Validaciones y reglas de negocio en el servidor
2. **Escalabilidad**: Fácil agregar cache (Redis), cambiar DB, etc.
3. **Testing**: Más fácil testear lógica separada
4. **Mantenibilidad**: Código más organizado
5. **Flexibilidad**: Puedes cambiar Firestore por otra DB sin tocar frontend
6. **Performance**: Posibilidad de agregar cache y optimizaciones

---

## 🚀 Siguiente Paso: Crear Archivos Base

¿Quieres que cree los archivos base de esta estructura para que puedas empezar a implementar?


