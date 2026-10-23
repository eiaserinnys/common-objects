
/* ============================================================
   Fig. 27 — Lo-fi night room (Colorfigures diorama)
   Real process & how the room works:
   1. Desk lamp switch: closes the low-voltage relay on the base PCB; current runs from the under-desk
      surge strip up the hollow lamp post and twin articulated arms to the warm LED emitter in the shade,
      casting a projected cone and pool of light across the open notebook, fountain pen, and headphones.
   2. Lamp pose: shoulder, elbow, and wrist friction washers slip on their bolts while the helical balance
      spring carries the arm's weight, shifting the beam angle and illuminance (lx) on the desk.
   3. Lo-fi beats (vinyl turntable): the DC brushless motor spins the belt-drive platter at 33 RPM; the
      pivoting S-tonearm lifts off its rest, swings over the vinyl LP, and drops the stylus into the groove,
      feeding the phono preamp and wireless headphone transmitter while the ginger cat swishes its tail.
   4. Night ambiance: switches the 12V step-down transformer for the wall fairy lights and the rain outside
      the casement window overlooking the midnight city skyline.
   5. Study notebook & desk drawer: flips the open study notebook page or slides the ball-bearing desk
      drawer out to reveal a cassette tape and midnight snack.

   Parts list (grouped: structure, furniture, desktop, mechanisms):
   STRUCTURE  oak floor slab . back wall (4 convex sections around window) . recessed casement window .
              mullions & brass latch . exterior brick wall, stone sill, breaker box & conduit . right wall .
              acoustic foam slats . glowing LO-FI wall frame . midnight wall clock . draped fairy string lights
   WINDOW/WALL deep timber windowsill . succulent pot . curled ginger tabby cat (head, ears, stripes, tail) .
              wall bookshelf & iron brackets . leaning books . terracotta pot & cascading pothos vine .
              two framed mini-posters . vinyl record crate & warm paper lantern on the floor
   DESK       right 2-drawer cabinet . slide-out top drawer with cassette & snack . left front/back legs &
              stretcher . rounded timber desktop . woven round floor rug . swivel study chair (5-star base,
              casters, gas column, seat, backrest, armrests) . floor monstera planter & 6 leaves
   DESKTOP    articulated balanced-arm lamp (base, switch, LED, post, arms, hubs, spring, conical shade, bulb) .
              belt-drive vinyl turntable (plinth, platter, LP, label, strobe, pitch slider, S-tonearm) .
              steaming ceramic mug on cork coaster . open study notebook, ribbon & brass pen . over-ear headphones
   SEE-THROUGH wall timber studs . main junction box & dimmer relay . fairy-light step-down transformer .
              wall duplex outlet . in-wall Romex cables . under-desk surge strip & busbars . lamp counterweight,
              switch PCB, internal arm wire & LED board . turntable DC motor, drive belt, platter bearing &
              phono preamp PCB . steel ball-bearing drawer slides . chair pneumatic gas-lift cylinder
   ============================================================ */

const RM_W = 112, RM_D = 120, RM_H = 88, RM_FH = 5, RM_WT = 6;
const dAdd = (a, b) => [a[0]+b[0], a[1]+b[1], a[2]+b[2]];
const dScl = (a, k) => a.map(v => v*k);
const dRad = a => a * Math.PI / 180;

/* ---------- materials ---------- */
let M_WALL   = { l:'#f3ecde', m:'#dfd5c3', d:'#b8ad99' };
const M_BRICK  = { l:'#a86454', m:'#8c4f40', d:'#613328' };
const M_TRIM   = { l:'#c89662', m:'#a87846', d:'#7a542e' };
let M_DESK   = { l:'#dfb07a', m:'#c4925a', d:'#8f6538' };
let M_CAB    = { l:'#c99560', m:'#ad7b47', d:'#7d552c' };
const M_DARKW  = { l:'#695342', m:'#4f3d30', d:'#362920' };
const M_VINYL  = { l:'#383532', m:'#262421', d:'#171614' };
const M_LEAF   = { l:'#6ebf83', m:'#4d9e63', d:'#2d693e' };
const M_LEAF2  = { l:'#88cf96', m:'#62ad73', d:'#3b784a' };
const M_TERRA  = { l:'#e07a58', m:'#c25f3f', d:'#873d25' };
const M_CAT    = { l:'#f29d4b', m:'#d67e2c', d:'#945116' };
let M_RUG    = { l:'#ebe3d2', m:'#d6ccb8', d:'#aba08c' };
const M_GOLD   = { l:'#f5cf62', m:'#d9b043', d:'#9c7a23' };
const M_COPPER = { l:'#e0925b', m:'#bf723f', d:'#854923' };
const M_PCB    = { l:'#4fa36a', m:'#2f8a4a', d:'#1d5f31' };
const M_IRON   = matOf('#6e7378');

