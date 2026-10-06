"use client";

import { useRef } from "react";
import { gsap, MQ, ScrollTrigger, useIdleGSAP } from "@/lib/gsap";
import { openContact } from "@/lib/store";
import CalendarButton from "@/components/CalendarButton";
import PixelFox from "@/components/PixelFox";
import { Arrow, Magnetic, Roll } from "@/components/ui";
import FilmCountdown from "./FilmCountdown";
import Wipe from "./Wipe";
import { FOOTER, LAUNCH, PARTNERS } from "./content";
import { span, watchChapter } from "./filmKit";

const FOCUS = ["blur(14px)", "blur(7px)", "blur(2px)", "none"];
const LETTERS = "QUESTITA".split("");

/**
 * Chapter 6. Partners as a compact ticket, then the closing frame: the
 * countdown again, pulling focus in three hard steps as it arrives (the
 * reverse of the hero's push), Add to calendar, and the end credits footer.
 */
export default function LaunchChapter() {
  const partners = useRef<HTMLElement>(null);
  const ticket = useRef<HTMLDivElement>(null);
  const launch = useRef<HTMLElement>(null);
  const counter = useRef<HTMLDivElement>(null);
  const foxBox = useRef<HTMLDivElement>(null);

  useIdleGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        // Ticket flips up from the table, in 8 frames.
        gsap.fromTo(
          ticket.current,
          { rotationX: 62, y: 70, transformPerspective: 1300, transformOrigin: "50% 100%" },
          { rotationX: 0, y: 0, ease: "steps(8)", scrollTrigger: { trigger: ticket.current, start: "top 95%", end: "top 55%", scrub: true } },
        );

        // Closing countdown pulls focus: scale eases in, blur drops in 3 steps.
        const cnt = counter.current!;
        let last = -1;
        const focus = (p: number) => {
          const b = Math.min(3, Math.floor(p * 3.999));
          if (b !== last) {
            last = b;
            cnt.style.filter = FOCUS[b];
            cnt.style.willChange = b < 3 ? "transform, filter" : "";
          }
          cnt.style.transform = `scale(${(1 + 0.4 * (1 - p) ** 2).toFixed(4)})`;
        };
        focus(0);
        const st = ScrollTrigger.create({
          trigger: launch.current,
          start: "top 85%",
          end: "top 15%",
          onUpdate: (self) => focus(span(self.progress, 0, 1)),
          onRefresh: (self) => {
            last = -1;
            focus(self.progress);
          },
        });

        // The fox steps up in front of the digits once the focus lands.
        gsap.from(foxBox.current, {
          yPercent: 60,
          autoAlpha: 0,
          duration: 0.45,
          ease: "steps(5)",
          scrollTrigger: { trigger: launch.current, start: "top 20%", toggleActions: "play none none reverse" },
        });

        return () => {
          st.kill();
          cnt.removeAttribute("style");
        };
      });
      watchChapter(partners.current!, 5, "light");
      watchChapter(launch.current!, 5, "dark");
      return () => mm.revert();
    },
    { scope: partners },
  );

  return (
    <>
      <section id="partners" ref={partners} aria-labelledby="partners-title" className="film-chapter relative z-[6] bg-coconut text-merlot">
        <Wipe color="coconut" />
        <div className="mx-auto max-w-[1180px] px-4 py-[12vh] sm:px-8 lg:py-[16vh]">
          <div ref={ticket} className="film-ticket px-corners flex flex-col lg:flex-row" style={{ "--step": "8px" } as React.CSSProperties}>
            <div className="on-dark flex-1 bg-merlot p-7 text-coconut sm:p-10 lg:p-12">
              <h2 id="partners-title" className="text-[clamp(2.2rem,4.6vw,4rem)] font-extrabold leading-[1.02] tracking-[-0.035em]">
                {PARTNERS.title}
              </h2>
              <p className="mt-4 max-w-[30rem] text-[1.125rem] font-medium leading-relaxed text-coconut-78">{PARTNERS.body}</p>
              <div className="mt-8">
                <Magnetic>
                  <button type="button" onClick={openContact} className="btn btn-yellow roll-host">
                    <Roll>Get in touch</Roll>
                    <Arrow />
                  </button>
                </Magnetic>
              </div>
            </div>
            <div className="perforation relative bg-merlot" aria-hidden="true">
              <span className="perf-holes" />
            </div>
            <div className="flex flex-row items-center justify-between gap-4 bg-merlot px-7 py-6 text-yellow sm:px-10 lg:w-[240px] lg:flex-col lg:items-start lg:justify-center lg:px-9">
              <p className="font-px t-px2 leading-[1.2]">Your spot</p>
              <p className="font-px t-px1 text-coconut-78 tracking-[0.2em]">Admits the whole group</p>
            </div>
          </div>
        </div>
      </section>

      <section id="launch" ref={launch} aria-labelledby="launch-title" className="film-chapter on-dark relative z-[7] bg-merlot text-coconut">
        <Wipe color="merlot" flip />
        <div className="launch-frame mx-auto flex max-w-[1600px] flex-col items-center px-4 text-center sm:px-8 lg:px-12">
          <div ref={counter} className="launch-counter w-full origin-[50%_60%]">
            <FilmCountdown />
          </div>
          <div ref={foxBox} className="launch-fox relative z-[2]">
            <PixelFox frame="wink" trackEyes />
          </div>
          <h2 id="launch-title" className="launch-h2 relative z-[3] font-extrabold">
            {LAUNCH.title}
          </h2>
          <p className="mt-3 text-[1.125rem] font-semibold text-coconut-78 sm:text-[1.25rem]">{LAUNCH.where}</p>
          <div className="mt-8">
            <Magnetic>
              <CalendarButton className="btn-yellow" />
            </Magnetic>
          </div>
        </div>
      </section>
    </>
  );
}

