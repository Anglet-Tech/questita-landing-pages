import type { Day } from "@/lib/useJoin";
import type { FoxFrame } from "@/lib/fox";
import type { Scene } from "@/components/QuestCard";

/** Copy for /film/. Taken from the team site, verbatim unless the spec overrides it. */

export const HERO = {
  h1: "Find the thing. Find your people.",
  sub: "Questita is a social quest app for Cairo. Someone posts a plan, you join in, and the big city feels a little smaller.",
  where: "Cairo first. Alexandria next.",
};

export const WHAT = {
  statement: "A quest is just a plan worth showing up for.",
  sub: "Cairo is big, and most good plans die at “we should do something.” Questita makes it easier to find someone to do the thing with.",
};

export interface FilmQuest {
  id: string;
  kind: string;
  title: string;
  area: string;
  day: Day;
  time: string;
  spots: number;
  scene: Scene;
  tag: "blue" | "yellow" | "coconut";
}

export const QUESTS: FilmQuest[] = [
  {
    id: "fq-coffee",
    kind: "Coffee run",
    title: "Flat white and a walk",
    area: "Garden City",
    day: "Sat",
    time: "10:00 AM",
    spots: 2,
    scene: "wink",
    tag: "blue",
  },
  {
    id: "fq-pottery",
    kind: "First-time class",
    title: "Beginner pottery, zero pressure",
    area: "Maadi",
    day: "Sun",
    time: "6:00 PM",
    spots: 4,
    scene: "stairs",
    tag: "yellow",
  },
  {
    id: "fq-felucca",
    kind: "Sunset ride",
    title: "Felucca at golden hour",
    area: "Zamalek",
    day: "Fri",
    time: "5:30 PM",
    spots: 3,
    scene: "felucca",
    tag: "blue",
  },
];

export const HOW = {
  title: "Four stops.",
  intro: "From “we should do something” to actually doing it. The route is short on purpose.",
};

export const STOPS: { n: string; title: string; body: string; fox: FoxFrame }[] = [
  { n: "01", title: "Explore", body: "See what’s happening around Cairo tonight, this weekend, or right now.", fox: "wow" },
  { n: "02", title: "Join or start one", body: "Jump into someone’s plan, or put your own out there and see who’s in.", fox: "wink" },
  { n: "03", title: "Chat", body: "Sort out the details with the people going. Where, when, who’s bringing snacks.", fox: "happy" },
  { n: "04", title: "Show up", body: "The best part happens offline. Plans are better with witnesses.", fox: "happy" },
];

export const WHO = {
  title: "Built for Cairo.",
  phrases: ["New to the area", "New to a group", "Tired of cancelling on plans"],
  line: "Questita is for the people who make the big city feel smaller.",
  nots: ["Not a dating app.", "Not another feed to scroll."],
  last: "Just plans, with people.",
};

export type PlateColour = "bluepeach" | "coconutmilk" | "merlot" | "yellow";

export interface Creator {
  name: string;
  stem: string;
  role?: string;
  /** Card colour in the final lineup (on merlot, so never merlot). */
  card: PlateColour;
  /** Width of the 288px tall lettering strip, for aspect ratios. */
  stripW: number;
}

export const CREW: Creator[] = [
  { name: "Mayar Hamed", stem: "Mayar-Hamed", role: "Co-founder", card: "yellow", stripW: 2400 },
  { name: "Radwa Adel", stem: "Radwa-Adel", role: "Co-founder", card: "bluepeach", stripW: 2112 },
  { name: "Ahmed AboElMagd", stem: "Ahmed-AboElMagd", card: "coconutmilk", stripW: 3264 },
  { name: "Abdelrahman Tarek", stem: "AbdElRahman-Tarek", card: "bluepeach", stripW: 3672 },
  { name: "Hadeer Abdallah", stem: "Hadeer-Abdallah", card: "yellow", stripW: 3120 },
];

export const PARTNERS = {
  title: "Want to be part of the plan?",
  body: "If you run a place, brand or product that belongs in a Cairo plan, we’d love to talk.",
};

export const LAUNCH = {
  title: "The board opens 30 November, midnight in Cairo.",
  where: "Cairo first. Alexandria next.",
};

export const FOOTER = {
  tagline: "For the people who make the big city feel smaller.",
  made: "Made in Cairo · Made by Anglet",
  legal: "© 2026 Questita. All rights reserved.",
};

/** Chapter slate shown in the top bar. */
export const CHAPTERS = ["Countdown", "The board", "Four stops", "Built for Cairo", "The crew", "The plan"] as const;
