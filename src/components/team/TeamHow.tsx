"use client";

import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import type { FoxFrame } from "@/lib/fox";
import PixelFox from "../PixelFox";
import { revealOnView, riseOnView, whenVisible } from "./motion";

const STEPS: { n: string; title: string; body: string; fox: FoxFrame }[] = [
  { n: "01", title: "Explore", body: "See what’s happening around Cairo tonight, this weekend, or right now.", fox: "wow" },
  { n: "02", title: "Join or start one", body: "Jump into someone’s plan, or put your own out there and see who’s in.", fox: "wink" },
  { n: "03", title: "Chat", body: "Sort out the details with the people going. Where, when, who’s bringing snacks.", fox: "happy" },
  { n: "04", title: "Show up", body: "The best part happens offline. Plans are better with witnesses.", fox: "happy" },
];

/** The route in a 1200 x 300 box: [x, y, w, h, vertical]. */
const SEGS: [number, number, number, number, boolean][] = [
  [150, 227, 145, 6, false],
  [289, 167, 6, 66, true],
  [289, 167, 314, 6, false],
  [597, 107, 6, 66, true],
  [597, 107, 314, 6, false],
  [905, 47, 6, 66, true],
  [905, 47, 145, 6, false],
];
const SEG_LEN = SEGS.map((s) => (s[4] ? s[3] : s[2]));
const TOTAL = SEG_LEN.reduce((a, b) => a + b, 0);

/** Fox stops: centre x, the line's top y, width (route units), distance along the route. */
const STOPS = [
  { cx: 150, y: 227, w: 60, at: 0 },
  { cx: 446, y: 167, w: 60, at: 368 },
  { cx: 754, y: 107, w: 60, at: 748 },
  { cx: 1050, y: 47, w: 72, at: TOTAL },
];

/** How it works: the team's staircase with a fox on each step. */
export default function TeamHow() {
  const section = useRef<HTMLElement>(null);
  const h2 = useRef<HTMLHeadingElement>(null);
  const stage = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = section.current!;
      const offs = [revealOnView(h2.current), riseOnView(h2.current, root.querySelectorAll("[data-rise]"), { delay: 0.3 })];
      if (!prefersReducedMotion()) {
        const q = gsap.utils.selector(stage.current);
        const segs = q("[data-seg]");
        const foxes = q("[data-stop]");
        const cards = q("[data-step]");
        const mini = q("[data-mini]");
        const desktop = window.matchMedia("(min-width: 1024px)").matches;
        gsap.set(cards, { y: 40, autoAlpha: 0 });
        if (desktop) {
          gsap.set(foxes, { scale: 0, y: -30 });
          segs.forEach((s, i) => {
            const [x, y, , h, v] = SEGS[i];
            gsap.set(s, { attr: v ? { y: y + h, height: 0 } : { x, width: 0 } });
          });
        } else gsap.set(mini, { scale: 0 });

        offs.push(
          whenVisible(stage.current, () => {
            const D = 2.1;
            const t0 = 0.25;
            const tl = gsap.timeline();
            if (desktop) {
              let at = t0;
              segs.forEach((s, i) => {
                const [, y, w, h, v] = SEGS[i];
                const dur = (SEG_LEN[i] / TOTAL) * D;
                const steps = Math.max(2, Math.round(SEG_LEN[i] / 26));
                tl.to(s, { attr: v ? { y, height: h } : { width: w }, duration: dur, ease: `steps(${steps})` }, at);
                at += dur;
              });
              STOPS.forEach((st, i) => {
                const t = t0 + (st.at / TOTAL) * D;
                tl.to(foxes[i], { scale: 1, y: 0, duration: 0.32, ease: "steps(4)" }, t);
                tl.to(cards[i], { y: 0, autoAlpha: 1, duration: 0.8, ease: "expo.out" }, t + 0.05);
              });
            } else {
              tl.to(cards, { y: 0, autoAlpha: 1, duration: 0.8, ease: "expo.out", stagger: 0.12 });
              tl.to(mini, { scale: 1, duration: 0.24, ease: "steps(3)", stagger: 0.12 }, 0.2);
            }
          }, 0.25),
        );
      }
      return () => offs.forEach((f) => f());
    },
    { scope: section },
  );

  return (
    <section ref={section} data-pin aria-labelledby="tm-how-title" className="tm-sec tm-how tm-full py-16 text-merlot lg:py-[clamp(32px,7vh,88px)]">
      <span className="tm-edge" aria-hidden="true" />
      <div className="tm-inner tm-wrap">
        <div className="mb-8 flex flex-col gap-4 lg:mb-[clamp(16px,3vh,40px)] lg:flex-row lg:items-end lg:justify-between lg:gap-9">
          <h2 id="tm-how-title" ref={h2} className="text-[clamp(2.75rem,min(6vw,9vh),4.5rem)] font-extrabold leading-[1.02] tracking-[-0.035em]">
            Four stops.
          </h2>
          <p data-rise className="max-w-[22rem] text-[1.0625rem] font-semibold leading-snug lg:mb-2 lg:text-[1.125rem]">
            From “we should do something” to actually doing it. The route is short on purpose.
          </p>
        </div>

        <div ref={stage} className="tm-stage">
          <div className="tm-route hidden lg:block" aria-hidden="true">
            <svg viewBox="0 0 1200 300" className="h-full w-full overflow-visible" shapeRendering="crispEdges">
              <g fill="#681B2B">
                {SEGS.map(([x, y, w, h], i) => (
                  <rect key={i} data-seg="" x={x} y={y} width={w} height={h} />
                ))}
              </g>
            </svg>
            {STOPS.map((s, i) => (
              <div
                key={i}
                data-stop=""
                className="tm-stopfox"
                style={{
                  left: `${((s.cx - s.w / 2) / 1200) * 100}%`,
                  width: `${(s.w / 1200) * 100}%`,
                  bottom: `${((300 - s.y) / 300) * 100}%`,
                }}
              >
                <PixelFox frame={STEPS[i].fox} />
              </div>
            ))}
          </div>

          <ol className="tm-steps">
            {STEPS.map((s, i) => {
              const last = i === 3;
              return (
                <li key={s.n} data-step="" className={`tm-step tm-step-${i + 1} px-corners ${last ? "bg-merlot! text-coconut" : ""}`}>
                  <span data-mini="" className="absolute right-4 top-4 w-[52px] lg:hidden" aria-hidden="true">
                    <PixelFox frame={s.fox} />
                  </span>
                  <span className={`tm-step-num font-px ${last ? "text-yellow" : "text-merlot"}`}>{s.n}</span>
                  <h3 className={`text-[1.3125rem] font-extrabold leading-tight ${last ? "text-coconut" : "text-merlot"}`}>{s.title}</h3>
                  <p className={`text-[0.9375rem] leading-snug ${last ? "text-coconut" : "text-body"}`}>{s.body}</p>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
