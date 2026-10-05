"use client";

import { downloadLaunchIcs } from "@/lib/ics";
import { Arrow, Roll } from "./ui";

/** The consumer CTA. Same label everywhere it appears. */
export default function CalendarButton({ className = "btn-merlot" }: { className?: string }) {
  return (
    <button type="button" onClick={downloadLaunchIcs} className={`btn roll-host ${className}`}>
      <Roll>Add to calendar</Roll>
      <Arrow />
    </button>
  );
}
