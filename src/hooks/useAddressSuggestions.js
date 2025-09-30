import { useEffect, useRef, useState } from "react";
import { addressService } from "../services/addressService.js";

// Aceita tanto nomenclatura inglesa (state, locality) quanto portuguesa (uf, cidade)
// e normaliza CEP ou termo parcial para busca de sugestão.
export function useAddressSuggestions(params) {
  const state = params.state || params.uf || "";
  const locality = params.locality || params.city || params.cidade || "";
  const query = params.query || params.q || "";
  const delay = params.delay ?? 450; // debounce padrão
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const debounceRef = useRef(null);
  const abortRef = useRef(null);

  useEffect(() => {
    let active = true;
    const clean = query.replace(/\D/g, "");
    // Log de diagnóstico (remover em produção se desejar)
    if (query) {
      // eslint-disable-next-line no-console
      console.debug("useAddressSuggestions: efeito", {
        state,
        locality,
        query,
      });
    }
    if (clean.length === 8) {
      setLoading(true);
      setError(null);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (abortRef.current) abortRef.current.abort();
      abortRef.current = new AbortController();
      addressService
        .fetchCep(clean)
        .then((res) => {
          if (!active) return;
          setData(res ? [res] : []);
        })
        .catch((e) => {
          if (active) setError(e.message);
        })
        .finally(() => {
          if (active) setLoading(false);
        });
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query || query.length < 3) {
      setData([]);
      return;
    }
    debounceRef.current = setTimeout(() => {
      if (!active) return;
      setLoading(true);
      setError(null);
      if (abortRef.current) abortRef.current.abort();
      abortRef.current = new AbortController();
      const paramsPayload =
        state && locality
          ? { uf: state, cidade: locality, city: locality, q: query }
          : { q: query };
      addressService
        .suggest(paramsPayload)
        .then((res) => {
          if (active) setData(res);
        })
        .catch((e) => {
          if (active && e.name !== "AbortError") setError(e.message);
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    }, delay);
    return () => {
      active = false;
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (abortRef.current) abortRef.current.abort();
    };
  }, [state, locality, query, delay]);

  return { suggestions: data, loading, error };
}
