import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Navbar } from "./Navbar.jsx";
import { Sidebar } from "./Sidebar.jsx";
import { useLocation } from "react-router-dom";
import { Menu } from "lucide-react";
import { Modal } from "./Modal.jsx";
import { ContactForm } from "./ContactForm.jsx";
import { useContacts } from "../context/ContactsContext.jsx";
import { useContactSearch } from "../hooks/useContactSearch.js";
import { useUi } from "../context/UiContext.jsx";
import { AccountModal } from "./AccountModal.jsx";
import { useToast } from "../context/ToastContext.jsx";

export function Layout({ children }) {
  // Todas as hooks devem ser chamadas sempre (mesma ordem) para evitar erros em re-render
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const { addContact, contacts, updateContact, selectContact, removeContact } =
    useContacts();
  const toast = useToast();
  const {
    newContactOpen,
    closeNewContact,
    editContactTarget,
    closeEditContact,
    searchOpen,
    closeSearch,
    viewContactId,
    closeViewContact,
    deleteContactId,
    cancelDeleteContact,
    accountOpen,
    closeAccount,
  } = useUi();
  const searchInputRef = useRef(null);
  const {
    query: searchQuery,
    setQuery: setSearchQuery,
    ordered: orderedSearch,
    results: searchResults,
    loading: searchLoading,
    clear: clearSearch,
  } = useContactSearch();

  // Foca o campo de busca somente quando o modal abre (evita uso de autoFocus e melhora acessibilidade)
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      // pequeno timeout para garantir que o input esteja montado dentro do modal animado
      const id = requestAnimationFrame(() => {
        searchInputRef.current?.focus();
      });
      return () => cancelAnimationFrame(id);
    }
  }, [searchOpen]);

  const hideChrome = [
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/verify-email",
  ].includes(location.pathname);

  const variants = {
    initial: { opacity: 0, y: 24, scale: 0.985 },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
    },
    exit: {
      opacity: 0,
      y: -16,
      scale: 0.99,
      transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
    },
  };

  if (hideChrome) {
    return (
      <div className="auth-bg min-h-screen flex items-center justify-center p-4 overflow-hidden">
        <motion.main
          {...variants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="w-full max-w-sm sm:max-w-md mx-auto bg-surface/80 backdrop-blur-xl p-7 rounded-xl border border-border shadow-[0_4px_30px_-10px_hsl(0_0%_0%_/_0.25)] will-change-transform"
        >
          {children}
        </motion.main>
      </div>
    );
  }

  const filtered = searchResults ? orderedSearch : contacts;
  const contactEditing = editContactTarget
    ? contacts.find((c) => c.id === editContactTarget)
    : null;
  const contactViewing = viewContactId
    ? contacts.find((c) => c.id === viewContactId)
    : null;
  const contactDeleting = deleteContactId
    ? contacts.find((c) => c.id === deleteContactId)
    : null;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar desktop */}
        <div className="hidden md:block w-72 shrink-0 border-r border-border bg-surface/60 backdrop-blur">
          <Sidebar />
        </div>
        {/* Drawer mobile */}
        {open && (
          <div className="md:hidden absolute inset-0 z-20 flex">
            <div className="w-72 h-full bg-surface/95 backdrop-blur border-r border-border shadow-xl">
              <Sidebar />
            </div>
            <div
              className="flex-1 h-full bg-black/40"
              role="button"
              tabIndex={0}
              aria-label="Fechar menu"
              onClick={() => setOpen(false)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") setOpen(false);
              }}
            />
          </div>
        )}
        {/* Toggler mobile */}
        <button
          onClick={() => setOpen((o) => !o)}
          className="md:hidden absolute top-2 left-2 z-30 h-10 w-10 inline-flex items-center justify-center rounded-md bg-background/80 backdrop-blur border border-border shadow-sm"
          aria-label="Abrir lista de contatos"
        >
          <Menu className="w-5 h-5" />
        </button>
        <main className="flex-1 relative overflow-hidden">{children}</main>
      </div>
      <Modal
        open={newContactOpen}
        onClose={closeNewContact}
        title="Novo Contato"
        maxWidth="max-w-2xl"
      >
        <ContactForm
          onSubmit={async (data) => {
            try {
              const c = await addContact({
                ...data,
                id: "local_" + Date.now(),
              });
              closeNewContact();
              toast.success({
                title: "Contato criado",
                description: `${c.name} foi adicionado à lista.`,
              });
            } catch (e) {
              closeNewContact();
              toast.danger({
                title: "Falha ao criar contato",
                description: e.message || "Erro inesperado",
              });
            }
          }}
          onCancel={closeNewContact}
        />
      </Modal>
      <Modal
        open={!!contactEditing}
        onClose={closeEditContact}
        title={
          contactEditing ? `Editar: ${contactEditing.name}` : "Editar Contato"
        }
        maxWidth="max-w-2xl"
      >
        {contactEditing && (
          <ContactForm
            initial={contactEditing}
            onSubmit={(data) => {
              updateContact(contactEditing.id, data);
              closeEditContact();
              // Usar toast.success para manter mesma paleta/estrutura do toast de criação evitando transparência
              toast.success({
                title: "Contato atualizado",
                description: `${data.name} salvo com sucesso.`,
              });
            }}
            onCancel={closeEditContact}
          />
        )}
      </Modal>
      {/* Visualizar contato */}
      <Modal
        open={!!contactViewing}
        onClose={closeViewContact}
        title={contactViewing ? contactViewing.name : "Contato"}
        maxWidth="max-w-lg"
      >
        {contactViewing && (
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-xs uppercase tracking-wide opacity-60">
                  CPF
                </p>
                <p>{contactViewing.cpf}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide opacity-60">
                  Telefone
                </p>
                <p>{contactViewing.phone || "—"}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs uppercase tracking-wide opacity-60">
                  E-mail
                </p>
                <p>{contactViewing.email}</p>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-wide opacity-60">
                Endereço
              </p>
              <p>
                {contactViewing.address}, {contactViewing.number}
                {contactViewing.complement && ` - ${contactViewing.complement}`}
                <br />
                {contactViewing.locality}/{contactViewing.state} • CEP{" "}
                {contactViewing.zipCode}
              </p>
            </div>
            <div className="flex justify-end pt-2">
              <button
                onClick={closeViewContact}
                className="px-3 py-2 text-sm rounded-md bg-surface/60 hover:bg-surface/80 border border-border"
              >
                Fechar
              </button>
            </div>
          </div>
        )}
      </Modal>
      {/* Confirmar exclusão */}
      <Modal
        open={!!contactDeleting}
        onClose={cancelDeleteContact}
        title="Excluir Contato"
        maxWidth="max-w-md"
      >
        {contactDeleting && (
          <div className="space-y-4 text-sm">
            <p>
              Tem certeza que deseja excluir{" "}
              <strong>{contactDeleting.name}</strong>?<br />
              Essa ação não poderá ser desfeita.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={cancelDeleteContact}
                className="px-3 py-2 rounded-md text-sm bg-surface/60 hover:bg-surface/80 border border-border"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  const name = contactDeleting.name;
                  removeContact(contactDeleting.id);
                  cancelDeleteContact();
                  toast.danger({
                    title: "Contato excluído",
                    description: name,
                  });
                }}
                className="px-3 py-2 rounded-md text-sm bg-[var(--md-sys-color-error)] text-[var(--md-sys-color-on-error)] hover:bg-[var(--md-sys-color-error)]/90"
              >
                Excluir
              </button>
            </div>
          </div>
        )}
      </Modal>
      {/* Search modal (mobile first, but works any viewport) */}
      <Modal
        open={searchOpen}
        onClose={() => {
          clearSearch();
          closeSearch();
        }}
        title="Buscar Contatos"
        maxWidth="max-w-lg"
      >
        <div className="space-y-4">
          <div className="relative">
            <input
              ref={searchInputRef}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Nome, email ou telefone..."
              className="w-full pl-3 pr-20 py-2 rounded-md bg-surface/60 border border-border focus:outline-none focus:ring-2 focus:ring-accent/50"
            />
            {searchQuery && !searchLoading && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs px-2 py-1 rounded bg-background/60 border border-border hover:bg-background/80"
              >
                Limpar
              </button>
            )}
            {searchLoading && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-accent/40 border-t-accent rounded-full animate-spin" />
            )}
          </div>
          <div className="max-h-80 overflow-y-auto pr-1 thin-scroll">
            {filtered.length === 0 && !searchLoading && (
              <p className="text-sm text-muted">Nenhum resultado.</p>
            )}
            <ul className="divide-y divide-border/60">
              {filtered.map((c) => (
                <li key={c.id}>
                  <button
                    onClick={() => {
                      selectContact(c.id);
                      clearSearch();
                      closeSearch();
                    }}
                    className="w-full text-left px-2 py-2 flex flex-col gap-0.5 hover:bg-surface/60 rounded-md focus:outline-none focus:ring-1 focus:ring-accent/40"
                  >
                    <span className="font-medium text-sm leading-tight">
                      {c.name}
                    </span>
                    <span className="text-xs text-foreground/70 leading-tight break-all">
                      {c.email}
                    </span>
                    {c.telefone && (
                      <span className="text-[10px] text-foreground/60 leading-tight">
                        {c.phone}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Modal>
      {/* Modal da conta do usuário (nova versão isolada) */}
      <AccountModal open={accountOpen} onClose={closeAccount} />
    </div>
  );
}
