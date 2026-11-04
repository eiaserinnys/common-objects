import os, shutil
from pathlib import Path
from functools import partial
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
from threading import Thread
from playwright.sync_api import sync_playwright
import json
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'docs/screenshots/utility-2026-11-04'
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
  page.goto(f'http://127.0.0.1:{server.server_port}/dist/preview/utility.html')
  page.wait_for_function('document.documentElement.dataset.ready === "true"')
  page.screenshot(path=str(OUT/'set-desktop.png'),full_page=True)
  page.locator('#scene').screenshot(path=str(OUT/'representative-interior.png'))
  page.locator('#selected').select_option('object-9')
  for _ in range(4): page.locator('#toggle').click()
  page.locator('#save').click()
  state=next(i['state'] for i in page.evaluate('JSON.parse(localStorage.getItem("common-objects.utility.v1")).instances') if i['id']=='object-9')
  assert state=={'humidity':50,'waterMl':600,'wet':True,'full':True}
  page.locator('#focus').click()
  page.screenshot(path=str(OUT/'dehumidifier-full-tank.png'),full_page=True)
  page.locator('[data-action=drain]').click()
  page.reload();page.wait_for_function('document.documentElement.dataset.ready === "true"')
  for n in [1,2,3,5,6,9]:
   page.locator('#selected').select_option('object-'+str(n));page.locator('#toggle').click()
  page.locator('#scene').screenshot(path=str(OUT/'interior-operating.png'))
  page.mouse.move(400,300);page.mouse.down();page.mouse.move(714,300,steps=10);page.mouse.up()
  page.locator('#scene').screenshot(path=str(OUT/'interior-reverse.png'))
  page.reload();page.wait_for_function('document.documentElement.dataset.ready === "true"')
  for n in range(1,11):
   page.locator('#selected').select_option('object-'+str(n))
   page.locator('#focus').click()
   before=page.locator('#scene').inner_html()
   dynamic=page.locator('#toggle').is_enabled()
   if dynamic:
    page.locator('#toggle').click()
    assert before!=page.locator('#scene').inner_html()
    if n==9: page.locator('[data-action=drain]').click()
    else: page.locator('#toggle').click()
   for angle in [0,90,180,270]:
    page.locator('#rotation').evaluate('(e,v)=>{e.value=v;e.dispatchEvent(new Event("input"))}',angle if angle<=180 else -90)
    page.locator('#scene').screenshot(path=str(OUT/f'object-{n}-{angle}.png'))
   page.locator('#rotation').evaluate('(e)=>{e.value=0;e.dispatchEvent(new Event("input"))}')
   if dynamic:
    page.locator('#toggle').click()
    for angle in [90,180,270]:
     if n==6: page.locator('#toggle').click()
     page.locator('#rotation').evaluate('(e,v)=>{e.value=v;e.dispatchEvent(new Event("input"))}',angle if angle<=180 else -90)
     if n==6: page.locator('#toggle').click()
     page.locator('#scene').screenshot(path=str(OUT/f'object-{n}-alternate-{angle}.png'))
    if n==6: page.locator('#toggle').click()
    page.locator('#rotation').evaluate('(e)=>{e.value=0;e.dispatchEvent(new Event("input"))}')
    if n==6: page.locator('#toggle').click()
   page.locator('#scene').screenshot(path=str(OUT/f'object-{n}-alternate.png'))
   assert 'NaN' not in page.locator('#scene').inner_html()
   page.locator('#duplicate').click()
   if dynamic: page.locator('#toggle').click()
   page.locator('#save').click()
   saved=page.evaluate('JSON.parse(localStorage.getItem("common-objects.utility.v1")).instances')
   original=next(i for i in saved if i['id']=='object-'+str(n))
   if dynamic: assert original['state']!=saved[-1]['state']
   else: assert original['position']!=saved[-1]['position']
   assert all(i['scale']==[1,1,1] for i in saved)
   checks.append(f'object-{n}: four sides, available state, independent copy, unit scale')
  for n in range(11,17):
   page.locator('#selected').select_option('object-'+str(n));page.locator('#focus').click()
   before=page.locator('#scene').inner_html();page.locator('#toggle').click()
   assert before!=page.locator('#scene').inner_html()
   page.locator('#duplicate').click();page.locator('#toggle').click();page.locator('#save').click()
   saved=page.evaluate('JSON.parse(localStorage.getItem("common-objects.utility.v1")).instances')
   assert next(i for i in saved if i['id']=='object-'+str(n))['state']!=saved[-1]['state']
  checks.append('all six reused assets: select, focus, toggle, independent copies')
  page.locator('#selected').select_option('object-9');page.locator('[data-action=drain]').click()
  page.locator('#selected').select_option('object-6')
  if not page.locator('#x').is_disabled(): page.locator('#toggle').click()
  assert page.locator('#x').is_disabled()
  page.locator('#toggle').click();assert page.locator('#x').is_enabled()
  checks.append('dehumidifier full-tank cutoff/drain and cart parking lock/release')
  page.locator('#x').fill('0.42');page.locator('#x').dispatch_event('change')
  page.locator('#z').fill('0.33');page.locator('#z').dispatch_event('change')
  page.locator('#zoom').evaluate('(e)=>{e.value=2.1;e.dispatchEvent(new Event("input"))}')
  page.locator('#save').click()
  saved=page.evaluate('localStorage.getItem("common-objects.utility.v1")')
  page.reload();page.wait_for_function('document.documentElement.dataset.ready === "true"')
  page.locator('#restore').click();page.locator('#save').click()
  assert page.evaluate('localStorage.getItem("common-objects.utility.v1")')==saved
  checks.append('mixed 32-instance scene: transforms, states, versions saved and restored after reload')
  page.set_viewport_size({'width':390,'height':844})
  page.reload();page.wait_for_function('document.documentElement.dataset.ready === "true"')
  page.screenshot(path=str(OUT/'set-mobile.png'),full_page=True)
  assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
  before=page.locator('#scene').inner_html()
  page.locator('#scene').scroll_into_view_if_needed()
  rect=page.locator('#scene').bounding_box()
  page.mouse.move(rect['x']+120,rect['y']+80);page.mouse.down();page.mouse.move(rect['x']+190,rect['y']+130,steps=5);page.mouse.up()
  assert before!=page.locator('#scene').inner_html()
  page.locator('#selected').select_option('object-2');page.locator('#focus').click();page.locator('#toggle').click()
  page.screenshot(path=str(OUT/'mobile-detail.png'),full_page=True)
  checks.append('390px viewport: no overflow, pointer orbit, selection, camera focus, action')
  assert not errors,errors
  browser.close()
