/* ---------- see-through + labels kit (shared; the figure supplies its own working parts) ----------
   xrCallouts(items, B): pills in two columns either side of the object, sorted top to bottom so leaders never cross.
     items: [{ at:[x,y,z], text, on }], B: the object's bounds [x0, x1, y0, y1, z0, z1].
   xrGhost(body, mech, k, OUTp, x0, x1, m): far walls faintly, the working parts, then the case as a ghost over them.
   xrMount(getUI, caption): the See-through / Labels switches (top right), the caption under the figure, label hiding. */
function xrCallouts(items, B){
  const pts = []; for (const x of [B[0], B[1]]) for (const y of [B[2], B[3]]) for (const z of [B[4], B[5]]) pts.push(P(x, y, z));
  const xmin = Math.min(...pts.map(p => p[0])), xmax = Math.max(...pts.map(p => p[0])), cx = (xmin + xmax)/2;
  // on a phone (LBL_U = drawing units per screen px) each label is a numbered badge and the names go in a legend under the figure
  const k = INK_K, u = window.LBL_U ? LBL_U() : 0, fs = u ? 10*u : 8.6*k, hgt = u ? 17*u : fs*1.8, gap = hgt + (u ? 3*u : 3*k);
  const L = [], R = [];
  const svgEl = document.getElementById('fig'), vb = svgEl.viewBox.baseVal, btn = document.getElementById('btns');
  const wMax = u ? hgt*1.3 + 12*k : Math.max(...items.map(it => it.text.length))*fs*.62 + fs*1.5 + 12*k;
  const roomL = xmin - vb.x >= wMax*.75, roomR = vb.x + vb.width - xmax >= wMax*.75;
  for (const it of items){ const [X, Y] = P(...it.at); ((X < cx && roomL) || !roomR ? L : R).push({ ...it, X, Y }); }
  let s = '';
  let top = { [-1]: fs + 6*k, [1]: fs + 6*k };
  if (btn && svgEl.getScreenCTM()){
    const r = btn.getBoundingClientRect(), m = svgEl.getScreenCTM().inverse();
    const q = new DOMPoint(r.right, r.bottom + 24).matrixTransform(m);
    if (q.x > xmin - wMax - 12*k && q.y > 0) top[-1] = q.y + hgt;
  }
  const stEl = document.getElementById('stats');
  if (stEl && svgEl.getScreenCTM()){
    const r = stEl.getBoundingClientRect(), m = svgEl.getScreenCTM().inverse();
    const q = new DOMPoint(r.left, r.bottom + 24).matrixTransform(m);
    if (q.x < xmax + wMax + 12*k && q.y > 0) top[1] = q.y + hgt;
  }
  for (const [col, side] of [[L, -1], [R, 1]]){
    col.sort((a, b) => a.Y - b.Y);
    let y = -1e9; for (const c of col){ c.py = Math.max(c.Y, y + gap, top[side]); y = c.py; }
    const shift = col.length ? Math.max(0, col.reduce((a, c) => a + c.py - c.Y, 0) / col.length) : 0;
    const room = col.length ? col[0].py - top[side] : 0; for (const c of col) c.py -= Math.min(shift, room);
    for (const c of col){
      c.n = ((window.__ln || (window.__ln = {}))[c.text] || (__ln[c.text] = Object.keys(__ln).length + 1)); const w = u ? hgt*(c.n > 9 ? 1.3 : 1) : c.text.length*fs*.62 + fs*1.5;
      let px = side < 0 ? xmin - 10*k - w/2 : xmax + 10*k + w/2; px = Math.max(vb.x + w/2 + 2*k, Math.min(vb.x + vb.width - w/2 - 2*k, px));
      const ex = px - side*w/2;
      s += `<g class="tag${c.on ? ' on' : ''}" data-n="${c.n}" data-t="${c.text}"><path d="M${f(c.X)} ${f(c.Y)}L${f(ex + side*-4*k)} ${f(c.py)}L${f(ex)} ${f(c.py)}" fill="none" stroke="${INK}" stroke-width="1"/>`
        + `<circle cx="${f(c.X)}" cy="${f(c.Y)}" r="${f(1.4*k)}" fill="${INK}"/>`
        + `<rect x="${f(px - w/2)}" y="${f(c.py - hgt/2)}" width="${f(w)}" height="${f(hgt)}" rx="${f(hgt/2)}" fill="${c.on ? 'var(--accent,#f4b829)' : '#fff4d6'}" stroke="${INK}" stroke-width="1.2"/>`
        + `<text x="${f(px)}" y="${f(c.py + fs*.36)}" font-size="${f(fs)}" text-anchor="middle" font-family="ui-monospace,Menlo,monospace" font-weight="800" letter-spacing=".04em" fill="${INK}">${u ? c.n : c.text}</text></g>`;
    }
  }
  return s;
}
function xrGhost(body, mech, k, OUTp, x0, x1, m){
  const fF = facing([1,0,0]), fB = facing([-1,0,0]);
  const far = `<g opacity="${f(.5*k)}">` + loft(on(PX(x0), OUTp), on(PX(x1), OUTp), n => mix(toneI(n.map(v => -v), m), '#f2efe7', .55), true)
    + (fF ? fill(pd(on(PX(x0), OUTp)), mix(m.d, '#f2efe7', .5)) : '') + (fB ? fill(pd(on(PX(x1), OUTp)), mix(m.d, '#f2efe7', .5)) : '') + `</g>`;
  return far + mech + `<g opacity="${f(1 - .8*k)}">${body}</g>` + `<g opacity="${f(.6*k)}">` + hullInk([...on(PX(x0), OUTp), ...on(PX(x1), OUTp)], 2.8) + `</g>`;
}
function xrMount(getUI, caption, opt = {}){   // opt.labelsOnly: only the Labels switch (the insides are on show already)
  const ui = getUI(), q = new URLSearchParams(location.search), html = document.documentElement;
  if (q.get('labels') !== '1') html.classList.add('nolabels');
  if (ui.st.xr == null){ ui.st.xr = 0; ui.st.xrT = 0; }
  if (q.get('xr') === '1') ui.st.xr = ui.st.xrT = 1;
  if (ui.st.dark == null) ui.st.dark = true;
  if (q.get('theme') === 'light') ui.st.dark = false;
  if (q.get('theme') === 'dark')  ui.st.dark = true;
  const old = document.getElementById('lblctl'); if (old) old.style.display = 'none';
  const vset = document.createElement('div'); vset.className = 'vset';
  vset.innerHTML = '<div class="vrow">'
    + '<button class="act" id="thmb" aria-pressed="true">Night theme</button>'
    + (opt.labelsOnly ? '' : '<button class="act" id="xrb" aria-pressed="false">See-through</button>')
    + '<button class="act" id="lblb" aria-pressed="false">Labels</button></div>';
  document.querySelector('.stage').appendChild(vset);
  const thmb = document.getElementById('thmb'), xrb = document.getElementById('xrb'), lblb = document.getElementById('lblb');
  const sync = () => {
    const dk = !!getUI().st.dark;
    html.classList.toggle('dark', dk);
    if (thmb){ thmb.setAttribute('aria-pressed', dk); thmb.textContent = dk ? 'Night theme' : 'Light theme'; }
    if (xrb) xrb.setAttribute('aria-pressed', !!getUI().st.xrT);
    lblb.setAttribute('aria-pressed', !html.classList.contains('nolabels'));
  };
  if (thmb) thmb.onclick = () => {
    const u = getUI(), st = u.st; st.dark = !st.dark; sync();
    u.flash(st.dark ? 'Cozy night dark theme enabled' : 'Daylight paper theme enabled');
    u.render();
  };
  if (xrb) xrb.onclick = () => { const u = getUI(), st = u.st; st.xr = st.xr || 0; st.xrT = st.xrT ? 0 : 1; sync();
    u.animate(dt => { const g = Math.sign(st.xrT - st.xr); st.xr = Math.min(1, Math.max(0, st.xr + g*dt/.7)); return st.xr !== st.xrT; }); };
  lblb.onclick = () => { html.classList.toggle('nolabels'); sync(); };
  sync();
  const cap = document.createElement('p'); cap.className = 'mcap'; document.querySelector('.stage').after(cap);
  const css = document.createElement('style');
  css.textContent = '.vset{position:absolute;top:4px;right:0;z-index:2}.vrow{display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end}.vset .act[aria-pressed=true]{background:var(--ink);color:var(--paper)}'
    + 'html.nolabels #fig .tag{display:none}.mcap{width:100%;max-width:760px;min-height:3em;margin:0 0 14px;font-size:12.5px;line-height:1.5;text-align:center;transition:opacity .3s}'
    + '@media (max-width:560px){.vset{position:static;margin:4px 0}}';
  document.head.appendChild(css);
  const r0 = ui.render; ui.render = () => { sync(); r0(); const st = getUI().st; cap.style.opacity = st.xr > .5 ? 1 : 0; cap.textContent = caption(st); };
  ui.render();
}
// same, for a body lofted between two horizontal rings A (bottom) and B (top)
function xrGhostRings(body, mech, k, A, B, m){
  const far = `<g opacity="${f(.5*k)}">` + loft(A, B, n => mix(toneI(n.map(v => -v), m), '#f2efe7', .55), true) + fill(pd(A), mix(m.d, '#f2efe7', .5)) + `</g>`;
  return far + mech + `<g opacity="${f(1 - .8*k)}">${body}</g>` + `<g opacity="${f(.6*k)}">` + hullInk([...A, ...B], 2.8) + `</g>`;
}
// generic see-through for any figure: the whole drawing fades back and the inside parts show over it.
//   opts: { mech(st, k) -> svg, inside(st) -> label items, surface(st) -> label items (optional), B: bounds, getSt() }
// washer-style ghost for an object without a single box case: its inside parts first, then the object pale over them
const xrUnder = (svg, mech, k) => `<g opacity="${f(k)}">${mech}</g><g opacity="${f(1 - .62*k)}">${svg}</g>`;
function xrWrap(sceneFn, opts){
  return function(){
    let s = sceneFn.apply(this, arguments);
    const st = opts.getSt(), k = ease(st.xr || 0);
    if (k > 0 && opts.under) s = xrUnder(s, opts.mech(st, k), k);   // the whole drawing is the object
    else if (k > 0 && !opts.inline) s = `<g opacity="${f(1 - .5*k)}">${s}</g><g opacity="${f(k)}">${opts.mech(st, k)}</g>`;   // inline: the figure ghosts its own case
    const items = k > .6 ? opts.inside(st) : opts.surface ? opts.surface(st) : [];
    return s + (items.length ? xrCallouts(items, opts.B) : '');
  };
}

