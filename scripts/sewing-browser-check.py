import os, shutil
from pathlib import Path
from functools import partial
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
from threading import Thread
from playwright.sync_api import sync_playwright
import json
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'docs/screenshots/sewing-2026-10-25'
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
  page.goto(f'http://127.0.0.1:{server.server_port}/dist/preview/sewing.html')
  page.wait_for_function('document.documentElement.dataset.ready === "true"')
  page.screenshot(path=str(OUT/'set-desktop.png'),full_page=True)
  # Place the thimble on the sewing box's documented lid support.
  page.locator('#selected').select_option('object-4')
  for field,value in [('x','-0.10'),('y','0.142'),('z','0.24')]:
   page.locator('#'+field).fill(value);page.locator('#'+field).dispatch_event('change')
  page.locator('#save').click()
  placed=page.evaluate('JSON.parse(localStorage.getItem("common-objects.sewing.v1")).instances[3]')
  assert placed['position']==[-.10,.142,.24] and placed['scale']==[1,1,1]
  page.screenshot(path=str(OUT/'support-placement.png'),full_page=True)
  page.locator('#zoom').fill('1.4');page.locator('#zoom').dispatch_event('input')
  for obj,x,z in [('object-1','0.03','0.08'),('object-2','0.02','0.40')]:
   page.locator('#selected').select_option(obj)
   for field,value in [('x',x),('z',z)]:
    page.locator('#'+field).fill(value);page.locator('#'+field).dispatch_event('change')
  page.screenshot(path=str(OUT/'multi-occlusion.png'),full_page=True)
  checks.append('clustered spool behind box, thimble on lid, pincushion in front: shared SVG occlusion capture')
  checks.append('thimble contacts sewing box lid at Y=0.142 m, scale one, shared scene')
  page.reload();page.wait_for_function('document.documentElement.dataset.ready === "true"')
  for n in range(1,11):
   page.locator('#selected').select_option('object-'+str(n))
   page.locator('#focus').click()
   before=page.locator('#scene').inner_html()
   page.locator('#toggle').click()
   assert before!=page.locator('#scene').inner_html()
   page.locator('#toggle').click()
   for angle in [0,90,180,270]:
    page.locator('#rotation').evaluate('(e,v)=>{e.value=v;e.dispatchEvent(new Event("input"))}',angle if angle<=180 else -90)
    page.locator('#scene').screenshot(path=str(OUT/f'object-{n}-{angle}.png'))
   page.locator('#toggle').click()
   page.locator('#scene').screenshot(path=str(OUT/f'object-{n}-alternate.png'))
   assert 'NaN' not in page.locator('#scene').inner_html()
   page.locator('#duplicate').click();page.locator('#toggle').click();page.locator('#save').click()
   saved=page.evaluate('JSON.parse(localStorage.getItem("common-objects.sewing.v1")).instances')
   original=next(i for i in saved if i['id']=='object-'+str(n))
   assert original['state']!=saved[-1]['state']
   assert all(i['scale']==[1,1,1] for i in saved)
   checks.append(f'object-{n}: four sides, alternate state, independent copy, unit scale')
  page.locator('#x').fill('0.42');page.locator('#x').dispatch_event('change')
  page.locator('#z').fill('0.33');page.locator('#z').dispatch_event('change')
  page.locator('#zoom').fill('2.1');page.locator('#zoom').dispatch_event('input')
  page.locator('#save').click()
  saved=page.evaluate('localStorage.getItem("common-objects.sewing.v1")')
  page.reload();page.wait_for_function('document.documentElement.dataset.ready === "true"')
  page.locator('#restore').click();page.locator('#save').click()
  assert page.evaluate('localStorage.getItem("common-objects.sewing.v1")')==saved
  checks.append('mixed 20-instance scene: transforms, states, versions saved and restored after reload')
  page.set_viewport_size({'width':390,'height':844})
  page.reload();page.wait_for_function('document.documentElement.dataset.ready === "true"')
  page.screenshot(path=str(OUT/'set-mobile.png'),full_page=True)
  assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
  before=page.locator('#scene').inner_html()
  page.mouse.move(150,180);page.mouse.down();page.mouse.move(220,230,steps=5);page.mouse.up()
  assert before!=page.locator('#scene').inner_html()
  page.locator('#selected').select_option('object-6');page.locator('#focus').click();page.locator('#toggle').click()
  page.screenshot(path=str(OUT/'mobile-detail.png'),full_page=True)
  checks.append('390px viewport: no overflow, pointer orbit, selection, camera focus, action')
  assert not errors,errors
  browser.close()
finally: server.shutdown();server.server_close()
(ROOT/'docs/sewing-browser-result.json').write_text(json.dumps({'checks':checks,'errors':errors},indent=2)+'\n')
