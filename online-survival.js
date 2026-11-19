'use strict';

const {modes, canStand, roof} = require('./online-rules.js');
const waveCount = modes.survival.goal;
const directions = [[1,0],[-1,0],[0,1],[0,-1]];
const types = {
  scout: {hp:52, speed:2.1, radius:.40, height:1.8, range:7, damage:8, interval:1700},
  striker: {hp:43, speed:3.3, radius:.37, height:1.8, range:5, damage:9, interval:1450},
  bulwark: {hp:158, speed:1.45, radius:.56, height:1.8, range:11, damage:13, interval:1900},
  boss: {hp:670, speed:1.25, radius:.79, height:2.7, range:15, damage:20, interval:1200}
};

function create(arena, time) {
  const entry = [];
  for (let z = 2; z < arena.size - 2; z++) {
    for (let x = 2; x < arena.size - 2; x++) {
      const nearEdge = Math.min(x,z,arena.size-1-x,arena.size-1-z) <= 5;
      if (nearEdge && arena.grid[z][x] === 0) entry.push({x:x+.5, z:z+.5});
    }
  }
  return {entry, wave:0, nextWaveAt:time+1600, nextSpawnAt:0, queue:[],
    robots:new Map(), fields:new Map(), sequence:0};
}

function lineClear(arena, from, to) {
  const dx = to.x-from.x, dy = to.y-from.y, dz = to.z-from.z;
  const count = Math.ceil(Math.hypot(dx,dy,dz)/.25);
  for (let i=1; i<count; i++) {
    const t = i/count;
    if (roof(arena,from.x+dx*t,from.z+dz*t)>from.y+dy*t) return false;
  }
  return true;
}

function routeField(arena, session, pilot) {
  const x = Math.floor(pilot.x), z = Math.floor(pilot.z);
  const cached = session.fields.get(pilot.id);
  if (cached?.x === x && cached.z === z) return cached.distance;
  const {size, grid} = arena;
  const distance = new Int16Array(size*size).fill(-1);
  const queue = [];
  const enqueue = (col, row, step) => {
    const index = row*size+col;
    if (grid[row]?.[col] !== 0 || distance[index] !== -1) return;
    distance[index] = step;
    queue.push(index);
  };
  enqueue(x,z,0);
  if (!queue.length) {
    // On a roof, guide robots to the closest open street.
    let closest = Infinity;
    for (let row=1; row<size-1; row++) {
      for (let col=1; col<size-1; col++) {
        if (grid[row][col] !== 0) continue;
        const dist = Math.abs(col-x)+Math.abs(row-z);
        if (dist >= closest) continue;
        closest = dist;
        queue[0] = row*size+col;
      }
    }
    if (queue.length) distance[queue[0]] = 0;
  }
  for (let i=0; i<queue.length; i++) {
    const index = queue[i], col = index%size, row = Math.floor(index/size);
    for (const [dx,dz] of directions) enqueue(col+dx,row+dz,distance[index]+1);
  }
  session.fields.set(pilot.id,{x,z,distance});
  return distance;
}

function beginWave(session, time) {
  session.wave++;
  session.nextWaveAt = 0;
  session.nextSpawnAt = time;
  const count = 4+2*session.wave;
  session.queue = Array.from({length:count}, (_, i) => {
    if (session.wave === waveCount && i === 2) return 'boss';
    if (session.wave >= 3 && i%4 === 2) return 'bulwark';
    if (session.wave >= 2 && i%3 === 1) return 'striker';
    return 'scout';
  });
}

function spawnRobot(session, pilots, time) {
  const type = session.queue.shift();
  const config = types[type];
  const active = [...session.robots.values()];
  const safe = session.entry.filter(p => pilots.every(target => Math.hypot(target.x-p.x,target.z-p.z)>8) &&
    active.every(robot => Math.hypot(robot.x-p.x,robot.z-p.z)>1.4));
  const pool = safe.length ? safe : session.entry;
  const point = pool[Math.floor(Math.random()*pool.length)];
  const hp = Math.round(config.hp*(type==='boss' ? 1 : 1+.065*(session.wave-1)));
  const id = ++session.sequence;
  session.robots.set(id,{...point,...config, id,type,y:0,hp,maxHp:hp,attackAt:time+850,moving:false});
  session.nextSpawnAt = time+430;
}

