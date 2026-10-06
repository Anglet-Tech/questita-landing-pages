"use client";

import { useRef } from "react";
import { burstFrom } from "@/lib/burst";
import { gsap, MQ, useIdleGSAP } from "@/lib/gsap";
import { useJoin, type Day } from "@/lib/useJoin";
import { flowTrigger } from "./flow";

interface Sample {
  id: string;
  tag: string;
  title: string;
  desc: string;
  area: string;
  day: Day;
  time: string;
  spots: number;
  full?: boolean;
  rot: number;
  tape: { left: string; rot: number };
}

const SAMPLES: Sample[] = [
  {
    id: "wl-q1",
    tag: "Coffee run",
    title: "Flat white and a walk",
    desc: "Two cups, one loop around the neighborhood.",
    area: "Garden City",
    day: "Sat",
    time: "10:00 AM",
    spots: 2,
    rot: -2.4,
    tape: { left: "38%", rot: -4 },
  },
  {
    id: "wl-q2",
    tag: "First-time class",
    title: "Beginner pottery, zero pressure",
    desc: "Nobody here has done this before. That’s the point.",
    area: "Maadi",
    day: "Sun",
    time: "6:00 PM",
    spots: 4,
    rot: 1.6,
    tape: { left: "8%", rot: 5 },
  },
  {
    id: "wl-q3",
    tag: "Sunset ride",
    title: "Corniche bike ride",
    desc: "That one just filled up. Try another?",
    area: "Zamalek",
    day: "Fri",
    time: "5:00 PM",
    spots: 0,
    full: true,
    rot: -1.2,
    tape: { left: "62%", rot: -6 },
  },
];

function PinnedQuest({ q }: { q: Sample }) {
  const btn = useRef<HTMLButtonElement>(null);
  const [join, tagRef] = useJoin({
    spots: q.spots,
    full: q.full,
    day: q.day,
    onJoin: () => btn.current && burstFrom(btn.current, { count: 10, size: [6, 10], speed: [260, 520], duration: 800 }),
  });
  const dark = !!q.full;
  const fg = dark ? "text-coconut" : "text-merlot";
  const muted = dark ? "text-coconut-78" : "text-body";

  return (
    <div data-card="">
    <article
      aria-labelledby={`${q.id}-t`}
      className="wl-qcard"
      style={
        {
          "--rot": `${q.rot}deg`,
          "--under": "var(--blue)",
          "--flap-edge": "var(--merlot-700)",
          "--flap": dark ? "var(--coconut)" : "var(--yellow)",
        } as React.CSSProperties
      }
    >
      <span className="wl-tape" style={{ left: q.tape.left, top: -10, transform: `rotate(${q.tape.rot}deg)` }} aria-hidden="true" />
      <div className="wl-qcard-in">
        <div className="px-frame px-corners" style={{ "--step": "6px", "--frame": dark ? "var(--merlot-700)" : "var(--merlot)" } as React.CSSProperties}>
          <div className={`px-frame-in px-corners flex flex-col gap-3 p-5 sm:p-6 ${dark ? "on-dark bg-merlot" : "bg-coconut"}`}>
            <span className={`font-px t-px1 w-max px-2 py-0.5 tracking-[0.18em] text-merlot ${dark ? "bg-blue" : "bg-yellow"}`}>{q.tag}</span>
            <h3 id={`${q.id}-t`} className={`text-[1.5rem] font-extrabold leading-[1.08] tracking-[-0.025em] ${fg}`}>
              {q.title}
            </h3>
            {!dark && <p className={`text-[0.98rem] font-medium leading-snug ${muted}`}>{q.desc}</p>}
            <p className={`font-px t-px1 flex flex-wrap items-center gap-x-3 gap-y-1 tracking-[0.16em] ${muted}`}>
              <span>{q.area}</span>
              <span>
                {q.day}, {q.time}
              </span>
              <span ref={tagRef as React.RefObject<HTMLSpanElement>} className={dark ? "text-blue" : "bg-yellow px-2 py-0.5 text-merlot"}>
                {join.label}
              </span>
            </p>
            <div className="mt-1 flex items-center gap-4">
              <button
                ref={btn}
                type="button"
                onClick={join.toggle}
                onPointerLeave={join.clearFresh}
                onBlur={join.clearFresh}
                disabled={join.isFull}
                aria-pressed={q.full ? undefined : join.joined}
                aria-label={q.full ? `${q.title} is full` : join.joined ? `Leave ${q.title}` : `Join ${q.title}`}
                data-joined={join.joined || undefined}
                data-fresh={join.fresh || undefined}
                className={`join font-px t-px1 relative h-11 min-w-[132px] overflow-hidden px-5 ${dark ? "bg-merlot-700 text-coconut-78" : "bg-merlot text-coconut"}`}
                style={{ "--row": "44px" } as React.CSSProperties}
              >
                {join.isFull ? (
                  <span className="block leading-[44px]">Full</span>
                ) : (
                  <span className="join-stack block" aria-hidden="true">
                    <span>Join</span>
                    <span>Join</span>
                    <span>You’re in</span>
                    <span>Leave</span>
                  </span>
                )}
              </button>
              <span className={`text-[1.05rem] font-bold tracking-[-0.02em] ${fg}`}>Who’s in?</span>
            </div>
            <p aria-live="polite" className={`min-h-[1.4rem] text-[0.9rem] font-semibold ${fg}`}>
              {join.status}
            </p>
          </div>
        </div>
      </div>
      <span className="wl-peel" aria-hidden="true">
        <i />
        <i />
      </span>
    </article>
    </div>
  );
}

/** The "What" poster: the statement, the team's two lines, and three sample quests taped on. */
export default function WallWhat() {
  const root = useRef<HTMLDivElement>(null);

  useIdleGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        const cards = gsap.utils.toArray<HTMLElement>("[data-card]", root.current);
        gsap.from(cards, {
          autoAlpha: 0,
          scale: 1.25,
          duration: 0.3,
          ease: "steps(4)",
          stagger: 0.16,
          scrollTrigger: { ...flowTrigger(root.current!.querySelector<HTMLElement>("[data-cards]")!, "88%"), toggleActions: "play none none reverse" },
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <div ref={root} className="mx-auto max-w-[1440px] px-4 pb-16 pt-[calc(var(--wl-nav)+40px)] sm:px-8 lg:px-12 lg:pb-20 lg:pt-[calc(var(--wl-nav)+56px)]">
      <div className="grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-10">
        <h2 id="wl-what-t" className="text-[clamp(2.3rem,4.8vw,4.4rem)] font-extrabold leading-[1.02] tracking-[-0.035em] text-merlot lg:col-span-7">
          A quest is just a plan worth showing up for.
        </h2>
        <div className="flex flex-col gap-3 text-[1.0625rem] font-medium leading-relaxed text-merlot lg:col-span-5">
          <p>Cairo is big, and most good plans die at “we should do something.” Questita makes it easier to find someone to do the thing with.</p>
          <p>Post a quest or join one: a coffee run, a sunset ride, a first-time class. Then show up, with people who are already going.</p>
        </div>
      </div>

      <div data-cards="" className="mt-12 grid gap-10 sm:grid-cols-2 lg:mt-16 lg:grid-cols-3 lg:gap-8 xl:gap-12">
        {SAMPLES.map((q) => (
          <PinnedQuest key={q.id} q={q} />
        ))}
      </div>
    </div>
  );
}
