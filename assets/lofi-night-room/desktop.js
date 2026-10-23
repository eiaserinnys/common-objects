/* ---------- 6. Desktop Props (z >= 33, strictly disjoint XY boxes) ---------- */

// 6A. Vinyl Turntable: x ∈ [18, 42], y ∈ [25, 49], z ∈ [33, 42]
function drawTurntable(st, m){
  let s = '';
  // Plinth (x=19..41, y=26..48, z=33..36.5)
  s += box(19, 26, 33, 41, 48, 36.5, M_DARKW, toneI, 1.1);
  // Spinning Vinyl Platter & LP Record (center x=30, y=38.5, z=36.5..37.6, r=8.2)
  const px = 30, py = 38.5, pz = 37.5, pr = 8.2;
  s += cyl(px, py, 36.5, pz, pr, M_VINYL, toneI, 1.1, 28);
  if (vis([0,0,1])){
    // Rotating sheen streaks on the vinyl LP
    const ang = dRad(st.spinAngle || 25);
    const s1 = [px + pr*.85*Math.cos(ang), py + pr*.85*Math.sin(ang), pz + .04];
    const s2 = [px - pr*.85*Math.cos(ang), py - pr*.85*Math.sin(ang), pz + .04];
    s += `<path d="${pd([s1, s2], false)}" fill="none" stroke="#ffffff" stroke-width="1.4" opacity=".28"/>`;
    // Groove ring
    s += ink(pd(on(PZ(pz + .03), ellUV(px, py, pr * .68, pr * .68, 24))), .45);
    // Center record label in current palette colour + spindle pin
    const lbl = on(PZ(pz + .05), ellUV(px, py, 2.8, 2.8, 18));
    s += fill(pd(lbl), m.l) + ink(pd(lbl), .6);
  }
  s += cyl(px, py, pz, pz + .9, .45, METAL, toneI, .6, 10);

  // Start/Stop button & green/amber status LED at front-right of plinth
  const led = on(PZ(36.55), ellUV(38.5, 28.5, .8, .8, 10));
  s += fill(pd(led), st.playing ? '#43c25c' : '#8d877a') + ink(pd(led), .5);
  // Pitch fader slot
  s += line([[33, 28.2, 36.55], [39, 28.2, 36.55]], .9);

  // Tonearm gimbal at (x=22.5, y=29.0, z=36.5..38.8) & pivoting arm
  const gx = 22.5, gy = 29.0, gz = 38.4;
  s += cyl(gx, gy, 36.5, gz, 1.8, METAL, toneI, .9, 16);
  // Arm swings from rest (angle 0 along +x) inward over the record (angle +26 deg toward +y)
  const armA = dRad(6 + 24 * (st.armPos || 0));
  const tip = [gx + 13.5 * Math.cos(armA), gy + 13.5 * Math.sin(armA), gz - .5 * (st.armPos || 0)];
  const back = [gx - 2.6 * Math.cos(armA), gy - 2.6 * Math.sin(armA), gz];
  s += cylAx(back, [gx, gy, gz], 1.1, DARK, toneI, .8, 12); // counterweight
  s += rod([gx, gy, gz], tip, .45, METAL, rodTone, .85);
  s += box(tip[0] - .9, tip[1] - .9, tip[2] - .4, tip[0] + .9, tip[1] + .9, tip[2] + .5, DARK, toneI, .75);

  // Floating inked musical notes when playing! (Pure SVG geometry, no unicode font symbols)
  if (st.playing){
    const bob = Math.sin((st.spinAngle || 0) * Math.PI / 90) * 1.2;
    for (const [nx, ny, nz] of [[28, 36, 42 + bob], [33, 41, 44.5 - bob * .7]]){
      const [X, Y] = P(nx, ny, nz), k = INK_K;
      s += `<ellipse cx="${f(X)}" cy="${f(Y)}" rx="${f(2.1*k)}" ry="${f(1.5*k)}" fill="${m.l}" stroke="${INK}" stroke-width="${f(1.0*k)}"/>`
         + `<path d="M${f(X + 1.8*k)} ${f(Y)}V${f(Y - 6.2*k)}L${f(X + 4.8*k)} ${f(Y - 4.6*k)}" fill="none" stroke="${INK}" stroke-width="${f(1.1*k)}" stroke-linecap="round" stroke-linejoin="round"/>`;
    }
  }
  return act('turntable', s);
}

