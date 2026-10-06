"use client";

import { useEffect, useRef, useState } from "react";
import { asset } from "@/lib/asset";
import { gsap, ScrollTrigger, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { openContact } from "@/lib/store";
import { Arrow, Magnetic, Roll } from "../ui";

export const TEAM_LINKS = [
  { href: "#what", label: "What is Questita" },
  { href: "#how", label: "How it works" },
  { href: "#who", label: "Who it’s for" },
  { href: "#safety", label: "Safety" },
  { href: "#creators", label: "About the creators" },
] as const;

/**
 * The team's sticky coconut bar, in pixel shapes: a stepped bottom edge and a
 * stepped merlot chip that slides under the active link.
 */
export default function TeamNav() {
  const list = useRef<HTMLUListElement>(null);
  const marker = useRef<HTMLSpanElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);

  // Active link, from the static section anchors (never the sticky sections).
  useGSAP(() => {
    const set = (id: string | null) => {
      const ul = list.current;
      const m = marker.current;
      if (!ul || !m) return;
      ul.querySelectorAll("a").forEach((a) => a.removeAttribute("aria-current"));
      const a = id ? ul.querySelector<HTMLAnchorElement>(`a[href="#${id}"]`) : null;
      if (!a) {
        gsap.to(m, { autoAlpha: 0, duration: 0.15, ease: "steps(2)" });
        return;
      }
      a.setAttribute("aria-current", "true");
      gsap.to(m, {
        autoAlpha: 1,
        x: a.offsetLeft,
        width: a.offsetWidth,
        duration: prefersReducedMotion() ? 0 : 0.5,
        ease: "expo.out",
      });
    };
    const ids = TEAM_LINKS.map((l) => l.href.slice(1));
    ids.forEach((id, i) => {
      const anchor = document.getElementById(id);
      if (!anchor) return;
      ScrollTrigger.create({
        trigger: anchor,
        start: "top 45%",
        onEnter: () => set(id),
        onLeaveBack: () => set(i > 0 ? ids[i - 1] : null),
      });
    });
  });

  // Close the mobile menu on Escape, return focus to the toggle.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggle.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="tm-nav">
      <div className="tm-wrap flex h-full items-center gap-4">
        <a href="#top" aria-label="Questita, back to top" className="shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={asset("/fox/Questita_wordmark_merlot.svg")} alt="" width={1148} height={189} className="h-auto w-[124px] lg:w-[134px]" />
        </a>

        <nav aria-label="Sections" className="mx-auto hidden lg:block">
          <div className="relative">
            <span ref={marker} className="tm-marker px-corners" aria-hidden="true" />
            <ul ref={list} className="flex items-center gap-1">
              {TEAM_LINKS.map((l) => (
                <li key={l.href}>
                  <a href={l.href} className="tm-navlink roll-host">
                    <Roll>{l.label}</Roll>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        <div className="ml-auto hidden lg:block">
          <Magnetic strength={6}>
            <button type="button" onClick={openContact} className="btn btn-merlot btn-sm roll-host">
              <Roll>Get in touch</Roll>
              <Arrow />
            </button>
          </Magnetic>
        </div>

        <button
          ref={toggle}
          type="button"
          className="ml-auto grid h-11 w-11 place-items-center lg:hidden"
          aria-expanded={open}
          aria-controls="tm-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((o) => !o)}
        >
          <span className={`burger ${open ? "is-open" : ""}`} />
        </button>
      </div>

      <nav id="tm-menu" aria-label="Sections" className="tm-menu lg:hidden" hidden={!open}>
        <ul className="flex flex-col">
          {TEAM_LINKS.map((l) => (
            <li key={l.href}>
              <a href={l.href} onClick={() => setOpen(false)} className="block py-3 text-[1.375rem] font-extrabold tracking-[-0.02em] text-merlot">
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            openContact();
          }}
          className="btn btn-merlot btn-sm roll-host mt-4"
        >
          <Roll>Get in touch</Roll>
          <Arrow />
        </button>
      </nav>
    </header>
  );
}
