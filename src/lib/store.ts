"use client";

import type Lenis from "lenis";

/*
 * A tiny client store shared by leaf components. No React context needed:
 * everything here is either an event or a singleton that lives for the page.
 */

type Listener = () => void;

// ---- Ready: the preloader finished (or was skipped). Hero intro waits on it.
let ready = false;
const readyListeners = new Set<Listener>();

export function markReady() {
  if (ready) return;
  ready = true;
  readyListeners.forEach((fn) => fn());
  readyListeners.clear();
  window.dispatchEvent(new Event("questita:ready"));
}

export function onReady(fn: Listener): () => void {
  if (ready) {
    fn();
    return () => {};
  }
  readyListeners.add(fn);
  return () => {
    readyListeners.delete(fn);
  };
}

// ---- Scroll lock reasons (preloader, mobile menu, modal).
const locks = new Set<string>();
const lockListeners = new Set<(locked: boolean) => void>();

export function setScrollLock(reason: string, on: boolean) {
  if (on) locks.add(reason);
  else locks.delete(reason);
  lockListeners.forEach((fn) => fn(locks.size > 0));
}

export function isScrollLocked() {
  return locks.size > 0;
}

export function onScrollLock(fn: (locked: boolean) => void): () => void {
  lockListeners.add(fn);
  return () => {
    lockListeners.delete(fn);
  };
}

// ---- Lenis singleton.
let lenis: Lenis | null = null;
export function setLenis(instance: Lenis | null) {
  lenis = instance;
}
export function getLenis() {
  return lenis;
}

/** Scroll to an element, selector or y offset, through Lenis when it is running. */
export function scrollToTarget(target: string | number | HTMLElement) {
  if (lenis) {
    lenis.scrollTo(target, { duration: 1.4 });
    return;
  }
  if (typeof target === "number") {
    window.scrollTo({ top: target });
    return;
  }
  const el = typeof target === "string" ? document.querySelector(target) : target;
  el?.scrollIntoView();
}

// ---- Page wide events.
export const CONTACT_EVENT = "questita:contact";
export const WINK_EVENT = "questita:wink";

export function openContact() {
  window.dispatchEvent(new Event(CONTACT_EVENT));
}

export function winkAllFoxes() {
  window.dispatchEvent(new Event(WINK_EVENT));
}
