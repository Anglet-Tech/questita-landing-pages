import { asset } from "./asset";

/** The people behind Questita, in the order they are credited. */
export interface Creator {
  name: string;
  role?: string;
  /** File stem in public/nameplates. */
  stem: string;
}

export const CREATORS: Creator[] = [
  { name: "Mayar Hamed", role: "Co-founder", stem: "Mayar-Hamed" },
  { name: "Radwa Adel", role: "Co-founder", stem: "Radwa-Adel" },
  { name: "Ahmed AboElMagd", stem: "Ahmed-AboElMagd" },
  { name: "Abdelrahman Tarek", stem: "AbdElRahman-Tarek" },
  { name: "Hadeer Abdallah", stem: "Hadeer-Abdallah" },
];

export type NameplateColour = "bluepeach" | "coconutmilk" | "merlot" | "yellow";

/** The 1600 x 1000 nameplate card with the fox. */
export const nameplate = (c: Creator, colour: NameplateColour) => asset(`/nameplates/Questita-${c.stem}-${colour}.png`);
export const NAMEPLATE_W = 1600;
export const NAMEPLATE_H = 1000;
