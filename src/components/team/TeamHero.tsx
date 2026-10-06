"use client";

import { memo, useEffect, useRef, useState } from "react";
import { LAUNCH_ISO } from "@/config";
import { countdownLabel, useCountdownValue, type Countdown } from "@/lib/countdown";
import { gsap, useGSAP, SplitText, hasFinePointer, prefersReducedMotion } from "@/lib/gsap";
import type { FoxFrame } from "@/lib/fox";
import CalendarButton from "../CalendarButton";
import PixelDigit, { PixelColon } from "../PixelDigit";
import PixelFox from "../PixelFox";
import { Magnetic, Roll } from "../ui";
import TeamQuest from "./TeamQuest";

const TAPE = ["Coffee run", "Sunset ride", "First-time class", "Board game night", "Study sprint", "Felucca at golden hour", "Who’s in?", "Plans are better with witnesses"];

type Pick = (c: Countdown) => string;
const TILES: { label: string; pick: Pick; cls: string }[] = [
  { label: "Days", pick: (c) => c.dd, cls: "bg-yellow text-merlot" },
  { label: "Hrs", pick: (c) => c.hh, cls: "bg-coconut text-merlot" },
  { label: "Min", pick: (c) => c.mm, cls: "bg-coconut text-merlot" },
  { label: "Sec", pick: (c) => c.ss, cls: "bg-blue text-merlot" },
];

/** One tile re-renders only when its own value changes. */
const Tile = memo(function Tile({ label, pick, cls }: { label: string; pick: Pick; cls: string }) {
  const value = useCountdownValue(LAUNCH_ISO, pick);
  return (
    <div data-tile className={`tm-tile px-corners flex flex-col items-center ${cls}`}>
      <div className="tm-tile-digits">
        {value.split("").map((ch, i) => (
          <PixelDigit key={i} char={ch} />
        ))}
      </div>
      <span className="tm-tile-label font-px">{label}</span>
    </div>
  );
});

const Colon = memo(function Colon() {
  const on = useCountdownValue(LAUNCH_ISO, (c) => !c.ready || c.seconds % 2 === 0);
  return (
    <div className="flex items-center self-start pt-[var(--pad)] text-blue" style={{ fontSize: "calc(var(--dp) * 7)" }}>
      <PixelColon on={on} />
    </div>
  );
});

function TeamCounter() {
  const label = useCountdownValue(LAUNCH_ISO, countdownLabel);
  const launched = useCountdownValue(LAUNCH_ISO, (c) => c.launched);
  return (
    <div role="timer" aria-label={label} className="tm-counter">
      {launched ? (
        <p className="font-px t-px3 text-yellow">We’re live.</p>
      ) : (
        <>
          <p className="font-px t-px1 text-blue" aria-hidden="true">
            The quest board opens in
          </p>
          <div className="mt-3 flex items-start gap-[var(--gap)]" aria-hidden="true">
            {TILES.map((t, i) => (
              <div key={t.label} className="flex items-start gap-[var(--gap)]">
                {i > 0 && <Colon />}
                <Tile {...t} />
              </div>
            ))}
          </div>
        </>
      )}
      <p className="mt-3 text-[0.875rem] font-semibold text-blue">Cairo first. Alexandria next.</p>
    </div>
  );
}

/**
 * Hero: the team's split layout. Copy and countdown left, the collage right
 * (a strip under the countdown on small screens), the yellow tape at the foot.
 */
