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


def fill_names(pg, names):
    """Spielernamen in der Einrichtung setzen (Felder 'Spieler N' / 'Team N')."""
    R.set_players(pg, len(names))
    inp = [i for i in pg.locator("input").all() if re.match(r"^(Spieler|Team)", i.input_value() or i.get_attribute("placeholder") or "")]
    for i, el in enumerate(inp[: len(names)]):
        el.fill(names[i]); R.wait(pg, 150)


def flow_skyjo(pg):
    names = ["Maximiliane Huber-Brunner", "Zoë", "Ölçü"]
    R.open_game(pg, "Schreibunterlagen", "Skyjo"); fill_names(pg, names); R.press_start(pg)
    for sc in ([5, 20, 31], [3, 120, 44]):
        for nm, v in zip(names, sc):
            R.numpad(pg, nm, v)
        R.click(pg, R.btn(pg, names[0])); R.click(pg, R.btn(pg, "Runde speichern"), 900)
    R.expect_text(pg, r"gewinnt", "Skyjo: Sieger nicht angezeigt")


def flow_flip7(pg):
    names = ["Zoë", "Maximiliane Huber-Brunner", "Kim"]
    R.open_game(pg, "Schreibunterlagen", "Flip 7"); fill_names(pg, names); R.press_start(pg)
    for sc in ([60, 40, 20], [70, 30, 10], [85, 90, 50]):
        for nm, v in zip(names, sc):
            R.numpad(pg, nm, v)
        R.click(pg, R.btn(pg, "Runde speichern"), 900)
    R.expect_text(pg, r"gewinnt", "Flip 7: Sieger nicht angezeigt")


def flow_tutto(pg):
    names = ["Zoë", "Maximiliane Huber-Brunner", "Kim"]
    R.open_game(pg, "Schreibunterlagen", "Tutto"); fill_names(pg, names); R.press_start(pg)
    pg.get_by_placeholder("Punkte").first.fill("3500"); pg.keyboard.press("Enter"); R.wait(pg, 700)
    pg.get_by_placeholder("Punkte").nth(1).fill("2250"); pg.keyboard.press("Enter"); R.wait(pg, 700)
    pg.get_by_placeholder("Punkte").first.fill("3000"); pg.keyboard.press("Enter"); R.wait(pg, 900)
    R.expect_text(pg, r"gewinnt", "Tutto: Sieger nicht angezeigt")


def flow_freeplay(pg):
    R.open_game(pg, "Schreibunterlagen", "Freies Spiel")
    pg.get_by_placeholder("offen").fill("20"); R.wait(pg, 400)
    R.click(pg, R.btn(pg, "25").first, 900)
    R.expect_text(pg, r"gewinnt", "Freies Spiel: Sieger nicht angezeigt")


CUR = {"eng": "chromium"}


def advance_t(pg, ms):
    """Zeit vorspulen. WebKit: die Fake-Uhr greift in der App nicht, dort wird echt gewartet."""
    if CUR["eng"] == "webkit":
        pg.wait_for_timeout(ms)
    else:
        pg.clock.run_for(ms)
    R.wait(pg, 600)


def flow_headsup(pg):
    pg.clock.install()
    names = ["Zoë", "Maximiliane Huber-Brunner", "Kim"]
    R.open_game(pg, "Partyspiele", "HeadsUp"); fill_names(pg, names)
    R.click(pg, R.btn(pg, "30s")); R.press_start(pg)
    rights = [4, 2, 1]
    for rnd in range(6):
        t = R.body(pg)
        if re.search(r"ERGEBNIS", t) and R.btn(pg, "Revanche").count():
            break
        R.click(pg, R.btn_re(pg, "Bereit"), 600)
        pg.set_viewport_size({"width": 852, "height": 393}); R.wait(pg)
        for _ in range(rights[rnd % 3]):
            R.click(pg, R.btn_re(pg, "Richtig"), 350)
        advance_t(pg, 32000)
        pg.set_viewport_size({"width": 393, "height": 852}); R.wait(pg)
        R.click(pg, R.btn_re(pg, "Verstanden"), 700)
    R.check(R.btn(pg, "Revanche").count() > 0, "HeadsUp: Spiel endet nicht")


def flow_fivesec(pg):
    names = ["Zoë", "Maximiliane Huber-Brunner", "Kim"]
    R.open_game(pg, "Partyspiele", "5 Sekunden"); fill_names(pg, names); R.press_start(pg)
    for ok in [True, True, False, True, False, True, True, True, False]:
        R.click(pg, R.btn(pg, "Kategorie aufdecken"), 700)
        R.click(pg, R.btn_re(pg, "Geschafft" if ok else "Nicht geschafft"), 700)
        nxt = R.btn_re(pg, "Nächste Kategorie")
        if nxt.count():
            R.click(pg, nxt, 500)
    R.click(pg, R.btn(pg, "Spiel beenden").last, 600)
    conf = R.btn_re(pg, "Wirklich beenden")
    if conf.count():
        R.click(pg, conf.last, 900)


FLOWS = {"Yatzy 2": flow_yatzy2, "Yatzy 4 lang": flow_yatzy4, "Schieber": flow_schieber, "Skyjo": flow_skyjo, "Flip 7": flow_flip7, "Tutto": flow_tutto, "Freies Spiel": flow_freeplay, "HeadsUp": flow_headsup, "5 Sekunden": flow_fivesec}


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
            CUR["eng"] = eng
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
