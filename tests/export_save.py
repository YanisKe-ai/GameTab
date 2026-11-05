#!/usr/bin/env python3
"""Bildexport: Speichern und Teilen in der Vorschau, je Geraet.
Aufruf: GAMETAB_HTML=docs/index.html $VENV tests/export_save.py [chromium|webkit|all]
Teilen ist ein Testdouble (headless gibt es kein Teilen-Blatt), Geraete sind per User-Agent nachgestellt.
"""
import os, re, sys
os.environ.setdefault("GAMETAB_HTML", "docs/index.html")
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import regression as R  # noqa: E402
import ergebnisbild_app as A  # noqa: E402
from playwright.sync_api import sync_playwright  # noqa: E402

OUT = R.ROOT / "tests" / "out" / "export"
OUT.mkdir(parents=True, exist_ok=True)
MOCK = """(fail)=>{const d=(k,v)=>Object.defineProperty(navigator,k,{value:v,configurable:true});
d('canShare',()=>true);d('share',async x=>{window.__sh=(x.files||[]).map(f=>f.name+':'+f.size);if(fail){const e=new Error('x');e.name='NotAllowedError';throw e;}});}"""
IOS = "()=>Object.defineProperty(navigator,'userAgent',{value:'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1',configurable:true})"


def open_preview(pg):
    R.wait(pg, 4000)
    R.click(pg, pg.get_by_role("button", name=re.compile(r"Bild teilen")).first, 500)
    pg.locator(".gtsp-ov img").first.wait_for(timeout=20000)
    R.wait(pg, 400)


def names(pg):
    return [x.strip() for x in pg.locator(".gtsp-ov button").all_inner_texts() if x.strip() and x.strip() != "✕"]


def case(b, eng, tag, w, h, mode, prep, body):
    errors = []
    ctx, pg = R.new_page(b, w, h, mode, errors)
    try:
        A.flow_freeplay(pg)
        prep(pg)
        open_preview(pg)
        body(pg)
        pg.screenshot(path=str(OUT / f"{eng}_{tag}.png"))
        R.check(not errors, f"Fehler: {errors[:2]}")
        print("OK    ", eng, tag)
        return 0
    except Exception as e:  # noqa: BLE001
        print("FEHLER", eng, tag, str(e)[:300])
        pg.screenshot(path=str(OUT / f"{eng}_{tag}_fehler.png"))
        return 1
    finally:
        ctx.close()


def laptop(pg):
    R.check(names(pg) == ["Bild speichern"], f"Knoepfe {names(pg)}")
    with pg.expect_download(timeout=8000) as d:
        pg.get_by_role("button", name="Bild speichern").click()
    f = d.value
    R.check(f.suggested_filename == "gametab-ergebnis.png", f.suggested_filename)
    raw = open(f.path(), "rb").read()
    R.check(raw[:8] == b"\x89PNG\r\n\x1a\n" and len(raw) > 20000, f"keine PNG-Datei, {len(raw)} Bytes")
    R.check(pg.get_by_text("Gespeichert im Ordner Downloads.").count() == 1, "Bestaetigung fehlt")
    pg.keyboard.press("Escape"); R.wait(pg, 300)
    R.check(pg.locator(".gtsp-ov").count() == 0, "Escape schliesst nicht")


def mac_share(pg):
    R.check(names(pg) == ["Bild speichern", "Bild teilen"], f"Knoepfe {names(pg)}")
    pg.locator(".gtsp-ov").get_by_role("button", name="Bild teilen").click(); R.wait(pg, 300)
    R.check(bool(pg.evaluate("window.__sh")), "Teilen nicht aufgerufen")


def iphone(pg):
    R.check(names(pg) == ["Sichern oder teilen"], f"Knoepfe {names(pg)}")
    R.check(pg.get_by_text("In Dateien sichern").count() == 1, "Hinweis fehlt")
    pg.get_by_role("button", name="Sichern oder teilen").click(); R.wait(pg, 300)
    sh = pg.evaluate("window.__sh")
    R.check(bool(sh) and sh[0].startswith("gametab-ergebnis.png:"), f"Teilen {sh}")


def iphone_fail(pg):
    pg.get_by_role("button", name="Sichern oder teilen").click(); R.wait(pg, 300)
    R.check("Bild speichern" in names(pg), f"kein Ausweg, {names(pg)}")
    R.check(pg.locator(".gtsp-ov p").filter(has_text="gedrückt halten").count() == 1, f"Hinweis fehlt: {pg.locator('.gtsp-ov p').all_inner_texts()}")


def to_stats(pg):
    pg.goto(R.URL); R.wait(pg, 900)
    if pg.viewport_size["width"] < 768:
        R.click(pg, pg.get_by_text("Schreibunterlagen", exact=True).first, 700)
    R.click(pg, pg.get_by_text(re.compile(r"Statistik", re.I)).first, 900)


def save_png(pg, scope, label):
    with pg.expect_download(timeout=8000) as d:
        scope.get_by_role("button", name=label).first.click()
    raw = open(d.value.path(), "rb").read()
    R.check(raw[:4] == b"\x89PNG", "keine PNG-Datei")
    return d.value.suggested_filename


