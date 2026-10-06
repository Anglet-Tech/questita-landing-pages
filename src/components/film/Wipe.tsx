"use client";

import { useRef } from "react";
import { stairClip } from "@/lib/stairs";
import { gsap, MQ, ScrollTrigger, useIdleGSAP } from "@/lib/gsap";

const COLORS = {
  merlot: "var(--merlot)",
  coconut: "var(--coconut)",
  yellow: "var(--yellow)",
  blue: "var(--blue)",
} as const;

/**
 * Chapter change: the incoming chapter's leading edge is a one-screen-tall
 * staircase in its colour, sitting above the chapter and sweeping up over the
 * outgoing frame as the chapter enters. clip-path is written only when the
 * quantised step changes. Reduced motion: no wipe, a hard cut.
 */
export default function Wipe({ color, flip = false }: { color: keyof typeof COLORS; flip?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);

  useIdleGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        const el = ref.current!;
        let last = -1;
        const draw = (p: number) => {
          const q = Math.round(p * 28) / 28;
          if (q === last) return;
          last = q;
          el.style.clipPath = stairClip(q, 12);
        };
        draw(0);
        const st = ScrollTrigger.create({
          trigger: el.parentElement,
          start: "top bottom",
          end: "top top",
          onUpdate: (self) => draw(self.progress),
          onRefresh: (self) => draw(self.progress),
        });
        return () => st.kill();
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  return <div ref={ref} aria-hidden="true" className={`film-wipe ${flip ? "film-wipe-flip" : ""}`} style={{ background: COLORS[color] }} />;
}
