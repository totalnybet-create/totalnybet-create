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
  const SYMBOL_SIZE = 112;
  const GRID_W = REELS * CELL + (REELS - 1) * GAP;
  const GRID_H = ROWS * CELL + (ROWS - 1) * GAP;
  const GRID_X = (VIEW_W - GRID_W) / 2;
  const GRID_Y = 146;

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
      bg.fillStyle(index%2?0x100b14:0x0b0910,0.98); bg.fillRoundedRect(x,y,CELL,GRID_H,10);
      bg.lineStyle(2,0x9f6c2b,0.58); bg.strokeRoundedRect(x,y,CELL,GRID_H,10);

      const maskShape=scene.add.graphics();
      maskShape.fillStyle(0xffffff,1); maskShape.fillRect(x,y,CELL,GRID_H); maskShape.setVisible(false);
      this.mask=maskShape.createGeometryMask();

      for(let i=0;i<POOL;i++){
        const key=randomSymbol(); const sy=y+(i-1)*(CELL+GAP)+CELL/2;
        const s=scene.add.image(x+CELL/2,sy,'symbols',FRAME[key]).setDepth(3);
        s.setDisplaySize(SYMBOL_SIZE,SYMBOL_SIZE); s.setMask(this.mask); s.setData('key',key);
        s.setData('baseScaleX',s.scaleX); s.setData('baseScaleY',s.scaleY); this.sprites.push(s);
      }
    }
    setSymbol(sprite,key){
      sprite.setFrame(FRAME[key]); sprite.setData('key',key);
      sprite.setDisplaySize(SYMBOL_SIZE,SYMBOL_SIZE);
      sprite.setData('baseScaleX',sprite.scaleX); sprite.setData('baseScaleY',sprite.scaleY);
      sprite.setAlpha(1); sprite.clearTint();
    }
    start(){
      this.running=true; this.speed=180; this.targetSpeed=state.turbo?2900:1850;
      for(const s of this.sprites){ const bx=s.getData('baseScaleX'), by=s.getData('baseScaleY'); s.setScale(bx*.97,by*1.08).setAlpha(.82); }
    }
    update(delta){
      if(!this.running) return;
      this.speed+=(this.targetSpeed-this.speed)*Math.min(1,12*delta/1000);
      const step=CELL+GAP; const bottom=this.y+(ROWS+1)*step+CELL/2; const move=this.speed*delta/1000;
      const stretch=P.Math.Clamp(this.speed/1900,0,1);
      for(const s of this.sprites){
        s.y+=move;
        if(s.y>bottom){ s.y-=POOL*step; this.setSymbol(s,randomSymbol()); }
        const bx=s.getData('baseScaleX'), by=s.getData('baseScaleY'); s.setScale(bx*(1-stretch*.04),by*(1+stretch*.17)).setAlpha(1-stretch*.2);
      }
    }
    stop(column,duration){
      this.running=false; this.speed=0; const step=CELL+GAP;
      const ordered=[...this.sprites].sort((a,b)=>a.y-b.y); const rows=[-1,0,1,2,3];
      ordered.forEach((s,i)=>{
        const row=rows[i]; const key=row>=0&&row<ROWS?column[row]:randomSymbol(); this.setSymbol(s,key);
        const bx=s.getData('baseScaleX'),by=s.getData('baseScaleY');
        sceneTween(this.scene,s,{y:this.y+row*step+CELL/2,scaleX:bx,scaleY:by,alpha:1},duration,'Back.Out');
      });
    }
    visible(row){
      const target=this.y+row*(CELL+GAP)+CELL/2; let best=null,dist=Infinity;
      for(const s of this.sprites){const d=Math.abs(s.y-target);if(d<dist){dist=d;best=s;}}
      return best;
    }
  }

  function sceneTween(scene,target,props,duration,ease){ scene.tweens.add({targets:target,...props,duration,ease:ease||'Sine.Out'}); }

  class SlotScene extends P.Scene {
    constructor(){ super('slot'); }
    preload(){
      this.load.spritesheet('symbols','assets/symbols/symbols-atlas.webp',{frameWidth:128,frameHeight:128,endFrame:10});
      this.load.on('progress',(v)=>{const p=42+Math.round(v*58);ui.loadingProgress.style.width=`${p}%`;ui.loadingText.textContent=`Ładowanie ${p}%`;});
      this.load.on('loaderror',(file)=>{ui.loadingText.textContent='Błąd symboli';console.error('[Royal Arc] load error',file?.src||file);});
      this.load.on('complete',()=>{ui.loadingProgress.style.width='100%';ui.loadingText.textContent='Gotowe';setTimeout(()=>ui.loading.classList.add('done'),160);});
    }
    create(){
      state.scene=this; this.reels=[]; this.winSprites=[]; this.cameras.main.setBackgroundColor('rgba(0,0,0,0)');
      const texture=this.textures.get('symbols'); if(texture) texture.setFilter(P.Textures.FilterMode.LINEAR);
      this.buildScene(); this.buildReels(); this.payline=this.add.graphics().setDepth(20); this.buildAmbient();
      ui.status.textContent='GOTOWY — 10 LINII'; syncUi();
    }
    buildScene(){
      const g=this.add.graphics();
      g.fillGradientStyle(0x1a1020,0x1a1020,0x07060a,0x07060a,1); g.fillRoundedRect(10,10,VIEW_W-20,VIEW_H-20,26);
      g.lineStyle(4,0x6e4516,.95); g.strokeRoundedRect(10,10,VIEW_W-20,VIEW_H-20,26);
      g.lineStyle(2,0xd0a24c,.4); g.strokeRoundedRect(18,18,VIEW_W-36,VIEW_H-36,22);

      this.add.text(VIEW_W/2,48,'♛  ROYAL ARC  ♛',{fontFamily:'Georgia,serif',fontSize:'30px',color:'#f4d887',stroke:'#2a1307',strokeThickness:5}).setOrigin(.5);
      this.add.text(VIEW_W/2,88,'KORONA  •  SKARB  •  WŁADZA',{fontFamily:'Arial,sans-serif',fontSize:'13px',color:'#b79a6d',letterSpacing:4}).setOrigin(.5);

      const plate=this.add.graphics().setDepth(0);
      plate.fillStyle(0x050407,.95); plate.fillRoundedRect(GRID_X-16,GRID_Y-16,GRID_W+32,GRID_H+32,18);
      plate.lineStyle(5,0x7a4d18,.9); plate.strokeRoundedRect(GRID_X-16,GRID_Y-16,GRID_W+32,GRID_H+32,18);
      plate.lineStyle(2,0xe6bd62,.45); plate.strokeRoundedRect(GRID_X-9,GRID_Y-9,GRID_W+18,GRID_H+18,14);

      const div=this.add.graphics().setDepth(5); div.lineStyle(1,0xd7aa52,.22);
      for(let r=1;r<ROWS;r++){const y=GRID_Y+r*CELL+(r-.5)*GAP;div.lineBetween(GRID_X+4,y,GRID_X+GRID_W-4,y);}
      this.add.text(VIEW_W/2,642,'WILD • SCATTER • FREE SPINS',{fontFamily:'Arial,sans-serif',fontSize:'11px',color:'#8f7758',letterSpacing:3}).setOrigin(.5);
    }
    buildReels(){ for(let i=0;i<REELS;i++) this.reels.push(new Reel(this,i,GRID_X+i*(CELL+GAP),GRID_Y)); }
    buildAmbient(){
      this.time.addEvent({delay:220,loop:true,callback:()=>{
        if(Math.random()>.55)return; const x=P.Math.Between(25,VIEW_W-25),y=P.Math.Between(30,VIEW_H-30);
        const dot=this.add.circle(x,y,P.Math.Between(1,2),0xf3c66a,.55).setDepth(25).setBlendMode(P.BlendModes.ADD);
        this.tweens.add({targets:dot,y:y-P.Math.Between(15,35),alpha:0,scale:.2,duration:P.Math.Between(500,900),onComplete:()=>dot.destroy()});
      }});
    }
    update(_t,delta){ for(const r of this.reels) r.update(delta); }
    wait(ms){ return new Promise((resolve)=>this.time.delayedCall(ms,resolve)); }
    clearWin(){
      this.payline.clear(); ui.winBanner.classList.remove('show');
      for(const s of this.winSprites){if(!s?.active)continue;this.tweens.killTweensOf(s);s.clearTint();const bx=s.getData('baseScaleX'),by=s.getData('baseScaleY');s.setScale(bx,by);} this.winSprites=[];
    }
    async spin(){
      if(state.spinning)return; const free=state.freeSpins>0;
      if(!free&&state.balance<state.bet){ui.status.textContent='ZA MAŁO ŚRODKÓW';return;}
      this.clearWin(); state.spinning=true; state.win=0; if(free)state.freeSpins--;else state.balance=Math.max(0,state.balance-state.bet); syncUi();
      ui.status.textContent=free?'FREE SPIN':(state.turbo?'TURBO SPIN':'SPIN');
      const matrix=makeMatrix(); for(const r of this.reels)r.start();
      await this.wait(state.turbo?280:620);
      const stagger=state.turbo?55:115, stopTime=state.turbo?110:220;
      for(let i=0;i<REELS;i++){this.reels[i].stop(matrix[i],stopTime);if(i===REELS-1&&!state.turbo)this.cameras.main.shake(45,.0014);await this.wait(stagger);}
      await this.wait(stopTime+60);
      const result=evaluate(matrix,state.bet); state.win=Number(result.total.toFixed(2)); state.balance+=state.win; state.freeSpins+=result.awardedFreeSpins; syncUi();
      if(result.wins.length)this.showWin(result);else ui.status.textContent=state.freeSpins>0?'BONUS GOTOWY':'SPRÓBUJ PONOWNIE';
      state.spinning=false; syncUi();
      if(free&&state.freeSpins>0)this.time.delayedCall(state.turbo?320:760,()=>this.spin());
    }
    showWin(result){
      const unique=new Map(); for(const w of result.wins)for(const c of w.cells)unique.set(`${c.reel}:${c.row}`,c);
      for(const c of unique.values()){
        const s=this.reels[c.reel].visible(c.row); if(!s)continue; this.winSprites.push(s); s.setTint(0xffe59a);
        const bx=s.getData('baseScaleX'),by=s.getData('baseScaleY'); this.tweens.add({targets:s,scaleX:bx*1.08,scaleY:by*1.08,duration:260,yoyo:true,repeat:3,ease:'Sine.InOut'});
      }
      const line=result.wins.find((w)=>w.type==='line'); if(line)this.drawLine(PAYLINES[line.lineIndex]);
      const ratio=state.win/Math.max(.01,state.bet); ui.winLabel.textContent=ratio>=25?'MEGA WIN':ratio>=10?'BIG WIN':'WYGRANA';ui.winAmount.textContent=fmt(state.win);ui.winBanner.classList.add('show');
      ui.status.textContent=result.awardedFreeSpins?`BONUS +${result.awardedFreeSpins} FREE SPINS`:`${ui.winLabel.textContent} × ${fmt(ratio)}`;
      if(ratio>=10)this.cameras.main.flash(150,255,215,130,false); this.time.delayedCall(state.turbo?420:900,()=>ui.winBanner.classList.remove('show'));
    }
    drawLine(line){
      this.payline.clear(); this.payline.lineStyle(5,0xffd56a,.88); this.payline.beginPath();
      line.forEach((row,reel)=>{const x=GRID_X+reel*(CELL+GAP)+CELL/2,y=GRID_Y+row*(CELL+GAP)+CELL/2;if(reel===0)this.payline.moveTo(x,y);else this.payline.lineTo(x,y);});
      this.payline.strokePath(); this.tweens.add({targets:this.payline,alpha:{from:1,to:.25},duration:300,yoyo:true,repeat:2});
    }
  }

  const game=new P.Game({
    type:P.WEBGL,parent:'canvas-host',width:VIEW_W,height:VIEW_H,transparent:true,antialias:true,roundPixels:true,powerPreference:'high-performance',
    render:{antialias:true,pixelArt:false,roundPixels:true,transparent:true,powerPreference:'high-performance',batchSize:2048},
    scale:{mode:P.Scale.FIT,autoCenter:P.Scale.CENTER_BOTH,width:VIEW_W,height:VIEW_H},scene:[SlotScene]
  });

  const requestSpin=()=>state.scene?.spin();
  ui.spin.addEventListener('click',requestSpin);
  ui.betDown.addEventListener('click',()=>{if(state.spinning)return;state.bet=Math.max(.2,Number((state.bet-.2).toFixed(2)));syncUi();});
  ui.betUp.addEventListener('click',()=>{if(state.spinning)return;state.bet=Math.min(20,Number((state.bet+.2).toFixed(2)));syncUi();});
  ui.turbo.addEventListener('click',()=>{state.turbo=!state.turbo;syncUi();ui.status.textContent=state.turbo?'TURBO WŁĄCZONE':'TURBO WYŁĄCZONE';});
  ui.sound.addEventListener('click',()=>{state.sound=!state.sound;if(game.sound)game.sound.mute=!state.sound;syncUi();});
  window.addEventListener('keydown',(e)=>{if(e.code==='Space'){e.preventDefault();requestSpin();}},{passive:false});
  document.addEventListener('visibilitychange',()=>{if(!game.loop)return;document.hidden?game.loop.sleep():game.loop.wake();});
  syncUi();
})();
