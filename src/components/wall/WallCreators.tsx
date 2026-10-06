"use client";

import { useRef } from "react";
import { asset } from "@/lib/asset";
import { gsap, MQ, ScrollTrigger, useIdleGSAP } from "@/lib/gsap";
import Sticker from "./Sticker";
import { flowTrigger } from "./flow";

const PEOPLE = [
  { stem: "Mayar-Hamed", name: "Mayar Hamed", role: "Co-founder", color: "bluepeach", rot: -3, pos: "lg:left-[2%] lg:top-[1%] lg:w-[44%]", m: "w-[90%] self-start" },
  { stem: "Radwa-Adel", name: "Radwa Adel", role: "Co-founder", color: "yellow", flap: "var(--blue)", rot: 2.5, pos: "lg:left-[53%] lg:top-[6%] lg:w-[44%]", m: "w-[90%] self-end" },
  { stem: "Ahmed-AboElMagd", name: "Ahmed AboElMagd", color: "merlot", rot: 2, pos: "lg:left-[0%] lg:top-[56%] lg:w-[31%]", m: "w-[76%] self-start" },
  { stem: "AbdElRahman-Tarek", name: "Abdelrahman Tarek", color: "coconutmilk", rot: -2.5, pos: "lg:left-[34.5%] lg:top-[62%] lg:w-[31%]", m: "w-[76%] self-end" },
  { stem: "Hadeer-Abdallah", name: "Hadeer Abdallah", color: "bluepeach", rot: 3.5, pos: "lg:left-[68%] lg:top-[53%] lg:w-[31%]", m: "w-[76%] self-start" },
] as const;

/** The nameplates, stuck on like name-badge stickers. Co-founders first and bigger. */
export default function WallCreators() {
  const root = useRef<HTMLDivElement>(null);
  const board = useRef<HTMLDivElement>(null);

  useIdleGSAP(
    () => {
      const mm = gsap.matchMedia();
      const plates = () => gsap.utils.toArray<HTMLElement>("[data-sticker]", board.current);
      const from = (i: number) => ({ autoAlpha: 0, scale: i < 2 ? 1.4 : 1.3 });
      const to = { autoAlpha: 1, scale: 1, duration: 0.3, ease: "steps(4)" };
      mm.add(MQ.desktop, () => {
        // One trigger for the whole collage: it slaps on in order, co-founders first.
        const tl = gsap.timeline({ paused: true });
        plates().forEach((p, i) => tl.fromTo(p, from(i), to, i * 0.2));
        ScrollTrigger.create({ ...flowTrigger(board.current!, "78%"), onEnter: () => tl.play(), onLeaveBack: () => tl.reverse() });
      });
      mm.add(MQ.mobile, () => {
        // Stacked on small screens: each plate slaps on as it scrolls in.
        plates().forEach((p, i) => {
          gsap.fromTo(p, from(i), { ...to, scrollTrigger: { ...flowTrigger(p, "90%"), toggleActions: "play none none reverse" } });
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <div ref={root} className="mx-auto max-w-[1280px] px-4 pb-20 pt-[calc(var(--wl-nav)+48px)] sm:px-8 lg:px-12 lg:pb-24 lg:pt-[calc(var(--wl-nav)+56px)]">
      <h2 id="wl-creators-t" className="text-center text-[clamp(2.4rem,5.4vw,4.8rem)] font-extrabold leading-[1] tracking-[-0.04em] text-merlot">
        About the creators
      </h2>
      <div ref={board} className="wl-plates relative mx-auto mt-12 flex max-w-[1080px] flex-col gap-8 lg:mt-14 lg:block lg:aspect-[5/3]">
        {PEOPLE.map((p, i) => (
          <Sticker
            key={p.stem}
            bounds={board}
            rotate={p.rot}
            query="(min-width: 1024px)"
            label={"role" in p ? `${p.name}, ${p.role}` : p.name}
            className={`wl-plate ${p.m} ${p.pos}`}
            liftClassName="wl-plate-in"
          >
            <div className="px-frame" style={{ "--frame-w": i < 2 ? "4px" : "3px" } as React.CSSProperties}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={asset(`/nameplates/Questita-${p.stem}-${p.color}.png`)}
                alt={p.name}
                width={1600}
                height={1000}
                loading="lazy"
                decoding="async"
                draggable={false}
                className="block h-auto w-full"
              />
            </div>
            {"role" in p && (
              <span className="font-px t-px1 absolute -bottom-3 left-5 bg-merlot px-3 py-1.5 tracking-[0.2em] text-yellow" style={{ transform: "rotate(-3deg)" }}>
                {p.role}
              </span>
            )}
            <span className="wl-peel" aria-hidden="true" style={{ "--flap": "flap" in p ? p.flap : "var(--yellow)" } as React.CSSProperties}>
              <i />
              <i />
            </span>
          </Sticker>
        ))}
      </div>
    </div>
  );
}
