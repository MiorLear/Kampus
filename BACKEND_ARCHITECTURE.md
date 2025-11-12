# Arquitectura del Backend Flask - Kampus

## 📐 Visión General

El backend de Kampus está construido con **Flask** (Python) siguiendo una arquitectura **MVC (Model-View-Controller)** con separación clara de responsabilidades. Utiliza **Firebase Admin SDK** para interactuar con **Firestore** como base de datos.

---

## 🏗️ Arquitectura en Capas

```
┌─────────────────────────────────────────┐
│         API LAYER (Blueprints)          │
│  (Routes - Manejo de HTTP requests)     │
├─────────────────────────────────────────┤
│         SERVICE LAYER                   │
│  (Business Logic - Validaciones)        │
├─────────────────────────────────────────┤
│         REPOSITORY LAYER                │
│  (Data Access - Firestore queries)      │
├─────────────────────────────────────────┤
│         DATA LAYER                      │
│  (Firebase Admin SDK - Firestore)       │
└─────────────────────────────────────────┘
```

---

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
├── run.py                       # Punto de entrada (dev server)
├── requirements.txt             # Dependencias Python
└── README.md                    # Documentación del backend
```

---

## 🔄 Flujo de Datos

### Ejemplo: Obtener Lista de Usuarios

```
1. Frontend → GET /users
   ↓
2. API Layer (users.py)
   - Blueprint: users_bp.get("/")
   - Endpoint: list_users()
   ↓
3. Service Layer (users_service.py)
   - UsersService.list_users(role)
   - Validaciones de negocio
   ↓
4. Repository Layer (users_repository.py)
   - UsersRepository.list(role)
   - Query a Firestore
   ↓
5. Data Layer (Firebase Admin SDK)
   - Firestore collection("users")
   - Stream documents
   ↓
6. Repository → Service → API → Frontend
   - Transformación de datos
   - Respuesta JSON
```

---

## 🧩 Capas Detalladas

### Capa 1: API Layer (Blueprints)

**Responsabilidades:**
- Manejar requests HTTP
- Validar parámetros de entrada
- Llamar a servicios
- Retornar respuestas JSON
- Manejar errores HTTP

**Ejemplo (`app/api/users.py`):**
```python
@users_bp.get("/")
def list_users():
    """Return all users or filter by role."""
    role = request.args.get("role")
    service = UsersService()
    
    try:
        users = service.list_users(role)
        return jsonify(users), 200
    except Exception as exc:
        print("Error fetching users:", exc)
        return jsonify({"error": "Failed to fetch users"}), 500
```

**Características:**
- Blueprints de Flask para organización modular
- Manejo de errores con códigos HTTP apropiados
- Validación de parámetros de entrada
- Respuestas JSON consistentes

### Capa 2: Service Layer

**Responsabilidades:**
- Lógica de negocio
- Validaciones de datos
- Transformación de datos
- Orquestación de operaciones
- Manejo de excepciones de negocio

**Ejemplo (`app/services/users_service.py`):**
```python
class UsersService:
    def __init__(self, repository: UsersRepository | None = None):
        self._repository = repository or UsersRepository()
    
    def list_users(self, role: str | None = None) -> list[dict]:
        """List all users, optionally filtered by role."""
        return self._repository.list(role)
    
    def update_user(self, user_id: str, updates: dict) -> None:
        """Update a user."""
        # Validate that user exists
        user = self._repository.get(user_id)
        if not user:
            raise ValueError(f"User {user_id} not found")
        
        # Remove id from updates if present
        updates.pop("id", None)
        self._repository.update(user_id, updates)
```

**Características:**
- Validación de existencia de recursos
- Validación de campos requeridos
- Transformación de datos antes de guardar
- Manejo de errores de negocio (ValueError)

### Capa 3: Repository Layer

**Responsabilidades:**
- Acceso a datos (Firestore)
- Queries optimizadas
- Transformación de documentos Firestore a dicts
- Manejo de excepciones de base de datos

**Ejemplo (`app/repositories/users_repository.py`):**
```python
class UsersRepository:
    def __init__(self) -> None:
        self._db = get_db()
    
    def list(self, role: str | None = None) -> list[dict]:
        """List all users, optionally filtered by role."""
        if role:
            query = (
                self._db.collection("users")
                .where("role", "==", role)
                .stream()
            )
        else:
            query = self._db.collection("users").stream()
        
        return [self._doc_to_dict(doc) for doc in query]
    
    @staticmethod
    def _doc_to_dict(doc) -> dict:
        """Convert Firestore document to dict with id."""
        data = doc.to_dict()
        data["id"] = doc.id
        return data
```

**Características:**
- Abstracción de Firestore
- Queries optimizadas con filtros
- Transformación consistente de documentos
- Manejo de documentos no existentes

### Capa 4: Data Layer (Firebase Admin SDK)

**Responsabilidades:**
- Inicialización de Firebase Admin SDK
- Conexión a Firestore
- Configuración de credenciales

**Ejemplo (`app/firebase.py`):**
```python
import firebase_admin
from firebase_admin import credentials, firestore

