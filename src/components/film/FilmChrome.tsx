"use client";

import { Fragment, useRef } from "react";
import { LAUNCH_ISO } from "@/config";
import { asset } from "@/lib/asset";
import { countdownLabel, useCountdown } from "@/lib/countdown";
import { gsap, prefersReducedMotion, ScrollTrigger, useIdleGSAP } from "@/lib/gsap";
import { openContact, scrollToTarget } from "@/lib/store";
import PixelDigit, { PixelColon } from "@/components/PixelDigit";
import { Roll } from "@/components/ui";
import { CHAPTERS } from "./content";

/**
 * The fixed top bar: wordmark, a film slate with the current chapter, and the
 * partners CTA. Its colours follow the chapter underneath through the
 * data-top attribute on the .film root (see watchChapter).
 */
export function FilmBar() {
  return (
    <header className="film-bar pointer-events-none fixed inset-x-0 top-0 z-[60]">
      <div className="mx-auto flex h-[64px] max-w-[1600px] items-center justify-between gap-4 px-4 sm:h-[72px] sm:px-8 lg:px-12">
        <a href="#top" className="pointer-events-auto relative block h-[22px] w-[124px] sm:h-[26px] sm:w-[146px]" aria-label="Questita, back to the start">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={asset("/fox/Questita_wordmark_coconutmilk.svg")} alt="" className="film-mark-light absolute inset-0 h-full w-full" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={asset("/fox/Questita_wordmark_merlot.svg")} alt="" className="film-mark-dark absolute inset-0 h-full w-full" />
        </a>
        <p className="film-slate font-px t-px1 hidden items-center gap-3 md:flex" aria-hidden="true">
          <span className="film-rec" />
          <span>
            Ch <span data-slate-n>01</span>/{String(CHAPTERS.length).padStart(2, "0")}
          </span>
          <span data-slate>{CHAPTERS[0]}</span>
        </p>
        <button type="button" onClick={openContact} className="film-cta btn btn-sm roll-host pointer-events-auto">
          <Roll>Get in touch</Roll>
        </button>
      </div>
    </header>
  );
}

/**
 * Persistent bottom-right timecode: BOARD OPENS 55:10:49:34 in re-forming
 * pixel digits. Hidden on the hero (where the countdown is the hero) and on
 * the closing frame (where it is again). Clicking it scrolls to the close.
 */
export function Timecode() {
  const c = useCountdown(LAUNCH_ISO);
  const wrap = useRef<HTMLDivElement>(null);
  const pairs = [c.dd, c.hh, c.mm, c.ss];

  useIdleGSAP(
    () => {
      const el = wrap.current!;
      const what = document.getElementById("what");
      const launch = document.getElementById("launch");
      if (!what || !launch) return;
      let shown = false;
      const show = (on: boolean) => {
        if (on === shown) return;
        shown = on;
        el.toggleAttribute("data-on", on);
        // Stepped wipe up, never a fade.
        gsap.fromTo(
          el,
          { clipPath: on ? "inset(100% 0 0 0)" : "inset(0% 0 0 0)" },
          { clipPath: on ? "inset(0% 0 0 0)" : "inset(100% 0 0 0)", duration: prefersReducedMotion() ? 0 : 0.32, ease: "steps(5)", overwrite: true },
        );
      };
      gsap.set(el, { clipPath: "inset(100% 0 0 0)" });
      const st = ScrollTrigger.create({
        trigger: what,
        start: "top 65%",
        endTrigger: launch,
        end: "top 65%",
        onToggle: (self) => show(self.isActive),
      });
      return () => st.kill();
    },
    { scope: wrap },
  );

  if (c.launched) return null;

  return (
    <div ref={wrap} className="timecode fixed bottom-3 right-3 z-[60] sm:bottom-5 sm:right-5" style={{ clipPath: "inset(100% 0 0 0)" }}>
      <button
        type="button"
        onClick={() => scrollToTarget("#launch")}
        aria-label={`${countdownLabel(c)} Go to the launch countdown.`}
        className="timecode-btn px-corners flex items-center gap-3 px-3 py-2.5 sm:gap-4 sm:px-4 sm:py-3"
      >
        <span className="flex items-center gap-2" aria-hidden="true">
          <span className="film-rec" />
          <span className="font-px t-px1 tracking-[0.18em]">Board opens</span>
        </span>
        <span className="tc-row flex items-center" aria-hidden="true">
          {pairs.map((v, i) => (
            <Fragment key={i}>
              {i > 0 && (
                <span className="tc-colon">
                  <PixelColon on={!c.ready || c.seconds % 2 === 0} />
                </span>
              )}
              <span className="tc-pair flex">
                {v.split("").map((ch, j) => (
                  <PixelDigit key={j} char={ch} />
                ))}
              </span>
            </Fragment>
          ))}
        </span>
      </button>
    </div>
  );
}
