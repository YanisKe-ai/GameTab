#!/usr/bin/env python3
"""Paket SD: neue Statistik (Entwurf 1 «Tabelle»).

    ~/.gametab-venv/bin/python tests/t_sd.py

Chromium immer stumm (--mute-audio), Ton in der App aus (gt_soundEnabled=false). Auch von tests/regression.py
aufrufbar: run(pg) legt eigene Kontexte an (pg.context.browser). Screenshots: Umgebungsvariable GT_SD_SHOTS=<Ordner>.
Daten: 12 Partien an 3 Abenden (Anna, Ben, Cleo, Dani; 3 Spiele; ein geteilter Sieg von Cleo und Dani).
Erwartet: Anna 5 Siege aus 12, Cleo 3 aus 11 (davon 1 geteilt), Ben 3 aus 12, Dani 2 aus 8 (davon 1 geteilt).
"""
import json
import os
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from landscape import new_phone, start, wait, URL, overflow_x, small_targets  # noqa: E402

SHOTS = os.environ.get("GT_SD_SHOTS")
MUTE = "try{localStorage.setItem('gt_soundEnabled','false')}catch(e){}"


def _ts(day, hour, minute=0):
    return int(datetime(2026, day[0], day[1], hour, minute, tzinfo=timezone.utc).timestamp() * 1000)


def _m(i, ts, game, ps, winners):
    """ps = Liste Namen, winners = Namen auf Rang 1."""
    return {"id": f"sd_{i}", "ts": ts, "game": game, "status": "done", "lowWins": game == "skyjo",
            "participants": [{"name": n, "norm": n.lower(), "score": 10 - k, "rank": 1 if n in winners else 2} for k, n in enumerate(ps)],
            "winner": winners[0], **({"winners": winners} if len(winners) > 1 else {})}


