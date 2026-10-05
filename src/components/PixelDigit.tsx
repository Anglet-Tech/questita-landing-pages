"use client";

import { memo, useLayoutEffect, useRef, useState } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { GLYPH_H, GLYPH_W, glyph } from "@/lib/glyphs";

const SVG_NS = "http://www.w3.org/2000/svg";
const CELLS = Array.from({ length: GLYPH_W * GLYPH_H }, (_, i) => i);

function glyphPath(bits: boolean[]): string {
  let d = "";
  // Merge horizontal runs per row so the path stays short.
  for (let y = 0; y < GLYPH_H; y++) {
    let x = 0;
    while (x < GLYPH_W) {
      if (!bits[y * GLYPH_W + x]) {
        x++;
        continue;
      }
      let w = 1;
      while (x + w < GLYPH_W && bits[y * GLYPH_W + x + w]) w++;
      d += `M${x} ${y}h${w}v1h-${w}z`;
      x += w;
    }
  }
  return d;
}

function makeRect(i: number): SVGRectElement {
  const r = document.createElementNS(SVG_NS, "rect");
  r.setAttribute("x", String(i % GLYPH_W));
  r.setAttribute("y", String(Math.floor(i / GLYPH_W)));
  r.setAttribute("width", "1");
  r.setAttribute("height", "1");
  r.setAttribute("fill", "currentColor");
  return r;
}

/**
 * One digit from a 5 x 7 bitmap, in currentColor, sized with CSS height.
 *
 * Default mode is a single <path> (2 nodes per digit). When the character
 * changes the pixels re-form: shared pixels stay in the path, removed ones
 * drop and fade in 3 steps, new ones pop in with a stagger, about 350ms. Only
 * the changed pixels exist as temporary rects, and only SVG attributes are
 * animated (no transform parsing). Reduced motion swaps instantly.
 *
 * `pixels` mode keeps one rect per cell so a parent can scatter them (Launch).
 */
function PixelDigit({ char, className = "", pixels = false }: { char: string; className?: string; pixels?: boolean }) {
  const svg = useRef<SVGSVGElement>(null);
  const path = useRef<SVGPathElement>(null);
  const fx = useRef<SVGGElement>(null);
  const prev = useRef<boolean[] | null>(null);
  // The first glyph is server rendered; later updates are applied imperatively.
  const [initial] = useState(() => glyph(char));

  useLayoutEffect(() => {
    const next = glyph(char);
    const before = prev.current;
    prev.current = next;
    if (!before) return;
    const reduced = prefersReducedMotion();

    if (pixels) {
      const rects = svg.current!.querySelectorAll<SVGRectElement>("rect[data-cell]");
      rects.forEach((r, i) => {
        if (next[i] === before[i]) return;
        gsap.killTweensOf(r);
        if (reduced) {
          r.setAttribute("opacity", next[i] ? "1" : "0");
        } else if (next[i]) {
          const x = i % GLYPH_W;
          const y = Math.floor(i / GLYPH_W);
          r.setAttribute("opacity", "1");
          gsap.fromTo(r, { attr: { width: 0, height: 0, x: x + 0.5, y: y + 0.5 } }, { attr: { width: 1, height: 1, x, y }, duration: 0.12, ease: "steps(3)", delay: 0.1 + Math.random() * 0.12 });
        } else {
          gsap.to(r, { attr: { opacity: 0 }, duration: 0.2, ease: "steps(3)" });
        }
      });
      return;
    }

    const p = path.current!;
    const layer = fx.current!;
    gsap.killTweensOf(layer.children);
    layer.replaceChildren();
    if (reduced) {
      p.setAttribute("d", glyphPath(next));
      return;
    }
    // Keep the shared pixels, animate the rest, then settle into the new path.
    p.setAttribute("d", glyphPath(next.map((on, i) => on && before[i])));
    const added: SVGRectElement[] = [];
    const removed: SVGRectElement[] = [];
    next.forEach((on, i) => {
      if (on && !before[i]) added.push(makeRect(i));
      else if (!on && before[i]) removed.push(makeRect(i));
    });
    layer.append(...removed, ...added);
    removed.forEach((r) => gsap.to(r, { attr: { y: +r.getAttribute("y")! + 1.5, opacity: 0 }, duration: 0.2, ease: "steps(3)" }));
    added.forEach((r) => {
      const x = +r.getAttribute("x")!;
      const y = +r.getAttribute("y")!;
      gsap.fromTo(r, { attr: { width: 0, height: 0, x: x + 0.5, y: y + 0.5 } }, { attr: { width: 1, height: 1, x, y }, duration: 0.12, ease: "steps(3)", delay: 0.1 + Math.random() * 0.12 });
    });
    const settle = gsap.delayedCall(0.36, () => {
      p.setAttribute("d", glyphPath(next));
      layer.replaceChildren();
    });
    return () => {
      settle.kill();
    };
  }, [char, pixels]);

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
      {pixels ? (
        CELLS.map((i) => (
          <rect key={i} data-cell="" x={i % GLYPH_W} y={Math.floor(i / GLYPH_W)} width={1} height={1} fill="currentColor" opacity={initial[i] ? 1 : 0} />
        ))
      ) : (
        <>
          <path ref={path} d={glyphPath(initial)} fill="currentColor" />
          <g ref={fx} />
        </>
      )}
    </svg>
  );
}

export default memo(PixelDigit);

/** Two pixel squares stacked, for the colon between digit pairs. */
export const PixelColon = memo(function PixelColon({ className = "", on = true }: { className?: string; on?: boolean }) {
  return (
    <svg
      viewBox="0 0 1 7"
      className={`block h-[1em] w-auto ${className}`}
      style={{ aspectRatio: "1 / 7", opacity: on ? 1 : 0.2 }}
      shapeRendering="crispEdges"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M0 2h1v1H0zM0 4h1v1H0z" fill="currentColor" />
    </svg>
  );
});
