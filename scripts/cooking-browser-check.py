"""Chromium QA of reachable cooking poses, guarded actions and mixed scene persistence."""
import os,shutil,json
from pathlib import Path
from functools import partial
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
from threading import Thread
from playwright.sync_api import sync_playwright
from PIL import Image,ImageDraw,ImageChops
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'docs/screenshots/cooking-2026-11-22';OUT.mkdir(parents=True,exist_ok=True)
poses=json.loads((ROOT/'docs/cooking-validation-result.json').read_text())['objects']
class Quiet(SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
server=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(ROOT)));Thread(target=server.serve_forever,daemon=True).start()
checks=[];errors=[];captures=0
try:
 with sync_playwright() as p:
  browser=p.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH') or shutil.which('chromium'),headless=True,args=['--no-sandbox'])
  page=browser.new_page(viewport={'width':1440,'height':1000});page.on('pageerror',lambda e:errors.append(str(e)));page.on('response',lambda r:errors.append(str(r.status)+' '+r.url) if r.status>=400 else None)
  page.goto(f'http://127.0.0.1:{server.server_port}/dist/preview/cooking.html')
  def ready():page.wait_for_function('document.documentElement.dataset.ready === "true"')
  def restart():page.reload();ready()
  def select(n):page.locator('#selected').select_option('object-'+str(n))
  def action(id):
   (page.locator('#toggle') if id=='toggle' else page.locator(f'#extra-actions [data-action="{id}"]')).click()
  def saved():
   page.locator('#save').click();return page.evaluate('JSON.parse(localStorage.getItem("common-objects.cooking.v1"))')
  def orbit(dx):
   page.locator('#scene').scroll_into_view_if_needed();r=page.locator('#scene').bounding_box();page.mouse.move(r['x']+150,r['y']+180);page.mouse.down();page.mouse.move(r['x']+150+dx,r['y']+180,steps=3);page.mouse.up()
  ready();print("ready",flush=True);page.screenshot(path=str(OUT/'set-desktop.png'),full_page=True);page.locator('#scene').screenshot(path=str(OUT/'representative-interior.png'))
  for n,obj in enumerate(poses,1):
   select(n)
   for step in obj['states'][-1]['steps']:action(step)
  page.locator('#scene').screenshot(path=str(OUT/'interior-operating.png'));orbit(314.159);page.locator('#scene').screenshot(path=str(OUT/'interior-reverse.png'))
  for n,prep,blocked in [(3,[],'cook'),(3,['toggle','cook'],'toggle'),(4,['toggle'],'step'),(4,['step'],'toggle'),(5,[],'pulse'),(5,['toggle','pulse'],'toggle')]:
   restart();select(n)
   for step in prep:action(step)
   before=saved();action(blocked);assert page.locator('#status').inner_text();assert before==saved();checks.append(str(n)+' '+blocked+' refusal preserves scene')
  # Reach each state using actual UI actions, then rotate the camera (including brake-locked poses).
  for n,obj in enumerate(poses,1):
   for k,pose in enumerate(obj['states']):
    restart();select(n);page.locator('#focus').click()
    for step in pose['steps']:action(step)
    assert saved()['instances'][n-1]['state']==pose['state']
    for angle in [0,90,180,270]:
     page.locator('#scene').screenshot(path=str(OUT/f'object-{n}-pose-{k}-{angle}.png'));captures+=1;orbit(157.0796327)
    assert 'NaN' not in page.locator('#scene').inner_html()
   print('captured',n,flush=True)
   checks.append(f'object-{n}: all {len(obj["states"])} reachable poses in four camera directions')
  restart();select(2);page.locator('#focus').click();page.locator('#scene').scroll_into_view_if_needed();r=page.locator('#scene').bounding_box();page.mouse.move(r['x']+250,r['y']+280);page.mouse.down();page.mouse.move(r['x']+250,r['y']+150,steps=3);page.mouse.up()
  page.locator('#scene').screenshot(path=str(OUT/'hood-underside-off.png'));action('toggle');page.locator('#scene').screenshot(path=str(OUT/'hood-underside-on.png'));checks.append('extractor underside exposes retained fan phase behind grille')
  restart();page.locator('#focus').click()
  for n in range(1,18):
   select(n);before=saved()['instances'][n-1];page.locator('#duplicate').click();copy=saved()['instances'][-1];assert 'mount' not in copy and 'attachment' not in copy
   if page.locator('#toggle').is_enabled():

    aa=poses[n-1] if n<=6 else None
    if aa:
     for step in aa['states'][-1]['steps']:action(step)
    else:action('toggle')
    after=saved()['instances'];assert after[n-1]==before;assert after[-1]['state']!=before['state']
   assert copy['position']!=before['position']
  snapshot=saved();assert len(snapshot['instances'])==34;assert all(i['scale']==[1,1,1] for i in snapshot['instances'])
  restart();page.locator('#restore').click();assert saved()==snapshot;checks.append('34 mixed instances: independent states and detached copies restore exactly')
  for parent,children,height in [(7,[2],1.65),(8,[3,5,6,15,17],.95),(9,[14,16],.74)]:
   restart();select(parent);before=saved();page.locator('#x').fill(str(parent-8));page.locator('#x').dispatch_event('change');page.locator('#rotation').evaluate('(e)=>{e.value=20;e.dispatchEvent(new Event("input"))}')
   moved=saved()
   for child in children:
    assert abs(moved['instances'][child-1]['position'][1]-height)<1e-8;assert abs(moved['instances'][child-1]['rotation'][1]-.349065850399)<1e-8;assert moved['instances'][child-1]['position']!=before['instances'][child-1]['position']
   assert moved['instances'][3]==before['instances'][3] # microwave is intentionally independent because its open door overhangs
   restart();page.locator('#restore').click();assert saved()==moved
   select(children[0]);assert page.locator('#x').is_disabled();position=moved['instances'][children[0]-1]['position'];page.locator('#detach-support').click();assert page.locator('#x').is_enabled();assert saved()['instances'][children[0]-1]['position']==position
  checks.append('seven supported children and wall hood follow hosts, restore and detach; microwave remains independently placed')
  page.set_viewport_size({'width':390,'height':844});restart();page.screenshot(path=str(OUT/'set-mobile.png'),full_page=True);assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
  select(1);page.locator('#focus').click();before=page.locator('#scene').inner_html();orbit(90);assert before!=page.locator('#scene').inner_html();action('toggle');page.locator('#zoom').evaluate('(e)=>{e.value=4;e.dispatchEvent(new Event("input"))}');page.screenshot(path=str(OUT/'mobile-detail.png'),full_page=True)
  checks.append('390px viewport: no overflow; selection, focus, orbit, zoom and key action');assert not errors,errors;browser.close()
