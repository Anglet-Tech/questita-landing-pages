"use client";

import { Fragment, forwardRef } from "react";
import { LAUNCH_ISO } from "@/config";
import { countdownLabel, useCountdown } from "@/lib/countdown";
import PixelDigit, { PixelColon } from "@/components/PixelDigit";

/**
 * The film's big DD:HH:MM:SS in PixelDigit. Pixel size comes from the CSS var
 * --dp set by the caller. Unit labels sit above the digits so the fox can
 * stand in front of their lower edge. Below 640px it wraps to two rows.
 */
const FilmCountdown = forwardRef<HTMLDivElement, { className?: string }>(function FilmCountdown({ className = "" }, ref) {
  const c = useCountdown(LAUNCH_ISO);
  const pairs = [
    { v: c.dd, l: "Days" },
    { v: c.hh, l: "Hours" },
    { v: c.mm, l: "Minutes" },
    { v: c.ss, l: "Seconds" },
  ];

  if (c.launched) {
    return (
      <div ref={ref} role="timer" aria-label={countdownLabel(c)} className={`fc ${className}`}>
        <p className="fc-open font-px">The board is open</p>
      </div>
    );
  }

  return (
    <div ref={ref} role="timer" aria-label={countdownLabel(c)} className={`fc ${className}`}>
      <div className="fc-row" aria-hidden="true">
        {pairs.map((p, i) => (
          <Fragment key={p.l}>
            {i > 0 && (
              <div className={`fc-colon ${i === 2 ? "fc-colon-mid" : ""}`}>
                <PixelColon on={!c.ready || c.seconds % 2 === 0} />
              </div>
            )}
            <div className="fc-pair">
              <span className="fc-label font-px">{p.l}</span>
              <div className="fc-digits">
                {p.v.split("").map((ch, j) => (
                  <PixelDigit key={j} char={ch} />
                ))}
              </div>
            </div>
          </Fragment>
        ))}
      </div>
    </div>
  );
});

export default FilmCountdown;
