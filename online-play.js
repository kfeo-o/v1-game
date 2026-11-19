'use strict';

let neonOnlineMatch = null;
function getNeonOnlineOpponents() {
  return neonOnlineMatch ? [...neonOnlineMatch.opponents.values()].filter(p=>p.hp>0) : [];
}
function drawNeonOnlineOpponents(eye,out) {
  if (!neonOnlineMatch) return false;
  const cooperative=!!neonOnlineMatch.survival;
  for (const pilot of getNeonOnlineOpponents()) {
    if (Math.hypot(pilot.x-eye.x,pilot.z-eye.z)>61) continue;
    const weapon=WEAPONS[pilot.weapon];
    const avatar={...pilot,onlinePilot:true,type:weapon?.scope||['rifle','zenith','comet'].includes(weapon?.id)?'sniper':'runner',
      maxHp:100,walkPhase:now*10};
    v7EnemyModel(avatar,{x:pilot.x,y:pilot.y,z:pilot.z},1.9);
    v11Cube(pilot.x,pilot.y+2.19,pilot.z,.36,.06,.16,cooperative?'#81ffcc':'#ff8caf');
  }
  if (cooperative) {
    for (const robot of neonOnlineMatch.survival.robots.values()) {
      const distance=Math.hypot(robot.x-eye.x,robot.z-eye.z);
      if (distance>43 || !robot.hp) continue;
      if (out && v11RobotModel(out,robot,distance)) continue;
      v9EnemyModel(robot,{x:robot.x,y:0,z:robot.z},robot.type==='boss'?2.7:1.85);
    }
  }
  return true;
}