export default function TeamHero() {
  const section = useRef<HTMLElement>(null);
  const h1 = useRef<HTMLHeadingElement>(null);
  const tape = useRef<HTMLDivElement>(null);
  const [fox, setFox] = useState<FoxFrame>("happy");

  // Intro choreography, then pointer parallax on the collage.
  useGSAP(
    () => {
      const root = section.current!;
      const html = document.documentElement;
      if (prefersReducedMotion()) {
        html.classList.remove("intro");
        return;
      }
      const split = SplitText.create(h1.current!, { type: "lines", mask: "lines", linesClass: "split-mask" });
      const q = gsap.utils.selector(root);
      const tl = gsap.timeline({ defaults: { ease: "expo.out" }, onComplete: () => split.revert() });
      tl.from(split.lines, { yPercent: 110, duration: 1, stagger: 0.1 }, 0.1)
        .from(q("[data-rise]"), { y: 18, autoAlpha: 0, duration: 0.8, stagger: 0.08 }, 0.35)
        .from(q("[data-tile]"), { scale: 0.6, autoAlpha: 0, duration: 0.24, ease: "steps(3)", stagger: 0.07 }, 0.5)
        .from(q("[data-float]"), { y: 70, autoAlpha: 0, rotation: (i) => (i % 2 ? 6 : -6), duration: 1.1, stagger: 0.09 }, 0.3)
        .from(tape.current, { xPercent: 100, duration: 1.1 }, 0.55);
      html.classList.remove("intro");

      const desktop = window.matchMedia("(min-width: 1024px)").matches;
      if (!desktop || !hasFinePointer()) return;
      const pieces = q("[data-depth]").map((el) => {
        const d = Number(el.getAttribute("data-depth"));
        return {
          d,
          x: gsap.quickTo(el, "x", { duration: 0.9, ease: "power3.out" }),
          y: gsap.quickTo(el, "y", { duration: 0.9, ease: "power3.out" }),
        };
      });
      let r = root.getBoundingClientRect();
      const onEnter = () => (r = root.getBoundingClientRect());
      const onMove = (e: PointerEvent) => {
        const nx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
        const ny = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
        pieces.forEach((p) => {
          p.x(nx * p.d * 14);
          p.y(ny * p.d * 10);
        });
      };
      const onLeave = () => pieces.forEach((p) => (p.x(0), p.y(0)));
      root.addEventListener("pointerenter", onEnter);
      root.addEventListener("pointermove", onMove);
      root.addEventListener("pointerleave", onLeave);
      return () => {
        root.removeEventListener("pointerenter", onEnter);
        root.removeEventListener("pointermove", onMove);
        root.removeEventListener("pointerleave", onLeave);
        split.revert();
      };
    },
    { scope: section },
  );

  // The tape only runs while the hero is on screen.
  useEffect(() => {
    const el = tape.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) el.removeAttribute("data-paused");
      else el.setAttribute("data-paused", "");
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section id="top" ref={section} data-pin aria-labelledby="tm-h1" className="tm-sec tm-hero tm-full on-dark text-coconut">
      <div className="tm-inner flex flex-1 flex-col">
        <div className="tm-wrap flex flex-1 flex-col justify-center pb-6 pt-6 lg:py-10">
          <div className="tm-hero-grid">
            <div className="tm-hero-copy">
              <h1 id="tm-h1" ref={h1} data-tm-intro className="tm-h1 text-[clamp(2.125rem,min(5.4vw,8.6vh),4.75rem)]">
                Find the thing.
                <br />
                <span className="text-yellow">Find your people.</span>
              </h1>
              <p data-rise data-tm-intro className="mt-4 max-w-[33rem] text-[1rem] font-medium leading-relaxed sm:text-[1.1875rem] lg:mt-6">
                Questita is a social quest app for Cairo. Someone posts a plan, you join in, and the big city feels a little smaller.
              </p>
              <div data-rise data-tm-intro className="mt-5 lg:mt-8">
                <TeamCounter />
              </div>
            </div>

            <div className="tm-hero-art">
              <div className="tm-collage" aria-label="A sample quest on the board">
                <div className="tm-piece tm-p-fox left-4 top-9 w-[120px] lg:w-[min(340px,86%,42vh)]" data-depth="0.6">
                  <div data-float data-tm-intro style={{ rotate: "-4deg" }}>
                    <div className="tm-foxcard px-corners" onPointerEnter={() => setFox("wink")} onPointerLeave={() => setFox("happy")}>
                      <PixelFox frame={fox} trackEyes followHead label="The Questita fox, smiling" />
                    </div>
                  </div>
                </div>
                <div className="tm-piece tm-p-note right-0 top-0 z-[3]" data-depth="1.4">
                  <div data-float data-tm-intro className="tm-pshadow" style={{ rotate: "4deg" }}>
                    <p className="tm-note px-corners font-px t-px1 whitespace-nowrap sm:t-px2 lg:t-px3">Who’s in?</p>
                  </div>
                </div>
                <div className="tm-piece tm-p-quest -left-2.5 bottom-5 z-[2] w-[236px] lg:w-[min(280px,82%)]" data-depth="1">
                  <div data-float data-tm-intro style={{ rotate: "3deg" }}>
                    <TeamQuest tag="Sunset ride" tagBg="blue" title="Felucca at golden hour" area="Zamalek" when="Fri, 5:30 PM" day="Fri" spots={3} join compact />
                  </div>
                </div>
                <div className="tm-piece tm-p-chip bottom-[84px] right-1.5 z-[2]" data-depth="1.8">
                  <div data-float data-tm-intro style={{ rotate: "-3deg" }}>
                    <p className="tm-chip px-corners">
                      <span className="tm-chip-dot" aria-hidden="true" />
                      You’re in. See you Friday.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="tm-hero-cta flex flex-wrap items-center gap-x-6 gap-y-3" data-rise data-tm-intro>
              <Magnetic>
                <CalendarButton className="btn-yellow" />
              </Magnetic>
              <a href="#how" className="roll-host border-b-2 border-coconut pb-0.5 font-bold text-coconut">
                <Roll>See how it works</Roll>
              </a>
            </div>
          </div>
        </div>

        <div ref={tape} className="tm-tape" aria-hidden="true" data-tm-intro>
          <div className="tm-tape-track font-px t-px2">
            {[0, 1].map((k) =>
              TAPE.map((t) => (
                <span key={`${k}-${t}`} className="contents">
                  <span>{t}</span>
                  <i />
                </span>
              )),
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
