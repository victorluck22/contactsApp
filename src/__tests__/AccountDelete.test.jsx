import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import { renderWithProviders } from "./test-utils.jsx";
import App from "../App.jsx";
import * as authServiceMod from "../services/authService.js";

// Testa fluxo de exclusão de conta com toast e redirect

describe("AccountModal - delete account", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.spyOn(authServiceMod.authService, "login").mockResolvedValue({
      user: { id: "u1", name: "User", email: "user@example.com" },
      token: "tk_1",
      expiresAt: Date.now() + 60_000,
    });
    vi.spyOn(authServiceMod.authService, "verifyToken").mockResolvedValue({
      valid: true,
    });
    vi.spyOn(authServiceMod.authService, "deleteAccount").mockResolvedValue(
      true
    );
  });

  it("exclui a conta e redireciona mostrando toast", async () => {
    renderWithProviders(<App />, { route: "/login" });
    fireEvent.change(screen.getByLabelText(/e-mail/i), {
      target: { value: "user@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/senha/i), {
      target: { value: "1234" },
    });
    fireEvent.click(screen.getByRole("button", { name: /entrar/i }));

    await screen.findByText(/contatos/i);

    // Abrir menu usuário
    const userMenuBtn = screen
      .getAllByRole("button")
      .find((b) => /user/i.test(b.textContent || ""));
    expect(userMenuBtn).toBeTruthy();
    fireEvent.click(userMenuBtn);

    // Abrir modal Minha Conta
    const minhaConta = await screen.findByRole("menuitem", {
      name: /minha conta/i,
    });
    fireEvent.click(minhaConta);

    // Preencher senha de confirmação
    const passInput = await screen.findByLabelText(/confirmar senha/i);
    fireEvent.change(passInput, { target: { value: "1234" } });

    // Enviar exclusão
    const excluirBtn = screen.getByRole("button", {
      name: /excluir definitivamente/i,
    });
    fireEvent.click(excluirBtn);

    // Redireciona para login (campo de email presente novamente) e toast aparece
    await screen.findByRole("textbox", { name: /e-mail/i });
    await screen.findByText(/conta excluída/i);
    await screen.findByText(/crie uma nova conta/i);
  });
});
