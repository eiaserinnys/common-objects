/* ---------- 11. Interactive Animations & Actions ---------- */
let ui, ambLoop = false;

function ensureLoop(){
  if (ambLoop || !ui) return;
  ambLoop = true;
  ui.animate(dt => {
    const st = ui.st;
    let active = false;

    // 1. Lamp switch & warm glow fade
    if (st.pressT > 0){ st.pressT = Math.max(0, st.pressT - dt); active = true; }
    const lGoal = st.lampOn ? 1 : 0;
    if (Math.abs(st.lampGlow - lGoal) > 1e-3){
      st.lampGlow += Math.sign(lGoal - st.lampGlow) * Math.min(Math.abs(lGoal - st.lampGlow), dt / .32);
      active = true;
    }

    // 2. Fairy lights glow fade
    const fGoal = st.fairyOn ? 1 : 0;
    if (Math.abs(st.fairyGlow - fGoal) > 1e-3){
      st.fairyGlow += Math.sign(fGoal - st.fairyGlow) * Math.min(Math.abs(fGoal - st.fairyGlow), dt / .35);
      active = true;
    }

    // 3. Lamp arm pose interpolation
    if (st.moving){
      st.poseK = Math.min(1, st.poseK + dt / .85);
      const e = ease(st.poseK);
      st.ang = st.fromAng.map((a, i) => a + (st.toAng[i] - a) * e);
      if (st.poseK >= 1) st.moving = false;
      else active = true;
    }

    // 4. Turntable tonearm & vinyl spin
    const aGoal = st.playing ? 1 : 0;
    if (Math.abs(st.armPos - aGoal) > 1e-3){
      st.armPos += Math.sign(aGoal - st.armPos) * Math.min(Math.abs(aGoal - st.armPos), dt / .55);
      active = true;
    }
    if (st.playing && st.spinTimer > 0){
      st.spinTimer = Math.max(0, st.spinTimer - dt);
      st.spinAngle = ((st.spinAngle || 0) + dt * 160) % 360;
      st.tailPhase = (st.tailPhase || 0) + dt * 4.2;
      st.steamPhase = (st.steamPhase || 0) + dt * 3.0;
      active = true;
    }

    // 5. Window rain animation burst
    if (st.rain && st.rainTimer > 0){
      st.rainTimer = Math.max(0, st.rainTimer - dt);
      st.rainPhase = ((st.rainPhase || 0) + dt * 2.4) % 10;
      active = true;
    }

    // 6. Notebook page flip
    if (st.pageFlip > 0){
      st.pageFlip = Math.min(1, st.pageFlip + dt / .65);
      if (st.pageFlip >= 1){ st.pageFlip = 0; st.pageIdx = (st.pageIdx + 1) % 3; }
      else active = true;
    }

    // 7. Desk drawer slide
    const dGoal = st.drawerOpen ? 1 : 0;
    if (Math.abs(st.drawer - dGoal) > 1e-3){
      st.drawer += Math.sign(dGoal - st.drawer) * Math.min(Math.abs(dGoal - st.drawer), dt / .5);
      active = true;
    }

    // 8. Cat purr/wake reaction
    if (st.catAwake > 0){
      st.catAwake = Math.max(0, st.catAwake - dt);
      st.tailPhase = (st.tailPhase || 0) + dt * 6.5;
      active = true;
    }

    // 9. Chair swivel
    if (st.chairAnim){
      st.chairK = Math.min(1, st.chairK + dt / .6);
      st.chairYaw = st.chairFrom + (st.chairTo - st.chairFrom) * ease(st.chairK);
      if (st.chairK >= 1) st.chairAnim = false;
      else active = true;
    }

    if (!active) ambLoop = false;
    return active;
  });
}

function toggleLamp(st, ui){
  st.lampOn = !st.lampOn;
  st.pressT = .18;
  ui.flash(st.lampOn ? 'Desk lamp switched on - warm study pool lit' : 'Desk lamp switched off - moonlight mode');
  ensureLoop();
}

