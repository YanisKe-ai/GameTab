#!/usr/bin/env python3
"""Paket NM: Namen ueber Spiele merken (Chip-Zeile «Zuletzt» und «Runde wie zuletzt»).

    ~/.gametab-venv/bin/python tests/t_nm.py

Chromium immer stumm (--mute-audio), Ton aus. Auch von tests/regression.py aufrufbar: run(pg).
Screenshots: Umgebungsvariable GT_NM_SHOTS=<Ordner>.
"""
import json
import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from landscape import new_phone, start, wait, goto_game, URL, overflow_x  # noqa: E402

SHOTS = os.environ.get("GT_NM_SHOTS")
MUTE = "try{localStorage.setItem('gt_soundEnabled','false')}catch(e){}"
ROW = ".gt-rn-row"


def _ctx(b, w=393, h=852, theme="Nocturne", mode="Handy", mobile=True):
    ctx, pg = new_phone(b, w, h, mobile=mobile)
    ctx.add_init_script(MUTE)
    start(pg, theme=theme, mode=mode)
    return ctx, pg


def shot(pg, name):
    if SHOTS:
        Path(SHOTS).mkdir(parents=True, exist_ok=True)
        pg.screenshot(path=str(Path(SHOTS) / name))


def home(pg):
    pg.goto(URL)
    wait(pg, 900)


def fields(pg):
    return pg.evaluate("[...document.querySelectorAll('.gt-su-row input')].map(e=>e.value)")


def chips(pg):
    return pg.evaluate("[...document.querySelectorAll('.gt-rn-chip')].map(e=>({t:e.textContent.trim(),off:e.getAttribute('aria-disabled')==='true'}))")


def run_main(b):
    ctx, pg = _ctx(b)
    try:
        # ohne Vorgeschichte keine Zeile
        goto_game(pg, "Schreibunterlagen", "Skyjo")
        assert pg.locator(ROW).count() == 0, "Zeile ohne Vorgeschichte sichtbar"
        inp = pg.locator(".gt-su-row input")
        inp.nth(0).fill("Anna")
        inp.nth(1).fill("Ben")
        pg.locator(".gt-su-add").first.click()
        wait(pg, 400)
        pg.locator(".gt-su-row input").nth(2).fill("Cleo")
        pg.locator(".gt-su-btn").first.click()
        wait(pg, 800)
        assert pg.evaluate("JSON.parse(localStorage.getItem('gt_lastRound')).names") == ["Anna", "Ben", "Cleo"], "gt_lastRound"
        home(pg)
        goto_game(pg, "Schreibunterlagen", "Yatzy")
        assert pg.locator(ROW).count() == 1, "Zeile fehlt in Yatzy"
        h = pg.evaluate("document.querySelector('.gt-rn-row').getBoundingClientRect().height")
        assert round(h) == 44, f"Zeilenhoehe {h}"
        assert fields(pg) == ["Spieler 1", "Spieler 2"], f"vorbefuellt: {fields(pg)}"
        cs = chips(pg)
        assert [c["t"] for c in cs] == ["Runde wie zuletzt", "Anna", "Ben", "Cleo"], cs
        shot(pg, "yatzy_393_nocturne.png")
        # einzelner Chip fuellt das naechste freie Feld
        pg.locator(".gt-rn-chip", has_text="Ben").click()
        wait(pg, 400)
        assert fields(pg) == ["Ben", "Spieler 2"], fields(pg)
        # Doppelte unmoeglich: Ben ist ausgegraut, Tippen aendert nichts
        assert [c for c in chips(pg) if c["t"] == "Ben"][0]["off"], "Ben nicht ausgegraut"
        pg.locator(".gt-rn-chip", has_text="Ben").click(force=True)
        wait(pg, 300)
        assert fields(pg) == ["Ben", "Spieler 2"], fields(pg)
        # kein freies Feld: Chips ausgegraut, Spielerzahl waechst nicht
        pg.locator(".gt-rn-chip", has_text="Anna").click()
        wait(pg, 300)
        assert fields(pg) == ["Ben", "Anna"], fields(pg)
        pg.locator(".gt-rn-chip", has_text="Cleo").click(force=True)
        wait(pg, 300)
        assert fields(pg) == ["Ben", "Anna"], fields(pg)
        # Runde wie zuletzt fuellt alle
        pg.locator(".gt-rn-chip", has_text="Runde wie zuletzt").click()
        wait(pg, 500)
        assert fields(pg) == ["Anna", "Ben", "Cleo"], fields(pg)  # Yatzy max 8, Felder wachsen
        assert not [c for c in chips(pg) if c["t"] == "Runde wie zuletzt"], "Rundenchip bleibt trotz erfuellt"
        assert all(c["off"] for c in chips(pg)), chips(pg)
        shot(pg, "yatzy_393_gefuellt.png")
        # Tabu und Schieber: keine Zeile
        home(pg)
        goto_game(pg, "Partyspiele", "Tabu")
        assert pg.locator(ROW).count() == 0, "Tabu hat Chips"
        home(pg)
        goto_game(pg, "Schreibunterlagen", "Jass")
        pg.get_by_text("Schieber", exact=True).first.click()
        wait(pg, 800)
        assert pg.locator(ROW).count() == 0, "Schieber hat Chips"
        errs = [e for e in pg._pl_errors if "manifest" not in e and "sw.js" not in e and "favicon" not in e and "Failed to load resource" not in e]
        assert not errs, errs
    finally:
        ctx.close()


