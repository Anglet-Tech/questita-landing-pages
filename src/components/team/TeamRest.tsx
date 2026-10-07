"use client";

import { useRef } from "react";
import { asset } from "@/lib/asset";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { openContact } from "@/lib/store";
import { Arrow, Magnetic, Roll } from "../ui";
import { revealOnView, riseOnView, whenVisible } from "./motion";

/** Partners: the merlot ticket, sized to its content on a slim yellow band. */
export function TeamPartners() {
  const section = useRef<HTMLElement>(null);
  const h2 = useRef<HTMLHeadingElement>(null);
  const ticket = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const offs = [revealOnView(h2.current, 0.25), riseOnView(ticket.current, section.current!.querySelectorAll("[data-rise]"), { delay: 0.45 })];
      if (!prefersReducedMotion()) {
        gsap.set(ticket.current, { rotateX: 70, y: 50, autoAlpha: 0, transformOrigin: "50% 100%" });
        offs.push(whenVisible(ticket.current, () => gsap.to(ticket.current, { rotateX: 0, y: 0, autoAlpha: 1, duration: 1.2, ease: "expo.out" }), 0.15));
      }
      return () => offs.forEach((f) => f());
    },
    { scope: section },
  );

  return (
    <section ref={section} aria-labelledby="tm-partners-title" className="tm-sec tm-partners py-12 lg:py-16">
      <span className="tm-edge" aria-hidden="true" />
      <div className="tm-inner tm-wrap" style={{ perspective: "1400px" }}>
        <div ref={ticket} className="tm-ticket flex flex-col lg:flex-row">
          <div className="px-corners on-dark flex-1 bg-merlot p-7 text-coconut sm:p-10 lg:px-14 lg:py-12" style={{ "--step": "8px" } as React.CSSProperties}>
            <h2 id="tm-partners-title" ref={h2} className="text-[clamp(2rem,min(4.4vw,7vh),3.5rem)] font-extrabold leading-[1.04] tracking-[-0.03em]">
              Want to be part
              <br />
              of the plan?
            </h2>
            <p data-rise className="mt-4 max-w-[32rem] text-[1.0625rem] leading-relaxed text-coconut-78 sm:text-[1.125rem]">
              If you run a place, brand or product that belongs in a Cairo plan, we’d love to talk.
            </p>
            <div data-rise className="mt-7">
              <Magnetic>
                <button type="button" onClick={openContact} className="btn btn-yellow roll-host">
                  <Roll>Get in touch</Roll>
                  <Arrow />
                </button>
              </Magnetic>
            </div>
          </div>
          <div className="tm-perf" aria-hidden="true" />
          <div className="px-corners flex flex-row items-center justify-center gap-5 bg-merlot px-7 py-6 text-center lg:w-[300px] lg:flex-col" style={{ "--step": "8px" } as React.CSSProperties}>
            <p className="font-px t-px2 leading-[1.2] text-yellow lg:t-px3">
              Your
              <br className="hidden lg:block" /> spot
            </p>
            <p className="font-px t-px1 tracking-[0.12em] text-blue">Admits the whole group</p>
          </div>
        </div>
      </div>
    </section>
  );
}

const CREW = [
  { stem: "Mayar-Hamed", name: "Mayar Hamed", role: "Co-founder", colour: "bluepeach" },
  { stem: "Radwa-Adel", name: "Radwa Adel", role: "Co-founder", colour: "yellow" },
  { stem: "Ahmed-AboElMagd", name: "Ahmed AboElMagd", colour: "merlot" },
  { stem: "AbdElRahman-Tarek", name: "Abdelrahman Tarek", colour: "bluepeach" },
  { stem: "Hadeer-Abdallah", name: "Hadeer Abdallah", colour: "yellow" },
];

/** About the creators: the real pixel nameplates, 2 + 3, flipping in. */
export function TeamCreators() {
  const section = useRef<HTMLElement>(null);
  const h2 = useRef<HTMLHeadingElement>(null);
  const grid = useRef<HTMLUListElement>(null);

  useGSAP(
    () => {
      const offs = [revealOnView(h2.current)];
      if (!prefersReducedMotion()) {
        const plates = gsap.utils.toArray<HTMLElement>("[data-flip]", grid.current);
        gsap.set(plates, { rotateX: -90, autoAlpha: 0 });
        offs.push(
          whenVisible(
            grid.current,
            () => {
              gsap.to(plates, { rotateX: 0, autoAlpha: 1, duration: 0.6, ease: "steps(6)", stagger: 0.16 });
            },
            0.2,
          ),
        );
      }
      return () => offs.forEach((f) => f());
    },
    { scope: section },
  );

  return (
    <section ref={section} aria-labelledby="tm-creators-title" className="tm-sec tm-creators py-16 lg:py-24">
      <span className="tm-edge" aria-hidden="true" />
      <div className="tm-inner tm-wrap flex flex-col items-center gap-10 lg:gap-12">
        <h2 id="tm-creators-title" ref={h2} className="text-center text-[clamp(2.125rem,min(4.4vw,6.4vh),3.5rem)] font-extrabold leading-[1.04] tracking-[-0.03em] text-merlot">
          About the creators
        </h2>
        <ul ref={grid} className="tm-crew w-full max-w-[1080px] p-0">
          {CREW.map((c, i) => (
            <li key={c.stem} className={i < 2 ? "tm-crew-founder" : i === 4 ? "tm-crew-last" : "tm-crew-member"}>
              <figure data-flip className="tm-flip m-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={asset(`/nameplates/Questita-${c.stem}-${c.colour}.png`)}
                  alt={c.name}
                  width={1600}
                  height={1000}
                  loading="lazy"
                  decoding="async"
                  className="tm-plate px-corners"
                />
                {c.role && <figcaption className="mt-3 text-center text-[0.9375rem] font-bold text-merlot">{c.role}</figcaption>}
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** Footer: merlot, the coconut wordmark, the team's links and legal line. */
export function TeamFooter() {
  return (
    <footer className="tm-footer on-dark relative z-[8] bg-merlot pb-[calc(76px_+_env(safe-area-inset-bottom))] pt-10 text-coconut lg:pt-12">
      <div className="tm-wrap">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-col gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={asset("/fox/Questita_wordmark_coconutmilk.svg")} alt="Questita" width={1148} height={189} loading="lazy" className="h-auto w-[min(260px,52vw)]" />
            <p className="text-[clamp(0.9375rem,1.5vw,1.0625rem)] font-bold">For the people who make the big city feel smaller.</p>
          </div>
          <nav aria-label="Footer">
            <ul className="flex flex-wrap gap-x-6 text-[0.9375rem] font-semibold [&>li>*]:inline-flex [&>li>*]:min-h-11 [&>li>*]:items-center">
              <li>
                <a href="#what">What is Questita</a>
              </li>
              <li>
                <a href="#how">How it works</a>
              </li>
              <li>
                <button type="button" onClick={openContact} className="cursor-pointer font-semibold text-yellow hover:underline">
                  Get in touch
                </button>
              </li>
            </ul>
          </nav>
        </div>
        <div className="mt-6 flex flex-col gap-1.5 text-[0.8125rem] text-blue sm:flex-row sm:justify-between">
          <span>Made in Cairo · Made by Anglet</span>
          <span>© 2026 Questita. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}
