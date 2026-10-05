"use client";

import { forwardRef, memo, useImperativeHandle, useRef } from "react";
import { gsap, ScrollTrigger, useGSAP, MQ } from "@/lib/gsap";

const ITEMS = [
  "Coffee run",
  "Sunset ride",
  "First-time class",
  "Board game night",
  "Study sprint",
  "Felucca at golden hour",
  "Who’s in?",
  "Plans are better with witnesses",
];

/**
 * The only marquee on the page. A yellow tape that drifts left, speeds up with
 * scroll velocity and flips direction when the user scrolls up. Hover pauses it.
 */
const Marquee = forwardRef<HTMLDivElement>(function Marquee(_props, ref) {
  const root = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  useImperativeHandle(ref, () => root.current as HTMLDivElement, []);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        const el = track.current!;
        const first = el.children[0] as HTMLElement;
        let width = first.offsetWidth;
        let x = 0;
        let dir = 1; // 1 = leftward drift
        let speed = 0; // eased multiplier for hover pause
        let hoverTarget = 1;
        let visible = true;
        const base = 60; // px per second

        const st = ScrollTrigger.create({
          trigger: root.current,
          start: "top bottom",
          end: "bottom top",
          onToggle: (self) => (visible = self.isActive),
        });
        const vel = ScrollTrigger.create({
          start: 0,
          end: "max",
          onUpdate: (self) => {
            if (self.direction !== 0) dir = self.direction;
          },
        });

        const onResize = () => (width = first.offsetWidth);
        window.addEventListener("resize", onResize);
        const onEnter = () => (hoverTarget = 0);
        const onLeave = () => (hoverTarget = 1);
        root.current!.addEventListener("pointerenter", onEnter);
        root.current!.addEventListener("pointerleave", onLeave);

        const tick = (_t: number, dtMs: number) => {
          if (!visible || !width) return;
          const dt = Math.min(dtMs, 64) / 1000;
          speed += (hoverTarget - speed) * Math.min(1, dt * 8);
          const v = Math.min(Math.abs(vel.getVelocity()), 6000);
          const px = (base + v * 0.35) * dir * speed * dt;
          x = gsap.utils.wrap(-width, 0, x - px);
          gsap.set(el, { x });
        };
        gsap.ticker.add(tick);

        return () => {
          gsap.ticker.remove(tick);
          st.kill();
          vel.kill();
          window.removeEventListener("resize", onResize);
          root.current?.removeEventListener("pointerenter", onEnter);
          root.current?.removeEventListener("pointerleave", onLeave);
        };
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  const group = (copy: number) => (
    <div className="flex shrink-0 items-center" key={copy}>
      {ITEMS.map((item) => (
        <span key={item} className="flex items-center">
          <span className="whitespace-nowrap px-6">{item}</span>
          <span className="block h-2.5 w-2.5 bg-blue" />
        </span>
      ))}
    </div>
  );

  return (
    <div ref={root} aria-hidden="true" className="relative -mx-[6vw] w-[112vw] -rotate-2 bg-yellow text-merlot">
      <div className="overflow-hidden py-3 sm:py-4">
        <div ref={track} className="font-px t-px2 flex w-max will-change-transform">
          {group(0)}
          {group(1)}
          {group(2)}
        </div>
      </div>
    </div>
  );
});

export default memo(Marquee);
