// Modus «Plakat»: globale Stilschicht. Gilt NUR unter html[data-gt-skin="plakat"],
// Nocturne, Hell und Noir bleiben unberührt. Inline-Stile der Bauteile werden mit !important übersteuert.
const P = 'html[data-gt-skin="plakat"]';
const INK = "#141414", CREAM = "#F4EAD5", PAPER = "#FFFDF7";
const FONT = "'Bagel Fat One','Bowlby One',sans-serif";

const PLAKAT_CSS = `
${P} body{background:${CREAM}}
${P} ::selection{background:#F9C22E;color:${INK}}
/* Titel-Schriftzüge der Spiele */
${P} .gt-wm{font-family:${FONT}!important;-webkit-text-stroke:.05em ${INK}!important;paint-order:stroke fill!important;text-shadow:.05em .065em 0 ${INK}!important;letter-spacing:0!important}
/* Kopf: Zurück, Erscheinungsbild, Menü */
${P} .gt-hf{background:${PAPER}!important;border:2.5px solid ${INK}!important;box-shadow:0 3px 0 ${INK}!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important;color:${INK}!important}
${P} .gt-hb:active .gt-hf{transform:translateY(2px);box-shadow:0 1px 0 ${INK}!important}
/* Einrichtung (gemeinsam für alle Spiele) */
${P} .gt-su-label{font-family:${FONT}!important;letter-spacing:.06em!important;color:${INK}!important}
${P} .gt-su-row{border:2px solid ${INK}!important;box-shadow:0 3px 0 ${INK}!important;background:${PAPER}!important}
${P} .gt-su-chip,${P} .gt-su-ib,${P} .gt-su-add,${P} .gt-su-numin{border:2px solid ${INK}!important}
${P} .gt-su-chip{font-family:${FONT}!important;font-weight:400!important}
${P} .gt-su-btn{position:relative;overflow:hidden;border:2.5px solid ${INK}!important;box-shadow:0 5px 0 ${INK}!important;font-family:${FONT}!important;font-weight:400!important;letter-spacing:.02em}
${P} .gt-su-cta::before{background:var(--pk-bg,${CREAM})!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important}
${P} .gt-gp-row>button,${P} .gt-rn-chip{border:2px solid ${INK}!important;background:${PAPER}!important;color:${INK}!important;box-shadow:0 3px 0 ${INK}!important}
${P} .gt-gamehead.is-stuck,${P} .gt-gamehead.is-stuck::before{background:radial-gradient(rgba(20,20,20,.10) 1.2px,transparent 1.4px) 0 0/14px 14px,var(--pk-bg,${CREAM})!important;background-attachment:fixed!important}
${P} .gt-gamehead.is-stuck{box-shadow:0 2.5px 0 ${INK}!important}
${P} .gtL-content .gt-gamehead.is-stuck{background:none!important;box-shadow:none!important}
${P} .gt-gamehead h1:not(.gt-wm){font-family:${FONT}!important;font-weight:400!important;font-size:clamp(21px,6.6vw,30px)!important;line-height:1.05!important;letter-spacing:0!important;color:${CREAM}!important;-webkit-text-stroke:.07em ${INK};paint-order:stroke fill;text-shadow:.05em .065em 0 ${INK};white-space:nowrap;overflow-wrap:normal!important}
${P} .podium-pop[role="dialog"]{border:2.5px solid ${INK}!important;box-shadow:0 6px 0 ${INK}!important;background:${PAPER}!important;color:${INK}!important}
${P} .podium-pop[role="dialog"] h2,${P} .podium-pop[role="dialog"] [id^="gt-cf-t"]{font-family:${FONT}!important;font-weight:400!important}
${P} .podium-pop[role="dialog"] button{border:2px solid ${INK}!important;box-shadow:0 3px 0 ${INK}!important}
${P} .gt-hm-panel{--hm-panel:${PAPER};--hm-ink:${INK};border:2.5px solid ${INK};box-shadow:0 5px 0 ${INK}!important}
${P} .gtL-sidebar{background:${CREAM}!important;border-right:2.5px solid ${INK}!important;box-shadow:none!important}
${P} .gt-su-btn:active{transform:translateY(3px);box-shadow:0 2px 0 ${INK}!important}
${P} .gt-su-btn::after,${P} .pk-shine::after{content:"";position:absolute;top:0;bottom:0;left:0;width:35%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.42),transparent);animation:pk-shine 3.2s ease-in-out infinite;pointer-events:none}
@keyframes pk-shine{0%{transform:translateX(-120%) skewX(-20deg)}55%,100%{transform:translateX(320%) skewX(-20deg)}}
/* Startseite */
${P} .gtL-tile{border:2.5px solid ${INK}!important;box-shadow:0 5px 0 ${INK}!important;background:${PAPER}!important}
${P} .gtL-tile:active{transform:translateY(3px);box-shadow:0 2px 0 ${INK}!important}
${P} .gtL-tile-title{font-family:${FONT}!important;font-weight:400!important;letter-spacing:.01em}
${P} .gtL-tile-iconwrap{border:2px solid ${INK}!important}
${P} .gtL-showcase-label{color:${INK}!important}
/* Spiellisten */
${P} .card-fx:not(.gtL-showcase-item):not(.gtL-tile){border:2.5px solid ${INK}!important;box-shadow:0 4px 0 ${INK}!important;background:${PAPER}!important}
${P} .gtL-gamecard-title{font-family:${FONT}!important;font-weight:400!important}
${P} .gtL-showcase-icon{border:2px solid ${INK}!important;box-shadow:0 3px 0 ${INK}!important;background:${PAPER}!important}

/* ===== Startseite neu (Plakat) ===== */
${P} .gtL-start{background:radial-gradient(rgba(20,20,20,.12) 1.2px,transparent 1.4px) 0 0/14px 14px,#8B6CFF!important}
${P} .gtL-start .gt-hero-sub div{color:${INK}!important;font-family:${FONT}!important;letter-spacing:.3em!important}
${P} .gtL-start-gear{background:${PAPER}!important;border:2.5px solid ${INK}!important;box-shadow:0 3px 0 ${INK}!important;color:${INK}!important}
${P} [data-onboard="scorepads-tile"] .gtL-tile{background:#F9C22E!important;transform:rotate(-1.2deg)}
${P} [data-onboard="party-tile"] .gtL-tile{background:#FF7A6B!important;transform:rotate(1.2deg)}
${P} [data-onboard="scorepads-tile"] .gtL-tile:active{transform:rotate(-1.2deg) translateY(3px)}
${P} [data-onboard="party-tile"] .gtL-tile:active{transform:rotate(1.2deg) translateY(3px)}
${P} .gtL-tile-title{color:${INK}!important;font-size:24px!important}
${P} .gtL-tile-iconwrap{background:${PAPER}!important}
${P} .gtL-tile-chevron{color:${INK}!important;width:34px;height:34px;border-radius:50%;background:${PAPER};border:2px solid ${INK};display:flex;align-items:center;justify-content:center;font-size:20px!important;line-height:1}
${P} [data-onboard="search"] input,${P} [data-onboard="search"] [class*="search"]{border:2.5px solid ${INK}!important;box-shadow:0 3px 0 ${INK}!important;background:${PAPER}!important;color:${INK}!important}
${P} [data-onboard="showcase"] .gtL-showcase-label,${P} .gtL-showcase-hint{color:${INK}!important}
${P} .gtL-showcase-icon{background:${PAPER}!important}
${P} .gtL-showcase h2{color:${INK}!important;font-family:${FONT}!important;font-weight:400!important;letter-spacing:.12em!important}
/* ===== Einstellungen neu (Plakat) ===== */
${P} .st-page{background:radial-gradient(rgba(20,20,20,.10) 1.2px,transparent 1.4px) 0 0/14px 14px,#F9C22E!important}
${P} .st-title{font-family:${FONT}!important;font-weight:400!important;color:${INK}!important;-webkit-text-stroke:0;text-shadow:3px 3px 0 ${PAPER}!important}
${P} .st-card{border:2.5px solid ${INK}!important;box-shadow:0 5px 0 ${INK}!important;background:${PAPER}!important;border-radius:22px!important}
${P} .st-row{border-color:${INK}!important}
${P} .st-seg{background:${CREAM}!important;border:2px solid ${INK}!important}
${P} .st-segbtn[aria-pressed="true"]{background:${INK}!important;color:${PAPER}!important;border:none!important;font-family:${FONT}!important;font-weight:400!important}
${P} .st-segbtn{color:${INK}!important}
${P} .st-foot,${P} .st-build{color:${INK}!important}

/* ===== Spiellisten (Plakat) ===== */
${P} [data-pk-cat="score"]{background:radial-gradient(rgba(20,20,20,.10) 1.2px,transparent 1.4px) 0 0/14px 14px,#F9C22E!important}
${P} [data-pk-cat="party"]{background:radial-gradient(rgba(20,20,20,.10) 1.2px,transparent 1.4px) 0 0/14px 14px,#FF7A6B!important}
${P} [data-pk-cat] h1{color:${INK}!important;font-family:${FONT}!important;font-weight:400!important;text-shadow:2px 2px 0 ${PAPER}!important}
/* Weiches Einblenden der Titel (Magic UI «Blur Fade») */
${P} .gt-wm{animation:pk-in .55s cubic-bezier(.2,.8,.2,1) both}
@keyframes pk-in{from{opacity:0;transform:translateY(8px);filter:blur(5px)}to{opacity:1;transform:none;filter:none}}
@media (prefers-reduced-motion: reduce){${P} .gt-su-btn::after,${P} .pk-shine::after,${P} .gt-wm{animation:none!important}}
`;

export { PLAKAT_CSS };
