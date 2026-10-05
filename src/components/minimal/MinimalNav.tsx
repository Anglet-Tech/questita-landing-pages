"use client";

import { useRef, useState } from "react";
import { LAUNCH_ISO } from "@/config";
import { asset } from "@/lib/asset";
import { countdownLabel, useCountdown } from "@/lib/countdown";
import { ScrollTrigger, useGSAP } from "@/lib/gsap";
import { openContact } from "@/lib/store";
import { Roll } from "../ui";

/** 64px, transparent until scrolled, then coconut with a hairline. */
export default function MinimalNav() {
  const nav = useRef<HTMLElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const c = useCountdown(LAUNCH_ISO);

  useGSAP(
    () => {
      ScrollTrigger.create({ start: 8, end: "max", onToggle: (self) => setScrolled(self.isActive) });
    },
    { scope: nav },
  );

  return (
    <header>
      <nav
        ref={nav}
        aria-label="Primary"
        data-scrolled={scrolled || undefined}
        className="min-nav fixed inset-x-0 top-0 z-50 h-16 text-merlot"
      >
        <div className="mx-auto flex h-full max-w-[1100px] items-center justify-between gap-4 px-4 sm:px-8">
          <a href="#top" className="block w-[104px] shrink-0" aria-label="Questita, back to top">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={asset("/fox/Questita_wordmark_merlot.svg")} alt="" width={1148} height={189} className="h-auto w-full" />
          </a>
          <div className="flex items-center gap-5 sm:gap-8">
            <button type="button" onClick={openContact} className="roll-host text-[0.9375rem] font-semibold">
              <Roll>Get in touch</Roll>
            </button>
            <a href="#top" className="font-px t-px1 tabular tracking-[0.1em]" aria-label={countdownLabel(c)}>
              {c.launched ? (
                "The board is open"
              ) : (
                <>
                  {c.ready ? `${c.days}D` : "--D"} {c.hh}:{c.mm}
                  <span className="hidden sm:inline">:{c.ss}</span>
                </>
              )}
            </a>
          </div>
        </div>
      </nav>
    </header>
  );
}
