/* eslint-disable react-refresh/only-export-components */ // Arquivo de contexto expõe provider + hook + constantes.
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useAuth } from "./AuthContext.jsx";
import { contactsService } from "../services/contactsService.js";

/* Contacts Context - agora assume schema flat em inglês:
   { id, name, cpf, phone, email, zipCode, state, city, address, number, complement, lat, lng }
*/
const ContactsContext = createContext(null);
// Removido uso de localStorage para persistência principal; agora origem é backend (contactsService)

// Removido sample de fallback para usar somente dados reais; em erro ficará lista vazia

// Com schema único flat, normalização vira uma shallow sanitização opcional.
export function normalizeContact(raw) {
  if (!raw || typeof raw !== "object") return raw;
  // Backend envia: zip_code, city, neighborhood, latitude_real, longitude_real, latitude, longitude (inteiros?), created_at, updated_at
  // Front usa: zipCode, locality, neighborhood (opcional), address, number, complement, lat, lng
  const normalizeCoord = (val) => {
    if (typeof val !== "number") return null;
    // Se valor parece inteiro escalado (|val| > 1000) assume escala 1e6
    if (Math.abs(val) > 1000) return val / 1_000_000;
    return val;
  };
  const lat = normalizeCoord(
    typeof raw.latitude_real === "number"
      ? raw.latitude_real
      : typeof raw.lat === "number"
      ? raw.lat
      : raw.latitude
  );
  const lng = normalizeCoord(
    typeof raw.longitude_real === "number"
      ? raw.longitude_real
      : typeof raw.lng === "number"
      ? raw.lng
      : raw.longitude
  );
  return {
    id: raw.id,
    name: raw.name || "",
    cpf: raw.cpf || "",
    phone: raw.phone || "",
    email: raw.email || "",
    zipCode: raw.zipCode || raw.zip_code || "",
    state: raw.state || "",
    city: raw.city || "",
    neighborhood: raw.neighborhood || "",
    address: raw.address || "",
    number: raw.number || "",
    complement: raw.complement || "",
    lat,
    lng,
  };
}

export function ContactsProvider({ children }) {
  const { user } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    let active = true;
    if (!user) {
      setContacts([]);
      setLoading(false);
      return () => {
        active = false;
      };
    }
    setLoading(true);
    contactsService
      .list()
      .then((data) => {
        if (!active) return;
        if (Array.isArray(data)) {
          setContacts(data.map(normalizeContact));
        } else {
          setContacts([]);
        }
      })
      .catch((e) => {
        if (active) {
          console.warn("Falha ao buscar contatos remotos", e);
          setContacts([]);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [user]);

  // Sem persist local: manter estrutura para futura estratégia de cache se desejado

  const addContact = useCallback((data) => {
    // Inserção otimista imediata para feedback instantâneo
    const tempId = data.id || "temp_" + Date.now();
    const optimistic = normalizeContact({ ...data, id: tempId });
    setContacts((prev) => [...prev, optimistic]);

    return contactsService
      .create(data)
      .then((created) => {
        const newC = normalizeContact(created || data);
        // Substitui o otimista pelo definitivo
        setContacts((prev) => prev.map((c) => (c.id === tempId ? newC : c)));
        // Recarrega lista do servidor para garantir coordenadas/normalização definitivas
        contactsService
          .list()
          .then((fresh) => {
            // Só substitui se backend retornar contatos (evita apagar criação otimista em caso de []/erro temporário)
            if (Array.isArray(fresh) && fresh.length > 0) {
              setContacts(fresh.map(normalizeContact));
            }
          })
          .catch(() => {});
        return newC;
      })
      .catch(() => {
        // Mantém versão otimista; retorna para continuidade do fluxo
        return optimistic;
      });
  }, []);

  const updateContact = useCallback((id, patch) => {
    setContacts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...patch } : c))
    );
    contactsService
      .update(id, patch)
      .then((res) => {
        if (!res) return; // se mock
        const incoming = normalizeContact(res);
        setContacts((prev) =>
          prev.map((c) => {
            if (c.id !== id) return c;
            // merge conservador: só sobrescreve se valor não vazio/nulo/undefined
            const merged = { ...c };
            Object.entries(incoming).forEach(([k, v]) => {
              if (v !== "" && v !== null && v !== undefined) {
                merged[k] = v;
              }
            });
            return merged;
          })
        );
        // Após merge local, força sincronização completa para refletir campos calculados no backend
        contactsService
          .list()
          .then((fresh) => {
            if (Array.isArray(fresh) && fresh.length > 0) {
              setContacts(fresh.map(normalizeContact));
            }
          })
          .catch(() => {});
      })
      .catch(() => {
        // rollback simples poderia ser implementado registrando snapshot
      });
  }, []);

  const removeContact = useCallback(
    (id) => {
      setContacts((prev) => prev.filter((c) => c.id !== id));
      contactsService.remove(id).catch(() => {
        // fallback: sem rollback, poderia re-adicionar se quisesse
      });
      if (selectedId === id) setSelectedId(null);
    },
    [selectedId]
  );

  const selectContact = (id) => setSelectedId(id);

  const refreshContacts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await contactsService.list();
      setContacts(Array.isArray(data) ? data.map(normalizeContact) : []);
    } catch (e) {
      console.warn("Falha ao recarregar contatos", e);
    } finally {
      setLoading(false);
    }
  }, []);

  const value = {
    contacts,
    loading,
    addContact,
    updateContact,
    removeContact,
    selectedId,
    selectContact,
    refreshContacts,
  };

  return (
    <ContactsContext.Provider value={value}>
      {children}
    </ContactsContext.Provider>
  );
}

export function useContacts() {
  const ctx = useContext(ContactsContext);
  if (!ctx)
    throw new Error("useContacts deve ser usado dentro de ContactsProvider");
  return ctx;
}
