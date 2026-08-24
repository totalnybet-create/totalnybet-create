(() => {
  'use strict';

  const PhaserRef = window.Phaser;
  if (!PhaserRef) {
    document.getElementById('loading-text').textContent = 'Błąd silnika gry';
    throw new Error('Phaser failed to load');
  }

  const VIEW_W = 900;
  const VIEW_H = 930;
  const REELS = 5;
  const ROWS = 3;
  const POOL_ROWS = 5;
  const CELL = 156;
  const GAP = 10;
  const REEL_W = CELL;
  const GRID_W = REELS * CELL + (REELS - 1) * GAP;
  const GRID_H = ROWS * CELL + (ROWS - 1) * GAP;
  const GRID_X = (VIEW_W - GRID_W) / 2;
  const GRID_Y = 206;

  const SYMBOLS = [
    'crown_red',
    'crown_blue',
    'crown_green',
    'crown_gold',
    'crown_silver',
    'crown_black',
    'crown_ice',
    'diamond_goblin',
    'king',
    'wild'
  ];

  const FRAME = {
    crown_red: 0,
    crown_blue: 1,
    crown_green: 2,
    crown_gold: 3,
    crown_silver: 4,
    crown_black: 5,
    crown_ice: 6,
    diamond_goblin: 7,
    king: 8,
    wild: 9,
    ice_throne: 10
  };

  const SYMBOL_META = {
    crown_red:      { label: 'RUBINOWA KORONA', weight: 18, pay: [0, 0, 1.0, 2.5, 7.0] },
    crown_blue:     { label: 'SZAFIROWA KORONA', weight: 18, pay: [0, 0, 1.0, 2.5, 7.0] },
    crown_green:    { label: 'SZMARAGDOWA KORONA', weight: 17, pay: [0, 0, 1.2, 3.0, 8.0] },
    crown_gold:     { label: 'ZŁOTA KORONA', weight: 15, pay: [0, 0, 1.5, 4.0, 10.0] },
    crown_silver:   { label: 'SREBRNA KORONA', weight: 14, pay: [0, 0, 1.8, 5.0, 12.0] },
    crown_black:    { label: 'CZARNA KORONA', weight: 12, pay: [0, 0, 2.2, 6.0, 16.0] },
    crown_ice:      { label: 'LODOWA KORONA', weight: 10, pay: [0, 0, 3.0, 8.0, 22.0] },
    diamond_goblin: { label: 'SKARBONOSZ', weight: 8, pay: [0, 0, 4.0, 12.0, 35.0], scatter: true },
    king:           { label: 'KRÓL', weight: 6, pay: [0, 0, 6.0, 18.0, 55.0] },
    wild:           { label: 'WILD', weight: 5, pay: [0, 0, 8.0, 25.0, 80.0], wild: true }
  };

  const PAYLINES = [
    [1,1,1,1,1],
    [0,0,0,0,0],
    [2,2,2,2,2],
    [0,1,2,1,0],
    [2,1,0,1,2],
    [0,0,1,2,2],
    [2,2,1,0,0],
    [1,0,0,0,1],
    [1,2,2,2,1],
    [0,1,1,1,0]
  ];

  const state = {
    balance: 1000,
    bet: 1,
    win: 0,
    spinning: false,
    turbo: false,
    sound: true,
    freeSpins: 0,
    lastMatrix: null,
    currentScene: null
  };

  const ui = {
    balance: document.getElementById('balance'),
    win: document.getElementById('win'),
    bet: document.getElementById('bet'),
    status: document.getElementById('status'),
    freeSpins: document.getElementById('free-spins'),
    spin: document.getElementById('spin'),
    betDown: document.getElementById('bet-down'),
    betUp: document.getElementById('bet-up'),
    turbo: document.getElementById('turbo'),
    sound: document.getElementById('sound'),
    winBanner: document.getElementById('win-banner'),
    winLabel: document.getElementById('win-label'),
    winAmount: document.getElementById('win-amount'),
    loading: document.getElementById('loading-screen'),
    loadingProgress: document.getElementById('loading-progress'),
    loadingText: document.getElementById('loading-text')
  };

  const fmt = (value) => Number(value).toLocaleString('pl-PL', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  function syncUi() {
    ui.balance.textContent = fmt(state.balance);
    ui.win.textContent = fmt(state.win);
    ui.bet.textContent = fmt(state.bet);
    ui.spin.disabled = state.spinning || (state.balance < state.bet && state.freeSpins <= 0);
    ui.betDown.disabled = state.spinning;
    ui.betUp.disabled = state.spinning;
    ui.freeSpins.textContent = state.freeSpins > 0 ? `FREE SPINS: ${state.freeSpins}` : '';
    ui.turbo.setAttribute('aria-pressed', String(state.turbo));
    ui.sound.setAttribute('aria-pressed', String(state.sound));
  }

  function weightedSymbol() {
    let total = 0;
    for (const key of SYMBOLS) total += SYMBOL_META[key].weight;
    let roll = Math.random() * total;
    for (const key of SYMBOLS) {
      roll -= SYMBOL_META[key].weight;
      if (roll <= 0) return key;
    }
    return SYMBOLS[0];
  }

  function generateMatrix() {
    const matrix = [];
    for (let reel = 0; reel < REELS; reel += 1) {
      const col = [];
      for (let row = 0; row < ROWS; row += 1) col.push(weightedSymbol());
      matrix.push(col);
    }
    return matrix;
  }

  function evaluate(matrix, bet) {
    const wins = [];
    let total = 0;
    PAYLINES.forEach((line, lineIndex) => {
      const symbols = line.map((row, reel) => matrix[reel][row]);
      let base = symbols[0];
      if (SYMBOL_META[base].wild) {
        base = symbols.find((s) => !SYMBOL_META[s].wild && !SYMBOL_META[s].scatter) || 'wild';
      }
      if (SYMBOL_META[base].scatter) return;
      let count = 0;
      const cells = [];
      for (let reel = 0; reel < REELS; reel += 1) {
        const s = symbols[reel];
        if (s === base || SYMBOL_META[s].wild) {
          count += 1;
          cells.push({ reel, row: line[reel] });
        } else break;
      }
      if (count >= 3) {
        const multi = SYMBOL_META[base].pay[count - 1] || 0;
        const amount = bet * multi / PAYLINES.length;
        if (amount > 0) {
          total += amount;
          wins.push({ type: 'line', lineIndex, symbol: base, count, amount, cells });
        }
      }
    });

    let scatterCount = 0;
    const scatterCells = [];
    for (let reel = 0; reel < REELS; reel += 1) {
      for (let row = 0; row < ROWS; row += 1) {
        if (SYMBOL_META[matrix[reel][row]].scatter) {
          scatterCount += 1;
          scatterCells.push({ reel, row });
        }
      }
    }
    let awardedFreeSpins = 0;
    if (scatterCount >= 3) {
      const scatterPays = { 3: 2, 4: 10, 5: 40 };
      const amount = bet * (scatterPays[Math.min(5, scatterCount)] || 0);
      total += amount;
      awardedFreeSpins = scatterCount === 3 ? 8 : scatterCount === 4 ? 12 : 18;
      wins.push({ type: 'scatter', symbol: 'diamond_goblin', count: scatterCount, amount, cells: scatterCells });
    }

    return { total, wins, awardedFreeSpins };
  }

  class Reel {
    constructor(scene, reelIndex, x, y) {
      this.scene = scene;
      this.reelIndex = reelIndex;
      this.x = x;
      this.y = y;
      this.running = false;
      this.speed = 0;
      this.targetSpeed = 0;
      this.sprites = [];
      this.poolTop = -CELL - GAP;
      this.poolBottom = (ROWS + 1) * (CELL + GAP);

      const frame = scene.add.graphics();
      frame.lineStyle(2, 0xc9963d, 0.5);
      frame.fillStyle(0x0a0710, 0.92);
      frame.fillRoundedRect(x, y, CELL, GRID_H, 10);
      frame.strokeRoundedRect(x, y, CELL, GRID_H, 10);

      for (let i = 0; i < POOL_ROWS; i += 1) {
        const sy = y + (i - 1) * (CELL + GAP) + CELL / 2;
        const initialKey = weightedSymbol();
        const sprite = scene.add.image(x + CELL / 2, sy, 'symbols', FRAME[initialKey]);
        sprite.setDisplaySize(CELL * 0.86, CELL * 0.86);
        sprite.setData('slotRow', i - 1);
        sprite.setData('symbolKey', initialKey);
        this.sprites.push(sprite);
      }
    }

    start() {
      this.running = true;
      this.speed = 240;
      this.targetSpeed = state.turbo ? 2800 : 1900;
      for (const sprite of this.sprites) {
        sprite.setAlpha(0.82);
        sprite.setScale(1, 1.08);
      }
    }

    update(delta) {
      if (!this.running) return;
      const accel = this.speed < this.targetSpeed ? 14 : 4;
      this.speed += (this.targetSpeed - this.speed) * Math.min(1, accel * delta / 1000);
      const movement = this.speed * delta / 1000;
      const step = CELL + GAP;
      const bottomY = this.y + (ROWS + 1) * step + CELL / 2;
      for (const sprite of this.sprites) {
        sprite.y += movement;
        if (sprite.y > bottomY) {
          sprite.y -= POOL_ROWS * step;
          const key = weightedSymbol();
          sprite.setFrame(FRAME[key]);
          sprite.setData('symbolKey', key);
        }
      }
      const stretch = PhaserRef.Math.Clamp(this.speed / 1700, 0, 1);
      for (const sprite of this.sprites) {
        sprite.setScale(1 - stretch * 0.035, 1 + stretch * 0.18);
        sprite.setAlpha(1 - stretch * 0.23);
      }
    }

    stop(resultColumn, duration = 260) {
      this.running = false;
      this.speed = 0;
      const step = CELL + GAP;
      const sorted = [...this.sprites].sort((a, b) => a.y - b.y);
      const targetRows = [-1, 0, 1, 2, 3];
      sorted.forEach((sprite, index) => {
        const row = targetRows[index];
        const key = row >= 0 && row < ROWS ? resultColumn[row] : weightedSymbol();
        sprite.setFrame(FRAME[key]);
        sprite.setData('symbolKey', key);
        sprite.setAlpha(1);
        sprite.setScale(1);
        sprite.setDepth(2);
        const targetY = this.y + row * step + CELL / 2;
        this.scene.tweens.add({
          targets: sprite,
          y: targetY,
          scaleX: 1,
          scaleY: 1,
          alpha: 1,
          duration,
          ease: 'Back.Out',
          easeParams: [1.2]
        });
      });
    }

    visibleSprite(row) {
      const targetY = this.y + row * (CELL + GAP) + CELL / 2;
      let best = null;
      let dist = Infinity;
      for (const sprite of this.sprites) {
        const d = Math.abs(sprite.y - targetY);
        if (d < dist) { best = sprite; dist = d; }
      }
      return best;
    }
  }

  class SlotScene extends PhaserRef.Scene {
    constructor() { super('slot'); }

    preload() {
      this.load.spritesheet('symbols', 'assets/symbols/symbols-atlas.webp', { frameWidth: 128, frameHeight: 128, endFrame: 11 });
      this.load.on('progress', (value) => {
        const pct = Math.round(value * 100);
        ui.loadingProgress.style.width = `${pct}%`;
        ui.loadingText.textContent = `Ładowanie ${pct}%`;
      });
      this.load.on('complete', () => {
        ui.loadingProgress.style.width = '100%';
        ui.loadingText.textContent = 'Gotowe';
        setTimeout(() => ui.loading.classList.add('done'), 220);
      });
    }

    create() {
      state.currentScene = this;
      this.reels = [];
      this.winCells = [];

      this.cameras.main.setBackgroundColor('rgba(0,0,0,0)');
      this.createBackdrop();
      this.createReels();
      this.createPaylineLayer();
      this.createSparkLayer();
      this.input.on('pointerdown', () => {});
      syncUi();
      ui.status.textContent = 'GOTOWY — 10 LINII';
    }

    createBackdrop() {
      const g = this.add.graphics();
      g.fillGradientStyle(0x1f1129, 0x160d1f, 0x09070e, 0x09070e, 1);
      g.fillRoundedRect(18, 18, VIEW_W - 36, VIEW_H - 36, 26);
      g.lineStyle(3, 0x8f6125, 0.75);
      g.strokeRoundedRect(18, 18, VIEW_W - 36, VIEW_H - 36, 26);

      const title = this.add.text(VIEW_W / 2, 70, 'KORONA • SKARB • WŁADZA', {
        fontFamily: 'Georgia, serif',
        fontSize: '22px',
        color: '#f1d58e',
        letterSpacing: 4,
        stroke: '#160b05',
        strokeThickness: 5
      }).setOrigin(0.5);
      title.setShadow(0, 2, '#000000', 8, true, true);

      this.add.text(VIEW_W / 2, 112, '5 × 3  •  10 PAYLINES  •  HIGH VOLATILITY', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '12px',
        color: '#9e8768',
        letterSpacing: 2
      }).setOrigin(0.5);

      for (let i = 0; i < 14; i += 1) {
        const x = 48 + i * 62;
        const light = this.add.circle(x, 158, 5, 0xf9d17a, 0.75);
        light.setBlendMode(PhaserRef.BlendModes.ADD);
        this.tweens.add({ targets: light, alpha: { from: 0.35, to: 1 }, scale: { from: 0.8, to: 1.15 }, duration: 900 + i * 43, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
      }

      const floor = this.add.graphics();
      floor.fillStyle(0x100b12, 0.96);
      floor.fillRoundedRect(GRID_X - 12, GRID_Y - 12, GRID_W + 24, GRID_H + 24, 18);
      floor.lineStyle(4, 0xb57b2e, 0.65);
      floor.strokeRoundedRect(GRID_X - 12, GRID_Y - 12, GRID_W + 24, GRID_H + 24, 18);
    }

    createReels() {
      for (let i = 0; i < REELS; i += 1) {
        const x = GRID_X + i * (CELL + GAP);
        const reel = new Reel(this, i, x, GRID_Y);
        this.reels.push(reel);
      }

      const fg = this.add.graphics().setDepth(6);
      fg.lineStyle(2, 0xf0c86b, 0.35);
      for (let i = 1; i < REELS; i += 1) {
        const x = GRID_X + i * CELL + (i - 0.5) * GAP;
        fg.lineBetween(x, GRID_Y + 6, x, GRID_Y + GRID_H - 6);
      }
      for (let r = 1; r < ROWS; r += 1) {
        const y = GRID_Y + r * CELL + (r - 0.5) * GAP;
        fg.lineBetween(GRID_X + 6, y, GRID_X + GRID_W - 6, y);
      }
    }

    createPaylineLayer() {
      this.paylineGraphics = this.add.graphics().setDepth(12);
    }

    createSparkLayer() {
      this.sparkGraphics = this.add.graphics().setDepth(15);
      this.sparkTimer = this.time.addEvent({
        delay: 180,
        loop: true,
        callback: () => {
          if (state.spinning || Math.random() > 0.55) return;
          const x = PhaserRef.Math.Between(35, VIEW_W - 35);
          const y = PhaserRef.Math.Between(40, VIEW_H - 45);
          const dot = this.add.circle(x, y, PhaserRef.Math.Between(1, 3), 0xf9d17a, 0.7).setDepth(14).setBlendMode(PhaserRef.BlendModes.ADD);
          this.tweens.add({ targets: dot, y: y - PhaserRef.Math.Between(18, 52), alpha: 0, scale: 0.2, duration: PhaserRef.Math.Between(500, 1000), onComplete: () => dot.destroy() });
        }
      });
    }

    update(_time, delta) {
      for (const reel of this.reels) reel.update(delta);
    }

    clearWins() {
      this.paylineGraphics.clear();
      for (const sprite of this.winCells) {
        if (!sprite || !sprite.active) continue;
        this.tweens.killTweensOf(sprite);
        sprite.clearTint();
        sprite.setScale(1);
      }
      this.winCells.length = 0;
      ui.winBanner.classList.remove('show');
    }

    async spin() {
      if (state.spinning) return;
      const freeSpin = state.freeSpins > 0;
      if (!freeSpin && state.balance < state.bet) {
        ui.status.textContent = 'ZA MAŁO ŚRODKÓW';
        return;
      }

      this.clearWins();
      state.spinning = true;
      state.win = 0;
      if (freeSpin) state.freeSpins -= 1;
      else state.balance = Math.max(0, state.balance - state.bet);
      syncUi();
      ui.status.textContent = freeSpin ? 'FREE SPIN' : (state.turbo ? 'TURBO SPIN' : 'SPIN');

      const matrix = generateMatrix();
      state.lastMatrix = matrix;
      for (const reel of this.reels) reel.start();

      const baseSpin = state.turbo ? 300 : 760;
      const stagger = state.turbo ? 62 : 135;
      const stopDuration = state.turbo ? 120 : 270;

      await this.wait(baseSpin);
      for (let i = 0; i < REELS; i += 1) {
        this.reels[i].stop(matrix[i], stopDuration);
        if (!state.turbo) this.cameraKick(i);
        await this.wait(stagger);
      }
      await this.wait(stopDuration + 70);

      const result = evaluate(matrix, state.bet);
      state.win = Number(result.total.toFixed(2));
      if (state.win > 0) state.balance += state.win;
      if (result.awardedFreeSpins > 0) state.freeSpins += result.awardedFreeSpins;
      syncUi();

      if (result.wins.length) {
        this.showWins(result);
      } else {
        ui.status.textContent = state.freeSpins > 0 ? 'BONUS TRWA' : 'SPRÓBUJ PONOWNIE';
      }

      state.spinning = false;
      syncUi();

      if (state.freeSpins > 0 && freeSpin) {
        this.time.delayedCall(state.turbo ? 380 : 900, () => this.spin());
      }
    }

    cameraKick(reelIndex) {
      if (reelIndex === REELS - 1) this.cameras.main.shake(55, 0.0018);
    }

    showWins(result) {
      const allCells = new Map();
      for (const win of result.wins) {
        for (const cell of win.cells) allCells.set(`${cell.reel}:${cell.row}`, cell);
      }
      for (const cell of allCells.values()) {
        const sprite = this.reels[cell.reel].visibleSprite(cell.row);
        if (!sprite) continue;
        this.winCells.push(sprite);
        sprite.setTint(0xffedaf);
        this.tweens.add({ targets: sprite, scaleX: 1.08, scaleY: 1.08, duration: 330, yoyo: true, repeat: 3, ease: 'Sine.InOut' });
      }

      const lineWin = result.wins.find((w) => w.type === 'line');
      if (lineWin) this.drawPayline(PAYLINES[lineWin.lineIndex]);

      const ratio = state.win / Math.max(0.01, state.bet);
      ui.winLabel.textContent = ratio >= 25 ? 'MEGA WIN' : ratio >= 10 ? 'BIG WIN' : 'WYGRANA';
      ui.winAmount.textContent = fmt(state.win);
      ui.winBanner.classList.add('show');
      ui.status.textContent = result.awardedFreeSpins > 0 ? `BONUS +${result.awardedFreeSpins} FREE SPINS` : `${ui.winLabel.textContent} × ${fmt(ratio)}`;
      if (ratio >= 10) this.cameras.main.flash(180, 255, 213, 122, false);
      this.time.delayedCall(state.turbo ? 480 : 1100, () => ui.winBanner.classList.remove('show'));
    }

    drawPayline(line) {
      this.paylineGraphics.clear();
      this.paylineGraphics.lineStyle(5, 0xffd66f, 0.8);
      this.paylineGraphics.beginPath();
      line.forEach((row, reel) => {
        const x = GRID_X + reel * (CELL + GAP) + CELL / 2;
        const y = GRID_Y + row * (CELL + GAP) + CELL / 2;
        if (reel === 0) this.paylineGraphics.moveTo(x, y);
        else this.paylineGraphics.lineTo(x, y);
      });
      this.paylineGraphics.strokePath();
      this.tweens.add({ targets: this.paylineGraphics, alpha: { from: 1, to: .25 }, duration: 360, yoyo: true, repeat: 2 });
    }

    wait(ms) {
      return new Promise((resolve) => this.time.delayedCall(ms, resolve));
    }
  }

  const game = new PhaserRef.Game({
    type: PhaserRef.WEBGL,
    parent: 'canvas-host',
    width: VIEW_W,
    height: VIEW_H,
    transparent: true,
    antialias: true,
    roundPixels: true,
    powerPreference: 'high-performance',
    render: {
      antialias: true,
      pixelArt: false,
      roundPixels: true,
      transparent: true,
      powerPreference: 'high-performance',
      batchSize: 2048
    },
    scale: {
      mode: PhaserRef.Scale.FIT,
      autoCenter: PhaserRef.Scale.CENTER_BOTH,
      width: VIEW_W,
      height: VIEW_H
    },
    scene: [SlotScene]
  });

  function requestSpin() {
    if (state.currentScene) state.currentScene.spin();
  }

  ui.spin.addEventListener('click', requestSpin);
  ui.betDown.addEventListener('click', () => {
    if (state.spinning) return;
    state.bet = Math.max(0.2, Number((state.bet - 0.2).toFixed(2)));
    syncUi();
  });
  ui.betUp.addEventListener('click', () => {
    if (state.spinning) return;
    state.bet = Math.min(20, Number((state.bet + 0.2).toFixed(2)));
    syncUi();
  });
  ui.turbo.addEventListener('click', () => {
    state.turbo = !state.turbo;
    syncUi();
    ui.status.textContent = state.turbo ? 'TURBO WŁĄCZONE' : 'TURBO WYŁĄCZONE';
  });
  ui.sound.addEventListener('click', () => {
    state.sound = !state.sound;
    if (game.sound) game.sound.mute = !state.sound;
    syncUi();
  });

  window.addEventListener('keydown', (event) => {
    if (event.code === 'Space') {
      event.preventDefault();
      requestSpin();
    }
  }, { passive: false });

  window.addEventListener('visibilitychange', () => {
    if (document.hidden && game.loop) game.loop.sleep();
    else if (game.loop) game.loop.wake();
  });

  syncUi();
})();
