import os, shutil
from pathlib import Path
from functools import partial
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
from threading import Thread
from playwright.sync_api import sync_playwright
import json
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'docs/screenshots/games-2026-10-29'
OUT.mkdir(parents=True,exist_ok=True)
class Quiet(SimpleHTTPRequestHandler):
 def log_message(self,*args): pass
server=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(ROOT)))
Thread(target=server.serve_forever,daemon=True).start()
errors=[]; checks=[]
try:
 with sync_playwright() as p:
  browser=p.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH') or shutil.which('chromium'), headless=True,args=['--no-sandbox'])
  page=browser.new_page(viewport={'width':1280,'height':900})
  page.on('pageerror',lambda e:errors.append(str(e)))
  page.on('response',lambda r:errors.append(str(r.status)+' '+r.url) if r.status>=400 else None)
  page.goto(f'http://127.0.0.1:{server.server_port}/dist/preview/games.html')
  page.wait_for_function('document.documentElement.dataset.ready === "true"')
  for n in [5,10]:
   page.locator('#selected').select_option('object-'+str(n));page.locator('#focus').click()
   page.mouse.move(400,300);page.mouse.down();page.mouse.move(400,345,steps=5);page.mouse.up()
   page.locator('#scene').screenshot(path=str(OUT/f'interior-{n}-default.png'))
   page.locator('#toggle').click()
   page.locator('#scene').screenshot(path=str(OUT/f'interior-{n}-alternate.png'))
   checks.append(f'object-{n}: overhead interior and removable content')
  assert not errors,errors
  browser.close()
finally: server.shutdown();server.server_close()
(ROOT/'docs/games-interior-result.json').write_text(json.dumps({'checks':checks,'errors':errors},indent=2)+'\n')