// 6B. Steaming Ceramic Coffee Mug on Cork Coaster: x ∈ [45, 53], y ∈ [34, 42], z ∈ [33, 44]
function drawCoffeeMug(st, m){
  const mx = 48.5, my = 38.0;
  // Cork coaster
  let s = cyl(mx, my, 33, 33.5, 3.4, M_TRIM, toneI, .8, 18);
  // Mug body
  s += cyl(mx, my, 33.5, 39.2, 2.6, CERAMIC, toneI, 1.1, 20);
  // Dark coffee fill on top
  const cTop = on(PZ(39.22), ellUV(mx, my, 2.15, 2.15, 18));
  s += fill(pd(cTop), '#4a2c18') + ink(pd(cTop), .6);
  // Mug handle on +y side
  const hPts = [[mx, my + 2.5, 38.2], [mx, my + 4.1, 37.8], [mx, my + 4.1, 35.0], [mx, my + 2.5, 34.6]];
  const hd = pd(hPts, false);
  s += `<path d="${hd}" fill="none" stroke="${INK}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>`;
  s += `<path d="${hd}" fill="none" stroke="${CERAMIC.l}" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>`;
  // Rising curly steam wisps
  const sp = st.steamPhase || 0;
  for (const [dx, dy, dz] of [[-.7, -.5, 0], [.8, .6, 1.2]]){
    const w = Math.sin(sp + dz) * .6;
    const wPts = [
      [mx + dx, my + dy, 40.0],
      [mx + dx + w, my + dy - w, 41.8],
      [mx + dx - w, my + dy + w, 43.6]
    ];
    s += `<path d="${pd(wPts, false)}" fill="none" stroke="#857d6e" stroke-width=".85" stroke-linecap="round" opacity=".75"/>`;
  }
  return act('mug', s);
}

// 6C. Open Study Notebook & Brass Fountain Pen: x ∈ [28, 51], y ∈ [53, 81], z ∈ [33, 36.5]
function drawNotebookAndPen(st, m){
  // Cover & open two-page spread lying flat on desk
  let s = box(31, 55, 33, 47, 77, 33.6, M_DARKW, toneI, .9);
  // Left & right cream pages
  s += box(31.5, 66.1, 33.6, 46.5, 76.4, 34.2, CERAMIC, toneI, .8);
  s += box(31.5, 55.6, 33.6, 46.5, 65.9, 34.2, CERAMIC, toneI, .8);

  if (vis([0,0,1])){
    // Ruled blue lines & red margin on pages
    let rules = '';
    for (let x = 34; x <= 44; x += 2.2){
      rules += pd([[x, 67.2, 34.25], [x, 75.2, 34.25]], false);
      rules += pd([[x, 56.8, 34.25], [x, 64.8, 34.25]], false);
    }
    s += `<path d="${rules}" fill="none" stroke="#9fb6d6" stroke-width=".55"/>`;
    // Red margin line & ribbon bookmark
    s += `<path d="${pd([[33.2, 67.2, 34.26], [33.2, 75.2, 34.26]], false)}" fill="none" stroke="#e2706a" stroke-width=".65"/>`;
    s += `<path d="${pd([[46.5, 66.0, 34.0], [49.2, 65.2, 33.1]], false)}" fill="none" stroke="#e2483d" stroke-width="1.3" stroke-linecap="round"/>`;

    // Mini sketched diagram on right page (changes with st.pageIdx)
    const skPatch = on(PZ(34.28), rectUV(35, 58, 41, 63.5));
    s += fill(pd(skPatch), st.pageIdx % 2 ? m.l : '#f4b829', 'opacity=".55"') + ink(pd(skPatch), .55);
  }

  // Animated flipping page leaf when st.pageFlip > 0
  if (st.pageFlip > .02 && st.pageFlip < .98){
    const a = st.pageFlip * Math.PI;
    const py = 66 - 9.8 * Math.cos(a), pz = 34.3 + 4.5 * Math.sin(a);
    const leaf = [[31.6, 66, 34.25], [46.4, 66, 34.25], [46.4, py, pz], [31.6, py, pz]];
    s += shape(leaf, '#fbf8ee', .85);
  }

  // Brass fountain pen resting next to notebook (y = 78.8)
  s += rod([33, 79.0, 33.6], [44.5, 78.2, 33.6], .55, M_GOLD, toneI, .8);
  s += rod([44.5, 78.2, 33.6], [46.2, 78.0, 33.6], .5, DARK, toneI, .7, .1);
  return act('notebook', s);
}

