#!/usr/bin/env python3
"""GA Spielfehler Teil 1: Skyjo-Grenze (SP-1), Rundentext (SP-2), Tutto Personenwechsel (SP-3),
Freies Spiel (SP-12), Romme 0 Karten (SP-13), Wizard Stichsumme (SP-13), Minigolf Gleichstand (SP-15).

    ~/.gametab-venv/bin/python tests/t_ga.py

Chromium immer stumm (--mute-audio) und Ton in der App aus (gt_soundEnabled=false).
Auch von tests/regression.py (t_ga) aufrufbar: run(pg).
"""
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from landscape import new_phone, start, goto_game, wait  # noqa: E402

MUTE = "try{localStorage.setItem('gt_soundEnabled','false')}catch(e){}"


def _btn(pg, name):
    return pg.get_by_role("button", name=name, exact=True)


def _disp(pg):
    return pg.locator(".sk-dv").inner_text().replace("−", "-").strip()


def run_skyjo(pg):
    start(pg)
    goto_game(pg, "Schreibunterlagen", "Skyjo")
    _btn(pg, "Spiel starten").first.click()
    wait(pg, 700)
    # SP-2: Runde 1 hat keinen "ist vorbei"-Text
    over = (pg.locator(".sk-over").text_content() or "").strip()
    assert over == "Runde 1", f"Skyjo Start: Rundentext '{over}'"
    pg.get_by_role("button", name=re.compile(r"^Spieler 1, Total")).first.click()
    wait(pg, 300)
    _btn(pg, "Weiter: Punkte eintragen").click()
    wait(pg)

    def tap(*chs):
        for ch in chs:
            _btn(pg, "Vorzeichen wechseln" if ch == "-" else ch).first.click()
            wait(pg, 150)

    def clear():
        for _ in range(5):
            pg.locator(".sk-key[data-op='1']").last.click()
            wait(pg, 100)

    # SP-1: 144 ist gueltig, eine 4. Ziffer oder 145+ nicht
    tap("1", "4", "4")
    assert _disp(pg) == "144", f"144 erwartet: {_disp(pg)}"
    tap("5")
    assert _disp(pg) == "144", f"Ziffer 4 angenommen: {_disp(pg)}"
    assert pg.locator(".sk-disp").evaluate("e=>e.getAnimations().length") > 0, "keine Schuettel-Rueckmeldung"
    clear()
    tap("1", "5")
    assert _disp(pg) == "15", f"15 erwartet: {_disp(pg)}"
    tap("0")
    assert _disp(pg) == "15", f"150 angenommen: {_disp(pg)}"
    # 99 mit Vorzeichen waere -99: abgelehnt
    clear()
    tap("9", "9", "-")
    assert _disp(pg) == "99", f"-99 angenommen: {_disp(pg)}"
    # -17 ist die Grenze: 17 gueltig, 18 nicht
    clear()
    tap("-", "1", "7")
    assert _disp(pg) == "-17", f"-17 erwartet: {_disp(pg)}"
    clear()
    tap("-", "1", "8")
    assert _disp(pg) == "-1", f"-18 angenommen: {_disp(pg)}"
    clear()
    # Runde 1 fertig: Spieler 2 mit 20, danach "Runde 1 ist vorbei"
    tap("5")
    pg.get_by_role("button", name=re.compile(r"^Weiter zu ")).first.click()
    wait(pg, 500)
    tap("2", "0")
    pg.get_by_role("button", name=re.compile(r"^Runde \d+ speichern$")).first.click()
    wait(pg, 1200)
    over = (pg.locator(".sk-over").text_content() or "").strip()
    assert over == "Runde 1 ist vorbei", f"Nach Runde 1: '{over}'"


def run_tutto(pg):
    start(pg)
    goto_game(pg, "Schreibunterlagen", "Tutto")
    _btn(pg, "Spiel starten").first.click()
    wait(pg, 700)
    pg.locator(".tt-lane").first.click()
    wait(pg, 400)
    inp = pg.get_by_placeholder("Punkte").first
    inp.fill("500")
    wait(pg, 300)
    assert inp.input_value() == "500", "Tutto: Eingabe nicht gesetzt"
    pg.locator(".tt-lane").nth(1).click()
    wait(pg, 500)
    assert pg.get_by_placeholder("Punkte").first.input_value() == "", "Tutto: Eingabe wandert zur naechsten Person"
    # gleiche Person erneut antippen leert nicht
    pg.get_by_placeholder("Punkte").first.fill("300")
    wait(pg, 200)
    pg.locator(".tt-lane").nth(1).click()
    wait(pg, 400)
    assert pg.get_by_placeholder("Punkte").first.input_value() == "300", "Tutto: gleiche Person leert die Eingabe"


