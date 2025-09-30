/** CommonJS version of no-tailwind-color-utilities */
const FORBIDDEN_REGEX =
  /\b(?:bg|text|border)-(?:red|green|emerald|lime|yellow|amber|orange|rose|pink|fuchsia|purple|violet|indigo|blue|sky|cyan|teal)-[0-9]{3}\b/;

module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Evita utilitários de cor Tailwind diretos",
      recommended: false,
    },
    schema: [],
    messages: {
      forbidden:
        "Classe '{{cls}}' proibida. Use tokens MD3 ou utilitários semânticos.",
    },
  },
  create(context) {
    function checkLiteral(node, value) {
      if (typeof value !== "string") return;
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
        const name = attr.name && attr.name.name;
        if (!name || (name !== "className" && name !== "class")) return;
        if (attr.value.type === "Literal")
          checkLiteral(attr.value, attr.value.value);
        if (
          attr.value.type === "JSXExpressionContainer" &&
          attr.value.expression.type === "Literal"
        ) {
          checkLiteral(attr.value.expression, attr.value.expression.value);
        }
      },
      Literal(node) {
        checkLiteral(node, node.value);
      },
    };
  },
};
