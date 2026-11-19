'use strict';

const NEON_WORLDS = {
  cyber: {
    name: 'Neon Relay', tag: 'DUSK · SIGNAL DISTRICT',
    desc: 'A teal-lit signal loop hangs above elevated city cover.',
    sky: '#161b37', horizon: '#696183', haze: '#686b82', fogStart: 20, fogWeight: .59,
    floor: '#a2adb9', wall: ['#89909f', '#777f90', '#9299a8', '#818b97'],
    trim: '#72eadc', frame: '#222b48', glass: '#25334e', window: '#6cb8c7', glow: '#ee8eff',
    disc: '#efb3df', ridges: ['#585875', '#3c435e'], stars: true,
    zones: ['UPLINK BLOCK','INDIGO ROW','COOLANT COURTS','SIGNAL TOWERS','RELAY SQUARE'],
    cover: [[34, 24, 3, 4, 3], [44, 24, 3, 4, 3], [35, 46, 2, 3, 2], [45, 47, 2, 4, 2]],
    cutthroughs: [[32, 35, 6, 2]],
    landmark: [40.5, 26.0]
  },
  jungle: {
    name: 'Canopy Works', tag: 'MIST · RAINFOREST STATION',
    desc: 'Follow a giant amber conduit through a forest pumping station.',
    sky: '#275c61', horizon: '#c0d8ba', haze: '#9ab7a1', fogStart: 14, fogWeight: .75,
    floor: '#b2b9a5', wall: ['#989c89', '#8c9080', '#a2a593', '#8a9388'],
    trim: '#ffc67b', frame: '#263f3a', glass: '#345655', window: '#9ed3af', glow: '#b9ed93',
    disc: '#fff0bf', ridges: ['#729b81', '#4f7a65', '#385e53'],
    zones: ['UPPER PUMPS','CANOPY WALK','FILTER YARDS','TIMBER STATION','INTAKE COURTYARD'],
    cover: [[35, 26, 2, 5, 2], [44, 26, 3, 3, 1], [34, 46, 3, 4, 1], [44, 46, 4, 2, 2]],
    cutthroughs: [[32, 32, 5, 6], [43, 34, 6, 4]],
    landmark: [40.5, 27.5]
  },
  volcano: {
    name: 'Ironwake Harbor', tag: 'BLUE HOUR · FREIGHT TERMINAL',
    desc: 'Take the cross lanes beneath an enormous cargo gantry.',
    sky: '#365375', horizon: '#d49e8d', haze: '#8394a5', fogStart: 22, fogWeight: .61,
    floor: '#abb6bd', wall: ['#92979d', '#858b91', '#9ea3a6', '#818b93'],
    trim: '#ffc574', frame: '#293c54', glass: '#263e53', window: '#80bbd3', glow: '#f58d60',
    disc: '#ffb489', ridges: ['#a08890', '#657185'],
    zones: ['WEST CRANES','FREIGHT SHEDS','CONTAINER LANE','WHARF ROAD','GANTRY PLAZA'],
    cover: [[34, 24, 3, 4, 3], [44, 24, 3, 4, 3], [33, 46, 4, 2, 2], [45, 46, 4, 2, 2],
      [36, 31, 2, 4, 2], [43, 33, 2, 3, 2]],
    cutthroughs: [[34, 29, 13, 2]],
    landmark: [40.5, 26.0]
  },
  arctic: {
    name: 'Aurora Outpost', tag: 'NIGHT · GLACIAL OBSERVATORY',
    desc: 'A polar radio telescope and ice-blue lanes sit below an aurora.',
    sky: '#121f43', horizon: '#6888ab', haze: '#92afc6', fogStart: 21, fogWeight: .61,
    floor: '#bac8d2', wall: ['#a3afbc', '#909eac', '#abb7c4', '#98a7b8'],
    trim: '#9cf4f0', frame: '#314462', glass: '#243c63', window: '#92d9ff', glow: '#85ffc5',
    disc: '#edfcff', ridges: ['#91a6bf', '#657f9e', '#4e6c8e'], stars: true,
    zones: ['NORTH STATION','TELESCOPE ROW','GLACIER WALK','TRANSMISSION HILL','OBSERVATORY COURT'],
    cover: [[35, 29, 2, 4, 2], [44, 25, 3, 4, 3], [34, 47, 3, 2, 2], [45, 46, 2, 4, 1]],
    cutthroughs: [[45, 34, 2, 8], [35, 34, 3, 4]],
    landmark: [45.5, 27.5]
  },
  desert: {
    name: 'Sunstone Array', tag: 'DAWN · SOLAR FOUNDRY',
    desc: 'Rooftop mirrors feed a sunlit tower beyond the sand-colored lanes.',
    sky: '#545880', horizon: '#ffc7a0', haze: '#dbb48d', fogStart: 19, fogWeight: .64,
    floor: '#bfb5a2', wall: ['#ada499', '#9f9489', '#bab0a3', '#a39a92'],
    trim: '#f8ce82', frame: '#694e51', glass: '#483a56', window: '#adc7dd', glow: '#ffe596',
    disc: '#fff6c7', ridges: ['#cf9c80', '#af7f6e', '#8c6764'],
    zones: ['MIRROR ROW','RECEIVER HILL','OASIS ROAD','FOUNDRY GATE','SUNSTONE COURT'],
    cover: [[34, 25, 3, 4, 2], [44, 25, 3, 4, 3], [35, 46, 2, 5, 1], [45, 47, 4, 2, 2]],
    cutthroughs: [[35, 34, 11, 3]],
    landmark: [40.5, 27.5]
  }
};
const NEON_WALL_LIGHT = {north:.86,east:1.01,south:1.12,west:.94};
const NEON_OUTER_ZONES = {
  cyber: ['UPLINK PERIMETER','INDIGO TERMINAL','COOLANT DEPOT','SIGNAL INTERCHANGE'],
  jungle: ['INTAKE PERIMETER','CANOPY RESERVOIR','SOUTH FILTER YARD','PUMP SERVICE ROAD'],
  volcano: ['NORTH FREIGHT GATE','EAST DOCK APPROACH','SOUTH STACKS','OUTER RAIL YARD'],
  arctic: ['NORTH RELAY CAMP','GLACIER OUTPOST','SOUTH SNOW ROAD','ICE SERVICE LOOP'],
  desert: ['MIRROR APPROACH','RECEIVER DEPOT','SUNSTONE PERIMETER','OUTER OASIS ROAD']
};

