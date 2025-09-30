import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import { renderWithProviders } from "./test-utils.jsx";
import RegisterPage from "../pages/auth/Register.jsx";
import * as authServiceMod from "../services/authService.js";

/**
 * Objetivos do teste:
 * 1. Garantir que ao registrar e o backend retornar success, a mensagem é exibida e o botão é desabilitado.
 * 2. Garantir que NÃO há persistência de token/user no localStorage (não autentica automaticamente).
 * 3. Validar mensagem de erro quando senhas não coincidem.
 */

describe("RegisterPage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("exibe mensagem de sucesso e não autentica", async () => {
    vi.spyOn(authServiceMod.authService, "register").mockResolvedValueOnce({
      success: true,
      message: "Cadastro realizado. Verifique seu e-mail para ativar a conta.",
    });

    renderWithProviders(<RegisterPage />);

    fireEvent.change(screen.getByLabelText(/nome/i), {
      target: { value: "Usuário" },
    });
    fireEvent.change(screen.getByLabelText(/e-mail/i), {
      target: { value: "user@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/^senha$/i), {
      target: { value: "abcd" },
    });
    fireEvent.change(screen.getByLabelText(/confirmar senha/i), {
      target: { value: "abcd" },
    });

    fireEvent.click(screen.getByRole("button", { name: /cadastrar/i }));

    await waitFor(() => {
      expect(screen.getByText(/verifique seu e-mail/i)).toBeInTheDocument();
    });

    // Botão deve ficar desabilitado (aguardando verificação)
    expect(
      screen.getByRole("button", { name: /aguardando verificação/i })
    ).toBeDisabled();

    // Não deve haver token no localStorage (não autenticou)
    const persisted = localStorage.getItem("app_auth_v1");
    expect(persisted).toBeNull();
  });

  it("mostra erro se senhas não conferem", async () => {
    renderWithProviders(<RegisterPage />);

    fireEvent.change(screen.getByLabelText(/nome/i), {
      target: { value: "Usuário" },
    });
    fireEvent.change(screen.getByLabelText(/e-mail/i), {
      target: { value: "user@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/^senha$/i), {
      target: { value: "abcd" },
    });
    fireEvent.change(screen.getByLabelText(/confirmar senha/i), {
      target: { value: "abce" },
    });

    fireEvent.click(screen.getByRole("button", { name: /cadastrar/i }));
    // Mensagem é setada sincronicamente via throw Error antes de requisição
    expect(await screen.findByText(/senhas não conferem/i)).toBeInTheDocument();
  });
});
