import type { FoxFrame } from "@/lib/fox";
import type { Day } from "@/lib/useJoin";

export const WHY_LINES = [
  "Cairo is big, and most good plans die at “we should do something.”",
  "So Questita makes it easier to find someone to do the thing with.",
];
export const BOARD_LINE = "A quest is just a plan worth showing up for. Pick one.";
export const NIGHT_LINE = "Plans are better with witnesses. The best part happens offline.";

export const HOW_STEPS: { n: string; title: string; body: string; fox: FoxFrame }[] = [
  { n: "01", title: "Explore", body: "See what’s happening around Cairo tonight, this weekend, or right now.", fox: "wow" },
  { n: "02", title: "Join or start one", body: "Jump into someone’s plan, or put your own out there and see who’s in.", fox: "wink" },
  { n: "03", title: "Chat", body: "Chat opens once you’re in. Sort out where, when, and who’s bringing snacks.", fox: "happy" },
  { n: "04", title: "Show up", body: "The best part happens offline. Check in, rate the quest, earn points.", fox: "happy" },
];

export interface QuestNpc {
  id: "felucca" | "cafe" | "studio";
  label: string;
  kind: string;
  title: string;
  area: string;
  day: Day;
  time: string;
  spots: number;
  full?: boolean;
}

export const QUESTS: QuestNpc[] = [
  { id: "felucca", label: "Felucca quest", kind: "Sunset ride", title: "Felucca at golden hour", area: "Zamalek", day: "Fri", time: "5:30 PM", spots: 3 },
  { id: "cafe", label: "Café quest", kind: "Sidequest", title: "Flat white and a walk", area: "Zamalek", day: "Sat", time: "10:00 AM", spots: 2 },
  { id: "studio", label: "Studio quest", kind: "First-time class", title: "Beginner pottery, zero pressure", area: "Zamalek", day: "Sun", time: "6:00 PM", spots: 0, full: true },
];

export const SAFETY_ITEMS = [
  { id: "id", name: "Everyone’s verified.", desc: "ID and a live photo at sign-up, so the person you meet is the person on the profile." },
  { id: "toggle", name: "Your call on who.", desc: "Set a gender preference on any quest you post." },
  { id: "pin", name: "Meetup point, when you’re ready.", desc: "You decide when the exact spot is shared." },
  { id: "star", name: "Show up, level up.", desc: "Earn points for showing up and being someone people want to quest with again." },
  { id: "circle", name: "Keep your circle.", desc: "The people you’ve quested with stay close for the next plan." },
] as const;

export const PARTY = [
  { id: "area", name: "New to the area", reply: "Welcome to Cairo. It gets smaller with every plan.", color: "#681B2B" },
  { id: "group", name: "New to a group", reply: "Plans are the easiest way in. Join one this week.", color: "#B4D4FB" },
  { id: "cancel", name: "Tired of cancelling on plans", reply: "Plans with witnesses actually happen. You’ll see.", color: "#FEE571" },
] as const;
