"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);
  // DEBUG-ONLY: expose for manual checks in dev tools. Stripped in production builds.
  if (process.env.NODE_ENV !== "production") Object.assign(window, { __gsap: gsap, __ST: ScrollTrigger });
}

/** Media query split used by every component via gsap.matchMedia(). */
export const MQ = {
  desktop: "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
  mobile: "(max-width: 1023px) and (prefers-reduced-motion: no-preference)",
  motion: "(prefers-reduced-motion: no-preference)",
  reduce: "(prefers-reduced-motion: reduce)",
} as const;

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia(MQ.reduce).matches;
}

export function hasFinePointer(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

export { gsap, ScrollTrigger, SplitText, useGSAP };

type IdleWindow = Window & {
  requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
  cancelIdleCallback?: (id: number) => void;
};

/** Run `fn` when the main thread is idle (after first paint), FIFO with other idle work. */
export function idle(fn: () => void, timeout = 600): () => void {
  if (typeof window === "undefined") return () => {};
  const w = window as IdleWindow;
  if (w.requestIdleCallback) {
    const id = w.requestIdleCallback(fn, { timeout });
    return () => w.cancelIdleCallback?.(id);
  }
  const id = window.setTimeout(fn, 1);
  return () => window.clearTimeout(id);
}

/**
 * useGSAP for below-the-fold sections: the setup runs in an idle slot after
 * hydration instead of inside the load task. Idle callbacks run in the order
 * they were registered (DOM order), so ScrollTrigger creation order and pin
 * spacing stay correct. The setup is context-safe, so everything it creates
 * is reverted on unmount.
 */
export function useIdleGSAP(setup: () => void | (() => void), config: { scope?: React.RefObject<Element | null>; dependencies?: unknown[]; revertOnUpdate?: boolean } = {}) {
  useGSAP((_ctx, contextSafe) => {
    let cleanup: void | (() => void);
    const run = contextSafe!(() => {
      cleanup = setup();
    });
    const cancel = idle(run);
    return () => {
      cancel();
      if (typeof cleanup === "function") cleanup();
    };
  }, config);
}
