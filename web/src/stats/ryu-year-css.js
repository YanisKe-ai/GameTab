// Jahresrückblick im Modus Ryū («Jahresplakat», 2026-11-16).
// Rote Körnung, Creme-/Schwarz-Sticker, grosse Bagel-Zahlen mit hartem Schatten, Kartennummer als Stempel,
// schwarzes Eintrittskarten-Band unten. Nur Darstellung, wird nur bei isPlakat() eingehängt (year-review.js).
const RED = "#E4312B", INK = "#1A1716", CR = "#F3EAD3", CR2 = "#D8CBA8";
const FONT = "'Bagel Fat One','Bowlby One',sans-serif";
const NOISE = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23n)' opacity='.5'/%3E%3C/svg%3E\")";
const S = ".gtYR-ryu";

const GT_YR_RYU_CSS = `
${S}{background:${NOISE} 0 0/180px 180px,${RED}!important;background-blend-mode:multiply;color:${INK}!important}
@media (min-width:640px){${S}{border:3px solid ${INK};border-radius:24px!important;box-shadow:0 0 0 4px ${CR},0 30px 80px rgba(0,0,0,.55)!important}}
${S} .gtYR-glow{display:none!important}
${S} .gtYR-drift path{fill:rgba(26,23,22,.15)!important}
/* Fortschritt: Ticket-Segmente */
${S} .gtYR-bars{gap:5px!important}
${S} .gtYR-bars>div{height:9px!important;border-radius:5px!important;box-sizing:border-box;border:2px solid ${INK};background:rgba(26,23,22,.28)!important;opacity:1!important}
${S} .gtYR-bars>div[data-on="1"]{background:${CR}!important}
/* Kopf: Marke als schwarzer Sticker, Schliessen als Creme-Knopf */
${S} .gtYR-brand{background:${INK};color:${CR}!important;font-family:${FONT};font-weight:400!important;font-size:15px!important;letter-spacing:.02em!important;padding:6px 13px 5px;border-radius:999px;rotate:-2deg;box-shadow:0 3px 0 rgba(26,23,22,.35)}
${S} .gtYR-brand span:last-child{color:${CR2}!important;font-weight:400!important}
${S} .gtYR-brand>span:first-child{background:${RED}!important;box-shadow:0 0 0 1.5px ${CR}}
${S} .gtYR-x{background:${CR}!important;color:${INK}!important;border:2.5px solid ${INK}!important;box-shadow:0 3px 0 ${INK};box-sizing:border-box}
${S} .gtYR-x:active{transform:translateY(2px);box-shadow:0 1px 0 ${INK}}
/* Titelstreifen */
${S} .gtYR-eb{align-self:flex-start;background:${CR};color:${INK}!important;border:2.5px solid ${INK};border-radius:999px;box-shadow:0 3px 0 ${INK};padding:6px 15px 5px;rotate:-2deg;font-family:${FONT};font-weight:400!important;font-size:.95rem!important;letter-spacing:.06em!important;max-width:100%;box-sizing:border-box}
${S} .gtYR-eb-dash{display:none!important}
/* Grosse Zahl wie auf dem Plakat */
${S} .gtYR-val{letter-spacing:0!important;font-weight:400!important;font-family:${FONT};color:${CR}!important;rotate:-2deg;transform-origin:0 70%;margin:6px 0 8px!important;line-height:1!important;-webkit-text-stroke:.085em ${INK};paint-order:stroke fill;filter:drop-shadow(.05em .06em 0 ${INK});max-width:100%}
${S} .gtYR-val span{font-family:${FONT}!important;font-weight:400!important}
${S} .gtYR-big{font-family:${FONT};font-weight:400!important;letter-spacing:0!important;color:${CR}!important;-webkit-text-stroke:.09em ${INK};paint-order:stroke fill;filter:drop-shadow(.04em .05em 0 ${INK});rotate:-1.5deg;line-height:1.08!important}
/* Kleintext auf Etikett */
${S} .gtYR-txt,${S} .gtYR-sub{align-self:flex-start;background:${CR};color:${INK}!important;opacity:1!important;border:2.5px solid ${INK};border-radius:16px;box-shadow:0 4px 0 ${INK};padding:10px 15px!important;font-weight:600;rotate:1deg;max-width:min(100%,30ch)!important;box-sizing:border-box}
${S} .gtYR-hint{align-self:flex-start;background:${CR};color:${INK}!important;border:2px solid ${INK};border-radius:999px;padding:5px 13px 5px 9px;font-weight:600;box-shadow:0 2px 0 ${INK}}
${S} .gtYR-pill{background:${INK}!important;color:${CR}!important;border:0!important;font-family:${FONT};font-weight:400!important;font-size:.98rem!important;padding:10px 17px 8px!important;box-shadow:0 3px 0 rgba(26,23,22,.35)}
${S} .gtYR-pill:nth-child(odd){rotate:-2deg}
${S} .gtYR-pill:nth-child(even){rotate:1.5deg}
/* Knöpfe */
${S} .gtYR-cta{background:${INK}!important;color:${CR}!important;border:2.5px solid ${CR}!important;box-shadow:0 4px 0 ${INK};font-family:${FONT}!important;font-weight:400!important;font-size:1.1rem!important;border-radius:18px!important;box-sizing:border-box}
${S} .gtYR-cta2{background:${CR}!important;color:${INK}!important;border:2.5px solid ${INK}!important;box-shadow:0 4px 0 ${INK};font-family:${FONT}!important;font-weight:400!important;font-size:1rem!important;border-radius:18px!important;box-sizing:border-box}
${S} .gtYR-cta:active,${S} .gtYR-cta2:active{transform:translateY(2px);box-shadow:0 2px 0 ${INK}}
${S} .gtYR-note:not(:empty){align-self:flex-start;background:${CR};color:${INK}!important;border:2px solid ${INK};border-radius:12px;padding:4px 10px;font-weight:600}
/* Eintrittskarten-Band unten und Nummer-Stempel */
${S} .gtYR-band{position:absolute;left:0;right:0;bottom:0;height:30px;background:${INK};z-index:0;pointer-events:none;background-image:radial-gradient(circle at 50% 0,${RED} 0 7px,transparent 7.5px);background-size:26px 14px;background-repeat:repeat-x;background-position:0 -7px}
${S} .gtYR-band::after{content:"";position:absolute;left:0;right:0;top:15px;border-top:2px dashed rgba(243,234,211,.35)}
${S} .gtYR-no{position:absolute;right:16px;bottom:9px;z-index:2;width:54px;height:54px;border-radius:50%;background:${CR};color:${INK};border:2.5px solid ${INK};box-shadow:0 3px 0 ${INK};display:flex;align-items:center;justify-content:center;font-family:${FONT};font-size:1.25rem;line-height:1;rotate:9deg;pointer-events:none}
@media (max-height:600px){${S} .gtYR-no{width:44px;height:44px;font-size:1rem}}
@media (prefers-reduced-motion: reduce){${S} .gtYR-in{animation:none!important}}
`;

export { GT_YR_RYU_CSS };
