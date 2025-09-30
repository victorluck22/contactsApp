import React, { useState, useEffect } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { authService } from "../../services/authService.js";
import { Field, Input } from "../../components/Form.jsx";
import { Button } from "../../components/Button.jsx";

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get("token");
  const email = params.get("email");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [validLink, setValidLink] = useState(true);

  useEffect(() => {
    if (!token || !email) setValidLink(false);
  }, [token, email]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validLink) return;
    setError(null);
    if (password.length < 6) {
      setError("Senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (password !== confirm) {
      setError("As senhas não conferem.");
      return;
    }
    setSubmitting(true);
    try {
      await authService.resetPasswordTokenEmail({
        token,
        email,
        password,
        password_confirmation: confirm,
      });
      setSuccess(true);
      // opcional: redirecionar após delay
      // setTimeout(() => navigate('/login', { replace: true }), 3500);
    } catch (e) {
      setError(
        e.response?.data?.message ||
          e.message ||
          "Não foi possível redefinir a senha."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md mx-auto py-12 px-4 space-y-6"
      noValidate
    >
      <div className="space-y-1 text-center">
        <h1 className="text-lg font-semibold">Redefinir Senha</h1>
        {!validLink && (
          <p className="text-sm text-[var(--md-sys-color-error)]">
            Link inválido ou incompleto.
          </p>
        )}
        {success && (
          <p className="text-sm text-[var(--md-sys-color-primary)]">
            Senha alterada com sucesso!
          </p>
        )}
        {error && !success && (
          <p className="text-sm text-[var(--md-sys-color-error)]">{error}</p>
        )}
      </div>
      {!success && validLink && (
        <>
          <Field label="Nova Senha">
            <Input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
            />
          </Field>
          <Field label="Confirmar Senha">
            <Input
              type="password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              minLength={6}
            />
          </Field>
          <Button
            type="submit"
            className="w-full"
            disabled={submitting}
            loading={submitting}
          >
            Redefinir
          </Button>
        </>
      )}
      {success && (
        <div className="space-y-3">
          <Button
            type="button"
            className="w-full"
            onClick={() => navigate("/login", { replace: true })}
          >
            Ir para Login
          </Button>
        </div>
      )}
      <div className="text-xs flex justify-between">
        <Link to="/login" className="underline">
          Voltar
        </Link>
        <Link to="/register" className="underline">
          Criar conta
        </Link>
      </div>
    </form>
  );
}
