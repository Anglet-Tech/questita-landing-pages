"use client";

import { useEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { type Day, useJoin } from "@/lib/useJoin";

export interface TeamQuestProps {
  tag: string;
  tagBg?: "yellow" | "blue";
  title: string;
  desc?: string;
  area: string;
  when: string;
  day: Day;
  spots: number;
  full?: boolean;
  join?: boolean;
  merlot?: boolean;
  compact?: boolean;
  className?: string;
}

/**
 * One sample quest from the team page, as a stepped-corner card. Cards with
 * `join` get the real join state (spots scramble down, label rolls, the note
 * is announced politely).
 */
export default function TeamQuest({ tag, tagBg = "yellow", title, desc, area, when, day, spots, full, join, merlot, compact, className = "" }: TeamQuestProps) {
  const [q, tagRef] = useJoin({ spots, full, day });
  const btn = useRef<HTMLButtonElement>(null);

  // A two-frame hop on join.
  useEffect(() => {
    if (!q.fresh || !btn.current || prefersReducedMotion()) return;
    const tl = gsap.timeline().to(btn.current, { y: -4, duration: 0.08, ease: "steps(1)" }).to(btn.current, { y: 0, duration: 0.08, ease: "steps(1)" });
    const t = setTimeout(q.clearFresh, 900);
    return () => {
      tl.kill();
      clearTimeout(t);
    };
  }, [q.fresh, q.clearFresh]);

  return (
    <article className={`tm-qcard px-corners ${merlot ? "tm-qcard-merlot" : ""} ${className}`} aria-label={title}>
      <span className={`tm-tag font-px px-corners ${tagBg === "blue" ? "bg-blue" : "bg-yellow"}`}>{tag}</span>
      <h3 className={`font-extrabold leading-[1.2] tracking-[-0.01em] ${compact ? "text-[1rem]" : "text-[1.125rem]"}`}>{title}</h3>
      {desc && <p className={`tm-qdesc text-[0.8125rem] leading-snug ${merlot ? "text-coconut" : "text-body"}`}>{desc}</p>}
      <p className={`text-[0.75rem] font-semibold ${merlot ? "text-blue" : "text-body"}`}>
        {area} · {when} · <span ref={tagRef}>{q.label}</span>
      </p>
      {join && !full && (
        <button
          ref={btn}
          type="button"
          onClick={q.toggle}
          disabled={q.isFull}
          data-joined={q.joined ? "" : undefined}
          data-fresh={q.fresh ? "" : undefined}
          aria-pressed={q.joined}
          aria-label={q.joined ? `Leave ${title}` : `Join ${title}`}
          className="tm-join px-corners mt-1 w-full"
        >
          <span className="tm-join-stack" aria-hidden="true">
            <span>Join the quest</span>
            <span>Join the quest</span>
            <span>You’re in</span>
            <span>Leave</span>
          </span>
        </button>
      )}
      {(join || full) && (
        <p className={`text-[0.8125rem] font-semibold ${merlot ? "text-coconut" : "text-merlot"} ${q.status && !compact ? "" : "sr-only"}`} aria-live="polite">
          {q.status}
        </p>
      )}
    </article>
  );
}
