import { http } from "./httpClient.js";

// A API agora expõe e espera um schema flat em inglês sem objeto aninhado de endereço.
// Campos esperados: id?, name, cpf, phone, email, zipCode, state, locality, address, number, complement, lat, lng
// Função utilitária para garantir extração de arrays em diversas formas de envelopamento.
function extractArray(data) {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.data)) return data.data;
  if (Array.isArray(data.contacts)) return data.contacts;
  return [];
}

export const contactsService = {
  async list(params = {}) {
    const { data } = await http.get("/contacts", { params });
    return extractArray(data);
  },
  async search(query, params = {}) {
    const { data } = await http.get("/contacts/search", {
      params: { q: query, ...params },
    });
    return extractArray(data);
  },
  async create(contact) {
    const payload = {
      name: contact.name,
      cpf: contact.cpf,
      phone: contact.phone,
      email: contact.email,
      zip_code: contact.zipCode?.replace(/\D/g, "") || "",
      state: contact.state,
      city: contact.locality || contact.city,
      neighborhood: contact.neighborhood || "",
      address: contact.address,
      number: contact.number,
      complement: contact.complement,
      latitude_real:
        typeof contact.lat === "number"
          ? Math.round(contact.lat * 1_000_000)
          : undefined,
      longitude_real:
        typeof contact.lng === "number"
          ? Math.round(contact.lng * 1_000_000)
          : undefined,
    };
    try {
      const { data } = await http.post("/contacts", payload);
      // Suporta formatos: { data: {...} } ou contato direto
      return data?.data || data;
    } catch (e) {
      // fallback mock otimista
      return { ...contact, id: contact.id || "c_" + Date.now() };
    }
  },
  async update(id, contact) {
    const payload = {
      name: contact.name,
      cpf: contact.cpf,
      phone: contact.phone,
      email: contact.email,
      zip_code: contact.zipCode?.replace(/\D/g, "") || "",
      state: contact.state,
      city: contact.locality || contact.city,
      neighborhood: contact.neighborhood || "",
      address: contact.address,
      number: contact.number,
      complement: contact.complement,
      latitude_real:
        typeof contact.lat === "number"
          ? Math.round(contact.lat * 1_000_000)
          : undefined,
      longitude_real:
        typeof contact.lng === "number"
          ? Math.round(contact.lng * 1_000_000)
          : undefined,
    };
    const { data } = await http.put(`/contacts/${id}`, payload);
    return data?.data || data;
  },
  async remove(id) {
    await http.delete(`/contacts/${id}`);
    return true;
  },
};