(() => {
  const rules=NEON_ONLINE_RULES;
  const panel=document.createElement('div');
  panel.id='online-screen';
  panel.className='screen hidden';
  panel.innerHTML=`
    <section class="online-panel" role="dialog" aria-modal="true" aria-labelledby="online-title">
      <header class="online-heading">
        <div><h2 id="online-title">Online matches</h2><p id="online-subtitle">Create a private room or join a friend.</p></div>
        <button type="button" class="secondary" id="online-back">Back to maps</button>
      </header>
      <p id="online-status" role="status" aria-live="polite"></p>
      <div id="online-setup">
        <label class="online-name">Player name <input id="online-name" maxlength="18" autocomplete="nickname" placeholder="Pilot"></label>
        <div class="online-forms">
          <form id="online-create">
            <h3>Create a room</h3>
            <label>Match type <select id="online-mode"><option value="duel">1v1 · 2 players</option><option value="survival">Co-op survival · 2 players</option><option value="ffa">Free-for-all · up to 10</option></select></label>
            <label>Arena <select id="online-map"></select></label>
            <button type="submit" class="primary">Create room</button>
          </form>
          <form id="online-join">
            <h3>Join a room</h3>
            <label>Invite code <input id="online-code" maxlength="6" spellcheck="false" autocomplete="off" autocapitalize="characters" placeholder="ABC123" required></label>
            <button type="submit" class="secondary">Join room</button>
          </form>
        </div>
        <details class="online-server" id="online-server">
          <summary>Server address</summary>
          <label>Server URL <input id="online-endpoint" type="url" autocomplete="url"></label>
          <p>Use the URL of a running Neon Siege server.</p>
        </details>
      </div>
      <div id="online-room" class="hidden">
        <div class="online-invite"><div><span>Invite code</span><strong id="online-room-code"></strong></div>
          <button type="button" class="secondary" id="online-copy">Copy invite link</button>
        </div>
        <div id="online-room-summary"></div>
        <ol id="online-players" class="online-roster"></ol>
        <div class="online-room-actions">
          <button type="button" id="online-start" class="primary">Start match</button>
          <button type="button" id="online-leave-room" class="secondary">Leave room</button>
        </div>
      </div>
    </section>`;
  document.body.appendChild(panel);
  const tools=document.createElement('div');
  tools.id='online-tools';
  tools.className='hidden';
  tools.innerHTML='<button class="secondary" type="button" id="online-show-board" aria-expanded="false" aria-controls="online-board">Scores</button><button class="secondary" type="button" id="online-quit">Leave match</button>';
  document.body.appendChild(tools);
  const board=document.createElement('section');
  board.id='online-board';
  board.className='hidden';
  board.setAttribute('aria-label','Match scores');
  board.innerHTML='<h3>Match scores</h3><ol id="online-scores" class="online-roster"></ol>';
  document.body.appendChild(board);

  let socket=null, selfId=null, room=null, opening=false, wanted=null, endpoint=null;
  const defaultEndpoint=location.protocol==='http:'||location.protocol==='https:' ?
    location.origin : 'http://localhost:8080';
  $('online-endpoint').value=defaultEndpoint;
  if (location.protocol==='file:') $('online-server').open=true;
  try { $('online-name').value=localStorage.getItem('neon-siege-online-name')||''; } catch { /* Private browsing. */ }
  for (const id of rules.maps) {
    const option=document.createElement('option');
    option.value=id;
    option.textContent=MAPS[id].name;
    $('online-map').appendChild(option);
  }
  const status=text=>{$('online-status').textContent=text;};

  function send(type,fields={}) {
    if (socket?.readyState!==WebSocket.OPEN || socket.bufferedAmount>32768) return false;
    socket.send(JSON.stringify({type,...fields}));
    return true;
  }

  function readEndpoint() {
    const address=new URL($('online-endpoint').value || defaultEndpoint);
    if (!['http:','https:'].includes(address.protocol) || address.username || address.password)
      throw Error('Enter an HTTP or HTTPS server URL.');
    return address.origin;
  }

  function disconnect() {
    if (socket) {
      send('leave');
      const previous=socket;
      socket=null;
      previous.close();
    }
    room=null; selfId=null; opening=false; wanted=null;
  }

  function closeBoard() {
    board.classList.add('hidden');
    $('online-show-board').setAttribute('aria-expanded','false');
  }

  function stopPlaying() {
    if (neonOnlineMatch?.survival) enemies=[];
    neonOnlineMatch=null;
    V5.projectiles.length=0;
    V5.scopeDown=false;
    V5.climb=null;
    V5.grapple=null;
    V5.remote=null;
    V5.duelFinished=false;
    shootDown=false;
    keys={};
    touchHeld.clear();
    closeBoard();
    tools.classList.add('hidden');
    document.body.classList.remove('online-playing','online-locked');
  }

  const baseHide=hideScreens;
  hideScreens=function () {
    baseHide();
    panel.classList.add('hidden');
  };
  const baseMenu=showMenu;
  showMenu=function () {
    if (room || neonOnlineMatch || socket) {
      disconnect();
      stopPlaying();
    }
    baseMenu();
  };

  function showPanel() {
    hideScreens();
    gameVisible(false);
    state='DUEL_MENU';
    pointerUnlock();
    panel.classList.remove('hidden');
    paintLobby();
  }

  function beginRequest(action) {
    if (opening || room) return;
    try { endpoint=readEndpoint(); }
    catch (error) { status(error.message); return; }
    const name=$('online-name').value.trim();
    try { localStorage.setItem('neon-siege-online-name',name); } catch { /* Private browsing. */ }
    wanted={...action,name};
    opening=true;
    status('Connecting to the match server…');
    const url=new URL('/match',endpoint);
    url.protocol=url.protocol==='https:'?'wss:':'ws:';
    if (socket?.readyState===WebSocket.OPEN && socket.url===url.toString()) { sendRequest(); return; }
    socket?.close();
    const ws=new WebSocket(url);
    socket=ws;
    const timeout=setTimeout(()=>{
      if (socket===ws && opening && ws.readyState!==WebSocket.OPEN) ws.close();
    },6500);
    ws.addEventListener('open',()=>{
      clearTimeout(timeout);
      if (socket===ws) sendRequest();
    });
    ws.addEventListener('message',event=>{
      if (socket!==ws) return;
      try { receive(JSON.parse(event.data)); }
      catch (error) { console.warn('Online match message failed',error); }
    });
    ws.addEventListener('close',()=>{
      clearTimeout(timeout);
      if (socket!==ws) return;
      const wasPlaying=!!neonOnlineMatch;
      disconnect();
      stopPlaying();
      if (wasPlaying || state==='DUEL_MENU') showPanel();
      status(wasPlaying?'Connection lost. Rejoin from a new invite.':'Could not reach the match server. Check its address.');
    });
  }

  function sendRequest() {
    if (wanted) {
      const {type,...fields}=wanted;
      wanted=null;
      send(type,fields);
    }
  }

  function roster(list,players,withScores) {
    list.replaceChildren();
    for (const pilot of players) {
      const row=document.createElement('li');
      const name=document.createElement('span');
      name.textContent=pilot.name+(pilot.id===selfId?' (you)':'');
      const value=document.createElement('strong');
      value.textContent=withScores?`${pilot.kills} K  /  ${pilot.deaths} D`:pilot.id===room?.host?'Host':'Ready';
      row.append(name,value);
      list.append(row);
    }
  }

  function paintLobby() {
    $('online-setup').classList.toggle('hidden',!!room);
    $('online-room').classList.toggle('hidden',!room);
    $('online-back').classList.toggle('hidden',!!room);
    $('online-title').textContent=room?.phase==='results'?'Match results':room?'Private room':'Online matches';
    $('online-subtitle').textContent=room ?
      `${rules.modes[room.mode].label} · ${MAPS[room.map].name}` : 'Create a private room or join a friend.';
    if (!room) return;
    $('online-room-code').textContent=room.code;
    $('online-room-summary').textContent=`${room.players.length} / ${room.capacity} players`;
    const host=room.host===selfId;
    const start=$('online-start');
    start.classList.toggle('hidden',!host);
    start.disabled=room.players.length<2;
    start.textContent=room.phase==='results'?'Play again':'Start match';
    const players=[...room.players];
    if (room.phase==='results') players.sort((a,b)=>b.kills-a.kills||a.deaths-b.deaths);
    roster($('online-players'),players,room.phase==='results');
    if (room.phase==='results') {
      const winner=room.players.find(p=>p.id===room.winner);
      status(winner ? `${winner.name} won. ${room.reason}` : room.reason);
    } else if (host) status(players.length<2?'Share the invite to bring in friends.':'Start when everyone is here.');
    else status('Waiting for the host to start.');
  }

  function mapPoint(p) {
    return {x:p.x+neonOnlineMatch.offset,y:p.y,z:p.z+neonOnlineMatch.offset};
  }

  function beginMatch(packet) {
    const arena=rules.layout(packet.map,packet.mode);
    const offset=Math.round(CENTER-arena.center);
    neonOnlineMatch={arena,offset,mode:packet.mode,goal:packet.goal,seed:0,life:0,
      motion:0,shots:0,remaining:480000,nextSend:0,players:[],opponents:new Map(),lastHud:-1};
    if (packet.mode==='survival') {
      neonOnlineMatch.survival={wave:0,waiting:0,remaining:0,robots:new Map()};
    }
    hideScreens();
    state='DUEL';
    mapId=packet.map;
    V5.remote=null;
    V5.duelFinished=false;
    grid=Array.from({length:ARENA_SIZE},()=>Array(ARENA_SIZE).fill(0));
    arena.grid.forEach((row,z)=>row.forEach((tile,x)=>{grid[z+offset][x+offset]=tile;}));
    decals=[];
    props=[];
    stations=[];
    enemies=[];
    pickups=[];
    effects=[];
    build3D();
    V7.scenery=[];
    V7.hostileShots=[];
    V7.bossWarn=[];
    V9.fixtures=[];
    V5.bursts=[];
    V5.projectiles.length=0;
    gameVisible(true);
    $('duel-leave').classList.add('hidden');
    $('duel-rematch').classList.add('hidden');
    tools.classList.remove('hidden');
    document.body.classList.add('online-playing');
    updateMouseHint();
    const goal=packet.mode==='survival'?`SURVIVE ${packet.goal} WAVES TOGETHER`:`FIRST TO ${packet.goal} ELIMINATIONS`;
    banner(rules.modes[packet.mode].label.toUpperCase(),goal,2.3);
  }

  function spawn(packet) {
    const match=neonOnlineMatch;
    Object.assign(match,{seed:packet.seed,life:packet.life,motion:0,shots:0,nextSend:0});
    player={...mapPoint(packet),a:packet.a,pitch:0,hp:100,maxHp:100,shield:0,speed:3.8,pulses:0,
      vx:0,vY:0,vz:0,slideTime:0,dashTime:0,dashCooldown:0,onGround:true,invuln:packet.ward/1000};
    for (const uid of match.opponents.keys()) {
      if (!match.opponents.get(uid).hp) match.opponents.delete(uid);
    }
    weapons=WEAPONS.map(w=>({unlocked:true,mag:w.magSize,reserve:w.reserveStart}));
    upg={damage:0,rate:0,speed:0,maxhp:0};
    activeWeapon=0; fireCooldown=0;reloadTimer=0;shotFlash=0;damageFlash=0;shake=0;hitTimer=0;
    V5.grapple=null;V5.climb=null;V5.scopeDown=false;V7.gas=V7.gasMax;V7.exhaustedUntil=0;
    refreshHUD();
  }

  function frame(packet) {
    const match=neonOnlineMatch;
    match.remaining=packet.remaining;
    const ids=new Set();
    match.players=packet.players.map(([id,name,x,y,z,a,pitch,hp,weapon,moving,kills,deaths,slide])=>{
      const data={id,name,x:x+match.offset,y,z:z+match.offset,a,pitch,hp,weapon,moving,kills,deaths,slide};
      if (id===selfId) {
        if (player.hp>0 && hp>0 && !V5.climb &&
            Math.hypot(player.x-data.x,player.y-data.y,player.z-data.z)>4) {
          Object.assign(player,{x:data.x,y:data.y,z:data.z,vx:0,vY:0,vz:0});
          v6ReleaseGrapple();
        }
        player.hp=hp;
      } else {
        ids.add(id);
        let current=match.opponents.get(id);
        if (!current || (!current.hp && hp)) {
          current={...data};
          match.opponents.set(id,current);
        }
        current.target=data;
        current.hp=hp;
        current.weapon=weapon;
        current.slide=slide;
      }
      return data;
    });
    for (const id of match.opponents.keys()) if (!ids.has(id)) match.opponents.delete(id);
    if (match.survival && packet.survival) survivalFrame(match,packet.survival);
  }

  function survivalFrame(match,packet) {
    const current=match.survival;
    if (packet.wave>current.wave) {
      banner(packet.wave===match.goal?'FINAL WAVE':`CO-OP WAVE ${packet.wave}`,
        packet.wave===match.goal?'OVERSIZED ROBOT INBOUND':'FIGHT TOGETHER',2);
      snd('wave');
    } else if (packet.wave && packet.waiting>0 && current.waiting===0) {
      V5.projectiles.length=0;
      banner(`WAVE ${packet.wave} CLEARED`,'RESUPPLY AND REVIVAL INCOMING',2.5);
    }
    Object.assign(current,{wave:packet.wave,waiting:packet.waiting,remaining:packet.remaining});
    const next=new Map();
    for (const [id,role,x,z,hp,maxHp,moving] of packet.robots) {
      const targetX=x+match.offset,targetZ=z+match.offset;
      const robot=current.robots.get(id) || {
        x:targetX,z:targetZ,walkPhase:0,
        type:role==='boss'?'boss':role==='bulwark'?'brute':role==='striker'?'runner':'drone',
        variant:role==='boss'?V9.bosses[0]:V9.roster.find(entry=>entry.role===role)
      };
      Object.assign(robot,{targetX,targetZ,hp,maxHp,moving:moving?1:0});
      next.set(id,robot);
    }
    current.robots=next;
    enemies=[...next.values()];
  }

  function shotVisuals(index,origin,dirs,owner) {
    const w=rules.weapons[index];
    for (const d of dirs) {
      const p={x:origin.x+d.x*.5,y:origin.y+d.y*.5,z:origin.z+d.z*.5};
      V5.projectiles.push({p,last:{...p},d,life:w.life,speed:w.speed,color:w.color,owner,
        kind:w.id,damage:w.damage,radius:.09,blastRadius:w.blast,chainRadius:w.chain});
    }
  }

  function playerHit(packet) {
    if (packet.id===selfId) {
      player.hp=packet.hp;
      damageFlash=.34;
      snd('hurt');
      if (packet.fallen) {
        shootDown=false;
        V5.grapple=null;
        V5.climb=null;
        V5.scopeDown=false;
        if (neonOnlineMatch.survival) banner('PILOT DOWN','REVIVE IF YOUR PARTNER CLEARS THE WAVE',2.4);
        else banner('TAGGED OUT','RESPAWNING SHORTLY',1.8);
      }
    }
    if (packet.from===selfId) {
      hitTimer=.16;
      if (packet.fallen) {
        const target=neonOnlineMatch.players.find(p=>p.id===packet.id);
        toast(`ELIMINATED ${target?.name || 'PILOT'}`,1.2);
        snd('kill');
      } else snd('hit');
    }
    const point=mapPoint(packet.point);
    v5OnContact({color:packet.color,kind:packet.weapon,owner:'online'},point,'visual');
    refreshHUD();
  }

  function robotFire(packet) {
    const p=mapPoint(packet.origin),bolt=rules.robotBolt;
    const robot=neonOnlineMatch.survival.robots.get(packet.id);
    if (robot) robot.attackAnim=.7;
    V5.projectiles.push({p,last:{...p},d:packet.d,life:bolt.life,speed:bolt.speed,color:bolt.color,
      owner:'online',kind:bolt.id,radius:.09});
  }

  function robotHit(packet) {
    const robot=neonOnlineMatch.survival.robots.get(packet.id);
    if (robot) {
      robot.hp=packet.hp;
      robot.hitTimer=.18;
    }
    if (packet.from===selfId) {
      hitTimer=.16;
      snd(packet.fallen?'kill':'hit');
    }
    v5OnContact({color:packet.color,kind:packet.weapon,owner:'online'},mapPoint(packet.point),'visual');
  }

  function receive(packet) {
    if (packet.type==='error') { opening=false; status(packet.message); return; }
    if (packet.type==='joined') { selfId=packet.id; opening=false; return; }
    if (packet.type==='lobby') {
      room=packet;
      if (packet.phase!=='playing' && neonOnlineMatch) {
        stopPlaying();
        showPanel();
      } else if (!neonOnlineMatch) paintLobby();
      return;
    }
    if (packet.type==='start') { beginMatch(packet); return; }
    if (!neonOnlineMatch) return;
    if (packet.type==='spawn') spawn(packet);
    if (packet.type==='frame') frame(packet);
    if (packet.type==='fire' && packet.id!==selfId) {
      shotVisuals(packet.weapon,mapPoint(packet.origin),packet.dirs,'online');
    }
    if (packet.type==='hit') playerHit(packet);
    if (neonOnlineMatch.survival) {
      if (packet.type==='robot-fire') robotFire(packet);
      if (packet.type==='robot-hit') robotHit(packet);
      if (packet.type==='restock') {
        reloadTimer=0;
        packet.ammo.forEach((stock,i)=>{if (weapons[i]) Object.assign(weapons[i],stock);});
        toast('TEAM RESUPPLY · AMMO AND INTEGRITY RESTORED',1.8);
        refreshHUD();
      }
    }
    if (packet.type==='ammo' && weapons[packet.weapon]) {
      Object.assign(weapons[packet.weapon],{mag:packet.mag,reserve:packet.reserve});
      refreshHUD();
    }
  }

  function position() {
    const match=neonOnlineMatch;
    return {seq:++match.motion,life:match.life,x:player.x-match.offset,y:player.y,z:player.z-match.offset,
      a:player.a,pitch:player.pitch,slide:player.slideTime>0};
  }

  const oldShoot=shoot;
  shoot=function () {
    const match=neonOnlineMatch;
    if (!match) return oldShoot();
    if (!match.life || !player.hp || fireCooldown>0 || reloadTimer>0 || V5.climb) return;
    const w=rules.weapons[activeWeapon],slot=weapons[activeWeapon];
    if (!slot.mag) { reload(); return; }
    const ads=v6Scoped(),sprint=!!(keys.ShiftLeft||keys.ShiftRight||touchHeld.has('sprint'));
    const shot=++match.shots;
    if (!send('fire',{...position(),shot,ads,sprint})) return;
    slot.mag--;
    fireCooldown=w.rate; shotFlash=.115; weaponKick=1; shake=.06;
    snd('shoot');
    shotVisuals(activeWeapon,v5Eyes(),rules.volley(w,player.a,player.pitch,ads,sprint,
      rules.shotSeed(match.seed,shot)),'local');
    refreshHUD();
  };
  const oldReload=reload;
  reload=function () {
    if (!neonOnlineMatch) return oldReload();
    if (!player.hp || weapons[activeWeapon].reserve<=0 || reloadTimer>0) return;
    oldReload();
    if (reloadTimer>0) send('reload',{life:neonOnlineMatch.life});
  };
  const oldSwitch=switchWeapon;
  switchWeapon=function (index) {
    const before=activeWeapon;
    oldSwitch(index);
    if (neonOnlineMatch && activeWeapon!==before) send('equip',{life:neonOnlineMatch.life,weapon:activeWeapon});
  };
  const canMove=v5CanMove;
  v5CanMove=function (x,z,y) {
    const m=neonOnlineMatch;
    return (!m || rules.canStand(m.arena,x-m.offset,y,z-m.offset))&&canMove(x,z,y);
  };
  const worldCollision=v5WorldCollision;
  v5WorldCollision=function (p) {
    const m=neonOnlineMatch;
    if (m) {
      const x=p.x-m.offset,z=p.z-m.offset;
      if (x<1 || z<1 || x>=m.arena.size-1 || z>=m.arena.size-1) return true;
    }
    return worldCollision(p);
  };

  const baseHud=v5DuelHud;
  v5DuelHud=function () {
    baseHud();
    const m=neonOnlineMatch;
    if (!m) return;
    const p=m.players.find(p=>p.id===selfId);
    const time=Math.ceil(m.remaining/1000), minutes=Math.floor(time/60);
    $('hud-wave').textContent=`${rules.modes[m.mode].label.toUpperCase()} · ${minutes}:${String(time%60).padStart(2,'0')}`;
    $('hud-coins').textContent=p?.kills ?? 0;
    $('hud-kills').textContent=m.goal;
    $('armor-text').textContent='ONLINE';
    $('relay-info').textContent=`${p?.kills ?? 0} / ${m.goal} ELIMINATIONS · ${m.players.length} PLAYERS`;
    $('misc-status').textContent='ALL BLASTERS AVAILABLE';
    $('view-weapon-status').textContent=WEAPONS[activeWeapon].name;
    $('zone-info').textContent=MAPS[mapId].name.toUpperCase();
    if (m.survival) {
      const {wave,waiting,remaining}=m.survival;
      const team=m.players.find(pilot=>pilot.id!==selfId);
      const countdown=Math.max(1,Math.ceil(waiting/1000));
      $('hud-wave').textContent=`CO-OP · WAVE ${Math.max(1,wave)} / ${m.goal}`;
      $('relay-info').textContent=waiting
        ? `${wave?'NEXT WAVE':'FIRST WAVE'} IN ${countdown}s`
        : `${remaining} ROBOTS REMAIN · ${team?.hp>0?`ALLY ${team.hp} HP`:'ALLY DOWN'}`;
      $('armor-text').textContent='CO-OP';
      if (!player.hp) $('misc-status').textContent='DOWN · REVIVE NEXT WAVE';
      else if (reloadTimer>0) $('misc-status').textContent='RELOADING';
    }
    if (!board.classList.contains('hidden')) {
      const scores=m.players.slice().sort((a,b)=>b.kills-a.kills||a.deaths-b.deaths);
      roster($('online-scores'),scores,true);
    }
  };

  const duelFrame=v5DuelLoop;
  v5DuelLoop=function (dt) {
    const match=neonOnlineMatch;
    if (!match) return duelFrame(dt);
    if (match.life && player.hp>0) {
      v5MovePlayer(dt);
      if (now>=match.nextSend) {
        match.nextSend=now+.04;
        send('move',position());
      }
    } else v5Projectiles(dt);
    const mix=1-Math.exp(-dt*19);
    for (const p of match.opponents.values()) {
      const next=p.target;
      if (!next) continue;
      p.x+=(next.x-p.x)*mix; p.y+=(next.y-p.y)*mix; p.z+=(next.z-p.z)*mix;
      const angle=next.a-p.a;
      p.a+=Math.atan2(Math.sin(angle),Math.cos(angle))*mix;
      p.moving=next.moving?1:0;
    }
    if (match.survival) {
      for (const robot of match.survival.robots.values()) {
        robot.x+=(robot.targetX-robot.x)*mix;
        robot.z+=(robot.targetZ-robot.z)*mix;
        robot.walkPhase+=robot.moving*dt*12;
        robot.hitTimer=Math.max(0,(robot.hitTimer||0)-dt);
        robot.attackAnim=Math.max(0,(robot.attackAnim||0)-dt*3);
      }
    }
    hitTimer=Math.max(0,hitTimer-dt);
    $('reticle').classList.toggle('hit',hitTimer>0);
    if (now-match.lastHud>.18) {
      match.lastHud=now;
      refreshHUD();
    }
    if (toastUntil<now) $('toast').classList.add('hidden');
    if (bannerUntil<now) $('banner').classList.add('hidden');
    shotFlash=Math.max(0,shotFlash-dt); weaponKick=Math.max(0,weaponKick-dt*5);
    damageFlash=Math.max(0,damageFlash-dt*1.7); shake=Math.max(0,shake-dt*2);
    $('hit-flash').style.opacity=damageFlash.toFixed(2);
    if (miniClock<=0) { drawMinimap(); miniClock=.1; } else miniClock-=dt;
  };

  const baseRadar=drawMinimap;
  drawMinimap=function () {
    baseRadar();
    if (!neonOnlineMatch?.survival) return;
    const ally=getNeonOnlineOpponents()[0];
    if (!ally || Math.hypot(ally.x-player.x,ally.z-player.z)>16.5) return;
    mctx.save();
    mctx.translate(74,74);
    mctx.rotate(-player.a-Math.PI/2);
    mctx.fillStyle='#81ffcc';
    mctx.beginPath();
    mctx.arc((ally.x-player.x)*4.1,(ally.z-player.z)*4.1,3.2,0,Math.PI*2);
    mctx.fill();
    mctx.restore();
  };

  const button=$('duel-open');
  const open=button.cloneNode(false);
  open.textContent='PLAY ONLINE';
  button.replaceWith(open);
  open.addEventListener('click',()=>{
    $('online-map').value=mapId;
    $('online-back').classList.remove('hidden');
    status('');
    showPanel();
    $('online-name').focus();
  });
  $('online-back').addEventListener('click',showMenu);
  $('online-create').addEventListener('submit',event=>{
    event.preventDefault();
    beginRequest({type:'create',mode:$('online-mode').value,map:$('online-map').value});
  });
  $('online-join').addEventListener('submit',event=>{
    event.preventDefault();
    const code=$('online-code').value.trim().toUpperCase();
    if (!/^[A-Z2-9]{6}$/.test(code)) { status('Enter the six-character invite code.'); return; }
    beginRequest({type:'join',code});
  });
  $('online-copy').addEventListener('click',async()=>{
    if (!room || !endpoint) return;
    const invite=new URL('/',endpoint);
    invite.searchParams.set('room',room.code);
    try {
      await navigator.clipboard.writeText(invite.toString());
      status('Invite link copied.');
    } catch {
      status('Invite link: '+invite);
    }
  });
  $('online-start').addEventListener('click',()=>send('start'));
  $('online-leave-room').addEventListener('click',()=>{
    disconnect();
    $('online-back').classList.remove('hidden');
    status('');
    paintLobby();
    $('online-name').focus();
  });
  $('online-quit').addEventListener('click',showMenu);
  $('online-show-board').addEventListener('click',toggleScores);
  function toggleScores() {
    const hidden=board.classList.toggle('hidden');
    $('online-show-board').setAttribute('aria-expanded',String(!hidden));
    refreshHUD();
  }
  document.addEventListener('keydown',event=>{
    if (!neonOnlineMatch || event.repeat) return;
    if (event.code==='Tab') {
      if (document.pointerLockElement!==canvas) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      toggleScores();
    }
    if (event.code==='KeyM') {
      audioOn=!audioOn;
      toast(audioOn?'AUDIO ENABLED':'AUDIO MUTED',1.2);
    }
  },true);
  document.addEventListener('pointerlockchange',()=>{
    if (neonOnlineMatch) document.body.classList.toggle('online-locked',document.pointerLockElement===canvas);
  });

  const invited=new URLSearchParams(location.search).get('room');
  if (invited && /^[A-Z2-9]{6}$/i.test(invited)) {
    $('online-code').value=invited.toUpperCase();
    showPanel();
    $('online-name').focus();
  }
})();
