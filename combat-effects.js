/* Campaign throwables and depth-tested combat geometry shared by both renderers. */
const drawNeonCombatEffects = (() => {
  'use strict';

  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const shotOrigins = new WeakMap();
  const bursts = [];
  const thrownItems = [];
  const fireZones = [];
  const gear = {
    grenade: { key: 'KeyH', short: 'Frag', name: 'Frag grenade', stock: 'grenades',
      radius: 3.5, speed: 13, lifetime: 1.3, color: '#c8ee72', price: 80,
      description: 'Get 2 frag grenades. Press H to throw an explosive charge.' },
    molotov: { key: 'KeyT', short: 'Molly', name: 'Molotov', stock: 'molotovs',
      radius: 2.6, speed: 12, lifetime: Infinity, color: '#ffab4a', price: 100,
      description: 'Get 2 molotovs. Press T to throw a bottle that leaves a burning area.' }
  };
  const releaseTime = .235;
  const throwDuration = .51;
  const fireDuration = 4.5;
  const fireInterval = .3;
  let throwing = null;
  const fragmentLimit = 132;
  let fragmentCount = 0;
  let clock = 0;
  let randomState = 571621;

  const sparkWhite = [1, .96, .82];
  const orange = [1, .40, .18];
  const armor = [.22, .28, .34];
  const profiles = {
    blaster: {trail: 1.30, radius: .048, length: .15},
    smg: {trail: .95, radius: .034, length: .11},
    shotgun: {trail: .62, radius: .026, length: .085},
    rifle: {trail: 2.20, radius: .043, length: .28},
    ion: {trail: 1.18, radius: .058, length: .15},
    comet: {trail: 1.62, radius: .107, length: .23},
    echo: {trail: .88, radius: .039, length: .125},
    zenith: {trail: 2.05, radius: .048, length: .23},
    meteor: {trail: 1.26, radius: .162, length: .19},
    needle: {trail: 2.65, radius: .037, length: .34},
    thunder: {trail: 1.49, radius: .043, length: .17},
    orbital: {trail: 1.02, radius: .144, length: .049}
  };
  const hostileProfile = {trail: 1.12, radius: .069, length: .17};
  const supplyColors = {health: '#ff648d', shield: '#56eaff', ammo: '#ffc76e', gas: '#a4ff91'};

  for (const [id, item] of Object.entries(gear)) {
    shopDefs.push({id, name: item.name.toUpperCase(), desc: item.description, base: item.price});
  }

  // Effect randomness is independent of combat and wave generation.
  function random() {
    randomState = (Math.imul(randomState, 1664525) + 1013904223) >>> 0;
    return randomState / 4294967296;
  }

  function point(x, y, z) { return {x, y, z}; }

  function offset(p, along, distance) {
    return point(p.x + along.x * distance, p.y + along.y * distance, p.z + along.z * distance);
  }

  function mix(a, b, t) {
    return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
  }

  function triangle(out, a, b, c, [r, g, blue]) {
    out.push(a.x, a.y, a.z, r, g, blue, 1,
      b.x, b.y, b.z, r, g, blue, 1, c.x, c.y, c.z, r, g, blue, 1);
  }

  function quad(out, a, b, c, d, color) {
    triangle(out, a, b, c, color);
    triangle(out, a, c, d, color);
  }

  function axes(d) {
    const horizontal = Math.hypot(d.x, d.z);
    const side = horizontal > .001 ? point(-d.z / horizontal, 0, d.x / horizontal) : point(1, 0, 0);
    const up = point(d.y * side.z, d.z * side.x - d.x * side.z, -d.y * side.x);
    return [side, up];
  }

  function ribbons(out, end, start, basis, width, rearWidth, color) {
    for (const side of basis) {
      quad(out, offset(end, side, -width), offset(end, side, width),
        offset(start, side, rearWidth), offset(start, side, -rearWidth), color);
    }
  }

  function crystal(out, center, direction, basis, radius, front, back, tint, highlight) {
    const tip = offset(center, direction, front);
    const tail = offset(center, direction, -back);
    const [side, up] = basis;
    const rim = [offset(center, side, radius), offset(center, up, radius),
      offset(center, side, -radius), offset(center, up, -radius)];
    for (let i = 0; i < rim.length; i++) {
      const next = (i + 1) % rim.length;
      const color = i % 2 === 0 ? highlight : tint;
      triangle(out, tip, rim[i], rim[next], color);
      triangle(out, tail, rim[next], rim[i], tint);
    }
  }

  function ring(out, center, radius, width, color, segments, gap = 0) {
    const inner = Math.max(0, radius - width);
    const at = (angle, distance) =>
      point(center.x + distance * Math.cos(angle), center.y, center.z + distance * Math.sin(angle));
    for (let i = 0; i < segments; i++) {
      const a = i / segments * TWOPI;
      const b = (i + 1 - gap) / segments * TWOPI;
      quad(out, at(a, inner), at(a, radius), at(b, radius), at(b, inner), color);
    }
  }

  function releaseThrow(kind) {
    const config = gear[kind];
    const eye = v5Eyes();
    const yaw = player.a;
    const pitch = player.pitch || 0;
    const forward = point(Math.cos(yaw) * Math.cos(pitch), -Math.sin(pitch),
      Math.sin(yaw) * Math.cos(pitch));
    const hand = offset(offset(eye, forward, .56), point(-Math.sin(yaw), 0, Math.cos(yaw)), .17);
    const p = v5WorldCollision(hand) ? eye : hand;
    const v = point(forward.x * config.speed, forward.y * config.speed + 3.2, forward.z * config.speed);
    thrownItems.push({kind, p, v, age: 0});
    snd('throw');
  }

  function damageArea(center, radius, damage, height, falloff) {
    let hit = false;
    for (const enemy of [...enemies]) {
      if (enemy.hp <= 0 || enemy.campaignShield) continue;
      const y = enemy.v9Flying ? enemy.flightY + .6 : enemy.type === 'boss' ? 1.35 : .9;
      const dy = y - center.y;
      const distance = Math.hypot(enemy.x - center.x, enemy.z - center.z);
      if (Math.abs(dy) > height || distance > radius) continue;
      const steps = Math.ceil(Math.hypot(distance, dy) / .24);
      let blocked = false;
      for (let step = 1; step < steps; step++) {
        const t = step / steps;
        const route = point(lerp(center.x, enemy.x, t), lerp(center.y, y, t), lerp(center.z, enemy.z, t));
        if (!v5WorldCollision(route)) continue;
        blocked = true;
        break;
      }
      if (blocked) continue;
      enemy.hp -= Math.round(damage * (1 - falloff * distance / radius) * (1 + upg.damage * .2));
      enemy.hitTimer = .18;
      hit = true;
      if (enemy.hp <= 0) killEnemy(enemy);
    }
    if (hit) hitTimer = .12;
  }

  function throwableFloor(x, z, height) {
    const roof = roofHeight(x, z);
    return Math.max(roof <= height ? roof : 0, v10HouseGround(x, z, height, 0));
  }

  function impactThrowable({kind, p}) {
    const {radius, color} = gear[kind];
    if (kind === 'grenade') {
      damageArea(p, radius, 105, 2.8, .68);
      V5.bursts.push({p, color, life: .43, max: .43, radius});
      beginBurst(p, v11Color(color), 'surface', 17, .52);
      if (Math.hypot(p.x - player.x, p.z - player.z) < 10) {
        shake = Math.max(shake, motion.matches ? .06 : .22);
      }
      snd('pulse');
      return;
    }
    const center = point(p.x, throwableFloor(p.x, p.z, p.y) + .085, p.z);
    fireZones.push({center, radius, age: 0, nextTick: 0});
    beginBurst(p, orange, 'surface', 10, .38);
    snd('hit');
  }

  function advanceThrowables(dt) {
    if (throwing) {
      const before = throwing.age;
      throwing.age += dt;
      if (before < releaseTime && throwing.age >= releaseTime) releaseThrow(throwing.kind);
      if (throwing.age >= throwDuration) throwing = null;
    }

    for (let i = thrownItems.length - 1; i >= 0; i--) {
      const item = thrownItems[i];
      const steps = Math.max(1, Math.ceil(dt / .008));
      const step = dt / steps;
      item.age += dt;
      let impacted = false;
      for (let n = 0; n < steps; n++) {
        item.v.y -= 14 * step;
        const next = offset(item.p, item.v, step);
        if (v5WorldCollision(next)) {
          impacted = true;
          break;
        }
        item.p = next;
      }
      if (!impacted && item.age < gear[item.kind].lifetime) continue;
      impactThrowable(item);
      thrownItems.splice(i, 1);
    }

    for (let i = fireZones.length - 1; i >= 0; i--) {
      const zone = fireZones[i];
      zone.age += dt;
      if (zone.age >= fireDuration) {
        fireZones.splice(i, 1);
        continue;
      }
      if (zone.age >= zone.nextTick) {
        damageArea(zone.center, zone.radius, 9, 1.36, 0);
        zone.nextTick += fireInterval;
      }
    }
  }

  function drawThrownItem(out, item) {
    const {kind, p, age} = item;
    const spin = motion.matches ? .4 : age * 13;
    const direction = point(Math.cos(spin), Math.sin(spin), 0);
    const basis = axes(direction);
    const tint = v11Color(gear[kind].color);
    const dark = mix(armor, tint, .12);
    if (kind === 'grenade') {
      crystal(out, p, direction, basis, .125, .17, .17, dark, tint);
      crystal(out, p, direction, basis, .139, .041, .041, tint, sparkWhite);
    } else {
      crystal(out, p, direction, basis, .092, .155, .13, [ .47, .21, .06 ], tint);
      crystal(out, offset(p, direction, .142), direction, basis, .038, .068, .028, tint, sparkWhite);
    }
  }

  function drawFireZone(out, zone) {
    const {center, radius, age} = zone;
    const remaining = clamp((fireDuration - age) / .7, .05, 1);
    const detail = motion.matches ? 12 : 23;
    for (let i = 0; i < detail; i++) {
      const angle = i * 2.39996;
      const distance = radius * .95 * Math.sqrt((i + .4) / detail);
      const x = center.x + Math.cos(angle) * distance;
      const z = center.z + Math.sin(angle) * distance;
      if (Math.abs(throwableFloor(x, z, Infinity) + .085 - center.y) > .07) continue;
      const height = remaining * (.38 + (motion.matches ? .12 : .22 * Math.sin(clock * 13 + i * 3.5)));
      const width = .19 + .16 * (1 - distance / radius);
      const y = center.y;
      const tip = point(x + .08, y + height, z + .08);
      triangle(out, point(x - width, y, z), point(x + width, y, z), tip, [ .90, .25, .035 ]);
      triangle(out, point(x, y, z - width), point(x, y, z + width), tip, [ 1, .42, .045 ]);
      triangle(out, point(x - width * .47, y + .012, z + .015),
        point(x + width * .49, y + .012, z + .015), point(x + .04, y + height * .57, z + .06),
        [ 1, .76, .19 ]);
    }
  }

  const throwPoses = [
    [0, .51, .80, -.36],
    [.095, .36, .31, -.40],
    [.155, .44, .15, -.85],
    [releaseTime, .24, .12, .27],
    [.34, .10, .31, .52],
    [throwDuration, .32, .79, .70]
  ];

  function drawThrowHand() {
    const {kind, age} = throwing;
    const end = throwPoses.findIndex(pose => pose[0] > age);
    const [start, x0, y0, r0] = throwPoses[end - 1];
    const [finish, x1, y1, r1] = throwPoses[end];
    const t = (age - start) / (finish - start);
    const smooth = t * t * (3 - 2 * t);
    const held = age < releaseTime;
    const scale = Math.min(viewW / 660, viewH / 520);
    const shape = (color, vertices) => {
      ctx.beginPath();
      ctx.moveTo(...vertices[0]);
      for (const vertex of vertices.slice(1)) ctx.lineTo(...vertex);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
    };
    ctx.save();
    ctx.translate(viewW / 2 + lerp(x0, x1, smooth) * Math.min(viewH, viewW * .85),
      viewH / 2 + lerp(y0, y1, smooth) * viewH);
    ctx.scale(scale, scale);
    ctx.rotate(lerp(r0, r1, smooth) * (motion.matches ? .42 : 1));
    shape('#121b28', [[-24, -3], [26, -5], [47, 225], [-55, 225]]);
    shape('#27384b', [[-20, 11], [20, 13], [25, 62], [-25, 64]]);
    shape('#3c5667', [[-25, 63], [25, 61], [26, 70], [-25, 73]]);
    shape('#182332', [[-22, 25], [-32, -18], [-23, -45], [13, -47], [30, -22], [22, 23]]);
    shape('#344d5d', [[-24, 1], [-25, -23], [5, -32], [22, -19], [17, 9]]);
    if (held && kind === 'grenade') {
      shape('#344735', [[-35, -41], [-45, -58], [-31, -77], [-6, -77], [9, -58], [-3, -38]]);
      shape('#c8ee72', [[-42, -60], [6, -61], [9, -53], [-42, -51]]);
    } else if (held) {
      shape('#a24b22', [[-39, -39], [-43, -67], [-34, -79], [-34, -105], [-21, -105],
        [-21, -78], [-8, -70], [-7, -39]]);
      shape('#ffab4a', [[-40, -63], [-10, -62], [-9, -51], [-39, -51]]);
      shape('#ffe0a9', [[-34, -105], [-31, -112], [-23, -111], [-21, -105]]);
    }
    shape('#527181', held
      ? [[-28, -13], [-36, -31], [-47, -47], [-38, -53], [-22, -37], [-11, -18]]
      : [[-29, -16], [-42, -31], [-61, -50], [-54, -57], [-23, -38], [-12, -20]]);
    if (!held) {
      shape('#415d70', [[-19, -38], [-24, -71], [-15, -78], [-5, -56],
        [0, -83], [10, -84], [13, -58], [25, -76], [33, -69], [26, -30]]);
    }
    ctx.restore();
  }

  function drawShot(out, shot, hostile, detail) {
    if (!shot.p || !shot.d) return;
    const profile = hostile ? hostileProfile : profiles[shot.kind] || profiles.blaster;
    const tint = hostile ? mix(v11Color(shot.color || '#ff6862'), orange, .75)
      : v11Color(shot.color || '#78fff1');
    const highlight = mix(tint, sparkWhite, hostile ? .42 : .72);
    const basis = axes(shot.d);
    const crystalRadius = profile.radius * (motion.matches ? .86 : 1);
    crystal(out, shot.p, shot.d, basis, crystalRadius, profile.length,
      profile.length * .46, tint, highlight);

    if (!shotOrigins.has(shot)) shotOrigins.set(shot, shot.last || shot.p);
    const origin = shotOrigins.get(shot);
    const traveled = Math.hypot(shot.p.x - origin.x, shot.p.y - origin.y, shot.p.z - origin.z);
    const length = Math.min(profile.trail * (motion.matches ? .53 : 1), traveled);
    if (!detail || length < .10) return;
    const rear = offset(shot.p, shot.d, -length);
    const mid = offset(shot.p, shot.d, -length * .50);
    const trailWidth = crystalRadius * (shot.kind === 'orbital' ? .26 : .57);
    ribbons(out, shot.p, mid, basis, trailWidth * .44, trailWidth * .27, highlight);
    ribbons(out, shot.p, rear, basis, trailWidth, trailWidth * .055, tint);
  }

  function beginBurst(origin, tint, kind, count, duration, direction = null) {
    if (motion.matches) {
      count = Math.min(count, 2);
      duration = Math.min(duration, .25);
    }
    while (bursts.length >= 25 || fragmentCount + count > fragmentLimit) {
      fragmentCount -= bursts.shift().fragments.length;
    }
    const fragments = [];
    for (let i = 0; i < count; i++) {
      const angle = random() * TWOPI;
      const bulk = kind === 'kill' || kind === 'boss';
      const speed = (bulk ? 2.6 : 1.35) * (.60 + random());
      const side = Math.cos(angle) * speed;
      const forward = Math.sin(angle) * speed;
      const bounce = direction ? 1.6 : 0;
      const velocity = point(side - (direction?.x || 0) * bounce,
        .50 + random() * (bulk ? 3.4 : 1.65) - (direction?.y || 0) * bounce,
        forward - (direction?.z || 0) * bounce);
      const shard = bulk && i % 3 === 0;
      const size = shard ? .055 + random() * .055 : .012 + random() * .018;
      const color = shard ? mix(armor, tint, .23) : mix(tint, sparkWhite, random() * .57);
      fragments.push({velocity, size, color, shard, lifetime: duration * (.56 + random() * .44)});
    }
    fragmentCount += fragments.length;
    bursts.push({origin, tint, kind, duration, fragments, started: clock});
  }

  function drawFragment(out, origin, fragment, elapsed, reduced) {
    const {velocity: v, size, color, shard, lifetime} = fragment;
    const progress = elapsed / lifetime;
    if (progress >= 1) return;
    const center = point(origin.x + v.x * elapsed,
      origin.y + (v.y - elapsed * (shard ? 4.9 : 2.5)) * elapsed,
      origin.z + v.z * elapsed);
    if (center.y < .04) return;
    const r = size * Math.max(.16, 1 - progress);
    const fall = v.y - elapsed * (shard ? 9.8 : 5);
    const speed = Math.hypot(v.x, fall, v.z) || 1;
    const direction = point(v.x / speed, fall / speed, v.z / speed);
    const basis = axes(direction);
    if (shard) {
      const roll = elapsed * 7 + size * 31;
      const [side, up] = basis;
      const cos = Math.cos(roll), sin = Math.sin(roll);
      const rotated = point(side.x * cos + up.x * sin, side.y * cos + up.y * sin,
        side.z * cos + up.z * sin);
      triangle(out, offset(center, direction, r * 1.42), offset(center, rotated, -r),
        offset(offset(center, direction, -r), rotated, r), color);
      triangle(out, offset(center, direction, r * 1.42), offset(offset(center, direction, -r), rotated, r),
        offset(center, basis[1], r * .77), mix(color, armor, .55));
    } else {
      const length = reduced ? r * 1.8 : .12 * (1 - progress) + r * 2.6;
      ribbons(out, offset(center, direction, length * .28),
        offset(center, direction, -length), basis, r, r * .12, color);
    }
  }

  function drawBurst(out, burst) {
    const {origin, tint, kind, duration} = burst;
    const elapsed = clock - burst.started;
    const progress = elapsed / duration;
    const reduced = motion.matches;
    for (const fragment of burst.fragments) drawFragment(out, origin, fragment, elapsed, reduced);

    const collapse = kind === 'kill' || kind === 'boss';
    if ((collapse || kind === 'pickup') && progress < .90 && !reduced) {
      const boss = kind === 'boss';
      const radius = .14 + Math.sqrt(progress) * (boss ? 3.35 : 1.10);
      const height = kind === 'pickup' ? .08 : origin.y > 2.72 ? origin.y - .24 : .06;
      const center = point(origin.x, height, origin.z);
      const width = (boss ? .11 : .07) * (1 - progress);
      ring(out, center, radius, width, tint, boss ? 24 : 16, .13);
      if (boss && progress > .15) {
        ring(out, point(origin.x, height + .13, origin.z), radius * .72, width * .62,
          mix(tint, sparkWhite, .52), 18, .27);
      }
    }
    if (kind !== 'pickup' && progress < .22) {
      const scale = (1 - progress / .26) * (kind === 'boss' ? .36 : collapse ? .22 : .088);
      const vertical = point(0, 1, 0);
      const core = reduced ? scale * .7 : scale;
      crystal(out, origin, vertical, axes(vertical), core, core * 1.45, core * .65,
        tint, mix(tint, sparkWhite, reduced ? .12 : .48));
    }
  }

  function drawAbilityBursts(out, near) {
    const reduced = motion.matches;
    if (!reduced) {
      for (const blast of V5.bursts.slice(-12)) {
        if (!near(blast.p)) continue;
        const progress = clamp(1 - blast.life / blast.max, 0, 1);
        if (progress >= .94) continue;
        const radius = Math.max(.09, Math.sqrt(progress) * blast.radius);
        ring(out, blast.p, radius, .115 * (1 - progress), v11Color(blast.color), 24, .08);
      }
      for (const pulse of effects) {
        if (pulse.type !== 'pulse' || !near(pulse)) continue;
        const t = clamp(1 - pulse.life / pulse.max, 0, 1);
        ring(out, point(pulse.x, .072, pulse.z), .2 + t * 7.4,
          .135 * (1 - t), v11Color(pulse.color), 28, .22);
      }
    }
    for (const line of V5.grappleLines.slice(-12)) {
      if (!near(line.a) && !near(line.b)) continue;
      const dx = line.b.x - line.a.x, dy = line.b.y - line.a.y, dz = line.b.z - line.a.z;
      const length = Math.hypot(dx, dy, dz);
      if (length < .01) continue;
      const basis = axes(point(dx / length, dy / length, dz / length));
      const width = .030 * clamp(line.life / line.max, .1, 1);
      ribbons(out, line.b, line.a, basis, width, width, v11Color(line.color));
    }
  }

  function impactOrigin(position, direction) {
    let origin = {...position};
    for (let step = 0; step < 3 && v5WorldCollision(origin); step++) {
      origin = offset(origin, direction, -.055);
    }
    return origin;
  }

  // Retain the original callbacks for combat logic. Everything added here is visual.
  const originalContact = v5OnContact;
  v5OnContact = function (projectile, position, target) {
    const result = originalContact.apply(this, arguments);
    const range = Math.hypot(position.x - player.x, position.z - player.z);
    if (range < 43) {
      const surface = target === 'world';
      const origin = surface && projectile.d ? impactOrigin(position, projectile.d) : {...position};
      const color = v11Color(projectile.color || '#8bfffa');
      beginBurst(origin, surface ? mix(color, orange, .4) : color,
        surface ? 'surface' : 'hit', surface ? 5 : 7, .35, projectile.d);
    }
    return result;
  };

  const originalEnemyEffects = v7UpdateEnemyEffects;
  v7UpdateEnemyEffects = function (dt) {
    const tracked = state === 'PLAYING' && V7.hostileShots.length ? V7.hostileShots.slice() : [];
    const result = originalEnemyEffects.apply(this, arguments);
    if (V7.hostileShots.length === tracked.length) return result;
    for (const shot of tracked) {
      if (shot.life <= 0 || V7.hostileShots.includes(shot) || !v5WorldCollision(shot.p)) continue;
      const range = Math.hypot(shot.p.x - player.x, shot.p.z - player.z);
      if (range > .8 && range < 43) {
        beginBurst(impactOrigin(shot.p, shot.d), orange, 'surface', 4, .28, shot.d);
      }
    }
    return result;
  };

  const originalKill = killEnemy;
  killEnemy = function (enemy) {
    const boss = enemy.type === 'boss';
    const y = enemy.v9Flying ? enemy.flightY + .55 : boss ? 1.30 : .89;
    const position = point(enemy.x, y, enemy.z);
    const result = originalKill.apply(this, arguments);
    beginBurst(position, v11Color(enemy.variant?.color || '#8af8ff'),
      boss ? 'boss' : 'kill', boss ? 23 : 13, boss ? .92 : .68);
    return result;
  };

  const originalMove = v5MovePlayer;
  const originalUpdate = updatePlayer;
  v5MovePlayer = function (dt) {
    const nearby = state === 'PLAYING' && pickups.length
      ? pickups.filter(p => p.life > dt && Math.hypot(p.x - player.x, p.z - player.z) < 1.4)
      : [];
    const result = originalMove.apply(this, arguments);
    for (const pickup of nearby) {
      if (pickups.includes(pickup)) continue;
      beginBurst(point(pickup.x, .57, pickup.z), v11Color(supplyColors[pickup.type] || '#b7d6ff'),
        'pickup', 8, .40);
    }
    return result;
  };
  if (originalUpdate === originalMove) updatePlayer = v5MovePlayer;

  const originalProjectiles = v5Projectiles;
  v5Projectiles = function (dt) {
    clock += dt;
    for (let i = bursts.length - 1; i >= 0; i--) {
      if (clock - bursts[i].started < bursts[i].duration) continue;
      fragmentCount -= bursts[i].fragments.length;
      bursts.splice(i, 1);
    }
    const result = originalProjectiles.apply(this, arguments);
    if (state === 'PLAYING') advanceThrowables(dt);
    return result;
  };

  function clearCombatEffects() {
    bursts.length = 0;
    thrownItems.length = 0;
    fireZones.length = 0;
    throwing = null;
    fragmentCount = 0;
    clock = 0;
  }

  const originalBuildArena = buildArena;
  buildArena = function () {
    clearCombatEffects();
    return originalBuildArena.apply(this, arguments);
  };

  const originalStartWave = startWave;
  startWave = function () {
    clearCombatEffects();
    return originalStartWave.apply(this, arguments);
  };

  function startThrow(kind) {
    if (state !== 'PLAYING' || throwing || V5.climb) return;
    const item = gear[kind];
    if (!(player[item.stock] > 0)) {
      toast('NO ' + (kind === 'grenade' ? 'FRAG GRENADES' : 'MOLOTOVS') + ' · RESUPPLY IN SHOP', 1.1);
      return;
    }
    player[item.stock]--;
    reloadTimer = 0;
    throwing = {kind, age: 0};
    refreshHUD();
  }

  const originalShoot = shoot;
  shoot = function () {
    if (!throwing || state !== 'PLAYING') return originalShoot.apply(this, arguments);
  };
  const originalReload = reload;
  reload = function () {
    if (!throwing || state !== 'PLAYING') return originalReload.apply(this, arguments);
  };
  const originalScope = v6Scoped;
  v6Scoped = function () {
    return !(throwing && state === 'PLAYING') && originalScope.apply(this, arguments);
  };
  const originalViewmodel = drawWeapon;
  drawWeapon = function () {
    if (throwing && (state === 'PLAYING' || state === 'PAUSED')) {
      drawThrowHand();
      return;
    }
    return originalViewmodel.apply(this, arguments);
  };

  const help = document.querySelector('#menu-screen .key-help');
  help.append(document.createElement('br'));
  const touchActions = document.querySelector('.touch-actions');
  const status = document.createElement('div');
  status.className = 'cap hidden';
  status.style.letterSpacing = '0';
  $('misc-status').after(status);
  const controls = Object.entries(gear).map(([kind, item], index) => {
    const key = document.createElement('span');
    key.className = 'keycap';
    key.textContent = item.key.slice(-1);
    help.append(key, ' ' + item.name + (index ? '' : ' · '));
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'touch-btn hidden';
    button.addEventListener('click', () => startThrow(kind));
    touchActions.append(button);
    return {kind, item, button};
  });
  document.addEventListener('keydown', event => {
    if (state !== 'PLAYING' || event.repeat || event.altKey || event.metaKey) return;
    const control = controls.find(({item}) => item.key === event.code);
    if (!control) return;
    event.preventDefault();
    startThrow(control.kind);
  });

  const originalVisibility = gameVisible;
  gameVisible = function (visible) {
    originalVisibility(visible);
    const campaign = visible && state !== 'DUEL';
    status.classList.toggle('hidden', !campaign);
    for (const {button} of controls) button.classList.toggle('hidden', !campaign);
    if (visible && state === 'DUEL') clearCombatEffects();
  };
  const originalHud = refreshHUD;
  refreshHUD = function () {
    originalHud();
    if (!['PLAYING', 'PAUSED', 'SHOP'].includes(state)) return;
    const labels = controls.map(({item, button}) => {
      const stock = player[item.stock] ?? 0;
      button.textContent = item.short + ' ' + stock;
      button.setAttribute('aria-label', 'Throw ' + item.name.toLowerCase() + ' (' + stock + ' left)');
      return item.key.slice(-1) + ' ' + item.short.toUpperCase() + ' ' + stock;
    });
    status.textContent = labels.join(' · ');
  };

  return function draw(out, eye) {
    if (!['PLAYING', 'PAUSED', 'DUEL'].includes(state)) return;
    const near = p => p && (p.x - eye.x) ** 2 + (p.z - eye.z) ** 2 < 45 ** 2;
    const drawProjectiles = (shots, hostile) => {
      let count = 0;
      for (let i = shots.length - 1; i >= 0; i--) {
        const shot = shots[i];
        if (near(shot.p)) drawShot(out, shot, hostile || shot.owner === 'remote', count++ < 50);
      }
    };
    drawProjectiles(V5.projectiles, false);
    drawProjectiles(V7.hostileShots, true);
    if (state !== 'DUEL') {
      for (const item of thrownItems) if (near(item.p)) drawThrownItem(out, item);
      for (const zone of fireZones) if (near(zone.center)) drawFireZone(out, zone);
      for (const pickup of pickups.slice(-28)) {
        if (!near(pickup)) continue;
        const radius = motion.matches ? .51 : .51 + .07 * Math.sin(clock * 3.8 + pickup.x);
        ring(out, point(pickup.x, .069, pickup.z), radius, .028,
          v11Color(supplyColors[pickup.type] || '#b7d6ff'), 12, .33);
      }
    }
    drawAbilityBursts(out, near);
    for (const burst of bursts) if (near(burst.origin)) drawBurst(out, burst);
  };
})();
