/**
 * Renders the site's motion media — every clip in data/media.ts — from the
 * original cover plates in public/cover-art/.
 *
 * Adapted from `tools/video/render-showcase.mjs` in the owner's
 * `gireeshkumarreddy/pk` repository (ASSET_CREDITS.md §11): the same idea of a
 * deterministic, frame-exact render drawn on a 2D canvas and piped straight into
 * ffmpeg, so a clip can be rebuilt byte-for-byte rather than re-shot. What it
 * draws is entirely different. Upstream composes a feature film's promotional
 * stills and title art; this composes nothing but this project's own abstract
 * plates and shapes drawn here — a projector beam, dust in the light, a turning
 * reel, a velvet curtain. No footage, no lettering, no faces.
 *
 * Runtime (deliberately not in package.json — the site never needs them):
 *   npm install --no-save @napi-rs/canvas
 *   an ffmpeg with libx264 on PATH, or FFMPEG=/path/to/ffmpeg
 *
 * Usage:
 *   npx tsx scripts/render-reel.mts                 # every clip, into public/media/
 *   npx tsx scripts/render-reel.mts reel-wide       # one output
 *   npx tsx scripts/render-reel.mts --stills        # review stills into /tmp/reel-stills/
 *
 * After a render, `npm run check` confirms the files agree with data/media.ts.
 */

import { spawn } from "node:child_process";
import { once } from "node:events";
import fs from "node:fs";
import path from "node:path";
import { MOTION_MEDIA, type MediaSource, type MotionMedia } from "../data/media.ts";

/* -------------------------------------------------------------------------- */
/* Runtime                                                                     */
/* -------------------------------------------------------------------------- */

type Plate = CanvasImageSource & { width: number; height: number };
type Surface = {
  width: number;
  height: number;
  getContext(type: "2d"): CanvasRenderingContext2D;
  data(): Buffer;
  encode(format: "jpeg" | "png", quality?: number): Promise<Buffer>;
};
type CanvasModule = {
  createCanvas(width: number, height: number): Surface;
  loadImage(source: string): Promise<Plate>;
};

/* A plain string, so the type checker does not insist the optional renderer
   dependency is installed for a project that only builds the site. */
const CANVAS_MODULE: string = "@napi-rs/canvas";
let canvasModule: CanvasModule;
try {
  canvasModule = (await import(CANVAS_MODULE)) as CanvasModule;
} catch {
  console.error("render-reel needs @napi-rs/canvas: npm install --no-save @napi-rs/canvas");
  process.exit(1);
}
const { createCanvas, loadImage } = canvasModule;
const FFMPEG = process.env.FFMPEG || "ffmpeg";

const args = process.argv.slice(2);
const stillsOnly = args.includes("--stills");
const only = args.filter((arg) => !arg.startsWith("--"));

/* -------------------------------------------------------------------------- */
/* Palette — the plates' own inks                                              */
/* -------------------------------------------------------------------------- */

const C = {
  stage: "#0a090b",
  wallTop: "#141011",
  wallLow: "#0c0a0b",
  floor: "#120d0d",
  crimson: [142, 22, 33] as const,
  crimsonDeep: [70, 8, 15] as const,
  crimsonLit: [196, 44, 52] as const,
  coral: "#e04a2f",
  gold: "#c08a35",
  goldLit: "#e2b25c",
  cream: "#efe5d3",
  beam: [255, 226, 182] as const,
};

/* -------------------------------------------------------------------------- */
/* Maths                                                                       */
/* -------------------------------------------------------------------------- */

const TAU = Math.PI * 2;
const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const phase = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
const smooth = (v: number) => v * v * (3 - 2 * v);
const ramp = (t: number, a: number, b: number) => smooth(phase(t, a, b));
const inOut = (v: number) => (v < 0.5 ? 4 * v * v * v : 1 - (-2 * v + 2) ** 3 / 2);
const rgba = (c: readonly number[], a: number) => `rgba(${c[0]},${c[1]},${c[2]},${clamp(a)})`;

/** Seeded PRNG, so every render of a clip is the same render. */
function prng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Smooth pseudo-noise from sines whose periods divide `period`, so a looping
 * clip's flicker and gate weave come back to exactly where they started.
 */
