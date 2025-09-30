import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useAddressSuggestions } from "../hooks/useAddressSuggestions.js";
import * as addressServiceMod from "../services/addressService.js";

/**
 * Casos cobertos:
 * 1. CEP completo (8 dígitos) -> chama fetchCep e retorna 1 resultado
 * 2. Parâmetros insuficientes (sem state/locality) -> não busca e retorna []
 * 3. Busca parcial com state/locality (>=3 chars) -> chama suggest
 * 4. Compatibilidade nomes pt-br (uf/cidade + q)
 * 5. Erro em fetchCep propaga em estado error
 */

describe("useAddressSuggestions", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("busca CEP quando query tem 8 dígitos", async () => {
    const cepResult = { zipCode: "01001000", address: "Praça da Sé" };
    vi.spyOn(
      addressServiceMod.addressService,
      "fetchCep"
    ).mockResolvedValueOnce(cepResult);

    const { result } = renderHook((props) => useAddressSuggestions(props), {
      initialProps: { state: "SP", locality: "São Paulo", query: "01001000" },
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(result.current.suggestions).toHaveLength(1);
    expect(result.current.suggestions[0]).toEqual(cepResult);
  });

  it("não busca se faltam state/locality e não é CEP", async () => {
    const spyCep = vi.spyOn(addressServiceMod.addressService, "fetchCep");
    const spySuggest = vi.spyOn(addressServiceMod.addressService, "suggest");

    const { result } = renderHook(() =>
      useAddressSuggestions({ query: "rua" })
    );
    await waitFor(() => {
      expect(result.current.suggestions).toEqual([]);
    });
    expect(spyCep).not.toHaveBeenCalled();
    expect(spySuggest).not.toHaveBeenCalled();
  });

  it("chama suggest para busca parcial com state/locality válidos", async () => {
    const list = [{ address: "Rua Teste" }];
    vi.spyOn(addressServiceMod.addressService, "suggest").mockResolvedValueOnce(
      list
    );

    const { result } = renderHook(() =>
      useAddressSuggestions({
        state: "SP",
        locality: "São Paulo",
        query: "Rua",
      })
    );

    await waitFor(() => {
      expect(result.current.suggestions).toEqual(list);
    });
  });

  it("aceita uf/cidade/q como aliases", async () => {
    const list = [{ address: "Avenida Central" }];
    const spy = vi
      .spyOn(addressServiceMod.addressService, "suggest")
      .mockResolvedValueOnce(list);

    const { result } = renderHook(() =>
      useAddressSuggestions({ uf: "RJ", cidade: "Rio de Janeiro", q: "Aven" })
    );
    await waitFor(() => {
      expect(result.current.suggestions).toEqual(list);
    });
    // Payload pode incluir tanto 'cidade' quanto 'city' para compat
    const callArgs = spy.mock.calls[0][0];
    expect(callArgs.uf).toBe("RJ");
    expect(callArgs.cidade).toBe("Rio de Janeiro");
    expect(callArgs.q).toBe("Aven");
  });

  it("reporta erro vindo de fetchCep", async () => {
    vi.spyOn(
      addressServiceMod.addressService,
      "fetchCep"
    ).mockRejectedValueOnce(new Error("CEP inválido"));
    const { result } = renderHook(() =>
      useAddressSuggestions({ query: "99999999" })
    );
    await waitFor(() => {
      expect(result.current.error).toMatch(/CEP inválido/);
    });
  });
});
