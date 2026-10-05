"use client";

import { memo } from "react";
import { HOW_STEPS } from "./content";

/*
 * Four tiny animated pixel scenes for "The Route", built from SVG rects.
 * Each scene has four frame groups (.q-vf-0..3) and a pure CSS 4-frame loop
 * with steps timing, so there is no per-frame JavaScript. Under reduced motion
 * only frame 1 shows.
 */

const M = "#681B2B";
const Y = "#FEE571";
const B = "#B4D4FB";
const K = "#F9F5E9";
const N = "#571623";

type R = [number, number, number, number, string];
const rects = (rs: R[]) => rs.map(([x, y, w, h, c], i) => <rect key={i} x={x} y={y} width={w} height={h} fill={c} />);

/** A 9 x 8 fox face. `look` shifts the pupils -1, 0 or +1. */
function miniFox(x: number, y: number, look = 0): R[] {
  return [
    [x, y, 2, 3, Y],
    [x + 7, y, 2, 3, Y],
    [x + 1, y + 1, 1, 2, B],
    [x + 7, y + 1, 1, 2, B],
    [x, y + 3, 9, 3, Y],
    [x + 1, y + 6, 7, 2, K],
    [x + 2 + look, y + 4, 1, 1, M],
    [x + 6 + look, y + 4, 1, 1, M],
    [x + 4, y + 6, 1, 1, M],
  ];
}

/** A 5 x 9 person. */
function figure(x: number, y: number, c: string, step = 0): R[] {
  return [
    [x + 1, y, 3, 3, M],
    [x + 2, y + 1, 1, 1, K],
    [x, y + 3, 5, 3, c],
    [x + 1, y + 6, 1, 3 - step, M],
    [x + 3, y + 6, 1, 2 + step, M],
  ];
}

function bang(x: number, y: number): R[] {
  return [
    [x, y, 5, 6, Y],
    [x + 2, y + 1, 1, 2, M],
    [x + 2, y + 4, 1, 1, M],
    [x - 1, y, 1, 6, M],
    [x + 5, y, 1, 6, M],
    [x, y - 1, 5, 1, M],
    [x, y + 6, 5, 1, M],
  ];
}

const txt = (x: number, y: number, s: string, fill = M, size = 5) => (
  <text x={x} y={y} fill={fill} fontSize={size} className="q-vtext">
    {s}
  </text>
);

function Frames({ children }: { children: React.ReactNode[] }) {
  return (
    <>
      {children.map((f, i) => (
        <g key={i} className={`q-vf q-vf-${i}`}>
          {f}
        </g>
      ))}
    </>
  );
}

const W = 96;
const H = 54;

function SceneExplore() {
  const base: R[] = [
    [0, 0, W, H, K],
    [0, 30, W, 8, B],
    [10, 33, 6, 1, K],
    [40, 35, 8, 1, K],
    [70, 32, 5, 1, K],
    [6, 8, 12, 9, M],
    [72, 6, 14, 10, M],
    [76, 42, 12, 8, M],
    [4, 42, 10, 8, M],
  ];
  const fox = (look: number) => miniFox(43, 18, look);
  return (
    <>
      {rects(base)}
      <Frames>
        {[
          rects([...fox(-1)]),
          rects([...fox(1), ...bang(24, 6)]),
          rects([...fox(-1), ...bang(24, 6), ...bang(64, 22)]),
          rects([...fox(0), ...bang(24, 6), ...bang(64, 22), ...bang(34, 40)]),
        ]}
      </Frames>
    </>
  );
}

function SceneJoin() {
  const card = (n: string, extra: R[] = [], label?: React.ReactNode) => (
    <>
      {rects([[14, 8, 44, 34, M], [15, 9, 42, 32, K], [18, 13, 20, 3, M], [18, 18, 28, 2, N], ...extra])}
      {txt(19, 32, n)}
      {label}
    </>
  );
  const fox = miniFox(66, 30, -1);
  return (
    <>
      {rects([[0, 0, W, H, Y]])}
      <Frames>
        {[
          <>{card("2/4 IN")}{rects(fox)}</>,
          <>{card("2/4 IN", [[46, 34, 4, 4, M]])}{rects([...miniFox(56, 30, -1), [53, 34, 3, 2, Y]])}</>,
          <>{card("3/4 IN")}{rects(fox)}{rects([[60, 6, 16, 9, M]])}{txt(62, 13, "+1", Y)}</>,
          <>{rects([[10, 12, 44, 30, M], [11, 13, 42, 28, K]])}{txt(16, 30, "+ POST")}{rects([[58, 8, 30, 30, M], [59, 9, 28, 28, B]])}{txt(62, 27, "NEW", M)}{rects(miniFox(66, 40, 0))}</>,
        ]}
      </Frames>
    </>
  );
}

