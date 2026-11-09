#!/usr/bin/env python3
"""Tippen ausserhalb schliesst Ueberlagerungen (Playwright, Python).

Aufruf: GAMETAB_HTML=docs/index.html $VENV tests/tap_outside.py [--only mehr,regeln,jahr,weis,pad,flip7,turnier,podium,vorschau,tafel,amehesten]

Je Stelle: Klick (und Touch-Tipp) in den Inhalt schliesst NICHT, Klick auf die Flaeche ausserhalb schliesst, die darunterliegende
Ansicht bleibt offen (Vorschau ueber dem Podest) und es wird nichts durchgeklickt. Nur eigene, leere Browser-Kontexte. Exit 0 = gut.
"""
import os
import re
import sys

os.environ.setdefault("GAMETAB_HTML", "docs/index.html")
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import regression as R  # noqa: E402
import ergebnisbild_app as A  # noqa: E402
from playwright.sync_api import sync_playwright  # noqa: E402

FAILS = []

# Liefert zwei Punkte: einen im Inhalt (kein Knopf, kein Feld) und einen ausserhalb (Hintergrund, kein Knopf).
JS_POINTS = """(sel) => {
  const vis = [...document.querySelectorAll(sel)].filter(d => d.getClientRects().length);
  const c = vis[vis.length - 1];
  if (!c) return null;
  const r = c.getBoundingClientRect();
  const W = innerWidth, H = innerHeight;
  const ctl = e => !!e.closest('button,a,input,textarea,select,[role=button],label');
  const hit = (x, y) => document.elementFromPoint(x, y);
  let inside = null, outside = null;
  for (let fy = 0.05; fy <= 0.95 && !inside; fy += 0.05)
    for (let fx = 0.05; fx <= 0.95 && !inside; fx += 0.05) {
      const x = r.left + r.width * fx, y = r.top + r.height * fy;
      if (x < 0 || y < 0 || x > W || y > H) continue;
      const e = hit(x, y);
      if (e && c.contains(e) && !ctl(e)) inside = [x, y];
    }
  for (let y = 8; y < H && !outside; y += 16)
    for (let x = 8; x < W && !outside; x += 16) {
      const e = hit(x, y);
      if (e && !c.contains(e) && !ctl(e)) outside = [x, y];
    }
  const ov = document.querySelector('.gt-test-ov');
  return { inside, outside, W, H };
}"""


def ok(cond, msg):
    print(("OK    " if cond else "FEHLER"), msg)
    if not cond:
        FAILS.append(msg)


def points(pg, sel):
    return pg.evaluate(JS_POINTS, sel)


def gone(pg, sel):
    return pg.evaluate("(s) => ![...document.querySelectorAll(s)].some(d => d.getClientRects().length)", sel) is True


def check(pg, name, sel, touch=False, still=None, wait=700, content_sel=None):
    """sel: sichtbares Gesamtelement (Hintergrund oder Dialog), content_sel: Inhalt (sonst sel)."""
    cs = content_sel or sel
    pts = points(pg, cs)
    ok(bool(pts and pts["inside"] and pts["outside"]), f"{name}: Punkte gefunden {pts and (pts['inside'], pts['outside'])}")
    if not (pts and pts["inside"] and pts["outside"]):
        return
    tap = (lambda p: pg.touchscreen.tap(p[0], p[1])) if touch else (lambda p: pg.mouse.click(p[0], p[1]))
    tap(pts["inside"])
    R.wait(pg, wait)
    ok(not gone(pg, sel), f"{name}: Tippen in den Inhalt schliesst nicht")
    if gone(pg, sel):
        return
    pts = points(pg, cs) or pts
    tap(pts["outside"])
    R.wait(pg, wait)
    ok(gone(pg, sel), f"{name}: Tippen ausserhalb schliesst")
    if still:
        ok(not gone(pg, still), f"{name}: darunterliegende Ansicht bleibt offen")


def new_phone(b, errors, touch=False, w=393, h=852):
    return R.new_page(b, w, h, "Handy", errors, touch=touch)


def to_schieber_board(pg):
    pg.goto(R.URL)
    R.wait(pg, 900)
    R.open_game(pg, "Schreibunterlagen", "Jass")
    R.click(pg, pg.get_by_text("Schieber", exact=True).first, 800)
    R.click(pg, R.btn(pg, "Spiel starten").first, 900)


