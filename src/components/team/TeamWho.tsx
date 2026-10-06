"use client";

import { useRef, useState } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import type { FoxFrame } from "@/lib/fox";
import PixelFox from "../PixelFox";
import { lineMask, revealOnView, whenVisible } from "./motion";

const PILLS = [
  { label: "New to the area", cls: "bg-blue" },
  { label: "New to a group", cls: "bg-coconut" },
  { label: "Tired of cancelling on plans", cls: "bg-yellow" },
];

/** Who it's for: centred on merlot, strikes that draw, a fox that cheers up. */
export default function TeamWho() {
  const section = useRef<HTMLElement>(null);
  const h2 = useRef<HTMLHeadingElement>(null);
  const lines = useRef<HTMLDivElement>(null);
  const punch = useRef<HTMLParagraphElement>(null);
  const [fox, setFox] = useState<FoxFrame>("wow");

  useGSAP(
    () => {
      const offs = [revealOnView(h2.current)];
      if (!prefersReducedMotion()) {
        const q = gsap.utils.selector(section.current);
        const pills = q("[data-pill]");
        const lede = q("[data-lede]");
        const strikes = q(".tm-strike");
        const fx = q("[data-fox]");
        gsap.set(pills, { scale: 0.6, autoAlpha: 0 });
        gsap.set(lede, { y: 16, autoAlpha: 0 });
        gsap.set(strikes, { "--strike": 0 });
        gsap.set(fx, { y: 40, autoAlpha: 0 });
        const p = lineMask(punch.current);
        offs.push(
          whenVisible(h2.current, () => {
            gsap
              .timeline({ delay: 0.3 })
              .to(pills, { scale: 1, autoAlpha: 1, duration: 0.24, ease: "steps(3)", stagger: 0.1 })
              .to(lede, { y: 0, autoAlpha: 1, duration: 0.7, ease: "expo.out" }, 0.2);
          }, 0.2),
          whenVisible(
            lines.current,
            () => {
              gsap
                .timeline()
                .to(strikes, { "--strike": 1, duration: 0.42, ease: "steps(8)", stagger: 0.3 }, 0.1)
                .add(p.play, 0.8)
                .to(fx, { y: 0, autoAlpha: 1, duration: 0.3, ease: "steps(4)" }, 0.9)
                .add(() => setFox("happy"), 1.5);
            },
            0.5,
          ),
          p.revert,
        );
      }
      return () => offs.forEach((f) => f());
    },
    { scope: section },
  );

  return (
    <section ref={section} data-pin aria-labelledby="tm-who-title" className="tm-sec tm-who tm-full on-dark py-16 text-coconut lg:py-[clamp(36px,8vh,104px)]">
      <div className="tm-inner tm-wrap relative flex flex-col items-center gap-[clamp(14px,2.6vh,28px)] text-center">
        <h2 id="tm-who-title" ref={h2} className="text-[clamp(2.5rem,min(5.2vw,8.4vh),4.25rem)] font-extrabold leading-[1.02] tracking-[-0.035em]">
          Built for Cairo.
        </h2>
        <ul className="flex flex-wrap justify-center gap-3">
          {PILLS.map((p) => (
            <li key={p.label} data-pill className={`tm-pill px-corners ${p.cls}`}>
              {p.label}
            </li>
          ))}
        </ul>
        <p data-lede className="max-w-[36rem] text-[1.0625rem] leading-relaxed text-coconut-78 sm:text-[1.125rem]">
          Questita is for the people who make the big city feel smaller.
        </p>
        <div ref={lines} className="mt-1 flex flex-col items-center gap-2 lg:mt-3">
          <p className="text-[clamp(1.625rem,min(3.8vw,5.4vh),2.375rem)] font-extrabold tracking-[-0.02em] text-coconut-78">
            <span className="tm-strike">Not a dating app.</span>
          </p>
          <p className="text-[clamp(1.625rem,min(3.8vw,5.4vh),2.375rem)] font-extrabold tracking-[-0.02em] text-coconut-78">
            <span className="tm-strike">Not another feed to scroll.</span>
          </p>
          <p ref={punch} className="tm-punch font-px mt-3 text-yellow">
            Just plans, with people.
          </p>
        </div>
        <div data-fox className="mt-2 w-[110px] rotate-6 lg:absolute lg:bottom-0 lg:right-[4%] lg:mt-0 lg:w-[clamp(110px,11vw,156px)]">
          <PixelFox frame={fox} trackEyes label={fox === "wow" ? "The fox, looking impressed" : "The fox, smiling"} />
        </div>
      </div>
    </section>
  );
}
