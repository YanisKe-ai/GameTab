#!/usr/bin/env python3
"""Ergebnisbild pro Spiel: echte Partie in der App bis zum Ende, "Als Bild teilen", Vorschau-PNG auslesen.

Aufruf (nach npm run build):
    GAMETAB_HTML=docs/index.html $VENV tests/ergebnisbild_app.py [chromium|webkit|all] [--only Yatzy]
Bilder: tests/out/ergebnisbild/app_<engine>_<fall>.png
Prueft: Vorschau zeigt ein Bild 1080x1350 (eigene Vorlage, das alte Bild ist mindestens 1440 hoch), keine Konsolenfehler.
Neue Spiele: Funktion flow_<spiel>(pg) nach dem Muster unten schreiben und in FLOWS eintragen (Abläufe wie in tests/regression.py).
"""
import base64
import glob
import io
import os
import re
import sys

os.environ.setdefault("GAMETAB_HTML", "docs/index.html")
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import regression as R  # noqa: E402
from playwright.sync_api import sync_playwright  # noqa: E402
from PIL import Image  # noqa: E402

ARGS = sys.argv[1:]
ENG = ["chromium", "webkit"] if "all" in ARGS else [a for a in ARGS if a in ("chromium", "webkit")] or ["chromium"]
ONLY = [ARGS[i + 1] for i, a in enumerate(ARGS) if a == "--only" and i + 1 < len(ARGS)]
OUT = R.ROOT / "tests" / "out" / "ergebnisbild"
OUT.mkdir(parents=True, exist_ok=True)


def launch(p, name):
    try:
        return getattr(p, name).launch()
    except Exception:
        c = sorted(glob.glob(os.path.expanduser(f"~/Library/Caches/ms-playwright/{name}-*/pw_run.sh")))
        if name == "webkit" and c:
            return p.webkit.launch(executable_path=c[-1])
        raise


def fill_yatzy(pg, limit=200):
    n = 0
    while R.btn(pg, "·").count() > 0 and n < limit:
        R.click(pg, R.btn(pg, "·").first, 200)
        if R.btn_re(pg, "^Erreicht").count():
            R.click(pg, R.btn_re(pg, "^Erreicht").last, 130)
        elif pg.get_by_placeholder("Punkte").count():
            R.click(pg, R.btn(pg, "Streichen").last, 130)
        else:
            R.click(pg, R.btn(pg, "–").last.locator("xpath=following-sibling::button").first, 130)
        n += 1
    R.wait(pg, 1200)


def flow_yatzy2(pg):
    R.open_game(pg, "Schreibunterlagen", "Yatzy"); R.press_start(pg)
    fill_yatzy(pg)


def flow_yatzy4(pg):
    R.open_game(pg, "Schreibunterlagen", "Yatzy")
    R.set_players(pg, 4)
    names = ["Maximiliane Huber-Brunner", "Zoë", "Ölçü", "Kim"]
    inp = [i for i in pg.locator("input").all() if re.match(r"^Spieler", i.input_value() or i.get_attribute("placeholder") or "")]
    for i, el in enumerate(inp[:4]):
        el.fill(names[i]); R.wait(pg, 150)
    R.press_start(pg)
    fill_yatzy(pg)


def flow_schieber(pg):
    R.open_game(pg, "Schreibunterlagen", "Jass", "Schieber"); R.press_start(pg)
    for _ in range(2):
        R.click(pg, R.btn_re(pg, "Weis und Stöck"))
        R.click(pg, pg.get_by_role("button", name=re.compile("^Neunblatt")))
        R.click(pg, R.btn(pg, "×3"))
        R.click(pg, R.btn_re(pg, "Punkte eintragen").last, 1500)


def seed_state(pg, game, patch):
    """Spielstand eines Spiels direkt in den Speicher schreiben (fertige Partie), App neu laden. Spart hunderte Klicks, der Teilen-Weg bleibt echt."""
    import json as _j
    pg.evaluate("([g,p])=>{const k='spieleblock-app-state-v1';const s=JSON.parse(localStorage.getItem(k));s[g]=Object.assign({},s[g],p);localStorage.setItem(k,JSON.stringify(s));}", [game, patch])
    pg.evaluate("()=>{window.onbeforeunload=null}")


def reopen(pg, cat, name, sub=None):
    R.open_game(pg, cat, name, sub)
    R.wait(pg, 800)