DLG = '[role="dialog"]'


def case_mehr(b):
    errors = []
    ctx, pg = new_phone(b, errors)
    to_schieber_board(pg)
    R.click(pg, pg.get_by_role("button", name="Menü", exact=True).first, 800)
    check(pg, "Menue", ".gt-hm-dim", content_sel=".gt-hm-panel")
    ok(not errors, f"Menue: keine Seitenfehler {errors[:1]}")
    ctx.close()


def case_regeln(b):
    errors = []
    ctx, pg = new_phone(b, errors)
    pg.goto(R.URL)
    R.wait(pg, 900)
    R.open_game(pg, "Schreibunterlagen", "Jass")
    R.click(pg, pg.get_by_text("Schieber", exact=True).first, 800)
    R.click(pg, pg.get_by_role("button", name="Menü", exact=True).first, 700)
    R.click(pg, pg.get_by_role("menuitem", name="Regeln").first, 900)
    check(pg, "Regeln", DLG)
    ok(not errors, f"Regeln: keine Seitenfehler {errors[:1]}")
    ctx.close()


def case_weis(b):
    errors = []
    ctx, pg = new_phone(b, errors)
    to_schieber_board(pg)
    R.click(pg, pg.get_by_role("button", name=re.compile(r"Wyys und Stöck, Team 1")).first, 900)
    check(pg, "Wyys-Dialog", ".gt-weis-ov", content_sel=".gt-weis-ov > div")
    ok(not errors, f"Wyys: keine Seitenfehler {errors[:1]}")
    ctx.close()


def case_pad(b):
    errors = []
    ctx, pg = new_phone(b, errors)
    pg.goto(R.URL)
    R.wait(pg, 900)
    R.open_game(pg, "Schreibunterlagen", "Skyjo")
    R.click(pg, R.btn(pg, "Spiel starten").first, 900)
    R.skyjo_pick_ender(pg, None)
    R.click(pg, pg.get_by_role("button", name="Karten einzeln eingeben").first, 800)
    check(pg, "Skyjo-Raster-Blatt", ".sk-ov", content_sel=".sk-sheet")
    ok(not errors, f"Skyjo: keine Seitenfehler {errors[:1]}")
    ctx.close()


def case_flip7(b):
    errors = []
    ctx, pg = new_phone(b, errors)
    pg.goto(R.URL)
    R.wait(pg, 900)
    R.open_game(pg, "Schreibunterlagen", "Flip 7")
    R.click(pg, R.btn(pg, "Spiel starten").first, 900)
    R.flip7_round(pg, [[3], [4]])
    R.click(pg, pg.get_by_role("tab", name="Tabelle").first, 600)
    trig = pg.locator(".f7-cell").first
    R.click(pg, trig, 800)
    check(pg, "Flip7-Bearbeiten (unverändert)", ".f7-ov", content_sel=".f7-sheet")
    R.click(pg, trig, 800)
    pg.locator(".f7-sheet .f7-grid button", has_text=re.compile("^7$")).first.click()
    R.wait(pg, 300)
    pts = points(pg, ".f7-sheet")
    pg.mouse.click(pts["outside"][0], pts["outside"][1])
    R.wait(pg, 700)
    ok(not gone(pg, ".f7-ov"), "Flip7-Bearbeiten mit Änderung: Tippen ausserhalb schliesst nicht")
    ok(not errors, f"Flip7: keine Seitenfehler {errors[:1]}")
    ctx.close()


def case_turnier(b):
    errors = []
    ctx, pg = new_phone(b, errors)
    pg.goto(R.URL)
    R.wait(pg, 900)
    R.open_game(pg, "Schreibunterlagen", "Jass")
    R.click(pg, pg.get_by_text("Schieber-Turnier").first, 900)
    R.click(pg, R.btn(pg, "Turnier anlegen").first, 900)
    R.click(pg, pg.get_by_role("button", name="Turniermenü").first, 800)
    check(pg, "Turniermenue", ".gtst-ovl", content_sel=".gtst-sheet")
    ok(not errors, f"Turnier: keine Seitenfehler {errors[:1]}")
    ctx.close()


