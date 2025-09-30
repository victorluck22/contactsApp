import React, { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useAuth } from "../../context/AuthContext.jsx";
import { Field, Input } from "../../components/Form.jsx";
import { Button } from "../../components/Button.jsx";
import { Link } from "react-router-dom";

export default function ForgotPasswordPage() {
  const { requestPasswordReset } = useAuth();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const reduce = useReducedMotion();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await requestPasswordReset(email);
      setSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: reduce
        ? { duration: 0.01 }
        : { staggerChildren: 0.075, delayChildren: 0.1 },
    },
  };
  const item = {
    hidden: { opacity: 0, y: reduce ? 0 : 16, scale: reduce ? 1 : 0.975 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: reduce ? 0.001 : 0.45, ease: [0.16, 1, 0.3, 1] },
    },
  };
  const emblem = {
    hidden: { rotate: 0, scale: 0.9, opacity: 0 },
    show: {
      rotate: reduce ? 0 : 360,
      scale: 1,
      opacity: 1,
      transition: { duration: reduce ? 0.15 : 0.9, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="w-full space-y-6"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <motion.div className="flex items-center gap-2" variants={item}>
        <motion.div
          variants={emblem}
          className="w-9 h-9 rounded-md bg-accent/90 text-accentForeground flex items-center justify-center font-bold text-lg shadow-sm select-none will-change-transform"
        >
          C
        </motion.div>
        <div>
          <p className="font-semibold leading-tight">ContactsApp</p>
          <p className="text-[11px] uppercase tracking-wide opacity-60">
            Recuperar senha
          </p>
        </div>
      </motion.div>
      <h1 className="sr-only">Recuperar senha</h1>
      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            key="error"
            className="text-sm text-[var(--md-sys-color-error)]"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.25 } }}
            exit={{ opacity: 0, y: -6, transition: { duration: 0.2 } }}
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>
      <motion.div variants={item}>
        {sent ? (
          <div className="text-sm text-[var(--md-sys-color-primary)]">
            Se existir uma conta com este e-mail, o link foi enviado.
          </div>
        ) : (
          <Field label="E-mail">
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>
        )}
      </motion.div>
      <motion.div variants={item}>
        <Button
          type="submit"
          className="w-full"
          disabled={sent}
          loading={loading}
        >
          {sent ? "Enviado" : "Enviar link"}
        </Button>
      </motion.div>
      <motion.div variants={item} className="text-xs flex justify-between">
        <Link to="/login" className="underline">
          Voltar
        </Link>
        <Link to="/register" className="underline">
          Criar conta
        </Link>
      </motion.div>
    </motion.form>
  );
}
