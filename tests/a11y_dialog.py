#!/usr/bin/env python3
"""Dialoge und Schieber-Tafel per Tastatur (Playwright, Python).

Aufruf: GAMETAB_HTML=docs/index.html $VENV tests/a11y_dialog.py [--only onboarding,mehr,regeln,jahr,weis,pad,tour,podium,schieber]

Je Dialog: Fokus rutscht hinein, Tab und Shift+Tab bleiben im Dialog (Schleife), alles ausserhalb ist inert,
Escape schliesst (wo erlaubt), Fokus kehrt auf den Ausloeser zurueck. Schieber: Punkte nur mit Tab, Enter, Leertaste.
Nur eigene, leere Browser-Kontexte. Immer nur ein Browser. Exit 0 = alles gut.
"""
import os
import re
import sys

os.environ.setdefault("GAMETAB_HTML", "docs/index.html")
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import regression as R  # noqa: E402
import ergebnisbild_app as A  # noqa: E402
from playwright.sync_api import sync_playwright  # noqa: E402

OUT = R.ROOT / "tests" / "out" / "a11y"
OUT.mkdir(parents=True, exist_ok=True)
FAILS = []

DLG = '[role="dialog"]'
JS_STATE = """() => {
  const ds = [...document.querySelectorAll('[role="dialog"]')].filter(d => d.getClientRects().length);
  const d = ds[ds.length - 1];
  if (!d) return null;
  const a = document.activeElement;
  const foc = 'a[href],button:not([disabled]),input:not([disabled]):not([type="hidden"]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';
  const outside = [...document.querySelectorAll(foc)].filter(e => e.getClientRects().length && !d.contains(e) && !e.contains(d));
  const open = outside.filter(e => !e.closest('[inert]')).map(e => (e.getAttribute('aria-label') || e.textContent || e.tagName).trim().slice(0, 30));
  const label = d.getAttribute('aria-label') || (d.getAttribute('aria-labelledby') ? (document.getElementById(d.getAttribute('aria-labelledby')) || {}).textContent : '');
  return { inside: d.contains(a), modal: d.getAttribute('aria-modal'), label: (label || '').trim(), outsideOpen: open, nOutside: outside.length };
}"""


def ok(cond, msg):
    if cond:
        print("OK    ", msg)
    else:
        print("FEHLER", msg)
        FAILS.append(msg)


def state(pg):
    return pg.evaluate(JS_STATE)


def focus_is(pg, loc):
    return bool(loc.evaluate("el => el === document.activeElement"))


def tab_loop(pg, name, n=30):
    """n mal Tab und n mal Shift+Tab: der Fokus bleibt immer im Dialog."""
    bad = 0
    for key in ("Tab", "Shift+Tab"):
        for _ in range(n):
            pg.keyboard.press(key)
            st = state(pg)
            if st is None or not st["inside"]:
                bad += 1
    ok(bad == 0, f"{name}: Tab-Schleife bleibt im Dialog ({bad} Ausreisser)")


def check_modal(pg, name, trigger, escape=True, shot=None, via_key=True):
    """trigger: Locator des Ausloesers (wird fokussiert und per Enter geoeffnet) oder None (Dialog ist schon offen)."""
    if trigger is not None:
        trigger.focus()
        if via_key:
            pg.keyboard.press("Enter")
        else:
            trigger.click()
        R.wait(pg, 900)
    st = state(pg)
    ok(st is not None, f"{name}: Dialog offen")
    if st is None:
        return
    ok(st["inside"], f"{name}: Startfokus im Dialog")
    ok(st["modal"] == "true", f"{name}: aria-modal")
    ok(bool(st["label"]), f"{name}: zugaenglicher Name ({st['label'][:40]!r})")
    ok(not st["outsideOpen"], f"{name}: Hintergrund inert ({st['nOutside']} Bedienelemente aussen, offen: {st['outsideOpen'][:3]})")
    tab_loop(pg, name)
    if shot:
        pg.screenshot(path=str(OUT / f"{shot}.png"))
    if escape:
        for _ in range(3):  # Podium: erster Druck ueberspringt die Animation
            pg.keyboard.press("Escape")
            R.wait(pg, 700)
            if state(pg) is None:
                break
        ok(state(pg) is None, f"{name}: Escape schliesst")
        if trigger is not None:
            ok(focus_is(pg, trigger), f"{name}: Fokus zurueck auf den Ausloeser")
        ok(pg.evaluate("document.querySelectorAll('[inert]').length") == 0, f"{name}: nach dem Schliessen kein inert mehr")


def new_phone(b, errors, w=393, h=852):
    return R.new_page(b, w, h, "Handy", errors)


def to_schieber_setup(pg):
    pg.goto(R.URL)
    R.wait(pg, 900)
    R.open_game(pg, "Schreibunterlagen", "Jass")
    R.click(pg, pg.get_by_text("Schieber", exact=True).first, 800)


