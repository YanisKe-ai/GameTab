// Knopf "Als Bild teilen" fuer Endpanels ohne Podest (Impostor, Werwolf, Mafia, Verraeter, Am ehesten).
// Nutzt dieselbe Logik wie das Podest: shareResultImage (Vorlage pro Spiel, Rueckfall auf das Standardbild), Teilen-Dialog oder Vorschau.
// Bucht nichts in die Statistik: der Knopf zeichnet nur ein Bild.
import { React } from "../vendor/react-globals.js";
import { useEffect, useState } from "../prelude.js";
import { gtEcWarm, shareResultImage } from "./result-card.js";
import { ShareImagePreview } from "./share-preview.js";

/* ranked: Liste {name, score?}; extra: Funktion oder Objekt (wird erst beim Klick ausgewertet); style: Rahmen des Knopfes im Stil des Spiels */
function ShareImageButton({ gameId, gameLabel, ranked, extra, theme, t, style }) {
  const [sharing, setSharing] = useState(false);
  const [preview, setPreview] = useState(null);
  useEffect(() => { gtEcWarm(gameId); }, [gameId]);
  return <>
    <button type="button" data-gt-share={gameId} className="press-fx" disabled={sharing} onClick={() => shareResultImage(gameId, gameLabel || "GameTab", ranked, setSharing, setPreview, t, theme, extra)} aria-label={t("shareResultAria")}
      style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7, minHeight: 44, cursor: sharing ? "default" : "pointer", opacity: sharing ? 0.7 : 1, ...style }}>
      <svg width={15} height={15} viewBox="0 0 24 24" fill="none" aria-hidden><path d="M12 3v12M12 3l-4 4M12 3l4 4M5 15v3a2 2 0 002 2h10a2 2 0 002-2v-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
      {t("shareResultLabel")}
    </button>
    <ShareImagePreview url={preview} onClose={() => setPreview(null)} t={t} />
  </>;
}

export { ShareImageButton };