// 6D. Articulated Balanced-Arm Desk Lamp: x ∈ [16, 35], y ∈ [84, 102], z ∈ [33, 74]
function drawDeskLamp(st, m, g){
  let s = '';
  const zt = L_BZ + L_BASE_H;
  // Weighted circular base
  const bA = on(PZ(L_BZ), ellUV(L_BX, L_BY, 6.8, 6.8, 28));
  const bB = on(PZ(zt),   ellUV(L_BX, L_BY, 5.9, 5.9, 28));
  s += loft(bA, bB, n => tone(n, m)) + fill(pd(bB), m.l) + ink(pd(bB), 1.0) + hullInk([...bA, ...bB], 2.0);

  // Push switch & green pilot LED on base top
  const pz = st.pressT > 0 ? .4 : 1.3;
  s += act('lampSwitch', cyl(L_BX + 3.4, L_BY - 1.8, zt, zt + pz, 1.4, DARK, toneI, .9, 14));
  const led = on(PZ(zt + .05), ellUV(L_BX + 2.2, L_BY - 3.6, .7, .7, 10));
  s += fill(pd(led), st.lampOn ? '#43c25c' : '#8d877a') + ink(pd(led), .5);

  // Post, lower arm, shoulder hub, balance spring
  s += cyl(L_BX, L_BY, zt, zt + 1.2, 2.4, METAL, toneI, .9, 16);
  s += cylAx(lQ(0, zt + 1.2), g.Sh, 1.2, METAL, rodTone, .95, 12);
  s += cylAx(g.Sh, g.El, 1.1, METAL, rodTone, .95, 12);
  s += cylAx(dAdd(g.Sh, dScl(L_NRM, -2.0)), dAdd(g.Sh, dScl(L_NRM, 2.0)), 1.9, DARK, tone, .95, 14);

  // Helical balance spring along lower arm
  const ax = norm(sub(g.El, g.Sh)), side = dScl(L_NRM, 2.6);
  const spA = dAdd(dAdd(g.Sh, dScl(norm(cross(L_NRM, ax)), 2.8)), side);
  const spB = dAdd(dAdd(g.Sh, dScl(ax, L_ARM1 * .55)), side);
  s += ink(pd([spA, spB], false), 1.3) + `<path d="${pd([spA, spB], false)}" fill="none" stroke="${METAL.l}" stroke-width=".65" stroke-dasharray="1.2 1.0"/>`;

  // Upper arm & elbow hub
  s += cylAx(g.El, g.Wr, 1.0, METAL, rodTone, .95, 12);
  s += cylAx(dAdd(g.El, dScl(L_NRM, -1.9)), dAdd(g.El, dScl(L_NRM, 1.9)), 1.8, DARK, tone, .95, 14);

  // Volumetric light beam cone from shade mouth down to the desk
  if (st.lampGlow > .01){
    const pool = lampPoolPts(g, 33, .95);
    if (pool){
      const rim = ringAx(g.at(L_SHD_LEN), g.dd, L_SHD_R1 * .9, 24);
      s += fill(sp(hull([...rim, ...pool].map(p => P(...p)))), '#ffe898', `opacity="${f(.25 * st.lampGlow)}" pointer-events="none"`);
    }
  }

  // Lamp head: LED bulb + conical shade + back cap
  let h = '';
  const bc = P(...g.at(L_BULB_T)), br = 2.9 * 1.2247;
  const mouthIn = vis(g.dd);
  const bulb = () => (st.lampGlow > .01 ? `<circle cx="${f(bc[0])}" cy="${f(bc[1])}" r="${f(br*1.85)}" fill="#ffe58a" opacity="${f(.55*st.lampGlow)}"/>` : '')
    + `<circle cx="${f(bc[0])}" cy="${f(bc[1])}" r="${f(br)}" fill="${st.lampGlow > .5 ? '#fff7cf' : '#eef0ea'}" stroke="${INK}" stroke-width=".9"/>`;
  const r0 = ringAx(g.at(1.0), g.dd, L_SHD_R0, 24), r1 = ringAx(g.at(L_SHD_LEN), g.dd, L_SHD_R1, 24);
  const cone = loft(r0, r1, n => tone(n, m)) + hullInk([...r0, ...r1], 1.9);
  const capC = cylAx(g.at(-1.6), g.at(1.0), L_SHD_R0, m, tone, 1.2, 18);
  if (!mouthIn) h += bulb() + cone + capC;
  else h += capC + cone + fill(pd(r1), st.lampGlow > .5 ? '#fff4c4' : '#f4efe0') + clipTo(r1, bulb()) + ink(pd(r1), 1.3);
  s += act('lampShade', h);
  s += cylAx(dAdd(g.Wr, dScl(L_NRM, -2.6)), dAdd(g.Wr, dScl(L_NRM, 2.6)), 1.5, DARK, tone, .9, 14);
  return s;
}

