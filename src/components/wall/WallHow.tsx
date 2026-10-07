"use client";

import { useRef, useState } from "react";
import type { FoxFrame } from "@/lib/fox";
import { gsap, MQ, useIdleGSAP } from "@/lib/gsap";
import PixelFox from "../PixelFox";
import { anchorOf, flowTrigger, posterOf } from "./flow";

const STEPS = [
  { n: "01", title: "Explore", body: "See what’s happening around Cairo tonight, this weekend, or right now.", block: "bg-yellow", h: "lg:h-[44%]", w: "w-[70%]", rot: -2 },
  { n: "02", title: "Join or start one", body: "Jump into someone’s plan, or put your own out there and see who’s in.", block: "bg-blue", h: "lg:h-[58%]", w: "w-[80%]", rot: 1.5 },
  { n: "03", title: "Chat", body: "Sort out the details with the people going. Where, when, who’s bringing snacks.", block: "bg-yellow", h: "lg:h-[72%]", w: "w-[90%]", rot: -1.2 },
  { n: "04", title: "Show up", body: "The best part happens offline. Plans are better with witnesses.", block: "bg-coconut", h: "lg:h-[86%]", w: "w-full", rot: 2 },
];

/** An ease quantised to n levels, so motion lands on a pixel grid of positions. */
const stepped = (name: string, n: number) => {
  const e = gsap.parseEase(name);
  return (t: number) => Math.round(e(t) * n) / n;
};

/**
 * Four stops as a pixel staircase. On desktop the stage sticks while one fox
 * hops up the steps (scrubbed, in stepped arcs) and each step's card slaps on
 * when the fox lands. On small screens each step gets its own fox that hops
 * on as the step scrolls in.
 */
