"use client";

import { useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { asset } from "@/lib/asset";
import { markReady, setScrollLock } from "@/lib/store";
import PixelFox, { popFox } from "./PixelFox";
import type { FoxFrame } from "@/lib/fox";

const SESSION_KEY = "questita:preloaded";

/**
 * Coconut overlay with the fox popping in from the nose, a 000 to 100 counter,
 * a wink, then a stair-step merlot wipe that rises and lifts away. Runs once per
 * session, never under reduced motion (the head script decides, pre-paint).
 * Content renders underneath the whole time.
 */
export default function Preloader() {
  const root = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const foxWrap = useRef<HTMLDivElement>(null);
  const counter = useRef<HTMLSpanElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [frame, setFrame] = useState<FoxFrame>("happy");
  const [done, setDone] = useState(false);

  useGSAP(
    () => {
      const html = document.documentElement;
      if (!html.hasAttribute("data-preload")) {
        markReady();
        return;
      }
      setScrollLock("preloader", true);
      window.scrollTo(0, 0);

      const cv = canvas.current!;
      const ctx = cv.getContext("2d")!;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = window.innerWidth;
      const h = window.innerHeight;
      cv.width = Math.ceil(w * dpr);
      cv.height = Math.ceil(h * dpr);
      ctx.scale(dpr, dpr);
      const sq = w < 640 ? 48 : 72;
      const cols = Math.ceil(w / sq);
      const rows = Math.ceil(h / sq);
      const maxK = cols + rows - 1;

      // Squares appear along a diagonal staircase from the bottom-left, then
      // vanish in the same order so the cover lifts away to the top-right.
      const wipe = { in: 0, out: 0 };
      const draw = () => {
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = "#681B2B";
        const kin = wipe.in * maxK;
        const kout = wipe.out * maxK;
        for (let c = 0; c < cols; c++) {
          for (let r = 0; r < rows; r++) {
            const k = c + (rows - 1 - r);
            if (k < kin && k >= kout) ctx.fillRect(c * sq, r * sq, sq, sq);
          }
        }
      };

      const finish = () => {
        try {
          sessionStorage.setItem(SESSION_KEY, "1");
        } catch {
          /* private mode: show again next time, harmless */
        }
        setScrollLock("preloader", false);
        html.removeAttribute("data-preload");
        setDone(true);
      };

      const count = { v: 0 };
      const tl = gsap.timeline({ onComplete: finish });
      tl.set(foxWrap.current, { visibility: "visible" })
        .add(popFox(foxWrap.current, { duration: 0.18, spread: 0.62 }), 0)
        .to(
          count,
          {
            v: 100,
            duration: 0.95,
            ease: "power2.inOut",
            onUpdate: () => {
              if (counter.current) counter.current.textContent = String(Math.round(count.v)).padStart(3, "0");
            },
          },
          0,
        )
        .call(() => setFrame("wink"), [], 0.98)
        .to(wipe, { in: 1, duration: 0.34, ease: "none", onUpdate: draw }, 1.16)
        .set(panel.current, { autoAlpha: 0 }, 1.5)
        .call(markReady, [], 1.5)
        .to(wipe, { out: 1, duration: 0.3, ease: "none", onUpdate: draw }, 1.5);

      return () => {
        tl.kill();
        setScrollLock("preloader", false);
      };
    },
    { scope: root },
  );

  if (done) return null;

  return (
    <div ref={root} className="preloader fixed inset-0 z-[100]" aria-hidden="true">
      <div ref={panel} className="absolute inset-0 bg-coconut">
        <div className="absolute inset-0 grid place-items-center">
          <div ref={foxWrap} className="invisible w-[246px] sm:w-[369px]">
            <PixelFox frame={frame} />
          </div>
        </div>
        <span
          ref={counter}
          className="font-px t-px3 tabular absolute bottom-6 left-5 text-merlot sm:bottom-10 sm:left-10"
        >
          000
        </span>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={asset("/fox/Questita_wordmark_merlot.svg")}
          alt=""
          width={1148}
          height={189}
          className="absolute bottom-7 right-5 h-auto w-[132px] sm:bottom-11 sm:right-10 sm:w-[180px]"
        />
      </div>
      <canvas ref={canvas} className="absolute inset-0 h-full w-full" />
    </div>
  );
}
