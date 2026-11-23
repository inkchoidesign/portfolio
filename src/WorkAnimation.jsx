import { useEffect, useRef } from 'react';

/* Order, disorder, order.

   The loop is one idea: a system that starts perfectly ordered, opens up into
   something tangled, and resolves again. It's the page's own line ("clarity and
   structure") drawn as a diagram.

     circles   concentric circles seen straight on, every planet lined up on one
               ray, one planet singled out with a target ring. Held.
     gyroscope each orbit tips into its own steeply inclined plane while the camera
               swings down toward edge-on, so the rings cross like a gyroscope and
               the whole tangle turns
     line      the inclinations close with the camera edge-on: every ring is
               coplanar again and the system reads as one line of planets
     gyroscope the rings tip out again as the camera swings back up
     circles   the inclinations close face-on and the tangle snaps into circles

   Two ordered beats (line, circles: the same geometry from two angles) with a
   tangle on BOTH transitions, as the reference cuts it. The loop is short; the
   reference runs a full cycle in about seven seconds.

   The planets never travel along their orbits. They sit on one ray (three
   o'clock) the whole time, as in the reference: all the apparent motion is the
   rings tipping and the camera turning, and the moment those stop, the planets are
   simply in a line again. The camera also parks during both holds, so the ordered
   beats are genuinely still.

   The camera is orthographic and every ring is centred on the body, so the rings
   are concentric with it at every angle, not just at rest.

   The body keeps the hero's dither and stepped-tone mapping. Rings are uniform
   hairlines with only a light depth cue; planets are plain discs. */

const W = 440; // square: the outer ring (r 208) fills the box edge to edge, so the box IS the drawing
const H = 440;
const TAU = Math.PI * 2;
const DITHER_GRID = 8;
const SPHERE_R = 42;

const LOOP = 9; // seconds for one circles -> line -> circles cycle
/* Where the loop is when the page lands. Arriving at the alignment itself meant
   arriving at the one moment with the least motion; landing here instead drops the
   viewer into the system closing back down, and the alignment lands ~6s later. */
const START_PHASE = 0.72;
/* Beat map, as fractions of the loop. The inclinations open on both swings and
   close at both ordered beats; the camera lean is what tells the two apart.
   0.00-0.28 circles held / 0.28-0.64 tangle down into the line / 0.64-0.70 line
   held / 0.70-1.00 tangle back up into the circles. */
const INC_A = [0.28, 0.42, 0.52, 0.64]; // first tangle: open start/end, close start/end
const INC_B = [0.7, 0.8, 0.88, 1.0];   // second tangle
const LEAN_OPEN = [0.36, 0.58];        // camera face-on -> edge-on
const LEAN_CLOSE = [0.74, 0.94];       // camera edge-on -> face-on
const SPIN_PERIOD = 58; // seconds per rotation of the body itself
const AXIS_ROLL = -0.42;
const AXIS_LEAN = 0.34;

const ORBIT_COUNT = 5; // arrays below must have this many entries
const R_INNER = 70;
const R_OUTER = 208; // fits the 220px half-height at every tilt: a circle never projects wider than its radius

/* Where each orbit tips to when the system opens, and which way. Large and
   distinct on purpose: the gyroscope beat needs rings standing nearly upright
   against rings lying nearly flat, all crossing through the body. */
const INCLINATION = [0.95, -1.25, 0.6, -0.85, 1.35];
/* Small per-orbit delay on the open/close so the rings don't all tip as one
   plate. Kept short so every ring is still fully coplanar for the line beat. */
const OPEN_DELAY = [0.0, 0.02, 0.035, 0.01, 0.03];
const NODE = [0, 1.1, 2.3, -0.9, -2.1];
const FOCUS = 2; // the planet that gets the target ring, as in the reference
/* Camera lean at full swing. pi/2 is exactly edge-on, which is the line beat: with
   every ring coplanar the whole system collapses to one stroke through the body. */
const MAX_TILT = Math.PI / 2;

const INK = '214,212,208';
const SEGMENTS = 160;
const VS = 3; // vector layer scale

