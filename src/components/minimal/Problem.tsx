"use client";

import { Fragment, useRef } from "react";
import { gsap, useGSAP, MQ } from "@/lib/gsap";
import { minimalReveal } from "./reveal";

const QUOTE = "“we should do something.”";
const FIX = "Questita fixes that.";

/** The problem, as a joke: the quote gets struck out, the fix types on. */
export default function Problem() {
  const section = useRef<HTMLElement>(null);
  const line = useRef<HTMLParagraphElement>(null);
  const fix = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const off = minimalReveal(section.current!);
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        const words = line.current!.querySelectorAll(".strike");
        const chars = fix.current!.querySelectorAll("[data-char]");
        gsap.set(words, { "--strike": 0 });
        gsap.set(chars, { autoAlpha: 0 });
        gsap.set(fix.current, { "--hl": 0 });
        gsap
          .timeline({ scrollTrigger: { trigger: line.current, start: "top 70%", once: true } })
          .to(words, { "--strike": 1, duration: 0.22, ease: "steps(5)", stagger: 0.16 }, 0.3)
          .to(fix.current, { "--hl": 1, duration: 0.3, ease: "steps(6)" }, "+=0.2")
          .to(chars, { autoAlpha: 1, duration: 0.01, stagger: 0.045, ease: "none" }, "<");
      });
      return () => {
        mm.revert();
        off();
      };
    },
    { scope: section },
  );

  const quoteWords = QUOTE.split(" ");
  return (
    <section ref={section} aria-label="The problem" className="mx-auto max-w-[1100px] px-4 py-32 sm:px-8">
      <p ref={line} className="max-w-[22ch] text-[clamp(2.2rem,5vw,4rem)] font-extrabold leading-[1.1] tracking-[-0.035em] text-merlot">
        Cairo is big, and most good plans die at{" "}
        {quoteWords.map((w, i) => (
          <Fragment key={i}>
            <span className={`strike${i < quoteWords.length - 1 ? " strike-gap" : ""}`}>{w}</span>
            {i < quoteWords.length - 1 && <span className="text-[0px]"> </span>}
          </Fragment>
        ))}{" "}
        <span ref={fix} className="hl max-[399px]:inline-block! max-[399px]:whitespace-normal!" aria-label={FIX}>
          <span aria-hidden="true">
            {FIX.split("").map((ch, i) => (
              <span key={i} data-char="">
                {ch}
              </span>
            ))}
          </span>
        </span>
      </p>
    </section>
  );
}
