/* ---------- 8. See-Through Mode: Real Room Wiring & Mechanisms (35+ 3D parts) ---------- */
function roomMech(st, g){
  const parts = [], put = (b, svg) => parts.push({ box: b, svg });
  const bx = (x0, y0, z0, x1, y1, z1, M, w = .75) => put([[x0, y0, z0], [x1, y1, z1]], box(x0, y0, z0, x1, y1, z1, M, toneI, w));
  const vc = (x, y, z0, z1, r, M, w = .8, n = 16) => put([[x - r, y - r, z0], [x + r, y + r, z1]], cyl(x, y, z0, z1, r, M, toneI, w, n));
  const wire = (pts, col, w = .45) => {
    const d = pd(pts, false);
    const b = [[0,1,2].map(i => Math.min(...pts.map(p => p[i])) - .8), [0,1,2].map(i => Math.max(...pts.map(p => p[i])) + .8)];
    put(b, `<path d="${d}" fill="none" stroke="${INK}" stroke-width="${f(2*w + 1.0)}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${col}" stroke-width="${f(2*w)}" stroke-linecap="round" stroke-linejoin="round"/>`);
  };

  const pwrOn = st.lampOn || st.fairyOn || st.playing;
  const liveCol = pwrOn ? '#ff8a3a' : '#8a5a3c';

  // 1. Timber wall studs inside Back Wall & Right Wall
  for (const y of [12, 74, 96, 116]) bx(1.5, y - 1.2, RM_FH, 4.5, y + 1.2, RM_H - 1, M_TRIM, .65);
  for (const x of [20, 56, 88, 108]) bx(x - 1.2, 1.5, RM_FH, x + 1.2, 4.5, RM_H - 1, M_TRIM, .65);

  // 2. Main Wall Junction Box & Dimmer Relay (x=1.5..5.2, y=86..94, z=42..52)
  bx(1.5, 86, 42, 5.2, 94, 52, M_IRON, .85);
  bx(2.2, 87.2, 43.5, 5.4, 92.8, 50.5, M_PCB, .7);

  // 3. Fairy Lights Step-Down 12V Transformer (x=1.8..5.4, y=102..110, z=76..83)
  bx(1.8, 102, 76, 5.4, 110, 83, st.fairyOn ? M_GOLD : M_IRON, .85);
  wire([[3.5, 90, 52], [3.5, 90, 79], [3.5, 102, 79]], st.fairyOn ? '#ffcf56' : '#55504a', .45);

  // 4. Wall Duplex Outlet behind Desk (x=2.2..6.2, y=64..70, z=12..18)
  bx(2.2, 64, 12, 6.2, 70, 18, M_IRON, .8);
  wire([[3.5, 90, 42], [3.5, 90, 15], [3.5, 70, 15]], liveCol, .5);

  // 5. Under-Desk Surge Protector Power Strip & Busbars (x=18..24, y=58..82, z=5.2..8.5)
  bx(18, 58, RM_FH + .2, 24, 82, RM_FH + 3.4, CERAMIC, .9);
  bx(19.2, 60, RM_FH + 3.4, 22.8, 80, RM_FH + 3.9, M_COPPER, .65);
  wire([[6.2, 67, 15], [12, 67, 15], [12, 67, 6.8], [18, 67, 6.8]], liveCol, .55);

  // 6. Cords from Surge Strip up to Desk Lamp & Turntable
  wire([[21, 79, 8.5], [21, 94, 8.5], [21, 94, 33]], st.lampOn ? '#ff9a3a' : '#4a4339', .45);
  wire([[21, 61, 8.5], [21, 38, 8.5], [21, 38, 33]], st.playing ? '#43c25c' : '#4a4339', .45);

  // 7. Desk Lamp Internal Mechanism: Counterweight, Switch PCB, Internal Arm Wire, Socket & LED Emitter
  vc(L_BX, L_BY, L_BZ + .3, L_BZ + 1.6, 5.2, M_IRON, .85, 20);
  bx(L_BX + .8, L_BY - 3.8, L_BZ + 1.6, L_BX + 4.4, L_BY + 1.2, L_BZ + 2.4, M_PCB, .7);
  wire([
    [L_BX, L_BY, L_BZ + 2.2], g.Sh, g.El, g.Wr, g.at(2.0)
  ], st.lampOn ? '#ffb347' : '#4a4339', .4);
  const ledPos = g.at(L_BULB_T);
  vc(ledPos[0], ledPos[1], ledPos[2] - 1.2, ledPos[2] + 1.2, 2.1, st.lampOn ? M_GOLD : METAL, .8, 14);

  // 8. Vinyl Turntable Internal Mechanism: DC Motor, Brass Pulley, Rubber Drive Belt, Platter Hub, Phono Preamp PCB
  vc(23.5, 43.5, 33.4, 36.2, 2.2, M_IRON, .85, 16);     // DC brushless motor
  vc(23.5, 43.5, 36.2, 37.0, .8,  M_GOLD, .7, 12);      // Motor brass pulley
  vc(30.0, 38.5, 33.4, 36.8, 3.8, METAL, .85, 20);      // Platter sub-hub & spindle bearing
  // Drive belt loop between motor pulley and platter sub-hub
  wire([[23.5, 44.3, 36.4], [30.0, 42.2, 36.4], [33.5, 38.5, 36.4], [29.2, 34.8, 36.4], [22.8, 42.9, 36.4], [23.5, 44.3, 36.4]], '#272421', .35);
  // Phono preamp PCB & tonearm pickup lead
  bx(33.5, 28.0, 33.6, 39.5, 35.5, 34.8, M_PCB, .75);
  wire([[22.5, 29.0, 36.5], [27.0, 29.5, 34.5], [33.5, 31.0, 34.5]], st.playing ? '#43c25c' : '#65645f', .35);

  // 9. Steel Ball-Bearing Drawer Slides inside Desk Cabinet
  const dx = 10 * (st.drawer || 0);
  bx(18, 24.6, 22.0, 53 + dx, 25.4, 23.4, METAL, .7);
  bx(18, 46.6, 22.0, 53 + dx, 47.4, 23.4, METAL, .7);

  // 10. Swivel Chair Pneumatic Gas-Lift Cylinder & Coil Spring
  vc(74, 68, RM_FH + 2.5, 21.5, 1.2, M_IRON, .85, 14);
  vc(74, 68, 15.0, 20.5, 2.1, M_GOLD, .75, 14);

  return byDepth(parts);
}

