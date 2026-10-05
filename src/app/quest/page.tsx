import type { Metadata } from "next";
import "../quest.css";
import SmoothScroll from "@/components/SmoothScroll";
import ContactModal from "@/components/ContactModal";
import QuestMap from "@/components/quest/QuestMap";
import { Credits, PlainStops, QuestHud, QuestPartners, QuestTitle, ReducedExtras, ReducedStrip, SavePoint } from "@/components/quest/QuestParts";

export const metadata: Metadata = {
  title: "Questita: The Quest",
  description:
    "Questita is a social quest app for Cairo. Someone posts a plan, you join in, and the big city feels a little smaller. Coming November 2026.",
  robots: { index: false, follow: false },
};

/** Option 3: the landing page as a tiny retro RPG. */
export default function QuestPage() {
  return (
    <SmoothScroll>
      <div className="quest bg-merlot">
        <a href="#plain-stops" className="skip-link">
          Skip the game
        </a>
        <QuestHud />
        <main id="main" tabIndex={-1} className="outline-none">
          <QuestTitle />
          <QuestMap />
          <ReducedStrip />
          <PlainStops />
          <ReducedExtras />
          <SavePoint />
          <QuestPartners />
        </main>
        <Credits />
        <ContactModal />
      </div>
    </SmoothScroll>
  );
}
