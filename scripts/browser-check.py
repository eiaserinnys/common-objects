import os, shutil
"""Run source/built SVG previews with an owned HTTP server and Chromium."""
from pathlib import Path
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from threading import Thread
import json, re, sys
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'docs/screenshots'
OUT.mkdir(parents=True, exist_ok=True)
class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass
server = ThreadingHTTPServer(('127.0.0.1', 0), partial(QuietHandler, directory=str(ROOT)))
thread = Thread(target=server.serve_forever, daemon=True)
thread.start()
base = f'http://127.0.0.1:{server.server_port}'
errors, failures, checks, optional_requests = [], [], [], []
try:
    with sync_playwright() as p:
        browser = p.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH') or shutil.which('chromium'), headless=True, args=['--no-sandbox'])
        context = browser.new_context(viewport={'width':1280,'height':900})
        page = context.new_page()
        page.set_default_timeout(15000)
        page.on('pageerror', lambda e: errors.append(str(e)))
        page.on('console', lambda m: (optional_requests if m.location.get('url','').endswith('/favicon.ico') else errors).append(m.text+' @ '+str(m.location)) if m.type == 'error' else None)
        page.on('response', lambda r: failures.append([r.status,r.url]) if r.status >= 400 else None)
        def shot(name):
            page.screenshot(path=str(OUT / f'{name}.png'), full_page=True)
        def art():
            return page.locator('#art').inner_html()
        if '--remaining' not in sys.argv:
            # The immutable source and the port must draw exactly the same initial art.
            page.goto(base+'/sources/colorfigures/lofi-night-room-r2.html')
            page.locator('#art path').first.wait_for()
            reference = art()
            shot('room-published-desktop')
            page.goto(base+'/dist/preview/')
            page.locator('#art path').first.wait_for()
            assert art() == reference, 'Published drawing changed during extraction'
            assert page.locator('#fig').count() == 1
            shot('room-desktop')
            checks.append('published SVG art matches byte for byte')
            page.get_by_role('button',name='Desk lamp',exact=True).click()
            page.wait_for_function('ui.st.lampOn === false && ui.st.lampGlow < .01')
            page.get_by_role('button',name=re.compile('^Lamp pose')).click()
            page.get_by_role('button',name='Low focus',exact=True).click()
            page.wait_for_function('ui.st.pose === "low" && !ui.st.moving')
            page.get_by_role('button',name='Lo-fi beats',exact=True).click()
            page.wait_for_function('ui.st.playing === false')
            page.get_by_role('button',name='Turn page / drawer',exact=True).click()
            page.wait_for_function('ui.st.drawer > .99')
            page.locator('#thmb').click()
            assert page.evaluate('ui.st.dark') is False
            page.locator('#xrb').click()
            page.wait_for_function('ui.st.xr > .99')
            shot('room-see-through')
            assert 'NaN' not in art() and 'undefined' not in art()
            page.locator('#lblb').click()
            zoom=page.locator('.zchip button').last
            zoom.click()
            assert '125%' in page.locator('.zchip').inner_text()
            old=page.evaluate('YAW')
            page.keyboard.press('ArrowRight')
            page.wait_for_function('YAW !== '+str(old))
            checks.append('room lamp, pose, turntable, drawer, theme, xray, labels, zoom and keyboard orbit')
        page.set_viewport_size({'width':390,'height':844})
        page.goto(base+'/dist/preview/')
        page.locator('#art path').first.wait_for()
        shot('room-mobile')
        assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
        old=page.evaluate('YAW')
        page.keyboard.press('ArrowRight')
        page.wait_for_function('YAW !== '+str(old))
        checks.append('keyboard orbit')
        checks.append('room narrow viewport has no horizontal overflow')
        # Follow the actual collection entry rather than jumping to an internal test harness.
        page.get_by_role('link',name='Study lamp').click()
        page.wait_for_function('document.documentElement.dataset.ready === "true"')
        assert page.locator('svg#scene path').count() > 0
        assert page.locator('canvas').count() == 0
        shot('lamp-svg-mobile')
        page.set_viewport_size({'width':1280,'height':900})
        page.locator('#toggle').click();page.locator('#duplicate').click();page.locator('#toggle').click()
        page.locator('#save').click()
        states=page.evaluate('JSON.parse(localStorage.getItem("common-objects.scene.v1")).instances.map(i=>i.state.on)')
        assert states == [True,False]
        page.locator('#selected').select_option('lamp-1')
        page.locator('#rotation').fill('60');page.locator('#rotation').dispatch_event('input')
        page.locator('#zoom').fill('1.6');page.locator('#zoom').dispatch_event('input')
        page.locator('#save').click()
        saved=page.evaluate('localStorage.getItem("common-objects.scene.v1")')
        page.locator('#toggle').click();page.locator('#restore').click();page.locator('#save').click()
        assert page.evaluate('localStorage.getItem("common-objects.scene.v1")') == saved
        assert page.evaluate('document.documentElement.dataset.error') is None
        assert 'NaN' not in page.locator('#scene').inner_html()
        shot('lamp-svg-desktop')
        checks.append('lamp SVG, independent duplicate state, rotation, zoom and persistence')
        page.get_by_role('link',name='Lo-fi night room').click()
        page.locator('#art path').first.wait_for()
        checks.append('both players are reachable through their actual links')
        assert not errors, errors
        assert not failures, failures
        browser.close()
finally:
    server.shutdown();server.server_close()
report={'scope':'remaining narrow-room and lamp flows' if '--remaining' in sys.argv else 'full', 'checks':checks,'pageAndConsoleErrors':errors,'httpFailures':failures,'optionalFaviconRequests':optional_requests}
(ROOT/'docs/browser-result.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(report))
