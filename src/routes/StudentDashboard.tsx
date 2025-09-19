import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { StudentDashboard as View } from "../components/student/StudentDashboard";

export default function StudentDashboardRoute() {
  const { user } = useAuth();           // <- del contexto
  return <View user={user} />;          // <- se lo pasas al componente real
}