def flow_wizard(pg):
    R.open_game(pg, "Schreibunterlagen", "Wizard"); R.press_start(pg)
    R.wait(pg, 600)
    rounds = {}
    for r in range(1, 31):
        b1 = r % 3
        rounds[str(r)] = {"1": {"bid": b1, "tricks": b1}, "2": {"bid": 0, "tricks": r - b1}}
    pg.evaluate("([p])=>{const k='spieleblock-app-state-v1';const s=JSON.parse(localStorage.getItem(k));s.wizard.players=[{id:1,name:'Zoë Ölçü'},{id:2,name:'Maximiliane Huber-Brunner'}];s.wizard.rounds=p;localStorage.setItem(k,JSON.stringify(s));}", [rounds])
    pg.reload(); R.wait(pg, 1000)
    reopen(pg, "Schreibunterlagen", "Wizard")


def seeded(pg, open_args, game, patch):
    """Spiel starten, fertigen Spielstand in den Speicher schreiben, neu laden, Spiel wieder oeffnen (echter Teilen-Weg)."""
    R.open_game(pg, *open_args); R.press_start(pg)
    R.wait(pg, 600)
    pg.evaluate("([g,p])=>{const k='spieleblock-app-state-v1';const s=JSON.parse(localStorage.getItem(k));s[g]=Object.assign({},s[g],p);localStorage.setItem(k,JSON.stringify(s));}", [game, patch])
    pg.reload(); R.wait(pg, 1000)
    reopen(pg, *open_args)


def flow_minigolf(pg):
    holes = [[3, 2, 3, 2, 4, 3, 1, 3, 2, 3, 4, 2, 3, 3, 2, 3, 3, 2], [4, 3, 3, 4, 3, 4, 3, 3, 4, 3, 3, 4, 3, 3, 4, 3, 4, 3], [5, 4, 4, 3, 5, 4, 4, 5, 4, 3, 4, 5, 4, 4, 3, 4, 5, 4]]
    seeded(pg, ("Schreibunterlagen", "Minigolf"), "minigolf", {"players": [{"id": 1, "name": "Tony"}, {"id": 2, "name": "Zoë Ölçü"}, {"id": 3, "name": "Maximiliane Huber-Brunner"}], "scores": {"1": holes[0], "2": holes[1], "3": holes[2]}})


def flow_phase10(pg):
    hist = [{"scores": {"1": 0, "2": 25, "3": 40}, "done": {"1": True, "2": r < 8, "3": r < 6}} for r in range(10)]
    hist[3]["scores"]["1"] = 15
    seeded(pg, ("Schreibunterlagen", "Phase 10"), "phase10", {"players": [{"id": 1, "name": "Tony"}, {"id": 2, "name": "Zoë Ölçü"}, {"id": 3, "name": "Maximiliane Huber-Brunner"}], "history": hist})


def flow_romme(pg):
    hist = [{"scores": {"1": 5, "2": 30, "3": 400}, "outId": 1}, {"scores": {"1": 7, "2": 34, "3": 120}, "outId": 1}]
    seeded(pg, ("Schreibunterlagen", "Rommé"), "romme", {"players": [{"id": 1, "name": "Tony"}, {"id": 2, "name": "Zoë Ölçü"}, {"id": 3, "name": "Maximiliane Huber-Brunner"}], "history": hist, "target": 500})


def flow_differenzler(pg):
    cats = [("herz", 1), ("ecke", 2), ("kreuz", 3), ("schaufel", 4), ("unte", 5), ("obe", 6), ("joker1", 7), ("joker2", 8), ("slalom", 9), ("guschti", 10)]
    raws = {"1": [30, 25, 28, 22, 31, 20, 26, 27, 24, 29], "2": [20, 18, 22, 25, 15, 19, 21, 17, 23, 16], "3": [10, 12, 8, 14, 9, 11, 13, 7, 12, 10]}
    scores = {pid: {c: {"raw": rs[i], "total": rs[i] * m} for i, (c, m) in enumerate(cats)} for pid, rs in raws.items()}
    seeded(pg, ("Schreibunterlagen", "Jass", "Differenzler"), "jass", {"players": [{"id": 1, "name": "Tony"}, {"id": 2, "name": "Zoë Ölçü"}, {"id": 3, "name": "Maximiliane Huber-Brunner"}], "scores": scores})


