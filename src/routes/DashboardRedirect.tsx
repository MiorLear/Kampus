// src/routes/DashboardRedirect.tsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

type Role = "student" | "teacher" | "admin";

export default function DashboardRedirect() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    // Puedes poner un spinner bonito aquí
    return <div style={{ padding: 24 }}>Loading…</div>;
  }

  if (!user) {
    // sin sesión → a /auth
    return <Navigate to="/auth" replace state={{ from: location }} />;
  }

  const finalRole: Role = user.role;
  return <Navigate to={`/dashboard/${finalRole}`} replace />;
}
