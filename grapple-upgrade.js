'use strict';

{
  const reach = 58;
  const cellSize = 6;
  const minimumRange = .72;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let gridIndex = null;
  let indexedFaces = null;
  let rayId = 0;
  let nextPreviewAt = -Infinity;
  let preview = null;
  let retract = null;

  const vector = (x, y, z) => ({x, y, z});
  const sum = (a, b) => vector(a.x + b.x, a.y + b.y, a.z + b.z);
  const minus = (a, b) => vector(a.x - b.x, a.y - b.y, a.z - b.z);
  const scaled = (a, factor) => vector(a.x * factor, a.y * factor, a.z * factor);
  const dot = (a, b) => a.x * b.x + a.y * b.y + a.z * b.z;
  const magnitude = (a) => Math.hypot(a.x, a.y, a.z);
  const normalize = (a) => scaled(a, 1 / (magnitude(a) || 1));
  const divide = (value) => Math.floor(value / cellSize);
  const bucketKey = (x, z) => x + z * 1024;
  const at = (start, direction, distance) => sum(start, scaled(direction, distance));
  const smoothstep = (x) => x * x * (3 - 2 * x);

  function indexWorld() {
    indexedFaces = V5.faces;
    gridIndex = new Map();
    for (const face of indexedFaces) {
      if (face.kind === 'decal') continue;
      let minX = Infinity, minZ = Infinity, maxX = -Infinity, maxZ = -Infinity;
      for (const [x,,z] of face.verts) {
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minZ = Math.min(minZ, z);
        maxZ = Math.max(maxZ, z);
      }
      const record = {face, lastRay: 0};
      for (let x = divide(minX - .001); x <= divide(maxX + .001); x++) {
        for (let z = divide(minZ - .001); z <= divide(maxZ + .001); z++) {
          const key = bucketKey(x, z);
          let bucket = gridIndex.get(key);
          if (!bucket) gridIndex.set(key, bucket = []);
          bucket.push(record);
        }
      }
    }
  }

  function intersectTriangle(ray, a, b, c, kind, face) {
    const uX = b[0]-a[0], uY = b[1]-a[1], uZ = b[2]-a[2];
    const vX = c[0]-a[0], vY = c[1]-a[1], vZ = c[2]-a[2];
    const {direction:d, origin:o} = ray;
    const pX = d.y*vZ-d.z*vY, pY = d.z*vX-d.x*vZ, pZ = d.x*vY-d.y*vX;
    const determinant = uX*pX + uY*pY + uZ*pZ;
    if (Math.abs(determinant) < 1e-8) return;
    const inv = 1/determinant, tx = o.x-a[0], ty = o.y-a[1], tz = o.z-a[2];
    const u = (tx*pX + ty*pY + tz*pZ)*inv;
    if (u < -.00001 || u > 1.00001) return;
    const qX = ty*uZ-tz*uY, qY = tz*uX-tx*uZ, qZ = tx*uY-ty*uX;
    const v = (d.x*qX + d.y*qY + d.z*qZ)*inv;
    if (v < -.00001 || u+v > 1.00001) return;
    const distance = (vX*qX + vY*qY + vZ*qZ)*inv;
    if (distance < ray.min || distance >= ray.best) return;
    const normal = normalize(vector(uY*vZ-uZ*vY, uZ*vX-uX*vZ, uX*vY-uY*vX));
    ray.best = distance;
    ray.hit = {
      ...at(o,d,distance), distance, kind, face,
      normal: dot(normal,d) < 0 ? normal : scaled(normal,-1)
    };
  }

  function intersectFace(ray, points, kind, face) {
    for (let i = 1; i + 1 < points.length; i++) {
      intersectTriangle(ray, points[0], points[i], points[i+1], kind, face);
    }
  }

  function scanStatic(ray) {
    if (indexedFaces !== V5.faces) indexWorld();
    const {origin:o, direction:d} = ray;
    const visit = ++rayId;
    let x = divide(o.x), z = divide(o.z);
    const stepX = Math.sign(d.x), stepZ = Math.sign(d.z);
    const spanX = Math.abs(d.x) > 1e-8 ? cellSize/Math.abs(d.x) : Infinity;
    const spanZ = Math.abs(d.z) > 1e-8 ? cellSize/Math.abs(d.z) : Infinity;
    let nextX = spanX === Infinity ? Infinity : ((x+(stepX>0?1:0))*cellSize-o.x)/d.x;
    let nextZ = spanZ === Infinity ? Infinity : ((z+(stepZ>0?1:0))*cellSize-o.z)/d.z;
    let traveled = 0;
    while (traveled < ray.best) {
      const bucket = gridIndex.get(bucketKey(x,z));
      if (bucket) {
        for (const record of bucket) {
          if (record.lastRay === visit) continue;
          record.lastRay = visit;
          const {face} = record;
          intersectFace(ray, face.verts, face.kind, face);
        }
      }
      if (nextX < nextZ) {
        traveled = nextX;
        nextX += spanX;
        x += stepX;
      } else {
        traveled = nextZ;
        nextZ += spanZ;
        z += stepZ;
      }
    }
  }

  function inRayBounds(ray, x, y, z, width, height, depth = width) {
    const {origin:o, direction:d} = ray;
    let near = ray.min, far = ray.best;
    const axes = [[x,o.x,d.x,width], [y,o.y,d.y,height], [z,o.z,d.z,depth]];
    for (const [center,start,velocity,size] of axes) {
      const low = center-size/2, high = center+size/2;
      if (Math.abs(velocity) < 1e-8) {
        if (start < low || start > high) return false;
        continue;
      }
      const a = (low-start)/velocity, b = (high-start)/velocity;
      near = Math.max(near,Math.min(a,b));
      far = Math.min(far,Math.max(a,b));
      if (near > far) return false;
    }
    return true;
  }

  function scanGeometry(ray, kind, draw, follow) {
    const renderPolygon = v5DrawPolygon, project = v5Project;
    const prior = ray.best;
    v5DrawPolygon = (points) => intersectFace(ray,points,kind);
    v5Project = () => null;
    try {
      draw();
    } finally {
      v5DrawPolygon = renderPolygon;
      v5Project = project;
    }
    if (follow && ray.best < prior) {
      ray.hit.follow = follow;
      ray.hit.offset = minus(ray.hit,follow());
    }
  }

  function horizontalDistance(o, target) {
    return Math.hypot(target.x-o.x,target.z-o.z);
  }

  function getOpponents() {
    const room = typeof getNeonOnlineOpponents === 'function' ? getNeonOnlineOpponents() : [];
    return room.length ? room : V5.remote ? [V5.remote] : [];
  }

  function actorPosition(actor) {
    return vector(actor.x,actor.v9Flying ? actor.flightY : actor.y || 0,actor.z);
  }

  function scanObjects(ray, actors) {
    const {origin:o} = ray;
    for (const prop of props) {
      if (prop.houseBounds) continue;
      const distance = horizontalDistance(o,prop);
      if (distance >= 38) continue;
      const size = prop.size || 1;
      const dim = v10Dims(prop);
      if (inRayBounds(ray,prop.x,dim.height*.51,prop.z,5.4*size,dim.height*1.10)) {
        scanGeometry(ray,'prop',() => v10BuildProp(prop,distance));
      }
    }
    for (const station of stations) {
      if (horizontalDistance(o,station) < 39 && inRayBounds(ray,station.x,1.23,station.z,1.08,2.46)) {
        scanGeometry(ray,'beacon',() => v10DrawBeacon(station,station.active));
      }
    }
    for (const fixture of V9.fixtures) {
      if (horizontalDistance(o,fixture) < 40 &&
          inRayBounds(ray,fixture.x,(fixture.h+1.6)/2,fixture.z,3.4,fixture.h+1.6)) {
        scanGeometry(ray,'fixture',() => v9DrawFixture(fixture));
      }
    }
    for (const tower of V7.scenery) {
      if (horizontalDistance(o,tower) >= 43 ||
          !inRayBounds(ray,tower.x,(tower.h+.3)/2,tower.z,3.4,tower.h+.3,1.3)) continue;
      scanGeometry(ray,'fixture',() => {
        const orient = {x:tower.x,y:0,z:tower.z,right:[1,0],forward:[0,1]};
        const box = (x,y,w,h,d) => v7CuboidWorld({cx:x,cy:y,cz:0,wx:w,hy:h,dz:d},orient,'#8299b5');
        box(0,tower.h/2,.32,tower.h,.32);
        if (tower.kind === 'crane' || tower.kind === 'communications mast') {
          box(0,tower.h-.4,3.3,.24,.3);
          box(-1.2,tower.h-.84,.1,1,.1);
        } else {
          box(0,tower.h+.05,1.2,.23,1.2);
        }
      });
    }
    if (!actors) return;
    if (state === 'PLAYING') {
      for (const pickup of pickups) {
        if (horizontalDistance(o,pickup) < 45 && inRayBounds(ray,pickup.x,1,pickup.z,1.6,2)) {
          const follow = () => pickups.includes(pickup) ? vector(pickup.x,0,pickup.z) : null;
          scanGeometry(ray,'pickup',() => v9DrawPickup(pickup),follow);
        }
      }
      for (const enemy of enemies) {
        const distance = horizontalDistance(o,enemy);
        const position = actorPosition(enemy);
        const height = enemy.v9Flying ? 1.27 : enemy.type === 'boss' ? 3.2 : 2.15;
        if (enemy.hp <= 0 || distance >= 45 ||
            !inRayBounds(ray,enemy.x,position.y+height*.5,enemy.z,3.5,height)) continue;
        const follow = () => enemy.hp > 0 && enemies.includes(enemy) ? actorPosition(enemy) : null;
        scanGeometry(ray,'actor',() => {
          const triangles = [];
          if (!v11RobotModel(triangles,enemy,distance)) {
            v9EnemyModel(enemy,{x:enemy.x,y:0,z:enemy.z},height);
            return;
          }
          for (let i = 0; i < triangles.length; i += 21) {
            intersectTriangle(ray,triangles.slice(i,i+3),triangles.slice(i+7,i+10),
              triangles.slice(i+14,i+17),'actor');
          }
        },follow);
      }
    }
    if (state === 'DUEL') {
      for (const actor of getOpponents()) {
        const y = actor.y || 0;
        const online = actor.id != null;
        if (!(actor.hp > 0) || horizontalDistance(o,actor) >= (online ? 61 : 45) ||
            !inRayBounds(ray,actor.x,y+1.13,actor.z,1.7,2.25)) continue;
        const follow = () => {
          const current = getOpponents().find(p => actor.id == null ? p === actor : p.id === actor.id);
          return current?.hp > 0 ? actorPosition(current) : null;
        };
        scanGeometry(ray,'actor',() => {
          const weapon = WEAPONS[actor.weapon];
          const precision = weapon?.scope || ['rifle','zenith','comet'].includes(weapon?.id);
          const model = online ? {...actor,onlinePilot:true,
            type:precision ? 'sniper' : 'runner',maxHp:100,walkPhase:now*10} : actor;
          v7EnemyModel(model,{x:actor.x,y,z:actor.z},1.9);
        },follow);
      }
    }
  }

  function findAnchor() {
    const aim = v8AimRay();
    const ray = {origin:aim.eye,direction:aim.d,min:minimumRange,best:reach,hit:null};
    scanStatic(ray);
    scanObjects(ray,true);
    return ray.hit;
  }

  function launcher(eye, side) {
    return vector(eye.x+Math.cos(player.a)*.43-Math.sin(player.a)*side*.27,
      eye.y-.37,eye.z+Math.sin(player.a)*.43+Math.cos(player.a)*side*.27);
  }

  function travelPoint(grapple) {
    if (grapple.age >= grapple.travel) return grapple.anchor;
    const fraction = clamp(grapple.age/grapple.travel,0,1);
    return at(grapple.origin,minus(grapple.anchor,grapple.origin),fraction);
  }

  function updateGrappleHud() {
    const percent = Math.round(100*V7.gas/V7.gasMax);
    const fill = $('grapple-fill'), label = $('grapple-timer');
    const grapple = V5.grapple;
    const readyAt = V7.exhaustedUntil;
    const blocked = percent < 8 || now + .12 < readyAt;
    const status = grapple ? (grapple.age < grapple.travel ? 'CASTING' : 'TETHERED') :
      blocked ? 'RECHARGING' : percent + '%';
    if (fill.dataset.percent !== String(percent)) {
      fill.dataset.percent = percent;
      fill.style.width = percent+'%';
      fill.style.background = percent < 25 ? '#ffb66f' : '#83f7e6';
    }
    if (label.textContent !== status) label.textContent = status;
    const active = state === 'PLAYING' || state === 'DUEL';
    if (!active || grapple || blocked || V5.climb || !(player.hp > 0)) {
      preview = null;
      return;
    }
    if (now >= nextPreviewAt || indexedFaces !== V5.faces) {
      preview = findAnchor();
      nextPreviewAt = now+.075;
    }
  }

  v6GrappleHud = updateGrappleHud;
  v6AimPoint = findAnchor;
  v8PickAnchor = findAnchor;
  v6LaunchGrapple = function () {
    if ((state !== 'PLAYING' && state !== 'DUEL') || V5.climb ||
        !(player.hp > 0) || V5.grapple) return;
    if (V7.gas < 8 || now + .12 < V7.exhaustedUntil) {
      toast('Grapple recharging',.55);
      return;
    }
    const anchor = findAnchor();
    if (!anchor) {
      toast('Aim the grapple at a surface',.65);
      return;
    }
    const side = keys.KeyQ || touchHeld.has('grappleQ') ? -1 : 1;
    V5.grapple = {
      anchor, side, survey: indexedFaces,
      origin:launcher(v5Eyes(),side), age:0, travel:clamp(anchor.distance/210,.045,.23),
      started:now, sampledAt:-Infinity, blockedSince:null, bestApproach:Infinity, stalledFor:0
    };
    retract = null;
    V5.grappleCooldown = 0;
    snd('pulse');
    updateGrappleHud();
  };

  v6ReleaseGrapple = function () {
    const grapple = V5.grapple;
    if (!grapple) return;
    if (grapple.origin && !reducedMotion.matches) {
      retract = {point:travelPoint(grapple), side:grapple.side, started:now};
    }
    V5.grapple = null;
    V7.exhaustedUntil = Math.max(V7.exhaustedUntil,now+.27);
    nextPreviewAt = now;
    updateGrappleHud();
  };

  window.applyNeonGrappleForce = function (dt) {
    const grapple = V5.grapple;
    if (grapple.survey !== V5.faces || V5.climb) {
      v6ReleaseGrapple();
      return;
    }
    grapple.age += dt;
    const anchor = grapple.anchor;
    if (anchor.follow) {
      const actor = anchor.follow();
      if (!actor) {
        v6ReleaseGrapple();
        return;
      }
      const contact = sum(actor,anchor.offset);
      const movement = minus(contact,anchor);
      if (magnitude(movement) > 7) {
        v6ReleaseGrapple();
        return;
      }
      const next = at(anchor,movement,1-Math.exp(-19*dt));
      anchor.x = next.x;
      anchor.y = next.y;
      anchor.z = next.z;
    }
    if (grapple.age < grapple.travel) return;
    if (now >= grapple.sampledAt+.075) {
      grapple.sampledAt = now;
      const origin = v5Eyes(), distance = magnitude(minus(anchor,origin));
      if (distance > reach+4) {
        v6ReleaseGrapple();
        return;
      }
      const ray = {origin,direction:normalize(minus(anchor,origin)),min:.3,best:distance-.40,hit:null};
      scanStatic(ray);
      if (!ray.hit) scanObjects(ray,false);
      if (ray.hit) grapple.blockedSince ??= now;
      else grapple.blockedSince = null;
      if (grapple.blockedSince !== null && now-grapple.blockedSince > .11) {
        v6ReleaseGrapple();
        return;
      }
    }
    let target = at(anchor,anchor.normal,.10);
    const wallTop = anchor.kind === 'wall' && anchor.face.h-anchor.y < 1.35;
    if (wallTop) target = sum(at(anchor,anchor.normal,-.36),vector(0,anchor.face.h-anchor.y+1.14,0));
    const ground = anchor.kind === 'floor';
    if (ground) target.y += .97;
    const delta = minus(target,vector(player.x,player.y+.90,player.z));
    const distance = magnitude(delta);
    const stop = wallTop ? .48 : ground ? .73 : 1.02;
    const direction = normalize(delta);
    const strength = smoothstep(clamp((grapple.age-grapple.travel)/.18,0,1));
    const speed = Math.min(29,Math.max(0,distance-stop)*4.1);
    const velocity = vector(player.vx,player.vY,player.vz);
    const response = 1-Math.exp(-8.5*dt);
    const change = clamp((speed-dot(velocity,direction))*response*strength,-37*dt,45*dt);
    player.vx += direction.x*change;
    player.vz += direction.z*change;
    player.vY += direction.y*change;
    if (!ground && (delta.y > 0 || !player.onGround)) player.vY += 14.7*dt*strength;
    if (distance < grapple.bestApproach-.07) {
      grapple.bestApproach = distance;
      grapple.stalledFor = 0;
    } else {
      grapple.stalledFor += dt;
    }
    if (distance < stop+.14 || grapple.stalledFor > .65) v6ReleaseGrapple();
  };

  function drawHook(out, point, origin, normal) {
    const axis = normal ? scaled(normal,-1) : normalize(minus(point,origin));
    const right = normalize(Math.abs(axis.y) > .96 ?
      vector(0,axis.z,-axis.y) : vector(-axis.z,0,axis.x));
    const up = vector(axis.y*right.z-axis.z*right.y,
      axis.z*right.x-axis.x*right.z,axis.x*right.y-axis.y*right.x);
    const pin = (x,y,z) => {
      const p = sum(point,sum(scaled(right,x),sum(scaled(up,y),scaled(axis,z))));
      return [p.x,p.y,p.z];
    };
    const plate = (points,color) => v11Poly(out,points.map(p=>pin(...p)),color);
    for (const sign of [-1,1]) {
      const blade = [[0,-.103,-.32],[sign*.146,-.117,-.28],[sign*.225,-.026,-.17],
        [sign*.157,.134,.01],[sign*.054,.18,.07],[sign*.096,.069,-.020],
        [sign*.081,-.015,-.145],[0,-.042,-.235]];
      for (let i=0; i<3; i++) {
        const a = blade[i], b = blade[i+1], c = blade[6-i], d = blade[7-i];
        plate([a,b,c,d],sign === 1 ? '#bbf0ed' : '#86aab8');
        plate([a,b,[b[0],b[1]-.02,b[2]+.027],[a[0],a[1]-.02,a[2]+.027]],'#375264');
      }
    }
    const stem = [[-.042,-.135,-.44],[.042,-.135,-.44],[.068,-.048,-.218],[-.068,-.048,-.218]];
    plate(stem,'#172935');
    plate([[-.021,-.12,-.422],[.021,-.12,-.422],[.030,-.043,-.240],[-.030,-.043,-.240]],'#83ffe8');
  }

  function drawCable(from,to,taut) {
    const delta = minus(to,from);
    const slack = taut ? .016 : Math.min(.33,.015*magnitude(delta));
    let previous = from;
    for (let i=1;i<=7;i++) {
      const progress = i/7;
      const point = at(from,delta,progress);
      point.y -= 4*slack*progress*(1-progress);
      v11Line(previous,point,'#142b36',.010);
      const up = vector(0,.005,0);
      v11Line(sum(previous,up),sum(point,up),'#8adad6',.0035);
      previous = point;
    }
  }

  window.drawNeonGrapple = function (out, eye) {
    const grapple = V5.grapple;
    if ((state !== 'PLAYING' && state !== 'DUEL' && state !== 'PAUSED') || player.hp <= 0) return;
    if (grapple?.origin) {
      const origin = launcher(eye,grapple.side);
      const point = travelPoint(grapple);
      const latched = grapple.age >= grapple.travel;
      drawCable(origin,point,latched);
      const normal = latched ? grapple.anchor.normal : null;
      const modelPoint = normal ? at(point,normal,.105) : point;
      drawHook(out,modelPoint,origin,normal);
    } else if (retract && now-retract.started < .145) {
      const origin = launcher(eye,retract.side);
      const progress = smoothstep(clamp((now-retract.started)/.145,0,1));
      const point = at(retract.point,minus(origin,retract.point),progress);
      drawCable(origin,point,false);
      drawHook(out,point,origin,null);
    }
  };

  const renderScene = render;
  render = function () {
    renderScene();
    if (!preview || V5.grapple || v6Scoped() ||
        (state !== 'PLAYING' && state !== 'DUEL')) return;
    const size = clamp(viewH/720,.8,1.25);
    ctx.save();
    ctx.translate(viewW*.5+19*size,viewH*.5+19*size);
    ctx.scale(size,size);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(0,-6);
    ctx.lineTo(0,2);
    ctx.quadraticCurveTo(0,6,-4,6);
    ctx.quadraticCurveTo(-8,6,-8,2);
    ctx.lineTo(-8,0);
    ctx.lineTo(-10,2);
    ctx.moveTo(-8,0);
    ctx.lineTo(-6,2);
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#112938';
    ctx.stroke();
    ctx.lineWidth = 1.4;
    ctx.strokeStyle = '#acfdef';
    ctx.stroke();
    ctx.restore();
  };

  const prepareArena = buildArena;
  buildArena = function (...args) {
    const result = prepareArena(...args);
    indexWorld();
    preview = null;
    retract = null;
    nextPreviewAt = -Infinity;
    return result;
  };

  const finish = finishWave;
  finishWave = function (...args) {
    v6ReleaseGrapple();
    return finish(...args);
  };
}
