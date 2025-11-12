# Kampus Backend (Flask + Firebase)

Backend del sistema Kampus construido con **Flask** (Python) siguiendo una arquitectura **MVC (Model-View-Controller)**. Expone endpoints REST en el nivel raíz (`/`) y usa **Firebase Firestore** como base de datos.

## 🚀 Inicio Rápido

### Instalación

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### Configuración

1. **Crear archivo `.env`** en `backend/`:
```env
FRONTEND_URL=http://localhost:3000
FIREBASE_CREDENTIALS_PATH=firebase-service-account.json
```

2. **Configurar Firebase Admin SDK:**
   - Ve a Firebase Console → Service Accounts
   - Descarga la clave privada
   - Guárdala como `backend/firebase-service-account.json`

### Ejecutar Servidor

```bash
python run.py
```

El servidor se ejecuta en `http://localhost:8000` por defecto. CORS está habilitado para permitir requests desde cualquier origen en desarrollo.

## 📦 Dependencias

- **Flask 3.0.3** - Framework web
- **flask-cors 4.0.0** - Manejo de CORS
- **firebase-admin 6.0.0** - Firebase Admin SDK
- **python-dotenv 0.1.0** - Variables de entorno

## 📁 Estructura del Proyecto

```
backend/
├── app/
│   ├── __init__.py              # Flask app factory
│   ├── config.py                # Configuración de la aplicación
│   ├── firebase.py              # Inicialización de Firebase Admin SDK
│   │
│   ├── api/                     # API Layer (Blueprints)
│   │   ├── __init__.py
│   │   ├── users.py             # Endpoints de usuarios
│   │   ├── courses.py           # Endpoints de cursos
│   │   ├── modules.py           # Endpoints de módulos
│   │   ├── enrollments.py       # Endpoints de inscripciones
│   │   ├── progress.py          # Endpoints de progreso
│   │   └── assignments.py       # Endpoints de asignaciones
│   │
│   ├── services/                # Service Layer (Business Logic)
│   │   ├── __init__.py
│   │   ├── users_service.py
│   │   ├── courses_service.py
│   │   ├── modules_service.py
│   │   ├── enrollments_service.py
│   │   ├── progress_service.py
│   │   └── assignments_service.py
│   │
│   └── repositories/            # Repository Layer (Data Access)
│       ├── __init__.py
│       ├── users_repository.py
│       ├── courses_repository.py
│       ├── modules_repository.py
│       ├── enrollments_repository.py
│       ├── progress_repository.py
│       └── assignments_repository.py
│
├── run.py                       # Servidor de desarrollo
├── requirements.txt             # Dependencias Python
└── README.md                    # Esta documentación
```

## 🔌 Endpoints Disponibles

### Usuarios (`/users`)
- `GET /users` - Listar todos los usuarios
- `GET /users?role=<role>` - Listar usuarios por rol
- `GET /users/<user_id>` - Obtener usuario específico
- `PUT /users/<user_id>` - Actualizar usuario
- `DELETE /users/<user_id>` - Eliminar usuario
- `GET /users/stats` - Estadísticas de usuarios

### Cursos (`/courses`)
- `GET /courses` - Listar todos los cursos
- `GET /courses?teacher_id=<teacher_id>` - Listar cursos por profesor
- `GET /courses/<course_id>` - Obtener curso específico

### Módulos (`/modules`)
- `GET /modules/courses/<course_id>/modules` - Listar módulos de un curso

### Inscripciones (`/enrollments`)
- `GET /enrollments?student_id=<user_id>` - Listar inscripciones por estudiante
- `GET /enrollments?course_id=<course_id>` - Listar inscripciones por curso
- `POST /enrollments` - Crear inscripción

### Progreso (`/progress`)
- `POST /progress/access` - Guardar acceso a módulo
- `POST /progress` - Guardar progreso parcial
- `POST /progress/complete` - Marcar módulo como completado
- `GET /progress/module/<course_id>/<module_id>?userId=<user_id>` - Progreso de módulo
- `GET /progress/course/<course_id>?userId=<user_id>` - Progreso por módulo del curso
- `GET /progress/course/<course_id>/summary?userId=<user_id>` - Resumen del curso

### Asignaciones (`/assignments`)
- `GET /assignments` - Listar todos los assignments
- `GET /assignments?course_id=<course_id>` - Listar assignments por curso
- `GET /assignments/<assignment_id>` - Obtener assignment específico
- `POST /assignments` - Crear assignment
- `PUT /assignments/<assignment_id>` - Actualizar assignment
- `DELETE /assignments/<assignment_id>` - Eliminar assignment

## 🧪 Probar Endpoints

```bash
# Health check
curl http://localhost:8000/health

# API index
curl http://localhost:8000/

# Usuarios
curl http://localhost:8000/users
curl "http://localhost:8000/users?role=student"

# Cursos
curl http://localhost:8000/courses
curl "http://localhost:8000/courses?teacher_id=teacher_id"

# Assignments
curl http://localhost:8000/assignments
curl "http://localhost:8000/assignments?course_id=course_id"

# Inscripciones
curl "http://localhost:8000/enrollments?course_id=course_id"

# Progreso
curl "http://localhost:8000/progress/course/course_id?userId=user_id"
```

## 📚 Documentación

- [BACKEND_ARCHITECTURE.md](../BACKEND_ARCHITECTURE.md) - Arquitectura del backend
- [BACKEND_API.md](../BACKEND_API.md) - Documentación completa de la API
- [BACKEND_SETUP.md](../BACKEND_SETUP.md) - Guía de configuración

## ✅ Próximos Pasos

- [ ] Agregar middleware de autenticación para validar tokens Firebase
- [ ] Agregar endpoints faltantes (submissions, announcements, messages, analytics)
- [ ] Agregar validación de datos con Pydantic o Marshmallow
- [ ] Agregar tests unitarios (pytest)
- [ ] Agregar logging estructurado
- [ ] Documentación automática con Swagger/OpenAPI
- [ ] Containerizar con Docker (opcional)
