/*
 * Procedural, seeded pixel map of a stylised Cairo, drawn once into an
 * offscreen canvas at base resolution (1 art pixel = 1 canvas pixel, 16px
 * tiles). The scene then blits a camera rect at an integer scale.
 *
 * Only the brand palette is used: merlot, merlot-700, yellow, blue, coconut, ink.
 */

export const TILE = 16;
export const MAP_W = 80; // tiles
export const MAP_H = 124; // tiles
export const WORLD_W = MAP_W * TILE;
export const WORLD_H = MAP_H * TILE;

export const C = {
  merlot: "#681B2B",
  night: "#571623",
  yellow: "#FEE571",
  blue: "#B4D4FB",
  coconut: "#F9F5E9",
  ink: "#241B1F",
} as const;

export interface Pt {
  x: number;
  y: number;
}

export type StopId = "why" | "board" | "how" | "night" | "inventory" | "party";

export interface QuestMapData {
  canvas: HTMLCanvasElement;
  /** Window pixels (base px) with a random light-up threshold for the night. */
  windows: { x: number; y: number; t: number }[];
  /** Lamp heads (base px) along the Corniche and around the plaza. */
  lamps: { x: number; y: number; t: number }[];
  /** The walking path, base px. */
  path: Pt[];
  /** Cumulative length at each path vertex, normalised to 0..1. */
  pathT: number[];
  stops: Record<StopId, { t: number; focus: Pt }>;
  signposts: { t: number; at: Pt }[];
  markers: { id: string; at: Pt }[];
  routeStart: number;
  routeEnd: number;
}

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** River centre line, in tiles. */
export const riverX = (y: number) => 36 + 8 * Math.sin(y / 13) + 3 * Math.sin(y / 5.3);
const ISLAND = { y0: 29, y1: 45 };
const riverHalf = (y: number) => (y > ISLAND.y0 - 3 && y < ISLAND.y1 + 3 ? 8 : 4.2);
const onIsland = (x: number, y: number) => {
  if (y < ISLAND.y0 || y > ISLAND.y1) return false;
  const cy = (ISLAND.y0 + ISLAND.y1) / 2;
  const ry = (ISLAND.y1 - ISLAND.y0) / 2;
  const rx = 4.2;
  const dx = (x - riverX(y)) / rx;
  const dy = (y - cy) / ry;
  return dx * dx + dy * dy <= 1;
};
const isWater = (x: number, y: number) => Math.abs(x - riverX(y)) <= riverHalf(y) && !onIsland(x, y);

function distToSegment(p: Pt, a: Pt, b: Pt) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const l = dx * dx + dy * dy;
  const t = l ? Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / l)) : 0;
  return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy));
}


/** Path waypoints in tiles, laid out relative to the river. Pure, safe on the server. */
function layoutTiles() {
  const tilePath: Pt[] = [];
  const add = (x: number, y: number) => tilePath.push({ x, y });
  add(riverX(4) + 22, 3);
  add(riverX(10) + 20, 10);
  const whyAt = { x: riverX(14) + 18, y: 14 };
  add(whyAt.x, whyAt.y);
  add(riverX(22) + 12, 22);
  add(riverX(30) + 3, 31);
  const boardAt = { x: riverX(37), y: 37 };
  add(boardAt.x, boardAt.y);
  add(riverX(44) + 1, 44);
  add(riverX(50) + 8, 51);
  const routeA = tilePath.length;
  for (let y = 56; y <= 86; y += 3) add(riverX(y) + 7, y);
  const routeB = tilePath.length - 1;
  const nightAt = { x: riverX(93) + 13, y: 93 };
  add(nightAt.x, nightAt.y);
  const invAt = { x: riverX(101) + 9, y: 101 };
  add(invAt.x, invAt.y);
  add(riverX(106) + 2, 106);
  const partyAt = { x: riverX(112) - 11, y: 112 };
  add(partyAt.x, partyAt.y);
  add(riverX(120) - 13, 120);

  return { tilePath, routeA, routeB, whyAt, boardAt, nightAt, invAt, partyAt };
}

export type QuestLayout = Omit<QuestMapData, "canvas" | "windows" | "lamps">;
let layoutCache: QuestLayout | null = null;

