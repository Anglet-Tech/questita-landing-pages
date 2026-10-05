"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger, useGSAP, MQ } from "@/lib/gsap";
import { scrollToTarget } from "@/lib/store";
import type { FoxFrame } from "@/lib/fox";
import PixelFox from "../PixelFox";
import Dialog from "./Dialog";
import { Inventory, PartySelect, QuestPopup } from "./Screens";
import { BOARD_LINE, HOW_STEPS, NIGHT_LINE, QUESTS, WHY_LINES } from "./content";
import { buildQuestMap, C, computeLayout, pointAt, WORLD_H, WORLD_W, type QuestLayout, type StopId } from "./mapgen";
import { earnXp, registerJumper, setRoute, type StopTarget, type XpId } from "./questStore";
import { Vignette } from "./Vignettes";

/* ---------- Scroll beats: walks between stops, dwells at stops ---------- */

type Beat =
  | { k: "walk"; a: number | StopId | "routeStart" | "routeEnd"; b: number | StopId | "routeStart" | "routeEnd"; w: number }
  | { k: "dwell"; stop: StopId; w: number }
  | { k: "route"; w: number };

const BEATS: Beat[] = [
  { k: "walk", a: 0, b: "why", w: 0.5 },
  { k: "dwell", stop: "why", w: 1.0 },
  { k: "walk", a: "why", b: "board", w: 0.7 },
  { k: "dwell", stop: "board", w: 1.5 },
  { k: "walk", a: "board", b: "routeStart", w: 0.4 },
  { k: "route", w: 4.0 }, // about 100vh per signpost
  { k: "walk", a: "routeEnd", b: "night", w: 0.3 },
  { k: "dwell", stop: "night", w: 1.0 },
  { k: "walk", a: "night", b: "inventory", w: 0.3 },
  { k: "dwell", stop: "inventory", w: 1.4 },
  { k: "walk", a: "inventory", b: "party", w: 0.4 },
  { k: "dwell", stop: "party", w: 1.4 },
  { k: "walk", a: "party", b: 1, w: 0.3 },
];
const TOTAL_W = BEATS.reduce((s, b) => s + b.w, 0);
const BEAT_START = BEATS.reduce<number[]>((acc, b, i) => (acc.push(i ? acc[i - 1] + BEATS[i - 1].w : 0), acc), []).map((s) => s / TOTAL_W);

interface Frame {
  pathT: number;
  beat: number;
  f: number;
  stop: StopId | null;
  sign: number; // index of the last signpost passed on the route, -1 before
  night: number; // 0..1
  onRoute: boolean;
  risen: number; // signposts that have risen out of the ground
}

const ROUTE_BEAT = BEATS.findIndex((b) => b.k === "route");

function tOf(m: QuestLayout, k: number | StopId | "routeStart" | "routeEnd") {
  if (typeof k === "number") return k;
  if (k === "routeStart") return m.routeStart;
  if (k === "routeEnd") return m.routeEnd;
  return m.stops[k].t;
}

function evaluate(m: QuestLayout, p: number): Frame {
  let i = BEAT_START.length - 1;
  while (i > 0 && BEAT_START[i] > p) i--;
  const b = BEATS[i];
  const end = i + 1 < BEAT_START.length ? BEAT_START[i + 1] : 1;
  const f = Math.max(0, Math.min(1, (p - BEAT_START[i]) / (end - BEAT_START[i] || 1)));
  const nightBeat = BEATS.findIndex((x) => x.k === "dwell" && x.stop === "night");
  const night = i < nightBeat ? 0 : i === nightBeat ? Math.min(1, f / 0.45) : 1;
  const after = i > ROUTE_BEAT;
  if (b.k === "dwell") return { pathT: m.stops[b.stop].t, beat: i, f, stop: b.stop, sign: after ? 4 : -1, night, onRoute: false, risen: after ? 4 : 0 };
  if (b.k === "route") {
    const pathT = m.routeStart + (m.routeEnd - m.routeStart) * f;
    const approach = (m.routeEnd - m.routeStart) * 0.1;
    let sign = -1;
    let risen = 0;
    m.signposts.forEach((s, j) => {
      if (pathT >= s.t) sign = j;
      if (pathT >= s.t - approach) risen = j + 1;
    });
    return { pathT, beat: i, f, stop: null, sign, night, onRoute: true, risen };
  }
  const a = tOf(m, b.a);
  const z = tOf(m, b.b);
  return { pathT: a + (z - a) * f, beat: i, f, stop: null, sign: after ? 4 : -1, night, onRoute: false, risen: after ? 4 : 0 };
}

