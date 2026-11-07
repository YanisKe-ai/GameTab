# GameTab · Überarbeitung Spiel für Spiel

Dieses Dokument ist der Masterplan. Pro Sitzung wird genau EIN Spiel überarbeitet.
Claude Code liest zuerst `CLAUDE.md` (Projektwissen) und dann dieses Dokument.

**Reihenfolge:** zuerst Tutto, dann Yatzy, dann Schieber, dann Differenzler. Danach frei (siehe Abschnitt 7).
**Welches Spiel jetzt dran ist:** das oberste mit Status "offen" in Abschnitt 7.

---

## 1. Ziel

Jedes Spiel soll sich anfühlen wie ein eigenes, liebevoll gemachtes Objekt und dabei einwandfrei funktionieren.
Ein Spiel gilt erst als fertig, wenn Regeln, Ablauf, Layout, Design, Motion, Ende und Bildexport zusammenpassen.

**Leitidee (wichtigster Befund aus dem Test vom 06.11.2026):**
Die Bildexporte haben pro Spiel schon eine starke, eigene Identität (Darts: Automat mit Board, Mafia: Polaroids an der Pinnwand, Schieber: Zeitungsblatt, Tutto: gelbe Würfelkarte, Wizard: Zauberkarte usw.).
Die Spielbildschirme selbst sehen dagegen fast alle gleich aus: dunkle Karten, Akzentfarbe, gleiche Liste.
Der Bildexport ist darum die **Stil-Vorlage** für das jeweilige Spiel: Farben, Schriften, Materialien und Motive aus dem Export sollen dezent ins Spiel wandern, damit Spiel und Endbild wie aus einem Guss wirken.
Wichtig: dezent. Das gemeinsame Gerüst (GameHeader, Knopf unten, TopBar) bleibt, die App soll nicht in 19 Einzel-Apps zerfallen.

---

## 2. Ablauf pro Spiel (immer gleich, in dieser Reihenfolge)

### Phase 0 · Ist-Stand erfassen (ohne Änderungen)
1. Modul lesen: `web/src/games/<spiel>/`, Export-Vorlage `web/src/export/templates/<spiel>.js`, Testfälle `tests/ergebnisbild/<gameId>.json`.
2. Spiel im Browser komplett durchspielen (Playwright, 393x852): Einrichtung, mindestens 2 Runden, Rückgängig, Abbrechen, Fortsetzen nach Neuladen, Ende mit Podium, "Als Bild teilen".
3. Screenshots aller Bildschirme in allen 4 Themes (Nocturne, Hell, Vitrum, Noir) nach `tests/out/review/<spiel>/vorher/`.
4. Bildexport rendern: `$VENV tests/ergebnisbild.py --game <gameId> --sheet` und den Kontaktbogen ansehen.
5. Kurzer Befundbericht an Yanis (max. 15 Punkte): was funktioniert nicht, was ist eng/abgeschnitten, was passt nicht zum Export.

### Phase 1 · Recherche
1. **Regeln:** offizielle Anleitung des Herstellers oder anerkannte Quelle suchen und mit der Logik im Code abgleichen (Punkte, Sonderfälle, Spielende, Gleichstand). Nichts erfinden. Bei Unklarheit Yanis fragen.
2. **Vorbilder:** 3 bis 5 gute Apps oder Websites zum selben Spiel bzw. Spielprinzip anschauen (App Store / Play Store Screenshots, Dribbble, Mobbin). Notieren, was dort besser gelöst ist (Eingabe, Übersicht, Ablauf, Feedback).
3. **Skills:** prüfen, welche Skills zur Aufgabe passen (siehe Abschnitt 5). Fehlt etwas Wichtiges, gezielt suchen und Yanis vor dem Installieren kurz fragen.

### Phase 2 · Vorschlag (STOPP, auf OK von Yanis warten)
Kompakter Vorschlag mit:
- Must-fix (Fehler, Regelabweichungen, abgeschnittene Inhalte)
- Design-Richtung in 3 bis 5 Sätzen, abgeleitet aus dem Bildexport
- Neue oder geänderte Funktionen (nur mit klarem Nutzen)
- Motion-Ideen (welcher Moment, welche Animation)
- Was bewusst NICHT gemacht wird
Wenn möglich mit 1 bis 2 Mockup-Screenshots (schnell im Code skizziert) zur Entscheidung.