/** Path, stops, signposts and markers in base px. No canvas needed. */
export function computeLayout(): QuestLayout {
  if (layoutCache) return layoutCache;
  const { tilePath, routeA, routeB, whyAt, boardAt, nightAt, invAt, partyAt } = layoutTiles();
  const T = (p: Pt) => ({ x: p.x * TILE, y: p.y * TILE });
  const path = tilePath.map((p) => ({ x: p.x * TILE, y: p.y * TILE }));
  const lens = [0];
  for (let i = 1; i < path.length; i++) lens.push(lens[i - 1] + Math.hypot(path[i].x - path[i - 1].x, path[i].y - path[i - 1].y));
  const total = lens[lens.length - 1];
  const pathT = lens.map((l) => l / total);
  const tOf = (p: Pt) => pathT[tilePath.findIndex((q) => q.x === p.x && q.y === p.y)];
  const routeStart = pathT[routeA];
  const routeEnd = pathT[routeB];
  const signposts = [0.12, 0.37, 0.62, 0.87].map((f) => {
    const t = routeStart + (routeEnd - routeStart) * f;
    const at = pointAt({ path, pathT }, t);
    return { t, at: { x: at.x + 26, y: at.y - 6 } };
  });
  const fel = feluccaAt();
  layoutCache = {
    path,
    pathT,
    stops: {
      why: { t: tOf(whyAt), focus: T({ x: whyAt.x + 1, y: whyAt.y - 2 }) },
      board: { t: tOf(boardAt), focus: T({ x: boardAt.x - 1.5, y: boardAt.y + 1 }) },
      how: { t: routeStart, focus: T({ x: riverX(70) + 7, y: 70 }) },
      night: { t: tOf(nightAt), focus: T(nightAt) },
      inventory: { t: tOf(invAt), focus: T(invAt) },
      party: { t: tOf(partyAt), focus: T(partyAt) },
    },
    signposts,
    markers: [
      { id: "felucca", at: { x: fel.x, y: fel.y - 14 } },
      { id: "cafe", at: T({ x: boardAt.x + 2.2, y: boardAt.y - 3 }) },
      { id: "studio", at: T({ x: boardAt.x - 1.6, y: boardAt.y + 4.5 }) },
    ],
    routeStart,
    routeEnd,
  };
  return layoutCache;
}

const feluccaAt = () => ({ x: Math.round((riverX(41) - 6.4) * TILE), y: 41 * TILE });

let cached: QuestMapData | null = null;

/** Built once per page load and shared (the scene and the reduced-motion strip). */
export function buildQuestMap(): QuestMapData {
  if (cached) return cached;
  cached = generate();
  return cached;
}

