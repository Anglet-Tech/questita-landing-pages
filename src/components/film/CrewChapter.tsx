"use client";

import { useRef } from "react";
import { asset } from "@/lib/asset";
import { gsap, ScrollTrigger, useIdleGSAP } from "@/lib/gsap";
import Wipe from "./Wipe";
import { CREW } from "./content";
import { FMQ, span, stepped, watchChapter } from "./filmKit";

const inOut = gsap.parseEase("power3.inOut");
/** Lettering strips are drawn on a 24px grid, 12 cells tall. */
const STRIP_UNIT = 24;
const STRIP_ROWS = 12;
const MAX_UNITS = Math.max(...CREW.map((c) => c.stripW / STRIP_UNIT));
/** Widest single word: on narrow screens each name splits into two rows so it fits. */
const MAX_WORD = Math.max(...CREW.map((c) => Math.max(c.split[0], c.stripW / STRIP_UNIT - c.split[1])));
const TWO_ROW_BELOW = 1024;
const blockUnits = (c: (typeof CREW)[number], two: boolean) => (two ? Math.max(c.split[0], c.stripW / STRIP_UNIT - c.split[1]) : c.stripW / STRIP_UNIT);

const M0 = 0.11;
const M1 = 0.76;
const ML = (M1 - M0) / CREW.length;
const L0 = 0.78;

/** Fast in, slow through the middle, fast out: the credit holds centred. */
function crawl(t: number) {
  const u = 2 * t - 1;
  return 0.5 + 0.5 * Math.sign(u) * Math.abs(u) ** 3;
}

/**
 * Chapter 5, "The crew", credits style and pinned. A title card, then one
 * full-width moment per creator: their lettering strip slides across, holding
 * centred, while the role steps in. Then the five nameplate cards drop from
 * the centre of the frame into a lineup, co-founders first and larger.
 * The strips render at a whole number of screen px per art pixel.
 */
