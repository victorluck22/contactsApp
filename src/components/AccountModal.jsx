import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { useContacts } from "../context/ContactsContext.jsx";
import { Button } from "./Button.jsx";
import { InputOutlined } from "./Form.jsx";
import { authService } from "../services/authService.js";
import { FEEDBACK } from "../constants/feedbackMessages.js";
import { useToast } from "../context/ToastContext.jsx";
import { useNavigate } from "react-router-dom";

/*
 * AccountModal
 * Modal independente recriado para eliminar:
 * - Scrollbar dupla (apenas um container com overflow)
 * - Perda/blur de foco em inputs (nenhum autofocus forçado; não há nested scroll wrappers)
 * - Dependência de window.location.hash para modo edição
 *
 * Acessibilidade:
 * - role="dialog" + aria-modal
 * - Título associado via aria-labelledby
 * - Escape fecha
 * - Clique no backdrop fecha
 * - Focus trap simples apenas se usuário usar Tab (mantido enxuto)
 */

export function AccountModal({ open, onClose }) {
  const { user, logout, updateUserProfile } = useAuth();
  const { contacts } = useContacts();
  const toast = useToast();
  const navigate = useNavigate();
  const [editMode, setEditMode] = useState(false);
  const [nameDraft, setNameDraft] = useState(user?.name || "");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const dialogRef = useRef(null);
  const titleId = useRef(
    "account-modal-" + Math.random().toString(36).slice(2)
  );

  // Reset quando abrir/fechar
  useEffect(() => {
    if (open) {
      setEditMode(false);
      setNameDraft(user?.name || "");
      setPassword("");
      setError(null);
      setSuccess(null);
    }
  }, [open, user]);

  // Bloqueio de scroll do body
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Escape + focus trap enxuto
  useEffect(() => {
    if (!open) return;
    function onKey(e) {
      if (e.key === "Escape") onClose?.();
      if (e.key === "Tab" && dialogRef.current) {
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
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const saveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const updated = await updateUserProfile({ name: nameDraft.trim() });
      setSuccess("Perfil atualizado");
      const msg = FEEDBACK.profile.updateSuccess(updated.name);
      toast.success(msg);
      setEditMode(false);
      setNameDraft(updated.name);
    } catch (err) {
      const msg = FEEDBACK.profile.updateError(err.message);
      setError(msg.description);
      toast.danger(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const ok = await authService.deleteAccount(password);
      if (!ok) throw new Error("Falha ao excluir");
      localStorage.removeItem("app_auth_v1");
      await logout();
      toast.success(FEEDBACK.account.deleteSuccess);
      onClose?.();
      navigate("/login");
    } catch (err) {
      const msg = FEEDBACK.account.deleteError(err.message);
      setError(msg.description);
      toast.danger(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[650] flex items-start justify-center p-4 md:pt-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0 bg-black/55 backdrop-blur-sm"
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
            className="relative w-full max-w-2xl rounded-xl border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-on-surface)] elev-3 shadow-xl overflow-hidden"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId.current}
            ref={dialogRef}
          >
            <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--md-sys-color-outline-variant)]/70">
              <h2
                id={titleId.current}
                className="text-sm font-medium tracking-wide"
              >
                Minha Conta
              </h2>
              <button
                onClick={onClose}
                className="h-8 w-8 inline-flex items-center justify-center rounded-full md-ripple text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)]"
                aria-label="Fechar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {/* ÚNICO container rolável */}
            <div
              className="p-5 overflow-y-auto max-h-[80vh] thin-scroll space-y-8 text-sm"
              data-preserve-focus
            >
              {!user && <div>Não autenticado.</div>}
              {user && (
                <>
                  {/* Perfil */}
                  <section className="space-y-4">
                    <header className="flex items-center justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-wide opacity-70">
                          Perfil
                        </p>
                      </div>
                      {!editMode && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setEditMode(true)}
                          className="text-xs h-8 px-3"
                        >
                          Editar
                        </Button>
                      )}
                    </header>
                    {!editMode && (
                      <div className="rounded-lg p-4 bg-[var(--md-sys-color-surface-variant)]/30 border border-[var(--md-sys-color-outline-variant)] space-y-1">
                        <p>
                          <span className="font-medium">Nome:</span> {user.name}
                        </p>
                        <p>
                          <span className="font-medium">E-mail:</span>{" "}
                          {user.email}
                        </p>
                        <p>
                          <span className="font-medium">Contatos:</span>{" "}
                          {contacts.length}
                        </p>
                      </div>
                    )}
                    {editMode && (
                      <form
                        onSubmit={saveProfile}
                        className="space-y-4 rounded-lg p-4 bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)]"
                      >
                        {error && (
                          <div className="text-xs bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)] px-3 py-2 rounded">
                            {error}
                          </div>
                        )}
                        {success && (
                          <div className="text-xs bg-[var(--md-sys-color-secondary-container)]/40 px-3 py-2 rounded">
                            {success}
                          </div>
                        )}
                        <InputOutlined
                          label="Nome"
                          value={nameDraft}
                          onChange={(e) => setNameDraft(e.target.value)}
                          required
                          className="w-full"
                          data-preserve-focus
                        />
                        <div className="flex gap-2 justify-end">
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => {
                              setEditMode(false);
                              setNameDraft(user.name);
                            }}
                            disabled={loading}
                          >
                            Cancelar
                          </Button>
                          <Button type="submit" disabled={loading}>
                            {loading ? "Salvando..." : "Salvar"}
                          </Button>
                        </div>
                      </form>
                    )}
                  </section>
                  {/* Excluir conta */}
                  <section className="space-y-4">
                    <header>
                      <p className="text-xs uppercase tracking-wide opacity-70 text-[var(--md-sys-color-error)]">
                        Excluir Conta
                      </p>
                    </header>
                    <form
                      onSubmit={handleDelete}
                      className="space-y-4 rounded-lg p-4 border border-[var(--md-sys-color-error)]/40 bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)]"
                    >
                      <p className="text-xs opacity-70 leading-relaxed">
                        Esta ação é irreversível e removerá todos os seus dados.
                      </p>
                      {error && (
                        <div className="text-sm text-[var(--md-sys-color-error)]">
                          {error}
                        </div>
                      )}
                      {success && (
                        <div className="text-sm text-[var(--md-sys-color-primary)]">
                          {success}
                        </div>
                      )}
                      <InputOutlined
                        label="Confirmar senha"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full"
                        data-preserve-focus
                      />
                      <div className="flex justify-end">
                        <Button
                          type="submit"
                          variant="outline"
                          className="border-[var(--md-sys-color-error)] text-[var(--md-sys-color-error)] hover:bg-[var(--md-sys-color-error)]/10"
                          loading={loading}
                        >
                          Excluir definitivamente
                        </Button>
                      </div>
                    </form>
                  </section>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
