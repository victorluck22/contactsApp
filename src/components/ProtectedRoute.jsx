import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export function ProtectedRoute({ children }) {
  const { authenticated, loading, expiresAt } = useAuth();
  const location = useLocation();

  if (loading) return <div className="p-4 text-sm">Verificando sessão...</div>;
  const expired = expiresAt && expiresAt < Date.now();
  if (!authenticated || expired) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location.pathname,
          reason: expired ? "expired" : "unauthorized",
        }}
      />
    );
  }
  return children;
}
