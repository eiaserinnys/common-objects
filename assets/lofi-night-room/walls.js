/* ---------- 2. Corner Pillar, Back Wall & Night Window, Right Wall ---------- */
function drawCornerPillar(m){
  const wPal = { l: mix(m.l, M_WALL.l, .78), m: mix(m.m, M_WALL.m, .78), d: mix(m.d, M_WALL.d, .78) };
  return box(0, 0, RM_FH, RM_WT, RM_WT, RM_H, wPal, tone, 1.1);
}

function drawBackWall(st, m){
  const wPal = { l: mix(m.l, M_WALL.l, .78), m: mix(m.m, M_WALL.m, .78), d: mix(m.d, M_WALL.d, .78) };
  const wy0 = 16, wy1 = 72, wz0 = 35, wz1 = 81;
  let s = '';
  // 4 convex wall blocks framing the window opening (y: 6..120, z: 5..88)
  s += box(0, RM_WT, RM_FH, RM_WT, RM_D, wz0, wPal, tone, 1.0);       // below window
  s += box(0, RM_WT, wz1,   RM_WT, RM_D, RM_H, wPal, tone, 1.0);      // above window
  s += box(0, RM_WT, wz0,   RM_WT, wy0,  wz1,  wPal, tone, 1.0);      // right of window
  s += box(0, wy1,   wz0,   RM_WT, RM_D, wz1,  wPal, tone, 1.0);      // left of window

  // Inner wall details (when facing +x)
  if (vis([1,0,0])){
    // Wooden baseboard along bottom of back wall
    s += box(RM_WT, RM_WT, RM_FH, RM_WT + .6, RM_D, RM_FH + 3.5, M_TRIM, toneI, .8);
    // Window recess reveals (top, bottom, left, right inner jambs of the window)
    s += box(1.2, wy0, wz0, RM_WT, wy1, wz0 + 1.4, M_TRIM, toneI, .9);
    s += box(1.2, wy0, wz1 - 1.4, RM_WT, wy1, wz1, M_TRIM, toneI, .9);
    s += box(1.2, wy0, wz0 + 1.4, RM_WT, wy0 + 1.6, wz1 - 1.4, M_TRIM, toneI, .9);
    s += box(1.2, wy1 - 1.6, wz0 + 1.4, RM_WT, wy1, wz1 - 1.4, M_TRIM, toneI, .9);

    // Night sky pane at x = 2.4
    const px = 2.4, py0 = wy0 + 1.6, py1 = wy1 - 1.6, pz0 = wz0 + 1.4, pz1 = wz1 - 1.4;
    const pane = on(PX(px), rectUV(py0, pz0, py1, pz1));
    let sky = fill(pd(pane), '#16203a');
    // Upper deep night gradient band
    sky += fill(pd(on(PX(px), rectUV(py0, pz0 + 22, py1, pz1))), '#0f172b');
    // Distant horizon glow
    sky += fill(pd(on(PX(px), rectUV(py0, pz0, py1, pz0 + 10))), '#26365c');

    // Crescent Moon (at y = 30, z = 69)
    const mCenter = P(px, 31, 69), mR = 5.2 * 1.2247;
    sky += `<circle cx="${f(mCenter[0])}" cy="${f(mCenter[1])}" r="${f(mR * 1.7)}" fill="#ffe898" opacity=".22"/>`;
    sky += `<circle cx="${f(mCenter[0])}" cy="${f(mCenter[1])}" r="${f(mR)}" fill="#fff4bd"/>`;
    sky += `<circle cx="${f(mCenter[0] - mR*.38)}" cy="${f(mCenter[1] - mR*.18)}" r="${f(mR * .82)}" fill="#0f172b"/>`;

    // Twinkling stars
    const stars = [[22,74,1.0],[41,75,1.2],[52,71,.9],[63,76,1.3],[67,66,.9],[24,62,.8],[47,63,1.1]];
    for (const [sy, sz, sr] of stars){
      const sp0 = P(px, sy, sz);
      sky += `<circle cx="${f(sp0[0])}" cy="${f(sp0[1])}" r="${f(sr)}" fill="#fff8d6" opacity=".88"/>`;
    }

    // Distant city skyline buildings + lit apartment windows
    const blds = [
      [17, 26, 51, '#1a2542'], [25, 35, 47, '#121a30'], [34, 45, 56, '#18223d'],
      [44, 53, 49, '#0f1629'], [52, 62, 54, '#1b2745'], [61, 71, 46, '#121a30']
    ];
    for (const [by0, by1, bz1, bcol] of blds){
      sky += fill(pd(on(PX(px), rectUV(by0, pz0, by1, bz1))), bcol);
      sky += ink(pd(on(PX(px), rectUV(by0, pz0, by1, bz1))), .6);
    }
    // Radio tower spire on building 3
    sky += line([[px, 39.5, 56], [px, 39.5, 63]], .7);
    const beacon = P(px, 39.5, 63.5);
    sky += `<circle cx="${f(beacon[0])}" cy="${f(beacon[1])}" r="1.4" fill="#ff5242"/>`;

    // Lit yellow/amber apartment windows in the skyline
    const wins = [
      [19,46],[22,46],[19,42],[28,43],[31,40],[36,52],[40,52],[36,48],[40,44],[36,40],
      [46,45],[49,42],[54,50],[58,50],[54,46],[58,42],[64,42],[67,39]
    ];
    for (const [wy, wz] of wins){
      sky += fill(pd(on(PX(px), rectUV(wy, wz, wy + 2.1, wz + 2.2))), (wy + wz) % 3 === 0 ? '#ff9e58' : '#ffd875');
    }

    // Falling diagonal rain streaks when st.rain is on
    if (st.rain){
      let rPath = '';
      const rShift = (st.rainPhase || 0) * 14;
      for (let i = 0; i < 22; i++){
        const ry = py0 + 3 + ((i * 11.3 + rShift * .4) % (py1 - py0 - 6));
        const rz = pz0 + 4 + ((i * 17.7 - rShift + 100) % (pz1 - pz0 - 8));
        rPath += pd([[px + .1, ry, rz + 4.8], [px + .1, ry + 1.8, rz]], false);
      }
      sky += `<path d="${rPath}" fill="none" stroke="#9ed4f7" stroke-width=".85" stroke-linecap="round" opacity=".78"/>`;
    }

    // Subtle glass reflection streaks
    sky += fill(pd(on(PX(px + .2), [[22, pz0+3], [26, pz0+3], [38, pz1-3], [34, pz1-3]])), '#ffffff', 'opacity=".14"');
    sky += fill(pd(on(PX(px + .2), [[29, pz0+3], [31, pz0+3], [43, pz1-3], [41, pz1-3]])), '#ffffff', 'opacity=".10"');

    s += act('window', clipTo(pane, sky));

    // Wooden window mullions (central vertical & horizontal bars)
    const my = (py0 + py1) / 2, mz = (pz0 + pz1) / 2;
    s += box(2.4, my - .8, pz0, 4.2, my + .8, pz1, M_TRIM, toneI, .8);
    s += box(2.4, py0, mz - .7, 4.2, py1, mz + .7, M_TRIM, toneI, .8);
    // Brass window handle latch
    s += box(4.2, my - .5, mz - 3.5, 5.2, my + .5, mz - 1.0, M_GOLD, toneI, .7);
    s += ink(pd(on(PX(RM_WT), rectUV(wy0, wz0, wy1, wz1))), 1.6);

    // Roller blind header at top of window
    s += cylY(RM_WT + 1.4, wy0 - 1.5, wy1 + 1.5, wz1 + 1.2, 1.8, M_RUG, toneI, 1.0);
    s += box(RM_WT + .2, wy0 - 1, wz1 - 3.5, RM_WT + 1.8, wy1 + 1, wz1 + .2, M_RUG, toneI, .8);

    // Two framed mini-posters on the left wall section (y = 80..112, z = 37..52)
    for (const [fy0, fy1, bgCol, artCol] of [[80, 94, '#fbf7ea', m.l], [97, 111, '#23304c', '#f4b829']]){
      s += box(RM_WT, fy0, 37, RM_WT + .7, fy1, 52, M_DARKW, toneI, .9);
      const art = on(PX(RM_WT + .75), rectUV(fy0 + 1.6, 38.6, fy1 - 1.6, 50.4));
      s += fill(pd(art), bgCol) + ink(pd(art), .6);
      const c0 = P(RM_WT + .8, (fy0 + fy1)/2, 44.5);
      s += `<circle cx="${f(c0[0])}" cy="${f(c0[1])}" r="${f(3.2 * INK_K)}" fill="${artCol}" stroke="${INK}" stroke-width="${f(.7*INK_K)}"/>`;
    }
  }

  // Exterior back wall details (when rotated behind: facing -x)
  if (vis([-1,0,0])){
    // Brick course lines on x = 0
    let brk = '';
    for (let z = 12; z < RM_H - 4; z += 8){
      brk += pd([[-.05, 8, z], [-.05, RM_D - 4, z]], false);
    }
    s += `<path d="${brk}" fill="none" stroke="${M_WALL.d}" stroke-width=".6" opacity=".6"/>`;
    // Exterior window pane & frame seen from outside (warm room light glowing out!)
    const outFrame = on(PX(-.02), rectUV(wy0, wz0, wy1, wz1));
    s += fill(pd(outFrame), M_TRIM.m) + ink(pd(outFrame), 1.1);
    const outPane = on(PX(-.05), rectUV(wy0 + 1.5, wz0 + 1.4, wy1 - 1.5, wz1 - 1.4));
    s += fill(pd(outPane), st.lampGlow > .1 ? '#ffdfa0' : '#2a385c') + ink(pd(outPane), 1.1);
    const omy = (wy0 + wy1) / 2, omz = (wz0 + wz1) / 2;
    s += box(-.4, omy - .8, wz0 + 1.4, 0, omy + .8, wz1 - 1.4, M_TRIM, tone, .8);
    s += box(-.4, wy0 + 1.5, omz - .7, 0, wy1 - 1.5, omz + .7, M_TRIM, tone, .8);
    // Exterior stone sill & utility breaker box
    s += box(-2.2, wy0 - 2, wz0 - 2.5, 0, wy1 + 2, wz0, BOARD, tone, 1.0);
    s += box(-2.8, 88, 42, 0, 102, 58, M_IRON, tone, 1.0);
    s += cyl( -1.4, 95, RM_FH, 42, 1.1, METAL, tone, .8, 12);
  }

  s += hullInk([
    [0,RM_WT,RM_FH],[RM_WT,RM_WT,RM_FH],[RM_WT,RM_D,RM_FH],[0,RM_D,RM_FH],
    [0,RM_WT,RM_H],[RM_WT,RM_WT,RM_H],[RM_WT,RM_D,RM_H],[0,RM_D,RM_H]
  ], 2.4);
  return s;
}

