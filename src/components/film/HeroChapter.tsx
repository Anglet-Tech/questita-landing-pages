"use client";

import { useRef, useState } from "react";
import { gsap, MQ, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { stairClip } from "@/lib/stairs";
import { openContact } from "@/lib/store";
import CalendarButton from "@/components/CalendarButton";
import PixelFox from "@/components/PixelFox";
import { Magnetic, Roll } from "@/components/ui";
import FilmCountdown from "./FilmCountdown";
import { HERO } from "./content";
import { FMQ, pixelCircle, setTopTone, span, watchChapter } from "./filmKit";

/** Centre of the viewer-left eye highlight in the wow frame, in fox pixels. */
const EYE = { x: 13, y: 21 };
const FOX_W = 41;
const FOX_H = 35;
const powIn = gsap.parseEase("power2.in");
const inOut = gsap.parseEase("power2.inOut");
const BLUR = ["none", "blur(3px)", "blur(9px)", "blur(18px)", "none"];
const DIGIT_ALPHA = ["1", "0.85", "0.55", "0.25", "0"];

/**
 * Chapter 1. The countdown is the hero, the fox stands in front of it. On
 * scroll the camera pushes in: the digits scale up and blur out in three hard
 * steps, the fox fills the frame with its eye travelling to the centre, and
 * the eye's highlight opens as a pixel-stepped iris onto chapter 2 (coconut).
 * Everything is derived from one pinned ScrollTrigger's progress, so it
 * scrubs both ways. Reduced motion: a static frame, no pin.
 */
export default function HeroChapter() {
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const counterWrap = useRef<HTMLDivElement>(null);
  const counter = useRef<HTMLDivElement>(null);
  const foxSlot = useRef<HTMLDivElement>(null);
  const foxCam = useRef<HTMLDivElement>(null);
  const copy = useRef<HTMLDivElement>(null);
  const foot = useRef<HTMLDivElement>(null);
  const iris = useRef<HTMLDivElement>(null);
  const [push, setPush] = useState(false);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      const html = document.documentElement;

      // Intro on load runs wherever motion is allowed, pinned or not.
      mm.add(MQ.motion, () => {
        // ---- Intro on load: the digits stair-wipe in, the fox rises in steps,
        // the headline arrives word by word.
        if (html.classList.contains("intro")) {
          const p = { v: 0 };
          gsap
            .timeline({ delay: 0.1 })
            .call(() => {
              gsap.set("[data-intro]", { visibility: "visible" });
              html.classList.remove("intro");
            })
            .to(
              p,
              {
                v: 1,
                duration: 0.9,
                ease: "power2.out",
                onUpdate: () => {
                  counterWrap.current!.style.clipPath = stairClip(p.v, 14);
                },
                onComplete: () => {
                  counterWrap.current!.style.clipPath = "";
                },
              },
              0,
            )
            .from(foxSlot.current, { yPercent: 70, autoAlpha: 0, duration: 0.5, ease: "steps(5)" }, 0.45)
            .from("[data-w]", { yPercent: 115, duration: 0.95, ease: "expo.out", stagger: 0.07 }, 0.55)
            .from("[data-cta]", { y: 20, autoAlpha: 0, duration: 0.4, ease: "steps(4)", stagger: 0.08 }, 1.05)
            .from(foot.current, { autoAlpha: 0, duration: 0.3, ease: "steps(3)" }, 1.2);
        }
      });

      // The push needs a full frame: short screens get a static hero.
      mm.add(FMQ.pin, () => {
        const st = stage.current!;
        const cnt = counter.current!;
        const cam = foxCam.current!;
        const cp = copy.current!;
        const ft = foot.current!;
        const ir = iris.current!;

        // ---- Camera push and iris.
        let W = 1;
        let H = 1;
        let E0x = 0;
        let E0y = 0;
        let S = 1;
        let P = 1;
        let cell = 1;
        let rMax = 1;
        let lastBlur = -1;
        let lastR = -1;
        let lastCopy = -1;
        let pushing = false;
        let lastP = 0;

        const measure = () => {
          const slot = foxSlot.current!;
          W = st.offsetWidth;
          H = st.offsetHeight;
          // offset* ignore transforms, so the intro tween never skews this.
          let x = 0;
          let y = 0;
          let el: HTMLElement | null = slot;
          while (el && el !== st) {
            x += el.offsetLeft;
            y += el.offsetTop;
            el = el.offsetParent as HTMLElement | null;
          }
          const fw = slot.offsetWidth;
          E0x = x + (fw * EYE.x) / FOX_W;
          E0y = y + (fw * EYE.y) / FOX_W;
          // At the end of the push one fox pixel is ~1/10 of the frame: the whole eye shows.
          P = Math.max(W, H) / 10;
          S = (P * FOX_W) / fw;
          cell = P / 4;
          rMax = Math.hypot(W / 2, H / 2) + cell * 2;
          cam.style.transformOrigin = `${((EYE.x / FOX_W) * 100).toFixed(3)}% ${((EYE.y / FOX_H) * 100).toFixed(3)}%`;
        };

        const render = (p: number) => {
          lastP = p;
          // Copy leaves first, in 4 hard opacity steps.
          const pc = span(p, 0, 0.14);
          const cq = Math.floor(pc * 4.999);
          if (cq !== lastCopy) {
            lastCopy = cq;
            const a = String(1 - cq / 4);
            cp.style.opacity = a;
            ft.style.opacity = a;
            cp.style.visibility = cq >= 4 ? "hidden" : "";
          }
          cp.style.transform = `translate3d(0, ${(-70 * pc).toFixed(1)}px, 0)`;

          // Digits: scale up continuously, blur and dim in three hard steps.
          const pd = span(p, 0.02, 0.5);
          const b = pd <= 0.04 ? 0 : pd < 0.36 ? 1 : pd < 0.68 ? 2 : pd < 1 ? 3 : 4;
          if (b !== lastBlur) {
            lastBlur = b;
            cnt.style.filter = BLUR[b];
            cnt.style.opacity = DIGIT_ALPHA[b];
            cnt.style.willChange = b > 0 && b < 4 ? "transform, filter" : "";
          }
          cnt.style.transform = `translate3d(0, ${(-H * 0.05 * pd).toFixed(1)}px, 0) scale(${(1 + 1.9 * powIn(pd)).toFixed(4)})`;

          // Fox: exponential zoom about the eye, the eye travels to the centre.
          const pf = span(p, 0, 0.56);
          const t = inOut(pf);
          const s = Math.pow(S, powIn(pf));
          cam.style.transform = `translate3d(${((W / 2 - E0x) * t).toFixed(1)}px, ${((H / 2 - E0y) * t).toFixed(1)}px, 0) scale(${s.toFixed(4)})`;
          const nowPushing = p > 0.012;
          if (nowPushing !== pushing) {
            pushing = nowPushing;
            setPush(nowPushing);
            // Centre the eye highlights so the iris opens exactly on them.
            const eyes = cam.querySelector("svg g");
            if (eyes && nowPushing) gsap.set(eyes, { x: 0, y: 0, overwrite: true });
          }

          // Iris: the coconut highlight opens into chapter 2 on the same grid.
          const pi = span(p, 0.56, 0.9);
          let r = pi <= 0 ? 0 : P + (rMax - P) * powIn(pi);
          r = Math.round(r / cell) * cell;
          if (r !== lastR) {
            lastR = r;
            ir.style.clipPath = r <= 0 ? "polygon(0 0, 0 0, 0 0)" : r >= rMax ? "none" : pixelCircle(W / 2, H / 2, r, cell);
          }
          // Once the yellow face fills the frame the bar flips to merlot.
          setTopTone(p > 0.3 ? "light" : "dark");
        };

        measure();
        render(0);
        const trigger = ScrollTrigger.create({
          trigger: section.current,
          start: "top top",
          end: () => `+=${Math.round(window.innerHeight * 1.9)}`,
          pin: st,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => render(self.progress),
          onRefresh: (self) => {
            measure();
            lastBlur = lastR = lastCopy = -1;
            render(self.progress);
          },
        });
        watchChapter(section.current!, 0, () => (lastP > 0.3 ? "light" : "dark"));

        return () => {
          trigger.kill();
          [cnt, cam, cp, ft, ir].forEach((el) => el.removeAttribute("style"));
          ir.style.clipPath = "polygon(0 0, 0 0, 0 0)";
          setPush(false);
        };
      });

      mm.add(`not all and ${FMQ.pin}`, () => {
        watchChapter(section.current!, 0, "dark");
      });

      return () => mm.revert();
    },
    { scope: section },
  );

  const words = HERO.h1.split(" ");

  return (
    <section id="top" ref={section} aria-labelledby="hero-title" className="film-chapter relative z-[1]">
      <div ref={stage} className="hero-stage on-dark relative overflow-hidden bg-merlot text-coconut">
        <div className="hero-frame relative z-[2] mx-auto flex h-full max-w-[1600px] flex-col items-center px-4 sm:px-8 lg:px-12">
          <p data-intro className="font-px t-px1 text-coconut-78 tracking-[0.3em]">
            The board opens in
          </p>

          <div ref={counterWrap} data-intro className="relative z-[1] mt-3 w-full sm:mt-4">
            <div ref={counter} className="hero-counter origin-[50%_60%]">
              <FilmCountdown />
            </div>
          </div>

          <div ref={foxSlot} data-intro className="hero-fox relative z-[3]">
            <div ref={foxCam}>
              <PixelFox frame={push ? "wow" : "happy"} trackEyes={!push} label="The Questita fox" />
            </div>
          </div>

          <div ref={copy} className="hero-copy relative z-[2] flex flex-col items-center text-center">
            <h1 id="hero-title" className="hero-h1 font-extrabold text-coconut">
              {words.map((w, i) => (
                <span key={i}>
                  <span className="split-mask inline-block overflow-hidden align-bottom">
                    <span data-w className={`inline-block ${i >= 3 ? "text-yellow" : ""}`}>
                      {w}
                    </span>
                  </span>
                  {i < words.length - 1 ? " " : ""}
                </span>
              ))}
            </h1>
            <div className="mt-5 flex items-center justify-center gap-2.5 sm:mt-7 sm:gap-4">
              <span data-cta data-intro className="inline-block">
                <Magnetic>
                  <CalendarButton className="btn-yellow" />
                </Magnetic>
              </span>
              <span data-cta data-intro className="inline-block">
                <button type="button" onClick={openContact} className="btn btn-coconut roll-host">
                  <Roll>Get in touch</Roll>
                </button>
              </span>
            </div>
          </div>

          <div ref={foot} data-intro className="hero-foot z-[2] flex w-full flex-col gap-2 text-coconut-78 lg:flex-row lg:items-end lg:justify-between">
            <p className="max-w-[23rem] text-[0.9375rem] font-medium leading-snug lg:max-w-[25rem]">{HERO.sub}</p>
            <p className="font-px t-px1 tracking-[0.2em]">{HERO.where}</p>
          </div>
        </div>

        {/* The iris: chapter 2's coconut, opened from the fox's eye. */}
        <div ref={iris} aria-hidden="true" className="hero-iris absolute inset-0 z-[5] bg-coconut" style={{ clipPath: "polygon(0 0, 0 0, 0 0)" }} />
      </div>
    </section>
  );
}