def run_freeplay(pg):
    start(pg)
    goto_game(pg, "Schreibunterlagen", "Freies Spiel")
    wait(pg, 500)
    # (d) Ziel-Feld hat eine Beschriftung
    assert pg.locator("input[aria-label='Ziel (optional)']").count() == 1, "Freies Spiel: Ziel-Feld ohne aria-label"
    # (a) 7. Ziffer
    pg.get_by_role("button", name="Eigener Wert").first.click()
    wait(pg, 400)
    cin = pg.get_by_label("Eigener Wert: Spieler 1")
    cin.fill("123456")
    wait(pg, 200)
    cin.press_sequentially("7")
    wait(pg, 400)
    assert cin.input_value() == "123456", f"7. Ziffer angenommen: {cin.input_value()}"
    assert cin.evaluate("e=>e.getAnimations().length") > 0, "Freies Spiel: kein Schuetteln bei 7. Ziffer"
    assert pg.get_by_text("Höchstens 6 Ziffern", exact=True).count() == 1, "Freies Spiel: keine Ansage bei 7. Ziffer"
    pg.get_by_role("button", name="Eigener Wert").first.click()  # Feld wieder zu
    wait(pg, 400)
    # (c) Layout: Taste 10 bleibt beim ersten Tipp an Ort
    key = lambda: pg.locator(".fp-chips").first.locator("button").nth(3)
    y0 = key().bounding_box()["y"]
    key().click()
    wait(pg, 500)
    y1 = key().bounding_box()["y"]
    assert abs(y1 - y0) < 1, f"Freies Spiel: Layout-Sprung {y1 - y0}px beim ersten Tipp"
    # kein Sprung im Leerlauf: auch nach 3,5 s an Ort, Umschalter sichtbar aber gesperrt
    wait(pg, 3500)
    y2 = key().bounding_box()["y"]
    assert abs(y2 - y0) < 1, f"Freies Spiel: Sprung {y2 - y0}px nach 3,5 s"
    low = pg.get_by_role("button", name="Niedrigste gewinnt")
    assert low.count() == 1, "Freies Spiel: Umschalter nach erstem Eintrag weg"
    low.click(force=True)
    wait(pg, 300)
    assert low.get_attribute("aria-pressed") == "false", "Freies Spiel: gesperrter Umschalter hat umgeschaltet"
    assert low.evaluate("e=>e.parentElement.getAnimations().length") > 0, "Freies Spiel: kein Schuetteln am gesperrten Umschalter"
    assert pg.get_by_text("Nach dem ersten Eintrag gesperrt", exact=True).count() == 1, "Freies Spiel: keine Ansage (gesperrt)"
    assert abs(key().bounding_box()["y"] - y0) < 1, "Freies Spiel: Layout verschoben durch gesperrten Tipp"
    # Neuladen mit laufender Partie: kompakte Kopfzeile
    pg.reload()
    wait(pg, 1500)
    pg.get_by_text("Partie läuft", exact=False).first.click()
    wait(pg, 900)
    assert pg.get_by_role("button", name="Höchste gewinnt").count() == 0, "Freies Spiel: laufende Partie nicht kompakt beim Oeffnen"
    # (b) Entfernen mit Eintrag braucht zwei Tipps
    pg.get_by_role("button", name="+ Spieler").first.click()
    wait(pg, 500)
    rm = pg.get_by_role("button", name="Spieler entfernen")
    assert rm.count() == 3, f"3 Entfernen-Knoepfe erwartet: {rm.count()}"
    rm.nth(0).click()
    wait(pg, 400)
    assert rm.count() == 3 and pg.get_by_text("Sicher? Nochmal tippen").count() == 1, "Entfernen: kein Bestaetigen"
    wait(pg, 3300)
    assert pg.get_by_text("Sicher? Nochmal tippen").count() == 0 and rm.count() == 3, "Entfernen: Bestaetigung laeuft nicht ab"
    rm.nth(0).click()
    wait(pg, 400)
    rm.nth(0).click()
    wait(pg, 500)
    assert pg.get_by_role("button", name="Spieler entfernen").count() == 0, "Entfernen: zweiter Tipp entfernt nicht (2 Spieler, kein Knopf mehr erwartet)"
    # ohne Eintrag sofort
    pg.get_by_role("button", name="+ Spieler").first.click()
    wait(pg, 500)
    rm = pg.get_by_role("button", name="Spieler entfernen")
    assert rm.count() == 3
    rm.nth(2).click()
    wait(pg, 500)
    assert pg.get_by_role("button", name="Spieler entfernen").count() == 0, "Entfernen ohne Eintrag nicht sofort"