export default function CrewChapter() {
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const title = useRef<HTMLDivElement>(null);
  const lineup = useRef<HTMLUListElement>(null);

  useIdleGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(FMQ.pin, () => {
        const st = stage.current!;
        const tt = title.current!;
        const moments = gsap.utils.toArray<HTMLElement>("[data-moment]", st);
        const strips = moments.map((m) => m.querySelector<HTMLElement>("[data-strip]")!);
        const metas = moments.map((m) => m.querySelectorAll<HTMLElement>("[data-meta]"));
        const cards = gsap.utils.toArray<HTMLElement>("[data-card]", lineup.current);
        const label = tt.querySelector<HTMLElement>("p")!;
        const caps = cards.map((c) => c.querySelector<HTMLElement>(".crew-card-role")!);
        let lastLabel = -1;

        let W = 1;
        let x0 = 0;
        let y0 = 0;
        let K = 0.3;
        let u = 8;
        let two = false;
        const card0 = cards.map(() => ({ dx: 0, dy: 0 }));
        const lastMoment = moments.map(() => -1);
        const lastMeta = moments.map(() => -1);
        const lastCard = cards.map(() => -1);

        const measure = () => {
          W = st.offsetWidth;
          const H = st.offsetHeight;
          const margin = W < 768 ? 16 : 24;
          // Whole screen px per art pixel; the name always fits when it holds centred.
          two = W < TWO_ROW_BELOW;
          u = Math.max(2, Math.min(16, Math.floor((W - margin * 2) / (two ? MAX_WORD : MAX_UNITS))));
          st.style.setProperty("--u", `${u}px`);
          st.toggleAttribute("data-two", two);
          x0 = (W - tt.offsetWidth) / 2 - tt.offsetLeft;
          y0 = (H - tt.offsetHeight) / 2 - tt.offsetTop;
          const h2 = tt.querySelector("h2")!;
          K = Math.min(1, 40 / parseFloat(getComputedStyle(h2).fontSize));
          const lu = lineup.current!;
          cards.forEach((c, i) => {
            const cx = lu.offsetLeft + c.offsetLeft + c.offsetWidth / 2;
            const cy = lu.offsetTop + c.offsetTop + c.offsetHeight / 2;
            card0[i] = { dx: W / 2 - cx, dy: H / 2 - cy };
          });
        };

        const render = (p: number) => {
          const pt = inOut(span(p, 0.05, M0 - 0.01));
          tt.style.transform = `translate3d(${(x0 * (1 - pt)).toFixed(1)}px, ${(y0 * (1 - pt)).toFixed(1)}px, 0) scale(${(1 + (K - 1) * pt).toFixed(4)})`;
          // The label is too small to read once the title docks: it steps out.
          const lq = Math.min(2, Math.floor(span(p, 0.05, 0.08) * 2.999));
          if (lq !== lastLabel) {
            lastLabel = lq;
            label.style.opacity = String(1 - lq / 2);
          }

          moments.forEach((m, i) => {
            const t = span(p, M0 + i * ML, M0 + (i + 1) * ML);
            const live = t > 0 && t < 1 ? 1 : 0;
            if (live !== lastMoment[i]) {
              lastMoment[i] = live;
              m.style.visibility = live ? "visible" : "hidden";
            }
            if (live) {
              const sw = blockUnits(CREW[i], two) * u;
              const x = W - (W + sw) * crawl(t);
              strips[i].style.transform = `translate3d(${Math.round(x)}px, 0, 0)`;
            }
            // Role and index step in around the hold, in 4 hard steps.
            const mq = Math.ceil(Math.min(span(t, 0.22, 0.34), 1 - span(t, 0.7, 0.82)) * 4);
            if (mq !== lastMeta[i]) {
              lastMeta[i] = mq;
              metas[i].forEach((el) => (el.style.clipPath = `inset(0 ${100 - mq * 25}% 0 0)`));
            }
          });

          cards.forEach((c, i) => {
            const a = L0 + i * 0.028;
            const pc = span(p, a, a + 0.08);
            const e = stepped(pc, 6);
            if (e === lastCard[i]) return;
            lastCard[i] = e;
            const k = 1 - e;
            c.style.visibility = pc > 0 ? "visible" : "hidden";
            // Captions only once the card has landed, so cards in flight stay clean.
            caps[i].style.visibility = e >= 1 ? "" : "hidden";
            c.style.transform = `translate3d(${(card0[i].dx * k).toFixed(1)}px, ${(card0[i].dy * k).toFixed(1)}px, 0) scale(${(1 + 1.6 * k).toFixed(3)})`;
          });
        };

        measure();
        render(0);
        const trig = ScrollTrigger.create({
          trigger: section.current,
          start: "top top",
          end: () => `+=${Math.round(window.innerHeight * 6)}`,
          pin: st,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => render(self.progress),
          onRefresh: (self) => {
            measure();
            lastMoment.fill(-1);
            lastMeta.fill(-1);
            lastCard.fill(-1);
            lastLabel = -1;
            render(self.progress);
          },
        });
        return () => {
          trig.kill();
          [st, tt, label, ...moments, ...strips, ...cards, ...caps].forEach((el) => el.removeAttribute("style"));
          metas.forEach((ms) => ms.forEach((el) => el.removeAttribute("style")));
        };
      });
      watchChapter(section.current!, 5, "dark");
      return () => mm.revert();
    },
    { scope: section },
  );

  return (
    <section id="crew" ref={section} aria-labelledby="crew-title" className="film-chapter on-dark relative z-[6] bg-merlot text-coconut">
      <Wipe color="merlot" flip />
      <div ref={stage} className="crew-stage">
        <div ref={title} className="crew-title">
          <p className="font-px t-px1 tracking-[0.3em] text-yellow">About the creators</p>
          <h2 id="crew-title" className="crew-h2 font-extrabold">
            The crew.
          </h2>
        </div>

        <div className="crew-reel" aria-hidden="true">
          {CREW.map((c, i) => (
            <div key={c.stem} data-moment className="crew-moment">
              <p data-meta className="crew-idx font-px t-px1">
                {String(i + 1).padStart(2, "0")} / {String(CREW.length).padStart(2, "0")}
              </p>
              <div data-strip className="crew-strip" style={{ "--units": c.stripW / STRIP_UNIT, "--rows": STRIP_ROWS } as React.CSSProperties}>
                {(
                  [
                    ["full", 0, c.stripW / STRIP_UNIT],
                    ["a", 0, c.split[0]],
                    ["b", c.split[1], c.stripW / STRIP_UNIT - c.split[1]],
                  ] as const
                ).map(([k, off, w]) => (
                  <span key={k} className={`crew-row crew-row-${k}`} style={{ "--off": off, "--w": w } as React.CSSProperties}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={asset(`/nameplates/${c.stem}-coconutmilk.png`)} alt="" loading="lazy" decoding="async" className="pixelated" />
                  </span>
                ))}
              </div>
              <p data-meta className="crew-role font-px">
                {c.role ?? ""}
              </p>
            </div>
          ))}
        </div>

        <ul ref={lineup} className="crew-lineup">
          {CREW.map((c) => (
            <li key={c.stem} data-card className={`crew-card ${c.role ? "is-founder" : ""}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={asset(`/nameplates/Questita-${c.stem}-${c.card}.png`)}
                alt={c.name}
                loading="lazy"
                decoding="async"
                width={1600}
                height={1000}
                className="crew-card-img"
              />
              <p className="crew-card-role font-px t-px1">{c.role ?? " "}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