export default function WallHow() {
  const root = useRef<HTMLDivElement>(null);
  const stairs = useRef<HTMLDivElement>(null);
  const fox = useRef<HTMLDivElement>(null);
  const squash = useRef<HTMLDivElement>(null);
  const [frame, setFrame] = useState<FoxFrame>("happy");
  const frameRef = useRef<FoxFrame>("happy");

  useIdleGSAP(
    () => {
      const mm = gsap.matchMedia();
      const blocks = gsap.utils.toArray<HTMLElement>("[data-block]", root.current);
      const cards = gsap.utils.toArray<HTMLElement>("[data-step-card]", root.current);
      const show = (f: FoxFrame) => {
        if (frameRef.current === f) return;
        frameRef.current = f;
        setFrame(f);
      };

      mm.add(MQ.desktop, () => {
        const foxEl = fox.current!;
        const anchor = anchorOf(root.current!);
        const poster = posterOf(root.current!);
        const pos = () =>
          blocks.map((b) => ({
            x: b.offsetLeft + b.offsetWidth / 2 - foxEl.offsetWidth / 2,
            y: b.offsetTop - foxEl.offsetHeight + 3,
          }));

        cards.forEach((c, i) => gsap.set(c, { autoAlpha: 0, rotation: STEPS[i].rot }));

        const air: [number, number][] = [];
        const lands: number[] = [];
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          onUpdate: () => {
            const t = tl.time();
            const landed = lands.filter((l) => l <= t + 1e-3).length;
            const flying = air.some(([a, b]) => t > a + 1e-3 && t < b - 1e-3);
            show(flying ? "wow" : landed === lands.length ? "wink" : "happy");
            cards.forEach((c, i) => {
              const on = i < landed;
              if (on === (c.dataset.on === "1")) return;
              c.dataset.on = on ? "1" : "0";
              gsap.killTweensOf(c);
              if (on) {
                gsap.fromTo(c, { autoAlpha: 0, scale: 1.35, rotation: STEPS[i].rot + 9 }, { autoAlpha: 1, scale: 1, rotation: STEPS[i].rot, duration: 0.3, ease: "steps(4)" });
                gsap.fromTo(squash.current, { scaleY: 0.78, scaleX: 1.14 }, { scaleY: 1, scaleX: 1, duration: 0.28, ease: "steps(3)" });
              } else {
                gsap.to(c, { autoAlpha: 0, duration: 0.12, ease: "steps(2)" });
              }
            });
          },
          scrollTrigger: {
            trigger: anchor,
            start: "top top",
            end: () => `+=${Math.max(1, poster.offsetHeight - window.innerHeight)}`,
            scrub: 0.35,
            invalidateOnRefresh: true,
          },
        });

        // Drop onto the first step.
        // Hidden for the first part of the fall so it never sits over the heading.
        tl.set(foxEl, { autoAlpha: 1 }, 0.35);
        tl.fromTo(foxEl, { x: () => pos()[0].x, y: () => -foxEl.offsetHeight * 1.2 }, { y: () => pos()[0].y, duration: 1, ease: stepped("power2.in", 6) }, 0);
        air.push([0, 1]);
        lands.push(1);
        let t = 1.7;
        for (let i = 1; i < STEPS.length; i++) {
          const k = i;
          const peak = () => Math.min(pos()[k - 1].y, pos()[k].y) - foxEl.offsetHeight * 0.9;
          tl.to(foxEl, { x: () => pos()[k].x, duration: 1, ease: stepped("none", 8) }, t);
          tl.to(foxEl, { y: peak, duration: 0.5, ease: stepped("power2.out", 4) }, t);
          tl.to(foxEl, { y: () => pos()[k].y, duration: 0.5, ease: stepped("power2.in", 4) }, t + 0.5);
          air.push([t, t + 1]);
          lands.push(t + 1);
          t += 1.7;
        }
        tl.to({}, { duration: 0.4 }, t - 0.7);

        return () => {
          cards.forEach((c) => delete c.dataset.on);
          show("happy");
        };
      });

      mm.add(MQ.mobile, () => {
        gsap.utils.toArray<HTMLElement>("[data-mfox]", root.current).forEach((f) => {
          const block = f.closest<HTMLElement>("[data-block]")!;
          gsap.from(f, {
            autoAlpha: 0,
            y: -48,
            duration: 0.5,
            ease: stepped("bounce.out", 8),
            scrollTrigger: { ...flowTrigger(block, "80%"), toggleActions: "play none none reverse" },
          });
        });
      });

      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <div ref={root} className="wl-how-stage relative flex flex-col">
      <div className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col px-4 pb-14 pt-[calc(var(--wl-nav)+40px)] sm:px-8 lg:px-12 lg:pb-0 lg:pt-[calc(var(--wl-nav)+36px)]">
        <div className="grid gap-5 lg:grid-cols-12 lg:items-end">
          <h2 id="wl-how-t" className="text-[clamp(2.8rem,6vw,5.6rem)] font-extrabold leading-[0.95] tracking-[-0.04em] text-coconut lg:col-span-7">
            Four stops.
          </h2>
          <p className="max-w-[26rem] text-[1.0625rem] font-medium leading-relaxed text-coconut-78 lg:col-span-5 lg:justify-self-end">
            From “we should do something” to actually doing it. The route is short on purpose.
          </p>
        </div>

        <div ref={stairs} className="wl-how-stairs relative mt-14 flex flex-col gap-16 lg:mt-8 lg:min-h-[420px] lg:flex-1 lg:flex-row lg:items-end lg:gap-0">
          {STEPS.map((s, i) => (
            <div key={s.n} data-block="" className={`wl-stair relative ${s.block} ${s.w} ${s.h} lg:w-1/4`}>
              {/* Small screens: each step has its own fox sitting on it. */}
              <div data-mfox="" className="absolute bottom-full right-4 w-[64px] lg:hidden" aria-hidden="true">
                <PixelFox frame={i === 3 ? "wink" : i === 0 ? "wow" : "happy"} />
              </div>
              <div
                data-step-card=""
                className="wl-slap px-frame px-corners m-3 sm:m-4 lg:mx-4 lg:mt-5"
                style={{ "--step": "4px", "--frame-w": "3px", transform: `rotate(${s.rot}deg)` } as React.CSSProperties}
              >
                <div className={`px-frame-in px-corners p-4 xl:p-5 ${i === 3 ? "bg-yellow" : "bg-coconut"}`} style={{ "--step": "4px" } as React.CSSProperties}>
                  <p className="font-px t-px2 leading-none text-merlot">{s.n}</p>
                  <h3 className="mt-2.5 text-[1.35rem] font-extrabold leading-[1.1] tracking-[-0.02em] text-merlot xl:text-[1.6rem]">{s.title}</h3>
                  <p className="mt-1.5 text-[0.95rem] font-medium leading-snug text-body lg:text-[0.875rem] xl:text-[0.95rem]">{s.body}</p>
                </div>
              </div>
            </div>
          ))}

          {/* Desktop: the one fox that climbs. */}
          <div ref={fox} className="wl-hfox absolute left-0 top-0 hidden w-[88px] lg:block xl:w-[104px]" aria-hidden="true">
            <div ref={squash} style={{ transformOrigin: "50% 100%" }}>
              <PixelFox frame={frame} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
