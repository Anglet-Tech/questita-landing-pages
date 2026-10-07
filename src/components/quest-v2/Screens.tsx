"use client";

import { Fragment, useState } from "react";
import { burstFrom } from "@/lib/burst";
import { useJoin } from "@/lib/useJoin";
import PixelFox from "../PixelFox";
import { PARTY, SAFETY_ITEMS, type QuestNpc } from "./content";

/* ---------- Quest popup (the board stop) ---------- */

export function QuestPopup({ quest, onClose, inline = false }: { quest: QuestNpc; onClose: () => void; inline?: boolean }) {
  const [join, tagRef] = useJoin({
    spots: quest.spots,
    full: quest.full,
    day: quest.day,
    onJoin: () => {
      const b = document.getElementById(`qp-join-${quest.id}${inline ? "-plain" : ""}`);
      if (b) burstFrom(b, { count: 10, size: [6, 10], speed: [260, 520], duration: 800 });
    },
  });
  return (
    <div className="q2-popup px-frame px-corners" role={inline ? undefined : "dialog"} aria-label={`${quest.kind}: ${quest.title}`} style={{ "--step": "5px" } as React.CSSProperties}>
      <div className="px-frame-in px-corners bg-coconut p-5" style={{ "--step": "4px" } as React.CSSProperties}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-px t-px1 text-body">Host: a friend of a friend</p>
            <h3 className="mt-2 text-[1.5rem] font-extrabold leading-tight tracking-[-0.02em] text-merlot">{quest.kind}</h3>
            <p className="text-[0.9375rem] font-medium text-body">{quest.title}</p>
          </div>
          {!inline && (
            <button type="button" onClick={onClose} aria-label="Close quest" className="grid h-11 w-11 shrink-0 place-items-center text-merlot">
              <span className="burger is-open" aria-hidden="true" />
            </button>
          )}
        </div>
        <p className="font-px t-px1 mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-body">
          <span>{quest.area}</span>
          <span>
            {quest.day}, {quest.time}
          </span>
          <span ref={tagRef as React.RefObject<HTMLSpanElement>} className="bg-yellow px-2 py-0.5 text-merlot">
            {join.label}
          </span>
        </p>
        <div className="mt-4 flex items-center gap-4">
          <button
            id={`qp-join-${quest.id}${inline ? "-plain" : ""}`}
            type="button"
            onClick={join.toggle}
            onPointerLeave={join.clearFresh}
            onBlur={join.clearFresh}
            disabled={join.isFull}
            aria-pressed={quest.full ? undefined : join.joined}
            aria-label={join.isFull ? "Full" : join.joined ? `Leave ${quest.kind}` : `Join ${quest.kind}`}
            data-joined={join.joined || undefined}
            data-fresh={join.fresh || undefined}
            className={`join font-px t-px1 relative h-12 min-w-[132px] overflow-hidden px-5 ${join.isFull ? "bg-merlot-700 text-coconut-78" : "bg-merlot text-coconut"}`}
          >
            {join.isFull ? (
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
          <span className="text-[1.1rem] font-bold text-merlot">Who’s in?</span>
        </div>
        <p aria-live="polite" className="mt-2 min-h-[1.25rem] text-[0.875rem] font-semibold text-merlot">
          {join.status}
        </p>
        <p className="mt-1 text-[0.8125rem] font-medium text-body">Sample quest. The real board opens in November.</p>
      </div>
    </div>
  );
}

/* ---------- Pixel icons from rects ---------- */

function Grid({ cells, size = 12 }: { cells: [number, number, number, number, string][]; size?: number }) {
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="h-full w-full" shapeRendering="crispEdges" aria-hidden="true" focusable="false">
      {cells.map(([x, y, w, h, c], i) => (
        <rect key={i} x={x} y={y} width={w} height={h} fill={c} />
      ))}
    </svg>
  );
}
const M = "#681B2B";
const Y = "#FEE571";
const B = "#B4D4FB";
const K = "#F9F5E9";
const ICONS: Record<string, [number, number, number, number, string][]> = {
  id: [
    [0, 2, 12, 8, M],
    [1, 3, 10, 6, K],
    [2, 4, 3, 4, B],
    [3, 5, 1, 1, M],
    [6, 4, 4, 1, M],
    [6, 6, 3, 1, M],
    [6, 8, 2, 1, Y],
  ],
  toggle: [
    [1, 4, 10, 4, M],
    [2, 5, 8, 2, M],
    [6, 3, 5, 6, M],
    [7, 4, 3, 4, Y],
  ],
  pin: [
    [4, 0, 4, 1, M],
    [3, 1, 6, 1, M],
    [2, 2, 8, 4, M],
    [3, 6, 6, 1, M],
    [4, 7, 4, 1, M],
    [5, 8, 2, 2, M],
    [5, 3, 2, 2, Y],
    [3, 11, 6, 1, B],
  ],
  star: [
    [5, 0, 2, 2, Y],
    [4, 2, 4, 2, Y],
    [0, 4, 12, 2, Y],
    [2, 6, 8, 2, Y],
    [2, 8, 3, 2, Y],
    [7, 8, 3, 2, Y],
    [1, 10, 2, 1, Y],
    [9, 10, 2, 1, Y],
    [5, 4, 2, 2, M],
  ],
  circle: [
    [5, 0, 2, 2, M],
    [4, 2, 4, 3, M],
    [1, 6, 2, 2, B],
    [0, 8, 4, 3, B],
    [9, 6, 2, 2, Y],
    [8, 8, 4, 3, Y],
    [5, 9, 2, 1, M],
  ],
};

/* ---------- Inventory (safety and play) ---------- */

export function Inventory({ titleId }: { titleId: string }) {
  const [sel, setSel] = useState(0);
  const item = SAFETY_ITEMS[sel];
  return (
    <div className="q2-window px-frame px-corners" style={{ "--step": "6px" } as React.CSSProperties}>
      <div className="px-frame-in px-corners bg-coconut p-5 sm:p-7" style={{ "--step": "5px" } as React.CSSProperties}>
        <p className="font-px t-px1 text-body">Inventory</p>
        <h2 id={titleId} className="mt-2 max-w-[20ch] text-[clamp(1.5rem,3vw,2.25rem)] font-extrabold leading-[1.08] tracking-[-0.03em] text-merlot">
          Real life, with a playful system on top.
        </h2>
        <div className="mt-6 grid gap-5 md:grid-cols-[auto_1fr] md:items-start">
          <ul className="grid grid-cols-5 gap-2 sm:gap-3" aria-label="Items">
            {SAFETY_ITEMS.map((it, i) => (
              <li key={it.id}>
                <button
                  type="button"
                  aria-pressed={sel === i}
                  aria-label={it.name}
                  onPointerEnter={() => setSel(i)}
                  onFocus={() => setSel(i)}
                  onClick={() => setSel(i)}
                  className={`q2-slot ${sel === i ? "is-selected" : ""}`}
                >
                  <span className="block h-9 w-9 sm:h-11 sm:w-11">
                    <Grid cells={ICONS[it.id]} />
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <div className="q2-inspector px-corners min-h-[112px] bg-merlot p-4 text-coconut" aria-live="polite" style={{ "--step": "4px" } as React.CSSProperties}>
            <p className="font-px t-px1 text-yellow">Item {sel + 1} of 5</p>
            <p className="mt-2 text-[1.125rem] font-extrabold">{item.name}</p>
            <p className="mt-1 text-[0.9375rem] font-medium leading-snug text-coconut-78">{item.desc}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Party select (who it's for) ---------- */

function Figure({ color }: { color: string }) {
  const outline = color === M ? Y : M;
  return (
    <svg viewBox="0 0 10 14" className="h-full w-full" shapeRendering="crispEdges" aria-hidden="true" focusable="false">
      <rect x={3} y={0} width={4} height={4} fill={outline} />
      <rect x={4} y={1} width={2} height={2} fill={K} />
      <rect x={2} y={5} width={6} height={5} fill={color} />
      <rect x={1} y={5} width={1} height={4} fill={color} />
      <rect x={8} y={5} width={1} height={4} fill={color} />
      <rect x={3} y={10} width={1} height={4} fill={outline} />
      <rect x={6} y={10} width={1} height={4} fill={outline} />
    </svg>
  );
}

export function PartySelect({ titleId }: { titleId: string }) {
  const [pick, setPick] = useState<number | null>(null);
  const [fox, setFox] = useState<"happy" | "wink">("happy");
  const choose = (i: number) => {
    setPick(i);
    setFox("wink");
    setTimeout(() => setFox("happy"), 700);
  };
  return (
    <div className="q2-window px-frame px-corners" style={{ "--step": "6px" } as React.CSSProperties}>
      <div className="px-frame-in px-corners bg-coconut p-5 sm:p-7" style={{ "--step": "5px" } as React.CSSProperties}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-px t-px1 text-body">Choose your party</p>
            <h2 id={titleId} className="mt-2 text-[clamp(1.5rem,3vw,2.25rem)] font-extrabold leading-[1.08] tracking-[-0.03em] text-merlot">
              Built for Cairo, for 18 to 35.
            </h2>
          </div>
          <div className="w-[62px] shrink-0">
            <PixelFox frame={fox} />
          </div>
        </div>
        <ul className="mt-5 grid grid-cols-3 gap-2 sm:mt-6 sm:gap-3">
          {PARTY.map((p, i) => (
            <li key={p.id}>
              <button type="button" aria-pressed={pick === i} onClick={() => choose(i)} className={`q2-party ${pick === i ? "is-picked" : ""}`}>
                <span className="mx-auto block h-11 w-8 sm:h-16 sm:w-12">
                  <Figure color={p.color} />
                </span>
                <span className="mt-2 block text-[0.8125rem] font-extrabold leading-tight text-merlot sm:mt-3 sm:text-[1rem]">{p.name}</span>
              </button>
            </li>
          ))}
        </ul>
        <p aria-live="polite" className="mt-4 min-h-[1.5rem] text-[1rem] font-semibold text-merlot">
          {pick !== null ? PARTY[pick].reply : ""}
        </p>
        <div className="mt-3 flex flex-col gap-1">
          {["Not a dating app.", "Not another feed to scroll."].map((line) => (
            <p key={line} className="text-[1.0625rem] font-extrabold leading-snug tracking-[-0.02em] text-merlot sm:text-[1.25rem]">
              {line.split(" ").map((w, i, arr) => (
                <Fragment key={i}>
                  <span className={`strike${i < arr.length - 1 ? " strike-gap" : ""}`}>{w}</span>
                  {i < arr.length - 1 && <span className="text-[0px]"> </span>}
                </Fragment>
              ))}
            </p>
          ))}
          <p className="font-px t-px1 mt-2 text-merlot sm:t-px2">Just plans, with people.</p>
        </div>
      </div>
    </div>
  );
}
