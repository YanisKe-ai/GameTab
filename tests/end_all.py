#!/usr/bin/env python3
"""Alle laufenden Spiele beenden (Einstellungen). Leere Wegwerf-Kontexte.
Aufruf: GAMETAB_HTML=docs/index.html $VENV tests/end_all.py [--vp 393x852|1280x800] [--theme Nocturne|Hell]
Ablauf: 3 Spiele starten und Punkte eintragen, Knopf, Bestaetigung (Zwei-Klick), Meldung role=status,
Start ohne Weiterspielen, Neuladen, Statistik und Gruppen unveraendert, Namen noch da.
"""
import json, os, re, sys
os.environ.setdefault("GAMETAB_HTML", "docs/index.html")
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import regression as R  # noqa: E402
from playwright.sync_api import sync_playwright  # noqa: E402

OUT = R.ROOT / "tests" / "out" / "end_all"
OUT.mkdir(parents=True, exist_ok=True)
GROUPS = json.dumps([{"id": "g-t", "name": "Testgruppe", "players": ["Anna", "Ben"]}])
LOG = json.dumps([{"id": "m1", "game": "skyjo", "date": "2026-01-02T10:00:00.000Z", "players": [{"name": "Anna", "score": 5}, {"name": "Ben", "score": 9}]}])
KEYS = ["gt_playerGroups", "gt_matchLog"]


def arg(name, default):
    return sys.argv[sys.argv.index(name) + 1] if name in sys.argv else default


def snap(pg):
    return pg.evaluate("(ks)=>JSON.stringify(ks.map(k=>{const v=localStorage.getItem(k);try{return JSON.parse(v);}catch(e){return v;}}))", KEYS)


def app_state(pg):
    return pg.evaluate("localStorage.getItem('spieleblock-app-state-v1')") or ""


def settings(pg):
    R.click(pg, pg.locator('button[aria-label="Einstellungen"]').first, 800)


def start_three(pg, lap):
    # Skyjo: Spiel starten, Punkte eintragen
    R.open_game(pg, "Schreibunterlagen", "Skyjo"); R.press_start(pg)
    R.skyjo_round(pg, ["Spieler 1", "Spieler 2"], [5, 9], ender="Spieler 1")
    # Freies Spiel: ein Eintrag
    R.open_game(pg, "Schreibunterlagen", "Freies Spiel")
    R.click(pg, R.btn(pg, "25").first, 900)
    # Tutto: Spieler waehlen, Punkte
    R.open_game(pg, "Schreibunterlagen", "Tutto"); R.press_start(pg)
    R.click(pg, pg.locator(".tt-lane").first, 400)
    pg.get_by_placeholder("Punkte").first.fill("700"); pg.keyboard.press("Enter"); R.wait(pg, 1200)


def one(b, w, h, mode, theme, errors):
    tag = f"{w}x{h}_{theme}"
    ctx, pg = R.new_page(b, w, h, mode, errors, theme=theme)
    bad = 0
    try:
        pg.evaluate("([g,l])=>{localStorage.setItem('gt_playerGroups',g);localStorage.setItem('gt_matchLog',l);}", [GROUPS, LOG])
        pg.goto(R.URL); R.wait(pg, 800)
        # 0) leer: Knopf gesperrt und lesbar
        settings(pg)
        none = pg.get_by_role("button", name="Keine laufenden Spiele")
        assert none.count() == 1 and none.is_disabled(), "leer: Knopf nicht gesperrt oder Text fehlt"
        pg.screenshot(path=str(OUT / f"{tag}_leer.png"))
        before = snap(pg)
        start_three(pg, mode == "Laptop")
        pg.goto(R.URL); R.wait(pg, 800)
        if mode == "Laptop":
            assert pg.locator(".gtL-sidebar").get_by_text(re.compile("Skyjo")).count() >= 1, "vorher: Skyjo nicht in Seitenleiste"
        else:
            assert R.has_text(pg, r"Weiterspielen"), "vorher: kein Weiterspielen"
        settings(pg)
        endbtn = pg.get_by_role("button", name="Alle laufenden Spiele beenden")
        assert endbtn.count() == 1 and endbtn.is_enabled(), "Knopf nicht aktiv"
        endbtn.scroll_into_view_if_needed()
        pg.screenshot(path=str(OUT / f"{tag}_aktiv.png"))
        # 1) erster Klick bestaetigt nur
        R.click(pg, endbtn, 500)
        assert pg.get_by_role("button", name="Sicher? Nochmal tippen").count() >= 1, "keine Bestaetigung"
        assert app_state(pg),"Zustand weg nach erstem Klick"
        pg.screenshot(path=str(OUT / f"{tag}_bestaetigen.png"))
        # 2) Bestaetigen
        R.click(pg, pg.get_by_role("button", name="Sicher? Nochmal tippen").first, 600)
        st = pg.locator("[role=status]").filter(has_text="Laufende Spiele beendet")
        assert st.count() == 1, "Meldung role=status fehlt"
        assert pg.get_by_role("button", name="Keine laufenden Spiele").is_disabled(), "danach nicht gesperrt"
        pg.screenshot(path=str(OUT / f"{tag}_beendet.png"))
        # 3) Start: kein Weiterspielen, auch nach Neuladen
        for phase in ("direkt", "nach Neuladen"):
            if phase == "nach Neuladen":
                pg.goto(R.URL); R.wait(pg, 1000)
            else:
                R.click(pg, pg.get_by_role("button", name="Zur Startseite").first, 700)
            if mode == "Laptop":
                n = pg.locator(".gtL-sidebar").get_by_text(re.compile(r"Skyjo|Freies Spiel|Tutto")).count()
                assert n == 0, f"{phase}: Seitenleiste zeigt noch laufende Spiele"
            else:
                assert not R.has_text(pg, r"Weiterspielen"), f"{phase}: Weiterspielen steht noch"
            pg.screenshot(path=str(OUT / f"{tag}_start_{phase.replace(' ', '_')}.png"))
        # 4) Statistik und Gruppen unveraendert
        after = snap(pg)
        assert after == before, f"Statistik oder Gruppen veraendert: {str(before)[:400]} -> {str(after)[:400]}"
        # 5) Namen noch da: neues Spiel zeigt Setup, Gruppe ist noch waehlbar
        R.open_game(pg, "Schreibunterlagen", "Skyjo")
        assert R.has_text(pg, r"Spiel starten"), "Skyjo zeigt kein Setup"
        pg.goto(R.URL); R.wait(pg, 600)
        assert "Testgruppe" in pg.evaluate("localStorage.getItem('gt_playerGroups')"), "Gruppe weg"
        print("OK    ", tag)
    except Exception as e:  # noqa: BLE001
        bad = 1
        print("FEHLER", tag, str(e)[:400])
        pg.screenshot(path=str(OUT / f"{tag}_fehler.png"))
    finally:
        ctx.close()
    return bad


def main():
    w, h = map(int, arg("--vp", "393x852").split("x"))
    themes = [arg("--theme", "Nocturne")]
    mode = "Handy" if w < 768 else "Laptop"
    errors = []
    bad = 0
    with sync_playwright() as p:
        b = p.chromium.launch()
        for th in themes:
            bad += one(b, w, h, mode, th, errors)
        b.close()
    for e in errors:
        print("Konsole:", e)
    bad += len(errors)
    print("FERTIG, Fehler:", bad)
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main())
