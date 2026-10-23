/* ---------- 9. Complete Scene Assembly (sorted back-to-front from every angle) ---------- */
function scene(st, m){
  syncThemeMaterials(st);
  const g = lampGeo(st.ang);

  // Floor slab is always at the bottom (z = 0..5, camera pitch > 0)
  const floorSvg = drawFloor(st, m, g);

  // All 3D blocks above z = 5 with non-overlapping bounding boxes
  const blocks = [
    { box:[[0, 0, RM_FH], [RM_WT, RM_WT, RM_H]],           svg: drawCornerPillar(m) },
    { box:[[0, RM_WT, RM_FH], [RM_WT, RM_D, RM_H]],        svg: drawBackWall(st, m) },
    { box:[[RM_WT, 0, RM_FH], [RM_W, RM_WT, RM_H]],        svg: drawRightWall(st, m) },
    { box:[[RM_WT, 14, 33.2], [14.2, 74, 46]],             svg: drawWindowSillAndCat(st) },
    { box:[[RM_WT, 78, 46],   [14.2, 114, 76]],            svg: drawWallShelfAndPlant(m) },
    { box:[[RM_WT, RM_WT, 81],[RM_W, RM_D, 87]],           svg: drawFairyLights(st) },
    { box:[[64, 6.2, RM_FH],  [102, 20, 32]],              svg: drawVinylCrate(st, m) },
    { box:[[15, 22, RM_FH],   [55.5 + 10*(st.drawer||0), 104, 30]], svg: drawDeskUnder(st) },
    { box:[[15, 22, 30],      [56, 104, 33]],              svg: drawDeskTop(st, g) },
    { box:[[18, 25, 33],      [42, 49, 45]],               svg: drawTurntable(st, m) },
    { box:[[45, 34, 33],      [53, 42, 44]],               svg: drawCoffeeMug(st, m) },
    { box:[[28, 53, 33],      [51, 81, 39]],               svg: drawNotebookAndPen(st, m) },
    { box:[[16, 84, 33],      [35, 102, 74]],              svg: drawDeskLamp(st, m, g) },
    { box:[[38, 84, 33],      [53, 101, 40]],              svg: drawHeadphones(st, m) },
    { box:[[62, 56, RM_FH],   [86, 80, 52]],               svg: drawStudyChair(st, m) },
    { box:[[60, 92, RM_FH],   [82, 114, 44]],              svg: drawFloorPlant() }
  ];

  const roomSvg = floorSvg + byDepth(blocks);
  const kx = ease(st.xr || 0);
  if (kx > 0){
    return `<g opacity="${f(1 - .64 * kx)}">${roomSvg}</g><g opacity="${f(kx)}">${roomMech(st, g)}</g>`;
  }
  return roomSvg;
}

/* ---------- 10. Labels (See-through callouts + Surface callouts) ---------- */
const XR_OPTS = {
  getSt: () => { try { return ui.st; } catch (e) { return {}; } },
  B: [0, RM_W, 0, RM_D, 0, RM_H],
  inline: true,
  mech: () => '',
  inside: st => {
    const g = lampGeo(st.ang || LAMP_POSES.read.a);
    const pwr = st.lampOn || st.fairyOn || st.playing;
    return [
      { at:[3.5, 90, 47],      text:'DIMMER RELAY',      on: pwr },
      { at:[3.5, 106, 80],     text:'12V TRANSFORMER',   on: !!st.fairyOn },
      { at:[4.2, 67, 15],      text:'WALL OUTLET',       on: pwr },
      { at:[21, 70, 7],        text:'SURGE STRIP',       on: pwr },
      { at:[L_BX + 2, L_BY, L_BZ + 2], text:'LAMP SWITCH PCB', on: !!st.lampOn },
      { at:g.El,               text:'FRICTION JOINT',    on: !!st.moving },
      { at:g.at(L_BULB_T),     text:'LED EMITTER',       on: !!st.lampOn },
      { at:[23.5, 43.5, 35],   text:'BELT-DRIVE MOTOR',  on: !!st.playing },
      { at:[36.5, 31.5, 34.5], text:'PHONO PREAMP',      on: !!st.playing },
      { at:[42, 25, 22.8],     text:'DRAWER SLIDES',     on: (st.drawer || 0) > .1 },
      { at:[74, 68, 15],       text:'GAS LIFT COLUMN',   on: !!st.chairAnim }
    ];
  },
  surface: st => {
    const g = lampGeo(st.ang || LAMP_POSES.read.a);
    return [
      { at:[3, 44, 62],        text:'NIGHT WINDOW',      on: !!st.rain },
      { at:[10.2, 46, 40],     text:'SLEEPING CAT',      on: st.catAwake > 0 || !!st.playing },
      { at:[7, 96, 84],        text:'FAIRY LIGHTS',      on: !!st.fairyOn },
      { at:[10.2, 106, 65],    text:'POTHOS PLANT',      on: false },
      { at:g.at(L_SHD_LEN),    text:'DESK LAMP',         on: !!st.lampOn },
      { at:[30, 38.5, 38],     text:'VINYL TURNTABLE',   on: !!st.playing },
      { at:[39, 66, 34.5],     text:'STUDY NOTEBOOK',    on: (st.pageFlip || 0) > .02 },
      { at:[45, 92, 36],       text:'HEADPHONES',        on: !!st.playing },
      { at:[48.5, 38, 39],     text:'HOT COFFEE MUG',    on: true },
      { at:[74, 68, 38],       text:'SWIVEL CHAIR',      on: false }
    ];
  }
};

const XR_CAPTION = st => {
  if (st.playing) return 'Turntable on: the brushless DC motor drives the platter sub-hub via a rubber belt at 33 RPM, while the cartridge signal runs through the tonearm leads to the phono preamp.';
  if (st.lampOn) return 'Lamp on: mains from the wall outlet feeds the under-desk surge strip; the base PCB switch closes the circuit up the hollow arm tubes and joint bolts to the warm LED emitter.';
  return 'Inside: timber wall studs carry Romex conduit from the dimmer relay to the wall outlet, 12V fairy-light transformer, under-desk surge strip, lamp PCB, and belt-drive turntable.';
};

