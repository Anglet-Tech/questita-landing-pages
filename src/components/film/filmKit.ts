"use client";

import { ScrollTrigger } from "@/lib/gsap";
import { CHAPTERS } from "./content";

/*
 * Small helpers shared by the /film/ chapters: chapter tone tracking for the
 * fixed top bar and timecode, the pixel iris polygon, and quantising helpers.
 */

export type Tone = "dark" | "light";

const root = () => document.querySelector<HTMLElement>(".film");

/**
 * Track which chapter sits under the top bar and under the timecode. Writes
 * data attributes on the .film root and the slate text, never React state.
 * Call inside a gsap.matchMedia / context so the triggers are reverted.
 */
export function watchChapter(section: HTMLElement, index: number, tone: Tone | (() => Tone)) {
  const toneNow = () => (typeof tone === "function" ? tone() : tone);
  const r = root();
  if (!r) return;
  const slate = r.querySelector<HTMLElement>("[data-slate]");
  const num = r.querySelector<HTMLElement>("[data-slate-n]");
  ScrollTrigger.create({
    trigger: section,
    start: "top 36px",
    end: "bottom 36px",
    onToggle: (self) => {
      if (!self.isActive) return;
      r.dataset.top = toneNow();
      if (slate) slate.textContent = CHAPTERS[index];
      if (num) num.textContent = String(index + 1).padStart(2, "0");
    },
  });
  ScrollTrigger.create({
    trigger: section,
    start: "top bottom-=36",
    end: "bottom bottom-=36",
    onToggle: (self) => {
      if (self.isActive) r.dataset.bottom = toneNow();
    },
  });
}

/** Override the top tone directly (the hero iris turns the frame coconut mid pin). */
export function setTopTone(tone: Tone) {
  const r = root();
  if (r && r.dataset.top !== tone) r.dataset.top = tone;
}

export const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
/** Local progress of p inside [a, b]. */
export const span = (p: number, a: number, b: number) => clamp01((p - a) / (b - a));
/** Quantise 0..1 to n hard steps (0, 1/n, ..., 1). */
export const stepped = (v: number, n: number) => Math.floor(v * n + 1e-6) / n;

/**
 * A circle drawn on a pixel grid, as a clip-path polygon in px. Rows are
 * `cell` tall and each row's half width snaps down to whole cells, so the edge
 * is a staircase like a pixel art circle.
 */
export function pixelCircle(cx: number, cy: number, r: number, cell: number): string {
  if (r <= 0) return "polygon(0 0, 0 0, 0 0)";
  const n = Math.ceil(r / cell);
  const right: string[] = [];
  const left: string[] = [];
  for (let k = -n; k < n; k++) {
    const y0 = k * cell;
    const y1 = (k + 1) * cell;
    const near = Math.min(Math.abs(y0), Math.abs(y1));
    const hw = Math.floor(Math.sqrt(Math.max(0, r * r - near * near)) / cell) * cell;
    if (hw <= 0) continue;
    right.push(`${cx + hw}px ${cy + y0}px`, `${cx + hw}px ${cy + y1}px`);
    // Pushed top-down as (y0, y1); reversed below so the left edge runs bottom-up.
    left.push(`${cx - hw}px ${cy + y0}px`, `${cx - hw}px ${cy + y1}px`);
  }
  if (!right.length) return "polygon(0 0, 0 0, 0 0)";
  return `polygon(${[...right, ...left.reverse()].join(", ")})`;
}
