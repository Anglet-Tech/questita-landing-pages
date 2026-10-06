"use client";

import { gsap, SplitText, prefersReducedMotion } from "@/lib/gsap";

/**
 * Run `cb` once when `el` is in view. IntersectionObserver (not a scroll
 * listener, and correct for sticky sections, whose ScrollTrigger positions
 * would be measured from their stuck spot).
 */
export function whenVisible(el: Element | null, cb: () => void, threshold = 0.3, rootMargin = "0px 0px -8% 0px"): () => void {
  if (!el) return () => {};
  const io = new IntersectionObserver(
    (entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        io.disconnect();
        cb();
      }
    },
    { threshold, rootMargin },
  );
  io.observe(el);
  return () => io.disconnect();
}

/**
 * Line-mask reveal: the heading's lines rise out of their masks. Returns the
 * tween and a revert. The lines start hidden immediately so nothing flashes.
 */
export function lineMask(el: HTMLElement | null, opts: { delay?: number; stagger?: number } = {}) {
  if (!el || prefersReducedMotion()) return { play: () => {}, revert: () => {} };
  const split = SplitText.create(el, { type: "lines", mask: "lines", linesClass: "split-mask" });
  const tween = gsap.fromTo(
    split.lines,
    { yPercent: 110 },
    {
      yPercent: 0,
      duration: 0.9,
      ease: "expo.out",
      stagger: opts.stagger ?? 0.08,
      delay: opts.delay ?? 0,
      paused: true,
      onComplete: () => split.revert(),
    },
  );
  return {
    play: () => tween.play(),
    revert: () => {
      tween.kill();
      split.revert();
    },
  };
}

/** Line-mask a heading the first time it scrolls into view. Returns a cleanup. */
export function revealOnView(el: HTMLElement | null, delay = 0): () => void {
  const r = lineMask(el, { delay });
  const off = whenVisible(el, r.play, 0.2);
  return () => {
    off();
    r.revert();
  };
}

/** Elements that fade up 16px when their parent scrolls into view. */
export function riseOnView(trigger: Element | null, targets: Element[] | NodeListOf<Element>, opts: { delay?: number; stagger?: number } = {}): () => void {
  const list = Array.from(targets);
  if (!trigger || !list.length || prefersReducedMotion()) return () => {};
  gsap.set(list, { y: 16, autoAlpha: 0 });
  const off = whenVisible(trigger, () => {
    gsap.to(list, { y: 0, autoAlpha: 1, duration: 0.7, ease: "expo.out", stagger: opts.stagger ?? 0.08, delay: opts.delay ?? 0.15 });
  });
  return () => {
    off();
    gsap.killTweensOf(list);
    gsap.set(list, { clearProps: "transform,opacity,visibility" });
  };
}
