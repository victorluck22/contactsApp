/* ESLint Config Base */
module.exports = {
  root: true,
  env: { browser: true, es2022: true, node: true },
  parserOptions: { ecmaVersion: "latest", sourceType: "module" },
  settings: { react: { version: "detect" } },
  plugins: ["react", "react-hooks", "jsx-a11y", "react-refresh"],
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:jsx-a11y/recommended",
  ],
  rules: {
    // React
    "react/prop-types": "off",
    "react-refresh/only-export-components": [
      "warn",
      { allowConstantExport: true },
    ],
    // Acessibilidade: permitir role custom quando necessário
    "jsx-a11y/no-noninteractive-tabindex": "warn",

    // (Regra custom removida temporariamente; considerar plugin futuro)
  },
  overrides: [
    {
      files: ["**/__tests__/**/*.{js,jsx}", "**/*.test.{js,jsx}"],
      env: { jest: true },
      globals: {
        describe: "readonly",
        it: "readonly",
        test: "readonly",
        expect: "readonly",
        vi: "readonly",
        beforeAll: "readonly",
        beforeEach: "readonly",
        afterAll: "readonly",
        afterEach: "readonly",
      },
      rules: {
        // Permitir expect/describe/it globais providos pelo Vitest
      },
    },
  ],
  // Definição do plugin local
};
