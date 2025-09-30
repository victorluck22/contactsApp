/**
 * Regra: no-tailwind-color-utilities
 * Impede uso de classes Tailwind de cor direta (bg-red-500, text-green-600, etc.)
 * para estados que devem usar tokens MD3 ou utilitários semânticos.
 */

const FORBIDDEN_REGEX =
  /\b(?:bg|text|border)-(?:red|green|emerald|lime|yellow|amber|orange|rose|pink|fuchsia|purple|violet|indigo|blue|sky|cyan|teal)-[0-9]{3}\b/;

module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Evita uso de utilitários de cor Tailwind diretos em favor de tokens MD3",
      recommended: false,
    },
    schema: [],
    messages: {
      forbidden:
        "Classe de cor Tailwind '{{cls}}' proibida. Use tokens MD3 (var(--md-sys-color-*)) ou utilitários semânticos (.alert-*).",
    },
  },
  create(context) {
    function checkLiteral(node, value) {
      if (typeof value !== "string") return;
      // dividir por espaços para granularidade
      const parts = value.split(/\s+/);
      for (const p of parts) {
        if (FORBIDDEN_REGEX.test(p)) {
          context.report({ node, messageId: "forbidden", data: { cls: p } });
        }
      }
    }

    return {
      JSXAttribute(attr) {
        if (!attr.value) return;
        if (
          attr.name &&
          (attr.name.name === "className" || attr.name.name === "class") &&
          attr.value.type === "Literal"
        ) {
          checkLiteral(attr.value, attr.value.value);
        }
        // Expressões Template Literals simples
        if (
          attr.name &&
          (attr.name.name === "className" || attr.name.name === "class") &&
          attr.value.type === "JSXExpressionContainer" &&
          attr.value.expression.type === "Literal"
        ) {
          checkLiteral(attr.value.expression, attr.value.expression.value);
        }
      },
      Literal(node) {
        // Cobrir casos isolados (ex: arrays de classes)
        checkLiteral(node, node.value);
      },
    };
  },
};
