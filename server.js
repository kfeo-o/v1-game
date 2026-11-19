'use strict';

const {createServer} = require('node:http');
const {createReadStream, statSync} = require('node:fs');
const {join} = require('node:path');
const {randomBytes, randomInt} = require('node:crypto');
const {WebSocket, WebSocketServer} = require('ws');
const rules = require('./online-rules.js');
const survival = require('./online-survival.js');

const files = new Set([
  'index.html', '404.html', 'enemy-models.js', 'world-materials.js', 'world-previews.webp',
  'world-upgrade.js', 'weapon-upgrade.js', 'combat-effects.js', 'wave-events.js',
  'shop-upgrade.css', 'shop-upgrade.js', 'grapple-upgrade.js', 'map-expansion.js',
  'online-rules.js', 'online-play.js', 'online-play.css'
]);
const mime = {
  html:'text/html; charset=utf-8', js:'text/javascript; charset=utf-8',
  css:'text/css; charset=utf-8', webp:'image/webp'
};
const server = createServer((request, response)=>{
  const path = (request.url || '/').split('?')[0];
  const filename = path==='/' ? 'index.html' : path.slice(1);
  if (path==='/health' && (request.method==='GET'||request.method==='HEAD')) {
    response.writeHead(200, {'Content-Type':'text/plain; charset=utf-8'});
    response.end('ok');
    return;
  }
  if (!files.has(filename) || !['GET','HEAD'].includes(request.method)) {
    response.writeHead(404).end();
    return;
  }
  const file = join(__dirname,filename);
  let length;
  try { length=statSync(file).size; }
  catch { response.writeHead(404).end(); return; }
  response.writeHead(200,{
    'Content-Type':mime[filename.split('.').at(-1)],
    'Content-Length':length,
    'Cache-Control':'no-cache',
    'X-Content-Type-Options':'nosniff'
  });
  if (request.method==='HEAD') response.end();
  else createReadStream(file).on('error',()=>response.destroy()).pipe(response);
});

const rooms = new Map();
const clients = new WebSocketServer({noServer:true,maxPayload:4096,perMessageDeflate:false});
const extraOrigins = new Set((process.env.NEON_ALLOWED_ORIGINS || '').split(',').map(v=>v.trim()).filter(Boolean));
server.on('upgrade',(request,socket,head)=>{
  const origin=request.headers.origin;
  let allowed = !origin || origin==='null' || extraOrigins.has(origin);
  try { allowed ||= new URL(origin).host===request.headers.host; } catch { /* Invalid or absent origin. */ }
  if (request.url!=='/match' || !allowed || clients.clients.size>=160) {
    socket.end('HTTP/1.1 403 Forbidden\r\nConnection: close\r\n\r\n');
    return;
  }
  clients.handleUpgrade(request,socket,head,ws=>clients.emit('connection',ws));
});

const send = (ws,type,data={})=>{
  if (ws.readyState===WebSocket.OPEN && ws.bufferedAmount<128*1024) ws.send(JSON.stringify({type,...data}));
};
const broadcast = (room,type,data)=>{
  for (const participant of room.members.values()) send(participant.ws,type,data);
};
const fail = (ws,message)=>send(ws,'error',{message});

function lobby(room) {
  broadcast(room,'lobby',{
    code:room.code, mode:room.mode, map:room.map, host:room.host, phase:room.phase,
    capacity:rules.modes[room.mode].capacity, winner:room.winner, reason:room.reason,
    players:[...room.members.values()].map(p=>({id:p.id,name:p.name,kills:p.kills,deaths:p.deaths}))
  });
}

function finish(room,winner,reason) {
  room.phase='results';
  room.shots.length=0;
  room.winner=winner;
  room.reason=reason;
  lobby(room);
}

function depart(ws) {
  const participant=ws.participant,room=participant?.room;
  if (!room) return;
  participant.room=null;
  room.members.delete(participant.id);
  if (!room.members.size) {
    rooms.delete(room.code);
    return;
  }
  if (room.host===participant.id) room.host=room.members.keys().next().value;
  if (room.phase==='playing' && room.members.size<2) finish(room,null,'The other players left.');
  else lobby(room);
}

