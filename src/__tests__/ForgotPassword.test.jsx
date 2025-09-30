import React from "react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import { renderWithProviders } from "./test-utils.jsx";
import ForgotPasswordPage from "../pages/auth/ForgotPassword.jsx";
import * as authServiceMod from "../services/authService.js";

describe("ForgotPasswordPage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("envia reset e mostra confirmação", async () => {
    vi.spyOn(
      authServiceMod.authService,
      "requestPasswordReset"
    ).mockResolvedValueOnce({ ok: true });
    renderWithProviders(<ForgotPasswordPage />);
    fireEvent.change(screen.getByLabelText(/e-mail/i), {
      target: { value: "user@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /enviar link/i }));
    await waitFor(() => {
      expect(screen.getByText(/foi enviado/i)).toBeInTheDocument();
    });
  });
});
