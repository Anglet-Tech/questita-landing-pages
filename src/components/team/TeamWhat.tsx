"use client";

import { useRef, useState } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import type { FoxFrame } from "@/lib/fox";
import PixelFox from "../PixelFox";
import TeamQuest from "./TeamQuest";
import { revealOnView, riseOnView, whenVisible } from "./motion";

/** What is Questita: copy left, the blue "On the board" panel right. */
export default function TeamWhat() {
  const section = useRef<HTMLElement>(null);
  const h2 = useRef<HTMLHeadingElement>(null);
  const board = useRef<HTMLDivElement>(null);
  const [fox, setFox] = useState<FoxFrame>("wink");

  useGSAP(
    () => {
      const offs = [revealOnView(h2.current), riseOnView(h2.current, section.current!.querySelectorAll("[data-rise]"), { delay: 0.25 })];
      if (!prefersReducedMotion()) {
        const cards = gsap.utils.toArray<HTMLElement>("[data-card]", board.current);
        gsap.set(cards, { y: 60, autoAlpha: 0 });
        offs.push(
          whenVisible(board.current, () => {
            gsap.to(cards, { y: 0, autoAlpha: 1, duration: 0.9, ease: "expo.out", stagger: 0.12 });
          }),
        );
      }
      return () => offs.forEach((f) => f());
    },
    { scope: section },
  );

  return (
    <section ref={section} data-pin aria-labelledby="tm-what-title" className="tm-sec tm-what tm-full py-16 lg:py-[clamp(32px,8vh,96px)]">
      <div className="tm-inner tm-wrap grid grid-cols-1 items-center gap-14 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-[clamp(32px,5vw,68px)]">
        <div className="flex flex-col gap-4">
          <h2 id="tm-what-title" ref={h2} className="text-[clamp(2.125rem,min(4.4vw,6.4vh),3.5rem)] font-extrabold leading-[1.04] tracking-[-0.03em] text-merlot">
            A quest is just a plan worth showing up for.
          </h2>
          <p data-rise className="text-[1.0625rem] leading-relaxed text-body">
            Cairo is big, and most good plans die at “we should do something.” Questita makes it easier to find someone to do the thing with.
          </p>
          <p data-rise className="text-[1.0625rem] leading-relaxed text-body">
            Post a quest or join one: a coffee run, a sunset ride, a first-time class. Then show up, with people who are already going.
          </p>
        </div>

        <div ref={board} className="tm-board px-bg px-[18px] pb-6 pt-14 lg:p-0">
          <p className="font-px t-px2 text-merlot lg:absolute lg:left-8 lg:top-7">On the board</p>
          <div
            className="absolute -top-14 right-4 w-[92px] lg:-top-[52px] lg:right-10 lg:w-[132px]"
            onPointerEnter={() => setFox("wow")}
            onPointerLeave={() => setFox("wink")}
          >
            <PixelFox frame={fox} label="The fox, winking" />
          </div>
          <div className="mt-4 flex flex-col gap-4 lg:mt-0">
            <div data-card className="tm-bcard tm-bcard-a">
              <div className="tm-lift" style={{ "--rot": "-3deg" } as React.CSSProperties}>
                <TeamQuest tag="Coffee run" title="Flat white and a walk" desc="Two cups, one loop around the neighborhood." area="Garden City" when="Sat, 10:00 AM" day="Sat" spots={2} />
              </div>
            </div>
            <div data-card className="tm-bcard tm-bcard-b">
              <div className="tm-lift" style={{ "--rot": "2.5deg" } as React.CSSProperties}>
                <TeamQuest tag="First-time class" title="Beginner pottery, zero pressure" desc="Nobody here has done this before. That’s the point." area="Maadi" when="Sun, 6:00 PM" day="Sun" spots={4} join />
              </div>
            </div>
            <div data-card className="tm-bcard tm-bcard-c">
              <div className="tm-lift" style={{ "--rot": "-1.5deg" } as React.CSSProperties}>
                <TeamQuest tag="Sunset ride" title="Corniche bike ride" area="Zamalek" when="Fri, 5:00 PM" day="Fri" spots={0} full merlot />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
