"use client";

import { useState } from "react";
import { CREATORS, nameplate, NAMEPLATE_H, NAMEPLATE_W } from "@/lib/creators";
import type { FoxFrame } from "@/lib/fox";
import PixelFox from "../PixelFox";

const COLOURS = ["yellow", "bluepeach", "coconutmilk", "yellow", "bluepeach"] as const;

/**
 * The Party: the crew as character cards in a pixel window. Hover or focus
 * selects a card (yellow frame) and the fox reacts: wow for a co-founder,
 * a wink for everyone else.
 */
export default function Crew() {
  const [sel, setSel] = useState(0);
  const pick = CREATORS[sel];
  const fox: FoxFrame = pick.role ? "wow" : "wink";

  return (
    <section id="crew" aria-labelledby="crew-title" className="bg-coconut px-4 py-16 sm:px-8 lg:py-24">
      <div className="mx-auto max-w-[1100px]">
        <div className="q2-window px-frame px-corners" style={{ "--step": "6px" } as React.CSSProperties}>
          <div className="px-frame-in px-corners bg-coconut p-5 sm:p-8" style={{ "--step": "5px" } as React.CSSProperties}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-px t-px1 text-body">The party</p>
                <h2 id="crew-title" className="mt-2 text-[clamp(1.6rem,3.2vw,2.5rem)] font-extrabold leading-[1.06] tracking-[-0.03em] text-merlot">
                  The crew behind the quest.
                </h2>
              </div>
              <div className="w-[62px] shrink-0 sm:w-[82px]">
                <PixelFox frame={fox} />
              </div>
            </div>

            <ul className="q2crew-grid mt-6" aria-label="The crew">
              {CREATORS.map((c, i) => (
                <li key={c.stem} className={i < 2 ? "q2crew-lead" : undefined}>
                  <button
                    type="button"
                    aria-pressed={sel === i}
                    aria-label={c.role ? `${c.name}, ${c.role}` : c.name}
                    onPointerEnter={() => setSel(i)}
                    onFocus={() => setSel(i)}
                    onClick={() => setSel(i)}
                    className={`q2crew-card ${sel === i ? "is-selected" : ""}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={nameplate(c, COLOURS[i])}
                      alt=""
                      width={NAMEPLATE_W}
                      height={NAMEPLATE_H}
                      loading="lazy"
                      decoding="async"
                      className="pixelated block h-auto w-full"
                    />
                    {c.role && <span className="q2crew-tag font-px t-px1">Co-founder</span>}
                  </button>
                </li>
              ))}
            </ul>

            <p className="font-px t-px1 mt-5 text-merlot" aria-live="polite">
              <span className="text-body">Selected: </span>
              {pick.name}
              {pick.role ? `, ${pick.role}` : ""}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
