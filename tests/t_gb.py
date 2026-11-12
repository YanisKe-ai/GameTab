#!/usr/bin/env python3
"""GB Spielfehler Teil 2: Darts Startansage und legStart (SP-9), Verraeter Haltezeit (SP-10),
Yatzy 2 Paare nur verschieden (SP-6), Coiffeur Differenz in der Total-Zelle (SP-7).

    ~/.gametab-venv/bin/python tests/t_gb.py

Chromium immer stumm (--mute-audio) und Ton in der App aus (gt_soundEnabled=false).
Auch von tests/regression.py (t_gb) aufrufbar: run(pg).
"""
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from landscape import new_phone, start, goto_game, wait  # noqa: E402

MUTE = "try{localStorage.setItem('gt_soundEnabled','false')}catch(e){}"
STATE_KEY = "spieleblock-app-state-v1"


def _btn(pg, name):
    return pg.get_by_role("button", name=name, exact=True)


def _find(obj, pred, depth=0):
    """Erstes Unterobjekt (dict), das pred erfuellt."""
    if depth > 6:
        return None
    if isinstance(obj, dict):
        if pred(obj):
            return obj
        for v in obj.values():
            r = _find(v, pred, depth + 1)
            if r:
                return r
    elif isinstance(obj, list):
        for v in obj:
            r = _find(v, pred, depth + 1)
            if r:
                return r
    return None


def _darts_state(pg):
    raw = pg.evaluate("k=>localStorage.getItem(k)", STATE_KEY)
    d = json.loads(raw)
    s = _find(d, lambda o: o.get("phase") == "play" and "legStart" in o and "players" in o)
    assert s, "Darts-State nicht gefunden"
    return s


def run_darts(pg):
    start(pg)
    goto_game(pg, "Schreibunterlagen", "Darts")
    pg.locator("button", has_text=re.compile(r"^[^A-Za-z]*STANDARD", re.I)).first.click()
    wait(pg, 600)
    _btn(pg, "301").click()
    wait(pg, 200)
    _btn(pg, "Spiel starten").click()
    wait(pg, 600)
    s = _darts_state(pg)
    name = s["players"][s["currentIdx"]]["name"]
    assert s["legStart"] == s["currentIdx"], f"legStart {s['legStart']} != currentIdx {s['currentIdx']}"
    msg = pg.locator(".dl-startcall").inner_text().strip()
    assert msg == f"{name} beginnt", f"Ansage '{msg}' statt '{name} beginnt'"
    assert pg.locator(".dl-startcall").get_attribute("aria-live") == "polite"
    # Nach dem Ausblenden kein Rest, kein Layoutsprung (Wrapper hat Hoehe 0)
    h = pg.locator(".dl-startcall").evaluate("e=>e.getBoundingClientRect().height")
    assert h == 0, f"Ansage verschiebt das Layout: {h}"
    wait(pg, 2600)
    assert pg.locator(".dl-startcall").inner_text().strip() == "", "Ansage verschwindet nicht"


def run_darts_leg(pg):
    """Legwechsel: im 2. Leg beginnt der Spieler nach dem Starter von Leg 1 (legStart = gezogener Index)."""
    s = _darts_state(pg)
    n = len(s["players"])
    first = s["legStart"]
    SEG = 'svg path[style*="cursor: pointer"]'
    plan = [[1, 1, 1], [1, 1, 4]]  # 3x T20 (301 -> 121), dann T20 T20 1 = Finish
    k = 0
    for _ in range(12):
        s = _darts_state(pg)
        if sum(s["legsWon"].values()) >= 1:
            break
        if s["currentIdx"] == first:
            for i in plan[k]:
                pg.locator(SEG).nth(i).click()
                wait(pg, 150)
            k += 1
        else:
            for _i in range(3):
                _btn(pg, "Daneben").click()
                wait(pg, 150)
        _btn(pg, "✓").click()
        wait(pg, 700)
    s = _darts_state(pg)
    assert sum(s["legsWon"].values()) == 1, f"kein Legwechsel: {s['legsWon']}"
    assert s["legStart"] == (first + 1) % n, f"legStart {s['legStart']} erwartet {(first + 1) % n}"
    assert s["currentIdx"] == s["legStart"], "Leg 2 beginnt nicht mit legStart"
    msg = pg.locator(".dl-startcall").inner_text().strip()
    assert msg.endswith("beginnt") and s["players"][s["currentIdx"]]["name"] in msg, f"Ansage Leg 2: '{msg}'"


def run_traitor(pg):
    from math import floor  # noqa: F401
    start(pg)
    goto_game(pg, "Partyspiele", "Verräter")
    _btn(pg, "Spiel starten").click()
    wait(pg, 700)
    # Rollen verteilen: pro Person halten zum Ansehen, dann weiter
    for _ in range(14):
        el = pg.get_by_text("Gedrückt halten zum Ansehen").first
        if el.count() == 0 or not el.is_visible():
            break
        bb = el.bounding_box()
        pg.mouse.move(bb["x"] + bb["width"] / 2, bb["y"] + bb["height"] / 2)
        pg.mouse.down()
        wait(pg, 700)
        pg.mouse.up()
        wait(pg, 600)
        pg.get_by_role("button", name=re.compile("Verstanden")).first.click()
        wait(pg, 600)
    hold = pg.get_by_role("button", name=re.compile(r"Verräter: Opfer"))
    assert hold.count(), "Nachtseite nicht erreicht"
    bb = hold.first.bounding_box()
    pg.mouse.move(bb["x"] + bb["width"] / 2, bb["y"] + bb["height"] / 2)
    pg.mouse.down()
    wait(pg, 500)
    pg.mouse.up()
    wait(pg, 400)
    assert not pg.get_by_text(re.compile("Wen ermordet ihr")).count(), "Nacht oeffnet schon nach 0,5 s"
    pg.mouse.move(bb["x"] + bb["width"] / 2, bb["y"] + bb["height"] / 2)
    pg.mouse.down()
    wait(pg, 1000)
    pg.mouse.up()
    wait(pg, 600)
    assert pg.get_by_text(re.compile("Wen ermordet ihr")).count(), "Halten 0,9 s oeffnet die Nacht nicht"