function syncThemeMaterials(st){
  if (st && st.dark){
    const w = Math.min(1, .68 * (st.lampGlow ?? 1) + .32 * (st.fairyGlow ?? 1));
    SHADOW = mix('#3b3648', '#6b4c30', w);
    WOOD   = { l: mix('#786a80', '#b88754', w), m: mix('#5c5066', '#966a3d', w), d: mix('#3e3547', '#6b4827', w) };
    M_WALL = { l: mix('#8f96b2', '#dfd0bc', w), m: mix('#737a96', '#c4b49e', w), d: mix('#555b75', '#9c8b76', w) };
    M_DESK = { l: mix('#8c7a72', '#d4a068', w), m: mix('#706059', '#b5814b', w), d: mix('#50443e', '#82592f', w) };
    M_CAB  = { l: mix('#7c6a62', '#bf8852', w), m: mix('#62534c', '#9e6d3c', w), d: mix('#463a35', '#6e4925', w) };
    M_RUG  = { l: mix('#82879e', '#d6cbb6', w), m: mix('#6a6e84', '#bdb29c', w), d: mix('#4f5366', '#968b76', w) };
  } else {
    SHADOW = '#b59b7c';
    WOOD   = { l:'#c9a06c', m:'#a88150', d:'#7a5c36' };
    M_WALL = { l:'#f3ecde', m:'#dfd5c3', d:'#b8ad99' };
    M_DESK = { l:'#dfb07a', m:'#c4925a', d:'#8f6538' };
    M_CAB  = { l:'#c99560', m:'#ad7b47', d:'#7d552c' };
    M_RUG  = { l:'#ebe3d2', m:'#d6ccb8', d:'#aba08c' };
  }
}

/* ---------- lamp kinematics (on desk at x=22, y=94, z=33) ---------- */
const L_BX = 22, L_BY = 94, L_BZ = 33;
const L_PHI = -32 * Math.PI / 180;
const L_U = [Math.cos(L_PHI), Math.sin(L_PHI), 0];
const L_NRM = [-Math.sin(L_PHI), Math.cos(L_PHI), 0];
const L_BASE_H = 3.2, L_POST_TOP = L_BZ + L_BASE_H + 5.2;
const L_ARM1 = 21, L_ARM2 = 19, L_SHD_LEN = 10.5, L_SHD_R0 = 2.6, L_SHD_R1 = 6.8, L_BULB_T = 8.4;

const LAMP_POSES = {
  read: { label:'Reading',    a:[64, -14, -82] },
  low:  { label:'Low focus',  a:[44, -12, -86] },
  wide: { label:'Wide glow',  a:[76,  14, -74] },
};

const lQ = (s, z) => [L_BX + s*L_U[0], L_BY + s*L_U[1], z];
const lDir = a => [Math.cos(dRad(a))*L_U[0], Math.cos(dRad(a))*L_U[1], Math.sin(dRad(a))];
function lampGeo(ang){
  const [a1, a2, a3] = ang;
  const Sh = lQ(0, L_POST_TOP);
  const El = dAdd(Sh, dScl(lDir(a1), L_ARM1));
  const Wr = dAdd(El, dScl(lDir(a2), L_ARM2));
  const dd = lDir(a3);
  return { Sh, El, Wr, dd, at: t => dAdd(Wr, dScl(dd, t)) };
}
function ringAx(c, ax, r, n=16){
  let e1, e2;
  if (Math.abs(dot(ax, L_NRM)) > .9){ e1 = L_U; e2 = [0,0,1]; }
  else if (Math.abs(ax[2]) > .99){ e1 = [1,0,0]; e2 = [0,1,0]; }
  else { e1 = L_NRM; e2 = norm(cross(ax, L_NRM)); }
  return Array.from({length:n}, (_,i) => {
    const t = i/n*2*Math.PI;
    return dAdd(c, dAdd(dScl(e1, r*Math.cos(t)), dScl(e2, r*Math.sin(t))));
  });
}
const rodTone = (n, M) => { const c = tone(n, M); return c === M.d ? M.m : c; };
function cylAx(c0, c1, r, M, sh=tone, w=1.0, n=14){
  const ax = norm(sub(c1, c0)), A = ringAx(c0, ax, r, n), B = ringAx(c1, ax, r, n);
  let s = loft(A, B, nr => sh(nr, M));
  const capB = vis(ax), cap = capB ? B : A, cn = capB ? ax : dScl(ax, -1);
  if (vis(cn)) s += fill(pd(cap), sh(cn, M));
  s += hullInk([...A, ...B], w);
  if (vis(cn)) s += ink(pd(cap), w*.7);
  return s;
}
function lampPoolPts(g, zPlane, frac=1){
  const apex = g.at(-9), rim = ringAx(g.at(L_SHD_LEN), g.dd, L_SHD_R1*frac, 28), out = [];
  for (const p of rim){
    const v = sub(p, apex);
    if (v[2] > -1e-3) return null;
    const k = (zPlane - apex[2]) / v[2];
    out.push(dAdd(apex, dScl(v, k)));
  }
  return out;
}
function lampLux(g, st){
  const base = st.fairyOn ? 45 : 12;
  if (st.lampGlow <= .01 || g.dd[2] >= -.05) return base;
  const b = g.at(L_BULB_T), dist = Math.max(.22, (b[2] - L_BZ) / -g.dd[2] / 42);
  return Math.round(base + st.lampGlow * (115 * -g.dd[2] / (dist*dist)));
}

