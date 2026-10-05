"use client";

import { useRef } from "react";
import { gsap, useGSAP, MQ } from "@/lib/gsap";
import QuestCard, { type Quest } from "./QuestCard";
import { Bubble } from "./ui";

const QUESTS: Quest[] = [
  { id: "q1", kind: "Sunset ride", title: "Felucca at golden hour", area: "Zamalek", day: "Fri", time: "5:30 PM", spots: 3, scene: "felucca", rotate: -1.5 },
  { id: "q2", kind: "Sidequest", title: "Flat white and a walk", area: "Garden City", day: "Sat", time: "10:00 AM", spots: 2, scene: "wink", rotate: 1.2 },
  { id: "q3", kind: "First-time class", title: "Beginner pottery, zero pressure", area: "Maadi", day: "Sun", time: "6:00 PM", spots: 4, scene: "stairs", rotate: -0.6 },
  { id: "q4", kind: "Board game night", title: "Catan and koshary", area: "Dokki", day: "Thu", time: "8:00 PM", spots: 5, scene: "street", rotate: 1.5 },
  { id: "q5", kind: "Sidequest", title: "Two hours, phones face down", area: "New Cairo", day: "Mon", time: "4:00 PM", spots: 1, scene: "skyline", rotate: -1.1 },
  { id: "q6", kind: "Sunset ride", title: "Corniche bike ride", area: "Zamalek", day: "Fri", time: "5:00 PM", spots: 0, scene: "felucca", rotate: 0.8, full: true },
];

const TERMS = [
  { term: "Quest", def: "A plan on the board that people can join." },
  { term: "Sidequest", def: "The small everyday kind, like a coffee run or a study sprint." },
  { term: "Host", def: "Whoever posts it. Could be a friend of a friend." },
];

/**
 * The board. Desktop pins the section and pans a track of quest cards left
 * (canonical horizontal-pan skeleton). Below 1024px, and under reduced motion,
 * it is a native scroll-snap row.
 */
export default function Board() {
  const section = useRef<HTMLElement>(null);
  const pinWrap = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MQ.desktop, () => {
        const el = track.current!;
        const distance = () => Math.max(0, el.scrollWidth - window.innerWidth);
        gsap.to(el, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: pinWrap.current,
            start: "top top",
            end: () => "+=" + distance(),
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
            anticipatePin: 1,
          },
        });
      });
      return () => mm.revert();
    },
    { scope: section },
  );

  return (
    <section id="board" ref={section} data-nav="light" aria-labelledby="board-title" className="relative z-[2] bg-coconut text-merlot">
      <div ref={pinWrap} className="board-pin relative flex flex-col pb-12 pt-[calc(var(--nav-h)+40px)] lg:h-[100svh] lg:justify-center lg:pb-8 lg:pt-[calc(var(--nav-h)+8px)]">
        <div ref={track} className="board-track lg:flex lg:w-max lg:items-center lg:gap-12 lg:pl-12 lg:pr-[10vw]">
          {/* Intro panel: part of the pan on desktop, a normal block on mobile */}
          <div className="board-intro px-4 sm:px-8 lg:w-[min(36rem,40vw)] lg:shrink-0 lg:px-0">
            <h2 id="board-title" className="max-w-[15ch] text-[clamp(2.2rem,4.4vw,4rem)] font-extrabold leading-[1.02] tracking-[-0.035em]">
              A quest is just a plan worth showing up for.
            </h2>
            <ul className="mt-8 flex flex-wrap gap-3" aria-label="Glossary">
              {TERMS.map((t, i) => (
                <li key={t.term} className="chip-host relative">
                  <button
                    type="button"
                    className="chip px-corners bg-blue px-4 py-2 text-[1rem] font-bold text-merlot"
                    aria-describedby={`term-${t.term}`}
                    style={{ "--step": "4px" } as React.CSSProperties}
                  >
                    {t.term}
                  </button>
                  <Bubble
                    id={`term-${t.term}`}
                    role="tooltip"
                    tailLeft={i === TERMS.length - 1 ? 196 : 24}
                    className={`chip-bubble absolute bottom-[calc(100%+16px)] z-30 w-[min(16rem,calc(100vw-40px))] ${
                      i === TERMS.length - 1 ? "right-0" : "left-0"
                    }`}
                  >
                    <p className="text-[0.9375rem] font-medium leading-snug">
                      <strong className="font-extrabold">{t.term}:</strong> {t.def}
                    </p>
                  </Bubble>
                </li>
              ))}
            </ul>
          </div>

          <div
            className="board-cards mt-10 flex snap-x snap-mandatory gap-6 overflow-x-auto px-4 pb-6 pt-4 sm:px-8 lg:mt-0 lg:snap-none lg:gap-10 lg:overflow-visible lg:p-0"
            tabIndex={0}
            aria-label="Sample quests"
            role="region"
          >
            {QUESTS.map((q) => (
              <QuestCard key={q.id} quest={q} />
            ))}
          </div>
        </div>
        <p className="mt-4 px-4 text-[0.9375rem] font-medium text-body sm:px-8 lg:mt-6 lg:px-12">
          Sample quests. The real board opens in November.
        </p>
      </div>
    </section>
  );
}
