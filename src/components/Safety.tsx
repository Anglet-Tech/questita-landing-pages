"use client";

import { useRef, useState } from "react";
import { gsap, ScrollTrigger, useGSAP, MQ } from "@/lib/gsap";
import { asset } from "@/lib/asset";
import { stairClip } from "@/lib/stairs";
import PixelFox from "./PixelFox";
import PixelSeam from "./PixelSeam";

// A 12 x 12 pixel map pin, built row by row: [y, x0, x1].
const PIN_ROWS: [number, number, number][] = [
  [0, 3, 8], [1, 2, 9], [2, 1, 10], [3, 0, 11], [4, 0, 11], [5, 0, 11], [6, 0, 11],
  [7, 1, 10], [8, 2, 9], [9, 3, 8], [10, 4, 7], [11, 5, 6],
];
const PIN_PATH = PIN_ROWS.map(([y, x0, x1]) => `M${x0} ${y}h${x1 - x0 + 1}v1h-${x1 - x0 + 1}z`).join("");

function Cell({
  className = "",
  children,
  bg,
}: {
  className?: string;
  children: React.ReactNode;
  bg: string;
}) {
  return (
    <div data-cell className={`relative ${className}`}>
      <div className={`px-corners relative h-full overflow-hidden ${bg}`} style={{ "--step": "6px" } as React.CSSProperties}>
        {children}
      </div>
    </div>
  );
}

