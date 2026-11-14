import { React } from "../../vendor/react-globals.js";

// Spiel-Icon Molotow: eine franzoesische Jasskarte (Schaufel-Ass), an der eine Flamme leckt. Eigene Zeichnung.
const MOL_SPADE = "M12 2C8 7 3 10 3 14.5 3 17 5 19 7.4 19c1.4 0 2.7-.6 3.5-1.7-.2 1.7-.9 3-2.2 4.2h6.6c-1.3-1.2-2-2.5-2.2-4.2.8 1.1 2.1 1.7 3.5 1.7C19 19 21 17 21 14.5 21 10 16 7 12 2Z";

function MolotowLogo({ theme, size }) {
  const S = size || 28;
  const K = "#14100E";
  const noir = false;
  const flame = noir ? "#D8D8D8" : "#B8D52A";
  const core = noir ? "#FFFFFF" : "#F4F9C8";
  return <svg width={S} height={S} viewBox="0 0 28 28" style={{ flexShrink: 0 }} aria-hidden="true">
    <g transform="rotate(-12 12 17)">
      <rect x="4.5" y="7" width="15" height="19.5" rx="2.4" fill="#FFF8EC" stroke={K} strokeWidth="1.1" />
      <g transform="translate(12 17.2) scale(.52) translate(-12 -12)"><path d={MOL_SPADE} fill={K} /></g>
      <text x="7.6" y="12.6" fontFamily="Times New Roman,Times,serif" fontWeight="700" fontSize="5.4" textAnchor="middle" fill={K}>A</text>
    </g>
    <path d="M20.6 1.6C22.4 4.4 25.4 6 25.4 10.2 25.4 13.2 23.4 15 20.8 15 18.4 15 16.6 13.2 16.6 10.8 16.6 9.2 17.3 8.2 18.2 7 18.4 8.2 19 8.8 19.7 8.8 19.2 6.2 19.4 3.6 20.6 1.6Z" fill={flame} stroke={K} strokeWidth=".9" strokeLinejoin="round" />
    <path d="M20.9 8.6C21.8 10 22.6 10.6 22.6 12 22.6 13 21.9 13.6 21 13.6 20.1 13.6 19.4 13 19.4 12.1 19.4 11.4 19.8 10.9 20.2 10.3 20.4 10.9 20.7 11.1 20.9 11.1 20.7 10.1 20.7 9.4 20.9 8.6Z" fill={core} />
  </svg>;
}

export { MolotowLogo, MOL_SPADE };
