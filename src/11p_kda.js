/* JIZURA pack: kda — Official Riot Games K/DA Aesthetic Pack
   Faithfully crafted after "THE BADDEST" & "POP/STARS" Official Lyric Videos:
   - High-Fashion Editorial Brutalism & Techwear Minimalism
   - Ultra-Condensed Monumental Typography (Druk / Anton style)
   - Iconic Kinetic Outline Matrix ("Coming At You" Stack)
   - Iridescent Liquid Silk / Opal Aurora Background
   - Precision Hairline HUD & Micro-Typography Stamps (REC, Catalog #, Crop Marks)
   - Zero cheap clip-art — pure luxury cyber-pop typography
*/
(() => {
'use strict';

const E = J.E;
const PK = 'kda';
const DEG = J.DEG;
const TAU = J.TAU;

const U = env => Math.min(env.W, env.H) / 1080;
const inE = (env, d = 0.35, delay = 0, ease = E.outExpo) => ease(J.clamp((env.lt - delay) / d));
const outE = env => 1 - E.inCubic(env.pOut);

/* ============================================================
   1. K/DA STYLE DEFINITION & COLOR SCHEMES
   ============================================================ */
const kdaStyle = {
  name: 'K/DA (Riot Games)',
  desc: 'High-Fashion Techwear • Chữ Ultra-Condensed đồ sộ • Ma trận chữ rỗng • Lụa cực quang óng ánh',
  moods: ['graphic', 'editorial', 'glitch', 'pop'],
  schemes: [
    // Scheme 1: THE BADDEST (Official MV Onyx & Neon Laser)
    {
      bg: '#07060A',
      fg: '#FFFFFF',
      sub: '#6C7A8E',       // Cool steel grey for outline echoes
      accent: '#00F2FF',    // Akali Electric Cyber Cyan
      accent2: '#FF0055',   // Neon Fuchsia / Rose
      ink: '#00F2FF',
      dim: '#13111C',
      ghostA: '#00F2FF',
      ghostB: '#FF0055',
      grad: ['#00F2FF', '#B545FF']
    },
    // Scheme 2: IRIDESCENT OPAL (The Baddest Aurora / Liquid Silk from MV intro)
    {
      bg: '#A4B0E8',        // Pearlescent lilac opal
      fg: '#0D0C14',        // Deep carbon black
      sub: '#4D457A',       // Royal violet
      accent: '#00F2FF',    // Electric cyan
      accent2: '#FF0077',   // Hot magenta
      ink: '#0D0C14',
      dim: '#8F9BD4',
      ghostA: '#FF0077',
      ghostB: '#00F2FF',
      grad: ['#80DEEA', '#B388FF', '#EA80FC']
    },
    // Scheme 3: ALL OUT (Platinum Hologram & High-Contrast Void)
    {
      bg: '#08090E',
      fg: '#FFFFFF',
      sub: '#C8A85E',       // Champagne metallic gold
      accent: '#FFD700',    // Pure metallic gold
      accent2: '#00F2FF',   // Hologram diamond
      ink: '#FFD700',
      dim: '#181A24',
      ghostA: '#FFD700',
      ghostB: '#00F2FF',
      grad: ['#FFFFFF', '#D4AF37']
    }
  ],
  fonts: {
    // Ultra-condensed, heavy, commanding grotesque faces
    display: ['dela', 'gothic_black', 'zenkaku'],
    serif: ['mincho_black', 'tokumin'],
    body: ['gothic_bold', 'gothic_med'],
    mono: ['mono']
  },
  texture: { grain: 0.25, paper: 0, scan: 0.08 },
  ghost: 0.65,              // Razor chromatic aberration
  glow: 1.45,
  glitchBoost: 1.4,
  bias: {
    layout: {
      kdaHero: 3.5,
      kdaMatrixStack: 3.2,
      kdaEditorialSplit: 2.8,
      huge: 2.0,
      condensed: 2.0,
      vcols: 1.5
    },
    enter: {
      kdaSnapZoom: 2.8,
      slice: 2.2,
      assemble: 2.0,
      scramble: 1.8
    },
    exit: {
      slice: 2.4,
      glitch: 2.0,
      explode: 1.8
    },
    decor: {
      kdaTechFrame: 3.5,
      kdaRazorSlice: 2.5
    },
    bg: {
      kdaOnyxVoid: 3.0,
      kdaAuroraSilk: 2.5
    },
    treat: {
      none: 4.0,
      neonOutline: 2.5,
      outline: 2.0,
      glitchSplit: 2.0,
      circled: 0,
      marker: 0,
      ransom: 0,
      sticker: 0
    },
    trans: {
      none: 5.0,
      flash: 2.5,
      slice: 2.0,
      spinOut: 0,
      cube: 0,
      doors: 0
    }
  },
  decor: {
    kdaTechFrame: 3.0,
    kdaRazorSlice: 2.2,
    kdaMicroStamps: 2.0
  },
  hud: true,
  useGrad: true
};

if (!J.STYLES.kda) {
  J.STYLES.kda = kdaStyle;
  if (!J.STYLE_ORDER.includes('kda')) {
    J.STYLE_ORDER.splice(1, 0, 'kda');
  }
} else {
  Object.assign(J.STYLES.kda, kdaStyle);
}

/* ============================================================
   2. K/DA HERO CONDENSED LAYOUT (Chữ đồ sộ tràn viền chuẩn MV)
   ============================================================ */
J.register('layout', 'kdaHero', {
  name: 'K/DA Hero Siêu đậm',
  tags: ['graphic', 'editorial', 'pop'],
  w: 2.2,
  ae: 'huge',
  fits: n => n <= 32,
  plan(rng, cut, st) {
    return {
      italic: true,
      allCaps: true,
      subQuote: rng.chance(0.6)
    };
  },
  render(env) {
    const cut = env.cut;
    const p = cut.params;
    const u = U(env);
    const sc = env.sc;
    let text = cut.text || '';
    if (!text) return null;
    if (p.allCaps) text = text.toUpperCase();

    const cx = env.W * 0.5;
    const cy = env.H * 0.5;

    // Use tallest bold display font
    const font = (env.st.fonts.display && env.st.fonts.display[0]) || 'dela';

    // Scale to take 80-92% of screen width with monumental presence
    const fit = J.fitSize(text, font, env.W * 0.88, env.H * 0.42, { sx: 0.95 });
    const size = Math.max(54 * u, fit);
    const isDarkBg = cut.bg === 'kdaOnyxVoid' || J.lum(sc.bg) < 0.35;
    const textCol = isDarkBg ? '#FFFFFF' : sc.fg;

    const mainItem = {
      text: text,
      font: font,
      size: size,
      x: cx,
      y: cy,
      color: textCol,
      skew: -0.18,              // -10.5 degree aggressive modern shear
      sy: 1.15,                 // 15% vertical stretch for high-fashion Druk look
      align: 'center',
      lead: 0.98,
      ghost: true
    };

    const bb = J.mainDraw(env, mainItem);

    // Subtle hairline framing above and below the hero text
    if (env.pass === 'main' && bb) {
      const a = inE(env, 0.3) * outE(env);
      const spanW = (bb.x1 - bb.x0) + 40 * u;
      const x0 = cx - spanW * 0.5;
      const x1 = cx + spanW * 0.5;

      // Top & Bottom hair-thin luxury rules
      env.line([[x0, bb.y0 - 12 * u], [x1, bb.y0 - 12 * u]], sc.sub, 1 * u, 0.45 * a, false);
      env.line([[x0, bb.y1 + 12 * u], [x1, bb.y1 + 12 * u]], sc.sub, 1 * u, 0.45 * a, false);
    }

    return bb;
  }
}, PK);

/* ============================================================
   3. K/DA MATRIX STACK LAYOUT (Ma trận chữ rỗng "Coming At You")
   Chính xác 100% như cảnh 0:13 trong MV THE BADDEST
   ============================================================ */
J.register('layout', 'kdaMatrixStack', {
  name: 'K/DA Ma trận chữ rỗng',
  tags: ['graphic', 'editorial', 'glitch'],
  w: 2.0,
  ae: 'stack',
  fits: n => n <= 24,
  plan(rng, cut, st) {
    return {
      rows: rng.int(5, 7),
      colOffset: rng.chance(0.5)
    };
  },
  render(env) {
    const cut = env.cut;
    const p = cut.params;
    const u = U(env);
    const sc = env.sc;
    const rawText = (cut.text || '').toUpperCase();
    if (!rawText) return null;

    const cx = env.W * 0.5;
    const cy = env.H * 0.5;
    const font = (env.st.fonts.display && env.st.fonts.display[0]) || 'dela';

    const fit = J.fitSize(rawText, font, env.W * 0.86, env.H * 0.22, { sx: 0.95 });
    const size = Math.max(48 * u, fit);
    const lineH = size * 0.94;

    const rowCount = p.rows || 5;
    const midIdx = Math.floor(rowCount / 2);
    const isDarkBg = cut.bg === 'kdaOnyxVoid' || J.lum(sc.bg) < 0.35;
    const centerCol = isDarkBg ? '#FFFFFF' : (sc.fg || '#0D0C14');
    const outlineCol = isDarkBg ? (sc.accent || '#00F2FF') : (sc.sub || '#4D457A');

    // Draw stacked ghost outline rows above and below
    if (env.pass === 'main') {
      const a = inE(env, 0.3) * outE(env);
      for (let r = 0; r < rowCount; r++) {
        if (r === midIdx) continue; // Middle row is main solid item
        const diff = r - midIdx;
        const y = cy + diff * lineH;
        const rowAlpha = Math.max(0.3, (1 - Math.abs(diff) / (rowCount * 0.85)) * 0.75) * a;

        env.draw({
          text: rawText,
          font: font,
          size: size,
          x: cx,
          y: y,
          fill: false,
          stroke: Math.max(1.8, 3.2 * u),
          strokeColor: outlineCol,
          color: outlineCol,
          alpha: rowAlpha,
          skew: -0.16,
          sy: 1.15,
          align: 'center',
          ghost: false,
          plain: true
        });
      }
    }

    // Main central row — solid crisp white/accent
    const mainItem = {
      text: rawText,
      font: font,
      size: size,
      x: cx,
      y: cy,
      color: centerCol,
      skew: -0.16,
      sy: 1.15,
      align: 'center',
      ghost: true,
      plain: true,
      glow: isDarkBg ? 1.6 : 0
    };

    return J.mainDraw(env, mainItem);
  }
}, PK);

/* ============================================================
   4. K/DA EDITORIAL SPLIT (Bố cục tạp chí thời trang xéo góc)
   ============================================================ */
J.register('layout', 'kdaEditorialSplit', {
  name: 'K/DA Editorial Xéo góc',
  tags: ['graphic', 'editorial'],
  w: 1.8,
  ae: 'split',
  fits: n => n >= 4 && n <= 36,
  plan(rng, cut, st) {
    return {};
  },
  render(env) {
    const cut = env.cut;
    const u = U(env);
    const sc = env.sc;
    const text = (cut.text || '').toUpperCase();
    if (!text) return null;

    const words = text.split(/\s+/);
    let part1 = text, part2 = '';
    if (words.length >= 2) {
      const mid = Math.ceil(words.length / 2);
      part1 = words.slice(0, mid).join(' ');
      part2 = words.slice(mid).join(' ');
    }

    const cx = env.W * 0.5;
    const cy = env.H * 0.5;
    const font = (env.st.fonts.display && env.st.fonts.display[0]) || 'dela';

    const fit1 = J.fitSize(part1, font, env.W * 0.72, env.H * 0.22, { sx: 0.95 });
    const fit2 = part2 ? J.fitSize(part2, font, env.W * 0.72, env.H * 0.22, { sx: 0.95 }) : fit1;
    const size = Math.min(fit1, fit2, 68 * u);
    const lineH = size * 1.25;

    const isDarkBg = cut.bg === 'kdaOnyxVoid' || J.lum(sc.bg) < 0.35;
    const col1 = isDarkBg ? '#FFFFFF' : sc.fg;
    const col2 = sc.accent || '#00F2FF';

    // Part 1: Top-Left offset
    const itTop = {
      text: part1,
      font: font,
      size: size,
      x: cx - 60 * u,
      y: cy - lineH * 0.52,
      color: col1,
      skew: -0.18,
      sy: 1.15,
      align: 'center',
      mi: 0,
      ghost: true
    };
    const bb1 = J.mainDraw(env, itTop);

    let bb2 = null;
    if (part2) {
      // Part 2: Bottom-Right offset in accent cyan
      const itBot = {
        text: part2,
        font: font,
        size: size,
        x: cx + 60 * u,
        y: cy + lineH * 0.52,
        color: col2,
        skew: -0.18,
        sy: 1.15,
        align: 'center',
        mi: 1,
        ghost: true
      };
      bb2 = J.mainDraw(env, itBot);
    }

    // Razor diagonal hair-thin slash dividing the two
    if (env.pass === 'main') {
      const a = inE(env, 0.3) * outE(env);
      const sw = 260 * u;
      env.line([[cx - sw, cy - 8 * u], [cx + sw, cy + 8 * u]], sc.accent2 || '#FF0055', 1.8 * u, 0.75 * a, false);
    }

    return bb1 && bb2 ? {
      x0: Math.min(bb1.x0, bb2.x0),
      y0: Math.min(bb1.y0, bb2.y0),
      x1: Math.max(bb1.x1, bb2.x1),
      y1: Math.max(bb1.y1, bb2.y1)
    } : (bb1 || bb2);
  }
}, PK);

/* ============================================================
   5. K/DA TECHWEAR HUD FRAME (Khung viền công nghệ tối giản)
   Chính xác như viền HUD của Riot trong The Baddest MV
   ============================================================ */
J.register('decor', 'kdaTechFrame', {
  name: 'K/DA Khung Techwear HUD',
  tags: ['graphic', 'editorial', 'glitch'],
  w: 2.5,
  layer: 'back',
  ae: 'brackets',
  draw(env, bb, P) {
    const u = U(env);
    const sc = env.sc;
    const aIn = inE(env, 0.35);
    const aOut = outE(env);
    const a = aIn * aOut;
    if (a <= 0.01) return;

    const w = env.W, h = env.H;
    const mx = 60 * u;  // Margin X
    const my = 50 * u;  // Margin Y
    const x0 = mx, x1 = w - mx;
    const y0 = my, y1 = h - my;

    const ctx = env.ctx;

    // 1. Four Corner Crop Marks: ┌ ┐ └ ┘
    const clen = 32 * u;
    const thick = 1.8 * u;
    // Top-Left
    env.line([[x0, y0], [x0 + clen, y0]], sc.sub, thick, 0.8 * a, false);
    env.line([[x0, y0], [x0, y0 + clen]], sc.sub, thick, 0.8 * a, false);
    // Top-Right
    env.line([[x1, y0], [x1 - clen, y0]], sc.sub, thick, 0.8 * a, false);
    env.line([[x1, y0], [x1, y0 + clen]], sc.sub, thick, 0.8 * a, false);
    // Bottom-Left
    env.line([[x0, y1], [x0 + clen, y1]], sc.sub, thick, 0.8 * a, false);
    env.line([[x0, y1], [x0, y1 - clen]], sc.sub, thick, 0.8 * a, false);
    // Bottom-Right
    env.line([[x1, y1], [x1 - clen, y1]], sc.sub, thick, 0.8 * a, false);
    env.line([[x1, y1], [x1, y1 - clen]], sc.sub, thick, 0.8 * a, false);

    // 2. Micro Typographic Watermark Stamps
    if (env.pass === 'main') {
      const idx = (env.cut.index || 0) + 1;
      const idxStr = String(idx).padStart(2, '0');

      // Top-Left Header
      env.draw({
        text: 'THE BADDEST // K/DA 2020 CATALOG',
        font: 'mono',
        size: 11 * u,
        x: x0 + 10 * u,
        y: y0 + 16 * u,
        color: sc.sub,
        alpha: 0.7 * a,
        align: 'left',
        ghost: false
      });

      // Top-Right REC dot & status
      const blink = Math.sin(env.t * 6) > 0;
      if (blink) {
        env.circle(x1 - 85 * u, y0 + 16 * u, 3.5 * u, sc.accent2, 0.9 * a, true);
      }
      env.draw({
        text: 'REC ● LIVE',
        font: 'mono',
        size: 11 * u,
        x: x1 - 10 * u,
        y: y0 + 16 * u,
        color: blink ? sc.accent2 : sc.sub,
        alpha: 0.85 * a,
        align: 'right',
        ghost: false
      });

      // Bottom-Left Track & Index
      env.draw({
        text: `TRACK.01 // LYRIC ${idxStr}`,
        font: 'mono',
        size: 10 * u,
        x: x0 + 10 * u,
        y: y1 - 12 * u,
        color: sc.sub,
        alpha: 0.65 * a,
        align: 'left',
        ghost: false
      });

      // Bottom-Right High Density Watermark
      env.draw({
        text: 'RIOT GAMES MUSIC // ALL OUT EP',
        font: 'mono',
        size: 10 * u,
        x: x1 - 10 * u,
        y: y1 - 12 * u,
        color: sc.sub,
        alpha: 0.65 * a,
        align: 'right',
        ghost: false
      });
    }
  }
}, PK);

/* ============================================================
   6. K/DA RAZOR SLICE (Đường cắt tia laser sắc ngọt)
   ============================================================ */
J.register('decor', 'kdaRazorSlice', {
  name: 'K/DA Vết chém Laser',
  tags: ['graphic', 'glitch', 'pop'],
  w: 1.8,
  layer: 'back',
  ae: 'slash',
  draw(env, bb, P) {
    const u = U(env);
    const sc = env.sc;
    const a = inE(env, 0.25) * outE(env);
    if (a <= 0.01) return;

    const w = env.W, h = env.H;
    const b = bb || J.centerBB(env, bb);
    const cy = (b.y0 + b.y1) * 0.5;

    // Precision 1px speed rules slicing across canvas
    const slant = 180 * u;
    env.line([[-80 * u, cy - 25 * u - slant], [w + 80 * u, cy - 25 * u + slant]], sc.accent, 1.2 * u, 0.6 * a, false);
    env.line([[-80 * u, cy + 25 * u - slant], [w + 80 * u, cy + 25 * u + slant]], sc.accent2, 1.2 * u, 0.6 * a, false);

    // Fast-gliding laser spark pulse
    const px = ((env.lt * 2.8) % 2.0 - 0.5) * w;
    env.line([[px, cy - slant * 0.1], [px + 320 * u, cy + slant * 0.1]], '#FFFFFF', 2.5 * u, 0.95 * a, false);
  }
}, PK);

/* ============================================================
   7. K/DA SNAP ZOOM ENTRANCE (Giật khung hình bạo lực)
   ============================================================ */
J.register('enter', 'kdaSnapZoom', {
  name: 'K/DA Snap Zoom',
  tags: ['graphic', 'glitch'],
  w: 2.0,
  apply(env, it, p, ctx) {
    const dur = ctx.inDur;
    const lt = env.lt - (it.delay || 0);
    const prog = J.clamp(lt / Math.max(0.01, dur));
    const ease = E.outExpo(prog);

    // Brutal scale slam from 1.6x down to 1.0x with slight overshoot
    const scale = 1 + (1 - ease) * 0.65;
    it.size = (it.size || 50) * scale;
    it.alpha = (it.alpha ?? 1) * J.clamp(prog * 3.5);

    // 1-frame strobe flash on kick
    if (prog < 0.2 && env.pass === 'main') {
      it.color = '#FFFFFF';
      it.glow = (it.glow || 0) + 1.8;
    }
  }
}, PK);

/* ============================================================
   8. K/DA AURORA SILK BACKGROUND (Cực quang lụa óng ánh chuẩn MV)
   Tái hiện chính xác nền óng ánh màu ngọc trai của The Baddest MV
   ============================================================ */
J.register('bg', 'kdaAuroraSilk', {
  name: 'K/DA Cực quang lụa Iridescent',
  tags: ['graphic', 'editorial'],
  w: 2.2,
  draw(env, P) {
    const ctx = env.ctx;
    const w = env.W, h = env.H;
    const t = env.t;

    // Moving pearlescent iridescent gradient wave
    const g = ctx.createLinearGradient(
      w * 0.2 + Math.sin(t * 0.4) * w * 0.25,
      0,
      w * 0.8 + Math.cos(t * 0.3) * w * 0.25,
      h
    );

    // High-fashion pastel silk stops from MV: Lilac -> Soft Cyan -> Pearlescent Pink -> Opal Blue
    g.addColorStop(0.0, '#9FA8DA'); // Soft lavender lilac
    g.addColorStop(0.35, '#80DEEA'); // Liquid aqua
    g.addColorStop(0.70, '#EA80FC'); // Pearlescent neon pink
    g.addColorStop(1.0, '#B388FF'); // Deep royal opal

    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    // Diagonal silk wave sheen
    ctx.save();
    ctx.globalCompositeOperation = 'overlay';
    const sheenGrad = ctx.createLinearGradient(0, 0, w, h * 0.8);
    sheenGrad.addColorStop(0.0, 'rgba(255, 255, 255, 0.4)');
    sheenGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.05)');
    sheenGrad.addColorStop(1.0, 'rgba(255, 255, 255, 0.35)');
    ctx.fillStyle = sheenGrad;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }
}, PK);

/* ============================================================
   9. K/DA ONYX VOID BACKGROUND (Đêm đen Cyberpunk tối giản)
   ============================================================ */
J.register('bg', 'kdaOnyxVoid', {
  name: 'K/DA Đêm đen Onyx Void',
  tags: ['graphic', 'glitch'],
  w: 2.0,
  draw(env, P) {
    const ctx = env.ctx;
    const w = env.W, h = env.H;
    ctx.fillStyle = '#06050A';
    ctx.fillRect(0, 0, w, h);

    // Subtle 1px tech grid lines
    const u = U(env);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1 * u;
    ctx.beginPath();
    for (let x = 0; x < w; x += 180 * u) {
      ctx.moveTo(x, 0); ctx.lineTo(x, h);
    }
    for (let y = 0; y < h; y += 180 * u) {
      ctx.moveTo(0, y); ctx.lineTo(w, y);
    }
    ctx.stroke();
  }
}, PK);

})();
