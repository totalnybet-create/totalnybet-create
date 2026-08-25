(()=>{
const $=id=>document.getElementById(id); const fmt=n=>Math.floor(n).toLocaleString('pl-PL');
const bets=[10,25,50,100,250,500];
let S={balance:10000,bet:50,jackpot:1284750,free:0,keys:0,spinning:false,turbo:false,sound:true,auto:0,win:0};
try{S={...S,...JSON.parse(localStorage.getItem('legnicaV4')||'{}'),spinning:false,auto:0}}catch(e){}
const save=()=>localStorage.setItem('legnicaV4',JSON.stringify(S));
const D=`<defs>
<linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fff6c9"/><stop offset=".28" stop-color="#f7cf66"/><stop offset=".62" stop-color="#c47a16"/><stop offset="1" stop-color="#603406"/></linearGradient>
<linearGradient id="r" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#ffc5cf"/><stop offset=".28" stop-color="#ff4662"/><stop offset=".7" stop-color="#9e1127"/><stop offset="1" stop-color="#3e0510"/></linearGradient>
<linearGradient id="b" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#eefbff"/><stop offset=".35" stop-color="#82d8ff"/><stop offset=".72" stop-color="#2875a8"/><stop offset="1" stop-color="#12314b"/></linearGradient>
<linearGradient id="s" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fff"/><stop offset=".35" stop-color="#cbd5df"/><stop offset="1" stop-color="#556270"/></linearGradient>
<filter id="sh"><feDropShadow dx="0" dy="4" stdDeviation="3" flood-opacity=".45"/></filter>
</defs>`;
const icons=[
`<svg viewBox="0 0 120 120">${D}<g filter="url(#sh)"><path d="M16 71c20-8 33-27 38-49l11 17 14-25 8 27 20-11-14 33c-11 27-39 43-72 32l27-14c-13 1-23-3-32-10z" fill="url(#g)" stroke="#6b3b07" stroke-width="3"/><circle cx="78" cy="38" r="4" fill="#fff8cf"/></g></svg>`,
`<svg viewBox="0 0 120 120">${D}<g filter="url(#sh)"><path d="M16 76 22 35l26 21L60 15l14 41 25-21 5 41z" fill="url(#g)" stroke="#704007" stroke-width="3"/><rect x="16" y="76" width="88" height="19" rx="7" fill="#b96f12"/><circle cx="60" cy="16" r="7" fill="#fff3b3"/></g></svg>`,
`<svg viewBox="0 0 120 120">${D}<g filter="url(#sh)"><path d="m58 13 22 21-8 16 25 24-16 16-25-24-16 8-21-22z" fill="url(#g)" stroke="#653806" stroke-width="3"/><circle cx="58" cy="36" r="13" fill="#15191d" stroke="#f0c75f" stroke-width="5"/></g></svg>`,
`<svg viewBox="0 0 120 120">${D}<g filter="url(#sh)"><path d="M37 18h46l9 17-15 57H43L28 35z" fill="url(#r)" stroke="#6d0b1a" stroke-width="3"/><path d="m37 18 23 17 23-17" fill="none" stroke="#ffd1da" stroke-width="4" opacity=".7"/><path d="M28 35h64" stroke="#ff8799" stroke-width="3" opacity=".6"/></g></svg>`,
`<svg viewBox="0 0 120 120">${D}<g filter="url(#sh)"><path d="M24 92V40l12-12 8 8 16-18 16 18 8-8 12 12v52z" fill="url(#b)" stroke="#0c4368" stroke-width="3"/><path d="M42 92V66a18 18 0 0 1 36 0v26" fill="#0b1b27"/><rect x="54" y="18" width="12" height="24" rx="3" fill="#dff7ff" opacity=".55"/></g></svg>`,
`<svg viewBox="0 0 120 120">${D}<g filter="url(#sh)"><path d="M60 13 94 28v29c0 26-15 41-34 50-19-9-34-24-34-50V28z" fill="url(#s)" stroke="#394754" stroke-width="3"/><path d="M60 28v59M38 48h44" stroke="#eef7ff" stroke-width="6" opacity=".65"/></g></svg>`,
`<svg viewBox="0 0 120 120">${D}<g filter="url(#sh)"><circle cx="60" cy="60" r="43" fill="url(#g)" stroke="#694008" stroke-width="4"/><circle cx="60" cy="60" r="31" fill="#8a5310" opacity=".35"/><path d="m60 34 7 15 16 2-12 11 3 16-14-8-14 8 3-16-12-11 16-2z" fill="#fff0a8"/></g></svg>`,
`<svg viewBox="0 0 120 120">${D}<g filter="url(#sh)"><path d="M27 21h66v78H27z" rx="8" fill="#7f0c1c" stroke="#31050a" stroke-width="3"/><path d="M34 21h12v78H34z" fill="#b3152b"/><path d="M56 38h25M56 55h25M56 72h18" stroke="#f4c45a" stroke-width="6" stroke-linecap="round"/></g></svg>`
];
const weights=[15,12,13,14,14,12,11,9];
function pick(){let t=weights.reduce((a,b)=>a+b,0),r=Math.random()*t;for(let i=0;i<weights.length;i++){r-=weights[i];if(r<=0)return i}return 0}
const reels=$('reels'); let values=[];
function make(){values=Array.from({length:15},()=>pick());reels.innerHTML=values.map((v,i)=>`<div class="cell" data-i="${i}">${icons[v]}</div>`).join('')}
function render(){
 $('balance').textContent=fmt(S.balance);$('jackpot').textContent=fmt(S.jackpot);$('bet').textContent=fmt(S.bet);$('win').textContent=fmt(S.win);$('keys').textContent=`${S.keys}/3`;$('gateFill').style.width=`${S.keys/3*100}%`;$('freeCount').textContent=S.free;$('freePill').classList.toggle('show',S.free>0);$('turbo').classList.toggle('on',S.turbo);$('sound').classList.toggle('on',S.sound);$('auto').classList.toggle('on',S.auto>0);save();
}
function score(){
 const rows=[[0,1,2,3,4],[5,6,7,8,9],[10,11,12,13,14],[0,6,12,8,4],[10,6,2,8,14]];let win=0,w=[];
 rows.forEach((line,li)=>{const a=values[line[0]];let n=1;for(let k=1;k<5;k++){if(values[line[k]]===a)n++;else break}if(n>=3){const mult=[0,0,0,2,5,12][n];win+=S.bet*mult;w.push(...line.slice(0,n));document.querySelector(`.line.l${li+1}`)?.classList.add('show')}});
 if(w.length){[...new Set(w)].forEach(i=>reels.children[i].classList.add('win'));$('rig').classList.add('win');setTimeout(()=>{$('rig').classList.remove('win');document.querySelectorAll('.line').forEach(x=>x.classList.remove('show'))},1300)}
 return win;
}
function keyCount(){return values.filter(v=>v===2).length}
function setStatus(t){$('status').textContent=t}
async function spin(){
 if(S.spinning)return;if(!S.free&&S.balance<S.bet){setStatus('Za mało środków');return}S.spinning=true;$('spin').disabled=true;S.win=0;if(S.free>0)S.free--;else S.balance-=S.bet;render();setStatus('Bębny w ruchu…');
 const cells=[...document.querySelectorAll('.cell')];cells.forEach(c=>c.classList.add('spin'));const delay=S.turbo?210:520;
 await new Promise(r=>setTimeout(r,delay));
 values=Array.from({length:15},()=>pick());
 for(let col=0;col<5;col++){
   [col,col+5,col+10].forEach(i=>{reels.children[i].innerHTML=icons[values[i]];reels.children[i].classList.remove('spin')});
   if(!S.turbo)await new Promise(r=>setTimeout(r,75));
 }
 const keys=keyCount();if(keys){S.keys=Math.min(3,S.keys+Math.min(keys,2));setStatus(keys>=2?'Anticipation: klucze do bramy!':'Klucz do bramy zdobyty')}
 if(S.keys>=3){S.keys=0;S.free+=8;setStatus('GATE BONUS — 8 FREE SPINÓW')}
 const win=score();if(win>0){S.win=win;S.balance+=win;setStatus(`WYGRANA ${fmt(win)}`)}else if(!keys)setStatus(S.free>0?`Free spins: ${S.free}`:'Gotowy do kolejnego obrotu');
 S.jackpot+=Math.max(1,S.bet*.012);S.spinning=false;$('spin').disabled=false;render();
 if(S.auto>0){S.auto--;render();setTimeout(spin,S.turbo?300:850)}
}
$('spin').onclick=spin;$('betMinus').onclick=()=>{let i=bets.indexOf(S.bet);S.bet=bets[Math.max(0,i-1)];render()};$('betPlus').onclick=()=>{let i=bets.indexOf(S.bet);S.bet=bets[Math.min(bets.length-1,i+1)];render()};$('turbo').onclick=()=>{S.turbo=!S.turbo;render()};$('sound').onclick=()=>{S.sound=!S.sound;render()};$('auto').onclick=()=>{S.auto=S.auto?0:10;render();if(S.auto&&!S.spinning)spin()};
const canvas=$('fx'),ctx=canvas.getContext('2d');let sparks=[];function resize(){canvas.width=innerWidth*devicePixelRatio;canvas.height=innerHeight*devicePixelRatio;ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0)}resize();addEventListener('resize',resize);for(let i=0;i<42;i++)sparks.push({x:Math.random()*innerWidth,y:Math.random()*innerHeight,r:Math.random()*1.3+.2,v:Math.random()*.25+.08,a:Math.random()*.45+.08});function fx(){ctx.clearRect(0,0,innerWidth,innerHeight);for(const p of sparks){p.y-=p.v;if(p.y<-5){p.y=innerHeight+5;p.x=Math.random()*innerWidth}ctx.fillStyle=`rgba(245,198,95,${p.a})`;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill()}requestAnimationFrame(fx)}fx();
addEventListener('pointermove',e=>{document.documentElement.style.setProperty('--mx',`${(e.clientX-innerWidth/2)/20}px`);document.documentElement.style.setProperty('--my',`${(e.clientY-innerHeight/2)/20}px`)},{passive:true});
make();render();
})();
