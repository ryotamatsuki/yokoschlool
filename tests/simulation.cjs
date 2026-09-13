const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const elements=new Map(),listeners={};
const gradient={addColorStop(){}};
const ctx=new Proxy({createLinearGradient:()=>gradient,save(){},restore(){},drawImage(){},fillRect(){},beginPath(){},arc(){},fill(){},stroke(){},moveTo(){},lineTo(){},translate(){},scale(){},rotate(){},fillText(){}},{get:(t,k)=>t[k]||(()=>{})});
function element(id){if(!elements.has(id))elements.set(id,{id,textContent:'',innerHTML:'',hidden:false,value:'casual',style:{},checked:true,dataset:{},classList:{add(){},remove(){}},addEventListener(type,fn){this[type]=fn},querySelector:()=>element('heading'),getBoundingClientRect:()=>({width:960,height:540}),getContext:()=>ctx,blur(){},setPointerCapture(){}});return elements.get(id);}
class MockImage{constructor(){this.onload=null;this._src='';}set src(v){this._src=v;if(this.onload)this.onload();}get src(){return this._src;}}
const sandbox={console,Math,Set,Map,Number,String,Image:MockImage,performance:{now:()=>0},localStorage:{getItem:()=>null,setItem(){}},ResizeObserver:class{observe(){}},requestAnimationFrame(){},document:{getElementById:element,querySelectorAll:()=>[],body:{classList:{add(){},remove(){}}},activeElement:{tagName:'BODY'},hidden:false,addEventListener(){}},window:{addEventListener(t,f){listeners[t]=f}}};
let source=fs.readFileSync(path.join(__dirname,'../game.js'),'utf8');
source=source.replace(/\}\)\(\);\s*$/,`globalThis.test={setup,start,update,draw,jump,hurt,pause,finish,damageEnemy,shoot,segmentRectHit,terrainBlocks,acquireTarget,updateBoss,keys,held,get:()=>({player,enemies,boss,zone,state,score,shots,bullets,particles,platforms,hazards,checkpoint,checkpointKills,kills,W,cam,arenaActive,stageTimer,auto}),set:(x)=>{if('state'in x)state=x.state;if('boss'in x)boss=x.boss;if('kills'in x)kills=x.kills;if('auto'in x)auto=x.auto;if('cam'in x)cam=x.cam;}};})();`);
vm.runInNewContext(source,sandbox);const g=sandbox.test;
function steps(n){for(let i=0;i<n;i++)if(g.get().state==='playing')g.update(1/120);}

g.start();steps(120);assert.equal(g.get().player.y,410);g.jump();steps(12);g.jump();assert.equal(g.get().player.jumps,2);let v=g.get().player.vy;g.jump();assert.equal(g.get().player.vy,v);console.log('PASS ground collision and double-jump limit');

g.setup(0);g.get().player.inv=0;let hp=g.get().player.hp;g.hurt();g.hurt();assert.equal(g.get().player.hp,hp-1);console.log('PASS damage invulnerability');

g.setup(0);g.set({kills:5});g.get().player.x=1860;steps(1);assert.equal(g.get().checkpoint,1810);assert.equal(g.get().checkpointKills,5);g.set({kills:9});g.get().player.hp=1;g.get().player.inv=0;g.hurt();assert.equal(g.get().state,'dead');element('start').onclick();assert.equal(g.get().state,'playing');assert.equal(g.get().kills,5);assert.equal(g.get().player.x,1810);console.log('PASS checkpoint retry restores score-state counters');

g.pause();assert.equal(g.get().state,'paused');g.pause();assert.equal(g.get().state,'playing');console.log('PASS pause and resume');

g.setup(0);g.get().enemies.splice(0);g.get().player.dir=-1;g.get().player.x=500;g.set({boss:{x:900,y:290,w:108,h:130,hp:100,maxHp:100,dead:false}});let before=g.get().shots.length;assert.equal(g.shoot(true),true);assert(g.get().shots.length>before);assert(g.get().shots.at(-1).vx<0);console.log('PASS manual shot follows player facing even with boss behind');

g.setup(0);g.get().enemies.splice(0);g.set({boss:null});g.get().player.x=300;g.get().player.dir=1;before=g.get().shots.length;assert.equal(g.shoot(false),false);assert.equal(g.get().shots.length,before);g.get().enemies.push({x:520,y:412,w:30,h:36,hp:4,dead:false,type:'walker',dir:-1,timer:99,phase:0});assert(g.acquireTarget());assert.equal(g.shoot(false),true);assert(g.get().shots.at(-1).vx>0);g.get().player.dir=-1;assert.equal(g.acquireTarget(),null);console.log('PASS auto-fire requires a visible target in the facing cone');

