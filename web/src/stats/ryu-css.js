// Statistik im Modus Ryū (Entwurf B1 «Bento-Sticker», 2026-11-15).
// Wird nur im Ryū-Modus eingehängt (page.js, isPlakat()). Nur Rot, Schwarz, Creme.
// Reine Darstellung: Inline-Farben der Bauteile werden mit !important übersteuert.
const RED = "#E4312B", INK = "#1A1716", CR = "#F3EAD3", CR2 = "#D8CBA8";
const FONT = "'Bagel Fat One','Bowlby One',sans-serif";
const NOISE = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.22'/%3E%3C/svg%3E\")";
const S = ".gtSt2";

const GT_ST_RYU_CSS = `
${S}{--pk-bg:${RED};background:${NOISE} 0 0/180px 180px,${RED}!important;background-blend-mode:multiply;color:${INK}}
${S} [style*="Baloo 2"]{font-family:${FONT}!important;font-weight:400!important}
${S} .gt-hf{border:2.5px solid ${INK}!important;box-shadow:0 3px 0 ${INK};background:${CR}!important;color:${INK}!important}
/* Filter und Tabs */
${S} .gtSt2-seg{background:${CR}!important;border:2.5px solid ${INK}!important;border-radius:16px;box-shadow:0 4px 0 ${INK}}
${S} .gtSt2-segb{color:${INK}!important;font-family:${FONT};font-weight:400;font-size:.9rem;letter-spacing:.01em}
${S} .gtSt2-segb.is-on{background:${INK}!important;color:${CR}!important;font-weight:400}
${S} .gtSt2-sel{background:${CR}!important;border:2.5px solid ${INK}!important;border-radius:14px!important;box-shadow:0 4px 0 ${INK}}
${S} .gtSt2-sel span{color:${INK}!important}
${S} .gtSt2-sel svg path{stroke:${INK}}
${S} .gtSt2-filters>[role=status],${S} .gtSt2-filters>[role=status] *{color:${INK}!important}
${S} .gtSt2-filters{gap:12px}
/* Abschnitts-Chips */
${S} .gtSt2-sec,${S} .gtSt2-h2{display:inline-block;background:${CR};color:${INK}!important;border:2.5px solid ${INK};box-shadow:0 3px 0 ${INK};border-radius:999px;padding:4px 14px 3px;font-family:${FONT}!important;font-weight:400!important;font-size:.95rem!important;letter-spacing:.01em!important;transform:rotate(-1deg)}
${S} .gtSt2-more+*,${S} .gtSt2-more~div{margin-top:8px}
/* Kleintext nie direkt auf Rot (Kontrast): Creme-Etikett */
${S} .gtSt2-sub,${S} .gtSt2-lead{color:${INK}!important;display:block;width:fit-content;max-width:100%;box-sizing:border-box;background:${CR};border:2px solid ${INK};border-radius:10px;box-shadow:0 2px 0 ${INK};padding:3px 10px!important;line-height:1.35!important}
${S} .gtSt2-sub{margin-top:8px!important;font-weight:600!important}
${S} .gtSt2-lead{margin-left:2px!important}
/* Sticker: Karten, Listen, Kacheln */
${S} .gtSt2-card,${S} .gtSt2-lc,${S} .gtSt2-stat,${S} .gtSt2-kpi{background:${CR}!important;color:${INK}!important;border:2.5px solid ${INK}!important;border-radius:18px!important;box-shadow:0 4px 0 ${INK}}
${S} .gtSt2-kpi:nth-child(even),${S} .gtSt2-grid2>.gtSt2-stat:nth-child(even){background:${INK}!important;color:${CR}!important;border-color:${CR}!important}
${S} .gtSt2-kpi:nth-child(even) *,${S} .gtSt2-grid2>.gtSt2-stat:nth-child(even) :is(div,p,span){color:${CR}!important}
${S} .gtSt2-kpis{gap:12px}
${S} .gtSt2-kv,${S} .gtSt2-sv{color:${RED}!important;font-family:${FONT}!important;font-weight:400!important}
${S} .gtSt2-grid2{gap:14px}
${S} .gtSt2-lc li{border-top:2px dashed rgba(26,23,22,.35)!important}
${S} .gtSt2-lc li:first-child{border-top:0!important}
${S} .gtSt2-rkn{font-family:${FONT}!important;font-weight:400!important;font-size:1.3rem!important;color:${INK}!important}
${S} .gtSt2-rkv{font-family:${FONT}!important;font-weight:400!important;color:${RED}!important}
${S} .gtSt2-bar{height:10px!important;box-sizing:border-box;border:2px solid ${INK};background:${CR2}!important}
${S} .gtSt2-barf{background:${RED}!important;border-radius:99px}
${S} [data-gt-me]{border-color:${RED}!important;background:${RED};color:${CR}!important}
${S} .gtSt2-btn{color:inherit}
${S} .gtSt2-pill{background:${CR}!important;color:${INK}!important;border:2.5px solid ${INK}!important;box-shadow:0 3px 0 ${INK};font-family:${FONT}!important;font-weight:400!important}
${S} .gtSt2-pill[aria-pressed="true"]{background:${INK}!important;color:${CR}!important}
${S} .gtSt2-h2+.gtSt2-lc{margin-top:8px}
${S} .gtSt2-lc li button,${S} .gtSt2-lc li{color:${INK}}
${S} [data-gt-achv] span{color:${INK}!important}
/* Mehr: jede Zeile ein Creme-Knopf */
${S} .gtSt2-more .gtSt2-lc{background:transparent!important;border:0!important;box-shadow:none!important;overflow:visible!important;display:flex;flex-direction:column;gap:14px}
${S} .gtSt2-more .gtSt2-row{background:${CR}!important;border:2.5px solid ${INK}!important;border-radius:16px;box-shadow:0 4px 0 ${INK};min-height:56px}
${S} .gtSt2-more .gtSt2-row>span>span:first-child{font-family:${FONT}!important;font-weight:400!important;font-size:1.05rem!important;color:${INK}!important}
${S} .gtSt2-more .gtSt2-row>span>span:last-child{color:${INK}!important;opacity:.8}
${S} .gtSt2-more .gtSt2-row svg path{stroke:${INK}!important}
/* Du-Bento */
${S} .gtMe-grid{gap:14px;margin-bottom:16px}
${S} .gtMe-tile{background:${CR}!important;color:${INK}!important;border:2.5px solid ${INK}!important;border-radius:18px!important;box-shadow:0 4px 0 ${INK}!important}
${S} .gtMe-tile::after,${S} .gtMe-shine::before{display:none!important}
${S} .gtMe-tile:nth-child(even){background:${INK}!important;color:${CR}!important;border-color:${CR}!important}
${S} .gtMe-tile:nth-child(even) :is(div,b){color:${CR}!important}
${S} .gtMe-tile[data-gtme="ask"]{border-style:dashed!important}
${S} .gtMe-nw{color:${RED}!important;font-family:${FONT}!important;font-weight:400!important}
${S} .gtMe-dot,${S} .gtMe-cross{display:none!important}
${S} .gtMe-bar{transform-origin:50% 100%;transform-box:fill-box;transition:opacity .2s}
${S} .gtMe-bar.is-sel rect{stroke-width:3.5}
${S} .gtMe-tile:not(.on) .gtMe-bar{transform:scaleY(.02)}
${S} .gtMe-tile.on .gtMe-bar{animation:gtMeRise .7s cubic-bezier(.22,1,.36,1) both;animation-delay:calc(var(--i)*70ms + .2s)}
${S} .gtMe-tip{border-width:2px!important;font-family:${FONT}}
${S} .gtMe-btn{border:2.5px solid ${INK}!important;box-shadow:0 3px 0 ${INK};font-family:${FONT}!important;font-weight:400!important;border-radius:12px!important;background:${CR}!important;color:${INK}!important}
${S} .gtMe-btn:first-of-type{background:${RED}!important;color:${CR}!important}
${S} .gtMe-tile:nth-child(even) .gtMe-btn{border-color:${CR}!important}
@media (prefers-reduced-motion: reduce){${S} .gtMe-tile.on .gtMe-bar{animation:none}}
`;

export { GT_ST_RYU_CSS };
