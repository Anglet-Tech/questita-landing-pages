"use client";

import { useRef, useState } from "react";
import type { FoxFrame } from "@/lib/fox";
import { gsap, MQ, ScrollTrigger, useIdleGSAP } from "@/lib/gsap";
import PixelFox from "../PixelFox";
import { flowTrigger } from "./flow";

const LABELS = [
  { t: "New to the area", cls: "bg-merlot text-coconut", rot: -3 },
  { t: "New to a group", cls: "bg-coconut text-merlot", rot: 2.5 },
  { t: "Tired of cancelling on plans", cls: "bg-blue text-merlot", rot: -1.5 },
];

const PUNCH = "Just plans, with people.";

/** Yellow poster: the three sticker labels get slapped on, then the strike-throughs. */
export default function WallWho() {
  const root = useRef<HTMLDivElement>(null);
  const [fox, setFox] = useState<FoxFrame>("happy");

  useIdleGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        const q = gsap.utils.selector(root);
        gsap.set(q("[data-label]"), { autoAlpha: 0 });
        gsap.set(q("[data-lede]"), { autoAlpha: 0 });
        gsap.set(q(".strike"), { "--strike": 0 });
        gsap.set(q("[data-punch]"), { clipPath: "inset(0 100% 0 0)" });
        gsap.set(q("[data-fox]"), { autoAlpha: 0, y: 24 });

        const tl = gsap.timeline({
          paused: true,
          onStart: () => setFox("wow"),
          onComplete: () => setFox("happy"),
          onReverseComplete: () => setFox("happy"),
        });
        q("[data-label]").forEach((el, i) => {
          tl.fromTo(el, { autoAlpha: 0, scale: 1.3 }, { autoAlpha: 1, scale: 1, duration: 0.28, ease: "steps(4)" }, i * 0.32);
        });
        tl.to(q("[data-lede]"), { autoAlpha: 1, duration: 0.24, ease: "steps(3)" }, ">-0.05");
        q(".strike").forEach((el, i) => {
          tl.to(el, { "--strike": 1, duration: 0.42, ease: "steps(8)" }, i === 0 ? ">0.15" : ">0.05");
        });
        tl.to(q("[data-fox]"), { autoAlpha: 1, y: 0, duration: 0.3, ease: "steps(3)" }, ">0.1");
        tl.to(q("[data-punch]"), { clipPath: "inset(0 0% 0 0)", duration: 0.9, ease: `steps(${PUNCH.length})` }, "<");

        const st = ScrollTrigger.create({
          ...flowTrigger(q("[data-labels]")[0] as HTMLElement, "82%"),
          onEnter: () => tl.play(),
          onLeaveBack: () => tl.reverse(),
        });
        return () => {
          st.kill();
          tl.kill();
        };
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <div ref={root} className="mx-auto flex max-w-[1100px] flex-col items-center px-4 pb-20 pt-[calc(var(--wl-nav)+56px)] text-center sm:px-8 lg:pb-24 lg:pt-[calc(var(--wl-nav)+72px)]">
      <h2 id="wl-who-t" className="text-[clamp(3rem,8vw,7rem)] font-extrabold leading-[0.95] tracking-[-0.045em] text-merlot">
        Built for Cairo.
      </h2>
      <ul data-labels="" className="mt-10 flex flex-wrap items-center justify-center gap-x-4 gap-y-5 lg:mt-12">
        {LABELS.map((l) => (
          <li
            key={l.t}
            data-label=""
            className={`wl-label px-corners text-[1.2rem] sm:text-[1.6rem] lg:text-[2rem] ${l.cls}`}
            style={{ "--rot": `${l.rot}deg` } as React.CSSProperties}
          >
            {l.t}
          </li>
        ))}
      </ul>
      <p data-lede="" className="mt-10 max-w-[30rem] text-[1.125rem] font-semibold leading-relaxed text-merlot lg:text-[1.25rem]">
        Questita is for the people who make the big city feel smaller.
      </p>
      <div className="relative mt-8 flex flex-col items-center gap-2 text-[clamp(1.5rem,3.2vw,2.4rem)] font-extrabold tracking-[-0.03em] text-merlot">
        <p>
          <span className="strike">Not a dating app.</span>
        </p>
        <p>
          <span className="strike">Not another feed to scroll.</span>
        </p>
        <div className="mt-5 flex items-end justify-center gap-4">
          <p data-punch="" className="font-px t-px2 sm:t-px3 leading-[1.2] text-merlot">
            {PUNCH}
          </p>
          <div data-fox="" className="w-[64px] shrink-0 sm:w-[82px]">
            <PixelFox frame={fox} trackEyes />
          </div>
        </div>
      </div>
    </div>
  );
}