function newCode() {
  const alphabet='23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let code;
  do { code=Array.from({length:6},()=>alphabet[randomInt(alphabet.length)]).join(''); }
  while (rooms.has(code));
  return code;
}

function attach(ws,room,name) {
  const cleaned=String(typeof name==='string'?name:'').normalize('NFKC')
    .replace(/[\p{Cc}\p{Cf}\p{Cs}]/gu,'').trim().slice(0,18);
  const participant=ws.participant;
  participant.name=cleaned || 'Pilot '+(room.members.size+1);
  participant.room=room;
  participant.kills=0;
  participant.deaths=0;
  room.members.set(participant.id,participant);
  send(ws,'joined',{id:participant.id,code:room.code});
  lobby(room);
}

function createRoom(ws,packet) {
  if (!Object.hasOwn(rules.modes,packet.mode) || !rules.maps.includes(packet.map)) {
    fail(ws,'Choose a valid map and match type.');
    return;
  }
  if (rooms.size>=75) { fail(ws,'The server is full. Try again shortly.'); return; }
  const room={
    code:newCode(),mode:packet.mode,map:packet.map,host:ws.participant.id,
    phase:'lobby',members:new Map(),shots:[],winner:null,reason:'',
    arena:rules.layout(packet.map,packet.mode)
  };
  rooms.set(room.code,room);
  attach(ws,room,packet.name);
}

function joinRoom(ws,packet) {
  const code=typeof packet.code==='string'?packet.code.trim().toUpperCase():'';
  const room=rooms.get(code);
  if (!room) { fail(ws,'That room was not found. Check the invite code.'); return; }
  if (room.phase==='playing') { fail(ws,'The match is in progress. Join between matches.'); return; }
  if (room.members.size>=rules.modes[room.mode].capacity) { fail(ws,'This room is full.'); return; }
  attach(ws,room,packet.name);
}

function respawn(room,pilot,place,time) {
  let point=place;
  if (!point) {
    let best=-1;
    for (const candidate of room.arena.spawns) {
      let nearest=Infinity;
      for (const other of room.members.values()) {
        if (other===pilot || !other.hp) continue;
        nearest=Math.min(nearest,Math.hypot(candidate.x-other.x,candidate.z-other.z));
      }
      if (nearest>best) { best=nearest; point=candidate; }
    }
  }
  Object.assign(pilot,point,{
    hp:100,pitch:0,moving:false,slide:false,wardUntil:time+1250,respawnAt:0,
    movedAt:time,weapon:0,fireAt:time+150,shotSequence:0,motionSequence:0,reloading:null,
    seed:randomBytes(4).readUInt32LE(),life:(pilot.life||0)+1
  });
  pilot.ammo=rules.weapons.map(w=>({mag:w.mag,reserve:w.reserve}));
  send(pilot.ws,'spawn',{...point,seed:pilot.seed,life:pilot.life,ward:1250});
}

function start(room,requester) {
  if (room.host!==requester.id || room.phase==='playing') return;
  if (room.members.size<2) { fail(requester.ws,'Wait for at least one friend to join.'); return; }
  const time=performance.now();
  room.phase='playing';
  room.winner=null;
  room.reason='';
  room.shots.length=0;
  room.endsAt=time+8*60*1000;
  if (room.mode==='survival') room.survival=survival.create(room.arena,time);
  broadcast(room,'start',{map:room.map,mode:room.mode,goal:rules.modes[room.mode].goal});
  [...room.members.values()].forEach((pilot,index)=>{
    pilot.kills=0;
    pilot.deaths=0;
    respawn(room,pilot,room.arena.spawns[index],time);
  });
  snapshot(room,time);
}

const validNumber = (n,abs)=>Number.isFinite(n)&&Math.abs(n)<=abs;

