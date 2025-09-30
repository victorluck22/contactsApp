import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./styles/global.css";
import { initAutoRipples } from "./lib/ripple.js";

const rootEl = document.getElementById("root");
if (!rootEl) throw new Error("Elemento root não encontrado");

createRoot(rootEl).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

// defer para garantir que DOM está pronto
queueMicrotask(() => initAutoRipples(document));
