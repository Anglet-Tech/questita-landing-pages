"use client";

import { gsap, SplitText, MQ } from "@/lib/gsap";

/**
 * The minimal page's only entrance motion: headings ([data-mh]) rise from a
 * line mask once, body copy ([data-mb]) fades up 12px. Call inside useGSAP
 * with the section as scope; returns a cleanup.
 */
export function minimalReveal(scope: HTMLElement): () => void {
  const mm = gsap.matchMedia();
  const splits: SplitText[] = [];
  mm.add(MQ.motion, () => {
    scope.querySelectorAll<HTMLElement>("[data-mh]").forEach((h) => {
      const split = SplitText.create(h, { type: "lines", mask: "lines", linesClass: "split-mask" });
      splits.push(split);
      gsap.from(split.lines, {
        yPercent: 110,
        duration: 0.7,
        ease: "expo.out",
        stagger: 0.07,
        scrollTrigger: { trigger: h, start: "top 85%", once: true },
        onComplete: () => split.revert(),
      });
    });
    scope.querySelectorAll<HTMLElement>("[data-mb]").forEach((b) => {
      gsap.from(b, {
        y: 12,
        autoAlpha: 0,
        duration: 0.7,
        ease: "expo.out",
        scrollTrigger: { trigger: b, start: "top 90%", once: true },
      });
    });
  });
  return () => {
    mm.revert();
    splits.forEach((s) => s.revert());
  };
}
