import { React } from "../../vendor/react-globals.js";

// Spiel-Icon Molotow: Jasskarte, deren Kartenfarbe eine grüne Weinflasche mit Stofftuch und
// Flamme ist (Molotow-Cocktail). Wahl Yanis 14.11.2026 (Claude-Design-Seite, Runde 2, Entwurf A,
// ohne Ecksymbole). Eigene Zeichnung.
const MOL_SPADE = "M12 2C8 7 3 10 3 14.5 3 17 5 19 7.4 19c1.4 0 2.7-.6 3.5-1.7-.2 1.7-.9 3-2.2 4.2h6.6c-1.3-1.2-2-2.5-2.2-4.2.8 1.1 2.1 1.7 3.5 1.7C19 19 21 17 21 14.5 21 10 16 7 12 2Z";

function MolotowLogo({ size }) {
  const S = size || 28;
  const K = "#14100E";
  return <svg width={S} height={S} viewBox="0 0 28 28" style={{ flexShrink: 0 }} aria-hidden="true">
    <g transform="rotate(-8 14 14)">
      <rect x="4.5" y="2.5" width="19" height="24" rx="2.6" fill="#FFF8EC" stroke={K} strokeWidth="1.1" />
      <g transform="translate(5.5 5) scale(0.70833)">
        <path d="M10.4 8.6H13.6V12C13.6 13 17 13.6 17 15.8V21.4A1.6 1.6 0 0 1 15.4 23H8.6A1.6 1.6 0 0 1 7 21.4V15.8C7 13.6 10.4 13 10.4 12Z" fill="#2F6B3A" stroke={K} strokeWidth="1.4" />
        <rect x="7.2" y="17.5" width="9.6" height="4.8" rx=".9" fill="#FFF8EC" stroke={K} strokeWidth=".85" />
        <path d="M9.6 8.2C10.4 7 13.6 7 14.4 8.2L13.9 10.2C12.9 9.6 11.1 9.6 10.1 10.2Z" fill="#E8D5A8" stroke={K} strokeWidth=".9" strokeLinejoin="round" />
        <path d="M10.3 9.8C8.4 11 7.3 13.6 7.9 16.6L9.8 16C9.4 13.8 10 11.8 11.6 10.4Z" fill="#E8D5A8" stroke={K} strokeWidth=".9" strokeLinejoin="round" />
        <path d="M12.2 0.6C14 2.6 15.4 3.8 15.4 5.6A3.4 3.4 0 0 1 8.6 5.6C8.6 4.2 9.5 3.3 10.2 2.4 10.4 3.5 10.9 4 11.5 4 11.1 2.9 11.3 1.8 12.2 0.6Z" fill="#FF8A2A" stroke={K} strokeWidth="1.2" strokeLinejoin="round" />
        <path d="M12.1 3.6C13 4.6 13.6 5.2 13.6 6.2A1.6 1.6 0 0 1 10.4 6.2C10.4 5.4 10.9 4.9 11.3 4.4 11.4 5 11.7 5.2 12 5.2 11.8 4.6 11.8 4.2 12.1 3.6Z" fill="#FFE27A" />
      </g>
    </g>
  </svg>;
}

export { MolotowLogo, MOL_SPADE };
