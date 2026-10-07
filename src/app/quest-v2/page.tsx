import type { Metadata } from "next";
import "./quest-v2.css";
import SmoothScroll from "@/components/SmoothScroll";
import ContactModal from "@/components/ContactModal";
import QuestMap from "@/components/quest-v2/QuestMap";
import Crew from "@/components/quest-v2/Crew";
import { Credits, PlainStops, QuestHud, QuestPartners, QuestTitle, ReducedExtras, ReducedStrip, SavePoint } from "@/components/quest-v2/QuestParts";

export const metadata: Metadata = {
  title: "Questita: The Quest",
  description:
    "Questita is a social quest app for Cairo. Someone posts a plan, you join in, and the big city feels a little smaller. Coming November 2026.",
  robots: { index: false, follow: false },
};

/** Option 3: the landing page as a tiny retro RPG. */
export default function QuestV2Page() {
  return (
    <SmoothScroll>
      <div className="quest2 overflow-x-clip bg-merlot">
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
          <Crew />
          <QuestPartners />
        </main>
        <Credits />
        <ContactModal />
      </div>
    </SmoothScroll>
  );
}
