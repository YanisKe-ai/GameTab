# GameTab: Projektwissen für Claude Code

GameTab ist eine Punkte- und Partyspiel-PWA (Hobby/Produkt von Yanis, Basel, Sozialpädagoge, Schweizer Deutsch).
Live: https://yaniske-ai.github.io/GameTab/ (Repo-Name auf GitHub prüfen: `GameTab` oder `spieleblock`).

## Arbeitsregeln (immer einhalten)
- Sprache: Deutsch, Schweizer Schreibweise (ss statt ß), kurz und klar, KEINE Gedankenstriche (Em-Dashes).
- Yanis tippt nicht gern. Jeder Schritt für ihn: genau erklären, Terminal-Befehle als EIN kopierbarer Block.
- Pushen ohne Nachfrage erlaubt (seit 24.10.2026), sobald Tests grün sind. Ein Push pro Etappe (Credits sparen).
- Nach Änderungen: `npm run build && npm run lint && python3 tools/check.py`. Vor Release: `GAMETAB_HTML=docs/index.html <venv-python> tests/regression.py` (muss grün sein). Release: `python3 tools/release.py "Text"`, dann docs/ mitcommitten und pushen.
- Wurzel-`index.html` ist ALT und wird nicht mehr gepflegt. Nie grosse Dateiteile ausgeben (translations.js, Inhaltslisten sind gross), gezielt grep/Slices.
- Grosse Edits per Python-Skript mit `assert text.count(alt) == 1`, kleine mit dem Edit-Tool.
- Dark und Light dürfen nie regressieren. Jede Design-Änderung in allen 4 Themes prüfen.

## Architektur
- Quelle: `web/src/**` (ES-Module, JSX in `.js`-Dateien, klassische Runtime, jede JSX-Datei braucht `React` im Scope). Vite 8 baut `docs/index.html` als EINE Datei (vite-plugin-singlefile), Pages liefert `/docs` aus. Config `web/vite.config.mjs` (Plugin `gt-jsx-in-js`, Precache-Liste für sw.js). Statische Dateien (sw.js, version.json, fonts/, icons/, img/, Rechtstexte) liegen in der Wurzel und werden per `web/scripts/copy-public.mjs` kopiert.
- Emoji-Filter: `web/src/prelude.js` patcht `React.createElement`, darum klassische JSX-Runtime nie auf automatic umstellen.
- Tailwind v4 nur für Magic UI: ohne Preflight, Klassen IMMER mit Präfix `tw:` (`web/src/tw.css`). Magic UI in `web/src/components/magicui/` (TSX, Import `@/components/magicui/...`), Animation über `motion`, Reduced Motion beachten.
- Bilder: per `import url from "./img/x.png"` (wird inline, sicher für Canvas-Export) oder als public-Datei mit relativem Pfad.
- Logiktests lesen den Code über `tests/lib/source.js` (`GAMETAB_SRC=web`) per Marker: Marker nicht verändern. `tools/split.mjs` ist veraltet.
- `sw.js`: Network-first Service Worker, CACHE_NAME zählt release.py hoch, PRECACHE_EXTRA erzeugt der Build.
- `datenschutz.html`, `impressum.html`: Platzhalter noch NICHT ausgefüllt (gelb markiert).
- Persistenz: localStorage, Key `spieleblock-app-state-v1`. Notausgang `?reset=1` leert den Speicher. `loadAppState` ist abgesichert, der catch setzt `setLoaded(true)`, sonst hängt die App auf "Lädt ...".
- 6 Sprachpakete (DE, EN, ...). Neue Texte immer in allen Paketen ergänzen.

## Themes
- Themes: `dark`, `light`, `vitrum` (Glas), `noir`. Pro Spiel `xxxTokens(theme)` und `xxxPageShellStyle(theme)`. Unbekannte Themes fallen auf dark.
- GOLDREGEL Vitrum: `tk.bg` / `pageBg` ist im Vitrum-Modus bereits ein KOMPLETTER Mehrschicht-Verlauf. Nie in `radial-gradient(...)` verschachteln (ergibt ungültiges CSS und weisse Seite). Richtig:
  `background: theme==="vitrum" ? tk.bg : \`radial-gradient(ellipse at 50% -10%, ${tk.bg2} 0%, ${tk.bg} 65%)\``
  Minigolf: `repeating-linear-gradient(stripes), ${mg.bg}` im Vitrum-Zweig. `tools/check.py` warnt vor dieser Falle.