function loopNoise(t: number, period: number, seed: number): number {
  const w = TAU / period;
  return (
    0.5 * Math.sin(w * 3 * t + seed) +
    0.3 * Math.sin(w * 7 * t + seed * 2.1) +
    0.2 * Math.sin(w * 13 * t + seed * 3.7)
  );
}

/* -------------------------------------------------------------------------- */
/* Drawing kit                                                                 */
/* -------------------------------------------------------------------------- */

type Kit = {
  W: number;
  H: number;
  U: number;
  ctx: CanvasRenderingContext2D;
  plates: Map<string, Plate>;
  shadow: Surface;
  vignette: Surface;
};

function makeShadow(): Surface {
  const surface = createCanvas(400, 560);
  const x = surface.getContext("2d");
  x.shadowColor = "rgba(0,0,0,0.95)";
  x.shadowBlur = 70;
  x.fillStyle = "rgba(0,0,0,0.95)";
  x.fillRect(100, 100, 200, 360);
  return surface;
}

function makeVignette(W: number, H: number): Surface {
  const surface = createCanvas(W, H);
  const x = surface.getContext("2d");
  const g = x.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.32, W / 2, H / 2, Math.hypot(W, H) * 0.62);
  g.addColorStop(0, "rgba(0,0,0,0)");
  g.addColorStop(0.7, "rgba(0,0,0,0.28)");
  g.addColorStop(1, "rgba(0,0,0,0.72)");
  x.fillStyle = g;
  x.fillRect(0, 0, W, H);
  return surface;
}

/** A plate drawn by its centre and height, lit to `light` (0 dark → 1 full). */
function plate(
  k: Kit,
  slug: string,
  cx: number,
  cy: number,
  h: number,
  { light = 1, rotate = 0, shadow = 0.75, alpha = 1 }: { light?: number; rotate?: number; shadow?: number; alpha?: number } = {},
) {
  const image = k.plates.get(slug);
  if (!image) throw new Error(`plate ${slug} was not loaded`);
  const w = (h * image.width) / image.height;
  const { ctx } = k;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(cx, cy);
  if (rotate) ctx.rotate(rotate);
  if (shadow > 0) {
    ctx.globalAlpha = alpha * shadow * clamp(light * 1.4);
    /* The sprite's solid core is 200×360 inside a 400×560 canvas. */
    ctx.drawImage(k.shadow as unknown as CanvasImageSource, -w, -h * 0.78 + h * 0.06, w * 2, h * 1.56);
    ctx.globalAlpha = alpha;
  }
  ctx.drawImage(image, -w / 2, -h / 2, w, h);
  if (light < 1) {
    ctx.fillStyle = `rgba(6,5,6,${clamp(1 - light)})`;
    ctx.fillRect(-w / 2 - 0.5, -h / 2 - 0.5, w + 1, h + 1);
  }
  ctx.restore();
  return { w, h };
}

/**
 * A projector or spotlight beam: nested cones from a point, additive, so the
 * edge of the light is soft rather than a cut-out triangle.
 */
function beam(
  k: Kit,
  ox: number,
  oy: number,
  tx: number,
  ty: number,
  spread: number,
  intensity: number,
  warmth: readonly number[] = C.beam,
) {
  if (intensity <= 0.001) return;
  const { ctx } = k;
  const angle = Math.atan2(ty - oy, tx - ox);
  const length = Math.hypot(tx - ox, ty - oy) * 1.5;
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  const layers = [
    { s: spread * 1.6, a: 0.05 },
    { s: spread * 1.25, a: 0.07 },
    { s: spread, a: 0.1 },
    { s: spread * 0.62, a: 0.1 },
  ];
  for (const layer of layers) {
    const ax = ox + Math.cos(angle - layer.s) * length;
    const ay = oy + Math.sin(angle - layer.s) * length;
    const bx = ox + Math.cos(angle + layer.s) * length;
    const by = oy + Math.sin(angle + layer.s) * length;
    const left = Math.max(0, Math.min(ox, ax, bx));
    const top = Math.max(0, Math.min(oy, ay, by));
    const right = Math.min(k.W, Math.max(ox, ax, bx));
    const bottom = Math.min(k.H, Math.max(oy, ay, by));
    if (right <= left || bottom <= top) continue;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(ox, oy);
    ctx.lineTo(ax, ay);
    ctx.lineTo(bx, by);
    ctx.closePath();
    ctx.clip();
    const g = ctx.createRadialGradient(ox, oy, 0, ox, oy, length);
    g.addColorStop(0, rgba(warmth, layer.a * 3.2 * intensity));
    g.addColorStop(0.3, rgba(warmth, layer.a * 1.6 * intensity));
    g.addColorStop(0.75, rgba(warmth, layer.a * 0.55 * intensity));
    g.addColorStop(1, rgba(warmth, 0));
    ctx.fillStyle = g;
    ctx.fillRect(left, top, right - left, bottom - top);
    ctx.restore();
  }
  ctx.restore();
}

