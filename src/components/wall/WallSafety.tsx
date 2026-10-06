"use client";

import { useRef, useState } from "react";
import { gsap, MQ, useIdleGSAP } from "@/lib/gsap";
import PixelFox from "../PixelFox";
import { flowTrigger } from "./flow";

const rows = (r: [number, number, number][]) => r.map(([y, x0, x1]) => `M${x0} ${y}h${x1 - x0 + 1}v1h-${x1 - x0 + 1}z`).join("");

// 12 x 12 map pin, row by row: [y, x0, x1].
const PIN = rows([
  [0, 3, 8], [1, 2, 9], [2, 1, 10], [3, 0, 11], [4, 0, 11], [5, 0, 11], [6, 0, 11],
  [7, 1, 10], [8, 2, 9], [9, 3, 8], [10, 4, 7], [11, 5, 6],
]);

// A tiny pixel person (2 x 2 head on a 4 x 2 body) at (x, y).
const head = (x: number, y: number) => `M${x + 1} ${y}h2v2h-2zM${x} ${y + 2}h4v2h-4z`;
// Six friends around a ring, on a 24 x 24 grid.
const FRIENDS: [number, number][] = [
  [10, 1], [18, 5], [18, 14], [10, 19], [2, 14], [2, 5],
];

const TAPE = ["left-[36%] -rotate-3", "left-[10%] rotate-6", "right-[12%] -rotate-6", "left-[30%] rotate-3", "right-[34%] -rotate-2"];

function Notice({
  i,
  title,
  body,
  rot,
  bg,
  className = "",
  framed = false,
  children,
}: {
  framed?: boolean;
  i: number;
  title: string;
  body: string;
  rot: number;
  bg: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <li data-notice="" className={`relative ${className}`}>
      <span className={`wl-tape -top-2.5 ${TAPE[i]}`} aria-hidden="true" />
      <div
        className={`px-corners h-full ${framed ? "bg-merlot p-1" : ""}`}
        style={{ "--step": "6px", transform: `rotate(${rot}deg)`, filter: "drop-shadow(3px 4px 0 rgba(36,27,31,.2))" } as React.CSSProperties}
      >
        <div className={`px-corners flex h-full flex-col gap-5 p-6 sm:p-7 ${bg}`} style={{ "--step": framed ? "5px" : "6px" } as React.CSSProperties}>
          <div className="flex min-h-[112px] items-center justify-center">{children}</div>
          <div className="mt-auto">
            <h3 className="text-[1.5rem] font-extrabold leading-[1.1] tracking-[-0.025em] lg:text-[1.65rem]">{title}</h3>
            <p className="mt-2 text-[1rem] font-medium leading-relaxed opacity-[.86]">{body}</p>
          </div>
        </div>
      </div>
    </li>
  );
}

