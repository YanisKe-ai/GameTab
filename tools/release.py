#!/usr/bin/env python3
"""GameTab Release vorbereiten. Vor jedem Push ausführen:

    python3 tools/release.py "Kurze Beschreibung der Änderung"

Erhöht gemeinsam:
  1. APP_BUILD in index.html (steuert den Hinweis "Neue Version ist da")
  2. version.json (die App vergleicht ihren APP_BUILD damit)
  3. CACHE_NAME in sw.js
  4. Eintrag oben in CHANGELOG.md
Build-Format: JJJJ.MM.TT-N (N zählt pro Tag hoch).
"""
import datetime
import json
import re
import sys
from pathlib import Path
from zoneinfo import ZoneInfo

ROOT = Path(__file__).resolve().parent.parent


def main() -> int:
    if len(sys.argv) < 2 or not sys.argv[1].strip():
        print('Aufruf: python3 tools/release.py "Beschreibung"')
        return 1
    note = sys.argv[1].strip()
    html_p, ver_p, sw_p, log_p = ROOT / "index.html", ROOT / "version.json", ROOT / "sw.js", ROOT / "CHANGELOG.md"

    html = html_p.read_text(encoding="utf-8")
    m = re.findall(r'const APP_BUILD="([^"]*)";', html)
    if len(m) != 1:
        print(f"FEHLER: APP_BUILD {len(m)}x in index.html gefunden, erwartet 1x")
        return 1
    old = m[0]
    # Nie hinter eine schon veröffentlichte Nummer zurückfallen (z. B. nach Wiederherstellen einer alten index.html)
    if ver_p.exists():
        vj = json.loads(ver_p.read_text(encoding="utf-8")).get("build", "")
        key = lambda b: (b.split("-")[0], int(b.split("-")[1])) if "-" in b else (b, 0)
        if vj and key(vj) > key(old):
            old_html, old = old, vj
            html = html.replace(f'const APP_BUILD="{old_html}";', f'const APP_BUILD="{old}";')

    now = datetime.datetime.now(ZoneInfo("Europe/Zurich"))
    day = now.strftime("%Y.%m.%d")
    n = int(old.split("-")[1]) + 1 if old.startswith(day + "-") else 1
    build = f"{day}-{n}"

    html_p.write_text(html.replace(f'const APP_BUILD="{old}";', f'const APP_BUILD="{build}";'), encoding="utf-8")
    ver_p.write_text(json.dumps({"build": build}) + "\n", encoding="utf-8")

    sw = sw_p.read_text(encoding="utf-8")
    sw, k = re.subn(r'const CACHE_NAME = "[^"]*";', f'const CACHE_NAME = "gametab-cache-{build}";', sw)
    if k != 1:
        print("FEHLER: CACHE_NAME in sw.js nicht gefunden")
        return 1
    sw_p.write_text(sw, encoding="utf-8")

    head = "# Änderungsprotokoll GameTab\n\n"
    log = log_p.read_text(encoding="utf-8") if log_p.exists() else head
    body = log[len(head):] if log.startswith(head) else log
    entry = f"## {build} ({now.strftime('%d.%m.%Y %H:%M')})\n- {note}\n\n"
    log_p.write_text(head + entry + body, encoding="utf-8")

    print(f"Version {old} -> {build}")
    print("Jetzt: python3 tools/check.py, dann committen und pushen.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
