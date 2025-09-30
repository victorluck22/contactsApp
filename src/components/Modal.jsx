import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

/*
 * Material 3 Modal Dialog
 * Ajustes:
 * - Usa surface + elevation (elev-3) por padrão
 * - Suporte a variant "tonal" (secondary-container) e "flat"
 * - Botão fechar com ripple (md-ripple) e state-layer
 * - Transições suaves de opacidade/spring
 */

export function Modal({
  open,
  onClose,
  title,
  children,
  maxWidth = "max-w-xl",
  variant = "surface", // surface | tonal | flat
}) {
  const dialogRef = useRef(null);
  const titleId = useRef("modal-title-" + Math.random().toString(36).slice(2));
  const hasAutoFocused = useRef(false);

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose?.();
      if (e.key === "Tab" && dialogRef.current) {
        // Focus trap simples
        const focusables = dialogRef.current.querySelectorAll(
          'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      document.body.classList.add("modal-open-blur");
      // Impedir scroll do body para evitar segunda scrollbar
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.classList.remove("modal-open-blur");
        document.body.style.overflow = originalOverflow;
      };
    } else {
      document.body.classList.remove("modal-open-blur");
    }
    return () => document.body.classList.remove("modal-open-blur");
  }, [open]);

  useEffect(() => {
    if (!open || !dialogRef.current) return;
    if (hasAutoFocused.current) return; // só na primeira abertura
    const alreadyInside = dialogRef.current.contains(document.activeElement);
    if (alreadyInside) return;
    // Se houver elemento marcado para preservar foco, não focar nada
    const preserve = dialogRef.current.querySelector("[data-preserve-focus]");
    if (preserve) {
      hasAutoFocused.current = true;
      return;
    }
    const focusableInput = dialogRef.current.querySelector(
      "input, textarea, select, button:not([data-autofocus-ignore])"
    );
    if (focusableInput) {
      focusableInput.focus();
      hasAutoFocused.current = true;
      return;
    }
    const h = dialogRef.current.querySelector("h2");
    if (h) {
      h.focus();
      hasAutoFocused.current = true;
    }
  }, [open]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[640] flex items-start justify-center p-4 md:pt-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            role="button"
            tabIndex={0}
            aria-label="Fechar"
            onClick={onClose}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") onClose?.();
            }}
          />
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 10, opacity: 0 }}
            transition={{ type: "spring", stiffness: 210, damping: 24 }}
            className={`relative w-full ${maxWidth} rounded-xl overflow-hidden dialog-container`}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId.current}
            ref={dialogRef}
            data-variant={variant}
          >
            <div
              className={
                "flex flex-col bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-on-surface)] " +
                "border border-[var(--md-sys-color-outline-variant)] backdrop-blur-sm " +
                "elev-3" +
                (variant === "tonal"
                  ? " bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)]"
                  : "") +
                (variant === "flat"
                  ? " elev-1 border border-[var(--md-sys-color-outline-variant)]"
                  : "")
              }
            >
              <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--md-sys-color-outline-variant)]/70">
                <h2
                  id={titleId.current}
                  className="text-sm font-medium focus:outline-none tracking-wide"
                  tabIndex={-1}
                >
                  {title}
                </h2>
                <button
                  onClick={onClose}
                  className="h-8 w-8 inline-flex items-center justify-center rounded-full md-ripple text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)]"
                  aria-label="Fechar"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div
                className="p-4 overflow-auto max-h-[70vh] text-sm thin-scroll"
                tabIndex={-1}
                data-modal-scroll
              >
                {children}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
