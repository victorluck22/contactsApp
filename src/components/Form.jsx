import React, { useId, useState, useEffect } from "react";
import clsx from "clsx";

// Field agora suporta variant="outlined" (default) ou "stacked" (antigo layout vertical)
export function Field({
  label,
  error,
  children,
  variant = "outlined",
  className,
}) {
  if (variant === "stacked") {
    return (
      <label className={clsx("flex flex-col gap-1 text-sm", className)}>
        <span className="font-medium">{label}</span>
        {children}
        {error && (
          <span className="text-xs text-[var(--md-sys-color-error)]">
            {error}
          </span>
        )}
      </label>
    );
  }
  // outlined
  const onlyChild = React.Children.only(children);
  const isOutlined =
    onlyChild?.type?.displayName === "InputOutlined" ||
    onlyChild?.type?.name === "InputOutlined";
  if (isOutlined) {
    return (
      <div
        className={clsx("relative text-sm", className)}
        data-field-variant="outlined"
      >
        {children}
        {error && (
          <span className="mt-1 block text-xs text-[var(--md-sys-color-error)]">
            {error}
          </span>
        )}
      </div>
    );
  }
  // fallback: manter acessibilidade original com <label>
  return (
    <label className={clsx("flex flex-col gap-1 text-sm", className)}>
      <span className="font-medium">{label}</span>
      {children}
      {error && (
        <span className="text-xs text-[var(--md-sys-color-error)]">
          {error}
        </span>
      )}
    </label>
  );
}

// Input base (usado internamente ou para casos não-outlined)
export const Input = React.forwardRef(function Input(
  { className, error, ...rest },
  ref
) {
  return (
    <input
      ref={ref}
      className={clsx(
        "rounded-md border border-muted bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/50",
        error &&
          "border-[var(--md-sys-color-error)] focus:ring-[var(--md-sys-color-error)]",
        className
      )}
      {...rest}
    />
  );
});

// InputOutlined com label flutuante estilo Material 3
export const InputOutlined = React.forwardRef(function InputOutlined(
  {
    label,
    error,
    className,
    value,
    defaultValue,
    onChange,
    id,
    required,
    suppressLabel = false,
    ...rest
  },
  ref
) {
  const autoId = useId();
  const inputId = id || autoId;
  const [focused, setFocused] = useState(false);
  // Modelo controlado simples: se 'value' é passado, assume controlled; senão usa estado interno inicializado por defaultValue
  const isControlled = value !== undefined;
  const [uncontrolled, setUncontrolled] = useState(defaultValue || "");
  const currentValue = isControlled ? value : uncontrolled;
  const float = focused || currentValue.toString().length > 0;

  const handleChange = (e) => {
    if (!isControlled) setUncontrolled(e.target.value);
    onChange?.(e);
  };

  // Salvaguarda: se o componente acha que está focado mas perdeu o activeElement para um container, re-foca.
  useEffect(() => {
    if (!focused) return;
    const el = document.getElementById(inputId);
    if (!el) return;
    const active = document.activeElement;
    if (
      active !== el &&
      active?.closest?.(".md-input-outline-group")?.contains(el)
    ) {
      // Re-focar apenas se o novo foco não for outro campo de formulário válido.
      const tag = active?.tagName;
      if (!tag || !["INPUT", "TEXTAREA", "SELECT", "BUTTON"].includes(tag)) {
        try {
          el.focus();
        } catch {
          // noop: tentativa de refocus falhou silenciosamente
        }
      }
    }
  }, [focused, inputId, currentValue]);

  return (
    <div className={clsx("md-input-outline-group", className)}>
      <div
        className={clsx(
          "relative border rounded-md px-3 pt-3 pb-1 flex items-start bg-[var(--md-sys-color-surface)]",
          "transition-colors",
          error
            ? "border-[var(--md-sys-color-error)]"
            : focused
            ? "border-[var(--md-sys-color-primary)]"
            : "border-[var(--md-sys-color-outline)]",
          "hover:border-[var(--md-sys-color-primary)]/70"
        )}
      >
        <input
          id={inputId}
          ref={ref}
          className={clsx(
            "peer w-full bg-transparent text-sm outline-none placeholder-transparent",
            "disabled:opacity-60"
          )}
          aria-invalid={!!error}
          aria-label={label}
          value={currentValue}
          onChange={handleChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(true)}
          required={required}
          type={rest.type || "text"}
          {...rest}
        />
        {!suppressLabel && (
          <label
            htmlFor={inputId}
            className={clsx(
              "absolute left-3 flex items-center px-1 text-xs transition-all bg-[var(--md-sys-color-surface)]",
              "pointer-events-none",
              float
                ? "-top-2 text-[10px] text-[var(--md-sys-color-primary)]"
                : "top-2 text-[var(--md-sys-color-on-surface-variant)] text-sm"
            )}
          >
            {label}
            {required && (
              <span
                aria-hidden="true"
                className="ml-0.5 text-[var(--md-sys-color-error)]"
              >
                *
              </span>
            )}
          </label>
        )}
      </div>
    </div>
  );
});