/** Where a beam lands: a soft pool of light on the wall behind the subject. */
function pool(k: Kit, x: number, y: number, r: number, intensity: number) {
  if (intensity <= 0.001) return;
  const { ctx } = k;
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, rgba(C.beam, 0.2 * intensity));
  g.addColorStop(0.45, rgba(C.beam, 0.07 * intensity));
  g.addColorStop(1, rgba(C.beam, 0));
  ctx.fillStyle = g;
  ctx.fillRect(x - r, y - r, r * 2, r * 2);
  ctx.restore();
}

type Mote = { x: number; y: number; r: number; drift: number; phase: number; speed: number };

function makeMotes(seed: number, count: number): Mote[] {
  const random = prng(seed);
  return Array.from({ length: count }, () => ({
    x: random(),
    y: random(),
    r: 0.6 + random() * 1.8,
    drift: 0.004 + random() * 0.012,
    phase: random() * TAU,
    speed: 1 + Math.floor(random() * 3),
  }));
}

/**
 * Dust turning in the light. Each mote orbits its own resting point on a
 * period that divides `period`, so a seamless clip's dust is seamless too.
 * Only motes inside the cone are visible, brightest on its axis.
 */
function dust(
  k: Kit,
  motes: Mote[],
  t: number,
  period: number,
  cone: { ox: number; oy: number; tx: number; ty: number; spread: number },
  intensity: number,
) {
  if (intensity <= 0.001) return;
  const { ctx, W, H } = k;
  const axis = Math.atan2(cone.ty - cone.oy, cone.tx - cone.ox);
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  for (const mote of motes) {
    const w = (TAU / period) * mote.speed;
    const x = (mote.x + Math.sin(w * t + mote.phase) * mote.drift * 3) * W;
    const y = (mote.y + Math.cos(w * t * 0.5 + mote.phase) * mote.drift * 2) * H;
    const off = Math.abs(Math.atan2(y - cone.oy, x - cone.ox) - axis);
    if (off > cone.spread) continue;
    const inside = 1 - off / cone.spread;
    const twinkle = 0.55 + 0.45 * Math.sin(w * 2 * t + mote.phase * 3);
    ctx.fillStyle = rgba(C.beam, 0.55 * inside * twinkle * intensity);
    ctx.beginPath();
    ctx.arc(x, y, mote.r * (k.U / 1080), 0, TAU);
    ctx.fill();
  }
  ctx.restore();
}

/** A soft band of light passing across a rectangle (a plate catching the beam). */
function sweep(k: Kit, x: number, y: number, w: number, h: number, progress: number, strength: number) {
  if (progress <= 0 || progress >= 1 || strength <= 0) return;
  const { ctx } = k;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.globalCompositeOperation = "lighter";
  const cx = lerp(x - w * 0.8, x + w * 1.8, progress);
  const g = ctx.createLinearGradient(cx - w * 0.35, y, cx + w * 0.35, y + h * 0.4);
  g.addColorStop(0, "rgba(255,240,215,0)");
  g.addColorStop(0.5, `rgba(255,240,215,${0.22 * strength})`);
  g.addColorStop(1, "rgba(255,240,215,0)");
  ctx.fillStyle = g;
  ctx.fillRect(x, y, w, h);
  ctx.restore();
}

/** The dark room: a warm wall over a darker floor. */
function room(k: Kit, floorY: number) {
  const { ctx, W, H } = k;
  const wall = ctx.createLinearGradient(0, 0, 0, floorY);
  wall.addColorStop(0, C.wallLow);
  wall.addColorStop(1, C.wallTop);
  ctx.fillStyle = wall;
  ctx.fillRect(0, 0, W, floorY);
  const floor = ctx.createLinearGradient(0, floorY, 0, H);
  floor.addColorStop(0, C.floor);
  floor.addColorStop(1, C.stage);
  ctx.fillStyle = floor;
  ctx.fillRect(0, floorY, W, H - floorY);
  /* The skirting line where wall meets floor catches a little light. */
  ctx.fillStyle = "rgba(240,205,160,0.05)";
  ctx.fillRect(0, floorY - 1, W, 2);
}

