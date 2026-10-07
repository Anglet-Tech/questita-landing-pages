"use client";

import { useEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

/*
 * Hand-rolled sticker drag: pointer events, a short velocity history, and a
 * little inertia on release that runs on gsap.ticker (the page's only frame
 * loop) and removes itself when the sticker comes to rest. The sticker tilts
 * with its horizontal speed and settles back to its own resting angle.
 *
 * Keyboard: the sticker is focusable, arrow keys nudge it (Shift for bigger
 * steps), Home puts it back. Double-click also puts it back.
 */

let zTop = 20;

export interface StickerOptions {
  /** Element the sticker must stay inside. */
  bounds: React.RefObject<HTMLElement | null>;
  /** Resting angle in degrees. */
  rotate?: number;
  /** Media query that must match for dragging (e.g. desktop only). */
  query?: string;
  onGrab?: () => void;
  onDrop?: () => void;
  /** Extra pixels allowed above the bounds' top edge (negative keeps it lower). */
  topInset?: number;
}

const FRICTION = 0.018; // velocity kept after one second of free flight
const MAX_V = 3.2; // px per ms
const TILT = 7; // degrees per px/ms
const MAX_TILT = 16;

export function useSticker<T extends HTMLElement>(opts: StickerOptions) {
  const ref = useRef<T | null>(null);
  const optsRef = useRef(opts);
  useEffect(() => {
    optsRef.current = opts;
  });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const base = optsRef.current.rotate ?? 0;
    const mq = optsRef.current.query ? window.matchMedia(optsRef.current.query) : null;
    const allowed = () => !prefersReducedMotion() && (!mq || mq.matches);

    gsap.set(el, { rotation: base, x: 0, y: 0 });
    const setX = gsap.quickSetter(el, "x", "px") as (v: number) => void;
    const setY = gsap.quickSetter(el, "y", "px") as (v: number) => void;
    const tilt = gsap.quickTo(el, "rotation", { duration: 0.25, ease: "power2.out" });

    let x = 0;
    let y = 0;
    let vx = 0;
    let vy = 0;
    let dragging = false;
    let flying = false;
    let id = -1;
    let sx = 0;
    let sy = 0;
    let ox = 0;
    let oy = 0;
    let lim = { minX: 0, maxX: 0, minY: 0, maxY: 0 };
    let hist: { x: number; y: number; t: number }[] = [];

    const limits = () => {
      const b = optsRef.current.bounds.current;
      if (!b) return { minX: -Infinity, maxX: Infinity, minY: -Infinity, maxY: Infinity };
      const B = b.getBoundingClientRect();
      const R = el.getBoundingClientRect();
      const top = B.top + (optsRef.current.topInset ?? 0);
      return {
        minX: x - (R.left - B.left),
        maxX: x + (B.right - R.right),
        minY: y - (R.top - top),
        maxY: y + (B.bottom - R.bottom),
      };
    };
    const clampAll = () => {
      x = gsap.utils.clamp(Math.min(lim.minX, lim.maxX), Math.max(lim.minX, lim.maxX), x);
      y = gsap.utils.clamp(Math.min(lim.minY, lim.maxY), Math.max(lim.minY, lim.maxY), y);
    };

    const stopFlight = () => {
      if (!flying) return;
      flying = false;
      gsap.ticker.remove(fly);
    };
    const settle = () => {
      gsap.to(el, { rotation: base, duration: 0.7, ease: "elastic.out(1, 0.5)", overwrite: "auto" });
    };

    function fly(_t: number, dtMs: number) {
      const dt = Math.min(dtMs, 40);
      x += vx * dt;
      y += vy * dt;
      if (x < lim.minX || x > lim.maxX) {
        x = gsap.utils.clamp(lim.minX, lim.maxX, x);
        vx = -vx * 0.45;
      }
      if (y < lim.minY || y > lim.maxY) {
        y = gsap.utils.clamp(lim.minY, lim.maxY, y);
        vy = -vy * 0.45;
      }
      const k = Math.pow(FRICTION, dt / 1000);
      vx *= k;
      vy *= k;
      setX(x);
      setY(y);
      tilt(base + gsap.utils.clamp(-MAX_TILT, MAX_TILT, vx * TILT));
      if (Math.abs(vx) < 0.015 && Math.abs(vy) < 0.015) {
        stopFlight();
        settle();
      }
    }

    // Touch: a vertical swipe on a sticker scrolls the page (touch-action: pan-y).
    // A drag starts on a clear sideways move, or after a short press and hold.
    let pending: { x: number; y: number; t: number; id: number } | null = null;
    let hold: ReturnType<typeof setTimeout> | undefined;
    const clearPending = () => {
      pending = null;
      clearTimeout(hold);
    };

    const begin = (pointerId: number, cx: number, cy: number, t: number) => {
      stopFlight();
      gsap.killTweensOf(el, "rotation");
      dragging = true;
      id = pointerId;
      try {
        el.setPointerCapture(id);
      } catch {
        // The pointer may already be gone; the drag still follows pointer events on the sticker.
      }
      lim = limits();
      sx = cx;
      sy = cy;
      ox = x;
      oy = y;
      vx = vy = 0;
      hist = [{ x: cx, y: cy, t }];
      el.style.zIndex = String(++zTop);
      el.classList.add("is-grabbed");
      optsRef.current.onGrab?.();
    };

    const onDown = (e: PointerEvent) => {
      if (e.button !== 0 || !allowed()) return;
      if ((e.target as Element).closest("button, a, input, textarea, select")) return;
      if (e.pointerType === "touch") {
        clearPending();
        pending = { x: e.clientX, y: e.clientY, t: e.timeStamp, id: e.pointerId };
        hold = setTimeout(() => {
          if (pending) begin(pending.id, pending.x, pending.y, performance.now());
          pending = null;
        }, 280);
        return;
      }
      e.preventDefault();
      begin(e.pointerId, e.clientX, e.clientY, e.timeStamp);
    };
    // Once a touch drag is on, keep the page from scrolling under it.
    const onTouchMove = (e: TouchEvent) => {
      if (dragging && e.cancelable) e.preventDefault();
    };
    const onMove = (e: PointerEvent) => {
      if (pending && e.pointerId === pending.id) {
        const dx = e.clientX - pending.x;
        const dy = e.clientY - pending.y;
        if (Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy) * 1.2) {
          const p = pending;
          clearPending();
          begin(p.id, p.x, p.y, p.t);
        } else if (Math.abs(dy) > 8 || Math.abs(dx) > 8) {
          clearPending();
          return;
        } else return;
      }
      if (!dragging || e.pointerId !== id) return;
      x = ox + (e.clientX - sx);
      y = oy + (e.clientY - sy);
      clampAll();
      setX(x);
      setY(y);
      hist.push({ x: e.clientX, y: e.clientY, t: e.timeStamp });
      while (hist.length > 2 && e.timeStamp - hist[0].t > 90) hist.shift();
      const a = hist[0];
      const dt = Math.max(1, e.timeStamp - a.t);
      const cvx = (e.clientX - a.x) / dt;
      tilt(base + gsap.utils.clamp(-MAX_TILT, MAX_TILT, cvx * TILT));
    };
    const onUp = (e: PointerEvent) => {
      if (pending && e.pointerId === pending.id) clearPending();
      if (!dragging || e.pointerId !== id) return;
      dragging = false;
      if (el.hasPointerCapture(id)) el.releasePointerCapture(id);
      el.classList.remove("is-grabbed");
      const a = hist[0];
      const last = hist[hist.length - 1];
      const age = e.timeStamp - last.t;
      const dt = Math.max(1, last.t - a.t);
      // A sticker held still before release does not get thrown.
      if (age < 80 && hist.length > 1) {
        vx = gsap.utils.clamp(-MAX_V, MAX_V, (last.x - a.x) / dt);
        vy = gsap.utils.clamp(-MAX_V, MAX_V, (last.y - a.y) / dt);
      } else {
        vx = vy = 0;
      }
      optsRef.current.onDrop?.();
      if (Math.abs(vx) + Math.abs(vy) > 0.05) {
        lim = limits();
        flying = true;
        gsap.ticker.add(fly);
      } else settle();
    };

    const reset = () => {
      if (!allowed()) return;
      stopFlight();
      x = y = 0;
      gsap.to(el, { x: 0, y: 0, rotation: base, duration: 0.6, ease: "back.out(1.6)", overwrite: "auto" });
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.target !== el || !allowed()) return;
      const step = e.shiftKey ? 48 : 16;
      let dx = 0;
      let dy = 0;
      if (e.key === "ArrowLeft") dx = -step;
      else if (e.key === "ArrowRight") dx = step;
      else if (e.key === "ArrowUp") dy = -step;
      else if (e.key === "ArrowDown") dy = step;
      else if (e.key === "Home") {
        e.preventDefault();
        reset();
        return;
      } else return;
      e.preventDefault();
      stopFlight();
      lim = limits();
      x += dx;
      y += dy;
      clampAll();
      el.style.zIndex = String(++zTop);
      gsap.to(el, { x, y, duration: 0.18, ease: "steps(3)", overwrite: "auto" });
      gsap.fromTo(el, { rotation: base + Math.sign(dx || dy) * 4 }, { rotation: base, duration: 0.4, ease: "steps(4)" });
    };

    // Layout changes (resize, breakpoint swap) put every sticker back home.
    let lastW = window.innerWidth;
    const onResize = () => {
      if (window.innerWidth === lastW) return;
      lastW = window.innerWidth;
      stopFlight();
      x = y = 0;
      gsap.set(el, { x: 0, y: 0, rotation: base });
    };

    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);
    el.addEventListener("dblclick", reset);
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      stopFlight();
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
      el.removeEventListener("dblclick", reset);
      el.removeEventListener("touchmove", onTouchMove);
      clearPending();
      el.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
      gsap.killTweensOf(el);
    };
  }, []);

  return ref;
}
