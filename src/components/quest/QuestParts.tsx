"use client";

import { useEffect, useRef, useState } from "react";
import { LAUNCH_ISO } from "@/config";
import { asset } from "@/lib/asset";
import { countdownLabel, useCountdown } from "@/lib/countdown";
import { gsap, ScrollTrigger, useGSAP, MQ, prefersReducedMotion } from "@/lib/gsap";
import { downloadLaunchIcs } from "@/lib/ics";
import { openContact, scrollToTarget } from "@/lib/store";
import type { FoxFrame } from "@/lib/fox";
import BigCountdown from "../BigCountdown";
import PixelDigit, { PixelColon } from "../PixelDigit";
import PixelFox from "../PixelFox";
import { Roll } from "../ui";
import { BOARD_LINE, HOW_STEPS, NIGHT_LINE, PARTY, QUESTS, SAFETY_ITEMS, WHY_LINES } from "./content";
import { CREATORS } from "@/lib/creators";
import { buildQuestMap, TILE } from "./mapgen";
import { earnXp, jumpTo, useRoute, useXp, XP_ORDER, type StopTarget } from "./questStore";
import { Inventory, PartySelect, QuestPopup } from "./Screens";
import { Vignette } from "./Vignettes";

function go(target: StopTarget, fallback: string) {
  if (!jumpTo(target)) scrollToTarget(fallback);
}

/** A fox that blinks (wink frame for 120ms) every 6 to 9 seconds. */
function useBlink(): FoxFrame {
  const [frame, setFrame] = useState<FoxFrame>("happy");
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    let u: ReturnType<typeof setTimeout>;
    const loop = () => {
      t = setTimeout(() => {
        setFrame("wink");
        u = setTimeout(() => {
          setFrame("happy");
          loop();
        }, 120);
      }, 6000 + Math.random() * 3000);
    };
    loop();
    return () => {
      clearTimeout(t);
      clearTimeout(u);
    };
  }, []);
  return frame;
}

/* ---------- Title screen ---------- */

const MENU = [
  { label: "Start", run: () => go("map", "#map") },
  { label: "How to play", run: () => go("how", "#plain-how") },
  { label: "Contact", run: () => openContact() },
];

