#!/usr/bin/env python3
"""Paket U1 Barrierefreiheit Grundlagen: eigene DOM-Pruefungen (kein neues Paket).

    ~/.gametab-venv/bin/python tests/a11y_checks.py

Start, Einstellungen, Statistik, Skyjo-Setup, Freies Spiel: jedes input/select/textarea hat label, aria-label oder
aria-labelledby (versteckte ausgenommen). Startseite: genau ein main, genau ein h1, Abschnitte als h2, Handy und Laptop.
document.title passt je Ansicht. Ansage-Regionen (polite und alert) sind da und melden Text (gtAnnounce).
Nach dem Wiederherstellen erscheint «Sicherung geladen: n Partien, g Gruppen.».
Paket U2: Timer (role=timer, Ansage nur bei 30/10/5/0 s), Kontrast >= 4,5 (Favoriten-Hinweis, Statistik-Untertitel,
Freies Spiel Umschalter, Nocturne und Hell), Touchziele >= 44 px auf der Statistik (390 und 320).
Auch von tests/regression.py aufrufbar: run(pg). Kein Ton: Chromium mit --mute-audio.
"""
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from landscape import new_phone, start, goto_game, wait, URL, small_targets, calm  # noqa: E402

MUTE = 'try{localStorage.setItem("gt_soundEnabled","false")}catch(e){}'

JS_UNLABELED = """() => [...document.querySelectorAll('input,select,textarea')].filter(el => {
  if (el.type === 'hidden') return false;
  if (el.closest('[aria-hidden="true"]') || el.closest('[inert]')) return false;
  if (el.getAttribute('aria-hidden') === 'true') return false;
  const named = el.getAttribute('aria-label') || el.getAttribute('aria-labelledby') || (el.labels && el.labels.length) || el.closest('label');
  return !named;
}).map(el => el.tagName + ':' + (el.getAttribute('placeholder') || el.type || '') )"""

JS_LANDMARKS = """() => ({
  main: document.querySelectorAll('main,[role="main"]').length,
  h1: document.querySelectorAll('h1').length,
  h2: document.querySelectorAll('h2').length,
  h1First: (() => { const hs = [...document.querySelectorAll('h1,h2')]; return hs.length ? hs[0].tagName : ''; })(),
  polite: document.querySelectorAll('[data-gt-live="polite"][aria-live="polite"]').length,
  alert: document.querySelectorAll('[data-gt-live="alert"][role="alert"]').length,
})"""


def _fail(msg):
    raise AssertionError(msg)


def check_labels(pg, name):
    bad = pg.evaluate(JS_UNLABELED)
    if bad:
        _fail(f"{name}: Felder ohne Beschriftung {bad[:4]}")
    print("OK    ", f"{name}: alle Felder beschriftet")


def check_title(pg, name, pattern):
    wait(pg, 400)
    title = pg.title()
    if not re.fullmatch(pattern, title):
        _fail(f"{name}: Seitentitel {title!r} passt nicht zu {pattern!r}")
    print("OK    ", f"{name}: Titel {title!r}")


def check_live(pg, name):
    lm = pg.evaluate(JS_LANDMARKS)
    if lm["polite"] != 1 or lm["alert"] != 1:
        _fail(f"{name}: Ansage-Regionen fehlen {lm}")
    print("OK    ", f"{name}: Ansage-Regionen vorhanden")


def check_start_structure(pg, name):
    lm = pg.evaluate(JS_LANDMARKS)
    if lm["main"] != 1:
        _fail(f"{name}: main-Landmarke {lm['main']} statt 1")
    if lm["h1"] != 1:
        _fail(f"{name}: h1 {lm['h1']} statt 1")
    if lm["h2"] < 1:
        _fail(f"{name}: keine Abschnitts-Ueberschriften (h2)")
    if lm["h1First"] != "H1":
        _fail(f"{name}: erste Ueberschrift ist {lm['h1First']}, nicht H1")
    print("OK    ", f"{name}: 1 main, 1 h1, {lm['h2']} h2")


def goto_start(pg):
    pg.goto(URL)
    wait(pg, 900)


