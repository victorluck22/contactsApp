import React, { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useAuth } from "../../context/AuthContext.jsx";
import { Field, Input } from "../../components/Form.jsx";
import { Button } from "../../components/Button.jsx";
import { Link, Navigate } from "react-router-dom";

export default function RegisterPage() {
  const { register, authenticated } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const reduce = useReducedMotion();

  if (authenticated) return <Navigate to="/" replace />;

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);
    try {
      if (form.password !== form.confirm)
        throw new Error("As senhas não conferem");
      const res = await register(
        form.name,
        form.email,
        form.password,
        form.confirm
      );
      if (res?.success) {
        setSuccessMsg(
          res.message ||
            "Cadastro realizado. Verifique seu e-mail para ativar a conta."
        );
      } else {
        setError(
          res?.message ||
            "Não foi possível concluir o cadastro. Tente novamente."
        );
      }
    } catch (err) {
      console.log(err);
      const msg =
        err?.response?.data?.message || err.message || "Erro no cadastro";
      setError(msg);
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
            Criar conta
          </p>
        </div>
      </motion.div>
      <h1 className="sr-only">Criar conta</h1>
      <AnimatePresence mode="wait">
        {error && !successMsg && (
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
        {successMsg && (
          <motion.div
            key="success"
            className="text-sm text-[var(--md-sys-color-primary)]"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.25 } }}
            exit={{ opacity: 0, y: -6, transition: { duration: 0.2 } }}
          >
            {successMsg}
          </motion.div>
        )}
      </AnimatePresence>
      <motion.div variants={item}>
        <Field label="Nome">
          <Input
            name="name"
            required
            value={form.name}
            onChange={handleChange}
          />
        </Field>
      </motion.div>
      <motion.div variants={item}>
        <Field label="E-mail">
          <Input
            name="email"
            type="email"
            required
            value={form.email}
            onChange={handleChange}
          />
        </Field>
      </motion.div>
      <motion.div variants={item}>
        <Field label="Senha">
          <Input
            name="password"
            type="password"
            required
            value={form.password}
            onChange={handleChange}
          />
        </Field>
      </motion.div>
      <motion.div variants={item}>
        <Field label="Confirmar Senha">
          <Input
            name="confirm"
            type="password"
            required
            value={form.confirm}
            onChange={handleChange}
          />
        </Field>
      </motion.div>
      <motion.div variants={item}>
        <Button
          type="submit"
          className="w-full"
          loading={loading}
          disabled={!!successMsg}
        >
          {successMsg ? "Aguardando verificação" : "Cadastrar"}
        </Button>
      </motion.div>
      <motion.div variants={item} className="text-xs flex justify-between">
        <Link to="/login" className="underline">
          Entrar
        </Link>
        <Link to="/forgot-password" className="underline">
          Esqueci a senha
        </Link>
      </motion.div>
    </motion.form>
  );
}
