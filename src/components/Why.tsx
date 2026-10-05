"use client";

import { useRef, useState } from "react";
import { gsap, SplitText, useGSAP, MQ } from "@/lib/gsap";
import { asset } from "@/lib/asset";
import type { FoxFrame } from "@/lib/fox";
import PixelFox from "./PixelFox";
import PixelSeam from "./PixelSeam";

/**
 * One statement, filled word by word as you scroll (pinned ~120vh on desktop).
 * The oops fox sweats through it and cheers up when the fill completes, while
 * the skyline rises and its windows switch on in four stepped jumps.
 */
export default function Why() {
  const section = useRef<HTMLElement>(null);
  const statement = useRef<HTMLParagraphElement>(null);
  const follow = useRef<HTMLParagraphElement>(null);
  const fox = useRef<HTMLDivElement>(null);
  const buildings = useRef<HTMLImageElement>(null);
  const windows = useRef<HTMLImageElement>(null);
  const [frame, setFrame] = useState<FoxFrame>("oops");

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      let happy = false;
      const setHappy = (on: boolean) => {
        if (on === happy) return;
        happy = on;
        setFrame(on ? "happy" : "oops");
        if (on) {
          gsap.fromTo(
            fox.current,
            { scaleY: 0.9 },
            { scaleY: 1, duration: 0.16, ease: "steps(2)", transformOrigin: "50% 100%" },
          );
        }
      };

      const build = (pin: boolean) => {
        const split = SplitText.create(statement.current!, { type: "words" });
        gsap.set(split.words, { opacity: 0.14 });
        gsap.set(follow.current, { autoAlpha: 0, y: 28 });
        gsap.set(buildings.current, { clipPath: "inset(100% 0% 0% 0%)" });
        gsap.set(windows.current, { opacity: 0 });

        const tl = gsap.timeline({
          scrollTrigger: pin
            ? { trigger: section.current, start: "top top", end: "+=120%", pin: true, scrub: 0.6, anticipatePin: 1 }
            : { trigger: section.current, start: "top 75%", end: "bottom 85%", scrub: 0.6 },
          onUpdate() {
            setHappy(this.progress() >= 0.62);
          },
        });
        tl.to(split.words, { opacity: 1, ease: "none", duration: 0.6, stagger: { amount: 0.55 } }, 0)
          .to(buildings.current, { clipPath: "inset(0% 0% 0% 0%)", ease: "none", duration: 0.5 }, 0.15)
          .to(follow.current, { autoAlpha: 1, y: 0, ease: "expo.out", duration: 0.18 }, 0.64)
          .to(windows.current, { opacity: 1, ease: "steps(3)", duration: 0.2 }, 0.72)
          .to({}, { duration: 0.08 });

        return () => split.revert();
      };

      mm.add(MQ.desktop, () => build(true));
      mm.add(MQ.mobile, () => build(false));
      mm.add(MQ.reduce, () => setHappy(true));
      return () => mm.revert();
    },
    { scope: section },
  );

  return (
    <section
      id="why"
      ref={section}
      data-nav="light"
      aria-label="Why Questita"
      className="relative z-[1] flex min-h-[100svh] flex-col bg-coconut text-merlot"
    >
      <PixelSeam from="merlot" to="coconut" />
      <div className="mx-auto w-full max-w-[1440px] flex-1 px-4 pt-[calc(var(--nav-h)+56px)] sm:px-8 lg:px-12 lg:pt-[calc(var(--nav-h)+5vh)]">
        <p className="font-px t-px1 text-body/80">Why</p>
        <div className="mt-6 grid gap-10 lg:grid-cols-12 lg:items-end lg:gap-8">
          <p
            ref={statement}
            className="max-w-[18ch] text-[clamp(2.4rem,5.6vw,5.2rem)] font-extrabold leading-[1.02] tracking-[-0.035em] text-merlot lg:col-span-9"
          >
            Cairo is big, and most good plans die at “we should do something.”
          </p>
          <div className="flex items-end gap-6 sm:items-center lg:col-span-3 lg:flex-col lg:items-start lg:gap-8">
            <div ref={fox} className="w-[123px] shrink-0 sm:w-[164px] xl:w-[205px]">
              <PixelFox frame={frame} label={frame === "oops" ? "The fox, sweating" : "The fox, relieved"} />
            </div>
            <p ref={follow} className="max-w-[22rem] text-[1.4rem] font-medium leading-snug text-body">
              So Questita makes it easier to find someone to do the thing with.
            </p>
          </div>
        </div>
      </div>
      <div className="relative mt-10 w-full lg:mt-6" style={{ aspectRatio: "1472 / 333" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={buildings}
          src={asset("/img/skyline-buildings.png")}
          alt=""
          width={1472}
          height={333}
          loading="lazy"
          decoding="async"
          className="pixelated absolute inset-0 h-full w-full"
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={windows}
          src={asset("/img/skyline-windows.png")}
          alt=""
          width={1472}
          height={333}
          loading="lazy"
          decoding="async"
          className="pixelated absolute inset-0 h-full w-full"
        />
      </div>
    </section>
  );
}