const clamp01 = (v) => Math.max(0, Math.min(1, v));
const smooth = (a, b, x) => {
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

/* 1 at the line, fading to 0 at `width` either side — a thin graticule stroke. */
function lineWeight(v, step, width) {
  const d = Math.abs(v - Math.round(v / step) * step);
  return d < width ? 1 - d / width : 0;
}

/* pose (0..2, optional) holds one beat of the loop instead of playing it; see
   POSES in the effect. Without it the loop runs as before. */
export function WorkAnimation({ bgHex = '#1a1a1a', animated = true, pose = null, focus = FOCUS, ringAlways = false, transparentBg = false }) {
  const canvasRef = useRef(null);
  const vecRef = useRef(null);
  const rafRef = useRef(null);
  const poseRef = useRef(pose);
  const focusRef = useRef(focus);
  useEffect(() => {
    poseRef.current = pose;
  }, [pose]);
  useEffect(() => {
    focusRef.current = focus;
  }, [focus]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    const imgData = ctx.createImageData(W, H);
    /* Rings and planets go on their own canvas at VS x the resolution, so the
       strokes stay hairline-sharp when the box is scaled up; the body keeps the
       base canvas and its dither grid. */
    const vcan = vecRef.current;
    vcan.width = W * VS;
    vcan.height = H * VS;
    const vctx = vcan.getContext('2d');
    vctx.lineCap = 'round';
    const px = imgData.data;

    const hex = bgHex.replace('#', '');
    const BGr = parseInt(hex.slice(0, 2), 16);
    const BGg = parseInt(hex.slice(2, 4), 16);
    const BGb = parseInt(hex.slice(4, 6), 16);
    /* On a light ground the drawing inverts: dark ink, and the body's dots follow
       shadow instead of light. */
    const onLight = BGr > 128;
    const ink = onLight ? '26,26,24' : INK;
    const DOT = onLight ? 34 : 208;

    const ditherRank = buildDitherRank();
    const ditherLevels = [0.12, 0.28, 0.44, 0.6, 0.78];
    const patternJitter = -0.012;

    const CX = W * 0.5;
    const CY = H * 0.5;
    /* The body is filled pixel by pixel, so its centre is the middle of pixel
       (CX, CY), i.e. CX + 0.5. Vector strokes must aim at that same point. */
    const OX = CX + 0.5;
    const OY = CY + 0.5;

    const LX = -0.55;
    const LY = -0.7;
    const LZ = 0.45;

    const cRoll = Math.cos(AXIS_ROLL);
    const sRoll = Math.sin(AXIS_ROLL);
    const cLean = Math.cos(AXIS_LEAN);
    const sLean = Math.sin(AXIS_LEAN);

    const radii = Array.from({ length: ORBIT_COUNT }, (_, i) => R_INNER + ((R_OUTER - R_INNER) * i) / (ORBIT_COUNT - 1));

    function put(x, y, on) {
      if (x < 0 || x >= W || y < 0 || y >= H) return;
      const i = (y * W + x) * 4;
      px[i] = on ? DOT : BGr;
      px[i + 1] = on ? DOT : BGg;
      px[i + 2] = on ? DOT : BGb;
      px[i + 3] = on || !transparentBg ? 255 : 0;
    }

    function renderBody(t) {
      const spin = (t / SPIN_PERIOD) * TAU;
      const cs = Math.cos(spin);
      const ss = Math.sin(spin);

      for (let y = -SPHERE_R; y <= SPHERE_R; y++) {
        for (let x = -SPHERE_R; x <= SPHERE_R; x++) {
          const ex = x / SPHERE_R;
          const ey = y / SPHERE_R;
          const rr = ex * ex + ey * ey;
          if (rr > 1) continue;
          const nz = Math.sqrt(1 - rr);

          const vx = ex;
          const vy = -ey;
          const ax = vx * cRoll + vy * sRoll;
          const ay = -vx * sRoll + vy * cRoll;
          const by = ay * cLean + nz * sLean;
          const bz = -ay * sLean + nz * cLean;
          const cx = ax * cs - bz * ss;
          const cz = ax * ss + bz * cs;
          const lat = Math.asin(Math.max(-1, Math.min(1, by)));
          const lon = Math.atan2(cx, cz);
          const cosLat = Math.cos(lat);

          const meridian = lineWeight(lon, TAU / 12, 0.03) * clamp01(cosLat * 1.5);
          const parallel = lineWeight(lat, TAU / 12, 0.03);
          const grat = Math.max(meridian, parallel);
          const relief = 0.5 + 0.5 * Math.sin(lon * 2 + Math.sin(lat * 3) * 1.4) * Math.cos(lat * 1.6 + 0.7);

          const ndl = clamp01(ex * LX + ey * LY + nz * LZ);
          const rim = Math.pow(1 - nz, 2.6) * 0.14;
          const shade = 0.1 + 0.4 * ndl + rim;
          const lit = clamp01(shade * (0.8 + 0.34 * relief) + 0.17 * grat * (0.35 + ndl));
          const brightness = onLight ? clamp01(0.92 - lit) : lit;

          const px_ = CX + x;
          const py_ = CY + y;
          const rankVal = ditherRank[(px_ & 7) + ((py_ & 7) << 3)];
          const patternThreshold = clamp01(rankVal + patternJitter);
          const continuousStep = brightness * 4;
          const baseStep = Math.max(0, Math.min(4, Math.floor(continuousStep)));
          const nextStep = Math.min(4, baseStep + 1);
          const stepFrac = continuousStep - baseStep;
          const blendNoise = ((((px_ * 37 + py_ * 91) & 31) / 31) * 0.65) + rankVal * 0.35;
          const stepped = stepFrac > blendNoise && baseStep < 4 ? nextStep : baseStep;
          const density = Math.max(0, ditherLevels[stepped] - 0.05);
          put(Math.round(px_), Math.round(py_), patternThreshold < density);
        }
      }
    }

    /* A point on a circle of radius r, put through: the orbit's tilt about its own
       line of nodes, then the camera (a turn about the system axis, then a lean toward
       the viewer). Orthographic. z > 0 is toward the viewer.

       The tilt is Rz(node) * Rx(inc) * Rz(-node): it swings only the tilt AXIS to
       `node`. Applying Rz(node) alone would also spin the planet itself by `node`, so
       with zero tilt the planets would sit scattered instead of lined up on one ray. */
    function project(r, theta, inc, node, camCos, camSin, leanCos, leanSin) {
      const cn = Math.cos(node);
      const sn = Math.sin(node);
      const px0 = r * Math.cos(theta);
      const py0 = r * Math.sin(theta);
      // into the frame whose x-axis is the line of nodes
      const xa = px0 * cn + py0 * sn;
      const ya = -px0 * sn + py0 * cn;
      // tilt about that axis
      const yb = ya * Math.cos(inc);
      const z0 = ya * Math.sin(inc);
      // and back out again
      const x1 = xa * cn - yb * sn;
      const y1 = xa * sn + yb * cn;
      const x2 = x1 * camCos - y1 * camSin;
      const y2 = x1 * camSin + y1 * camCos;
      const y3 = y2 * leanCos - z0 * leanSin;
      const z3 = y2 * leanSin + z0 * leanCos;
      return { x: OX + x2, y: OY - y3, z: z3 };
    }

    /* Hidden only where the body actually covers it: behind the picture plane and
       inside the body's silhouette. */
    function occluded(p) {
      if (p.z >= 0) return false;
      const dx = p.x - OX;
      const dy = p.y - OY;
      return dx * dx + dy * dy < (SPHERE_R + 0.5) * (SPHERE_R + 0.5);
    }

    /* The loop's state at a phase: ring tilt per orbit (0 flat .. 1 full), camera
       turn, camera lean, and the target ring. */
    function loopState(phase) {
      const u = (((phase % LOOP) + LOOP) % LOOP) / LOOP; // 0..1 through the loop
      /* Ring inclination: 0 at both ordered beats (circles, line), 1 through the
         gyroscope. Each ring runs a hair behind the last on the way out and in. */
      const hump = (k, d) => smooth(k[0] + d, k[1] + d, u) * (1 - smooth(k[2] + d, k[3] + d, u));
      const disorder = Array.from({ length: ORBIT_COUNT }, (_, i) => {
        const d = OPEN_DELAY[i];
        /* The second hump must be fully closed by u = 1 (the circles), so its delay
           is taken off the front rather than pushing the close past the loop end. */
        return Math.max(hump(INC_A, d), hump([INC_B[0] + d, INC_B[1] + d, INC_B[2], INC_B[3]], 0));
      });
      /* Camera lean: face-on at the circles, edge-on from mid-gyroscope through the
         line, then back. Closes later than the inclinations so the line gets held. */
      const leanEnv = smooth(LEAN_OPEN[0], LEAN_OPEN[1], u) * (1 - smooth(LEAN_CLOSE[0], LEAN_CLOSE[1], u));
      /* One full turn of the camera per swing, parked through both holds, so the
         ray of planets comes back to three o'clock at the line and at the circles. */
      const camAngle = TAU * (smooth(INC_A[0], INC_A[3], u) + smooth(INC_B[0], INC_B[3], u));
      /* Target ring only while the circles are held. */
      const focusRing = u < 0.5 ? 1 - smooth(0.2, 0.28, u) : smooth(0.95, 0.99, u);
      return { disorder, camAngle, leanEnv, focusRing };
    }

    function renderSystem({ disorder: dis, camAngle, leanEnv, focusRing }, appear) {
      const disorder = (i) => dis[i];
      const camCos = Math.cos(camAngle);
      const camSin = Math.sin(camAngle);
      const lean = MAX_TILT * leanEnv;
      const leanCos = Math.cos(lean);
      const leanSin = Math.sin(lean);

      for (let o = 0; o < ORBIT_COUNT; o++) {
        const r = radii[o];
        const inc = INCLINATION[o] * disorder(o);
        const node = NODE[o];

        let prev = project(r, 0, inc, node, camCos, camSin, leanCos, leanSin);
        for (let i = 1; i <= SEGMENTS; i++) {
          const cur = project(r, (i / SEGMENTS) * TAU, inc, node, camCos, camSin, leanCos, leanSin);
          const mid = { x: (prev.x + cur.x) / 2, y: (prev.y + cur.y) / 2, z: (prev.z + cur.z) / 2 };
          if (!occluded(mid)) {
            const nearness = clamp01((mid.z / r) * 0.5 + 0.5);
            vctx.strokeStyle = `rgba(${ink},${((onLight ? 0.5 + 0.35 * nearness : 0.34 + 0.3 * nearness) * appear).toFixed(3)})`;
            vctx.lineWidth = 0.6;
            vctx.beginPath();
            vctx.moveTo(prev.x, prev.y);
            vctx.lineTo(cur.x, cur.y);
            vctx.stroke();
          }
          prev = cur;
        }
      }

      /* Planets are drawn after every ring so none is ever struck through by one. */
      for (let o = 0; o < ORBIT_COUNT; o++) {
        const r = radii[o];
        const p = project(r, 0, INCLINATION[o] * disorder(o), NODE[o], camCos, camSin, leanCos, leanSin);
        if (occluded(p)) continue;

        const nearness = clamp01((p.z / r) * 0.5 + 0.5);
        const radius = 2.8 + 0.9 * nearness;
        const g = vctx.createRadialGradient(p.x - radius * 0.35, p.y - radius * 0.4, radius * 0.1, p.x, p.y, radius);
        g.addColorStop(0, onLight ? `rgba(90,88,84,${(0.95 * appear).toFixed(3)})` : `rgba(226,224,220,${(0.95 * appear).toFixed(3)})`);
        g.addColorStop(1, onLight ? `rgba(20,20,18,${(0.95 * appear).toFixed(3)})` : `rgba(150,148,144,${(0.95 * appear).toFixed(3)})`);
        vctx.fillStyle = g;
        vctx.beginPath();
        vctx.arc(p.x, p.y, radius, 0, TAU);
        vctx.fill();

        if (o === focusRef.current && focusRing > 0.01) {
          vctx.strokeStyle = `rgba(${ink},${(focusRing * 0.8 * appear).toFixed(3)})`;
          vctx.lineWidth = 0.8;
          vctx.beginPath();
          vctx.arc(p.x, p.y, radius + 5.5, 0, TAU);
          vctx.stroke();
        }
      }
    }

    /* `elapsed` is time since mount (drives the fade-in); `phase` is where that puts
       us in the loop, offset so the page lands mid-motion. */
    function render(elapsed, state) {
      for (let i = 0; i < px.length; i += 4) {
        px[i] = BGr;
        px[i + 1] = BGg;
        px[i + 2] = BGb;
        px[i + 3] = transparentBg ? 0 : 255;
      }
      renderBody(elapsed);
      ctx.putImageData(imgData, 0, 0);
      vctx.setTransform(1, 0, 0, 1, 0, 0);
      vctx.clearRect(0, 0, vcan.width, vcan.height);
      vctx.setTransform(VS, 0, 0, VS, 0, 0);
      const appear = clamp01(elapsed / 1.4);
      renderSystem(state || loopState(START_PHASE * LOOP + elapsed), appear * appear * (3 - 2 * appear));
    }

    /* Pose mode (Process): each pose is one of the loop's beats, held.
         0 tangle  rings tipped, camera half-leaned and slowly turning
         1 line    rings flat, camera edge-on: one stroke through the body
         2 circles rings flat, face-on, the target ring on one planet
       Every value eases toward the pose, rings at slightly different rates so
       they do not tip as one plate. */
    const POSES = [
      { disorder: 1, leanEnv: 0.42, focusRing: 0, turn: 0.22 },
      { disorder: 0, leanEnv: 1, focusRing: 0, turn: 0 },
      { disorder: 0, leanEnv: 0, focusRing: 1, turn: 0 }
    ];
    const live = { disorder: Array(ORBIT_COUNT).fill(0), camAngle: 0, leanEnv: 0, focusRing: 0 };
    const stepPose = (dt) => {
      const target = POSES[poseRef.current] || POSES[0];
      const ease = (rate) => 1 - Math.exp(-dt * rate);
      for (let i = 0; i < ORBIT_COUNT; i++) live.disorder[i] += (target.disorder - live.disorder[i]) * ease(2.6 + i * 0.5);
      live.leanEnv += (target.leanEnv - live.leanEnv) * ease(2.4);
      const ringTarget = ringAlways ? 1 : target.focusRing;
      live.focusRing += (ringTarget - live.focusRing) * ease(ringTarget > live.focusRing ? 1.6 : 6);
      if (target.turn) live.camAngle += target.turn * dt;
      else {
        // park the ray of planets back at three o'clock
        const home = Math.round(live.camAngle / TAU) * TAU;
        live.camAngle += (home - live.camAngle) * ease(2.2);
      }
      return live;
    };
    if (poseRef.current != null) {
      const first = POSES[poseRef.current] || POSES[0];
      live.disorder.fill(first.disorder);
      live.leanEnv = first.leanEnv;
      live.focusRing = first.focusRing;
    }

    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    /* Still frame for reduced motion: the alignment, fully faded in. */
    if (!animated || reduced) {
      if (poseRef.current == null) {
        render((1 - START_PHASE) * LOOP);
        return undefined;
      }
      // reduced motion in pose mode: jump to the pose, redraw on change
      let last = -1;
      const id = setInterval(() => {
        if (poseRef.current === last) return;
        last = poseRef.current;
        const pz = POSES[last] || POSES[0];
        live.disorder.fill(pz.disorder);
        live.leanEnv = pz.leanEnv;
        live.focusRing = pz.focusRing;
        live.camAngle = 0;
        render(10, live);
      }, 200);
      return () => clearInterval(id);
    }

    let start = null;
    let prev = null;
    const frame = (now) => {
      if (start == null) start = now;
      const dt = prev == null ? 0 : Math.min(0.05, (now - prev) / 1000);
      prev = now;
      render((now - start) / 1000, poseRef.current == null ? null : stepPose(dt));
      rafRef.current = requestAnimationFrame(frame);
    };
    rafRef.current = requestAnimationFrame(frame);

    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [bgHex, animated, ringAlways, transparentBg]);

  return (
    <div className="relative" aria-hidden="true">
      <canvas ref={canvasRef} style={{ width: '100%', height: 'auto', display: 'block', imageRendering: 'pixelated' }} />
      <canvas ref={vecRef} className="absolute inset-0" style={{ width: '100%', height: '100%' }} />
    </div>
  );
}
