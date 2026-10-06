"use client";

import { useEffect, useRef, useState } from "react";
import { CREATORS, nameplate, NAMEPLATE_H, NAMEPLATE_W } from "@/lib/creators";
import { gsap, hasFinePointer, prefersReducedMotion, useGSAP } from "@/lib/gsap";
import { minimalReveal } from "./reveal";

/**
 * Made by: the five names as a plain list. With a fine pointer the person's
 * nameplate follows the cursor (like the board rows); keyboard focus shows it
 * next to the name; touch gets a small inline thumbnail.
 */
export default function MadeBy() {
  const section = useRef<HTMLElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const follower = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<number | null>(null);

  useGSAP(() => minimalReveal(section.current!), { scope: section });

  useEffect(() => {
    const el = follower.current;
    const ul = list.current;
    if (!el || !ul || !hasFinePointer()) return;
    const reduced = prefersReducedMotion();
    const x = gsap.quickTo(el, "x", { duration: reduced ? 0 : 0.5, ease: "power3.out" });
    const y = gsap.quickTo(el, "y", { duration: reduced ? 0 : 0.5, ease: "power3.out" });
    const onMove = (e: PointerEvent) => {
      x(e.clientX + 28);
      y(e.clientY - 80);
    };
    const onEnter = (e: PointerEvent) => {
      gsap.set(el, { x: e.clientX + 28, y: e.clientY - 80 });
    };
    ul.addEventListener("pointermove", onMove);
    ul.addEventListener("pointerenter", onEnter);
    return () => {
      ul.removeEventListener("pointermove", onMove);
      ul.removeEventListener("pointerenter", onEnter);
      gsap.killTweensOf(el);
    };
  }, []);

  // Keyboard focus: park the card beside the focused name.
  const onFocus = (i: number, target: HTMLElement) => {
    setActive(i);
    const el = follower.current;
    if (!el) return;
    const r = target.getBoundingClientRect();
    gsap.set(el, { x: Math.min(window.innerWidth - 300, r.right + 24), y: r.top - 40 });
  };

  const c = active !== null ? CREATORS[active] : null;

  return (
    <section ref={section} aria-labelledby="min-made" className="mx-auto max-w-[1100px] px-4 py-14 sm:px-8 lg:py-24">
      <h2 id="min-made" data-mh className="text-[clamp(1.6rem,3vw,2.2rem)] font-extrabold leading-[1.1] tracking-[-0.03em] text-merlot">
        Made by
      </h2>
      <ul ref={list} data-mb className="mt-8 flex flex-col gap-3" onPointerLeave={() => setActive(null)}>
        {CREATORS.map((p, i) => (
          <li key={p.stem}>
            <span
              tabIndex={0}
              className="made-row inline-flex items-center gap-4 outline-offset-4"
              onPointerEnter={() => setActive(i)}
              onFocus={(e) => onFocus(i, e.currentTarget)}
              onBlur={() => setActive(null)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={nameplate(p, "yellow")}
                alt=""
                width={NAMEPLATE_W}
                height={NAMEPLATE_H}
                loading="lazy"
                decoding="async"
                className="made-thumb pixelated px-corners h-auto w-[64px]"
                style={{ "--step": "3px" } as React.CSSProperties}
              />
              <span className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
                <span className="text-[clamp(1.35rem,2.4vw,1.75rem)] font-bold tracking-[-0.02em] text-merlot">{p.name}</span>
                {p.role && <span className="font-px t-px1 text-body">{p.role}</span>}
              </span>
            </span>
          </li>
        ))}
      </ul>

      <div
        ref={follower}
        aria-hidden="true"
        className="made-follower pointer-events-none fixed left-0 top-0 z-40 w-[260px] overflow-hidden px-corners"
        data-on={c ? "" : undefined}
        style={{ "--step": "4px" } as React.CSSProperties}
      >
        {c && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={nameplate(c, "yellow")} alt="" width={NAMEPLATE_W} height={NAMEPLATE_H} decoding="async" className="pixelated block h-auto w-full" />
        )}
      </div>
    </section>
  );
}