function moveRobot(arena, robot, field, dt) {
  const col = Math.floor(robot.x), row = Math.floor(robot.z);
  let best = field[row*arena.size+col], x = col+.5, z = row+.5;
  if (robot.waypoint) {
    ({x,z}=robot.waypoint);
  } else {
    for (const [dx,dz] of directions) {
      const distance = field[(row+dz)*arena.size+col+dx];
      if (distance >= 0 && (best < 0 || distance < best)) {
        best = distance;
        x = col+dx+.5;
        z = row+dz+.5;
      }
    }
    robot.waypoint={x,z};
  }
  const dx = x-robot.x, dz = z-robot.z, gap = Math.hypot(dx,dz);
  if (gap < .03) {
    robot.waypoint=null;
    return;
  }
  const amount = Math.min(gap,robot.speed*dt)/gap;
  const nextX = robot.x+dx*amount, nextZ = robot.z+dz*amount;
  if (canStand(arena,nextX,0,nextZ)) {
    robot.x = nextX;
    robot.z = nextZ;
    robot.moving = true;
  } else {
    robot.waypoint=null;
  }
}

function advance(arena, session, members, time, dt, callbacks) {
  const pilots = [...members.values()].filter(pilot => pilot.hp > 0);
  if (!pilots.length) {
    callbacks.finish(`Team down after ${Math.max(0,session.wave-1)} cleared waves.`);
    return;
  }
  if (session.nextWaveAt) {
    if (time < session.nextWaveAt) return;
    const resupply = session.wave > 0;
    beginWave(session,time);
    if (resupply) callbacks.resupply();
  }
  if (session.queue.length && time >= session.nextSpawnAt) spawnRobot(session,pilots,time);
  if (!session.robots.size && !session.queue.length) {
    if (session.wave === waveCount) callbacks.finish(`Team victory! All ${waveCount} robot waves cleared.`);
    else {
      session.nextWaveAt = time+4400;
      callbacks.waveCleared();
    }
    return;
  }
  const targets = pilots.map(pilot => ({pilot,field:routeField(arena,session,pilot)}));
  for (const robot of session.robots.values()) {
    robot.moving = false;
    const origin = {x:robot.x,y:robot.height*.67,z:robot.z};
    const nearest = targets.map(({pilot,field}) => ({
      pilot, field, distance:Math.hypot(robot.x-pilot.x,robot.z-pilot.z)
    })).sort((a,b)=>a.distance-b.distance);
    const firingTarget = nearest.find(({pilot,distance}) =>
      distance <= robot.range && lineClear(arena,origin,{x:pilot.x,y:pilot.y+.93,z:pilot.z}));
    if (firingTarget) {
      if (time >= robot.attackAt) {
        robot.attackAt = time+robot.interval;
        callbacks.fire(robot,origin,firingTarget.pilot);
      }
    } else {
      moveRobot(arena,robot,nearest[0].field,dt);
    }
  }
}

function snapshot(session, time) {
  return {
    wave:session.wave, waiting:Math.max(0,session.nextWaveAt-time),
    remaining:session.robots.size+session.queue.length,
    robots:[...session.robots.values()].map(r => [r.id,r.type,r.x,r.z,r.hp,r.maxHp,r.moving])
  };
}

function damage(session, robot, amount) {
  if (!session.robots.has(robot.id)) return false;
  robot.hp = Math.max(0,robot.hp-Math.round(amount));
  if (robot.hp) return false;
  session.robots.delete(robot.id);
  return true;
}

module.exports = {create, advance, snapshot, damage};
