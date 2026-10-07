"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useIdleGSAP } from "@/lib/gsap";
import { FOX, type FoxFrame } from "@/lib/fox";
import Wipe from "./Wipe";
import { SAFETY } from "./content";
import { FMQ, span, stepped, watchChapter } from "./filmKit";

const inOut = gsap.parseEase("power3.inOut");
const bounce = gsap.parseEase("bounce.out");
const steppedBounce = (t: number) => Math.round(bounce(t) * 6) / 6;
const BEAT0 = 0.12;
const N = 5;
const BEAT_LEN = (1 - BEAT0) / N;
const SEG_STEPS = 8;

const C = { merlot: "#681B2B", yellow: "#FEE571", blue: "#B4D4FB", coconut: "#F9F5E9" };

/** The fox as nested SVG paths (one per colour), for use inside the props. */
function FoxArt({ frame = "happy", x, y, w }: { frame?: FoxFrame; x: number; y: number; w: number }) {
  const sprite = FOX[frame];
  return (
    <svg x={x} y={y} width={w} height={(w * sprite.h) / sprite.w} viewBox={`0 0 ${sprite.w} ${sprite.h}`} shapeRendering="crispEdges">
      {sprite.layers.map((l) => (
        <path key={l.fill} fill={l.fill} d={l.rects.map(([rx, ry, rw, rh]) => `M${rx} ${ry}h${rw}v${rh}h-${rw}z`).join("")} />
      ))}
    </svg>
  );
}

/** A box with 1-unit stepped corners, as a path. */
const stepBox = (x: number, y: number, w: number, h: number, s = 1) =>
  `M${x + s} ${y}h${w - 2 * s}v${s}h${s}v${h - 2 * s}h-${s}v${s}h-${w - 2 * s}v-${s}h-${s}v-${h - 2 * s}h${s}z`;

// 12 x 12 map pin, row by row: [y, x0, x1] (same drawing as the main page's pin).
const PIN_ROWS: [number, number, number][] = [
  [0, 3, 8],
  [1, 2, 9],
  [2, 1, 10],
  [3, 0, 11],
  [4, 0, 11],
  [5, 0, 11],
  [6, 0, 11],
  [7, 1, 10],
  [8, 2, 9],
  [9, 3, 8],
  [10, 4, 7],
  [11, 5, 6],
];
const PIN_PATH = PIN_ROWS.map(([y, x0, x1]) => `M${x0} ${y}h${x1 - x0 + 1}v1h-${x1 - x0 + 1}z`).join("");

// 5 x 7 person sprite.
const PERSON = [".xxx.", ".xxx.", "..x..", "xxxxx", ".xxx.", ".x.x.", ".x.x."];
const PERSON_PATH = PERSON.flatMap((row, y) => row.split("").map((c, x) => (c === "x" ? `M${x} ${y}h1v1h-1z` : ""))).join("");
const RING = Array.from({ length: 8 }, (_, i) => {
  const a = (i / 8) * Math.PI * 2 - Math.PI / 2;
  return { x: Math.round(20 + Math.cos(a) * 14 - 2.5), y: Math.round(20 + Math.sin(a) * 14 - 3.5), c: [C.yellow, C.blue, C.coconut][i % 3] };
});

/* ---- Props (decorative; the copy carries the meaning) ------------------- */

function IdProp() {
  return (
    <div className="saf-id relative w-[82%]">
      <svg data-id-card viewBox="0 0 48 30" className="block h-auto w-full overflow-visible" shapeRendering="crispEdges">
        <path d={stepBox(0, 0, 48, 30)} fill={C.merlot} />
        <path d={stepBox(2, 2, 44, 26)} fill={C.coconut} />
        <path d={stepBox(4, 5, 15, 14)} fill={C.blue} />
        <FoxArt x={5} y={7} w={13} />
        <rect x={22} y={6} width={8} height={1} fill={C.merlot} opacity={0.35} />
        <rect x={22} y={8} width={18} height={2} fill={C.merlot} />
        <rect x={22} y={13} width={9} height={1} fill={C.merlot} opacity={0.35} />
        <rect x={22} y={15} width={14} height={2} fill={C.merlot} />
        <rect x={4} y={23} width={24} height={2} fill={C.merlot} opacity={0.15} />
        <rect x={30} y={23} width={6} height={2} fill={C.merlot} opacity={0.15} />
        <rect x={38} y={23} width={4} height={2} fill={C.yellow} />
      </svg>
      <span
        data-stamp
        className="saf-stamp font-px absolute -right-[6%] -top-[12%] whitespace-nowrap border-[4px] border-yellow bg-merlot px-4 py-1.5 text-yellow"
      >
        Verified
      </span>
    </div>
  );
}

