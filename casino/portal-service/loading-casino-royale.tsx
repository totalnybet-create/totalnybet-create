const faces = ["front", "back", "right", "left", "top", "bottom"] as const;

function RoyaleLogoFace() {
  return (
    <div className="royale-logo" aria-hidden>
      <div className="royale-crown">♛</div>
      <div className="royale-crest"><span>S</span><span>R</span></div>
      <div className="royale-name">SIEDLAR</div>
      <div className="royale-sub">CASINO ROYALE</div>
      <div className="royale-rule"><i /><b>◆</b><i /></div>
      <div className="royale-social">SOCIAL CASINO</div>
      <div className="royale-suits"><span>♠</span><span className="red">♥</span><span>♣</span><span className="red">♦</span></div>
    </div>
  );
}

export default function Loading() {
  return (
    <div className="royale-loader" role="status" aria-label="Loading Siedlar Casino Royale">
      <div className="royale-ambient royale-ambient-a" aria-hidden />
      <div className="royale-ambient royale-ambient-b" aria-hidden />
      <div className="royale-floor" aria-hidden />

      <div className="royale-stage" aria-hidden>
        <div className="royale-float">
          <div className="royale-cube">
            {faces.map((face) => (
              <div key={face} className={`royale-face royale-face-${face}`}>
                <RoyaleLogoFace />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="royale-loading-copy">
        <div className="royale-loading-title">SIEDLAR CASINO ROYALE</div>
        <div className="royale-progress"><span /></div>
        <div className="royale-loading-small">PREPARING YOUR ROYAL EXPERIENCE</div>
      </div>

      <style>{`
        .royale-loader {
          --cube: clamp(152px, 40vw, 218px);
          position: relative;
          min-height: 100dvh;
          width: 100%;
          overflow: hidden;
          display: grid;
          place-items: center;
          background:
            radial-gradient(circle at 50% 36%, rgba(116,73,13,.22), transparent 28%),
            radial-gradient(circle at 50% 48%, rgba(214,159,48,.08), transparent 42%),
            linear-gradient(180deg, #070604 0%, #020202 52%, #000 100%);
          color: #f7e4a7;
          isolation: isolate;
        }
        .royale-ambient { position:absolute; border-radius:999px; filter:blur(60px); opacity:.34; pointer-events:none; }
        .royale-ambient-a { width:48vw; height:28vw; min-width:320px; min-height:190px; top:18%; left:12%; background:rgba(185,119,17,.18); animation:royale-drift-a 5s ease-in-out infinite alternate; }
        .royale-ambient-b { width:42vw; height:24vw; min-width:280px; min-height:170px; right:8%; bottom:22%; background:rgba(255,194,72,.10); animation:royale-drift-b 6s ease-in-out infinite alternate; }
        .royale-floor {
          position:absolute;
          left:50%; top:57%;
          width:min(68vw,560px); height:min(18vw,130px);
          transform:translate(-50%,-50%) rotateX(72deg);
          border-radius:50%;
          background:radial-gradient(ellipse, rgba(255,189,57,.23), rgba(167,97,9,.07) 36%, transparent 69%);
          filter:blur(10px);
        }
        .royale-stage { position:absolute; left:50%; top:44%; transform:translate(-50%,-50%); width:var(--cube); height:var(--cube); perspective:1000px; z-index:2; }
        .royale-float { width:100%; height:100%; transform-style:preserve-3d; animation:royale-float 2.8s ease-in-out infinite; }
        .royale-cube { position:relative; width:100%; height:100%; transform-style:preserve-3d; animation:royale-spin 7.5s linear infinite; filter:drop-shadow(0 0 28px rgba(226,161,42,.22)); }
        .royale-face {
          position:absolute;
          inset:0;
          overflow:hidden;
          display:grid;
          place-items:center;
          backface-visibility:hidden;
          border:2px solid rgba(255,207,99,.94);
          border-radius:11px;
          background:
            linear-gradient(135deg, rgba(255,225,139,.08), transparent 26%),
            radial-gradient(circle at 50% 24%, #211403 0%, #080604 40%, #010101 76%);
          box-shadow:
            inset 0 0 0 2px rgba(122,70,3,.7),
            inset 0 0 28px rgba(229,157,31,.13),
            0 0 16px rgba(245,180,58,.16);
        }
        .royale-face::after { content:""; position:absolute; inset:-40% -70%; background:linear-gradient(105deg, transparent 40%, rgba(255,242,188,.16) 49%, transparent 57%); transform:translateX(-40%) rotate(8deg); animation:royale-sheen 3.2s ease-in-out infinite; }
        .royale-face-front { transform:rotateY(0deg) translateZ(calc(var(--cube) / 2)); }
        .royale-face-back { transform:rotateY(180deg) translateZ(calc(var(--cube) / 2)); }
        .royale-face-right { transform:rotateY(90deg) translateZ(calc(var(--cube) / 2)); }
        .royale-face-left { transform:rotateY(-90deg) translateZ(calc(var(--cube) / 2)); }
        .royale-face-top { transform:rotateX(90deg) translateZ(calc(var(--cube) / 2)); }
        .royale-face-bottom { transform:rotateX(-90deg) translateZ(calc(var(--cube) / 2)); }
        .royale-logo { width:88%; text-align:center; font-family:Georgia,"Times New Roman",serif; transform:translateZ(2px); text-shadow:0 2px 2px #000,0 0 10px rgba(229,167,51,.22); }
        .royale-crown { height:22px; font-size:25px; line-height:20px; color:#e9b64d; filter:drop-shadow(0 1px 1px #000); }
        .royale-crest { margin:1px auto 2px; width:42px; height:42px; border:1.5px solid #e8b64c; border-radius:50%; display:flex; align-items:center; justify-content:center; position:relative; box-shadow:0 0 8px rgba(235,177,62,.18); }
        .royale-crest span { color:#f0c66d; font-size:25px; font-weight:700; line-height:1; font-style:italic; }
        .royale-crest span+span { margin-left:-8px; transform:translateY(4px); font-size:21px; }
        .royale-name { margin-top:2px; font-size:clamp(20px,5.4vw,30px); line-height:.95; letter-spacing:.015em; font-weight:700; background:linear-gradient(180deg,#fff0b5 0%,#d59a2f 47%,#7d4807 100%); -webkit-background-clip:text; background-clip:text; color:transparent; }
        .royale-sub { margin-top:5px; color:#f4ead1; font-size:clamp(9px,2.55vw,13px); letter-spacing:.11em; }
        .royale-rule { margin:5px auto 3px; width:82%; display:flex; align-items:center; gap:5px; color:#d79c31; font-size:6px; }
        .royale-rule i { height:1px; flex:1; background:linear-gradient(90deg,transparent,#c98a24); }
        .royale-rule i:last-child { background:linear-gradient(90deg,#c98a24,transparent); }
        .royale-rule b { font-size:6px; }
        .royale-social { color:#d4a54a; font:600 clamp(5px,1.55vw,7px)/1.2 Arial,sans-serif; letter-spacing:.32em; }
        .royale-suits { margin-top:5px; display:flex; justify-content:center; gap:6px; font-size:11px; color:#d9ad4e; }
        .royale-suits .red { color:#b01e17; text-shadow:0 0 6px rgba(220,42,31,.25); }
        .royale-loading-copy { position:absolute; left:50%; top:73%; width:min(76vw,360px); transform:translateX(-50%); text-align:center; z-index:3; }
        .royale-loading-title { font-family:Georgia,"Times New Roman",serif; font-size:clamp(14px,3.9vw,18px); letter-spacing:.12em; color:#eed08a; text-shadow:0 0 18px rgba(231,173,59,.2); }
        .royale-progress { margin:15px auto 11px; position:relative; width:min(68vw,310px); height:2px; overflow:hidden; background:linear-gradient(90deg,transparent,rgba(155,102,24,.5),transparent); }
        .royale-progress span { position:absolute; top:0; bottom:0; width:42%; left:-42%; background:linear-gradient(90deg,transparent,#fff0ae 52%,#d4972d 80%,transparent); box-shadow:0 0 12px #e2ad49; animation:royale-progress 1.7s ease-in-out infinite; }
        .royale-loading-small { color:#9b7b43; font:700 8px/1.4 Arial,sans-serif; letter-spacing:.24em; }
        @keyframes royale-spin {
          0% { transform:rotateX(-16deg) rotateY(0deg) rotateZ(2deg); }
          25% { transform:rotateX(74deg) rotateY(180deg) rotateZ(-2deg); }
          50% { transform:rotateX(164deg) rotateY(360deg) rotateZ(2deg); }
          75% { transform:rotateX(254deg) rotateY(540deg) rotateZ(-2deg); }
          100% { transform:rotateX(344deg) rotateY(720deg) rotateZ(2deg); }
        }
        @keyframes royale-float { 0%,100% { transform:translate3d(0,10px,0) scale(.97); } 50% { transform:translate3d(0,-14px,0) scale(1.02); } }
        @keyframes royale-progress { 0% { left:-42%; } 100% { left:100%; } }
        @keyframes royale-sheen { 0%,35% { transform:translateX(-65%) rotate(8deg); opacity:0; } 55% { opacity:1; } 85%,100% { transform:translateX(65%) rotate(8deg); opacity:0; } }
        @keyframes royale-drift-a { to { transform:translate(9%,6%) scale(1.12); } }
        @keyframes royale-drift-b { to { transform:translate(-8%,-5%) scale(1.08); } }
        @media (max-height:680px) { .royale-stage { top:41%; --cube:clamp(132px,34vw,176px); } .royale-loading-copy { top:72%; } }
        @media (prefers-reduced-motion:reduce) { .royale-cube { animation-duration:18s; } .royale-float,.royale-ambient,.royale-face::after { animation:none; } }
      `}</style>
    </div>
  );
}