const JUMP: Record<StopTarget, number> = {
  map: 0,
  why: BEATS.findIndex((b) => b.k === "dwell" && b.stop === "why"),
  board: BEATS.findIndex((b) => b.k === "dwell" && b.stop === "board"),
  how: BEATS.findIndex((b) => b.k === "route"),
  night: BEATS.findIndex((b) => b.k === "dwell" && b.stop === "night"),
  inventory: BEATS.findIndex((b) => b.k === "dwell" && b.stop === "inventory"),
  party: BEATS.findIndex((b) => b.k === "dwell" && b.stop === "party"),
};

interface Ui {
  dialog: { text: string; frame: FoxFrame; speaker: string } | null;
  overlay: "inventory" | "party" | null;
  markers: boolean;
  pop: StopId | null;
  signs: number;
  risen: number;
  active: number; // the open vignette (-1 when none)
}

/* ---------- The scene ---------- */

export default function QuestMap() {
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const world = useRef<HTMLDivElement>(null);
  const foxEl = useRef<HTMLDivElement>(null);
  const popupWrap = useRef<HTMLDivElement>(null);
  const vigWrap = useRef<HTMLDivElement>(null);
  const xpLayer = useRef<HTMLDivElement>(null);
  // Layout is pure (safe during render); the canvas is drawn client side below.
  const data = computeLayout();
  const [scale, setScale] = useState(3);
  const [popup, setPopup] = useState<string | null>(null);
  const [ui, setUi] = useState<Ui>({ dialog: null, overlay: null, markers: false, pop: null, signs: 0, risen: 0, active: -1 });
  const popupRef = useRef<string | null>(null);
  useEffect(() => {
    popupRef.current = popup;
  }, [popup]);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        // The map is drawn after first paint, in an idle slot; until then the
        // stage shows plain coconut. The pin and scroll length exist immediately.
        let lastSig = "";
        let frame: Frame = evaluate(data, 0);
        // Ribbon samples along the route stretch, about every 3 base px.
        const ribbon: { t: number; x: number; y: number }[] = [];
        {
          const span = data.routeEnd - data.routeStart;
          const steps = 1200;
          for (let k = 0; k <= steps; k++) {
            const t = data.routeStart + (span * k) / steps;
            const p = pointAt(data, t);
            const prev = ribbon[ribbon.length - 1];
            if (!prev || Math.hypot(prev.x - p.x, prev.y - p.y) >= 3) ribbon.push({ t, x: Math.round(p.x), y: Math.round(p.y) });
          }
        }
        let ribbonT = data.routeStart;
        let map: ReturnType<typeof buildQuestMap> | null = null;
        let rows: { x: number; y: number; t: number }[][] = [];
        const ric =
          (window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }).requestIdleCallback ??
          ((cb: () => void) => window.setTimeout(cb, 1));
        ric(
          () => {
            map = buildQuestMap();
            // Bucket window pixels into 64px bands so night only scans visible rows.
            rows = [];
            for (const w of map.windows) (rows[Math.floor(w.y / 64)] ??= []).push(w);
            render();
          },
          { timeout: 1200 },
        );
        const cv = canvasRef.current!;
        const ctx = cv.getContext("2d")!;
        let W = 0;
        let H = 0;
        let s = 3;
        let base = 3;
        let dpr = 1;
        const resize = () => {
          dpr = Math.min(window.devicePixelRatio || 1, 1.5);
          W = stage.current!.clientWidth;
          H = stage.current!.clientHeight;
          base = W < 768 ? 2 : 3;
          s = base + (frame.onRoute ? 1 : 0);
          setScale(s);
          cv.width = Math.round(W * dpr);
          cv.height = Math.round(H * dpr);
          cv.style.width = `${W}px`;
          cv.style.height = `${H}px`;
          lastSig = "";
        };
        resize();

        let fox = pointAt(data, 0);
        const cam = { ...fox };
        let last = performance.now();
        let lastFox = { ...fox };
        let facing = 1;
        let moving = 0;
        const trail: { x: number; y: number; age: number }[] = [];
        let sx = 0;
        let sy = 0;
        let ui0: Ui = { dialog: null, overlay: null, markers: false, pop: null, signs: 0, risen: 0, active: -1 };
        const signXp: XpId[] = ["how-1", "how-2", "how-3", "how-4"];

        const syncUi = () => {
          const st = frame.stop;
          let dialog: Ui["dialog"] = null;
          if (st === "why") dialog = frame.f < 0.5 ? { text: WHY_LINES[0], frame: "oops", speaker: "Fox" } : { text: WHY_LINES[1], frame: "happy", speaker: "Fox" };
          else if (st === "board") dialog = { text: BOARD_LINE, frame: "wow", speaker: "Fox" };
          else if (st === "night") dialog = { text: NIGHT_LINE, frame: "happy", speaker: "Fox" };
          const next: Ui = {
            dialog,
            overlay: st === "inventory" ? "inventory" : st === "party" ? "party" : null,
            markers: st === "board",
            pop: st && st !== "board" && st !== "inventory" && st !== "party" ? st : null,
            signs: Math.max(0, Math.min(4, frame.sign + 1)),
            risen: frame.risen,
            active: frame.onRoute ? frame.sign : -1,
          };
          const same =
            next.overlay === ui0.overlay &&
            next.markers === ui0.markers &&
            next.pop === ui0.pop &&
            next.signs === ui0.signs &&
            next.risen === ui0.risen &&
            next.active === ui0.active &&
            (next.dialog?.text ?? "") === (ui0.dialog?.text ?? "");
          if (!same) {
            ui0 = next;
            setUi(next);
          }
          if (st && st !== "board") earnXp(st as XpId);
          if (st === "board") earnXp("board");
          for (let k = 0; k < next.signs; k++) earnXp(signXp[k]);
          if (!next.markers && popupRef.current) setPopup(null);
          setRoute(frame.onRoute, next.signs);
        };

        const render = () => {
          const now = performance.now();
          const dt = Math.min(0.05, (now - last) / 1000);
          last = now;
          // The Route zooms in one integer step, so pixels stay crisp.
          const want = base + (frame.onRoute ? 1 : 0);
          if (want !== s) {
            s = want;
            setScale(s);
            lastSig = "";
          }
          // The ribbon grows ahead to the next sign and stays drawn afterwards.
          const ribbonTarget = frame.onRoute
            ? frame.sign < 3
              ? data.signposts[frame.sign + 1].t
              : data.routeEnd
            : frame.beat > ROUTE_BEAT
              ? data.routeEnd
              : data.routeStart;
          ribbonT += (ribbonTarget - ribbonT) * Math.min(1, dt * 2.5);
          if (Math.abs(ribbonTarget - ribbonT) < 0.0004) ribbonT = ribbonTarget;
          const target = pointAt(data, frame.pathT);
          // Fox follows the path with a small lag so steps read as walking.
          fox = { x: fox.x + (target.x - fox.x) * Math.min(1, dt * 12), y: fox.y + (target.y - fox.y) * Math.min(1, dt * 12) };
          const dx = fox.x - lastFox.x;
          const dist = Math.hypot(dx, fox.y - lastFox.y);
          if (Math.abs(dx) > 0.15) facing = dx > 0 ? 1 : -1;
          moving = dist > 0.05 ? 0.25 : Math.max(0, moving - dt);
          if (dist > 0.05) {
            const lt = trail[trail.length - 1];
            if (!lt || Math.hypot(lt.x - fox.x, lt.y - fox.y) > 7) trail.push({ x: Math.round(fox.x), y: Math.round(fox.y), age: 0 });
          }
          lastFox = fox;

          // Camera: follow the fox, frame the landmark at a stop.
          // On the route, frame both the fox and the sign whose vignette is open.
          let focus = frame.stop ? data.stops[frame.stop].focus : fox;
          if (frame.onRoute && frame.sign >= 0) {
            const sp = data.signposts[frame.sign].at;
            focus = { x: (fox.x + sp.x) / 2, y: (fox.y + sp.y - 20) / 2 };
          }
          cam.x += (focus.x - cam.x) * Math.min(1, dt * 4);
          cam.y += (focus.y - cam.y) * Math.min(1, dt * 4);
          const vw = W / s;
          const vh = H / s;
          sx = Math.max(0, Math.min(WORLD_W - vw, cam.x - vw / 2));
          // On mobile the route card docks at the bottom: frame the action higher.
          const anchorY = frame.onRoute && W < 768 ? 0.3 : 0.4;
          sy = Math.max(0, Math.min(WORLD_H - vh, cam.y - vh * anchorY));
          sx = Math.round(sx * s) / s;
          sy = Math.round(sy * s) / s;

          // Nothing moved since the last frame: skip the blit and the DOM writes.
          const sig = `${sx}|${sy}|${Math.round(fox.x * 4)}|${Math.round(fox.y * 4)}|${frame.night}|${trail.length}|${moving > 0}|${map ? 1 : 0}|${W}x${H}|${s}|${ribbonT.toFixed(5)}`;
          if (sig === lastSig && trail.length === 0 && moving <= 0) return;
          lastSig = sig;

          ctx.setTransform(s * dpr, 0, 0, s * dpr, 0, 0);
          ctx.imageSmoothingEnabled = false;
          ctx.globalAlpha = 1;
          if (map) ctx.drawImage(map.canvas, sx, sy, vw, vh, 0, 0, vw, vh);
          else {
            ctx.fillStyle = C.coconut;
            ctx.fillRect(0, 0, vw, vh);
          }

          // Footprints fade in three steps.
          for (let i = trail.length - 1; i >= 0; i--) {
            const p = trail[i];
            p.age += dt;
            if (p.age > 1.4) {
              trail.splice(i, 1);
              continue;
            }
            ctx.globalAlpha = p.age < 0.5 ? 0.55 : p.age < 0.9 ? 0.35 : 0.15;
            ctx.fillStyle = C.merlot;
            ctx.fillRect(Math.round(p.x - sx) - 1, Math.round(p.y - sy) + 2, 2, 1);
          }
          ctx.globalAlpha = 1;

          // Night: a merlot-700 overlay, then windows and lamps light one by one.
          if (map && frame.night > 0) {
            ctx.globalAlpha = 0.66 * frame.night;
            ctx.fillStyle = C.night;
            ctx.fillRect(0, 0, vw, vh);
            ctx.globalAlpha = 1;
            ctx.fillStyle = C.yellow;
            const r0 = Math.max(0, Math.floor(sy / 64));
            const r1 = Math.floor((sy + vh) / 64);
            for (let ri = r0; ri <= r1; ri++) for (const w of rows[ri] ?? []) {
              if (w.t > frame.night) continue;
              const x = w.x - sx;
              const y = w.y - sy;
              if (x < -2 || y < -2 || x > vw || y > vh) continue;
              ctx.fillRect(x, y, 2, 2);
            }
            for (const l of map.lamps) {
              if (l.t > frame.night * 1.1) continue;
              const x = l.x - sx;
              const y = l.y - sy;
              if (x < -4 || y < -4 || x > vw || y > vh) continue;
              ctx.fillRect(x, y, 4, 3);
            }
          }

          // The route ribbon: a merlot pass then a yellow pass, above the night overlay.
          if (ribbonT > data.routeStart + 0.0001) {
            ctx.fillStyle = C.merlot;
            for (const r of ribbon) {
              if (r.t > ribbonT) break;
              ctx.fillRect(r.x - sx - 2, r.y - sy - 2, 5, 5);
            }
            ctx.fillStyle = C.yellow;
            for (const r of ribbon) {
              if (r.t > ribbonT) break;
              ctx.fillRect(r.x - sx - 1, r.y - sy - 1, 3, 3);
            }
          }

          // DOM layer follows the camera; the fox gets a two-frame bob while moving.
          gsap.set(world.current, { x: -sx * s, y: -sy * s });
          const bob = moving > 0 && Math.floor(now / 160) % 2 ? -2 : 0;
          gsap.set(foxEl.current, { x: fox.x * s, y: fox.y * s + bob, scaleX: facing });

          // Desktop: the open vignette sits beside its signpost.
          if (frame.onRoute && frame.sign >= 0 && vigWrap.current && W >= 768) {
            const sp = data.signposts[frame.sign].at;
            const x = (sp.x - sx) * s;
            const y = (sp.y - sy) * s;
            const vw2 = vigWrap.current.offsetWidth;
            const vh2 = vigWrap.current.offsetHeight;
            const left = x + 80 + vw2 > W - 24 ? x - 80 - vw2 : x + 80;
            gsap.set(vigWrap.current, { x: Math.max(24, left), y: Math.max(96, Math.min(H - vh2 - 32, y - vh2 / 2)) });
          }

          // Desktop: the quest popup sits next to its marker.
          if (popupRef.current && popupWrap.current && W >= 768) {
            const mk = data.markers.find((m) => m.id === popupRef.current);
            if (mk) {
              const x = (mk.at.x - sx) * s;
              const y = (mk.at.y - sy) * s;
              const pw = popupWrap.current.offsetWidth;
              const left = x + 36 + pw > W - 16 ? x - 36 - pw : x + 36;
              gsap.set(popupWrap.current, { x: Math.max(16, left), y: Math.max(90, Math.min(H - popupWrap.current.offsetHeight - 200, y - 80)) });
            }
          }
        };

        let running = false;
        const start = () => {
          if (running) return;
          running = true;
          last = performance.now();
          gsap.ticker.add(render);
        };
        const stop = () => {
          running = false;
          gsap.ticker.remove(render);
        };

        const st = ScrollTrigger.create({
          trigger: section.current,
          start: "top top",
          end: () => `+=${Math.round(TOTAL_W * 100)}%`,
          pin: stage.current,
          scrub: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            frame = evaluate(data, self.progress);
            syncUi();
          },
          onToggle: (self) => (self.isActive ? start() : stop()),
          onRefresh: (self) => {
            resize();
            frame = evaluate(data, self.progress);
            fox = pointAt(data, frame.pathT);
            render();
          },
        });
        render();
        if (st.isActive) start();

        registerJumper((target) => {
          const at = st.start + (st.end - st.start) * (BEAT_START[JUMP[target]] + (target === "map" ? 0 : 0.012));
          scrollToTarget(at);
          return true;
        });

        const onXp = () => {
          const layer = xpLayer.current;
          if (!layer) return;
          const el = document.createElement("span");
          el.className = "q-xp-pop font-px t-px1";
          el.textContent = "+10 XP";
          layer.appendChild(el);
          gsap.set(el, { x: (fox.x - sx) * s, y: (fox.y - sy) * s - 70 });
          gsap.to(el, { y: "-=46", opacity: 0, duration: 1, ease: "steps(6)", onComplete: () => el.remove() });
        };
        window.addEventListener("quest:xp", onXp);
        window.addEventListener("resize", resize);

        return () => {
          stop();
          st.kill();
          registerJumper(null);
          window.removeEventListener("quest:xp", onXp);
          window.removeEventListener("resize", resize);
        };
      });
      return () => mm.revert();
    },
    { scope: section },
  );

  // Close an open quest popup with Escape.
  useEffect(() => {
    if (!popup) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setPopup(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [popup]);

  const s = scale;
  const quest = QUESTS.find((q) => q.id === popup) ?? null;

  return (
    <section id="map" ref={section} aria-label="The map of Cairo" className="q-scene relative bg-merlot">
      <div ref={stage} className="relative h-[100svh] w-full overflow-hidden bg-coconut">
        <canvas ref={canvasRef} className="pixelated absolute inset-0" aria-hidden="true" />

        {/* World-space layer: moves with the camera. */}
        <div ref={world} className="pointer-events-none absolute left-0 top-0 will-change-transform">
          {
            <>
              {data.signposts.map((sp, i) => (
                <div
                  key={i}
                  className={`q-bigsign ${ui.risen > i ? "is-risen" : ""} ${ui.active === i ? "is-current" : ""} ${ui.signs > i && ui.active !== i ? "is-passed" : ""}`}
                  style={{ left: sp.at.x * s, top: sp.at.y * s }}
                  aria-hidden="true"
                >
                  <div className="q-bigsign-clip">
                    <div className="q-bigsign-in">
                      <div className="q-bigsign-board px-frame px-corners" style={{ "--step": "4px", "--frame-w": "4px" } as React.CSSProperties}>
                        <div className="px-frame-in px-corners grid place-items-center bg-coconut" style={{ "--step": "3px" } as React.CSSProperties}>
                          <span className="font-px q-bigsign-num">{HOW_STEPS[i].n}</span>
                        </div>
                      </div>
                      <span className="q-bigsign-post" />
                    </div>
                  </div>
                  <span className="q-bigsign-ground" />
                  <span className="q-bigsign-label font-px t-px1">{HOW_STEPS[i].title}</span>
                </div>
              ))}
              {(["why", "night"] as const).map((k) => (
                <div key={k} className={`q-bang ${ui.pop === k ? "is-on" : ""}`} style={{ left: data.stops[k].focus.x * s, top: data.stops[k].focus.y * s - 40 }} aria-hidden="true">
                  <span>!</span>
                </div>
              ))}
              {data.markers.map((mk) => {
                const q = QUESTS.find((x) => x.id === mk.id)!;
                return (
                  <button
                    key={mk.id}
                    type="button"
                    className={`q-marker pointer-events-auto ${ui.markers ? "is-on" : ""} ${popup === mk.id ? "is-open" : ""}`}
                    style={{ left: mk.at.x * s, top: mk.at.y * s }}
                    tabIndex={ui.markers ? 0 : -1}
                    aria-hidden={ui.markers ? undefined : true}
                    aria-expanded={popup === mk.id}
                    aria-label={`${q.label}: ${q.kind}, ${q.title}${q.full ? ", full" : ""}`}
                    onClick={() => setPopup((p) => (p === mk.id ? null : mk.id))}
                    onFocus={() => setPopup(mk.id)}
                  >
                    <span aria-hidden="true">!</span>
                  </button>
                );
              })}
              <div ref={foxEl} className="q-avatar" aria-hidden="true">
                <div className="q-avatar-in">
                  <PixelFox frame="happy" />
                </div>
              </div>
            </>
          }
        </div>

        {/* Screen-space layer */}
        <div ref={xpLayer} className="pointer-events-none absolute inset-0 z-20" aria-hidden="true" />

        <div ref={vigWrap} className={`q-vig-wrap ${ui.active >= 0 ? "is-on" : ""}`}>
          {HOW_STEPS.map((h, i) => (
            <div key={h.n} className={`q-vig ${ui.active === i ? "is-on" : ""}`} inert={ui.active !== i}>
              <Vignette index={i} />
            </div>
          ))}
        </div>

        <div ref={popupWrap} className={`q-popup-wrap ${quest && ui.markers ? "is-on" : ""}`}>
          {quest && ui.markers && <QuestPopup key={quest.id} quest={quest} onClose={() => setPopup(null)} />}
        </div>

        <div className={`q-overlay ${ui.overlay === "inventory" ? "is-on" : ""}`} inert={ui.overlay !== "inventory"}>
          <Inventory titleId="inv-map" />
        </div>
        <div className={`q-overlay ${ui.overlay === "party" ? "is-on" : ""}`} inert={ui.overlay !== "party"}>
          <PartySelect titleId="party-map" />
        </div>

        <Dialog
          visible={!!ui.dialog}
          text={ui.dialog?.text ?? ""}
          frame={ui.dialog?.frame ?? "happy"}
          speaker={ui.dialog?.speaker ?? "Fox"}
          className="q-dialog-map"
        />
      </div>
    </section>
  );
}
