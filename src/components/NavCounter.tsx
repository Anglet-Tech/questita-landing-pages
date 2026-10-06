"use client";

import { LAUNCH_ISO } from "@/config";
import { countdownLabel, useCountdown } from "@/lib/countdown";
import { scrollToTarget } from "@/lib/store";

/** The nav pill: 55D 10:49:34 (55D 10:49 on mobile). Click scrolls to Launch. */
export default function NavCounter({ visible }: { visible: boolean }) {
  const c = useCountdown(LAUNCH_ISO);
  const days = c.ready ? `${c.days}D` : "--D";
  return (
    <button
      type="button"
      onClick={() => scrollToTarget("#launch")}
      aria-label={`${countdownLabel(c)} Go to the launch countdown.`}
      tabIndex={visible ? 0 : -1}
      aria-hidden={visible ? undefined : true}
      data-visible={visible || undefined}
      className="nav-pill btn btn-yellow btn-sm font-px tabular !min-h-[36px] !px-3 !py-1.5 text-merlot"
    >
      {c.launched ? (
        <span className="t-px1 tracking-[0.1em]">The board is open</span>
      ) : (
        <span className="t-px1 tracking-[0.1em]">
          {days} {c.hh}:{c.mm}
          <span className="hidden min-[1180px]:inline">:{c.ss}</span>
        </span>
      )}
    </button>
  );
}
