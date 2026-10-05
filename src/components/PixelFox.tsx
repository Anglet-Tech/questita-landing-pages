"use client";

import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { FOX, FOX_H, FOX_W, distanceFromNose, isEyeHighlight, type FoxFrame } from "@/lib/fox";
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
}

/**
 * The Questita fox, rendered from fox-pixels.json as crisp SVG rects. Size it
 * with CSS (width); the viewBox keeps the 41 x 35 pixel grid. Every rect carries
 * data-d (normalised distance from the nose) for pop-in staggers.
 */
const PixelFox = forwardRef<HTMLDivElement, PixelFoxProps>(function PixelFox(
  { frame = "happy", trackEyes = false, followHead = false, className = "", label },
  ref,
) {
  const [winking, setWinking] = useState(false);
  const shown: FoxFrame = winking ? "wink" : frame;
  const sprite = FOX[shown];

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

  // Pointer tracking: quickTo only, never React state.
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
    const onMove = (e: PointerEvent) => {
      const r = wrap.getBoundingClientRect();
      if (r.bottom < -200 || r.top > window.innerHeight + 200) return;
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height * 0.62;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
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
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      gsap.killTweensOf([head, eyes]);
    };
  }, [trackEyes, followHead]);

  const { body, eyes } = useMemo(() => {
    const body: { key: string; fill: string; r: number[]; d: number }[] = [];
    const eyes: { key: string; fill: string; r: number[]; d: number }[] = [];
    for (const layer of sprite.layers) {
      for (const r of layer.rects) {
        const item = {
          key: `${layer.fill}-${r.join("-")}`,
          fill: layer.fill,
          r,
          d: Math.round(distanceFromNose(r) * 100) / 100,
        };
        if (isEyeHighlight(layer.fill, r)) eyes.push(item);
        else body.push(item);
      }
    }
    return { body, eyes };
  }, [sprite]);


  const rect = (it: { key: string; fill: string; r: number[]; d: number }) => (
    <rect
      key={it.key}
      data-px=""
      data-d={it.d}
      x={it.r[0]}
      y={it.r[1]}
      width={it.r[2]}
      height={it.r[3]}
      fill={it.fill}
    />
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
      <div ref={headRef} className="will-change-transform" style={{ transformOrigin: "50% 80%" }}>
        <svg
          viewBox={`0 0 ${FOX_W} ${FOX_H}`}
          width="100%"
          shapeRendering="crispEdges"
          className="h-auto w-full overflow-visible"
          focusable="false"
        >
          <g>{body.map(rect)}</g>
          <g ref={eyesRef}>{eyes.map(rect)}</g>
        </svg>
      </div>
    </div>
  );
});

export default PixelFox;

/** Pop every rect of a fox from the nose outward. Returns the tween for timelines. */
export function popFox(root: Element | null, opts: { duration?: number; spread?: number } = {}) {
  if (!root) return gsap.timeline();
  const rects = Array.from(root.querySelectorAll<SVGRectElement>("[data-px]"));
  const spread = opts.spread ?? 0.7;
  return gsap.fromTo(
    rects,
    { scale: 0, transformOrigin: "50% 50%" },
    {
      scale: 1,
      duration: opts.duration ?? 0.22,
      ease: "steps(3)",
      stagger: (i, el) => (Number((el as Element).getAttribute("data-d")) / 26) * spread,
    },
  );
}
