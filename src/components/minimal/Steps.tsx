"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP, MQ } from "@/lib/gsap";
import PixelFox from "../PixelFox";
import { minimalReveal } from "./reveal";

const STEPS = [
  { n: "01", title: "Explore", body: "See what’s happening around Cairo tonight, this weekend, or right now." },
  { n: "02", title: "Join or start one", body: "Jump into someone’s plan, or put your own out there and see who’s in." },
  { n: "03", title: "Chat", body: "Chat opens once you’re in. Sort out where, when, and who’s bringing snacks." },
  { n: "04", title: "Show up", body: "The best part happens offline. Check in, rate the quest, earn points." },
];

/**
 * How it works: four steps under a dotted pixel path. A tiny fox walks the
 * path as you scroll, swapping happy and wink every 24px to fake a walk cycle,
 * and stops at the step that is current. Mobile runs the path down the side.
 */
export default function Steps() {
  const section = useRef<HTMLElement>(null);
  const grid = useRef<HTMLOListElement>(null);
  const walker = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const off = minimalReveal(section.current!);
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        const el = walker.current!;
        const frames = el.querySelectorAll<HTMLElement>("[data-walk]");
        const stops = gsap.utils.toArray<HTMLElement>("[data-step]", grid.current);
        const horizontal = () => window.matchMedia("(min-width: 768px)").matches;
        const target = (i: number) => (horizontal() ? stops[i].offsetLeft : stops[i].offsetTop);
        let current = 0;
        let pos = 0;
        let walk: gsap.core.Tween | null = null;

        const place = () => {
          const h = horizontal();
          gsap.set(el, h ? { x: pos, y: 0 } : { x: 0, y: pos });
          const step = Math.floor(Math.abs(pos) / 24) % 2;
          frames[0].style.opacity = step ? "0" : "1";
          frames[1].style.opacity = step ? "1" : "0";
        };
        const goTo = (i: number) => {
          const dest = target(i);
          const dir = dest >= pos ? 1 : -1;
          gsap.set(el.firstElementChild, { scaleX: horizontal() ? dir : 1 });
          walk?.kill();
          const proxy = { v: pos };
          walk = gsap.to(proxy, {
            v: dest,
            duration: Math.max(0.2, Math.abs(dest - pos) / 220),
            ease: "none",
            onUpdate: () => {
              pos = proxy.v;
              place();
            },
            onComplete: () => {
              frames[0].style.opacity = "1";
              frames[1].style.opacity = "0";
            },
          });
        };

        pos = target(0);
        place();
        const st = ScrollTrigger.create({
          trigger: grid.current,
          start: "top 75%",
          end: "bottom 35%",
          onUpdate: (self) => {
            const i = Math.round(self.progress * (stops.length - 1));
            if (i !== current) {
              current = i;
              goTo(i);
            }
          },
          onRefresh: () => {
            pos = target(current);
            place();
          },
        });
        return () => {
          walk?.kill();
          st.kill();
        };
      });
      return () => {
        mm.revert();
        off();
      };
    },
    { scope: section },
  );

  return (
    <section id="how" ref={section} aria-labelledby="min-how" className="mx-auto max-w-[1100px] px-4 py-32 sm:px-8">
      <h2 id="min-how" data-mh className="text-[clamp(2rem,4vw,3rem)] font-extrabold leading-[1.05] tracking-[-0.035em] text-merlot">
        How it works.
      </h2>

      <div className="relative mt-16 pl-14 md:pl-0 md:pt-16">
        {/* Dotted pixel path */}
        <div className="dot-path absolute bottom-0 left-[19px] top-0 w-[4px] md:bottom-auto md:left-0 md:right-0 md:top-[22px] md:h-[4px] md:w-auto" aria-hidden="true" />
        {/* The walker */}
        <div ref={walker} className="pointer-events-none absolute left-0 top-0 w-[41px] md:top-0" aria-hidden="true">
          <div className="relative" style={{ aspectRatio: "41 / 35" }}>
            <div data-walk className="absolute inset-0">
              <PixelFox frame="happy" />
            </div>
            <div data-walk className="absolute inset-0" style={{ opacity: 0 }}>
              <PixelFox frame="wink" />
            </div>
          </div>
        </div>

        <ol ref={grid} className="grid gap-14 md:grid-cols-4 md:gap-8">
          {STEPS.map((s) => (
            <li key={s.n} data-step data-mb className="relative">
              <p className="font-px t-px1 text-body">{s.n}</p>
              <h3 className="mt-3 text-[1.5rem] font-extrabold leading-tight tracking-[-0.025em] text-merlot">{s.title}</h3>
              <p className="mt-2 text-[1rem] font-medium leading-relaxed text-body">{s.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
