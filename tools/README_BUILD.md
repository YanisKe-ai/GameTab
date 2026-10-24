# Bauen und Veröffentlichen

Quelle liegt in `web/src/`, gebaut wird eine einzige Datei `docs/index.html` (Vite, kein Minify).

## Release (ein Befehl)
    python3 tools/release.py "Kurze Beschreibung"

Das Skript erhöht APP_BUILD (`web/src/app/build.js`), `version.json`, den Cache-Namen in `sw.js`, schreibt CHANGELOG.md, führt `npm ci` (nur wenn `node_modules` fehlt) und `npm run build` aus und prüft danach `docs/index.html` mit `tools/check.py`. Bei einem Fehler bricht es mit Meldung ab. Mit `--dry-run` wird nur angezeigt, was passieren würde.

Danach: `docs/` mitcommitten, dann pushen (erst nach OK von Yanis).

## Nur prüfen
    python3 tools/check.py            # nimmt docs/index.html, sonst index.html
    python3 tools/check.py pfad.html  # andere Datei

check.py prüft auch die Vitrum-Goldregel in `web/src/**/*.js` und dass Quelle, docs/index.html, version.json und sw.js dieselbe Version haben.

## GitHub Pages auf /docs umstellen (macht der Koordinator)
GitHub, Repo, Settings, Pages: Source "Deploy from a branch", Branch `main`, Ordner `/docs`, speichern. Adresse und Pfad bleiben gleich, der localStorage bleibt erhalten. Vorher iPhone-Backup (Als Datei exportieren). Rückfall: Ordner wieder auf `/ (root)` stellen.
