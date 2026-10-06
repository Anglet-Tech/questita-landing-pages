"use client";

import { useRef } from "react";
import { burstFrom } from "@/lib/burst";
import { useJoin } from "@/lib/useJoin";
import { SceneArt } from "@/components/QuestCard";
import type { FilmQuest } from "./content";

const TAG = {
  blue: "bg-blue",
  yellow: "bg-yellow",
  coconut: "bg-coconut",
} as const;

/**
 * A compact quest card for the film (the shared QuestCard is too tall to fit
 * three across in one pinned frame). Same board-poster language and the same
 * shared join hook: JOIN rolls to YOU’RE IN, spots scramble down, LEAVE undoes.
 */
export default function FilmQuestCard({ quest }: { quest: FilmQuest }) {
  const button = useRef<HTMLButtonElement>(null);
  const [join, tagRef] = useJoin({
    spots: quest.spots,
    day: quest.day,
    onJoin: () => {
      if (button.current) burstFrom(button.current, { count: 12, size: [6, 10], speed: [260, 560], duration: 800 });
    },
  });
  const { joined, isFull, status } = join;

  return (
    <article className="fq h-full" aria-labelledby={`${quest.id}-title`}>
      <div className="px-frame px-corners h-full" style={{ "--step": "6px" } as React.CSSProperties}>
        <div className="px-frame-in px-corners flex h-full flex-col gap-4 bg-coconut p-5 text-merlot xl:p-6">
          <div className="fq-scene relative w-full overflow-hidden">
            <SceneArt scene={quest.scene} />
            <span className={`font-px t-px1 absolute left-0 top-0 px-3 py-1.5 text-merlot ${TAG[quest.tag]}`}>{quest.kind}</span>
          </div>
          <h3 id={`${quest.id}-title`} className="text-[1.55rem] font-extrabold leading-[1.08] tracking-[-0.025em] xl:text-[1.75rem]">
            {quest.title}
          </h3>
          <div className="font-px t-px1 flex flex-wrap items-center gap-x-4 gap-y-2 text-body">
            <span>{quest.area}</span>
            <span>
              {quest.day}, {quest.time}
            </span>
            <span ref={tagRef as React.RefObject<HTMLSpanElement>} className="bg-yellow px-2.5 py-1 text-merlot">
              {join.label}
            </span>
          </div>
          <div className="mt-auto flex items-center gap-4">
            <button
              ref={button}
              type="button"
              onClick={join.toggle}
              onPointerLeave={join.clearFresh}
              onBlur={join.clearFresh}
              disabled={isFull}
              aria-pressed={joined}
              aria-label={joined ? `Leave ${quest.title}` : `Join ${quest.title}`}
              data-joined={joined || undefined}
              data-fresh={join.fresh || undefined}
              className="join font-px t-px1 relative h-12 min-w-[136px] overflow-hidden bg-merlot px-5 text-coconut"
            >
              {isFull ? (
                <span className="block leading-[48px]">Full</span>
              ) : (
                <span className="join-stack block" aria-hidden="true">
                  <span>Join</span>
                  <span>Join</span>
                  <span>You’re in</span>
                  <span>Leave</span>
                </span>
              )}
            </button>
            <span className="text-[1.15rem] font-bold tracking-[-0.02em]">Who’s in?</span>
          </div>
          <p aria-live="polite" className="min-h-[1.375rem] text-[0.9375rem] font-semibold leading-snug">
            {status}
          </p>
        </div>
      </div>
    </article>
  );
}
