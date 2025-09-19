import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./contexts/AuthContext";
import { logFirebaseStatus } from "./lib/firebase-debug";
import "./index.css";

// Debug Firebase configuration in development
if (import.meta.env.DEV) {
  logFirebaseStatus();
}

function Fallback() {
  return <div style={{ padding: 16 }}>Cargando…</div>;
}

const rootEl = document.getElementById("root");
if (!rootEl) throw new Error("No se encontró el elemento #root");

ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<Fallback />}>
          <App />
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
