"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger, SplitText, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { asset } from "@/lib/asset";
import { openContact, scrollToTarget, setScrollLock } from "@/lib/store";
import PixelFox from "./PixelFox";
import { Magnetic, Roll } from "./ui";
import NavCounter from "./NavCounter";

export const NAV_LINKS = [
  { href: "#board", label: "The board" },
  { href: "#how", label: "How it works" },
  { href: "#safety", label: "Safety" },
  { href: "#who", label: "Who it’s for" },
] as const;

/**
 * Fixed 68px nav. Transparent over the hero, then a merlot or coconut bar
 * (with a stepped bottom edge) matching the section underneath. A yellow
 * square slides under the active link.
 */
export default function Nav() {
  const nav = useRef<HTMLElement>(null);
  const links = useRef<HTMLUListElement>(null);
  const marker = useRef<HTMLSpanElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [pill, setPill] = useState(false);

  // Section-aware colour and active link, driven by ScrollTrigger toggles.
  useGSAP(
    () => {
      const el = nav.current!;
      const moveMarker = (id: string | null) => {
        const m = marker.current;
        const list = links.current;
        if (!m || !list) return;
        const a = id ? list.querySelector<HTMLAnchorElement>(`a[href="#${id}"]`) : null;
        list.querySelectorAll("a").forEach((x) => x.removeAttribute("aria-current"));
        if (!a) {
          gsap.to(m, { autoAlpha: 0, duration: 0.2 });
          return;
        }
        a.setAttribute("aria-current", "true");
        const lr = list.getBoundingClientRect();
        const ar = a.getBoundingClientRect();
        gsap.to(m, {
          autoAlpha: 1,
          x: ar.left - lr.left + ar.width / 2 - 3,
          duration: prefersReducedMotion() ? 0 : 0.5,
          ease: "expo.out",
        });
      };

      // The mini counter slides in once the hero (and its big counter) is gone.
      const hero = document.querySelector("#top");
      if (hero) {
        ScrollTrigger.create({
          trigger: hero,
          start: "bottom 68px",
          refreshPriority: -1,
          onEnter: () => setPill(true),
          onLeaveBack: () => setPill(false),
        });
      }

      document.querySelectorAll<HTMLElement>("[data-nav]").forEach((section) => {
        ScrollTrigger.create({
          trigger: section,
          start: "top 34px",
          end: "bottom 34px",
          refreshPriority: -1,
          onToggle: (self) => {
            if (self.isActive) el.dataset.theme = section.dataset.nav;
          },
        });
      });

      NAV_LINKS.forEach(({ href }) => {
        const section = document.querySelector<HTMLElement>(href);
        if (!section) return;
        ScrollTrigger.create({
          trigger: section,
          start: "top 50%",
          end: "bottom 50%",
          refreshPriority: -1,
          onToggle: (self) => {
            if (self.isActive) moveMarker(section.id);
            else if (!ScrollTrigger.getAll().some((t) => t.vars.id === "navlink" && t.isActive)) moveMarker(null);
          },
          id: "navlink",
        });
      });
    },
    { scope: nav },
  );

  const close = useCallback(() => setOpen(false), []);

  // Mobile menu: lock scroll, trap focus, Esc closes, links rise from masks.
  useEffect(() => {
    const m = menu.current;
    const toggleBtn = toggle.current;
    if (!m) return;
    if (!open) return;
    setScrollLock("menu", true);
    const focusables = () =>
      Array.from(m.querySelectorAll<HTMLElement>("a[href], button:not([disabled])")).filter(
        (x) => x.offsetParent !== null,
      );
    const first = focusables()[0];
    first?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
        return;
      }
      if (e.key !== "Tab") return;
      const f = focusables();
      if (!f.length) return;
      const a = f[0];
      const z = f[f.length - 1];
      if (e.shiftKey && document.activeElement === a) {
        e.preventDefault();
        z.focus();
      } else if (!e.shiftKey && document.activeElement === z) {
        e.preventDefault();
        a.focus();
      }
    };
    document.addEventListener("keydown", onKey);

    let split: SplitText | null = null;
    const ctx = gsap.context(() => {
      if (prefersReducedMotion()) return;
      split = SplitText.create(m.querySelectorAll("[data-menu-link]"), {
        type: "lines",
        mask: "lines",
        linesClass: "split-mask",
      });
      gsap
        .timeline()
        .fromTo(m, { clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0% 0)", duration: 0.5, ease: "expo.out" })
        .from(split.lines, { yPercent: 110, duration: 0.8, ease: "expo.out", stagger: 0.06 }, 0.12)
        .from("[data-menu-fox]", { yPercent: 40, autoAlpha: 0, duration: 0.5, ease: "steps(4)" }, 0.3);
    }, m);

    return () => {
      document.removeEventListener("keydown", onKey);
      ctx.revert();
      split?.revert();
      setScrollLock("menu", false);
      toggleBtn?.focus();
    };
  }, [open]);

  // Close the menu if the viewport grows into desktop.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const onChange = () => mq.matches && setOpen(false);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return (
    <>
      <header>
        <nav
          ref={nav}
          data-theme="hero"
          aria-label="Primary"
          className="nav group/nav fixed inset-x-0 top-0 z-50 h-[var(--nav-h)]"
        >
          <div className="nav-bar absolute inset-0" aria-hidden="true" />
          <div className="relative mx-auto flex h-full max-w-[1440px] items-center justify-between gap-6 px-4 sm:px-8 lg:px-12">
            <a href="#top" className="relative block h-[22px] w-[134px] shrink-0" aria-label="Questita, back to top">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={asset("/fox/Questita_wordmark_coconutmilk.svg")}
                alt=""
                width={1148}
                height={189}
                className="nav-mark-light absolute inset-0 h-full w-full"
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={asset("/fox/Questita_wordmark_merlot.svg")}
                alt=""
                width={1148}
                height={189}
                className="nav-mark-dark absolute inset-0 h-full w-full"
              />
            </a>

            <ul ref={links} className="relative hidden items-center gap-8 lg:flex">
              {NAV_LINKS.map((l) => (
                <li key={l.href}>
                  <a href={l.href} className="nav-link roll-host block py-2 text-[0.9375rem] font-semibold leading-6">
                    <Roll>{l.label}</Roll>
                  </a>
                </li>
              ))}
              <span
                ref={marker}
                aria-hidden="true"
                className="nav-marker pointer-events-none invisible absolute -bottom-1 left-0 h-1.5 w-1.5"
              />
            </ul>

            <div className="nav-right relative flex items-center gap-2 sm:gap-3">
              <NavCounter visible={pill} />
              <Magnetic className={`nav-cta${pill ? " has-pill" : ""}`}>
                <button type="button" onClick={openContact} className="btn btn-yellow btn-sm roll-host">
                  <Roll>Get in touch</Roll>
                </button>
              </Magnetic>
              <button
                ref={toggle}
                type="button"
                className="nav-burger relative grid h-11 w-11 place-items-center lg:hidden"
                aria-expanded={open}
                aria-controls="mobile-menu"
                aria-label={open ? "Close menu" : "Open menu"}
                onClick={() => setOpen((v) => !v)}
              >
                <span className="burger" aria-hidden="true" />
              </button>
            </div>
          </div>
        </nav>
      </header>

      <div
        ref={menu}
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        hidden={!open}
        className="on-dark fixed inset-0 z-[60] overflow-y-auto bg-merlot text-coconut lg:hidden"
        data-lenis-prevent
      >
        <div className="flex min-h-full flex-col px-5 pb-10 pt-5 sm:px-8">
          <div className="flex items-center justify-between">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={asset("/fox/Questita_wordmark_coconutmilk.svg")} alt="Questita" width={1148} height={189} className="h-[22px] w-auto" />
            <button
              type="button"
              onClick={close}
              className="relative grid h-11 w-11 place-items-center"
              aria-label="Close menu"
            >
              <span className="burger is-open" aria-hidden="true" />
            </button>
          </div>
          <ul className="mt-14 flex flex-col gap-2">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  data-menu-link
                  onClick={(e) => {
                    e.preventDefault();
                    setOpen(false);
                    // Wait for the scroll lock to lift, then glide there.
                    setTimeout(() => scrollToTarget(l.href), 60);
                  }}
                  className="block text-[clamp(2.6rem,11vw,4.5rem)] font-extrabold leading-[1.05] tracking-[-0.035em]"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-auto flex items-end justify-between gap-6 pt-12">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                openContact();
              }}
              className="btn btn-yellow roll-host"
            >
              <Roll>Get in touch</Roll>
            </button>
            <div data-menu-fox className="w-[123px] shrink-0">
              <PixelFox frame="wink" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
