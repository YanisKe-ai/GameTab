#!/usr/bin/env python3
"""GameTab Release vorbereiten. Vor jedem Push ausführen:

    python3 tools/release.py "Kurze Beschreibung der Änderung"

Erhöht gemeinsam:
  1. APP_BUILD in index.html (steuert den Hinweis "Neue Version ist da")
  2. version.json (die App vergleicht ihren APP_BUILD damit)
  3. CACHE_NAME in sw.js
  4. Eintrag oben in CHANGELOG.md
Build-Format: JJJJ.MM.TT-N (N zählt pro Tag hoch).

Neuer Ablauf (wenn web/ existiert): APP_BUILD steht in web/src/app/build.js
(oder Pfad aus Umgebungsvariable GAMETAB_BUILD_FILE). Danach laufen
npm ci (nur falls node_modules fehlt), npm run build und
tools/check.py gegen docs/index.html. Ohne web/ gilt das alte Verhalten.
Option --dry-run: nichts schreiben, nichts bauen, nur anzeigen.
"""
import os
import subprocess
import datetime
import json
import re
import sys
from pathlib import Path
from zoneinfo import ZoneInfo

ROOT = Path(__file__).resolve().parent.parent
BUILD_RE = r'APP_BUILD\s*=\s*"([^"]*)"\s*;?'


def first_existing(name: str) -> Path:
    for d in (ROOT, ROOT / "public", ROOT / "web" / "public"):
        if (d / name).exists():
            return d / name
    return ROOT / name


def run(cmd: list, what: str) -> bool:
    print(f"... {what}: {' '.join(cmd)}")
    try:
        r = subprocess.run(cmd, cwd=ROOT)
    except FileNotFoundError:
        print(f"FEHLER: Programm '{cmd[0]}' nicht gefunden (Node.js installiert?)")
        return False
    if r.returncode != 0:
        print(f"FEHLER: {what} fehlgeschlagen (Exit {r.returncode}). Release abgebrochen, bitte Meldung oben lesen.")
        return False
    return True


def main() -> int:
    args = [a for a in sys.argv[1:] if a != "--dry-run"]
    dry = "--dry-run" in sys.argv[1:]
    if not args or not args[0].strip():
        print('Aufruf: python3 tools/release.py "Beschreibung" [--dry-run]')
        return 1
    note = args[0].strip()
    ver_p, sw_p, log_p = first_existing("version.json"), first_existing("sw.js"), ROOT / "CHANGELOG.md"
    modern = (ROOT / "web").is_dir()
    if modern:
        html_p = ROOT / os.environ.get("GAMETAB_BUILD_FILE", "web/src/app/build.js")
        where = str(html_p.relative_to(ROOT))
    else:
        html_p, where = ROOT / "index.html", "index.html"
    if not html_p.exists():
        print(f"FEHLER: {where} nicht gefunden")
        return 1

    html = html_p.read_text(encoding="utf-8")
    m = re.findall(BUILD_RE, html)
    if len(m) != 1:
        print(f"FEHLER: APP_BUILD {len(m)}x in {where} gefunden, erwartet 1x")
        return 1
    old = m[0]
    # Nie hinter eine schon veröffentlichte Nummer zurückfallen (z. B. nach Wiederherstellen einer alten index.html)
    if ver_p.exists():
        vj = json.loads(ver_p.read_text(encoding="utf-8")).get("build", "")
        key = lambda b: (b.split("-")[0], int(b.split("-")[1])) if "-" in b else (b, 0)
        if vj and key(vj) > key(old):
            old_html, old = old, vj
            html = html.replace(f'"{old_html}"', f'"{old}"', 1)

    now = datetime.datetime.now(ZoneInfo("Europe/Zurich"))
    day = now.strftime("%Y.%m.%d")
    n = int(old.split("-")[1]) + 1 if old.startswith(day + "-") else 1
    build = f"{day}-{n}"

    sw = sw_p.read_text(encoding="utf-8")
    sw, k = re.subn(r'const CACHE_NAME = "[^"]*";', f'const CACHE_NAME = "gametab-cache-{build}";', sw)
    if k != 1:
        print("FEHLER: CACHE_NAME in sw.js nicht gefunden")
        return 1
    if dry:
        print(f"[dry-run] Version {old} -> {build} (Quelle: {where}, {ver_p.name}, {sw_p.name}, CHANGELOG)")
        if modern:
            print("[dry-run] danach: npm ci (falls node_modules fehlt), npm run build, tools/check.py docs/index.html")
        return 0

    html_p.write_text(html.replace(f'"{old}"', f'"{build}"', 1), encoding="utf-8")
    ver_p.write_text(json.dumps({"build": build}) + "\n", encoding="utf-8")
    sw_p.write_text(sw, encoding="utf-8")

    head = "# Änderungsprotokoll GameTab\n\n"
    log = log_p.read_text(encoding="utf-8") if log_p.exists() else head
    body = log[len(head):] if log.startswith(head) else log
    entry = f"## {build} ({now.strftime('%d.%m.%Y %H:%M')})\n- {note}\n\n"
    log_p.write_text(head + entry + body, encoding="utf-8")

    print(f"Version {old} -> {build}")
    if modern:
        if not (ROOT / "node_modules").is_dir() and not run(["npm", "ci"], "Abhängigkeiten installieren"):
            return 1
        if not run(["npm", "run", "build"], "Build"):
            return 1
        if not run([sys.executable, str(ROOT / "tools" / "check.py"), str(ROOT / "docs" / "index.html")], "Check"):
            return 1
        print("Fertig. Jetzt docs/ mitcommitten und pushen.")
    else:
        print("Jetzt: python3 tools/check.py, dann committen und pushen.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