def log12():
    nights = [(10, 24), (11, 7), (11, 10)]
    games = ["skyjo", "skyjo", "yatzy", "yatzy", "skyjo", "freeplay", "freeplay", "yatzy", "skyjo", "skyjo", "yatzy", "freeplay"]
    wins = [["Anna"], ["Anna"], ["Ben"], ["Cleo"], ["Anna"], ["Ben"], ["Cleo", "Dani"], ["Dani"], ["Anna"], ["Ben"], ["Cleo"], ["Anna"]]
    out = []
    for i in range(12):
        ps = ["Anna", "Ben", "Cleo", "Dani"]
        if i in (0, 1, 2, 4):
            ps.remove("Dani")
        if i == 8:
            ps.remove("Cleo")
        d = nights[i // 4]
        out.append(_m(i, _ts(d, 18 + i % 4), games[i], ps, wins[i]))
    return out


NAMES15 = ["Anna", "Ben", "Cleo", "Dani", "Eva", "Finn", "Gina", "Hugo", "Ida", "Jonas", "Kira", "Leon", "Mia", "Nico", "Olga"]


def log15():
    out = []
    for i in range(15):
        ps = [NAMES15[(i + k) % 15] for k in range(5)]
        out.append(_m(i, _ts((11, 1 + i % 9), 18, i), "freeplay", ps, [ps[0]]))
    return out


def log_low():
    return [_m(0, _ts((11, 10), 18), "freeplay", ["Anna", "Ben"], ["Anna"]), _m(1, _ts((11, 10), 19), "freeplay", ["Anna", "Ben"], ["Anna"])]


def log_one():
    return [_m(0, _ts((11, 10), 18), "freeplay", ["Anna", "Ben"], ["Anna"])]


def _ctx(b, log, theme="Nocturne", w=393, h=852, mode="Handy", mobile=True):
    ctx, pg = new_phone(b, w, h, mobile=mobile)
    ctx.add_init_script(MUTE)
    start(pg, theme=theme, mode=mode)
    seed(pg, log)
    return ctx, pg


def seed(pg, log):
    pg.evaluate("([k,v])=>{localStorage.setItem(k,v);localStorage.setItem('gt_soundEnabled','false');localStorage.setItem('gametab-onboarded','1')}",
                ["gt_matchLog", json.dumps(log)])
    pg.goto(URL)
    wait(pg, 1000)


def open_stats(pg):
    pg.get_by_text("Schreibunterlagen", exact=True).first.click()
    wait(pg, 800)
    pg.get_by_label("Statistik", exact=True).first.click()
    wait(pg, 1200)


def shot(pg, name):
    if SHOTS:
        Path(SHOTS).mkdir(parents=True, exist_ok=True)
        pg.screenshot(path=str(Path(SHOTS) / name))


def full_shot(pg, name):
    """Ganze Seite (auch wenn sie in .gtL-content scrollt): Fenster hoch genug stellen."""
    if not SHOTS:
        return
    Path(SHOTS).mkdir(parents=True, exist_ok=True)
    pg.screenshot(path=str(Path(SHOTS) / name), full_page=True)


SWEEP_JS = """(C)=>{const f=eval('('+C+')');const out=[];for(const e of document.querySelectorAll('.gtSt2 *')){if(e.children.length||!e.textContent.trim())continue;const r=e.getBoundingClientRect();if(!r.width||!r.height)continue;if(e.closest('option,select,style,script'))continue;const v=f(e);if(v<4.5)out.push((e.textContent.trim().slice(0,30))+' '+v);}return out;}"""


def contrast_sweep(pg, label):
    from a11y_checks import CONTRAST_JS
    bad = pg.evaluate(SWEEP_JS, CONTRAST_JS)
    assert not bad, f"Kontrast < 4,5 ({label}): {bad[:6]}"


def labels(pg):
    return pg.evaluate("[...document.querySelectorAll('ol[aria-label] > li[aria-label]')].map(e=>e.getAttribute('aria-label'))")


def errors(pg):
    return [e for e in pg._pl_errors if "manifest" not in e and "sw.js" not in e and "favicon" not in e and "Failed to load resource" not in e]


def run_main(b):
    ctx, pg = _ctx(b, log12())
    try:
        open_stats(pg)
        shot(pg, "t_sd_393_nocturne.png")
        txt = pg.evaluate("document.body.innerText")
        kp = pg.evaluate("document.querySelector('.gtSt2-kpis').innerText")
        for need in ("12", "3", "Skyjo", "5 Partien", "Partien", "Spielabende", "Lieblingsspiel"):
            assert need in kp, f"Kennzahl fehlt: {need!r} in {kp!r}"
        assert "Anna führt, 5 Siege aus 12 Partien." in txt, "Satz «Anna führt» fehlt"
        want = ["Anna, Platz 1, 5 Siege aus 12 Partien",
                "Cleo, Platz 2, 3 Siege aus 11 Partien, davon 1 geteilt",
                "Ben, Platz 3, 3 Siege aus 12 Partien",
                "Dani, Platz 4, 2 Siege aus 8 Partien, davon 1 geteilt"]
        got = labels(pg)
        assert got == want, f"Rangliste: {got}"
        assert "42 %" in txt and "27 %" in txt, "Prozent fehlen"
        assert "Noch wenig Daten" not in txt, "unerwartet «Noch wenig Daten»"
        assert pg.evaluate("document.querySelectorAll('.gtSt2-pod,[class*=Podium],[data-gt-podium]').length") == 0, "Podest in der Statistik"
        for bad in ("Auffälliges", "Faire Quote", "Rivalität", "vorläufig"):
            assert bad not in txt, f"unerwartet: {bad}"
        # Reiter
        tabs = pg.get_by_role("tab")
        assert tabs.count() == 3, "3 Reiter erwartet"
        assert pg.get_by_role("tab", name="Rangliste").get_attribute("aria-selected") == "true"
        assert pg.get_by_role("tablist").count() == 1 and pg.get_by_role("radiogroup").count() == 1, "tablist/radiogroup"
        assert pg.get_by_role("radio", name="Alles").get_attribute("aria-checked") == "true"
        assert pg.get_by_role("tabpanel").count() == 1
        # Tastatur: Pfeil rechts wechselt den Reiter
        pg.get_by_role("tab", name="Rangliste").focus()
        pg.keyboard.press("ArrowRight")
        wait(pg, 300)
        assert pg.get_by_role("tab", name="Spiele").get_attribute("aria-selected") == "true", "Pfeiltaste wechselt Reiter nicht"
        shot(pg, "t_sd_393_spiele.png")
        rows = pg.locator("button[aria-pressed]")
        assert rows.count() == 3, f"3 Spiele erwartet, {rows.count()}"
        assert "Skyjo" in rows.first.get_attribute("aria-label") and "5 Partien" in rows.first.get_attribute("aria-label"), rows.first.get_attribute("aria-label")
        # Spiel-Zeile filtert
        rows.first.click()
        wait(pg, 500)
        assert pg.get_by_role("tab", name="Rangliste").get_attribute("aria-selected") == "true", "kein Wechsel zur Rangliste"
        kp = pg.evaluate("document.querySelector('.gtSt2-kpis').innerText")
        assert kp.split()[0] == "5" or "5\n" in kp, f"Partien nach Filter: {kp!r}"
        assert "Gefiltert" in pg.evaluate("document.body.innerText"), "Filterzeile fehlt"
        pg.get_by_role("button", name="Zurücksetzen").click()
        wait(pg, 500)
        assert "12" in pg.evaluate("document.querySelector('.gtSt2-kpis').innerText"), "Zurücksetzen wirkt nicht"
        # Personen
        pg.get_by_role("tab", name="Personen").click()
        wait(pg, 500)
        shot(pg, "t_sd_393_personen.png")
        assert pg.locator("input[type=search]").count() == 0, "Suche erst ab 8 Personen"
        pg.get_by_role("button", name=re.compile(r"^Anna")).first.click()
        wait(pg, 900)
        shot(pg, "t_sd_393_profil.png")
        assert pg.locator("h1").first.inner_text().strip().startswith("Anna"), "Profil öffnet nicht"
        pg.get_by_role("button", name="Zurück").first.click()
        wait(pg, 600)
        # Mehr: Dein Jahr, Erfolge
        pg.get_by_role("tab", name="Rangliste").click()
        wait(pg, 400)
        assert pg.locator("[data-gt-year]").count() == 1 and pg.locator("[data-gt-achv-row]").count() == 1, "Mehr-Zeilen fehlen"
        pg.locator("[data-gt-achv-row]").click()
        wait(pg, 700)
        shot(pg, "t_sd_393_erfolge.png")
        assert "Erfolge" in pg.locator("h1").first.inner_text(), "Erfolge-Ansicht fehlt"
        assert pg.locator("[data-gt-achv]").count() > 3, "keine Erfolge sichtbar"
        pg.get_by_role("button", name="Zurück").first.click()
        wait(pg, 500)
        pg.locator("[data-gt-year]").click()
        wait(pg, 900)
        assert pg.get_by_role("dialog").count() >= 1 or "2026" in pg.evaluate("document.body.innerText"), "Jahresrückblick öffnet nicht"
        pg.keyboard.press("Escape")
        assert not errors(pg), errors(pg)
    finally:
        ctx.close()


def run_states(b):
    # wenig Daten (2 Partien): keine Prozente, kein «führt»
    ctx, pg = _ctx(b, log_low())
    try:
        open_stats(pg)
        shot(pg, "t_sd_393_wenig.png")
        txt = pg.evaluate("document.body.innerText")
        assert "Noch wenig Daten" in txt, "«Noch wenig Daten» fehlt bei 2 Partien"
        assert "führt" not in txt, "«führt» bei wenig Daten"
        assert not re.search(r"\d\s?%", txt), "Prozentzahl bei wenig Daten"
        got = labels(pg)
        assert got == ["Anna, 2 Siege aus 2 Partien, noch wenig Daten", "Ben, 0 Siege aus 2 Partien, noch wenig Daten"], got
    finally:
        ctx.close()
    # 1 Partie
    ctx, pg = _ctx(b, log_one())
    try:
        open_stats(pg)
        shot(pg, "t_sd_393_eine.png")
        got = labels(pg)
        assert got and got[0] == "Anna, 1 Sieg aus 1 Partie, noch wenig Daten", got
        kp = pg.evaluate("document.querySelector('.gtSt2-kpis').innerText")
        assert "Noch keins" in kp, f"Lieblingsspiel bei 1 Partie: {kp!r}"
    finally:
        ctx.close()
    # leer
    ctx, pg = _ctx(b, [])
    try:
        open_stats(pg)
        shot(pg, "t_sd_393_leer.png")
        txt = pg.evaluate("document.body.innerText")
        assert "Erste Partie starten" in txt, "Leerzustand ohne Knopf"
        assert pg.locator(".gtSt2-kpis").count() == 0
    finally:
        ctx.close()
    # viele Daten: Top 10 + Alle anzeigen
    ctx, pg = _ctx(b, log15())
    try:
        open_stats(pg)
        shot(pg, "t_sd_393_viele.png")
        assert len(labels(pg)) == 10, f"Top 10 erwartet: {len(labels(pg))}"
        pg.get_by_role("button", name=re.compile(r"Alle anzeigen \(15\)")).click()
        wait(pg, 500)
        assert len(labels(pg)) == 15, "Alle anzeigen zeigt nicht alle"
        pg.get_by_role("tab", name="Personen").click()
        wait(pg, 500)
        assert pg.locator("input[type=search]").count() == 1, "Suche ab 8 Personen fehlt"
        assert not errors(pg), errors(pg)
    finally:
        ctx.close()


def run_layout(b):
    for w, h in ((320, 568), (390, 844), (393, 852)):
        for theme in ("Nocturne", "Hell", "Noir"):
            if theme != "Nocturne" and w != 393:
                continue
            ctx, pg = _ctx(b, log12(), theme=theme, w=w, h=h)
            try:
                open_stats(pg)
                assert overflow_x(pg) == 0, f"Querüberlauf {w} {theme}: {overflow_x(pg)}"
                small = [s for s in small_targets(pg) if s["h"] < 44 or s["w"] < 44]
                assert not small, f"Ziele < 44 px bei {w} {theme}: {small[:5]}"
                if w == 393:
                    for tab in ("Rangliste", "Spiele", "Personen"):
                        pg.get_by_role("tab", name=tab).click()
                        wait(pg, 300)
                        contrast_sweep(pg, f"{theme} {tab}")
                    pg.get_by_role("tab", name="Rangliste").click()
                    wait(pg, 300)
                if SHOTS and w == 393:
                    shot(pg, f"t_sd_393_{theme.lower()}.png")
                if SHOTS and w == 320:
                    shot(pg, "t_sd_320_nocturne.png")
                for tab in ("Spiele", "Personen"):
                    pg.get_by_role("tab", name=tab).click()
                    wait(pg, 400)
                    assert overflow_x(pg) == 0, f"Querüberlauf {w} {tab}"
                    small = [s for s in small_targets(pg) if s["h"] < 44 or s["w"] < 44]
                    assert not small, f"Ziele < 44 px bei {w} {tab}: {small[:5]}"
            finally:
                ctx.close()
    # Laptop
    for theme in ("Nocturne", "Hell"):
        ctx, pg = _ctx(b, log12(), theme=theme, w=1280, h=800, mode="Laptop", mobile=False)
        try:
            open_stats(pg)
            assert overflow_x(pg) == 0, f"Querüberlauf 1280 {theme}"
            assert pg.locator(".gtL-col-side").count() == 1
            assert pg.get_by_role("tab").count() == 2, "Laptop: nur Rangliste und Personen als Reiter"
            assert "Spielabende" in pg.evaluate("document.body.innerText")
            side = pg.locator(".gtL-col-side").inner_text()
            assert "Spiele" in side and "Mehr" in side, f"rechte Spalte: {side[:120]!r}"
            shot(pg, f"t_sd_1280_{theme.lower()}.png")
        finally:
            ctx.close()
    ctx, pg = _ctx(b, log12(), w=1440, h=900, mode="Laptop", mobile=False)
    try:
        open_stats(pg)
        assert overflow_x(pg) == 0, "Querüberlauf 1440"
    finally:
        ctx.close()
    # Querformat Handy
    ctx, pg = _ctx(b, log12(), w=393, h=852)
    try:
        open_stats(pg)
        pg.set_viewport_size({"width": 844, "height": 390})
        wait(pg, 800)
        assert overflow_x(pg) == 0, "Querüberlauf quer"
        shot(pg, "t_sd_844x390_quer.png")
    finally:
        ctx.close()


def run(pg=None):
    if pg is not None:
        b = pg.context.browser
        run_main(b)
        run_states(b)
        run_layout(b)
        return
    from playwright.sync_api import sync_playwright
    with sync_playwright() as p:
        b = p.chromium.launch(args=["--mute-audio"])
        try:
            run_main(b)
            run_states(b)
            run_layout(b)
        finally:
            b.close()


def main():
    try:
        run()
        print("t_sd OK")
        return 0
    except AssertionError as e:
        print("t_sd FEHLER:", e)
        return 1


if __name__ == "__main__":
    sys.exit(main())
