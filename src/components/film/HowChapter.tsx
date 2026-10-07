"use client";

import { useRef, useState } from "react";
import { gsap, ScrollTrigger, useIdleGSAP } from "@/lib/gsap";
import type { FoxFrame } from "@/lib/fox";
import PixelDigit from "@/components/PixelDigit";
import PixelFox from "@/components/PixelFox";
import Wipe from "./Wipe";
import { HOW, STOPS } from "./content";
import { FMQ, span, stepped, watchChapter } from "./filmKit";

const inOut = gsap.parseEase("power3.inOut");
const BEAT0 = 0.14;
const BEAT_LEN = (1 - BEAT0) / 4;
const SEG_STEPS = 8;

/**
 * Chapter 3, pinned, four beats. A title card ("Four stops.") shrinks to the
 * corner, then each beat swaps the giant pixel numeral with a row-by-row
 * stepped wipe (7 steps, one per glyph row), reveals the title and line on the
 * right through masks, and changes the fox's face. A 4-segment pixel progress
 * bar fills along the bottom. Reduced motion: a plain list.
 */
export default function HowChapter() {
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const title = useRef<HTMLDivElement>(null);
  const intro = useRef<HTMLParagraphElement>(null);
  const foxBox = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const [frame, setFrame] = useState<FoxFrame>("happy");

  useIdleGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(FMQ.pin, () => {
        const st = stage.current!;
        const tt = title.current!;
        const it = intro.current!;
        const beats = gsap.utils.toArray<HTMLElement>("[data-beat]", st);
        const nums = beats.map((b) => b.querySelector<HTMLElement>("[data-num]")!);
        const rises = beats.map((b) => b.querySelectorAll<HTMLElement>("[data-rise]"));
        const fills = gsap.utils.toArray<HTMLElement>("[data-fill]", bar.current);
        const fox = foxBox.current!;

        // Hidden start: every beat waits below its masks with its numeral clipped.
        beats.forEach((b, i) => {
          gsap.set(nums[i], { clipPath: "inset(100% 0% 0% 0%)" });
          gsap.set(rises[i], { yPercent: 110 });
          gsap.set(b, { autoAlpha: 0 });
        });
        gsap.set([fox, bar.current], { autoAlpha: 0 });

        let x0 = 0;
        let y0 = 0;
        let K = 0.3;
        let active = -1;
        let hop: gsap.core.Tween | null = null;
        let lastIntro = -1;
        let chromeOn = false;
        const lastFill = fills.map(() => -1);

        const measure = () => {
          const W = st.offsetWidth;
          const H = st.offsetHeight;
          x0 = (W - tt.offsetWidth) / 2 - tt.offsetLeft;
          y0 = (H - tt.offsetHeight) / 2 - tt.offsetTop;
          // Final size: the h2 lands at about 2.6rem.
          const h2 = tt.querySelector("h2")!;
          K = Math.min(1, 44 / parseFloat(getComputedStyle(h2).fontSize));
        };

        const activate = (next: number) => {
          if (next === active) return;
          const prev = active;
          const dir = next > prev ? 1 : -1;
          active = next;
          if (prev >= 0) {
            const pb = beats[prev];
            gsap.to(nums[prev], {
              clipPath: dir > 0 ? "inset(0% 0% 100% 0%)" : "inset(100% 0% 0% 0%)",
              duration: 0.42,
              ease: "steps(7)",
              overwrite: true,
            });
            gsap.to(rises[prev], { yPercent: -110 * dir, duration: 0.5, ease: "expo.in", stagger: 0.03, overwrite: true });
            gsap.set(pb, { autoAlpha: 0, delay: 0.5, overwrite: true });
          }
          if (next < 0) return;
          const nb = beats[next];
          gsap.set(nb, { autoAlpha: 1, overwrite: true });
          gsap.fromTo(
            nums[next],
            { clipPath: dir > 0 ? "inset(100% 0% 0% 0%)" : "inset(0% 0% 100% 0%)" },
            { clipPath: "inset(0% 0% 0% 0%)", duration: 0.49, ease: "steps(7)", delay: prev >= 0 ? 0.18 : 0, overwrite: true },
          );
          gsap.fromTo(rises[next], { yPercent: 110 * dir }, { yPercent: 0, duration: 0.85, ease: "expo.out", stagger: 0.07, delay: 0.22, overwrite: true });

          setFrame(STOPS[next].fox);
          gsap.fromTo(fox, { scaleY: 0.86 }, { scaleY: 1, duration: 0.2, ease: "steps(2)", transformOrigin: "50% 100%" });
          hop?.kill();
          hop = null;
          gsap.set(fox, { y: 0 });
          if (next === 3) hop = gsap.to(fox, { y: -14, duration: 0.26, ease: "steps(1)", repeat: -1, yoyo: true, repeatDelay: 0.26 });
        };

        const render = (p: number) => {
          // Title card, then the title flies to the top-left corner.
          const pt = inOut(span(p, 0.06, BEAT0));
          const s = 1 + (K - 1) * pt;
          tt.style.transform = `translate3d(${(x0 * (1 - pt)).toFixed(1)}px, ${(y0 * (1 - pt)).toFixed(1)}px, 0) scale(${s.toFixed(4)})`;
          const iq = Math.ceil(span(p, 0.05, 0.09) * 3);
          if (iq !== lastIntro) {
            lastIntro = iq;
            it.style.opacity = String(1 - iq / 3);
          }

          const on = p >= BEAT0;
          if (on !== chromeOn) {
            chromeOn = on;
            gsap.to([fox, bar.current], { autoAlpha: on ? 1 : 0, duration: 0.2, ease: "steps(2)", overwrite: true });
          }
          const idx = on ? Math.min(3, Math.floor((p - BEAT0) / BEAT_LEN)) : -1;
          activate(idx);

          fills.forEach((f, i) => {
            const v = stepped(span(p, BEAT0 + i * BEAT_LEN, BEAT0 + (i + 1) * BEAT_LEN), SEG_STEPS);
            if (v === lastFill[i]) return;
            lastFill[i] = v;
            f.style.transform = `scaleX(${v})`;
          });
        };

        measure();
        render(0);
        const trig = ScrollTrigger.create({
          trigger: section.current,
          start: "top top",
          end: () => `+=${Math.round(window.innerHeight * 4.2)}`,
          pin: st,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => render(self.progress),
          onRefresh: (self) => {
            measure();
            lastIntro = -1;
            lastFill.fill(-1);
            render(self.progress);
          },
        });

        return () => {
          trig.kill();
          hop?.kill();
          [tt, it, fox, bar.current!, ...beats, ...nums, ...fills].forEach((el) => el.removeAttribute("style"));
          rises.forEach((r) => r.forEach((el) => el.removeAttribute("style")));
        };
      });

      watchChapter(section.current!, 2, "light");
      return () => mm.revert();
    },
    { scope: section },
  );

  return (
    <section id="how" ref={section} aria-labelledby="how-title" className="film-chapter relative z-[3] bg-blue text-merlot">
      <Wipe color="blue" />
      <div ref={stage} className="how-stage">
        <div ref={title} className="how-title">
          <h2 id="how-title" className="how-h2 font-extrabold">
            {HOW.title}
          </h2>
          <p ref={intro} className="how-intro font-medium text-body">
            {HOW.intro}
          </p>
        </div>

        <ol className="how-beats">
          {STOPS.map((s) => (
            <li key={s.n} data-beat className="how-beat">
              <div data-num className="how-num" aria-hidden="true">
                {s.n.split("").map((ch, j) => (
                  <PixelDigit key={j} char={ch} />
                ))}
              </div>
              <div className="how-text">
                <div className="split-mask overflow-hidden">
                  <h3 data-rise className="how-h3 font-extrabold">
                    <span className="sr-only">{s.n}. </span>
                    {s.title}
                  </h3>
                </div>
                <div className="mt-4 overflow-hidden lg:mt-6">
                  <p data-rise className="how-body font-medium">
                    {s.body}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ol>

        <div ref={foxBox} className="how-fox" aria-hidden="true">
          <PixelFox frame={frame} />
        </div>

        <div ref={bar} className="how-bar" aria-hidden="true">
          {STOPS.map((s) => (
            <span key={s.n} className="how-seg">
              <span data-fill className="how-seg-fill" />
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
