"use client";

import { useSyncExternalStore } from "react";

/*
 * Small store for the quest page: which XP cells are earned, and a way for the
 * HUD and title menu to jump to a stop on the pinned map (the map registers the
 * scroll positions once its ScrollTrigger exists).
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

type Jumper = (target: StopTarget) => boolean;
let jumper: Jumper | null = null;

export function registerJumper(fn: Jumper | null) {
  jumper = fn;
}

/** Ask the map to scroll to a stop. Returns false if the map is not pinned (reduced motion). */
export function jumpTo(target: StopTarget): boolean {
  return jumper ? jumper(target) : false;
}

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
