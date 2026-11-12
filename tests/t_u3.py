#!/usr/bin/env python3
"""Paket U3 (Rueckgaengig statt Doppeltipp): Toast, Dialoge, Gruppen, Partien, Zusammenfuehren, Alle loeschen.

    ~/.gametab-venv/bin/python tests/t_u3.py

Chromium immer stumm (--mute-audio), Ton in der App aus. Auch von tests/regression.py aufrufbar: run(pg) legt eigene Kontexte an.
Screenshots: Umgebungsvariable GT_U3_SHOTS=<Ordner>.
"""
import json
import os
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from landscape import new_phone, wait, URL  # noqa: E402

MUTE = "try{localStorage.setItem('gt_soundEnabled','false')}catch(e){}"
SHOTS = os.environ.get("GT_U3_SHOTS")


def _m(i, ps, winners):
    return {"id": f"u3_{i}", "ts": 1760000000000 + i * 3600000, "game": "freeplay", "status": "done", "lowWins": False,
            "participants": [{"name": n, "norm": n.lower(), "score": s, "rank": r} for n, s, r in ps],
            "winner": winners[0], **({"winners": winners} if len(winners) > 1 else {})}


LOG = [
    _m(1, [("Anna", 10, 1), ("Ben", 5, 2), ("Cleo", 1, 3)], ["Anna"]),
    _m(2, [("Anna", 8, 1), ("Ben", 6, 2), ("Cleo", 2, 3)], ["Anna"]),
    _m(3, [("Ben", 9, 1), ("Anna", 3, 2)], ["Ben"]),
    _m(4, [("Anna", 7, 1), ("Ben", 6, 2)], ["Anna"]),
]
GROUPS = [{"id": 1, "name": "Alpha", "players": ["Anna", "Ben"]}, {"id": 2, "name": "Beta", "players": ["Cleo", "Ben"]}]


def _ctx(b, w=393, h=852, groups=True):
    ctx, pg = new_phone(b, w, h)
    seed = "localStorage.setItem('gt_matchLog'," + json.dumps(json.dumps(LOG)) + ");localStorage.setItem('gametab-onboarded','1');"
    if groups:
        seed += "localStorage.setItem('gt_playerGroups'," + json.dumps(json.dumps(GROUPS)) + ");"
    seed += "localStorage.setItem('gt_totalGamesPlayed','4');sessionStorage.setItem('__gt_u3','1');"
    ctx.add_init_script(MUTE + "try{if(!sessionStorage.getItem('__gt_u3')){" + seed + "}}catch(e){}")
    return ctx, pg


def _shot(pg, name):
    if SHOTS:
        Path(SHOTS).mkdir(parents=True, exist_ok=True)
        pg.screenshot(path=str(Path(SHOTS) / name))


def _ls(pg, key):
    return pg.evaluate("k=>localStorage.getItem(k)", key)


def _start(pg):
    pg.goto(URL)
    wait(pg, 1200)
    try:
        pg.get_by_text("Überspringen").first.click(timeout=1200)
        wait(pg)
    except Exception:
        pass


def _open_settings(pg):
    pg.locator('button[aria-label="Einstellungen"]').first.click()
    wait(pg, 700)


def _open_stats(pg):
    pg.get_by_text("Schreibunterlagen", exact=True).first.click()
    wait(pg, 800)
    pg.get_by_label("Statistik", exact=True).first.click()
    wait(pg, 1200)


def _toast(pg):
    return pg.locator("[data-gt-toast]")


def _errors(pg):
    return [e for e in pg._pl_errors if "manifest" not in e and "sw.js" not in e and "favicon" not in e and "Failed to load resource" not in e]