def run_romme(pg):
    start(pg)
    goto_game(pg, "Schreibunterlagen", "Rommé")
    _btn(pg, "Spiel starten").first.click()
    wait(pg, 700)
    pg.get_by_role("button", name=re.compile(r"^Spieler 1")).first.click()
    wait(pg, 400)
    pg.get_by_role("button", name=re.compile(r"^Hand-Rommé")).first.click()
    wait(pg, 400)
    _btn(pg, "Weiter: Punkte eintragen").click()
    wait(pg, 600)
    save = pg.get_by_role("button", name=re.compile(r"^Runde \d+ speichern$"))
    save.first.click()
    wait(pg, 600)
    assert pg.get_by_role("button", name="0 Karten? Nochmal tippen").count() == 1, "Romme: keine Rueckfrage bei 0 Karten"
    assert _btn(pg, "Weiter: Punkte eintragen").count() == 0, "Romme: 0 Karten beim ersten Tipp gespeichert"
    pg.get_by_role("button", name="0 Karten? Nochmal tippen").first.click()
    wait(pg, 800)
    assert _btn(pg, "Weiter: Punkte eintragen").count() == 1, "Romme: zweiter Tipp speichert nicht"


def run_wizard(pg):
    start(pg)
    goto_game(pg, "Schreibunterlagen", "Wizard")
    _btn(pg, "Spiel starten").first.click()
    wait(pg, 700)
    n = pg.locator(".wz-n")
    for _ in range(3):  # Ansagen 0, 0, 0
        n.filter(has_text=re.compile(r"^0$")).first.click()
        wait(pg, 500)
    n.filter(has_text=re.compile(r"^0$")).first.click()  # Stiche Spieler 1: 0
    wait(pg, 500)
    n.filter(has_text=re.compile(r"^0$")).first.click()  # Spieler 2: 0
    wait(pg, 500)
    zero = n.filter(has_text=re.compile(r"^0$")).first
    one = n.filter(has_text=re.compile(r"^1$")).first
    assert zero.is_disabled(), "Wizard: letzte Person darf nicht 0 (Summe muss 1 sein)"
    assert one.is_enabled(), "Wizard: letzte Person muss 1 waehlen koennen"
    # Gegenprobe: neue Partie, Spieler 1 nimmt den einen Stich, dann ist 1 fuer die anderen gesperrt
    start(pg)
    goto_game(pg, "Schreibunterlagen", "Wizard")
    _btn(pg, "Spiel starten").first.click()
    wait(pg, 700)
    for _ in range(3):
        n.filter(has_text=re.compile(r"^0$")).first.click()
        wait(pg, 500)
    n.filter(has_text=re.compile(r"^1$")).first.click()
    wait(pg, 500)
    assert n.filter(has_text=re.compile(r"^1$")).first.is_disabled(), "Wizard: Stichsumme ueber Kartenzahl moeglich"


def run_minigolf(pg):
    start(pg)
    goto_game(pg, "Schreibunterlagen", "Minigolf")
    _btn(pg, "Spiel starten").first.click()
    wait(pg, 700)
    keys2 = pg.locator("[data-mg-key$='-2']")
    main = pg.locator("[data-mg-main]")
    n = keys2.count()
    assert n >= 2
    for _ in range(18):
        for i in range(n):
            keys2.nth(i).click()
            wait(pg, 120)
        main.click()
        wait(pg, 400)
    wait(pg, 1500)
    txt = pg.evaluate("document.body.innerText")
    assert "Spieler 1" in txt and "Spieler 2" in txt, "Minigolf: Gleichstand nennt nicht beide"
    assert re.search(r"gewinnen", txt), f"Minigolf: Gleichstandtext fehlt: {txt[:200]!r}"
    ranks = [x.strip().rstrip(".") for x in pg.locator("[data-gt-podium] .gtsb-name .gtsb-sr").all_text_contents()]
    assert sorted(ranks) == ["1", "1"], f"Minigolf: Podest bei Gleichstand {ranks}"


def run(pg):
    for f in (run_skyjo, run_tutto, run_freeplay, run_romme, run_wizard, run_minigolf):
        f(pg)
        print("  ", f.__name__, "ok")


def main():
    from playwright.sync_api import sync_playwright
    with sync_playwright() as p:
        b = p.chromium.launch(args=["--mute-audio"])
        ctx, pg = new_phone(b, 393, 852)
        ctx.add_init_script(MUTE)
        try:
            run(pg)
            errs = [e for e in pg._pl_errors if "manifest" not in e and "sw.js" not in e and "favicon" not in e and "Failed to load resource" not in e]
            assert not errs, f"Seitenfehler: {errs[:2]}"
            print("t_ga OK")
            return 0
        except AssertionError as e:
            print("t_ga FEHLER:", e)
            return 1
        finally:
            b.close()


if __name__ == "__main__":
    sys.exit(main())
