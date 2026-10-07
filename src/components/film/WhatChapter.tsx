"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useIdleGSAP } from "@/lib/gsap";
import FilmQuestCard from "./FilmQuestCard";
import { QUESTS, WHAT } from "./content";
import { clamp01, FMQ, span, stepped, watchChapter } from "./filmKit";

const inOut = gsap.parseEase("power3.inOut");
const out = gsap.parseEase("power3.out");
const TILT = [-7, 3, 9];
const DIM = 0.12;

/**
 * Chapter 2. The statement scrubs in word by word at giant size, then the
 * camera settles: it shrinks to the top-left and three quest cards fly in
 * from depth (translateZ under a perspective), each with a working JOIN.
 * Below 1024px only the statement pins; the cards fly in as they enter.
 */
export default function WhatChapter() {
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const head = useRef<HTMLDivElement>(null);
  const statement = useRef<HTMLHeadingElement>(null);
  const sub = useRef<HTMLParagraphElement>(null);
  const cards = useRef<HTMLUListElement>(null);

  useIdleGSAP(
    () => {
      const mm = gsap.matchMedia();
      const words = gsap.utils.toArray<HTMLElement>("[data-sw]", statement.current);

      const wordFill = () => {
        const last = words.map(() => -1);
        return (f: number) => {
          words.forEach((w, i) => {
            const v = stepped(clamp01(f * words.length - i), 3);
            if (v === last[i]) return;
            last[i] = v;
            w.style.opacity = String(DIM + (1 - DIM) * v);
          });
        };
      };

      mm.add(FMQ.pinDesktop, () => {
        const st = stage.current!;
        const sm = statement.current!;
        const sb = sub.current!;
        const items = gsap.utils.toArray<HTMLElement>("[data-card]", cards.current);
        const fill = wordFill();
        let x0 = 0;
        let y0 = 0;
        const K = 0.5;
        let lastSub = -1;
        const lastCard = items.map(() => -1);

        const measure = () => {
          const W = st.offsetWidth;
          const H = st.offsetHeight;
          x0 = (W - sm.offsetWidth) / 2 - sm.offsetLeft - head.current!.offsetLeft;
          y0 = (H - sm.offsetHeight) / 2 - sm.offsetTop - head.current!.offsetTop;
        };

        const render = (p: number) => {
          fill(span(p, 0.03, 0.4));

          const pm = inOut(span(p, 0.42, 0.58));
          const s = 1 + (K - 1) * pm;
          sm.style.transform = `translate3d(${(x0 * (1 - pm)).toFixed(1)}px, ${(y0 * (1 - pm)).toFixed(1)}px, 0) scale(${s.toFixed(4)})`;

          const ps = Math.ceil(span(p, 0.56, 0.64) * 4);
          if (ps !== lastSub) {
            lastSub = ps;
            sb.style.clipPath = `inset(0 0 ${100 - ps * 25}% 0)`;
          }

          items.forEach((el, j) => {
            const a = 0.5 + j * 0.08;
            const pj = span(p, a, a + 0.3);
            const e = out(pj);
            const z = -2600 * (1 - e);
            el.style.transform = `translate3d(0, ${(80 * (1 - e)).toFixed(1)}px, ${z.toFixed(0)}px) rotate(${(TILT[j] * (1 - e)).toFixed(2)}deg)`;
            const o = stepped(Math.min(1, pj * 3), 3);
            if (o !== lastCard[j]) {
              lastCard[j] = o;
              el.style.opacity = String(o);
              el.style.pointerEvents = pj >= 1 ? "" : "none";
            }
            if (pj >= 1 && el.style.pointerEvents) el.style.pointerEvents = "";
          });
        };

        measure();
        render(0);
        const trig = ScrollTrigger.create({
          trigger: section.current,
          start: "top top",
          end: () => `+=${Math.round(window.innerHeight * 2)}`,
          pin: st,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => render(self.progress),
          onRefresh: (self) => {
            measure();
            lastSub = -1;
            lastCard.fill(-1);
            render(self.progress);
          },
        });
        return () => {
          trig.kill();
          [sm, sb, ...items, ...words].forEach((el) => el.removeAttribute("style"));
        };
      });

      mm.add(FMQ.pinMobile, () => {
        const fill = wordFill();
        fill(0);
        const trig = ScrollTrigger.create({
          trigger: head.current,
          start: "top top",
          end: () => `+=${Math.round(window.innerHeight * 1.1)}`,
          pin: true,
          anticipatePin: 1,
          onUpdate: (self) => fill(span(self.progress, 0.05, 0.85)),
        });
        gsap.utils.toArray<HTMLElement>("[data-card]", cards.current).forEach((el, j) => {
          gsap.fromTo(
            el,
            { z: -1400, y: 60, rotation: TILT[j], autoAlpha: 0 },
            {
              z: 0,
              y: 0,
              rotation: 0,
              autoAlpha: 1,
              ease: "power3.out",
              scrollTrigger: { trigger: el, start: "top 98%", end: "top 62%", scrub: true },
            },
          );
        });
        return () => {
          trig.kill();
          words.forEach((w) => w.removeAttribute("style"));
        };
      });

      watchChapter(section.current!, 1, "light");
      return () => mm.revert();
    },
    { scope: section },
  );

  const words = WHAT.statement.split(" ");

  return (
    <section id="what" ref={section} aria-labelledby="what-title" className="film-chapter relative z-[2] bg-coconut text-merlot">
      <div ref={stage} className="what-stage">
        <div ref={head} className="what-head">
          <h2 id="what-title" ref={statement} className="what-statement font-extrabold">
            {words.map((w, i) => (
              <span key={i}>
                <span data-sw>{w}</span>
                {i < words.length - 1 ? " " : ""}
              </span>
            ))}
          </h2>
          <p ref={sub} className="what-sub font-medium text-body">
            {WHAT.sub}
          </p>
        </div>
        <ul ref={cards} className="what-cards" aria-label="Sample quests">
          {QUESTS.map((q) => (
            <li key={q.id} data-card className="what-card">
              <FilmQuestCard quest={q} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
