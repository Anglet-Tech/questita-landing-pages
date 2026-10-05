"use client";

import { useRef, useState } from "react";
import { gsap, ScrollTrigger, SplitText, useGSAP, MQ } from "@/lib/gsap";
import { asset } from "@/lib/asset";
import { burstFrom } from "@/lib/burst";
import { onReady } from "@/lib/store";
import type { FoxFrame } from "@/lib/fox";
import PixelFox, { popFox } from "./PixelFox";
import PixelReveal from "./PixelReveal";
import Marquee from "./Marquee";
import Countdown from "./Countdown";
import { Arrow, Magnetic, Roll } from "./ui";

const CYCLE: FoxFrame[] = ["happy", "wink", "wow"];

export default function Hero() {
  const hero = useRef<HTMLElement>(null);
  const copy = useRef<HTMLDivElement>(null);
  const foxCol = useRef<HTMLDivElement>(null);
  const foxBtn = useRef<HTMLButtonElement>(null);
  const h1 = useRef<HTMLHeadingElement>(null);
  const countdown = useRef<HTMLParagraphElement>(null);
  const sub = useRef<HTMLParagraphElement>(null);
  const cta = useRef<HTMLSpanElement>(null);
  const tape = useRef<HTMLDivElement>(null);

  const [cycle, setCycle] = useState(0);
  const [fast, setFast] = useState(false);
  const clicks = useRef<number[]>([]);
  const frame: FoxFrame = fast ? "wow" : CYCLE[cycle];

  // Intro choreography, after the preloader.
  useGSAP(
    () => {
      const html = document.documentElement;
      if (!html.classList.contains("intro")) return; // reduced motion: final state
      let split: SplitText | null = null;
      let tl: gsap.core.Timeline | null = null;
      let cancelled = false;

      const play = async () => {
        await document.fonts?.ready;
        if (cancelled) return;
        split = SplitText.create(h1.current!.querySelectorAll("[data-line]"), {
          type: "lines",
          mask: "lines",
          linesClass: "split-mask",
        });
        const chars = countdown.current!.querySelectorAll("[data-char]");
        tl = gsap.timeline({
          onComplete: () => {
            html.classList.remove("intro");
            // Hand the H1 back to normal text so it reflows on resize.
            split?.revert();
            split = null;
          },
        });
        tl.set("[data-intro]", { visibility: "visible" })
          .from(split.lines, { yPercent: 110, duration: 0.9, ease: "expo.out", stagger: 0.08 }, 0.05)
          .from(chars, { autoAlpha: 0, duration: 0.01, stagger: 0.022, ease: "none" }, 0.1)
          .add(popFox(foxCol.current, { duration: 0.2, spread: 0.55 }), 0.1)
          .from(sub.current, { y: 24, autoAlpha: 0, duration: 0.8, ease: "expo.out" }, 0.35)
          .from(cta.current, { yPercent: 120, autoAlpha: 0, duration: 0.8, ease: "expo.out" }, 0.45)
          .from(tape.current, { x: () => window.innerWidth, duration: 1.1, ease: "expo.out" }, 0.3);
      };
      const off = onReady(() => void play());

      return () => {
        cancelled = true;
        off();
        tl?.kill();
        split?.revert();
      };
    },
    { scope: hero },
  );

  // Parallax out and the scroll-speed "wow".
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        const h = () => hero.current!.offsetHeight;
        gsap.to(copy.current, {
          y: () => h() * 0.4,
          ease: "none",
          scrollTrigger: { trigger: hero.current, start: "top top", end: "bottom top", scrub: true, invalidateOnRefresh: true },
        });
        gsap.to(foxCol.current, {
          y: () => h() * 0.15,
          scale: 0.94,
          ease: "none",
          scrollTrigger: { trigger: hero.current, start: "top top", end: "bottom top", scrub: true, invalidateOnRefresh: true },
        });

        let isFast = false;
        const settle = gsap.delayedCall(0.35, () => {
          isFast = false;
          setFast(false);
        }).pause();
        ScrollTrigger.create({
          start: 0,
          end: "max",
          onUpdate: (self) => {
            if (Math.abs(self.getVelocity()) > 2200) {
              if (!isFast) {
                isFast = true;
                setFast(true);
              }
              settle.restart(true);
            }
          },
        });
        return () => settle.kill();
      });
      return () => mm.revert();
    },
    { scope: hero },
  );

  const onFoxClick = () => {
    setCycle((c) => (c + 1) % CYCLE.length);
    const now = performance.now();
    clicks.current = [...clicks.current.filter((t) => now - t < 1400), now];
    if (clicks.current.length >= 5) {
      clicks.current = [];
      if (foxBtn.current) burstFrom(foxBtn.current, { count: 70, spread: Math.PI * 1.5, speed: [500, 1100] });
    }
  };

  return (
    <section
      id="top"
      ref={hero}
      data-nav="hero"
      aria-labelledby="hero-title"
      className="on-dark relative z-0 flex min-h-[100dvh] flex-col overflow-hidden bg-merlot text-coconut"
    >
      {/* Scene and the pixel mask over it */}
      <div className="absolute inset-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={asset("/img/felucca.png")}
          alt=""
          width={1901}
          height={828}
          fetchPriority="high"
          className="pixelated absolute inset-0 h-full w-full object-cover object-[50%_60%]"
        />
        <PixelReveal hostRef={hero} />
      </div>

      <div className="relative z-10 mx-auto grid w-full max-w-[1440px] flex-1 grid-cols-1 content-center gap-6 px-4 pb-10 pt-[calc(var(--nav-h)+16px)] sm:px-8 lg:grid-cols-12 lg:gap-8 lg:px-12 lg:pb-16 lg:pt-[calc(var(--nav-h)+24px)]">
        <div ref={copy} className="order-2 lg:order-1 lg:col-span-7">
          <div data-reveal-exclude data-intro className="w-fit">
            <Countdown ref={countdown} />
          </div>
          <h1
            id="hero-title"
            ref={h1}
            data-reveal-exclude
            data-intro
            className="mt-5 text-[clamp(3rem,7vw,6rem)] font-extrabold leading-[0.98] tracking-[-0.035em] text-coconut lg:mt-7"
          >
            <span data-line className="block">
              Find the thing.
            </span>
            <span data-line className="block text-yellow">
              Find your people.
            </span>
          </h1>
          <p
            ref={sub}
            data-reveal-exclude
            data-intro
            className="mt-5 max-w-[34rem] text-[1.0625rem] font-medium leading-relaxed text-coconut-78 sm:text-[1.1875rem] lg:mt-7"
          >
            Questita is a social quest app for Cairo. Someone posts a plan, you join in, the big city feels smaller.
          </p>
          <div className="mt-7 lg:mt-9">
            <Magnetic>
              <span ref={cta} data-intro className="inline-block">
                <a href="#how" className="btn btn-yellow roll-host">
                  <Roll>See how it works</Roll>
                  <Arrow />
                </a>
              </span>
            </Magnetic>
          </div>
        </div>

        <div ref={foxCol} data-intro className="order-1 flex justify-end lg:order-2 lg:col-span-5 lg:justify-center">
          <button
            ref={foxBtn}
            type="button"
            onClick={onFoxClick}
            aria-label="Poke the fox"
            className="w-[164px] cursor-pointer sm:w-[246px] md:w-[287px] lg:w-[451px] xl:w-[533px]"
          >
            <PixelFox frame={frame} trackEyes followHead />
          </button>
        </div>
      </div>

      <div ref={tape} data-intro className="relative z-10 pb-8 sm:pb-12">
        <Marquee />
      </div>
    </section>
  );
}