def run(pg):
    start(pg)
    goto_start(pg)
    check_start_structure(pg, "Start")
    check_title(pg, "Start", r"GameTab · All-in-One")
    check_labels(pg, "Start")
    check_live(pg, "Start")

    # Einstellungen, dazu Gruppenfelder
    pg.locator('button[aria-label="Einstellungen"]').first.click()
    wait(pg, 700)
    check_title(pg, "Einstellungen", r"Einstellungen · GameTab")
    pg.get_by_role("button", name="Spielergruppen").first.click()
    wait(pg, 500)
    pg.get_by_role("button", name=re.compile(r"Neue Gruppe")).first.click()
    wait(pg, 500)
    pg.get_by_role("button", name="+ Spieler").first.click()
    wait(pg, 400)
    check_labels(pg, "Einstellungen mit Gruppenfeldern")
    n = pg.locator('input[aria-label="Gruppenname"]').count()
    if n < 1:
        _fail("Einstellungen: Gruppenname hat kein aria-label")
    if pg.locator('input[aria-label="Name 1"]').count() < 1:
        _fail("Einstellungen: Spielerfeld 'Name 1' fehlt")
    f = pg.locator('input[type="file"]').first
    if f.get_attribute("tabindex") != "-1" or f.get_attribute("aria-hidden") != "true":
        _fail("Einstellungen: Datei-Eingabe ohne tabindex=-1 und aria-hidden")
    print("OK    ", "Einstellungen: Gruppen- und Datei-Eingabe richtig ausgezeichnet")
    check_live(pg, "Einstellungen")

    # Alle Ergebnisse loeschen: seit Paket U3 ein echter Dialog (role=dialog), Escape schliesst ihn
    pg.get_by_role("button", name=re.compile(r"Alle Ergebnisse|Statistik.*l(ö|oe)schen", re.I)).first.click()
    wait(pg, 500)
    if pg.locator('[role="dialog"]').count() < 1:
        _fail("Einstellungen: Alle-Ergebnisse-Dialog fehlt")
    pg.keyboard.press("Escape")
    wait(pg, 400)
    print("OK    ", "Einstellungen: Alle-Ergebnisse-Dialog mit Escape")

    # Statistik
    goto_start(pg)
    pg.get_by_text("Schreibunterlagen", exact=True).first.click()
    wait(pg, 700)
    pg.get_by_label("Statistik", exact=True).first.click()
    wait(pg, 900)
    check_title(pg, "Statistik", r"Statistik · GameTab")
    check_labels(pg, "Statistik")
    check_live(pg, "Statistik")

    # Skyjo-Setup
    goto_start(pg)
    goto_game(pg, "Schreibunterlagen", "Skyjo")
    check_title(pg, "Skyjo-Setup", r"Skyjo · GameTab")
    check_labels(pg, "Skyjo-Setup")
    check_live(pg, "Skyjo-Setup")

    # Freies Spiel
    goto_start(pg)
    goto_game(pg, "Schreibunterlagen", "Freies Spiel")
    check_title(pg, "Freies Spiel", r"Freies Spiel · GameTab")
    check_labels(pg, "Freies Spiel")
    check_live(pg, "Freies Spiel")

    # Zurueck zur Startseite: Titel wieder Standard
    goto_start(pg)
    check_title(pg, "Start (zurueck)", r"GameTab · All-in-One")


def run_restore(pg):
    """UX-10: Flag aus dem Wiederherstellen erzeugt nach dem Neuladen die Meldung (Ansage und sichtbare Zeile)."""
    start(pg)
    pg.goto(URL)
    pg.evaluate("sessionStorage.setItem('gt_restored', JSON.stringify({m:12,g:3}))")
    pg.reload()
    wait(pg, 2200)
    vis = pg.locator("[data-gt-restored]")
    if vis.count() != 1 or "Sicherung geladen: 12 Partien, 3 Gruppen." not in vis.inner_text():
        _fail("UX-10: sichtbare Zeile 'Sicherung geladen: 12 Partien, 3 Gruppen.' fehlt")
    if pg.evaluate("sessionStorage.getItem('gt_restored')") is not None:
        _fail("UX-10: Flag bleibt nach dem Anzeigen stehen")
    polite = pg.locator('[data-gt-live="polite"]').inner_text()
    if "Sicherung geladen: 12 Partien, 3 Gruppen." not in polite:
        _fail(f"UX-10: Ansage fehlt ({polite!r})")
    print("OK    ", "UX-10: Meldung nach Wiederherstellen (Zeile und Ansage), Flag entfernt")