def run_groups(b):
    ctx, pg = _ctx(b)
    try:
        _start(pg)
        _open_settings(pg)
        pg.get_by_role("button", name="Spielergruppen").click()
        wait(pg, 500)
        # UX-13: neue Gruppe: Fokus im Namensfeld, Name markiert
        pg.get_by_role("button", name="+ Neue Gruppe").click()
        wait(pg, 500)
        ae = pg.evaluate("(()=>{const e=document.activeElement;return{tag:e.tagName,label:e.getAttribute('aria-label'),sel:e.selectionEnd-e.selectionStart,val:e.value}})()")
        assert ae["tag"] == "INPUT" and ae["label"] == "Gruppenname", f"Fokus nicht im Namensfeld: {ae}"
        assert ae["sel"] == len(ae["val"]) and ae["val"].startswith("Gruppe"), f"Name nicht markiert: {ae}"
        pg.keyboard.type("Gamma")
        pg.keyboard.press("Tab")
        pg.get_by_role("button", name="+ Spieler").click()
        pg.get_by_role("button", name="+ Spieler").click()
        wait(pg, 300)
        pg.get_by_label("Name 1", exact=True).fill("Dora")
        wait(pg, 300)
        pg.get_by_role("button", name="+ Spieler").click()
        wait(pg, 200)
        txt = pg.evaluate("document.body.innerText")
        assert "Gamma" in pg.evaluate("[...document.querySelectorAll('input.gt-gm-in')].map(i=>i.value).join('|')"), "Name Gamma fehlt"
        head = pg.locator(".gt-gm-head").nth(2).inner_text()
        assert "(1)" in head, f"Zaehler zaehlt leere Namen mit: {head!r}"
        # schliessen: leere Namen werden weggelassen
        pg.locator(".gt-gm-head .gt-gm-sb").nth(4).click()  # Pfeil der dritten Gruppe (je Gruppe Pfeil + Loeschen)
        wait(pg, 400)
        groups = json.loads(_ls(pg, "gt_playerGroups"))
        assert groups[2]["name"] == "Gamma" and groups[2]["players"] == ["Dora"], f"leere Namen gespeichert: {groups[2]}"
        assert groups[2]["id"] == 3
        # UX-1: loeschen mit Toast, Rueckgaengig an alter Position
        pg.locator(".gt-gm-head").nth(1).get_by_role("button", name="Löschen").click()
        wait(pg, 500)
        t = _toast(pg)
        assert t.count() == 1, "Toast fehlt"
        assert "Gruppe «Beta» gelöscht." in t.inner_text(), t.inner_text()
        assert t.get_attribute("role") == "status"
        box = pg.locator("[data-gt-toast-undo]").bounding_box()
        assert box["height"] >= 43.9 and box["width"] >= 43.9, f"Rueckgaengig kleiner als 44 px: {box}"
        assert pg.locator("[data-gt-live=polite]").inner_text().startswith("Gruppe «Beta»"), "Ansage fehlt"
        _shot(pg, "u3_toast_group_393.png")
        names = json.loads(_ls(pg, "gt_playerGroups"))
        assert [g["name"] for g in names] == ["Alpha", "Gamma"], names
        pg.locator("[data-gt-toast-undo]").click()
        wait(pg, 500)
        names = json.loads(_ls(pg, "gt_playerGroups"))
        assert [g["name"] for g in names] == ["Alpha", "Beta", "Gamma"], f"Position nicht wie vorher: {names}"
        assert pg.locator(".gt-gm-head").count() == 3, "Gruppe nicht wieder sichtbar"
        wait(pg, 400)
        assert _toast(pg).count() == 0, "Toast bleibt nach Rueckgaengig"
        # Id-Fund: hoechste Gruppe loeschen (ohne Rueckgaengig), neue Gruppe bekommt eine neue Id
        pg.locator(".gt-gm-head").nth(2).get_by_role("button", name="Löschen").click()
        wait(pg, 400)
        pg.get_by_role("button", name="+ Neue Gruppe").click()
        wait(pg, 500)
        ids = [g["id"] for g in json.loads(_ls(pg, "gt_playerGroups"))]
        assert ids == [1, 2, 4] and _ls(pg, "gt_groupNextId") == "5", f"Id wiederverwendet: {ids}"
        # Toast verschwindet nach 8 s
        wait(pg, 8600)
        assert _toast(pg).count() == 0, "Toast bleibt laenger als 8 s"
        errs = _errors(pg)
        assert not errs, f"Seitenfehler: {errs[:2]}"
    finally:
        ctx.close()


