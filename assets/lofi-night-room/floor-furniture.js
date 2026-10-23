/* ---------- 7. Floor Furniture (Swivel Study Chair & Monstera Floor Plant) ---------- */

// 7A. Swivel Study Chair: x ∈ [62, 86], y ∈ [56, 80], z ∈ [5, 54]
function drawStudyChair(st, m){
  const cx = 74, cy = 68;
  const yaw = dRad(st.chairYaw || -18);
  const rotC = (dx, dy, z) => [cx + dx*Math.cos(yaw) - dy*Math.sin(yaw), cy + dx*Math.sin(yaw) + dy*Math.cos(yaw), z];

  let s = '';
  // 5-star caster base + wheels on rug (z = 5.5..8.5)
  for (let i = 0; i < 5; i++){
    const a = yaw + i * 2 * Math.PI / 5;
    const wx = cx + 8.5 * Math.cos(a), wy = cy + 8.5 * Math.sin(a);
    s += cyl(wx, wy, RM_FH + .4, RM_FH + 2.4, 1.3, DARK, toneI, .75, 10);
    s += rod([cx, cy, RM_FH + 3.2], [wx, wy, RM_FH + 2.2], .85, DARK, rodTone, .85);
  }
  // Pneumatic center column (z = 8..21)
  s += cyl(cx, cy, RM_FH + 2.8, 21, 1.6, DARK, toneI, .95, 14);

  // Seat cushion (z = 21..25)
  s += cyl(cx, cy, 21, 25, 8.2, m, tone, 1.3, 24);

  // Armrests on left & right of seat
  for (const sg of [-1, 1]){
    const a0 = rotC(0, sg * 7.8, 23.5), a1 = rotC(0, sg * 8.4, 30.5), a2 = rotC(-3.5, sg * 8.4, 30.5);
    s += rod(a0, a1, .8, DARK, rodTone, .85) + rod(a1, a2, 1.0, DARK, rodTone, .9);
  }

  // Spine bar & curved backrest (at back of chair: +dx in local frame, so chair faces desk at -x)
  const sp0 = rotC(6.8, 0, 23), sp1 = rotC(8.2, 0, 38);
  s += rod(sp0, sp1, 1.2, DARK, rodTone, 1.0);

  // Backrest cushion (boxy rounded pillow rotated by yaw, z = 31..49)
  const bkCorners = [[-1.8,-7.2],[1.8,-7.2],[1.8,7.2],[-1.8,7.2]].map(([dx,dy]) => rotC(7.4 + dx, dy, 0));
  const bA = bkCorners.map(([x,y]) => [x, y, 31]), bB = bkCorners.map(([x,y]) => [x, y, 48]);
  s += loft(bA, bB, n => tone(n, m)) + fill(pd(bB), m.l) + ink(pd(bB), 1.0) + hullInk([...bA, ...bB], 1.6);

  return act('chair', s);
}

// 7B. Monstera Floor Plant in Ceramic Planter: x ∈ [60, 82], y ∈ [92, 114], z ∈ [5, 44]
function drawFloorPlant(){
  const px = 70, py = 102;
  // Wooden stand legs + ceramic planter pot (z = 5..21)
  let s = cyl(px, py, RM_FH, 9, 4.8, M_TRIM, toneI, .9, 16);
  s += cyl(px, py, 8.5, 21, 6.2, CERAMIC, toneI, 1.3, 22);
  // Dark soil top
  const soil = on(PZ(21.05), ellUV(px, py, 5.4, 5.4, 18));
  s += fill(pd(soil), '#3d2b1f') + ink(pd(soil), .6);

  // 6 Monstera stems & broad tropical leaves fanning out (z = 21..42)
  const fronds = [
    [[px, py, 21], [px - 6, py - 5, 34], [px - 9, py - 2, 37], [px - 4, py - 9, 36], M_LEAF],
    [[px, py, 21], [px + 6, py - 4, 36], [px + 9, py - 1, 39], [px + 4, py - 8, 38], M_LEAF2],
    [[px, py, 21], [px + 5, py + 5, 33], [px + 8, py + 3, 36], [px + 3, py + 9, 35], M_LEAF],
    [[px, py, 21], [px - 5, py + 6, 38], [px - 8, py + 3, 41], [px - 2, py + 9, 40], M_LEAF2],
    [[px, py, 21], [px,     py - 2, 40], [px - 3, py - 5, 43], [px + 3, py - 5, 43], M_LEAF2]
  ];
  for (const [st0, b0, l0, r0, lm] of fronds){
    s += line([st0, b0], 1.1);
    const tip = [(l0[0]+r0[0])/2 + (b0[0]-st0[0])*.35, (l0[1]+r0[1])/2 + (b0[1]-st0[1])*.35, Math.max(l0[2],r0[2]) - 1.2];
    s += shape([b0, l0, tip, r0], lm.l, .9);
    s += line([b0, tip], .55);
  }
  return s;
}

