import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export type Role = "student" | "teacher" | "admin";

type Props = {
  allow: Role[]; // roles permitidos para la/s ruta/s hijas
};

export default function ProtectedRoute({ allow }: Props) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div>Loading…</div>; // o tu spinner
  }

  if (!user) {
    // no logueado → envía a /auth y recuerda de dónde venía
    return <Navigate to="/auth" replace state={{ from: location }} />;
  }

  // asumimos que user.role es "student" | "teacher" | "admin"
  const canPass = allow.includes(user.role as Role);
  return canPass ? <Outlet /> : <Navigate to="/" replace />;
}