### Phase 3 · Umsetzung
- In kleinen Schritten, nach jedem Schritt `npm run build && npm run lint && python3 tools/check.py`.
- Grosse Edits per Python-Skript mit `assert text.count(alt) == 1`.
- Neue Texte sofort in allen 6 Sprachen (DE, EN, FR, IT, ES, PT).

### Phase 4 · Prüfen
- Checkliste aus Abschnitt 3 Punkt für Punkt abhaken.
- Für eine unabhängige Prüfung EINEN Subagenten starten, der den Umbau nicht kennt und nur testet (spart Kontingent: nur einer, nicht mehrere).
- Vorher/Nachher-Screenshots nach `tests/out/review/<spiel>/nachher/`, Yanis die wichtigsten zeigen. Ehrlich sagen, dass nur im Browser getestet wurde.

### Phase 5 · Abschluss
1. `GAMETAB_HTML=docs/index.html $VENV tests/regression.py` muss grün sein.
2. `python3 tools/release.py "<Spiel>: kurze Beschreibung"`, docs/ mitcommitten.
3. EIN Push pro Spiel (Credits sparen).
4. Im Abschnitt 7 dieses Dokuments den Status des Spiels aktualisieren und offene Punkte notieren.

---

## 3. Checkliste pro Spiel

### Regeln und Logik
- [ ] Regeln stimmen mit offizieller Quelle überein (Quelle im Code-Kommentar oder in den Regeln verlinkt)
- [ ] Punkteberechnung, Sonderfälle, Spielende und Gleichstand korrekt
- [ ] Eingabe verhindert unmögliche Werte (oder warnt klar)
- [ ] Negative Zahlen möglich wo nötig, mit ±-Knopf (inputMode numeric zeigt kein Minus)
- [ ] Rückgängig funktioniert für jede Aktion
- [ ] Laufende Partie überlebt Neuladen und App-Wechsel (localStorage)
- [ ] Regeln-Sheet (?) ist vollständig, kurz und verständlich

### Ablauf und Funktionen
- [ ] Weg von Einrichtung bis Sieg mit möglichst wenig Tipps
- [ ] Immer klar: wer ist am Zug, welche Runde, wie weit bis zum Ziel
- [ ] Primärer Knopf immer unten erreichbar (Daumenzone), deaktiviert mit klarem Grund
- [ ] Sinnvolle Komfortfunktionen geprüft (z.B. Schnelleingabe, Zwischenstand, Bestwerte, Rundenhistorie)
- [ ] Partie vorzeitig beenden mit Wertung möglich, wo es Sinn macht

### Platzverteilung und Layout
- [ ] Nichts abgeschnitten oder verdeckt bei 2, 4, 6 und Maximalzahl Spieler
- [ ] Lange Namen (Ellipse), CJK-Namen, 4-stellige Zahlen
- [ ] Immer auf alle drei Geräteklassen abgestimmt, nicht nur geprüft: Handy, iPad, Laptop
- [ ] Bildschirmgrössen 320x568, 375x667, 390x844, 430x932, iPad 768x1024, 834x1194, 1024x768 und Laptop 1280x800 / 1512x982
- [ ] Handy quer (`tests/landscape.py`), Touchziele mindestens 44 px
- [ ] Tastatur auf: nichts verschiebt sich oder verdeckt das aktive Feld
- [ ] Wichtiges gross, Nebensächliches klein: klare Hierarchie, kein Leerraum ohne Zweck

### Design und Stil
- [ ] Stil aus dem Bildexport abgeleitet (Farben, Schrift, Material, Motiv)
- [ ] Alle 4 Themes geprüft per echtem Klick in den Einstellungen; Vitrum-GOLDREGEL beachtet
- [ ] Noir: Spiel grau, Farbe nur im Siegmoment (Muster Minigolf, `noirAccent(gameId)`)
- [ ] Kontrast mindestens 4.5:1 für Text
- [ ] Akzentfarbe aus CLAUDE.md, keine neuen Hex-Werte ohne Grund

### Motion und Magic UI
- [ ] Bewegung nur mit Zweck: Feedback, Orientierung, Belohnung
- [ ] Zahlen zählen hoch (NumberTicker), Zugwechsel sichtbar, Runde speichern bestätigt
- [ ] Siegmoment dramatischer als der Alltag (Peak-End), keine Casino-Tricks
- [ ] Dauer 150 bis 400 ms, einheitliche Kurven, `prefers-reduced-motion` respektiert
- [ ] Keine Animation blockiert die Eingabe
- [ ] Sound und Haptik passend (playTapSound, hapticWin usw.)

