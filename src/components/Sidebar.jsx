import React, { useMemo, useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useContacts } from "../context/ContactsContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import {
  User,
  Search,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Mail,
  Phone,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import { useUi } from "../context/UiContext.jsx";
import { useContactSearch } from "../hooks/useContactSearch.js";

export function Sidebar() {
  const { contacts, loading, selectContact, selectedId } = useContacts();
  const { authenticated } = useAuth();
  const { openEditContact, openViewContact, confirmDeleteContact } = useUi();

  const {
    query,
    setQuery,
    results,
    ordered: orderedRemote,
    clear,
  } = useContactSearch();
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuContainerRef = useRef(null);
  const menuItemsRefs = useRef({}); // {contactId: [el, el, ...]}
  const menuButtonRefs = useRef({}); // para devolver foco

  // Fechar menu ao clicar fora / ESC
  useEffect(() => {
    if (!openMenuId) return;
    function handleDown(e) {
      if (!menuContainerRef.current) return;
      // clique dentro do botão/anchor container
      if (e.target.closest("[data-contact-menu]")) return;
      // clique dentro do portal
      if (e.target.closest("[data-contact-menu-portal]")) return;
      setOpenMenuId(null);
    }
    function handleEsc(e) {
      if (e.key === "Escape") setOpenMenuId(null);
    }
    window.addEventListener("mousedown", handleDown);
    window.addEventListener("keydown", handleEsc);
    return () => {
      window.removeEventListener("mousedown", handleDown);
      window.removeEventListener("keydown", handleEsc);
    };
  }, [openMenuId]);

  const ordered = useMemo(() => {
    if (Array.isArray(results)) return orderedRemote; // já ordenado pelo hook
    // sem busca: ordena contatos locais
    return contacts.slice().sort((a, b) => {
      const aName = (a?.name || "").toString();
      const bName = (b?.name || "").toString();
      return aName.localeCompare(bName, "pt-BR", { sensitivity: "base" });
    });
  }, [contacts, results, orderedRemote]);

  if (!authenticated) return null;

  return (
    <aside
      className="hidden md:flex md:w-72 h-full border-r border-[var(--md-sys-color-outline-variant)] flex-col p-3 gap-3 bg-[var(--md-sys-color-surface)]/80 backdrop-blur overflow-y-auto thin-scroll"
      ref={menuContainerRef}
    >
      <div className="flex items-center gap-2">
        <div className="text-xs uppercase tracking-wide text-foreground/60 px-1 flex-1">
          Contatos
        </div>
        {results && (
          <button
            onClick={clear}
            className="text-[10px] px-2 py-1 rounded bg-background/60 border border-border hover:bg-background/80 transition"
          >
            Limpar
          </button>
        )}
      </div>
      <div className="relative">
        <Search className="w-4 h-4 absolute left-2 top-1/2 -translate-y-1/2 opacity-60" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar..."
          className="w-full pl-8 pr-2 py-2 rounded-md bg-[var(--md-sys-color-surface-variant)]/40 border border-[var(--md-sys-color-outline-variant)] text-sm focus-ring focus:bg-[var(--md-sys-color-surface)] transition-colors"
          aria-label="Buscar contatos"
        />
      </div>
      {loading && (
        <div
          className="flex flex-col gap-2 mt-2"
          aria-live="polite"
          aria-busy="true"
        >
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-10 rounded-md bg-[var(--md-sys-color-surface-variant)]/40 animate-pulse"
            />
          ))}
        </div>
      )}
      <AnimatePresence initial={false} mode="popLayout">
        {!loading &&
          ordered.map((c) => (
            <motion.div
              key={c.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <div
                className={clsx(
                  "group rounded-lg px-3 py-2 transition-colors flex items-center gap-2 md-ripple",
                  selectedId === c.id
                    ? "bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] shadow-sm"
                    : "hover:bg-[var(--md-sys-color-primary)]/8"
                )}
              >
                <button
                  onClick={() => selectContact(c.id)}
                  className="flex-1 text-left flex items-center gap-2 min-w-0"
                >
                  <User className="w-4 h-4 opacity-70 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{c.name}</p>
                    <p className="text-[11px] opacity-70 truncate">
                      {c.phone} • {c.email}
                    </p>
                    {(c.locality || c.city) && (
                      <p className="text-[10px] opacity-60 truncate">
                        {(c.locality || c.city) +
                          (c.state ? `/${c.state}` : "")}{" "}
                        {c.neighborhood && `· ${c.neighborhood}`}
                      </p>
                    )}
                  </div>
                </button>
                <div className="relative" data-contact-menu>
                  <button
                    ref={(el) => (menuButtonRefs.current[c.id] = el)}
                    onClick={(e) => {
                      e.stopPropagation();
                      const willOpen = openMenuId !== c.id;
                      setOpenMenuId(willOpen ? c.id : null);
                      if (willOpen) {
                        // foco vai para primeiro item após render tick
                        setTimeout(() => {
                          const first = menuItemsRefs.current[c.id]?.[0];
                          first?.focus();
                        }, 0);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (
                        (e.key === "ArrowDown" ||
                          e.key === "Enter" ||
                          e.key === " ") &&
                        openMenuId !== c.id
                      ) {
                        e.preventDefault();
                        setOpenMenuId(c.id);
                        setTimeout(() => {
                          const first = menuItemsRefs.current[c.id]?.[0];
                          first?.focus();
                        }, 0);
                      }
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)] rounded p-1 md-ripple"
                    title="Ações"
                    aria-haspopup="menu"
                    aria-expanded={openMenuId === c.id}
                    aria-controls={
                      openMenuId === c.id ? `contact-menu-${c.id}` : undefined
                    }
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                  {openMenuId === c.id &&
                    createPortal(
                      <div
                        id={`contact-menu-${c.id}`}
                        data-contact-menu-portal
                        role="menu"
                        aria-label={`Ações para ${c.name}`}
                        className="fixed z-[600] w-52 rounded-lg border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface)] shadow-lg py-1 text-xs animate-in fade-in zoom-in focus:outline-none elev-2"
                        style={{
                          pointerEvents: "auto",
                          top:
                            (menuButtonRefs.current[
                              c.id
                            ]?.getBoundingClientRect()?.bottom || 0) +
                            4 +
                            window.scrollY,
                          left:
                            (menuButtonRefs.current[
                              c.id
                            ]?.getBoundingClientRect()?.right || 0) -
                            208 +
                            window.scrollX,
                        }}
                        tabIndex={-1}
                        onKeyDown={(e) => {
                          const list = menuItemsRefs.current[c.id] || [];
                          if (!list.length) return;
                          const currentIndex = list.indexOf(
                            document.activeElement
                          );
                          if (e.key === "ArrowDown") {
                            e.preventDefault();
                            const next = list[(currentIndex + 1) % list.length];
                            next?.focus();
                          } else if (e.key === "ArrowUp") {
                            e.preventDefault();
                            const prev =
                              list[
                                (currentIndex - 1 + list.length) % list.length
                              ];
                            prev?.focus();
                          } else if (e.key === "Home") {
                            e.preventDefault();
                            list[0]?.focus();
                          } else if (e.key === "End") {
                            e.preventDefault();
                            list[list.length - 1]?.focus();
                          } else if (e.key === "Escape") {
                            e.preventDefault();
                            setOpenMenuId(null);
                            menuButtonRefs.current[c.id]?.focus();
                          } else if (e.key === "Tab") {
                            setOpenMenuId(null);
                          }
                        }}
                      >
                        <button
                          ref={(el) => {
                            if (!menuItemsRefs.current[c.id])
                              menuItemsRefs.current[c.id] = [];
                            menuItemsRefs.current[c.id][0] = el;
                          }}
                          onClick={() => {
                            openViewContact(c.id);
                            setOpenMenuId(null);
                          }}
                          className="contact-menu-item md-ripple"
                          role="menuitem"
                          tabIndex={0}
                        >
                          <Eye className="w-3.5 h-3.5" /> Ver dados
                        </button>
                        <button
                          ref={(el) => {
                            if (!menuItemsRefs.current[c.id])
                              menuItemsRefs.current[c.id] = [];
                            menuItemsRefs.current[c.id][1] = el;
                          }}
                          onClick={() => {
                            openEditContact(c.id);
                            setOpenMenuId(null);
                          }}
                          className="contact-menu-item md-ripple"
                          role="menuitem"
                          tabIndex={0}
                        >
                          <Edit className="w-3.5 h-3.5" /> Editar
                        </button>
                        {c.phone && (
                          <a
                            ref={(el) => {
                              if (!menuItemsRefs.current[c.id])
                                menuItemsRefs.current[c.id] = [];
                              menuItemsRefs.current[c.id][2] = el;
                            }}
                            href={`https://wa.me/55${c.phone.replace(
                              /\D/g,
                              ""
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="contact-menu-item md-ripple"
                            role="menuitem"
                            tabIndex={0}
                          >
                            <Phone className="w-3.5 h-3.5" /> WhatsApp
                          </a>
                        )}
                        {c.email && (
                          <a
                            ref={(el) => {
                              if (!menuItemsRefs.current[c.id])
                                menuItemsRefs.current[c.id] = [];
                              // índice depende de telefone existir
                              const base = c.phone ? 3 : 2;
                              menuItemsRefs.current[c.id][base] = el;
                            }}
                            href={`mailto:${c.email}`}
                            className="contact-menu-item md-ripple"
                            role="menuitem"
                            tabIndex={0}
                          >
                            <Mail className="w-3.5 h-3.5" /> Email
                          </a>
                        )}
                        <button
                          ref={(el) => {
                            if (!menuItemsRefs.current[c.id])
                              menuItemsRefs.current[c.id] = [];
                            const base =
                              c.phone && c.email
                                ? 4
                                : c.phone || c.email
                                ? 3
                                : 2;
                            menuItemsRefs.current[c.id][base] = el;
                          }}
                          onClick={() => {
                            confirmDeleteContact(c.id);
                            setOpenMenuId(null);
                          }}
                          className="contact-menu-item md-ripple danger text-[var(--md-sys-color-error)]"
                          role="menuitem"
                          tabIndex={0}
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Excluir
                        </button>
                      </div>,
                      document.getElementById("overlays")
                    )}
                </div>
              </div>
            </motion.div>
          ))}
      </AnimatePresence>
    </aside>
  );
}
