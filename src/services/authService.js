import { http } from "./httpClient.js";

// Flag para fallback de mock em ambiente de teste (vitest) ou se variável explícita estiver ligada
const useMock =
  import.meta.env.VITE_AUTH_MOCK === "true" || import.meta.env.MODE === "test";

function mockLoginLike(userOverrides = {}) {
  const expiresAt = Date.now() + 15 * 60 * 1000;
  return {
    user: {
      id: "u1",
      name: "user",
      email: "user@example.com",
      ...userOverrides,
    },
    token: "tk_mock_" + Date.now(),
    expiresAt,
  };
}

export const authService = {
  async login(email, password) {
    if (useMock) return mockLoginLike({ name: email.split("@")[0], email });
    const { data } = await http.post("/auth/login", { email, password });
    // Backend retorna: { success, code, message, data: { user, token, expiration: { minutes, expires_at } } }
    // Normalizamos para { user, token, expiresAt }
    let user = data?.data?.user || data?.user;
    let token = data?.data?.token || data?.token;
    const expRaw = data?.data?.expiration?.expires_at || data?.expires_at;
    let expiresAt = null;
    if (expRaw) {
      // Tenta parse ISO
      const ts = Date.parse(expRaw);
      if (!isNaN(ts)) expiresAt = ts;
    }
    if (!token || !user) {
      throw new Error(
        data?.message || "Resposta de login inválida: faltando token ou user"
      );
    }
    return { user, token, expiresAt };
  },
  async register(name, email, password, password_confirmation) {
    if (useMock)
      return {
        success: true,
        message:
          "Cadastro realizado. Verifique seu e-mail para ativar a conta.",
      };
    const { data } = await http.post("/auth/register", {
      name,
      email,
      password,
      password_confirmation,
    });
    // Esperado backend: { success: boolean, message: string }
    return data;
  },
  async logout() {
    if (useMock) return true;
    try {
      await http.post("/auth/logout");
    } catch (e) {
      // Ignorar erros de logout (ex: token já inválido)
    }
    return true;
  },
  async requestPasswordReset(email) {
    if (useMock) return true;
    await http.post("/auth/forgot", { email });
    return true;
  },
  async resetPassword({ token, password, password_confirmation }) {
    if (useMock) return true;
    await http.post("/auth/reset", { token, password, password_confirmation });
    return true;
  },
  async resetPasswordTokenEmail({
    token,
    email,
    password,
    password_confirmation,
  }) {
    if (useMock) return true;
    // Adapte a rota conforme seu backend real (ex: /auth/reset-password)
    await http.post("/auth/reset", {
      token,
      email,
      password,
      password_confirmation,
    });
    return true;
  },
  async deleteAccount(password) {
    if (useMock) return true;
    await http.post("/auth/delete-account", { password });
    return true;
  },
  async verifyToken(token) {
    if (useMock) {
      if (!token) return { valid: false };
      return { valid: true };
    }
    // Exemplo: backend pode expor /auth/me ou /auth/verify
    try {
      const { data } = await http.get("/auth/user"); // esperado: { user, exp (timestamp) }
      return { valid: true, user: data.user, expiresAt: data.exp };
    } catch (e) {
      return { valid: false };
    }
  },
  async verifyEmail({ id, hash, expires, signature }) {
    if (useMock) return { success: true };
    // Possíveis formatos backend: POST /auth/verify-email { id, hash } ou GET /auth/verify/:id/:hash
    // Aqui adotamos POST para consistência.
    const { data } = await http.get(
      "/auth/email/verify?expires=" +
        expires +
        "&hash=" +
        hash +
        "&id=" +
        id +
        "&signature=" +
        signature
    );
    return data; // esperado: { success: boolean, user? }
  },
  async updateProfile(partial) {
    // partial: { name? }
    if (useMock) {
      // Simula retorno atualizado
      return { success: true, user: mockLoginLike(partial).user };
    }
    const { data } = await http.put("/auth/user", partial);
    // Esperado: { success, user }
    return data;
  },
};
