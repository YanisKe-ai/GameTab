// Modus «Plakat»: globale Stilschicht. Gilt NUR unter html[data-gt-skin="plakat"],
// Nocturne, Hell und Noir bleiben unberührt. Inline-Stile der Bauteile werden mit !important übersteuert.
const P = 'html[data-gt-skin="plakat"]';
const INK = "#141414", CREAM = "#F4EAD5", PAPER = "#FFFDF7";
const FONT = "'Bagel Fat One','Bowlby One',sans-serif";
// Startseite Plakat (Entwurf R2b): kräftiges Rot, warmes Schwarz, Creme, Körnung
const RED = "#E4312B", INK2 = "#1A1716", CREAM2 = "#F3EAD3";
const NOISE = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.32'/%3E%3C/svg%3E\")";

const PLAKAT_CSS = `
${P} body{background:${CREAM}}
${P} ::selection{background:#F9C22E;color:${INK}}
/* Ränder als Outline nach innen: sie nehmen keinen Platz, Aufbau bleibt wie in Hell */
/* Titel-Schriftzüge der Spiele */
${P} .gt-wm{font-family:${FONT}!important;-webkit-text-stroke:.05em ${INK}!important;paint-order:stroke fill!important;text-shadow:.05em .065em 0 ${INK}!important;letter-spacing:0!important}
/* Kopf: Zurück, Erscheinungsbild, Menü */
${P} .gt-hf{background:${PAPER}!important;outline:2.5px solid ${INK}!important;outline-offset:-2.5px!important;box-shadow:0 3px 0 ${INK}!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important;color:${INK}!important}
${P} .gt-hb:active .gt-hf{transform:translateY(2px);box-shadow:0 1px 0 ${INK}!important}
/* Einrichtung (gemeinsam für alle Spiele) */
${P} .gt-su-label{font-family:${FONT}!important;letter-spacing:.06em!important;color:${INK}!important}
${P} .gt-su-row{outline:2px solid ${INK}!important;outline-offset:-2px!important;box-shadow:0 3px 0 ${INK}!important;background:${PAPER}!important}
${P} .gt-su-chip,${P} .gt-su-ib,${P} .gt-su-add,${P} .gt-su-numin{outline:2px solid ${INK}!important;outline-offset:-2px!important}
${P} .gt-su-chip{font-family:${FONT}!important;font-weight:400!important}
${P} .gt-su-btn{position:relative;overflow:hidden;outline:2.5px solid ${INK}!important;outline-offset:-2.5px!important;box-shadow:0 5px 0 ${INK}!important;font-family:${FONT}!important;font-weight:400!important;letter-spacing:.02em}
${P} .gt-su-cta::before{background:var(--pk-bg,${CREAM})!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important}
${P} .gt-gp-row>button,${P} .gt-rn-chip{outline:2px solid ${INK}!important;outline-offset:-2px!important;background:${PAPER}!important;color:${INK}!important;box-shadow:0 3px 0 ${INK}!important}
${P} .gt-gamehead.is-stuck,${P} .gt-gamehead.is-stuck::before{background:radial-gradient(rgba(20,20,20,.10) 1.2px,transparent 1.4px) 0 0/14px 14px,var(--pk-bg,${CREAM})!important;background-attachment:fixed!important}
${P} .gt-gamehead.is-stuck{box-shadow:0 2.5px 0 ${INK}!important}
${P} .gtL-content .gt-gamehead.is-stuck{background:none!important;box-shadow:none!important}
${P} .gt-gamehead h1:not(.gt-wm){font-family:${FONT}!important;font-weight:400!important;font-size:clamp(21px,6.6vw,30px)!important;line-height:1.05!important;letter-spacing:0!important;color:${CREAM}!important;-webkit-text-stroke:.07em ${INK};paint-order:stroke fill;text-shadow:.05em .065em 0 ${INK};white-space:nowrap;overflow-wrap:normal!important}
${P} [data-pk-cat] .gt-gamehead h1:not(.gt-wm){color:${INK}!important;-webkit-text-stroke:0;text-shadow:2px 2px 0 ${PAPER}!important}
${P} .podium-pop[role="dialog"]{outline:2.5px solid ${INK}!important;outline-offset:-2.5px!important;box-shadow:0 6px 0 ${INK}!important;background:${PAPER}!important;color:${INK}!important}
${P} .podium-pop[role="dialog"] h2,${P} .podium-pop[role="dialog"] [id^="gt-cf-t"]{font-family:${FONT}!important;font-weight:400!important}
${P} .podium-pop[role="dialog"] button{outline:2px solid ${INK}!important;outline-offset:-2px!important;box-shadow:0 3px 0 ${INK}!important}
${P} .gt-hm-panel{--hm-panel:${PAPER};--hm-ink:${INK};outline:2.5px solid ${INK};outline-offset:-2.5px;box-shadow:0 5px 0 ${INK}!important}
${P} .gtL-sidebar{background:${CREAM}!important;border-right:2.5px solid ${INK}!important;box-shadow:none!important}
${P} .gt-su-btn:active{transform:translateY(3px);box-shadow:0 2px 0 ${INK}!important}
${P} .gt-su-btn::after,${P} .pk-shine::after{content:"";position:absolute;top:0;bottom:0;left:0;width:35%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.42),transparent);animation:pk-shine 3.2s ease-in-out infinite;pointer-events:none}
@keyframes pk-shine{0%{transform:translateX(-120%) skewX(-20deg)}55%,100%{transform:translateX(320%) skewX(-20deg)}}
/* Startseite */
${P} .gtL-tile{outline:2.5px solid ${INK}!important;outline-offset:-2.5px!important;box-shadow:0 5px 0 ${INK}!important;background:${PAPER}!important}
${P} .gtL-tile:active{transform:translateY(3px);box-shadow:0 2px 0 ${INK}!important}
${P} .gtL-tile-title{font-family:${FONT}!important;font-weight:400!important;letter-spacing:.01em}
${P} .gtL-tile-iconwrap{outline:2px solid ${INK}!important;outline-offset:-2px!important}
${P} .gtL-showcase-label{color:${INK}!important}
/* Spiellisten */
${P} .card-fx:not(.gtL-showcase-item):not(.gtL-tile){outline:2.5px solid ${INK}!important;outline-offset:-2.5px!important;box-shadow:0 4px 0 ${INK}!important;background:${PAPER}!important}
${P} .gtL-gamecard-title{font-family:${FONT}!important;font-weight:400!important}
${P} .gtL-showcase-icon{outline:2px solid ${INK}!important;outline-offset:-2px!important;box-shadow:0 3px 0 ${INK}!important;background:${PAPER}!important}

/* ===== Startseite neu (Plakat, Entwurf S1 / R2b, 2026-11-15) ===== */
${P} .gtL-start{--pk-bg:${RED};background:${NOISE} 0 0/180px 180px,${RED}!important;background-blend-mode:multiply}
${P} .gtL-start .gtL-start-gear{background:${CREAM2}!important;outline:none!important;border:none!important;box-shadow:4px 5px 0 ${INK2}!important;color:${INK2}!important}
${P} .gtL-start .gt-hero-sub{display:flex;justify-content:center}
${P} .gtL-start .gtL-headwrap{transform:translateY(-22px)}
${P} .gtL-start [data-onboard="scorepads-tile"],${P} .gtL-start [data-onboard="party-tile"]{translate:0 var(--pk-tshift,0px)}
${P}.gt-laptopmode .gtL-start .gtL-headwrap,${P}[data-phone-landscape] .gtL-start .gtL-headwrap{transform:none}
${P}.gt-laptopmode .gtL-start [data-onboard$="-tile"],${P}[data-phone-landscape] .gtL-start [data-onboard$="-tile"]{translate:none}
${P} .gtL-start .gt-hero-sub div{display:inline-block;background:${INK2};color:${CREAM2}!important;font-family:${FONT}!important;font-size:12px!important;letter-spacing:.28em!important;padding:7px 26px 7px 30px;margin-top:8px!important;transform:rotate(2deg);clip-path:polygon(0 0,100% 0,95% 50%,100% 100%,0 100%,5% 50%)}
${P} .gtL-start .gtL-tile{border:none!important;outline:none!important;border-radius:999px!important;justify-content:center!important;padding:18px 20px!important;margin:10px 10px 18px 8px!important;width:calc(100% - 18px)!important}
${P} .gtL-start .gtL-tile-iconwrap,${P} .gtL-start .gtL-tile-chevron{display:none!important}
${P} .gtL-start .gtL-tile>div{flex:1;text-align:center}
${P} .gtL-start .gtL-tile-title{font-family:${FONT}!important;font-weight:400!important;font-size:clamp(22px,7.4vw,30px)!important;line-height:1.05!important;color:${RED}!important;letter-spacing:0!important}
${P} .gtL-start [data-onboard="scorepads-tile"] .gtL-tile{background:${CREAM2}!important;box-shadow:0 0 0 5px ${INK2},7px 9px 0 5px ${INK2}!important;transform:rotate(-2deg)}
${P} .gtL-start [data-onboard="scorepads-tile"] .gtL-tile-title{text-shadow:1px 1px 0 ${INK2},2px 2px 0 ${INK2},3px 3px 0 ${INK2},4px 4px 0 ${INK2}}
${P} .gtL-start [data-onboard="party-tile"] .gtL-tile{background:${INK2}!important;box-shadow:0 0 0 5px ${CREAM2},7px 9px 0 5px ${INK2}!important;transform:rotate(2deg)}
${P} .gtL-start [data-onboard="scorepads-tile"] .gtL-tile:active{transform:rotate(-2deg) translateY(4px);box-shadow:0 0 0 5px ${INK2},3px 4px 0 5px ${INK2}!important}
${P} .gtL-start [data-onboard="party-tile"] .gtL-tile:active{transform:rotate(2deg) translateY(4px);box-shadow:0 0 0 5px ${CREAM2},3px 4px 0 5px ${INK2}!important}
${P} .gtL-start [data-onboard="search"] input,${P} .gtL-start [data-onboard="search"] [class*="search"]{outline:none!important;border:none!important;border-radius:26px!important;background:${CREAM2}!important;box-shadow:4px 5px 0 ${INK2}!important;color:${INK2}!important}
${P} .gtL-start .gtL-seclabel{color:${INK2}!important;font-family:${FONT}!important;font-weight:400!important;letter-spacing:.12em!important}
${P} .gtL-start .gtL-showcase-icon{background:${CREAM2}!important;outline:none!important;border:none!important;box-shadow:3px 4px 0 ${INK2}!important}
${P} .gtL-start .gtL-showcase-label{color:${INK2}!important;opacity:1!important;font-family:${FONT}!important;font-weight:400!important;font-size:11px!important}
${P} .gtL-start .gtL-showcase-hint,${P} .gtL-start .gtL-showcase-arrow{color:${INK2}!important}
${P} .gtL-start .gtL-tipcard-body{background:${INK2}!important;border:none!important;outline:none!important;border-radius:10px!important;box-shadow:none!important}
${P} .gtL-start .gtL-tipcard-body *{color:${CREAM2}!important}
${P} .gtL-start .gtL-tipcard>button{color:${INK2}!important}
/* ===== Einstellungen neu (Plakat, Entwurf E4, 2026-11-15) ===== */
${P} .st-page{--pk-bg:${RED};background:${NOISE} 0 0/180px 180px,${RED}!important;background-blend-mode:multiply;color:${INK2}!important}
${P} .st-page .st-title{font-family:${FONT}!important;font-weight:400!important;font-size:40px!important;color:${INK2}!important;text-shadow:4.0px 0.0px 0 ${CREAM2}, 3.9px 1.0px 0 ${CREAM2}, 3.5px 2.0px 0 ${CREAM2}, 2.8px 2.8px 0 ${CREAM2}, 2.0px 3.5px 0 ${CREAM2}, 1.0px 3.9px 0 ${CREAM2}, -0.0px 4.0px 0 ${CREAM2}, -1.0px 3.9px 0 ${CREAM2}, -2.0px 3.5px 0 ${CREAM2}, -2.8px 2.8px 0 ${CREAM2}, -3.5px 2.0px 0 ${CREAM2}, -3.9px 1.0px 0 ${CREAM2}, -4.0px -0.0px 0 ${CREAM2}, -3.9px -1.0px 0 ${CREAM2}, -3.5px -2.0px 0 ${CREAM2}, -2.8px -2.8px 0 ${CREAM2}, -2.0px -3.5px 0 ${CREAM2}, -1.0px -3.9px 0 ${CREAM2}, 0.0px -4.0px 0 ${CREAM2}, 1.0px -3.9px 0 ${CREAM2}, 2.0px -3.5px 0 ${CREAM2}, 2.8px -2.8px 0 ${CREAM2}, 3.5px -2.0px 0 ${CREAM2}, 3.9px -1.0px 0 ${CREAM2}, 5px 5px 0 ${INK2}, 6px 6px 0 ${INK2}, 7px 7px 0 ${INK2}, 8px 8px 0 ${INK2}, 9px 9px 0 ${INK2}!important;transform:rotate(-2deg);margin:12px 0 10px 4px!important;align-self:flex-start}
${P} .st-page .st-cards{gap:20px!important;padding:4px 8px 8px 6px}
${P} .st-page .st-card{border:none!important;outline:none!important;border-radius:22px!important;overflow:hidden}
${P} .st-page .st-card:nth-child(odd){background:${CREAM2}!important;color:${INK2}!important;box-shadow:0 0 0 4px ${INK2},6px 7px 0 4px ${INK2}!important;transform:rotate(-1deg)}
${P} .st-page .st-card:nth-child(even){background:${INK2}!important;color:${CREAM2}!important;box-shadow:0 0 0 4px ${CREAM2},6px 7px 0 4px ${INK2}!important;transform:rotate(1deg)}
${P} .st-page .st-card:nth-child(odd) *{border-color:${INK2}!important}
${P} .st-page .st-card:nth-child(even) *{border-color:#3A3532!important}
${P} .st-page .st-card:nth-child(even) .st-row,${P} .st-page .st-card:nth-child(even) .st-row span{color:${CREAM2}!important}
${P} .st-page .st-card:nth-child(even) .gtL-danger{color:#FF6A5E!important}
${P} .st-page .st-card:nth-child(even) .gtL-danger:disabled{color:#B9AF9C!important}
${P} .st-page .st-card:nth-child(odd) .gtL-danger{color:#B3201A!important}
${P} .st-page .st-seg{background:#E5D9BD!important;outline:none!important;border:none!important;border-radius:999px!important}
${P} .st-page .st-segbtn{color:${INK2}!important;border-radius:999px!important;border:none!important}
${P} .st-page .st-segbtn[aria-pressed="true"]{background:${INK2}!important;color:${RED}!important;font-family:${FONT}!important;font-weight:400!important}
${P} .st-page .st-fill,${P} .st-page .st-fill *{color:${INK2}!important}
${P} .st-page [role="switch"]>span[aria-hidden]{background:#4A4440!important;box-shadow:none!important}
${P} .st-page [role="switch"]>span[aria-hidden]>span{background:${CREAM2}!important;box-shadow:none!important}
${P} .st-page [role="switch"][aria-checked="true"]>span[aria-hidden]{background:${RED}!important}
${P} .st-page [role="switch"][aria-checked="true"]>span[aria-hidden]>span{background:${CREAM2}!important}
@media (max-height:780px){${P} .st-page .st-title{font-size:30px!important;margin:4px 0 2px 4px!important}${P} .st-page .st-cards{gap:12px!important}}
${P} .st-page .st-foot{gap:2px!important;margin-top:4px}
${P} .st-page .st-foot button{font-size:11px!important;color:${INK2}!important;padding:0 8px!important;font-weight:600!important}
${P} .st-page .st-build{font-size:10px!important;color:${INK2}!important}

/* ===== Spiellisten (Plakat, Entwurf K3 Spielkarten, 2026-11-15) ===== */
${P} [data-pk-cat="score"]{--pk-bg:${RED};background:${NOISE} 0 0/180px 180px,${RED}!important;background-blend-mode:multiply}
${P} [data-pk-cat="party"]{--pk-bg:${INK2};background:${INK2}!important}
${P} [data-pk-cat] .gt-gamehead h1:not(.gt-wm){font-family:${FONT}!important;font-weight:400!important;-webkit-text-stroke:0!important;transform:rotate(-2deg);padding:4px 0 8px}
${P} [data-pk-cat="score"] .gt-gamehead h1:not(.gt-wm){color:${INK2}!important;text-shadow:4.0px 0.0px 0 ${CREAM2}, 3.9px 1.0px 0 ${CREAM2}, 3.5px 2.0px 0 ${CREAM2}, 2.8px 2.8px 0 ${CREAM2}, 2.0px 3.5px 0 ${CREAM2}, 1.0px 3.9px 0 ${CREAM2}, -0.0px 4.0px 0 ${CREAM2}, -1.0px 3.9px 0 ${CREAM2}, -2.0px 3.5px 0 ${CREAM2}, -2.8px 2.8px 0 ${CREAM2}, -3.5px 2.0px 0 ${CREAM2}, -3.9px 1.0px 0 ${CREAM2}, -4.0px -0.0px 0 ${CREAM2}, -3.9px -1.0px 0 ${CREAM2}, -3.5px -2.0px 0 ${CREAM2}, -2.8px -2.8px 0 ${CREAM2}, -2.0px -3.5px 0 ${CREAM2}, -1.0px -3.9px 0 ${CREAM2}, 0.0px -4.0px 0 ${CREAM2}, 1.0px -3.9px 0 ${CREAM2}, 2.0px -3.5px 0 ${CREAM2}, 2.8px -2.8px 0 ${CREAM2}, 3.5px -2.0px 0 ${CREAM2}, 3.9px -1.0px 0 ${CREAM2}, 5px 5px 0 ${INK2}, 6px 6px 0 ${INK2}, 7px 7px 0 ${INK2}, 8px 8px 0 ${INK2}, 9px 9px 0 ${INK2}!important}
${P} [data-pk-cat="party"] .gt-gamehead h1:not(.gt-wm){color:${RED}!important;text-shadow:4.0px 0.0px 0 ${CREAM2}, 3.9px 1.0px 0 ${CREAM2}, 3.5px 2.0px 0 ${CREAM2}, 2.8px 2.8px 0 ${CREAM2}, 2.0px 3.5px 0 ${CREAM2}, 1.0px 3.9px 0 ${CREAM2}, -0.0px 4.0px 0 ${CREAM2}, -1.0px 3.9px 0 ${CREAM2}, -2.0px 3.5px 0 ${CREAM2}, -2.8px 2.8px 0 ${CREAM2}, -3.5px 2.0px 0 ${CREAM2}, -3.9px 1.0px 0 ${CREAM2}, -4.0px -0.0px 0 ${CREAM2}, -3.9px -1.0px 0 ${CREAM2}, -3.5px -2.0px 0 ${CREAM2}, -2.8px -2.8px 0 ${CREAM2}, -2.0px -3.5px 0 ${CREAM2}, -1.0px -3.9px 0 ${CREAM2}, 0.0px -4.0px 0 ${CREAM2}, 1.0px -3.9px 0 ${CREAM2}, 2.0px -3.5px 0 ${CREAM2}, 2.8px -2.8px 0 ${CREAM2}, 3.5px -2.0px 0 ${CREAM2}, 3.9px -1.0px 0 ${CREAM2}, 5px 5px 0 ${RED}, 6px 6px 0 ${RED}, 7px 7px 0 ${RED}, 8px 8px 0 ${RED}, 9px 9px 0 ${RED}!important}
${P} [data-pk-cat][data-pk-cat] .gtL-cards{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr));gap:22px 18px!important;padding:6px 6px 10px}
${P} [data-pk-cat][data-pk-cat] .gtL-cards>div{width:auto!important}
${P} [data-pk-cat][data-pk-cat] .gtL-gamecard{position:relative;height:auto!important;aspect-ratio:5/7;flex-direction:column!important;justify-content:center!important;padding:8px!important;border:none!important;outline:none!important;border-radius:16px!important;background:${CREAM2}!important;color:${INK2}!important;box-shadow:0 0 0 4px ${INK2},6px 7px 0 4px ${INK2}!important;--pkf:#D9CCAE}
${P} [data-pk-cat][data-pk-cat] .gtL-cards>:nth-child(4n+2).gtL-gamecard,${P} [data-pk-cat][data-pk-cat] .gtL-cards>:nth-child(4n+2) .gtL-gamecard,${P} [data-pk-cat][data-pk-cat] .gtL-cards>:nth-child(4n+3).gtL-gamecard,${P} [data-pk-cat][data-pk-cat] .gtL-cards>:nth-child(4n+3) .gtL-gamecard{background:${INK2}!important;color:${CREAM2}!important;box-shadow:0 0 0 4px ${CREAM2},6px 7px 0 4px #000!important;--pkf:#4A4440}
${P} [data-pk-cat][data-pk-cat] .gtL-cards>:nth-child(4n+1){transform:rotate(-2deg)}${P} [data-pk-cat][data-pk-cat] .gtL-cards>:nth-child(4n+2){transform:rotate(1.5deg)}${P} [data-pk-cat][data-pk-cat] .gtL-cards>:nth-child(4n+3){transform:rotate(1deg)}${P} [data-pk-cat][data-pk-cat] .gtL-cards>:nth-child(4n){transform:rotate(-1.5deg)}
${P} [data-pk-cat][data-pk-cat] .gtL-gamecard:active{transform:translateY(3px)}
${P} [data-pk-cat][data-pk-cat] .gtL-gamecard-logo{position:absolute!important;inset:8px;width:auto!important;min-width:0!important;border:2px solid var(--pkf);border-radius:10px;background:radial-gradient(circle at 50% 50%,${CREAM2} 0 38px,transparent 39px)!important}
${P} [data-pk-cat][data-pk-cat] .gtL-gamecard-logo>*{width:58px!important;height:58px!important;max-width:58px!important}
${P} [data-pk-cat][data-pk-cat] .gtL-gamecard-body{position:absolute;top:14px;left:14px;right:22%;z-index:1;flex:none!important}
${P} [data-pk-cat][data-pk-cat] .gtL-gamecard-title{font-family:${FONT}!important;font-weight:400!important;font-size:15px!important;line-height:1.02!important;color:inherit!important;overflow-wrap:normal}
${P} [data-pk-cat][data-pk-cat] .gtL-gamecard-var,${P} [data-pk-cat][data-pk-cat] .gtL-gamecard-status{font-size:10px!important;color:inherit!important;opacity:.8;letter-spacing:.02em!important;margin-top:3px!important}
${P} [data-pk-cat][data-pk-cat] .gtL-gamecard-mirror{display:block!important;position:absolute;bottom:14px;right:14px;max-width:70%;transform:rotate(180deg);font-family:${FONT};font-size:15px;line-height:1.02;text-align:left;z-index:1}
${P} [data-pk-cat][data-pk-cat] .gtL-gamecard-chev,${P} [data-pk-cat][data-pk-cat] .gtL-gamecard-spacer{display:none!important}
${P} [data-pk-cat][data-pk-cat] .gt-favstar{top:auto!important;bottom:6px!important;left:6px!important;right:auto!important;transform:none!important}
${P} [data-pk-cat][data-pk-cat] .gt-favstar[aria-pressed="true"] path{fill:${RED};stroke:${RED}}
${P} [data-pk-cat][data-pk-cat] .gt-favstar[aria-pressed="false"] path{stroke:#8A8178}
${P} .gtL-content [data-pk-cat][data-pk-cat] .gtL-cards{grid-template-columns:repeat(4,minmax(0,1fr))!important}
@media (max-width:1099px){${P} .gtL-content [data-pk-cat][data-pk-cat] .gtL-cards{grid-template-columns:repeat(3,minmax(0,1fr))!important}}
/* Weiches Einblenden der Titel (Magic UI «Blur Fade») */
${P} .gt-wm{animation:pk-in .55s cubic-bezier(.2,.8,.2,1) both}
@keyframes pk-in{from{opacity:0;transform:translateY(8px);filter:blur(5px)}to{opacity:1;transform:none;filter:none}}
${P} :focus-visible{outline-color:#2D6BFF!important}
@media (prefers-reduced-motion: reduce){${P} .gt-su-btn::after,${P} .pk-shine::after,${P} .gt-wm{animation:none!important}}
`;

export { PLAKAT_CSS };
