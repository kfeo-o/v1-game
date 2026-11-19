/* Campaign encounter rotation, optional objectives, and shielded bosses. */
(() => {
  'use strict';

  const events = {
    rush: {
      title: 'Rush Protocol', color: '#ff956f', detail: 'Fast strikers arrive in rapid bursts.',
      formation: ['striker', 'striker', null, 'striker', null]
    },
    sky: {
      title: 'Sky Lock', color: '#80e9ff', detail: 'Drone patrols are coming in above street level.',
      formation: ['aerial', null, 'aerial', null, null]
    },
    convoy: {
      title: 'Armored Convoy', color: '#ffb28f', detail: 'Repair units deploy beside heavy armor.',
      formation: ['scout', 'bulwark', 'support', 'sentinel', null, null]
    },
    cache: {
      title: 'Signal Cache', color: '#ffdb86', detail: 'Follow the gold radar marker for credits and shields.'
    },
    defend: {
      title: 'Beacon Defense', color: '#80ffc4', detail: 'Find the beacon and hold its perimeter for 12 seconds.'
    },
    rooftop: {
      title: 'Rooftop Relay', color: '#b8a4ff', detail: 'Grapple or climb to the marked rooftop before time runs out.'
    },
    boss: {
      title: 'Shielded Overseer', color: '#88e4ff', detail: 'Take the high ground to break its two shield emitters.'
    }
  };
  const rotation = new Map([
    [2, 'defend'], [3, 'rush'], [4, 'cache'], [6, 'rooftop'], [7, 'sky'], [9, 'convoy'],
    [12, 'rush'], [13, 'defend'], [14, 'cache'], [16, 'rooftop'], [17, 'sky'], [19, 'convoy']
  ]);
  const objectiveSeconds = {cache: 30, defend: 42, rooftop: 35};
  const defenseSeconds = 12;
  const emitterRadius = .51;
  const emitterHeight = .96;
  let encounter = null;
  let objective = null;
  let activeBoss = null;
  let summoning = false;
  let convoyAnchor = null;
  let adjustedSpawn = 0;

  const panel = document.createElement('aside');
  panel.id = 'wave-event';
  panel.hidden = true;
  panel.setAttribute('aria-label', 'Wave event');
  panel.innerHTML = '<strong id="wave-event-title"></strong><span id="wave-event-detail"></span>' +
    '<div id="wave-event-navigation" hidden><i aria-hidden="true">▲</i><span id="wave-event-distance"></span>' +
    '<span id="wave-event-timer" role="timer" aria-label="Seconds remaining"></span></div>';
  $('hud').append(panel);
  const title = $('wave-event-title');
  const detail = $('wave-event-detail');
  const navigation = $('wave-event-navigation');
  const compass = navigation.querySelector('i');
  const distanceLabel = $('wave-event-distance');
  const timer = $('wave-event-timer');
  const styles = document.createElement('style');
  styles.textContent = `
    #wave-event{position:absolute;left:23px;top:178px;width:min(238px,58vw);padding:9px 12px;
      color:#dcecff;background:#091926ed;border:1px solid #425b71;border-left:3px solid var(--event-color);
      border-radius:7px;box-shadow:0 6px 16px #02081163;font:600 11px/1.4 system-ui;pointer-events:none}
    #wave-event-title{display:block;color:var(--event-color);text-transform:uppercase;font-size:11px;letter-spacing:1.2px}
    #wave-event-detail{display:block;margin-top:2px}
    #wave-event-navigation{display:flex;align-items:center;gap:7px;margin-top:5px;
      color:var(--event-color);font:800 11px/1.2 ui-monospace,monospace;font-variant-numeric:tabular-nums}
    #wave-event-navigation>i{display:block;width:12px;text-align:center;font-size:10px;font-style:normal}
    #wave-event-timer{margin-left:auto}
    #wave-event-navigation[hidden],#wave-event[hidden]{display:none}
    @media(max-width:700px){#wave-event{top:267px;left:9px;width:min(204px,56vw);padding:7px 9px}}
    @media(max-width:700px) and (max-height:500px){#wave-event{top:58px;left:50%;width:34vw;
      transform:translateX(-50%);font-size:10px}#wave-event-title{font-size:10px}}
  `;
  document.head.append(styles);

  function eventAt(n) {
    if (n > MAX_WAVES) return;
    return n % 5 === 0 ? 'boss' : rotation.get(n % 20);
  }

  function campaignVisible() {
    return Boolean(encounter) && !inTraining() && (state === 'PLAYING' || state === 'PAUSED');
  }

  function inTraining() {
    return typeof trainingRange !== 'undefined' && trainingRange;
  }

  function pickStreetSite() {
    const originX = Math.floor(player.x);
    const originZ = Math.floor(player.z);
    const ground = (x, z) => x > 0 && z > 0 && x < ARENA_SIZE - 1 && z < ARENA_SIZE - 1 && !grid[z][x];
    const seed = [];
    for (let radius = 0; radius <= 8 && seed.length === 0; radius++) {
      for (let z = originZ - radius; z <= originZ + radius; z++) {
        for (let x = originX - radius; x <= originX + radius; x++) {
          if (ground(x, z)) seed.push({ x, z, steps: 0 });
        }
      }
    }
    const visited = new Set(seed.map(p => p.z * ARENA_SIZE + p.x));
    const preferred = [];
    const closer = [];
    for (let i = 0; i < seed.length; i++) {
      const { x, z, steps } = seed[i];
      const px = x + .5, pz = z + .5;
      const distance = Math.hypot(px - player.x, pz - player.z);
      if (distance > 2.5 && distance <= 15 && freeCircle(px, pz, .46) &&
          !stations.some(s => Math.hypot(px - s.x, pz - s.z) < 2) &&
          !props.some(p => Math.hypot(px - p.x, pz - p.z) < 1.05) &&
          !V9.fixtures.some(p => Math.hypot(px - p.x, pz - p.z) < 1.05)) {
        const candidates = distance >= 6 && steps >= 6 ? preferred : closer;
        candidates.push({x: px, y: 0, z: pz});
      }
      if (steps >= 15) continue;
      for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx, nz = z + dz, key = nz * ARENA_SIZE + nx;
        if (!ground(nx, nz) || visited.has(key)) continue;
        visited.add(key);
        seed.push({ x: nx, z: nz, steps: steps + 1 });
      }
    }
    const pool = preferred.length ? preferred : closer;
    return pool[Math.floor(Math.random() * pool.length)] || null;
  }

  function nearbyRoofs(origin, minDistance, maxDistance) {
    return V5.ladders.map(ladder => ({...ladder, distance: Math.hypot(ladder.roofX - origin.x, ladder.roofZ - origin.z)}))
      .filter(ladder => ladder.distance >= minDistance && ladder.distance <= maxDistance &&
        v5CanMove(ladder.roofX, ladder.roofZ, ladder.h) &&
        v5CanMove(ladder.x + ladder.dx * .4, ladder.z + ladder.dz * .4, 0))
      .sort((a, b) => a.distance - b.distance);
  }

  function pickRooftopSite() {
    const candidates = nearbyRoofs(player, 8, 29).slice(0, 8);
    const ladder = candidates[Math.floor(Math.random() * candidates.length)];
    return ladder ? {x: ladder.roofX, y: ladder.h, z: ladder.roofZ} : null;
  }

  function emitterPositions(x, z, towardX, towardZ) {
    const angle = Math.atan2(towardZ - z, towardX - x);
    return [-1, 1].map(side => ({x: x - Math.sin(angle) * 1.4 * side, z: z + Math.cos(angle) * 1.4 * side}));
  }

  function rooftopSight(ladder, part) {
    const roofEye = ladder.h + 1.55;
    const steps = Math.ceil(Math.hypot(part.x - ladder.roofX, part.z - ladder.roofZ) * 4);
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      if (v5WorldCollision({x: lerp(ladder.roofX, part.x, t), y: lerp(roofEye, 5.58, t),
        z: lerp(ladder.roofZ, part.z, t)})) return false;
    }
    return true;
  }

  function bossStreetSite(boss) {
    const roofCandidates = nearbyRoofs(player, 4, Infinity);
    for (const ladder of roofCandidates) {
      for (const depth of [6, 9, 11]) {
        for (const side of [0, -2.5, 2.5, -4.5, 4.5]) {
          const x = ladder.roofX + ladder.dx * depth - ladder.dz * side;
          const z = ladder.roofZ + ladder.dz * depth + ladder.dx * side;
          if (Math.hypot(x - player.x, z - player.z) < 5 || !freeCircle(x, z, 1.35) || !v5CanMove(x, z, 0)) continue;
          const parts = emitterPositions(x, z, ladder.roofX, ladder.roofZ);
          if (parts.every(part => rooftopSight(ladder, part))) return {x, z, ladder, parts};
        }
      }
    }
    return {x: boss.x, z: boss.z, parts: emitterPositions(boss.x, boss.z, player.x, player.z)};
  }

  function prepareBoss(boss) {
    const {x, z, ladder, parts} = bossStreetSite(boss);
    boss.x = x;
    boss.z = z;
    boss.v9Flying = true;
    boss.flightY = 4.25;
    const max = 56 + Math.min(40, wave * 2);
    boss.campaignShield = {
      emitters: parts.map(part => ({...part, hp: max, max})),
      roof: ladder && {x: ladder.roofX, y: ladder.h, z: ladder.roofZ},
      descent: 0, nextHint: 0
    };
    activeBoss = boss;
    banner(boss.variant?.name || 'SHIELDED OVERSEER', 'PHASE 1 · DESTROY BOTH EMITTERS FROM HIGH GROUND', 3);
  }

  window.hitNeonBossShield = function(before, after, projectile, boss) {
    const shield = boss.campaignShield;
    const emitter = shield.emitters.find(part => part.hp > 0 && v5TargetHit(before, after, {
      x: part.x, y: boss.flightY + .82, z: part.z, radius: emitterRadius, height: emitterHeight
    }));
    if (emitter && projectile.launchY >= 3.65) {
      emitter.hp = Math.max(0, emitter.hp - Math.max(1, Math.round(projectile.damage)));
      hitTimer = .15;
      score += emitter.hp > 0 ? 5 : 50;
      snd('hit');
      if (!emitter.hp) V5.bursts.push({p: {...after}, color: '#a3eaff', life: .45, max: .45, radius: 1.15});
      if (shield.emitters.every(part => part.hp <= 0)) {
        shield.descent = .85;
        banner('SHIELD DOWN', 'PHASE 2 · STOP THE OVERSEER AND ITS REINFORCEMENTS', 3);
      }
      return true;
    }
    const blocked = emitter || v5TargetHit(before, after, {x: boss.x, y: boss.flightY, z: boss.z,
      radius: boss.radius, height: 2.7});
    if (blocked && now >= shield.nextHint && !shield.descent) {
      shield.nextHint = now + 3;
      toast(emitter ? 'TAKE HIGH GROUND TO HIT THE EMITTERS' : 'SHIELD UP · AIM FOR THE TWO BLUE EMITTERS', 1.4);
    }
    return Boolean(blocked);
  };

  function callReinforcements(boss) {
    summoning = true;
    try {
      for (let i = 0; i < 3; i++) {
        if (!spawnEnemy()) continue;
        spawnTotal++;
        const guard = enemies.at(-1);
        for (let j = 0; j < 9; j++) {
          const angle = (i * 3 + j) * TWOPI / 9;
          const x = boss.x + Math.cos(angle) * 2.65;
          const z = boss.z + Math.sin(angle) * 2.65;
          if (!v5CanMove(x, z, 0) || !freeCircle(x, z, .52) || Math.hypot(x - player.x, z - player.z) < 2.2 ||
              enemies.some(enemy => enemy !== guard && Math.hypot(x - enemy.x, z - enemy.z) < 1.05)) continue;
          guard.x = x;
          guard.z = z;
          break;
        }
      }
    } finally {
      summoning = false;
    }
  }

  const previousMoveAerial = v9MoveAerial;
  v9MoveAerial = function(enemy, dt) {
    const shield = enemy.campaignShield;
    if (!shield) return previousMoveAerial(enemy, dt);
    if (!shield.descent) {
      enemy.flightY = 4.25 + Math.sin(now * 2.3) * .18;
      return;
    }
    shield.descent = Math.max(0, shield.descent - dt);
    enemy.flightY = 4.25 * (shield.descent / .85);
    if (shield.descent > 0) return;
    enemy.campaignShield = null;
    enemy.v9Flying = false;
    enemy.v7AbilityAt = now + 4;
    V5.bursts.push({p: {x: enemy.x, y: .16, z: enemy.z}, color: '#ffa966', life: .48, max: .48, radius: 2.6});
    callReinforcements(enemy);
  };

  const previousStartWave = startWave;
  startWave = function(n) {
    encounter = null;
    objective = null;
    activeBoss = null;
    convoyAnchor = null;
    adjustedSpawn = 0;
    previousStartWave(n);
    if (state !== 'PLAYING' || wave !== n || inTraining()) return;
    encounter = eventAt(n);
    if (encounter in objectiveSeconds) {
      const site = encounter === 'rooftop' ? pickRooftopSite() : pickStreetSite();
      if (site) objective = {...site, remaining: objectiveSeconds[encounter], integrity: 100, defended: 0, activated: false};
      else encounter = null;
    }
    if (!encounter) return;
    const event = events[encounter];
    title.textContent = event.title;
    detail.textContent = event.detail;
    panel.style.setProperty('--event-color', event.color);
    navigation.hidden = true;
    banner(`WAVE ${String(n).padStart(2, '0')}`, event.title.toUpperCase(), 2.7);
  };

  const previousChooseVariant = v9ChooseVariant;
  v9ChooseVariant = function(isBoss = false) {
    if (summoning && !isBoss) {
      const specialists = V9.roster.filter(v => v.role === 'striker' && v.unlock <= wave);
      return specialists[Math.floor(Math.random() * specialists.length)] || previousChooseVariant(false);
    }
    const formation = encounter && events[encounter].formation;
    if (isBoss || state !== 'PLAYING' || !formation) return previousChooseVariant(isBoss);
    const role = formation[(spawned - 1) % formation.length];
    if (!role) return previousChooseVariant(false);
    if (role === 'aerial' && enemies.filter(e => e.v9Flying).length >= 4) {
      return previousChooseVariant(false);
    }
    const eligible = V9.roster.filter(v => v.role === role && v.unlock <= wave);
    return eligible[Math.floor(Math.random() * eligible.length)] || previousChooseVariant(false);
  };

  const previousSpawnEnemy = spawnEnemy;
  spawnEnemy = function() {
    const ok = previousSpawnEnemy();
    if (!ok || state !== 'PLAYING' || inTraining()) return ok;
    const enemy = enemies[enemies.length - 1];
    const role = enemy.variant?.role;
    if (role === 'boss') prepareBoss(enemy);
    if (encounter === 'rush' && role === 'striker') enemy.speed *= 1.13;
    if (encounter === 'convoy' && role === 'bulwark') convoyAnchor = enemy;
    if (encounter === 'convoy' && role === 'support' && convoyAnchor?.hp > 0) {
      const phase = Math.random() * TWOPI;
      for (let attempt = 0; attempt < 10; attempt++) {
        const angle = phase + attempt * TWOPI / 10;
        const x = convoyAnchor.x + Math.cos(angle) * 2.25;
        const z = convoyAnchor.z + Math.sin(angle) * 2.25;
        if (!freeCircle(x, z, .68) || Math.hypot(x - player.x, z - player.z) < 5.75) continue;
        enemy.x = x;
        enemy.z = z;
        break;
      }
    }
    return ok;
  };

  const previousUpdateEnemies = updateEnemies;
  updateEnemies = function(dt) {
    if (encounter === 'rush' && state === 'PLAYING' && spawned > adjustedSpawn) {
      // The campaign sets the next delay immediately after a successful spawn.
      adjustedSpawn = spawned;
      spawnTimer = Math.max(.18, spawnTimer * .74);
    }
    previousUpdateEnemies(dt);
  };

  const previousUpdatePlayer = updatePlayer;
  updatePlayer = function(dt) {
    previousUpdatePlayer(dt);
    if (!objective || state !== 'PLAYING' || inTraining()) return;
    objective.remaining -= dt;
    if (objective.remaining <= 0) {
      objective = null;
      detail.textContent = encounter === 'cache' ? 'The signal faded.' : 'Time expired.';
      return;
    }
    const distance = Math.hypot(objective.x - player.x, objective.z - player.z);
    if (encounter === 'cache' && distance <= 1.02 && player.y < 1.5) completeObjective(60, true);
    if (encounter === 'rooftop' && distance <= 1.25 && player.onGround && Math.abs(player.y - objective.y) < .25) completeObjective(85);
    if (encounter === 'defend') updateDefense(dt, distance);
  };

  function updateDefense(dt, distance) {
    const inside = distance <= 5 && player.y < 2;
    if (inside) objective.activated = true;
    if (!objective.activated) return;
    const attackers = enemies.filter(enemy => enemy.hp > 0 && !enemy.v9Flying &&
      Math.hypot(objective.x - enemy.x, objective.z - enemy.z) <= 3.25).length;
    objective.integrity = Math.max(0, objective.integrity - dt * Math.min(4, attackers) * 17);
    if (!objective.integrity) {
      objective = null;
      detail.textContent = 'The robots destroyed the beacon.';
      return;
    }
    if (inside) objective.defended += dt;
    if (objective.defended >= defenseSeconds) {
      completeObjective(100);
      return;
    }
    const action = inside ? 'Defend' : 'Return to beacon';
    const status = `${action} · ${Math.ceil(defenseSeconds - objective.defended)}s · ${Math.ceil(objective.integrity)}% integrity`;
    if (detail.textContent !== status) detail.textContent = status;
  }

  function completeObjective(credits, shieldBoost = false) {
    const payout = credits + Math.min(140, wave * 5);
    objective = null;
    coins += payout;
    score += 150;
    if (shieldBoost) player.shield = Math.min(100, player.shield + 20);
    detail.textContent = `Complete · +${payout} credits`;
    toast(`${events[encounter].title.toUpperCase()} · +${payout} CREDITS${shieldBoost ? ' · SHIELD BOOST' : ''}`, 2.2);
    snd('buy');
    refreshHUD();
  }

  function activeTarget() {
    if (objective) return objective;
    if (!activeBoss || activeBoss.hp <= 0) return null;
    const shield = activeBoss.campaignShield;
    return shield?.roof && player.y < 2.1 && !shield.descent ? shield.roof : activeBoss;
  }

  const previousRenderShop = renderShop;
  renderShop = function() {
    previousRenderShop();
    const next = eventAt(wave + 1);
    if (next) {
      const event = events[next];
      $('shop-tip').textContent = `Next wave · ${event.title}. ${event.detail}`;
    }
  };

  const previousRender = render;
  render = function() {
    previousRender();
    const hidden = !campaignVisible();
    if (panel.hidden !== hidden) panel.hidden = hidden;
    if (hidden) return;
    if (activeBoss) {
      const shield = activeBoss.campaignShield;
      const remaining = shield?.emitters.filter(part => part.hp > 0).length;
      const bossTitle = activeBoss.variant?.name || events.boss.title;
      const status = activeBoss.hp <= 0 ? 'Overseer defeated.' : shield && remaining
        ? `Phase 1 · ${remaining} of 2 emitters left. Shoot from high ground.`
        : 'Phase 2 · Fight the Overseer and its reinforcements.';
      if (title.textContent !== bossTitle) title.textContent = bossTitle;
      if (detail.textContent !== status) detail.textContent = status;
    }
    const target = activeTarget();
    navigation.hidden = !target;
    if (!target) return;
    const dx = target.x - player.x, dz = target.z - player.z;
    const distanceText = `${Math.ceil(Math.hypot(dx, dz))} m`;
    timer.hidden = !objective;
    const timeText = objective ? `${Math.ceil(objective.remaining)}s` : '';
    if (distanceLabel.textContent !== distanceText) distanceLabel.textContent = distanceText;
    if (timer.textContent !== timeText) timer.textContent = timeText;
    compass.style.transform = `rotate(${Math.atan2(dz, dx) - player.a}rad)`;
  };

  const previousDrawMinimap = drawMinimap;
  drawMinimap = function() {
    previousDrawMinimap();
    const target = activeTarget();
    if (!target || !campaignVisible()) return;
    const dx = target.x - player.x, dz = target.z - player.z;
    const scale = Math.min(4.1, 61 / (Math.hypot(dx, dz) || 1));
    mctx.save();
    mctx.translate(74, 74);
    mctx.rotate(-player.a - Math.PI / 2);
    mctx.translate(dx * scale, dz * scale);
    mctx.beginPath();
    mctx.moveTo(0, -6);
    mctx.lineTo(6, 0);
    mctx.lineTo(0, 6);
    mctx.lineTo(-6, 0);
    mctx.closePath();
    mctx.fillStyle = events[encounter].color;
    mctx.fill();
    mctx.lineWidth = 2;
    mctx.strokeStyle = '#1b2535';
    mctx.stroke();
    mctx.restore();
  };

  function objectiveGeometry(out) {
    const spin = now * 1.6;
    const hover = objective.y + .66 + .07 * Math.sin(now * 4);
    const tint = events[encounter].color;
    const ring = (angle, radius) => [objective.x + Math.cos(angle) * radius, objective.y + .083, objective.z + Math.sin(angle) * radius];
    const radius = encounter === 'defend' ? 5 : .83;
    for (let i = 0; i < 24; i++) {
      const angle = i * TWOPI / 24, next = (i + .83) * TWOPI / 24;
      const inner = radius - .12;
      v11Poly(out, [ring(angle, inner), ring(next, inner), ring(next, radius), ring(angle, radius)], tint);
    }
    crystal(out, objective.x, hover, objective.z, .42, .52, spin, tint);
  }

  function crystal(out, x, y, z, radius, height, spin, tint) {
    const tip = [x, y + height, z];
    const base = [x, y - height, z];
    const corners = Array.from({length: 4}, (_, i) => {
      const angle = spin + i * Math.PI / 2;
      return [x + Math.cos(angle) * radius, y, z + Math.sin(angle) * radius];
    });
    for (let i = 0; i < corners.length; i++) {
      const next = (i + 1) % corners.length;
      v11Poly(out, [tip, corners[i], corners[next]], i % 2 ? '#f1fcff' : tint);
      v11Poly(out, [base, corners[i], corners[next]], tint);
    }
  }

  function shieldGeometry(out, boss) {
    const shield = boss.campaignShield;
    if (shield.descent) return;
    const anchorY = boss.flightY + 1.33;
    for (const part of shield.emitters) {
      if (!part.hp) continue;
      const tint = part.hp / part.max > .5 ? '#69caff' : '#a7e7ff';
      crystal(out, part.x, anchorY, part.z, .47, .4, now * 2, tint);
    }
    const ring = (angle, height) => [boss.x + Math.cos(angle) * 1.05, height, boss.z + Math.sin(angle) * 1.05];
    for (let i = 0; i < 24; i++) {
      const angle = i * TWOPI / 24 + now * .5, next = (i + .65) * TWOPI / 24 + now * .5;
      v11Poly(out, [ring(angle, anchorY - .15), ring(next, anchorY - .15),
        ring(next, anchorY + .10), ring(angle, anchorY + .10)], '#64c6ff');
    }
  }

  const previousDynamic = v11Dynamic;
  v11Dynamic = function() {
    const geometry = previousDynamic();
    if (!campaignVisible()) return geometry;
    const signal = [];
    if (objective && Math.hypot(objective.x - player.x, objective.z - player.z) <= 40) objectiveGeometry(signal);
    if (activeBoss?.campaignShield && Math.hypot(activeBoss.x - player.x, activeBoss.z - player.z) <= 45) shieldGeometry(signal, activeBoss);
    if (!signal.length) return geometry;
    const combined = new Float32Array(geometry.length + signal.length);
    combined.set(geometry);
    combined.set(signal, geometry.length);
    return combined;
  };
})();
