# Kampus - Learning Management System

A comprehensive Learning Management System built with React, TypeScript, and Firebase. This project provides role-based access for students, teachers, and administrators with a modern, responsive interface.

## Features

### Authentication
- ✅ Email/Password authentication
- ✅ Google OAuth integration
- ✅ Forgot password functionality
- ✅ Form validation with Zod + React Hook Form
- ✅ Role-based authentication (Student, Teacher, Admin)

### Pages
- ✅ Home page with feature showcase
- ✅ Login page with role selection
- ✅ Register page with form validation
- ✅ Forgot password page
- ✅ Role-based dashboards

### User Roles
- **Students**: Access courses, track progress, submit assignments
- **Teachers**: Create courses, manage students, track performance
- **Administrators**: Oversee platform, manage users, system analytics

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- Firebase project

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd kampus
```

2. Install dependencies:
```bash
npm install
```

3. Set up Firebase:
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication (Email/Password and Google)
   - Enable Firestore Database
   - Create a `.env` file in the root directory with your Firebase config:

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:5173](http://localhost:5173) in your browser

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **UI Components**: Radix UI, Lucide React Icons
- **Authentication**: Firebase Auth
- **Database**: Firestore
- **Form Handling**: React Hook Form + Zod validation
- **Routing**: React Router v7
- **Build Tool**: Vite

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── auth/           # Authentication components
│   ├── admin/          # Admin-specific components
│   ├── teacher/        # Teacher-specific components
│   ├── student/        # Student-specific components
│   └── ui/             # Base UI components
├── contexts/           # React contexts (Auth)
├── lib/                # Utilities and configurations
├── routes/             # Route components
├── services/           # API and Firebase services
└── styles/             # Global styles
```

## Authentication Flow

1. **Home Page** (`/`) - Landing page with feature showcase
2. **Auth Page** (`/auth`) - Login/Register/Forgot Password
3. **Dashboard** (`/dashboard`) - Role-based dashboard redirect

### Role-based Redirects
- Students → Student Dashboard
- Teachers → Teacher Dashboard  
- Administrators → Admin Dashboard

## Firebase Setup

### Authentication
1. Go to Firebase Console → Authentication
2. Enable Email/Password provider
3. Enable Google provider
4. Add your domain to authorized domains

### Firestore
1. Go to Firebase Console → Firestore Database
2. Create database in production mode
3. Set up security rules (example provided in `firestore.rules`)

### Security Rules Example
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Code Style
- TypeScript for type safety
- ESLint for code linting
- Prettier for code formatting
- Tailwind CSS for styling

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.