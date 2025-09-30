import React, { forwardRef } from "react";
import { Loader2 } from "lucide-react";
import clsx from "clsx";

// Base estilo Material 3 adaptado
const base = [
  "relative inline-flex items-center justify-center gap-2",
  "font-medium rounded-md select-none text-sm",
  "h-10",
  "transition-[background,color,box-shadow] duration-200",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
  "disabled:opacity-60 disabled:cursor-not-allowed",
  "active:scale-[0.98]",
  "md-ripple", // container para ripple (será aplicado quando util existir)
].join(" ");

// Variantes Material 3
const materialVariants = {
  filled: [
    "px-5",
    "bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)]",
    "hover:shadow-md elev-1 hover:elev-2",
  ].join(" "),
  tonal: [
    "px-5",
    "bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)]",
    "hover:elev-1",
  ].join(" "),
  outlined: [
    "px-5 border",
    "border-[var(--md-sys-color-outline)] text-[var(--md-sys-color-primary)]",
    "hover:bg-[var(--md-sys-color-primary)]/10",
  ].join(" "),
  text: [
    "px-3",
    "text-[var(--md-sys-color-primary)]",
    "hover:bg-[var(--md-sys-color-primary)]/10",
  ].join(" "),
  elevated: [
    "px-5",
    "bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-primary)]",
    "shadow-sm elev-1 hover:elev-2 hover:bg-[var(--md-sys-color-primary)]/10",
  ].join(" "),
};

// Aliases para compatibilidade retro
const legacyAliases = {
  solid: "filled",
  ghost: "text",
  outline: "outlined",
};

function resolveVariant(variant) {
  if (materialVariants[variant]) return variant;
  if (legacyAliases[variant]) return legacyAliases[variant];
  return "filled"; // fallback
}

export const Button = forwardRef(function Button(
  {
    as: Comp = "button",
    variant = "filled",
    loading = false,
    className,
    children,
    disabled,
    ...rest
  },
  ref
) {
  const v = resolveVariant(variant);
  return (
    <Comp
      ref={ref}
      data-variant={v}
      data-auto-ripple=""
      className={clsx(base, materialVariants[v], className)}
      disabled={disabled || loading}
      {...rest}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </Comp>
  );
});
