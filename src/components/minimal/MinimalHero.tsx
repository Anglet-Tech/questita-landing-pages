"use client";

import { useEffect, useRef, useState } from "react";
import { LAUNCH_ISO } from "@/config";
import { useCountdown } from "@/lib/countdown";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import type { FoxFrame } from "@/lib/fox";
import BigCountdown from "../BigCountdown";
import CalendarButton from "../CalendarButton";
import PixelFox from "../PixelFox";
import { Roll } from "../ui";
import { minimalReveal } from "./reveal";

/** The hero is the countdown, with a small fox perched on the last digit. */
export default function MinimalHero() {
  const section = useRef<HTMLElement>(null);
  const hl = useRef<HTMLSpanElement>(null);
  const [frame, setFrame] = useState<FoxFrame>("happy");
  const c = useCountdown(LAUNCH_ISO);

  // A blink (wink frame, 120ms) every 6 to 9 seconds, at random.
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    let u: ReturnType<typeof setTimeout>;
    const loop = () => {
      t = setTimeout(() => {
        setFrame("wink");
        u = setTimeout(() => {
          setFrame("happy");
          loop();
        }, 120);
      }, 6000 + Math.random() * 3000);
    };
    loop();
    return () => {
      clearTimeout(t);
      clearTimeout(u);
    };
  }, []);

  useGSAP(
    () => {
      const off = minimalReveal(section.current!);
      if (!prefersReducedMotion()) {
        gsap.fromTo(hl.current, { "--hl": 0 }, { "--hl": 1, duration: 0.55, ease: "steps(7)", delay: 0.45 });
      }
      return off;
    },
    { scope: section },
  );

  return (
    <section id="top" ref={section} aria-labelledby="min-title" className="mx-auto max-w-[1100px] px-4 pb-28 pt-[calc(64px+10vh)] sm:px-8">
      <h1 id="min-title" data-mh className="text-[clamp(2.2rem,4.6vw,3.2rem)] font-extrabold leading-[1.05] tracking-[-0.035em] text-merlot">
        Find the thing. Find your <span ref={hl} className="hl">people</span>.
      </h1>

      <BigCountdown
        hop
        className="min-counter mt-20 text-merlot"
        slot={
          c.launched ? null : (
            <div className="absolute bottom-[calc(100%-var(--bc-dp)*0.6)] right-0 w-[82px] sm:w-[123px]">
              <PixelFox frame={frame} trackEyes label="The fox, sitting on the countdown" />
            </div>
          )
        }
      />

      <p data-mb className="mt-14 max-w-[30rem] text-[1.1875rem] font-medium leading-relaxed text-body">
        A social quest app for Cairo. Someone posts a plan, you join in, the big city feels smaller.
      </p>
      <div data-mb className="mt-8 flex flex-wrap items-center gap-6">
        {!c.launched && <CalendarButton className="btn-yellow" />}
        <a href="#how" className="roll-host border-b-2 border-merlot pb-0.5 text-[1rem] font-bold text-merlot">
          <Roll>How it works</Roll>
        </a>
      </div>
    </section>
  );
}

