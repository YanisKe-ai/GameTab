// Im alten klassischen <script> waren alle Top-Level-Namen global (Funktionen sogar als window-Eigenschaft).
// Tests (page.evaluate) und Konsole rufen z. B. loadMatchLog() oder rankedPodium() direkt auf.
// Darum werden alle Modul-Exporte als nur lesbare, live gebundene window-Eigenschaften bereitgestellt.
// Bereits vorhandene window-Eigenschaften werden nicht ueberschrieben.
export function gtExpose(namespaces) {
  for (const ns of namespaces) {
    for (const key of Object.keys(ns)) {
      if (key in window) continue;
      try {
        Object.defineProperty(window, key, { get: () => ns[key], configurable: true, enumerable: false });
      } catch (e) { /* ignorieren */ }
    }
  }
}