function setLampPose(poseKey){
  return (st, ui) => {
    st.pose = poseKey;
    st.fromAng = st.ang.slice();
    st.toAng = LAMP_POSES[poseKey].a.slice();
    st.poseK = 0;
    st.moving = true;
    ui.flash(`Lamp arm posed to ${LAMP_POSES[poseKey].label.toLowerCase()}`);
    ensureLoop();
  };
}

function toggleTurntable(st, ui){
  st.playing = !st.playing;
  if (st.playing){
    st.spinTimer = 4.0;
    ui.flash('Playing lo-fi vinyl beats (33 RPM)');
  } else {
    st.spinTimer = 0;
    ui.flash('Turntable paused - tonearm parked');
  }
  ensureLoop();
}

function setAmbiance(mode){
  return (st, ui) => {
    if (mode === 'fairy'){
      st.fairyOn = !st.fairyOn;
      ui.flash(st.fairyOn ? 'Fairy string lights switched on' : 'Fairy string lights switched off');
    } else if (mode === 'rain'){
      st.rain = !st.rain;
      if (st.rain) st.rainTimer = 3.5;
      ui.flash(st.rain ? 'Midnight rain pattering on the window' : 'Skies cleared outside the window');
    } else if (mode === 'cozy'){
      st.lampOn = true; st.fairyOn = true; st.rain = true; st.rainTimer = 3.5;
      ui.flash('Full cozy lo-fi night mode active');
    } else if (mode === 'quiet'){
      st.lampOn = false; st.fairyOn = false; st.rain = false; st.playing = false;
      ui.flash('Quiet midnight room - moonlight only');
    }
    ensureLoop();
  };
}

function flipNotebookOrDrawer(st, ui){
  st.pageFlip = .03;
  st.drawerOpen = !st.drawerOpen;
  ui.flash(st.drawerOpen ? 'Notebook page turned / desk drawer opened' : 'Notebook page turned / desk drawer closed');
  ensureLoop();
}

const wrappedScene = xrWrap(scene, XR_OPTS);

