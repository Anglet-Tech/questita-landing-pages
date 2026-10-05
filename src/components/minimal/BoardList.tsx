"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, hasFinePointer, prefersReducedMotion, useGSAP } from "@/lib/gsap";
import { useJoin, type Day } from "@/lib/useJoin";
import { SceneArt, type Scene } from "../QuestCard";
import { minimalReveal } from "./reveal";

interface Row {
  id: string;
  title: string;
  kind: string;
  area: string;
  day: Day;
  time: string;
  spots: number;
  scene: Scene;
}

const ROWS: Row[] = [
  { id: "m1", title: "Felucca at golden hour", kind: "Sunset ride", area: "Zamalek", day: "Fri", time: "5:30 PM", spots: 3, scene: "felucca" },
  { id: "m2", title: "Catan and koshary", kind: "Board game night", area: "Dokki", day: "Thu", time: "8:00 PM", spots: 5, scene: "street" },
  { id: "m3", title: "Two hours, phones face down", kind: "Sidequest", area: "New Cairo", day: "Mon", time: "4:00 PM", spots: 1, scene: "skyline" },
  { id: "m4", title: "Beginner pottery, zero pressure", kind: "First-time class", area: "Maadi", day: "Sun", time: "6:00 PM", spots: 4, scene: "stairs" },
];

function QuestRow({ row, onHover }: { row: Row; onHover: (scene: Scene | null) => void }) {
  const [join, tagRef] = useJoin({ spots: row.spots, day: row.day });
  return (
    <li className="min-row group/row grid grid-cols-[auto_1fr] items-center gap-x-5 gap-y-1 py-7 sm:grid-cols-[auto_1fr_auto] sm:gap-x-8" onPointerEnter={() => onHover(row.scene)}>
      <div className="row-thumb relative row-span-2 w-[88px] overflow-hidden px-corners sm:row-span-1" style={{ aspectRatio: "16 / 9", "--step": "3px" } as React.CSSProperties} aria-hidden="true">
        <SceneArt scene={row.scene} />
      </div>
      <div className="min-w-0">
        <h3 className="text-[clamp(1.4rem,2.6vw,2rem)] font-bold leading-tight tracking-[-0.025em] text-merlot">{row.title}</h3>
        <p className="font-px t-px1 mt-2 flex flex-wrap gap-x-5 gap-y-1 text-body">
          <span>{row.area}</span>
          <span>
            {row.day}, {row.time}
          </span>
          <span ref={tagRef as React.RefObject<HTMLSpanElement>} className="text-merlot">
            {join.label}
          </span>
        </p>
        <p aria-live="polite" className="mt-1 min-h-[1.25rem] text-[0.9375rem] font-semibold text-merlot">
          {join.status}
        </p>
      </div>
      <button
        type="button"
        onClick={join.toggle}
        onPointerLeave={join.clearFresh}
        onBlur={join.clearFresh}
        disabled={join.isFull}
        aria-pressed={join.joined}
        aria-label={join.isFull ? `${row.title}, full` : join.joined ? `Leave ${row.title}` : `Join ${row.title}`}
        data-joined={join.joined || undefined}
        data-fresh={join.fresh || undefined}
        className="join join-text font-px t-px1 relative col-start-2 h-12 min-w-[132px] justify-self-start overflow-hidden text-merlot sm:col-start-3 sm:justify-self-end"
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
    </li>
  );
}

/**
 * On the board: a plain list of rows. With a fine pointer, a small pixel scene
 * follows the cursor with quickTo lag and tilts with velocity. On touch the
 * thumbnail sits inline at the start of each row instead.
 */
export default function BoardList() {
  const section = useRef<HTMLElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const follower = useRef<HTMLDivElement>(null);
  const [scene, setScene] = useState<Scene | null>(null);

  useGSAP(() => minimalReveal(section.current!), { scope: section });

  useEffect(() => {
    const el = follower.current;
    const ul = list.current;
    if (!el || !ul || !hasFinePointer()) return;
    const reduced = prefersReducedMotion();
    const x = gsap.quickTo(el, "x", { duration: reduced ? 0 : 0.55, ease: "power3.out" });
    const y = gsap.quickTo(el, "y", { duration: reduced ? 0 : 0.55, ease: "power3.out" });
    const r = gsap.quickTo(el, "rotation", { duration: 0.4, ease: "power3.out" });
    let lastX = 0;
    const settle = gsap.delayedCall(0.12, () => r(0)).pause();
    const onMove = (e: PointerEvent) => {
      x(e.clientX + 24);
      y(e.clientY - 70);
      if (!reduced) {
        r(gsap.utils.clamp(-10, 10, (e.clientX - lastX) * 0.5));
        settle.restart(true);
      }
      lastX = e.clientX;
    };
    const onEnter = (e: PointerEvent) => {
      lastX = e.clientX;
      gsap.set(el, { x: e.clientX + 24, y: e.clientY - 70 });
      gsap.to(el, { autoAlpha: 1, scale: 1, duration: 0.2, ease: "steps(3)", overwrite: "auto" });
    };
    const onLeave = () => {
      gsap.to(el, { autoAlpha: 0, scale: 0.8, duration: 0.15, ease: "steps(2)", overwrite: "auto" });
      setScene(null);
    };
    ul.addEventListener("pointermove", onMove);
    ul.addEventListener("pointerenter", onEnter);
    ul.addEventListener("pointerleave", onLeave);
    return () => {
      ul.removeEventListener("pointermove", onMove);
      ul.removeEventListener("pointerenter", onEnter);
      ul.removeEventListener("pointerleave", onLeave);
      settle.kill();
      gsap.killTweensOf(el);
    };
  }, []);

  return (
    <section id="board" ref={section} aria-labelledby="min-board" className="mx-auto max-w-[1100px] px-4 py-32 sm:px-8">
      <h2 id="min-board" data-mh className="text-[clamp(2rem,4vw,3rem)] font-extrabold leading-[1.05] tracking-[-0.035em] text-merlot">
        On the board.
      </h2>
      <ul ref={list} className="mt-12 border-t border-merlot/15">
        {ROWS.map((row) => (
          <QuestRow key={row.id} row={row} onHover={setScene} />
        ))}
      </ul>
      <p data-mb className="mt-6 text-[0.9375rem] font-medium text-body">
        Sample quests. The real board opens in November.
      </p>

      <div
        ref={follower}
        aria-hidden="true"
        className="min-follower pointer-events-none fixed left-0 top-0 z-40 w-[220px] overflow-hidden px-corners"
        style={{ aspectRatio: "16 / 9", "--step": "4px", opacity: 0, visibility: "hidden" } as React.CSSProperties}
      >
        {scene && <SceneArt scene={scene} />}
      </div>
    </section>
  );
}