function neonEnvironment() {
  return NEON_WORLDS[mapId] || NEON_WORLDS.cyber;
}

{
  const worlds = NEON_WORLDS;
  const shift = ([x,z,...size]) => [x+CORE_OFFSET,z+CORE_OFFSET,...size];
  for (const [id, world] of Object.entries(worlds)) {
    world.cover = world.cover.map(shift);
    world.cutthroughs = world.cutthroughs.map(shift);
    world.landmark = shift(world.landmark);
    Object.assign(MAPS[id], {
      name: world.name, tag: world.tag, desc: world.desc,
      sky: world.sky, sky2: world.horizon,
      floor: world.floor, wall: world.wall, a: world.sky, b: world.horizon
    });
  }
  Object.assign(v10Palette.cyber, {metal:'#415671', panel:'#55748a', trim:'#72eadc', leaf:'#588c96'});
  Object.assign(v10Palette.jungle, {metal:'#4c7368', panel:'#938766', trim:'#9bda9e', leaf:'#4f9778'});
  Object.assign(v10Palette.volcano, {metal:'#536983', panel:'#a37369', trim:'#ffba68'});
  Object.assign(v10Palette.arctic, {metal:'#6987a1', panel:'#9eb8c9', leaf:'#a5d0dc', trim:'#a2edf1'});
  Object.assign(v10Palette.desert, {metal:'#946d62', panel:'#bd8e75', leaf:'#7f9b76', trim:'#fcdc90'});

  const baseBuild = build3D;
  build3D = function () {
    const world = neonEnvironment();
    if (state !== 'DUEL') {
      for (const [x, z, width, depth, tile = 0] of [...world.cutthroughs, ...world.cover]) {
        for (let row = z; row < z + depth; row++) {
          for (let col = x; col < x + width; col++) grid[row][col] = tile;
        }
      }
      props = props.filter(p => !solid(p.x, p.z));
    }
    baseBuild();
    if (state !== 'DUEL') {
      addNeonLandmark(mapId, world);
      paintNeonLanes(world);
      addNeonPerimeter(world);
    }
  };

  v5Background = drawNeonSky;
  zoneAt = function (x,z) {
    if (isOuterDistrict(x,z)) {
      const dx=x-CENTER,dz=z-CENTER;
      const side=Math.abs(dx)>Math.abs(dz) ? (dx>0?1:3) : dz>0?2:0;
      return NEON_OUTER_ZONES[mapId][side];
    }
    const innerX=x-CORE_OFFSET,innerZ=z-CORE_OFFSET;
    const west=innerX<33, east=innerX>48;
    return neonEnvironment().zones[innerZ<33 ? (west?0:east?1:4) :
      innerZ>48 ? (west?2:east?3:4) : west?0:east?3:4];
  };
  const renderCards = renderMapSelector;
  renderMapSelector = function () {
    renderCards();
    const decorate = (element,index) => {
      element.classList.add('district-preview');
      element.style.backgroundImage = "url('world-previews.webp')";
      element.style.setProperty('--district-offset',`${index*25}%`);
    };
    const cards = document.querySelectorAll('#map-grid .map-thumb');
    cards.forEach(decorate);
    const hero = document.querySelector('.hero-art');
    decorate(hero,Object.keys(worlds).indexOf(mapId));
    hero.querySelector('.art-caption').textContent = neonEnvironment().name;
  };
  if (grid.length === ARENA_SIZE) buildArena(mapId);
  renderMapSelector();
  document.title = 'Neon Siege 13 · Afterlight';
  document.querySelector('.top-pill').textContent = '5 ARENAS · 15 BLASTERS · 50 WAVES';
  document.querySelector('.eyebrow').textContent = 'AFTERLIGHT // VERSION 13';
  document.querySelector('.intro').textContent = 'Fight through fifty robot waves across five expanded arenas. Grapple over the streets, activate field beacons, and build your armory between waves.';
  document.querySelector('.section-head h2').textContent = 'DEPLOY TO A DISTRICT';
}