- Vitrum-CSS in GLOBAL_STYLES: `.gtL-glass-soft` (kleine, oft wiederholte Elemente), `.gtL-glass` (mittel, Kacheln), `.gtL-glass-strong`. Technik: backdrop-filter blur/saturate, Highlight per radial-gradient (`background-image !important`), inset box-shadows (blau links, bernstein rechts) als Chromatic-Aberration-Imitat, `::after` Glanzstreifen bei `:active`. `border-image` ignoriert border-radius (vermeiden). `overflow:hidden` schneidet das eigene `::after` ab.
- Startseite: die zwei grossen Kategorie-Kacheln nutzen `gtL-glass` (nicht strong), bewusst zurückgenommen.
- AppLogo hat eine eigene Vitrum-Darstellung (zwei maskierte Layer mit `APP_LOGO_URI_GOLD`).

## Akzentfarben der Spiele
Skyjo #2FD9A8, Flip7 #FF7A3D, Jass #D52B1E, Yatzy #5B7A9D, Tutto #C1798F, Darts #C8102E, Wizard #E0BA72, Minigolf #3F8F42, Freeplay #9A7BA8, Impostor #C042E0, Werwolf #D9384A, Mafia #C9A15C, AmEhesten #2DD4BF, Tabu #FFC93C, HeadsUp #6C7FE8, 5Sek #FF9640.

## Laptop-Modus
- `viewMode==="laptop"` / `isLaptop`. Rahmen `.spieleblock-laptop-frame`, Seitenleiste `.gtL-sidebar`, Inhalt `.gtL-content`. Klassen: `gtL-tiles`, `gtL-cards`, `gtL-showcase`, `gtL-tipcard`, `gtL-headwrap`, `gtL-startcol`, `gtL-start`.
- Mobile-Hero nutzt `translateY(10px) scale(1.85)`, das im Laptop-Container abgeschnitten wurde. Deshalb gibt es im Laptop-Modus einen kompakten Kopf (Logo 56px, "GameTab", "ALL-IN-ONE").
- Kein Gerät-Rahmen mehr: App füllt das Fenster. Seitenleiste `<nav class="gtL-sidebar">`, einklappbar (`is-collapsed`, localStorage `gametab-sidebar-collapsed`), zeigt laufende Spiele (aus `buildQuickResume` plus Flip 7).
- Zweispaltig: `gtL-split` mit `gtL-col-main` (links) und `gtL-col-side` (rechts, sticky). Im Handy-Modus sind diese Wrapper `display: contents` (in GLOBAL_STYLES), dadurch bleibt das Handy-Layout pixelgleich. `gtL-game` am 380px-Container, `gtL-narrow` für schmale Setup-Seiten, `gtL-yatzy-sheets` legt die zwei Yatzy-Tabellen nebeneinander. Unter 1100 px wieder einspaltig.
- Hooks im App-Body nur VOR `if(viewMode!=="laptop")return appContent;` und vor allen anderen frühen returns (sonst React-Fehler 310, weisse Seite).

