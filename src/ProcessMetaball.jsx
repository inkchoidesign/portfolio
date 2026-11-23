import { useEffect, useRef } from 'react';

/* The home hero's metaballs, carried down into Process. Same renderer as
   MetaballAnimation's animation2 branch (field sum, dominant-blob lighting,
   8x8 blue-noise dither, five density steps, the diagonal grain), on the same
   770x440 canvas. Only the arrangement changes, one per step:
     0 Context    — nine small blobs on a 3x3 grid, sizes varied: the field laid out
     1 Position   — everything pulled into one mass: the decision
     2 Expression — the mass splits into three equal forms: the one decision
                    (the brand) showing up as identity, product and communication
   Blobs ease toward the active step's layout every frame, so they merge and
   split on the way instead of cutting between states. */

const W = 770;
const H = 440;
const N = 9; // three blobs per form in Expression, so each form has equal mass
const TONE = 208;
const DITHER_LEVELS = [0.12, 0.28, 0.44, 0.6, 0.78];

const DITHER_RANK = (() => {
  const G = 8;
  const n = G * G;
  const used = new Uint8Array(n);
  const order = new Int16Array(n);
  const cx = (i) => i % G;
  const cy = (i) => (i / G) | 0;
  const d2 = (a, b) => {
    let dx = Math.abs(cx(a) - cx(b));
    let dy = Math.abs(cy(a) - cy(b));
    dx = Math.min(dx, G - dx);
    dy = Math.min(dy, G - dy);
    return dx * dx + dy * dy;
  };
  const hash01 = (i) => ((((i * 1103515245 + 12345) >>> 0) & 1023) / 1023);
  order[0] = 0;
  used[0] = 1;
  for (let k = 1; k < n; k++) {
    let best = -1;
    let bestScore = -1;
    for (let i = 0; i < n; i++) {
      if (used[i]) continue;
      let m = Infinity;
      for (let j = 0; j < k; j++) m = Math.min(m, d2(i, order[j]));
      const s = m + hash01(i) * 0.01;
      if (s > bestScore) {
        bestScore = s;
        best = i;
      }
    }
    order[k] = best;
    used[best] = 1;
  }
  const rank = new Float32Array(n);
  for (let r = 0; r < n; r++) rank[order[r]] = r / (n - 1);
  return rank;
})();

/* Target layout per step: [x, y, radius] for each blob, plus a drift amplitude. */
const LAYOUTS = [
  {
    // a 3x3 grid, sizes varied, barely moving: the material laid out in order.
    // Listed column by column so each column becomes one Expression form.
    // Pitch 140 x 110 keeps every pair apart (r <= 26, field < 0.5 between).
    drift: 3,
    blobs: [
      [245, 110, 24], [245, 220, 14], [245, 330, 20],
      [385, 110, 16], [385, 220, 26], [385, 330, 12],
      [525, 110, 20], [525, 220, 14], [525, 330, 24]
    ]
  },
  {
    drift: 8,
    blobs: [
      [370, 200, 70], [405, 232, 66], [388, 255, 60], [355, 238, 54],
      [415, 196, 50], [392, 214, 44], [372, 226, 40], [398, 242, 38],
      [384, 222, 36]
    ]
  },
  {
    drift: 2,
    // four equal forms, two blobs each so every form has the same mass
    // three separate, equal forms (identity, product, communication), the one
    // decision of Position shown where it surfaces; clear air between them
    // (field ~0.8 at each midpoint, under threshold)
    blobs: [
      [199, 214, 33], [211, 214, 33], [205, 228, 33],
      [379, 214, 33], [391, 214, 33], [385, 228, 33],
      [559, 214, 33], [571, 214, 33], [565, 228, 33]
    ]
  }
];

/* res < 1 renders a smaller canvas (CSS scales it up, pixelated) so several
   can run side by side; the layouts stay in 770x440 units. */
/* progress (0..2, optional) blends between neighbouring layouts instead of
   snapping to one, so scroll or a cursor can scrub the arrangement. */