function neonSurfaceTone(face) {
  const light = NEON_WALL_LIGHT;
  if (face.kind === 'wall') return v7Dark(face.color,light[face.facing] || 1);
  if (face.kind === 'roof') return v7Dark(face.color,1.14);
  return face.color;
}

function drawNeonFacade(out, face) {
  const height = face.h - face.low;
  if (height < 1.7 || face.x === 0 || face.z === 0 ||
      face.x === ARENA_SIZE - 1 || face.z === ARENA_SIZE - 1) return true;
  const scene = neonEnvironment();
  const [lowerA, upperA, upperB, lowerB] = face.verts;
  const normal = {
    north: [0, -.016], south: [0, .016], west: [-.016, 0], east: [.016, 0]
  }[face.facing];
  const sample = (u, v, offset) => [
    lowerA[0] * (1 - u) + lowerB[0] * u + normal[0] * offset,
    upperA[1] * v + lowerA[1] * (1 - v),
    upperA[2] * (1 - u) + upperB[2] * u + normal[1] * offset
  ];
  const panel = (u0, v0, u1, v1, color, offset = 1) => {
    v11Poly(out, [sample(u0,v0,offset), sample(u1,v0,offset),
      sample(u1,v1,offset), sample(u0,v1,offset)], color);
  };
  const key = (face.x * 29 + face.z * 43) % 19;
  const lit = key < (mapId === 'cyber' ? 11 : 6);
  if (isOuterDistrict(face.x+.5,face.z+.5)) {
    panel(0, .94, 1, .983, scene.frame);
    if (key%3 === 0) panel(.12, .27, .88, .65, lit?scene.window:scene.glass);
    return true;
  }
  panel(0, 0, 1, .056, scene.frame);
  panel(0, .95, 1, .982, scene.frame);
  if (mapId === 'volcano' && (face.tile === 2 || key < 5)) {
    for (const u of [.19, .49, .79]) panel(u, .09, u + .034, .92, scene.frame);
    if (key < 7) panel(0, .77, 1, .81, scene.trim, 2);
    return true;
  }
  if (mapId === 'jungle' || mapId === 'desert') {
    panel(.08, .22, .92, .78, scene.frame);
    panel(.15, .30, .85, .70, scene.glass, 2);
    if (lit) panel(.22, .35, .78, .66, scene.window, 3);
    panel(.10, .20, .90, .247, scene.trim, 2);
    if (mapId === 'jungle') {
      for (const v of [.38, .48, .58]) panel(.16, v, .84, v + .017, scene.frame, 4);
    } else {
      panel(.47, .30, .53, .72, scene.frame, 4);
    }
    return true;
  }
  const rows = height >= 4.1 ? 2 : 1;
  for (let i = 0; i < rows; i++) {
    const top = .83 - i * .41, bottom = top - .29;
    panel(.09, bottom-.028, .91, top+.025, scene.frame);
    panel(.16, bottom, .84, top, lit ? scene.window : scene.glass, 2);
    panel(.485, bottom, .515, top, scene.frame, 3);
    if (lit) panel(.18, top-.044, .82, top-.024, scene.trim, 3);
  }
  if (mapId === 'cyber' && key === 0) panel(.035, .08, .075, .947, scene.glow, 2);
  if (mapId === 'arctic') panel(0, .912, 1, .952, '#c4d9e6', 2);
  return true;
}

