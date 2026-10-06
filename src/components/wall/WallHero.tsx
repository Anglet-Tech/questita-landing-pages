"use client";

import { useEffect, useRef, useState } from "react";
import { burstFrom } from "@/lib/burst";
import type { FoxFrame } from "@/lib/fox";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { useJoin } from "@/lib/useJoin";
import CalendarButton from "../CalendarButton";
import PixelFox from "../PixelFox";
import { Roll } from "../ui";
import Sticker from "./Sticker";
import TicketCountdown from "./TicketCountdown";

/** The hero collage: copy and the ticket on the left, a pile of stickers you can throw around. */
export default function WallHero() {
  const stage = useRef<HTMLDivElement>(null);
  const chip = useRef<HTMLDivElement>(null);
  const joinBtn = useRef<HTMLButtonElement>(null);
  const [fox, setFox] = useState<FoxFrame>("happy");
  const foxTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const [join, tagRef] = useJoin({
    spots: 3,
    day: "Fri",
    onJoin: () => {
      if (joinBtn.current) burstFrom(joinBtn.current, { count: 12, size: [6, 10], speed: [260, 560], duration: 800 });
      if (chip.current && !prefersReducedMotion()) {
        gsap.fromTo(chip.current, { scale: 1.3 }, { scale: 1, duration: 0.32, ease: "steps(4)" });
      }
    },
  });

  useEffect(() => () => clearTimeout(foxTimer.current), []);

  const grabFox = () => {
    clearTimeout(foxTimer.current);
    setFox("wow");
  };
  const dropFox = () => {
    setFox("wink");
    clearTimeout(foxTimer.current);
    foxTimer.current = setTimeout(() => setFox("happy"), 900);
  };

  // Intro: the ticket and the stickers are slapped onto the poster one by one.
  useGSAP(
    () => {
      const html = document.documentElement;
      if (prefersReducedMotion()) {
        html.classList.remove("intro");
        return;
      }
      const items = gsap.utils.toArray<HTMLElement>("[data-intro]", stage.current);
      const tl = gsap.timeline({ delay: 0.2, onStart: () => html.classList.remove("intro") });
      items.forEach((el, i) => {
        tl.fromTo(el, { autoAlpha: 0, scale: 1.45 }, { autoAlpha: 1, scale: 1, duration: 0.3, ease: "steps(4)" }, i * 0.14);
      });
    },
    { scope: stage },
  );

  const bounds = stage;

  return (
    <div ref={stage} className="relative min-h-[100svh]">
      <div className="mx-auto max-w-[1440px] px-4 pb-6 pt-[calc(var(--wl-nav)+26px)] sm:px-8 lg:px-12 lg:pb-16 lg:pt-[calc(var(--wl-nav)+8vh)]">
        <div className="lg:max-w-[54%] xl:max-w-[50%]">
          <h1 id="wl-h1" className="text-[clamp(2.6rem,5.9vw,5.2rem)] font-extrabold leading-[0.98] tracking-[-0.04em] text-coconut">
            Find the thing.
            <br />
            <span className="text-yellow">Find your people.</span>
          </h1>
          <p className="mt-5 max-w-[34rem] text-[1.0625rem] font-medium leading-relaxed text-coconut-78 sm:text-[1.1875rem] lg:mt-7">
            Questita is a social quest app for Cairo. Someone posts a plan, you join in, and the big city feels a little smaller.
          </p>
          <div data-intro="" className="mt-7 w-max max-w-full origin-left -rotate-[1.5deg] lg:mt-9">
            <TicketCountdown />
          </div>
          <p className="font-px t-px1 mt-3 tracking-[0.2em] text-coconut-78">Cairo first. Alexandria next.</p>
          <div className="mt-6 flex flex-wrap items-center gap-x-7 gap-y-4 lg:mt-8">
            <CalendarButton className="btn-yellow" />
            <a href="#how" className="roll-host border-b-2 border-yellow pb-0.5 text-[1rem] font-bold text-coconut">
              <Roll>See how it works</Roll>
            </a>
          </div>
        </div>

        {/* The pile. Below the copy on small screens, spread over the poster on desktop. */}
        <div className="pointer-events-none relative mt-9 h-[330px] sm:h-[360px] lg:absolute lg:inset-0 lg:mt-0 lg:h-auto">
          <Sticker
            bounds={bounds}
            topInset={64}
            rotate={-5}
            intro
            label="The fox"
            onGrab={grabFox}
            onDrop={dropFox}
            className="pointer-events-auto left-[1%] top-[2%] w-[150px] sm:w-[180px] lg:left-auto lg:right-[24%] lg:top-[15%] lg:w-[200px] xl:w-[290px]"
          >
            <div className="wl-diecut px-corners">
              <div className="bg-yellow px-corners p-[7%]" style={{ "--step": "4px" } as React.CSSProperties}>
                <PixelFox frame={fox} trackEyes label={fox === "wow" ? "The fox, surprised" : fox === "wink" ? "The fox, winking" : "The fox, smiling"} />
              </div>
            </div>
          </Sticker>

          <Sticker
            bounds={bounds}
            topInset={64}
            rotate={7}
            intro
            label="Who’s in? note"
            className="pointer-events-auto right-[5%] top-0 w-[118px] sm:w-[150px] lg:right-[8%] lg:top-[13%] lg:w-[176px]"
          >
            <div className="px-corners flex aspect-square items-center justify-center bg-yellow p-3" style={{ "--step": "4px" } as React.CSSProperties}>
              <p className="font-px t-px2 text-center leading-[1.25] text-merlot">Who’s in?</p>
            </div>
          </Sticker>

          <Sticker
            bounds={bounds}
            topInset={64}
            rotate={3}
            intro
            label="Quest ticket, Felucca at golden hour"
            className="pointer-events-auto left-[27%] top-[29%] w-[232px] sm:left-[34%] sm:w-[280px] lg:left-auto lg:right-[5%] lg:top-[46%] lg:w-[300px] xl:w-[330px]"
          >
            <article aria-labelledby="wl-hq-title" className="px-frame px-corners" style={{ "--step": "6px" } as React.CSSProperties}>
              <div className="px-frame-in px-corners flex flex-col gap-2.5 bg-coconut p-4 sm:gap-3 sm:p-5">
                <span className="font-px t-px1 w-max bg-blue px-2 py-0.5 tracking-[0.18em] text-merlot">Sunset ride</span>
                <h3 id="wl-hq-title" className="text-[1.2rem] font-extrabold leading-[1.1] tracking-[-0.02em] text-merlot sm:text-[1.45rem]">
                  Felucca at golden hour
                </h3>
                <p className="font-px t-px1 flex flex-wrap items-center gap-x-3 gap-y-1 tracking-[0.16em] text-body">
                  <span>Zamalek</span>
                  <span>Fri, 5:30 PM</span>
                  <span ref={tagRef as React.RefObject<HTMLSpanElement>} className="bg-yellow px-2 py-0.5 text-merlot">
                    {join.label}
                  </span>
                </p>
                <button
                  ref={joinBtn}
                  type="button"
                  onClick={join.toggle}
                  onPointerLeave={join.clearFresh}
                  onBlur={join.clearFresh}
                  aria-pressed={join.joined}
                  aria-label={join.joined ? "Leave Felucca at golden hour" : "Join Felucca at golden hour"}
                  data-joined={join.joined || undefined}
                  data-fresh={join.fresh || undefined}
                  className="join font-px t-px1 relative mt-1 h-10 w-full overflow-hidden bg-merlot text-coconut"
                  style={{ "--row": "40px" } as React.CSSProperties}
                >
                  <span className="join-stack block" aria-hidden="true">
                    <span>Join</span>
                    <span>Join</span>
                    <span>You’re in</span>
                    <span>Leave</span>
                  </span>
                </button>
                <p aria-live="polite" className="sr-only">
                  {join.status}
                </p>
              </div>
            </article>
          </Sticker>

          <Sticker
            bounds={bounds}
            topInset={64}
            rotate={-3}
            intro
            label="You’re in chip"
            className="pointer-events-auto bottom-[1%] left-0 lg:bottom-[9%] lg:left-auto lg:right-[27%]"
          >
            <div
              ref={chip}
              className={`px-corners flex items-center gap-3 px-4 py-3 text-[0.9375rem] font-bold text-merlot sm:text-[1rem] ${join.joined ? "bg-yellow" : "bg-blue"}`}
              style={{ "--step": "4px" } as React.CSSProperties}
            >
              <span className={`block h-3 w-3 ${join.joined ? "bg-merlot" : "bg-coconut"}`} aria-hidden="true" />
              You’re in. See you Friday.
            </div>
          </Sticker>
        </div>
      </div>
    </div>
  );
}
