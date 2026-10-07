/**
 * The landing-page options shown on the chooser. `slug` is both the route
 * (`/<slug>/`) and the thumbnail name (`public/chooser/<thumb>.webp` and
 * `<thumb>-tall.webp`). Keep this list in step with the route table in README.md
 * and with the capture script (scratchpad/chooser-thumbs.mjs).
 */
export interface ChooserOption {
  slug: string;
  /** Thumbnail basename; defaults to slug. */
  thumb?: string;
  number: string;
  name: string;
  description: string;
  tags: string[];
  /** Small version badge, e.g. for the two Quest builds. */
  badge?: string;
}

export const OPTIONS: ChooserOption[] = [
  {
    slug: "poster",
    number: "01",
    name: "Kinetic poster",
    description: "The full pixel scroll story: colour blocks, a cursor reveal, pinned scenes and a fox that reacts.",
    tags: ["Bold", "Kinetic", "Scroll story"],
  },
  {
    slug: "minimal",
    number: "02",
    name: "Minimal",
    description: "Coconut throughout, quiet type and a handful of small, playful moments.",
    tags: ["Minimal", "Calm"],
  },
  {
    slug: "quest",
    number: "03",
    name: "The Quest",
    description: "The page as a tiny retro RPG. The fox walks a pixel map of Cairo, one stop at a time.",
    tags: ["Game", "Playful"],
    badge: "v1 (original)",
  },
  {
    slug: "quest-v2",
    number: "03b",
    name: "The Quest v2",
    description: "The same RPG, polished: smoother camera, readable dialog and a better fit on small screens.",
    tags: ["Game", "Polished"],
    badge: "polished",
  },
  {
    slug: "wall",
    number: "04",
    name: "Poster Wall",
    description: "Every section is a poster pasted on a Cairo street wall, with a sticker collage you can drag.",
    tags: ["Collage", "Playful"],
  },
  {
    slug: "team",
    number: "05",
    name: "Team, refined",
    description: "The layout the team agreed on, rebuilt in the pixel brand.",
    tags: ["Team layout", "Clean"],
  },
  {
    slug: "film",
    number: "06",
    name: "Cinematic",
    description: "A scrolling film with a camera push, a pixel iris and crew credits.",
    tags: ["Cinematic", "Bold"],
  },
];
