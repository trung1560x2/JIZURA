/* JIZURA pack: kda — K/DA (Riot Games) inspired Motion & Style Pack
   Cyberpunk K-Pop Aesthetics: Neon Fuchsia, Laser Cyan, Deep Void, Crystal Shards, Diamond HUD
*/
(() => {
'use strict';

const E = J.E;
const PK = 'kda';
const DEG = J.DEG;
const TAU = J.TAU;

const U = env => Math.min(env.W, env.H) / 1080;
const inE = (env, d = 0.4, delay = 0, ease = E.outExpo) => ease(J.clamp((env.lt - delay) / d));
const outE = env => 1 - E.inCubic(env.pOut);

/* ============================================================
   1. K/DA STYLE PACK REGISTRATION
   ============================================================ */
const kdaStyle = {
  name: 'K/DA (Riot Games)',
  desc: 'Neon Fuchsia × Laser Cyan × Deep Void • Mảnh vỡ pha lê kim cương • Cyberpunk Pop',
  moods: ['graphic', 'pop', 'glitch'],
  schemes: [
    // Scheme 1: POP/STARS (Ahri & Akali neon night)
    {
      bg: '#0A0618',
      fg: '#FFFFFF',
      sub: '#0DF0B0',       // Akali hot aqua / cyan
      accent: '#FF0055',    // Ahri neon fuchsia
      accent2: '#FFD700',   // Cyber gold
      ink: '#FF0055',
      dim: '#181033',
      ghostA: '#FF0055',    // Magenta ghost
      ghostB: '#00F2FF',    // Cyan ghost
      grad: ['#FF0055', '#7928CA']
    },
    // Scheme 2: THE BADDEST (Evelynn & Kai'Sa void crystal)
    {
      bg: '#06050C',
      fg: '#F8F9FA',
      sub: '#B545FF',       // Violet crystal
      accent: '#00F2FF',    // Electric cyan
      accent2: '#FF0077',   // Neon rose
      ink: '#00F2FF',
      dim: '#151228',
      ghostA: '#B545FF',
      ghostB: '#00F2FF',
      grad: ['#00F2FF', '#9B51E0']
    },
    // Scheme 3: ALL OUT (Holographic Gold & Diamond)
    {
      bg: '#0A0B14',
      fg: '#FFFFFF',
      sub: '#E6D3A3',       // Hologram gold
      accent: '#FFD700',    // Pure metallic gold
      accent2: '#00F2FF',   // Diamond aqua
      ink: '#FFD700',
      dim: '#202235',
      ghostA: '#FFD700',
      ghostB: '#00F2FF',
      grad: ['#FFF3B0', '#D4AF37']
    }
  ],
  fonts: {
    display: ['dela', 'gothic_black', 'zenkaku'],
    serif: ['mincho_black', 'tokumin'],
    body: ['gothic_bold', 'gothic_med'],
    mono: ['mono']
  },
  texture: { grain: 0.35, paper: 0, scan: 0.12 },
  ghost: 0.72,              // High chromatic aberration for MV look
  glow: 1.85,               // Intense neon bloom
  glitchBoost: 1.6,
  bias: {
    layout: {
      kdaSlanted: 2.8,
      kdaSplitCenter: 2.2,
      huge: 2.0,
      marquee: 1.6,
      scatter: 1.5,
      stack: 1.4
    },
    enter: {
      kdaLaserSlice: 2.5,
      slice: 2.0,
      scramble: 1.8,
      slam: 1.6,
      pop: 1.4
    },
    exit: {
      slice: 2.0,
      glitch: 2.0,
      explode: 1.8,
      scatter: 1.4
    },
    decor: {
      kdaCrystals: 3.2,
      kdaDiamondReticle: 2.6,
      kdaNeonLaser: 2.4,
      kdaCrown: 2.0,
      hud: 1.1,
      waveform: 1.0
    }
  },
  decor: {
    kdaCrystals: 3.0,
    kdaDiamondReticle: 2.5,
    kdaNeonLaser: 2.2,
    kdaCrown: 1.8,
    hud: 1.1
  },
  hud: true,
  useGrad: true
};

if (!J.STYLES.kda) {
  J.STYLES.kda = kdaStyle;
  if (!J.STYLE_ORDER.includes('kda')) {
    // Insert near top right after core neon/punchy styles
    J.STYLE_ORDER.splice(1, 0, 'kda');
  }
}

/* ============================================================
   2. K/DA CRYSTAL SHARDS DECOR (Kim cương pha lê Ahri/Kai'Sa)
   ============================================================ */
J.register('decor', 'kdaCrystals', {
  name: 'K/DA Pha lê kim cương',
  tags: ['graphic', 'pop', 'glitch'],
  w: 2.0,
  layer: 'front',
  ae: 'sparks',
  draw(env, bb, P) {
    const u = U(env);
    const sc = env.sc;
    const aIn = inE(env, 0.4);
    const aOut = outE(env);
    const a = aIn * aOut;
    if (a <= 0.01) return;

    const b = bb || J.centerBB(env, bb);
    const cx = (b.x0 + b.x1) * 0.5;
    const cy = (b.y0 + b.y1) * 0.5;
    const bw = (b.x1 - b.x0);
    const bh = (b.y1 - b.y0);

    const seed = (env.cut.seed || 1) ^ 0x4B4441; // 'KDA'
    const count = 12 + Math.floor(J.r(seed, 1) * 8);

    // Draw diamond crystals shooting outward & orbiting
    for (let i = 0; i < count; i++) {
      const baseAngle = J.r(seed, i, 2) * TAU;
      const angle = baseAngle + env.lt * (i % 2 === 0 ? 0.35 : -0.35);
      const baseDist = Math.max(bw, bh) * 0.52 + 35 * u;
      const flyDist = (1 - aIn) * 140 * u + (1 - aOut) * 220 * u;
      const dist = baseDist + J.r(seed, i, 3) * 180 * u + flyDist;

      const px = cx + Math.cos(angle) * dist;
      const py = cy + Math.sin(angle) * dist;
      const csize = (16 + J.r(seed, i, 4) * 28) * u * a;
      const rot = J.r(seed, i, 5) * TAU + env.lt * (i % 2 === 0 ? 1.8 : -1.8);

      // Diamond polygon 4 points
      const pts = [
        [px, py - csize * 1.5],
        [px + csize * 0.85, py],
        [px, py + csize * 1.5],
        [px - csize * 0.85, py]
      ];

      // Rotate diamond
      const cosR = Math.cos(rot), sinR = Math.sin(rot);
      const rpts = pts.map(([x, y]) => {
        const dx = x - px, dy = y - py;
        return [px + dx * cosR - dy * sinR, py + dx * sinR + dy * cosR];
      });

      const col = (i % 3 === 0) ? sc.accent : (i % 3 === 1) ? sc.sub : sc.accent2;
      env.poly(rpts, col, 0.78 * a, true);

      // Inner specular facet line
      if (env.pass === 'main' && csize > 16 * u) {
        env.line([rpts[0], rpts[2]], '#FFFFFF', 1.8 * u, 0.85 * a, false);
        env.line([rpts[3], rpts[1]], '#FFFFFF', 1.2 * u, 0.5 * a, false);
      }
    }
  }
}, PK);

/* ============================================================
   3. K/DA DIAMOND RETICLE HUD (Tâm ngắm đa giác Riot Games)
   ============================================================ */
J.register('decor', 'kdaDiamondReticle', {
  name: 'K/DA Khung ngắm HUD',
  tags: ['graphic', 'glitch'],
  w: 1.8,
  layer: 'back',
  ae: 'brackets',
  draw(env, bb, P) {
    const u = U(env);
    const sc = env.sc;
    const aIn = inE(env, 0.35);
    const aOut = outE(env);
    const a = aIn * aOut;
    if (a <= 0.01) return;

    const b = bb || J.centerBB(env, bb);
    const cx = (b.x0 + b.x1) * 0.5;
    const cy = (b.y0 + b.y1) * 0.5;
    const r = Math.max((b.x1 - b.x0), (b.y1 - b.y0)) * 0.65 + 35 * u;

    // Diamond outer bounding frame
    const pts = [
      [cx, cy - r],
      [cx + r * 1.35, cy],
      [cx, cy + r],
      [cx - r * 1.35, cy]
    ];

    env.poly(pts, null, a * 0.5, true);

    // Draw stepped brackets at corners
    const d = 28 * u;
    env.line([[cx - d, cy - r], [cx + d, cy - r]], sc.accent, 2 * u, a, true);
    env.line([[cx - d, cy + r], [cx + d, cy + r]], sc.accent, 2 * u, a, true);
    env.line([[cx + r * 1.35, cy - d], [cx + r * 1.35, cy + d]], sc.sub, 2 * u, a, true);
    env.line([[cx - r * 1.35, cy - d], [cx - r * 1.35, cy + d]], sc.sub, 2 * u, a, true);

    // Corner tick crosshairs
    const ct = 12 * u;
    env.line([[cx, cy - r - ct], [cx, cy - r + ct]], '#FFFFFF', 1.5 * u, 0.8 * a, true);
    env.line([[cx, cy + r - ct], [cx, cy + r + ct]], '#FFFFFF', 1.5 * u, 0.8 * a, true);

    // K/DA typography micro label
    if (env.pass === 'main') {
      env.draw({
        text: 'K/DA // POP.STARS.VER.0' + ((env.cut.index || 0) % 9 + 1),
        font: 'mono',
        size: 11 * u,
        x: cx + r * 1.35 - 12 * u,
        y: cy + 18 * u,
        color: sc.sub,
        alpha: 0.75 * a,
        align: 'left',
        ghost: false
      });
      env.draw({
        text: 'TARGET_LOCKED // SYNC:100%',
        font: 'mono',
        size: 9 * u,
        x: cx - r * 1.35 + 12 * u,
        y: cy - 12 * u,
        color: sc.accent,
        alpha: 0.65 * a,
        align: 'right',
        ghost: false
      });
    }
  }
}, PK);

/* ============================================================
   4. K/DA NEON LASER STRIPES (Vệt sáng tia laser Akali)
   ============================================================ */
J.register('decor', 'kdaNeonLaser', {
  name: 'K/DA Vệt tia Laser',
  tags: ['graphic', 'glitch', 'pop'],
  w: 1.8,
  layer: 'back',
  ae: 'slash',
  draw(env, bb, P) {
    const u = U(env);
    const sc = env.sc;
    const aIn = inE(env, 0.28);
    const aOut = outE(env);
    const a = aIn * aOut;
    if (a <= 0.01) return;

    const b = bb || J.centerBB(env, bb);
    const cy = (b.y0 + b.y1) * 0.5;
    const w = env.W;

    // Angled speed lines across screen
    const slant = 140 * u;
    const y1 = cy - 50 * u;
    const y2 = cy + 50 * u;

    env.line([[-60 * u, y1 - slant], [w + 60 * u, y1 + slant]], sc.accent, 2 * u, 0.5 * a, true);
    env.line([[-60 * u, y2 - slant], [w + 60 * u, y2 + slant]], sc.sub, 2 * u, 0.5 * a, true);

    // Gliding accent neon streak
    const sx = (env.lt * w * 2.2) % (w * 2.5) - w * 0.6;
    env.line([[sx, cy - slant * 0.2], [sx + 280 * u, cy + slant * 0.2]], '#FFFFFF', 3.5 * u, 0.9 * a, true);
  }
}, PK);

/* ============================================================
   5. K/DA CROWN EMBLEM DECOR (Vương miện biểu tượng K/DA)
   ============================================================ */
J.register('decor', 'kdaCrown', {
  name: 'K/DA Vương miện',
  tags: ['graphic', 'pop'],
  w: 1.5,
  layer: 'front',
  ae: 'brackets',
  draw(env, bb, P) {
    const u = U(env);
    const sc = env.sc;
    const aIn = inE(env, 0.35);
    const aOut = outE(env);
    const a = aIn * aOut;
    if (a <= 0.01) return;

    const b = bb || J.centerBB(env, bb);
    const cx = (b.x0 + b.x1) * 0.5;
    const topY = b.y0 - 28 * u;
    const cw = 42 * u * a;
    const ch = 22 * u * a;

    // 3-point geometric polygon crown
    const pts = [
      [cx - cw, topY],
      [cx - cw * 0.6, topY - ch * 0.5],
      [cx, topY - ch],
      [cx + cw * 0.6, topY - ch * 0.5],
      [cx + cw, topY],
      [cx + cw * 0.3, topY + ch * 0.2],
      [cx, topY + ch * 0.1],
      [cx - cw * 0.3, topY + ch * 0.2]
    ];

    env.poly(pts, sc.accent2, 0.85 * a, true);

    // Center jewel diamond
    if (env.pass === 'main') {
      const jsize = 5 * u;
      const jpts = [
        [cx, topY - ch * 0.3 - jsize],
        [cx + jsize * 0.8, topY - ch * 0.3],
        [cx, topY - ch * 0.3 + jsize],
        [cx - jsize * 0.8, topY - ch * 0.3]
      ];
      env.poly(jpts, '#FFFFFF', a, false);
    }
  }
}, PK);

/* ============================================================
   6. K/DA SLANTED KINETIC LAYOUT (Bố cục in nghiêng góc nhọn 12 độ)
   ============================================================ */
J.register('layout', 'kdaSlanted', {
  name: 'K/DA In nghiêng',
  tags: ['graphic', 'pop', 'glitch'],
  w: 1.8,
  ae: 'huge',
  fits: n => n <= 26,
  plan(rng, cut, st) {
    return {
      slantDeg: -12,
      wireframe: rng.chance(0.7),
      duoColor: rng.chance(0.5)
    };
  },
  render(env) {
    const cut = env.cut;
    const p = cut.params;
    const u = U(env);
    const sc = env.sc;
    const text = cut.text || '';
    if (!text) return null;

    const cx = env.W * 0.5;
    const cy = env.H * 0.5;

    // Main font sizing
    const font = (env.st.fonts.display && env.st.fonts.display[0]) || 'dela';
    const fit = J.fitSize(text, font, env.W * 0.86, env.H * 0.36, { sx: 1.05 });
    const size = Math.max(38 * u, fit.size);

    // Background giant hollow shadow wireframe
    if (p.wireframe && env.pass === 'main') {
      env.draw({
        text: text,
        font: font,
        size: size * 1.28,
        x: cx + 18 * u,
        y: cy - 28 * u,
        fill: false,
        stroke: 2.2 * u,
        strokeColor: sc.dim,
        alpha: 0.38,
        skew: -0.22,
        align: 'center',
        ghost: false
      });
    }

    // Main lyric item
    const mainItem = {
      text: text,
      font: font,
      size: size,
      x: cx,
      y: cy,
      color: sc.fg,
      skew: -0.22,               // 12 degree K/DA sharp italic slant
      align: 'center',
      lead: 1.1,
      ghost: true
    };

    const bb = J.mainDraw(env, mainItem);

    // Micro decorative sub-bar
    if (env.pass === 'main' && bb) {
      const a = inE(env, 0.4) * outE(env);
      env.rect(bb.x0, bb.y1 + 12 * u, (bb.x1 - bb.x0) * 0.38, 3.5 * u, sc.accent, a, false);
      env.draw({
        text: 'LEAGUE OF LEGENDS // K/DA MUSIC',
        font: 'mono',
        size: 10 * u,
        x: bb.x0 + (bb.x1 - bb.x0) * 0.40,
        y: bb.y1 + 15 * u,
        color: sc.sub,
        alpha: 0.65 * a,
        align: 'left',
        ghost: false
      });
    }

    return bb;
  }
}, PK);

/* ============================================================
   7. K/DA SPLIT CENTER LAYOUT (Cắt đôi chia dòng tương phản)
   ============================================================ */
J.register('layout', 'kdaSplitCenter', {
  name: 'K/DA Chia dòng cắt xéo',
  tags: ['graphic', 'glitch', 'pop'],
  w: 1.6,
  ae: 'split',
  fits: n => n >= 4 && n <= 32,
  plan(rng, cut, st) {
    return {
      swapColors: rng.chance(0.5)
    };
  },
  render(env) {
    const cut = env.cut;
    const u = U(env);
    const sc = env.sc;
    const text = cut.text || '';
    if (!text) return null;

    // Split text into two balanced parts
    const words = text.split(/\s+/);
    let topText = text, botText = '';
    if (words.length >= 2) {
      const mid = Math.ceil(words.length / 2);
      topText = words.slice(0, mid).join(' ');
      botText = words.slice(mid).join(' ');
    } else {
      const mid = Math.ceil(text.length / 2);
      topText = text.slice(0, mid);
      botText = text.slice(mid);
    }

    const cx = env.W * 0.5;
    const cy = env.H * 0.5;
    const font = (env.st.fonts.display && env.st.fonts.display[0]) || 'dela';

    const fitTop = J.fitSize(topText, font, env.W * 0.75, env.H * 0.22, { sx: 1.05 });
    const fitBot = botText ? J.fitSize(botText, font, env.W * 0.75, env.H * 0.22, { sx: 1.05 }) : fitTop;
    const size = Math.min(fitTop.size, fitBot.size, 72 * u);

    const gap = size * 0.62;

    const itTop = {
      text: topText,
      font: font,
      size: size,
      x: cx - 25 * u,
      y: cy - gap * 0.85,
      color: sc.fg,
      skew: -0.2,
      align: 'center',
      mi: 0,
      ghost: true
    };

    const bbTop = J.mainDraw(env, itTop);

    let bbBot = null;
    if (botText) {
      const itBot = {
        text: botText,
        font: font,
        size: size * 0.95,
        x: cx + 25 * u,
        y: cy + gap * 0.85,
        color: sc.accent,
        skew: -0.2,
        align: 'center',
        mi: 1,
        ghost: true
      };
      bbBot = J.mainDraw(env, itBot);
    }

    // Angled laser separator
    if (env.pass === 'main') {
      const a = inE(env, 0.35) * outE(env);
      const slashW = 180 * u;
      env.line([[cx - slashW, cy - 8 * u], [cx + slashW, cy + 8 * u]], sc.sub, 2.5 * u, 0.7 * a, true);
    }

    return bbTop && bbBot ? {
      x0: Math.min(bbTop.x0, bbBot.x0),
      y0: Math.min(bbTop.y0, bbBot.y0),
      x1: Math.max(bbTop.x1, bbBot.x1),
      y1: Math.max(bbTop.y1, bbBot.y1)
    } : (bbTop || bbBot);
  }
}, PK);

/* ============================================================
   8. K/DA LASER SLICE ENTRANCE (Vết chém Laser tốc độ cao)
   ============================================================ */
J.register('enter', 'kdaLaserSlice', {
  name: 'K/DA Chém Laser',
  tags: ['graphic', 'glitch', 'pop'],
  w: 2.0,
  apply(env, it, p, ctx) {
    const dur = ctx.inDur;
    const lt = env.lt - (it.delay || 0);
    const prog = J.clamp(lt / Math.max(0.01, dur));
    const ease = E.outExpo(prog);

    // Initial offset slash slice
    const dist = (1 - ease) * 160 * U(env);
    it.dx = (it.dx || 0) + dist * 1.2;
    it.dy = (it.dy || 0) - dist * 0.5;
    it.alpha = (it.alpha ?? 1) * J.clamp(prog * 2.2);

    // Flash white on very beginning
    if (prog < 0.28 && env.pass === 'main') {
      it.color = '#FFFFFF';
      it.glow = (it.glow || 0) + 1.5;
    }
  }
}, PK);

/* ============================================================
   9. K/DA VOID GRID BACKGROUND (Lưới không gian Cyber Void)
   ============================================================ */
J.register('bg', 'kdaVoidGrid', {
  name: 'K/DA Lưới Không gian Void',
  tags: ['graphic', 'glitch'],
  w: 1.5,
  draw(env, P, ctx) {
    const u = U(env);
    const sc = env.sc;
    const w = env.W, h = env.H;
    const t = env.t;

    // Horizon line at 65% height
    const horizY = h * 0.65;

    // Perspective floor lines moving toward camera
    const gridSpeed = (t * 80 * u) % (30 * u);
    ctx.strokeStyle = sc.dim;
    ctx.lineWidth = 1 * u;
    ctx.globalAlpha = 0.35;

    ctx.beginPath();
    // Horizontal perspective rungs
    for (let y = horizY; y <= h; y += 18 * u) {
      const py = horizY + Math.pow((y - horizY) / (h - horizY), 1.8) * (h - horizY) + gridSpeed;
      if (py > h) continue;
      ctx.moveTo(0, py);
      ctx.lineTo(w, py);
    }
    // Radial perspective lines converging at center horizon
    for (let x = -w * 0.5; x <= w * 1.5; x += 90 * u) {
      ctx.moveTo(w * 0.5, horizY);
      ctx.lineTo(x, h);
    }
    ctx.stroke();

    // Drifting diamond dust / stars
    const seed = 0x4B4441;
    for (let i = 0; i < 20; i++) {
      const rx = (J.r(seed, i, 1) * w + t * 15 * u) % w;
      const ry = (J.r(seed, i, 2) * horizY);
      const rsize = (2 + J.r(seed, i, 3) * 3) * u;
      const rcol = (i % 2 === 0) ? sc.accent : sc.sub;
      ctx.fillStyle = rcol;
      ctx.globalAlpha = 0.4 + 0.3 * Math.sin(t * 3 + i);
      ctx.fillRect(rx - rsize * 0.5, ry - rsize * 0.5, rsize, rsize);
    }

    ctx.globalAlpha = 1.0;
  }
}, PK);

})();
