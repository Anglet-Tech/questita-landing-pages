"use client";

import { forwardRef, memo, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { FOX, FOX_H, FOX_W, distanceFromNose, isEyeHighlight, type FoxFrame, type FoxRect } from "@/lib/fox";
import { WINK_EVENT } from "@/lib/store";

export interface PixelFoxProps {
  frame?: FoxFrame;
  /** Eye highlights shift one pixel toward the pointer. */
  trackEyes?: boolean;
  /** The head also eases a few px and degrees toward the pointer. */
  followHead?: boolean;
  className?: string;
  /** Accessible name. Omit for a decorative fox. */
  label?: string;
  /**
   * Render one element per pixel (needed only for the nose-out pop-in on the
   * preloader and hero). By default each colour is a single <path>.
   */
  pixels?: boolean;
}

interface FrameGeometry {
  /** One path per fill colour, body only. */
  body: { fill: string; d: string }[];
  /** The eye highlights, which move with the pointer. */
  eyes: { fill: string; d: string }[];
  /** Per-pixel rects for the pop-in variant. */
  rects: { key: string; fill: string; r: FoxRect; d: number; eye: boolean }[];
}

const rectPath = (r: FoxRect) => `M${r[0]} ${r[1]}h${r[2]}v${r[3]}h-${r[2]}z`;

const cache = new Map<FoxFrame, FrameGeometry>();
function geometry(frame: FoxFrame): FrameGeometry {
  const hit = cache.get(frame);
  if (hit) return hit;
  const body: FrameGeometry["body"] = [];
  const eyes: FrameGeometry["eyes"] = [];
  const rects: FrameGeometry["rects"] = [];
  for (const layer of FOX[frame].layers) {
    let b = "";
    let e = "";
    for (const r of layer.rects) {
      const eye = isEyeHighlight(layer.fill, r);
      if (eye) e += rectPath(r);
      else b += rectPath(r);
      rects.push({ key: `${layer.fill}-${r.join("-")}`, fill: layer.fill, r, d: Math.round(distanceFromNose(r) * 100) / 100, eye });
    }
    if (b) body.push({ fill: layer.fill, d: b });
    if (e) eyes.push({ fill: layer.fill, d: e });
  }
  const g = { body, eyes, rects };
  cache.set(frame, g);
  return g;
}

/**
 * The Questita fox from fox-pixels.json: one SVG path per colour (5 nodes),
 * sized with CSS width. The viewBox keeps the 41 x 35 pixel grid.
 */
const PixelFox = forwardRef<HTMLDivElement, PixelFoxProps>(function PixelFox(
  { frame = "happy", trackEyes = false, followHead = false, className = "", label, pixels = false },
  ref,
) {
  const [winking, setWinking] = useState(false);
  const shown: FoxFrame = winking ? "wink" : frame;
  const geo = useMemo(() => geometry(shown), [shown]);

  const wrapRef = useRef<HTMLDivElement | null>(null);
  useImperativeHandle(ref, () => wrapRef.current as HTMLDivElement, []);
  const headRef = useRef<HTMLDivElement | null>(null);
  const eyesRef = useRef<SVGGElement | null>(null);

  // Everyone winks when someone types "fox".
  useEffect(() => {
    let t: ReturnType<typeof setTimeout> | undefined;
    const onWink = () => {
      setWinking(true);
      clearTimeout(t);
      t = setTimeout(() => setWinking(false), 900);
    };
    window.addEventListener(WINK_EVENT, onWink);
    return () => {
      window.removeEventListener(WINK_EVENT, onWink);
      clearTimeout(t);
    };
  }, []);

  // Pointer tracking: only while on screen, one rect read per frame at most,
  // values go through quickTo, never React state.
  useEffect(() => {
    if (!trackEyes && !followHead) return;
    const wrap = wrapRef.current;
    const head = headRef.current;
    const eyes = eyesRef.current;
    if (!wrap || !head) return;
    const eyeX = gsap.quickTo(eyes, "x", { duration: 0.08, ease: "steps(1)" });
    const eyeY = gsap.quickTo(eyes, "y", { duration: 0.08, ease: "steps(1)" });
    const headX = gsap.quickTo(head, "x", { duration: 0.6, ease: "power3.out" });
    const headR = gsap.quickTo(head, "rotation", { duration: 0.6, ease: "power3.out" });
    let lastX = 0;
    let lastY = 0;
    let visible = false;
    let raf = 0;
    let px = 0;
    let py = 0;
    const update = () => {
      raf = 0;
      const r = wrap.getBoundingClientRect();
      const dx = px - (r.left + r.width / 2);
      const dy = py - (r.top + r.height * 0.62);
      if (trackEyes && eyes) {
        const ex = Math.abs(dx) < r.width * 0.12 ? 0 : Math.sign(dx);
        const ey = Math.abs(dy) < r.height * 0.12 ? 0 : Math.sign(dy);
        if (ex !== lastX) eyeX(ex);
        if (ey !== lastY) eyeY(ey);
        lastX = ex;
        lastY = ey;
      }
      if (followHead) {
        const nx = gsap.utils.clamp(-1, 1, dx / (window.innerWidth / 2));
        headX(nx * 6);
        headR(nx * 3);
      }
    };
    const onMove = (e: PointerEvent) => {
      px = e.clientX;
      py = e.clientY;
      if (visible && !raf) raf = requestAnimationFrame(update);
    };
    const io = new IntersectionObserver(([en]) => (visible = en.isIntersecting));
    io.observe(wrap);
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      gsap.killTweensOf([head, eyes]);
    };
  }, [trackEyes, followHead]);

  const rect = (it: FrameGeometry["rects"][number]) => (
    <rect key={it.key} data-px="" data-d={it.d} x={it.r[0]} y={it.r[1]} width={it.r[2]} height={it.r[3]} fill={it.fill} />
  );

  return (
    <div
      ref={wrapRef}
      className={`relative ${className}`}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      data-frame={shown}
    >
      <div ref={headRef} style={{ transformOrigin: "50% 80%" }}>
        <svg viewBox={`0 0 ${FOX_W} ${FOX_H}`} width="100%" shapeRendering="crispEdges" className="h-auto w-full overflow-visible" focusable="false">
          {pixels ? (
            <>
              <g>{geo.rects.filter((r) => !r.eye).map(rect)}</g>
              <g ref={eyesRef}>{geo.rects.filter((r) => r.eye).map(rect)}</g>
            </>
          ) : (
            <>
              {geo.body.map((p) => (
                <path key={p.fill} d={p.d} fill={p.fill} />
              ))}
              <g ref={eyesRef}>
                {geo.eyes.map((p) => (
                  <path key={p.fill} d={p.d} fill={p.fill} />
                ))}
              </g>
            </>
          )}
        </svg>
      </div>
    </div>
  );
});

export default memo(PixelFox);

/**
 * Pop every pixel of a fox (rendered with `pixels`) from the nose outward.
 * Animates SVG attributes only, so no transform parsing or style reads.
 */
export function popFox(root: Element | null, opts: { duration?: number; spread?: number } = {}) {
  if (!root) return gsap.timeline();
  const rects = Array.from(root.querySelectorAll<SVGRectElement>("[data-px]"));
  const spread = opts.spread ?? 0.7;
  const tl = gsap.timeline();
  rects.forEach((el) => {
    const x = +el.getAttribute("x")!;
    const y = +el.getAttribute("y")!;
    const w = +el.getAttribute("width")!;
    const h = +el.getAttribute("height")!;
    const d = Number(el.getAttribute("data-d"));
    tl.fromTo(
      el,
      { attr: { x: x + w / 2, y: y + h / 2, width: 0, height: 0 } },
      { attr: { x, y, width: w, height: h }, duration: opts.duration ?? 0.22, ease: "steps(3)" },
      (d / 26) * spread,
    );
  });
  return tl;
}