function SceneChat() {
  const people: R[] = [...figure(10, 38, B), ...figure(80, 38, Y)];
  const bubble = (x: number, y: number, w: number, tailLeft: boolean): R[] => [
    [x, y, w, 11, M],
    [x + 1, y + 1, w - 2, 9, K],
    [tailLeft ? x + 3 : x + w - 6, y + 11, 3, 2, M],
  ];
  return (
    <>
      {rects([[0, 0, W, H, B], [0, 47, W, 7, K]])}
      {rects(people)}
      <Frames>
        {[
          <></>,
          <>{rects(bubble(6, 22, 34, true))}{txt(9, 30, "WHERE?")}</>,
          <>{rects(bubble(6, 22, 34, true))}{txt(9, 30, "WHERE?")}{rects(bubble(50, 10, 42, false))}{txt(53, 18, "ZAMALEK")}</>,
          <>{rects(bubble(50, 10, 42, false))}{txt(53, 18, "ZAMALEK")}{rects(bubble(4, 24, 76, true))}{txt(7, 32, "WHO’S BRINGING SNACKS?", M, 4)}</>,
        ]}
      </Frames>
    </>
  );
}

function SceneShowUp() {
  const lamp: R[] = [
    [46, 8, 3, 38, M],
    [42, 6, 11, 3, M],
  ];
  const ground: R[] = [[0, 47, W, 7, K]];
  const light: R[] = [[40, 9, 15, 3, Y]];
  const confetti: R[] = [
    [30, 10, 2, 2, Y],
    [62, 12, 2, 2, B],
    [36, 20, 2, 2, B],
    [58, 22, 2, 2, Y],
    [26, 26, 2, 2, K],
    [68, 28, 2, 2, K],
    [44, 2, 2, 2, Y],
  ];
  return (
    <>
      {rects([[0, 0, W, H, N], ...ground, ...lamp])}
      <Frames>
        {[
          rects([...light, ...figure(6, 38, B), ...figure(84, 38, Y, 1)]),
          rects([...light, ...figure(20, 38, B, 1), ...figure(70, 38, Y)]),
          rects([...light, ...figure(36, 38, B), ...figure(54, 38, Y, 1)]),
          rects([...light, [36, 12, 22, 2, Y], ...figure(38, 38, B), ...figure(52, 38, Y), ...confetti]),
        ]}
      </Frames>
    </>
  );
}

const SCENES = [SceneExplore, SceneJoin, SceneChat, SceneShowUp];

export const VignetteScene = memo(function VignetteScene({ index }: { index: number }) {
  const Scene = SCENES[index];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" className="q-vscene" shapeRendering="crispEdges" aria-hidden="true" focusable="false">
      <Scene />
    </svg>
  );
});

/** The vignette card: number and title, the one-line body, the scene. */
export const Vignette = memo(function Vignette({ index, headingLevel = 3 }: { index: number; headingLevel?: 2 | 3 }) {
  const s = HOW_STEPS[index];
  const Heading = headingLevel === 2 ? "h2" : "h3";
  return (
    <div className="q-vignette px-frame px-corners" style={{ "--step": "6px" } as React.CSSProperties}>
      <div className="px-frame-in px-corners q-vignette-in bg-coconut" style={{ "--step": "5px" } as React.CSSProperties}>
        <div className="q-vignette-scene px-corners" style={{ "--step": "4px" } as React.CSSProperties}>
          <VignetteScene index={index} />
        </div>
        <div className="q-vignette-copy">
          <p className="font-px t-px1 text-body">Signpost {s.n}</p>
          <Heading className="q-vignette-title">
            <span className="text-yellow-shadow">{s.n}</span> {s.title}
          </Heading>
          <p className="mt-2 text-[1rem] font-medium leading-snug text-body sm:text-[1.0625rem]">{s.body}</p>
        </div>
      </div>
    </div>
  );
});
