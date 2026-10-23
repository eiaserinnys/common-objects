/* ---------- 3. Wall-Mounted Items (Window Sill + Cat, Bookshelf + Pothos, Fairy Lights) ---------- */
function drawWindowSillAndCat(st){
  // Sill spans x: 6..14.2, y: 14..74, z: 33.2..35.5
  let s = box(RM_WT, 14, 33.2, 14.2, 74, 35.5, M_TRIM, toneI, 1.1);

  // Small succulent on right end of sill (x=10, y=21, z=35.5..41)
  s += cyl(10, 21, 35.5, 39.2, 2.6, CERAMIC, toneI, .9, 16);
  s += cyl(10, 21, 39.2, 41.2, 1.8, M_LEAF, toneI, .8, 12);

  // Sleeping Ginger Tabby Cat curled on the sill (center x=10.2, y=46, z=35.5)
  const cx = 10.2, cy = 46, cz = 35.5;
  // Torso loaf (elliptical dome built from 3 stacked rings)
  const cR0 = on(PZ(cz),       ellUV(cx, cy, 3.4, 6.2, 24));
  const cR1 = on(PZ(cz + 2.6), ellUV(cx, cy, 3.3, 5.8, 24));
  const cR2 = on(PZ(cz + 4.5), ellUV(cx, cy - .3, 2.5, 4.2, 24));
  let catSvg = loft(cR0, cR1, n => toneI(n, M_CAT))
             + loft(cR1, cR2, n => toneI(n, M_CAT))
             + fill(pd(cR2), M_CAT.l)
             + hullInk([...cR0, ...cR1, ...cR2], 1.4);

  // Tabby stripes on back
  for (const dy of [-2.2, 0, 2.0]){
    catSvg += line([[cx - 1.8, cy + dy, cz + 4.3], [cx + 2.0, cy + dy, cz + 4.1]], .85);
  }

  // Cat Head at front-left of body (x = cx + 0.8, y = cy + 5.2, z = cz + 3.2)
  const hx = cx + .7, hy = cy + 5.0, hz = cz + 3.1 + (st.catAwake > 0 ? .6 : 0);
  const [hX, hY] = P(hx, hy, hz), hR = 3.2 * 1.2247;
  // Ears
  for (const sg of [-1, 1]){
    const ex = hX + sg * hR * .58, ey = hY - hR * .65;
    catSvg += `<path d="M${f(ex - hR*.28)} ${f(ey + hR*.15)}L${f(ex + sg*hR*.1)} ${f(ey - hR*.48)}L${f(ex + hR*.28)} ${f(ey + hR*.15)}Z" fill="${M_CAT.m}" stroke="${INK}" stroke-width="${f(.9*INK_K)}" stroke-linejoin="round"/>`;
    catSvg += `<path d="M${f(ex - hR*.14)} ${f(ey + hR*.08)}L${f(ex + sg*hR*.06)} ${f(ey - hR*.26)}L${f(ex + hR*.14)} ${f(ey + hR*.08)}Z" fill="#f3a6bb"/>`;
  }
  // Head sphere
  catSvg += `<circle cx="${f(hX)}" cy="${f(hY)}" r="${f(hR)}" fill="${M_CAT.l}" stroke="${INK}" stroke-width="${f(1.1*INK_K)}"/>`;
  // Eyes (sleeping curved arcs, or bright awake eyes when clicked)
  if (st.catAwake > 0){
    catSvg += `<circle cx="${f(hX - hR*.34)}" cy="${f(hY + hR*.04)}" r="${f(hR*.12)}" fill="${INK}"/>`;
    catSvg += `<circle cx="${f(hX + hR*.34)}" cy="${f(hY + hR*.04)}" r="${f(hR*.12)}" fill="${INK}"/>`;
  } else {
    catSvg += `<path d="M${f(hX - hR*.48)} ${f(hY + hR*.05)}Q${f(hX - hR*.32)} ${f(hY + hR*.22)} ${f(hX - hR*.16)} ${f(hY + hR*.05)}" fill="none" stroke="${INK}" stroke-width="${f(.75*INK_K)}" stroke-linecap="round"/>`;
    catSvg += `<path d="M${f(hX + hR*.16)} ${f(hY + hR*.05)}Q${f(hX + hR*.32)} ${f(hY + hR*.22)} ${f(hX + hR*.48)} ${f(hY + hR*.05)}" fill="none" stroke="${INK}" stroke-width="${f(.75*INK_K)}" stroke-linecap="round"/>`;
  }
  // Pink nose
  catSvg += `<circle cx="${f(hX)}" cy="${f(hY + hR*.22)}" r="${f(hR*.1)}" fill="#f2849a"/>`;

  // Swishing Tail hanging/curling at y = cy - 5.8
  const swish = Math.sin(st.tailPhase || 0) * 2.6;
  const tailPts = [
    [cx, cy - 5.4, cz + 1.8],
    [cx + 1.6, cy - 7.8, cz + 1.5 + swish * .3],
    [cx + 2.4, cy - 10.2 + swish, cz + 2.8 + Math.abs(swish) * .4]
  ];
  const td = pd(tailPts, false);
  catSvg += `<path d="${td}" fill="none" stroke="${INK}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>`;
  catSvg += `<path d="${td}" fill="none" stroke="${M_CAT.l}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`;

  s += act('cat', catSvg);
  return s;
}

