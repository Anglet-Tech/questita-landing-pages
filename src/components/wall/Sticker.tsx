"use client";

import { useSyncExternalStore } from "react";
import { useSticker, type StickerOptions } from "./useSticker";

const REDUCE = "(prefers-reduced-motion: reduce)";

/** True when a media query matches. False on the server and first render. */
export function useMedia(query: string): boolean {
  return useSyncExternalStore(
    (cb) => {
      const m = window.matchMedia(query);
      m.addEventListener("change", cb);
      return () => m.removeEventListener("change", cb);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

/**
 * A draggable sticker. Position it with classes (absolute left/top etc.);
 * dragging only ever adds a transform on top of that resting spot.
 */
export default function Sticker({
  label,
  className = "",
  liftClassName = "",
  children,
  intro = false,
  ...opts
}: StickerOptions & {
  label: string;
  className?: string;
  liftClassName?: string;
  children: React.ReactNode;
  /** Hidden before first paint until the intro slaps it on. */
  intro?: boolean;
}) {
  const ref = useSticker<HTMLDivElement>(opts);
  const reduced = useMedia(REDUCE);
  const fits = useMedia(opts.query ?? "all");
  const live = !reduced && fits;

  return (
    <div
      ref={ref}
      data-sticker=""
      data-intro={intro || undefined}
      data-live={live || undefined}
      className={`wl-sticker ${className}`}
      style={{ "--rot": `${opts.rotate ?? 0}deg` } as React.CSSProperties}
      tabIndex={live ? 0 : undefined}
      role="group"
      aria-roledescription={live ? "sticker" : undefined}
      aria-label={live ? `${label}. Drag it anywhere, or move it with the arrow keys. Home puts it back.` : label}
    >
      <div className={`wl-lift ${liftClassName}`}>{children}</div>
    </div>
  );
}