function TogglePropArt() {
  return (
    <div className="flex w-[78%] flex-col items-center gap-[6%]">
      <svg viewBox="0 0 32 16" className="block h-auto w-full" shapeRendering="crispEdges">
        <path d={stepBox(0, 0, 32, 16)} fill={C.merlot} />
        <path data-track d={stepBox(2, 2, 28, 12)} fill={C.yellow} />
        <rect data-knob x={20} y={4} width={8} height={8} fill={C.merlot} />
      </svg>
      <p className="saf-prop-label font-px text-merlot">
        <span data-pref>Preference on</span>
      </p>
    </div>
  );
}

function PinProp() {
  return (
    <svg viewBox="0 0 32 32" className="block h-auto w-[86%]" shapeRendering="crispEdges">
      {/* streets on a blue block map */}
      {[3, 13, 23].map((v) => (
        <g key={v}>
          <rect x={0} y={v} width={32} height={2} fill={C.coconut} />
          <rect x={v + 4} y={0} width={2} height={32} fill={C.coconut} />
        </g>
      ))}
      <rect x={1} y={6} width={5} height={5} fill={C.merlot} opacity={0.18} />
      <rect x={20} y={16} width={6} height={5} fill={C.merlot} opacity={0.18} />
      <rect x={9} y={26} width={7} height={4} fill={C.merlot} opacity={0.18} />
      <rect data-shadow x={11} y={25} width={10} height={1} fill={C.merlot} opacity={0.3} />
      <g data-pin>
        <g transform="translate(10 12)">
          <path d={PIN_PATH} fill={C.merlot} />
          <rect x={4} y={3} width={4} height={3} fill={C.yellow} />
        </g>
      </g>
    </svg>
  );
}

function XpProp() {
  return (
    <div className="flex w-[84%] flex-col items-start gap-[8%]">
      <p className="saf-xp font-px tabular leading-none text-merlot">
        +<span data-xp>120</span>
        <span className="saf-xp-unit">XP</span>
      </p>
      <svg viewBox="0 0 36 18" className="block h-auto w-full" shapeRendering="crispEdges">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <g key={i} data-step>
            <rect x={i * 6} y={18 - (i + 1) * 3} width={6} height={(i + 1) * 3} fill={C.merlot} />
            <rect x={i * 6 + 1} y={18 - (i + 1) * 3 + 1} width={4} height={(i + 1) * 3 - 1} fill={C.yellow} />
          </g>
        ))}
      </svg>
    </div>
  );
}

function CircleProp() {
  return (
    <svg viewBox="0 0 40 40" className="block h-auto w-[86%]" shapeRendering="crispEdges">
      <FoxArt frame="wink" x={12} y={13.5} w={16} />
      {RING.map((p, i) => (
        <g key={i} data-person transform={`translate(${p.x} ${p.y})`}>
          <path d={PERSON_PATH} fill={p.c} />
        </g>
      ))}
    </svg>
  );
}

const PROPS = [
  { el: <IdProp />, bg: "bg-merlot" },
  { el: <TogglePropArt />, bg: "bg-yellow" },
  { el: <PinProp />, bg: "bg-blue" },
  { el: <XpProp />, bg: "bg-yellow" },
  { el: <CircleProp />, bg: "bg-merlot" },
];

/**
 * Safety, pinned, five beats. A title card docks top-left, then each beat
 * swaps a big rect-built pixel prop with an 8-step wipe and reveals its title
 * and line through masks; each prop plays its own toy (stamp slams, toggle
 * flips, pin drops, XP counts, the circle gathers). A 5-segment strip fills
 * along the bottom. Reduced motion: static stacked panels in final state.
 */
