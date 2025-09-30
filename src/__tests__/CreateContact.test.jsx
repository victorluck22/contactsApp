import React from "react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import { renderWithProviders } from "./test-utils.jsx";
import App from "../App.jsx";
import * as authServiceMod from "../services/authService.js";
import * as addressServiceMod from "../services/addressService.js";
import * as contactsServiceMod from "../services/contactsService.js";

// Helper para autenticar antes do teste (mock login auto)
function authSetup() {
  vi.spyOn(authServiceMod.authService, "login").mockResolvedValue({
    user: { id: "u1", name: "User", email: "user@example.com" },
    token: "token123",
    expiresAt: Date.now() + 5 * 60 * 1000, // garante não expirar durante o teste
  });
}

describe("Criação de contato", () => {
  beforeEach(() => {
    localStorage.clear();
    authSetup();
    // Mock list para garantir timing previsível (retorna vazio => fallback sample será usado)
    vi.spyOn(contactsServiceMod.contactsService, "list").mockResolvedValue([]);
    vi.spyOn(contactsServiceMod.contactsService, "create").mockImplementation(
      async (c) => ({
        id: "c_mock_1",
        name: c.name,
        cpf: c.cpf,
        phone: c.phone,
        email: c.email,
        zip_code: c.zipCode,
        state: c.state,
        city: c.locality,
        address: c.address,
        number: c.number,
        complement: c.complement,
        latitude_real: Math.round((c.lat ?? -23.55052) * 1_000_000),
        longitude_real: Math.round((c.lng ?? -46.633308) * 1_000_000),
      })
    );
    // Mock das sugestões para estabilidade
    vi.spyOn(addressServiceMod.addressService, "suggest").mockResolvedValue([
      {
        address: "Praça da Sé",
        locality: "São Paulo",
        state: "SP",
        zipCode: "01001000",
        lat: -23.55052,
        lng: -46.633308,
      },
    ]);
    vi.spyOn(addressServiceMod.addressService, "fetchCep").mockResolvedValue({
      zipCode: "01001000",
      address: "Praça da Sé",
      locality: "São Paulo",
      state: "SP",
      lat: -23.55052,
      lng: -46.633308,
    });
  });

  it("cria novo contato e aparece na lista (sidebar)", async () => {
    // Começa na rota /login e faz login
    renderWithProviders(<App />, { route: "/login" });
    fireEvent.change(screen.getByLabelText(/e-mail/i), {
      target: { value: "user@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/senha/i), {
      target: { value: "1234" },
    });
    fireEvent.click(screen.getByRole("button", { name: /entrar/i }));

    // Aguarda confirmação de que área autenticada carregou (título 'Contatos')
    await screen.findByText(/contatos/i);

    // Abrir modal de novo contato via atalho do Navbar (botão "Novo" - supõe label)
    const novoBtn = screen
      .getAllByRole("button")
      .find((b) => /novo/i.test(b.textContent || ""));
    expect(novoBtn).toBeTruthy();
    fireEvent.click(novoBtn);

    // Preencher formulário mínimo (sem logradouro manual; será definido via sugestão para garantir lat/lng)
    fireEvent.change(screen.getByLabelText(/nome/i), {
      target: { value: "Contato Teste" },
    });
    fireEvent.change(screen.getByLabelText(/cpf/i), {
      target: { value: "11144477735" },
    });
    fireEvent.change(screen.getByLabelText(/telefone/i), {
      target: { value: "(11)90000-0000" },
    });
    fireEvent.change(screen.getByLabelText(/^e-mail$/i), {
      target: { value: "ct@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/cep/i), {
      target: { value: "01001000" },
    });
    fireEvent.change(screen.getByLabelText(/cidade/i), {
      target: { value: "São Paulo" },
    });
    fireEvent.change(screen.getByLabelText(/uf/i), { target: { value: "SP" } });
    fireEvent.change(screen.getByLabelText(/bairro/i), {
      target: { value: "Sé" },
    });

    // Preencher logradouro diretamente (remove dependência de sugestão assíncrona)
    const addressInput = screen.getAllByLabelText(/^logradouro$/i)[0];
    fireEvent.change(addressInput, { target: { value: "Praça da Sé" } });

    // Preencher número (restante obrigatório)
    fireEvent.change(screen.getByLabelText(/número/i), {
      target: { value: "10" },
    });

    const salvar = screen
      .getAllByRole("button")
      .find((b) => /salvar/i.test(b.textContent || ""));
    expect(salvar).toBeTruthy();
    fireEvent.click(salvar);

    // Após salvar modal fecha; aguarda título e em seguida o novo contato na sidebar.
    await screen.findByText(/contatos/i);
    // Usa utilitário de queries assíncronos nativo (timeout default ~1000ms; ajustamos via options se necessário)
    const found = await screen.findAllByText(
      /contato teste/i,
      {},
      { timeout: 3000 }
    );
    // Garante que pelo menos um dos elementos com o texto está dentro da sidebar (aside)
    expect(found.some((el) => el.closest("aside"))).toBe(true);
  });
});
