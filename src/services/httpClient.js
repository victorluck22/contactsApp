import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export const http = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

// Interceptor para token
http.interceptors.request.use((config) => {
  try {
    const raw = localStorage.getItem("app_auth_v1");
    if (raw) {
      const { token } = JSON.parse(raw);
      if (token) config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {}
  return config;
});

http.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response && err.response.status === 401) {
      // Emite evento global para que AuthContext faça logout
      try {
        window.dispatchEvent(new CustomEvent("app:auth-unauthorized"));
      } catch {}
    }
    return Promise.reject(err);
  }
);