def run_yatzy(pg):
    start(pg)
    goto_game(pg, "Schreibunterlagen", "Yatzy")
    _btn(pg, "Spiel starten").click()
    wait(pg, 700)
    pg.locator('.yz-cell[title="Spieler 1 · 2 Paare"]').click()
    wait(pg, 600)
    hint = pg.get_by_text(re.compile("^Zwei verschiedene Paare")).inner_text().strip()
    assert hint == "Zwei verschiedene Paare antippen.", f"Hinweis: '{hint}'"
    tiles = pg.locator(".yz-tiles .yz-tile")
    tiles.nth(2).click()  # Dreier
    wait(pg, 300)
    tiles.nth(2).click()  # nochmals: gleiches Paar nicht zweimal
    wait(pg, 300)
    assert pg.locator('.yz-tile[aria-pressed="true"]').count() == 0, "gleiches Paar wurde zweimal gewaehlt"
    tiles.nth(2).click()
    wait(pg, 200)
    tiles.nth(4).click()  # Fuenfer
    wait(pg, 300)
    sel = pg.locator('.yz-tile[aria-pressed="true"]')
    assert sel.count() == 2, f"zwei verschiedene Paare: {sel.count()} gewaehlt"
    sl = pg.locator(".yz-sumline").inner_text()
    assert sl == "Paar 3 + Paar 5", f"Paare 3 und 5: {sl!r}"
    # Dritte Zahl ersetzt das zweite Paar, nie dasselbe Paar doppelt
    tiles.nth(5).click()
    wait(pg, 300)
    assert pg.locator('.yz-tile[aria-pressed="true"]').count() == 2, "dritte Wahl erzeugt keine zwei Paare"
    pg.locator(".yz-commit").first.click()
    wait(pg, 600)
    # Gespeichert: 2*3+2*6 = 18, Editor zeigt beim erneuten Oeffnen 3 und 6
    pg.locator('.yz-cell[title="Spieler 1 · 2 Paare"]').click()
    wait(pg, 600)
    assert pg.locator('.yz-tile[aria-pressed="true"]').count() == 2, "Altwert 18 nicht als zwei Paare geladen"


def run_coiffeur(pg, w=320, h=568):
    start(pg)
    goto_game(pg, "Schreibunterlagen", "Jass")
    pg.locator("button", has_text=re.compile(r"^[^A-Za-z]*Coiffeur", re.I)).first.click()
    wait(pg, 600)
    _btn(pg, "Spiel starten").click()
    wait(pg, 700)
    for i in range(4):
        if pg.get_by_role("dialog").count() == 0:
            pg.locator(".jdp-c:has(.jdp-blank)").first.click()
            wait(pg, 350)
        for ch in str(40 + i * 37):
            _btn(pg, ch).first.click()
            wait(pg, 100)
        _btn(pg, "Eintragen").click()
        wait(pg, 450)
    pg.keyboard.press("Escape")
    wait(pg, 500)
    tv = pg.locator(".jdp-tv")
    assert tv.count() == 2, "Total-Zellen fehlen"
    txt = [tv.nth(i).inner_text().replace("\n", " ") for i in range(2)]
    assert all(re.search(r"\d+ [+−]?\d+$", x) for x in txt), f"Zelle ohne Punkte und Differenz: {txt}"
    assert pg.locator(".jdp-tl").inner_text().replace("\n", " ") == "Punkte Differenz", "Beschriftung"
    m = pg.evaluate("({s:document.documentElement.scrollHeight,i:innerHeight,x:document.documentElement.scrollWidth,w:innerWidth})")
    assert m["s"] <= m["i"], f"Coiffeur scrollt senkrecht: {m}"
    assert m["x"] <= m["w"], f"Coiffeur scrollt waagrecht: {m}"
    hm = pg.locator(".jdp-hm").evaluate("e=>[e.scrollHeight,e.clientHeight]")
    assert hm[0] <= hm[1], f"Tabelle scrollt senkrecht: {hm}"


def run(pg):
    for f in (run_darts, run_darts_leg, run_traitor, run_yatzy, run_coiffeur):
        f(pg)
        print("  ", f.__name__, "ok")


def main():
    from playwright.sync_api import sync_playwright
    with sync_playwright() as p:
        b = p.chromium.launch(args=["--mute-audio"])
        ctx, pg = new_phone(b, 320, 568)
        ctx.add_init_script(MUTE)
        try:
            run(pg)
            errs = [e for e in pg._pl_errors if "manifest" not in e and "sw.js" not in e and "favicon" not in e and "Failed to load resource" not in e]
            assert not errs, f"Seitenfehler: {errs[:2]}"
            print("t_gb OK")
            return 0
        except AssertionError as e:
            print("t_gb FEHLER:", e)
            return 1
        finally:
            b.close()


if __name__ == "__main__":
    sys.exit(main())