/** Safety, as five notices pasted on the wall, each with a small pixel toy. */
export default function WallSafety() {
  const root = useRef<HTMLDivElement>(null);
  const [pref, setPref] = useState(false);

  useIdleGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const mm = gsap.matchMedia();
      const notices = () => q("[data-notice]") as HTMLElement[];

      // The toy that plays once a notice is on the wall.
      const toy = (i: number) => {
        const tl = gsap.timeline();
        if (i === 0) {
          tl.fromTo(q("[data-stamp]"), { autoAlpha: 0, scale: 1.7 }, { autoAlpha: 1, scale: 1, duration: 0.22, ease: "steps(3)" }, 0.15)
            .to(q("[data-idcard]"), { x: -4, y: 2, duration: 0.05, ease: "steps(1)" })
            .to(q("[data-idcard]"), { x: 4, y: -2, duration: 0.05, ease: "steps(1)" })
            .to(q("[data-idcard]"), { x: 0, y: 0, duration: 0.05, ease: "steps(1)" });
        } else if (i === 1) {
          tl.call(() => setPref(true), [], 0.25);
        } else if (i === 2) {
          tl.fromTo(q("[data-pin]"), { y: -90, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.35, ease: "steps(6)" }, 0.1)
            .to(q("[data-pin]"), { y: -18, duration: 0.12, ease: "steps(3)" })
            .to(q("[data-pin]"), { y: 0, duration: 0.12, ease: "steps(3)" });
        } else if (i === 3) {
          const xp = q("[data-xp]")[0] as HTMLElement;
          const n = { v: 0 };
          tl.to(n, { v: 120, duration: 1, ease: "steps(12)", onUpdate: () => (xp.textContent = `+${Math.round(n.v)}`) }, 0.1).fromTo(
            q("[data-xpstep]"),
            { autoAlpha: 0.15 },
            { autoAlpha: 1, duration: 0.01, stagger: 1 / 6 },
            0.1,
          );
        } else {
          tl.fromTo(q("[data-friend]"), { autoAlpha: 0, scale: 0 }, { autoAlpha: 1, scale: 1, duration: 0.14, ease: "steps(2)", stagger: 0.09, transformOrigin: "50% 50%" }, 0.1);
        }
        return tl;
      };
      const slap = (el: HTMLElement, i: number) =>
        gsap
          .timeline()
          .fromTo(el, { autoAlpha: 0, scale: 1.3 }, { autoAlpha: 1, scale: 1, duration: 0.28, ease: "steps(4)" })
          .add(toy(i));
      const hideToys = () => {
        gsap.set(q("[data-stamp], [data-pin], [data-friend]"), { autoAlpha: 0 });
        gsap.set(q("[data-xpstep]"), { autoAlpha: 0.15 });
        (q("[data-xp]")[0] as HTMLElement).textContent = "+0";
      };

      mm.add(MQ.desktop, () => {
        hideToys();
        const tl = gsap.timeline({ paused: true });
        notices().forEach((el, i) => tl.add(slap(el, i), i * 0.32));
        gsap.set(notices(), { autoAlpha: 0 });
        const grid = q("[data-notices]")[0] as HTMLElement;
        gsap.timeline({ scrollTrigger: { ...flowTrigger(grid, "80%"), onEnter: () => tl.play() } });
        return () => setPref(false);
      });
      mm.add(MQ.mobile, () => {
        hideToys();
        notices().forEach((el, i) => {
          gsap.set(el, { autoAlpha: 0 });
          const tl = slap(el, i).pause();
          gsap.timeline({ scrollTrigger: { ...flowTrigger(el, "85%"), onEnter: () => tl.play() } });
        });
        return () => setPref(false);
      });
      mm.add(MQ.reduce, () => setPref(true));
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <div ref={root} className="mx-auto max-w-[1280px] px-4 pb-20 pt-[calc(var(--wl-nav)+48px)] sm:px-8 lg:px-12 lg:pb-24 lg:pt-[calc(var(--wl-nav)+52px)]">
      <h2 id="wl-safety-t" className="max-w-[18ch] text-[clamp(2.3rem,4.8vw,4.4rem)] font-extrabold leading-[1.02] tracking-[-0.035em] text-merlot">
        Real life, with a playful system on top.
      </h2>

      <ul data-notices="" className="mt-12 grid gap-10 md:grid-cols-2 lg:mt-14 lg:grid-cols-6 lg:gap-x-8 lg:gap-y-12">
        <Notice i={0} rot={-1.6} bg="on-dark bg-merlot text-coconut" className="lg:col-span-2" title="Everyone’s verified." body="ID and a live photo at sign-up, so the person you meet is the person on the profile.">
          <div data-idcard="" className="relative" aria-hidden="true">
            <div className="px-corners flex items-center gap-3 bg-coconut p-3 text-merlot" style={{ "--step": "4px" } as React.CSSProperties}>
              <div className="w-[52px] shrink-0 bg-blue p-1">
                <PixelFox frame="happy" />
              </div>
              <div className="flex w-[96px] flex-col gap-2">
                <span className="h-2 w-full bg-merlot/80" />
                <span className="h-2 w-2/3 bg-merlot/25" />
                <span className="h-2 w-1/2 bg-merlot/25" />
              </div>
            </div>
            <span data-stamp="" className="font-px t-px1 absolute -right-6 -top-4 rotate-[-9deg] border-[3px] border-yellow bg-merlot px-2.5 py-1 tracking-[0.18em] text-yellow">
              Verified
            </span>
          </div>
        </Notice>

        <Notice i={1} rot={1.4} bg="bg-yellow text-merlot" className="lg:col-span-2" title="Your call on who." body="Set a gender preference on any quest you post.">
          <div className="flex items-center gap-4">
            <button
              type="button"
              role="switch"
              aria-checked={pref}
              aria-label="Gender preference"
              onClick={() => setPref((v) => !v)}
              className="cursor-pointer"
            >
              <svg viewBox="0 0 22 12" width="110" height="60" shapeRendering="crispEdges" aria-hidden="true">
                <path d="M2 0h18v1h1v1h1v8h-1v1h-1v1H2v-1H1v-1H0V2h1V1h1z" fill="#681B2B" />
                <path d="M2 2h18v8H2z" fill={pref ? "#B4D4FB" : "#F9F5E9"} />
                <g style={{ transform: `translateX(${pref ? 10 : 0}px)`, transition: "transform .24s steps(4)" }}>
                  <path d="M3 3h6v6H3z" fill="#681B2B" />
                  <path d="M4 4h2v2H4z" fill="#FEE571" />
                </g>
              </svg>
            </button>
            <span className="font-px t-px1 w-[11ch] tracking-[0.16em]" aria-hidden="true">
              {pref ? "Preference on" : "Preference off"}
            </span>
          </div>
        </Notice>

        <Notice i={2} rot={-1} bg="bg-blue text-merlot" className="lg:col-span-2" title="Meetup point, when you’re ready." body="You decide when the exact spot is shared.">
          <div className="flex flex-col items-center" aria-hidden="true">
            <svg data-pin="" viewBox="0 0 12 12" width="72" height="72" shapeRendering="crispEdges">
              <path d={PIN} fill="#681B2B" />
              <path d="M4 3h4v3H4z" fill="#FEE571" />
            </svg>
            <svg viewBox="0 0 14 2" width="70" height="10" shapeRendering="crispEdges" className="mt-1">
              <path d="M2 0h10v1h2v1H0V1h2z" fill="#681B2B" fillOpacity=".22" />
            </svg>
          </div>
        </Notice>

        <Notice i={3} rot={1.2} framed bg="bg-coconut text-merlot" className="lg:col-span-3" title="Show up, level up." body="Earn points for showing up and being someone people want to quest with again.">
          <div className="flex w-full items-end justify-center gap-8" aria-hidden="true">
            <p className="font-px t-px3 tabular leading-none">
              <span data-xp="">+120</span>
              <span className="t-px1 ml-2 align-top">XP</span>
            </p>
            <svg viewBox="0 0 30 24" width="120" height="96" shapeRendering="crispEdges">
              {[0, 1, 2, 3, 4, 5].map((n) => (
                <g key={n} data-xpstep="">
                  <path d={`M${n * 5} ${24 - (n + 1) * 4}h5v${(n + 1) * 4}h-5z`} fill="#681B2B" />
                  <path d={`M${n * 5 + 1} ${24 - (n + 1) * 4 + 1}h3v${(n + 1) * 4 - 1}h-3z`} fill="#FEE571" />
                </g>
              ))}
            </svg>
          </div>
        </Notice>

        <Notice i={4} rot={-1.3} bg="on-dark bg-merlot text-coconut" className="md:col-span-2 lg:col-span-3" title="Keep your circle." body="The people you’ve quested with stay close for the next plan.">
          <svg viewBox="0 0 24 24" width="120" height="120" shapeRendering="crispEdges" aria-hidden="true">
            <path d="M8 6h8v1h2v2h1v6h-1v2h-2v1H8v-1H6v-2H5V9h1V7h2zM8 7v1H7v1H6v6h1v1h1v1h8v-1h1v-1h1V9h-1V8h-1V7z" fill="#B4D4FB" fillRule="evenodd" />
            {FRIENDS.map(([x, y], k) => (
              <path key={k} data-friend="" d={head(x, y)} fill={k === 0 ? "#FEE571" : "#F9F5E9"} />
            ))}
            <path d="M10 10h4v4h-4z" fill="#FEE571" />
          </svg>
        </Notice>
      </ul>
    </div>
  );
}
