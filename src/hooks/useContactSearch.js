import { useEffect, useRef, useState, useMemo } from "react";
import { contactsService } from "../services/contactsService.js";
import { normalizeContact } from "../context/ContactsContext.jsx";

/**
 * Hook reutilizável de busca remota de contatos com debounce.
 * Retorna: { query, setQuery, results, loading, clear, ordered }
 */
export function useContactSearch(initial = "", delay = 400) {
  const [query, setQuery] = useState(initial);
  const [rawResults, setRawResults] = useState(null); // null => sem busca; [] => nenhum match
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);
  const lastController = useRef(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!query) {
      setRawResults(null);
      if (lastController.current) lastController.current.abort();
      return;
    }

    debounceRef.current = setTimeout(async () => {
      if (lastController.current) lastController.current.abort();
      const controller = new AbortController();
      lastController.current = controller;
      setLoading(true);
      try {
        const data = await contactsService.search(query.trim(), {
          signal: controller.signal,
        });
        const normalized = Array.isArray(data)
          ? data.map((d) => normalizeContact(d)).filter((d) => d && d.id)
          : [];
        setRawResults(normalized);
      } catch (e) {
        if (e.name !== "AbortError") {
          setRawResults([]);
        }
      } finally {
        setLoading(false);
      }
    }, delay);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, delay]);

  const ordered = useMemo(() => {
    const base = Array.isArray(rawResults) ? rawResults : [];
    return base.slice().sort((a, b) => {
      const aName = (a?.name || "").toString();
      const bName = (b?.name || "").toString();
      return aName.localeCompare(bName, "pt-BR", { sensitivity: "base" });
    });
  }, [rawResults]);

  const clear = () => {
    setQuery("");
    setRawResults(null);
  };

  return { query, setQuery, results: rawResults, loading, clear, ordered };
}
