import React from "react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";

export default function LogoutButton() {
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
    >
      Cerrar sesión
    </button>
  );
}