function position(room,pilot,packet,time) {
  if (!pilot.hp || !Number.isInteger(packet.seq) || packet.seq<=pilot.motionSequence) return;
  pilot.motionSequence=packet.seq;
  if (![packet.x,packet.z].every(n=>validNumber(n,room.arena.size)) ||
      !validNumber(packet.y,28) || packet.y<0 || !validNumber(packet.a,1e6) ||
      !validNumber(packet.pitch,Math.PI/2)) return;
  pilot.a=packet.a%(Math.PI*2);
  pilot.pitch=packet.pitch;
  pilot.slide=packet.slide===true;
  const dt=Math.min(.25,Math.max(.02,(time-pilot.movedAt)/1000));
  const dx=packet.x-pilot.x,dz=packet.z-pilot.z,dy=packet.y-pilot.y;
  const horizontal=Math.hypot(dx,dz);
  if (horizontal>28*dt+.43 || Math.abs(dy)>29*dt+.65) return;
  const steps=Math.max(1,Math.ceil(horizontal/.32));
  for (let i=1;i<=steps;i++) {
    const t=i/steps;
    if (!rules.canStand(room.arena,pilot.x+dx*t,pilot.y+dy*t,pilot.z+dz*t)) return;
  }
  pilot.moving=horizontal>.02;
  pilot.movedAt=time;
  pilot.x=packet.x;pilot.y=packet.y;pilot.z=packet.z;
}

function equip(pilot,index,time) {
  if (!rules.weapons[index] || index===pilot.weapon) return;
  pilot.weapon=index;
  pilot.fireAt=Math.max(pilot.fireAt,time+105);
  pilot.reloading=null;
}

function syncAmmo(pilot,index) {
  send(pilot.ws,'ammo',{weapon:index,...pilot.ammo[index]});
}

function completeReload(pilot,time) {
  const pending=pilot.reloading;
  if (!pending || pending.until>time) return;
  pilot.reloading=null;
  const slot=pilot.ammo[pending.index];
  const amount=Math.min(rules.weapons[pending.index].mag-slot.mag,slot.reserve);
  slot.mag+=amount;
  slot.reserve-=amount;
}

function reload(pilot,time) {
  const index=pilot.weapon,weapon=rules.weapons[index],slot=pilot.ammo[index];
  if (!pilot.hp || pilot.reloading || slot.mag>=weapon.mag || slot.reserve<=0) return;
  pilot.reloading={index,until:time+weapon.reload*1000-65};
}

function fire(room,pilot,packet,time) {
  if (!pilot.hp || !Number.isInteger(packet.shot) || packet.shot<=pilot.shotSequence) return;
  pilot.shotSequence=packet.shot;
  const index=pilot.weapon,weapon=rules.weapons[index],slot=pilot.ammo[index];
  completeReload(pilot,time);
  if (time+25<pilot.fireAt || pilot.reloading || slot.mag<=0) {
    syncAmmo(pilot,index);
    return;
  }
  const origin={x:pilot.x,y:pilot.y+(pilot.slide?1.07:1.55),z:pilot.z};
  const dirs=rules.volley(weapon,pilot.a,pilot.pitch,packet.ads===true,packet.sprint===true,
    rules.shotSeed(pilot.seed,packet.shot));
  slot.mag--;
  pilot.fireAt=Math.max(time,pilot.fireAt)+weapon.rate*1000;
  for (const d of dirs) {
    if (room.shots.length>=360) break;
    room.shots.push({from:pilot.id,weapon,p:{
      x:origin.x+d.x*.5,y:origin.y+d.y*.5,z:origin.z+d.z*.5
    },d,life:weapon.life});
  }
  broadcast(room,'fire',{id:pilot.id,weapon:index,origin,dirs});
}

function snapshot(room,time) {
  broadcast(room,'frame',{
    remaining:room.survival ? 0 : Math.max(0,room.endsAt-time),
    survival:room.survival ? survival.snapshot(room.survival,time) : undefined,
    players:[...room.members.values()].map(p=>[
      p.id,p.name,p.x,p.y,p.z,p.a,p.pitch,p.hp,p.weapon,p.moving,p.kills,p.deaths,p.slide
    ])
  });
}

