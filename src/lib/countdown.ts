"use client";

import { useSyncExternalStore } from "react";

/*
 * One shared one-second clock for every counter on the page, so all of them
 * tick on the same frame. The server snapshot is null: counters render their
 * "--" placeholder until mounted, which keeps hydration stable.
 */

const listeners = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | undefined;
let last = -1;

const nowSec = () => Math.floor(Date.now() / 1000);

function subscribe(cb: () => void) {
  listeners.add(cb);
  if (!timer) {
    last = nowSec();
    timer = setInterval(() => {
      const s = nowSec();
      if (s !== last) {
        last = s;
        listeners.forEach((fn) => fn());
      }
    }, 200);
  }
  return () => {
    listeners.delete(cb);
    if (listeners.size === 0 && timer) {
      clearInterval(timer);
      timer = undefined;
    }
  };
}

export interface Countdown {
  /** False during SSR and the first client render: show placeholders. */
  ready: boolean;
  launched: boolean;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  /** Zero padded strings, at least two characters each ("--" when not ready). */
  dd: string;
  hh: string;
  mm: string;
  ss: string;
}

const pad = (n: number) => String(n).padStart(2, "0");

export function computeCountdown(targetMs: number, nowS: number | null): Countdown {
  if (nowS === null || Number.isNaN(targetMs)) {
    return { ready: false, launched: false, days: 0, hours: 0, minutes: 0, seconds: 0, dd: "--", hh: "--", mm: "--", ss: "--" };
  }
  const diff = Math.max(0, Math.floor(targetMs / 1000) - nowS);
  const days = Math.floor(diff / 86400);
  const hours = Math.floor((diff % 86400) / 3600);
  const minutes = Math.floor((diff % 3600) / 60);
  const seconds = diff % 60;
  return {
    ready: true,
    launched: diff <= 0,
    days,
    hours,
    minutes,
    seconds,
    dd: pad(days),
    hh: pad(hours),
    mm: pad(minutes),
    ss: pad(seconds),
  };
}

export function useCountdown(iso: string): Countdown {
  const s = useSyncExternalStore(subscribe, nowSec, () => null);
  return computeCountdown(new Date(iso).getTime(), s);
}

/** "55 days, 10 hours, 49 minutes" for screen readers. */
export function countdownLabel(c: Countdown): string {
  if (!c.ready) return "The board opens on 30 November 2026.";
  if (c.launched) return "The board is open.";
  return `The board opens in ${c.days} days, ${c.hours} hours and ${c.minutes} minutes.`;
}
