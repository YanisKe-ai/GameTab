#!/usr/bin/env python3
"""GameTab Schnellcheck. Nach JEDER Änderung an index.html ausführen:

    python3 tools/check.py

Prüft:
  1. JavaScript-Syntax des Haupt-Scripts (node --check)
  2. Klammer-Balance rund um StartPage (häufigste Fehlerquelle bei Edits)
  3. Vitrum-Fallen: ${xx.bg} in radial-gradient ohne vitrum-Zweig davor
  4. Notausgang ?reset=1 und Lade-Absicherung noch vorhanden
Exit-Code 0 = alles gut, 1 = Fehler.
"""
import json
import re
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
HTML = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / "index.html"


def main() -> int:
    s = HTML.read_text(encoding="utf-8")
    problems = []

    scripts = re.findall(r"<script[^>]*>(.*?)</script>", s, re.S)
    if not scripts:
        print("FEHLER: keine <script>-Tags gefunden")
        return 1
    main_js = max(scripts, key=len)
    print(f"Datei: {HTML.name}  {len(s)/1e6:.2f} MB  Scripts: {len(scripts)}  Haupt-Script: {len(main_js)/1e6:.2f} MB")

    # 1. Syntax
    with tempfile.TemporaryDirectory() as tmp:
        js = Path(tmp) / "main.js"
        js.write_text(main_js, encoding="utf-8")
        r = subprocess.run(["node", "--check", str(js)], capture_output=True, text=True)
        if r.returncode != 0:
            err = r.stderr.strip().splitlines()
            # Fehlerzeile zeigen, aber nie riesige Zeilen ausgeben
            short = [l[:300] for l in err if l.strip()][-4:]
            problems.append("Syntaxfehler im Haupt-Script:\n    " + "\n    ".join(short))
        else:
            print("OK   Syntax (node --check)")

    # 2. Klammer-Balance der StartPage
    i = main_js.find("function StartPage(")
    j = main_js.find("function DartsLogo(")
    if i != -1 and j > i:
        block = main_js[i:j]
        p = block.count("(") - block.count(")")
        b = block.count("{") - block.count("}")
        if p != 0 or b != 0:
            problems.append(f"StartPage Klammern unausgeglichen: () {p:+d}, {{}} {b:+d}")
        else:
            print("OK   StartPage Klammern")

    # 3. Vitrum-Falle: ${tokens.bg} direkt in radial-gradient ohne vitrum-Weiche
    suspects = []
    for m in re.finditer(r"radial-gradient\([^`\"]{0,80}\$\{(\w+)\.bg\}", main_js):
        before = main_js[max(0, m.start() - 160): m.start()]
        if "vitrum" not in before:
            suspects.append(main_js[m.start(): m.start() + 90])
    if suspects:
        problems.append(
            "Möglicher Vitrum-Hintergrundfehler (bg ist im Vitrum-Modus schon ein kompletter Verlauf, "
            "nicht in radial-gradient() verschachteln):\n    " + "\n    ".join(suspects[:5])
        )
    else:
        print("OK   keine verschachtelten Vitrum-Verläufe")

    # 4. Notausgang
    if 'indexOf("reset=1")' in main_js and "localStorage.clear()" in main_js:
        print("OK   ?reset=1 Notausgang vorhanden")
    else:
        problems.append("Notausgang ?reset=1 fehlt (Handler mit indexOf(\"reset=1\") + localStorage.clear())")
    if "setLoaded(true)" in main_js and "Fehler beim Laden gespeicherter Daten" in main_js:
        print("OK   Lade-Absicherung (setLoaded im catch) vorhanden")
    else:
        problems.append("Lade-Absicherung fehlt: catch-Zweig muss setLoaded(true) aufrufen, sonst haengt die App auf 'Laedt ...'")

    # 5. Version: APP_BUILD, version.json und sw.js müssen zusammenpassen (nur für die Projektdatei)
    builds = re.findall(r'const APP_BUILD="([^"]*)";', main_js)
    if HTML.resolve() == (ROOT / "index.html").resolve() and builds:
        ver = ROOT / "version.json"
        vj = json.loads(ver.read_text(encoding="utf-8")).get("build") if ver.exists() else None
        sw = (ROOT / "sw.js").read_text(encoding="utf-8")
        if len(builds) != 1 or vj != builds[0] or f'gametab-cache-{builds[0]}"' not in sw:
            problems.append(f"Version passt nicht zusammen: APP_BUILD={builds}, version.json={vj}. Mit tools/release.py erhöhen")
        else:
            print(f"OK   Version {builds[0]} (index.html, version.json, sw.js)")

    if problems:
        print("\nPROBLEME:")
        for p in problems:
            print(" -", p)
        return 1
    print("\nALLES GUT")
    return 0


if __name__ == "__main__":
    sys.exit(main())
