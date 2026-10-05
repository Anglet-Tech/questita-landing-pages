"use client";

import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { GLYPH_H, GLYPH_W, glyph } from "@/lib/glyphs";

const CELLS = Array.from({ length: GLYPH_W * GLYPH_H }, (_, i) => i);

/**
 * One digit drawn from a 5 x 7 bitmap as SVG rects, in currentColor. Size it
 * with CSS height (width follows the 5:7 ratio). When the character changes the
 * pixels re-form: shared pixels stay, removed ones drop and fade in 3 steps, new
 * ones pop in with a stagger, about 350ms. Reduced motion swaps instantly.
 *
 * Each rect sits inside a <g data-scatter> so a parent can move whole pixels
 * (for example to assemble the digits from scattered pixels) without fighting
 * the re-form animation on the rect itself.
 */
export default function PixelDigit({ char, className = "" }: { char: string; className?: string }) {
  const svg = useRef<SVGSVGElement>(null);
  const prev = useRef<boolean[] | null>(null);

  useGSAP(
    () => {
      const next = glyph(char);
      const before = prev.current;
      prev.current = next;
      const rects = Array.from(svg.current!.querySelectorAll<SVGRectElement>("rect"));
      if (!before || prefersReducedMotion()) {
        rects.forEach((r, i) => gsap.set(r, { opacity: next[i] ? 1 : 0, y: 0, scale: 1 }));
        return;
      }
      const added: SVGRectElement[] = [];
      const removed: SVGRectElement[] = [];
      rects.forEach((r, i) => {
        if (next[i] && !before[i]) added.push(r);
        else if (!next[i] && before[i]) removed.push(r);
        else gsap.set(r, { opacity: next[i] ? 1 : 0, y: 0, scale: 1 });
      });
      gsap.killTweensOf(rects);
      if (removed.length) {
        gsap.fromTo(
          removed,
          { opacity: 1, y: 0, scale: 1 },
          { opacity: 0, y: 1.5, duration: 0.2, ease: "steps(3)", stagger: 0.01, overwrite: true },
        );
      }
      if (added.length) {
        gsap.fromTo(
          added,
          { opacity: 1, scale: 0, y: 0, transformOrigin: "50% 50%" },
          { scale: 1, duration: 0.12, ease: "steps(3)", stagger: { each: 0.018, from: "random" }, delay: 0.1, overwrite: true },
        );
      }
    },
    { dependencies: [char], scope: svg },
  );

  const initial = glyph(char);
  return (
    <svg
      ref={svg}
      viewBox={`0 0 ${GLYPH_W} ${GLYPH_H}`}
      className={`pixel-digit block h-[1em] w-auto overflow-visible ${className}`}
      style={{ aspectRatio: `${GLYPH_W} / ${GLYPH_H}` }}
      shapeRendering="crispEdges"
      aria-hidden="true"
      focusable="false"
    >
      {CELLS.map((i) => (
        <g key={i} data-scatter="">
          <rect x={i % GLYPH_W} y={Math.floor(i / GLYPH_W)} width={1} height={1} fill="currentColor" opacity={initial[i] ? 1 : 0} />
        </g>
      ))}
    </svg>
  );
}

/** Two pixel squares stacked, for the colon between digit pairs. */
export function PixelColon({ className = "", on = true }: { className?: string; on?: boolean }) {
  return (
    <svg
      viewBox="0 0 1 7"
      className={`block h-[1em] w-auto ${className}`}
      style={{ aspectRatio: "1 / 7", opacity: on ? 1 : 0.2 }}
      shapeRendering="crispEdges"
      aria-hidden="true"
      focusable="false"
    >
      <rect x={0} y={2} width={1} height={1} fill="currentColor" />
      <rect x={0} y={4} width={1} height={1} fill="currentColor" />
    </svg>
  );
}
