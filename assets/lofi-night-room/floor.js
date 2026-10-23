/* ---------- 1. Floor Slab, Rug & Shadows (z = 0..5) ---------- */
const FLOOR_TOP = boardTop(0, 0, RM_W, RM_D, RM_FH, 6);
const INNER_FLOOR = on(PZ(RM_FH + .02), rectUV(RM_WT, RM_WT, RM_W - 2, RM_D - 2));

function drawFloor(st, m, g){
  let s = board(0, 0, RM_W, RM_D, RM_FH, 6, WOOD);
  // hardwood plank lines on top of floor
  if (vis([0,0,1])){
    let pl = '';
    for (let y = 18; y < RM_D - 4; y += 12){
      pl += pd([[RM_WT, y, RM_FH+.02], [RM_W - 3, y, RM_FH+.02]], false);
    }
    for (let y = 18; y < RM_D - 12; y += 12){
      const xj = 28 + ((y * 17) % 58);
      pl += pd([[xj, y, RM_FH+.02], [xj, y + 12, RM_FH+.02]], false);
    }
    s += `<path d="${pl}" fill="none" stroke="${WOOD.d}" stroke-width=".55" opacity=".55"/>`;

    // moonlight window patch on floor when night window is visible
    const moonOp = st.dark ? Math.max(.16, .38 - .18 * st.lampGlow) : Math.max(.08, .22 - .12 * st.lampGlow);
    const moonQuad = [[14, 18, RM_FH+.03], [68, 22, RM_FH+.03], [74, 72, RM_FH+.03], [14, 70, RM_FH+.03]];
    s += clipTo(INNER_FLOOR, fill(pd(moonQuad), st.dark ? '#6999eb' : '#76a0e2', `opacity="${f(moonOp)}"`));

    // warm ambient floor glow when lamp or fairy lights are on
    const warmFloor = (st.dark ? .26 : .18) * st.lampGlow + (st.dark ? .14 : .08) * st.fairyGlow;
    if (warmFloor > .01){
      const glowPts = on(PZ(RM_FH+.04), ellUV(44, 72, 38, 42, 28));
      s += clipTo(INNER_FLOOR, fill(pd(glowPts), '#ffe699', `opacity="${f(warmFloor)}"`));
    }
  }

  // cast shadows on floor
  const shParts = [
    // desk cabinet & legs
    [[16,24,RM_FH],[54,48,33],[16,102,33],[54,102,33]],
    // chair
    [[66,60,RM_FH],[82,76,48]],
    // floor plant
    [[64,96,RM_FH],[76,108,38]],
    // vinyl crate
    [[64,6.5,RM_FH],[102,19,24]]
  ];
  s += clipTo(INNER_FLOOR, shParts.map(pts => castShadow([
    [pts[0][0],pts[0][1],pts[0][2]], [pts[1][0],pts[0][1],pts[1][2]],
    [pts[1][0],pts[1][1],pts[1][2]], [pts[0][0],pts[1][1],pts[1][2]]
  ], RM_FH)).join(''));

  // woven round rug under the chair (x=74, y=68, r=21)
  const rx = 74, ry = 68, rr = 21;
  const rA = on(PZ(RM_FH + .05), ellUV(rx, ry, rr, rr, 36));
  const rB = on(PZ(RM_FH + .45), ellUV(rx, ry, rr, rr, 36));
  const rMid = on(PZ(RM_FH + .48), ellUV(rx, ry, rr * .74, rr * .74, 32));
  const rIn  = on(PZ(RM_FH + .50), ellUV(rx, ry, rr * .42, rr * .42, 24));
  s += loft(rA, rB, n => toneI(n, M_RUG)) + fill(pd(rB), M_RUG.l)
     + fill(pd(rMid), mix(m.l, '#f2efe7', .35)) + ink(pd(rMid), .6)
     + fill(pd(rIn), '#fbf8ee') + ink(pd(rIn), .5)
     + ink(pd(rB), 1.1);
  // rug fringe ticks along +x and -x edges
  let fr = '';
  for (let a = -50; a <= 50; a += 14){
    const ra = dRad(a);
    fr += pd([[rx + rr*Math.cos(ra), ry + rr*Math.sin(ra), RM_FH+.2],
              [rx + (rr+2.2)*Math.cos(ra), ry + (rr+2.2)*Math.sin(ra), RM_FH+.1]], false);
    fr += pd([[rx - rr*Math.cos(ra), ry + rr*Math.sin(ra), RM_FH+.2],
              [rx - (rr+2.2)*Math.cos(ra), ry + (rr+2.2)*Math.sin(ra), RM_FH+.1]], false);
  }
  s += `<path d="${fr}" fill="none" stroke="${INK}" stroke-width=".65" stroke-linecap="round"/>`;
  return s;
}

