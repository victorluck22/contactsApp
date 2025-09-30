// Mock de serviço central. Substituir por chamadas reais ao backend.
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

export async function apiGet(path, opts = {}) {
  await delay(200);
  // Exemplo: /address-suggest?uf=SP&cidade=São Paulo&q=Praça
  if (path.startsWith("/address-suggest")) {
    // Retorno mock – em produção backend chamará ViaCEP e geocoding.
    return [
      {
        cep: "01001-000",
        uf: "SP",
        cidade: "São Paulo",
        logradouro: "Praça da Sé",
        lat: -23.55052,
        lng: -46.633308,
      },
      {
        cep: "01002-000",
        uf: "SP",
        cidade: "São Paulo",
        logradouro: "Praça João Mendes",
        lat: -23.5531,
        lng: -46.6339,
      },
    ];
  }
  throw new Error("Endpoint GET mock não implementado: " + path);
}

export async function apiPost(path, body, opts = {}) {
  await delay(200);
  return { ok: true, path, body };
}

export async function apiDelete(path, opts = {}) {
  await delay(200);
  return { ok: true };
}
