import { http } from "./httpClient.js";

export const addressService = {
  async suggest({ uf, city, q }) {
    const { data } = await http.get("/addresses/suggest", {
      params: { uf, city, query: q },
    });
    // Esperado formato: { success, code, data: { suggestions: [...] } }
    const list = data?.data?.suggestions || data?.suggestions || [];
    // Normaliza para campos usados no form pickSuggestion
    console.log(list);
    return list.map((s) => ({
      id: s.placeId || s.id,
      placeId: s.placeId || s.id,
      description: s.description,
      mainText: s.mainText || s.terms?.[0]?.value || "",
      secondaryText: s.secondaryText || "",
      // heurística para extrair cidade/estado do secondaryText
      city:
        s.city ||
        s.secondaryText?.match(/,\s*([^,-]+)\s*-\s*[A-Z]{2}/)?.[1] ||
        "",
      state: s.state || s.secondaryText?.match(/-\s*([A-Z]{2})\b/)?.[1] || "",
      neighborhood:
        s.neighborhood ||
        s.terms?.[1]?.value || // Água Verde (exemplo)
        s.secondaryText?.split(",")[0] ||
        "",
      address: s.mainText || s.description?.split(" - ")[0] || "",
    }));
  },
  async fetchCep(cep) {
    const { data } = await http.get(`/addresses/${cep}`);
    return data;
  },
};