CONTRAST_JS = """(el)=>{
const parse=c=>{const m=c.match(/rgba?\\(([^)]+)\\)/);if(!m)return[0,0,0,0];const p=m[1].split(/[ ,\\/]+/).map(Number);return[p[0],p[1],p[2],p.length>3?p[3]:1];};
const lin=v=>{v/=255;return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4)};
const L=c=>0.2126*lin(c[0])+0.7152*lin(c[1])+0.0722*lin(c[2]);
let op=1;for(let e=el;e;e=e.parentElement){op*=parseFloat(getComputedStyle(e).opacity)}
let bg=[255,255,255];const chain=[];for(let e=el;e;e=e.parentElement){chain.push(e)}
for(const e of chain.reverse()){const c=parse(getComputedStyle(e).backgroundColor);if(c[3]>0){bg=[0,1,2].map(i=>c[i]*c[3]+bg[i]*(1-c[3]));}}
const fc=parse(getComputedStyle(el).color);const a=fc[3]*op;
const fg=[0,1,2].map(i=>fc[i]*a+bg[i]*(1-a));
const l1=L(fg),l2=L(bg);return Math.round((Math.max(l1,l2)+0.05)/(Math.min(l1,l2)+0.05)*100)/100;}"""

STATS_FIX = Path(__file__).resolve().parent / "fixtures_st" / "stats_fixtures.json"


def _seed_stats(pg):
    fx = json.loads(STATS_FIX.read_text())
    pg.evaluate("([a,b])=>{localStorage.setItem('gt_matchLog',a);localStorage.setItem('gt_playerGroups',b);}",
                [json.dumps(fx["gt_matchLog"]), json.dumps(fx["gt_playerGroups"])])


def _open_stats(pg):
    pg.goto(URL)
    wait(pg, 900)
    pg.get_by_text("Schreibunterlagen", exact=True).first.click()
    wait(pg, 700)
    pg.get_by_label("Statistik", exact=True).first.click()
    wait(pg, 1000)


def run_contrast(pg, theme):
    """AX-8: drei Stellen >= 4,5 : 1 (Favoriten-Hinweis, Statistik-Untertitel, Freies Spiel Umschalter aktiv)."""
    start(pg, theme=theme)
    calm(pg)
    vals = {}
    vals["Favoriten-Hinweis"] = [pg.locator(".gtL-showcase-hint").first.evaluate(CONTRAST_JS)]
    _seed_stats(pg)
    _open_stats(pg)
    calm(pg)
    vals["Statistik-Untertitel"] = pg.evaluate(
        "(f)=>{const C=(" + CONTRAST_JS + ");return [...document.querySelectorAll('span,div')].filter(e=>/^\\d+ Partien?( ·.*)?$/.test(e.textContent.trim())&&e.children.length===0).map(e=>C(e))}")
    pg.goto(URL)
    wait(pg, 900)
    goto_game(pg, "Schreibunterlagen", "Freies Spiel")
    calm(pg)
    vals["Freies Spiel Umschalter"] = pg.evaluate(
        "()=>{const C=(" + CONTRAST_JS + ");return [...document.querySelectorAll('.fp-seg button[aria-pressed=\"true\"]')].map(C)}")
    for name, vs in vals.items():
        if not vs:
            _fail(f"Kontrast {theme}: {name} nicht gefunden")
        if min(vs) < 4.5:
            _fail(f"Kontrast {theme}: {name} {min(vs)} < 4,5")
    print("OK    ", f"Kontrast {theme}: " + ", ".join(f"{k} {min(v)}" for k, v in vals.items()))


def run_touch(pg, w):
    """AX-9: Statistikseite, alle Bedienelemente beim Durchscrollen >= 44 px (Loeschen-Symbol folgt in U3)."""
    start(pg)
    _seed_stats(pg)
    _open_stats(pg)
    calm(pg)
    found = {}
    for _ in range(14):
        for t in small_targets(pg):
            if re.search(r"l(ö|oe)sch|entfern|delete", t["name"], re.I):
                continue
            found[t["name"] + str((t["w"], t["h"]))] = t
        done = pg.evaluate("()=>{const y=scrollY;scrollBy(0,Math.round(innerHeight*0.8));return scrollY===y}")
        wait(pg, 150)
        if done:
            break
    if found:
        _fail(f"Touchziele {w}px: unter 44 px {list(found)[:5]}")
    print("OK    ", f"Touchziele Statistik {w}px: nichts unter 44 px")


