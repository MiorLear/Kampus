# Guía de Configuración del Backend Flask - Kampus

## 📋 Requisitos Previos

- Python 3.13 o superior
- pip (gestor de paquetes de Python)
- Cuenta de Firebase configurada
- Firebase project creado

---

## 🚀 Instalación

### Paso 1: Crear Entorno Virtual

```bash
cd backend
python -m venv venv
```

**Windows:**
```bash
venv\Scripts\activate
```

**Linux/Mac:**
```bash
source venv/bin/activate
```

### Paso 2: Instalar Dependencias

```bash
pip install -r requirements.txt
```

**Dependencias instaladas:**
- `Flask==3.0.3` - Framework web
- `flask-cors==4.0.0` - Manejo de CORS
- `firebase-admin==6.0.0` - Firebase Admin SDK
- `python-dotenv==0.1.0` - Variables de entorno

### Paso 3: Configurar Variables de Entorno

Crear archivo `.env` en `backend/`:

```env
FRONTEND_URL=http://localhost:3000
FIREBASE_CREDENTIALS_PATH=firebase-service-account.json
```

---

## 🔥 Configuración de Firebase

### Opción 1: Service Account (Recomendado)

1. **Ir a Firebase Console**
   - https://console.firebase.google.com/
   - Seleccionar tu proyecto

2. **Obtener Service Account Key**
   - Ve a **Project Settings** → **Service Accounts**
   - Click en **Generate New Private Key**
   - Descarga el archivo JSON

3. **Guardar el Archivo**
   - Guarda el archivo como `backend/firebase-service-account.json`
   - Asegúrate de que el path coincida con `FIREBASE_CREDENTIALS_PATH` en `.env`

4. **Verificar Configuración**
   ```bash
   python -c "from app.firebase import init_firebase; init_firebase(); print('Firebase initialized successfully')"
   ```

### Opción 2: Application Default Credentials

1. **Instalar Google Cloud CLI**
   - Windows: https://cloud.google.com/sdk/docs/install-sdk#windows
   - Mac: `brew install google-cloud-sdk`
   - Linux: https://cloud.google.com/sdk/docs/install-sdk#linux

2. **Autenticarse**
   ```bash
   gcloud auth application-default login
   ```

3. **Modificar Código**
   - Descomenta la sección de Application Default Credentials en `app/firebase.py`
   - Comenta la sección de Service Account

---

## 🏃 Ejecutar el Servidor

### Modo Desarrollo

```bash
cd backend
python run.py
```

El servidor se ejecutará en `http://localhost:8000` por defecto.

### Verificar que Funciona

Abrir en el navegador:
- http://localhost:8000/health

Deberías ver:
```json
{
  "status": "ok",
  "message": "API is running"
}
```

---

## 🔧 Configuración Avanzada

### Cambiar Puerto

Editar `backend/run.py`:
```python
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)
```

O usar variable de entorno:
```bash
export PORT=8001
python run.py
```

### Configurar CORS

El backend está configurado para permitir todos los orígenes en desarrollo. Para producción, edita `app/__init__.py`:

```python
CORS(app, 
     origins=["https://yourdomain.com"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
     allow_headers=["Content-Type", "Authorization", "X-Requested-With"],
     supports_credentials=True,
     max_age=3600)
```

### Configurar Logging

El backend usa `print()` para logging en desarrollo. Para producción, considera usar el módulo `logging` de Python:

```python
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
```

---

## 🧪 Testing

### Probar Endpoints Manualmente

**Health Check:**
```bash
curl http://localhost:8000/health
```

**Listar Usuarios:**
```bash
curl http://localhost:8000/users
```

**Listar Cursos:**
```bash
curl http://localhost:8000/courses
```

**Listar Assignments:**
```bash
curl http://localhost:8000/assignments
```

### Probar con Postman

1. Importar colección de Postman (si está disponible)
2. Configurar variables de entorno:
   - `base_url`: `http://localhost:8000`
   - `token`: (opcional, para autenticación futura)
3. Ejecutar requests

---

## 🚨 Solución de Problemas

### Error: "Firebase Admin SDK not initialized"

**Solución:**
1. Verifica que el archivo `firebase-service-account.json` existe
2. Verifica que el path en `.env` es correcto
3. Verifica que el archivo JSON es válido

### Error: "ModuleNotFoundError: No module named 'flask'"

**Solución:**
```bash
pip install -r requirements.txt
```

### Error: "Port already in use"

**Solución:**
1. Cambiar puerto en `run.py`
2. O matar el proceso que está usando el puerto:
   ```bash
   # Windows
   netstat -ano | findstr :8000
   taskkill /PID <pid> /F
   
   # Linux/Mac
   lsof -ti:8000 | xargs kill
   ```