export default function SafetyChapter() {
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const title = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);

  useIdleGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(FMQ.pin, () => {
        const st = stage.current!;
        const tt = title.current!;
        const beats = gsap.utils.toArray<HTMLElement>("[data-sbeat]", st);
        const props = beats.map((b) => b.querySelector<HTMLElement>("[data-prop]")!);
        const rises = beats.map((b) => b.querySelectorAll<HTMLElement>("[data-rise]"));
        const fills = gsap.utils.toArray<HTMLElement>("[data-fill]", bar.current);
        const q = (i: number, sel: string) => beats[i].querySelectorAll<Element>(sel);

        beats.forEach((b, i) => {
          gsap.set(props[i], { clipPath: "inset(100% 0% 0% 0%)" });
          gsap.set(rises[i], { yPercent: 110 });
          gsap.set(b, { autoAlpha: 0 });
        });
        gsap.set(bar.current, { autoAlpha: 0 });

        // Each prop's toy, from its start state. Returns the timeline so it can be killed.
        const toys: (() => gsap.core.Timeline)[] = [
          () =>
            gsap
              .timeline({ delay: 0.5 })
              .fromTo(
                q(0, "[data-stamp]"),
                { scale: 2.4, rotation: -22, autoAlpha: 0 },
                { scale: 1, rotation: -8, autoAlpha: 1, duration: 0.24, ease: "steps(3)" },
              )
              .to(q(0, "[data-id-card]"), { keyframes: [{ x: -7 }, { x: 6 }, { x: 0 }], duration: 0.15, ease: "steps(1)" }),
          () => {
            const label = q(1, "[data-pref]")[0];
            label.textContent = "Preference off";
            return gsap
              .timeline({ delay: 0.55 })
              .fromTo(q(1, "[data-knob]"), { attr: { x: 4 } }, { attr: { x: 20 }, duration: 0.32, ease: "steps(4)" })
              .set(q(1, "[data-knob]"), { attr: { fill: C.merlot } })
              .set(q(1, "[data-track]"), { attr: { fill: C.yellow } })
              .call(() => (label.textContent = "Preference on"));
          },
          () =>
            gsap
              .timeline({ delay: 0.45 })
              .fromTo(q(2, "[data-pin]"), { y: -30 }, { y: 0, duration: 0.6, ease: steppedBounce })
              .fromTo(q(2, "[data-shadow]"), { scaleX: 0.3, transformOrigin: "50% 50%" }, { scaleX: 1, duration: 0.6, ease: "steps(4)" }, "<"),
          () => {
            const out = q(3, "[data-xp]")[0];
            const n = { v: 0 };
            out.textContent = "0";
            return gsap
              .timeline({ delay: 0.45 })
              .fromTo(q(3, "[data-step]"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.01, stagger: 0.1, ease: "none" })
              .to(n, { v: 120, duration: 0.6, ease: "steps(12)", onUpdate: () => (out.textContent = String(Math.round(n.v))) }, 0);
          },
          () => gsap.timeline({ delay: 0.45 }).fromTo(q(4, "[data-person]"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.01, stagger: 0.08, ease: "none" }),
        ];
        const resets: (() => void)[] = [
          () => gsap.set(q(0, "[data-stamp]"), { autoAlpha: 0 }),
          () => {
            q(1, "[data-pref]")[0].textContent = "Preference off";
            gsap.set(q(1, "[data-knob]"), { attr: { x: 4, fill: C.merlot } });
            gsap.set(q(1, "[data-track]"), { attr: { fill: C.coconut } });
          },
          () => gsap.set(q(2, "[data-pin]"), { y: -30 }),
          () => gsap.set(q(3, "[data-step]"), { autoAlpha: 0 }),
          () => gsap.set(q(4, "[data-person]"), { autoAlpha: 0 }),
        ];
        resets.forEach((r) => r());

        let x0 = 0;
        let y0 = 0;
        let K = 0.3;
        let active = -1;
        let toy: gsap.core.Timeline | null = null;
        let chromeOn = false;
        const lastFill = fills.map(() => -1);

        const measure = () => {
          const W = st.offsetWidth;
          const H = st.offsetHeight;
          x0 = (W - tt.offsetWidth) / 2 - tt.offsetLeft;
          y0 = (H - tt.offsetHeight) / 2 - tt.offsetTop;
          const h2 = tt.querySelector("h2")!;
          K = Math.min(1, (W < 400 ? 18 : W < 640 ? 22 : 28) / parseFloat(getComputedStyle(h2).fontSize));
        };

        const activate = (next: number) => {
          if (next === active) return;
          const prev = active;
          const dir = next > prev ? 1 : -1;
          active = next;
          if (prev >= 0) {
            gsap.to(props[prev], { clipPath: dir > 0 ? "inset(0% 0% 100% 0%)" : "inset(100% 0% 0% 0%)", duration: 0.4, ease: "steps(8)", overwrite: true });
            gsap.to(rises[prev], { yPercent: -110 * dir, duration: 0.5, ease: "expo.in", stagger: 0.03, overwrite: true });
            gsap.set(beats[prev], { autoAlpha: 0, delay: 0.5, overwrite: true });
          }
          toy?.kill();
          toy = null;
          if (next < 0) return;
          gsap.set(beats[next], { autoAlpha: 1, overwrite: true });
          resets[next]();
          gsap.fromTo(
            props[next],
            { clipPath: dir > 0 ? "inset(100% 0% 0% 0%)" : "inset(0% 0% 100% 0%)" },
            { clipPath: "inset(0% 0% 0% 0%)", duration: 0.48, ease: "steps(8)", delay: prev >= 0 ? 0.16 : 0, overwrite: true },
          );
          gsap.fromTo(rises[next], { yPercent: 110 * dir }, { yPercent: 0, duration: 0.85, ease: "expo.out", stagger: 0.07, delay: 0.22, overwrite: true });
          toy = toys[next]();
        };

        const render = (p: number) => {
          const pt = inOut(span(p, 0.05, BEAT0));
          tt.style.transform = `translate3d(${(x0 * (1 - pt)).toFixed(1)}px, ${(y0 * (1 - pt)).toFixed(1)}px, 0) scale(${(1 + (K - 1) * pt).toFixed(4)})`;
          const on = p >= BEAT0;
          if (on !== chromeOn) {
            chromeOn = on;
            gsap.to(bar.current, { autoAlpha: on ? 1 : 0, duration: 0.2, ease: "steps(2)", overwrite: true });
          }
          activate(on ? Math.min(N - 1, Math.floor((p - BEAT0) / BEAT_LEN)) : -1);
          fills.forEach((f, i) => {
            const v = stepped(span(p, BEAT0 + i * BEAT_LEN, BEAT0 + (i + 1) * BEAT_LEN), SEG_STEPS);
            if (v === lastFill[i]) return;
            lastFill[i] = v;
            f.style.transform = `scaleX(${v})`;
          });
        };

        measure();
        render(0);
        const trig = ScrollTrigger.create({
          trigger: section.current,
          start: "top top",
          end: () => `+=${Math.round(window.innerHeight * 5)}`,
          pin: st,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => render(self.progress),
          onRefresh: (self) => {
            measure();
            lastFill.fill(-1);
            render(self.progress);
          },
        });

        return () => {
          trig.kill();
          toy?.kill();
          [tt, bar.current!, ...beats, ...props, ...fills].forEach((el) => el.removeAttribute("style"));
          rises.forEach((r) => r.forEach((el) => el.removeAttribute("style")));
        };
      });

      watchChapter(section.current!, 4, "light");
      return () => mm.revert();
    },
    { scope: section },
  );

  return (
    <section id="safety" ref={section} aria-labelledby="safety-title" className="film-chapter relative z-[5] bg-coconut text-merlot">
      <Wipe color="coconut" />
      <div ref={stage} className="saf-stage">
        <div ref={title} className="saf-title">
          <h2 id="safety-title" className="saf-h2 font-extrabold">
            {SAFETY.title}
          </h2>
        </div>

        <ol className="saf-beats">
          {SAFETY.points.map((s, i) => (
            <li key={s.title} data-sbeat className="saf-beat">
              <div data-prop aria-hidden="true" className="saf-prop">
                <div className={`px-corners flex h-full w-full items-center justify-center ${PROPS[i].bg}`} style={{ "--step": "10px" } as React.CSSProperties}>
                  {PROPS[i].el}
                </div>
              </div>
              <div className="saf-text">
                <div className="overflow-hidden">
                  <p data-rise className="font-px t-px1 tracking-[0.3em] text-body">
                    {String(i + 1).padStart(2, "0")} / {String(N).padStart(2, "0")}
                  </p>
                </div>
                <div className="split-mask mt-4 overflow-hidden">
                  <h3 data-rise className="saf-h3 font-extrabold">
                    {s.title}
                  </h3>
                </div>
                <div className="mt-4 overflow-hidden lg:mt-6">
                  <p data-rise className="saf-body font-medium">
                    {s.body}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ol>

        <div ref={bar} className="saf-bar" aria-hidden="true">
          {SAFETY.points.map((s) => (
            <span key={s.title} className="saf-seg">
              <span data-fill className="saf-seg-fill" />
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
