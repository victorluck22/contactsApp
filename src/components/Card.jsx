import React from "react";
import clsx from "clsx";

/*
 * Material 3 Card
 * Variants implementados:
 * - elevated (padrão): surface + sombra leve (elev-1), sem borda
 * - filled: surface-variant + sem borda, sem sombra
 * - outlined: surface + borda outline-variant, sem sombra
 * - tonal: secondary-container + texto on-secondary-container
 * - flat: surface simples, sem sombra/borda (para uso dentro de outros containers)
 * Props adicionais:
 * - interactive: aplica hover/transition + focus-ring e cursor pointer
 */

const variantClasses = {
  elevated:
    "bg-[var(--md-sys-color-surface)] elev-1 shadow-sm transition-shadow", // sombra leve
  filled:
    "bg-[var(--md-sys-color-surface-variant)] text-[var(--md-sys-color-on-surface-variant)]", // container preenchido
  outlined:
    "bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline-variant)]", // borda
  tonal:
    "bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)]", // tonal secundário
  flat: "bg-[var(--md-sys-color-surface)]", // neutro
};

export function Card({
  className,
  children,
  variant = "elevated",
  interactive = false,
  as: Component = "div",
  ...rest
}) {
  const base = "rounded-xl p-4 relative overflow-hidden"; // overflow p/ possíveis ripples futuros
  const inter = interactive
    ? "cursor-pointer transition-colors focus-ring state-layer hover:shadow-md"
    : "";
  const variantCls = variantClasses[variant] || variantClasses.elevated;

  // outlined não precisa sombra; elevated não precisa borda explícita
  const finalCls = clsx(base, variantCls, inter, className, {
    "border border-[var(--md-sys-color-outline-variant)]": variant === "flat", // flat recebe borda só se caller quiser? mantemos opcional; aqui não forçamos
  });

  return (
    <Component className={finalCls} data-variant={variant} {...rest}>
      {children}
    </Component>
  );
}

export function CardTitle({ children, className }) {
  return (
    <h3
      className={clsx(
        "text-base font-semibold tracking-tight mb-2 text-[var(--md-sys-color-on-surface)]",
        className
      )}
    >
      {children}
    </h3>
  );
}

export function CardDescription({ children, className }) {
  return (
    <p
      className={clsx(
        "text-sm leading-relaxed mb-2 text-[var(--md-sys-color-on-surface-variant)]",
        className
      )}
    >
      {children}
    </p>
  );
}
