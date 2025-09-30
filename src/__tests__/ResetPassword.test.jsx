import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import { renderWithProviders } from "./test-utils.jsx";
import ResetPasswordPage from "../pages/auth/ResetPassword.jsx";
import * as authServiceMod from "../services/authService.js";

describe("ResetPasswordPage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("valida token/email ausentes", () => {
    renderWithProviders(<ResetPasswordPage />, {
      route: "/reset-password",
    });
    expect(
      screen.getByText(/link inválido ou incompleto/i)
    ).toBeInTheDocument();
  });

  it("redefine a senha com sucesso", async () => {
    vi.spyOn(
      authServiceMod.authService,
      "resetPasswordTokenEmail"
    ).mockResolvedValueOnce(true);
    renderWithProviders(<ResetPasswordPage />, {
      route: "/reset-password?token=t123&email=user%40example.com",
    });
    fireEvent.change(screen.getByLabelText(/nova senha/i), {
      target: { value: "abcdef" },
    });
    fireEvent.change(screen.getByLabelText(/confirmar senha/i), {
      target: { value: "abcdef" },
    });
    fireEvent.click(screen.getByRole("button", { name: /redefinir/i }));
    await waitFor(() => {
      expect(
        screen.getByText(/senha alterada com sucesso/i)
      ).toBeInTheDocument();
    });
  });

  it("mostra erro quando senhas não conferem", async () => {
    renderWithProviders(<ResetPasswordPage />, {
      route: "/reset-password?token=t123&email=user%40example.com",
    });
    fireEvent.change(screen.getByLabelText(/nova senha/i), {
      target: { value: "abcdef" },
    });
    fireEvent.change(screen.getByLabelText(/confirmar senha/i), {
      target: { value: "abcdeg" },
    });
    fireEvent.click(screen.getByRole("button", { name: /redefinir/i }));
    await waitFor(() => {
      expect(screen.getByText(/senhas não conferem/i)).toBeInTheDocument();
    });
  });
});
