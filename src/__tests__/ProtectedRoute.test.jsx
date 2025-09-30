import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "../components/ProtectedRoute.jsx";
import { AuthProvider } from "../context/AuthContext.jsx";

function PrivateContent() {
  return <div>Privado OK</div>;
}
function LoginPage() {
  return <div>LOGIN PAGE</div>;
}

// Helper para limpar storage antes de cada cenário
function renderWithAuth(ui, { initialEntries = ["/"] } = {}) {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={initialEntries}>{ui}</MemoryRouter>
    </AuthProvider>
  );
}

describe("ProtectedRoute", () => {
  it("redireciona para /login se não autenticado", () => {
    localStorage.removeItem("app_auth_v1");
    renderWithAuth(
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <PrivateContent />
            </ProtectedRoute>
          }
        />
      </Routes>
    );
    expect(screen.getByText("LOGIN PAGE")).toBeInTheDocument();
  });

  it("renderiza conteúdo privado se autenticado", async () => {
    localStorage.setItem(
      "app_auth_v1",
      JSON.stringify({
        token: "tk_mock_valid",
        user: { id: "1", name: "Test", email: "t@test.com" },
        expiresAt: Date.now() + 5 * 60 * 1000,
      })
    );
    renderWithAuth(
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <PrivateContent />
            </ProtectedRoute>
          }
        />
      </Routes>
    );
    expect(await screen.findByText("Privado OK")).toBeInTheDocument();
  });
});