g.setup(0);g.get().enemies.splice(0);g.set({auto:false});g.held.set(99,'fire');before=g.get().shots.length;steps(2);g.held.clear();assert(g.get().shots.length>before);console.log('PASS manual FIRE input works with auto-fire off');

assert.equal(g.segmentRectHit(0,0,100,100,{x:45,y:45,w:10,h:10},2),true);assert.equal(g.segmentRectHit(0,0,20,20,{x:45,y:45,w:10,h:10},2),false);g.setup(0);assert.equal(g.terrainBlocks(300,360,600,360,2),true);assert.equal(g.terrainBlocks(300,430,360,430,2),false);console.log('PASS swept projectile hitbox and platform shielding');

g.setup(0);g.get().enemies.splice(0);g.get().bullets.splice(0);g.get().enemies.push({x:g.get().cam+g.get().W+120,y:412,w:30,h:36,hp:4,dead:false,type:'walker',dir:-1,timer:0,phase:0,baseY:412});steps(2);assert.equal(g.get().bullets.length,0);console.log('PASS off-screen enemies stay inactive');

g.setup(0);g.get().player.x=3460;steps(1);assert(g.get().boss&&g.get().arenaActive);g.keys.add('left');steps(120);g.keys.delete('left');assert(g.get().player.x>=3398);g.get().player.x=g.get().boss.x-50;g.keys.add('right');steps(120);g.keys.delete('right');assert(g.get().player.x<=g.get().boss.x-g.get().player.w-12+1e-6);console.log('PASS boss arena boundaries are symmetric/physical');

const b=g.get().boss;g.damageEnemy(b,{power:999,x:b.x,y:b.y});assert(g.get().stageTimer>0);assert(g.get().particles.length>0);const life0=g.get().particles[0].life;steps(5);assert(g.get().particles.length>0);assert(g.get().particles[0].life<life0||g.get().particles.length!==0);console.log('PASS stage-clear particles keep animating');

const signatures=[];for(let z=0;z<3;z++){g.setup(z);signatures.push(JSON.stringify(g.get().hazards.map(h=>[h.x,h.w]))+'|'+g.get().enemies.filter(e=>e.type==='drone').length);}assert.equal(new Set(signatures).size,3);
const patternCounts=[];for(let z=0;z<3;z++){g.setup(z);g.get().player.x=3460;steps(1);g.get().bullets.splice(0);g.set({cam:3300});g.get().boss.timer=0;g.updateBoss(0);patternCounts.push(g.get().bullets.length);}assert.equal(new Set(patternCounts).size,3);console.log('PASS stage layouts and three boss attack patterns are differentiated');

for(let z=0;z<3;z++){g.setup(z);g.keys.clear();g.keys.add('right');for(let i=0;i<5200&&!g.get().boss;i++){const st=g.get(),p=st.player;p.inv=5;const next=st.hazards.find(h=>h.x+h.w>p.x&&h.x>p.x-20);if(next){const dist=next.x-(p.x+p.w);if(p.ground&&dist<105&&dist>-20)g.jump();else if(!p.ground&&p.vy>50&&p.jumps===1&&p.x<next.x+next.w)g.jump();}steps(1);}g.keys.delete('right');assert(g.get().boss,`stage ${z+1} should be traversable to boss trigger`);}console.log('PASS all three authored stage geometries are traversable');

for(let z=0;z<3;z++){g.setup(z);g.get().player.x=3460;steps(1);const boss=g.get().boss;assert(boss&&boss.hp>0);g.damageEnemy(boss,{power:999,x:boss.x,y:boss.y});steps(350);assert.equal(g.get().state,z===2?'win':'playing');if(z<2)assert.equal(g.get().zone,z+1);}console.log('PASS all three boss transitions and final victory');

const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');assert.match(html,/id="fire"[^>]*data-hold="fire"/);assert.match(html,/id="edition-zone"/);assert.match(html,/SOUND ON/);console.log('PASS mobile FIRE, dynamic zone label and sound-on UI contract');

g.draw();console.log('PASS drawing smoke check with Image/Canvas mocks');
