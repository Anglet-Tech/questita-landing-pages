"use client";

import { useRef, useState } from "react";
import { gsap, ScrollTrigger, useIdleGSAP, MQ } from "@/lib/gsap";
import type { FoxFrame } from "@/lib/fox";
import PixelFox from "./PixelFox";
import PixelSeam from "./PixelSeam";
import { Bubble } from "./ui";

const STOPS: { n: string; title: string; body: string; fox: FoxFrame }[] = [
  { n: "01", title: "Explore", body: "See what’s happening around Cairo tonight, this weekend, or right now.", fox: "wow" },
  { n: "02", title: "Join or start one", body: "Jump into someone’s plan, or put your own out there and see who’s in.", fox: "wink" },
  { n: "03", title: "Chat", body: "Chat opens once you’re in. Sort out where, when, and who’s bringing snacks.", fox: "happy" },
  { n: "04", title: "Show up", body: "The best part happens offline. Check in, rate the quest, earn points.", fox: "happy" },
];
const SNACKS = "who’s bringing snacks?";

/**
 * Four stops. Desktop pins for ~400vh: the blue route draws downward, stops
 * pop as the line reaches them and the stage swaps with line-mask transitions.
 * Mobile, tablet and reduced motion get a vertical list with the same copy.
 */
export default function How() {
  const section = useRef<HTMLElement>(null);
  const scene = useRef<HTMLDivElement>(null);
  const line = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const foxBox = useRef<HTMLDivElement>(null);
  const bubble = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLOListElement>(null);
  const listLine = useRef<HTMLDivElement>(null);
  const [frame, setFrame] = useState<FoxFrame>("wow");

  useIdleGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(MQ.desktop, () => {
        const panels = gsap.utils.toArray<HTMLElement>("[data-panel]", stage.current);
        const stops = gsap.utils.toArray<HTMLElement>("[data-stop]", scene.current);
        const masks = (p: HTMLElement) => p.querySelectorAll<HTMLElement>("[data-rise]");
        panels.forEach((p, i) => {
          gsap.set(masks(p), { yPercent: i === 0 ? 0 : 110 });
          gsap.set(p, { autoAlpha: i === 0 ? 1 : 0 });
        });
        gsap.set(stops, { scale: 0.6 });
        gsap.set(stops[0], { scale: 1 });
        gsap.set(line.current, { scaleY: 0, transformOrigin: "50% 0%" });
        gsap.set(bubble.current, { autoAlpha: 0 });

        let active = 0;
        let bounce: gsap.core.Tween | null = null;
        let typing: gsap.core.Tween | null = null;
        const chars = bubble.current!.querySelectorAll("[data-char]");

        const activate = (next: number) => {
          if (next === active) return;
          const prev = panels[active];
          const incoming = panels[next];
          const dir = next > active ? 1 : -1;
          active = next;
          gsap.to(masks(prev), { yPercent: -110 * dir, duration: 0.55, ease: "expo.inOut", stagger: 0.04, overwrite: true });
          gsap.set(prev, { autoAlpha: 0, delay: 0.55, overwrite: true });
          gsap.set(incoming, { autoAlpha: 1, overwrite: true });
          gsap.fromTo(
            masks(incoming),
            { yPercent: 110 * dir },
            { yPercent: 0, duration: 0.8, ease: "expo.out", stagger: 0.06, delay: 0.12, overwrite: true },
          );

          setFrame(STOPS[next].fox);
          gsap.fromTo(foxBox.current, { scaleY: 0.9 }, { scaleY: 1, duration: 0.16, ease: "steps(2)", transformOrigin: "50% 100%" });

          bounce?.kill();
          bounce = null;
          gsap.set(foxBox.current, { y: 0 });
          if (next === 3) {
            bounce = gsap.to(foxBox.current, { y: -8, duration: 0.28, ease: "steps(1)", repeat: -1, yoyo: true });
          }

          typing?.kill();
          if (next === 2) {
            gsap.set(bubble.current, { autoAlpha: 1 });
            gsap.set(chars, { autoAlpha: 0 });
            typing = gsap.to(chars, { autoAlpha: 1, duration: 0.01, stagger: 0.045, delay: 0.35, ease: "none" });
          } else {
            gsap.set(bubble.current, { autoAlpha: 0 });
          }
        };

        const reach = [0, 1 / 3, 2 / 3, 1];
        const lineEnd = 0.88; // the line finishes drawing at 88%, then holds on stop 4
        const reached = [true, false, false, false];
        gsap.to(line.current, {
          scaleY: 1,
          ease: "none",
          scrollTrigger: {
            trigger: scene.current,
            start: "top top",
            end: "+=350%",
            pin: true,
            scrub: 0.5,
            anticipatePin: 1,
            onUpdate: (self) => {
              const lp = Math.min(1, self.progress / lineEnd);
              let idx = 0;
              reach.forEach((r, i) => {
                const on = lp >= r - 0.001;
                if (on) idx = i;
                if (on !== reached[i]) {
                  reached[i] = on;
                  gsap.to(stops[i], { scale: on ? 1 : 0.6, duration: 0.2, ease: "steps(2)", overwrite: true });
                }
              });
              activate(idx);
            },
          },
        });

        return () => {
          bounce?.kill();
          typing?.kill();
        };
      });

      mm.add(MQ.mobile, () => {
        gsap.fromTo(
          listLine.current,
          { scaleY: 0 },
          {
            scaleY: 1,
            transformOrigin: "50% 0%",
            ease: "none",
            scrollTrigger: { trigger: list.current, start: "top 70%", end: "bottom 70%", scrub: 0.5 },
          },
        );
        gsap.utils.toArray<HTMLElement>("[data-lstop]", list.current).forEach((stop) => {
          gsap.set(stop, { scale: 0.6 });
          ScrollTrigger.create({
            trigger: stop,
            start: "top 70%",
            onEnter: () => gsap.to(stop, { scale: 1, duration: 0.2, ease: "steps(2)" }),
            onLeaveBack: () => gsap.to(stop, { scale: 0.6, duration: 0.2, ease: "steps(2)" }),
          });
        });
      });

      return () => mm.revert();
    },
    { scope: section },
  );

  return (
    <section id="how" ref={section} data-nav="dark" aria-label="How it works" className="on-dark relative z-[3] bg-merlot text-coconut">
      <PixelSeam from="coconut" to="merlot" />

      {/* Desktop pinned scene */}
      <div ref={scene} className="how-desktop hidden h-[100svh] lg:block">
        <div className="mx-auto flex h-full max-w-[1440px] flex-col px-12 pb-12 pt-[calc(var(--nav-h)+4vh)]">
          <div className="flex items-end justify-between gap-8">
            <div>
              <p className="font-px t-px1 text-coconut-78">How it works</p>
              <h2 className="mt-4 text-[clamp(4rem,8vw,8rem)] font-extrabold leading-[0.95] tracking-[-0.04em]">
                Four stops.
              </h2>
            </div>
          </div>

          <div className="mt-[5vh] grid min-h-0 flex-1 grid-cols-12 gap-8">
            {/* Route */}
            <div className="relative col-span-3 xl:col-span-2" aria-hidden="true">
              <div className="absolute bottom-6 left-[18px] top-6 w-3 bg-blue/15" />
              <div ref={line} className="absolute bottom-6 left-[18px] top-6 w-3 bg-blue" />
              <div className="absolute inset-y-0 left-0 flex flex-col justify-between">
                {STOPS.map((s) => (
                  <div key={s.n} className="flex items-center gap-5">
                    <span data-stop className="block h-12 w-12 bg-yellow" />
                    <span className="font-px t-px1 text-coconut-78">{s.n}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Stage */}
            <div ref={stage} className="relative col-span-6 xl:col-span-7">
              {STOPS.map((s) => (
                <div key={s.n} data-panel className="absolute inset-0 flex flex-col justify-center">
                  <div className="overflow-hidden">
                    <p data-rise className="font-px t-px2 text-yellow">
                      {s.n}
                    </p>
                  </div>
                  <div className="split-mask mt-4 overflow-hidden">
                    <h3 data-rise className="text-[clamp(3rem,6vw,5.5rem)] font-extrabold leading-[1] tracking-[-0.035em]">
                      {s.title}
                    </h3>
                  </div>
                  <div className="mt-6 overflow-hidden">
                    <p data-rise className="max-w-[30rem] text-[1.3rem] font-medium leading-snug text-coconut-78">
                      {s.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Fox */}
            <div className="relative col-span-3 flex items-center justify-center">
              <div className="relative">
                <div ref={bubble} className="absolute bottom-[calc(100%+20px)] left-1/2 w-max -translate-x-1/2" aria-hidden="true">
                  <Bubble tailLeft={40}>
                    <p className="font-px t-px1 leading-[1.6] tracking-[0.12em]">
                      {SNACKS.split("").map((c, i) => (
                        <span key={i} data-char="">
                          {c}
                        </span>
                      ))}
                    </p>
                  </Bubble>
                </div>
                <div ref={foxBox} className="w-[205px] xl:w-[246px]">
                  <PixelFox frame={frame} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile, tablet and reduced motion: a vertical list */}
      <div className="how-list mx-auto max-w-[1440px] px-4 pb-24 pt-[calc(var(--nav-h)+40px)] sm:px-8 lg:hidden lg:px-12">
        <p className="font-px t-px1 text-coconut-78">How it works</p>
        <h2 className="mt-4 text-[clamp(3.4rem,13vw,6rem)] font-extrabold leading-[0.95] tracking-[-0.04em]">Four stops.</h2>
        <div className="relative mt-12">
          <div className="absolute bottom-6 left-[18px] top-6 w-3 bg-blue/15" aria-hidden="true" />
          <div ref={listLine} className="absolute bottom-6 left-[18px] top-6 w-3 bg-blue" aria-hidden="true" />
          <ol ref={list} className="relative flex flex-col gap-14">
            {STOPS.map((s) => (
              <li key={s.n} className="flex gap-6">
                <span data-lstop aria-hidden="true" className="mt-1 block h-12 w-12 shrink-0 bg-yellow" />
                <div className="flex-1">
                  <p className="font-px t-px1 text-yellow">{s.n}</p>
                  <h3 className="mt-2 text-[clamp(2.2rem,8vw,3.4rem)] font-extrabold leading-[1.02] tracking-[-0.035em]">{s.title}</h3>
                  <p className="mt-3 max-w-[30rem] text-[1.125rem] font-medium leading-snug text-coconut-78">{s.body}</p>
                  {s.n === "03" && (
                    <Bubble className="mt-5 w-max" tailLeft={20}>
                      <p className="font-px t-px1 tracking-[0.12em]">{SNACKS}</p>
                    </Bubble>
                  )}
                </div>
                <div className="hidden w-[123px] shrink-0 self-center sm:block">
                  <PixelFox frame={s.fox} />
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