/** End credits: the giant pixel wordmark and the team site's footer rows. */
export function FilmFooter() {
  const footer = useRef<HTMLElement>(null);
  useIdleGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        gsap.from(footer.current!.querySelectorAll("[data-letter]"), {
          yPercent: -70,
          autoAlpha: 0,
          duration: 0.6,
          ease: "steps(6)",
          stagger: 0.06,
          scrollTrigger: { trigger: footer.current, start: "top 85%", once: true },
        });
      });
      watchChapter(footer.current!, 5, "dark");
      return () => mm.revert();
    },
    { scope: footer },
  );

  return (
    <footer ref={footer} className="film-chapter on-dark relative z-[8] bg-merlot text-coconut">
      <div className="mx-auto max-w-[1600px] px-4 pb-8 pt-10 sm:px-8 lg:px-12">
        <h2 className="sr-only">Questita</h2>
        <div aria-hidden="true" className="giant font-px flex justify-between leading-[0.9] text-coconut">
          {LETTERS.map((l, i) => (
            <span key={i} data-letter className="inline-block">
              {l}
            </span>
          ))}
        </div>
        <div className="film-dots mt-10" aria-hidden="true" />
        <div className="mt-8 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <p className="text-[1.125rem] font-semibold">{FOOTER.tagline}</p>
          <nav aria-label="Footer" className="flex flex-wrap items-center gap-x-7 gap-y-3">
            <a href="#what" className="roll-host text-[1rem] font-semibold">
              <Roll>What is Questita</Roll>
            </a>
            <a href="#how" className="roll-host text-[1rem] font-semibold">
              <Roll>How it works</Roll>
            </a>
            <button type="button" onClick={openContact} className="roll-host text-[1rem] font-semibold text-yellow">
              <Roll>Get in touch</Roll>
            </button>
          </nav>
        </div>
        <div className="mt-8 flex flex-col gap-2 text-[0.875rem] font-medium text-coconut-78 sm:flex-row sm:justify-between">
          <p>{FOOTER.made}</p>
          <p>{FOOTER.legal}</p>
        </div>
      </div>
    </footer>
  );
}
