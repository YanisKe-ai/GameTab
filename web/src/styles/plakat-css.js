// Modus «Plakat»: globale Stilschicht. Gilt NUR unter html[data-gt-skin="plakat"],
// Nocturne, Hell und Noir bleiben unberührt. Inline-Stile der Bauteile werden mit !important übersteuert.
const P = 'html[data-gt-skin="plakat"]';
const INK = "#141414", CREAM = "#F4EAD5", PAPER = "#FFFDF7";
const FONT = "'GT Ryu Ext','Bagel Fat One','Bowlby One',sans-serif";
// Startseite Plakat (Entwurf R2b): kräftiges Rot, warmes Schwarz, Creme, Körnung
const RED = "#E4312B", INK2 = "#1A1716", CREAM2 = "#F3EAD3";
const NOISE = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.32'/%3E%3C/svg%3E\")";

const PLAKAT_CSS = `
/* Zeichen wie «ū» (Ryū) fehlen in Bagel Fat One: kräftiger Ersatz nur für erweiterte Lateinzeichen */
@font-face{font-family:'GT Ryu Ext';src:url('./fonts/ArchivoBlack-Regular.ttf') format('truetype');font-display:swap;unicode-range:U+0100-024F}
${P} body .st-btn.st-segbtn.st-segbtn{font-family:${FONT}!important}
${P} body{background:${CREAM}}
${P} .gtL-shellpage::before{display:none!important}
${P} .gt-gamehead h1.gt-wm{display:block!important;width:100%!important;text-align:center!important}
/* Unterzeile unter dem Spieltitel: schwarzes Etikett statt grauer Kleinschrift auf Rot */
${P} .gt-wm-sub{display:table!important;margin:-2px auto 8px!important;background:${INK2}!important;color:${CREAM2}!important;-webkit-text-fill-color:${CREAM2}!important;padding:3px 11px 2px!important;border-radius:8px!important;font-weight:700!important;opacity:1!important}
${P} ::selection{background:${INK};color:#F3EAD3}
/* Ränder als Outline nach innen: sie nehmen keinen Platz, Aufbau bleibt wie in Hell */
/* Titel-Schriftzüge der Spiele */
${P} .gt-wm{font-family:${FONT}!important;-webkit-text-stroke:.05em ${INK}!important;paint-order:stroke fill!important;text-shadow:.05em .065em 0 ${INK}!important;letter-spacing:0!important}
/* Kopf: Zurück, Erscheinungsbild, Menü */
${P} .gt-hf{background:${PAPER}!important;outline:2.5px solid ${INK}!important;outline-offset:-2.5px!important;box-shadow:0 3px 0 ${INK}!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important;color:${INK}!important}
${P} .gt-hb:active .gt-hf{transform:translateY(2px);box-shadow:0 1px 0 ${INK}!important}
/* Einrichtung (gemeinsam für alle Spiele) */
${P} .gt-su-label{font-family:${FONT}!important;letter-spacing:.06em!important;color:${CREAM2}!important;background:${INK2};display:inline-block;width:auto!important;padding:3px 9px 2px;border-radius:7px;line-height:1.3}
${P} .gt-su-row{outline:2px solid ${INK}!important;outline-offset:-2px!important;box-shadow:0 3px 0 ${INK}!important;background:${PAPER}!important}
${P} .gt-su-chip,${P} .gt-su-ib,${P} .gt-su-add,${P} .gt-su-numin{outline:2px solid ${INK}!important;outline-offset:-2px!important}
/* «+ Spieler»: nie graue Schrift auf Rot, sondern Creme-Sticker mit gestricheltem Rand */
${P} .gt-su-add{background:${CREAM2}!important;color:${INK2}!important;border:2px dashed ${INK2}!important;outline:none!important;font-family:${FONT}!important;font-weight:400!important}
${P} .gt-su-add svg{stroke:${INK2}!important;color:${INK2}!important}
${P} .gt-su-add:disabled{opacity:.55}
${P} .gt-cdeck-btn{background:${CREAM2}!important;color:${INK2}!important;border:2px dashed ${INK2}!important;font-family:${FONT}!important;font-weight:400!important}
${P} .gt-cdeck-btn svg{color:${INK2}!important;stroke:${INK2}!important}
${P} .gt-su-chip{font-family:${FONT}!important;font-weight:400!important}
${P} .gt-su-btn{position:relative;overflow:hidden;outline:2.5px solid ${INK}!important;outline-offset:-2.5px!important;box-shadow:0 5px 0 ${INK}!important;font-family:${FONT}!important;font-weight:400!important;letter-spacing:.02em}
${P} .gt-su-cta::before{background:var(--pk-bg,${CREAM})!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important}
${P} .gt-gp-row>button,${P} .gt-rn-chip{outline:2px solid ${INK}!important;outline-offset:-2px!important;background:${PAPER}!important;color:${INK}!important;box-shadow:0 3px 0 ${INK}!important}
${P} .gt-rn-chip{box-shadow:none!important}
${P} .gt-rn-row{overflow-y:hidden!important;overscroll-behavior:contain;touch-action:pan-x pan-y}
${P} .gt-gamehead.is-stuck,${P} .gt-gamehead.is-stuck::before{background:radial-gradient(rgba(20,20,20,.10) 1.2px,transparent 1.4px) 0 0/14px 14px,var(--pk-bg,${CREAM})!important;background-attachment:fixed!important}
${P} .gt-gamehead.is-stuck{box-shadow:0 2.5px 0 ${INK}!important}
${P} .gtL-content .gt-gamehead.is-stuck{background:none!important;box-shadow:none!important}
${P} .gt-gamehead[data-gt-hst].is-stuck::after{background:radial-gradient(rgba(20,20,20,.10) 1.2px,transparent 1.4px) 0 0/14px 14px,var(--pk-bg,${CREAM})!important;background-attachment:fixed!important;box-shadow:0 2.5px 0 ${INK}!important}
${P} .gt-gamehead[data-gt-hst].is-stuck{box-shadow:none!important}
/* Laptop/iPad: unter kurzen Seiten nie Creme, immer Rot mit Körnung */
${P} .gtL-content{background:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.32'/%3E%3C/svg%3E") 0 0/180px 180px,${RED}!important;background-blend-mode:multiply}
/* Querformat: Unterzeile hat neben den Kopfknöpfen keinen Platz */
[data-phone-landscape] ${P} .gt-wm-sub,${P}[data-phone-landscape] .gt-wm-sub{display:none!important}
${P} .trt-info{display:table;background:${CREAM2};color:${INK2}!important;padding:3px 9px;border-radius:8px;box-shadow:0 0 0 2px ${INK2};font-weight:600}
${P} .gt-pass-label{display:table!important;margin-left:auto!important;margin-right:auto!important;background:${INK2};color:${CREAM2}!important;padding:3px 10px 2px;border-radius:8px}
${P} .gt-gamehead h1:not(.gt-wm){font-family:${FONT}!important;font-weight:400!important;font-size:clamp(21px,6.6vw,30px)!important;line-height:1.05!important;letter-spacing:0!important;color:${CREAM}!important;-webkit-text-stroke:.07em ${INK};paint-order:stroke fill;text-shadow:.05em .065em 0 ${INK};white-space:nowrap;overflow-wrap:normal!important}
${P} [data-pk-cat] .gt-gamehead h1:not(.gt-wm){color:${INK}!important;-webkit-text-stroke:0;text-shadow:2px 2px 0 ${PAPER}!important}
${P} .podium-pop[role="dialog"]{outline:2.5px solid ${INK}!important;outline-offset:-2.5px!important;box-shadow:0 6px 0 ${INK}!important;background:${PAPER}!important;color:${INK}!important}
${P} .podium-pop[role="dialog"] h2,${P} .podium-pop[role="dialog"] [id^="gt-cf-t"]{font-family:${FONT}!important;font-weight:400!important}
${P} .podium-pop[role="dialog"] button{outline:2px solid ${INK}!important;outline-offset:-2px!important;box-shadow:0 3px 0 ${INK}!important}
${P} .gt-hm-panel{--hm-panel:${PAPER};--hm-ink:${INK};outline:2.5px solid ${INK};outline-offset:-2.5px;box-shadow:0 5px 0 ${INK}!important}
/* Spielmenü: Icons schwarz auf Creme statt bunt, Überschrift schwarzes Etikett; nur «Spiel verwerfen» rot */
${P} .gt-hm-panel{--hm-muted:${INK2};--hm-line:rgba(26,23,22,.25);--hm-hover:rgba(228,49,43,.12)}
${P} .gt-hm-row:not(.is-danger) .gt-hm-ic{--ic:${INK2}!important;background:${CREAM2}!important;box-shadow:inset 0 0 0 2px ${INK2}}
${P} .gt-hm-row.is-danger .gt-hm-ic{--ic:${CREAM2}!important;background:${RED}!important;box-shadow:inset 0 0 0 2px ${INK2}}
${P} .gt-hm-row.is-danger{color:${RED}!important}
${P} .gt-hm-h{display:table;margin:4px 8px 4px;padding:3px 9px 2px!important;border-radius:7px;background:${INK2};color:${CREAM2}!important;font-family:${FONT};font-weight:400!important}
${P} .gt-hm-row{font-weight:700}
/* Einstellungen «Ich bin»: Hinweis auf schwarzer Zeile lesbar */
${P} #gt-profile-hint{color:rgba(243,234,211,.82)!important}
${P} body .gtL-start .gtL-showcase-hint.gtL-showcase-hint,${P} .gtL-showcase-hint{-webkit-text-fill-color:${CREAM2}!important;display:table!important;margin:10px auto 0!important;padding:3px 10px 2px;border-radius:8px;background:${INK2};color:${CREAM2}!important;font-weight:600!important;font-size:12px!important}
${P} body button.gt-srch-cancel.gt-srch-cancel{color:${CREAM2}!important;-webkit-text-fill-color:${CREAM2}!important;position:relative;z-index:1000}
${P} .gt-hm-row:focus-visible,${P} [role=dialog] :focus-visible{outline-color:${INK2}!important}
/* Stand-Karte (GtLStandings, z. B. Tutto Laptop): Creme, Sticker-Rand, Punkte und Balken nur Rot/Schwarz */
${P} .gt-lstand,${P} .gtL-standings{background:${CREAM}!important;border:none!important;outline:2.5px solid ${INK};outline-offset:-2.5px;box-shadow:0 4px 0 ${INK};color:${INK}!important}
${P} .gt-lstand div,${P} .gt-lstand span,${P} .gtL-standings div,${P} .gtL-standings span{color:${INK}!important}
${P} .gt-lstand span[style*="border-radius: 50%"],${P} .gtL-standings span[style*="border-radius: 50%"]{background:${RED}!important;box-shadow:0 0 0 1.5px ${INK}}
${P} .gt-lstand div[style*="scaleX"],${P} .gtL-standings div[style*="scaleX"]{background:${INK}!important}
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
/* Ryū Handy R1 (Wahl Yanis 16.11.2026): Zahnrad und Modus-Knopf als runde Zacken-Sticker wie der Statistik-Sticker, untereinander, leicht versetzt, sich berührend */
${P}:not(.gt-laptopmode):not([data-phone-landscape]) .gtL-start .gtL-start-gear.gtL-start-gear.gtL-start-gear,${P}:not(.gt-laptopmode):not([data-phone-landscape]) .gtL-start .gtL-start-gear.gtL-start-theme.pl-hide{background:url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2064%2068%22%3E%3Cpolygon%20points%3D%2260.5%2C32.0%2057.1%2C36.4%2058.8%2C41.7%2054.1%2C44.8%2053.8%2C50.3%2048.4%2C51.5%2046.2%2C56.7%2040.7%2C56.0%2036.9%2C60.1%2032.0%2C57.5%2027.1%2C60.1%2023.3%2C56.0%2017.8%2C56.7%2015.6%2C51.5%2010.2%2C50.3%209.9%2C44.8%205.2%2C41.7%206.9%2C36.4%203.5%2C32.0%206.9%2C27.6%205.2%2C22.3%209.9%2C19.2%2010.2%2C13.7%2015.6%2C12.5%2017.7%2C7.3%2023.3%2C8.0%2027.1%2C3.9%2032.0%2C6.5%2036.9%2C3.9%2040.7%2C8.0%2046.2%2C7.3%2048.4%2C12.5%2053.8%2C13.7%2054.1%2C19.3%2058.8%2C22.3%2057.1%2C27.6%22%20transform%3D%22translate%280%2C4%29%22%20fill%3D%22%231A1716%22%20stroke%3D%22%231A1716%22%20stroke-width%3D%222.5%22%20stroke-linejoin%3D%22round%22/%3E%3Cpolygon%20points%3D%2260.5%2C32.0%2057.1%2C36.4%2058.8%2C41.7%2054.1%2C44.8%2053.8%2C50.3%2048.4%2C51.5%2046.2%2C56.7%2040.7%2C56.0%2036.9%2C60.1%2032.0%2C57.5%2027.1%2C60.1%2023.3%2C56.0%2017.8%2C56.7%2015.6%2C51.5%2010.2%2C50.3%209.9%2C44.8%205.2%2C41.7%206.9%2C36.4%203.5%2C32.0%206.9%2C27.6%205.2%2C22.3%209.9%2C19.2%2010.2%2C13.7%2015.6%2C12.5%2017.7%2C7.3%2023.3%2C8.0%2027.1%2C3.9%2032.0%2C6.5%2036.9%2C3.9%2040.7%2C8.0%2046.2%2C7.3%2048.4%2C12.5%2053.8%2C13.7%2054.1%2C19.3%2058.8%2C22.3%2057.1%2C27.6%22%20fill%3D%22%23F3EAD3%22%20stroke%3D%22%231A1716%22%20stroke-width%3D%222.5%22%20stroke-linejoin%3D%22round%22/%3E%3C/svg%3E") center/100% 100% no-repeat!important;border:none!important;box-shadow:none!important;outline:none!important;border-radius:0!important;padding-bottom:4px!important;box-sizing:border-box;width:56px!important;height:60px!important}
${P}:not(.gt-laptopmode):not([data-phone-landscape]) .gtL-start .gtL-start-gear svg{color:#1A1716!important}
${P}:not(.gt-laptopmode):not([data-phone-landscape]) .gtL-start .gtL-start-gear.gtL-start-gear.gtL-start-gear:not(.gtL-start-theme){top:152px!important;right:10px!important;rotate:7deg;z-index:4}
${P}:not(.gt-laptopmode):not([data-phone-landscape]) .gtL-start .gtL-start-gear.gtL-start-theme.pl-hide{top:194px!important;right:26px!important;rotate:-6deg;z-index:3}
${P}:not(.gt-laptopmode):not([data-phone-landscape]) .gtL-start .gtL-start-gear:focus-visible{outline:3px solid #1A1716!important;outline-offset:2px}
${P} .gt-hero-logo.gt-hero-mark-pk svg{transform:translate(-6px,-6px) scale(.99) rotate(-9deg)!important;transform-origin:50% 50%}
${P} .gtL-start .gtL-start-gear{background:${CREAM2}!important;outline:none!important;border:none!important;box-shadow:4px 5px 0 ${INK2}!important;color:${INK2}!important}
${P} .gtL-start .gt-hero-sub{display:flex;justify-content:center}
/* eigene Eigenschaft «translate», damit Einblend-Animationen (transform) das Logo beim Zurückkommen nicht springen lassen */
${P} .gtL-start .gtL-headwrap{translate:0 -22px}
${P}:not(.gt-laptopmode):not([data-phone-landscape]) .gtL-start .gtL-headwrap{translate:0 -48px}
${P}:not(.gt-laptopmode):not([data-phone-landscape]) .gtL-start .gt-hero-sub{translate:-6px 14px;rotate:0deg;filter:drop-shadow(2.5px 0 0 ${INK2}) drop-shadow(-2.5px 0 0 ${INK2}) drop-shadow(0 2.5px 0 ${INK2}) drop-shadow(0 -2.5px 0 ${INK2}) drop-shadow(4px 5px 0 ${INK2})}
${P}:not(.gt-laptopmode):not([data-phone-landscape]) body .gtL-start .gt-hero-sub.gt-hero-sub div{background:${CREAM2}!important;color:${INK2}!important;clip-path:polygon(100.0% 50.0%,85.1% 58.0%,95.0% 71.7%,78.1% 72.4%,81.2% 89.1%,65.6% 82.4%,61.1% 98.7%,50.0% 86.0%,38.9% 98.7%,34.4% 82.4%,18.8% 89.1%,21.9% 72.4%,5.0% 71.7%,14.9% 58.0%,0.0% 50.0%,14.9% 42.0%,5.0% 28.3%,21.9% 27.6%,18.8% 10.9%,34.4% 17.6%,38.9% 1.3%,50.0% 14.0%,61.1% 1.3%,65.6% 17.6%,81.2% 10.9%,78.1% 27.6%,95.0% 28.3%,85.1% 42.0%)!important;transform:none!important;padding:28px 34px!important;margin-top:0!important;font-size:12px!important;cursor:pointer;-webkit-tap-highlight-color:transparent}
/* Querformat: ALL-IN-ONE als Explosion wie im Hochformat, ohne Comic-Showdown (2026-11-18) */
${P}[data-phone-landscape] .gtL-start .gt-hero-sub{translate:0 2px;rotate:0deg;filter:drop-shadow(2.5px 0 0 ${INK2}) drop-shadow(-2.5px 0 0 ${INK2}) drop-shadow(0 2.5px 0 ${INK2}) drop-shadow(0 -2.5px 0 ${INK2}) drop-shadow(4px 5px 0 ${INK2})}
${P}[data-phone-landscape] body .gtL-start .gt-hero-sub.gt-hero-sub div{background:${CREAM2}!important;color:${INK2}!important;clip-path:polygon(100.0% 50.0%,85.1% 58.0%,95.0% 71.7%,78.1% 72.4%,81.2% 89.1%,65.6% 82.4%,61.1% 98.7%,50.0% 86.0%,38.9% 98.7%,34.4% 82.4%,18.8% 89.1%,21.9% 72.4%,5.0% 71.7%,14.9% 58.0%,0.0% 50.0%,14.9% 42.0%,5.0% 28.3%,21.9% 27.6%,18.8% 10.9%,34.4% 17.6%,38.9% 1.3%,50.0% 14.0%,61.1% 1.3%,65.6% 17.6%,81.2% 10.9%,78.1% 27.6%,95.0% 28.3%,85.1% 42.0%)!important;transform:none!important;padding:22px 30px!important;margin-top:0!important;font-size:12px!important;cursor:default;-webkit-tap-highlight-color:transparent}
${P}:not(.gt-laptopmode):not([data-phone-landscape]) body .gtL-start .gt-hero-sub.gt-hero-sub div:active{scale:.94}
${P}:not(.gt-laptopmode):not([data-phone-landscape]) body .gtL-start .gt-hero-sub.gt-hero-sub div:focus-visible{outline:3px dashed ${INK2};outline-offset:2px}
@media (max-height:760px){${P}:not(.gt-laptopmode):not([data-phone-landscape]) .gtL-start .gt-hero-sub{translate:-6px 0px}
${P}:not(.gt-laptopmode):not([data-phone-landscape]) .gtL-start .gtL-start-gear.gtL-start-gear.gtL-start-gear:not(.gtL-start-theme){top:30px!important}
${P}:not(.gt-laptopmode):not([data-phone-landscape]) .gtL-start .gtL-start-gear.gtL-start-theme.pl-hide{top:72px!important}}
${P} .gtL-start [data-onboard="scorepads-tile"],${P} .gtL-start [data-onboard="party-tile"]{translate:0 var(--pk-tshift,0px)}
/* Ryū Handy (Wunsch Yanis 16.11.): Kacheln etwas grösser und weiter oben */
${P}:not(.gt-laptopmode):not([data-phone-landscape]) .gtL-start [data-onboard="scorepads-tile"],${P}:not(.gt-laptopmode):not([data-phone-landscape]) .gtL-start [data-onboard="party-tile"]{translate:0 calc(var(--pk-tshift,0px) + 2px - var(--pk-tfix,0px))}
${P}:not(.gt-laptopmode):not([data-phone-landscape]) .gtL-start .gtL-tile{padding:23px 20px!important}
${P}:not(.gt-laptopmode):not([data-phone-landscape]) .gtL-start{--pk-tfix:2px}
/* Abstände über margin statt transform: transform kollidiert mit den Einblend-Animationen und springt danach (Zurückwischen) */
${P}:not(.gt-laptopmode):not([data-phone-landscape]) .gtL-start [data-onboard="search"]{margin-top:-46px}
${P}:not(.gt-laptopmode):not([data-phone-landscape]) .gtL-start .gtL-showcase.gtL-showcase{margin-top:23px!important}
${P}:not(.gt-laptopmode):not([data-phone-landscape]) .gtL-start .gtL-tipcard.gtL-tipcard{margin-top:44px!important}
@media (display-mode: standalone){${P}:not(.gt-laptopmode):not([data-phone-landscape]) .gtL-start .gtL-tipcard.gtL-tipcard{margin-top:6px!important}}
@media (max-height:760px){${P}:not(.gt-laptopmode):not([data-phone-landscape]) .gtL-start .gtL-tipcard.gtL-tipcard{margin-top:26px!important}}
${P}:not(.gt-laptopmode):not([data-phone-landscape]) .gtL-start .gtL-tile-title{font-size:clamp(24px,8.1vw,33px)!important}
${P}.gt-laptopmode .gtL-start .gtL-headwrap,${P}[data-phone-landscape] .gtL-start .gtL-headwrap{translate:none;transform:none}
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
/* Startseite Querformat S10 (Ryū): Flügel als schräge Sticker-Karten, Zahnrad und Modus überlappen leicht */
${P}[data-phone-landscape] .gtL-start .gtL-startcol .gtL-tile{border-radius:26px!important;margin:6px 10px 12px 6px!important;width:calc(100% - 16px)!important;height:calc(100% - 18px)!important;padding:14px 12px!important}
${P}[data-phone-landscape] .gtL-start .gtL-startcol .gtL-tile>div{flex:none!important}
${P}[data-phone-landscape] .gtL-start .gtL-startcol .gtL-tile-title{font-size:clamp(14px,2.15vw,24px)!important;line-height:1.05!important;overflow-wrap:normal!important;word-break:keep-all!important}
/* (alte Modus-Position, ersetzt durch Sticker unten) */
/* Querformat: Zahnrad und Modus als gezackte Sticker wie im Hochformat (2026-11-18) */
${P}[data-phone-landscape] .gtL-start .gtL-start-gear.gtL-start-gear.gtL-start-gear{P}:not(.gt-laptopmode):not([data-phone-landscape]) .gtL-start .gtL-start-gear.gtL-start-gear.gtL-start-gear,${P}:not(.gt-laptopmode):not([data-phone-landscape]) .gtL-start .gtL-start-gear.gtL-start-theme.pl-hide{background:url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2064%2068%22%3E%3Cpolygon%20points%3D%2260.5%2C32.0%2057.1%2C36.4%2058.8%2C41.7%2054.1%2C44.8%2053.8%2C50.3%2048.4%2C51.5%2046.2%2C56.7%2040.7%2C56.0%2036.9%2C60.1%2032.0%2C57.5%2027.1%2C60.1%2023.3%2C56.0%2017.8%2C56.7%2015.6%2C51.5%2010.2%2C50.3%209.9%2C44.8%205.2%2C41.7%206.9%2C36.4%203.5%2C32.0%206.9%2C27.6%205.2%2C22.3%209.9%2C19.2%2010.2%2C13.7%2015.6%2C12.5%2017.7%2C7.3%2023.3%2C8.0%2027.1%2C3.9%2032.0%2C6.5%2036.9%2C3.9%2040.7%2C8.0%2046.2%2C7.3%2048.4%2C12.5%2053.8%2C13.7%2054.1%2C19.3%2058.8%2C22.3%2057.1%2C27.6%22%20transform%3D%22translate%280%2C4%29%22%20fill%3D%22%231A1716%22%20stroke%3D%22%231A1716%22%20stroke-width%3D%222.5%22%20stroke-linejoin%3D%22round%22/%3E%3Cpolygon%20points%3D%2260.5%2C32.0%2057.1%2C36.4%2058.8%2C41.7%2054.1%2C44.8%2053.8%2C50.3%2048.4%2C51.5%2046.2%2C56.7%2040.7%2C56.0%2036.9%2C60.1%2032.0%2C57.5%2027.1%2C60.1%2023.3%2C56.0%2017.8%2C56.7%2015.6%2C51.5%2010.2%2C50.3%209.9%2C44.8%205.2%2C41.7%206.9%2C36.4%203.5%2C32.0%206.9%2C27.6%205.2%2C22.3%209.9%2C19.2%2010.2%2C13.7%2015.6%2C12.5%2017.7%2C7.3%2023.3%2C8.0%2027.1%2C3.9%2032.0%2C6.5%2036.9%2C3.9%2040.7%2C8.0%2046.2%2C7.3%2048.4%2C12.5%2053.8%2C13.7%2054.1%2C19.3%2058.8%2C22.3%2057.1%2C27.6%22%20fill%3D%22%23F3EAD3%22%20stroke%3D%22%231A1716%22%20stroke-width%3D%222.5%22%20stroke-linejoin%3D%22round%22/%3E%3C/svg%3E") center/100% 100% no-repeat!important;border:none!important;box-shadow:none!important;outline:none!important;border-radius:0!important;padding-bottom:4px!important;box-sizing:border-box;width:56px!important;height:60px!important}
${P}[data-phone-landscape] .gtL-start .gtL-start-gear.gtL-start-gear.gtL-start-gear svg{color:#1A1716!important}
${P}[data-phone-landscape] .gtL-start .gtL-start-gear.gtL-start-gear.gtL-start-gear:not(.gtL-start-theme){top:calc(var(--s10-gy, -200px) - 8px)!important;left:calc(var(--s10-gx, 0px) - 62px)!important;rotate:7deg;z-index:4}
${P}[data-phone-landscape] .gtL-start .gtL-start-gear.gtL-start-gear.gtL-start-gear.gtL-start-theme{top:calc(var(--s10-gy, -200px) - 6px)!important;left:calc(var(--s10-gx, 0px) - 108px)!important;rotate:-6deg;z-index:3}
${P}[data-phone-landscape] .gtL-start .gtL-start-gear.gtL-start-gear.gtL-start-gear:focus-visible{outline:3px solid #1A1716!important;outline-offset:2px}
${P} .gtL-start [data-onboard="search"] input,${P} .gtL-start [data-onboard="search"] [class*="search"]{outline:none!important;border:none!important;border-radius:26px!important;background:${CREAM2}!important;box-shadow:4px 5px 0 ${INK2}!important;color:${INK2}!important}
${P} .gtL-start .gtL-seclabel{color:${INK2}!important;font-family:${FONT}!important;font-weight:400!important;letter-spacing:.12em!important}
${P} .gtL-start .gtL-showcase-icon{background:${CREAM2}!important;outline:none!important;border:none!important;box-shadow:3px 4px 0 ${INK2}!important}
${P} .gtL-start .gtL-showcase-label{color:${INK2}!important;opacity:1!important;font-family:${FONT}!important;font-weight:400!important;font-size:11px!important}
${P} .gtL-start .gtL-showcase-hint,${P} .gtL-start .gtL-showcase-arrow{color:${INK2}!important}
${P} .gtL-start .gtL-tipcard-body{background:${INK2}!important;border:none!important;outline:none!important;border-radius:10px!important;box-shadow:none!important}
${P} .gtL-start .gtL-tipcard-body *{color:${CREAM2}!important}
${P} .gtL-start .gtL-tipcard-body svg [fill]:not([fill="none"]){fill:${CREAM2}!important}
${P} .gtL-start .gtL-tipcard-body svg [stroke]:not([stroke="none"]){stroke:${CREAM2}!important}
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
/* Einstellungen Querformat (Entwurf RE2b, 2026-11-18): Menü links, Inhalt rechts */
${P}[data-phone-landscape] .st-page .st-title{justify-self:start;font-size:24px!important;color:${CREAM2}!important;text-shadow:none!important;background:${INK2};padding:6px 14px 8px;border-radius:12px;box-shadow:0 0 0 3px ${CREAM2},4px 5px 0 3px ${INK2};transform:rotate(-2deg);margin:6px 0 10px 6px!important}
${P}[data-phone-landscape] .st-page .st-nav{gap:8px;padding:4px 10px 6px 6px}
${P}[data-phone-landscape] .st-page .st-navbtn{background:transparent!important;border:none!important;color:${INK2}!important;font-family:${FONT}!important;font-weight:400!important;font-size:16px;border-radius:999px;min-height:44px}
${P}[data-phone-landscape] .st-page .st-navbtn svg{color:${INK2}!important}
${P}[data-phone-landscape] .st-page .st-navk{background:${CREAM2}!important;color:${INK2}!important;box-shadow:0 0 0 2px ${INK2};font-family:${FONT}!important;font-weight:400!important}
${P}[data-phone-landscape] .st-page .st-navbtn[data-on]{background:${INK2}!important;color:${RED}!important;box-shadow:0 0 0 3px ${CREAM2},4px 5px 0 3px ${INK2}}
${P}[data-phone-landscape] .st-page .st-navbtn[data-on] svg{color:${CREAM2}!important}
${P}[data-phone-landscape] .st-page .st-navbtn[data-on] .st-navk{background:${RED}!important;color:${CREAM2}!important;box-shadow:0 0 0 2px ${CREAM2}}
${P}[data-phone-landscape] .st-page .st-grptitle{color:${INK2}!important;font-family:${FONT}!important;font-weight:400!important;font-size:19px!important;letter-spacing:.02em!important;text-transform:none!important;padding:4px 6px 2px!important}
${P}[data-phone-landscape] .st-page .st-main{padding:6px 12px 14px 8px}
${P}[data-phone-landscape] .st-page .st-cards{gap:18px!important;padding:2px 2px 6px!important}
${P}[data-phone-landscape] .st-page[data-st-grp="info"] .st-foot{background:${CREAM2}!important;border:none!important;border-radius:22px!important;box-shadow:0 0 0 4px ${INK2},6px 7px 0 4px ${INK2};transform:rotate(-1deg);margin:4px 8px 0 4px}
${P}[data-phone-landscape] .st-page[data-st-grp="info"] .st-foot button{font-size:15px!important;color:${INK2}!important;padding:0 16px!important}
${P}[data-phone-landscape] .st-page[data-st-grp="info"] .st-foot button+button{border-top:2px solid ${INK2}!important}
${P}[data-phone-landscape] .st-page[data-st-grp="info"] .st-build{font-size:13px!important;padding:12px 16px!important}

/* ===== Spiellisten (Ryū, Entwurf KK3 Querkarten, 2026-11-15) ===== */
${P} [data-pk-cat="score"]{--pk-bg:${RED};background:${NOISE} 0 0/180px 180px,${RED}!important;background-blend-mode:multiply}
${P} [data-pk-cat="party"]{--pk-bg:${RED};background:${NOISE} 0 0/180px 180px,${RED}!important;background-blend-mode:multiply}
${P} [data-pk-cat] .gt-gamehead h1:not(.gt-wm){font-family:${FONT}!important;font-weight:400!important;-webkit-text-stroke:0!important;transform:rotate(-2deg);padding:4px 0 8px}
${P} [data-pk-cat="score"] .gt-gamehead h1:not(.gt-wm){text-transform:none!important;-webkit-text-fill-color:currentColor!important;color:${INK2}!important;text-shadow:4.0px 0.0px 0 ${CREAM2}, 3.9px 1.0px 0 ${CREAM2}, 3.5px 2.0px 0 ${CREAM2}, 2.8px 2.8px 0 ${CREAM2}, 2.0px 3.5px 0 ${CREAM2}, 1.0px 3.9px 0 ${CREAM2}, -0.0px 4.0px 0 ${CREAM2}, -1.0px 3.9px 0 ${CREAM2}, -2.0px 3.5px 0 ${CREAM2}, -2.8px 2.8px 0 ${CREAM2}, -3.5px 2.0px 0 ${CREAM2}, -3.9px 1.0px 0 ${CREAM2}, -4.0px -0.0px 0 ${CREAM2}, -3.9px -1.0px 0 ${CREAM2}, -3.5px -2.0px 0 ${CREAM2}, -2.8px -2.8px 0 ${CREAM2}, -2.0px -3.5px 0 ${CREAM2}, -1.0px -3.9px 0 ${CREAM2}, 0.0px -4.0px 0 ${CREAM2}, 1.0px -3.9px 0 ${CREAM2}, 2.0px -3.5px 0 ${CREAM2}, 2.8px -2.8px 0 ${CREAM2}, 3.5px -2.0px 0 ${CREAM2}, 3.9px -1.0px 0 ${CREAM2}, 5px 5px 0 ${INK2}, 6px 6px 0 ${INK2}, 7px 7px 0 ${INK2}, 8px 8px 0 ${INK2}, 9px 9px 0 ${INK2}!important}
${P} [data-pk-cat="party"] .gt-gamehead h1:not(.gt-wm){text-transform:none!important;-webkit-text-fill-color:currentColor!important;color:${INK2}!important;text-shadow:4.0px 0.0px 0 ${CREAM2}, 3.9px 1.0px 0 ${CREAM2}, 3.5px 2.0px 0 ${CREAM2}, 2.8px 2.8px 0 ${CREAM2}, 2.0px 3.5px 0 ${CREAM2}, 1.0px 3.9px 0 ${CREAM2}, -0.0px 4.0px 0 ${CREAM2}, -1.0px 3.9px 0 ${CREAM2}, -2.0px 3.5px 0 ${CREAM2}, -2.8px 2.8px 0 ${CREAM2}, -3.5px 2.0px 0 ${CREAM2}, -3.9px 1.0px 0 ${CREAM2}, -4.0px -0.0px 0 ${CREAM2}, -3.9px -1.0px 0 ${CREAM2}, -3.5px -2.0px 0 ${CREAM2}, -2.8px -2.8px 0 ${CREAM2}, -2.0px -3.5px 0 ${CREAM2}, -1.0px -3.9px 0 ${CREAM2}, 0.0px -4.0px 0 ${CREAM2}, 1.0px -3.9px 0 ${CREAM2}, 2.0px -3.5px 0 ${CREAM2}, 2.8px -2.8px 0 ${CREAM2}, 3.5px -2.0px 0 ${CREAM2}, 3.9px -1.0px 0 ${CREAM2}, 5px 5px 0 ${INK2}, 6px 6px 0 ${INK2}, 7px 7px 0 ${INK2}, 8px 8px 0 ${INK2}, 9px 9px 0 ${INK2}!important}
${P} [data-pk-cat][data-pk-cat] .gtL-cards{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr));gap:24px 20px!important;padding:8px 8px 12px 6px}
${P} [data-pk-cat][data-pk-cat] .gtL-cards>div{width:auto!important}
${P} [data-pk-cat][data-pk-cat] .gtL-gamecard{position:relative;height:auto!important;min-height:72px;aspect-ratio:2.3/1;flex-direction:row!important;justify-content:flex-start!important;align-items:center!important;gap:10px!important;padding:0 10px!important;border:none!important;outline:none!important;border-radius:16px!important;background:${CREAM2}!important;color:${INK2}!important;box-shadow:0 0 0 3px ${INK2},4px 5px 0 3px ${INK2}!important}
${P} [data-pk-cat][data-pk-cat] .gtL-cards>:nth-child(4n+2).gtL-gamecard,${P} [data-pk-cat][data-pk-cat] .gtL-cards>:nth-child(4n+2) .gtL-gamecard,${P} [data-pk-cat][data-pk-cat] .gtL-cards>:nth-child(4n+3).gtL-gamecard,${P} [data-pk-cat][data-pk-cat] .gtL-cards>:nth-child(4n+3) .gtL-gamecard{background:${INK2}!important;color:${CREAM2}!important;box-shadow:0 0 0 3px ${CREAM2},4px 5px 0 3px ${INK2}!important}
${P} [data-pk-cat][data-pk-cat] .gtL-cards>:nth-child(6n+1){transform:rotate(-2deg)}${P} [data-pk-cat][data-pk-cat] .gtL-cards>:nth-child(6n+2){transform:rotate(1.5deg)}${P} [data-pk-cat][data-pk-cat] .gtL-cards>:nth-child(6n+3){transform:rotate(-1deg)}${P} [data-pk-cat][data-pk-cat] .gtL-cards>:nth-child(6n+4){transform:rotate(2deg)}${P} [data-pk-cat][data-pk-cat] .gtL-cards>:nth-child(6n+5){transform:rotate(1deg)}${P} [data-pk-cat][data-pk-cat] .gtL-cards>:nth-child(6n){transform:rotate(-1.5deg)}
${P} [data-pk-cat][data-pk-cat] .gtL-gamecard:active{transform:translateY(3px)}
${P} [data-pk-cat][data-pk-cat] .gtL-gamecard-logo{width:48px!important;min-width:48px!important;height:48px;border-radius:50%;background:transparent!important}
${P} [data-pk-cat][data-pk-cat] .gtL-cards>:nth-child(4n+2) .gtL-gamecard-logo,${P} [data-pk-cat][data-pk-cat] .gtL-cards>:nth-child(4n+3) .gtL-gamecard-logo{background:${CREAM2}!important}
${P} [data-pk-cat][data-pk-cat] .gtL-gamecard-logo>*{width:36px!important;height:36px!important;max-width:36px!important}
${P} [data-pk-cat][data-pk-cat] .gtL-gamecard-body{flex:1;min-width:0}
${P} [data-pk-cat][data-pk-cat] .gtL-gamecard-title{font-family:${FONT}!important;font-weight:400!important;font-size:16px!important;line-height:1.05!important;color:inherit!important;overflow-wrap:normal}
${P} [data-pk-cat][data-pk-cat] .gtL-gamecard-var,${P} [data-pk-cat][data-pk-cat] .gtL-gamecard-status{font-size:10px!important;color:inherit!important;opacity:.8;letter-spacing:.02em!important;margin-top:2px!important}
${P} [data-pk-cat][data-pk-cat] .gtL-gamecard-chev,${P} [data-pk-cat][data-pk-cat] .gtL-gamecard-spacer,${P} [data-pk-cat][data-pk-cat] .gtL-gamecard-mirror{display:none!important}
${P} [data-pk-cat][data-pk-cat] .gt-favstar{top:-4px!important;right:-4px!important;left:auto!important;bottom:auto!important;transform:none!important;width:36px!important;height:36px!important}
${P} [data-pk-cat][data-pk-cat] .gt-favstar svg{width:15px;height:15px}
/* Stern als kleiner Sticker auf der Kartenecke, damit er den Spielnamen nicht verdeckt (2026-11-18) */
${P} [data-pk-cat][data-pk-cat] .gt-favstar{top:-14px!important;right:-14px!important;width:40px!important;height:40px!important;isolation:isolate}
${P} [data-pk-cat][data-pk-cat] .gt-favstar::before{content:"";position:absolute;left:50%;top:50%;width:26px;height:26px;margin:-13px 0 0 -13px;border-radius:50%;background:${CREAM2};box-shadow:0 0 0 2px ${INK2},2px 2px 0 2px ${INK2};z-index:-1}
${P} [data-pk-cat][data-pk-cat] .gt-favstar svg{position:relative;width:14px;height:14px}
${P} [data-pk-cat][data-pk-cat] .gtL-gamecard-body{padding-right:4px}
${P} .gt-favstar::after{content:"";position:absolute;inset:-4px;border-radius:50%}
${P} [data-pk-cat][data-pk-cat] .gt-favstar[aria-pressed="true"] path{fill:${RED};stroke:${RED}}
${P} [data-pk-cat][data-pk-cat] .gt-favstar[aria-pressed="false"] path{stroke:#8A8178}
${P} .gtL-content [data-pk-cat][data-pk-cat] .gtL-cards{grid-template-columns:repeat(3,minmax(0,1fr))!important}
@media (max-width:360px){${P} [data-pk-cat][data-pk-cat] .gtL-gamecard-title{font-size:14px!important}${P} [data-pk-cat][data-pk-cat] .gtL-cards{gap:20px 16px!important}}
/* Weiches Einblenden der Titel (Magic UI «Blur Fade») */
${P} .gt-wm{animation:pk-in .55s cubic-bezier(.2,.8,.2,1) both}
@keyframes pk-in{from{opacity:0;transform:translateY(8px);filter:blur(5px)}to{opacity:1;transform:none;filter:none}}

/* ===== Titel aller Spiele wie Molotow (Ryū, 2026-11-15) ===== */
${P} .gt-wm.gt-wm.gt-wm,${P} .tt-word.tt-word.tt-word,${P} .yz-word.yz-word.yz-word,${P} .f7-word.f7-word.f7-word{font-family:${FONT}!important;font-weight:400!important;text-transform:uppercase!important;color:${INK2}!important;-webkit-text-fill-color:${INK2}!important;-webkit-text-stroke:.05em #141414!important;paint-order:stroke fill!important;text-shadow:.05em .065em 0 #141414!important;letter-spacing:0!important;white-space:nowrap!important;word-break:keep-all!important;hyphens:none!important;font-size:var(--pk-wmfs,clamp(30px,12vw,47px))!important;line-height:1.05!important;transform:none!important;padding:0 .06em!important}
${P} [data-pk-cat] .gtL-gamecard-status>span[aria-hidden]{background:${RED}!important}
${P} .gt-wm.gt-wm.gt-wm{display:block!important;width:100%!important;text-align:center!important;box-sizing:border-box}
${P} .gt-gamehead h1:not(.gt-wm){font-family:${FONT}!important;font-weight:400!important;text-transform:uppercase!important;color:${INK2}!important;-webkit-text-fill-color:${INK2}!important;-webkit-text-stroke:.05em #141414!important;paint-order:stroke fill!important;text-shadow:.05em .065em 0 #141414!important;letter-spacing:0!important;white-space:nowrap!important;word-break:keep-all!important;hyphens:none!important!important}
${P} :focus-visible{outline-color:#2D6BFF!important}
/* Zahl-Änderungen (+15 / −3) als Sticker: neutral creme, gut schwarz, schlecht rot */
${P} .gt-count::after{background:${CREAM2}!important;color:${INK2}!important;box-shadow:0 0 0 1.5px ${INK2},0 2px 0 ${INK2}!important;font-family:${FONT}!important;font-weight:400!important}
${P} .gt-count[data-gt-dt="g"]::after{background:${INK2}!important;color:${CREAM2}!important}
${P} .gt-count[data-gt-dt="b"]::after{background:${RED}!important;color:${CREAM2}!important}
/* Ryū: Seiten mit Körnung (pkPage().background ohne eigenes Blend) richtig einfärben */
${P} [style*="feTurbulence"]{background-blend-mode:multiply}
/* Statistik-Knopf Spielliste: Form F1 Gezackter Sticker (Ryū) */
${P} .gt-ryu-statsbtn{position:relative;display:block!important;box-sizing:border-box;width:auto!important;min-width:140px;height:44px!important;min-height:44px;margin:0 4px 0 0!important;padding:0 6px!important;border:0!important;background:none!important;border-radius:0!important;box-shadow:none!important;cursor:pointer;color:${INK2}!important;font-family:${FONT}!important;font-weight:400!important;font-size:15px!important;-webkit-tap-highlight-color:transparent;rotate:3deg;translate:0 4px;transition:transform .2s cubic-bezier(.34,1.56,.64,1)}
${P} .gt-ryu-statsbtn:active{transform:translateY(3px) scale(.98)}
${P} .gt-ryu-statsbtn:focus-visible{outline:3px solid ${INK2};outline-offset:4px;border-radius:12px}
${P} .gt-ryu-sb-bg{position:absolute;left:0;top:0;width:100%;height:100%;overflow:visible;pointer-events:none}
${P} .gt-ryu-sb-in{position:relative;display:flex;align-items:center;justify-content:center;gap:7px;height:100%;white-space:nowrap;padding:0 10px}
${P} .gt-ryu-statsbtn .gtL-statsbtn-txt{display:inline!important}
/* Spieltitel einheitlich im Molotow-Stil (Entscheid Yanis 15.11.): schwarz mit schwarzer Tiefe; überstimmt Spiel-Regeln */
${P} body h1.gt-wm.gt-wm.gt-wm.gt-wm.gt-wm.gt-wm,${P} body .f7-word.f7-word.f7-word.f7-word.f7-word.f7-word,${P} body .tt-word.tt-word.tt-word.tt-word.tt-word.tt-word,${P} body .yz-word.yz-word.yz-word.yz-word.yz-word.yz-word,${P} body .sk-word.sk-word.sk-word.sk-word.sk-word.sk-word,${P} body .gt-gamehead.gt-gamehead h1:not(.gt-wm):not(.gt-x1):not(.gt-x2){color:${INK2}!important;-webkit-text-fill-color:${INK2}!important;-webkit-text-stroke:0!important;paint-order:normal!important;text-shadow:0.075em 0.000em 0 ${CREAM2}, 0.069em 0.029em 0 ${CREAM2}, 0.053em 0.053em 0 ${CREAM2}, 0.029em 0.069em 0 ${CREAM2}, 0.000em 0.075em 0 ${CREAM2}, -0.029em 0.069em 0 ${CREAM2}, -0.053em 0.053em 0 ${CREAM2}, -0.069em 0.029em 0 ${CREAM2}, -0.075em 0.000em 0 ${CREAM2}, -0.069em -0.029em 0 ${CREAM2}, -0.053em -0.053em 0 ${CREAM2}, -0.029em -0.069em 0 ${CREAM2}, -0.000em -0.075em 0 ${CREAM2}, 0.029em -0.069em 0 ${CREAM2}, 0.053em -0.053em 0 ${CREAM2}, 0.069em -0.029em 0 ${CREAM2}!important;filter:drop-shadow(.06em .08em 0 #141414)!important;letter-spacing:.02em!important}
/* Sehr schmale Handys: Ryū-Logo etwas kleiner, damit das Zahnrad das «B» nicht überdeckt */
@media (max-width:350px){${P} .gtL-start .gt-hero-mark-pk{width:min(var(--hm-w,330px),calc(100vw - 92px))!important}}
/* Beschriftungen: immer schwarzes Etikett mit Creme-Schrift (überstimmt Spiel-Regeln, die sonst schwarz auf schwarz ergeben) */
${P} body .gt-su-label.gt-su-label.gt-su-label{background:${INK2}!important;color:${CREAM2}!important;-webkit-text-fill-color:${CREAM2}!important}
@media (prefers-reduced-motion: reduce){${P} .gt-su-btn::after,${P} .pk-shine::after,${P} .gt-wm{animation:none!important}}
/* Ryū-Kontrolle 17.11.: Spielmenü ohne Navy-Reste aus dem hellen Grundstil (offener Menüknopf, Ränder, Abdunklung) */
${P} .gt-hmt-light{--hm-ink:#1A1716;--hm-on-bg:#1A1716;--hm-on-ink:#F3EAD3;--hm-ring:rgba(26,23,22,.3);--hm-line:rgba(26,23,22,.14);--hm-muted:#4A3F3A;--hm-hover:rgba(26,23,22,.06);--hm-dim:rgba(26,23,22,.34)}
/* Ryū-Kontrast Entwurf A (Wahl Yanis 17.11.): kleine rote Schrift auf Creme etwas dunkler */
${P} .gt-hm-row.is-danger,${P} .gt-hm-row.is-danger .gt-hm-txt{color:#B3221D!important}
${P} .jdp-lab.cur .cn,${P} span:has(> .yz-noch),${P} .yz-noch + span,${P} .yz-noch,${P} .yz-lab.is-acc,${P} .yz-auto.is-acc .gt-count,${P} .yz-auto .gt-count{color:#B3221D!important}
`;

export { PLAKAT_CSS };
