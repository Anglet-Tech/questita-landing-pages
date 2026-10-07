"use client";

import { useEffect, useRef, useState } from "react";
import { ScrollTrigger } from "@/lib/gsap";
import { isScrollLocked } from "@/lib/store";
import { advance, announceStop, back, cancelWalk, DEBUG, getNav, rebuildStops, setAuto, trackScroll, useNav } from "./questStore";

/** While any of these is open or in use, AUTO waits. */
const BUSY = ".q2-popup-wrap.is-on, .q2-overlay.is-on .q2-fit:hover, .q2-overlay.is-on:has(:focus-visible), .q2-vig.is-on:hover";
/** Clicks here pause AUTO (they are part of the stop) instead of stopping it. */
const PLAYFIELD = ".q2-controls, .q2-overlay, .q2-popup-wrap, .q2-marker";

/**
 * Click and keyboard play: BACK, AUTO and NEXT in the bottom HUD row, the
 * keys, the stop index upkeep, and the polite "you are here" announcement.
 * Every control moves the page scroll, so scrolling stays the source of truth.
 */
export default function QuestControls() {
  const nav = useNav();
  const box = useRef<HTMLDivElement>(null);
  const [reduce, setReduce] = useState(false);

  // Stop index: rebuilt after every ScrollTrigger refresh and on resize; scroll tracked through ScrollTrigger.
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onMq = () => setReduce(mq.matches);
    onMq();
    mq.addEventListener("change", onMq);
    const tracker = ScrollTrigger.create({ start: 0, end: "max", onUpdate: (self) => trackScroll(self.scroll()) });
    ScrollTrigger.addEventListener("refresh", rebuildStops);
    let t: ReturnType<typeof setTimeout> | undefined;
    const onResize = () => {
      clearTimeout(t);
      t = setTimeout(rebuildStops, 220);
    };
    window.addEventListener("resize", onResize);
    const raf = requestAnimationFrame(rebuildStops);
    // Diagnostics: `?debug` (any build) or dev exposes the stop index to the console and test scripts.
    if (DEBUG || process.env.NODE_ENV !== "production") Object.assign(window, { __q2nav: getNav });

    // Manual scrolling hands control back to the player: the walk lets go, AUTO stops.
    const onWheel = () => {
      cancelWalk();
      setAuto(false);
    };
    const onPointer = (e: PointerEvent) => {
      if ((e.target as Element | null)?.closest?.(PLAYFIELD)) return;
      setAuto(false);
    };
    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("touchmove", onWheel, { passive: true });
    window.addEventListener("pointerdown", onPointer, true);

    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || isScrollLocked()) return;
      const el = e.target as HTMLElement | null;
      if (el && (el.isContentEditable || el.closest("input, textarea, select, [role='dialog'], .q2-popup-wrap"))) return;
      // An open quest popup owns the keys until Escape closes it.
      if (document.querySelector(".q2-popup-wrap.is-on")) return;
      const k = e.key;
      let dir = 0;
      if (k === "ArrowRight" || k === "PageDown") dir = 1;
      else if (k === "ArrowLeft" || k === "PageUp") dir = -1;
      else if (k === " " || k === "Enter") {
        // A focused button or link keeps its own Space and Enter.
        if (el?.closest("button, a, summary, [role='button']")) return;
        dir = e.shiftKey ? -1 : 1;
      } else if (k === "ArrowDown" || k === "ArrowUp" || k === "Home" || k === "End") {
        cancelWalk();
        setAuto(false);
        return;
      }
      if (!dir) return;
      e.preventDefault();
      setAuto(false);
      if (dir > 0) advance();
      else back();
    };
    window.addEventListener("keydown", onKey);

    return () => {
      mq.removeEventListener("change", onMq);
      tracker.kill();
      ScrollTrigger.removeEventListener("refresh", rebuildStops);
      clearTimeout(t);
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchmove", onWheel);
      window.removeEventListener("pointerdown", onPointer, true);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  // The HUD cells sit just left of the controls: publish the controls' width.
  useEffect(() => {
    const el = box.current;
    const hud = el?.parentElement;
    if (!el || !hud) return;
    const ro = new ResizeObserver(() => hud.style.setProperty("--q2-ctl-w", `${Math.ceil(el.offsetWidth)}px`));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Scrolled (not walked) onto a stop: announce it once it settles.
  useEffect(() => {
    // Announce after scrolling too (exact or between stops), once the scroll settles.
    if (nav.walking !== null) return;
    const id = setTimeout(() => {
      const n = getNav();
      if (n.walking === null && n.say.trim() !== n.stops[n.at]?.label) announceStop();
    }, 450);
    return () => clearTimeout(id);
  }, [nav.at, nav.exact, nav.walking]);

  // AUTO: wait out the typing and reading time, pause while something is open or in use.
  useEffect(() => {
    if (!nav.auto) return;
    let waited = 0;
    let at = -1;
    const id = setInterval(() => {
      const n = getNav();
      if (n.walking !== null) {
        waited = 0;
        return;
      }
      if (n.at !== at) {
        at = n.at;
        waited = 0;
      }
      if (document.querySelector(BUSY)) return;
      if (n.exact && n.at >= n.stops.length - 1) {
        setAuto(false);
        return;
      }
      waited += 0.1;
      const st = n.exact ? n.stops[n.at] : null;
      if (!st || waited >= st.read) {
        waited = 0;
        advance();
      }
    }, 100);
    return () => clearInterval(id);
  }, [nav.auto]);

  const cur = nav.walking ?? nav.at;
  const last = nav.stops.length - 1;
  const canBack = cur > 0 || !nav.exact;
  const canNext = last > 0 && (cur < last || !nav.exact);
  const autoOff = reduce;

  return (
    <div ref={box} className="q2-controls" role="group" aria-label="Game controls">
      <button
        type="button"
        className="q2-ctl q2-panel px-bg"
        aria-label="Back: previous stop"
        aria-disabled={!canBack}
        onClick={() => {
          setAuto(false);
          if (canBack) back();
        }}
      >
        <span className="q2-ctl-tri is-back" aria-hidden="true" />
        <span className="q2-ctl-label">Back</span>
      </button>
      <button
        type="button"
        className={`q2-ctl q2-panel px-bg q2-ctl-auto ${nav.auto ? "is-on" : ""}`}
        aria-pressed={nav.auto}
        aria-disabled={autoOff}
        aria-label={autoOff ? "Auto play, off while reduced motion is on" : "Auto play"}
        onClick={() => !autoOff && setAuto(!nav.auto)}
      >
        <span className="q2-ctl-led" aria-hidden="true" />
        <span aria-hidden="true">Auto</span>
      </button>
      <button
        type="button"
        className="q2-ctl q2-panel px-bg is-primary"
        aria-label="Next stop"
        aria-disabled={!canNext}
        onClick={() => {
          setAuto(false);
          if (canNext) advance();
        }}
      >
        <span className="q2-ctl-label">Next</span>
        <span className="q2-ctl-tri" aria-hidden="true" />
      </button>
      <p className="sr-only" role="status" aria-live="polite">
        {nav.say}
      </p>
    </div>
  );
}
