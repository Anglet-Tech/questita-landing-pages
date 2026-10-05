"use client";

import { useEffect, useRef, useState } from "react";
import { asset } from "@/lib/asset";
import { burstFrom } from "@/lib/burst";
import { useJoin, type Day } from "@/lib/useJoin";
import type { FoxFrame } from "@/lib/fox";
import PixelFox from "./PixelFox";

export type Scene = "felucca" | "wink" | "stairs" | "street" | "skyline";

export interface Quest {
  id: string;
  kind: string;
  title: string;
  area: string;
  day: Day;
  time: string;
  spots: number;
  scene: Scene;
  rotate: number;
  full?: boolean;
}

export function SceneArt({ scene }: { scene: Scene }) {
  const img = (src: string, cls = "") => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={asset(src)} alt="" loading="lazy" decoding="async" className={`pixelated absolute ${cls}`} />
  );
  switch (scene) {
    case "felucca":
      return <div className="absolute inset-0 bg-blue">{img("/img/felucca.png", "inset-0 h-full w-full object-cover")}</div>;
    case "wink":
      return (
        <div className="absolute inset-0 grid place-items-center bg-blue">
          <div className="w-[123px]">
            <PixelFox frame="wink" />
          </div>
        </div>
      );
    case "stairs":
      return (
        <div className="absolute inset-0 bg-yellow">
          {img("/img/stairs.png", "inset-x-0 bottom-0 w-full h-auto")}
          <div className="absolute right-[10%] top-[10%] w-[62px]">
            <PixelFox frame="happy" />
          </div>
        </div>
      );
    case "street":
      return (
        <div className="absolute inset-0 bg-merlot">
          {img("/img/street-base.png", "inset-x-0 bottom-0 w-full h-auto")}
          {img("/img/street-lights.png", "inset-x-0 bottom-0 w-full h-auto")}
        </div>
      );
    case "skyline":
      return (
        <div className="absolute inset-0 bg-coconut">
          {img("/img/skyline-buildings.png", "inset-x-0 bottom-0 w-full h-auto")}
          {img("/img/skyline-windows.png", "inset-x-0 bottom-0 w-full h-auto")}
        </div>
      );
  }
}

/** A quest card in the board poster's style, with a real join and leave state. */
export default function QuestCard({ quest }: { quest: Quest }) {
  const [fox, setFox] = useState<FoxFrame>("happy");
  const button = useRef<HTMLButtonElement>(null);
  const foxTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const dark = !!quest.full;
  const [join, tagRef] = useJoin({
    spots: quest.spots,
    full: quest.full,
    day: quest.day,
    onJoin: () => {
      setFox("wow");
      clearTimeout(foxTimer.current);
      foxTimer.current = setTimeout(() => setFox("happy"), 600);
      if (button.current) burstFrom(button.current, { count: 10, size: [6, 10], speed: [260, 520], duration: 800 });
    },
  });
  const { joined, isFull, status } = join;

  useEffect(() => () => clearTimeout(foxTimer.current), []);

  const fg = dark ? "text-coconut" : "text-merlot";
  const muted = dark ? "text-coconut-78" : "text-body";

  return (
    <article
      className="qcard group/card w-[min(84vw,400px)] shrink-0 snap-center"
      style={{ "--rot": `${quest.rotate}deg` } as React.CSSProperties}
      aria-labelledby={`${quest.id}-title`}
    >
      <div className="qcard-lift">
        <div className="px-frame px-corners" style={{ "--step": "6px", "--frame": dark ? "var(--merlot-700)" : "var(--merlot)" } as React.CSSProperties}>
          <div className={`px-frame-in px-corners flex flex-col gap-5 p-6 sm:p-7 ${dark ? "on-dark bg-merlot" : "bg-coconut"}`}>
            {/* Host */}
            <div className="flex items-center gap-4">
              <div className="w-[62px] shrink-0">
                <PixelFox frame={fox} />
              </div>
              <div className={`font-px t-px1 leading-[1.7] ${muted}`}>
                <p>Host</p>
                <p>A friend of a friend</p>
              </div>
            </div>

            {/* Scene */}
            <div className="relative w-full overflow-hidden" style={{ aspectRatio: "16 / 7" }}>
              <SceneArt scene={quest.scene} />
            </div>

            <div>
              <h3 id={`${quest.id}-title`} className={`text-[2.15rem] font-extrabold leading-[1.05] tracking-[-0.03em] ${fg}`}>
                {quest.kind}
              </h3>
              <p className={`mt-1.5 text-[1.0625rem] font-medium ${muted}`}>{quest.title}</p>
            </div>

            <div className={`font-px t-px1 flex flex-wrap items-center gap-x-4 gap-y-2 ${muted}`}>
              <span>{quest.area}</span>
              <span>
                {quest.day}, {quest.time}
              </span>
              <span ref={tagRef as React.RefObject<HTMLSpanElement>} className="bg-yellow px-3 py-1 text-merlot">
                {join.label}
              </span>
            </div>

            <div className="flex items-center gap-5">
              <button
                ref={button}
                type="button"
                onClick={join.toggle}
                onPointerLeave={join.clearFresh}
                onBlur={join.clearFresh}
                disabled={isFull}
                aria-pressed={quest.full ? undefined : joined}
                aria-label={quest.full ? "Full" : joined ? `Leave ${quest.kind}` : `Join ${quest.kind}`}
                data-joined={joined || undefined}
                data-fresh={join.fresh || undefined}
                className={`join font-px t-px1 relative h-12 min-w-[148px] overflow-hidden px-6 ${
                  dark ? "bg-merlot-700 text-coconut-78" : "bg-merlot text-coconut"
                }`}
              >
                {isFull ? (
                  <span className="block leading-[48px]">Full</span>
                ) : (
                  <span className="join-stack block" aria-hidden="true">
                    <span>Join</span>
                    <span>Join</span>
                    <span>You’re in</span>
                    <span>Leave</span>
                  </span>
                )}
              </button>
              <span className={`text-[1.35rem] font-bold tracking-[-0.02em] ${fg}`}>Who’s in?</span>
            </div>

            <p aria-live="polite" className={`min-h-[1.5rem] text-[0.9375rem] font-semibold ${fg}`}>
              {status}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}
