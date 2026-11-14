// Stadt Land Fluss: Icon «Das Blatt» (Wahl Yanis 14.11.2026, Claude-Design-Seite Entwurf 2).
// Zettel mit drei Spalten (Haus, Berg, Welle), ausgefüllte Zeilen, Bleistift. Eigene Zeichnung, keine Emoji.
import { React } from "../../vendor/react-globals.js";

const SLF_ACC_DARK = "#8B6CFF";

function SlfLogo({ color, size }) {
  const S = size || 28;
  const K = "#14100E";
  const acc = color || SLF_ACC_DARK;
  return <svg width={S} height={S} viewBox="0 0 28 28" style={{ flexShrink: 0 }} aria-hidden="true">
    <g transform="rotate(-5 14 15)">
      <rect x="3" y="4" width="22" height="20.5" rx="2.4" fill="#F7F1E1" stroke={K} strokeWidth="1.2" />
      <path d="M3 10.2H25M10.3 4V24.5M17.7 4V24.5" stroke={K} strokeWidth="0.9" />
      <path d="M4.8 9 V6.6 L6.6 5.2 8.4 6.6V9Z" fill={acc} stroke={K} strokeWidth=".7" strokeLinejoin="round" />
      <path d="M11.6 9 13.6 5.6 14.6 7 15.4 6.2 16.6 9Z" fill="#3F8F42" stroke={K} strokeWidth=".7" strokeLinejoin="round" />
      <path d="M18.8 7.6C19.6 6.6 20.4 6.6 21.2 7.6S22.8 8.6 23.8 7.6" fill="none" stroke="#2D8BE0" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M5 14h3.6M12 14h4M19.4 14h3.6M5 18.4h3M12 18.4h3.4" stroke={acc} strokeWidth="1.1" strokeLinecap="round" />
    </g>
    <g transform="rotate(35 19.5 17.5) translate(12 10) scale(0.5357)">
      <rect x="12.2" y="2" width="3.6" height="16" rx="0.8" fill="#FFD84D" stroke={K} strokeWidth="1.1" />
      <rect x="12.2" y="2" width="3.6" height="2.8" rx="0.8" fill="#F28C9B" stroke={K} strokeWidth="1.1" />
      <path d="M12.2 18 14 22.4 15.8 18Z" fill="#F2C9A0" stroke={K} strokeWidth="1.1" strokeLinejoin="round" />
      <path d="M13.4 20.9 14 22.4 14.6 20.9Z" fill={K} />
    </g>
  </svg>;
}
export { SlfLogo, SLF_ACC_DARK };
