import React, { useEffect, useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { authService } from "../../services/authService.js";
import { Button } from "../../components/Button.jsx";

export default function VerifyEmailPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const id = params.get("id");
  const hash = params.get("hash");
  const expires = params.get("expires");
  const signature = params.get("signature");
  const [status, setStatus] = useState("pending"); // pending | success | error | invalid
  const [message, setMessage] = useState("Validando seu e-mail...");

  useEffect(() => {
    if (!id || !hash || !expires || !signature) {
      setStatus("invalid");
      setMessage("Link inválido ou incompleto.");
      return;
    }
    //console.log("Verificando email com", { id, hash, expires, signature });
    let cancelled = false;
    (async () => {
      try {
        const res = await authService.verifyEmail({
          id,
          hash,
          expires,
          signature,
        });

        if (cancelled) return;
        if (res.success) {
          setStatus("success");
          setMessage("E-mail verificado com sucesso!");
          // Opcional: se backend retornar user e token, poderíamos logar automaticamente.
          // navigate('/login', { replace: true, state: { verified: true } });
        } else {
          setStatus("error");
          setMessage(res.message || "Não foi possível verificar o e-mail.");
        }
      } catch (e) {
        if (cancelled) return;
        setStatus("error");
        setMessage(
          e.response?.data?.message || e.message || "Erro na verificação."
        );
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, hash, expires, signature]);

  const colorMap = {
    pending: "text-[var(--md-sys-color-tertiary)]",
    success: "text-[var(--md-sys-color-primary)]",
    error: "text-[var(--md-sys-color-error)]",
    invalid: "text-[var(--md-sys-color-secondary)]",
  };

  return (
    <div className="w-full max-w-md mx-auto py-12 px-4 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-lg font-semibold">Verificação de E-mail</h1>
        <p className={`text-sm ${colorMap[status]}`}>{message}</p>
      </div>
      {status === "success" && (
        <div className="flex flex-col items-center gap-3">
          <Button
            onClick={() => navigate("/login", { state: { verified: true } })}
          >
            Ir para login
          </Button>
        </div>
      )}
      {(status === "error" || status === "invalid") && (
        <div className="flex flex-col items-center gap-3 text-sm">
          <p>Peça um novo link de verificação caso necessário.</p>
          <Link to="/login" className="underline text-accent">
            Voltar ao login
          </Link>
        </div>
      )}
      {status === "pending" && (
        <div className="text-xs opacity-70 text-center animate-pulse">
          Processando...
        </div>
      )}
    </div>
  );
}