### Ende, Podium und Bildexport
- [ ] Podium zeigt richtige Reihenfolge, Gleichstand korrekt
- [ ] Bildexport passt optisch zum überarbeiteten Spiel und zeigt die richtigen Daten
- [ ] Export geprüft mit allen Testfällen (`tests/ergebnisbild.py --game <id>`, Chromium und WebKit)
- [ ] Neue Spiel-Daten im Export ergänzt, falls sinnvoll (Testfälle in JSON nachführen)
- [ ] Teilen auf iOS: Web Share zuerst, sichtbare Vorschau als Rückfall
- [ ] Statistik und Erfolge zählen die Partie richtig
- [ ] Kleines Spiel-Icon (Startseite «Alle Spiele», Listen, Seitenleiste) passt zum neuen Design (Wunsch Yanis 07.11.2026)

### Texte und Zugänglichkeit
- [ ] Texte kurz, natürlich, Schweizer Schreibweise, keine Gedankenstriche, neutral gegendert
- [ ] Alle 6 Sprachen vollständig
- [ ] Knöpfe mit aria-label, Dialoge per Tastatur bedienbar (Laptop)

---

## 4. Standing-Regeln (gelten immer)

- Handy-Ansicht nie ungewollt verändern: Vorher/Nachher-Screenshots bei jedem grösseren Umbau.
- Dark und Light dürfen nie regressieren. Die kühle Navy-Palette im Dunkelmodus bleibt (nicht auf warme Töne umstellen).
- Schieber-Kreidetafel bleibt bei app-weiten Design-Updates unangetastet.
- "Freies Spiel" bleibt immer letzter Eintrag in "Schreibunterlagen".
- Tabu-Karten haben genau 2 Tabu-Wörter.
- Spielregeln nur aus echten Quellen, nichts erfinden.
- Schriften lokal, keine CDNs. Alles kostenlos, sonst so günstig wie möglich.
- Noir-Modus: Batman-Bezüge (Fledermaus-Icon, Scheinwerfer) müssen vor einer Veröffentlichung ersetzt werden. Daran erinnern, sobald es Richtung Store geht.
- Scheitert ein Zwischenschritt (z.B. Test-Timeout): trotzdem abschliessen oder klar sagen, was NICHT ausgeliefert wurde.
- Wenn Yanis selbst etwas tun muss: genau sagen was, Terminal-Befehle als EIN kopierbarer Block.
- Kontingent sparen: pro Spiel eine Sitzung, nur gezielt lesen (grep, Ausschnitte), höchstens ein Prüf-Subagent.

---

## 5. Skills und Werkzeuge

**Selbst laden, ohne zu fragen (je nach Phase):**
- Design: `impeccable`, `design-taste-frontend`, `frontend-design`
- Motion: `emil-design-eng`
- Testen: `webapp-testing`
- Texte: `unslop`, `ux-copy`
- Prüfung: `accessibility-review`, `design-critique`

**Magic UI** (bereits eingerichtet: `web/src/components/magicui/`, Tailwind nur mit Präfix `tw:`):
Vorhanden: number-ticker, animated-list, border-beam, shine-border, blur-fade.
Bei Bedarf prüfen und über die shadcn-Registry (components.json) ergänzen: Confetti, Animated Circular Progress Bar, Sparkles Text, Text Animate, Shimmer Button, Ripple.
Pro Spiel höchstens 1 bis 2 neue Komponenten und nur, wenn sie einen konkreten Moment besser machen.

**Neue Skills suchen:**
Nur aus vertrauenswürdigen Quellen (Anthropic, bekannte Repos). Vor dem Installieren Yanis kurz fragen, wenn der Skill Code ausführt. Gefundene gute Skills hier in Abschnitt 5 nachtragen.

**Testwerkzeuge im Repo:**
`tests/smoke.py`, `tests/regression.py`, `tests/ergebnisbild.py`, `tests/ergebnisbild_app.py`, `tests/ergebnisbild_ui.py`, `tests/landscape.py`, `tests/motion.py`, `tests/a11y_dialog.py`, `tools/check.py`, `tools/pixcmp.py` (Pixelvergleich vorher/nachher).

---

## 6. Befunde aus dem ersten Test (06.11.2026)

Getestet live auf https://yaniske-ai.github.io/GameTab/ in Chromium bei 393x852, Theme Nocturne, mit Standardnamen. Alle 20 Exportvorlagen rendern fehlerfrei (292 Testfälle OK), keine Konsolenfehler.
Das sind erste Beobachtungen, in Phase 0 jeweils genau nachprüfen.

