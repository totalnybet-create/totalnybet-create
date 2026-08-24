(() => {
  'use strict';

  const P = window.Phaser;
  const loadingText = document.getElementById('loading-text');
  if (!P) {
    if (loadingText) loadingText.textContent = 'Błąd silnika gry';
    throw new Error('Phaser failed to load');
  }

  const VIEW_W = 900;
  const VIEW_H = 700;
  const REELS = 5;
  const ROWS = 3;
  const POOL = 5;
  const CELL = 148;
  const GAP = 8;
  const SYMBOL_SIZE = 124;
  const GRID_W = REELS * CELL + (REELS - 1) * GAP;
  const GRID_H = ROWS * CELL + (ROWS - 1) * GAP;
  const GRID_X = (VIEW_W - GRID_W) / 2;
  const GRID_Y = 146;
  const lowPower = (navigator.deviceMemory && navigator.deviceMemory <= 4) || (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4);
  const PARTICLE_BUDGET = lowPower ? 18 : 34;

  const SYMBOLS = ['crown_red','crown_blue','crown_green','crown_gold','crown_silver','crown_black','crown_ice','diamond_goblin','king','wild'];
  const FRAME = { crown_red:0,crown_blue:1,crown_green:2,crown_gold:3,crown_silver:4,crown_black:5,crown_ice:6,diamond_goblin:7,king:8,wild:9,ice_throne:10 };
  const META = {
    crown_red:{weight:18,pay:[0,0,1,2.5,7]}, crown_blue:{weight:18,pay:[0,0,1,2.5,7]},
    crown_green:{weight:17,pay:[0,0,1.2,3,8]}, crown_gold:{weight:15,pay:[0,0,1.5,4,10]},
    crown_silver:{weight:14,pay:[0,0,1.8,5,12]}, crown_black:{weight:12,pay:[0,0,2.2,6,16]},
    crown_ice:{weight:10,pay:[0,0,3,8,22]}, diamond_goblin:{weight:8,pay:[0,0,4,12,35],scatter:true},
    king:{weight:6,pay:[0,0,6,18,55]}, wild:{weight:5,pay:[0,0,8,25,80],wild:true}
  };
  const PAYLINES = [[1,1,1,1,1],[0,0,0,0,0],[2,2,2,2,2],[0,1,2,1,0],[2,1,0,1,2],[0,0,1,2,2],[2,2,1,0,0],[1,0,0,0,1],[1,2,2,2,1],[0,1,1,1,0]];

  const state = { balance:1000, bet:1, win:0, spinning:false, turbo:false, sound:true, freeSpins:0, scene:null };
  const ui = {
    balance:document.getElementById('balance'), win:document.getElementById('win'), bet:document.getElementById('bet'),
    status:document.getElementById('status'), freeSpins:document.getElementById('free-spins'), spin:document.getElementById('spin'),
    betDown:document.getElementById('bet-down'), betUp:document.getElementById('bet-up'), turbo:document.getElementById('turbo'),
    sound:document.getElementById('sound'), winBanner:document.getElementById('win-banner'), winLabel:document.getElementById('win-label'),
    winAmount:document.getElementById('win-amount'), loading:document.getElementById('loading-screen'),
    loadingProgress:document.getElementById('loading-progress'), loadingText:document.getElementById('loading-text')
  };

  let audioCtx = null;
  function ensureAudio(){
    if (!state.sound) return null;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    if (!audioCtx) audioCtx = new Ctx();
    if (audioCtx.state === 'suspended') audioCtx.resume().catch(()=>{});
    return audioCtx;
  }
  function tone(freq,duration=.07,type='sine',gain=.025,when=0,endFreq=null){
    const ctx=ensureAudio(); if(!ctx)return;
    const t=ctx.currentTime+when, osc=ctx.createOscillator(), amp=ctx.createGain();
    osc.type=type; osc.frequency.setValueAtTime(Math.max(30,freq),t);
    if(endFreq)osc.frequency.exponentialRampToValueAtTime(Math.max(30,endFreq),t+duration);
    amp.gain.setValueAtTime(.0001,t); amp.gain.exponentialRampToValueAtTime(gain,t+.008); amp.gain.exponentialRampToValueAtTime(.0001,t+duration);
    osc.connect(amp); amp.connect(ctx.destination); osc.start(t); osc.stop(t+duration+.02);
  }
  function sfx(kind,index=0){
    if(!state.sound)return;
    if(kind==='tap'){tone(390,.035,'triangle',.018);return;}
    if(kind==='spin'){tone(145,.2,'sawtooth',.018,0,72);tone(290,.11,'triangle',.012,.03,170);return;}
    if(kind==='stop'){tone(105+index*9,.05,'square',.022);tone(230+index*12,.035,'triangle',.012,.01);return;}
    if(kind==='anticipation'){tone(220,.12,'sine',.02);tone(330,.12,'sine',.018,.14);tone(440,.15,'triangle',.018,.28);return;}
    if(kind==='win'){[660,825,990].forEach((f,i)=>tone(f,.18,'triangle',.022,i*.06));return;}
    if(kind==='bigwin'){[523,659,784,1047,1318].forEach((f,i)=>tone(f,.26,'triangle',.028,i*.075));tone(120,.4,'sine',.018,0,70);return;}
  }
  function haptic(pattern){try{if(navigator.vibrate)navigator.vibrate(pattern);}catch(_e){}}

  const fmt = (n) => Number(n).toLocaleString('pl-PL',{minimumFractionDigits:2,maximumFractionDigits:2});
  function syncUi(){
    ui.balance.textContent=fmt(state.balance); ui.win.textContent=fmt(state.win); ui.bet.textContent=fmt(state.bet);
    ui.spin.disabled=state.spinning || (state.balance<state.bet && state.freeSpins<=0);
    ui.betDown.disabled=state.spinning; ui.betUp.disabled=state.spinning;
    ui.freeSpins.textContent=state.freeSpins>0?`FREE SPINS: ${state.freeSpins}`:'';
    ui.turbo.setAttribute('aria-pressed',String(state.turbo)); ui.sound.setAttribute('aria-pressed',String(state.sound));
  }

  function randomSymbol(){
    let total=0; for(const k of SYMBOLS) total+=META[k].weight;
    let r=Math.random()*total; for(const k of SYMBOLS){ r-=META[k].weight; if(r<=0) return k; }
    return SYMBOLS[0];
  }
  function makeMatrix(){ return Array.from({length:REELS},()=>Array.from({length:ROWS},randomSymbol)); }
  function evaluate(matrix,bet){
    let total=0; const wins=[];
    PAYLINES.forEach((line,lineIndex)=>{
      const seq=line.map((row,reel)=>matrix[reel][row]);
      let base=seq[0];
      if(META[base].wild) base=seq.find((s)=>!META[s].wild && !META[s].scatter)||'wild';
      if(META[base].scatter) return;
      let count=0; const cells=[];
      for(let reel=0;reel<REELS;reel++){
        const s=seq[reel];
        if(s===base || META[s].wild){count++;cells.push({reel,row:line[reel]});} else break;
      }
      if(count>=3){ const amount=bet*(META[base].pay[count-1]||0)/PAYLINES.length; if(amount>0){total+=amount;wins.push({type:'line',lineIndex,amount,cells});} }
    });
    const scatterCells=[];
    for(let reel=0;reel<REELS;reel++) for(let row=0;row<ROWS;row++) if(META[matrix[reel][row]].scatter) scatterCells.push({reel,row});
    let awardedFreeSpins=0;
    if(scatterCells.length>=3){
      const c=Math.min(5,scatterCells.length); const amount=bet*({3:2,4:10,5:40}[c]||0);
      total+=amount; awardedFreeSpins=c===3?8:c===4?12:18; wins.push({type:'scatter',amount,cells:scatterCells});
    }
    return {total,wins,awardedFreeSpins};
  }

  class Reel {
    constructor(scene,index,x,y){
      this.scene=scene; this.index=index; this.x=x; this.y=y; this.running=false; this.speed=0; this.targetSpeed=0; this.sprites=[];
      const bg=scene.add.graphics().setDepth(1);
      bg.fillGradientStyle(index%2?0x17101c:0x120d16,index%2?0x120d16:0x17101c,0x07060a,0x07060a,.98);
      bg.fillRoundedRect(x,y,CELL,GRID_H,10); bg.lineStyle(2,0xb67a2e,.64); bg.strokeRoundedRect(x,y,CELL,GRID_H,10);
      bg.lineStyle(1,0xffd980,.12); bg.lineBetween(x+6,y+6,x+CELL-6,y+6);

      const maskShape=scene.add.graphics(); maskShape.fillStyle(0xffffff,1); maskShape.fillRect(x,y,CELL,GRID_H); maskShape.setVisible(false);
      this.mask=maskShape.createGeometryMask();
      this.motionFx=scene.add.graphics().setDepth(4).setMask(this.mask).setBlendMode(P.BlendModes.ADD).setAlpha(0);
      this.motionFx.fillStyle(0xffd980,.11); this.motionFx.fillRect(x+21,y-80,4,GRID_H+160); this.motionFx.fillRect(x+CELL-27,y-50,2,GRID_H+100);
      this.motionFx.fillStyle(0xb579ff,.07); this.motionFx.fillRect(x+CELL*.48,y-90,6,GRID_H+180);

      for(let i=0;i<POOL;i++){
        const key=randomSymbol(), sy=y+(i-1)*(CELL+GAP)+CELL/2;
        const shadow=null;
        const s=scene.add.image(x+CELL/2,sy,'symbols',FRAME[key]).setDepth(3);
        s.setDisplaySize(SYMBOL_SIZE,SYMBOL_SIZE); s.setMask(this.mask); s.setData('key',key); s.setData('shadow',shadow);
        s.setData('baseScaleX',s.scaleX); s.setData('baseScaleY',s.scaleY); this.sprites.push(s);
      }
    }
    setSymbol(sprite,key){
      sprite.setFrame(FRAME[key]); sprite.setData('key',key); sprite.setDisplaySize(SYMBOL_SIZE,SYMBOL_SIZE);
      sprite.setData('baseScaleX',sprite.scaleX); sprite.setData('baseScaleY',sprite.scaleY); sprite.setAlpha(1); sprite.clearTint();
    }
    start(){
      this.running=true; this.speed=180; this.targetSpeed=state.turbo?3150:2050;
      this.scene.tweens.killTweensOf(this.motionFx); this.scene.tweens.add({targets:this.motionFx,alpha:state.turbo?.58:.46,duration:90});
      for(const s of this.sprites){const bx=s.getData('baseScaleX'),by=s.getData('baseScaleY');s.setScale(bx*.96,by*1.1).setAlpha(.8);}
    }
    update(delta){
      if(!this.running)return;
      this.speed+=(this.targetSpeed-this.speed)*Math.min(1,13*delta/1000);
      const step=CELL+GAP,bottom=this.y+(ROWS+1)*step+CELL/2,move=this.speed*delta/1000,stretch=P.Math.Clamp(this.speed/2050,0,1);
      this.motionFx.alpha=(state.turbo?.2:.13)+stretch*(state.turbo?.4:.32);
      for(const s of this.sprites){
        s.y+=move; const sh=s.getData('shadow'); if(sh)sh.y=s.y+41;
        if(s.y>bottom){s.y-=POOL*step;if(sh)sh.y=s.y+41;this.setSymbol(s,randomSymbol());}
        const bx=s.getData('baseScaleX'),by=s.getData('baseScaleY');s.setScale(bx*(1-stretch*.055),by*(1+stretch*.21)).setAlpha(1-stretch*.24);
      }
    }
    stop(column,duration){
      this.running=false;this.speed=0;const step=CELL+GAP;
      this.scene.tweens.killTweensOf(this.motionFx);this.scene.tweens.add({targets:this.motionFx,alpha:0,duration:duration*.85,ease:'Sine.Out'});
      const ordered=[...this.sprites].sort((a,b)=>a.y-b.y),rows=[-1,0,1,2,3];
      ordered.forEach((s,i)=>{
        const row=rows[i],key=row>=0&&row<ROWS?column[row]:randomSymbol();this.setSymbol(s,key);
        const bx=s.getData('baseScaleX'),by=s.getData('baseScaleY'),targetY=this.y+row*step+CELL/2,sh=s.getData('shadow');
        sceneTween(this.scene,s,{y:targetY,scaleX:bx,scaleY:by,alpha:1},duration,'Back.Out');
        if(sh)sceneTween(this.scene,sh,{y:targetY+41,alpha:.34},duration,'Back.Out');
      });
    }
    visible(row){
      const target=this.y+row*(CELL+GAP)+CELL/2;let best=null,dist=Infinity;
      for(const s of this.sprites){const d=Math.abs(s.y-target);if(d<dist){dist=d;best=s;}}
      return best;
    }
  }

  function sceneTween(scene,target,props,duration,ease){scene.tweens.add({targets:target,...props,duration,ease:ease||'Sine.Out'});}

  class SlotScene extends P.Scene {
    constructor(){super('slot');}
    preload(){
      this.load.spritesheet('symbols','assets/symbols/symbols-atlas.webp',{frameWidth:128,frameHeight:128,endFrame:10});
      this.load.on('progress',(v)=>{const p=42+Math.round(v*58);ui.loadingProgress.style.width=`${p}%`;ui.loadingText.textContent=`Ładowanie ${p}%`;});
      this.load.on('loaderror',(file)=>{ui.loadingText.textContent='Błąd symboli';console.error('[Royal Arc] load error',file?.src||file);});
      this.load.on('complete',()=>{ui.loadingProgress.style.width='100%';ui.loadingText.textContent='Gotowe';setTimeout(()=>ui.loading.classList.add('done'),160);});
    }
    create(){
      state.scene=this;this.reels=[];this.winSprites=[];this.anticipationTween=null;this.cameras.main.setBackgroundColor('rgba(0,0,0,0)');
      const texture=this.textures.get('symbols');if(texture)texture.setFilter(P.Textures.FilterMode.LINEAR);
      this.buildScene();this.buildReels();this.payline=this.add.graphics().setDepth(20);this.buildPremiumFx();this.buildAmbient();
      ui.status.textContent='GOTOWY — 10 LINII';syncUi();
    }
    buildScene(){
      const g=this.add.graphics();
      g.fillGradientStyle(0x24132d,0x24132d,0x050407,0x050407,1);g.fillRoundedRect(6,6,VIEW_W-12,VIEW_H-12,22);
      g.lineStyle(1,0xe0b65a,.24);g.strokeRoundedRect(8,8,VIEW_W-16,VIEW_H-16,20);
      const vault=this.add.graphics().setDepth(0);vault.lineStyle(2,0xc18a37,.08);vault.strokeCircle(VIEW_W/2,VIEW_H/2+28,530);vault.strokeCircle(VIEW_W/2,VIEW_H/2+28,600);vault.lineStyle(1,0xffffff,.025);for(let a=0;a<12;a++){const r=P.Math.DegToRad(a*30);vault.lineBetween(VIEW_W/2+Math.cos(r)*245,VIEW_H/2+28+Math.sin(r)*245,VIEW_W/2+Math.cos(r)*300,VIEW_H/2+28+Math.sin(r)*300);}
      const beam=this.add.graphics().setDepth(0).setBlendMode(P.BlendModes.ADD);beam.fillStyle(0xffd987,.035);beam.fillTriangle(110,0,390,0,560,590);beam.fillTriangle(790,0,510,0,340,590);
      this.add.text(VIEW_W/2,48,'♛  ROYAL ARC  ♛',{fontFamily:'Georgia,serif',fontSize:'30px',color:'#ffe49a',stroke:'#2a1307',strokeThickness:5,shadow:{offsetX:0,offsetY:2,color:'#000000',blur:6,fill:true}}).setOrigin(.5);
      this.add.text(VIEW_W/2,88,'THE CROWN VAULT',{fontFamily:'Arial,sans-serif',fontSize:'13px',fontStyle:'bold',color:'#c9a96c',letterSpacing:5}).setOrigin(.5);
      const plate=this.add.graphics().setDepth(0);plate.fillStyle(0x030304,.97);plate.fillRoundedRect(GRID_X-18,GRID_Y-18,GRID_W+36,GRID_H+36,20);plate.lineStyle(2,0xb77a2d,.72);plate.strokeRoundedRect(GRID_X-16,GRID_Y-16,GRID_W+32,GRID_H+32,18);plate.lineStyle(1,0xf0c96c,.34);plate.strokeRoundedRect(GRID_X-7,GRID_Y-7,GRID_W+14,GRID_H+14,12);
      const div=this.add.graphics().setDepth(5);div.lineStyle(1,0xe8bd60,.24);for(let r=1;r<ROWS;r++){const y=GRID_Y+r*CELL+(r-.5)*GAP;div.lineBetween(GRID_X+4,y,GRID_X+GRID_W-4,y);}for(let c=1;c<REELS;c++){const x=GRID_X+c*CELL+(c-.5)*GAP;div.lineBetween(x,GRID_Y+5,x,GRID_Y+GRID_H-5);}
      this.add.text(VIEW_W/2,642,'WILD  •  SCATTER  •  FREE SPINS',{fontFamily:'Arial,sans-serif',fontSize:'11px',color:'#a98a5e',letterSpacing:4}).setOrigin(.5);
    }
    buildReels(){for(let i=0;i<REELS;i++)this.reels.push(new Reel(this,i,GRID_X+i*(CELL+GAP),GRID_Y));}
    buildPremiumFx(){
      this.anticipationFrame=this.add.graphics().setDepth(18).setAlpha(0).setBlendMode(P.BlendModes.ADD);
      this.anticipationFrame.lineStyle(5,0xffd469,.9);this.anticipationFrame.strokeRoundedRect(GRID_X-12,GRID_Y-12,GRID_W+24,GRID_H+24,17);
      this.anticipationFrame.lineStyle(2,0xffffff,.45);this.anticipationFrame.strokeRoundedRect(GRID_X-5,GRID_Y-5,GRID_W+10,GRID_H+10,12);
      this.stopFlash=this.add.rectangle(VIEW_W/2,VIEW_H/2,VIEW_W,VIEW_H,0xffd782,0).setDepth(19).setBlendMode(P.BlendModes.ADD);
    }
    buildAmbient(){
      this.time.addEvent({delay:lowPower?360:240,loop:true,callback:()=>{if(Math.random()>.48)return;const x=P.Math.Between(30,VIEW_W-30),y=P.Math.Between(35,VIEW_H-35);const dot=this.add.circle(x,y,P.Math.Between(1,2),Math.random()>.25?0xf4cb72:0xd6a5ff,.48).setDepth(25).setBlendMode(P.BlendModes.ADD);this.tweens.add({targets:dot,y:y-P.Math.Between(18,46),x:x+P.Math.Between(-12,12),alpha:0,scale:.15,duration:P.Math.Between(650,1150),ease:'Sine.Out',onComplete:()=>dot.destroy()});}});
    }
    update(_t,delta){for(const r of this.reels)r.update(delta);}
    wait(ms){return new Promise((resolve)=>window.setTimeout(resolve,ms));}
    clearWin(){
      this.payline.clear();ui.winBanner.classList.remove('show');delete document.body.dataset.winTier;
      for(const s of this.winSprites){if(!s?.active)continue;this.tweens.killTweensOf(s);s.clearTint();const bx=s.getData('baseScaleX'),by=s.getData('baseScaleY');s.setScale(bx,by);}this.winSprites=[];
    }
    setAnticipation(active,reelIndex=4){
      if(this.anticipationTween){this.anticipationTween.stop();this.anticipationTween=null;}
      this.anticipationFrame.clear();
      if(!active){this.tweens.add({targets:this.anticipationFrame,alpha:0,duration:120});return;}
      const x=GRID_X+reelIndex*(CELL+GAP)-7;
      this.anticipationFrame.lineStyle(5,0xffcf58,.92);this.anticipationFrame.strokeRoundedRect(x,GRID_Y-12,CELL+14,GRID_H+24,14);this.anticipationFrame.lineStyle(2,0xffffff,.42);this.anticipationFrame.strokeRoundedRect(x+5,GRID_Y-7,CELL+4,GRID_H+14,10);
      this.anticipationFrame.alpha=.25;this.anticipationTween=this.tweens.add({targets:this.anticipationFrame,alpha:{from:.25,to:1},duration:190,yoyo:true,repeat:-1,ease:'Sine.InOut'});
      ui.status.textContent='ANTYCYPACJA — JESZCZE JEDEN SCATTER';sfx('anticipation');haptic([18,45,18]);
    }
    impact(reelIndex){
      const x=GRID_X+reelIndex*(CELL+GAP)+CELL/2;this.stopFlash.setPosition(x,GRID_Y+GRID_H/2).setSize(CELL+30,GRID_H+30).setAlpha(.13);this.tweens.add({targets:this.stopFlash,alpha:0,duration:100,ease:'Quad.Out'});
      if(!state.turbo)this.cameras.main.shake(34,.0007);sfx('stop',reelIndex);haptic(8);
    }
    burst(count=PARTICLE_BUDGET,color=0xffd56a){
      const cx=VIEW_W/2,cy=VIEW_H/2-12;
      for(let i=0;i<count;i++){
        const a=P.Math.FloatBetween(0,Math.PI*2),speed=P.Math.Between(90,280),size=P.Math.Between(2,5),c=i%5===0?0xffffff:color;
        const p=this.add.circle(cx,cy,size,c,P.Math.FloatBetween(.55,.95)).setDepth(28).setBlendMode(P.BlendModes.ADD);
        const tx=cx+Math.cos(a)*speed,ty=cy+Math.sin(a)*speed+P.Math.Between(20,85);
        this.tweens.add({targets:p,x:tx,y:ty,alpha:0,scale:.2,duration:P.Math.Between(520,1050),ease:'Cubic.Out',onComplete:()=>p.destroy()});
      }
    }
    async spin(){
      if(state.spinning)return;const free=state.freeSpins>0;
      if(!free&&state.balance<state.bet){ui.status.textContent='ZA MAŁO ŚRODKÓW';return;}
      ensureAudio();this.clearWin();this.setAnticipation(false);state.spinning=true;state.win=0;if(free)state.freeSpins--;else state.balance=Math.max(0,state.balance-state.bet);syncUi();
      ui.status.textContent=free?'FREE SPIN':(state.turbo?'TURBO SPIN':'SPIN');sfx('spin');haptic(10);
      const matrix=makeMatrix();for(const r of this.reels)r.start();this.tweens.add({targets:this.cameras.main,zoom:1.012,duration:state.turbo?90:180,ease:'Sine.Out'});
      await this.wait(state.turbo?250:580);
      const stagger=state.turbo?48:108,stopTime=state.turbo?105:210;let scatterSoFar=0;
      for(let i=0;i<REELS;i++){
        if(!state.turbo&&i>=3&&scatterSoFar>=2){this.setAnticipation(true,i);await this.wait(430);}
        this.reels[i].stop(matrix[i],stopTime);this.impact(i);scatterSoFar+=matrix[i].filter((s)=>META[s].scatter).length;this.setAnticipation(false);
        await this.wait(stagger);
      }
      await this.wait(stopTime+55);this.tweens.add({targets:this.cameras.main,zoom:1,duration:160,ease:'Back.Out'});
      const result=evaluate(matrix,state.bet);state.win=Number(result.total.toFixed(2));state.balance+=state.win;state.freeSpins+=result.awardedFreeSpins;syncUi();
      if(result.wins.length)this.showWin(result);else ui.status.textContent=state.freeSpins>0?'BONUS GOTOWY':'SPRÓBUJ PONOWNIE';
      state.spinning=false;syncUi();if(free&&state.freeSpins>0)window.setTimeout(()=>this.spin(),state.turbo?320:760);
    }
    showWin(result){
      const unique=new Map();for(const w of result.wins)for(const c of w.cells)unique.set(`${c.reel}:${c.row}`,c);
      for(const c of unique.values()){
        const s=this.reels[c.reel].visible(c.row);if(!s)continue;this.winSprites.push(s);s.setTint(0xffe8a3);const bx=s.getData('baseScaleX'),by=s.getData('baseScaleY');
        this.tweens.add({targets:s,scaleX:bx*1.105,scaleY:by*1.105,duration:220,yoyo:true,repeat:4,ease:'Sine.InOut'});
      }
      const line=result.wins.find((w)=>w.type==='line');if(line)this.drawLine(PAYLINES[line.lineIndex]);
      const ratio=state.win/Math.max(.01,state.bet),tier=ratio>=25?'mega':ratio>=10?'big':'normal';document.body.dataset.winTier=tier;
      ui.winLabel.textContent=tier==='mega'?'MEGA WIN':tier==='big'?'BIG WIN':'WYGRANA';ui.winAmount.textContent='0,00';ui.winBanner.classList.add('show');
      ui.status.textContent=result.awardedFreeSpins?`BONUS +${result.awardedFreeSpins} FREE SPINS`:`${ui.winLabel.textContent} × ${fmt(ratio)}`;
      const counter={v:0};this.tweens.add({targets:counter,v:state.win,duration:state.turbo?320:tier==='mega'?1100:tier==='big'?850:560,ease:'Cubic.Out',onUpdate:()=>{ui.winAmount.textContent=fmt(counter.v);},onComplete:()=>{ui.winAmount.textContent=fmt(state.win);}});
      this.burst(tier==='mega'?PARTICLE_BUDGET:tier==='big'?Math.max(14,Math.round(PARTICLE_BUDGET*.72)):Math.max(10,Math.round(PARTICLE_BUDGET*.45)),tier==='mega'?0xffd469:0xffc15a);
      if(tier!=='normal'){this.cameras.main.flash(tier==='mega'?220:150,255,218,132,false);this.tweens.add({targets:this.cameras.main,zoom:1.026,duration:150,yoyo:true,ease:'Sine.InOut'});sfx('bigwin');haptic(tier==='mega'?[25,35,45,45,80]:[20,35,40]);}else{sfx('win');haptic(18);}
      this.time.delayedCall(state.turbo?430:tier==='mega'?1450:tier==='big'?1150:900,()=>{ui.winBanner.classList.remove('show');delete document.body.dataset.winTier;});
    }
    drawLine(line){
      this.payline.clear();this.payline.lineStyle(8,0x7a4a12,.5);this.payline.beginPath();line.forEach((row,reel)=>{const x=GRID_X+reel*(CELL+GAP)+CELL/2,y=GRID_Y+row*(CELL+GAP)+CELL/2;if(reel===0)this.payline.moveTo(x,y);else this.payline.lineTo(x,y);});this.payline.strokePath();
      this.payline.lineStyle(3,0xffdf78,1);this.payline.beginPath();line.forEach((row,reel)=>{const x=GRID_X+reel*(CELL+GAP)+CELL/2,y=GRID_Y+row*(CELL+GAP)+CELL/2;if(reel===0)this.payline.moveTo(x,y);else this.payline.lineTo(x,y);});this.payline.strokePath();this.tweens.add({targets:this.payline,alpha:{from:1,to:.22},duration:250,yoyo:true,repeat:3});
    }
  }

  const game=new P.Game({
    type:P.WEBGL,parent:'canvas-host',width:VIEW_W,height:VIEW_H,transparent:true,antialias:true,roundPixels:true,powerPreference:'high-performance',
    render:{antialias:true,pixelArt:false,roundPixels:true,transparent:true,powerPreference:'high-performance',batchSize:2048},
    scale:{mode:P.Scale.FIT,autoCenter:P.Scale.CENTER_BOTH,width:VIEW_W,height:VIEW_H},scene:[SlotScene]
  });

  const requestSpin=()=>{ensureAudio();state.scene?.spin();};
  ui.spin.addEventListener('click',requestSpin);
  ui.betDown.addEventListener('click',()=>{if(state.spinning)return;sfx('tap');state.bet=Math.max(.2,Number((state.bet-.2).toFixed(2)));syncUi();});
  ui.betUp.addEventListener('click',()=>{if(state.spinning)return;sfx('tap');state.bet=Math.min(20,Number((state.bet+.2).toFixed(2)));syncUi();});
  ui.turbo.addEventListener('click',()=>{ensureAudio();sfx('tap');state.turbo=!state.turbo;syncUi();ui.status.textContent=state.turbo?'TURBO WŁĄCZONE':'TURBO WYŁĄCZONE';});
  ui.sound.addEventListener('click',()=>{state.sound=!state.sound;if(state.sound){ensureAudio();sfx('tap');}if(game.sound)game.sound.mute=!state.sound;syncUi();});
  window.addEventListener('keydown',(e)=>{if(e.code==='Space'){e.preventDefault();requestSpin();}},{passive:false});
  document.addEventListener('visibilitychange',()=>{if(!game.loop)return;document.hidden?game.loop.sleep():game.loop.wake();});
  syncUi();
})();
