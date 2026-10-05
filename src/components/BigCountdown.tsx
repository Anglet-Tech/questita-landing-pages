"use client";

import { forwardRef, useImperativeHandle, useRef } from "react";
import { LAUNCH_ISO } from "@/config";
import { countdownLabel, useCountdown } from "@/lib/countdown";
import PixelDigit, { PixelColon } from "./PixelDigit";

/**
 * A full-width DD : HH : MM : SS in PixelDigit, with pixel-font unit labels.
 * The digit pixel size comes from the CSS variable --bc-dp, so one component
 * serves the Launch section and the minimal hero. `slot` renders inside the
 * last pair (the seconds), positioned by the caller, for the fox.
 */
const BigCountdown = forwardRef<
  HTMLDivElement,
  { className?: string; slot?: React.ReactNode; hop?: boolean; openText?: string; pixels?: boolean }
>(function BigCountdown({ className = "", slot, hop = false, openText = "The board is open", pixels = false }, ref) {
  const root = useRef<HTMLDivElement>(null);
  useImperativeHandle(ref, () => root.current as HTMLDivElement, []);
  const c = useCountdown(LAUNCH_ISO);
  const pairs = [
    { v: c.dd, l: "Days", s: "Days" },
    { v: c.hh, l: "Hours", s: "Hrs" },
    { v: c.mm, l: "Minutes", s: "Min" },
    { v: c.ss, l: "Seconds", s: "Sec" },
  ];

  if (c.launched) {
    return (
      <div ref={root} role="timer" aria-label={countdownLabel(c)} className={`big-countdown ${className}`}>
        <p className="font-px big-open leading-none">{openText}</p>
      </div>
    );
  }

  return (
    <div ref={root} role="timer" aria-label={countdownLabel(c)} className={`big-countdown ${className}`}>
      <div className="flex items-start justify-between" aria-hidden="true">
        {pairs.map((p, i) => (
          <div key={p.l} className="contents">
            {i > 0 && (
              <div className="px-[calc(var(--bc-dp)*0.8)] text-[length:var(--bc-dh)]">
                <PixelColon on={!c.ready || c.seconds % 2 === 0} />
              </div>
            )}
            <div className="relative flex flex-col items-center">
              <div className="flex gap-[var(--bc-dp)] text-[length:var(--bc-dh)]">
                {p.v.split("").map((ch, j) => (
                  <span key={j} className={hop ? "digit-hop" : undefined}>
                    <PixelDigit char={ch} pixels={pixels} />
                  </span>
                ))}
              </div>
              <span className="font-px t-px1 mt-3 tracking-[0.2em]">
                <span className="sm:hidden">{p.s}</span>
                <span className="hidden sm:inline">{p.l}</span>
              </span>
              {i === pairs.length - 1 && slot}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

export default BigCountdown;
