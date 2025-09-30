import { describe, it, expect } from "vitest";
import { isValidCPF } from "../utils/cpf.js";

// CPFs válidos conhecidos para teste
const valid = [
  "529.982.247-25", // exemplo clássico
  "11144477735",
];

const invalid = [
  "123.456.789-00",
  "00000000000",
  "11111111111",
  "22222222222",
  "52998224724", // dígito verificador alterado
  "5299822472", // tamanho incorreto
];

describe("CPF validator", () => {
  valid.forEach((cpf) => {
    it(`reconhece válido: ${cpf}`, () => {
      expect(isValidCPF(cpf)).toBe(true);
    });
  });
  invalid.forEach((cpf) => {
    it(`reconhece inválido: ${cpf}`, () => {
      expect(isValidCPF(cpf)).toBe(false);
    });
  });
});
