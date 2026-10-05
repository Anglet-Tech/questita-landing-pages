"use client";

import { useRef } from "react";
import { gsap, useGSAP, MQ } from "@/lib/gsap";
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
  const word = useRef<HTMLParagraphElement>(null);
  const peek = useRef<HTMLDivElement>(null);

  useGSAP(
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
            yPercent: 30,
            ease: "none",
            scrollTrigger: { trigger: footer.current, start: "top bottom", end: "bottom bottom", scrub: 0.6 },
          },
        );
      });
      mm.add(MQ.reduce, () => {
        gsap.set(peek.current, { yPercent: 30 });
      });
      return () => mm.revert();
    },
    { scope: footer },
  );

  const linkCls = "roll-host text-[1rem] font-semibold text-coconut";

  return (
    <footer ref={footer} data-nav="dark" className="on-dark relative z-[8] bg-merlot text-coconut">
      <PixelSeam from="coconut" to="merlot" />
      <div className="mx-auto max-w-[1440px] px-4 pt-[170px] sm:px-8 sm:pt-[220px] lg:px-12 lg:pt-[270px]">
        <h2 className="sr-only">Questita</h2>
        <div className="relative">
          <div className="pointer-events-none absolute bottom-[calc(100%-0.05em)] right-[8%] w-[123px] overflow-hidden sm:w-[205px] lg:w-[287px]" style={{ aspectRatio: "41 / 35" }}>
            <div ref={peek} className="pointer-events-auto">
              <PixelFox frame="happy" trackEyes />
            </div>
          </div>
          <p ref={word} aria-hidden="true" className="giant font-px relative flex justify-between leading-[0.9] text-coconut">
            {LETTERS.map((l, i) => (
              <span key={i} data-letter className="inline-block">
                {l}
              </span>
            ))}
          </p>
        </div>

        <div className="mt-12 grid gap-10 border-t-4 border-coconut/15 pt-10 lg:grid-cols-12 lg:items-start">
          <p className="max-w-[20ch] text-[1.5rem] font-extrabold leading-[1.15] tracking-[-0.02em] lg:col-span-5">
            For the people who make the big city feel smaller.
          </p>
          <nav aria-label="Footer" className="lg:col-span-4">
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
          <p className="font-px t-px1 leading-[1.8] text-coconut-78 lg:col-span-3 lg:text-right">Cairo first. Alexandria next.</p>
        </div>

        <div className="mt-14 flex flex-col gap-3 pb-10 text-[0.875rem] font-medium text-coconut-78 sm:flex-row sm:justify-between">
          <p>Made in Cairo. Made by Anglet.</p>
          <p>© 2026 Questita. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
