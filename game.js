const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

const ASSETS = {
  overworld: 'tiles/Overworld_Tileset.png',
  p_down: 'characters/player_idle_down.png',
  p_up: 'characters/player_idle_up.png',
  p_left: 'characters/player_idle_left.png',
  p_right: 'characters/player_idle_right.png',
  fire: 'objects/campfire.png',
  chest: 'objects/chest_closed.png'
};

const IMG = {};
let loaded = 0, total = Object.keys(ASSETS).length;

for (let key in ASSETS) {
  IMG[key] = new Image();
  IMG[key].onload = () => { if (++loaded === total) start(); };
  IMG[key].onerror = () => console.log('Missing:', ASSETS[key]);
  IMG[key].src = ASSETS[key];
}

const TS = 16; // 16x16 tiles in tileset
const T = {
  grass: {x: 1, y: 1},
  dirt: {x: 3, y: 1}, 
  path: {x: 3, y: 0},
  sand: {x: 4, y: 1},
  water: {x: 4, y: 0},
  tree_green: {x: 0, y: 7},
  tree_orange: {x: 1, y: 7},
  rock: {x: 1, y: 4},
  bush: {x: 0, y: 4}
};

let player = {x: 800, y: 600, dir: 'down', speed: 2.5};
let keys = {}, cam = {x: 0, y: 0};

const W = 60, H = 60, world = [];
for(let y=0; y<H; y++){
  world[y] = [];
  for(let x=0; x<W; x++){
    let t = 'grass';
    const d = Math.hypot(x-30, y-30);
    if(d < 6) t = 'water';
    else if(d < 7) t = 'sand';
    else if(d > 15 && d < 22 && Math.random() > 0.4) t = Math.random() > 0.5? 'tree_green' : 'tree_orange';
    else if(Math.random() > 0.98) t = 'rock';
    else if(Math.random() > 0.97) t = 'bush';
    else if(Math.random() > 0.96) t = 'dirt';
    world[y][x] = t;
  }
}
world[20][20] = 'fire';
world[18][18] = 'chest';
for(let i = 10; i < 50; i++) world[35][i] = 'path';

window.onkeydown = e => keys[e.key.toLowerCase()] = 1;
window.onkeyup = e => keys[e.key.toLowerCase()] = 0;

function start(){ requestAnimationFrame(loop); }

function drawTile(key, dx, dy) {
  const t = T[key] || T.grass;
  ctx.drawImage(IMG.overworld, t.x*TS, t.y*TS, TS, TS, dx, dy, 32, 32);
}

function update(){
  let dx=0, dy=0;
  if(keys['w']||keys['arrowup']) {dy=-1; player.dir='up';}
  if(keys['s']||keys['arrowdown']) {dy=1; player.dir='down';}
  if(keys['a']||keys['arrowleft']) {dx=-1; player.dir='left';}
  if(keys['d']||keys['arrowright']) {dx=1; player.dir='right';}

  const nx = player.x + dx*player.speed;
  const ny = player.y + dy*player.speed;
  const tx = Math.floor(nx/32), ty = Math.floor(ny/32);
  const tile = world[ty]?.[tx];
  
  if(tile!=='water' && tile!=='tree_green' && tile!=='tree_orange' && tile!=='rock'){
    player.x = nx; player.y = ny;
  }
  cam.x = player.x - 400;
  cam.y = player.y - 300;
}

function draw(){
  ctx.fillStyle = '#2d5016';
  ctx.fillRect(0,0,800,600);

  const sx = Math.max(0, Math.floor(cam.x/32)-1);
  const ex = Math.min(W, sx + 28);
  const sy = Math.max(0, Math.floor(cam.y/32)-1);
  const ey = Math.min(H, sy + 22);

  for(let y=sy; y<ey; y++){
    for(let x=sx; x<ex; x++){
      const px = x*32 - cam.x;
      const py = y*32 - cam.y;
      const tile = world[y][x];
      if(tile === 'fire') ctx.drawImage(IMG.fire, px, py, 32, 32);
      else if(tile === 'chest') ctx.drawImage(IMG.chest, px, py, 32, 32);
      else drawTile(tile, px, py);
    }
  }

  const pImg = IMG['p_'+player.dir];
  if(pImg) ctx.drawImage(pImg, 400-16, 300-24, 32, 48);
}

function loop(){ update(); draw(); requestAnimationFrame(loop); }