def case_podium(b):
    errors = []
    ctx, pg = new_phone(b, errors)
    A.flow_freeplay(pg)
    R.wait(pg, 4500)
    check(pg, "Siegerpodest", "[data-gt-podium]", content_sel="[data-gt-podium]")
    ok(not errors, f"Podest: keine Seitenfehler {errors[:1]}")
    ctx.close()


def case_vorschau(b):
    for touch in (False, True):
        errors = []
        ctx, pg = new_phone(b, errors, touch=touch)
        tag = "Touch" if touch else "Maus"
        A.flow_freeplay(pg)
        R.wait(pg, 4500)
        R.click(pg, pg.get_by_role("button", name=re.compile(r"Bild teilen")).first, 500)
        pg.locator(".gtsp-ov img").first.wait_for(timeout=20000)
        R.wait(pg, 700)
        check(pg, f"Bildvorschau ({tag})", ".gtsp-ov", touch=touch, still="[data-gt-podium]", content_sel=".gtsp-imgs")
        # Vorschau nochmal, Hinweistext und Knopf-Zwischenraum duerfen nicht schliessen
        ok(not errors, f"Vorschau ({tag}): keine Seitenfehler {errors[:1]}")
        ctx.close()
    # Laptop: Flaeche rund um das Bild
    errors = []
    ctx, pg = R.new_page(b, 1280, 800, "Laptop", errors)
    A.flow_freeplay(pg)
    R.wait(pg, 4500)
    R.click(pg, pg.get_by_role("button", name=re.compile(r"Bild teilen")).first, 500)
    pg.locator(".gtsp-ov img").first.wait_for(timeout=20000)
    R.wait(pg, 700)
    check(pg, "Bildvorschau (Laptop)", ".gtsp-ov", still="[data-gt-podium]", content_sel=".gtsp-imgs")
    ctx.close()


def case_tafel(b):
    errors = []
    ctx, pg = R.new_page(b, 1280, 800, "Laptop", errors)
    R.open_game(pg, "Schreibunterlagen", "Jass", "Schieber-Turnier")
    inp = pg.get_by_placeholder("Name eingeben")
    for n in ["Anna", "Ben", "Cora", "Dino"]:
        inp.fill(n)
        pg.keyboard.press("Enter")
        R.wait(pg, 300)
    R.click(pg, R.btn(pg, "Turnier anlegen"), 1200)
    R.click(pg, pg.get_by_role("button", name=re.compile("Turniermenü")).first, 700)
    R.click(pg, pg.get_by_role("button", name=re.compile("Exportieren|als Bild", re.I)).first, 900)
    cand = pg.get_by_role("button", name=re.compile("Bild", re.I))
    if pg.locator(".gtstx-panel").count() == 0 and cand.count():
        R.click(pg, cand.first, 900)
    pg.locator(".gtstx-pages img").first.wait_for(timeout=20000)
    R.wait(pg, 500)
    check(pg, "Turnier-Export", ".gtstx-ov", content_sel=".gtstx-panel", wait=600)
    ok(not errors, f"Turnier-Export: keine Seitenfehler {errors[:1]}")
    ctx.close()


def case_amehesten(b):
    errors = []
    ctx, pg = new_phone(b, errors)
    A.flow_amehesten(pg)
    R.wait(pg, 1500)
    check(pg, "Am ehesten Endstand", "[data-ml-result-panel]", content_sel="[data-ml-result-panel]")
    ok(not errors, f"Am ehesten: keine Seitenfehler {errors[:1]}")
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
        R.click(pg, rv.first, 900)
        check(pg, "Jahresrueckblick", ".gtYR", content_sel=".gtYR-card")
    ok(not errors, f"Jahresrueckblick: keine Seitenfehler {errors[:1]}")
    ctx.close()


CASES = {"mehr": case_mehr, "regeln": case_regeln, "weis": case_weis, "pad": case_pad, "flip7": case_flip7,
         "turnier": case_turnier, "podium": case_podium, "vorschau": case_vorschau, "tafel": case_tafel,
         "amehesten": case_amehesten, "jahr": case_jahr}


def main():
    only = sys.argv[sys.argv.index("--only") + 1].split(",") if "--only" in sys.argv else None
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
