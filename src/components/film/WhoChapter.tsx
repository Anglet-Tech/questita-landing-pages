"use client";

import { useRef, useState } from "react";
import { gsap, MQ, useIdleGSAP } from "@/lib/gsap";
import type { FoxFrame } from "@/lib/fox";
import PixelFox from "@/components/PixelFox";
import Wipe from "./Wipe";
import { WHO } from "./content";
import { watchChapter } from "./filmKit";

const BANDS = [
  { cls: "bg-merlot text-coconut", dir: -1 },
  { cls: "bg-coconut text-merlot", dir: 1 },
  { cls: "bg-blue text-merlot", dir: -1 },
];
const REPEAT = 4;

/**
 * Chapter 4. "Built for Cairo." The three phrases cross the frame as giant
 * type bands moving in alternating directions at scroll speed (scrubbed with
 * no smoothing, the page's only marquee-like device). Then the strike-throughs
 * draw and "Just plans, with people." types on in the pixel font.
 */
export default function WhoChapter() {
  const section = useRef<HTMLElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const bands = useRef<HTMLDivElement>(null);
  const nots = useRef<HTMLDivElement>(null);
  const typed = useRef<HTMLParagraphElement>(null);
  const [fox, setFox] = useState<FoxFrame>("happy");

  useIdleGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        // Headline words drop in, stepped.
        gsap.from(heading.current!.querySelectorAll("[data-hw]"), {
          yPercent: 110,
          duration: 0.8,
          ease: "expo.out",
          stagger: 0.08,
          scrollTrigger: { trigger: heading.current, start: "top 82%", once: true },
        });

        // Bands: x tied 1:1-ish to scroll, alternating directions.
        gsap.utils.toArray<HTMLElement>("[data-band]", bands.current).forEach((el, i) => {
          const dir = BANDS[i].dir;
          gsap.fromTo(
            el,
            { xPercent: dir < 0 ? 0 : -25 },
            {
              xPercent: dir < 0 ? -25 : 0,
              ease: "none",
              scrollTrigger: { trigger: bands.current, start: "top bottom", end: "bottom top", scrub: true },
            },
          );
        });

        // Strike-throughs draw, word by word so wrapped lines follow.
        gsap.utils.toArray<HTMLElement>("[data-strike-line]", nots.current).forEach((line) => {
          gsap.fromTo(
            line.querySelectorAll(".strike"),
            { "--strike": 0 },
            {
              "--strike": 1,
              ease: "steps(6)",
              stagger: 1,
              duration: 1,
              scrollTrigger: { trigger: line, start: "top 80%", end: "top 50%", scrub: true },
            },
          );
        });

        // The last line types on, then the fox winks.
        const chars = typed.current!.querySelectorAll("[data-char]");
        gsap.set(chars, { autoAlpha: 0 });
        gsap
          .timeline({ scrollTrigger: { trigger: typed.current, start: "top 82%", once: true } })
          .to(chars, { autoAlpha: 1, duration: 0.01, stagger: 0.045, ease: "none" })
          .call(() => setFox("wink"), [], "+=0.15")
          .call(() => setFox("happy"), [], "+=0.7");
      });
      watchChapter(section.current!, 3, "light");
      return () => mm.revert();
    },
    { scope: section },
  );

  return (
    <section id="who" ref={section} aria-labelledby="who-title" className="film-chapter relative z-[4] bg-yellow text-merlot">
      <Wipe color="yellow" flip />
      <div className="mx-auto max-w-[1600px] px-4 pb-10 pt-[calc(72px+8vh)] sm:px-8 lg:px-12">
        <h2 id="who-title" ref={heading} className="who-h2 font-extrabold">
          {WHO.title.split(" ").map((w, i, a) => (
            <span key={i}>
              <span className="split-mask inline-block overflow-hidden align-bottom">
                <span data-hw className="inline-block">
                  {w}
                </span>
              </span>
              {i < a.length - 1 ? " " : ""}
            </span>
          ))}
        </h2>
      </div>

      <ul className="sr-only">
        {WHO.phrases.map((p) => (
          <li key={p}>{p}</li>
        ))}
      </ul>
      <div ref={bands} className="who-bands" aria-hidden="true">
        {WHO.phrases.map((p, i) => (
          <div key={p} className={`who-band ${BANDS[i].cls}`}>
            <div data-band className="who-band-track">
              {Array.from({ length: REPEAT }, (_, k) => (
                <span key={k} className="who-band-item">
                  {p}
                  <span className="who-band-sq" />
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mx-auto max-w-[1600px] px-4 pb-[18vh] pt-16 sm:px-8 lg:px-12 lg:pt-24">
        <p className="max-w-[34rem] text-[1.25rem] font-semibold leading-snug text-body sm:text-[1.5rem]">{WHO.line}</p>
        <div ref={nots} className="who-nots mt-10 flex flex-col gap-2 font-extrabold lg:mt-14">
          {WHO.nots.map((line) => (
            <p key={line} data-strike-line>
              {line.split(" ").map((w, i, a) => (
                <span key={i} className={`strike ${i < a.length - 1 ? "strike-gap" : ""}`}>
                  {w}
                </span>
              ))}
            </p>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap items-end gap-6 lg:mt-12">
          <p ref={typed} className="who-last font-px">
            <span className="sr-only">{WHO.last}</span>
            <span aria-hidden="true">
              {WHO.last.split("").map((c, i) => (
                <span key={i} data-char>
                  {c}
                </span>
              ))}
            </span>
          </p>
          <div className="w-[96px] sm:w-[123px]">
            <PixelFox frame={fox} />
          </div>
        </div>
      </div>
    </section>
  );
}