/** A plate's reflection in the polished floor, fading with depth. */
function reflection(k: Kit, slug: string, cx: number, plateBottom: number, floorY: number, h: number, light: number) {
  const image = k.plates.get(slug)!;
  const w = (h * image.width) / image.height;
  const { ctx } = k;
  const depth = h * 0.42;
  const gap = floorY - plateBottom;
  ctx.save();
  ctx.beginPath();
  ctx.rect(cx - w / 2 - 2, floorY, w + 4, depth);
  ctx.clip();
  ctx.globalAlpha = 0.2 * light;
  ctx.translate(cx, floorY + gap);
  ctx.scale(1, -1);
  ctx.drawImage(image, -w / 2, -h, w, h);
  ctx.restore();
  ctx.save();
  const fade = ctx.createLinearGradient(0, floorY, 0, floorY + depth);
  fade.addColorStop(0, "rgba(18,13,13,0.2)");
  fade.addColorStop(1, "rgba(18,13,13,1)");
  ctx.fillStyle = fade;
  ctx.fillRect(cx - w / 2 - 2, floorY, w + 4, depth + 1);
  ctx.restore();
}

type Ring = { r: number; w: number; segments: number; gap: number; turns: number; color: string; alpha: number };

/** Ring specs. `turns` is whole symmetry steps per loop, so the loop has no seam. */
const RINGS: Ring[] = [
  { r: 1.0, w: 0.012, segments: 72, gap: 0.55, turns: 1, color: C.cream, alpha: 0.55 },
  { r: 0.94, w: 0.05, segments: 6, gap: 0.1, turns: -1, color: rgba(C.crimson, 1), alpha: 1 },
  { r: 0.86, w: 0.022, segments: 12, gap: 0.22, turns: 1, color: C.gold, alpha: 1 },
  { r: 0.79, w: 0.06, segments: 4, gap: 0.16, turns: 1, color: C.coral, alpha: 0.95 },
  { r: 0.7, w: 0.014, segments: 36, gap: 0.5, turns: -2, color: C.cream, alpha: 0.7 },
  { r: 0.64, w: 0.04, segments: 8, gap: 0.3, turns: -1, color: C.gold, alpha: 0.95 },
  { r: 0.56, w: 0.03, segments: 4, gap: 0.12, turns: -1, color: rgba(C.crimsonLit, 1), alpha: 0.95 },
];

/** A turning reel, seen face-on: dashed concentric rings around a lens. */
function reel(k: Kit, cx: number, cy: number, R: number, t: number, period: number, centre: string | null, zoom = 1) {
  const { ctx } = k;
  /* Sunburst behind, slower than everything in front of it. */
  ctx.save();
  ctx.translate(cx, cy);
  const rays = 48;
  /* The pattern repeats every four rays, so a loop turns it by exactly four. */
  ctx.rotate(((t / period) * TAU * 4) / rays);
  for (let i = 0; i < rays; i += 1) {
    if (i % 2) continue;
    const a0 = (i / rays) * TAU;
    const a1 = ((i + 1) / rays) * TAU;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, Math.hypot(k.W, k.H), a0, a1);
    ctx.closePath();
    ctx.fillStyle = i % 4 === 0 ? "rgba(192,138,53,0.075)" : "rgba(142,22,33,0.09)";
    ctx.fill();
  }
  ctx.restore();

  for (const ring of RINGS) {
    const step = TAU / ring.segments;
    const rotation = (t / period) * ring.turns * step;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rotation);
    ctx.globalAlpha = ring.alpha;
    ctx.strokeStyle = ring.color;
    ctx.lineWidth = ring.w * R;
    ctx.lineCap = "butt";
    for (let s = 0; s < ring.segments; s += 1) {
      const a0 = s * step;
      ctx.beginPath();
      ctx.arc(0, 0, ring.r * R, a0, a0 + step * (1 - ring.gap));
      ctx.stroke();
    }
    ctx.restore();
  }

  /* The lens: a gold rim, and the centre plate seen through it. */
  const lens = R * 0.46;
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, lens + R * 0.018, 0, TAU);
  ctx.fillStyle = C.gold;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx, cy, lens, 0, TAU);
  ctx.clip();
  ctx.fillStyle = C.stage;
  ctx.fillRect(cx - lens, cy - lens, lens * 2, lens * 2);
  if (centre) {
    const image = k.plates.get(centre)!;
    const h = lens * 2.6 * zoom;
    const w = (h * image.width) / image.height;
    ctx.drawImage(image, cx - w / 2, cy - h * 0.36, w, h);
  }
  /* Glass: a highlight across the top of the lens. */
  const glass = ctx.createLinearGradient(cx - lens, cy - lens, cx + lens * 0.4, cy + lens * 0.4);
  glass.addColorStop(0, "rgba(255,240,220,0.16)");
  glass.addColorStop(0.45, "rgba(255,240,220,0)");
  ctx.fillStyle = glass;
  ctx.fillRect(cx - lens, cy - lens, lens * 2, lens * 2);
  ctx.restore();
}

