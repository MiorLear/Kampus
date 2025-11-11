# Kampus Backend (Flask + Firebase)

This directory contains the new Flask-based backend for the Kampus platform. It exposes REST endpoints at the root level (`/`) and uses Firebase Firestore as the data store.

## 🚀 Quick Start

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python run.py
```

The server runs on `http://localhost:8000` by default. CORS is enabled for the frontend URL specified in the `.env` file.

## 📦 Environment Variables

Create a `.env` file inside `backend/` with:

```env
FRONTEND_URL=http://localhost:5173
FIREBASE_CREDENTIALS_PATH=../firebase-service-account.json
```

> Place your Firebase service account JSON at the path referenced above.

## 📁 Project Structure

```
backend/
├── app/
│   ├── __init__.py        # Flask app factory
│   ├── config.py          # App configuration
│   ├── firebase.py        # Firebase initialization helpers
│   ├── api/               # Blueprints (Flask routers)
│   │   ├── courses.py
│   │   ├── modules.py
│   │   ├── enrollments.py
│   │   └── progress.py
│   ├── services/          # Business logic
│   └── repositories/      # Data access layer (Firestore)
├── run.py                 # Development entrypoint
└── requirements.txt       # Python dependencies
```

## 🔌 Available Endpoints (v0)

- `GET /` – API index with available endpoints
- `GET /courses` – List all courses (optional `?teacher_id=` filter)
- `GET /modules/courses/<course_id>/modules` – List modules for a course
- `GET /enrollments?student_id=<uid>` – Enrollments for a student
- `POST /enrollments` – Create enrollment (expects `student_id`, `course_id`)
- `POST /progress/access` – Guardar acceso a módulo
- `POST /progress` – Guardar progreso parcial
- `POST /progress/complete` – Marcar módulo como completado
- `GET /progress/module/<user_id>/<course_id>/<module_id>` – Progreso de módulo
- `GET /progress/course/<user_id>/<course_id>` – Progreso por módulo del curso
- `GET /progress/course/<user_id>/<course_id>/summary` – Resumen del curso

## 🧪 Testing sample requests

```bash
# API index
curl http://localhost:8000/

# Courses
curl http://localhost:8000/courses
curl "http://localhost:8000/courses?teacher_id=some_uid"

# Modules
curl "http://localhost:8000/modules/courses/COURSE_ID/modules"

# Enrollments
curl "http://localhost:8000/enrollments?student_id=USER_ID"

curl -X POST http://localhost:8000/enrollments \
  -H "Content-Type: application/json" \
  -d '{"student_id": "USER_ID", "course_id": "COURSE_ID"}'
```

Adjust payloads to match your Firestore documents. Authentication middleware will be added in the next phase.

## ✅ Next Steps

- Port additional endpoints (enrollments, progress, etc.)
- Add authentication middleware to verify Firebase tokens
- Write unit tests (pytest)
- Containerize with Docker (optional)
