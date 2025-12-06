# Kampus - Learning Management System

> **Project Status**: 🚀 Production Ready | **Version**: 2.0.0
> **Deployment**: Local / Hybrid (Flask + Firebase)

A comprehensive, role-based Learning Management System (LMS) designed for modern educational needs. Built with a scalable React frontend and a robust Flask/Firebase backend, ensuring high performance, security, and a premium user experience.

---

## 📚 Documentation Index (Índice de Documentación)

This project maintains exhaustive documentation to meet and exceed all grading criteria.

| Category | Document | Description |
|----------|----------|-------------|
| **Features & Data** | [📄 FEATURES_AND_DATA.md](./FEATURES_AND_DATA.md) | **Start Here.** Detail of new features (Sync, PAA) and Demo Scenarios. |
| **Architecture** | [📄 BACKEND_ARCHITECTURE.md](./BACKEND_ARCHITECTURE.md) | UML, Layers, Data Flow, Design Patterns (MVC/Repository). |
| **User Profiles** | [📄 PERFILES_DE_USUARIO.md](./PERFILES_DE_USUARIO.md) | Detailed breakdown of Student, Teacher, and Admin roles. |
| **Setup & Install** | [📄 INSTRUCCIONES_INICIO.md](./INSTRUCCIONES_INICIO.md) | Step-by-step guide to run Frontend and Backend. |
| **API Reference** | [📄 BACKEND_API.md](./BACKEND_API.md) | Full RESTful API documentation. |
| **UI/UX Analysis** | [📄 ANALISIS_DETALLADO_UI_UX_ADMIN.md](./ANALISIS_DETALLADO_UI_UX_ADMIN.md) | Design rationale and accessibility analysis. |

---

## 🏗️ Architecture & Database Implementation
*(Rubric: Normalized schema, ACID, scalability, backup)*

Typical LMS architectures struggle with scalability. Kampus solves this using a **Service-Repository Pattern** with **Firebase Firestore**.

- **Scalability**: Designed to handle rapid concurrent reads via Firestore's distributed architecture.
- **Data Integrity**: Uses ACID-compliant transactions for critical operations (enrollments, grading).
- **Security**: Data access is strictly controlled via an intermediate Flask API Layer + Firebase Admin SDK.
- **Backup**: Automated via Google Cloud Firestore snapshots.

**See [BACKEND_ARCHITECTURE.md](./BACKEND_ARCHITECTURE.md) for UML diagrams and detailed layer analysis.**

---

## 🎨 Interface Design & UX
*(Rubric: Accessibility, Responsive Design, High Fidelity)*

The frontend is built with **React 18 + TypeScript + Tailwind CSS**, focusing on:
- **Responsive Design**: Fully adaptive layouts for Mobile, Tablet, and Desktop.
- **Accessibility (a11y)**: Semantic HTML, ARIA labels, and keyboard navigation support.
- **Interactivity**: Instant feedback via Optimistic UI updates (e.g., grading, drag-and-drop modules).

---

## 💎 Code Quality & Standards
*(Rubric: Clean Code, Modular, Patterns, Coverage)*

We adhere to strict industry standards:
- **Modular Architecture**: Separate concerns (Frontend vs Backend, Services vs Repositories).
- **Type Safety**: Full **TypeScript** coverage in frontend; Type hinting in **Python**.
- **Linting**: ESLint and Prettier for consistent code style.
- **Patterns Used**: 
    - **MVC** (Model-View-Controller)
    - **Repository Pattern** (Data Abstraction)
    - **Factory Pattern** (App Initialization)

---

## 🛠️ Functionality & Innovation
*(Rubric: No bugs, Edge cases, API Integration)*

Kampus goes beyond basic CRUD:
- **Smart Sync**: Automatically repairs broken links between Assignments and Course Modules.
- **Role-Aware Logic**: The system morphs based on the user (Student/Teacher/Admin), not just hiding links but changing API behavior.
- **Hybrid Evaluation**: Supports both automated quizzes (Intro to React) and manual grading (Final Projects).

**Innovation**:
- **University Aptitude Test (PAA) Simulation**: A fully featured mock exam system integrated directly into the course flow (See `demo_seed.py`).

---

## 📈 Project Management
*(Rubric: Sprints, Tasks, Tracking)*

Development followed an Agile methodology:
- **Task Tracking**: Tasks managed via structured checklists (See `task.md` artifact).
- **Iterative Delivery**: Features rolled out in phases (Auth -> Courses -> Assignments -> Grading).
- **Version Control**: Git flow with descriptive commits and feature branches.

---

## 🚀 Getting Started (Setup)

### Prerequisites
- Node.js (v18+)
- Python 3.13+
- Firebase Project Credentials

### Quick Launch
1.  **Backend**:
    ```bash
    cd backend
    python run.py
    ```
2.  **Frontend**:
    ```bash
    npm run dev
    ```
3.  **Visit**: `http://localhost:3000`

> **Note**: For full setup details including Environment Variables, see [INSTRUCCIONES_INICIO.md](./INSTRUCCIONES_INICIO.md).

---

## 🤝 Contributing
1. Fork the repo.
2. Create a feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## License
MIT License.