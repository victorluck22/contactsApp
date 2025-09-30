/* eslint-disable react-refresh/only-export-components */ // Context file contém também helpers e constantes necessárias.
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { authService } from "../services/authService.js";

// Estrutura simplificada: em produção integrar API real.
const AuthContext = createContext(null);

const STORAGE_KEY = "app_auth_v1";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // { id, name, email }
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expiresAt, setExpiresAt] = useState(null);

  const verifyingRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) {
          console.debug("[Auth] Nenhum dado armazenado");
          return;
        }
        const parsed = JSON.parse(raw);
        console.debug("[Auth] Carregado storage", parsed);
        if (!(parsed?.token && parsed?.user)) return;
        if (parsed.expiresAt && parsed.expiresAt < Date.now()) {
          console.debug("[Auth] Token expirado localmente");
          localStorage.removeItem(STORAGE_KEY);
          return;
        }
        verifyingRef.current = true;
        console.debug("[Auth] Verificando token remoto...");
        const verifyRes = await authService.verifyToken(parsed.token);
        console.debug("[Auth] Resultado verificação", verifyRes);
        if (cancelled) return;
        if (verifyRes.valid) {
          // Alguns backends retornam user atualizado; se vier usamos, senão mantemos o do storage
          const nextUser = verifyRes.user || parsed.user;
          const nextExp = verifyRes.expiresAt || parsed.expiresAt || null;
          setToken(parsed.token);
          setUser(nextUser);
          setExpiresAt(nextExp);
          // Atualiza storage se exp ou user mudaram
          localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({
              user: nextUser,
              token: parsed.token,
              expiresAt: nextExp,
            })
          );
        } else {
          console.debug("[Auth] Verificação inválida -> removendo storage");
          localStorage.removeItem(STORAGE_KEY);
        }
      } catch (e) {
        console.warn("[Auth] Erro ao carregar/verificar", e);
      } finally {
        if (!cancelled) setLoading(false);
        verifyingRef.current = false;
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const persist = (data) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  };

  const login = useCallback(async (email, password) => {
    const result = await authService.login(email, password);
    const apiUser = result?.user;
    const apiToken = result?.token;
    const apiExp = result?.expiresAt;
    if (!apiUser || !apiToken) {
      throw new Error(
        "Login inválido: dados incompletos retornados pelo servidor"
      );
    }
    setUser(apiUser);
    setToken(apiToken);
    setExpiresAt(apiExp || null);
    persist({ user: apiUser, token: apiToken, expiresAt: apiExp });
    return apiUser;
  }, []);

  const register = useCallback(
    async (name, email, password, password_confirmation) => {
      if (
        !name ||
        !email ||
        password.length < 4 ||
        password !== password_confirmation
      )
        throw new Error("Dados inválidos");
      const res = await authService.register(
        name,
        email,
        password,
        password_confirmation
      );
      // Não autentica imediatamente; apenas retorna resposta para UI exibir mensagem.
      return res; // { success, message }
    },
    []
  );

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
    setToken(null);
    setExpiresAt(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const updateUserProfile = useCallback(
    async (patch) => {
      if (!token) throw new Error("Não autenticado");
      const res = await authService.updateProfile(patch);
      const updated = res?.user || { ...user, ...patch };
      setUser(updated);
      persist({ user: updated, token, expiresAt });
      return updated;
    },
    [token, user, expiresAt]
  );

  // Listener para 401 global
  useEffect(() => {
    const handler = () => logout();
    window.addEventListener("app:auth-unauthorized", handler);
    return () => window.removeEventListener("app:auth-unauthorized", handler);
  }, [logout]);

  const requestPasswordReset = useCallback(
    async (email) => authService.requestPasswordReset(email),
    []
  );

  const value = {
    user,
    token,
    loading,
    authenticated: !!token && (!expiresAt || expiresAt > Date.now()),
    expiresAt,
    login,
    register,
    logout,
    requestPasswordReset,
    updateUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return ctx;
}
