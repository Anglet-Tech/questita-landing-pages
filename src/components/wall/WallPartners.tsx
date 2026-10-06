"use client";

import { useRef } from "react";
import { gsap, MQ, useIdleGSAP } from "@/lib/gsap";
import { openContact } from "@/lib/store";
import { Arrow, Magnetic, Roll } from "../ui";
import { flowTrigger } from "./flow";

/** Blue poster, sized to the merlot ticket on it. */
export default function WallPartners() {
  const root = useRef<HTMLDivElement>(null);
  const ticket = useRef<HTMLDivElement>(null);

  useIdleGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        gsap.from(ticket.current, {
          autoAlpha: 0,
          scale: 1.18,
          rotation: 5,
          duration: 0.34,
          ease: "steps(4)",
          scrollTrigger: { ...flowTrigger(ticket.current!, "86%"), toggleActions: "play none none reverse" },
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <div ref={root} className="mx-auto max-w-[1120px] px-4 pb-14 pt-[calc(var(--wl-nav)+36px)] sm:px-8 lg:pb-16 lg:pt-[calc(var(--wl-nav)+44px)]">
      <div ref={ticket} className="wl-pticket flex -rotate-1 flex-col md:flex-row">
        <div className="px-corners on-dark flex-1 bg-merlot p-7 sm:p-10 lg:p-12">
          <h2 id="wl-partners-t" className="text-[clamp(2.1rem,4.2vw,3.6rem)] font-extrabold leading-[1.02] tracking-[-0.035em] text-coconut">
            Want to be part
            <br />
            of the plan?
          </h2>
          <p className="mt-4 max-w-[30rem] text-[1.0625rem] font-medium leading-relaxed text-coconut-78">
            If you run a place, brand or product that belongs in a Cairo plan, we’d love to talk.
          </p>
          <div className="mt-7">
            <Magnetic>
              <button type="button" onClick={openContact} className="btn btn-yellow roll-host">
                <Roll>Get in touch</Roll>
                <Arrow />
              </button>
            </Magnetic>
          </div>
        </div>
        <div className="wl-pperf h-[18px] md:h-auto md:w-[18px]" aria-hidden="true" />
        <div className="wl-pstub" aria-hidden="true">
          <div className="wl-pstub-in px-corners flex h-full flex-row items-center justify-between gap-4 bg-merlot p-6 md:w-[230px] md:flex-col md:items-start md:justify-center md:p-8">
            <span className="font-px t-px3 leading-[1.05] text-yellow">
              Your
              <br />
              spot
            </span>
            <span className="font-px t-px1 max-w-[12ch] leading-[1.7] tracking-[0.18em] text-blue">Admits the whole group</span>
          </div>
        </div>
      </div>
    </div>
  );
}
