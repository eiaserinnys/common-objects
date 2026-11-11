"""Chromium QA of reachable retail poses, guarded actions and mixed scene persistence."""
import os,shutil,json
from pathlib import Path
from functools import partial
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
from threading import Thread
from playwright.sync_api import sync_playwright
from PIL import Image,ImageDraw
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'docs/screenshots/retail-2026-11-11';OUT.mkdir(parents=True,exist_ok=True)
poses=json.loads((ROOT/'docs/retail-validation-result.json').read_text())['objects']
class Quiet(SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
server=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(ROOT)));Thread(target=server.serve_forever,daemon=True).start()
checks=[];errors=[];captures=0
try:
 with sync_playwright() as p:
  browser=p.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH') or shutil.which('chromium'),headless=True,args=['--no-sandbox'])
  page=browser.new_page(viewport={'width':1440,'height':1000});page.on('pageerror',lambda e:errors.append(str(e)));page.on('response',lambda r:errors.append(str(r.status)+' '+r.url) if r.status>=400 else None)
  page.goto(f'http://127.0.0.1:{server.server_port}/dist/preview/retail.html')
  def ready():page.wait_for_function('document.documentElement.dataset.ready === "true"')
  def restart():page.reload();ready()
  def select(n):page.locator('#selected').select_option('object-'+str(n))
  def action(id):
   (page.locator('#toggle') if id=='toggle' else page.locator(f'#extra-actions [data-action="{id}"]')).click()
  def saved():
   page.locator('#save').click();return page.evaluate('JSON.parse(localStorage.getItem("common-objects.retail.v1"))')
  def orbit(dx):
   page.locator('#scene').scroll_into_view_if_needed();r=page.locator('#scene').bounding_box();page.mouse.move(r['x']+150,r['y']+180);page.mouse.down();page.mouse.move(r['x']+150+dx,r['y']+180,steps=3);page.mouse.up()
  ready();page.screenshot(path=str(OUT/'set-desktop.png'),full_page=True);page.locator('#scene').screenshot(path=str(OUT/'representative-interior.png'))
  for n in [3,4,5,6,7,8,9,10]:select(n);action('toggle')
  select(5);action('print');page.locator('#scene').screenshot(path=str(OUT/'interior-operating.png'));orbit(314.159);page.locator('#scene').screenshot(path=str(OUT/'interior-reverse.png'))
  # Guard refusal must preserve full saved state, poses and relationships.
  for n,prep,blocked in [(3,[], 'reload'),(3,['stop'],'toggle'),(4,['toggle'],'clear'),(5,[],'print'),(10,[],'refill'),(10,['lid'],'toggle')]:
   restart();select(n)
   for step in prep:action(step)
   before=saved();action(blocked);assert page.locator('#status').inner_text();after=saved();assert before==after
   checks.append(f'object-{n}: {blocked} refusal preserves complete scene')
  # Reach each state using actual UI actions, then rotate the camera (including brake-locked poses).
  for n,obj in enumerate(poses,1):
   for k,pose in enumerate(obj['states']):
    restart();select(n);page.locator('#focus').click()
    for step in pose['steps']:action(step)
    assert saved()['instances'][n-1]['state']==pose['state']
    for angle in [0,90,180,270]:
     page.locator('#scene').screenshot(path=str(OUT/f'object-{n}-pose-{k}-{angle}.png'));captures+=1;orbit(157.0796327)
    assert 'NaN' not in page.locator('#scene').inner_html()
   checks.append(f'object-{n}: all {len(obj["states"])} reachable poses in four camera directions')
  restart()
  for n in range(1,17):
   select(n);before=saved()['instances'][n-1];page.locator('#duplicate').click();copy=saved()['instances'][-1];assert 'mount' not in copy and 'attachment' not in copy
   if page.locator('#toggle').is_enabled():
    action('toggle');after=saved()['instances'];assert after[n-1]==before;assert after[-1]['state']!=before['state']
   assert copy['position']!=before['position']
  snapshot=saved();assert len(snapshot['instances'])==32;assert all(i['scale']==[1,1,1] for i in snapshot['instances'])
  restart();page.locator('#restore').click();assert saved()==snapshot;checks.append('32 mixed instances: independent states and detached copies restore exactly')
  restart();select(11);page.locator('#x').fill('2.5');page.locator('#x').dispatch_event('change');page.locator('#rotation').evaluate('(e)=>{e.value=20;e.dispatchEvent(new Event("input"))}')
  moved=saved();assert abs(moved['instances'][3]['rotation'][1]-(1.570796326795+.349065850399))<1e-8
  assert moved['instances'][3]['position']!=snapshot['instances'][3]['position'];select(4);assert page.locator('#x').is_disabled();page.locator('#detach-support').click();assert page.locator('#x').is_enabled()
  select(12);page.locator('#x').fill('0.3');page.locator('#x').dispatch_event('change');assert abs(saved()['instances'][12]['position'][0]-.3)<1e-8
  checks.append('counter follows translated/yawed supports; detach unlocks; wall carries mounted light')
  restart();select(6);action('toggle');assert page.locator('#x').is_disabled();action('toggle');assert page.locator('#x').is_enabled();checks.append('trolley parking brake locks and releases placement')
  page.set_viewport_size({'width':390,'height':844});restart();page.screenshot(path=str(OUT/'set-mobile.png'),full_page=True);assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
  select(10);page.locator('#focus').click();before=page.locator('#scene').inner_html();orbit(90);assert before!=page.locator('#scene').inner_html();action('toggle');page.locator('#zoom').evaluate('(e)=>{e.value=4;e.dispatchEvent(new Event("input"))}');page.screenshot(path=str(OUT/'mobile-detail.png'),full_page=True)
  checks.append('390px viewport: no overflow; selection, focus, orbit, zoom and dispense action');assert not errors,errors;browser.close()
finally:server.shutdown();server.server_close()
(ROOT/'docs/retail-browser-result.json').write_text(json.dumps(dict(checks=checks,individualFourAngleCaptures=captures,errors=errors),indent=2)+'\n')
for pose in [0,1,2,3]:
 sheet=Image.new('RGB',(1400,2100),'#f0eee5');draw=ImageDraw.Draw(sheet)
 for n,obj in enumerate(poses,1):
  k=min(pose,len(obj['states'])-1)
  for j,angle in enumerate([0,90,180,270]):
   im=Image.open(OUT/f'object-{n}-pose-{k}-{angle}.png').convert('RGB');im.thumbnail((345,180));sheet.paste(im,(j*350,(n-1)*210+24));draw.text((j*350+8,(n-1)*210+4),f'{n} / pose {k} / camera {angle}',fill='black')
 sheet.save(OUT/f'pose-{pose}-contact-sheet.jpg')
print(json.dumps(dict(checks=len(checks),captures=captures,errors=errors)))