finally:server.shutdown();server.server_close()
pixel_changes=[]
for n,obj in enumerate(poses,1):
 for pose in range(1,len(obj['states'])):
  counts=[]
  for angle in [0,90,180,270]:
   a=Image.open(OUT/f'object-{n}-pose-0-{angle}.png').convert('RGB');b=Image.open(OUT/f'object-{n}-pose-{pose}-{angle}.png').convert('RGB')
   delta=ImageChops.difference(a,b);counts.append(sum(1 for px in delta.getdata() if max(px)>8))
  assert max(counts)>0,(obj['id'],pose,'no visible change')
  pixel_changes.append(dict(id=obj['id'],pose=pose,changedPixelsByCamera=counts))
(ROOT/'docs/cooking-browser-result.json').write_text(json.dumps(dict(checks=checks,individualFourAngleCaptures=captures,pixelChanges=pixel_changes,errors=errors),indent=2)+'\n')
for pose in range(max(len(obj["states"]) for obj in poses)):
 sheet=Image.new('RGB',(1400,210*len(poses)),'#f0eee5');draw=ImageDraw.Draw(sheet)
 for n,obj in enumerate(poses,1):
  k=min(pose,len(obj['states'])-1)
  for j,angle in enumerate([0,90,180,270]):
   im=Image.open(OUT/f'object-{n}-pose-{k}-{angle}.png').convert('RGB');im.thumbnail((345,180));sheet.paste(im,(j*350,(n-1)*210+24));draw.text((j*350+8,(n-1)*210+4),f'{n} / pose {k} / camera {angle}',fill='black')
 sheet.save(OUT/f'pose-{pose}-contact-sheet.jpg')
print(json.dumps(dict(checks=len(checks),captures=captures,errors=errors)))