## Querformat (Handy quer, Fundament)
- Root-Attribut `data-phone-landscape` auf `<html>`. Aktiv nur bei: viewMode Handy (nie Laptop), Touch-Geraet, kurze Bildschirmseite <= 500 CSS px, echte Drehung (screen.orientation, sonst window.orientation, sonst screen-Masse, sonst matchMedia) UND Fenster breiter als hoch. Tastatur im Hochformat loest nicht aus, Drehen mit offenem Feld schon. Regel, Grenzen: `web/src/shared/phone-landscape.js`; Spiegel fuer den ersten Paint im Inline-Script von `web/index.html` (Marker `pl-decide-begin/-end`). Beide prueft `node tests/logic/test_phone_landscape.js`.
- JS: `usePhoneLandscape()` (true/false, rendert bei Drehung neu, kein Remount). App ruft `usePhoneLandscapeRoot(viewMode, loaded)`. Nie als React-`key` verwenden, keine zweite parallel gemountete Ansicht.
- Test-Uebersteuerung (nur Tests): `?pl=1` / `?pl=0` oder localStorage `gametab-pl-force` = "1"/"0". Laptop-Modus bleibt immer aus.
- CSS NUR unter `[data-phone-landscape]`. Variablen: `--pl-head` (48px), `--pl-gap` (12px), `--pl-gutter-l/-r` (14px + Safe Area links/rechts), `--pl-gutter`, `--pl-sat/-sab/-sal/-sar` (Safe Areas), `--pl-vh` (100dvh, Fallback 100vh, Standalone 100vh), `--pl-vvh` (visualViewport-Hoehe in px, per JS), `--pl-avail` (vvh sonst vh), `--pl-body` (avail minus Kopf und unten).
- Klassen (opt-in, ausserhalb Querformat neutral): `pl-page` (volle Breite + Seitenabstaende), `pl-wide` (hebt die 380-px-Saeule fuer dieses Element auf), `pl-split` + `pl-main` / `pl-side` (Zweispalter; im Hochformat `display: contents`, also pixelgleich; Quote per `--pl-main-fr`/`--pl-side-fr`, Varianten `pl-split-even`, `pl-split-wide`), `pl-side.pl-sticky`, `pl-scroll` (eigener senkrechter Scrollbereich bis `--pl-body`), `pl-scroll-x` (Tabellen), `pl-fill`, `pl-only` / `pl-hide`, `pl-head-compact` (an GameHeader oder Vorfahre: Kopf 48 px einzeilig, Zurueck, Titel, Knoepfe).
- Startseite: Scrollsperre (body fixed, Scroll-Reset, Touch-Sperre) ist im Querformat aufgehoben (CSS plus Guard in start.js), Seite scrollt normal. Neugestaltung macht ein eigener Helfer.
- Regeln fuer Helfer: eigenes Querformat-CSS im Spielmodul, nicht in global.js. Keine pauschalen Overrides aller maxWidth/Buttons. Kein overflow:hidden, das Inhalte unerreichbar macht. Touchziele >= 44 px.
- Testwerkzeug: `$VENV tests/landscape.py [--vp 844x390|all] [--theme Nocturne|all] [--only start,rotate,neg] [--strict-touch]`, Screenshots `tests/out/landscape/`. Importierbar: `new_phone, start, goto_game, rotate, keyboard_portrait, check_page, small_targets, overflow_x, shot`.

## Test-Matrix (Playwright, Python)
- Viewports: 393x852 (Handy), 1512x982 und 1280x800 (Laptop). Themes: Nocturne (intern dark), Hell, Vitrum, Noir. Python mit Playwright: siehe dev-notes/HELFER_BRIEF.md (venv).
- Onboarding überspringen mit Text "Überspringen". Einstellungen: `button[aria-label="Einstellungen"]`. Theme-Buttons "Nocturne"/"Hell"/"Vitrum"/"Noir", Modus-Buttons "Handy"/"Laptop". Kategorien "Schreibunterlagen"/"Partyspiele".
- Nach Klicks mindestens 500 ms warten (sonst Fehlalarme).
- `tests/smoke.py` macht das automatisch, Screenshots in `tests/out/` ansehen (Read-Tool kann Bilder anzeigen).

## Bekannte offene Bugs
Siehe NEXT_STEPS.md Schritt 2. Referenz-Screenshots in `reference/screenshots/`.

## iPhone Home-Bildschirm-App (gelernt am 21.10.2026, hart erkämpft)
- Yanis nutzt GameTab als Home-Bildschirm-App. `apple-mobile-web-app-status-bar-style` wird beim Hinzufügen übernommen: Änderungen daran wirken erst nach Neu-Anlegen des Symbols. Neu-Anlegen löscht den Speicher, vorher «Als Datei exportieren» (Sicherung v2 enthält alles inkl. laufender Partien).
- Mit black-translucent + viewport-fit=cover meldet iOS innerHeight/100dvh = 873 statt 932 (fehlen 59 = Statusleiste), CSS-100vh ist aber 932. Darum im Block `@media (display-mode: standalone)` nur `100vh` verwenden, nie `100vh + safe-area-inset-top`.
- Fixierte Elemente (position:fixed, auch body) werden dort bei 873 abgeschnitten. Die Startseite wird in der App darum NICHT fixiert, Wackeln verhindert eine Touch-Sperre für senkrechtes Wischen.
- Der Inhaltsbereich der Startseite darf nicht `overflow:hidden` sein, sonst wird der nach oben skalierte Drachenkopf (scale 1.85) abgeschnitten.
- Messen statt raten: eine temporäre Messanzeige (innerHeight, screen.height, safe-area) hat das Problem in einem Durchgang gelöst.
- Releases: `python3 tools/release.py "Text"` erhöht APP_BUILD, version.json, sw.js-Cache und CHANGELOG.md. Die App zeigt dann den goldenen Hinweis «Neue Version ist da».
