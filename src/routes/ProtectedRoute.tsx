import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import type { Role } from "@/lib/types";

export default function ProtectedRoute({
  children,
  allow,
}: { children: JSX.Element; allow?: Role[] }) {
  const { user, role, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/auth/login" replace />;
  if (allow && role && !allow.includes(role)) return <Navigate to="/" replace />;
  return children;
}
