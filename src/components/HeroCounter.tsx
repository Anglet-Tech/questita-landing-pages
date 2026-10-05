"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { LAUNCH_ISO } from "@/config";
import { countdownLabel, useCountdown } from "@/lib/countdown";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import PixelDigit, { PixelColon } from "./PixelDigit";

/**
 * The hero counter: four stepped-corner tiles (DAYS in yellow for emphasis),
 * PixelDigit numerals that re-form, colons that blink with the seconds and a
 * one-frame hop on the SEC tile every tick.
 */
const HeroCounter = forwardRef<HTMLDivElement>(function HeroCounter(_p, ref) {
  const root = useRef<HTMLDivElement>(null);
  const secTile = useRef<HTMLDivElement>(null);
  useImperativeHandle(ref, () => root.current as HTMLDivElement, []);
  const c = useCountdown(LAUNCH_ISO);

  // One frame, 2px, on every tick.
  useEffect(() => {
    if (!c.ready || c.launched || prefersReducedMotion() || !secTile.current) return;
    const tl = gsap.timeline().set(secTile.current, { y: -2 }).set(secTile.current, { y: 0 }, 0.08);
    return () => {
      tl.kill();
    };
  }, [c.ss, c.ready, c.launched]);

  const tiles = [
    { label: "Days", value: c.dd, cls: "bg-yellow text-merlot" },
    { label: "Hrs", value: c.hh, cls: "bg-merlot-700 text-yellow" },
    { label: "Min", value: c.mm, cls: "bg-merlot-700 text-yellow" },
    { label: "Sec", value: c.ss, cls: "bg-merlot-700 text-yellow", sec: true },
  ];
  const colonOn = !c.ready || c.seconds % 2 === 0;

  return (
    <div ref={root} role="timer" aria-label={countdownLabel(c)} className="hero-counter">
      {!c.launched && (
        <p className="font-px t-px1 text-coconut-78" aria-hidden="true">
          The board opens in
        </p>
      )}
      {c.launched ? (
        <p className="font-px t-px3 text-yellow" aria-hidden="true">
          The board is open
        </p>
      ) : (
        <div className="mt-3 flex items-stretch gap-[var(--hc-gap)]" aria-hidden="true">
          {tiles.map((t, i) => (
            <div key={t.label} className="flex items-stretch gap-[var(--hc-gap)]">
              {i > 0 && (
                <div className="flex items-center text-coconut text-[length:var(--hc-dh)]">
                  <PixelColon on={colonOn} />
                </div>
              )}
              <div ref={t.sec ? secTile : undefined} data-tile className={`px-corners flex flex-col items-center px-[var(--hc-pad)] pb-2 pt-[var(--hc-pad)] ${t.cls}`} style={{ "--step": "4px" } as React.CSSProperties}>
                <div className="flex gap-[var(--hc-dp)] text-[length:var(--hc-dh)]">
                  {t.value.split("").map((ch, j) => (
                    <PixelDigit key={j} char={ch} />
                  ))}
                </div>
                <span className="font-px t-px1 mt-2 leading-none tracking-[0.2em]">{t.label}</span>
              </div>
            </div>
          ))}
        </div>
      )}
      <p className="font-px t-px1 mt-3 text-coconut-78" aria-hidden="true">
        30.11.2026 · Cairo
      </p>
    </div>
  );
});

export default HeroCounter;
