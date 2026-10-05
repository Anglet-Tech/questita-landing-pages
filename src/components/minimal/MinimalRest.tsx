"use client";

import { Fragment, useRef, useState } from "react";
import { asset } from "@/lib/asset";
import { gsap, useGSAP, MQ } from "@/lib/gsap";
import type { FoxFrame } from "@/lib/fox";
import { openContact } from "@/lib/store";
import PixelFox from "../PixelFox";
import { Roll } from "../ui";
import { minimalReveal } from "./reveal";

const SAFETY = [
  { lead: "Everyone’s verified.", body: "ID and a live photo at sign-up, so the person you meet is the person on the profile." },
  { lead: "Your call on who.", body: "Set a gender preference on any quest you post." },
  { lead: "Meetup point, when you’re ready.", body: "You decide when the exact spot is shared." },
  { lead: "Show up, level up.", body: "Earn points for showing up and being someone people want to quest with again." },
  { lead: "Keep your circle.", body: "The people you’ve quested with stay close for the next plan." },
];

export function SafetyList() {
  const section = useRef<HTMLElement>(null);
  useGSAP(() => minimalReveal(section.current!), { scope: section });
  return (
    <section id="safety" ref={section} aria-labelledby="min-safety" className="mx-auto max-w-[1100px] px-4 py-32 sm:px-8">
      <h2 id="min-safety" data-mh className="max-w-[18ch] text-[clamp(2rem,4vw,3rem)] font-extrabold leading-[1.05] tracking-[-0.035em] text-merlot">
        Real life, with a playful system on top.
      </h2>
      <ul className="mt-14 grid gap-x-16 gap-y-10 md:grid-cols-2">
        {SAFETY.map((s) => (
          <li key={s.lead} data-mb className="max-w-[30rem] text-[1.125rem] leading-relaxed text-body">
            <strong className="hl hl-hover font-extrabold text-merlot">{s.lead}</strong> {s.body}
          </li>
        ))}
      </ul>
    </section>
  );
}

const NOTS = ["Not a dating app.", "Not another feed to scroll."];

export function WhoMinimal() {
  const section = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      const off = minimalReveal(section.current!);
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        section.current!.querySelectorAll<HTMLElement>("[data-not]").forEach((line) => {
          const words = line.querySelectorAll(".strike");
          gsap.set(words, { "--strike": 0 });
          gsap.to(words, {
            "--strike": 1,
            duration: 0.2,
            ease: "steps(5)",
            stagger: 0.12,
            scrollTrigger: { trigger: line, start: "top 75%", once: true },
          });
        });
      });
      return () => {
        mm.revert();
        off();
      };
    },
    { scope: section },
  );
  return (
    <section id="who" ref={section} aria-labelledby="min-who" className="mx-auto max-w-[1100px] px-4 py-32 sm:px-8">
      <h2 id="min-who" data-mh className="text-[clamp(2rem,4vw,3rem)] font-extrabold leading-[1.05] tracking-[-0.035em] text-merlot">
        Built for Cairo, for 18 to 35.
      </h2>
      <ul data-mb className="mt-10 flex flex-wrap gap-3" aria-label="Who it’s for">
        {["New to the area", "New to a group", "Tired of cancelling on plans"].map((p) => (
          <li key={p} className="wiggle px-frame px-corners" style={{ "--frame-w": "2px", "--step": "4px" } as React.CSSProperties}>
            <span className="px-frame-in px-corners block bg-coconut px-5 py-2.5 text-[1.0625rem] font-bold text-merlot" style={{ "--step": "3px" } as React.CSSProperties}>
              {p}
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-16 flex flex-col gap-2">
        {NOTS.map((line) => (
          <p key={line} data-not className="text-[clamp(1.6rem,3.4vw,2.6rem)] font-extrabold leading-[1.2] tracking-[-0.03em] text-merlot">
            {line.split(" ").map((w, i, arr) => (
              <Fragment key={i}>
                <span className={`strike${i < arr.length - 1 ? " strike-gap" : ""}`}>{w}</span>
                {i < arr.length - 1 && <span className="text-[0px]"> </span>}
              </Fragment>
            ))}
          </p>
        ))}
        <p data-mb className="mt-4 text-[clamp(1.6rem,3.4vw,2.6rem)] font-extrabold leading-[1.2] tracking-[-0.03em] text-merlot">
          Just plans, with <span className="hl">people</span>.
        </p>
      </div>
    </section>
  );
}

export function PartnersLine() {
  const section = useRef<HTMLElement>(null);
  useGSAP(() => minimalReveal(section.current!), { scope: section });
  return (
    <section id="contact" ref={section} aria-labelledby="min-partners" className="mx-auto max-w-[1100px] px-4 py-32 sm:px-8">
      <h2 id="min-partners" data-mh className="max-w-[24ch] text-[clamp(1.8rem,3.6vw,2.8rem)] font-extrabold leading-[1.1] tracking-[-0.03em] text-merlot">
        Run a place, brand or product that belongs in a Cairo plan?
      </h2>
      <div data-mb className="mt-8">
        <button type="button" onClick={openContact} className="btn btn-yellow roll-host">
          <Roll>Get in touch</Roll>
        </button>
      </div>
    </section>
  );
}

export function MinimalFooter() {
  const [frame, setFrame] = useState<FoxFrame>("happy");
  const link = "roll-host text-[0.9375rem] font-semibold text-merlot";
  return (
    <footer className="border-t border-merlot/10">
      <div className="relative mx-auto max-w-[1100px] px-4 pb-10 pt-16 sm:px-8">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={asset("/fox/Questita_wordmark_merlot.svg")} alt="Questita" width={1148} height={189} className="h-auto w-[120px]" />
            <p className="mt-4 max-w-[22ch] text-[1.0625rem] font-bold leading-snug text-merlot">For the people who make the big city feel smaller.</p>
          </div>
          <nav aria-label="Footer">
            <ul className="flex flex-col gap-2.5">
              <li>
                <a href="#board" className={link}>
                  <Roll>The board</Roll>
                </a>
              </li>
              <li>
                <a href="#how" className={link}>
                  <Roll>How it works</Roll>
                </a>
              </li>
              <li>
                <a href="#safety" className={link}>
                  <Roll>Safety</Roll>
                </a>
              </li>
              <li>
                <button type="button" onClick={openContact} className={`${link} cursor-pointer`}>
                  <Roll>Get in touch</Roll>
                </button>
              </li>
            </ul>
          </nav>
        </div>
        <div className="mt-14 flex flex-col gap-2 text-[0.875rem] font-medium text-body sm:flex-row sm:gap-8">
          <p>Made in Cairo. Made by Anglet.</p>
          <p>© 2026 Questita. All rights reserved.</p>
        </div>
        <div
          className="absolute bottom-8 right-4 w-[62px] sm:right-8"
          onPointerEnter={() => setFrame("wink")}
          onPointerLeave={() => setFrame("happy")}
        >
          <PixelFox frame={frame} label="The fox, waving" />
        </div>
      </div>
    </footer>
  );
}
