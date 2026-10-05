import raw from "@/data/fox-pixels.json";

export type FoxFrame = "happy" | "wink" | "wow" | "oops";
export type FoxRect = [x: number, y: number, w: number, h: number];
export interface FoxLayer {
  fill: string;
  rects: FoxRect[];
}
export interface FoxSprite {
  w: number;
  h: number;
  layers: FoxLayer[];
}

export const FOX = raw as unknown as Record<FoxFrame, FoxSprite>;
export const FOX_W = 41;
export const FOX_H = 35;

/** Centre of the nose in fox pixel space. Pop-in animations radiate from here. */
export const NOSE = { x: 20.5, y: 26 };

const COCONUT = "#F9F5E9";

/**
 * Eye highlights are the 2x2 coconut rects inside the eyes. Happy has them at
 * [12,21] and [27,21], wow at [12,20] and [27,20], wink only has the open left
 * eye and oops has none (both eyes closed).
 */
export function isEyeHighlight(fill: string, r: FoxRect): boolean {
  return fill.toUpperCase() === COCONUT && r[2] === 2 && r[3] === 2 && r[1] >= 18 && r[1] <= 23;
}

export function distanceFromNose(r: FoxRect): number {
  const cx = r[0] + r[2] / 2;
  const cy = r[1] + r[3] / 2;
  return Math.hypot(cx - NOSE.x, cy - NOSE.y);
}

/** Largest possible distance, used to normalise pop-in staggers. */
export const MAX_NOSE_DISTANCE = Math.hypot(NOSE.x, NOSE.y);

/**
 * Per-row horizontal extent of the happy fox (the space between the ears
 * included), in fox pixels. Used to keep the hero reveal trail off the fox.
 */
export const FOX_ROW_SPANS: [y: number, x0: number, x1: number][] = (() => {
  const min = Array<number>(FOX_H).fill(Infinity);
  const max = Array<number>(FOX_H).fill(-Infinity);
  for (const layer of FOX.happy.layers)
    for (const [x, y, w, h] of layer.rects)
      for (let j = y; j < y + h; j++) {
        min[j] = Math.min(min[j], x);
        max[j] = Math.max(max[j], x + w);
      }
  return min.map((m, y) => [y, m, max[y]] as [number, number, number]).filter(([, a]) => Number.isFinite(a));
})();
