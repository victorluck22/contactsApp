import React from "react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import { renderWithProviders } from "./test-utils.jsx";
import LoginPage from "../pages/auth/Login.jsx";
import * as authServiceMod from "../services/authService.js";

describe("LoginPage", () => {
  beforeEach(() => {
    // limpa localStorage para isolar
    localStorage.clear();
  });

  it("realiza login com credenciais válidas", async () => {
    vi.spyOn(authServiceMod.authService, "login").mockResolvedValueOnce({
      user: { id: "u1", name: "User", email: "test@example.com" },
      token: "token123",
    });

    renderWithProviders(<LoginPage />);
    fireEvent.change(screen.getByLabelText(/e-mail/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/senha/i), {
      target: { value: "1234" },
    });
    fireEvent.click(screen.getByRole("button", { name: /entrar/i }));

    await waitFor(() => {
      // após login, AuthContext authenticated true -> Navigate para '/'; difícil assert direto sem rota
      // validamos pelo side-effect: token no localStorage
      const persisted = localStorage.getItem("app_auth_v1");
      expect(persisted).toContain("token123");
    });
  });

  it("mostra erro em credenciais inválidas", async () => {
    vi.spyOn(authServiceMod.authService, "login").mockRejectedValueOnce({
      response: { data: { message: "Credenciais inválidas" } },
      message: "Credenciais inválidas",
    });
    renderWithProviders(<LoginPage />);
    fireEvent.change(screen.getByLabelText(/e-mail/i), {
      target: { value: "bad@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/senha/i), {
      target: { value: "wrong" },
    });
    fireEvent.click(screen.getByRole("button", { name: /entrar/i }));
    await waitFor(() => {
      expect(screen.getByText(/credenciais inválidas/i)).toBeInTheDocument();
    });
  });
});