// Helper for cylinder along Y axis
function cylY(x, y0, y1, z, r, m, shade=toneI, w=1.0, n=16){
  const A = on(PY(y0), ellUV(x, z, r, r, n)), B = on(PY(y1), ellUV(x, z, r, r, n));
  const capB = vis([0,1,0]), cap = capB ? B : A, cn = capB ? [0,1,0] : [0,-1,0];
  return loft(A, B, nr => shade(nr, m))
    + (vis(cn) ? fill(pd(cap), shade(cn, m)) : '')
    + hullInk([...A, ...B], w)
    + (vis(cn) ? ink(pd(cap), w*.8) : '');
}

function drawRightWall(st, m){
  const wPal = { l: mix(m.l, M_WALL.l, .78), m: mix(m.m, M_WALL.m, .78), d: mix(m.d, M_WALL.d, .78) };
  let s = box(RM_WT, 0, RM_FH, RM_W, RM_WT, RM_H, wPal, tone, 1.1);

  if (vis([0,1,0])){
    // Wooden baseboard along right wall
    s += box(RM_WT, RM_WT, RM_FH, RM_W, RM_WT + .6, RM_FH + 3.5, M_TRIM, toneI, .8);

    // Acoustic slatted wood/foam panels (x = 22..54, z = 48..72)
    s += box(22, RM_WT, 48, 54, RM_WT + 1.0, 72, DARK, toneI, .9);
    for (let x = 24; x <= 52; x += 3.5){
      s += box(x, RM_WT + 1.0, 49.2, x + 1.8, RM_WT + 1.5, 70.8, M_TRIM, toneI, .5);
    }

    // Glowing LO-FI sign frame mounted over acoustic panel (x = 27..49, z = 54..66)
    const signLit = st.fairyOn || st.lampOn;
    const signCol = signLit ? '#ffcf6e' : '#cfc8b8';
    s += box(27, RM_WT + 1.5, 54, 49, RM_WT + 2.3, 66, M_DARKW, toneI, .9);
    const sFace = on(PY(RM_WT + 2.35), rectUV(28.4, 55.4, 47.6, 64.6));
    s += fill(pd(sFace), signLit ? '#2b2230' : '#3a3532') + ink(pd(sFace), .7);
    s += txY(38, RM_WT + 2.45, 58.2, 'LO-FI', 5.2, signCol, 800);

    // Round Wall Clock (x = 76, y = 6..7.4, z = 62, r = 6.2)
    const cx = 76, cz = 62, cr = 6.2;
    const cA = on(PY(RM_WT), ellUV(cx, cz, cr, cr, 24));
    const cB = on(PY(RM_WT + 1.3), ellUV(cx, cz, cr, cr, 24));
    const cFace = on(PY(RM_WT + 1.35), ellUV(cx, cz, cr * .82, cr * .82, 24));
    s += loft(cA, cB, n => toneI(n, M_TRIM)) + fill(pd(cB), M_TRIM.l)
       + fill(pd(cFace), '#fbf8ee') + ink(pd(cFace), .7) + hullInk([...cA, ...cB], 1.1);
    // Clock hands (00:15 — midnight study hour)
    s += line([[cx, RM_WT + 1.4, cz], [cx, RM_WT + 1.4, cz + 3.4]], .9);
    s += line([[cx, RM_WT + 1.4, cz], [cx + 3.8, RM_WT + 1.4, cz]], .8);
  }

  if (vis([0,-1,0])){
    // Exterior brick lines & copper rain downpipe on y = 0
    let brk = '';
    for (let z = 14; z < RM_H - 4; z += 8){
      brk += pd([[10, -.05, z], [RM_W - 6, -.05, z]], false);
    }
    s += `<path d="${brk}" fill="none" stroke="${M_WALL.d}" stroke-width=".6" opacity=".6"/>`;
    s += cyl(96, -1.4, RM_FH, RM_H - 2, 1.3, M_COPPER, tone, .9, 14);
  }

  s += hullInk([
    [RM_WT,0,RM_FH],[RM_W,0,RM_FH],[RM_W,RM_WT,RM_FH],[RM_WT,RM_WT,RM_FH],
    [RM_WT,0,RM_H],[RM_W,0,RM_H],[RM_W,RM_WT,RM_H],[RM_WT,RM_WT,RM_H]
  ], 2.4);
  return s;
}

