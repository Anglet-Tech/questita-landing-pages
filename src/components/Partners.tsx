"use client";

import { useEffect, useRef } from "react";
import { gsap, useIdleGSAP, MQ, prefersReducedMotion } from "@/lib/gsap";
import { openContact } from "@/lib/store";
import PixelFox from "./PixelFox";
import PixelSeam from "./PixelSeam";
import { Arrow, Magnetic, Roll } from "./ui";

/**
 * Partnerships, as a big merlot ticket. It flips up on enter; the stub leans
 * on hover like it is about to tear, and tears off (then grows back) on click.
 */
export default function Partners() {
  const section = useRef<HTMLElement>(null);
  const ticket = useRef<HTMLDivElement>(null);
  const stub = useRef<HTMLButtonElement>(null);
  const tearing = useRef(false);

  useIdleGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        gsap.from(ticket.current, {
          rotateX: 70,
          y: 60,
          autoAlpha: 0,
          transformOrigin: "50% 100%",
          duration: 1.3,
          ease: "expo.out",
          scrollTrigger: { trigger: ticket.current, start: "top 82%", once: true },
        });
      });
      return () => mm.revert();
    },
    { scope: section },
  );

  // Kill any running tear on unmount.
  useEffect(() => {
    const el = stub.current;
    return () => {
      if (el) gsap.killTweensOf(el);
    };
  }, []);

  const tear = () => {
    const el = stub.current;
    if (!el || tearing.current) return;
    tearing.current = true;
    const desktop = window.matchMedia("(min-width: 1024px)").matches;
    const done = () => {
      tearing.current = false;
    };
    if (prefersReducedMotion()) {
      gsap
        .timeline({ onComplete: done })
        .to(el, { autoAlpha: 0, duration: 0.01 })
        .to(el, { autoAlpha: 1, duration: 0.01 }, 2);
      return;
    }
    gsap
      .timeline({ onComplete: done })
      .set(el, { transformOrigin: "0% 0%" })
      .to(el, { rotation: 4, duration: 0.08, ease: "steps(2)" })
      .to(el, {
        rotation: desktop ? 38 : 22,
        x: desktop ? 90 : 40,
        y: () => window.innerHeight * 0.9,
        duration: 0.95,
        ease: "power2.in",
      })
      .set(el, { autoAlpha: 0 })
      .set(el, { rotation: 0, x: 0, y: 0 }, "+=1.05")
      .to(el, { autoAlpha: 1, duration: 0.3, ease: "steps(3)" });
  };

  return (
    <section id="contact" ref={section} data-nav="light" aria-labelledby="contact-title" className="relative z-[7] bg-coconut py-14 lg:py-28">
      <PixelSeam from="yellow" to="coconut" />
      <div className="mx-auto max-w-[1440px] px-4 sm:px-8 lg:px-12" style={{ perspective: "1400px" }}>
        <div ref={ticket} className="ticket relative flex flex-col lg:flex-row" style={{ filter: "drop-shadow(10px 14px 18px rgba(104,27,43,.18))" }}>
          <div className="px-corners on-dark relative flex-1 bg-merlot p-7 text-coconut sm:p-10 lg:p-14" style={{ "--step": "8px" } as React.CSSProperties}>
            <h2 id="contact-title" className="max-w-[14ch] text-[clamp(2.4rem,5vw,4.6rem)] font-extrabold leading-[1.02] tracking-[-0.035em]">
              Want to be part of the plan?
            </h2>
            <p className="mt-6 max-w-[34rem] text-[1.1875rem] font-medium leading-relaxed text-coconut-78">
              If you run a place, brand or product that belongs in a Cairo plan, we’d love to talk.
            </p>
            <div className="mt-10">
              <Magnetic>
                <button type="button" onClick={openContact} className="btn btn-yellow roll-host">
                  <Roll>Get in touch</Roll>
                  <Arrow />
                </button>
              </Magnetic>
            </div>
          </div>

          {/* Perforation */}
          <div className="perforation relative z-10 bg-merlot" aria-hidden="true">
            <div className="perf-holes" />
          </div>

          <button
            ref={stub}
            type="button"
            onClick={tear}
            aria-label="Tear off your spot"
            className="stub relative text-left lg:w-[300px]"
          >
            <span className="stub-inner px-corners on-dark flex h-full flex-row items-center justify-between gap-6 bg-merlot p-7 text-coconut sm:p-8 lg:flex-col lg:items-start lg:gap-8 lg:p-10" style={{ "--step": "8px" } as React.CSSProperties}>
              <span className="w-[82px]">
                <PixelFox frame="wink" />
              </span>
              <span className="font-px t-px1 flex flex-col gap-3 leading-[1.6]">
                <span className="t-px2 text-yellow">Your spot</span>
                <span className="text-coconut-78">Admits the whole group</span>
              </span>
            </span>
          </button>
        </div>
      </div>
    </section>
  );
}