function drawWallShelfAndPlant(m){
  // Shelf on back wall: x: 6..14.2, y: 78..114, z: 56..76
  let s = box(RM_WT, 78, 56, 14.0, 114, 58, M_TRIM, toneI, 1.0);
  // Brackets under shelf
  s += box(RM_WT, 82, 52, 12.5, 83.2, 56, DARK, toneI, .7);
  s += box(RM_WT, 109, 52, 12.5, 110.2, 56, DARK, toneI, .7);

  // Stack of books on the shelf (y = 80..98, z = 58..70)
  const books = [
    [80.5, 83.0, 69.5, PALS.cobalt],
    [83.2, 85.8, 70.8, PALS.mustard],
    [86.0, 88.2, 68.5, m],
    [88.4, 91.2, 70.2, PALS.mint],
    [91.4, 94.0, 69.0, CERAMIC]
  ];
  for (const [by0, by1, bz1, bm] of books){
    s += box(7.0, by0, 58, 13.0, by1, bz1, bm, toneI, .8);
  }
  // Bookend
  s += box(7.2, 94.2, 58, 12.6, 95.2, 64, DARK, toneI, .7);

  // Terracotta pot with Trailing Pothos Plant (x = 10.2, y = 106, z = 58..66)
  s += cyl(10.2, 106, 58, 65.2, 3.6, M_TERRA, toneI, 1.0, 18);
  s += cyl(10.2, 106, 64.8, 66.2, 3.9, M_TERRA, toneI, .9, 18);
  // Crown leaves & cascading vine down to z = 47
  const leaves = [
    [[10.2,106,66.2],[8.5,103,70.5],[11.5,101,69.5]],
    [[10.2,106,66.2],[12.5,108,71.2],[9.2,110,70.0]],
    [[10.2,106,66.2],[13.5,104,68.8],[13.8,107,66.8]],
    // Hanging vine leaves cascading over the front/left edge
    [[12.8,108.5,64.0],[14.2,110.5,61.2],[11.6,111.5,60.5]],
    [[12.6,110.2,59.5],[14.1,112.0,56.2],[11.4,112.8,55.8]],
    [[12.2,111.0,54.8],[13.8,112.5,51.2],[11.2,113.0,50.8]],
    [[11.8,111.5,49.8],[13.2,112.8,46.6],[10.8,112.5,46.2]]
  ];
  s += line([[10.8,107,66],[12.8,109.5,62],[12.5,111.2,56],[11.8,112,47]], .9);
  for (const tri of leaves){
    s += shape(tri, M_LEAF.l, .8);
  }
  return s;
}

function drawFairyLights(st){
  // Fairy string lights draped along Back Wall (x=6.8, y=10..116, z=82..86) and Right Wall (x=10..106, y=6.8, z=82..86)
  let s = '';
  const lit = st.fairyGlow > .05;
  // Back wall string
  const bPts = [];
  for (let y = 10; y <= 115; y += 3){
    const sag = Math.sin(((y - 10) / 15) * Math.PI);
    bPts.push([RM_WT + .7, y, 85.5 - 2.6 * Math.abs(sag)]);
  }
  s += line(bPts, .75);
  for (let y = 16; y <= 112; y += 12){
    const sag = Math.sin(((y - 10) / 15) * Math.PI);
    const bz = 85.5 - 2.6 * Math.abs(sag) - .8;
    const [X, Y] = P(RM_WT + .9, y, bz);
    if (lit && st.dark) s += `<circle cx="${f(X)}" cy="${f(Y)}" r="${f(7.4*INK_K)}" fill="#ffcf5c" opacity="${f(.26*st.fairyGlow)}"/>`;
    if (lit) s += `<circle cx="${f(X)}" cy="${f(Y)}" r="${f(4.6*INK_K)}" fill="#ffe078" opacity="${f((st.dark ? .55 : .42)*st.fairyGlow)}"/>`;
    s += `<circle cx="${f(X)}" cy="${f(Y)}" r="${f(1.8*INK_K)}" fill="${lit ? '#fff6c2' : '#e6e1d4'}" stroke="${INK}" stroke-width="${f(.7*INK_K)}"/>`;
  }

  // Right wall string
  const rPts = [];
  for (let x = 10; x <= 106; x += 3){
    const sag = Math.sin(((x - 10) / 16) * Math.PI);
    rPts.push([x, RM_WT + .7, 85.5 - 2.6 * Math.abs(sag)]);
  }
  s += line(rPts, .75);
  for (let x = 16; x <= 104; x += 14){
    const sag = Math.sin(((x - 10) / 16) * Math.PI);
    const bz = 85.5 - 2.6 * Math.abs(sag) - .8;
    const [X, Y] = P(x, RM_WT + .9, bz);
    if (lit && st.dark) s += `<circle cx="${f(X)}" cy="${f(Y)}" r="${f(7.4*INK_K)}" fill="#ffcf5c" opacity="${f(.26*st.fairyGlow)}"/>`;
    if (lit) s += `<circle cx="${f(X)}" cy="${f(Y)}" r="${f(4.6*INK_K)}" fill="#ffe078" opacity="${f((st.dark ? .55 : .42)*st.fairyGlow)}"/>`;
    s += `<circle cx="${f(X)}" cy="${f(Y)}" r="${f(1.8*INK_K)}" fill="${lit ? '#fff6c2' : '#e6e1d4'}" stroke="${INK}" stroke-width="${f(.7*INK_K)}"/>`;
  }
  return act('fairy', s);
}

