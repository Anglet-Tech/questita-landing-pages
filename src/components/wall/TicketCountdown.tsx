"use client";

import { LAUNCH_ISO } from "@/config";
import { countdownLabel, useCountdown } from "@/lib/countdown";
import PixelDigit, { PixelColon } from "../PixelDigit";

// The stub's right edge, torn in pixel steps (offsets in px from the edge).
const TEAR = [0, 6, 2, 8, 0, 4, 8, 2, 6, 0, 4, 8];
const tornClip = (() => {
  const n = TEAR.length;
  const pts = ["0 0"];
  TEAR.forEach((o, k) => {
    pts.push(`calc(100% - ${o}px) ${((k / n) * 100).toFixed(2)}%`);
    pts.push(`calc(100% - ${o}px) ${(((k + 1) / n) * 100).toFixed(2)}%`);
  });
  pts.push("0 100%");
  return `polygon(${pts.join(", ")})`;
})();

const TILE = ["bg-merlot text-coconut", "bg-yellow text-merlot", "bg-yellow text-merlot", "bg-blue text-merlot"];

/** The countdown as a torn coconut ticket stuck on the hero poster. */
export default function TicketCountdown({ className = "" }: { className?: string }) {
  const c = useCountdown(LAUNCH_ISO);
  const units = [
    { v: c.dd, l: "Days" },
    { v: c.hh, l: "Hrs" },
    { v: c.mm, l: "Min" },
    { v: c.ss, l: "Sec" },
  ];

  return (
    <div className={`wl-ticket ${className}`} role="timer" aria-label={countdownLabel(c)}>
      <div className="wl-ticket-main px-corners px-3 pb-3 pt-2.5 sm:px-4 sm:pb-4 sm:pt-3">
        <p className="font-px t-px1 mb-2 tracking-[0.2em] text-merlot" aria-hidden="true">
          {c.launched ? "The board is open" : "The quest board opens in"}
        </p>
        {!c.launched && (
          <div className="flex items-start gap-1.5 sm:gap-2" aria-hidden="true">
            {units.map((u, i) => (
              <div key={u.l} className="contents">
                {i > 0 && (
                  <div className="wl-digits pt-[6px] text-merlot sm:pt-[10px]">
                    <PixelColon on={!c.ready || c.seconds % 2 === 0} />
                  </div>
                )}
                <div className="flex flex-col items-center">
                  <div className={`wl-tile px-corners wl-digits flex gap-[3px] sm:gap-[5px] ${TILE[i]}`}>
                    {u.v.split("").map((ch, j) => (
                      <PixelDigit key={j} char={ch} />
                    ))}
                  </div>
                  <span className="font-px t-px1 mt-1.5 tracking-[0.2em] text-merlot">{u.l}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="wl-ticket-perf" aria-hidden="true" />
      <div className="wl-ticket-stub flex flex-col items-center justify-center px-3 pr-4 sm:px-4 sm:pr-5" style={{ clipPath: tornClip }} aria-hidden="true">
        <span className="font-px t-px2 leading-none text-merlot sm:t-px3">30</span>
        <span className="font-px t-px1 mt-1 tracking-[0.2em] text-merlot">Nov</span>
      </div>
    </div>
  );
}
