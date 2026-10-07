"use client";

import { useRef } from "react";
import { gsap, MQ, useIdleGSAP } from "@/lib/gsap";
import { openContact } from "@/lib/store";
import PixelFox from "../PixelFox";
import { Roll } from "../ui";
import Poster from "./Poster";
import { anchorOf, flowTrigger } from "./flow";

const LETTERS = "QUESTITA".split("");
const bounce = gsap.parseEase("bounce.out");
const steppedBounce = (t: number) => Math.round(bounce(t) * 8) / 8;

/** The last poster: merlot, the pixel QUESTITA, and the fox peeking over its top edge. */
export default function WallFooter() {
  const root = useRef<HTMLDivElement>(null);
  const peek = useRef<HTMLDivElement>(null);

  useIdleGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add(MQ.motion, () => {
      const word = root.current!.querySelector<HTMLElement>("[data-word]")!;
      gsap.from(word.querySelectorAll("[data-letter]"), {
        yPercent: -60,
        autoAlpha: 0,
        duration: 0.9,
        ease: steppedBounce,
        stagger: 0.08,
        scrollTrigger: { ...flowTrigger(word, "92%"), toggleActions: "play none none reverse" },
      });
      gsap.fromTo(
        peek.current,
        { yPercent: 100 },
        { yPercent: 0, ease: "steps(6)", scrollTrigger: { trigger: anchorOf(root.current!), start: "top 80%", end: "max", scrub: 0.5 } },
      );
    });
    return () => mm.revert();
  });

  const link = "roll-host inline-flex min-h-[44px] items-center text-[1rem] font-semibold text-coconut";

  return (
    <Poster
      as="footer"
      id="end"
      paper="var(--merlot)"
      stick={false}
      fill={false}
      outside={
        <div className="wl-peek" aria-hidden="true">
          <div ref={peek}>
            <PixelFox frame="happy" trackEyes />
          </div>
        </div>
      }
    >
      <div ref={root} className="mx-auto max-w-[1440px] px-4 pt-16 sm:px-8 lg:px-12 lg:pt-24">
        <h2 className="sr-only">Questita</h2>
        <div data-word="" aria-hidden="true" className="giant font-px flex justify-between leading-[0.9] text-coconut">
          {LETTERS.map((l, i) => (
            <span key={i} data-letter="" className="inline-block">
              {l}
            </span>
          ))}
        </div>
        <div className="mt-8 grid gap-10 border-t-4 border-coconut/15 pt-10 lg:grid-cols-12 lg:items-start">
          <p className="max-w-[20ch] text-[1.5rem] font-extrabold leading-[1.15] tracking-[-0.02em] text-coconut lg:col-span-5">
            For the people who make the big city feel smaller.
          </p>
          <nav aria-label="Footer" className="lg:col-span-3">
            <ul className="flex flex-col">
              <li>
                <a href="#what" className={link}>
                  <Roll>What is Questita</Roll>
                </a>
              </li>
              <li>
                <a href="#how" className={link}>
                  <Roll>How it works</Roll>
                </a>
              </li>
              <li>
                <button type="button" onClick={openContact} className={`${link} cursor-pointer text-yellow`}>
                  <Roll>Get in touch</Roll>
                </button>
              </li>
            </ul>
          </nav>
          <p className="font-px t-px1 leading-[1.8] tracking-[0.2em] text-coconut-78 lg:col-span-4 lg:text-right">Cairo first. Alexandria next.</p>
        </div>
        <div className="wl-foot-legal mt-10 flex flex-col gap-3 pb-8 text-[0.875rem] font-medium text-coconut-78 sm:flex-row sm:justify-between">
          <p>Made in Cairo. Made by Anglet.</p>
          <p>© 2026 Questita. All rights reserved.</p>
        </div>
      </div>
    </Poster>
  );
}
