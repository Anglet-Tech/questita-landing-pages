"use client";

import { useSyncExternalStore } from "react";
import { getLenis } from "@/lib/store";

/*
 * Small store for the quest page: which XP cells are earned, the Route
 * tracker, and click and keyboard play (the stop index and the walk).
 */

export type XpId =
  | "why"
  | "board"
  | "how-1"
  | "how-2"
  | "how-3"
  | "how-4"
  | "night"
  | "inventory"
  | "party"
  | "save";

export const XP_ORDER: XpId[] = ["why", "board", "how-1", "how-2", "how-3", "how-4", "night", "inventory", "party", "save"];

const earned = new Set<XpId>();
const listeners = new Set<() => void>();
let snapshot = 0;

export function earnXp(id: XpId): boolean {
  if (earned.has(id)) return false;
  earned.add(id);
  snapshot = earned.size;
  listeners.forEach((fn) => fn());
  window.dispatchEvent(new CustomEvent("quest:xp", { detail: id }));
  return true;
}

export const isEarned = (id: XpId) => earned.has(id);

function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function useXp(): number {
  return useSyncExternalStore(subscribe, () => snapshot, () => 0);
}

export type StopTarget = "map" | "why" | "board" | "how" | "night" | "inventory" | "party";

// ---- The Route stretch: whether the fox is on it, and how many signs are reached.
let route = { active: false, reached: 0 };
const routeListeners = new Set<() => void>();
export function setRoute(active: boolean, reached: number) {
  if (route.active === active && route.reached === reached) return;
  route = { active, reached };
  routeListeners.forEach((fn) => fn());
}
const serverRoute = { active: false, reached: 0 };
export function useRoute() {
  return useSyncExternalStore(
    (fn) => {
      routeListeners.add(fn);
      return () => {
        routeListeners.delete(fn);
      };
    },
    () => route,
    () => serverRoute,
  );
}

/* ---------- Click and keyboard play ----------
 * Every control (NEXT, BACK, AUTO, the dialog, map flags, HUD cells, keys)
 * drives the same thing scrolling does: the page scroll position. A walk is a
 * Lenis scrollTo to a stop's scroll offset, so scroll and clicks never drift.
 */

export type NavId =
  | "title"
  | "why-a"
  | "why-b"
  | "board"
  | "board-b"
  | "how-1"
  | "how-2"
  | "how-3"
  | "how-4"
  | "night"
  | "inventory"
  | "party"
  | "save"
  | "crew"
  | "partners"
  | "credits";

export interface NavStop {
  id: NavId;
  label: string;
  y: number;
  /** Seconds AUTO waits here (typing plus reading time). */
  read: number;
}

/** The pinned map registers its stops with their scroll offsets (motion only). */
type MapStops = () => NavStop[] | null;
let mapStops: MapStops | null = null;

export function registerMapStops(fn: MapStops | null) {
  mapStops = fn;
  if (typeof window !== "undefined") requestAnimationFrame(rebuildStops);
}

/** Seconds to type a line at 40 cps, then about 2.2s per 60 characters to read it. */
export const readTime = (chars: number) => chars / 40 + 2.2 * Math.max(1, chars / 60);

const DOM_LABELS: Partial<Record<NavId, string>> = {
  "why-a": "Stop 1: Downtown",
  board: "Stop 2: The quest board",
  "how-1": "Stop 3: The route",
  night: "Stop 4: Night falls",
  inventory: "Inventory",
  party: "Choose your party",
  save: "Save point",
  crew: "The crew",
  partners: "Partners",
};
const DOM_READ: Partial<Record<NavId, number>> = { inventory: 6, party: 6, save: 4, crew: 5, partners: 3.5 };

export interface Nav {
  stops: NavStop[];
  at: number; // last stop at or above the current scroll
  exact: boolean; // standing on that stop (not between two)
  reach: number; // furthest stop reached so far
  walking: number | null; // stop a click walk is heading to
  auto: boolean;
  say: string; // polite announcement
}
let nav: Nav = { stops: [], at: 0, exact: true, reach: 0, walking: null, auto: false, say: "" };
const serverNav = nav;
const navListeners = new Set<() => void>();
function setNav(patch: Partial<Nav>) {
  let changed = false;
  for (const k in patch) if (nav[k as keyof Nav] !== patch[k as keyof Nav]) changed = true;
  if (!changed) return;
  nav = { ...nav, ...patch };
  notify();
}
export function useNav(): Nav {
  return useSyncExternalStore(
    (fn) => {
      navListeners.add(fn);
      return () => {
        navListeners.delete(fn);
      };
    },
    () => nav,
    () => serverNav,
  );
}
export const getNav = () => nav;

const reduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Rebuild the stop index (after ScrollTrigger refresh and on resize). */
export function rebuildStops() {
  if (typeof document === "undefined") return;
  const list: NavStop[] = [{ id: "title", label: "Title screen", y: 0, read: 1.6 }];
  list.push(...(mapStops?.() ?? []));
  const have = new Set(list.map((s) => s.id));
  const hiddenPlain = !reduced();
  document.querySelectorAll<HTMLElement>("[data-q2-stop]").forEach((el) => {
    const id = el.dataset.q2Stop as NavId;
    if (have.has(id) || el.offsetHeight < 4) return;
    // The plain list is a screen reader copy in motion mode: not a place to walk to.
    if (hiddenPlain && el.closest(".q2-plain:not(.is-revealed)")) return;
    const off = Number(el.dataset.q2Off ?? 0);
    have.add(id);
    list.push({ id, label: DOM_LABELS[id] ?? id, y: Math.round(el.getBoundingClientRect().top + window.scrollY - off), read: DOM_READ[id] ?? 4 });
  });
  const max = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
  list.forEach((s) => (s.y = Math.round(Math.max(0, Math.min(max, s.y)))));
  list.sort((a, b) => a.y - b.y);
  const out: NavStop[] = [];
  for (const s of list) if (!out.length || s.y > out[out.length - 1].y + 4) out.push(s);
  // The credits roll ends at the bottom of the page.
  if (out[out.length - 1].y < max - 4) out.push({ id: "credits", label: "Credits", y: max, read: 0 });
  else out[out.length - 1] = { id: "credits", label: "Credits", y: max, read: 0 };
  nav = { ...nav, stops: out };
  trackScroll(window.scrollY, true);
}

/** Called on every scroll update: which stop the player is at, and how far they got. */
export function trackScroll(y: number, force = false) {
  const s = nav.stops;
  if (!s.length) return;
  let at = 0;
  for (let i = 0; i < s.length; i++) if (s[i].y <= y + 6) at = i;
  const exact = Math.abs(s[at].y - y) <= Math.max(6, window.innerHeight * 0.04);
  const reach = Math.max(nav.reach, at);
  if (!force && at === nav.at && exact === nav.exact && reach === nav.reach) return;
  // The controls read the fresh value at once; the HUD redraws at most every 200ms while scrolling.
  nav = { ...nav, at, exact, reach };
  if (force) return notify();
  pending ??= setTimeout(notify, 200);
}
let pending: ReturnType<typeof setTimeout> | null = null;
function notify() {
  if (pending) clearTimeout(pending);
  pending = null;
  navListeners.forEach((fn) => fn());
}

export const indexOf = (id: NavId) => nav.stops.findIndex((s) => s.id === id);

/** A stop may be fast travelled to once visited, plus the very next one (story order). */
export const unlocked = (i: number) =>
  i >= 0 && (i <= nav.reach + 1 || nav.stops.slice(nav.reach + 1, i).every((s) => SUB_STOPS.has(s.id)));
/** Second beats of a stop (the next line, the markers on short screens): they do not hold the story back. */
const SUB_STOPS = new Set<NavId>(["why-b", "board-b"]);

let skipper: (() => boolean) | null = null;
/** The visible dialog registers "finish typing if still typing" (returns true if it did). */
export function registerSkipper(fn: (() => boolean) | null) {
  skipper = fn;
}

const walkEase = (t: number) => 0.5 - 0.5 * Math.cos(Math.PI * t);

function announce(st: NavStop) {
  // A trailing space lets the same stop be announced again.
  setNav({ say: nav.say === st.label ? `${st.label} ` : st.label });
}
export function announceStop() {
  const st = nav.stops[nav.at];
  if (st && nav.exact) announce(st);
}

/** Walk (or, under reduced motion, jump) to stop i. */
export function walkTo(i: number) {
  const st = nav.stops[i];
  if (!st) return;
  const lenis = getLenis();
  if (!lenis || reduced()) {
    window.scrollTo({ top: st.y, behavior: "instant" });
    setNav({ walking: null });
    trackScroll(st.y);
    announce(st);
    return;
  }
  if (lenis.isStopped) return;
  const dist = Math.abs(st.y - lenis.animatedScroll) / Math.max(1, window.innerHeight);
  const duration = Math.max(0.8, Math.min(2.4, 0.4 + dist * 0.5));
  setNav({ walking: i });
  lenis.scrollTo(st.y, {
    duration,
    easing: walkEase,
    onComplete: () => {
      if (nav.walking !== i) return;
      setNav({ walking: null });
      announce(st);
    },
  });
}

/** The player scrolled during a walk. Lenis already hands the scroll over cleanly. */
export function cancelWalk() {
  if (nav.walking !== null) setNav({ walking: null });
}

function here() {
  return nav.walking ?? (nav.exact ? nav.at : null);
}

export function next() {
  const h = here();
  if (h !== null) return walkTo(Math.min(nav.stops.length - 1, h + 1));
  const y = window.scrollY;
  const i = nav.stops.findIndex((s) => s.y > y + 4);
  if (i >= 0) walkTo(i);
}

export function back() {
  const h = here();
  if (h !== null) return walkTo(Math.max(0, h - 1));
  const y = window.scrollY;
  let i = -1;
  nav.stops.forEach((s, k) => {
    if (s.y < y - 4) i = k;
  });
  if (i >= 0) walkTo(i);
}

/** Dialog box press: first finish the line, then walk on. */
export function advance() {
  if (skipper?.()) return;
  next();
}

export function setAuto(on: boolean) {
  setNav({ auto: on && !reduced() });
}

/** Walk to a named stop (title menu, HUD cells, map flags). Returns false if unknown. */
export function walkToId(id: NavId): boolean {
  if (!nav.stops.length) rebuildStops();
  const i = indexOf(id);
  if (i < 0) return false;
  walkTo(i);
  return true;
}

const TARGET_STOP: Record<StopTarget, NavId> = { map: "why-a", why: "why-a", board: "board", how: "how-1", night: "night", inventory: "inventory", party: "party" };

/** Walk to a stop by its old jump name. Returns false if the stop index is not ready. */
export function jumpTo(target: StopTarget): boolean {
  return walkToId(TARGET_STOP[target]);
}
