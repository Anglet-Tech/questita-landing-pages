"use client";

import { memo, useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/gsap";
import type { FoxFrame } from "@/lib/fox";
import { advance, registerSkipper } from "./questStore";
import PixelFox from "../PixelFox";

const CPS = 40;

/**
 * Classic RPG dialog box: coconut panel, merlot stepped frame, fox portrait,
 * speaker label, and text that types on at about 40 characters a second.
 * Typing writes to the DOM through refs (no React render per character).
 * A press (click, tap, Space, Enter, right arrow) first finishes the line,
 * the next press walks on to the next stop. The full text is announced politely.
 */
function Dialog({
  text,
  speaker = "Fox",
  frame = "happy",
  visible = true,
  className = "",
}: {
  text: string;
  speaker?: string;
  frame?: FoxFrame;
  visible?: boolean;
  className?: string;
}) {
  const typed = useRef<HTMLSpanElement>(null);
  const rest = useRef<HTMLSpanElement>(null);
  const caret = useRef<HTMLSpanElement>(null);
  const skip = useRef<() => void>(() => {});
  const done = useRef(true);

  useEffect(() => {
    const a = typed.current!;
    const b = rest.current!;
    const c = caret.current!;
    let n = 0;
    const timer: { id?: ReturnType<typeof setInterval> } = {};
    const paint = () => {
      a.textContent = text.slice(0, n);
      b.textContent = text.slice(n);
      const finished = n >= text.length;
      done.current = finished;
      c.classList.toggle("is-done", finished);
    };
    const finish = () => {
      clearInterval(timer.id);
      n = text.length;
      paint();
    };
    skip.current = finish;
    if (!visible || prefersReducedMotion()) {
      finish();
      return;
    }
    paint();
    timer.id = setInterval(() => {
      n += 1;
      paint();
      if (n >= text.length) clearInterval(timer.id);
    }, 1000 / CPS);
    return () => clearInterval(timer.id);
  }, [text, visible]);

  useEffect(() => {
    if (!visible) return;
    registerSkipper(() => {
      if (done.current) return false;
      skip.current();
      return true;
    });
    return () => registerSkipper(null);
  }, [visible]);

  return (
    <div className={`q2-dialog ${visible ? "is-visible" : ""} ${className}`} onClick={advance}>
      <div className="q2-dialog-frame px-corners">
        <div className="q2-dialog-in px-corners flex items-start gap-4 sm:gap-5">
          <div className="q2-dialog-port w-[62px] shrink-0 sm:w-[82px]">
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
              <span ref={typed} />
              <span ref={rest} className="invisible" />
            </p>
          </div>
          <span ref={caret} className="q2-next q2-caret font-px t-px1" aria-hidden="true">
            Next <span className="q2-next-caret" />
          </span>
        </div>
      </div>
    </div>
  );
}

export default memo(Dialog);
