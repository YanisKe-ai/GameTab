// Verräter-Kapuze in Schwarz auf Creme (nur Modus Hell). Form wie TraitorLogo in games/s8/shared.js.
import { React } from "../../vendor/react-globals.js";
import { HELL } from "../../themes/hell.js";

export function TraitorLogoMono({ size }) {
  const S = size || 28, K = HELL.ink, C = HELL.card;
  return <svg width={S} height={S} viewBox="0 0 28 28" style={{ flexShrink: 0 }} aria-hidden="true">
    <path d="M14 1.8 C7.8 1.8 4.4 7.4 4.4 13.6 L3.4 26.5 H24.6 L23.6 13.6 C23.6 7.4 20.2 1.8 14 1.8 Z" fill={C} stroke={K} strokeWidth="1.4" strokeLinejoin="round" />
    <path d="M14 1.8 C9 3.4 7 8.4 7 13.6 L6.4 26.5" stroke={HELL.mid} strokeWidth="1.2" fill="none" />
    <path d="M3.6 24 H24.4" stroke={K} strokeWidth="1.2" />
    <ellipse cx="14" cy="14.2" rx="5.6" ry="7" fill={K} />
    <path d="M10.6 13.2 L13 14.3 M17.4 13.2 L15 14.3" stroke={C} strokeWidth="1.6" strokeLinecap="round" />
    <g transform="rotate(-35 22 20)">
      <path d="M22 10.5 L23.4 17 H20.6 Z" fill={C} stroke={K} strokeWidth=".8" strokeLinejoin="round" />
      <rect x="19.6" y="17" width="4.8" height="1.3" rx=".5" fill={K} />
      <rect x="21.3" y="18.3" width="1.4" height="3.6" rx=".6" fill={K} />
    </g>
  </svg>;
}
