// src/App.tsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import { Home } from "./components/Home";
import ProtectedRoute from "./routes/ProtectedRoute";
import AuthPageContainer from "./routes/AuthPageContainer";
import StudentDashboard from "./routes/StudentDashboard";   // wrapper que inyecta user
import TeacherDashboard from "./routes/TeacherDashboard";   // wrapper que inyecta user
import AdminDashboard from "./routes/AdminDashboard";       // wrapper que inyecta user
import DashboardRedirect from "./routes/DashboardRedirect";

export default function App() {
  return (
    <Routes>
      {/* públicas */}
      <Route path="/" element={<Home />} />
      <Route path="/auth" element={<AuthPageContainer />} />

      {/* /dashboard -> /dashboard/<rol> (según user.role) */}
      <Route path="/dashboard" element={<DashboardRedirect />} />

      {/* protegidas por rol */}
      <Route element={<ProtectedRoute allow={["student"]} />}>
        <Route path="/dashboard/student" element={<StudentDashboard />} />
      </Route>

      <Route element={<ProtectedRoute allow={["teacher"]} />}>
        <Route path="/dashboard/teacher" element={<TeacherDashboard />} />
      </Route>

      <Route element={<ProtectedRoute allow={["admin"]} />}>
        <Route path="/dashboard/admin" element={<AdminDashboard />} />
      </Route>

      {/* catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