function paintNeonLanes(scene) {
  for (const x of [37.43+CORE_OFFSET, 43.49+CORE_OFFSET]) {
    for (let z = 25+CORE_OFFSET; z < 55+CORE_OFFSET; z += 1.3) {
      if (solid(x, z + .5)) continue;
      v5Face(groundQuad(x, z, .075, .79, .052), scene.trim, 'decal', {alpha:.65});
    }
  }
  const [x,z] = scene.landmark;
  for (let i = -4; i <= 4; i++) {
    const left = x + i * .65;
    if (!solid(left+.23,z+2)) {
      const points = [[left,.052,z+1.6],[left+.16,.052,z+1.6],
        [left+.59,.052,z+2.5],[left+.43,.052,z+2.5]];
      v5Face(points, scene.frame, 'decal', {alpha:.66});
    }
  }
}

function addNeonPerimeter(scene) {
  const plazas=outerDistrictPlazas();
  for (let side=0;side<plazas.length;side++) {
    const [x,z]=plazas[side], angle=side*Math.PI/2;
    const rightX=Math.cos(angle),rightZ=Math.sin(angle);
    const point=(u,y,v)=>[x+u*rightX-v*rightZ,y,z+u*rightZ+v*rightX];
    function beam(u0,y0,v0,u1,y1,v1,color) {
      const a=point(u0,y0,v0),b=point(u1,y0,v0),c=point(u1,y1,v0),d=point(u0,y1,v0);
      const e=point(u0,y0,v1),f=point(u1,y0,v1),g=point(u1,y1,v1),h=point(u0,y1,v1);
      v5Face([a,b,c,d],color,'landmark');
      v5Face([f,e,h,g],color,'landmark');
      v5Face([a,e,f,b],v7Dark(color,.72),'landmark');
      v5Face([d,c,g,h],v7Dark(color,1.12),'landmark');
      v5Face([e,a,d,h],v7Dark(color,.86),'landmark');
      v5Face([b,f,g,c],v7Dark(color,.86),'landmark');
    }
    const tint=mapId==='volcano'||mapId==='jungle'?scene.trim:scene.window;
    for (const u of [-4,4]) {
      beam(u-.38,3.39,-.39,u+.38,5.65,.39,scene.frame);
      beam(u-.19,4,-.42,u+.19,5.45,-.39,tint);
      beam(u-.19,4,.39,u+.19,5.45,.42,tint);
    }
    beam(-4.48,5.14,-.37,4.48,5.73,.37,scene.frame);
    beam(-4.15,5.53,-.39,4.15,5.66,-.37,tint);
    beam(-4.15,5.53,.37,4.15,5.66,.39,tint);
    beam(-.68,4.98,-.41,.68,5.77,.41,scene.window);
    beam(-.23,5.1,-.44,.23,5.60,.44,scene.glow);
    V5.grappleRings.push({x,y:5.92,z,id:V5.grappleRings.length});
    for (const u of [-2.65,2.48]) {
      for (let v=-2.6;v<2.6;v+=.67) {
        v5Face([point(u,.052,v),point(u+.17,.052,v),point(u+.17,.052,v+.43),point(u,.052,v+.43)],
          tint,'decal',{alpha:.7});
      }
    }
  }
}

