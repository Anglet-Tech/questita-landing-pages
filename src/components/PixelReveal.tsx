"use client";

import { useEffect, useRef } from "react";
import { gsap, hasFinePointer, prefersReducedMotion } from "@/lib/gsap";

const MERLOT = "#681B2B";
const CELL = 40;

interface Cell {
  t: number; // time it was erased
  life: number; // ms until fully healed
}

/**
 * The hero's signature: a solid merlot canvas over the felucca scene. The
 * pointer erases a chunky diamond of grid-snapped 40px cells; each heals back in
 * four stepped alpha jumps. Touch devices get an autonomous Lissajous wanderer
 * plus tap rings. Reduced motion gets a static staircase window, bottom right.
 * Cells overlapping [data-reveal-exclude] elements are never erased.
 */
export default function PixelReveal({ hostRef }: { hostRef: React.RefObject<HTMLElement | null> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = hostRef.current;
    if (!canvas || !host) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = prefersReducedMotion();
    const fine = hasFinePointer();
    let w = 0;
    let h = 0;
    let cols = 0;
    let rows = 0;
    let dpr = 1;
    const cells = new Map<number, Cell>();
    let running = false;
    let inView = true;
    let excludes: DOMRect[] = [];
    let canvasRect: DOMRect = canvas.getBoundingClientRect();

    const measure = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvasRect = canvas.getBoundingClientRect();
      w = Math.ceil(canvasRect.width);
      h = Math.ceil(canvasRect.height);
      canvas.width = Math.ceil(w * dpr);
      canvas.height = Math.ceil(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(w / CELL);
      rows = Math.ceil(h / CELL);
    };

    const readExcludes = () => {
      canvasRect = canvas.getBoundingClientRect();
      excludes = Array.from(host.querySelectorAll<HTMLElement>("[data-reveal-exclude]")).map((el) => {
        const r = el.getBoundingClientRect();
        return new DOMRect(r.left - canvasRect.left - 8, r.top - canvasRect.top - 8, r.width + 16, r.height + 16);
      });
    };

    const blocked = (cx: number, cy: number) => {
      const x0 = cx * CELL;
      const y0 = cy * CELL;
      return excludes.some((r) => x0 < r.right && x0 + CELL > r.left && y0 < r.bottom && y0 + CELL > r.top);
    };

    const paintSolid = () => {
      ctx.globalAlpha = 1;
      ctx.fillStyle = MERLOT;
      ctx.fillRect(0, 0, w, h);
    };

    const paintStatic = () => {
      // A staircase window bottom right, for reduced motion.
      paintSolid();
      const stepsN = Math.min(7, Math.floor(cols / 2));
      for (let i = 0; i < stepsN; i++) {
        const colsFromRight = stepsN - i;
        const height = (i + 1) * 1.6;
        const x = (cols - colsFromRight * 2) * CELL;
        const rowsTall = Math.min(rows, Math.ceil(height));
        ctx.clearRect(x, (rows - rowsTall) * CELL, CELL * 2, rowsTall * CELL);
      }
    };

    const erase = (px: number, py: number, radius = 2) => {
      const cx = Math.floor(px / CELL);
      const cy = Math.floor(py / CELL);
      const now = performance.now();
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          if (Math.abs(dx) + Math.abs(dy) > radius) continue;
          const x = cx + dx;
          const y = cy + dy;
          if (x < 0 || y < 0 || x >= cols || y >= rows || blocked(x, y)) continue;
          const key = y * cols + x;
          const existing = cells.get(key);
          cells.set(key, { t: now, life: existing?.life ?? 700 + Math.random() * 300 });
        }
      }
      start();
    };

    // Driven by the GSAP ticker (rAF under the hood), attached only while active.
    const frame = () => {
      const now = performance.now();
      paintSolid();
      for (const [key, c] of cells) {
        const age = now - c.t;
        if (age >= c.life) {
          cells.delete(key);
          continue;
        }
        // Four stepped alpha jumps back to merlot: 0, .25, .5, .75.
        const a = Math.floor((age / c.life) * 4) / 4;
        const x = (key % cols) * CELL;
        const y = Math.floor(key / cols) * CELL;
        ctx.clearRect(x, y, CELL, CELL);
        if (a > 0) {
          ctx.globalAlpha = a;
          ctx.fillRect(x, y, CELL, CELL);
          ctx.globalAlpha = 1;
        }
      }
      if (!fine && inView) wander(now);
      if (!(cells.size > 0 || (!fine && inView))) {
        running = false;
        gsap.ticker.remove(frame);
        paintSolid();
      }
    };

    const start = () => {
      if (running || !inView) return;
      running = true;
      gsap.ticker.add(frame);
    };

    // Touch: a slow Lissajous wanderer.
    let lastWander = 0;
    const t0 = performance.now();
    const wander = (now: number) => {
      if (now - lastWander < 70) return;
      lastWander = now;
      const t = (now - t0) / 1000;
      const x = w * (0.5 + 0.42 * Math.sin(t * 0.37));
      const y = h * (0.5 + 0.4 * Math.sin(t * 0.53 + 1.2));
      if (excludes.length === 0 || now % 1000 < 80) readExcludes();
      const cx = Math.floor(x / CELL);
      const cy = Math.floor(y / CELL);
      for (let dy = -1; dy <= 1; dy++)
        for (let dx = -1; dx <= 1; dx++) {
          if (Math.abs(dx) + Math.abs(dy) > 1) continue;
          const gx = cx + dx;
          const gy = cy + dy;
          if (gx < 0 || gy < 0 || gx >= cols || gy >= rows || blocked(gx, gy)) continue;
          const key = gy * cols + gx;
          cells.set(key, { t: now, life: cells.get(key)?.life ?? 800 + Math.random() * 200 });
        }
    };

    const ring = (px: number, py: number) => {
      readExcludes();
      const cx = Math.floor(px / CELL);
      const cy = Math.floor(py / CELL);
      const now = performance.now();
      for (let r = 1; r <= 3; r++) {
        for (let dy = -r; dy <= r; dy++)
          for (let dx = -r; dx <= r; dx++) {
            if (Math.abs(dx) + Math.abs(dy) !== r) continue;
            const x = cx + dx;
            const y = cy + dy;
            if (x < 0 || y < 0 || x >= cols || y >= rows || blocked(x, y)) continue;
            // Outer rings are erased slightly later so the ring expands.
            cells.set(y * cols + x, { t: now + r * 70, life: 850 });
          }
      }
      start();
    };

    measure();
    if (reduced) {
      paintStatic();
      const ro = new ResizeObserver(() => {
        measure();
        paintStatic();
      });
      ro.observe(canvas);
      return () => ro.disconnect();
    }
    paintSolid();

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" && e.pointerType !== "pen") return;
      readExcludes();
      erase(e.clientX - canvasRect.left, e.clientY - canvasRect.top);
    };
    const onDown = (e: PointerEvent) => {
      if (e.pointerType === "mouse") return;
      canvasRect = canvas.getBoundingClientRect();
      ring(e.clientX - canvasRect.left, e.clientY - canvasRect.top);
    };
    host.addEventListener("pointermove", onMove, { passive: true });
    host.addEventListener("pointerdown", onDown, { passive: true });

    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      if (inView && !fine) start();
    });
    io.observe(canvas);

    const ro = new ResizeObserver(() => {
      measure();
      readExcludes();
      paintSolid();
    });
    ro.observe(canvas);

    return () => {
      gsap.ticker.remove(frame);
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerdown", onDown);
      io.disconnect();
      ro.disconnect();
    };
  }, [hostRef]);

  return <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 h-full w-full" />;
}
