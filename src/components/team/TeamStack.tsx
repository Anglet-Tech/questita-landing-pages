"use client";

import { useEffect } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

const DESKTOP_MOTION = "(min-width: 1024px) and (prefers-reduced-motion: no-preference)";

/**
 * The team's stacking, done cleanly. CSS pins every full-height section
 * (position: sticky); this keeps each pin offset right for sections taller
 * than the viewport, and scrubs a small shrink on the covered section while
 * the next one slides over. No overlay and no opacity change, so no mud.
 * Triggers are the static anchors between sections, never the sticky
 * sections themselves.
 */
export default function TeamStack() {
  // Pin offset: under the nav, or bottom-aligned when the section is taller.
  useEffect(() => {
    const secs = Array.from(document.querySelectorAll<HTMLElement>(".tm-sec[data-pin]"));
    const nav = 68;
    const apply = () => {
      const vh = window.innerHeight;
      secs.forEach((s) => s.style.setProperty("--pin-top", `${Math.min(nav, vh - s.offsetHeight)}px`));
    };
    apply();
    const ro = new ResizeObserver(apply);
    secs.forEach((s) => ro.observe(s));
    window.addEventListener("resize", apply);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", apply);
    };
  }, []);

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add(DESKTOP_MOTION, () => {
      const anchors = Array.from(document.querySelectorAll<HTMLElement>(".tm-anchor"));
      anchors.forEach((a) => {
        const prev = a.previousElementSibling as HTMLElement | null;
        if (!prev?.hasAttribute("data-pin")) return;
        const inner = prev.querySelector<HTMLElement>(":scope > .tm-inner");
        if (!inner) return;
        gsap.fromTo(
          inner,
          { scale: 1, yPercent: 0 },
          {
            scale: 0.93,
            yPercent: -3,
            ease: "none",
            scrollTrigger: { trigger: a, start: "top bottom", end: "top top", scrub: true },
          },
        );
      });
    });
    return () => mm.revert();
  });

  return null;
}