def extra_stats(b, eng):
    errors = []
    ctx, pg = R.new_page(b, 1280, 800, "Laptop", errors)
    bad = 0
    try:
        A.flow_freeplay(pg)
        to_stats(pg)
        rv = pg.get_by_role("button", name=re.compile(r"Rückblick|Jahresrück|Dein Jahr|Karten", re.I))
        R.check(rv.count() > 0, "Rueckblick-Knopf fehlt")
        R.click(pg, rv.first, 900)
        for _ in range(30):
            sh = pg.locator(".gtYR").get_by_role("button", name=re.compile(r"Als Bilder teilen"))
            if sh.count():
                break
            pg.keyboard.press("ArrowRight"); R.wait(pg, 120)
        R.click(pg, sh.first, 500)
        pg.locator(".gtsp-ov img").first.wait_for(timeout=20000); R.wait(pg, 400)
        pg.screenshot(path=str(OUT / f"{eng}_rueckblick.png"))
        n = save_png(pg, pg.locator(".gtsp-ov"), re.compile(r"speichern"))
        print("OK    ", eng, "rueckblick", n)
        pg.keyboard.press("Escape"); R.wait(pg, 300)
        R.check(pg.locator(".gtYR").count() == 1, "Escape schliesst auch den Rueckblick")
        pg.keyboard.press("Escape"); R.wait(pg, 500)
        R.click(pg, pg.get_by_text("Spieler 1", exact=True).first, 1000)
        R.click(pg, pg.get_by_role("button", name=re.compile(r"Als Bild teilen")).first, 500)
        pg.locator(".gtsp-ov img").first.wait_for(timeout=20000)
        n = save_png(pg, pg.locator(".gtsp-ov"), "Bild speichern")
        pg.screenshot(path=str(OUT / f"{eng}_statistik.png"))
        R.check(not errors, f"Fehler: {errors[:2]}")
        print("OK    ", eng, "statistik", n)
    except Exception as e:  # noqa: BLE001
        bad = 1
        print("FEHLER", eng, "statistik/rueckblick", str(e)[:300])
        pg.screenshot(path=str(OUT / f"{eng}_statistik_fehler.png"))
    ctx.close()
    return bad


def extra_tournament(b, eng):
    errors = []
    ctx, pg = R.new_page(b, 1280, 800, "Laptop", errors)
    bad = 0
    try:
        R.open_game(pg, "Schreibunterlagen", "Jass", "Schieber-Turnier")
        inp = pg.get_by_placeholder("Name eingeben")
        for n in ["Anna", "Ben", "Cora", "Dino"]:
            inp.fill(n); pg.keyboard.press("Enter"); R.wait(pg, 300)
        R.click(pg, R.btn(pg, "Turnier anlegen"), 1200)
        R.click(pg, pg.get_by_role("button", name=re.compile("Turniermenü")).first, 700)
        R.click(pg, pg.get_by_role("button", name=re.compile("Exportieren|als Bild", re.I)).first, 900)
        cand = pg.get_by_role("button", name=re.compile("Bild", re.I))
        if pg.locator(".gtstx-panel").count() == 0 and cand.count():
            R.click(pg, cand.first, 900)
        pg.locator(".gtstx-pages img").first.wait_for(timeout=20000); R.wait(pg, 400)
        n = save_png(pg, pg.locator(".gtstx-foot"), re.compile(r"speichern"))
        R.check(pg.locator(".gtstx-foot").get_by_text("Gespeichert im Ordner Downloads.").count() == 1, "Bestaetigung fehlt")
        pg.screenshot(path=str(OUT / f"{eng}_turnier.png"))
        R.check(not errors, f"Fehler: {errors[:2]}")
        print("OK    ", eng, "turnier", n)
    except Exception as e:  # noqa: BLE001
        bad = 1
        print("FEHLER", eng, "turnier", str(e)[:300])
        pg.screenshot(path=str(OUT / f"{eng}_turnier_fehler.png"))
    ctx.close()
    return bad


def main():
    args = sys.argv[1:]
    engs = ["chromium", "webkit"] if "all" in args else [a for a in args if a in ("chromium", "webkit")] or ["chromium"]
    bad = 0
    with sync_playwright() as p:
        for eng in engs:
            b = A.launch(p, eng)
            A.CUR["eng"] = eng
            none = lambda pg: None
            if "--extra" not in args: bad += case(b, eng, "laptop", 1280, 800, "Laptop", none, laptop)
            if "--extra" not in args: bad += case(b, eng, "mac_handyansicht", 1280, 800, "Handy", none, laptop)
            if "--extra" not in args: bad += case(b, eng, "mac_teilen", 1512, 982, "Laptop", lambda pg: pg.evaluate(MOCK, False), mac_share)
            if "--extra" not in args: bad += case(b, eng, "iphone", 393, 852, "Handy", lambda pg: (pg.evaluate(MOCK, False), pg.evaluate(IOS)), iphone)
            if "--extra" not in args: bad += case(b, eng, "iphone_teilen_fehlt", 393, 852, "Handy", lambda pg: (pg.evaluate(MOCK, True), pg.evaluate(IOS)), iphone_fail)
            bad += extra_stats(b, eng)
            bad += extra_tournament(b, eng)
            b.close()
    print(f"\n{bad} Fehler")
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main())
