"use client";

import { asset } from "@/lib/asset";
import { openContact } from "@/lib/store";
import { Arrow, Roll } from "../ui";

const LINKS = [
  { href: "#what", label: "What is Questita" },
  { href: "#how", label: "How it works" },
  { href: "#who", label: "Who it’s for" },
  { href: "#safety", label: "Safety" },
  { href: "#creators", label: "About the creators" },
];

/** A strip of coconut tape across the top of the wall. */
export default function WallNav() {
  return (
    <header className="wl-nav">
      <nav aria-label="Primary" className="mx-auto flex h-full max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-8 lg:px-12">
        <a href="#start" className="block w-[96px] shrink-0 lg:w-[112px]" aria-label="Questita, back to top">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={asset("/fox/Questita_wordmark_merlot.svg")} alt="" width={1148} height={189} className="h-auto w-full" />
        </a>
        <ul className="hidden items-center gap-5 lg:flex xl:gap-7">
          {LINKS.map((l) => (
            <li key={l.href}>
              <a href={l.href} className="roll-host text-[0.9375rem] font-semibold text-merlot">
                <Roll>{l.label}</Roll>
              </a>
            </li>
          ))}
        </ul>
        <button type="button" onClick={openContact} className="btn btn-merlot btn-sm roll-host !min-h-[40px] !py-2">
          <Roll>Get in touch</Roll>
          <Arrow />
        </button>
      </nav>
    </header>
  );
}
