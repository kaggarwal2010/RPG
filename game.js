const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

// Use exact filenames from your repo
const ASSETS = {
  overworld: 'tiles/Overworld_Tileset.png',
  water_anim: 'tiles/edge_water_tile_anim_strip_8.png',
  idle_down: 'characters/char_idle_down_anim_strip_6.png',
  idle_up: 'characters/char_idle_up_anim_strip_6.png',
  idle_left: 'characters/char_idle_left_anim_strip_6.png',
  idle_right: 'characters/char_idle_right_anim_strip_6.png',
  run_down: 'characters/char_run_down_anim_strip_6.png',
  run_up: 'characters/char_run_up_anim_strip_6.png',
  run_left: 'characters/char_run_left_anim_strip_6.png',
  run_right: 'characters/char_run_right_anim_strip_6.png',
  fire: 'objects/bonfire_prop_lit_anim_strip_5.png',
  chest: 'objects/lootchest_item_static_open.png'
};

const IMG = {};
let loaded = 0, total = Object.keys(ASSETS).length;
let loadErrors = [];

for (let key in ASSETS) {
  IMG[key] = new Image();
  IMG[key].onload = () => { 
    loaded++; 
    if (loaded === total) start();
  };
  IMG[key].onerror = () => {
    loadErrors.push(ASSETS[key]);
    loaded++;
    if (loaded === total) start();
  };
  IMG[key].src = ASSETS[key];
}

function start(){
  if(loadErrors.length) console.log('Failed to load:', loadErrors);
  requestAnimationFrame(loop);
}

const TS = 16; // tileset tile size
const SPRITE_W = 32, SPRITE_H = 32; // player/object sprite frame size

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

let player = {x: 800, y: 600, dir: 'down', state: 'idle', speed: 2.5};
let keys = {}, cam = {x: 0, y: 0}, frame = 0;

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

function drawTile(key, dx, dy) {
  const t = T[key] || T.grass;
  ctx.drawImage(IMG.overworld, t.x*TS, t.y*TS, TS, TS, dx, dy, 32, 32);
}

function drawWater(dx, dy) {
  const animFrame = Math.floor(frame/8) % 8;
  ctx.drawImage(IMG.water_anim, animFrame*TS, 0, TS, TS, dx, dy, 32, 32);
}

function drawSprite(img, frames, dx, dy, w=32, h=32) {
  if(!img ||!img.complete || img.naturalWidth === 0) return;
  const animFrame = Math.floor(frame/10) % frames;
  ctx.drawImage(img, animFrame*SPRITE_W, 0, SPRITE_W, SPRITE_H, dx, dy, w, h);
}

function update(){
  let dx=0, dy=0;
  player.state = 'idle';
  if(keys['w']||keys['arrowup']) {dy=-1; player.dir='up'; player.state='run';}
  if(keys['s']||keys['arrowdown']) {dy=1; player.dir='down'; player.state='run';}
  if(keys['a']||keys['arrowleft']) {dx=-1; player.dir='left'; player.state='run';}
  if(keys['d']||keys['arrowright']) {dx=1; player.dir='right'; player.state='run';}

  const nx = player.x + dx*player.speed;
  const ny = player.y + dy*player.speed;
  const tx = Math.floor(nx/32), ty = Math.floor(ny/32);
  const tile = world[ty]?.[tx];
  
  if(tile!=='water' && tile!=='tree_green' && tile!=='tree_orange' && tile!=='rock'){
    player.x = nx; player.y = ny;
  }
  cam.x = player.x - 400;
  cam.y = player.y - 300;
  frame++;
}

function draw(){
  ctx.fillStyle = '#1a3a1a';
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
      if(tile === 'water') drawWater(px, py);
      else if(tile === 'fire') drawSprite(IMG.fire, 5, px, py);
      else if(tile === 'chest') ctx.drawImage(IMG.chest, px, py, 32, 32);
      else drawTile(tile, px, py);
    }
  }

  const playerImg = IMG[player.state + '_' + player.dir];
  drawSprite(playerImg, 6, 400-16, 300-24, 32, 48);
}

function loop(){ update(); draw(); requestAnimationFrame(loop); }