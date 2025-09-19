import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { TeacherDashboard as View } from "../components/teacher/TeacherDashboard";

export default function TeacherDashboardRoute() {
  const { user } = useAuth();
  return <View user={user} />;
}