/** Bento of exactly five cells, each with a small pixel toy. */
export default function Safety() {
  const section = useRef<HTMLElement>(null);
  const idCard = useRef<HTMLDivElement>(null);
  const stamp = useRef<HTMLSpanElement>(null);
  const pin = useRef<SVGSVGElement>(null);
  const xp = useRef<HTMLSpanElement>(null);
  const stairs = useRef<HTMLDivElement>(null);
  const [pref, setPref] = useState(false);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        // Cells: stepped clip-path wipe from the bottom-left, staggered.
        const cells = gsap.utils.toArray<HTMLElement>("[data-cell]", section.current);
        cells.forEach((cell, i) => {
          const proxy = { p: 0 };
          cell.style.clipPath = stairClip(0);
          gsap.to(proxy, {
            p: 1,
            duration: 0.6,
            delay: i * 0.08,
            ease: "power2.out",
            onUpdate: () => {
              cell.style.clipPath = stairClip(proxy.p, 8);
            },
            onComplete: () => {
              cell.style.clipPath = "";
            },
            scrollTrigger: { trigger: cells[0], start: "top 80%", once: true },
          });
        });

        // Verified stamp slams down, the card shakes for two frames.
        gsap.set(stamp.current, { autoAlpha: 0 });
        gsap
          .timeline({ scrollTrigger: { trigger: idCard.current, start: "top 70%", once: true }, delay: 0.5 })
          .fromTo(
            stamp.current,
            { autoAlpha: 0, scale: 1.6, rotation: -8 },
            { autoAlpha: 1, scale: 1, rotation: -8, duration: 0.22, ease: "steps(3)" },
          )
          .to(idCard.current, { x: -4, y: 2, duration: 0.05, ease: "steps(1)" })
          .to(idCard.current, { x: 4, y: -2, duration: 0.05, ease: "steps(1)" })
          .to(idCard.current, { x: 0, y: 0, duration: 0.05, ease: "steps(1)" });

        // Map pin drops and bounces in steps.
        gsap
          .timeline({ scrollTrigger: { trigger: pin.current, start: "top 85%", once: true }, delay: 0.4 })
          .from(pin.current, { y: -120, autoAlpha: 0, duration: 0.4, ease: "steps(6)" })
          .to(pin.current, { y: -24, duration: 0.15, ease: "steps(3)" })
          .to(pin.current, { y: 0, duration: 0.15, ease: "steps(3)" })
          .to(pin.current, { y: -8, duration: 0.1, ease: "steps(2)" })
          .to(pin.current, { y: 0, duration: 0.1, ease: "steps(2)" });

        // +XP counts to 120 while the staircase fills.
        const blocks = stairs.current!.children;
        gsap.set(blocks, { autoAlpha: 0.18 });
        const count = { v: 0 };
        xp.current!.textContent = "+0";
        gsap
          .timeline({ scrollTrigger: { trigger: xp.current, start: "top 85%", once: true } })
          .to(count, {
            v: 120,
            duration: 1.2,
            ease: "power1.out",
            onUpdate: () => {
              if (xp.current) xp.current.textContent = `+${Math.round(count.v)}`;
            },
          })
          .to(blocks, { autoAlpha: 1, duration: 0.01, stagger: 1.2 / blocks.length }, 0);
      });

      // The toggle flips on by itself when it comes into view (any motion setting).
      ScrollTrigger.create({
        trigger: section.current!.querySelector("[data-switch]"),
        start: "top 80%",
        once: true,
        onEnter: () => setPref(true),
      });

      return () => mm.revert();
    },
    { scope: section },
  );

  return (
    <section id="safety" ref={section} data-nav="light" aria-labelledby="safety-title" className="relative z-[5] bg-coconut pb-28 pt-[calc(var(--nav-h)+56px)] text-merlot">
      <PixelSeam from="night" to="coconut" />
      <div className="mx-auto max-w-[1440px] px-4 sm:px-8 lg:px-12">
        <h2 id="safety-title" className="max-w-[16ch] text-[clamp(2.4rem,5vw,4.6rem)] font-extrabold leading-[1.02] tracking-[-0.035em]">
          Real life, with a playful system on top.
        </h2>

        <div className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-12 lg:gap-5">
          {/* 1. Verified (big) */}
          <Cell bg="bg-merlot on-dark text-coconut" className="md:col-span-2 lg:col-span-7 lg:row-span-2">
            <div className="flex h-full flex-col gap-10 p-7 sm:p-10">
              <div>
                <h3 className="text-[clamp(1.8rem,3vw,2.6rem)] font-extrabold leading-[1.05] tracking-[-0.03em]">Everyone’s verified.</h3>
                <p className="mt-3 max-w-[30rem] text-[1.0625rem] font-medium leading-relaxed text-coconut-78">
                  ID and a live photo at sign-up, so the person you meet is the person on the profile.
                </p>
              </div>
              <div className="mt-auto flex justify-center pb-4">
                <div ref={idCard} className="relative w-full max-w-[380px]">
                  <div className="px-corners bg-coconut p-5 text-merlot" style={{ "--step": "6px" } as React.CSSProperties}>
                    <div className="flex items-center gap-5">
                      <div className="px-corners shrink-0 bg-blue p-2" style={{ "--step": "4px" } as React.CSSProperties}>
                        <div className="w-[82px]">
                          <PixelFox frame="happy" />
                        </div>
                      </div>
                      <dl className="font-px t-px1 grid gap-3 leading-none">
                        <div>
                          <dt className="text-body/70">Name</dt>
                          <dd className="mt-1.5">Nour A.</dd>
                        </div>
                        <div>
                          <dt className="text-body/70">Handle</dt>
                          <dd className="mt-1.5">@nourquests</dd>
                        </div>
                      </dl>
                    </div>
                    <div className="mt-5 flex gap-2" aria-hidden="true">
                      <span className="h-2 flex-1 bg-merlot/15" />
                      <span className="h-2 w-12 bg-merlot/15" />
                      <span className="h-2 w-6 bg-yellow" />
                    </div>
                  </div>
                  <span
                    ref={stamp}
                    className="font-px t-px2 absolute -right-3 -top-4 w-max whitespace-nowrap rotate-[-8deg] border-[3px] border-yellow bg-merlot px-3 py-1 text-yellow"
                  >
                    Verified
                  </span>
                </div>
              </div>
            </div>
          </Cell>

          {/* 2. Your call on who */}
          <Cell bg="bg-yellow text-merlot" className="lg:col-span-5">
            <div className="flex h-full flex-col gap-6 p-7 sm:p-8">
              <div>
                <h3 className="text-[1.75rem] font-extrabold leading-[1.1] tracking-[-0.03em]">Your call on who.</h3>
                <p className="mt-2 text-[1.0625rem] font-medium leading-relaxed text-body">Set a gender preference on any quest you post.</p>
              </div>
              <div className="mt-auto flex items-center gap-4">
                <button
                  data-switch
                  type="button"
                  role="switch"
                  aria-checked={pref}
                  aria-label="Gender preference"
                  onClick={() => setPref((v) => !v)}
                  className="px-switch"
                  data-on={pref || undefined}
                >
                  <span className="px-switch-knob" />
                </button>
                <span className="font-px t-px1" aria-hidden="true">
                  {pref ? "Preference on" : "Preference off"}
                </span>
              </div>
            </div>
          </Cell>

          {/* 3. Meetup point */}
          <Cell bg="bg-blue text-merlot" className="lg:col-span-5">
            <div className="flex h-full items-end justify-between gap-6 p-7 sm:p-8">
              <div>
                <h3 className="text-[1.75rem] font-extrabold leading-[1.1] tracking-[-0.03em]">Meetup point, when you’re ready.</h3>
                <p className="mt-2 text-[1.0625rem] font-medium leading-relaxed text-body">You decide when the exact spot is shared.</p>
              </div>
              <div className="relative shrink-0 pt-6" aria-hidden="true">
                <svg ref={pin} viewBox="0 0 12 12" width="60" height="60" shapeRendering="crispEdges" className="relative z-10 mx-auto">
                  <path d={PIN_PATH} fill="#681B2B" />
                  <rect x="4" y="3" width="4" height="3" fill="#FEE571" />
                </svg>
                <div className="-mt-1 mx-auto h-2 w-14 bg-merlot/20" />
              </div>
            </div>
          </Cell>

          {/* 4. Show up, level up */}
          <Cell bg="bg-merlot" className="lg:col-span-5">
            <div className="h-full p-1">
              <div className="px-corners flex h-full flex-col gap-6 bg-coconut p-7 sm:p-8" style={{ "--step": "6px" } as React.CSSProperties}>
                <div>
                  <h3 className="text-[1.75rem] font-extrabold leading-[1.1] tracking-[-0.03em]">Show up, level up.</h3>
                  <p className="mt-2 text-[1.0625rem] font-medium leading-relaxed text-body">
                    Earn points for showing up and being someone people want to quest with again.
                  </p>
                </div>
                <div className="mt-auto flex items-end justify-between gap-4">
                  <p className="font-px t-px3 tabular leading-none text-merlot">
                    <span ref={xp}>+120</span>
                    <span className="t-px1 ml-2 align-top">XP</span>
                  </p>
                  <div ref={stairs} className="flex items-end gap-1" aria-hidden="true">
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                      <span key={n} className="block w-4 bg-yellow outline outline-2 -outline-offset-2 outline-merlot" style={{ height: n * 8 }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Cell>

          {/* 5. Keep your circle */}
          <Cell bg="bg-merlot on-dark text-coconut" className="md:col-span-1 lg:col-span-7">
            <div className="flex h-full min-h-[260px] flex-col p-7 sm:p-8">
              <h3 className="text-[1.75rem] font-extrabold leading-[1.1] tracking-[-0.03em]">Keep your circle.</h3>
              <p className="mt-2 max-w-[24rem] text-[1.0625rem] font-medium leading-relaxed text-coconut-78">
                The people you’ve quested with stay close for the next plan.
              </p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={asset("/img/stairs.png")}
                alt=""
                width={1635}
                height={370}
                loading="lazy"
                decoding="async"
                className="pixelated mt-auto w-full translate-y-7 pt-8"
              />
            </div>
          </Cell>
        </div>
      </div>
    </section>
  );
}