function addNeonLandmark(id, scene) {
  const [x,z] = scene.landmark;
  const P = (dx,y,dz) => [x+dx,y,z+dz];
  const face = (vertices,color) => v5Face(vertices,color,'landmark');
  const box = (dx,y,dz,w,h,d,color) => {
    const a = P(dx-w/2,y-h/2,dz-d/2), b = P(dx+w/2,y-h/2,dz-d/2);
    const c = P(dx+w/2,y+h/2,dz-d/2), e = P(dx-w/2,y+h/2,dz-d/2);
    const f = P(dx-w/2,y-h/2,dz+d/2), g = P(dx+w/2,y-h/2,dz+d/2);
    const i = P(dx+w/2,y+h/2,dz+d/2), j = P(dx-w/2,y+h/2,dz+d/2);
    face([a,b,c,e], v7Dark(color,.77)); face([f,g,i,j], color);
    face([b,g,i,c], v7Dark(color,.87)); face([f,a,e,j], v7Dark(color,.68));
    face([e,c,i,j], v7Dark(color,1.19)); face([a,b,g,f], v7Dark(color,.68));
  };
  const brace = (from,to,width,depth,color) => {
    const length = Math.hypot(to[0]-from[0],to[1]-from[1]);
    const rx = (from[1]-to[1])*width/(2*length);
    const ry = (to[0]-from[0])*width/(2*length);
    const corner = (p,s,dz) => P(p[0]+rx*s,p[1]+ry*s,p[2]+dz);
    const a = corner(from,-1,-depth/2), b = corner(to,-1,-depth/2);
    const c = corner(to,1,-depth/2), d = corner(from,1,-depth/2);
    const e = corner(from,-1,depth/2), f = corner(to,-1,depth/2);
    const g = corner(to,1,depth/2), h = corner(from,1,depth/2);
    face([a,b,c,d], v7Dark(color,.79)); face([e,f,g,h], color);
    face([d,c,g,h],v7Dark(color,1.13)); face([a,b,f,e],v7Dark(color,.66));
    face([a,d,h,e],v7Dark(color,.88)); face([b,c,g,f],v7Dark(color,.88));
  };
  const anchor = (dx,y,dz) => {
    V5.grappleRings.push({x:x+dx,y,z:z+dz,id:V5.grappleRings.length});
    box(dx,y-.30,dz,.45,.16,.42,scene.trim);
  };
  const ring = (y,dz,inner,outer,start,end,color,steps = 24) => {
    const points = (radius,a) => P(Math.cos(a)*radius,y+Math.sin(a)*radius,dz);
    for (let i = 0; i < steps; i++) {
      const a = start+(end-start)*i/steps, b = start+(end-start)*(i+1)/steps;
      face([points(inner,a),points(outer,a),points(outer,b),points(inner,b)],color);
    }
  };

  if (id === 'cyber') {
    for (const sign of [-1,1]) {
      box(sign*5,5.66,0,1.7,1.2,1.9,scene.frame);
      addNeonColumn(x+sign*5,5.9,z,1.43,sign*Math.PI/2,scene,face);
      brace([sign*5,8.5,0],[sign*3.1,7.3,0],.54,.71,scene.window);
    }
    for (const dz of [-.34,.34]) {
      ring(9.1,dz,2.89,3.75,0,TWOPI,scene.frame,32);
      ring(9.1,dz+.012,3.00,3.13,0,TWOPI,scene.trim,32);
      for (let i=0;i<8;i++) {
        const a=i*TWOPI/8;
        ring(9.1,dz+.015,3.36,3.58,a+.05,a+.49,i%2?scene.window:scene.glow,4);
      }
    }
    for (let i=0;i<8;i++) {
      const a=i*TWOPI/8;
      box(Math.cos(a)*3.55,9.1+Math.sin(a)*3.55,0,.38,.36,.84,scene.window);
    }
    anchor(0,13.10,0);
    return;
  }
  if (id === 'jungle') {
    for (const side of [-1,1]) {
      box(side*4.7,5.04,0,1.4,3.00,1.48,scene.frame);
      brace([side*4.7,6.25,0],[side*3.05,8.1,0],1.05,1.25,'#af6e48');
      brace([side*5.2,6.65,.67],[side*3.3,8.55,.67],.13,.12,scene.trim);
      box(side*4.7,5.45,.81,.91,.35,.14,scene.glow);
    }
    box(0,8.12,0,6.2,1.13,1.28,'#ad6e48');
    box(0,8.40,.66,5.9,.14,.08,scene.trim);
    for (let i=-3;i<=3;i++) {
      box(i*.86,8.14,0,.19,1.31,1.47,scene.frame);
      box(i*.86,8.75,0,.34,.10,.10,scene.glow);
    }
    anchor(0,9.35,0);
    return;
  }
  if (id === 'volcano') {
    const yellow = '#d69956';
    for (const side of [-1,1]) {
      box(side*5,7.77,0,1.16,5.51,1.28,yellow);
      box(side*5,5.41,0,2.08,.47,2.03,scene.frame);
      brace([side*4.9,6.37,0],[side*3.0,9.3,0],.27,.35,scene.frame);
      box(side*4.98,8.51,.68,.39,.27,.15,scene.glow);
    }
    for (const depth of [-.63,.63]) {
      box(0,10.5,depth,11.6,.29,.27,yellow);
      box(0,9.1,depth,10.2,.33,.26,yellow);
      for (let i=-5;i<5;i++) {
        const flip=i%2===0;
        brace([i*1.05,flip?9.24:10.44,depth],[(i+1)*1.05,flip?10.44:9.24,depth],.16,.18,yellow);
      }
    }
    box(.78,9.64,0,1.78,.77,1.81,scene.frame);
    box(.78,8.57,0,.12,1.61,.135,'#b5c2c9');
    box(.78,7.69,0,.75,.34,.56,scene.glow);
    anchor(.78,10.74,0);
    return;
  }
  if (id === 'arctic') {
    box(0,5.6,0,2.02,.43,1.9,scene.frame);
    addNeonColumn(x,5.7,z,.83,Math.PI,scene,face);
    box(0,7.55,0,1.02,.40,1.31,scene.frame);
    const dish = (radius,a) => P(radius*Math.cos(a),8.46+radius*Math.sin(a)*.72+(radius*radius)*.12,
      .13-radius*Math.sin(a)*.65+(radius*radius)*.10);
    for (let i=0;i<20;i++) {
      const a=i*TWOPI/20,b=(i+1)*TWOPI/20;
      face([dish(0,0),dish(1.22,a),dish(1.22,b)],v7Dark(scene.window,.78+(i%3)*.08));
      face([dish(1.22,a),dish(2.30,a),dish(2.30,b),dish(1.22,b)],i%2?'#aecddd':'#c6e1ec');
      face([dish(2.19,a),dish(2.32,a),dish(2.32,b),dish(2.19,b)],scene.trim);
    }
    for (const sign of [-1,1]) brace([sign*1.8,8.75,.75],[0,9.64,1.30],.10,.13,scene.frame);
    box(0,9.66,1.32,.44,.36,.38,scene.glow);
    anchor(0,10.72,0);
    return;
  }
  for (const side of [-1,1]) {
    box(side*5,6.04,0,.56,1.98,.63,scene.frame);
    const mirror = (u,v,dz) => P(side*5+u+side*v*.22,7.02+v*.86,dz+v*.48);
    const panel = (u0,v0,u1,v1,dz,color) => face([
      mirror(u0,v0,dz),mirror(u1,v0,dz),mirror(u1,v1,dz),mirror(u0,v1,dz)
    ],color);
    panel(-2.0,-1.2,2.0,1.2,0,scene.frame);
    for (let col=0;col<6;col++) for (let row=0;row<3;row++) {
      const u=-1.91+col*.64, v=-1.10+row*.74;
      panel(u,v,u+.58,v+.66,.026,(col+row)%3?'#6c8cab':'#a7b9cf');
    }
    box(side*5,8.13,.6,.32,.14,.2,scene.glow);
    anchor(side*5,8.7,0);
  }
  box(6.2,8.34,-7.8,1.34,6.20,1.51,scene.frame);
  box(6.2,11.4,-7.8,2.07,1.03,1.96,scene.trim);
  box(6.2,11.82,-7.8,1.28,.40,1.24,scene.glow);
}

