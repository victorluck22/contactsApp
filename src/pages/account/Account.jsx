import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useContacts } from "../../context/ContactsContext.jsx";
import { Button } from "../../components/Button.jsx";
import { InputOutlined } from "../../components/Form.jsx";
import { authService } from "../../services/authService.js";

export default function AccountPage() {
  const { user, logout } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [nameDraft, setNameDraft] = useState(user?.name || "");
  const { contacts } = useContacts();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleDelete = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const ok = await authService.deleteAccount(password);
      if (!ok) throw new Error("Falha ao excluir");
      // Limpa tudo local e logout
      localStorage.removeItem("app_auth_v1");
      // Em produção chamar endpoint de remoção de contatos associados
      logout();
      setSuccess("Conta excluída");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Removido hash modalMode: edição controlada localmente

  if (!user) return <div className="p-4">Não autenticado.</div>;

  const saveProfile = (e) => {
    e.preventDefault();
    // Mock: apenas salva no localStorage user
    const raw = localStorage.getItem("app_auth_v1");
    if (raw) {
      const parsed = JSON.parse(raw);
      parsed.user.name = nameDraft;
      localStorage.setItem("app_auth_v1", JSON.stringify(parsed));
    }
    window.location.hash = "";
    setEditMode(false);
  };

  const Container = ({ children }) => (
    <div className="p-4 space-y-6 max-w-xl">{children}</div>
  );

  return (
    <Container>
      <div>
        <h1 className="text-xl font-semibold mb-2">Minha Conta</h1>
        <p className="text-sm opacity-75">
          Gerencie os dados da sua conta e exclusão permanente.
        </p>
      </div>
      {!editMode && (
        <div className="space-y-2 text-sm rounded-xl p-4 bg-[var(--md-sys-color-surface)] elev-1 border border-[var(--md-sys-color-outline-variant)]">
          <p>
            <span className="font-medium">Nome:</span> {user.name}
          </p>
          <p>
            <span className="font-medium">E-mail:</span> {user.email}
          </p>
          <p>
            <span className="font-medium">Contatos cadastrados:</span>{" "}
            {contacts.length}
          </p>
          <div className="pt-2 flex justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditMode(true)}
              className="text-xs px-2 py-1 h-7"
            >
              Editar Dados
            </Button>
          </div>
        </div>
      )}
      {editMode && (
        <form
          onSubmit={saveProfile}
          className="space-y-4 rounded-xl p-4 bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] elev-1"
        >
          <h2 className="text-sm font-semibold">Editar Dados</h2>
          <InputOutlined
            label="Nome"
            value={nameDraft}
            onChange={(e) => setNameDraft(e.target.value)}
            required
            data-preserve-focus
            className="w-full"
          />
          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setEditMode(false);
                setNameDraft(user.name);
              }}
            >
              Cancelar
            </Button>
            <Button type="submit">Salvar</Button>
          </div>
        </form>
      )}
      <form
        onSubmit={handleDelete}
        className="space-y-4 rounded-xl p-4 border border-[var(--md-sys-color-error)]/40 bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)]"
      >
        <h2 className="font-semibold text-[var(--md-sys-color-error)]">
          Excluir Conta
        </h2>
        <p className="text-xs opacity-70">
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
          data-preserve-focus
          className="w-full"
        />
        <Button
          type="submit"
          variant="outline"
          className="border-[var(--md-sys-color-error)] text-[var(--md-sys-color-error)] hover:bg-[var(--md-sys-color-error)]/10"
          loading={loading}
        >
          Excluir definitivamente
        </Button>
      </form>
    </Container>
  );
}
