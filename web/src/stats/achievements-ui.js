// Abzeichen-Grafik fuer Erfolge (eigene SVG-Symbole, keine Emoji). Genutzt von der Statistik und vom Podest.
import { React } from "../vendor/react-globals.js";
/*@gt-body-begin*/
const ACHV_TIER_COLORS={bronze:{hi:"#E6B07A",lo:"#A8672F",ink:"#2B1A0B"},silver:{hi:"#E3E8EE",lo:"#97A3B2",ink:"#1D2530"},gold:{hi:"#F3D58C",lo:"#C99A2E",ink:"#2D2208"}};
// Symbole im 24er-Raster, nur Linien (und wenige Punkte)
const ACHV_GLYPHS={
  flag:{d:"M7 20V4M7 5h10l-2.5 3.5L17 12H7"},
  cards:{d:"M9 8h9v12H9zM6 16V4h9"},
  cup:{d:"M8 4h8v5a4 4 0 0 1-8 0zM8 6H5v1a3 3 0 0 0 3 3M16 6h3v1a3 3 0 0 1-3 3M12 13v4M9 20h6"},
  flame:{d:"M12 3c1 3 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-6 1-9z"},
  grid:{d:"M5 5h5v5H5zM14 5h5v5h-5zM5 14h5v5H5zM14 14h5v5h-5z"},
  compass:{d:"M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM15.5 8.5l-2 5-5 2 2-5z"},
  target:{d:"M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z",dots:[[12,12,1.3]]},
  moon:{d:"M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"},
  calendar:{d:"M5 6h14v14H5zM5 10h14M9 3v4M15 3v4"},
  people:{d:"M9 6a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM3 19c0-3 2.5-5 6-5s6 2 6 5M17 7.5a2.5 2.5 0 1 1 0 5M16 14.5c3 .3 5 1.7 5 4.5"},
  rise:{d:"M4 17l5-5 4 3 7-8M15 7h5v5"},
  pair:{d:"M9 6.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11zM15 6.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11z"},
  below:{d:"M12 4v13M6.5 12.5L12 18l5.5-5.5M6 21h12"},
  dice:{d:"M7 5h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z",dots:[[9,9,1.2],[15,9,1.2],[12,12,1.2],[9,15,1.2],[15,15,1.2]]},
  hole:{d:"M6 19.5c0-1.1 2.7-2 6-2s6 .9 6 2-2.7 2-6 2-6-.9-6-2zM12 17.5V3.5M12 3.5l6 2.5-6 2.5"},
  hat:{d:"M12 3l5 13H7zM4 19h16",dots:[[12,11,1.1]]},
  seven:{d:"M7 6h10l-6 13"},
  bull:{d:"M12 3a9 9 0 1 0 9 9M12 7.5a4.5 4.5 0 1 0 4.5 4.5M12 12l8-8M16 4h4v4",dots:[[12,12,1.2]]},
  door:{d:"M6 20V5h12v15M4 20h16M14.5 12.5v.1"},
  eyeoff:{d:"M2.5 12S6 6 12 6s9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6zM4 4l16 16",dots:[[12,12,2]]},
  house:{d:"M4 11l8-7 8 7M6 10v10h12V10M10 20v-5h4v5"},
  fedora:{d:"M3 16h18M6.5 16c0-6 1.5-9 5.5-9s5.5 3 5.5 9M7 12.5h10"},
  lens:{d:"M10.5 4a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13zM15.3 15.3L21 21"},
  heart:{d:"M12 20s-8-4.8-8-10.5A4.5 4.5 0 0 1 12 7a4.5 4.5 0 0 1 8 2.5C20 15.2 12 20 12 20z"},
  star:{d:"M12 3.5l2.4 5.6 6.1.5-4.6 4 1.4 6-5.3-3.2L6.7 19.6l1.4-6-4.6-4 6.1-.5z"},
  hourglass:{d:"M7 3.5h10M7 20.5h10M8 3.5v3l4 5.5-4 5.5v3M16 3.5v3L12 12l4 5.5v3"},
  steps:{d:"M4 20h4v-4h4v-4h4V8h4V4"},
  spark:{d:"M12 3v5M12 16v5M3 12h5M16 12h5M6 6l2.5 2.5M15.5 15.5L18 18M18 6l-2.5 2.5M8.5 15.5L6 18"},
  chat:{d:"M5 5h14v10h-8.5L6 19v-4H5z"},
  crown:{d:"M4 18h16M5 18L4 8l5 4 3-6 3 6 5-4-1 10"},
  stopwatch:{d:"M12 8a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM12 12v4M10 3h4M12 3v5"},
};
function AchvBadge({glyph,tier,locked,size=52,lockColor}){
  const uid=React.useId().replace(/[^a-zA-Z0-9]/g,"");const c=ACHV_TIER_COLORS[tier]||ACHV_TIER_COLORS.bronze;const g=ACHV_GLYPHS[glyph]||ACHV_GLYPHS.flag;
  const lc=lockColor||"#8891A0";
  if(locked)return <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true" focusable="false" style={{display:"block",flex:"none"}}><circle cx="24" cy="24" r="21.5" fill="none" stroke={lc} strokeOpacity="0.45" strokeWidth="1.6" strokeDasharray="3 4" strokeLinecap="round"/><g transform="translate(12 12)" fill="none" stroke={lc} strokeOpacity="0.55" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={g.d}/>{(g.dots||[]).map((p,i)=><circle key={i} cx={p[0]} cy={p[1]} r={p[2]} fill={lc} fillOpacity="0.55" stroke="none"/>)}</g></svg>;
  return <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true" focusable="false" style={{display:"block",flex:"none"}}>
    <defs><linearGradient id={"ab"+uid} x1="0.2" y1="0" x2="0.8" y2="1"><stop offset="0" stopColor={c.hi}/><stop offset="1" stopColor={c.lo}/></linearGradient><radialGradient id={"ag"+uid} cx="0.35" cy="0.22" r="0.7"><stop offset="0" stopColor="#fff" stopOpacity="0.55"/><stop offset="1" stopColor="#fff" stopOpacity="0"/></radialGradient></defs>
    <circle cx="24" cy="24" r="22" fill={"url(#ab"+uid+")"}/>
    <circle cx="24" cy="24" r="22" fill={"url(#ag"+uid+")"}/>
    <circle cx="24" cy="24" r="18.5" fill="none" stroke={c.ink} strokeOpacity="0.22" strokeWidth="1.2"/>
    <circle cx="24" cy="24" r="21.4" fill="none" stroke="#fff" strokeOpacity="0.35" strokeWidth="1"/>
    <g transform="translate(12 12)" fill="none" stroke={c.ink} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d={g.d}/>{(g.dots||[]).map((p,i)=><circle key={i} cx={p[0]} cy={p[1]} r={p[2]} fill={c.ink} stroke="none"/>)}</g>
  </svg>;
}
/*@gt-body-end*/
export { ACHV_TIER_COLORS, ACHV_GLYPHS, AchvBadge };
