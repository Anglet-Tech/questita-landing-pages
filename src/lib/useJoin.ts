"use client";

import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "./gsap";

export type Day = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";

const DAY_NAMES: Record<Day, string> = {
  Mon: "Monday",
  Tue: "Tuesday",
  Wed: "Wednesday",
  Thu: "Thursday",
  Fri: "Friday",
  Sat: "Saturday",
  Sun: "Sunday",
};

export const spotsLabel = (n: number) => (n <= 0 ? "Full" : n === 1 ? "1 spot left" : `${n} spots left`);

/**
 * Join and leave state for a sample quest, shared by the main board cards and
 * the minimal board rows. Returns [state, tagRef]: attach tagRef to the
 * element showing the spots label: it scrambles to its new number when the count changes.
 */
export function useJoin(opts: { spots: number; full?: boolean; day: Day; onJoin?: () => void }) {
  const [joined, setJoined] = useState(false);
  const [fresh, setFresh] = useState(false);
  const [spots, setSpots] = useState(opts.full ? 0 : opts.spots);
  const tagRef = useRef<HTMLElement | null>(null);
  const prevSpots = useRef(spots);
  const isFull = !!opts.full || (spots <= 0 && !joined);

  useEffect(() => {
    const el = tagRef.current;
    if (!el || prevSpots.current === spots) return;
    prevSpots.current = spots;
    const final = spotsLabel(spots);
    if (prefersReducedMotion() || spots <= 0) {
      el.textContent = final;
      return;
    }
    let n = 0;
    const id = setInterval(() => {
      n++;
      if (n > 5) {
        el.textContent = final;
        clearInterval(id);
        return;
      }
      el.textContent = final.replace(/^\d+/, String((Math.random() * 9 + 1) | 0));
    }, 45);
    return () => clearInterval(id);
  }, [spots]);

  const toggle = () => {
    if (opts.full) return;
    if (!joined) {
      if (spots <= 0) return;
      setJoined(true);
      setFresh(true);
      setSpots((s) => s - 1);
      opts.onJoin?.();
    } else {
      setJoined(false);
      setFresh(false);
      setSpots((s) => s + 1);
    }
  };

  const status = opts.full
    ? "That one just filled up. Try another?"
    : joined
      ? `You’re in. See you ${DAY_NAMES[opts.day]}.`
      : "";

  const state = { joined, fresh, clearFresh: () => setFresh(false), spots, isFull, status, toggle, label: spotsLabel(spots) };
  return [state, tagRef] as const;
}
