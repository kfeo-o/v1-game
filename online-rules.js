'use strict';

const NEON_ONLINE_RULES = (() => {
  const maps = ['cyber', 'jungle', 'volcano', 'arctic', 'desert'];
  const modes = {
    duel: {label:'1v1', capacity:2, goal:5, size:33},
    ffa: {label:'Free-for-all', capacity:10, goal:12, size:53},
    survival: {label:'Co-op survival', capacity:2, goal:8, size:33}
  };
  const robotBolt = {id:'robot-bolt', speed:12, life:2.5, color:'#ff804f'};
  const heights = [0, 4.25, 3.4, 5.4];
  const weapons = [
    ['blaster',30,180,24,.16,1.35,1,.018,38,1.45,'#41fff1'],
    ['smg',46,276,15,.075,1.7,1,.05,38,1.45,'#ffd063'],
    ['shotgun',8,64,17,.68,2.05,7,.145,38,1.45,'#ff91c8'],
    ['rifle',12,96,64,.37,1.85,1,.005,38,1.45,'#7ae4ff'],
    ['ion',36,216,21,.115,1.3,1,.012,31,1.45,'#99ff67'],
    ['comet',7,56,87,.82,2.1,1,.008,20,1.45,'#ffae5d'],
    ['echo',30,180,19,.34,1.7,3,.038,33,1.45,'#bb8bff'],
    ['zenith',18,90,74,.56,2,1,.002,44,1.45,'#faf5ac'],
    ['meteor',4,32,86,.94,2.35,1,.004,15,2.15,'#ff9a69',2.55],
    ['needle',6,42,135,1.12,2,1,.0006,85,1.3,'#a1f7ff'],
    ['thunder',44,264,25,.088,1.85,1,.026,47,1.45,'#ffe582'],
    ['orbital',16,96,42,.30,1.75,1,.009,37,1.45,'#ef8fff',0,3.6],
    ['arc-pistol',12,96,30,.26,1.02,1,.012,39,1.45,'#62e5b8'],
    ['kestrel',14,84,16,.36,1.25,3,.038,34,1.45,'#c9a1ff'],
    ['ember-cannon',6,48,72,.59,1.54,1,.009,43,1.45,'#ff965c']
  ].map(([id,mag,reserve,damage,rate,reload,pellets,spread,speed,life,color,blast=0,chain=0])=>
    ({id,mag,reserve,damage,rate,reload,pellets,spread,speed,life,color,blast,chain}));
  const districtCover = {
    cyber: [[-7,-10,3,6,3],[5,5,3,6,3],[-8,4,4,4,1],[5,-8,4,4,1],[-2,-6,4,2,2],[-2,4,4,2,2]],
    jungle: [[-8,-8,4,4,2],[5,4,4,4,2],[4,-10,3,6,1],[-6,5,3,6,1],[-3,0,2,4,2],[2,-3,2,4,2]],
    volcano: [[-8,-7,7,2,2],[2,6,7,2,2],[-9,3,4,4,1],[6,-6,4,4,1],[-4,-2,3,2,2],[2,1,3,2,2]],
    arctic: [[-8,-9,5,4,3],[4,6,5,4,3],[-9,4,3,3,2],[7,-6,3,3,2],[-2,-4,4,2,2],[-2,3,4,2,2]],
    desert: [[-10,-8,3,6,1],[8,3,3,6,1],[-7,4,5,3,2],[3,-6,5,3,2],[-2,-2,2,3,2],[1,0,2,3,2]]
  };
  const wingCover = [
    [-20,-17,5,4,1], [16,-18,3,6,2], [-19,14,3,6,2], [16,15,5,4,1],
    [-16,-6,3,4,3], [14,3,3,4,3], [-5,-17,4,3,2], [2,15,4,3,2],
    [-19,2,3,3,2], [17,-4,3,3,2], [5,-13,4,2,1], [-8,13,4,2,1]
  ];

  function layout(map, mode) {
    const size = modes[mode].size;
    const middle = Math.floor(size / 2);
    const center = middle + .5;
    const grid = Array.from({length:size}, (_,z)=>Array.from({length:size},(_,x)=>
      x===0||z===0||x===size-1||z===size-1 ? 3 : 0));
    const cover = mode==='ffa' ? districtCover[map].concat(wingCover) : districtCover[map];
    for (const [x,z,width,depth,tile] of cover) {
      for (let row=0;row<depth;row++) {
        for (let col=0;col<width;col++) grid[z+middle+row][x+middle+col]=tile;
      }
    }
    const offsets = mode==='survival' ? [[-1.5,13],[1.5,13]] : mode==='duel' ? [[0,-12],[0,12]] : [
      [-21,-21],[21,21],[21,-21],[-21,21],[0,-21],[0,21],
      [-21,0],[21,0],[-10,-13],[10,13]
    ];
    const spawns = offsets.map(([dx,dz])=>({x:center+dx,y:0,z:center+dz,a:Math.atan2(-dz,-dx)}));
    return {size,center,grid,spawns};
  }

  function roof(arena,x,z) {
    return heights[arena.grid[Math.floor(z)]?.[Math.floor(x)]] || 0;
  }

  function canStand(arena,x,y,z) {
    const r=.24;
    if (x<1+r||z<1+r||x>arena.size-1-r||z>arena.size-1-r) return false;
    return [[-r,-r],[-r,r],[r,-r],[r,r]].every(([dx,dz])=>y>=roof(arena,x+dx,z+dz)-.12);
  }

  function vector(yaw,pitch) {
    return {x:Math.cos(yaw)*Math.cos(pitch),y:-Math.sin(pitch),z:Math.sin(yaw)*Math.cos(pitch)};
  }

  function volley(weapon,yaw,pitch,ads,sprint,seed) {
    let random = seed >>> 0;
    const sample = ()=>{
      random=(Math.imul(1664525,random)+1013904223)>>>0;
      return random/4294967296*2-1;
    };
    const spread = weapon.spread*(sprint?1.6:1)*(ads?.38:1);
    return Array.from({length:weapon.pellets},()=>vector(yaw+sample()*spread,pitch+sample()*spread*.6));
  }

  const shotSeed = (seed, sequence)=>(seed^Math.imul(sequence,0x9e3779b1))>>>0;
  return {maps,modes,weapons,robotBolt,layout,roof,canStand,vector,volley,shotSeed};
})();

if (typeof module !== 'undefined') module.exports = NEON_ONLINE_RULES;
