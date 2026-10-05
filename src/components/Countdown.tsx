"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { LAUNCH_ISO } from "@/config";
import { prefersReducedMotion } from "@/lib/gsap";

const LABEL = "The board opens in ";
// Default shape before hydration; the real values land on mount.
const SHAPE = ["0", "0", "D", " ", "0", "0", "H", " ", "0", "0", "M", " ", "0", "0", "S"];

function format(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000));
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d)}D ${p(h)}H ${p(m)}M ${p(sec)}S`;
}

/**
 * Pixel-font countdown. Each character is its own span so the intro can type
 * it on; digits scramble briefly when they change.
 */
const Countdown = forwardRef<HTMLParagraphElement>(function Countdown(_p, ref) {
  const root = useRef<HTMLParagraphElement>(null);
  const digits = useRef<HTMLSpanElement>(null);
  const label = useRef<HTMLSpanElement>(null);
  useImperativeHandle(ref, () => root.current as HTMLParagraphElement, []);

  useEffect(() => {
    const target = new Date(LAUNCH_ISO).getTime();
    const holder = digits.current;
    if (!holder || Number.isNaN(target)) return;
    const reduced = prefersReducedMotion();
    const timers = new Set<ReturnType<typeof setTimeout>>();
    let prev = "";

    const ensureSpans = (str: string) => {
      while (holder.children.length < str.length) {
        const s = document.createElement("span");
        s.dataset.char = "";
        holder.appendChild(s);
      }
      while (holder.children.length > str.length) holder.lastChild?.remove();
    };

    const scramble = (el: HTMLElement, final: string) => {
      if (reduced) {
        el.textContent = final;
        return;
      }
      let n = 0;
      const step = () => {
        n++;
        if (n > 4) {
          el.textContent = final;
          return;
        }
        el.textContent = String((Math.random() * 10) | 0);
        const t = setTimeout(step, 40);
        timers.add(t);
      };
      step();
    };

    const render = () => {
      const diff = target - Date.now();
      if (diff <= 0) {
        if (label.current) label.current.textContent = "The board is open.";
        holder.textContent = "";
        root.current?.setAttribute("aria-label", "The board is open.");
        return true;
      }
      const str = format(diff);
      ensureSpans(str);
      for (let i = 0; i < str.length; i++) {
        const el = holder.children[i] as HTMLElement;
        if (str[i] === prev[i]) continue;
        if (/\d/.test(str[i]) && prev) scramble(el, str[i]);
        else el.textContent = str[i];
      }
      prev = str;
      root.current?.setAttribute("aria-label", `The board opens in ${str.replace(/(\d+)([DHMS])/g, (_m, n, u) => `${Number(n)} ${({ D: "days", H: "hours", M: "minutes", S: "seconds" } as Record<string, string>)[u]}`)}`);
      return false;
    };

    if (render()) return;
    const id = setInterval(() => {
      if (render()) clearInterval(id);
    }, 1000);
    return () => {
      clearInterval(id);
      timers.forEach(clearTimeout);
    };
  }, []);

  return (
    <p ref={root} role="timer" aria-live="off" className="countdown font-px t-px1 tabular text-coconut-78">
      <span ref={label} aria-hidden="true">
        {LABEL.split("").map((c, i) => (
          <span key={i} data-char="">
            {c}
          </span>
        ))}
      </span>
      <span ref={digits} aria-hidden="true" className="text-yellow">
        {SHAPE.map((c, i) => (
          <span key={i} data-char="">
            {c}
          </span>
        ))}
      </span>
    </p>
  );
});

export default Countdown;