/** Velvet curtains drawing closed from both sides. `close` runs 0 → 1. */
function curtain(k: Kit, t: number, close: number, glow: number) {
  if (close <= 0) return;
  const { ctx, W, H } = k;
  const panel = (W / 2) * close + W * 0.012;
  const fold = W * 0.072;
  for (const side of [-1, 1] as const) {
    const count = Math.ceil(panel / fold) + 1;
    for (let i = 0; i < count; i += 1) {
      /* Folds bunch towards the leading edge as the panel travels. */
      const along = i / Math.max(1, count - 1);
      const sway = Math.sin(t * 1.7 + i * 0.9) * fold * 0.05 * (1.1 - close);
      const width = fold * lerp(1.05, 0.92, along);
      const x0 = side < 0 ? panel - (i + 1) * width + sway : W - panel + i * width + sway;
      const g = ctx.createLinearGradient(x0, 0, x0 + width, 0);
      g.addColorStop(0, rgba(C.crimsonDeep, 1));
      g.addColorStop(0.38, rgba(C.crimson, 1));
      g.addColorStop(0.55, rgba(C.crimsonLit, 1));
      g.addColorStop(0.72, rgba(C.crimson, 1));
      g.addColorStop(1, rgba(C.crimsonDeep, 1));
      ctx.fillStyle = g;
      ctx.fillRect(Math.floor(x0), 0, Math.ceil(width) + 1, H);
    }
    /* The leading edge catches the light. */
    const edge = side < 0 ? panel : W - panel;
    const e = ctx.createLinearGradient(edge - side * fold * 0.5, 0, edge, 0);
    e.addColorStop(0, "rgba(255,190,170,0)");
    e.addColorStop(1, "rgba(255,190,170,0.18)");
    ctx.fillStyle = e;
    ctx.fillRect(Math.min(edge, edge - side * fold * 0.5), 0, fold * 0.5, H);
  }
  /* Shade from the top, warmth from the footlights. */
  const shade = ctx.createLinearGradient(0, 0, 0, H);
  shade.addColorStop(0, "rgba(8,3,4,0.72)");
  shade.addColorStop(0.35, "rgba(8,3,4,0.15)");
  shade.addColorStop(0.8, "rgba(8,3,4,0.05)");
  shade.addColorStop(1, "rgba(8,3,4,0.5)");
  ctx.fillStyle = shade;
  ctx.fillRect(0, 0, W, H);
  if (glow > 0) {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    const f = ctx.createRadialGradient(W / 2, H * 1.05, 0, W / 2, H * 1.05, Math.max(W, H) * 0.7);
    f.addColorStop(0, `rgba(255,170,110,${0.28 * glow})`);
    f.addColorStop(1, "rgba(255,170,110,0)");
    ctx.fillStyle = f;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }
}

/** The projector's own artefacts: a breath of flicker, then the vignette. */
function finish(k: Kit, flicker: number, black: number) {
  const { ctx, W, H } = k;
  ctx.drawImage(k.vignette as unknown as CanvasImageSource, 0, 0);
  if (flicker > 0) {
    ctx.fillStyle = `rgba(0,0,0,${clamp(flicker)})`;
    ctx.fillRect(0, 0, W, H);
  }
  if (black > 0) {
    ctx.fillStyle = `rgba(0,0,0,${clamp(black)})`;
    ctx.fillRect(0, 0, W, H);
  }
}

/* -------------------------------------------------------------------------- */
/* Scenes                                                                      */
/* -------------------------------------------------------------------------- */

