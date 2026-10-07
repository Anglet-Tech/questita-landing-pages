"use client";

import { useEffect, useRef, useState } from "react";
import { asset } from "@/lib/asset";
import { openContact, setScrollLock } from "@/lib/store";
import { Arrow, Roll } from "../ui";

const LINKS = [
  { href: "#what", label: "What is Questita", short: "What" },
  { href: "#how", label: "How it works", short: "How" },
  { href: "#who", label: "Who it’s for", short: "Who" },
  { href: "#safety", label: "Safety", short: "Safety" },
  { href: "#creators", label: "About the creators", short: "Creators" },
];

/** Pixel burger that becomes a pixel X, built from 2px squares. */
const X_PATH = [0, 1, 2, 3, 4, 5].map((k) => `M${k * 2} ${k * 2}h2v2h-2zM${10 - k * 2} ${k * 2}h2v2h-2z`).join("");
function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 12 12" width="24" height="24" shapeRendering="crispEdges" aria-hidden="true">
      <path d={open ? X_PATH : "M0 1h12v2H0zM0 5h12v2H0zM0 9h12v2H0z"} fill="currentColor" />
    </svg>
  );
}

/** A strip of coconut tape across the top of the wall. Below 1024px the links live in a pixel menu. */
export default function WallNav() {
  const [open, setOpen] = useState(false);
  const btn = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    setScrollLock("wall-menu", true);
    panel.current?.querySelector<HTMLElement>("a")?.focus();
    const close = (refocus: boolean) => {
      setOpen(false);
      if (refocus) btn.current?.focus();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close(true);
        return;
      }
      if (e.key !== "Tab") return;
      // Focus stays inside the menu: the toggle plus the links.
      const items = [btn.current, ...Array.from(panel.current?.querySelectorAll<HTMLElement>("a, button") ?? [])].filter(Boolean) as HTMLElement[];
      const i = items.indexOf(document.activeElement as HTMLElement);
      if (e.shiftKey && (i <= 0)) {
        e.preventDefault();
        items[items.length - 1].focus();
      } else if (!e.shiftKey && i === items.length - 1) {
        e.preventDefault();
        items[0].focus();
      }
    };
    const onResize = () => {
      if (window.innerWidth >= 1024) close(false);
    };
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      setScrollLock("wall-menu", false);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, [open]);

  // Release the scroll lock before the page-wide anchor handler scrolls.
  const pick = () => {
    setScrollLock("wall-menu", false);
    setOpen(false);
  };

  return (
    <header className="wl-nav">
      <nav aria-label="Primary" className="wl-nav-in mx-auto flex h-full max-w-[1440px] items-center justify-between gap-3">
        <a href="#start" className="flex min-h-[44px] w-[84px] shrink-0 items-center sm:w-[96px] lg:w-[112px]" aria-label="Questita, back to top">
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
        <div className="flex items-center gap-2">
          <button type="button" onClick={openContact} className="wl-nav-cta btn btn-merlot btn-sm roll-host !min-h-[44px] !py-2 lg:!min-h-[40px]">
            <Roll>Get in touch</Roll>
            <Arrow className="wl-nav-arrow" />
          </button>
          <button
            ref={btn}
            type="button"
            className="wl-menu-btn grid h-11 w-11 place-items-center text-merlot lg:hidden"
            aria-expanded={open}
            aria-controls="wl-menu"
            aria-label={open ? "Close menu" : "Menu"}
            onClick={() => setOpen((v) => !v)}
          >
            <MenuIcon open={open} />
          </button>
        </div>
      </nav>

      {open && (
        <>
          <button type="button" className="wl-menu-scrim lg:hidden" aria-hidden="true" tabIndex={-1} onClick={() => setOpen(false)} />
          <div ref={panel} id="wl-menu" className="wl-menu lg:hidden">
            <ul className="mx-auto flex max-w-[640px] flex-col px-4 pb-6 pt-2 sm:px-8">
              {LINKS.map((l, i) => (
                <li key={l.href} style={{ "--i": i } as React.CSSProperties}>
                  <a href={l.href} onClick={pick} className="wl-menu-link flex min-h-[56px] items-center justify-between border-b-4 border-merlot/10 text-[1.75rem] font-extrabold tracking-[-0.03em] text-merlot">
                    {l.short}
                    <Arrow />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </header>
  );
}
