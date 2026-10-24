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
_dist = ROOT / "docs" / "index.html"
HTML = Path(sys.argv[1]) if len(sys.argv) > 1 else (_dist if _dist.exists() else ROOT / "index.html")
BUILD_RE = r'APP_BUILD\s*=\s*"([^"]*)"'


def first_existing(name):
    for d in (ROOT, ROOT / "public", ROOT / "web" / "public"):
        if (d / name).exists():
            return d / name
    return ROOT / name


def src_build():
    """APP_BUILD aus der Quelle (web/src/app/build.js), sonst None."""
    p = ROOT / "web" / "src" / "app" / "build.js"
    if p.exists():
        f = re.findall(BUILD_RE, p.read_text(encoding="utf-8"))
        return f[0] if len(f) == 1 else "?"
    return None


def vitrum_suspects(js):
    out = []
    for m in re.finditer(r"radial-gradient\([^`\"]{0,80}\$\{(\w+)\.bg\}", js):
        before = js[max(0, m.start() - 160): m.start()]
        if "vitrum" not in before:
            out.append(js[m.start(): m.start() + 90])
    return out


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
    suspects = vitrum_suspects(main_js)
    for f in sorted((ROOT / "web" / "src").rglob("*.js")) if (ROOT / "web" / "src").is_dir() else []:
        for x in vitrum_suspects(f.read_text(encoding="utf-8")):
            suspects.append(f"{f.relative_to(ROOT)}: {x}")
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

    # 5. Version: Quelle (web/src/app/build.js), gebaute Datei, version.json und sw.js müssen zusammenpassen
    builds = re.findall(BUILD_RE, main_js)
    sb = src_build()
    is_dist = HTML.resolve() == _dist.resolve()
    if (HTML.resolve() == (ROOT / "index.html").resolve() or is_dist) and builds:
        ver, sw_p = first_existing("version.json"), first_existing("sw.js")
        vj = json.loads(ver.read_text(encoding="utf-8")).get("build") if ver.exists() else None
        sw = sw_p.read_text(encoding="utf-8") if sw_p.exists() else ""
        ok = len(builds) == 1 and vj == builds[0] and f'gametab-cache-{builds[0]}"' in sw
        names = ["APP_BUILD", "version.json", "sw.js"]
        if sb is not None:
            ok = ok and sb == builds[0]
            names.insert(0, f"Quelle={sb}")
        for extra in ("version.json", "sw.js"):  # ausgelieferte Kopien in docs/, falls vorhanden
            e = ROOT / "docs" / extra
            if is_dist and e.exists():
                t = e.read_text(encoding="utf-8")
                ok = ok and (builds[0] in t)
        if not ok:
            problems.append(f"Version passt nicht zusammen: APP_BUILD={builds}, Quelle={sb}, version.json={vj}. Mit tools/release.py erhöhen")
        else:
            print(f"OK   Version {builds[0]} ({', '.join(names)})")

    if problems:
        print("\nPROBLEME:")
        for p in problems:
            print(" -", p)
        return 1
    print("\nALLES GUT")
    return 0


if __name__ == "__main__":
    sys.exit(main())