const REEL_GALLERY = [
  "tu-hai-meri-kiran",
  "jailer-2",
  "cult",
  "frozen-iii",
  "klara-and-the-sun",
  "doraemon-castle-of-the-undersea-devil",
  "street-fighter",
  "wildwood",
];

/** The lamp striking: a few uneven flashes, then steady light. */
function lamp(t: number): number {
  const flashes: [number, number][] = [
    [0.3, 0.55],
    [0.42, 0.08],
    [0.5, 0.85],
    [0.62, 0.25],
    [0.7, 1],
  ];
  if (t < 0.3) return 0;
  let level = 0;
  for (const [at, value] of flashes) if (t >= at) level = value;
  return t > 0.7 ? lerp(level, 1, ramp(t, 0.7, 1.2)) : level;
}

function sceneBeam(k: Kit, t: number, motes: Mote[], period: number) {
  const { W, H, ctx } = k;
  const tall = H > W;
  const floorY = H * (tall ? 0.86 : 0.93);
  const light = lamp(t);
  const push = lerp(1, 1.07, inOut(phase(t, 0, 5.2)));

  room(k, floorY);
  ctx.save();
  ctx.translate(W / 2, H * 0.54);
  ctx.scale(push, push);
  ctx.translate(-W / 2, -H * 0.54);

  const cx = W / 2;
  const cy = H * (tall ? 0.5 : 0.54);
  const h = H * (tall ? 0.5 : 0.8);
  pool(k, cx, cy, h * 0.95, light);
  const drawn = plate(k, "coco-2", cx, cy, h, { light: 0.06 + 0.94 * light, shadow: 0.8 });
  sweep(k, cx - drawn.w / 2, cy - h / 2, drawn.w, h, phase(t, 2.4, 4.4), light);
  ctx.restore();

  const cone = { ox: W * 0.5, oy: -H * (tall ? 0.08 : 0.2), tx: cx, ty: cy, spread: tall ? 0.3 : 0.36 };
  beam(k, cone.ox, cone.oy, cone.tx, cone.ty, cone.spread, light * 0.9);
  dust(k, motes, t, period, cone, light);
}

function sceneGallery(
  k: Kit,
  offset: number,
  slugs: string[],
  t: number,
  period: number,
  { light = 1, beams = 1 }: { light?: number; beams?: number } = {},
) {
  const { W, H } = k;
  const tall = H > W;
  const h = H * (tall ? 0.33 : 0.54);
  const cy = H * (tall ? 0.44 : 0.46);
  const floorY = cy + h / 2 + H * (tall ? 0.03 : 0.05);
  const sample = k.plates.get(slugs[0])!;
  const spacing = ((h * sample.width) / sample.height) * (tall ? 1.42 : 1.62);

  room(k, floorY);
  const first = Math.floor((offset - W) / spacing) - 1;
  const last = Math.ceil((offset + W) / spacing) + 1;
  /* Each plate breathes a little on its own, on a period that divides the
     clip's, and keyed to the plate rather than its slot so a loop meets itself. */
  const breath = (i: number) => {
    const slot = ((i % slugs.length) + slugs.length) % slugs.length;
    return 0.9 + 0.1 * Math.sin((TAU * 2 * t) / period + slot * 1.7);
  };
  for (let i = first; i <= last; i += 1) {
    const slug = slugs[((i % slugs.length) + slugs.length) % slugs.length];
    const x = W / 2 + i * spacing - offset;
    if (x < -spacing || x > W + spacing) continue;
    const own = breath(i);
    pool(k, x, cy - h * 0.1, h * 0.75, light * own);
    plate(k, slug, x, cy, h, { light: (0.12 + 0.88 * light) * own, shadow: 0.85 });
    reflection(k, slug, x, cy + h / 2, floorY, h, light * own);
  }
  for (let i = first; i <= last; i += 1) {
    const x = W / 2 + i * spacing - offset;
    if (x < -spacing || x > W + spacing) continue;
    beam(k, x, -H * 0.06, x, cy, tall ? 0.22 : 0.2, light * beams * breath(i) * 0.55);
  }
}