def init_firebase():
    """Initialize Firebase Admin SDK."""
    if not firebase_admin._apps:
        cred_path = os.getenv("FIREBASE_CREDENTIALS_PATH")
        if cred_path and os.path.exists(cred_path):
            cred = credentials.Certificate(cred_path)
            firebase_admin.initialize_app(cred)
        else:
            firebase_admin.initialize_app()

def get_db():
    """Get Firestore database instance."""
    return firestore.client()
```

---

## 🔌 Endpoints Disponibles

### Users (`/users`)
- `GET /users` - Listar todos los usuarios
- `GET /users?role=<role>` - Listar usuarios por rol
- `GET /users/<user_id>` - Obtener usuario específico
- `PUT /users/<user_id>` - Actualizar usuario
- `DELETE /users/<user_id>` - Eliminar usuario
- `GET /users/stats` - Estadísticas de usuarios

### Courses (`/courses`)
- `GET /courses` - Listar todos los cursos
- `GET /courses?teacher_id=<teacher_id>` - Listar cursos por profesor
- `GET /courses/<course_id>` - Obtener curso específico

### Modules (`/modules`)
- `GET /modules/courses/<course_id>/modules` - Listar módulos de un curso

### Enrollments (`/enrollments`)
- `GET /enrollments?student_id=<user_id>` - Listar inscripciones por estudiante
- `GET /enrollments?course_id=<course_id>` - Listar inscripciones por curso
- `POST /enrollments` - Crear inscripción

### Progress (`/progress`)
- `POST /progress/access` - Guardar acceso a módulo
- `POST /progress` - Guardar progreso parcial
- `POST /progress/complete` - Marcar módulo como completado
- `GET /progress/module/<course_id>/<module_id>?userId=<user_id>` - Progreso de módulo
- `GET /progress/course/<course_id>?userId=<user_id>` - Progreso por módulo del curso
- `GET /progress/course/<course_id>/summary?userId=<user_id>` - Resumen del curso

### Assignments (`/assignments`)
- `GET /assignments` - Listar todos los assignments
- `GET /assignments?course_id=<course_id>` - Listar assignments por curso
- `GET /assignments/<assignment_id>` - Obtener assignment específico
- `POST /assignments` - Crear assignment
- `PUT /assignments/<assignment_id>` - Actualizar assignment
- `DELETE /assignments/<assignment_id>` - Eliminar assignment

---

## 🔐 Autenticación y Seguridad

### CORS (Cross-Origin Resource Sharing)

El backend está configurado para permitir requests desde cualquier origen en desarrollo:

```python
CORS(app, 
     origins="*",
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
     allow_headers=["Content-Type", "Authorization", "X-Requested-With"],
     supports_credentials=False,
     max_age=3600)
```

**Headers CORS:**
- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH`
- `Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With`
- `Access-Control-Max-Age: 3600`

### Autenticación (Próximamente)

**Nota:** Actualmente el backend no valida tokens de Firebase. Esto se implementará en la siguiente fase.

**Planeado:**
- Middleware de autenticación
- Validación de tokens Firebase (`firebase_admin.auth.verify_id_token`)
- Protección de rutas sensibles
- Extracción de `user_id` del token

---

## 🛠️ Tecnologías y Stack

### Backend Core
- **Python 3.13+** - Lenguaje de programación
- **Flask 3.0.3** - Framework web
- **Flask-CORS 4.0.0** - Manejo de CORS

### Database
- **Firebase Admin SDK 6.0.0** - SDK para servidor
- **Firestore** - Base de datos NoSQL

### Utilities
- **python-dotenv** - Manejo de variables de entorno

---

## 📝 Patrones de Diseño

### 1. **Application Factory Pattern**

Flask utiliza el patrón de "Application Factory" para crear la aplicación:

```python
def create_app() -> Flask:
    """Application factory for the Kampus backend."""
    app = Flask(__name__)
    app.config.from_object(Config)
    # ... configuración
    return app
```

**Ventajas:**
- Testing más fácil
- Múltiples instancias de la app
- Configuración flexible

### 2. **Repository Pattern**

Abstracción de acceso a datos:

```python
class UsersRepository:
    def list(self, role: str | None = None) -> list[dict]:
        # Acceso a Firestore
        pass
```

**Ventajas:**
- Separación de concerns
- Fácil cambiar de base de datos
- Testing más fácil (mocking)

### 3. **Service Pattern**

Lógica de negocio centralizada:

```python
class UsersService:
    def __init__(self, repository: UsersRepository | None = None):
        self._repository = repository or UsersRepository()
    
    def list_users(self, role: str | None = None) -> list[dict]:
        return self._repository.list(role)
```

**Ventajas:**
- Lógica de negocio reutilizable
- Validaciones centralizadas
- Fácil de testear

### 4. **Blueprint Pattern**

Organización modular de rutas:

```python
users_bp = Blueprint("users", __name__)

@users_bp.get("/")
def list_users():
    # ...
```

**Ventajas:**
- Organización modular
- Fácil de mantener
- Reutilizable

---

## 🔄 Flujo de Request

### Request Completo

```
1. Frontend envía request HTTP
   GET /users?role=student
   Headers: Authorization: Bearer <token>
   ↓
2. Flask recibe request
   - CORS middleware procesa preflight (si es necesario)
   - Blueprint routing
   ↓
3. API Layer (Blueprint)
   - Extrae parámetros (query params, body, path)
   - Valida formato de request
   ↓
4. Service Layer
   - Valida lógica de negocio
   - Transforma datos
   ↓
5. Repository Layer
   - Construye query a Firestore
   - Ejecuta query
   ↓
6. Firestore
   - Ejecuta query
   - Retorna documentos
   ↓
7. Repository → Service → API
   - Transforma documentos a dicts
   - Aplica lógica de negocio
   - Formatea respuesta
   ↓
8. Response HTTP
   Status: 200 OK
   Body: JSON array de usuarios
   Headers: CORS headers
   ↓
9. Frontend recibe response
```

---

## 🚀 Configuración

### Variables de Entorno

**`backend/.env`:**
```env
FRONTEND_URL=http://localhost:3000
FIREBASE_CREDENTIALS_PATH=firebase-service-account.json
```

### Firebase Admin SDK

**Opción 1: Service Account (Recomendado)**
1. Ve a Firebase Console → Service Accounts
2. Descarga clave privada
3. Guárdala como `backend/firebase-service-account.json`
4. Configura `FIREBASE_CREDENTIALS_PATH` en `.env`

**Opción 2: Application Default Credentials**
```bash
gcloud auth application-default login
```

---

## 🧪 Testing

### Estructura de Testing (Pendiente)

```
backend/
├── tests/
│   ├── __init__.py
│   ├── test_api/
│   │   ├── test_users.py
│   │   ├── test_courses.py
│   │   └── ...
│   ├── test_services/
│   │   ├── test_users_service.py
│   │   └── ...
│   └── test_repositories/
│       ├── test_users_repository.py
│       └── ...
```

### Ejemplo de Test (Pendiente)

```python
def test_list_users():
    """Test listing users."""
    app = create_app()
    client = app.test_client()
    
    response = client.get("/users")
    assert response.status_code == 200
    assert isinstance(response.json, list)
```

---

## 📊 Manejo de Errores

### Errores HTTP

**Códigos de Estado:**
- `200 OK` - Request exitoso
- `201 Created` - Recurso creado
- `400 Bad Request` - Request inválido
- `404 Not Found` - Recurso no encontrado
- `500 Internal Server Error` - Error del servidor

### Estructura de Error

```json
{
  "error": "Error message",
  "details": "Additional error details (opcional)"
}
```

### Manejo de Excepciones

```python
try:
    users = service.list_users(role)
    return jsonify(users), 200
except Exception as exc:
    print(f"Error fetching users: {exc}")
    import traceback
    traceback.print_exc()
    return jsonify({"error": "Failed to fetch users"}), 500
```

---

## 🔮 Extensiones Futuras

### 1. **Autenticación**
- Middleware de autenticación
- Validación de tokens Firebase
- Protección de rutas

### 2. **Validación**
- Validación de datos de entrada
- Schemas con Pydantic o Marshmallow
- Validación de tipos

### 3. **Testing**
- Unit tests para servicios
- Integration tests para API
- Tests de repositories

### 4. **Logging**
- Logging estructurado
- Niveles de log configurables
- Logging de requests

### 5. **Documentación**
- Swagger/OpenAPI
- Documentación automática de endpoints
- Ejemplos de requests

### 6. **Caching**
- Cache de respuestas frecuentes
- Redis para cache distribuido
- Invalidación de cache

### 7. **Rate Limiting**
- Límite de requests por IP
- Protección contra DDoS
- Throttling de API

---

## 📚 Recursos y Documentación

### Documentos del Proyecto
- `backend/README.md` - Guía de inicio del backend
- `BACKEND_API.md` - Documentación completa de la API
- `BACKEND_SETUP.md` - Guía de configuración
- `BACKEND_DEPLOYMENT.md` - Guía de despliegue

### Documentación Externa
- [Flask Documentation](https://flask.palletsprojects.com/)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [Flask-CORS Documentation](https://flask-cors.readthedocs.io/)

---

## ✅ Conclusión

La arquitectura del backend de Kampus es **modular, escalable y mantenible**. Sigue principios SOLID y separación de responsabilidades, facilitando:

- **Desarrollo**: Fácil agregar nuevas features
- **Testing**: Componentes testeables
- **Mantenimiento**: Código organizado y predecible
- **Escalabilidad**: Preparado para crecer

El uso de Python y Flask garantiza **productividad** y **facilidad de desarrollo**, mientras que la arquitectura por capas permite **desarrollo en paralelo** y **refactoring seguro**.