export function QuestTitle() {
  const frame = useBlink();
  const [cursor, setCursor] = useState(0);
  const items = useRef<(HTMLButtonElement | null)[]>([]);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    e.preventDefault();
    const n = (cursor + (e.key === "ArrowDown" ? 1 : MENU.length - 1)) % MENU.length;
    setCursor(n);
    items.current[n]?.focus();
  };

  return (
    <section id="title" aria-labelledby="q-title" className="on-dark relative flex min-h-[100dvh] flex-col items-center justify-center bg-merlot px-4 pb-16 pt-28 text-center text-coconut">
      <div className="w-[164px] sm:w-[246px]">
        <PixelFox frame={frame} trackEyes followHead label="The Questita fox" />
      </div>
      <p className="q-logo font-px mt-6 text-coconut" aria-hidden="true">
        Questita
      </p>
      <h1 id="q-title" className="mt-5 text-[clamp(1.9rem,4.4vw,3.4rem)] font-extrabold leading-[1.05] tracking-[-0.035em]">
        Find the thing. <span className="text-yellow">Find your people.</span>
      </h1>
      <button type="button" onClick={() => go("map", "#map")} className="q-start font-px t-px2 mt-10 text-yellow">
        Press start
      </button>
      <ul className="q-menu mt-8 flex flex-col items-start gap-1" aria-label="Menu" onKeyDown={onKey}>
        {MENU.map((m, i) => (
          <li key={m.label} className="relative">
            <button
              ref={(el) => {
                items.current[i] = el;
              }}
              type="button"
              onClick={m.run}
              onPointerEnter={() => setCursor(i)}
              onFocus={() => setCursor(i)}
              className="font-px t-px1 flex min-h-[44px] items-center gap-3 px-2 text-coconut"
            >
              <span className={`q-cursor ${cursor === i ? "is-on" : ""}`} aria-hidden="true" />
              {m.label}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ---------- HUD ---------- */

function HudTimer() {
  const c = useCountdown(LAUNCH_ISO);
  return (
    <button type="button" onClick={() => scrollToTarget("#launch")} aria-label={`${countdownLabel(c)} Go to the save point.`} className="q-panel px-bg flex items-center gap-3 px-3 py-2 text-yellow">
      {c.launched ? (
        <span className="font-px t-px1">The board is open</span>
      ) : (
        <>
          <span className="font-px t-px1 hidden text-coconut-78 lg:inline">Board opens in</span>
          <span className="flex items-center gap-[3px] text-[21px]" aria-hidden="true">
            {c.dd.split("").map((ch, i) => (
              <PixelDigit key={`d${i}`} char={ch} />
            ))}
            <span className="font-px t-px1 ml-0.5 mr-1.5 leading-none">D</span>
            {c.hh.split("").map((ch, i) => (
              <PixelDigit key={`h${i}`} char={ch} />
            ))}
            <span className="px-[2px]">
              <PixelColon on={!c.ready || c.seconds % 2 === 0} />
            </span>
            {c.mm.split("").map((ch, i) => (
              <PixelDigit key={`m${i}`} char={ch} />
            ))}
            <span className="hidden items-center gap-[3px] sm:flex">
              <span className="px-[2px]">
                <PixelColon on={!c.ready || c.seconds % 2 === 0} />
              </span>
              {c.ss.split("").map((ch, i) => (
                <PixelDigit key={`s${i}`} char={ch} />
              ))}
            </span>
          </span>
        </>
      )}
    </button>
  );
}

export function QuestHud() {
  const xp = useXp();
  const route = useRoute();
  const [onMap, setOnMap] = useState(false);
  const [menu, setMenu] = useState(false);
  const hud = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const map = document.getElementById("map");
      if (!map) return;
      ScrollTrigger.create({ trigger: map, start: "top top", end: "bottom bottom", refreshPriority: -1, onToggle: (self) => setOnMap(self.isActive) });
    },
    { scope: hud },
  );

  useEffect(() => {
    if (!menu) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenu(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menu]);

  const run = (fn: () => void) => () => {
    setMenu(false);
    setTimeout(fn, 30);
  };

  return (
    <div ref={hud} className="q-hud">
      <div className="pointer-events-none fixed inset-x-0 top-0 z-50 flex items-start justify-between gap-3 px-3 pt-3 sm:px-6 sm:pt-4">
        <a href="#title" className="q-panel px-bg pointer-events-auto flex shrink-0 items-center gap-4 px-3 py-2.5" aria-label="Questita, back to the title screen">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={asset("/fox/Questita_wordmark_coconutmilk.svg")} alt="" width={1148} height={189} className="h-[16px] w-auto sm:h-[18px]" />
          <span className="font-px t-px1 hidden text-yellow lg:inline">Quest: find your people</span>
        </a>
        <div className="pointer-events-auto flex items-center gap-2">
          <HudTimer />
          <span className="hidden md:block">
            <button type="button" onClick={openContact} className="btn btn-yellow btn-sm font-px roll-host !min-h-[40px]">
              <span className="t-px1">
                <Roll>Get in touch</Roll>
              </span>
            </button>
          </span>
          <button
            type="button"
            className="q-panel px-bg grid h-11 w-11 place-items-center text-coconut md:hidden"
            aria-expanded={menu}
            aria-controls="q-menu"
            aria-label={menu ? "Close menu" : "Open menu"}
            onClick={() => setMenu((v) => !v)}
          >
            <span className={`burger ${menu ? "is-open" : ""}`} aria-hidden="true" />
          </button>
        </div>
      </div>

      {menu && (
        <div id="q-menu" className="fixed right-3 top-[64px] z-50 md:hidden">
          <div className="px-frame px-corners" style={{ "--step": "4px" } as React.CSSProperties}>
            <ul className="px-frame-in px-corners flex flex-col bg-coconut p-2" style={{ "--step": "3px" } as React.CSSProperties}>
              {[
                { l: "Start", f: () => go("map", "#map") },
                { l: "How to play", f: () => go("how", "#plain-how") },
                { l: "Save point", f: () => scrollToTarget("#launch") },
                { l: "Contact", f: () => openContact() },
              ].map((m) => (
                <li key={m.l}>
                  <button type="button" onClick={run(m.f)} className="font-px t-px1 flex min-h-[44px] w-full items-center px-3 text-left text-merlot">
                    {m.l}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className={`q-route ${onMap && route.active ? "is-on" : ""}`} role="img" aria-label={`The route: ${route.reached} of 4 signposts reached`}>
        <span className="font-px t-px1 text-yellow">The route</span>
        <span className="flex gap-1.5">
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className={`q-route-cell ${i < route.reached ? "is-full" : ""}`} />
          ))}
        </span>
      </div>

      <div className={`q-xp ${onMap && !route.active ? "is-on" : ""}`} aria-label={`Experience: ${xp * 10} of 100`} role="img">
        <span className="font-px t-px1 text-coconut">XP</span>
        <span className="flex gap-1">
          {XP_ORDER.map((id, i) => (
            <span key={id} className={`q-xp-cell ${i < xp ? "is-full" : ""}`} />
          ))}
        </span>
      </div>
    </div>
  );
}

/* ---------- Plain list of every stop (skip target, reduced motion, screen readers) ---------- */

function Panel({ speaker, frame, children }: { speaker: string; frame: FoxFrame; children: React.ReactNode }) {
  return (
    <div className="q-dialog-frame px-corners">
      <div className="q-dialog-in px-corners flex items-start gap-4">
        <div className="w-[62px] shrink-0" aria-hidden="true">
          <div className="px-corners bg-blue p-1.5" style={{ "--step": "3px" } as React.CSSProperties}>
            <PixelFox frame={frame} />
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-px t-px1 text-body">{speaker}</p>
          <div className="mt-1.5 text-[1.0625rem] font-semibold leading-snug text-merlot">{children}</div>
        </div>
      </div>
    </div>
  );
}

export function PlainStops() {
  return (
    <section id="plain-stops" tabIndex={-1} aria-label="The quest, as a list" className="q-plain">
      <div className="mx-auto flex max-w-[860px] flex-col gap-14 px-4 py-24 sm:px-8">
        <div>
          <h2 className="q-plain-h">Stop 1: Downtown</h2>
          <Panel speaker="Fox" frame="oops">
            <p>{WHY_LINES[0]}</p>
            <p className="mt-2">{WHY_LINES[1]}</p>
          </Panel>
        </div>
        <div>
          <h2 className="q-plain-h">Stop 2: Zamalek and the Nile</h2>
          <Panel speaker="Fox" frame="wow">
            <p>{BOARD_LINE}</p>
          </Panel>
          <ul className="q-sr-quests">
            {QUESTS.map((q) => (
              <li key={q.id}>
                {q.kind}: {q.title}. {q.area}, {q.day} {q.time}. {q.full ? "Full." : `${q.spots} spots left.`}
              </li>
            ))}
          </ul>
          <div className="q-reduced-only">
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {QUESTS.map((q) => (
                <QuestPopup key={q.id} quest={q} onClose={() => {}} inline />
              ))}
            </div>
          </div>
        </div>
        <div id="plain-how" tabIndex={-1}>
          <h2 className="q-plain-h">Stop 3: The route</h2>
          <div className="q-route-grid">
            {HOW_STEPS.map((h, i) => (
              <Vignette key={h.n} index={i} />
            ))}
          </div>
        </div>
        <div>
          <h2 className="q-plain-h">Stop 4: Night falls</h2>
          <Panel speaker="Fox" frame="happy">
            <p>{NIGHT_LINE}</p>
          </Panel>
        </div>
        <div className="q-sr-only-always">
          <h2>Stop 5: Inventory. Real life, with a playful system on top.</h2>
          <ul>
            {SAFETY_ITEMS.map((it) => (
              <li key={it.id}>
                {it.name} {it.desc}
              </li>
            ))}
          </ul>
          <h2>Stop 6: Choose your party. Built for Cairo, for 18 to 35.</h2>
          <ul>
            {PARTY.map((p) => (
              <li key={p.id}>{p.name}</li>
            ))}
          </ul>
          <p>Not a dating app. Not another feed to scroll. Just plans, with people.</p>
          <h2>The party: the crew behind the quest.</h2>
          <ul>
            {CREATORS.map((c) => (
              <li key={c.stem}>{c.role ? `${c.name}, ${c.role}` : c.name}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/** Reduced motion: the map as a static strip, shown before the stop panels. */
export function ReducedStrip() {
  const strip = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!prefersReducedMotion() || !strip.current) return;
    const m = buildQuestMap();
    const cv = strip.current;
    const y0 = 26 * TILE;
    const h = 24 * TILE;
    cv.width = m.canvas.width;
    cv.height = h;
    const g = cv.getContext("2d")!;
    g.imageSmoothingEnabled = false;
    g.drawImage(m.canvas, 0, y0, m.canvas.width, h, 0, 0, m.canvas.width, h);
  }, []);
  return (
    <div className="q-reduced-only bg-coconut pt-20">
      <canvas ref={strip} aria-hidden="true" className="pixelated block h-auto w-full" />
    </div>
  );
}

/** Reduced motion: the inventory and party select as normal sections. */
export function ReducedExtras() {
  return (
    <div className="q-reduced-only">
      <section aria-labelledby="inv-plain" className="bg-coconut px-4 py-16 sm:px-8">
        <div className="mx-auto max-w-[860px]">
          <Inventory titleId="inv-plain" />
        </div>
      </section>
      <section aria-labelledby="party-plain" className="bg-coconut px-4 pb-24 sm:px-8">
        <div className="mx-auto max-w-[860px]">
          <PartySelect titleId="party-plain" />
        </div>
      </section>
    </div>
  );
}

/* ---------- Save point ---------- */

function Crystal() {
  const M = "#681B2B";
  const B = "#B4D4FB";
  const K = "#F9F5E9";
  const rows: [number, number, number, string][] = [
    [0, 4, 4, M],
    [1, 3, 6, M],
    [2, 2, 8, M],
    [3, 1, 10, M],
    [4, 1, 10, M],
    [5, 2, 8, M],
    [6, 3, 6, M],
    [7, 4, 4, M],
  ];
  return (
    <svg viewBox="0 0 12 12" className="q-crystal h-full w-full" shapeRendering="crispEdges" aria-hidden="true" focusable="false">
      {rows.map(([y, x, w, c]) => (
        <rect key={y} x={x} y={y} width={w} height={1} fill={c} />
      ))}
      <rect x={4} y={2} width={4} height={4} fill={B} />
      <rect x={4} y={2} width={1} height={2} fill={K} />
      <rect x={3} y={9} width={6} height={1} fill={M} />
      <rect x={2} y={10} width={8} height={2} fill={M} />
    </svg>
  );
}

export function SavePoint() {
  const section = useRef<HTMLElement>(null);
  const c = useCountdown(LAUNCH_ISO);
  const [toast, setToast] = useState(false);

  useGSAP(
    () => {
      ScrollTrigger.create({ trigger: section.current, start: "top 60%", once: true, onEnter: () => earnXp("save") });
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        gsap.to(".q-crystal", { y: -6, duration: 0.5, ease: "steps(2)", repeat: -1, yoyo: true });
      });
      return () => mm.revert();
    },
    { scope: section },
  );

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(false), 1800);
    return () => clearTimeout(t);
  }, [toast]);

  return (
    <section id="launch" ref={section} aria-labelledby="save-title" className="relative bg-yellow px-4 pb-28 pt-28 text-merlot sm:px-8">
      <div className="mx-auto max-w-[1200px]">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14">
            <Crystal />
          </div>
          <p className="font-px t-px2">Save point</p>
        </div>
        <BigCountdown className="quest-counter mt-12" />
        <div className="mt-14 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <h2 id="save-title" className="max-w-[20ch] text-[clamp(1.9rem,4vw,3.6rem)] font-extrabold leading-[1.05] tracking-[-0.035em]">
            The board opens 30 November, midnight in Cairo.
          </h2>
          {!c.launched && (
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  downloadLaunchIcs();
                  setToast(true);
                }}
                className="btn btn-merlot roll-host"
              >
                <Roll>Add to calendar</Roll>
              </button>
              <p role="status" className={`q-toast font-px t-px1 ${toast ? "is-on" : ""}`}>
                {toast ? "Game saved" : ""}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/* ---------- Partners and credits ---------- */

export function QuestPartners() {
  return (
    <section id="contact" aria-labelledby="qp-title" className="on-dark bg-merlot px-4 py-14 text-coconut sm:px-8 lg:py-24">
      <div className="mx-auto max-w-[1200px]">
        <h2 id="qp-title" className="max-w-[16ch] text-[clamp(2rem,4.6vw,4rem)] font-extrabold leading-[1.04] tracking-[-0.035em]">
          Want to be part of the plan?
        </h2>
        <p className="mt-6 max-w-[34rem] text-[1.1875rem] font-medium leading-relaxed text-coconut-78">
          If you run a place, brand or product that belongs in a Cairo plan, we’d love to talk.
        </p>
        <button type="button" onClick={openContact} className="btn btn-yellow roll-host mt-10">
          <Roll>Get in touch</Roll>
        </button>
      </div>
    </section>
  );
}

export function Credits() {
  const footer = useRef<HTMLElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const [wave, setWave] = useState(false);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        gsap.fromTo(
          list.current,
          { y: () => 120 },
          {
            // Roll up from below and settle centred; if the roll is taller than
            // the screen, settle so the last line and the waving fox are in view.
            y: () => {
              const h = list.current!.offsetHeight;
              return Math.min(Math.max(96, (window.innerHeight - h) / 2), window.innerHeight - h - 32);
            },
            ease: "none",
            scrollTrigger: {
              trigger: footer.current,
              start: "top bottom",
              end: "bottom bottom",
              scrub: 0.6,
              invalidateOnRefresh: true,
              onUpdate: (self) => setWave(self.progress > 0.88),
            },
          },
        );
      });
      return () => mm.revert();
    },
    { scope: footer },
  );

  const link = "roll-host font-px t-px1 text-coconut";
  return (
    <footer ref={footer} className="q-credits on-dark relative bg-merlot text-coconut">
      <div className="q-credits-view">
        <div ref={list} className="flex flex-col items-center gap-7 px-4 text-center">
          <p className="font-px t-px1 text-coconut-78">The end, for now</p>
          <p className="q-logo font-px">Questita</p>
          <p className="max-w-[22ch] text-[1.5rem] font-extrabold leading-tight">For the people who make the big city feel smaller.</p>
          <div>
            <p className="font-px t-px1 text-yellow">Created by</p>
            <ul className="mt-4 flex flex-col gap-2">
              {CREATORS.map((c) => (
                <li key={c.stem} className="text-[1.125rem] font-bold">
                  {c.name}
                  {c.role && <span className="font-px t-px1 ml-3 text-coconut-78">{c.role}</span>}
                </li>
              ))}
            </ul>
          </div>
          <nav aria-label="Footer">
            <ul className="flex flex-col items-center gap-3">
              <li>
                <button type="button" onClick={() => go("board", "#plain-stops")} className={link}>
                  <Roll>The board</Roll>
                </button>
              </li>
              <li>
                <button type="button" onClick={() => go("how", "#plain-how")} className={link}>
                  <Roll>How to play</Roll>
                </button>
              </li>
              <li>
                <button type="button" onClick={openContact} className={link}>
                  <Roll>Get in touch</Roll>
                </button>
              </li>
            </ul>
          </nav>
          <div className="text-[0.9375rem] font-medium text-coconut-78">
            <p>Made in Cairo. Made by Anglet.</p>
            <p className="mt-2">© 2026 Questita. All rights reserved.</p>
          </div>
          <div className="w-[82px]">
            <PixelFox frame={wave ? "wink" : "happy"} label="The fox, waving goodbye" />
          </div>
        </div>
      </div>
    </footer>
  );
}
