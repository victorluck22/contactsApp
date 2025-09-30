import React from "react";
import { MemoryRouter } from "react-router-dom";
import { AuthProvider } from "../context/AuthContext.jsx";
import { ContactsProvider } from "../context/ContactsContext.jsx";
import { UiProvider } from "../context/UiContext.jsx";
import { ThemeProvider } from "../context/ThemeContext.jsx";
import { ToastProvider } from "../context/ToastContext.jsx";
import { render } from "@testing-library/react";

export function renderWithProviders(
  ui,
  { route = "/", routerEntries = [route] } = {}
) {
  return render(
    <ThemeProvider>
      <AuthProvider>
        <ContactsProvider>
          <UiProvider>
            <ToastProvider>
              <MemoryRouter
                initialEntries={routerEntries}
                future={{
                  v7_startTransition: true,
                  v7_relativeSplatPath: true,
                }}
              >
                {ui}
              </MemoryRouter>
            </ToastProvider>
          </UiProvider>
        </ContactsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