function generate(): QuestMapData {
  const rnd = mulberry32(20261130);

  const { tilePath, whyAt, boardAt, nightAt } = layoutTiles();

  // Tiles within 1.1 of the path, computed once (the draw passes look it up).
  const cor = new Uint8Array(MAP_W * MAP_H);
  for (let i = 0; i < tilePath.length - 1; i++) {
    const a = tilePath[i];
    const b = tilePath[i + 1];
    const x0 = Math.max(0, Math.floor(Math.min(a.x, b.x) - 2));
    const x1 = Math.min(MAP_W - 1, Math.ceil(Math.max(a.x, b.x) + 2));
    const y0 = Math.max(0, Math.floor(Math.min(a.y, b.y) - 2));
    const y1 = Math.min(MAP_H - 1, Math.ceil(Math.max(a.y, b.y) + 2));
    for (let ty = y0; ty <= y1; ty++)
      for (let tx = x0; tx <= x1; tx++) if (distToSegment({ x: tx + 0.5, y: ty + 0.5 }, a, b) < 1.1) cor[ty * MAP_W + tx] = 1;
  }
  const corridor = (x: number, y: number) => cor[y * MAP_W + x] === 1;

  const canvas = document.createElement("canvas");
  canvas.width = WORLD_W;
  canvas.height = WORLD_H;
  const g = canvas.getContext("2d")!;
  const px = (x: number, y: number, w: number, h: number, c: string) => {
    g.fillStyle = c;
    g.fillRect(x, y, w, h);
  };

  // ---- Ground and water.
  px(0, 0, WORLD_W, WORLD_H, C.coconut);
  const kind: ("land" | "water" | "island" | "road" | "corniche" | "path")[][] = [];
  for (let ty = 0; ty < MAP_H; ty++) {
    kind[ty] = [];
    for (let tx = 0; tx < MAP_W; tx++) {
      const cx = tx + 0.5;
      const cy = ty + 0.5;
      let k: (typeof kind)[number][number] = isWater(cx, cy) ? "water" : onIsland(cx, cy) ? "island" : "land";
      if (k === "land") {
        const edge = cx - (riverX(cy) + riverHalf(cy));
        if (edge > 0 && edge < 1.6) k = "corniche";
        else if (tx % 11 === 0 || ty % 9 === 0) k = "road";
      }
      if (corridor(tx, ty)) k = k === "water" ? "water" : "path";
      kind[ty][tx] = k;
    }
  }

  const windows: QuestMapData["windows"] = [];
  const lamps: QuestMapData["lamps"] = [];

  // Water with ripples, plus bridges where the path crosses.
  for (let ty = 0; ty < MAP_H; ty++) {
    for (let tx = 0; tx < MAP_W; tx++) {
      if (kind[ty][tx] !== "water") continue;
      const X = tx * TILE;
      const Y = ty * TILE;
      px(X, Y, TILE, TILE, C.blue);
      if (corridor(tx, ty)) {
        // Bridge planks with merlot rails.
        px(X, Y + 2, TILE, 12, C.coconut);
        for (let i = 0; i < TILE; i += 4) px(X + i, Y + 2, 1, 12, "rgba(104,27,43,.12)");
        px(X, Y + 1, TILE, 1, C.merlot);
        px(X, Y + 14, TILE, 1, C.merlot);
        continue;
      }
      for (let i = 0; i < 3; i++) {
        if (rnd() < 0.55) px(X + Math.floor(rnd() * 12), Y + Math.floor(rnd() * 14), 3 + Math.floor(rnd() * 3), 1, C.coconut);
      }
    }
  }

  // Corniche: a bank edge and lamps every few tiles.
  for (let ty = 0; ty < MAP_H; ty++) {
    for (let tx = 0; tx < MAP_W; tx++) {
      if (kind[ty][tx] !== "corniche") continue;
      const X = tx * TILE;
      const Y = ty * TILE;
      px(X, Y, 2, TILE, C.merlot);
      if (ty % 4 === 0) {
        px(X + 8, Y + 6, 2, 6, C.merlot);
        px(X + 7, Y + 4, 4, 3, C.ink);
        lamps.push({ x: X + 7, y: Y + 4, t: rnd() });
      }
    }
  }

  // Roads: a dashed centre line.
  for (let ty = 0; ty < MAP_H; ty++) {
    for (let tx = 0; tx < MAP_W; tx++) {
      if (kind[ty][tx] !== "road") continue;
      const X = tx * TILE;
      const Y = ty * TILE;
      if (ty % 9 === 0) for (let i = 2; i < TILE; i += 8) px(X + i, Y + 7, 4, 1, "rgba(104,27,43,.14)");
      else for (let i = 2; i < TILE; i += 8) px(X + 7, Y + i, 1, 4, "rgba(104,27,43,.14)");
    }
  }

  // Buildings on land blocks: merlot roofs, a merlot-700 lower edge, window pixels.
  const occupied: boolean[][] = kind.map((row) => row.map((k) => k !== "land"));
  const isFree = (x: number, y: number, w: number, h: number) => {
    for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) if (j < 0 || i < 0 || j >= MAP_H || i >= MAP_W || occupied[j][i]) return false;
    return true;
  };
  const building = (tx: number, ty: number, w: number, h: number, tall = false) => {
    for (let j = ty; j < ty + h; j++) for (let i = tx; i < tx + w; i++) occupied[j][i] = true;
    const X = tx * TILE + 2;
    const Y = ty * TILE + 2;
    const W = w * TILE - 4;
    const H = h * TILE - 4;
    px(X, Y, W, H, C.merlot);
    px(X, Y + H - 3, W, 3, C.night);
    if (tall) px(X + 3, Y + 3, W - 6, 2, C.night);
    for (let wy = Y + 4; wy < Y + H - 6; wy += 5) {
      for (let wx = X + 3; wx < X + W - 3; wx += 5) {
        if (rnd() < 0.62) {
          px(wx, wy, 2, 2, C.night);
          windows.push({ x: wx, y: wy, t: rnd() });
        }
      }
    }
  };
  // Dense, taller blocks downtown (top right), lighter elsewhere.
  for (let ty = 1; ty < MAP_H - 1; ty++) {
    for (let tx = 1; tx < MAP_W - 1; tx++) {
      if (occupied[ty][tx]) continue;
      const downtown = ty < 26 && tx > riverX(ty) + 8;
      const w = 2 + Math.floor(rnd() * (downtown ? 3 : 2));
      const h = 2 + Math.floor(rnd() * (downtown ? 3 : 2));
      if (rnd() < (downtown ? 0.9 : 0.5) && isFree(tx, ty, w, h)) building(tx, ty, w, h, downtown);
    }
  }

  // Trees: blue canopies with merlot trunks, on the island and in gaps.
  const tree = (cx: number, cy: number) => {
    px(cx - 1, cy + 3, 2, 3, C.merlot);
    px(cx - 3, cy - 3, 6, 6, C.blue);
    px(cx - 4, cy - 2, 8, 4, C.blue);
    px(cx - 2, cy - 4, 4, 1, C.blue);
    px(cx - 2, cy - 2, 2, 1, C.coconut);
  };
  for (let ty = 0; ty < MAP_H; ty++) {
    for (let tx = 0; tx < MAP_W; tx++) {
      const k = kind[ty][tx];
      if ((k === "island" && rnd() < 0.35) || (k === "land" && !occupied[ty][tx] && rnd() < 0.25)) {
        if (!corridor(tx, ty)) tree(tx * TILE + 8, ty * TILE + 8);
      }
    }
  }

  // Path: a dotted merlot trail.
  for (let ty = 0; ty < MAP_H; ty++) {
    for (let tx = 0; tx < MAP_W; tx++) {
      if (kind[ty][tx] !== "path") continue;
      const X = tx * TILE;
      const Y = ty * TILE;
      if ((tx + ty) % 2 === 0) px(X + 7, Y + 7, 2, 2, "rgba(104,27,43,.28)");
    }
  }

  // Landmarks.
  const T = (p: Pt) => ({ x: p.x * TILE, y: p.y * TILE });
  // Downtown: a taller tower with a yellow crown.
  const tower = T({ x: whyAt.x + 3, y: whyAt.y - 4 });
  px(tower.x - 6, tower.y - 10, 12, 22, C.merlot);
  px(tower.x - 4, tower.y - 14, 8, 4, C.yellow);
  px(tower.x - 6, tower.y + 10, 12, 2, C.night);
  // Zamalek: Cairo-tower-like spire on the island.
  const spire = T({ x: boardAt.x - 2, y: boardAt.y - 5 });
  px(spire.x - 2, spire.y - 12, 4, 20, C.merlot);
  px(spire.x - 4, spire.y - 14, 8, 3, C.merlot);
  px(spire.x - 3, spire.y - 16, 6, 2, C.yellow);
  // Night plaza: an open square ringed by lamps.
  const plaza = T(nightAt);
  px(plaza.x - 40, plaza.y - 30, 80, 60, "rgba(104,27,43,.06)");
  for (let a = 0; a < 8; a++) {
    const lx = Math.round(plaza.x + Math.cos((a / 8) * Math.PI * 2) * 34);
    const ly = Math.round(plaza.y + Math.sin((a / 8) * Math.PI * 2) * 24);
    px(lx, ly + 2, 2, 5, C.merlot);
    px(lx - 1, ly, 4, 3, C.ink);
    lamps.push({ x: lx - 1, y: ly, t: rnd() });
  }

  // Felucca on the river next to the island.
  const fel = feluccaAt();
  px(fel.x - 9, fel.y + 4, 18, 3, C.merlot);
  px(fel.x - 7, fel.y + 7, 14, 1, C.merlot);
  for (let i = 0; i < 12; i++) px(fel.x - Math.floor(i / 2), fel.y - 9 + i, Math.floor(i / 2) + 1, 1, C.coconut);
  px(fel.x, fel.y - 10, 1, 14, C.merlot);

  return { ...computeLayout(), canvas, windows, lamps };
}

/** Position on the path at normalised arc length t. */
export function pointAt(m: Pick<QuestMapData, "path" | "pathT">, t: number): Pt {
  const { path, pathT } = m;
  if (t <= 0) return { ...path[0] };
  if (t >= 1) return { ...path[path.length - 1] };
  let i = 1;
  while (i < pathT.length && pathT[i] < t) i++;
  const a = path[i - 1];
  const b = path[i];
  const f = (t - pathT[i - 1]) / (pathT[i] - pathT[i - 1] || 1);
  return { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f };
}
