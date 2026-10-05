"use client";

import { useRef } from "react";
import { gsap, useIdleGSAP, MQ } from "@/lib/gsap";
import { openContact } from "@/lib/store";
import PixelFox from "./PixelFox";
import PixelSeam from "./PixelSeam";
import { Roll } from "./ui";

const LETTERS = "QUESTITA".split("");

// bounce.out, quantised to 8 levels: a stepped bounce.
const bounce = gsap.parseEase("bounce.out");
const steppedBounce = (t: number) => Math.round(bounce(t) * 8) / 8;

export default function Footer() {
  const footer = useRef<HTMLElement>(null);
  const word = useRef<HTMLDivElement>(null);
  const peek = useRef<HTMLDivElement>(null);

  useIdleGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        gsap.from(word.current!.querySelectorAll("[data-letter]"), {
          yPercent: -60,
          autoAlpha: 0,
          duration: 0.9,
          ease: steppedBounce,
          stagger: 0.08,
          scrollTrigger: { trigger: word.current, start: "top 88%", once: true },
        });
        gsap.fromTo(
          peek.current,
          { yPercent: 100 },
          {
            yPercent: 0,
            ease: "none",
            scrollTrigger: { trigger: footer.current, start: "top bottom", end: "bottom bottom", scrub: 0.6 },
          },
        );
      });
      mm.add(MQ.reduce, () => {
        gsap.set(peek.current, { yPercent: 0 });
      });
      return () => mm.revert();
    },
    { scope: footer },
  );

  const linkCls = "roll-host text-[1rem] font-semibold text-coconut";

  return (
    <footer ref={footer} data-nav="dark" className="on-dark relative z-[8] bg-merlot text-coconut">
      <PixelSeam from="coconut" to="merlot" />
      <div className="mx-auto max-w-[1440px] px-4 pt-[140px] sm:px-8 sm:pt-[200px] lg:px-12 lg:pt-[250px]">
        <h2 className="sr-only">Questita</h2>
        <div className="relative">
          <div ref={word} aria-hidden="true" className="giant font-px relative flex justify-between leading-[0.9] text-coconut">
            {/*
              The fox peeks over the letters: its clip box ends 14% of its own
              height below the cap line (0.04em under the line box top), so the
              letters only cover the chin while the eyes and nose stay clear.
            */}
            <span
              className="foot-peek pointer-events-none absolute right-[7%] z-0 overflow-hidden"
              style={{ aspectRatio: "41 / 35" }}
            >
              <span ref={peek} className="pointer-events-auto block">
                <PixelFox frame="happy" trackEyes />
              </span>
            </span>
            {LETTERS.map((l, i) => (
              <span key={i} data-letter className="relative z-[1] inline-block">
                {l}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-8 grid gap-10 border-t-4 border-coconut/15 pt-10 lg:grid-cols-12 lg:items-start">
          <p className="max-w-[20ch] text-[1.5rem] font-extrabold leading-[1.15] tracking-[-0.02em] lg:col-span-4">
            For the people who make the big city feel smaller.
          </p>
          <nav aria-label="Footer" className="lg:col-span-3">
            <ul className="flex flex-col gap-3">
              <li>
                <a href="#board" className={linkCls}>
                  <Roll>The board</Roll>
                </a>
              </li>
              <li>
                <a href="#how" className={linkCls}>
                  <Roll>How it works</Roll>
                </a>
              </li>
              <li>
                <a href="#safety" className={linkCls}>
                  <Roll>Safety</Roll>
                </a>
              </li>
              <li>
                <button type="button" onClick={openContact} className={`${linkCls} cursor-pointer`}>
                  <Roll>Get in touch</Roll>
                </button>
              </li>
            </ul>
          </nav>
          <p className="cairo-line font-px t-px1 leading-[1.8] text-coconut-78 lg:col-span-5 lg:text-right">
            <span className="block lg:inline">Cairo first.</span> <span className="block lg:inline">Alexandria next.</span>
          </p>
        </div>

        <div className="mt-10 flex flex-col gap-3 pb-8 text-[0.875rem] font-medium text-coconut-78 sm:flex-row sm:justify-between">
          <p>Made in Cairo. Made by Anglet.</p>
          <p>© 2026 Questita. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
