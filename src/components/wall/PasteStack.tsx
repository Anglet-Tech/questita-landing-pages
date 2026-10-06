"use client";

import { useRef } from "react";
import { gsap, MQ, ScrollTrigger, useGSAP } from "@/lib/gsap";

/** Resting tilt each incoming poster starts from, alternating sides. */
const TILTS = [0, 1.8, -1.4, 1.6, -1.9, 1.3, -1.6];

/**
 * The wheat-paste stack. Posters are CSS sticky (top 0, or bottom-aligned
 * when taller than the screen), so each one stays put while the next is
 * pasted over it. This component only adds the paste motion:
 * - the incoming poster rises with a 1 to 2 degree tilt that settles to 0,
 * - its wet paste drips run down the top edge in 4 steps,
 * - the covered poster eases to 0.98 (no dark overlay, no fade),
 * - once a poster is fully covered it is hidden, so it is never painted.
 */
export default function PasteStack({ children }: { children: React.ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = root.current!;
      const posters = Array.from(el.querySelectorAll<HTMLElement>("[data-poster]"));
      const anchors = posters.map((p) => p.previousElementSibling as HTMLElement);

      // Sticky offset: 0 for posters that fit, negative for taller ones, so
      // they scroll fully into view before sticking by their bottom edge.
      let vh = window.innerHeight;
      const setStick = () => {
        vh = window.innerHeight;
        posters.forEach((p) => p.style.setProperty("--stick", `${Math.min(0, vh - p.offsetHeight)}px`));
      };
      setStick();
      const ro = new ResizeObserver(setStick);
      posters.forEach((p) => ro.observe(p));
      const onResize = () => {
        if (window.innerHeight !== vh) setStick();
      };
      window.addEventListener("resize", onResize);

      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        posters.forEach((p, i) => {
          if (i === 0) return;
          const anchor = anchors[i];
          const prev = posters[i - 1];
          const prevPaper = prev.querySelector<HTMLElement>(":scope > .wl-paper");
          const drips = p.querySelector<HTMLElement>(":scope > .wl-paper > [data-drips]");

          gsap.fromTo(
            p,
            { rotation: TILTS[i % TILTS.length] },
            {
              rotation: 0,
              ease: "none",
              // The last poster may be shorter than the screen: it settles when the page ends.
              scrollTrigger: { trigger: anchor, start: "top bottom", end: i === posters.length - 1 ? "max" : "top top", scrub: true },
            },
          );
          if (drips) {
            gsap.fromTo(
              drips,
              { scaleY: 0 },
              { scaleY: 1, ease: "steps(4)", scrollTrigger: { trigger: anchor, start: "top 55%", end: "top 8%", scrub: true } },
            );
          }
          if (prevPaper) {
            gsap.fromTo(
              prevPaper,
              { scale: 1 },
              { scale: 0.98, ease: "none", immediateRender: false, scrollTrigger: { trigger: anchor, start: "top bottom", end: "top top", scrub: true } },
            );
          }
          // Fully covered: stop painting it.
          ScrollTrigger.create({
            trigger: anchor,
            start: "top top",
            endTrigger: el,
            end: "bottom top",
            toggleClass: { targets: prev, className: "wl-covered" },
          });
        });
      });

      return () => {
        mm.revert();
        ro.disconnect();
        window.removeEventListener("resize", onResize);
      };
    },
    { scope: root },
  );

  return (
    <div ref={root} className="wl-stack">
      {children}
    </div>
  );
}
