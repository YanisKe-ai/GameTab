// Nur Sicherheitsnetz fuer den Strict Mode der Module: undeklarierte Namen finden.
import globals from "globals";

export default [
  {
    files: ["**/*.js"],
    languageOptions: { ecmaVersion: "latest", sourceType: "module", parserOptions: { ecmaFeatures: { jsx: true } }, globals: { ...globals.browser } },
    rules: { "no-undef": "error" },
  },
];