// 6E. Over-Ear Wireless Headphones: x ∈ [38, 53], y ∈ [84, 101], z ∈ [33, 40]
function drawHeadphones(st, m){
  // Left & right earcups lying on desk at (44, 88) and (45, 96.5)
  let s = '';
  // Soft desk mat under headphones
  const mat = on(PZ(33.05), rrUV(39, 85, 52, 100, 2.5));
  s += fill(pd(mat), '#cfc8b8') + ink(pd(mat), .65);

  // Headband arc curving from (44, 88, 35) back to (39.5, 92.2, 36.2) to (45, 96.5, 35)
  const hbPts = [
    [44.5, 88.2, 34.8], [41.2, 88.8, 35.6], [39.6, 92.2, 36.2],
    [41.5, 95.8, 35.6], [45.0, 96.2, 34.8]
  ];
  const hbd = pd(hbPts, false);
  s += `<path d="${hbd}" fill="none" stroke="${INK}" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/>`;
  s += `<path d="${hbd}" fill="none" stroke="${DARK.l}" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"/>`;

  // Earcups (cushions + outer shells in palette m)
  for (const [ex, ey] of [[44.8, 88.2], [45.2, 96.2]]){
    s += cyl(ex, ey, 33.1, 34.6, 2.7, DARK, toneI, .9, 18);
    s += cyl(ex, ey, 34.6, 36.2, 2.5, m, toneI, 1.0, 18);
  }
  // Tiny pulsing status LED on right earcup when music plays
  const hLed = P(46.8, 96.2, 35.6);
  s += `<circle cx="${f(hLed[0])}" cy="${f(hLed[1])}" r="${f(1.2*INK_K)}" fill="${st.playing ? '#43c25c' : '#8d877a'}" stroke="${INK}" stroke-width="${f(.5*INK_K)}"/>`;
  return act('headphones', s);
}

