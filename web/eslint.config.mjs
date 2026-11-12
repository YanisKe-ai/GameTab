// Sicherheitsnetz: undeklarierte Namen (Strict Mode der Module), Hook-Regeln und ein paar Warnungen.
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";

export default [
  {
    files: ["**/*.js"],
    plugins: { "react-hooks": reactHooks },
    languageOptions: { ecmaVersion: "latest", sourceType: "module", parserOptions: { ecmaFeatures: { jsx: true } }, globals: { ...globals.browser } },
    rules: {
      "no-undef": "error",
      "react-hooks/rules-of-hooks": "warn" /* 7 Funde, siehe Bericht; auf error stellen, sobald behoben */,
      "no-unused-vars": ["warn", { args: "none" }],
      "no-dupe-keys": "warn",
      "no-unreachable": "warn",
    },
  },
];