ui = mountFigure({
  fig: '27',
  turn: 'full',
  title: 'Lo-fi night room',
  size: [RM_W, RM_D, RM_H],
  palette: 'tomato',
  state: {
    dark: true,
    lampOn: true, lampGlow: 1, pressT: 0,
    pose: 'read', ang: LAMP_POSES.read.a.slice(), moving: false, poseK: 0,
    fairyOn: true, fairyGlow: 1,
    rain: true, rainPhase: 1.2, rainTimer: 0,
    playing: true, armPos: 1, spinAngle: 25, spinTimer: 0,
    tailPhase: 0.6, catAwake: 0,
    steamPhase: 0.4,
    pageIdx: 0, pageFlip: 0,
    drawerOpen: false, drawer: 0,
    chairYaw: -18, chairAnim: false, chairK: 0
  },
  scene: wrappedScene,
  stats: st => {
    const g = lampGeo(st.ang);
    return [
      { label: 'Desk light', value: lampLux(g, st) + ' lx' },
      { label: 'Turntable',  value: st.playing ? '33 RPM / ON' : 'PAUSED', small: true }
    ];
  },
  buttons: [
    { label: 'Desk lamp', onClick: toggleLamp },
    { label: 'Lamp pose', choices: st => Object.keys(LAMP_POSES).map(k => ({
        label: LAMP_POSES[k].label,
        current: st.pose === k && !st.moving,
        onClick: setLampPose(k)
      }))
    },
    { label: 'Lo-fi beats', onClick: toggleTurntable },
    { label: 'Night ambiance', choices: st => [
        { label: st.fairyOn ? 'Fairy lights: on' : 'Fairy lights: off', onClick: setAmbiance('fairy') },
        { label: st.rain ? 'Window rain: on' : 'Window rain: off',      onClick: setAmbiance('rain') },
        { label: 'All cozy on',  current: st.lampOn && st.fairyOn && st.rain, onClick: setAmbiance('cozy') },
        { label: 'Moonlight only', current: !st.lampOn && !st.fairyOn && !st.rain && !st.playing, onClick: setAmbiance('quiet') }
      ]
    },
    { label: 'Turn page / drawer', onClick: flipNotebookOrDrawer }
  ],
  acts: {
    lampSwitch: (st, el, ui) => toggleLamp(st, ui),
    lampShade:  (st, el, ui) => {
      const ks = Object.keys(LAMP_POSES), next = ks[(ks.indexOf(st.pose) + 1) % ks.length];
      setLampPose(next)(st, ui);
    },
    turntable:  (st, el, ui) => toggleTurntable(st, ui),
    headphones: (st, el, ui) => toggleTurntable(st, ui),
    window:     (st, el, ui) => setAmbiance('rain')(st, ui),
    fairy:      (st, el, ui) => setAmbiance('fairy')(st, ui),
    cat:        (st, el, ui) => {
      st.catAwake = 1.6;
      ui.flash('Purr... the ginger cat stretches on the windowsill');
      ensureLoop();
    },
    notebook:   (st, el, ui) => {
      st.pageFlip = .03;
      ui.flash('Flipped to the next study notebook spread');
      ensureLoop();
    },
    drawer:     (st, el, ui) => {
      st.drawerOpen = !st.drawerOpen;
      ui.flash(st.drawerOpen ? 'Desk drawer slid open - cassette tape inside' : 'Desk drawer closed');
      ensureLoop();
    },
    mug:        (st, el, ui) => {
      st.steamPhase = (st.steamPhase || 0) + 1.5;
      ui.flash('Fresh hot cocoa steaming in the ceramic mug');
    },
    chair:      (st, el, ui) => {
      st.chairFrom = st.chairYaw;
      st.chairTo = st.chairYaw < 0 ? 18 : -18;
      st.chairK = 0;
      st.chairAnim = true;
      ui.flash('Swivelled the study chair');
      ensureLoop();
    }
  },
  params: (st, q) => {
    const thm = q.get('theme') || q.get('dark');
    if (thm === '0' || thm === 'light') st.dark = false;
    else if (thm === '1' || thm === 'dark') st.dark = true;
    document.documentElement.classList.toggle('dark', !!st.dark);
    if (q.get('lamp') === '0'){ st.lampOn = false; st.lampGlow = 0; }
    if (q.get('lamp') === '1'){ st.lampOn = true;  st.lampGlow = 1; }
    if (LAMP_POSES[q.get('pose')]){ st.pose = q.get('pose'); st.ang = LAMP_POSES[st.pose].a.slice(); }
    if (q.get('beats') === '0'){ st.playing = false; st.armPos = 0; }
    if (q.get('beats') === '1'){ st.playing = true;  st.armPos = 1; }
    if (q.get('fairy') === '0'){ st.fairyOn = false; st.fairyGlow = 0; }
    if (q.get('rain') === '0') st.rain = false;
    if (q.get('drawer') === '1'){ st.drawerOpen = true; st.drawer = 1; }
  }
});

xrMount(() => ui, XR_CAPTION);
const creditEl = document.querySelector('.made-with');
if (creditEl) {
  creditEl.innerHTML = 'Made with <a href="https://april-zhu.com/colorfigures" target="_blank" rel="noopener">Colorfigures ↗</a> (April Zhu, MIT) / extends <a href="https://github.com/April-Yz/iso-glow" target="_blank" rel="noopener">ISO-GLOW</a> (April Zhu, MIT) &amp; <a href="https://github.com/tolgacohce/iso-figure" target="_blank" rel="noopener">iso-figure</a> (Tolga Cohce, MIT)';
}
