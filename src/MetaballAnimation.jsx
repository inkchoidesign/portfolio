import { useEffect, useRef } from 'react';

/* Standalone copy of the portfolio metaball renderer.
   This is intentionally duplicated from Portfolio.jsx so the original
   implementation remains untouched there. */
export function MetaballAnimation({
  bgHex = '#1a1a1a',
  scale = 1,
  mode = 'animation2',
  spreadProgress = 0,
  animated = true
}) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const spreadRef = useRef(0);

  useEffect(() => {
    spreadRef.current = Math.max(0, Math.min(1, spreadProgress));
  }, [spreadProgress]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    /* Match blob-animation.html exactly */
    canvas.width = 770;
    canvas.height = 440;

    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;
    const geometryScale = Math.min(W / 385, H / 220);

    const N = mode === 'animation2' ? 8 : 6;
    const CX = W * 0.5;
    const CY = H * (mode === 'animation2' ? 0.47 : 0.52);
    const orbitBoost = mode === 'animation2' ? 1.18 : 1.0;
    const baseOA = 78 * scale * orbitBoost * geometryScale;
    const baseOB = 28 * scale * orbitBoost * geometryScale;
    const ALPHA = 0.52;
    const cosA = Math.cos(ALPHA);
    const sinA = Math.sin(ALPHA);
    const SPEED = mode === 'animation2' ? 0.02 : 0.028;
    const sizeScale = mode === 'animation2' ? 0.88 : 1.0;
    const MAX_RY = 22 * scale * sizeScale * geometryScale;
    const MIN_RY = 3.2 * scale * sizeScale * geometryScale;
    const MAX_SQ_ANIM1 = 1.9;
    const MAX_SQ_ANIM2 = 1.9;
    const MIN_SQ = 1.0;
    const THRESH = 1.0;
    const EDGE = 0.2;

    const h = bgHex.replace('#', '');
    const BGr = parseInt(h.slice(0, 2), 16);
    const BGg = parseInt(h.slice(2, 4), 16);
    const BGb = parseInt(h.slice(4, 6), 16);
    const FGr = 56;
    const FGg = 56;
    const FGb = 56;

    const blobX = new Float32Array(N);
    const blobY = new Float32Array(N);
    const blobRx = new Float32Array(N);
    const blobRy = new Float32Array(N);
    const blobC = new Float32Array(N);
    const blobS = new Float32Array(N);
    const blobPatternJitter = new Float32Array(N);
    const DITHER_GRID = 8;
    const ditherRank = new Float32Array(DITHER_GRID * DITHER_GRID);
    const ditherLevels = [0.12, 0.28, 0.44, 0.6, 0.78];
    const imgData = ctx.createImageData(W, H);
    const px = imgData.data;
    let angle = 0;
    const smoothstep = (v) => {
      const t = Math.max(0, Math.min(1, v));
      return t * t * (3 - 2 * t);
    };
    const smootherstep = (v) => {
      const t = Math.max(0, Math.min(1, v));
      return t * t * t * (t * (t * 6 - 15) + 10);
    };

    {
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

      const seed = 0;
      order[0] = seed;
      used[seed] = 1;

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

      for (let rank = 0; rank < DITHER_GRID * DITHER_GRID; rank++) {
        ditherRank[order[rank]] = rank / (DITHER_GRID * DITHER_GRID - 1);
      }
    }

    for (let i = 0; i < N; i++) {
      const hh = ((i * 73 + 41) % 97) / 97;
      blobPatternJitter[i] = (hh - 0.5) * 0.05;
    }

    function updateBlobs() {
      const progress = spreadRef.current;
      const eased = smootherstep(progress);
      const spreadFactor = mode === 'animation2'
        ? 1 + Math.pow(eased, 1.18) * 3.0
        : 1 + Math.pow(eased, 1.05) * 2.2;
      const OA = baseOA * spreadFactor;
      const OB = baseOB * spreadFactor;
      for (let i = 0; i < N; i++) {
        const theta = angle + (i / N) * Math.PI * 2;
        const u = OA * Math.cos(theta);
        const v = OB * Math.sin(theta);
        blobX[i] = CX + u * cosA - v * sinA;
        blobY[i] = CY + u * sinA + v * cosA;
        const phase = (Math.sin(theta) + 1) * 0.5;
        const ry = MIN_RY + phase * (MAX_RY - MIN_RY);
        blobRy[i] = ry;
        const maxSq = mode === 'animation2' ? MAX_SQ_ANIM2 : MAX_SQ_ANIM1;
        blobRx[i] = ry * (MIN_SQ + (1 - phase) * (maxSq - MIN_SQ));
        const tx = -OA * Math.sin(theta) * cosA - OB * Math.cos(theta) * sinA;
        const ty = -OA * Math.sin(theta) * sinA + OB * Math.cos(theta) * cosA;
        const rot = Math.atan2(ty, tx);
        blobC[i] = Math.cos(-rot);
        blobS[i] = Math.sin(-rot);
      }
    }

    function render() {
      let p = 0;
      for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
          let sum = 0;
          let maxInfluence = 0;
          let domWx = 0;
          let domWy = 0;
          let domIdx = 0;
          for (let i = 0; i < N; i++) {
            const dx = x - blobX[i];
            const dy = y - blobY[i];
            const lx = dx * blobC[i] - dy * blobS[i];
            const ly = dx * blobS[i] + dy * blobC[i];
            const rx = blobRx[i];
            const ry = blobRy[i];
            const ex = lx / rx;
            const ey = ly / ry;
            const influence = 1.0 / (ex * ex + ey * ey + 1e-9);
            sum += influence;
            if (influence > maxInfluence) {
              maxInfluence = influence;
              domWx = dx / rx;
              domWy = dy / ry;
              domIdx = i;
            }
          }

          const threshold = mode === 'animation2' ? 1.0 : THRESH;
          const field = sum;
          let t = 0;
          let tHard = 0;
          if (mode === 'animation2') {
            const hardEdge = 0.03;
            tHard = (field - (threshold - hardEdge)) / (hardEdge * 2);
            if (tHard < 0) tHard = 0;
            else if (tHard > 1) tHard = 1;
            t = tHard;
          } else {
            const edgeWidth = EDGE;
            t = (field - (threshold - edgeWidth)) / (edgeWidth * 2);
            if (t < 0) t = 0;
            else if (t > 1) t = 1;
          }

          if (mode === 'animation2') {
            if (tHard <= 0.001) {
              px[p++] = BGr;
              px[p++] = BGg;
              px[p++] = BGb;
              px[p++] = 255;
              continue;
            }

            const ex = Math.max(-1, Math.min(1, domWx));
            const ey = Math.max(-1, Math.min(1, domWy));
            const rr = Math.min(1, ex * ex + ey * ey);
            const nz = Math.sqrt(Math.max(0, 1 - rr));
            const lightX = -0.22;
            const lightY = -0.72;
            const lightZ = 0.56;
            const ndlRaw = ex * lightX + ey * lightY + nz * lightZ;
            const ndl = Math.max(0, Math.min(1, ndlRaw));
            const body = Math.max(0, Math.min(1, (t - 0.04) / 0.96));
            const hx = ex + 0.06;
            const hy = ey + 0.52;
            const offCenterHighlight = Math.exp(-((hx * hx + hy * hy) / 0.045));
            const cavity = Math.max(0, Math.min(1, (sum - 1.5) / 1.9));
            const form = Math.max(
              0,
              Math.min(
                1,
                0.1 +
                0.26 * body +
                0.32 * ndl +
                0.4 * offCenterHighlight -
                0.14 * cavity
              )
            );
            const brightness = Math.max(0, Math.min(1, Math.pow(form, 0.9)));

            const baseTone = 208;
            const rankVal = ditherRank[(x & 7) + ((y & 7) << 3)];
            const patternThreshold = Math.max(0, Math.min(1, rankVal + blobPatternJitter[domIdx]));
            const continuousStep = brightness * 4;
            const baseStep = Math.max(0, Math.min(4, Math.floor(continuousStep)));
            const nextStep = Math.min(4, baseStep + 1);
            const stepFrac = continuousStep - baseStep;
            const blendNoise = ((((x * 37 + y * 91) & 31) / 31) * 0.65) + (rankVal * 0.35);
            const stepped = (stepFrac > blendNoise && baseStep < 4) ? nextStep : baseStep;
            const density = Math.max(0, ditherLevels[stepped] - 0.05);
            const dotOn = patternThreshold < density;
            const tone = dotOn ? baseTone : BGr;

            const fadeProgress = Math.max(0, Math.min(1, (spreadRef.current - 0.05) / 0.75));
            const easedFade = smootherstep(fadeProgress);
            const fadeToBg = 1 - easedFade * 0.998; /* almost fully blend to background */
            const finalAlpha = (tHard >= 0.5 ? 1 : 0) * fadeToBg;
            const mixed = BGr + (tone - BGr) * finalAlpha;
            px[p++] = mixed | 0;
            px[p++] = mixed | 0;
            px[p++] = mixed | 0;
          } else {
            px[p++] = (BGr + (FGr - BGr) * t) | 0;
            px[p++] = (BGg + (FGg - BGg) * t) | 0;
            px[p++] = (BGb + (FGb - BGb) * t) | 0;
          }
          px[p++] = 255;
        }
      }
      ctx.putImageData(imgData, 0, 0);
    }

    if (!animated) {
      updateBlobs();
      render();
      return undefined;
    }

    function frame() {
      angle += SPEED;
      updateBlobs();
      render();
      rafRef.current = requestAnimationFrame(frame);
    }

    rafRef.current = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(rafRef.current);
  }, [bgHex, scale, mode, animated]);

  return (
    <canvas
      ref={canvasRef}
      width={640}
      height={366}
      style={{ width: '100%', height: 'auto', display: 'block' }}
    />
  );
}

export function Animation1({ bgHex = '#1a1a1a', scale = 1 }) {
  return <MetaballAnimation bgHex={bgHex} scale={scale} mode="animation1" />;
}

export function Animation2({ bgHex = '#1a1a1a', scale = 1, spreadProgress = 0 }) {
  return (
    <MetaballAnimation
      bgHex={bgHex}
      scale={scale}
      mode="animation2"
      spreadProgress={spreadProgress}
    />
  );
}

export default Animation2;