function sceneReel(k: Kit, t: number, period: number, zoom: number, centre = "ramayana-part-one") {
  const { W, H, ctx } = k;
  ctx.fillStyle = C.stage;
  ctx.fillRect(0, 0, W, H);
  const R = Math.min(W, H) * 0.44;
  ctx.save();
  ctx.translate(W / 2, H / 2);
  ctx.scale(zoom, zoom);
  ctx.translate(-W / 2, -H / 2);
  reel(k, W / 2, H / 2, R, t, period, centre, 1 + (zoom - 1) * 0.5);
  ctx.restore();
  pool(k, W / 2, H / 2, R * 1.4, 0.55);
}

/* -------------------------------------------------------------------------- */
/* Clips                                                                       */
/* -------------------------------------------------------------------------- */

type Job = {
  name: string;
  media: MotionMedia;
  source: MediaSource;
  /** Seconds into the clip the poster frame is taken from. */
  posterAt: number;
  /** x264 constant rate factor — higher is smaller. */
  crf: number;
  draw: (k: Kit, t: number) => void;
};

function reelDraw(period: number) {
  const motes = makeMotes(7, 220);
  return (k: Kit, t: number) => {
    const { W, H } = k;
    if (t < 5.2) {
      sceneBeam(k, t, motes, period);
      const weave = loopNoise(t, period, 1.3);
      finish(k, 0.035 + 0.025 * weave, 1 - ramp(t, 0.25, 0.32) + ramp(t, 4.85, 5.2));
    } else if (t < 11.2) {
      const local = t - 5.2;
      const sample = k.plates.get(REEL_GALLERY[0])!;
      const tall = H > W;
      const h = H * (tall ? 0.33 : 0.54);
      const spacing = ((h * sample.width) / sample.height) * (tall ? 1.42 : 1.62);
      const offset = lerp(-spacing * 0.4, spacing * 1.6, inOut(phase(local, 0, 6)));
      sceneGallery(k, offset, REEL_GALLERY, t, period);
      finish(k, 0.03 + 0.02 * loopNoise(t, period, 2.1), 1 - ramp(local, 0, 0.4) + ramp(local, 5.6, 6));
    } else {
      const local = t - 11.2;
      const zoom = lerp(0.94, 1.12, inOut(phase(local, 0, 8.8)));
      sceneReel(k, t, period, zoom);
      const close = inOut(phase(t, 16.2, 18.7));
      curtain(k, t, close, ramp(t, 16.4, 18.4) * (1 - ramp(t, 19.0, 19.9)));
      finish(k, 0.03 + 0.02 * loopNoise(t, period, 3.4), 1 - ramp(local, 0, 0.45) + ramp(t, 19.1, 19.96));
    }
  };
}

function galleryDraw(period: number, slugs: string[]) {
  return (k: Kit, t: number) => {
    const { W, H } = k;
    const sample = k.plates.get(slugs[0])!;
    const tall = H > W;
    const h = H * (tall ? 0.33 : 0.54);
    const spacing = ((h * sample.width) / sample.height) * (tall ? 1.42 : 1.62);
    /* Exactly one full cycle of the sequence per loop: frame N meets frame 0. */
    const offset = (t / period) * spacing * slugs.length;
    sceneGallery(k, offset, slugs, t, period);
    finish(k, 0.025 + 0.015 * loopNoise(t, period, 0.7), 0);
  };
}

function ringsDraw(period: number) {
  const motes = makeMotes(19, 160);
  return (k: Kit, t: number) => {
    const { W, H } = k;
    const zoom = 1.02 + 0.03 * Math.sin((TAU * t) / period);
    sceneReel(k, t, period, zoom);
    const cone = { ox: W * 0.5, oy: -H * 0.25, tx: W / 2, ty: H / 2, spread: 0.5 };
    dust(k, motes, t, period, cone, 0.8);
    finish(k, 0.025 + 0.02 * loopNoise(t, period, 5.1), 0);
  };
}

const jobs: Job[] = [];
{
  const { reel, gallery, rings } = MOTION_MEDIA;
  jobs.push({ name: "reel-wide", media: reel, source: reel.wide, posterAt: 3.4, crf: 25, draw: reelDraw(reel.durationSeconds) });
  if (reel.tall) {
    jobs.push({ name: "reel-tall", media: reel, source: reel.tall, posterAt: 3.4, crf: 25, draw: reelDraw(reel.durationSeconds) });
  }
  const gallerySlugs = gallery.derivedFrom;
  jobs.push({ name: "gallery", media: gallery, source: gallery.wide, posterAt: 0, crf: 25, draw: galleryDraw(gallery.durationSeconds, gallerySlugs) });
  jobs.push({ name: "rings", media: rings, source: rings.wide, posterAt: 0, crf: 25, draw: ringsDraw(rings.durationSeconds) });
}