| Spiel | Beobachtung |
|---|---|
| Yatzy | Bei 4 Spielenden sehr enge Spaltenköpfe ("Spieler 1 / AM ZUG" bricht um), Tabelle wirkt gedrängt |
| Wizard | 4. Spalte rechts abgeschnitten ("Spi"), horizontales Scrollen nicht erkennbar |
| Tutto | Eingabe-Panel (gelb) verdeckt die unteren Spielenden, Spielstand während Eingabe nicht ganz sichtbar |
| Minigolf | Untere Leiste "Schläge für alle eintragen" liegt über der Karte von Spieler 4 |
| Rommé | Beschreibung bei "Hand-Rommé" abgeschnitten |
| Phase 10 | Strafpunkte-Hinweis sehr klein, viel Text pro Karte |
| Skyjo, Flip 7, Phase 10 | Spielbildschirm sehr ähnlich (Liste + grauer Knopf), wenig vom Export-Charakter |
| Tabu, HeadsUp | Zwischenbildschirm mit viel leerem Raum, wenig Spannung vor dem Start |
| Impostor, Werwolf | "Gedrückt halten" Karte gut, aber identisch aussehend, Export-Stil (Dossier, Mond) fehlt |
| Startseite | Reihe "Alle Spiele" zeigt nur 5 Spiele, Pfeil rechts leicht übersehbar |

Stärken, die bleiben sollen: einheitlicher Kopf mit Zurück/Flagge/Home/Hilfe, Knopf immer unten, klare Akzentfarben, Bildexporte.

---

## 7. Reihenfolge und Status

**Feste Reihenfolge für die ersten vier (nicht abweichen):**
1. Tutto
2. Yatzy
3. Schieber (inkl. Schieber-Turnier)
4. Differenzler

Ab Nr. 5 ist die Reihenfolge frei. Ohne andere Anweisung von Yanis einfach der Tabelle nach.

**So wird das nächste Spiel bestimmt:** das oberste Spiel mit Status "offen". Beim Start Status auf "in Arbeit" setzen, nach dem Push auf "fertig" (mit Datum). So ist jederzeit klar, wo wir stehen, auch nach `/clear` oder einer Pause.

| # | Spiel | gameId | Modul | Status | Offen |
|---|---|---|---|---|---|
| 1 | Tutto | tutto | games/tutto | fertig 06.11.2026 | Kartenrechner auf Wunsch entfernt. Nur Chromium geprüft: Safari und echte Geräte offen |
| 2 | Yatzy | yatzy | games/yatzy | fertig 07.11.2026 | Bonus 25. Nur Chromium geprüft: Safari, iPhone, iPad offen. Ab 7 Spielern scrollt das Blatt seitlich |
| 3 | Schieber + Turnier | schieber | games/schieber | fertig 07.11.2026 | Nocturne Nachtblau, Tafel unverändert, Ergebnisbild bleibt (Logo oben, Ausnahme). Nur Chromium geprüft. Offen: Hausregel 6- bis 9-Blatt, Farbwerte Herz/Ecke ×1 bestätigen, Icon neu |
| 4 | Jass Differenzler | jass-differenzler | games/jass | offen | |
| 5 | Wizard | wizard | games/wizard | offen | |
| 6 | Minigolf | minigolf | games/minigolf | offen | |
| 7 | Skyjo | skyjo | games/skyjo | offen | |
| 8 | Flip 7 | flip7 | games/flip7 | offen | |
| 9 | Phase 10 | phase10 | games/phase10 | offen | |
| 10 | Rommé | romme | games/romme | offen | |
| 11 | Darts (alle 7 Modi) | darts | games/darts | offen | Rapid Fire noch nicht gebaut |
| 12 | Freies Spiel | freeplay | games/freeplay | offen | |
| 13 | Impostor | impostor | games/impostor | offen | |
| 14 | Werwolf | werwolf | games/werwolf | offen | |
| 15 | Mafia | mafia | games/mafia | offen | |
| 16 | Verräter | traitor | games/traitor | offen | |
| 17 | Am ehesten | mostlikely | games/mostlikely | offen | |
| 18 | Tabu | tabu | games/tabu | offen | 2 Tabu-Wörter |
| 19 | HeadsUp | headsup | games/headsup | offen | |
| 20 | 5 Sekunden | fivesec | games/fivesec | offen | |

Am Schluss eine eigene Sitzung "Gesamtdurchgang": Startseite, Kategorien, Konsistenz zwischen allen Spielen.
