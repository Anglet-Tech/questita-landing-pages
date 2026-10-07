"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * "All options": a small stepped-corner pill, fixed bottom-left on every route
 * except the chooser ("/"), linking back to it. Rendered once from layout.tsx,
 * so no route file changes. `next/link` applies the base path on GitHub Pages.
 *
 * Layer: z-index 58. Above every in-page layer (the highest is 50), below the
 * fixed navs, their full-screen menus and the film chrome (60), the preloader
 * (100) and the skip link (200). Dialogs sit in the top layer above all of it.
 *
 * On touch devices and short landscape screens it stays hidden for the first half
 * screen of scroll (CSS scroll timeline), so it never sits on a hero CTA.
 * Below 480px wide it collapses to a 44 x 44 icon button (label kept for
 * screen readers) so it covers as little as possible on phones.
 *
 * Position: 16px from the bottom-left corner plus the safe-area insets. Routes
 * with their own bottom-left UI get an offset from OFFSETS (keyed by the first
 * path segment), never an edit to the route itself. Values are px added to the
 * default inset, per breakpoint.
 */
type Offset = { x?: number; y?: number };
type RouteOffsets = { base?: Offset; md?: Offset; lg?: Offset };

const OFFSETS: Record<string, RouteOffsets> = {
  // /quest/ (frozen): the HUD XP bar and route panel sit at left 24, bottom 20,
  // 40 high from 768px wide up. Stack the pill 8px above them.
  quest: { md: { y: 52 } },
};

// The Next.js dev indicator lives bottom-left in development only.
const DEV_X = process.env.NODE_ENV === "development" ? 52 : 0;

export default function OptionsPill() {
  const pathname = usePathname();
  if (!pathname || pathname === "/" || pathname === "/index.html") return null;

  const key = pathname.split("/").filter(Boolean)[0] ?? "";
  const o = OFFSETS[key] ?? {};
  const vars = {
    "--op-x": `${(o.base?.x ?? 0) + DEV_X}px`,
    "--op-y": `${o.base?.y ?? 0}px`,
    "--op-x-md": `${(o.md?.x ?? o.base?.x ?? 0) + DEV_X}px`,
    "--op-y-md": `${o.md?.y ?? o.base?.y ?? 0}px`,
    "--op-x-lg": `${(o.lg?.x ?? o.md?.x ?? o.base?.x ?? 0) + DEV_X}px`,
    "--op-y-lg": `${o.lg?.y ?? o.md?.y ?? o.base?.y ?? 0}px`,
  } as React.CSSProperties;

  return (
    <>
      <Link href="/" className="options-pill on-dark" style={vars} data-route={key}>
        <span className="options-pill-bg" aria-hidden="true" />
        <svg viewBox="0 0 9 9" width="14" height="14" shapeRendering="crispEdges" aria-hidden="true" focusable="false">
          <rect x="0" y="0" width="4" height="4" fill="currentColor" />
          <rect x="5" y="0" width="4" height="4" fill="currentColor" />
          <rect x="0" y="5" width="4" height="4" fill="currentColor" />
          <rect x="5" y="5" width="4" height="4" fill="currentColor" />
        </svg>
        <span className="options-pill-label">All options</span>
      </Link>
      <style>{PILL_CSS}</style>
    </>
  );
}

const STEPS = (s: string) =>
  `polygon(0 calc(${s}*2),${s} calc(${s}*2),${s} ${s},calc(${s}*2) ${s},calc(${s}*2) 0,calc(100% - ${s}*2) 0,calc(100% - ${s}*2) ${s},calc(100% - ${s}) ${s},calc(100% - ${s}) calc(${s}*2),100% calc(${s}*2),100% calc(100% - ${s}*2),calc(100% - ${s}) calc(100% - ${s}*2),calc(100% - ${s}) calc(100% - ${s}),calc(100% - ${s}*2) calc(100% - ${s}),calc(100% - ${s}*2) 100%,calc(${s}*2) 100%,calc(${s}*2) calc(100% - ${s}),${s} calc(100% - ${s}),${s} calc(100% - ${s}*2),0 calc(100% - ${s}*2))`;

const PILL_CSS = `
.options-pill{position:fixed;z-index:58;left:calc(16px + env(safe-area-inset-left) + var(--op-x));bottom:calc(16px + env(safe-area-inset-bottom) + var(--op-y));display:inline-flex;align-items:center;gap:9px;height:44px;padding:0 16px 0 14px;color:var(--coconut);font-family:var(--font-sans);font-weight:700;font-size:.875rem;line-height:1;white-space:nowrap;isolation:isolate;text-decoration:none;filter:drop-shadow(3px 4px 6px rgba(36,27,31,.28))}
.options-pill-bg{position:absolute;inset:0;z-index:-1;background:var(--coconut);clip-path:${STEPS("3px")}}
.options-pill-bg::after{content:"";position:absolute;inset:2px;background:var(--merlot);clip-path:${STEPS("3px")}}
.options-pill:focus-visible{outline:3px solid var(--yellow);outline-offset:3px}
.options-pill svg{flex:none}
@media (min-width:768px){.options-pill{left:calc(16px + env(safe-area-inset-left) + var(--op-x-md));bottom:calc(16px + env(safe-area-inset-bottom) + var(--op-y-md))}}
@media (min-width:1024px){.options-pill{left:calc(16px + env(safe-area-inset-left) + var(--op-x-lg));bottom:calc(16px + env(safe-area-inset-bottom) + var(--op-y-lg))}}
@media (prefers-reduced-motion:no-preference) and (hover:hover){.options-pill{transition:transform .2s cubic-bezier(.16,1,.3,1)}.options-pill:hover{transform:translateY(-2px)}.options-pill:active{transform:translateY(1px)}}
/* Phones: icon only (44 x 44), the label stays for screen readers. */
@media (max-width:479px){.options-pill{width:44px;padding:0;justify-content:center}.options-pill-label{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}}
/* Phones, tablets (coarse pointers) and short landscape screens: hero CTAs sit bottom-left in the first
   viewport, so the pill wakes up only after half a screen of scroll. Pure CSS
   (a scroll-driven animation, no scroll listener), a discrete on/off with no
   movement; browsers without scroll timelines simply always show it. */
@keyframes options-pill-wake{0%,99%{visibility:hidden;opacity:0}100%{visibility:visible;opacity:1}}
@supports (animation-timeline:scroll()){@media (max-width:479px),(max-height:500px),(pointer:coarse){.options-pill{animation:options-pill-wake linear both;animation-timeline:scroll(root block);animation-range:0 50vh}}}
@media print{.options-pill{display:none}}
`;