/* -------------------------------------------------------------------------- */
/* Render                                                                      */
/* -------------------------------------------------------------------------- */

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const publicDir = path.join(root, "public");

async function loadPlates(slugs: string[]): Promise<Map<string, Plate>> {
  const map = new Map<string, Plate>();
  for (const slug of new Set(slugs)) {
    map.set(slug, await loadImage(path.join(publicDir, "cover-art", `${slug}.jpg`)));
  }
  return map;
}

async function render(job: Job) {
  const { width: W, height: H } = job.source;
  const surface = createCanvas(W, H);
  const ctx = surface.getContext("2d");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  const kit: Kit = {
    W,
    H,
    U: Math.min(W, H),
    ctx,
    plates: await loadPlates(job.media.derivedFrom),
    shadow: makeShadow(),
    vignette: makeVignette(W, H),
  };
  const fps = job.media.fps;
  const frames = Math.round(job.media.durationSeconds * fps);

  if (stillsOnly) {
    const dir = "/tmp/reel-stills";
    fs.mkdirSync(dir, { recursive: true });
    const marks = job.name.startsWith("reel")
      ? [0.6, 2.0, 3.4, 4.6, 6.2, 8.4, 10.6, 12.5, 15.0, 17.4, 18.6, 19.5]
      : [0, job.media.durationSeconds * 0.33, job.media.durationSeconds * 0.66];
    for (const at of marks) {
      job.draw(kit, at);
      const file = path.join(dir, `${job.name}-${at.toFixed(1)}.jpg`);
      fs.writeFileSync(file, await surface.encode("jpeg", 80));
      console.log(file);
    }
    return;
  }

  const output = path.join(publicDir, job.source.src);
  fs.mkdirSync(path.dirname(output), { recursive: true });
  const ffmpeg = spawn(
    FFMPEG,
    [
      "-y",
      "-hide_banner",
      "-loglevel",
      "error",
      "-f",
      "rawvideo",
      "-pix_fmt",
      "rgba",
      "-s",
      `${W}x${H}`,
      "-r",
      String(fps),
      "-i",
      "-",
      "-vf",
      "scale=out_color_matrix=bt709:out_range=tv,format=yuv420p",
      "-c:v",
      "libx264",
      "-preset",
      "slow",
      "-tune",
      "animation",
      "-crf",
      String(job.crf),
      "-profile:v",
      "high",
      "-g",
      String(fps * 2),
      "-colorspace",
      "bt709",
      "-color_primaries",
      "bt709",
      "-color_trc",
      "bt709",
      "-color_range",
      "tv",
      "-movflags",
      "+faststart",
      "-an",
      "-metadata",
      `title=${job.media.id} — original motion for this site`,
      "-metadata",
      `comment=Rendered by scripts/render-reel.mts from the site's own cover plates. Not footage of any venue or film.`,
      output,
    ],
    { stdio: ["pipe", "inherit", "inherit"] },
  );

  const started = Date.now();
  for (let frame = 0; frame < frames; frame += 1) {
    job.draw(kit, frame / fps);
    const pixels = Buffer.from(surface.data());
    if (!ffmpeg.stdin.write(pixels)) await once(ffmpeg.stdin, "drain");
    if (frame % (fps * 2) === 0) process.stdout.write(`\r${job.name}: ${frame}/${frames}`);
  }
  ffmpeg.stdin.end();
  const [code] = await once(ffmpeg, "close");
  if (code !== 0) throw new Error(`ffmpeg exited with ${code} for ${job.name}`);

  job.draw(kit, job.posterAt);
  const posterPath = path.join(publicDir, job.source.poster);
  fs.writeFileSync(posterPath, await surface.encode("jpeg", 82));

  const seconds = ((Date.now() - started) / 1000).toFixed(1);
  console.log(
    `\r${job.name}: ${frames} frames, ${(fs.statSync(output).size / 1e6).toFixed(2)} MB video, ` +
      `${(fs.statSync(posterPath).size / 1e3).toFixed(0)} kB poster, ${seconds}s`,
  );
}

for (const job of jobs) {
  if (only.length && !only.includes(job.name)) continue;
  await render(job);
}
