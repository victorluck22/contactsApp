import React, { useState, useEffect, useRef } from "react";
import { Sun, Moon, Plus, User, LogOut, Search } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "./Button.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useUi } from "../context/UiContext.jsx";
import { createPortal } from "react-dom";

export function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { authenticated, user, logout } = useAuth();
  const { openNewContact, openSearch, openAccount } = useUi();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const anchorRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    function handle(e) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        anchorRef.current &&
        !anchorRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    }
    function handleEsc(e) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("mousedown", handle);
    window.addEventListener("keydown", handleEsc);
    return () => {
      window.removeEventListener("mousedown", handle);
      window.removeEventListener("keydown", handleEsc);
    };
  }, [open]);

  return (
    <nav className="h-14 px-4 gap-4 flex items-center bg-[var(--md-sys-color-surface)]/95 backdrop-blur border-b border-[var(--md-sys-color-outline-variant)] elev-1">
      <button
        type="button"
        onClick={() => navigate("/")}
        className="font-semibold tracking-wide cursor-pointer select-none text-[var(--md-sys-color-on-surface)] bg-transparent outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded"
      >
        ContactsApp
      </button>
      {authenticated && (
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="text"
            className="md:hidden h-9 w-9 p-0 rounded-full md-ripple justify-center"
            aria-label="Buscar"
            onClick={openSearch}
          >
            <Search className="w-5 h-5" />
          </Button>
          <Button
            type="button"
            variant="tonal"
            onClick={openNewContact}
            className="h-9"
          >
            <Plus className="w-4 h-4" /> Novo
          </Button>
        </div>
      )}
      <div className="ml-auto flex items-center gap-1">
        <Button
          type="button"
          variant="text"
          onClick={toggleTheme}
          className="h-9 w-9 p-0 rounded-full md-ripple justify-center"
          aria-label="Alternar tema"
        >
          {theme === "dark" ? (
            <Sun className="w-5 h-5" />
          ) : (
            <Moon className="w-5 h-5" />
          )}
        </Button>
        {authenticated ? (
          <div className="relative z-[210]" ref={anchorRef}>
            <Button
              type="button"
              variant="text"
              onClick={() => setOpen((o) => !o)}
              className="h-9 pl-3 pr-2 gap-2"
              aria-haspopup="menu"
              aria-expanded={open}
            >
              <User className="w-4 h-4" />
              <span className="hidden sm:inline max-w-[120px] truncate text-[var(--md-sys-color-on-surface-variant)]">
                {user?.name || user?.email}
              </span>
            </Button>
            {open &&
              createPortal(
                <div
                  ref={dropdownRef}
                  role="menu"
                  className="fixed z-[500] mt-1 w-52 rounded-lg border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface)] shadow-lg py-1 text-sm elev-2 animate-in fade-in"
                  style={{
                    top:
                      (anchorRef.current?.getBoundingClientRect().bottom || 0) +
                      4 +
                      window.scrollY,
                    left:
                      (anchorRef.current?.getBoundingClientRect().right || 0) -
                      208 +
                      window.scrollX,
                  }}
                >
                  <button
                    onClick={() => {
                      openAccount();
                      setOpen(false);
                    }}
                    className="contact-menu-item md-ripple"
                    role="menuitem"
                  >
                    <User className="w-4 h-4" /> Minha Conta
                  </button>
                  <button
                    onClick={() => {
                      logout();
                      navigate("/login");
                    }}
                    className="contact-menu-item md-ripple danger text-[var(--md-sys-color-error)]"
                    role="menuitem"
                  >
                    <LogOut className="w-4 h-4" /> Sair
                  </button>
                </div>,
                document.body
              )}
          </div>
        ) : (
          <Link
            to="/login"
            className="text-sm px-3 py-2 rounded-md hover:bg-[var(--md-sys-color-primary)]/10 md-ripple"
          >
            Entrar
          </Link>
        )}
      </div>
    </nav>
  );
}
