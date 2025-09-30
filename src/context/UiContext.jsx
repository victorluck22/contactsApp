/* eslint-disable react-refresh/only-export-components */ // Arquivo de contexto expõe provider + hook.
import React, { createContext, useContext, useState, useCallback } from "react";

const UiContext = createContext(null);

export function UiProvider({ children }) {
  const [newContactOpen, setNewContactOpen] = useState(false);
  const [editContactTarget, setEditContactTarget] = useState(null); // id
  const [searchOpen, setSearchOpen] = useState(false);
  const [viewContactId, setViewContactId] = useState(null); // id
  const [deleteContactId, setDeleteContactId] = useState(null); // id
  const [accountOpen, setAccountOpen] = useState(false);

  const openNewContact = useCallback(() => setNewContactOpen(true), []);
  const closeNewContact = useCallback(() => setNewContactOpen(false), []);
  const openEditContact = useCallback((id) => setEditContactTarget(id), []);
  const closeEditContact = useCallback(() => setEditContactTarget(null), []);
  const openSearch = useCallback(() => setSearchOpen(true), []);
  const closeSearch = useCallback(() => setSearchOpen(false), []);
  const openViewContact = useCallback((id) => setViewContactId(id), []);
  const closeViewContact = useCallback(() => setViewContactId(null), []);
  const confirmDeleteContact = useCallback((id) => setDeleteContactId(id), []);
  const cancelDeleteContact = useCallback(() => setDeleteContactId(null), []);
  const openAccount = useCallback(() => setAccountOpen(true), []);
  const closeAccount = useCallback(() => setAccountOpen(false), []);

  return (
    <UiContext.Provider
      value={{
        newContactOpen,
        openNewContact,
        closeNewContact,
        editContactTarget,
        openEditContact,
        closeEditContact,
        searchOpen,
        openSearch,
        closeSearch,
        viewContactId,
        openViewContact,
        closeViewContact,
        deleteContactId,
        confirmDeleteContact,
        cancelDeleteContact,
        accountOpen,
        openAccount,
        closeAccount,
      }}
    >
      {children}
    </UiContext.Provider>
  );
}

export function useUi() {
  const ctx = useContext(UiContext);
  if (!ctx) throw new Error("useUi deve ser usado dentro de UiProvider");
  return ctx;
}
