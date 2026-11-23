import { useEffect, useRef } from 'react';

/* A photograph drawn with the same 8x8 dither and stepped tone as the Home and
   Work heroes, on a light ground: ink dots whose density follows shadow.

   The source is a prepared 440x440 PNG (see scripts/prep-portrait.py): masked
   to the subject (alpha), contrast already stretched. This component only
   dithers and moves.

   What the reference is about is the edge: the figure is cut out clean against
   a flat ground. Dither alone can't give that (light edges dissolve into the
   ground), so the silhouette gets a hard 1px ink contour, drawn from the mask,
   and the mask itself is used hard, no feathering.

   The dither threshold breathes tile by tile, so the dots drift without the
   image ever changing. */

const W = 440;
const H = 440;
const DITHER_GRID = 8;
const TAU = Math.PI * 2;

const CONTOUR = 1; // px of ink along the silhouette
const BREATH = 0.05; // threshold drift amplitude
const BREATH_PERIOD = 9; // seconds

const clamp01 = (v) => Math.max(0, Math.min(1, v));
const smoothstep = (a, b, x) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

function buildDitherRank() {
  const rank = new Float32Array(DITHER_GRID * DITHER_GRID);
  const used = new Uint8Array(DITHER_GRID * DITHER_GRID);
  const order = new Int16Array(DITHER_GRID * DITHER_GRID);
  const cellX = (idx) => idx % DITHER_GRID;
  const cellY = (idx) => (idx / DITHER_GRID) | 0;
  const torusDist2 = (a, b) => {
    let dx = Math.abs(cellX(a) - cellX(b));
    let dy = Math.abs(cellY(a) - cellY(b));
    dx = Math.min(dx, DITHER_GRID - dx);
    dy = Math.min(dy, DITHER_GRID - dy);
    return dx * dx + dy * dy;
  };
  const hash01 = (i) => ((((i * 1103515245 + 12345) >>> 0) & 1023) / 1023);
  order[0] = 0;
  used[0] = 1;
  for (let k = 1; k < DITHER_GRID * DITHER_GRID; k++) {
    let bestIdx = -1;
    let bestScore = -1;
    for (let i = 0; i < DITHER_GRID * DITHER_GRID; i++) {
      if (used[i]) continue;
      let minD2 = Infinity;
      for (let j = 0; j < k; j++) {
        const d2 = torusDist2(i, order[j]);
        if (d2 < minD2) minD2 = d2;
      }
      const score = minD2 + hash01(i) * 0.01;
      if (score > bestScore) {
        bestScore = score;
        bestIdx = i;
      }
    }
    order[k] = bestIdx;
    used[bestIdx] = 1;
  }
  for (let r = 0; r < DITHER_GRID * DITHER_GRID; r++) {
    rank[order[r]] = r / (DITHER_GRID * DITHER_GRID - 1);
  }
  return rank;
}

export function PortraitAnimation({ src, bgHex = '#f5f3ef', inkHex = '#141414', animated = true }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    const imgData = ctx.createImageData(W, H);
    const px = imgData.data;

    const hexRGB = (hex) => {
      const h = hex.replace('#', '');
      return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
    };
    const [BGr, BGg, BGb] = hexRGB(bgHex);
    const [INKr, INKg, INKb] = hexRGB(inkHex);

    const ditherRank = buildDitherRank();
    const ditherLevels = [0.12, 0.28, 0.44, 0.6, 0.78];

    /* Per-pixel darkness 0..1, or -1 outside the subject. */
    const field = new Float32Array(W * H).fill(-1);
    /* 1 where a subject pixel touches the ground within CONTOUR px. */
    const contour = new Uint8Array(W * H);
    let ready = false;
    let cancelled = false;

    const img = new Image();
    img.onload = () => {
      if (cancelled) return;
      const off = document.createElement('canvas');
      off.width = W;
      off.height = H;
      const octx = off.getContext('2d');
      octx.drawImage(img, 0, 0, W, H);
      const d = octx.getImageData(0, 0, W, H).data;
      for (let i = 0, p = 0; i < d.length; i += 4, p++) {
        if (d[i + 3] < 128) continue;
        const lum = (0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2]) / 255;
        field[p] = 1 - lum;
      }
      /* Contour: subject pixels with any ground pixel within CONTOUR. The
         canvas edge doesn't count, so a bust cut by the frame stays open. */
      for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
          if (field[y * W + x] < 0) continue;
          let edge = false;
          for (let oy = -CONTOUR; oy <= CONTOUR && !edge; oy++) {
            for (let ox = -CONTOUR; ox <= CONTOUR; ox++) {
              const xx = x + ox;
              const yy = y + oy;
              if (xx < 0 || yy < 0 || xx >= W || yy >= H) continue;
              if (field[yy * W + xx] < 0) {
                edge = true;
                break;
              }
            }
          }
          if (edge) contour[y * W + x] = 1;
        }
      }
      ready = true;
    };
    img.src = src;

    function composite(time, appear) {
      const breathT = (TAU * time) / BREATH_PERIOD;
      for (let y = 0; y < H; y++) {
        const ty = y >> 3;
        for (let x = 0; x < W; x++) {
          const i = (y * W + x) * 4;
          const p = y * W + x;
          const darkness = field[p];
          if (darkness < 0) {
            px[i] = BGr;
            px[i + 1] = BGg;
            px[i + 2] = BGb;
            px[i + 3] = 255;
            continue;
          }
          if (contour[p] && appear > 0.6) {
            px[i] = INKr;
            px[i + 1] = INKg;
            px[i + 2] = INKb;
            px[i + 3] = 255;
            continue;
          }
          /* Same stepped tone + dither as the other heroes. The jitter term is
             what breathes: a slow wave across the 8x8 tiles. */
          const tx = x >> 3;
          const jitter = -0.012 + BREATH * Math.sin(breathT + tx * 0.55 + ty * 0.8);
          const rankVal = ditherRank[(x & 7) + ((y & 7) << 3)];
          const patternThreshold = clamp01(rankVal + jitter);
          const continuousStep = darkness * 4;
          const baseStep = Math.max(0, Math.min(4, Math.floor(continuousStep)));
          const nextStep = Math.min(4, baseStep + 1);
          const stepFrac = continuousStep - baseStep;
          const blendNoise = (((x * 37 + y * 91) & 31) / 31) * 0.65 + rankVal * 0.35;
          const stepped = stepFrac > blendNoise && baseStep < 4 ? nextStep : baseStep;
          const density = Math.max(0, ditherLevels[stepped] - 0.05) * appear;
          const ink = patternThreshold < density;
          px[i] = ink ? INKr : BGr;
          px[i + 1] = ink ? INKg : BGg;
          px[i + 2] = ink ? INKb : BGb;
          px[i + 3] = 255;
        }
      }
      ctx.putImageData(imgData, 0, 0);
    }

    const reduced =
      typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    let start = null;
    let appearStart = null;
    const frame = (now) => {
      if (start == null) start = now;
      const t = (now - start) / 1000;
      if (ready) {
        if (appearStart == null) appearStart = now;
        const a = clamp01((now - appearStart) / 1400);
        const appear = a * a * (3 - 2 * a);
        if (!animated || reduced) {
          composite(2, 1);
          return;
        }
        composite(t, appear);
      }
      rafRef.current = requestAnimationFrame(frame);
    };
    rafRef.current = requestAnimationFrame(frame);

    return () => {
      cancelled = true;
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [src, bgHex, inkHex, animated]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{ width: '100%', height: 'auto', display: 'block' }}
    />
  );
}