export function ProcessMetaball({ step = 0, bgHex = '#121212', res = 1, progress = null }) {
  const canvasRef = useRef(null);
  const stepRef = useRef(step);
  const progressRef = useRef(progress);

  useEffect(() => {
    stepRef.current = step;
  }, [step]);
  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const CW = Math.round(W * res);
    const CH = Math.round(H * res);
    canvas.width = CW;
    canvas.height = CH;
    const ctx = canvas.getContext('2d');
    const img = ctx.createImageData(CW, CH);
    const px = img.data;
    const hex = bgHex.replace('#', '');
    const BG = parseInt(hex.slice(0, 2), 16);

    const bx = new Float32Array(N);
    const by = new Float32Array(N);
    const br = new Float32Array(N);
    const start = LAYOUTS[stepRef.current].blobs;
    for (let i = 0; i < N; i++) {
      [bx[i], by[i], br[i]] = start[i];
    }

    const update = (t) => {
      const prog = progressRef.current;
      const i0 = prog == null ? stepRef.current : Math.max(0, Math.min(LAYOUTS.length - 1, Math.floor(prog)));
      const i1 = Math.min(LAYOUTS.length - 1, i0 + 1);
      const f = prog == null ? 0 : Math.max(0, Math.min(1, prog - i0));
      const A = LAYOUTS[i0];
      const B = LAYOUTS[i1];
      const drift = A.drift + (B.drift - A.drift) * f;
      for (let i = 0; i < N; i++) {
        const a = A.blobs[i];
        const b = B.blobs[i];
        const tx = a[0] + (b[0] - a[0]) * f;
        const ty = a[1] + (b[1] - a[1]) * f;
        const tr = a[2] + (b[2] - a[2]) * f;
        const dx = Math.sin(t * 0.6 + i * 1.7) * drift;
        const dy = Math.cos(t * 0.5 + i * 2.3) * drift * 0.6;
        bx[i] += (tx + dx - bx[i]) * 0.045;
        by[i] += (ty + dy - by[i]) * 0.045;
        br[i] += (tr - br[i]) * 0.045;
      }
    };

    const render = () => {
      let p = 0;
      for (let y = 0; y < CH; y++) {
        const ly = (y + 0.5) / res;
        for (let x = 0; x < CW; x++) {
          const lx = (x + 0.5) / res;
          // surface direction is a blend of every blob's, weighted by influence
          // squared, so the shading flows across a join instead of switching
          // abruptly to whichever blob is nearest
          let sum = 0;
          let sx = 0;
          let sy = 0;
          let sw = 0;
          for (let i = 0; i < N; i++) {
            const ex = (lx - bx[i]) / br[i];
            const ey = (ly - by[i]) / br[i];
            const inf = 1 / (ex * ex + ey * ey + 1e-9);
            sum += inf;
            const w = inf * inf;
            sx += ex * w;
            sy += ey * w;
            sw += w;
          }
          const wx = sx / sw;
          const wy = sy / sw;
          let tHard = (sum - 0.97) / 0.06;
          if (tHard <= 0.001) {
            px[p++] = BG;
            px[p++] = BG;
            px[p++] = BG;
            px[p++] = 255;
            continue;
          }
          if (tHard > 1) tHard = 1;

          const ex = Math.max(-1, Math.min(1, wx));
          const ey = Math.max(-1, Math.min(1, wy));
          const nz = Math.sqrt(Math.max(0, 1 - Math.min(1, ex * ex + ey * ey)));
          const ndl = Math.max(0, Math.min(1, ex * -0.22 + ey * -0.72 + nz * 0.56));
          const body = Math.max(0, Math.min(1, (tHard - 0.04) / 0.96));
          const hx = ex + 0.06;
          const hy = ey + 0.52;
          const highlight = Math.exp(-((hx * hx + hy * hy) / 0.045));
          const cavity = Math.max(0, Math.min(1, (sum - 1.5) / 1.9));
          const form = Math.max(0, Math.min(1, 0.1 + 0.26 * body + 0.32 * ndl + 0.4 * highlight - 0.14 * cavity));
          const brightness = Math.pow(form, 0.9);

          const rankVal = DITHER_RANK[(x & 7) + ((y & 7) << 3)];
          const cont = brightness * 4;
          const base = Math.max(0, Math.min(4, Math.floor(cont)));
          const frac = cont - base;
          const blend = (((x * 37 + y * 91) & 31) / 31) * 0.65 + rankVal * 0.35;
          const stepped = frac > blend && base < 4 ? base + 1 : base;
          const on = tHard >= 0.5 && rankVal < Math.max(0, DITHER_LEVELS[stepped] - 0.05);
          const tone = on ? TONE : BG;
          px[p++] = tone;
          px[p++] = tone;
          px[p++] = tone;
          px[p++] = 255;
        }
      }
      ctx.putImageData(img, 0, 0);
    };

    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      // no easing: jump to the layout and redraw only when the step changes
      let last = -1;
      const id = setInterval(() => {
        if (stepRef.current === last) return;
        last = stepRef.current;
        LAYOUTS[last].blobs.forEach(([x, y, r], i) => {
          bx[i] = x;
          by[i] = y;
          br[i] = r;
        });
        render();
      }, 200);
      return () => clearInterval(id);
    }

    let raf = null;
    let t0 = null;
    const frame = (now) => {
      if (t0 == null) t0 = now;
      update((now - t0) / 1000);
      render();
      raf = requestAnimationFrame(frame);
    };
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && raf == null) raf = requestAnimationFrame(frame);
      else if (!entry.isIntersecting && raf != null) {
        cancelAnimationFrame(raf);
        raf = null;
      }
    });
    io.observe(canvas);
    return () => {
      io.disconnect();
      if (raf != null) cancelAnimationFrame(raf);
    };
  }, [bgHex, res]);

  return (
    <canvas
      ref={canvasRef}
      width={Math.round(W * res)}
      height={Math.round(H * res)}
      aria-hidden="true"
      style={{ width: '100%', height: 'auto', display: 'block', imageRendering: 'pixelated' }}
    />
  );
}
