"use client";

import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "@/lib/gsap";
import type { FoxFrame } from "@/lib/fox";
import PixelFox from "../PixelFox";

const CPS = 40;

/**
 * Classic RPG dialog box: coconut panel, merlot stepped frame, fox portrait,
 * FOX speaker label, text that types on at about 40 characters a second.
 * Click or Space skips to the end. The full text is announced politely.
 */
export default function Dialog({
  text,
  speaker = "Fox",
  frame = "happy",
  visible = true,
  instant = false,
  className = "",
}: {
  text: string;
  speaker?: string;
  frame?: FoxFrame;
  visible?: boolean;
  instant?: boolean;
  className?: string;
}) {
  const [shown, setShown] = useState(instant ? text.length : 0);
  const [prevText, setPrevText] = useState(text);
  const skipRef = useRef<() => void>(() => {});

  // Restart typing whenever the line changes (state reset during render, the React way).
  if (prevText !== text) {
    setPrevText(text);
    setShown(instant ? text.length : 0);
  }

  useEffect(() => {
    if (instant || !visible || prefersReducedMotion()) {
      skipRef.current = () => {};
      return;
    }
    let n = 0;
    const id = setInterval(() => {
      n += 1;
      setShown((s) => {
        const next = Math.min(text.length, Math.max(s, n));
        if (next >= text.length) clearInterval(id);
        return next;
      });
    }, 1000 / CPS);
    skipRef.current = () => {
      clearInterval(id);
      setShown(text.length);
    };
    return () => clearInterval(id);
  }, [text, visible, instant]);

  const done = shown >= text.length || instant;

  useEffect(() => {
    if (!visible) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== "Space" || done) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.closest("button, a, input, textarea, select") || t.isContentEditable)) return;
      e.preventDefault();
      skipRef.current();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [visible, done]);

  const reducedOrInstant = instant;
  return (
    <div className={`q-dialog ${visible ? "is-visible" : ""} ${className}`} onClick={() => skipRef.current()}>
      <div className="q-dialog-frame px-corners">
        <div className="q-dialog-in px-corners flex items-start gap-4 sm:gap-5">
          <div className="w-[62px] shrink-0 sm:w-[82px]">
            <div className="px-corners bg-blue p-1.5" style={{ "--step": "3px" } as React.CSSProperties}>
              <PixelFox frame={frame} />
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-px t-px1 text-body">{speaker}</p>
            <p className="sr-only" aria-live="polite">
              {visible ? text : ""}
            </p>
            <p aria-hidden="true" className="mt-1.5 text-[1rem] font-semibold leading-snug text-merlot sm:text-[1.1875rem]">
              {reducedOrInstant ? text : text.slice(0, shown)}
              <span className="invisible">{reducedOrInstant ? "" : text.slice(shown)}</span>
            </p>
          </div>
          <span className={`q-caret ${done ? "is-done" : ""}`} aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}