finally: server.shutdown();server.server_close()
(ROOT/'docs/utility-browser-result.json').write_text(json.dumps({'checks':checks,'errors':errors},indent=2)+'\n')

# Compact review sheet; original captures remain alongside it.
from PIL import Image, ImageDraw
sheet=Image.new('RGB',(1500,2000),'#f0eee5');draw=ImageDraw.Draw(sheet)
for n in range(1,11):
 for j,view in enumerate(['0','90','180','270','alternate']):
  im=Image.open(OUT/f'object-{n}-{view}.png').convert('RGB');im.thumbnail((295,174))
  sheet.paste(im,(j*300,(n-1)*200+24));draw.text((j*300+8,(n-1)*200+4),f'{n} / {view}',fill='black')
sheet.save(OUT/'inspection-contact-sheet.jpg')

operating=Image.new('RGB',(1400,1800),'#f0eee5');draw=ImageDraw.Draw(operating)
for row,n in enumerate([1,2,3,5,6,9]):
 for col,angle in enumerate(['','-90','-180','-270']):
  im=Image.open(OUT/f'object-{n}-alternate{angle}.png').convert('RGB');im.thumbnail((345,270))
  operating.paste(im,(350*col,300*row+25));draw.text((350*col+8,300*row+5),f'{n} alternate {angle or "front"}',fill='black')
operating.save(OUT/'operating-contact-sheet.jpg')
