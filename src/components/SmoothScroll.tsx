"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, idle, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";
import { isScrollLocked, onScrollLock, scrollToTarget, setLenis, winkAllFoxes } from "@/lib/store";

/**
 * Lenis smooth scroll wired to the GSAP ticker, in-page anchor handling, and
 * the "type fox" delight. Under reduced motion Lenis never starts and the page
 * uses native scroll.
 */
export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    let lenis: Lenis | null = null;
    let tick: ((time: number) => void) | null = null;
    let offLock = () => {};

    if (!prefersReducedMotion()) {
      lenis = new Lenis({ autoRaf: false, lerp: 0.11, smoothWheel: true });
      lenis.on("scroll", ScrollTrigger.update);
      tick = (time: number) => lenis?.raf(time * 1000);
      // Prioritised: Lenis scrolls first in each frame, before GSAP writes any
      // styles, so window.scrollTo never forces a synchronous layout.
      gsap.ticker.add(tick, false, true);
      gsap.ticker.lagSmoothing(0);
      setLenis(lenis);
      if (isScrollLocked()) lenis.stop();
      offLock = onScrollLock((locked) => (locked ? lenis?.stop() : lenis?.start()));
    }

    // In-page anchors go through Lenis so pinned sections land cleanly.
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey) return;
      const a = (e.target as Element | null)?.closest?.('a[href^="#"]') as HTMLAnchorElement | null;
      if (!a) return;
      const hash = a.getAttribute("href") ?? "";
      if (hash === "#" || hash === "#main") return;
      e.preventDefault();
      if (hash === "#top") scrollToTarget(0);
      else {
        const el = document.querySelector<HTMLElement>(hash);
        if (!el) return;
        scrollToTarget(el);
        // Move focus for keyboard and screen reader users without a second jump.
        el.setAttribute("tabindex", "-1");
        el.focus({ preventScroll: true });
      }
      history.replaceState(null, "", hash);
    };
    document.addEventListener("click", onClick);

    // Typing "fox" anywhere outside a field makes every fox wink.
    let buffer = "";
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      if (e.key.length !== 1) return;
      buffer = (buffer + e.key.toLowerCase()).slice(-3);
      if (buffer === "fox") {
        buffer = "";
        winkAllFoxes();
      }
    };
    window.addEventListener("keydown", onKey);

    // Sections below the fold set up in idle callbacks (useIdleGSAP). This one is
    // registered last (parent effects run after children), so it runs after all
    // of them: put every trigger in order and measure once.
    const cancelIdle = idle(() => {
      ScrollTrigger.sort();
      ScrollTrigger.refresh();
    }, 1500);

    // Fonts change line breaks and heights: re-measure every trigger once they land.
    let cancelled = false;
    document.fonts?.ready.then(() => {
      if (cancelled) return;
      ScrollTrigger.sort();
      ScrollTrigger.refresh();
    });

    return () => {
      cancelled = true;
      cancelIdle();
      document.removeEventListener("click", onClick);
      window.removeEventListener("keydown", onKey);
      offLock();
      if (tick) gsap.ticker.remove(tick);
      lenis?.destroy();
      setLenis(null);
    };
  }, []);

  return <>{children}</>;
}