function impact(room,shot,victim,damage,time) {
  if (room.phase!=='playing' || victim.hp<=0 || time<victim.wardUntil) return;
  const owner=room.members.get(shot.from);
  if (!owner) return;
  victim.hp=Math.max(0,victim.hp-Math.round(damage));
  const fallen=victim.hp===0;
  if (fallen) {
    victim.deaths++;
    owner.kills++;
    victim.respawnAt=time+1900;
  }
  broadcast(room,'hit',{id:victim.id,from:owner.id,hp:victim.hp,fallen,
    point:shot.p,weapon:shot.weapon.id,color:shot.weapon.color});
  if (owner.kills>=rules.modes[room.mode].goal) finish(room,owner.id,'Score limit reached.');
}

function robotImpact(room,shot,victim,damage,time) {
  if (shot.robot) {
    if (!victim.hp || time<victim.wardUntil) return;
    victim.hp=Math.max(0,victim.hp-Math.round(damage));
    if (!victim.hp) victim.deaths++;
    broadcast(room,'hit',{id:victim.id,hp:victim.hp,fallen:!victim.hp,
      point:shot.p,weapon:shot.weapon.id,color:shot.weapon.color});
    return;
  }
  if (!victim.hp) return;
  const fallen=survival.damage(room.survival,victim,damage);
  if (fallen) room.members.get(shot.from).kills++;
  broadcast(room,'robot-hit',{id:victim.id,from:shot.from,hp:victim.hp,fallen,
    point:shot.p,weapon:shot.weapon.id,color:shot.weapon.color});
}

function advanceSurvival(room,time,dt) {
  survival.advance(room.arena,room.survival,room.members,time,dt,{
    finish: reason=>finish(room,null,reason),
    waveCleared: ()=>{room.shots.length=0;},
    resupply: ()=>{
      let index=0;
      for (const pilot of room.members.values()) {
        const spawn=room.arena.spawns[index++];
        if (!pilot.hp) {
          respawn(room,pilot,spawn,time);
        } else {
          pilot.hp=Math.min(100,pilot.hp+35);
          pilot.wardUntil=time+850;
          pilot.reloading=null;
          pilot.ammo=rules.weapons.map(({mag,reserve})=>({mag,reserve}));
          send(pilot.ws,'restock',{ammo:pilot.ammo});
        }
      }
    },
    fire: (robot,origin,pilot)=>{
      if (room.shots.length>=360) return;
      const dx=pilot.x-origin.x,dy=pilot.y+(pilot.slide?.69:.93)-origin.y,dz=pilot.z-origin.z;
      const length=Math.hypot(dx,dy,dz)||1;
      const d={x:dx/length,y:dy/length,z:dz/length};
      const weapon={...rules.robotBolt,damage:robot.damage};
      room.shots.push({robot:true,weapon,p:{...origin},d,life:weapon.life});
      broadcast(room,'robot-fire',{id:robot.id,origin,d});
    }
  });
}

function visible(room,from,to,height) {
  const dx=to.x-from.x,dy=to.y+height-from.y,dz=to.z-from.z;
  const count=Math.max(1,Math.ceil(Math.hypot(dx,dy,dz)/.35));
  for (let i=1;i<count;i++) {
    const t=i/count;
    if (rules.roof(room.arena,from.x+dx*t,from.z+dz*t)>from.y+dy*t) return false;
  }
  return true;
}

