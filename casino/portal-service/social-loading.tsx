const LOGO_SRC = "data:image/webp;base64,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[... ELLIPSIZATION ...]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";

const faces = [
  ["front", "Przód"],
  ["back", "Tył"],
  ["right", "Prawa strona"],
  ["left", "Lewa strona"],
  ["top", "Góra"],
  ["bottom", "Dół"],
] as const;

export default function Loading() {
  return (
    <main
      className="siedlar-loader"
      role="status"
      aria-label="Ładowanie Siedlar Casino Royale"
    >
      <div className="siedlar-aura siedlar-aura-one" aria-hidden />
      <div className="siedlar-aura siedlar-aura-two" aria-hidden />

      <div className="siedlar-stage" aria-hidden>
        <div className="siedlar-float">
          <div className="siedlar-cube">
            {faces.map(([face, label]) => (
              <div className={`siedlar-face siedlar-${face}`} key={face}>
                <img src={LOGO_SRC} alt={label} draggable={false} />
                <span className="siedlar-face-gloss" />
              </div>
            ))}
          </div>
        </div>
        <div className="siedlar-shadow" />
      </div>

      <div className="siedlar-loading-copy" aria-hidden>
        <span>SIEDLAR CASINO ROYALE</span>
        <i />
      </div>

      <style>{`
        .siedlar-loader {
          --cube: clamp(168px, 44vw, 232px);
          --half: calc(var(--cube) / 2);
          min-height: 100dvh;
          position: relative;
          display: grid;
          place-items: center;
          overflow: hidden;
          background:
            radial-gradient(circle at 50% 37%, rgba(219, 169, 62, .18), transparent 25%),
            radial-gradient(circle at 50% 55%, rgba(103, 72, 17, .12), transparent 40%),
            linear-gradient(180deg, #070604 0%, #020202 55%, #000 100%);
          isolation: isolate;
        }

        .siedlar-loader::before {
          content: "";
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,.018) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.018) 1px, transparent 1px);
          background-size: 42px 42px;
          mask-image: radial-gradient(circle at 50% 45%, black, transparent 68%);
          opacity: .45;
        }

        .siedlar-aura {
          position: absolute;
          border-radius: 999px;
          filter: blur(55px);
          pointer-events: none;
        }

        .siedlar-aura-one {
          width: min(78vw, 720px);
          height: min(38vw, 340px);
          background: rgba(189, 126, 24, .13);
          top: 19%;
          animation: siedlarAura 4.6s ease-in-out infinite;
        }

        .siedlar-aura-two {
          width: min(52vw, 480px);
          height: min(52vw, 480px);
          background: rgba(255, 205, 96, .055);
          bottom: -20%;
          animation: siedlarAura 6s ease-in-out -1.4s infinite;
        }

        .siedlar-stage {
          width: min(82vw, 520px);
          height: min(62vh, 500px);
          display: grid;
          place-items: center;
          perspective: 1100px;
          perspective-origin: 50% 42%;
          transform: translateY(-2.5vh);
        }

        .siedlar-float {
          width: var(--cube);
          height: var(--cube);
          position: relative;
          transform-style: preserve-3d;
          animation: siedlarFloat 2.8s ease-in-out infinite;
        }

        .siedlar-cube {
          position: absolute;
          inset: 0;
          transform-style: preserve-3d;
          animation: siedlarSpin 5.8s linear infinite;
        }

        .siedlar-face {
          position: absolute;
          inset: 0;
          overflow: hidden;
          background: #050403;
          border: 1px solid rgba(255, 215, 128, .82);
          box-shadow:
            inset 0 0 16px rgba(255, 220, 145, .12),
            inset 0 0 36px rgba(0, 0, 0, .72),
            0 0 18px rgba(220, 158, 42, .24);
          backface-visibility: hidden;
        }

        .siedlar-face img {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
          user-select: none;
          -webkit-user-drag: none;
          filter: contrast(1.03) saturate(1.04);
        }

        .siedlar-face-gloss {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background:
            linear-gradient(120deg, transparent 15%, rgba(255,255,255,.13) 37%, transparent 55%),
            linear-gradient(180deg, rgba(255, 221, 150, .08), transparent 34%, rgba(0,0,0,.28));
          mix-blend-mode: screen;
        }

        .siedlar-front  { transform: rotateY(0deg) translateZ(var(--half)); }
        .siedlar-back   { transform: rotateY(180deg) translateZ(var(--half)); }
        .siedlar-right  { transform: rotateY(90deg) translateZ(var(--half)); }
        .siedlar-left   { transform: rotateY(-90deg) translateZ(var(--half)); }
        .siedlar-top    { transform: rotateX(90deg) translateZ(var(--half)); }
        .siedlar-bottom { transform: rotateX(-90deg) translateZ(var(--half)); }

        .siedlar-shadow {
          position: absolute;
          width: calc(var(--cube) * 1.25);
          height: calc(var(--cube) * .23);
          left: 50%;
          top: calc(50% + var(--cube) * .78);
          transform: translate(-50%, -50%) rotateX(72deg);
          border-radius: 50%;
          background: radial-gradient(ellipse, rgba(212, 154, 46, .34) 0%, rgba(79, 49, 9, .2) 35%, transparent 72%);
          filter: blur(11px);
          animation: siedlarShadow 2.8s ease-in-out infinite;
        }

        .siedlar-loading-copy {
          position: absolute;
          left: 50%;
          bottom: max(7vh, 38px);
          transform: translateX(-50%);
          width: min(76vw, 420px);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 14px;
          color: #d9b35b;
          font-family: Georgia, "Times New Roman", serif;
          font-size: clamp(10px, 2.6vw, 12px);
          font-weight: 700;
          letter-spacing: .34em;
          text-align: center;
          text-shadow: 0 0 16px rgba(218, 167, 59, .28);
          white-space: nowrap;
        }

        .siedlar-loading-copy i {
          display: block;
          position: relative;
          width: min(56vw, 270px);
          height: 2px;
          overflow: hidden;
          border-radius: 99px;
          background: rgba(255, 224, 157, .09);
        }

        .siedlar-loading-copy i::after {
          content: "";
          position: absolute;
          inset: 0;
          width: 42%;
          background: linear-gradient(90deg, transparent, #e8bb57, #fff0bb, #e8bb57, transparent);
          filter: drop-shadow(0 0 7px rgba(236, 185, 77, .8));
          animation: siedlarSweep 1.55s ease-in-out infinite;
        }

        @keyframes siedlarSpin {
          0%   { transform: rotateX(-14deg) rotateY(0deg) rotateZ(-3deg); }
          25%  { transform: rotateX(82deg) rotateY(90deg) rotateZ(2deg); }
          50%  { transform: rotateX(174deg) rotateY(180deg) rotateZ(5deg); }
          75%  { transform: rotateX(266deg) rotateY(270deg) rotateZ(1deg); }
          100% { transform: rotateX(346deg) rotateY(360deg) rotateZ(-3deg); }
        }

        @keyframes siedlarFloat {
          0%, 100% { transform: translateY(-13px) rotateZ(-1deg); }
          50%      { transform: translateY(15px) rotateZ(1deg); }
        }

        @keyframes siedlarShadow {
          0%, 100% { opacity: .44; transform: translate(-50%, -50%) rotateX(72deg) scale(.78); }
          50%      { opacity: .76; transform: translate(-50%, -50%) rotateX(72deg) scale(1.05); }
        }

        @keyframes siedlarAura {
          0%, 100% { opacity: .62; transform: scale(.88); }
          50%      { opacity: 1; transform: scale(1.12); }
        }

        @keyframes siedlarSweep {
          0%   { transform: translateX(-135%); opacity: 0; }
          20%  { opacity: 1; }
          80%  { opacity: 1; }
          100% { transform: translateX(340%); opacity: 0; }
        }

        @media (max-height: 650px) {
          .siedlar-loader { --cube: clamp(142px, 34vh, 188px); }
          .siedlar-stage { transform: translateY(-1vh); }
          .siedlar-loading-copy { bottom: 24px; }
        }

        @media (prefers-reduced-motion: reduce) {
          .siedlar-cube {
            animation-duration: 16s;
          }
          .siedlar-float, .siedlar-shadow, .siedlar-aura, .siedlar-loading-copy i::after {
            animation: none;
          }
        }
      `}</style>
    </main>
  );
}
