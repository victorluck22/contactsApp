import "@testing-library/jest-dom";
import React from "react";

// Mock leve de framer-motion: evita animações e timers que geram warnings de act.
try {
  if (!globalThis.TEST_MOTION_MOCKED) {
    // Usa dynamic import para obter o módulo real sem quebrar caso não exista
    import("framer-motion")
      .then(() => {
        // Cria wrappers pass-through sem animação
        const passthrough = (Tag = "div") => {
          const Cmp = ({ children, ...rest }) =>
            React.createElement(Tag, rest, children);
          return Cmp;
        };
        const motionProxy = new Proxy(
          {},
          {
            get: () => passthrough("div"),
          }
        );
        // Injeta no global (para componentes já importados usarem)
        // Não sobrescrevemos propriedades read-only; apenas adicionamos helpers no global
        // @ts-ignore
        globalThis.__FM_NO_ANIM__ = {
          motion: motionProxy,
          AnimatePresence: ({ children }) =>
            React.createElement(React.Fragment, {}, children),
        };
      })
      .catch(() => {
        /* ignore */
      });
    globalThis.TEST_MOTION_MOCKED = true;
  }
} catch {
  /* noop */
}

// Silenciar warnings específicos do React Router (future flags) redirecionando console.warn
const origWarn = console.warn;
console.warn = (...args) => {
  const msg = args[0] || "";
  if (
    typeof msg === "string" &&
    msg.includes("React Router Future Flag Warning")
  )
    return;
  origWarn(...args);
};