def run_looks(b):
    seed = json.dumps({"ts": 1, "names": ["Anna", "Ben", "Cleo", "Dani", "Eva", "Finn"]})
    for w, h, theme, name in ((393, 852, "Hell", "hell_393"), (320, 568, "Nocturne", "nocturne_320")):
        ctx, pg = _ctx(b, w, h, theme=theme)
        try:
            pg.evaluate("([k,v])=>localStorage.setItem(k,v)", ["gt_lastRound", seed])
            home(pg)
            goto_game(pg, "Schreibunterlagen", "Yatzy")
            assert pg.locator(ROW).count() == 1
            assert overflow_x(pg) == 0, f"Querueberlauf {w}"
            shot(pg, f"yatzy_{name}.png")
        finally:
            ctx.close()


def run_laptop(b):
    seed = json.dumps({"ts": 1, "names": ["Anna", "Ben", "Cleo", "Dani", "Eva", "Finn", "Gina", "Hugo"]})
    ctx, pg = _ctx(b, 1280, 800, mode="Laptop", mobile=False)
    try:
        pg.evaluate("([k,v])=>localStorage.setItem(k,v)", ["gt_lastRound", seed])
        home(pg)
        for game in ("Werwolf", "Mafia", "Impostor", "Tabu", "Am ehesten"):
            goto_game(pg, "Partyspiele", game)
            d = pg.evaluate("(()=>{const c=document.querySelector('.gtL-content');const e=[c,document.scrollingElement,document.querySelector('.gtL-col-main')].filter(Boolean);return e.map(x=>x.scrollHeight-x.clientHeight)})()")
            has = pg.locator(ROW).count()
            shot(pg, f"laptop_{game.replace(' ', '')}.png")
            assert all(x <= 1 for x in d), f"{game}: scrollt vertikal {d} (Zeile {has})"
            if game == "Tabu":
                assert has == 0
            else:
                assert has == 1, f"{game}: Zeile fehlt"
            home(pg)
    finally:
        ctx.close()


def run(pg=None):
    if pg is not None:
        b = pg.context.browser
        run_main(b); run_looks(b); run_laptop(b)
        return
    from playwright.sync_api import sync_playwright
    with sync_playwright() as p:
        b = p.chromium.launch(args=["--mute-audio"])
        try:
            run_main(b); run_looks(b); run_laptop(b)
        finally:
            b.close()


def main():
    try:
        run()
        print("t_nm OK")
        return 0
    except AssertionError as e:
        print("t_nm FEHLER:", e)
        return 1


if __name__ == "__main__":
    sys.exit(main())