function addNeonColumn(x,y,z,scale,yaw,scene,face) {
  if (typeof NEON_ASTRA_COLUMN === 'undefined') return;
  const colors = [scene.window, scene.frame, scene.trim];
  const cos = Math.cos(yaw), sin = Math.sin(yaw);
  NEON_ASTRA_COLUMN.forEach(([vertices,indices], material) => {
    const point = i => [x+(vertices[i*3]*cos-vertices[i*3+2]*sin)*scale,
      y+vertices[i*3+1]*scale,z+(vertices[i*3]*sin+vertices[i*3+2]*cos)*scale];
    for (let i=0;i<indices.length;i+=3) {
      face([point(indices[i]),point(indices[i+1]),point(indices[i+2])],colors[material]);
    }
  });
}

function drawNeonSky() {
  const scene = neonEnvironment();
  const width = viewW, height = viewH, center = width/2;
  const focal = width/(2*Math.tan(v6EffectiveFov()/2));
  const pitch = player.pitch || 0;
  const horizon = height*.5 - focal*Math.tan(pitch);
  const mid = clamp(horizon/height, .01, .99);
  const sky = ctx.createLinearGradient(0,0,0,height);
  sky.addColorStop(0,scene.sky);
  sky.addColorStop(mid,scene.horizon);
  sky.addColorStop(1,scene.haze);
  ctx.fillStyle=sky;
  ctx.fillRect(0,0,width,height);
  if (horizon < -height*.25) return;

  const cp = Math.cos(pitch), sp = Math.sin(pitch);
  const project = (direction,elevation) => {
    const yaw = direction-player.a, dy = Math.sin(elevation);
    const ahead = Math.cos(elevation)*Math.cos(yaw);
    const sideways = Math.cos(elevation)*Math.sin(yaw);
    const depth = ahead*cp-dy*sp;
    if (depth <= .05) return null;
    return [center+focal*sideways/depth,height*.5-focal*(dy*cp+ahead*sp)/depth];
  };
  if (scene.stars) {
    const rand=rngFactory(5271);
    ctx.save();
    ctx.fillStyle='#e0f7ff';
    for (let i=0;i<88;i++) {
      const p=project(rand()*TWOPI,.10+.92*rand());
      const radius=.6+rand()*1.1;
      ctx.globalAlpha=.20+rand()*.37;
      if (p&&p[0]>0&&p[0]<width&&p[1]>0&&p[1]<height) ctx.fillRect(p[0],p[1],radius,radius);
    }
    ctx.restore();
  }
  const disc = project(-1.82, mapId==='desert'?.16:mapId==='arctic'?.31:.27);
  if (disc) {
    const [x,y]=disc, r=clamp(focal*(mapId==='desert'?.073:.048),14,height*.16);
    const glow=ctx.createRadialGradient(x,y,r*.2,x,y,r*3.3);
    glow.addColorStop(0,scene.disc+'96');
    glow.addColorStop(1,scene.disc+'00');
    ctx.fillStyle=glow; ctx.fillRect(x-r*3.3,y-r*3.3,r*6.6,r*6.6);
    ctx.fillStyle=scene.disc;
    ctx.beginPath(); ctx.arc(x,y,r,0,TWOPI); ctx.fill();
  }
  if (mapId==='arctic'&&horizon>0) {
    const still=matchMedia('(prefers-reduced-motion: reduce)').matches;
    const time=still?0:now*.09;
    const band=(x,i)=>horizon-height*(.33-i*.071)+
      Math.sin((x-center)/width*6+player.a*2+time+i*.81)*height*.073;
    const tint=ctx.createLinearGradient(0,0,width,0);
    tint.addColorStop(0,'#89ffd200'); tint.addColorStop(.32,'#71ffbf69');
    tint.addColorStop(.72,'#76e6fe70'); tint.addColorStop(1,'#b3a4ff00');
    for (let i=0;i<3;i++) {
      ctx.beginPath(); ctx.moveTo(0,band(0,i));
      for (let x=0;x<=width;x+=width/32) ctx.lineTo(x,band(x,i));
      for (let x=width;x>=0;x-=width/32) ctx.lineTo(x,band(x,i)+height*(.032+i*.011));
      ctx.closePath(); ctx.fillStyle=tint; ctx.fill();
    }
  }
  scene.ridges.forEach((color,layer)=>{
    ctx.beginPath(); ctx.moveTo(0,height);
    for (let i=0;i<=64;i++) {
      const x=i/64*width, angle=player.a+Math.atan((x-center)/focal);
      const wave=Math.abs(Math.sin(angle*(3+layer*2)+1.14))* .62 +
        Math.abs(Math.sin(angle*11.0+layer*3.9))*.20+
        Math.sin(angle*23.0+layer*.6)*.10;
      const peak=(.032+wave*(mapId==='arctic'?.205:.116) - layer*.015)*(1+layer*.08);
      ctx.lineTo(x,horizon-peak*focal+layer*height*.046);
    }
    ctx.lineTo(width,height); ctx.closePath(); ctx.fillStyle=color; ctx.fill();
  });
}
