// Ripple utility: attachRipple(element) adiciona efeito Material-like
export function attachRipple(el) {
  if (!el || el.__rippleAttached) return;
  el.__rippleAttached = true;
  el.addEventListener("pointerdown", (e) => {
    if (el.disabled) return;
    const rect = el.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const span = document.createElement("span");
    span.className = "md-ripple-wave";
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    span.style.width = span.style.height = size + "px";
    span.style.left = x + "px";
    span.style.top = y + "px";
    el.appendChild(span);
    span.addEventListener("animationend", () => span.remove());
  });
}

// Auto inicialização simples para qualquer elemento com classe md-ripple + data-auto-ripple
export function initAutoRipples(root = document) {
  const nodes = root.querySelectorAll(".md-ripple[data-auto-ripple]");
  nodes.forEach(attachRipple);
}
