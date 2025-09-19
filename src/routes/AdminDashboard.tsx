import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { AdminDashboard as View } from "../components/admin/AdminDashboard";

export default function AdminDashboardRoute() {
  const { user } = useAuth();
  return <View user={user} />;
}