/* ---------- game keypad: mountKeypad({ rows, hub:[col,row], action:'DROP', keys:[{ key:'ArrowLeft', glyph:'\u25c0', name, at:[col,row] }] })
   An inked pad under the buttons that sends the same keyboard events as the arrows and space (set window.GAME_KEYS = true
   so the arrows play instead of turning the camera). ---------- */
function mountKeypad(spec){
  const host = document.getElementById('btns'); if (!host) return;
  const css = document.createElement('style');
  css.textContent = `.kpad{display:flex;align-items:center;gap:16px;margin-top:6px;padding:10px 12px;border:1.5px solid var(--ink);border-radius:14px;
      background:var(--paper);box-shadow:0 3px 0 var(--ink);touch-action:none;user-select:none;-webkit-user-select:none}
    .kpad .dp{display:grid;grid-template-columns:repeat(3,34px);grid-template-rows:repeat(var(--rows),34px);gap:3px}
    .kpad .k{all:unset;box-sizing:border-box;display:flex;align-items:center;justify-content:center;width:34px;height:34px;cursor:pointer;
      background:#fbf7ea;border:1.5px solid var(--ink);border-radius:7px;box-shadow:0 3px 0 var(--ink);color:var(--ink);font:700 13px ui-monospace,Menlo,monospace;
      transition:transform .05s,box-shadow .05s,background .05s}
    .kpad .hub{width:34px;height:34px;display:flex;align-items:center;justify-content:center}
    .kpad .hub i{width:12px;height:12px;border-radius:50%;border:1.5px solid var(--ink);background:#e6e0d1}
    .kpad .go{all:unset;box-sizing:border-box;width:62px;height:62px;border-radius:50%;cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;
      background:#e2483d;border:1.5px solid var(--ink);box-shadow:0 4px 0 var(--ink),inset 0 -5px 0 rgba(0,0,0,.18);color:#fff;font:800 12px ui-monospace,Menlo,monospace;letter-spacing:.06em;
      transition:transform .05s,box-shadow .05s}
    .kpad .go small{font:700 8px ui-monospace,Menlo,monospace;opacity:.85;letter-spacing:.08em;margin-top:2px}
    .kpad .down{transform:translateY(2px);box-shadow:0 1px 0 var(--ink)}
    .kpad .k.down{background:var(--accent,#f4b829)}
    .kpad .go.down{transform:translateY(3px);box-shadow:0 1px 0 var(--ink),inset 0 -3px 0 rgba(0,0,0,.18)}
    @media (max-width:560px){.kpad{gap:22px;padding:10px 16px}.kpad .dp{grid-template-columns:repeat(3,44px);grid-template-rows:repeat(var(--rows),44px)}
      .kpad .k,.kpad .hub{width:44px;height:44px;font-size:15px}.kpad .go{width:74px;height:74px}}`;
  document.head.appendChild(css);
  const pad = document.createElement('div'); pad.className = 'kpad'; pad.setAttribute('role', 'group'); pad.setAttribute('aria-label', 'Keypad');
  const dp = document.createElement('div'); dp.className = 'dp'; dp.style.setProperty('--rows', spec.rows);
  const els = {};
  for (const k of spec.keys){
    const b = document.createElement('button'); b.className = 'k'; b.textContent = k.glyph; b.setAttribute('aria-label', k.name);
    b.style.gridColumn = k.at[0] + 1; b.style.gridRow = k.at[1] + 1; dp.appendChild(b); els[k.key] = b; }
  if (spec.hub){ const h = document.createElement('div'); h.className = 'hub'; h.innerHTML = '<i></i>'; h.style.gridColumn = spec.hub[0] + 1; h.style.gridRow = spec.hub[1] + 1; dp.appendChild(h); }
  const go = document.createElement('button'); go.className = 'go'; go.innerHTML = `${spec.action}<small>SPACE</small>`; go.setAttribute('aria-label', spec.action);
  els[' '] = go;
  pad.append(dp, go); host.appendChild(pad);
  const send = (type, key) => dispatchEvent(new KeyboardEvent(type, { key, bubbles: true }));
  for (const [key, el] of Object.entries(els)){
    let held = null;
    el.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); if (held != null) return; held = e.pointerId;
      try { el.setPointerCapture(e.pointerId); } catch (_) {} send('keydown', key); });
    const release = e => { if (held == null || (e && e.pointerId !== held)) return; held = null; send('keyup', key); };
    el.addEventListener('pointerup', release); el.addEventListener('pointercancel', release); el.addEventListener('lostpointercapture', release);
    el.addEventListener('click', e => e.preventDefault());
    el.addEventListener('keydown', e => { if (e.key === 'Enter'){ e.preventDefault(); send('keydown', key); setTimeout(() => send('keyup', key), 120); } });
  }
  // space belongs to the game: a button that still has the focus from a click must not be pressed by it too
  addEventListener('keydown', e => { if (e.key === ' ' && e.target && e.target.closest && e.target.closest('button')) e.preventDefault(); }, true);
  addEventListener('keyup', e => { if (e.key === ' ' && e.target && e.target.closest && e.target.closest('button')) e.preventDefault(); }, true);
  // light the keys for real key presses too (and for the pad's own, which arrive the same way)
  addEventListener('keydown', e => { const el = els[e.key]; if (el) el.classList.add('down'); });
  addEventListener('keyup', e => { const el = els[e.key]; if (el) el.classList.remove('down'); });
  addEventListener('blur', () => Object.values(els).forEach(el => el.classList.remove('down')));
}