def tabu_wait(pg):
    """Zeit vorspulen (Chromium: Fake-Uhr, WebKit: echt warten, dort greift die Fake-Uhr in der App nicht)."""
    if pg.context.browser.browser_type.name == "webkit":
        pg.wait_for_timeout(32000)
    else:
        pg.clock.run_for(32000)


def flow_tabu(pg):
    pg.clock.install()
    R.open_game(pg, "Partyspiele", "Tabu")
    R.wait(pg, 500)
    pg.evaluate("()=>{const k='spieleblock-app-state-v1';const s=JSON.parse(localStorage.getItem(k));s.tabu.teams=[{id:1,name:'Die Wilden Hühner'},{id:2,name:'Maximiliane Huber-Brunner und Freunde'}];s.tabu.targetScore=1;s.tabu.turnSeconds=30;localStorage.setItem(k,JSON.stringify(s));}")
    pg.reload(); R.wait(pg, 1000)
    pg.clock.install()
    R.open_game(pg, "Partyspiele", "Tabu"); R.press_start(pg)
    R.click(pg, R.btn_re(pg, "Bereit"), 800)
    R.click(pg, R.btn(pg, "Richtig"), 500)
    tabu_wait(pg)
    R.wait(pg, 600)
    R.click(pg, R.btn_re(pg, "Verstanden"), 1000)
    R.click(pg, R.btn_re(pg, "Bereit"), 800)  # zweites Team ohne Punkt: erst nach der vollen Runde endet das Spiel
    tabu_wait(pg)
    R.wait(pg, 600)
    R.click(pg, R.btn_re(pg, "Verstanden"), 1000)
    R.wait(pg, 600)


FLOWS = {"Yatzy 2": flow_yatzy2, "Yatzy 4 lang": flow_yatzy4, "Schieber": flow_schieber, "Wizard": flow_wizard, "Minigolf": flow_minigolf, "Phase 10": flow_phase10, "Rommé": flow_romme, "Differenzler": flow_differenzler, "Tabu": flow_tabu}


def share_png(pg, tag):
    share = pg.get_by_role("button", name=re.compile(r"Bild teilen"))
    R.check(share.count() > 0, f"{tag}: Knopf 'Als Bild teilen' fehlt")
    pg.wait_for_timeout(4000)  # Podest-Einlauf (3.6 s) faengt Klicks ab, sonst nur Ueberspringen
    R.click(pg, share.first, 500)
    js = "()=>{const i=[...document.querySelectorAll('img')].find(i=>i.naturalWidth>500&&i.src.startsWith('data:image/png'));return i?i.src:null}"
    src = None
    for _ in range(40):  # WebKit braucht laenger (Schriften), bis 20 s warten
        src = pg.evaluate(js)
        if src:
            break
        pg.wait_for_timeout(500)
    R.check(bool(src), f"{tag}: keine Bildvorschau")
    raw = base64.b64decode(src.split(",", 1)[1])
    im = Image.open(io.BytesIO(raw))
    path = OUT / f"app_{tag}.png"
    path.write_bytes(raw)
    R.check(im.size == (1080, 1350), f"{tag}: Bildgroesse {im.size} (Rueckfall auf altes Bild?)")
    return path


def main():
    fails = []
    with sync_playwright() as p:
        for eng in ENG:
            b = launch(p, eng)
            for name, fn in FLOWS.items():
                if ONLY and not any(o.lower() in name.lower() for o in ONLY):
                    continue
                errors = []
                tag = eng + "_" + re.sub(r"\W+", "_", name)
                ctx, pg = R.new_page(b, 393, 852, "Handy", errors)
                try:
                    fn(pg)
                    path = share_png(pg, tag)
                    if errors:
                        raise R.Fail("; ".join(errors[:3]))
                    print("OK    ", tag, path.name)
                except Exception as e:  # noqa: BLE001
                    fails.append(f"{tag}: {str(e)[:300]}")
                    print("FEHLER", tag, str(e)[:300])
                    pg.screenshot(path=str(OUT / f"app_{tag}_fehler.png"))
                ctx.close()
            b.close()
    print(f"\n{len(fails)} Fehler")
    return 1 if fails else 0


if __name__ == "__main__":
    sys.exit(main())
