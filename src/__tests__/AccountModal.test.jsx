import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import { renderWithProviders } from "./test-utils.jsx";
import App from "../App.jsx";
import * as authServiceMod from "../services/authService.js";

// Testa fluxo de atualização de nome do usuário via AccountModal

describe("AccountModal - update profile", () => {
  beforeEach(() => {
    localStorage.clear();
    // Mock login
    vi.spyOn(authServiceMod.authService, "login").mockResolvedValue({
      user: { id: "u1", name: "User", email: "user@example.com" },
      token: "tk_1",
      expiresAt: Date.now() + 60_000,
    });
    vi.spyOn(authServiceMod.authService, "verifyToken").mockResolvedValue({
      valid: true,
    });
    vi.spyOn(authServiceMod.authService, "updateProfile").mockImplementation(
      async (partial) => {
        return {
          success: true,
          user: { id: "u1", name: partial.name, email: "user@example.com" },
        };
      }
    );
  });

  it("altera o nome e persiste no contexto/storage", async () => {
    renderWithProviders(<App />, { route: "/login" });
    fireEvent.change(screen.getByLabelText(/e-mail/i), {
      target: { value: "user@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/senha/i), {
      target: { value: "1234" },
    });
    fireEvent.click(screen.getByRole("button", { name: /entrar/i }));

    // Aguarda navegar para área autenticada
    await screen.findByText(/contatos/i);

    // Abrir dropdown de usuário (botão com ícone User) — identificar pelo ícone + nome
    const userMenuBtn = screen
      .getAllByRole("button")
      .find((b) => /user/i.test(b.textContent || "")); // contém nome 'User'
    expect(userMenuBtn).toBeTruthy();
    fireEvent.click(userMenuBtn);

    // Clicar em "Minha Conta" no menu
    const minhaConta = await screen.findByRole("menuitem", {
      name: /minha conta/i,
    });
    fireEvent.click(minhaConta);

    // Agora modal aberto, encontrar botão Editar
    const editBtn = await screen.findByRole("button", { name: /editar/i });
    fireEvent.click(editBtn);

    const nomeInput = await screen.findByDisplayValue("User");
    fireEvent.change(nomeInput, { target: { value: "User Alterado" } });

    fireEvent.click(screen.getByRole("button", { name: /salvar/i }));

    // Modal fecha e novo nome deve aparecer em algum lugar (trigger ou perfil futuramente)
    await screen.findAllByText(/user alterado/i);

    // Verifica que updateProfile foi chamado
    expect(authServiceMod.authService.updateProfile).toHaveBeenCalledWith({
      name: "User Alterado",
    });

    // Verifica persistência no localStorage
    const raw = localStorage.getItem("app_auth_v1");
    expect(raw).toBeTruthy();
    const parsed = JSON.parse(raw);
    expect(parsed.user.name).toBe("User Alterado");
  });
});
