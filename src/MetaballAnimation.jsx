import { useEffect, useRef } from 'react';

/* Standalone copy of the portfolio metaball renderer.
   This is intentionally duplicated from Portfolio.jsx so the original
   implementation remains untouched there. */
export function MetaballAnimation({
  bgHex = '#1a1a1a',
  scale = 1,
  mode = 'animation2',
  spreadProgress = 0,
  /* Process steps (optional): 0 a small ring seen from straight above, nearly
     still; 1 the ring widens and the forms grow; 2 the view tips into the normal
     orbit (the hero's own animation) and it turns. Eased. */
  stage = null,
  animated = true,
  /* Leave the ground transparent so a background (e.g. the hero video) shows
     through; only the dots are painted. */
  transparentBg = false,
  /* Every cycle the orbit gathers into one ring, holds, and lets go. */
  formLogo = false,
  /* Open on an empty canvas and let the dither density rise, so the orbiting
     forms condense out of the grain. */
  intro = false,
  /* Stretches the orbit horizontally only (blob sizes and height unchanged), so
     the forms can fill a wider column without clipping top or bottom. */
  orbitWidth = 1,
  /* Scales every blob (not the orbit), so a wider orbit can keep its forms
     substantial instead of looking sparse. */
  blobScale = 1,
  /* Pointer response: the light on the forms turns toward the cursor and the
     nearest forms ease out of its way. Shapes are never merged or pulled. */
  interactive = false,
  /* Cursor as camera: left/right spins the model a full turn round its orbit,
     with a slight lean and viewpoint change. The orbit keeps lying flat, so the
     forms keep their size and never bunch up; the light stays put, so the
     dither never flickers. */
  viewControl = false
}) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const spreadRef = useRef(0);
  const stageRef = useRef(stage);
  useEffect(() => {
    stageRef.current = stage;
  }, [stage]);

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

    /* With stages (Process) each of the 8 forms is three blobs: apart they are the
       24 small dots of Context, stacked they act as one form (three blobs at
       r / sqrt(3) on one point give the same field as one blob at r). */
    const staged = stageRef.current != null && mode === 'animation2';
    const SLOTS = 8;
    const G = staged ? 3 : 1;
    const N = mode === 'animation2' ? SLOTS * G : 6;
    const CX = W * 0.5;
    const CY = H * (mode === 'animation2' ? 0.47 : 0.52);
    const orbitBoost = mode === 'animation2' ? 1.18 : 1.0;
    const baseOA = 78 * scale * orbitBoost * geometryScale * orbitWidth;
    const baseOB = 28 * scale * orbitBoost * geometryScale;
    // a wider orbit tilts less, so its height (and the canvas top/bottom) stays clear
    const ALPHA = 0.52 / Math.pow(orbitWidth, 1.4);
    const SPEED = mode === 'animation2' ? 0.02 : 0.028;
    const sizeScale = mode === 'animation2' ? 0.88 : 1.0;
    const MAX_RY = 22 * scale * sizeScale * geometryScale * blobScale;
    const MIN_RY = 3.2 * scale * sizeScale * geometryScale * blobScale;
    const MAX_SQ_ANIM1 = 1.9;
    const MAX_SQ_ANIM2 = 1.9;
    const MIN_SQ = 1.0;
    const THRESH = 1.0;
    const EDGE = 0.2;

    /* Ring cycle (seconds): orbit, gather, hold, release. The blobs space out
       evenly on one circle and merge into a single ring with an open centre.
       Blob radius = 0.3 x ring radius: neighbours' fields bridge (~1.2 at the
       midpoint), the centre stays under threshold (~0.72), so it reads as one
       continuous loop, never as separate balls. */
    const LOGO_ORBIT = 7;
    const LOGO_GATHER = 1.6;
    const LOGO_HOLD = 2.4;
    const LOGO_RELEASE = 1.6;
    const LOGO_CYCLE = LOGO_ORBIT + LOGO_GATHER + LOGO_HOLD + LOGO_RELEASE;
    const RING_R = 88 * geometryScale * scale * 0.5;
    const RING_BLOB = RING_R * 0.3;
    let elapsed = 0;
        // dot density rises from nothing: the forms condense out of the grain
    // starts after the hero column's own fade-in, so the condensing is seen
    const EMERGE_DELAY = 0.8;
    const EMERGE = 2.4;
    const emergeK = () => (intro ? smootherstep((elapsed - EMERGE_DELAY) / EMERGE) : 1);
    const logoMix = () => {
      const c = elapsed % LOGO_CYCLE;
      if (c < LOGO_ORBIT) return 0;
      if (c < LOGO_ORBIT + LOGO_GATHER) return smootherstep((c - LOGO_ORBIT) / LOGO_GATHER);
      if (c < LOGO_ORBIT + LOGO_GATHER + LOGO_HOLD) return 1;
      return 1 - smootherstep((c - LOGO_ORBIT - LOGO_GATHER - LOGO_HOLD) / LOGO_RELEASE);
    };

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

    // pointer in canvas pixels; `hover` eases 0..1 so every response fades in/out
    let pointerX = 0;
    let pointerY = 0;
    let pointerIn = false;
    let hover = 0;
    let lightX = -0.22;
    let lightY = -0.72;
    let lightZ = 0.56;
    const REPEL_R = 150; // canvas px around the cursor
    const REPEL_PUSH = 34; // max nudge, canvas px
    const onPointer = (e) => {
      const r = canvas.getBoundingClientRect();
      const pad = 120; // react a little before the cursor reaches the forms
      pointerIn = e.clientX > r.left - pad && e.clientX < r.right + pad && e.clientY > r.top - pad && e.clientY < r.bottom + pad;
      pointerX = ((e.clientX - r.left) / r.width) * W;
      pointerY = ((e.clientY - r.top) / r.height) * H;
    };
    const onLeave = () => {
      pointerIn = false;
    };
    if ((interactive || viewControl) && animated) {
      window.addEventListener('pointermove', onPointer, { passive: true });
      window.addEventListener('pointerdown', onPointer, { passive: true });
      document.addEventListener('pointerleave', onLeave);
    }
    // camera state for viewControl, eased toward the cursor
    const BASE_RATIO = baseOB / baseOA; // the orbit's resting minor/major ratio
    let yaw = 0;
    let ratio = BASE_RATIO;
    let spin = 0; // extra phase along the orbit
    let roll = 0; // small lean of the orbit's axis
    const updateView = () => {
      const k = viewControl ? hover : 0;
      const nx = Math.max(-1, Math.min(1, (pointerX - CX) / (W * 0.5)));
      const ny = Math.max(-1, Math.min(1, (pointerY - CY) / (H * 0.5)));
      // left/right turns the model a full revolution: the forms travel round
      // the orbit, which stays lying flat, so nothing shrinks or bunches up
      const spinT = nx * Math.PI * k;
      const rollT = (nx * 0.18 + ny * 0.1) * k; // ~±15 deg in total
      // up/down nudges the viewpoint, kept within ±25% so blobs never merge
      const ratioT = BASE_RATIO * (1 - ny * 0.25 * k);
      spin += (spinT - spin) * 0.05;
      roll += (rollT - roll) * 0.05;
      ratio += (ratioT - ratio) * 0.05;
      yaw = roll;
    };
    const updateLight = () => {
      hover += ((pointerIn ? 1 : 0) - hover) * 0.08;
      updateView();
      if (!interactive) return;
      // default light comes from the upper left; with the cursor in, it comes from
      // the cursor's side of the canvas centre
      let dx = (pointerX - CX) / (W * 0.5);
      let dy = (pointerY - CY) / (H * 0.5);
      const len = Math.hypot(dx, dy) || 1;
      if (len > 1) {
        dx /= len;
        dy /= len;
      }
      const tx = -0.22 + (dx * 0.8 - -0.22) * hover;
      const ty = -0.72 + (dy * 0.8 - -0.72) * hover;
      const n = Math.hypot(tx, ty, 0.56) || 1;
      lightX = tx / n;
      lightY = ty / n;
      lightZ = 0.56 / n;
    };

    let speedNow = 1;
    let topNow = 0;
    const STAGES = [
      // Context: seen from straight above, a small ring of equal forms, nearly
      // still. Position: the same ring scaled up ~1.7x as a whole (ring and forms by
      // one factor, so the spacing holds and no two forms touch). Expression: the
      // view tips into the hero's orbit and it turns again.
      // From above, ring + form must fit half the canvas height less a 12px
      // margin (208). Orbit 1 is ~335 here and forms are ~0.19 of the ring radius
      // (they merge above ~0.35), so Position uses 0.52 and Context 0.3.
      { orbit: 0.3, blob: 0.51, top: 1, speed: 0.12 }, // 24 dots (see dotRy), not 8 forms
      { orbit: 0.52, blob: 0.88, top: 1, speed: 0.12 },
      { orbit: 1, blob: 1, speed: 1 }
    ];
    /* Each stage value is a timed tween (cubic in-out) rather than a per-frame
       chase, and the values are staggered so each move reads on its own:
         into Position    grow, then the neighbours trade places
         into Expression  the view tips first, then the orbit opens and turns
         into Context     the trade unwinds, then the ring shrinks back
       [delay, duration] in seconds per target stage. */
    const CHOREO = [
      // back to Context: unweave, shrink the ring, then split into the 24 dots
      { orbit: [0.5, 1.2], blob: [0.5, 1.2], top: [0, 0.9], speed: [0, 0.8], swap: [0, 1.3], merge: [1.3, 1.0] },
      // into Position: the dots gather into 8 forms, the ring grows, then they trade places
      { orbit: [0.8, 1.2], blob: [0.8, 1.2], top: [0, 0.9], speed: [0, 0.8], swap: [1.5, 1.5], merge: [0, 1.0] },
      { orbit: [0.35, 1.4], blob: [0.35, 1.4], top: [0, 1.3], speed: [0.6, 1.4], swap: [0, 0.1], merge: [0, 0.1] }
    ];
    const targetsOf = (k) => {
      const st = STAGES[k];
      return { orbit: st.orbit, blob: st.blob, top: st.top || 0, speed: st.speed ?? 1, swap: k >= 1 ? 1 : 0, merge: k >= 1 ? 1 : 0 };
    };
    const nowS = () => performance.now() / 1000;
    const easeInOut = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
    const startStage = stageRef.current ?? 2;
    const tw = {};
    Object.entries(targetsOf(startStage)).forEach(([key, v]) => {
      tw[key] = { from: v, to: v, start: 0, dur: 1 };
    });
    let tweenStage = startStage;
    const valueOf = (key, t) => {
      const w = tw[key];
      const x = Math.max(0, Math.min(1, (t - w.start) / w.dur));
      return w.from + (w.to - w.from) * easeInOut(x);
    };

    function updateBlobs() {
      const t = nowS();
      const want = stageRef.current ?? 2;
      if (want !== tweenStage) {
        const tg = targetsOf(want);
        Object.keys(tw).forEach((key) => {
          const [delay, dur] = CHOREO[want][key];
          tw[key] = { from: valueOf(key, t), to: tg[key], start: t + delay, dur };
        });
        tweenStage = want;
      }
      const stageOrbit = valueOf('orbit', t);
      const stageBlob = valueOf('blob', t);
      const stageTop = valueOf('top', t);
      const stageSpeed = valueOf('speed', t);
      const stageSwap = valueOf('swap', t);
      const stageMerge = valueOf('merge', t);
      speedNow = stageSpeed;
      topNow = stageTop;
      /* Into Position the forms trade places with their neighbours: even ones step
         one slot clockwise, odd ones one slot back, weaving past each other (one
         set on an inner lane, one on an outer, both smaller mid-pass) so no two
         touch. Back to Context it unwinds. */
      const swapT = Math.max(0, Math.min(1, stageSwap));
      const swapMid = Math.sin(Math.PI * swapT);
      // bird's-eye blend: the view ratio opens toward 1 (a circle seen from above)
      const viewRatio = ratio + (1 - ratio) * stageTop;
      const progress = spreadRef.current;
      const eased = smootherstep(progress);
      /* animation2 spreads only ~1.5x and shrinks the blobs as it goes, so they
         thin out and fade before reaching the canvas edge instead of being cut
         off by it. */
      const spreadFactor = mode === 'animation2'
        ? 1 + Math.pow(eased, 1.18) * 0.55
        : 1 + Math.pow(eased, 1.05) * 2.2;
      const shrink = mode === 'animation2' ? 1 - 0.6 * eased : 1;
      const OA = baseOA * spreadFactor;
      const OB = baseOB * spreadFactor;
      // the orbit is complete from the first frame; the intro only fades the
      // dither in (see emerge in render), so no in-between shapes ever form
      let a0 = OA * stageOrbit;
      // from above the orbit's minor axis opens up to its major one: a circle
      let b0 = (OA * ratio * (OB / OA / BASE_RATIO) * (1 - stageTop) + OA * stageTop) * stageOrbit;
      const al = ALPHA + yaw;
      const ca = Math.cos(al);
      const sa = Math.sin(al);
      // keep the turned orbit inside the canvas: shrink it only if its extent
      // (plus blob size) would cross an edge
      const extX = Math.hypot(a0 * ca, b0 * sa);
      const extY = Math.hypot(a0 * sa, b0 * ca);
      // the tilted orbit needs room for forms swinging above and below it; seen
      // from above it does not, so the margin closes in and the ring can be larger.
      // From above the reach is exact: the outer weaving lane plus a form's own
      // radius, so nothing is ever cut off at the canvas edge.
      const mX = 75 + (6 - 75) * stageTop;
      const mY = 85 + (6 - 85) * stageTop;
      const reachR = ((MIN_RY + MAX_RY) * 0.5) * stageBlob * (1 - 0.45 * swapMid) * stageTop;
      const lanePad = 1 + 0.16 * swapMid;
      const fit = Math.min(1, (W * 0.5 - mX) / (extX * lanePad + reachR), (H * 0.5 - mY) / (extY * lanePad + reachR));
      // scale the whole system (orbit and blobs alike) so the form is identical,
      // just smaller, when the turned orbit needs to fit
      a0 *= fit;
      b0 *= fit;
      // front/back size difference reads as perspective; looking down there is none
      const persp = Math.max(0, Math.min(1.2, (1 - viewRatio) / (1 - BASE_RATIO)));
      const midRy = (MIN_RY + MAX_RY) * 0.5;
      // Context dots: about 0.075 of the ring radius, so 24 of them stay apart
      const dotRy = 0.075 * a0;
      for (let i = 0; i < N; i++) {
        const g = Math.floor(i / G);
        const m = i % G;
        const dir = g % 2 === 0 ? 1 : -1;
        // apart: the three members spread over their slot's arc; merged: one point
        const memberArc = (m - (G - 1) / 2) * ((Math.PI * 2) / (SLOTS * G)) * (1 - stageMerge);
        const theta = angle + spin + (g / SLOTS) * Math.PI * 2 + memberArc + dir * swapT * ((Math.PI * 2) / SLOTS);
        const lane = 1 - dir * 0.16 * swapMid;
        const u = a0 * lane * Math.cos(theta);
        const v = b0 * lane * Math.sin(theta);
        blobX[i] = CX + u * ca - v * sa;
        blobY[i] = CY + u * sa + v * ca;
        const phase = (Math.sin(theta) + 1) * 0.5;
        const ryForm = (midRy + (MIN_RY + phase * (MAX_RY - MIN_RY) - midRy) * persp) * shrink * fit * stageBlob * (1 - 0.45 * swapMid);
        const ry = staged ? dotRy + (ryForm / Math.sqrt(G) - dotRy) * stageMerge : ryForm;
        blobRy[i] = ry;
        const maxSq = mode === 'animation2' ? MAX_SQ_ANIM2 : MAX_SQ_ANIM1;
        blobRx[i] = ry * (1 + (MIN_SQ + (1 - phase) * (maxSq - MIN_SQ) - 1) * Math.min(1, persp));
        const tx = -a0 * Math.sin(theta) * ca - b0 * Math.cos(theta) * sa;
        const ty = -a0 * Math.sin(theta) * sa + b0 * Math.cos(theta) * ca;
        const rot = Math.atan2(ty, tx);
        blobC[i] = Math.cos(-rot);
        blobS[i] = Math.sin(-rot);
      }
      if (interactive && hover > 0.001) {
        for (let i = 0; i < N; i++) {
          const dx = blobX[i] - pointerX;
          const dy = blobY[i] - pointerY;
          const d = Math.hypot(dx, dy) || 1;
          if (d >= REPEL_R) continue;
          const f = Math.pow(1 - d / REPEL_R, 2) * REPEL_PUSH * hover;
          blobX[i] += (dx / d) * f;
          blobY[i] += (dy / d) * f;
        }
      }
      if (!formLogo) return;
      // scrolling away wins over the ring: it loosens as the spread takes over
      const m = logoMix() * (1 - smootherstep(Math.min(1, spreadRef.current * 2.5)));
      if (m <= 0) return;
      for (let i = 0; i < N; i++) {
        // the ring turns slowly with the orbit angle, so it stays alive while held
        const a = (i / N) * Math.PI * 2 + angle * 0.35;
        const tx = CX + Math.cos(a) * RING_R;
        const ty = CY + Math.sin(a) * RING_R;
        blobX[i] += (tx - blobX[i]) * m;
        blobY[i] += (ty - blobY[i]) * m;
        // stretched along the circle so neighbours blend into one smooth band
        // instead of eight scalloped lobes
        blobRx[i] += (RING_BLOB * 1.5 - blobRx[i]) * m;
        blobRy[i] += (RING_BLOB * 0.85 - blobRy[i]) * m;
        const rot = a + Math.PI / 2;
        const c = blobC[i] + (Math.cos(-rot) - blobC[i]) * m;
        const sn = blobS[i] + (Math.sin(-rot) - blobS[i]) * m;
        const len = Math.hypot(c, sn) || 1;
        blobC[i] = c / len;
        blobS[i] = sn / len;
      }
    }

    function render() {
      const emerge = emergeK();
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
              px[p++] = transparentBg ? 0 : 255;
              continue;
            }

            const ex = Math.max(-1, Math.min(1, domWx));
            const ey = Math.max(-1, Math.min(1, domWy));
            const rr = Math.min(1, ex * ex + ey * ey);
            const nz = Math.sqrt(Math.max(0, 1 - rr));
            const ndlRaw = ex * lightX + ey * lightY + nz * lightZ;
            const ndl = Math.max(0, Math.min(1, ndlRaw));
            const body = Math.max(0, Math.min(1, (t - 0.04) / 0.96));
            // the highlight sits where the light hits (upper left by default)
            const hx = ex - lightX * 0.7;
            const hy = ey - lightY * 0.7;
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
            // from above the forms are plain spheres: the diagonal grain gives way
            // to the even blue-noise rank so the dots read clean
            const grain = 0.65 * (1 - 0.8 * topNow);
            const blendNoise = ((((x * 37 + y * 91) & 31) / 31) * grain) + (rankVal * (1 - grain));
            const stepped = (stepFrac > blendNoise && baseStep < 4) ? nextStep : baseStep;
            const density = Math.max(0, ditherLevels[stepped] - 0.05) * emerge;
            const dotOn = patternThreshold < density;
            const tone = dotOn ? baseTone : BGr;

            const fadeProgress = Math.max(0, Math.min(1, spreadRef.current / 0.6));
            const easedFade = smootherstep(fadeProgress);
            const fadeToBg = 1 - easedFade * 0.998; /* almost fully blend to background */
            const finalAlpha = (tHard >= 0.5 ? 1 : 0) * fadeToBg;
            const mixed = BGr + (tone - BGr) * finalAlpha;
            px[p++] = mixed | 0;
            px[p++] = mixed | 0;
            px[p++] = mixed | 0;
            if (transparentBg) {
              px[p++] = dotOn ? Math.round(255 * finalAlpha) : 0;
              continue;
            }
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

    let lastT = null;
    function frame(now) {
      if (lastT != null) elapsed += Math.min(0.1, (now - lastT) / 1000);
      lastT = now;
      // the orbit slows while the ring holds, so the release picks up where it left off
      angle += SPEED * speedNow * (1 - 0.85 * (formLogo ? logoMix() : 0));
      updateLight();
      updateBlobs();
      render();
      rafRef.current = requestAnimationFrame(frame);
    }

    rafRef.current = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('pointermove', onPointer);
      window.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('pointerleave', onLeave);
    };
  }, [bgHex, scale, mode, animated, transparentBg, formLogo, intro, orbitWidth, blobScale, interactive, viewControl, stage == null]);

  return (
    <canvas
      ref={canvasRef}
      width={640}
      height={366}
      // nearest-neighbour scaling keeps the 1px dither crisp when the hero tilts it
      style={{ width: '100%', height: 'auto', display: 'block', imageRendering: 'pixelated' }}
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
