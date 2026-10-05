"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, SplitText, useGSAP, MQ } from "@/lib/gsap";
import { asset } from "@/lib/asset";
import PixelSeam from "./PixelSeam";

/**
 * The manifesto, at night. Words drop in one by one snapping in 4px steps,
 * the street zooms from 1.18 to 1 as it scrolls in, and the lamp and windows
 * flicker on once when the section is half in view.
 */
export default function Belief() {
  const section = useRef<HTMLElement>(null);
  const headline = useRef<HTMLHeadingElement>(null);
  const sub = useRef<HTMLParagraphElement>(null);
  const street = useRef<HTMLDivElement>(null);
  const lights = useRef<HTMLImageElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        const split = SplitText.create(headline.current!, { type: "words" });
        gsap.from(split.words, {
          y: -40,
          autoAlpha: 0,
          duration: 0.5,
          ease: "steps(10)",
          stagger: 0.12,
          scrollTrigger: { trigger: headline.current, start: "top 75%", once: true },
        });
        gsap.from(sub.current, {
          autoAlpha: 0,
          y: 16,
          duration: 0.6,
          ease: "steps(4)",
          delay: 0.6,
          scrollTrigger: { trigger: headline.current, start: "top 75%", once: true },
        });

        gsap.fromTo(
          street.current,
          { scale: 1.18, yPercent: 12 },
          {
            scale: 1,
            yPercent: 0,
            ease: "none",
            transformOrigin: "50% 100%",
            scrollTrigger: { trigger: section.current, start: "top bottom", end: "bottom bottom", scrub: true },
          },
        );

        gsap.set(lights.current, { opacity: 0 });
        // Opacity 0, .8, .2, 1, .6, 1 over 700ms, steps(1): every change is a hard cut.
        const flicker = gsap.timeline({ paused: true });
        [0, 0.8, 0.2, 1, 0.6, 1].forEach((o, i) => flicker.set(lights.current, { opacity: o }, i * 0.14));
        ScrollTrigger.create({
          trigger: section.current,
          start: "top 50%",
          once: true,
          onEnter: () => flicker.play(),
        });

        return () => split.revert();
      });
      return () => mm.revert();
    },
    { scope: section },
  );

  return (
    <section
      id="belief"
      ref={section}
      data-nav="night"
      aria-labelledby="belief-title"
      className="on-dark relative z-[4] flex min-h-[100svh] flex-col overflow-hidden bg-merlot-700 text-coconut"
    >
      <PixelSeam from="merlot" to="night" />
      <div className="mx-auto w-full max-w-[1440px] flex-1 px-4 pt-[calc(var(--nav-h)+12vh)] text-center sm:px-8 lg:px-12">
        <h2
          id="belief-title"
          ref={headline}
          className="mx-auto max-w-[14ch] text-[clamp(3rem,8vw,7rem)] font-extrabold leading-[0.98] tracking-[-0.04em]"
        >
          Plans are better with witnesses.
        </h2>
        <p ref={sub} className="mt-6 text-[clamp(1.2rem,2vw,1.6rem)] font-medium text-coconut-78">
          The best part happens offline.
        </p>
      </div>
      <div className="relative mt-16 w-full" style={{ aspectRatio: "1472 / 520" }}>
        <div ref={street} className="absolute inset-0 will-change-transform">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={asset("/img/street-base.png")}
            alt="A night street in Cairo: a tree, a lamp and two friends meeting up."
            width={1472}
            height={520}
            loading="lazy"
            decoding="async"
            className="pixelated absolute inset-0 h-full w-full"
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={lights}
            src={asset("/img/street-lights.png")}
            alt=""
            width={1472}
            height={520}
            loading="lazy"
            decoding="async"
            className="pixelated absolute inset-0 h-full w-full"
          />
        </div>
      </div>
    </section>
  );
}
