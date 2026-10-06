"use client";

import { useRef, useState } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import PixelFox from "../PixelFox";
import { revealOnView, whenVisible } from "./motion";

// A 12 x 12 pixel map pin, row by row: [y, x0, x1].
const PIN_ROWS: [number, number, number][] = [
  [0, 3, 8], [1, 2, 9], [2, 1, 10], [3, 0, 11], [4, 0, 11], [5, 0, 11], [6, 0, 11],
  [7, 1, 10], [8, 2, 9], [9, 3, 8], [10, 4, 7], [11, 5, 6],
];
const PIN_PATH = PIN_ROWS.map(([y, x0, x1]) => `M${x0} ${y}h${x1 - x0 + 1}v1h-${x1 - x0 + 1}z`).join("");

const step = (px: number) => ({ "--step": `${px}px` }) as React.CSSProperties;

/**
 * Safety and play, in the team's language: five stepped cells on flat
 * colour, each with a small rect-built pixel toy. Cells rise in with a
 * stepped stagger; the toys play once when the grid is in view.
 */
export default function TeamSafety() {
  const section = useRef<HTMLElement>(null);
  const h2 = useRef<HTMLHeadingElement>(null);
  const grid = useRef<HTMLDivElement>(null);
  const card = useRef<HTMLDivElement>(null);
  const stamp = useRef<HTMLSpanElement>(null);
  const pin = useRef<SVGSVGElement>(null);
  const xp = useRef<HTMLSpanElement>(null);
  const stairs = useRef<HTMLDivElement>(null);
  const [pref, setPref] = useState(true);

  useGSAP(
    () => {
      const offs = [revealOnView(h2.current)];
      if (!prefersReducedMotion()) {
        const cells = gsap.utils.toArray<HTMLElement>("[data-cell]", grid.current);
        const blocks = Array.from(stairs.current!.children);
        gsap.set(cells, { y: 48, autoAlpha: 0 });
        gsap.set(stamp.current, { autoAlpha: 0 });
        gsap.set(pin.current, { y: -90, autoAlpha: 0 });
        gsap.set(blocks, { autoAlpha: 0.2 });
        xp.current!.textContent = "+0";
        const count = { v: 0 };
        offs.push(
          whenVisible(
            grid.current,
            () => {
              gsap
                .timeline()
                .add(() => setPref(false), 0)
                .to(cells, { y: 0, autoAlpha: 1, duration: 0.4, ease: "steps(5)", stagger: 0.09 })
                .fromTo(stamp.current, { autoAlpha: 0, scale: 1.6 }, { autoAlpha: 1, scale: 1, duration: 0.22, ease: "steps(3)" }, 0.75)
                .to(card.current, { x: -4, y: 2, duration: 0.05, ease: "steps(1)" })
                .to(card.current, { x: 4, y: -2, duration: 0.05, ease: "steps(1)" })
                .to(card.current, { x: 0, y: 0, duration: 0.05, ease: "steps(1)" })
                .add(() => setPref(true), 0.8)
                .to(pin.current, { y: 0, autoAlpha: 1, duration: 0.36, ease: "steps(6)" }, 0.85)
                .to(pin.current, { y: -14, duration: 0.12, ease: "steps(2)" })
                .to(pin.current, { y: 0, duration: 0.12, ease: "steps(2)" })
                .to(
                  count,
                  {
                    v: 120,
                    duration: 1.1,
                    ease: "power1.out",
                    onUpdate: () => {
                      if (xp.current) xp.current.textContent = `+${Math.round(count.v)}`;
                    },
                  },
                  0.9,
                )
                .to(blocks, { autoAlpha: 1, duration: 0.01, stagger: 1.1 / blocks.length }, 0.9);
            },
            0.2,
          ),
        );
      }
      return () => offs.forEach((f) => f());
    },
    { scope: section },
  );

  return (
    <section ref={section} data-pin aria-labelledby="tm-safety-title" className="tm-sec tm-safety tm-full py-16 text-merlot lg:py-[clamp(32px,6vh,72px)]">
      <div className="tm-inner tm-wrap">
        <h2 id="tm-safety-title" ref={h2} className="max-w-[18ch] text-[clamp(2.125rem,min(4.4vw,6.4vh),3.5rem)] font-extrabold leading-[1.04] tracking-[-0.03em]">
          Real life, with a playful system on top.
        </h2>

        <div ref={grid} className="tm-safety-grid mt-8 lg:mt-[clamp(20px,4vh,40px)]">
          {/* 1. Verified (big, merlot) */}
          <div data-cell className="tm-cell-1">
            <div className="tm-cell px-corners on-dark bg-merlot text-coconut" style={step(6)}>
              <h3 className="text-[clamp(1.5rem,2.4vw,2.125rem)] font-extrabold leading-[1.05] tracking-[-0.03em]">Everyone’s verified.</h3>
              <p className="mt-2 max-w-[28rem] text-[1rem] leading-relaxed text-coconut-78">ID and a live photo at sign-up, so the person you meet is the person on the profile.</p>
              <div className="mt-auto flex justify-center pt-6">
                <div ref={card} className="relative w-full max-w-[340px]" aria-hidden="true">
                  <div className="px-corners bg-coconut p-4 text-merlot" style={step(6)}>
                    <div className="flex items-center gap-4">
                      <div className="px-corners shrink-0 bg-blue p-2" style={step(4)}>
                        <div className="w-[64px]">
                          <PixelFox frame="happy" />
                        </div>
                      </div>
                      <dl className="font-px t-px1 grid gap-2.5 leading-none">
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
                    <div className="mt-4 flex gap-2">
                      <span className="h-2 flex-1 bg-merlot/15" />
                      <span className="h-2 w-12 bg-merlot/15" />
                      <span className="h-2 w-6 bg-yellow" />
                    </div>
                  </div>
                  <span ref={stamp} className="font-px t-px2 absolute -bottom-5 -right-3 w-max rotate-[-8deg] whitespace-nowrap border-[3px] border-yellow bg-merlot px-3 py-1 text-yellow">
                    Verified
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Your call on who (yellow) */}
          <div data-cell className="tm-cell-2">
            <div className="tm-cell px-corners bg-yellow" style={step(6)}>
              <h3 className="tm-cell-title">Your call on who.</h3>
              <p className="tm-cell-body text-body">Set a gender preference on any quest you post.</p>
              <div className="mt-auto flex items-center gap-3 pt-4">
                <button type="button" role="switch" aria-checked={pref} aria-label="Gender preference" onClick={() => setPref((v) => !v)} className="px-switch" data-on={pref || undefined}>
                  <span className="px-switch-knob" />
                </button>
                <span className="font-px t-px1 min-w-0 tracking-[0.08em]" aria-hidden="true">
                  {pref ? "Preference on" : "Preference off"}
                </span>
              </div>
            </div>
          </div>

          {/* 3. Meetup point (blue) */}
          <div data-cell className="tm-cell-3">
            <div className="tm-cell px-corners bg-blue" style={step(6)}>
              <h3 className="tm-cell-title">Meetup point, when you’re ready.</h3>
              <p className="tm-cell-body text-body">You decide when the exact spot is shared.</p>
              <div className="mt-auto flex justify-end pt-3" aria-hidden="true">
                <div>
                  <svg ref={pin} viewBox="0 0 12 12" width="48" height="48" shapeRendering="crispEdges">
                    <path d={PIN_PATH} fill="#681B2B" />
                    <rect x="4" y="3" width="4" height="3" fill="#FEE571" />
                  </svg>
                  <div className="mx-auto mt-0.5 h-1.5 w-10 bg-merlot/20" />
                </div>
              </div>
            </div>
          </div>

          {/* 4. Show up, level up (coconut, merlot frame) */}
          <div data-cell className="tm-cell-4">
            <div className="px-corners h-full bg-merlot p-1" style={step(6)}>
              <div className="tm-cell px-corners bg-coconut" style={step(5)}>
                <h3 className="tm-cell-title">Show up, level up.</h3>
                <p className="tm-cell-body text-body">Earn points for showing up and being someone people want to quest with again.</p>
                <div className="mt-auto flex items-end justify-between gap-3 pt-3">
                  <p className="font-px t-px2 tabular leading-none">
                    <span ref={xp}>+120</span>
                    <span className="t-px1 ml-1.5 align-top">XP</span>
                  </p>
                  <div ref={stairs} className="flex items-end gap-1" aria-hidden="true">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <span key={n} className="block w-3.5 bg-yellow outline-2 -outline-offset-2 outline-merlot outline" style={{ height: n * 7 }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 5. Keep your circle (merlot) */}
          <div data-cell className="tm-cell-5">
            <div className="tm-cell px-corners on-dark bg-merlot text-coconut" style={step(6)}>
              <h3 className="tm-cell-title">Keep your circle.</h3>
              <p className="tm-cell-body text-coconut-78">The people you’ve quested with stay close for the next plan.</p>
              <div className="mt-auto flex items-end gap-2 pt-3" aria-hidden="true">
                {(["happy", "wink", "happy"] as const).map((f, i) => (
                  <div key={i} className={`px-corners bg-coconut p-1.5 ${i === 1 ? "-translate-y-2" : ""}`} style={step(3)}>
                    <div className="w-[34px]">
                      <PixelFox frame={f} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