def to_schieber_board(pg):
    to_schieber_setup(pg)
    R.click(pg, R.btn(pg, "Spiel starten").first, 900)


def case_onboarding(b):
    errors = []
    ctx = b.new_context(viewport={"width": 393, "height": 852})
    pg = ctx.new_page()
    pg.on("pageerror", lambda e: errors.append(str(e)[:200]))
    pg.goto(R.URL + "?reset=1")
    R.wait(pg, 1200)
    check_modal(pg, "Onboarding", None, escape=False)
    pg.keyboard.press("Escape")
    R.wait(pg, 700)
    ok(state(pg) is None, "Onboarding: Escape ueberspringt")
    ok(not errors, f"Onboarding: keine Seitenfehler {errors[:1]}")
    ctx.close()


def case_mehr(b):
    errors = []
    ctx, pg = new_phone(b, errors)
    to_schieber_board(pg)
    check_modal(pg, "Mehr", pg.get_by_role("button", name="Mehr", exact=True).first, shot="mehr")
    ok(not errors, f"Mehr: keine Seitenfehler {errors[:1]}")
    ctx.close()


def case_regeln(b):
    errors = []
    ctx, pg = new_phone(b, errors)
    to_schieber_setup(pg)
    check_modal(pg, "Regeln", pg.get_by_role("button", name="Regeln anzeigen").first, shot="regeln")
    ok(not errors, f"Regeln: keine Seitenfehler {errors[:1]}")
    ctx.close()


def case_jahr(b):
    errors = []
    ctx, pg = R.new_page(b, 1280, 800, "Laptop", errors)
    A.flow_freeplay(pg)
    pg.goto(R.URL)
    R.wait(pg, 900)
    R.click(pg, pg.get_by_text(re.compile(r"Statistik", re.I)).first, 900)
    rv = pg.get_by_role("button", name=re.compile(r"Rückblick|Jahresrück|Dein Jahr|Karten", re.I))
    ok(rv.count() > 0, "Jahresrueckblick: Knopf gefunden")
    if rv.count():
        check_modal(pg, "Jahresrueckblick", rv.first, shot="jahr")
    ok(not errors, f"Jahresrueckblick: keine Seitenfehler {errors[:1]}")
    ctx.close()


def case_weis(b):
    errors = []
    ctx, pg = new_phone(b, errors)
    to_schieber_board(pg)
    check_modal(pg, "Wyys-Dialog", pg.get_by_role("button", name=re.compile(r"Wyys und Stöck, Team 1")).first, shot="weis")
    ok(not errors, f"Wyys: keine Seitenfehler {errors[:1]}")
    ctx.close()


def case_pad(b):
    errors = []
    ctx, pg = new_phone(b, errors)
    pg.goto(R.URL)
    R.wait(pg, 900)
    R.open_game(pg, "Schreibunterlagen", "Skyjo")
    R.click(pg, R.btn(pg, "Spiel starten").first, 900)
    trig = pg.locator("button", has_text=re.compile(r"Total")).first
    check_modal(pg, "Skyjo-Eingabe", trig, shot="skyjo_pad")
    ok(not errors, f"Skyjo-Eingabe: keine Seitenfehler {errors[:1]}")
    ctx.close()


def case_tour(b):
    errors = []
    ctx, pg = new_phone(b, errors)
    pg.goto(R.URL)
    R.wait(pg, 900)
    R.open_game(pg, "Schreibunterlagen", "Jass")
    R.click(pg, pg.get_by_text("Schieber-Turnier").first, 900)
    R.click(pg, R.btn(pg, "Turnier anlegen").first, 900)
    check_modal(pg, "Turniermenue", pg.get_by_role("button", name="Turniermenü").first, shot="turnier")
    ok(not errors, f"Turnier: keine Seitenfehler {errors[:1]}")
    ctx.close()


def case_podium(b):
    errors = []
    ctx, pg = new_phone(b, errors)
    A.flow_freeplay(pg)
    R.wait(pg, 4000)
    check_modal(pg, "Siegerpodest", None, shot="podium")
    ok(not errors, f"Podest: keine Seitenfehler {errors[:1]}")
    ctx.close()


def tab_to(pg, pred_js, name, limit=60):
    """Mit Tab zum Element, dessen Name pred_js (JS-Ausdruck mit el) erfuellt."""
    for _ in range(limit):
        pg.keyboard.press("Tab")
        if pg.evaluate("el => " + pred_js, pg.evaluate_handle("document.activeElement")):
            return True
    ok(False, f"Schieber: {name} per Tab nicht erreichbar")
    return False