def run_match_and_merge(b):
    ctx, pg = _ctx(b)
    try:
        _start(pg)
        _open_stats(pg)
        pg.get_by_role("tab", name="Personen").click()  # SD: Profil über den Reiter Personen
        wait(pg, 400)
        pg.get_by_role("button", name=re.compile(r"^Cleo")).first.click()
        wait(pg, 900)
        # UX-3: Partie loeschen, sofort, 44-px-Flaeche, Toast, Rueckgaengig
        trash = pg.get_by_role("button", name="Partie löschen")
        assert trash.count() >= 2
        bx = trash.first.bounding_box()
        assert bx["width"] >= 43.9 and bx["height"] >= 43.9, f"Loeschen-Flaeche zu klein: {bx}"
        before = json.loads(_ls(pg, "gt_matchLog"))
        assert len(before) == 4
        trash.first.click()
        wait(pg, 500)
        assert len(json.loads(_ls(pg, "gt_matchLog"))) == 3, "Partie nicht sofort geloescht"
        assert "Sicher? Nochmal tippen" not in pg.evaluate("document.body.innerText")
        assert re.search(r"Partie vom \d+\.\d+\. gelöscht\.", _toast(pg).inner_text()), _toast(pg).inner_text()
        _shot(pg, "u3_toast_match_393.png")
        pg.locator("[data-gt-toast-undo]").click()
        wait(pg, 600)
        after = json.loads(_ls(pg, "gt_matchLog"))
        assert after == before, "Partie nicht an alter Position zurueck"
        # UX-4: Namen zusammenfuehren (Cleo -> Anna), Dialog, Toast, Rueckgaengig
        pg.get_by_role("button", name="Namen zusammenführen").click()
        wait(pg, 400)
        pg.get_by_role("button", name=re.compile(r"^Anna \(")).click()
        wait(pg, 500)
        dlg = pg.locator("[data-gt-merge-dialog]")
        assert dlg.count() == 1, "Dialog fehlt"
        dt = dlg.inner_text()
        assert "Cleo und Anna zusammenführen?" in dt and "unter «Anna»" in dt and "Turniere bleiben unverändert" in dt, dt
        assert pg.evaluate("document.activeElement.textContent") == "Abbrechen", "Startfokus nicht auf Abbrechen"
        _shot(pg, "u3_merge_dialog_393.png")
        pg.keyboard.press("Escape")
        wait(pg, 400)
        assert pg.locator("[data-gt-merge-dialog]").count() == 0 and _ls(pg, "gt_matchLog") == json.dumps(before, separators=(",", ":")) or json.loads(_ls(pg, "gt_matchLog")) == before, "Escape hat veraendert"
        gl0 = _ls(pg, "gt_playerGroups")
        pg.get_by_role("button", name=re.compile(r"^Anna \(")).click()
        wait(pg, 400)
        pg.locator("[data-gt-merge-do]").click()
        wait(pg, 700)
        names = {p["name"] for m in json.loads(_ls(pg, "gt_matchLog")) for p in m["participants"]}
        assert "Cleo" not in names, f"Cleo noch in Partien: {names}"
        groups = json.loads(_ls(pg, "gt_playerGroups"))
        assert groups[1]["players"] == ["Anna", "Ben"], f"Gruppe nicht angepasst: {groups}"
        assert _toast(pg).inner_text().startswith("Zusammengeführt."), _toast(pg).inner_text()
        _shot(pg, "u3_merge_toast_393.png")
        pg.locator("[data-gt-toast-undo]").click()
        wait(pg, 700)
        assert json.loads(_ls(pg, "gt_matchLog")) == before, "Partien nach Rueckgaengig nicht wie vorher"
        assert _ls(pg, "gt_playerGroups") == gl0, "Gruppen nach Rueckgaengig nicht wie vorher"
        assert "Cleo" in pg.evaluate("document.body.innerText"), "Cleo-Profil nicht zurueck"
        errs = _errors(pg)
        assert not errs, f"Seitenfehler: {errs[:2]}"
    finally:
        ctx.close()


