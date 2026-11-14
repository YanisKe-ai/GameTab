// Stadt Land Fluss: Icon (Notizblock mit Buchstabe und Bleistift). Nur eigene Zeichnung, keine Emoji.
import { React } from "../../vendor/react-globals.js";

const SLF_ACC_DARK = "#8B6CFF";

function SlfLogo({ color, size }) {
  const S = size || 28;
  const K = "#14100E";
  const acc = color || SLF_ACC_DARK;
  return <svg width={S} height={S} viewBox="0 0 28 28" style={{ flexShrink: 0 }} aria-hidden="true">
    <g transform="rotate(-6 13 15)">
      <rect x="4" y="4.5" width="16.5" height="20" rx="2.2" fill="#F7F1E1" stroke={K} strokeWidth="1.3" />
      <rect x="4" y="4.5" width="16.5" height="4.6" rx="2.2" fill={acc} stroke={K} strokeWidth="1.3" />
      <path d="M7.6 3 v3.2 M12.2 3 v3.2 M16.8 3 v3.2" stroke={K} strokeWidth="1.6" strokeLinecap="round" />
      <path d="M6.7 22.4 L10.9 11.6 L15.1 22.4 M8.4 18.6 h5" fill="none" stroke={K} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6.7 22.4 L10.9 11.6 L15.1 22.4 M8.4 18.6 h5" fill="none" stroke={acc} strokeWidth="0.6" strokeLinecap="round" strokeLinejoin="round" />
    </g>
    <g transform="rotate(38 21.5 17.5)">
      <rect x="19.7" y="8" width="3.6" height="14" rx="0.8" fill="#FFD84D" stroke={K} strokeWidth="1.1" />
      <path d="M19.7 22 L21.5 26 L23.3 22 Z" fill="#F2C9A0" stroke={K} strokeWidth="1.1" strokeLinejoin="round" />
      <path d="M21.5 24.6 L21.5 26 L20.9 24.6 Z" fill={K} />
      <rect x="19.7" y="8" width="3.6" height="2.6" rx="0.8" fill="#F28C9B" stroke={K} strokeWidth="1.1" />
    </g>
  </svg>;
}
export { SlfLogo, SLF_ACC_DARK };
