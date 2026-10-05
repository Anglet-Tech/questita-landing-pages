"use client";

import { useRef } from "react";
import { ScrollTrigger, useGSAP, prefersReducedMotion } from "@/lib/gsap";

const COLORS = {
  merlot: "#681B2B",
  night: "#571623",
  coconut: "#F9F5E9",
  yellow: "#FEE571",
  blue: "#B4D4FB",
} as const;
export type SeamColor = keyof typeof COLORS;

const ROWS = 4;

/**
 * Pixel dissolve seam: a 4-row band of squares in the incoming colour, sitting
 * on top of the previous section. Squares scale from 0 to 1 in a random
 * stagger, biased so the row touching the incoming section fills first,
 * scrubbed as the seam crosses the viewport. One canvas, no DOM squares.
 * Reduced motion draws a static stair-step edge.
 */
export default function PixelSeam({ to, from }: { to: SeamColor; from?: SeamColor }) {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);

  useGSAP(
    () => {
      const cv = canvas.current!;
      const ctx = cv.getContext("2d")!;
      let size = 28;
      let cols = 0;
      let w = 0;
      let thresholds: number[] = [];
      let progress = 0;
      const reduced = prefersReducedMotion();

      const measure = () => {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        w = wrap.current!.offsetWidth;
        size = w < 640 ? 20 : w < 1280 ? 28 : 32;
        cols = Math.ceil(w / size);
        const h = ROWS * size;
        wrap.current!.style.height = `${h}px`;
        wrap.current!.style.top = `${-h + 1}px`;
        cv.width = Math.ceil(w * dpr);
        cv.height = Math.ceil(h * dpr);
        cv.style.width = `${w}px`;
        cv.style.height = `${h}px`;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        // Deterministic per column so resizes do not reshuffle the pattern much.
        thresholds = [];
        let seed = 7;
        const rand = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
        for (let r = 0; r < ROWS; r++) {
          for (let c = 0; c < cols; c++) {
            const fromBottom = ROWS - 1 - r; // 0 touches the incoming section
            thresholds.push((fromBottom / ROWS) * 0.55 + rand() * 0.35);
          }
        }
      };

      const draw = () => {
        ctx.clearRect(0, 0, w, ROWS * size);
        ctx.fillStyle = COLORS[to];
        if (reduced) {
          // Static staircase: column heights step 1..4 rows in runs of 3.
          for (let c = 0; c < cols; c++) {
            const hRows = 1 + (Math.floor(c / 3) % ROWS);
            ctx.fillRect(c * size, (ROWS - hRows) * size, size, hRows * size);
          }
          return;
        }
        for (let r = 0; r < ROWS; r++) {
          for (let c = 0; c < cols; c++) {
            const t = thresholds[r * cols + c];
            const local = Math.max(0, Math.min(1, (progress - t) / 0.12));
            if (local <= 0) continue;
            // Scale snaps to whole pixels so squares stay crisp.
            const s = Math.round(size * local);
            const o = Math.floor((size - s) / 2);
            ctx.fillRect(c * size + o, r * size + o, s, s);
          }
        }
      };

      measure();
      draw();
      if (reduced) {
        const ro = new ResizeObserver(() => {
          measure();
          draw();
        });
        ro.observe(wrap.current!);
        return () => ro.disconnect();
      }

      const st = ScrollTrigger.create({
        trigger: wrap.current,
        start: "top 82%",
        end: "bottom 40%",
        onUpdate: (self) => {
          progress = self.progress;
          draw();
        },
        onRefresh: (self) => {
          measure();
          progress = self.progress;
          draw();
        },
      });
      return () => st.kill();
    },
    { scope: wrap },
  );

  return (
    <div
      ref={wrap}
      aria-hidden="true"
      data-seam={`${from ?? ""}-${to}`}
      className="pointer-events-none absolute inset-x-0 z-20"
      style={{ top: -111, height: 112 }}
    >
      <canvas ref={canvas} className="block" />
    </div>
  );
}
