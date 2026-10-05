"use client";

import { prefersReducedMotion } from "./gsap";

const COLORS = ["#FEE571", "#B4D4FB", "#F9F5E9"];

interface BurstOptions {
  count?: number;
  /** Square size range in CSS px. */
  size?: [number, number];
  /** Initial speed range in px per second. */
  speed?: [number, number];
  duration?: number;
  colors?: string[];
  /** Spread angle around straight up, in radians. Math.PI * 2 for a full ring. */
  spread?: number;
}

/**
 * Pixel confetti on a throwaway full-screen canvas: squares with gravity,
 * snapped to whole pixels, gone after `duration` ms. Skipped under reduced motion.
 */
export function pixelBurst(x: number, y: number, opts: BurstOptions = {}) {
  if (typeof window === "undefined" || prefersReducedMotion()) return;
  const {
    count = 48,
    size = [6, 12],
    speed = [380, 900],
    duration = 1000,
    colors = COLORS,
    spread = Math.PI * 1.2,
  } = opts;

  const canvas = document.createElement("canvas");
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  const w = window.innerWidth;
  const h = window.innerHeight;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  canvas.setAttribute("aria-hidden", "true");
  Object.assign(canvas.style, {
    position: "fixed",
    inset: "0",
    width: `${w}px`,
    height: `${h}px`,
    pointerEvents: "none",
    zIndex: "90",
  });
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    canvas.remove();
    return;
  }
  ctx.scale(dpr, dpr);

  const parts = Array.from({ length: count }, () => {
    const a = -Math.PI / 2 + (Math.random() - 0.5) * spread;
    const v = speed[0] + Math.random() * (speed[1] - speed[0]);
    const s = Math.round(size[0] + Math.random() * (size[1] - size[0]));
    return {
      x,
      y,
      vx: Math.cos(a) * v,
      vy: Math.sin(a) * v,
      s,
      c: colors[(Math.random() * colors.length) | 0],
    };
  });

  const gravity = 1900;
  const start = performance.now();
  let last = start;
  const frame = (now: number) => {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    const t = (now - start) / duration;
    ctx.clearRect(0, 0, w, h);
    // The last 30% fades out in 3 hard steps, never a smooth fade.
    const alpha = t < 0.7 ? 1 : t < 0.8 ? 0.66 : t < 0.9 ? 0.33 : 0;
    for (const p of parts) {
      p.vy += gravity * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (alpha <= 0) continue;
      const px = Math.round(p.x - p.s / 2);
      const py = Math.round(p.y - p.s / 2);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.c;
      ctx.fillRect(px, py, p.s, p.s);
      // A merlot edge keeps light squares visible on coconut.
      ctx.strokeStyle = "rgba(104,27,43,.45)";
      ctx.lineWidth = 1;
      ctx.strokeRect(px + 0.5, py + 0.5, p.s - 1, p.s - 1);
    }
    if (t < 1) requestAnimationFrame(frame);
    else canvas.remove();
  };
  requestAnimationFrame(frame);
}

/** Burst from the centre of an element. */
export function burstFrom(el: Element, opts?: BurstOptions) {
  const r = el.getBoundingClientRect();
  pixelBurst(r.left + r.width / 2, r.top + r.height / 2, opts);
}