def run_reset(b):
    ctx, pg = _ctx(b)
    try:
        _start(pg)
        _open_settings(pg)
        pg.get_by_role("button", name="Alle Ergebnisse löschen").click()
        wait(pg, 500)
        dlg = pg.locator("[data-gt-reset-dialog]")
        assert dlg.count() == 1, "Dialog fehlt"
        dt = dlg.inner_text()
        assert "Alle Ergebnisse löschen?" in dt and "Alle 4 Partien und alle Erfolge sind danach weg. Gruppen bleiben. Das lässt sich nicht rückgängig machen." in dt, dt
        for lab in ("Sicherung speichern", "Alles löschen", "Abbrechen"):
            assert pg.locator("[data-gt-reset-dialog] button", has_text=lab).count() == 1, lab
        assert pg.evaluate("document.activeElement.textContent") == "Abbrechen", "Startfokus nicht auf Abbrechen"
        for bt in pg.locator("[data-gt-reset-dialog] button").all():
            assert bt.bounding_box()["height"] >= 43.9
        _shot(pg, "u3_reset_dialog_393.png")
        # Abbrechen aendert nichts
        pg.locator("[data-gt-reset-dialog] button", has_text="Abbrechen").click()
        wait(pg, 400)
        assert pg.locator("[data-gt-reset-dialog]").count() == 0
        assert len(json.loads(_ls(pg, "gt_matchLog"))) == 4 and _ls(pg, "gt_totalGamesPlayed") == "4"
        # Escape auch
        pg.get_by_role("button", name="Alle Ergebnisse löschen").click()
        wait(pg, 400)
        pg.keyboard.press("Escape")
        wait(pg, 400)
        assert pg.locator("[data-gt-reset-dialog]").count() == 0 and len(json.loads(_ls(pg, "gt_matchLog"))) == 4
        # Sicherung speichern: Download, Dialog bleibt offen, Hinweis
        pg.get_by_role("button", name="Alle Ergebnisse löschen").click()
        wait(pg, 400)
        with pg.expect_download() as dl:
            pg.locator("[data-gt-reset-save]").click()
        assert dl.value.suggested_filename.endswith(".json")
        wait(pg, 300)
        assert pg.locator("[data-gt-reset-dialog]").count() == 1 and "Sicherung gespeichert." in pg.locator("[data-gt-reset-dialog]").inner_text()
        # Alles loeschen
        pg.locator("[data-gt-reset-do]").click()
        wait(pg, 600)
        assert pg.locator("[data-gt-reset-dialog]").count() == 0
        assert _ls(pg, "gt_matchLog") is None and _ls(pg, "gt_totalGamesPlayed") is None, "Ergebnisse oder Zaehler nicht geleert"
        assert len(json.loads(_ls(pg, "gt_playerGroups"))) == 2, "Gruppen muessen bleiben"
        pg.get_by_role("button", name=re.compile(r"^Zurück|Start", re.I)).first.click()
        wait(pg, 700)
        _open_stats(pg)
        bt = pg.evaluate("document.body.innerText")
        assert "Hier erscheinen eure Bestenlisten" in bt, "Statistik nicht leer: " + bt[:300].replace("\n", " | ")
        errs = _errors(pg)
        assert not errs, f"Seitenfehler: {errs[:2]}"
    finally:
        ctx.close()


def run(pg=None):
    if pg is not None:  # innerhalb der Regression: vorhandenen Browser nutzen
        b = pg.context.browser
        run_groups(b)
        run_match_and_merge(b)
        run_reset(b)
        return
    from playwright.sync_api import sync_playwright
    with sync_playwright() as p:
        b = p.chromium.launch(args=["--mute-audio"])
        try:
            run_groups(b)
            run_match_and_merge(b)
            run_reset(b)
        finally:
            b.close()


def main():
    try:
        run()
        print("t_u3 OK")
        return 0
    except AssertionError as e:
        print("t_u3 FEHLER:", e)
        return 1


if __name__ == "__main__":
    sys.exit(main())