### Error: "CORS blocked"

**Solución:**
1. Verifica que el backend esté corriendo
2. Verifica que `FRONTEND_URL` en `.env` sea correcto
3. Verifica que los headers CORS estén configurados correctamente

### Error: "Firestore permission denied"

**Solución:**
1. Verifica que el Service Account tenga permisos en Firestore
2. Verifica las reglas de seguridad de Firestore
3. Verifica que el proyecto de Firebase sea correcto

---

## 📝 Variables de Entorno

### Variables Disponibles

| Variable | Descripción | Valor por Defecto |
|----------|-------------|-------------------|
| `FRONTEND_URL` | URL del frontend para CORS | `http://localhost:5173` |
| `FIREBASE_CREDENTIALS_PATH` | Path al archivo de credenciales | `firebase-service-account.json` |
| `PORT` | Puerto del servidor | `8000` |

### Archivo `.env`

Crear `backend/.env`:
```env
FRONTEND_URL=http://localhost:3000
FIREBASE_CREDENTIALS_PATH=firebase-service-account.json
```

---

## 🔄 Desarrollo

### Hot Reload

El servidor de desarrollo de Flask tiene hot reload habilitado por defecto (`debug=True`). Los cambios en el código se reflejarán automáticamente.

### Estructura de Desarrollo

```
backend/
├── app/
│   ├── __init__.py          # App factory
│   ├── config.py            # Configuración
│   ├── firebase.py          # Firebase setup
│   ├── api/                 # Endpoints
│   ├── services/            # Business logic
│   └── repositories/        # Data access
├── run.py                   # Dev server
└── requirements.txt         # Dependencias
```

### Agregar Nuevo Endpoint

1. **Crear Repository** (si es necesario):
   ```python
   # app/repositories/new_repository.py
   class NewRepository:
       def list(self):
           # ...
   ```

2. **Crear Service**:
   ```python
   # app/services/new_service.py
   class NewService:
       def __init__(self):
           self._repository = NewRepository()
       
       def list_items(self):
           return self._repository.list()
   ```

3. **Crear Blueprint**:
   ```python
   # app/api/new.py
   new_bp = Blueprint("new", __name__)
   
   @new_bp.get("/")
   def list_items():
       service = NewService()
       items = service.list_items()
       return jsonify(items), 200
   ```

4. **Registrar Blueprint**:
   ```python
   # app/__init__.py
   from app.api.new import new_bp
   app.register_blueprint(new_bp, url_prefix="/new")
   ```

---

## 🚀 Producción

### Build para Producción

**Nota:** Flask no requiere un build paso como Node.js. Simplemente ejecuta el servidor.

### Usar WSGI Server

Para producción, usa un servidor WSGI como Gunicorn:

```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:8000 "app:create_app()"
```

### Variables de Entorno en Producción

Asegúrate de configurar las variables de entorno en tu servidor de producción:

```env
FRONTEND_URL=https://yourdomain.com
FIREBASE_CREDENTIALS_PATH=/path/to/firebase-service-account.json
NODE_ENV=production
```

### Configurar CORS para Producción

Edita `app/__init__.py` para permitir solo tu dominio:

```python
CORS(app, 
     origins=["https://yourdomain.com"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
     allow_headers=["Content-Type", "Authorization", "X-Requested-With"],
     supports_credentials=True,
     max_age=3600)
```

---

## 📚 Recursos Adicionales

- [BACKEND_ARCHITECTURE.md](./BACKEND_ARCHITECTURE.md) - Arquitectura del backend
- [BACKEND_API.md](./BACKEND_API.md) - Documentación de la API
- [backend/README.md](./backend/README.md) - README del backend
- [Flask Documentation](https://flask.palletsprojects.com/)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)

---

## ✅ Checklist de Configuración

- [ ] Python 3.13+ instalado
- [ ] Entorno virtual creado y activado
- [ ] Dependencias instaladas (`pip install -r requirements.txt`)
- [ ] Archivo `.env` creado en `backend/`
- [ ] `firebase-service-account.json` descargado y guardado
- [ ] Firebase Admin SDK inicializado correctamente
- [ ] Servidor corriendo en `http://localhost:8000`
- [ ] Health check responde correctamente
- [ ] Endpoints funcionan correctamente
- [ ] CORS configurado correctamente

---

## 🆘 Soporte

Si encuentras problemas:

1. Revisa los logs del servidor
2. Verifica las variables de entorno
3. Verifica la configuración de Firebase
4. Verifica que Firestore tenga los datos necesarios
5. Revisa la documentación de Flask y Firebase Admin SDK

