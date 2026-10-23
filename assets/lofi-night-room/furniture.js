/* ---------- 4. Vinyl Crate & Paper Lantern (x = 64..102, y = 6.2..20, z = 5..32) ---------- */
function drawVinylCrate(st, m){
  // Low wooden console against right wall
  let s = box(64, 6.4, RM_FH, 102, 19.5, 20, M_CAB, toneI, 1.1);
  // Upright vinyl LP sleeves standing on left side of crate (x = 66..84)
  const sleeves = [
    [66.5, 68.0, PALS.tomato],
    [68.4, 69.9, PALS.cobalt],
    [70.3, 71.8, PALS.mustard],
    [72.2, 73.7, m],
    [74.1, 75.6, PALS.mint],
    [76.0, 77.5, CERAMIC]
  ];
  for (const [sx0, sx1, sm] of sleeves){
    s += box(sx0, 8.0, 20, sx1, 18.0, 29.5, sm, toneI, .75);
  }
  // Warm Japanese Paper Lantern on right side of crate (x = 92, y = 13, z = 20..31)
  const lx = 92, ly = 13;
  s += cyl(lx, ly, 20, 21.5, 3.2, M_DARKW, toneI, .8, 16);
  const lPal = (st.fairyOn || st.lampOn) ? { l:'#fff3bd', m:'#f5d77f', d:'#cfa84a' } : CERAMIC;
  s += cyl(lx, ly, 21.5, 30.2, 4.4, lPal, toneI, 1.1, 20);
  s += cyl(lx, ly, 30.2, 31.2, 2.8, M_DARKW, toneI, .8, 16);
  return s;
}

/* ---------- 5. Study Desk Structure (Under-Desk z=5..30, Tabletop z=30..33) ---------- */
const DESK_TOP = boardTop(15, 22, 56, 104, 33, 3);

function drawDeskUnder(st){
  const parts = [];
  // Right 2-drawer cabinet (x = 16..54, y = 24..48, z = 5..30)
  let cab = box(16, 24, RM_FH, 54, 48, 30, M_CAB, toneI, 1.1);
  if (vis([1,0,0])){
    // Lower drawer front face & brass handle
    cab += shape(on(PX(54.1), rectUV(25.5, 7.0, 46.5, 17.5)), M_DESK.m, .9);
    cab += box(54.1, 34, 11.8, 55.2, 38, 13.0, M_GOLD, toneI, .7);
  }
  parts.push({ box:[[16, 24, RM_FH], [54, 48, 30]], svg: cab });

  // Top drawer (slides out along +x by 10 * st.drawer)
  const dx = 10 * (st.drawer || 0);
  let drw = box(53.2, 25.5, 18.2, 54.2 + dx, 46.5, 28.5, M_DESK, toneI, .95);
  drw += box(54.2 + dx, 34, 22.8, 55.3 + dx, 38, 24.0, M_GOLD, toneI, .7);
  if (dx > .5){
    // Drawer box sides & hidden lo-fi cassette tape inside!
    drw = box(54 - 2, 26, 18.5, 54 + dx, 46, 24.5, M_CAB, toneI, .8)
        + box(54 + dx*.35, 29, 24.5, 54 + dx*.85, 36, 26.2, PALS.tomato, toneI, .7)
        + box(54 + dx*.35, 38, 24.5, 54 + dx*.85, 44, 26.0, PALS.mint, toneI, .7)
        + drw;
  }
  parts.push({ box:[[53.2, 25.5, 18.2], [55.5 + dx, 46.5, 28.5]], svg: act('drawer', drw) });

  // Left back leg, left front leg, stretcher bar
  parts.push({ box:[[16, 98.5, RM_FH], [19.8, 102.5, 30]], svg: box(16, 98.5, RM_FH, 19.8, 102.5, 30, M_CAB, toneI, 1.0) });
  parts.push({ box:[[51, 98.5, RM_FH], [54.8, 102.5, 30]], svg: box(51, 98.5, RM_FH, 54.8, 102.5, 30, M_CAB, toneI, 1.0) });
  parts.push({ box:[[19.8, 99.2, 10], [51, 101.8, 13]],   svg: box(19.8, 99.2, 10, 51, 101.8, 13, M_CAB, toneI, .85) });

  return byDepth(parts);
}

function drawDeskTop(st, g){
  // Tabletop slab from z = 30 to z = 33
  const A = on(PZ(30), rrUV(15, 22, 56, 104, 3));
  const B = DESK_TOP;
  let s = loft(A, B, n => toneI(n, M_DESK)) + fill(pd(B), M_DESK.l) + ink(pd(B), 1.0) + hullInk([...A, ...B], 1.9);

  // Desktop cast shadows (clipped to DESK_TOP)
  const dShadows = [
    // turntable
    [[19,26,33],[41,48,38]],
    // mug
    [[46,35,33],[51,40,40]],
    // lamp base & arm
    [...on(PZ(33), ellUV(L_BX, L_BY, 7.2, 7.2, 16)), g.Sh, g.El, g.Wr, ...ringAx(g.at(L_SHD_LEN), g.dd, L_SHD_R1, 16)],
    // headphones
    [[40,86,33],[51,99,37]]
  ];
  s += clipTo(B, dShadows.map(pts => castShadow(pts.length === 2 ? [
    [pts[0][0],pts[0][1],pts[0][2]], [pts[1][0],pts[0][1],pts[1][2]],
    [pts[1][0],pts[1][1],pts[1][2]], [pts[0][0],pts[1][1],pts[1][2]]
  ] : pts, 33)).join(''));

  // Projected warm light pool from the desk lamp onto the desktop!
  if (st.lampGlow > .01){
    const outer = lampPoolPts(g, 33, 1.05), core = lampPoolPts(g, 33, .58);
    if (outer){
      s += clipTo(B,
        fill(pd(outer), '#fff0a6', `opacity="${f(.62 * st.lampGlow)}"`) +
        (core ? fill(pd(core), '#fffbe3', `opacity="${f(.55 * st.lampGlow)}"`) : '')
      );
    }
  }
  return s;
}

