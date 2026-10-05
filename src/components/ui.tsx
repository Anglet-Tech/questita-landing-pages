"use client";

import { useEffect, useRef } from "react";
import { gsap, hasFinePointer, prefersReducedMotion } from "@/lib/gsap";

/** Two stacked copies of a label. The host element needs the `roll-host` class. */
export function Roll({ children }: { children: string }) {
  return (
    <span className="roll">
      <span>{children}</span>
      <span aria-hidden="true">{children}</span>
    </span>
  );
}

export function Arrow({ className = "" }: { className?: string }) {
  return <span className={`arrow ${className}`} aria-hidden="true" />;
}

/**
 * Magnetic wrapper: pulls its child up to `strength` px toward a fine pointer
 * and springs back on leave. Touch and reduced motion get a plain wrapper.
 */
export function Magnetic({
  children,
  strength = 10,
  className = "",
}: {
  children: React.ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !hasFinePointer() || prefersReducedMotion()) return;
    const x = gsap.quickTo(el, "x", { duration: 0.4, ease: "power3.out" });
    const y = gsap.quickTo(el, "y", { duration: 0.4, ease: "power3.out" });
    // Read the rect once per hover, not on every pointer move.
    let r = el.getBoundingClientRect();
    const onEnterRect = () => {
      r = el.getBoundingClientRect();
    };
    const onMove = (e: PointerEvent) => {
      const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
      const dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
      x(gsap.utils.clamp(-1, 1, dx) * strength);
      y(gsap.utils.clamp(-1, 1, dy) * strength);
    };
    const onLeave = () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1, 0.45)", overwrite: true });
    };
    el.addEventListener("pointerenter", onEnterRect);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointerenter", onEnterRect);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      gsap.killTweensOf(el);
    };
  }, [strength]);

  return (
    <span ref={ref} className={`inline-block ${className}`}>
      {children}
    </span>
  );
}

/** Pixel speech bubble. */
export function Bubble({
  children,
  className = "",
  id,
  role,
  tailLeft = 24,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
  role?: string;
  tailLeft?: number;
}) {
  return (
    <div className={`bubble ${className}`} id={id} role={role}>
      <div className="bubble-body px-corners">
        <div className="px-corners px-4 py-3">{children}</div>
      </div>
      <span className="bubble-tail" style={{ left: tailLeft }} aria-hidden="true" />
    </div>
  );
}
