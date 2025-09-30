/* eslint-disable react-refresh/only-export-components */ // Arquivo define provider + função utilitárias de ícone e bg.
import React, {
  createContext,
  useContext,
  useCallback,
  useState,
  useRef,
} from "react";
import { AnimatePresence, motion } from "framer-motion";

const ToastContext = createContext(null);

let idCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Map());

  const remove = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id));
    const tm = timers.current.get(id);
    if (tm) {
      clearTimeout(tm);
      timers.current.delete(id);
    }
  }, []);

  const push = useCallback(
    (toast) => {
      const id = ++idCounter;
      const duration = toast.duration ?? 3500;
      const t = {
        id,
        type: toast.type || "info",
        title: toast.title,
        description: toast.description,
        duration,
      };
      setToasts((list) => [...list, t]);
      if (duration > 0) {
        const tm = setTimeout(() => remove(id), duration + 150); // leve delay final
        timers.current.set(id, tm);
      }
      return id;
    },
    [remove]
  );

  const api = {
    push,
    info: (opts) => push({ ...opts, type: "info" }),
    success: (opts) => push({ ...opts, type: "success" }),
    danger: (opts) => push({ ...opts, type: "danger" }),
    error: (opts) => push({ ...opts, type: "danger" }), // alias
    warning: (opts) => push({ ...opts, type: "warning" }),
    remove,
    showApiResult: ({ success, message }) => {
      if (success) api.success({ title: message || "Operação realizada" });
      else api.danger({ title: message || "Falha na operação" });
    },
  };

  return (
    <ToastContext.Provider value={api}>
      {children}
      <ToastViewport toasts={toasts} onRemove={remove} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast deve ser usado dentro de ToastProvider");
  return ctx;
}

function iconFor(type) {
  switch (type) {
    case "success":
      return "✅";
    case "danger":
      return "⛔";
    case "warning":
      return "⚠️";
    default:
      return "ℹ️";
  }
}

function bgFor(type) {
  // Usar containers / cores MD3 para consistência visual
  switch (type) {
    case "success":
      return "bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)]";
    case "danger":
      return "bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)]";
    case "warning":
      return "bg-[var(--md-sys-color-tertiary-container)] text-[var(--md-sys-color-on-tertiary-container)]";
    case "info":
    default:
      return "bg-[var(--md-sys-color-surface)]/95 text-[var(--md-sys-color-on-surface)]";
  }
}

function ToastViewport({ toasts, onRemove }) {
  return (
    <div
      className="fixed bottom-3 right-3 z-[520] flex flex-col gap-2 w-[320px] max-w-[90vw] pointer-events-none"
      role="region"
      aria-label="Notificações"
      aria-live="polite"
    >
      <AnimatePresence initial={false}>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.22 }}
            className={`group rounded-md border border-border shadow-lg px-3 py-2 text-sm backdrop-blur pointer-events-auto ${bgFor(
              t.type
            )}`}
            role={t.type === "danger" ? "alert" : "status"}
          >
            <div className="flex items-start gap-2">
              <div className="text-lg leading-none">{iconFor(t.type)}</div>
              <div className="flex-1 min-w-0">
                <p className="font-medium leading-tight truncate">{t.title}</p>
                {t.description && (
                  <p className="text-xs opacity-80 mt-0.5 leading-snug line-clamp-3">
                    {t.description}
                  </p>
                )}
              </div>
              <button
                onClick={() => onRemove(t.id)}
                className="opacity-60 hover:opacity-100 text-xs mt-0.5"
                aria-label="Fechar"
              >
                ×
              </button>
            </div>
            {t.duration > 0 && (
              <div className="h-1 mt-2 rounded bg-black/10 overflow-hidden">
                <motion.div
                  className="h-full bg-white/40"
                  initial={{ width: "100%" }}
                  animate={{ width: 0 }}
                  transition={{
                    duration: (t.duration + 100) / 1000,
                    ease: "linear",
                  }}
                />
              </div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
