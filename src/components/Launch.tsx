"use client";

import { useEffect, useRef } from "react";
import { LAUNCH_ISO } from "@/config";
import { useCountdownValue } from "@/lib/countdown";
import { gsap, useIdleGSAP, MQ, prefersReducedMotion } from "@/lib/gsap";
import BigCountdown from "./BigCountdown";
import CalendarButton from "./CalendarButton";
import PixelFox from "./PixelFox";

/**
 * Launch: a giant live countdown across the full width, assembled from
 * scattered pixels as the section scrolls in, with the wow fox peeking from
 * behind the seconds. The consumer CTA (Add to calendar) lives here.
 */
export default function Launch() {
  const section = useRef<HTMLElement>(null);
  const counter = useRef<HTMLDivElement>(null);
  const fox = useRef<HTMLDivElement>(null);
  // Re-render only when the minute (or the launched state) changes.
  const minute = useCountdownValue(LAUNCH_ISO, (c) => (!c.ready ? "-" : c.launched ? "launched" : c.mm));
  const launched = minute === "launched";

  // Two-frame bounce whenever the minutes change.
  const firstMinute = useRef(true);
  useEffect(() => {
    if (minute === "-" || launched) return;
    if (firstMinute.current) {
      firstMinute.current = false;
      return;
    }
    if (prefersReducedMotion() || !fox.current) return;
    const tl = gsap
      .timeline()
      .set(fox.current, { y: -10 })
      .set(fox.current, { y: 0 }, 0.12)
      .set(fox.current, { y: -10 }, 0.24)
      .set(fox.current, { y: 0 }, 0.36);
    return () => {
      tl.kill();
    };
  }, [minute, launched]);

  // Digits assemble from scattered pixels, scrubbed as the section enters.
  useIdleGSAP(
    () => {
      if (launched) return;
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        // Attribute tweens only (x, y, fill-opacity): no transform parsing on 280 rects.
        const cells = counter.current!.querySelectorAll<SVGRectElement>("rect[data-cell]");
        const tl = gsap.timeline({
          scrollTrigger: { trigger: section.current, start: "top 95%", end: "top 45%", scrub: 0.6 },
        });
        cells.forEach((r) => {
          const x = +r.getAttribute("x")!;
          const y = +r.getAttribute("y")!;
          tl.fromTo(
            r,
            { attr: { x: x + gsap.utils.random(-5, 5, 1), y: y + gsap.utils.random(-4, 4, 1), "fill-opacity": 0 } },
            { attr: { x, y, "fill-opacity": 1 }, ease: "none", duration: 0.6 },
            Math.random() * 0.4,
          );
        });
        gsap.from(fox.current, {
          yPercent: 100,
          ease: "none",
          scrollTrigger: { trigger: section.current, start: "top 75%", end: "top 35%", scrub: 0.6 },
        });
      });
      return () => mm.revert();
    },
    { scope: section, dependencies: [launched], revertOnUpdate: true },
  );

  return (
    <section id="launch" ref={section} data-nav="yellow" aria-labelledby="launch-title" className="relative z-[7] overflow-x-clip bg-yellow pb-28 pt-[calc(var(--nav-h)+48px)] text-merlot">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-8 lg:px-12">
        <BigCountdown
          ref={counter}
          pixels
          className="launch-counter"
          slot={
            // Clip box ends exactly at the digit tops: only ears and eyes show, the
            // muzzle stays hidden below the line, so the glyphs are never covered.
            <div
              className="pointer-events-none absolute bottom-full right-[calc(var(--bc-dp)*1)] overflow-hidden"
              style={{ width: "calc(var(--bc-dp) * var(--fox-k))", height: "calc(var(--bc-dp) * var(--fox-k) * 35 / 41 * 0.68)" }}
            >
              <div ref={fox}>
                <PixelFox frame="wow" />
              </div>
            </div>
          }
        />

        <div className="mt-16 flex flex-col gap-10 lg:mt-20 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 id="launch-title" className="max-w-[20ch] text-[clamp(2rem,4.4vw,4rem)] font-extrabold leading-[1.04] tracking-[-0.035em]">
              The board opens 30 November, midnight in Cairo.
            </h2>
            <p className="mt-4 text-[1.25rem] font-semibold text-body">Cairo first. Alexandria next.</p>
          </div>
          {!launched && (
            <div className="shrink-0">
              <CalendarButton />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
