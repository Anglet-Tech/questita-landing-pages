"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { FOX, FOX_H, FOX_W, isEyeHighlight, type FoxFrame } from "@/lib/fox";

const rectPath = ([x, y, w, h]: number[]) => `M${x} ${y}h${w}v${h}h-${w}z`;

/**
 * A light fox for the chooser: one <path> per colour, no GSAP. The eye
 * highlights step one fox pixel toward the pointer (rAF-throttled, only while
 * the fox is on screen). Clicking it cycles wink, wow, happy.
 */
export default function ChooserFox({ className = "" }: { className?: string }) {
  const [frame, setFrame] = useState<FoxFrame>("happy");
  const wrap = useRef<HTMLButtonElement>(null);
  const eyes = useRef<SVGGElement>(null);

  const geo = useMemo(() => {
    const body: { fill: string; d: string }[] = [];
    const eye: { fill: string; d: string }[] = [];
    for (const layer of FOX[frame].layers) {
      let b = "";
      let e = "";
      for (const r of layer.rects) {
        if (isEyeHighlight(layer.fill, r)) e += rectPath(r);
        else b += rectPath(r);
      }
      if (b) body.push({ fill: layer.fill, d: b });
      if (e) eye.push({ fill: layer.fill, d: e });
    }
    return { body, eye };
  }, [frame]);

  useEffect(() => {
    const el = wrap.current;
    const g = eyes.current;
    if (!el || !g) return;
    let raf = 0;
    let px = 0;
    let py = 0;
    let visible = true;
    let last = "";
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const dx = px - (r.left + r.width / 2);
      const dy = py - (r.top + r.height * 0.62);
      const ex = Math.abs(dx) < r.width * 0.12 ? 0 : Math.sign(dx);
      const ey = Math.abs(dy) < r.height * 0.12 ? 0 : Math.sign(dy);
      const t = `translate(${ex}px, ${ey}px)`;
      if (t !== last) g.style.transform = last = t;
    };
    const onMove = (e: PointerEvent) => {
      px = e.clientX;
      py = e.clientY;
      if (visible && !raf) raf = requestAnimationFrame(update);
    };
    const io = new IntersectionObserver(([en]) => (visible = en.isIntersecting));
    io.observe(el);
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  const next: Record<FoxFrame, FoxFrame> = { happy: "wink", wink: "wow", wow: "happy", oops: "happy" };

  return (
    <button
      ref={wrap}
      type="button"
      className={`ch-fox ${className}`}
      aria-label="The Questita fox. Press to change its face."
      onClick={() => setFrame((f) => next[f])}
    >
      <svg viewBox={`0 0 ${FOX_W} ${FOX_H}`} shapeRendering="crispEdges" className="h-auto w-full overflow-visible" aria-hidden="true" focusable="false">
        {geo.body.map((p) => (
          <path key={p.fill} d={p.d} fill={p.fill} />
        ))}
        <g ref={eyes}>
          {geo.eye.map((p) => (
            <path key={p.fill} d={p.d} fill={p.fill} />
          ))}
        </g>
      </svg>
    </button>
  );
}
