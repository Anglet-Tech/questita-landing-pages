"use client";

import { useEffect, useRef } from "react";
import { CREATORS, nameplate, NAMEPLATE_H, NAMEPLATE_W, type NameplateColour } from "@/lib/creators";
import { gsap, hasFinePointer, MQ, prefersReducedMotion, useIdleGSAP } from "@/lib/gsap";
import PixelSeam from "./PixelSeam";

const COLOURS: NameplateColour[] = ["yellow", "bluepeach", "coconutmilk", "yellow", "bluepeach"];
const TILT = [-2, 1.5, -1, 1.2, -1.6];

/** One nameplate card. Tilts toward a fine pointer through quickTo. */
function Card({ index, big }: { index: number; big: boolean }) {
  const c = CREATORS[index];
  const tilt = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = tilt.current;
    if (!el || !hasFinePointer() || prefersReducedMotion()) return;
    const rx = gsap.quickTo(el, "rotationX", { duration: 0.5, ease: "power3.out" });
    const ry = gsap.quickTo(el, "rotationY", { duration: 0.5, ease: "power3.out" });
    let r = el.getBoundingClientRect();
    const onEnter = () => {
      r = el.getBoundingClientRect();
    };
    const onMove = (e: PointerEvent) => {
      const nx = (e.clientX - r.left) / r.width - 0.5;
      const ny = (e.clientY - r.top) / r.height - 0.5;
      ry(nx * 14);
      rx(-ny * 10);
    };
    const onLeave = () => {
      rx(0);
      ry(0);
    };
    el.addEventListener("pointerenter", onEnter);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointerenter", onEnter);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      gsap.killTweensOf(el);
    };
  }, []);

  return (
    <li data-creator className={`cr-card ${big ? "cr-big" : ""}`} style={{ "--tilt": `${TILT[index]}deg` } as React.CSSProperties}>
      <div ref={tilt} className="cr-tilt">
        <div className="px-frame px-corners" style={{ "--frame": "var(--coconut)", "--step": "6px" } as React.CSSProperties}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={nameplate(c, COLOURS[index])}
            alt={c.name}
            width={NAMEPLATE_W}
            height={NAMEPLATE_H}
            loading="lazy"
            decoding="async"
            className="px-frame-in px-corners pixelated block h-auto w-full"
            style={{ "--step": "5px" } as React.CSSProperties}
          />
        </div>
      </div>
      {c.role && <p className="font-px t-px1 mt-3 text-yellow">{c.role}</p>}
    </li>
  );
}

/**
 * About the creators: nameplate cards on a merlot block, the two co-founders
 * larger on the first row. Cards slide and rotate in with a stepped stagger.
 */
export default function Creators() {
  const section = useRef<HTMLElement>(null);

  useIdleGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        const cards = section.current!.querySelectorAll("[data-creator]");
        gsap.from(cards, {
          y: 80,
          rotation: (i) => (i % 2 ? 9 : -9),
          autoAlpha: 0,
          duration: 0.6,
          ease: "steps(5)",
          stagger: 0.12,
          scrollTrigger: { trigger: section.current, start: "top 70%", once: true },
        });
      });
      return () => mm.revert();
    },
    { scope: section },
  );

  return (
    <section id="creators" ref={section} data-nav="dark" aria-labelledby="creators-title" className="on-dark relative z-[7] bg-merlot py-16 text-coconut lg:py-28">
      <PixelSeam from="coconut" to="merlot" />
      <div className="mx-auto max-w-[1200px] px-4 sm:px-8 lg:px-12">
        <h2 id="creators-title" className="text-[clamp(2.2rem,4.4vw,4rem)] font-extrabold leading-[1.02] tracking-[-0.035em]">
          About the creators
        </h2>
        <p className="mt-4 max-w-[34rem] text-[1.125rem] font-medium leading-relaxed text-coconut-78">
          The people who make the big city feel smaller.
        </p>
        <ul className="cr-grid mt-12 lg:mt-16">
          {CREATORS.map((c, i) => (
            <Card key={c.stem} index={i} big={i < 2} />
          ))}
        </ul>
      </div>
    </section>
  );
}
