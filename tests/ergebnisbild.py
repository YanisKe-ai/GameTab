#!/usr/bin/env python3
"""Ergebnisbild pro Spiel: Vorlagen direkt mit Testfaellen rendern (Chromium und WebKit).

Aufruf (nach npm run build):
    $VENV tests/ergebnisbild.py                      # alle Faelle aus tests/ergebnisbild/*.json, chromium + webkit
    $VENV tests/ergebnisbild.py --game yatzy         # nur ein Spiel (mehrfach moeglich)
    $VENV tests/ergebnisbild.py --engine chromium    # nur ein Browser
    $VENV tests/ergebnisbild.py --sheet              # zusaetzlich Kontaktbogen tests/out/ergebnisbild/_sheet_<spiel>.png

Faelle: eine Datei pro Spiel, tests/ergebnisbild/<gameId>.json (Liste). Feld je Fall:
    name, lang (de|en|fr|it|es|pt), players [{name, score}], lowWins (optional), extra (optional, wie shareExtra des Spiels),
    label (optional, sonst t("game...")), labelKey (optional, z.B. "gameYatzy"), pages (optional, erwartete Seitenzahl).
Prueft je Fall: Vorlage greift (kein Rueckfall), jede Seite 1080x1350, toDataURL klappt (kein tainted canvas), keine Konsolenfehler.
Bilder: tests/out/ergebnisbild/<engine>_<gameId>_<name>[_<seite>].png
Exitcode 1 bei Fehlern.
"""
import base64
import glob
import json
import os
import subprocess
import sys
import time
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
DOCS = ROOT / os.environ.get("GAMETAB_DOCS", "docs")
OUT = ROOT / "tests" / "out" / "ergebnisbild"
OUT.mkdir(parents=True, exist_ok=True)
ARGS = sys.argv[1:]
GAMES = [ARGS[i + 1] for i, a in enumerate(ARGS) if a == "--game" and i + 1 < len(ARGS)]
CASES = [ARGS[i + 1] for i, a in enumerate(ARGS) if a == "--case" and i + 1 < len(ARGS)]
ENG = [ARGS[i + 1] for i, a in enumerate(ARGS) if a == "--engine" and i + 1 < len(ARGS)] or ["chromium", "webkit"]
PORT = 8790 + os.getpid() % 100


def launch(p, name):
    try:
        return getattr(p, name).launch()
    except Exception:
        # Playwright-Version und installierter Browser passen nicht immer: neuesten vorhandenen nehmen
        cands = sorted(glob.glob(os.path.expanduser(f"~/Library/Caches/ms-playwright/{name}-*/pw_run.sh")))
        if name == "webkit" and cands:
            return p.webkit.launch(executable_path=cands[-1])
        raise


JS = """async (c) => {
  document.documentElement.lang = c.lang;
  const D = TRANSLATIONS[c.lang] || TRANSLATIONS.de;
  const t = (k) => D[k] || TRANSLATIONS.de[k] || k;
  const label = c.label || t(c.labelKey || ("game" + c.gameId.charAt(0).toUpperCase() + c.gameId.slice(1)));
  // rk gesetzt (Phase 10, Romme): Reihenfolge und rk wie im Spiel, sonst Rangfolge per rankedPodium
  const ranked = c.players.some((p) => p.rk != null) ? c.players.map((p) => ({ name: p.name, score: p.score, rk: p.rk })) : rankedPodium(c.players.map((p, i) => ({ id: i + 1, name: p.name, score: p.score })), (p) => p.score, Object.assign({ lowWins: !!c.lowWins }, c.reason ? { reason: c.reason, winners: c.winners } : {}));
  if (!GT_EC_TPL.has || !GT_EC_TPL.has(c.gameId)) return { err: "keine Vorlage registriert" };
  const t0 = performance.now();
  const cvs = await GT_EC_TPL.render(c.gameId, label, ranked, t, c.extra || null);
  if (!cvs) return { err: "Vorlage lieferte null (accepts false?)" };
  const pages = cvs.map((cv) => ({ w: cv.width, h: cv.height, url: cv.toDataURL("image/png") }));
  return { ms: Math.round(performance.now() - t0), pages };
}"""


def main():
    files = sorted((ROOT / "tests" / "ergebnisbild").glob("*.json"))
    cases = []
    for f in files:
        gid = f.stem
        if GAMES and gid not in GAMES:
            continue
        for c in json.loads(f.read_text(encoding="utf-8")):
            c.setdefault("gameId", gid)
            if CASES and c["name"] not in CASES:
                continue
            cases.append(c)
    if not cases:
        print("Keine Faelle gefunden")
        return 1
    srv = subprocess.Popen([sys.executable, "-m", "http.server", str(PORT), "--bind", "127.0.0.1"], cwd=DOCS, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(0.8)
    fails = []
    shots = {}
    try:
        with sync_playwright() as p:
            for eng in ENG:
                b = launch(p, eng)
                pg = b.new_page(viewport={"width": 430, "height": 900})
                errs = []
                pg.on("pageerror", lambda e: errs.append(str(e)[:200]))
                pg.on("console", lambda m: errs.append(m.text[:200]) if (m.type == "error" or (m.type == "warning" and "Vorlage" in m.text)) else None)
                pg.goto(f"http://127.0.0.1:{PORT}/index.html")
                pg.wait_for_timeout(1200)
                for c in cases:
                    errs.clear()
                    tag = f"{eng}_{c['gameId']}_{c['name']}"
                    try:
                        r = pg.evaluate(JS, c)
                    except Exception as e:  # noqa: BLE001
                        r = {"err": str(e)[:300]}
                    if r.get("err"):
                        fails.append(f"{tag}: {r['err']}")
                        print("FEHLER", tag, r["err"])
                        continue
                    bad = [f"{q['w']}x{q['h']}" for q in r["pages"] if (q["w"], q["h"]) != (1080, 1350)]
                    if bad:
                        fails.append(f"{tag}: Groesse {bad}")
                    if c.get("pages") and len(r["pages"]) != c["pages"]:
                        fails.append(f"{tag}: {len(r['pages'])} Seiten statt {c['pages']}")
                    if errs:
                        fails.append(f"{tag}: Konsole {errs[:2]}")
                    for i, q in enumerate(r["pages"]):
                        path = OUT / (tag + (f"_{i + 1}" if len(r["pages"]) > 1 else "") + ".png")
                        path.write_bytes(base64.b64decode(q["url"].split(",", 1)[1]))
                        shots.setdefault(f"{eng}_{c['gameId']}", []).append(path)
                    print("OK    ", tag, f"{len(r['pages'])} Seite(n), {r['ms']} ms")
                b.close()
    finally:
        srv.terminate()
    if "--sheet" in ARGS:
        from PIL import Image
        for k, paths in shots.items():
            ims = [Image.open(x).convert("RGB").resize((324, 405)) for x in paths]
            cols = min(6, len(ims))
            rows = (len(ims) + cols - 1) // cols
            sh = Image.new("RGB", (cols * 330, rows * 411), "white")
            for i, im in enumerate(ims):
                sh.paste(im, ((i % cols) * 330, (i // cols) * 411))
            sh.save(OUT / f"_sheet_{k}.png")
    print(f"\n{len(cases) * len(ENG) - len(set(f.split(':')[0] for f in fails))} OK, {len(fails)} Fehler")
    for f in fails:
        print("  -", f)
    return 1 if fails else 0


if __name__ == "__main__":
    sys.exit(main())
