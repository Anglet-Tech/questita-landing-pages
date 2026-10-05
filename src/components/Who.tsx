"use client";

import { Fragment, useRef } from "react";
import { gsap, useGSAP, MQ } from "@/lib/gsap";
import { asset } from "@/lib/asset";
import PixelSeam from "./PixelSeam";

const STRIPS = [
  { text: "New to the area", cls: "bg-merlot text-coconut" },
  { text: "New to a group", cls: "bg-coconut text-merlot" },
  { text: "Tired of cancelling on plans", cls: "bg-blue text-merlot" },
];
const LAST = "Just plans, with people.";

export default function Who() {
  const section = useRef<HTMLElement>(null);
  const strips = useRef<HTMLUListElement>(null);
  const nots = useRef<HTMLDivElement>(null);
  const typed = useRef<HTMLParagraphElement>(null);
  const cursor = useRef<HTMLSpanElement>(null);
  const icon = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        // Strips slide in from alternating sides, scrubbed.
        gsap.utils.toArray<HTMLElement>("[data-strip]", strips.current).forEach((el, i) => {
          gsap.fromTo(
            el,
            { xPercent: i % 2 ? 100 : -100 },
            {
              xPercent: 0,
              ease: "none",
              scrollTrigger: { trigger: strips.current, start: `top ${92 - i * 6}%`, end: `top ${50 - i * 6}%`, scrub: 0.6 },
            },
          );
        });

        // Strike-throughs draw, scrubbed.
        // Word by word, so the bar follows the text when a line wraps.
        gsap.utils.toArray<HTMLElement>("[data-strike-line]", nots.current).forEach((line) => {
          gsap.fromTo(
            line.querySelectorAll(".strike"),
            { "--strike": 0 },
            {
              "--strike": 1,
              ease: "none",
              stagger: 1,
              duration: 1,
              scrollTrigger: { trigger: line, start: "top 82%", end: "top 52%", scrub: 0.5 },
            },
          );
        });

        // The last line types on, then the app icon hops twice.
        const chars = typed.current!.querySelectorAll("[data-char]");
        gsap.set(chars, { autoAlpha: 0 });
        gsap
          .timeline({ scrollTrigger: { trigger: typed.current, start: "top 78%", once: true } })
          .to(chars, { autoAlpha: 1, duration: 0.01, stagger: 0.05, ease: "none" })
          .to(icon.current, { y: -18, duration: 0.12, ease: "steps(2)" }, "+=0.15")
          .to(icon.current, { y: 0, duration: 0.12, ease: "steps(2)" })
          .to(icon.current, { y: -10, duration: 0.1, ease: "steps(2)" })
          .to(icon.current, { y: 0, duration: 0.1, ease: "steps(2)" });
      });
      return () => mm.revert();
    },
    { scope: section },
  );

  return (
    <section
      id="who"
      ref={section}
      data-nav="yellow"
      aria-labelledby="who-title"
      className="relative z-[6] overflow-x-clip bg-yellow pb-28 pt-[calc(var(--nav-h)+56px)] text-merlot"
    >
      <PixelSeam from="coconut" to="yellow" />
      <div className="mx-auto max-w-[1440px] px-4 sm:px-8 lg:px-12">
        <h2 id="who-title" className="text-[clamp(2.6rem,6vw,5.6rem)] font-extrabold leading-[1] tracking-[-0.035em]">
          <span className="block">Built for Cairo,</span>
          <span className="block">for 18 to 35.</span>
        </h2>

        <ul ref={strips} className="mt-14 flex flex-col gap-4">
          {STRIPS.map((s) => (
            <li key={s.text} data-strip className={`strip px-corners ${s.cls}`} style={{ "--step": "4px" } as React.CSSProperties}>
              <span className="strip-text flex items-center gap-4 px-6 py-7 text-[clamp(1.5rem,3.2vw,2.6rem)] font-extrabold leading-[1.1] tracking-[-0.03em] sm:px-10">
                {s.text}
                <span className="arrow strip-arrow" aria-hidden="true" />
              </span>
            </li>
          ))}
        </ul>

        <div ref={nots} className="mt-20 flex flex-col gap-3">
          {["Not a dating app.", "Not another feed to scroll."].map((line) => (
            <p key={line} data-strike-line className="text-[clamp(2rem,4.6vw,4rem)] font-extrabold leading-[1.15] tracking-[-0.035em]">
              {line.split(" ").map((word, i, arr) => (
                <Fragment key={i}>
                  <span className={`strike${i < arr.length - 1 ? " strike-gap" : ""}`}>{word}</span>
                  {i < arr.length - 1 && <span className="text-[0px]"> </span>}
                </Fragment>
              ))}
            </p>
          ))}
          <p ref={typed} className="font-px t-px2 mt-6 lg:t-px3" aria-label={LAST}>
            <span aria-hidden="true">
              {LAST.split("").map((c, i) => (
                <span key={i} data-char="">
                  {c}
                </span>
              ))}
            </span>
            <span ref={cursor} className="block-cursor" aria-hidden="true" />
          </p>
        </div>

        <div className="mt-20 flex flex-col gap-8 sm:flex-row sm:items-center sm:gap-12">
          <div ref={icon} className="w-[128px] shrink-0 sm:w-[160px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={asset("/fox/Questita_app_icon.svg")} alt="The Questita app icon" width={160} height={160} className="h-auto w-full" loading="lazy" />
          </div>
          <p className="max-w-[22ch] text-[clamp(1.6rem,3vw,2.6rem)] font-extrabold leading-[1.1] tracking-[-0.03em]">
            For the people who make the big city feel smaller.
          </p>
        </div>
      </div>
    </section>
  );
}