def case_schieber(b):
    errors = []
    ctx, pg = new_phone(b, errors)
    to_schieber_board(pg)
    halves = pg.locator("button.gt-sch-hit")
    ok(halves.count() == 2, f"Schieber: zwei Team-Haelften sind native Buttons ({halves.count()})")
    names = [halves.nth(i).get_attribute("aria-label") for i in range(halves.count())]
    ok(all(n and "Team" in n for n in names) and len(set(names)) == 2, f"Schieber: Namen je Team verschieden {names}")
    # Tab erreicht beide Haelften, sichtbarer Fokus
    pg.locator("body").click(position={"x": 5, "y": 5})
    if tab_to(pg, "el.classList && el.classList.contains('gt-sch-hit') && el.getAttribute('aria-label').endsWith('Team 1')", "Team-1-Haelfte"):
        ring = pg.evaluate("(() => { const s = getComputedStyle(document.activeElement); return s.outlineStyle + ' ' + s.outlineWidth; })()")
        ok(ring.startswith("solid") and not ring.endswith(" 0px"), f"Schieber: sichtbarer Fokus ({ring})")
        pg.screenshot(path=str(OUT / "schieber_fokus.png"))
        pg.keyboard.press("Enter")
        R.wait(pg, 700)
        st = state(pg)
        ok(st is not None and st["inside"], "Schieber: Eingabefeld offen, Fokus darin")
        for d in ("5", "0"):
            tab_to(pg, f"el.tagName==='BUTTON' && el.textContent.trim()==='{d}' && !!el.closest('.gt-sch-edpad')", f"Ziffer {d}")
            pg.keyboard.press("Space" if d == "5" else "Enter")
            R.wait(pg, 200)
        shown = pg.locator(".gt-sch-ed .gt-sch-edv").inner_text()
        ok("50" in shown, f"Schieber: Ziffern per Tastatur ({shown!r})")
        tab_to(pg, "el.classList.contains('gt-sch-edok')", "Bestaetigen")
        pg.keyboard.press("Enter")
        R.wait(pg, 800)
        ok(pg.locator(".gt-sch-ed").count() == 0, "Schieber: Eingabefeld nach Bestaetigen zu")
        ok(focus_is(pg, halves.nth(1)), "Schieber: Fokus zurueck auf die Team-Haelfte")
        pg.locator(".gt-sch-t1").get_by_role("button", name="Verlauf").focus()
        pg.keyboard.press("Enter")
        R.wait(pg, 300)
        board = pg.locator(".gt-sch-t1").inner_text()
        ok("+50" in board, f"Schieber: Team 1 hat +50 im Verlauf ({board.replace(chr(10), ' ')[:60]!r})")
        # Escape verwirft
        halves.nth(0).focus()
        pg.keyboard.press("Enter")
        R.wait(pg, 600)
        pg.keyboard.press("Escape")
        R.wait(pg, 600)
        ok(pg.locator(".gt-sch-ed").count() == 0, "Schieber: Escape schliesst das Eingabefeld")
        ok(focus_is(pg, halves.nth(0)), "Schieber: Fokus nach Escape wieder auf der Haelfte")
    # gedrehte Haelfte (Team 2): Enter und Leertaste
    halves.nth(0).focus()
    pg.keyboard.press("Enter")
    R.wait(pg, 600)
    pg.keyboard.press("Escape")
    R.wait(pg, 500)
    t2 = pg.locator(".gt-sch-t2 button.gt-sch-hit")
    t2.focus()
    pg.keyboard.press("Space")
    R.wait(pg, 700)
    t = pg.locator(".gt-sch-ed").get_attribute("data-side")
    ok(t == "t2", f"Schieber: gedrehte Haelfte oeffnet das Feld fuer Team 2 (side={t})")
    title = pg.locator("#gt-sch-edt").inner_text()
    ok("Team 2" in title, f"Schieber: Titel nennt Team 2 ({title!r})")
    pg.screenshot(path=str(OUT / "schieber_t2.png"))
    pg.keyboard.press("Escape")
    R.wait(pg, 500)
    # Maus/Touch wie bisher
    halves.nth(0).click()
    R.wait(pg, 600)
    ok(pg.locator(".gt-sch-ed").count() == 1, "Schieber: Tippen/Klick oeffnet weiter das Feld")
    ok(not errors, f"Schieber: keine Seitenfehler {errors[:1]}")
    ctx.close()


CASES = {
    "onboarding": case_onboarding, "mehr": case_mehr, "regeln": case_regeln, "jahr": case_jahr, "weis": case_weis,
    "pad": case_pad, "tour": case_tour, "podium": case_podium, "schieber": case_schieber,
}


def main():
    only = None
    if "--only" in sys.argv:
        only = sys.argv[sys.argv.index("--only") + 1].split(",")
    with sync_playwright() as p:
        b = p.chromium.launch()
        for name, fn in CASES.items():
            if only and name not in only:
                continue
            print("---", name)
            try:
                fn(b)
            except Exception as e:  # ein Fall bricht nicht alle ab
                ok(False, f"{name}: Ausnahme {str(e)[:300]}")
        b.close()
    print("\nFEHLER: %d" % len(FAILS) if FAILS else "\nALLES GUT")
    for f in FAILS:
        print(" -", f)
    sys.exit(1 if FAILS else 0)


if __name__ == "__main__":
    main()