function advanceShots(room,seconds,time) {
  const remaining=[];
  const applyImpact=room.survival ? robotImpact : impact;
  for (const shot of room.shots) {
    shot.life-=seconds;
    if (shot.life<=0 || (!shot.robot && !room.members.has(shot.from))) continue;
    const {p,d,weapon}=shot,travel=weapon.speed*seconds;
    const targets=room.survival && !shot.robot ? room.survival.robots : room.members;
    const steps=Math.max(1,Math.ceil(travel/.17));
    const step=travel/steps;
    let hit=null,blocked=false;
    for (let i=0;i<steps;i++) {
      p.x+=d.x*step;p.y+=d.y*step;p.z+=d.z*step;
      blocked=p.x<1 || p.z<1 || p.x>=room.arena.size-1 || p.z>=room.arena.size-1 ||
        p.y<.05 || rules.roof(room.arena,p.x,p.z)>p.y;
      if (blocked) break;
      for (const target of targets.values()) {
        const height=target.height??(target.slide?1.24:1.8);
        if (target.id!==shot.from && target.hp>0 && time>=(target.wardUntil??0) &&
            Math.hypot(p.x-target.x,p.z-target.z)<(target.radius??.33) && p.y>target.y+.08 && p.y<target.y+height) {
          hit=target;
          break;
        }
      }
      if (hit) break;
    }
    if (!hit && !blocked) { remaining.push(shot); continue; }
    if (hit) applyImpact(room,shot,hit,weapon.damage,time);
    if (weapon.blast || (hit&&weapon.chain)) {
      const range=weapon.blast || weapon.chain;
      for (const target of targets.values()) {
        if (target===hit || target.id===shot.from) continue;
        const near=Math.hypot(p.x-target.x,p.y-(target.y+.9),p.z-target.z);
        if (near<range && visible(room,p,target,.9)) {
          applyImpact(room,shot,target,weapon.damage*(weapon.blast ? .64-.39*near/range : .5),time);
        }
      }
    }
    if (room.phase!=='playing') return;
  }
  room.shots=remaining;
}

function onPacket(ws,packet,time) {
  if (!packet || typeof packet!=='object' || typeof packet.type!=='string') return;
  const pilot=ws.participant,room=pilot.room;
  if (!room) {
    if (packet.type==='create') createRoom(ws,packet);
    if (packet.type==='join') joinRoom(ws,packet);
    return;
  }
  if (packet.type==='leave') { depart(ws); return; }
  if (packet.type==='start') { start(room,pilot); return; }
  if (room.phase!=='playing' || packet.life!==pilot.life) return;
  if (packet.type==='move') position(room,pilot,packet,time);
  if (packet.type==='equip' && Number.isInteger(packet.weapon)) equip(pilot,packet.weapon,time);
  if (packet.type==='reload') reload(pilot,time);
  if (packet.type==='fire') {
    position(room,pilot,packet,time);
    fire(room,pilot,packet,time);
  }
}

clients.on('connection',ws=>{
  ws.participant={id:randomBytes(8).toString('hex'),ws,room:null};
  ws.alive=true;
  ws.on('pong',()=>{ws.alive=true;});
  ws.on('close',()=>depart(ws));
  ws.on('error',()=>ws.terminate());
  let credit=65,seenAt=performance.now();
  ws.on('message',(data,binary)=>{
    const time=performance.now();
    credit=Math.min(65,credit+(time-seenAt)*.075);
    seenAt=time;
    if (binary || credit<1) return;
    credit--;
    try { onPacket(ws,JSON.parse(data.toString()),time); }
    catch (error) {
      if (!(error instanceof SyntaxError)) console.error('Match message error',error);
    }
  });
  send(ws,'hello',{protocol:1});
});

let previous=performance.now();
setInterval(()=>{
  const time=performance.now(),dt=Math.min(.075,(time-previous)/1000);
  previous=time;
  for (const room of rooms.values()) {
    if (room.phase!=='playing') continue;
    if (!room.survival && time>=room.endsAt) {
      const players=[...room.members.values()].sort((a,b)=>b.kills-a.kills);
      finish(room,players[0]?.kills>players[1]?.kills?players[0].id:null,'Time expired.');
      continue;
    }
    for (const pilot of room.members.values()) {
      completeReload(pilot,time);
      if (!room.survival && !pilot.hp && pilot.respawnAt<=time) respawn(room,pilot,null,time);
    }
    if (room.survival) advanceSurvival(room,time,dt);
    if (room.phase!=='playing') continue;
    advanceShots(room,dt,time);
    if (room.phase==='playing') snapshot(room,time);
  }
},40).unref();
setInterval(()=>{
  for (const ws of clients.clients) {
    if (!ws.alive) { ws.terminate(); continue; }
    ws.alive=false;
    ws.ping();
  }
},30000).unref();

const port=Number(process.env.PORT || 8080);
const host=process.env.NEON_HOST || (process.env.PORT ? '0.0.0.0' : '127.0.0.1');
server.listen(port,host,()=>{
  const address=server.address();
  console.log(`Neon Siege online host listening on http://${host}:${address.port}`);
});
