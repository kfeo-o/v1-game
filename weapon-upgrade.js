// Local viewmodels and Web Audio for the fictional energy armory.
const NEON_WEAPON_MODS = [
  {
    id: 'quick-loader', name: 'Quick Loader', cost: 90,
    detail: 'Shortens reload time by 25%.',
    tune: weapon => ({...weapon, reload: weapon.reload * .75})
  },
  {
    id: 'extended-cell', name: 'Extended Cell', cost: 105,
    detail: 'Holds about 35% more rounds per magazine.',
    tune: weapon => ({...weapon, magSize: Math.ceil(weapon.magSize * 1.35)})
  },
  {
    id: 'burst-module', name: 'Burst Module', cost: 120, sidearm: true,
    detail: 'Fires three quick rounds per burst. Each shot uses one round.',
    tune: weapon => ({...weapon, pellets: 1,
      damage: weapon.pellets > 1 ? weapon.damage * 2.5 : weapon.damage,
      spread: Math.min(weapon.spread, .016)})
  }
];

(() => {
  'use strict';

  const sidearms = [
    {id: 'arc-pistol', name: 'ARC PISTOL', description: 'Quick reloads and accurate single bolts.',
      magSize: 12, reserveStart: 96, damage: 30, rate: .26, reload: 1.02, pellets: 1,
      spread: .012, speed: 39, color: '#62e5b8', cost: 105},
    {id: 'kestrel', name: 'KESTREL BURST', description: 'Three energy bolts fan out with each shot.',
      magSize: 14, reserveStart: 84, damage: 16, rate: .36, reload: 1.25, pellets: 3,
      spread: .038, speed: 34, color: '#c9a1ff', cost: 185},
    {id: 'ember-cannon', name: 'EMBER HAND CANNON', description: 'Heavy, high-damage bolts with a six-shot cell.',
      magSize: 6, reserveStart: 48, damage: 72, rate: .59, reload: 1.54, pellets: 1,
      spread: .009, speed: 43, color: '#ff965c', cost: 265}
  ];
  for (const {description, ...weapon} of sidearms) {
    WEAPONS.push({...weapon, sidearm: true});
    shopDefs.push({id: weapon.id, name: weapon.name, desc: description, base: weapon.cost, sidearm: true});
  }

  const baseGetWeapon = getWeapon;
  const useCampaignMods = () => !trainingRange && ['PLAYING', 'PAUSED', 'SHOP'].includes(state);
  getWeapon = function () {
    return (useCampaignMods() ? weapons[activeWeapon]?.profile : null) || baseGetWeapon();
  };

  // Finish a burst through the usual firing path so shots still use the active aim,
  // wall collisions, ammunition, and the same restrictions as a trigger pull.
  let burst = null;
  const baseShoot = shoot;
  shoot = function () {
    const slot = weapons[activeWeapon];
    if (state !== 'PLAYING' || !useCampaignMods() || slot?.mod?.id !== 'burst-module') return baseShoot();
    const ammoBefore = slot.mag;
    baseShoot();
    if (slot.mag === ammoBefore) return;
    const remaining = burst?.slot === slot ? burst.remaining - 1 : Math.min(2, slot.mag);
    burst = remaining > 0 ? {slot, remaining} : null;
    fireCooldown = (burst ? .075 : getWeapon().rate * 2.5) / (1 + upg.rate * .12);
  };

  const baseProjectiles = v5Projectiles;
  v5Projectiles = function (dt) {
    if (burst && fireCooldown <= 0) {
      const previous = burst;
      shoot();
      if (burst === previous) burst = null;
    }
    return baseProjectiles(dt);
  };

  const baseEquipWeapon = equipWeapon;
  equipWeapon = function (index) {
    if (!baseEquipWeapon(index)) return false;
    burst = null;
    return true;
  };

  const baseClearHeldInputs = clearHeldInputs;
  clearHeldInputs = function () {
    burst = null;
    baseClearHeldInputs();
  };

  $('hud').querySelector('.hud-tip').append(' · X QUICK SWAP');
  const swapKey = document.createElement('span');
  swapKey.className = 'keycap';
  swapKey.textContent = 'X';
  document.querySelector('.key-help').append(' · ', swapKey, ' Quick swap');

  const slotLabel = document.createElement('div');
  slotLabel.className = 'cap';
  slotLabel.hidden = true;
  $('weapon-name').before(slotLabel);
  let lastArmory, primarySlot = 0, secondarySlot = -1;
  const findOwnedSidearm = () => WEAPONS.findIndex((weapon, i) => weapon.sidearm && weapons[i]?.unlocked);

  function rememberCurrentSlot() {
    if (lastArmory !== weapons) {
      lastArmory = weapons;
      primarySlot = 0;
      secondarySlot = findOwnedSidearm();
    }
    const isSecondary = getWeapon().sidearm;
    if (isSecondary) secondarySlot = activeWeapon;
    else primarySlot = activeWeapon;
  }

  const baseRefresh = refreshHUD;
  refreshHUD = function () {
    baseRefresh();
    rememberCurrentSlot();
    const activeMod = useCampaignMods() ? weapons[activeWeapon]?.mod : null;
    const category = getWeapon().sidearm ? 'Secondary' : 'Primary';
    slotLabel.textContent = activeMod ? `${category} · ${activeMod.name}` : category;
    slotLabel.hidden = secondarySlot < 0 && !activeMod;
  };

  function canSwitch() {
    return (state === 'PLAYING' || state === 'DUEL') && player.hp > 0;
  }
  document.addEventListener('keydown', event => {
    if (event.code !== 'KeyX' || event.repeat || !canSwitch()) return;
    event.preventDefault();
    rememberCurrentSlot();
    if (getWeapon().sidearm) {
      switchWeapon(weapons[primarySlot]?.unlocked ? primarySlot : 0);
      return;
    }
    const sidearm = weapons[secondarySlot]?.unlocked ? secondarySlot : findOwnedSidearm();
    if (sidearm >= 0) switchWeapon(sidearm);
    else toast('BUY A SIDEARM IN THE WAVE SHOP', 1.3);
  });

  const swapButton = document.createElement('button');
  swapButton.type = 'button';
  swapButton.className = 'touch-btn';
  swapButton.textContent = 'SWAP';
  swapButton.setAttribute('aria-label', 'Switch to next weapon');
  swapButton.addEventListener('click', () => {
    if (canSwitch()) cycleWeapon(1);
  });
  $('touch-controls').querySelector('.touch-actions').append(swapButton);

  const profiles = {
    blaster: { chassis: '#334957', plates: '#708b99', style: 'carbine', length: .76, width: .27, recoil: .68, sound: [126, 4800, 510, .11, 1.07, .17] },
    smg: { chassis: '#424034', plates: '#9c9075', style: 'compact', length: .62, width: .25, recoil: .45, sound: [152, 6100, 725, .075, 1.3, .125] },
    shotgun: { chassis: '#523a45', plates: '#aa8495', style: 'twin', length: .83, width: .37, recoil: 1.22, sound: [85, 3100, 240, .21, .78, .22] },
    rifle: { chassis: '#314757', plates: '#91a9b4', style: 'rail', length: 1.19, width: .27, recoil: .90, sound: [107, 6800, 840, .15, .94, .18] },
    ion: { chassis: '#30483c', plates: '#7b9d82', style: 'fork', length: .82, width: .31, recoil: .60, sound: [139, 4600, 1040, .12, 1.09, .17] },
    comet: { chassis: '#543e32', plates: '#b99272', style: 'comet', length: .94, width: .38, recoil: 1.23, sound: [70, 2300, 190, .27, .71, .23] },
    echo: { chassis: '#483957', plates: '#9b8aae', style: 'triple', length: .79, width: .36, recoil: .79, sound: [113, 3700, 435, .145, .97, .18] },
    zenith: { chassis: '#464739', plates: '#9ba78b', style: 'prism', length: .98, width: .33, recoil: .86, sound: [104, 5100, 655, .18, 1.03, .19] },
    meteor: { chassis: '#572f31', plates: '#b8836b', style: 'launcher', length: .93, width: .39, recoil: 1.38, sound: [61, 1950, 180, .33, .65, .24] },
    needle: { chassis: '#36434f', plates: '#a9bac0', style: 'needle', length: 1.38, width: .24, recoil: 1.13, sound: [96, 7600, 1065, .19, .88, .20] },
    thunder: { chassis: '#454631', plates: '#9e9b75', style: 'vented', length: 1.00, width: .30, recoil: .67, sound: [96, 4000, 323, .095, 1.02, .16] },
    orbital: { chassis: '#443854', plates: '#a08bb2', style: 'ring', length: .89, width: .36, recoil: .84, sound: [89, 2900, 378, .24, .85, .18] },
    'arc-pistol': { chassis: '#2b4947', plates: '#80a6a0', style: 'pistol', length: .43, width: .19, recoil: .54, sound: [167, 5700, 860, .082, 1.25, .14] },
    kestrel: { chassis: '#413952', plates: '#9d8eb4', style: 'burst-pistol', length: .49, width: .24, recoil: .74, sound: [140, 4200, 530, .12, 1.13, .16] },
    'ember-cannon': { chassis: '#513a35', plates: '#ba987e', style: 'hand-cannon', length: .55, width: .27, recoil: 1.14, sound: [90, 3100, 260, .17, .85, .19] },
  };

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const models = new Map();
  const darkMetal = '#202a34';
  const rubber = '#242932';
  const optic = '#364453';
  const bore = '#080e16';

  function weaponModel(weapon) {
    if (models.has(weapon.id)) return models.get(weapon.id);
    const { chassis, plates, style, length, width } = profiles[weapon.id];
    const glow = weapon.color;
    const faces = [];
    const addFace = (vertices, color, group, emissive = false) => {
      const [a, b, c] = vertices;
      const u = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
      const v = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
      const n = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
      const size = Math.hypot(...n) || 1;
      const light = Math.max(0, (-n[0] * .37 + n[1] * .88 - n[2] * .30) / size);
      const shade = emissive ? color : v7Dark(color, .48 + light * .73);
      faces.push({ vertices, normal: n.map(value => value / size), color: shade, group });
    };
    const chamfer = (x, y, w, h, z) => {
      const a = w / 2, b = h / 2, c = Math.min(w, h) * .25;
      return [[-a + c, -b], [a - c, -b], [a, -b + c], [a, b - c], [a - c, b], [-a + c, b], [-a, b - c], [-a, -b + c]]
        .map(([u, v]) => [x + u, y + v, z]);
    };
    const circle = (x, y, r, z, segments = 12) => Array.from({ length: segments }, (_, i) => {
      const angle = (i + .5) / segments * Math.PI * 2;
      return [x + Math.cos(angle) * r, y + Math.sin(angle) * r, z];
    });
    const bridge = (a, b, color, group, emit) => {
      for (let i = 0; i < a.length; i++) {
        const j = (i + 1) % a.length;
        addFace([a[i], a[j], b[j], b[i]], color, group, emit);
      }
    };
    const solid = (a, b, color, group, emit = false) => {
      bridge(a, b, color, group, emit);
      addFace(a.slice().reverse(), color, group, emit);
      addFace(b, color, group, emit);
    };
    const plate = (x, y, z, w, h, depth, color, group, taper = 1, lean = 0, emit = false) => {
      const a = chamfer(x, y, w, h, z - depth / 2);
      const b = chamfer(x, y + lean, w * taper, h * taper, z + depth / 2);
      solid(a, b, color, group, emit);
    };
    const tube = (x, y, z, r, depth, color, group, ratio = .6, segments = 12, emit = false) => {
      const near = z - depth / 2, far = z + depth / 2;
      const a = circle(x, y, r, near, segments), b = circle(x, y, r, far, segments);
      const ai = circle(x, y, r * ratio, near, segments), bi = circle(x, y, r * ratio, far, segments);
      bridge(a, b, color, group, emit);
      bridge(bi, ai, bore, group, false);
      bridge(ai, a, color, group, emit);
      bridge(b, bi, color, group, emit);
    };

    // Receiver, battery, armored gloves, and an exposed charge indicator.
    const heavy = ['comet', 'launcher', 'ring', 'twin', 'hand-cannon'].includes(style);
    const compact = style === 'compact' || style === 'triple';
    const sidearm = weapon.sidearm;
    const receiverDepth = sidearm ? .32 : compact ? .36 : heavy ? .46 : .52;
    plate(0, 0, .075, width, heavy ? .22 : .17, receiverDepth, chassis, undefined, heavy ? .92 : .86);
    plate(0, .078, .011, width * (heavy ? .93 : .82), .104, receiverDepth * .89, plates, 'slide', compact ? .80 : .92);
    plate(0, -.025, -.174, width * (compact ? .65 : .81), .173, .17, darkMetal, undefined, 1.1);
    plate(0, -.15, -.13, width * .55, .11, .25, rubber, undefined, 1.18, .034);
    plate(.11, -.28, -.32, .19, .29, .35, '#33434c', undefined, .73, .084);
    plate(.064, -.15, -.13, .17, .18, .24, '#535f64', undefined, .91);
    if (sidearm) {
      plate(-.10, -.26, -.12, .16, .23, .32, '#36454b', 'support', .91, .06);
      plate(-.11, -.17, .015, .12, .12, .15, '#5d666a', 'support', .90);
    } else {
      plate(-.14, -.25, .29, .17, .21, .44, '#36454b', 'support', .94, .08);
      plate(-width * .40, -.157, .435, .14, .13, .26, '#5d666a', 'support', .90);
    }
    for (let i = 0; i < 3; i++) plate(.144, -.132 - i * .035, -.112 - i * .014, .022, .014, .15, '#252c32');
    const batteryZ = sidearm ? -.13 : .123;
    plate(0, -.164, batteryZ, width * .63, .178, .276, darkMetal, 'battery', .82, .013);
    plate(0, -.247, batteryZ - .007, width * .62, .060, .237, plates, 'battery', .93);
    for (const side of [-1, 1]) {
      plate(side * width * .46, .026, .097, .047, .086, .33, darkMetal);
      plate(side * width * .51, .046, .104, .019, .018, .26, glow, 'power', 1, 0, true);
      for (let i = 0; i < 4; i++) {
        plate(side * width * .47, -.012, -.08 + i * .075, .04, .032, .029, plates, undefined, .82);
      }
      for (let i = 0; i < 3; i++) plate(side * width * .36, .129, -.11 + i * .055, .035, .010, .027, '#a4a8a1');
    }
    plate(0, .138, -.154, width * .42, .022, .092, darkMetal, 'slide');
    for (let i = 0; i < 3; i++) {
      plate((i - 1) * width * .11, .152, -.165, width * .064, .008, .035, glow, 'power', 1, 0, true);
    }

    const barrels = [];
    if (sidearm) {
      const muzzleRadius = style === 'hand-cannon' ? .094 : .053;
      plate(0, .033, (.20 + length) / 2, width * .89, .137, length - .16, chassis, 'slide', .83);
      tube(0, .026, length, muzzleRadius, .073, plates, 'barrel');
      tube(0, .026, length - .058, muzzleRadius * 1.02, .021, glow, 'power', .71, 10, true);
      const chargeCells = style === 'burst-pistol' ? 3 : 1;
      for (let i = 0; i < chargeCells; i++) {
        plate(0, .103, .28 + i * .051, width * .66, .022, .025, glow, 'power', 1, 0, true);
      }
      barrels.push([0, .026, length + .04]);
    } else if (style === 'twin' || style === 'triple') {
      const offsets = style === 'twin' ? [[-.083, .015], [.083, .015]] : [[-.095, 0], [0, .059], [.095, 0]];
      for (const [x, y] of offsets) {
        const r = style === 'twin' ? .068 : .046;
        tube(x, y, (length + .23) / 2, r, length - .23, darkMetal, 'barrel');
        tube(x, y, length, r * 1.10, .078, plates, 'barrel');
        tube(x, y, length - .095, r * 1.08, .033, glow, 'barrel', .62, 10, true);
        barrels.push([x, y, length + .055]);
      }
      plate(0, -.075, .45, width * .96, .11, .31, chassis, 'pump', .86);
      for (let i = 0; i < 4; i++) plate(0, -.095, .34 + i * .055, width * .96, .07, .023, rubber, 'pump', .92);
    } else if (style === 'launcher' || style === 'comet' || style === 'ring') {
      const large = style === 'ring' ? .19 : .174;
      tube(0, .01, .57, large * .87, .50, chassis, 'barrel', .68);
      const coils = style === 'comet' ? 4 : 3;
      for (let i = 0; i < coils; i++) {
        const z = .36 + i * .121;
        tube(0, .01, z, large * .88, .062, plates, 'barrel', .74);
        tube(0, .01, z + .035, large * .85, .014, glow, 'barrel', .81, 12, true);
      }
      tube(0, .01, length, large, .117, plates, 'barrel', .74);
      tube(0, .01, length - .061, large * .93, .028, glow, 'barrel', .78, 12, true);
      if (style === 'ring') {
        for (const x of [-.148, .148]) plate(x, .045, .588, .068, .112, .55, plates, 'barrel', .84);
        tube(0, .01, length - .14, .128, .028, glow, 'barrel', .87, 10, true);
      }
      barrels.push([0, .01, length + .062]);
    } else if (style === 'rail' || style === 'needle' || style === 'fork' || style === 'prism') {
      const open = style === 'fork' || style === 'prism';
      const w = open ? width * .42 : width * .34;
      for (const side of [-1, 1]) {
        const x = side * (open ? .100 : .064);
        const z = (.27 + length) / 2;
        plate(x, .004, z, w, open ? .104 : .074, length - .23, plates, 'barrel', .62, .022);
        plate(x, .059, z - .028, .026, .017, length - .39, glow, 'barrel', .8, 0, true);
        plate(x, .017, length - .04, .053, .086, .11, darkMetal, 'barrel', .93);
      }
      if (style === 'prism') {
        solid(circle(0, .063, .03, .35, 4), circle(0, .063, .115, .60, 4), plates, 'barrel');
        solid(circle(0, .063, .115, .60, 4), circle(0, .063, .019, .855, 4), glow, 'barrel', true);
      } else {
        tube(0, -.022, .68, open ? .038 : .046, length - .42, darkMetal, 'barrel');
      }
      if (!open) tube(0, -.003, length, style === 'needle' ? .046 : .055, .093, plates, 'barrel');
      barrels.push([0, .015, length + .06]);
    } else {
      const vented = style === 'vented';
      plate(0, -.008, (.25 + length) / 2, width * .80, vented ? .168 : .143, length - .23, darkMetal, 'barrel', .70);
      plate(0, .050, (.22 + length) / 2, width * .74, .087, length - .21, chassis, 'slide', .78);
      tube(0, .013, length, vented ? .081 : .059, .092, plates, 'barrel');
      tube(0, .013, length - .063, vented ? .078 : .061, .028, glow, 'barrel', .74, 10, true);
      const vents = vented ? 6 : style === 'compact' ? 3 : 4;
      for (let i = 0; i < vents; i++) {
        const z = .28 + i * (length - .35) / vents;
        plate(0, .096, z, width * .62, .021, .028, plates, 'slide', .89);
        if (vented) plate(-width * .34, .031, z, .025, .039, .024, glow, 'power', 1, 0, true);
      }
      barrels.push([0, .016, length + .05]);
    }

    plate(0, .143, .041, width * .53, .048, .16, darkMetal);
    if (v12PrecisionIds.has(weapon.id)) {
      const r = style === 'needle' ? .083 : .071;
      tube(0, .226, .066, r, .30, optic, 'sight');
      tube(0, .226, -.099, r * 1.16, .051, plates, 'sight', .67);
      tube(0, .226, .235, r * 1.07, .067, plates, 'sight', .73);
      tube(0, .226, -.076, r * .68, .012, glow, 'sight', .82, 10, true);
      plate(.085, .233, .052, .072, .079, .077, darkMetal, 'sight');
      plate(0, .307, .065, .10, .032, .084, plates, 'sight');
    } else {
      tube(0, .232, .070, .077, .076, optic, 'sight', .75, 12);
      tube(0, .232, .027, .079, .011, plates, 'sight', .80, 12);
    }

    const model = { faces, barrels };
    models.set(weapon.id, model);
    return model;
  }

  const lerp = (a, b, t) => a + (b - a) * t;
  const smooth = (a, b, t) => {
    const p = clamp((t - a) / (b - a), 0, 1);
    return p * p * (3 - 2 * p);
  };
  let renderedWeapon = null, switchedAt = -1;

  function drawViewmodel(aim, showSight) {
    const weapon = getWeapon();
    if (!weapon || !profiles[weapon.id]) return;
    const profile = profiles[weapon.id], mesh = weaponModel(weapon);
    const movement = reducedMotion.matches ? .23 : 1;
    if (renderedWeapon !== weapon.id || now < switchedAt) {
      renderedWeapon = weapon.id;
      switchedAt = now;
    }
    const deploy = 1 - smooth(0, .19, now - switchedAt);
    const progress = reloadTimer > 0 ? clamp(1 - reloadTimer / weapon.reload, 0, 1) : 0;
    const reloadDip = (smooth(.025, .23, progress) - smooth(.68, .99, progress)) * movement * (1 - .62 * aim);
    const drop = (smooth(.14, .36, progress) - smooth(.42, .72, progress)) * movement;
    const feed = (smooth(.59, .73, progress) - smooth(.75, .89, progress)) * movement;
    const kick = weaponKick * weaponKick * profile.recoil * movement;
    const pitch = .05 + .075 * kick - .105 * reloadDip;
    const roll = .015 + reloadDip * .24 + deploy * .04 * movement;
    const yaw = -.32 * (1 - aim) + reloadDip * .23;
    const cp = Math.cos(pitch), sp = Math.sin(pitch), cr = Math.cos(roll), sr = Math.sin(roll);
    const cy = Math.cos(yaw), sy = Math.sin(yaw);
    const focal = Math.min(viewH * .94, viewW * 1.28);
    const scale = Math.max(.76, Math.min(1.35, viewH / 720));
    const x0 = lerp(.35, 0, aim) + Math.sin(bob * .52) * .010 * movement * (1 - aim);
    const y0 = lerp(-.415, -.17 - 30 * scale / focal, aim) - .115 * reloadDip - .117 * deploy * movement * (1 - .68 * aim) + .026 * kick
      + Math.sin(bob) * .009 * movement * (1 - aim);
    const z0 = .95 - .086 * kick + reloadDip * .06;
    const offsets = {
      slide: [0, 0, -.040 * kick - .040 * feed],
      battery: [-.12 * drop, -.34 * drop, -.09 * drop],
      support: [-.12 * drop, -.18 * drop, -.17 * drop],
      pump: [0, 0, -.12 * kick - .04 * feed],
      barrel: [0, 0, -.030 * kick],
    };
    const rotate = ([x, y, z]) => {
      const xx = x * cy + z * sy, zz = z * cy - x * sy;
      const yy = y * cp + zz * sp;
      return [xx * cr - yy * sr, xx * sr + yy * cr, zz * cp - y * sp];
    };
    const transform = (point, offset) => {
      const shifted = offset ? point.map((n, i) => n + offset[i]) : point;
      const [x, y, z] = rotate(shifted);
      return [x + x0, y + y0, z + z0];
    };
    const project = ([x, y, z]) => [viewW / 2 + x * focal / z, viewH / 2 - y * focal / z];
    const layers = [];
    const lowCharge = weapons[activeWeapon]?.mag <= weapon.magSize * .2;
    for (const face of mesh.faces) {
      if (face.group === 'sight' && !showSight) continue;
      const vertices = face.vertices.map(point => transform(point, offsets[face.group]));
      const normal = rotate(face.normal), p = vertices[0];
      if (normal[0] * p[0] + normal[1] * p[1] + normal[2] * p[2] >= 0) continue;
      const depth = vertices.reduce((sum, v) => sum + v[2], 0) / vertices.length;
      const color = lowCharge && face.group === 'power' ? '#ff684f' : face.color;
      layers.push({ points: vertices.map(project), depth, color });
    }
    layers.sort((a, b) => b.depth - a.depth);
    ctx.save();
    for (const { points, color } of layers) {
      ctx.beginPath();
      ctx.moveTo(...points[0]);
      for (let i = 1; i < points.length; i++) ctx.lineTo(...points[i]);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
      ctx.lineWidth = .62;
      ctx.strokeStyle = color;
      ctx.stroke();
    }
    if (shotFlash > .033) {
      const flash = clamp((shotFlash - .033) / .082, 0, 1);
      for (const muzzle of mesh.barrels) {
        const [x, y, z] = transform(muzzle, offsets.barrel), [sx, sy] = project([x, y, z]);
        const r = (7 + 25 * flash) * Math.sqrt(profile.recoil) * focal / (540 * z);
        const halo = ctx.createRadialGradient(sx, sy, 0, sx, sy, r * 1.68);
        halo.addColorStop(0, '#fff8e1');
        halo.addColorStop(.32, weapon.color);
        halo.addColorStop(1, `${weapon.color}00`);
        ctx.globalAlpha = flash * (reducedMotion.matches ? .37 : .85);
        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(sx, sy, r * 1.68, 0, TWOPI);
        ctx.fill();
        ctx.beginPath();
        for (let i = 0; i < 12; i++) {
          const a = i * Math.PI / 6 + now * 7, length = (i % 2 ? .28 : i % 4 ? .83 : 1) * r;
          const p = [sx + Math.cos(a) * length, sy + Math.sin(a) * length];
          if (!i) ctx.moveTo(...p);
          else ctx.lineTo(...p);
        }
        ctx.closePath();
        ctx.fillStyle = '#fff7d9';
        ctx.fill();
      }
    }
    ctx.restore();
    return project(transform([0, .163, .041]));
  }

  function drawReflex() {
    const cx = viewW / 2, cy = viewH / 2;
    const s = Math.max(.76, Math.min(1.35, viewH / 720));
    ctx.save();
    // The weapon sits below the aperture so scene pixels remain visible through the glass.
    ctx.beginPath();
    ctx.rect(0, cy + 29 * s, viewW, viewH - cy - 29 * s);
    ctx.clip();
    const rail = drawViewmodel(1, false);
    ctx.restore();
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(s, s);
    const housing = ctx.createLinearGradient(0, -38, 0, 39);
    housing.addColorStop(0, '#81919b');
    housing.addColorStop(.21, '#384750');
    housing.addColorStop(.53, '#17232d');
    housing.addColorStop(1, '#364855');
    ctx.fillStyle = housing;
    const dockX = rail ? (rail[0] - cx) / s : 0;
    const dockY = rail ? clamp((rail[1] - cy) / s + 4, 37, 88) : 55;
    ctx.beginPath();
    ctx.moveTo(-21, 32);
    ctx.lineTo(21, 32);
    ctx.lineTo(dockX + 27, dockY);
    ctx.lineTo(dockX - 27, dockY);
    ctx.closePath();
    ctx.fill();
    const rim = (radius, width, color) => {
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, TWOPI);
      ctx.lineWidth = width;
      ctx.strokeStyle = color;
      ctx.stroke();
    };
    rim(34, 10, '#090d12');
    rim(36.8, 3.2, housing);
    rim(29.8, 1.2, '#475661');
    ctx.fillStyle = '#829096';
    ctx.fillRect(dockX - 21, dockY - 6, 5, 2);
    ctx.fillRect(dockX + 16, dockY - 6, 5, 2);
    ctx.beginPath();
    ctx.arc(0, 0, 2.1, 0, TWOPI);
    ctx.strokeStyle = '#3a080a';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = '#ff343b';
    ctx.fill();
    ctx.restore();
  }

  const originalSound = snd;
  let weaponAudio = null, reloadCue = null;

  function openWeaponAudio() {
    const Audio = window.AudioContext || window.webkitAudioContext;
    if (!Audio || !audioOn) return null;
    audioCtx ||= new Audio();
    if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});
    if (weaponAudio?.context === audioCtx) return weaponAudio;

    const a = audioCtx, bus = a.createGain(), wet = a.createGain(), mute = a.createGain();
    const limiter = a.createDynamicsCompressor();
    limiter.threshold.value = -17;
    limiter.knee.value = 9;
    limiter.ratio.value = 5;
    limiter.attack.value = .001;
    limiter.release.value = .12;
    mute.gain.value = .72;
    bus.connect(limiter);
    wet.connect(limiter);
    limiter.connect(mute);
    mute.connect(a.destination);

    const reflections = [.05, .11].map((seconds, i) => {
      const delay = a.createDelay(.24), tone = a.createBiquadFilter(), gain = a.createGain();
      delay.delayTime.value = seconds;
      tone.type = 'lowpass';
      tone.frequency.value = i ? 840 : 1500;
      gain.gain.value = i ? .048 : .096;
      bus.connect(delay);
      delay.connect(tone);
      tone.connect(gain);
      if (a.createStereoPanner) {
        const pan = a.createStereoPanner();
        pan.pan.value = i ? .47 : -.39;
        gain.connect(pan);
        pan.connect(wet);
      } else gain.connect(wet);
      return { delay, gain };
    });

    const noise = a.createBuffer(1, Math.ceil(a.sampleRate * .55), a.sampleRate);
    const data = noise.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    const samples = {};
    for (const [name, encoded] of Object.entries(soundSamples)) {
      const bytes = Uint8Array.from(atob(encoded), c => c.charCodeAt(0));
      a.decodeAudioData(bytes.buffer, buffer => { samples[name] = buffer; }, () => {});
    }
    weaponAudio = { context: a, bus, mute, noise, samples, reflections, arena: null };
    return weaponAudio;
  }

  function shapeAudio(audio, source, time, peak, attack, duration, filter) {
    const a = audio.context, envelope = a.createGain();
    const input = filter || envelope;
    source.connect(input);
    if (filter) filter.connect(envelope);
    envelope.connect(audio.bus);
    envelope.gain.setValueAtTime(.0001, time);
    envelope.gain.linearRampToValueAtTime(peak, time + attack);
    envelope.gain.exponentialRampToValueAtTime(.0001, time + duration);
    source.onended = () => {
      source.disconnect();
      filter?.disconnect();
      envelope.disconnect();
    };
  }

  function noiseBurst(audio, time, frequency, duration, peak, type, q) {
    const a = audio.context, source = a.createBufferSource(), filter = a.createBiquadFilter();
    source.buffer = audio.noise;
    filter.type = type;
    filter.Q.value = q;
    filter.frequency.setValueAtTime(frequency, time);
    filter.frequency.exponentialRampToValueAtTime(Math.max(70, frequency * .49), time + duration);
    shapeAudio(audio, source, time, peak, .0015, duration, filter);
    source.start(time, Math.random() * .17);
    source.stop(time + duration + .002);
  }

  function toneBurst(audio, time, from, to, duration, peak, type, attack = .002) {
    const oscillator = audio.context.createOscillator();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(from, time);
    oscillator.frequency.exponentialRampToValueAtTime(to, time + duration);
    shapeAudio(audio, oscillator, time, peak, attack, duration);
    oscillator.start(time);
    oscillator.stop(time + duration + .002);
  }

  function sampleBurst(audio, name, time, rate, peak, duration, filterFrequency) {
    const buffer = audio.samples[name];
    if (!buffer) return;
    const a = audio.context, source = a.createBufferSource(), filter = a.createBiquadFilter();
    source.buffer = buffer;
    source.playbackRate.value = rate;
    filter.type = 'lowpass';
    filter.frequency.value = filterFrequency;
    const tail = Math.min(duration, buffer.duration / rate);
    shapeAudio(audio, source, time, peak, .003, tail, filter);
    source.start(time);
    source.stop(time + tail + .003);
  }

  const arenaReflections = {
    cyber: [.071, .126, .12], jungle: [.039, .084, .035], volcano: [.061, .145, .085],
    arctic: [.092, .19, .058], desert: [.051, .103, .076],
  };

  function makeReport(audio, profile) {
    const t = audio.context.currentTime + .003;
    if (audio.arena !== mapId) {
      const [early, late, wetness] = arenaReflections[mapId] || arenaReflections.cyber;
      audio.reflections.forEach((route, i) => {
        route.delay.delayTime.value = i ? late : early;
        route.gain.gain.value = wetness * (i ? .43 : 1);
      });
      audio.arena = mapId;
    }
    const [bass, crack, pitch, tail, samplePitch, weight] = profile.sound;
    const drift = .96 + Math.random() * .08;
    noiseBurst(audio, t, crack * drift, .035 + tail * .14, weight * 1.92, 'highpass', .65);
    noiseBurst(audio, t + .007, 230 + bass * 2, tail, weight * 1.17, 'bandpass', .85);
    toneBurst(audio, t, bass * drift, Math.max(39, bass * .41), tail * .7, weight * .83, 'sine');
    const heavy = profile.recoil >= 1.2;
    sampleBurst(audio, heavy ? 'large' : 'small', t + .012, samplePitch * drift, weight * .55,
      tail * (heavy ? 1.26 : .89), heavy ? 2600 : 5500);
    toneBurst(audio, t + .008, pitch * drift, pitch * (heavy ? .36 : .67), tail * .72, weight * .28, 'triangle', .008);
  }

  function makeMechanism(audio, phase, profile) {
    const t = audio.context.currentTime + .003;
    const pitch = (phase === 0 ? 1400 : phase === 1 ? 1090 : phase === 2 ? 1930 : 1660) / Math.sqrt(profile.recoil + .35);
    noiseBurst(audio, t, pitch, .057, phase === 2 ? .23 : .17, 'bandpass', 1.45);
    toneBurst(audio, t + .005, pitch * .47, pitch * .26, .037, .097, 'triangle');
    sampleBurst(audio, 'metal', t, phase === 2 ? 1.27 : phase === 1 ? .92 : 1.10, .125, .083, 3450);
    if (phase === 2) toneBurst(audio, t + .028, 463, 710, .086, .027, 'sine', .014);
  }

  function tickReload() {
    if (!reloadCue) return;
    const weapon = getWeapon();
    if (!weapon || weapon.id !== reloadCue.id || reloadTimer <= 0 || !audioOn) {
      reloadCue = null;
      return;
    }
    if (state !== 'PLAYING' && state !== 'DUEL') return;
    const progress = 1 - reloadTimer / weapon.reload;
    const nextPhase = progress >= .83 ? 2 : progress >= .47 ? 1 : 0;
    if (nextPhase <= reloadCue.phase) return;
    reloadCue.phase = nextPhase;
    if (weaponAudio) makeMechanism(weaponAudio, nextPhase, profiles[weapon.id]);
  }

  snd = function (kind) {
    const weapon = getWeapon(), profile = profiles[weapon?.id];
    if ((kind !== 'shoot' && kind !== 'reload') || !profile || !audioOn) return originalSound(kind);
    try {
      const audio = openWeaponAudio();
      if (!audio || audio.context.state !== 'running') return originalSound(kind);
      if (kind === 'shoot') makeReport(audio, profile);
      else {
        const reloading = reloadTimer > 0;
        reloadCue = reloading ? { id: weapon.id, phase: 0 } : null;
        makeMechanism(audio, reloading ? 0 : 3, profile);
      }
    } catch {
      originalSound(kind);
    }
  };
  document.addEventListener('pointerdown', () => {
    try { openWeaponAudio(); } catch { /* The existing game sound remains available. */ }
  }, { once: true });
  document.addEventListener('keydown', event => {
    if (event.code === 'KeyM' && !event.repeat && weaponAudio) {
      weaponAudio.mute.gain.setTargetAtTime(audioOn ? .72 : .0001, weaponAudio.context.currentTime, .013);
    }
  });

  drawWeapon = function () {
    tickReload();
    drawViewmodel(V12_OPTICS.blend * .65, true);
  };

  v6DrawScope = function () {
    tickReload();
    if (v12PrecisionIds.has(getWeapon()?.id)) v12ClassicScope();
    else drawReflex();
  };

  // Kenney Sci-fi Sounds (CC0 1.0), https://kenney.nl/assets/sci-fi-sounds
  // laserSmall_001.ogg, laserLarge_000.ogg, impactMetal_002.ogg
  // https://github.com/danvanderboom/Aetherium/blob/main/samples/unity/Aphelion/ATTRIBUTIONS.md
  // Embedded so the browser can decode local samples when playing from file://.
  const soundSamples = {
    small: [
      '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',
      'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABxNAzRRBDRRBAAAAAAA',
      'AABNFAHRVAHRNAEAAAAAAABAE0XAM0VANFUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      'AAAAAAAAAAAAAAAAABxNAzRRBDRRBAAAAAAAAABNFAFRNQFPNAEAAAAAAABAE0VANE1AVE0AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      'AAAAAAAAAAAAAAAAAAAAAAAAAAABAAABDgAAARZCoSErAoA4AQCH40CSIEnwNIBjWfA8eBpME+BYFjwPmgfTBAAAAAAAAAAAAEDyNHgePA+m',
      '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',
    ].join(''),
    large: [
      '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',
    ].join(''),
    metal: [
      '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',
    ].join(''),
  };
})();
