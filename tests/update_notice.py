#!/usr/bin/env python3
"""Update-Hinweis: lokal ueber HTTP, version.json wird gemockt, leere Browser-Kontexte."""
import functools, http.server, json, re, sys, threading
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent / "docs"
BUILD = re.search(r'"build":\s*"([^"]+)"', (ROOT / "version.json").read_text()).group(1)
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
srv = http.server.ThreadingHTTPServer(("127.0.0.1", 0), functools.partial(Q, directory=str(ROOT)))
threading.Thread(target=srv.serve_forever, daemon=True).start()
URL = f"http://127.0.0.1:{srv.server_address[1]}/index.html"
fails = 0
def ok(name, cond):
    global fails
    print(("OK    " if cond else "FEHLER"), name); fails += 0 if cond else 1

def page(b, seen=None, clicked=False):
    ctx = b.new_context(viewport={"width": 393, "height": 852}, service_workers="block")
    ver = {"build": BUILD}
    ctx.route("**/version.json*", lambda r: r.fulfill(status=200, content_type="application/json", body=json.dumps(ver)))
    init = "window.AudioContext=undefined;window.webkitAudioContext=undefined;"
    if seen:
        extra = "localStorage.setItem('gametab-update-clicked','1');" if clicked else ""
        init += "if(!sessionStorage.x){sessionStorage.x=1;localStorage.setItem('gametab-last-build','" + seen + "');" + extra + "}"
    ctx.add_init_script(init)
    p = ctx.new_page(); p.goto(URL); p.wait_for_timeout(900)
    s = p.get_by_text("Überspringen")
    if s.count(): s.first.click(); p.wait_for_timeout(500)
    return ctx, p, ver
card = lambda p: p.locator(".gtU-card")

with sync_playwright() as pw:
    b = pw.chromium.launch()
    ctx, p, ver = page(b)
    ok("erster Besuch: keine Meldung", card(p).count() == 0)
    ver["build"] = "neu-1"; p.evaluate("window.dispatchEvent(new Event('focus'))"); p.wait_for_timeout(500)
    ok("neue Version: Meldung mit Aktualisieren", p.locator(".gtU-btn").count() == 1)
    p.locator(".gtU-x").click(); p.wait_for_timeout(400)
    ok("Spaeter: Meldung weg", card(p).count() == 0)
    p.evaluate("window.dispatchEvent(new Event('focus'))"); p.wait_for_timeout(400)
    ok("gleiche Version: bleibt weg", card(p).count() == 0)
    ver["build"] = "neu-2"; p.evaluate("window.dispatchEvent(new Event('focus'))"); p.wait_for_timeout(500)
    ok("noch neuere Version: Meldung wieder da", p.locator(".gtU-btn").count() == 1)
    ctx.close()
    ctx, p, ver = page(b, seen="alt")
    ok("direkt neu geladen: Hinweis aktualisiert", card(p).count() == 1 and p.locator(".gtU-btn").count() == 0)
    p.wait_for_timeout(6300)
    ok("Hinweis verschwindet von selbst", card(p).count() == 0)
    p.reload(); p.wait_for_timeout(800)
    ok("nach Neuladen kein zweiter Hinweis", card(p).count() == 0)
    ctx.close()
    ctx, p, ver = page(b, seen="alt", clicked=True)
    ok("nach Klick auf Aktualisieren kein doppelter Hinweis", card(p).count() == 0)
    ctx.close(); b.close()
print(f"{fails} Fehler"); sys.exit(1 if fails else 0)
