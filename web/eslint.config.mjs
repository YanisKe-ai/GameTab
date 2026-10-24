// Nur Sicherheitsnetz fuer den Strict Mode der Module: undeklarierte Namen finden.
import globals from "globals";

export default [
  {
    files: ["**/*.js"],
    languageOptions: { ecmaVersion: "latest", sourceType: "module", globals: { ...globals.browser } },
    rules: { "no-undef": "error" },
  },
];