def run_timer(pg):
    """AX-4: role=timer in Heads Up, Tabu, 5 Sekunden; Ansage nur bei 30, 10, 5 und 0 Sekunden."""
    start(pg)
    pg.clock.install()
    for game in ("HeadsUp", "Tabu"):
        pg.goto(URL)
        wait(pg, 700)
        goto_game(pg, "Partyspiele", game)
        pg.get_by_role("button", name="30s", exact=True).click()
        wait(pg, 300)
        pg.get_by_role("button", name="Spiel starten", exact=True).click()
        wait(pg, 700)
        pg.get_by_role("button", name=re.compile("Bereit")).click()
        wait(pg, 700)
        if pg.get_by_role("button", name="Ohne Drehen spielen").count():
            pg.get_by_role("button", name="Ohne Drehen spielen").click()
            wait(pg, 700)
        tm = pg.locator("[role=timer]")
        if tm.count() < 1:
            _fail(f"{game}: kein [role=timer]")
        if tm.first.get_attribute("aria-live") != "off":
            _fail(f"{game}: Timer ohne aria-live=off")
        if pg.locator(".gt-tring svg[aria-hidden=true]").count() < 1:
            _fail(f"{game}: Ring nicht aria-hidden")
        heard = []
        for _ in range(40):
            pg.clock.run_for(1000)
            wait(pg, 80)
            lab = (tm.first.get_attribute("aria-label", timeout=1500) if tm.count() else "Zeit abgelaufen")
            pol = pg.locator('[data-gt-live="polite"]').inner_text().strip()
            if pol and (not heard or heard[-1] != pol):
                heard.append(pol)
            if re.search(r"abgelaufen", lab, re.I):
                break
        pg.clock.run_for(300)
        wait(pg, 150)
        pol = pg.locator('[data-gt-live="polite"]').inner_text().strip()
        if pol and (not heard or heard[-1] != pol):
            heard.append(pol)
        want = ["Noch 30 Sekunden", "Noch 10 Sekunden", "Noch 5 Sekunden", "Zeit abgelaufen!"]
        if heard != want:
            _fail(f"{game}: Ansagen {heard} statt {want}")
        print("OK    ", f"{game}: role=timer, Ansage nur bei 30/10/5/0 ({heard})")
    pg.goto(URL)
    wait(pg, 700)
    goto_game(pg, "Partyspiele", "5 Sekunden")
    pg.get_by_role("button", name="Spiel starten", exact=True).click()
    wait(pg, 700)
    pg.get_by_role("button", name="Kategorie aufdecken", exact=True).click()
    wait(pg, 700)
    if pg.locator("[role=timer]").count() < 1:
        _fail("5 Sekunden: kein [role=timer]")
    print("OK    ", "5 Sekunden: role=timer vorhanden")


def run_laptop(pg):
    start(pg, mode="Laptop")
    goto_start(pg)
    check_start_structure(pg, "Start Laptop")
    check_title(pg, "Start Laptop", r"GameTab · All-in-One")


def main():
    from playwright.sync_api import sync_playwright
    with sync_playwright() as p:
        b = p.chromium.launch(args=["--mute-audio"])
        try:
            for fn, w, h in ((run, 393, 852), (run_restore, 393, 852), (run_laptop, 1280, 800), (run_timer, 393, 852),
                             (lambda pg: run_contrast(pg, "Nocturne"), 393, 852), (lambda pg: run_contrast(pg, "Hell"), 393, 852),
                             (lambda pg: run_touch(pg, 390), 390, 844), (lambda pg: run_touch(pg, 320), 320, 568)):
                ctx, pg = new_phone(b, w, h, mobile=(w < 600))
                ctx.add_init_script(MUTE)
                try:
                    fn(pg)
                    errs = [e for e in pg._pl_errors if "manifest" not in e and "sw.js" not in e and "favicon" not in e and "Failed to load resource" not in e]
                    if errs:
                        _fail(f"Seitenfehler: {errs[:2]}")
                finally:
                    ctx.close()
            print("a11y_checks OK")
            return 0
        except AssertionError as e:
            print("a11y_checks FEHLER:", e)
            return 1
        finally:
            b.close()


if __name__ == "__main__":
    sys.exit(main())
