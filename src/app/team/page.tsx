import type { Metadata } from "next";
import "./team.css";
import SmoothScroll from "@/components/SmoothScroll";
import ContactModal from "@/components/ContactModal";
import TeamNav from "@/components/team/TeamNav";
import TeamHero from "@/components/team/TeamHero";
import TeamWhat from "@/components/team/TeamWhat";
import TeamHow from "@/components/team/TeamHow";
import TeamWho from "@/components/team/TeamWho";
import TeamStack from "@/components/team/TeamStack";
import { TeamCreators, TeamFooter, TeamPartners } from "@/components/team/TeamRest";

export const metadata: Metadata = {
  title: "Questita",
  description:
    "Questita is a social quest app for Cairo. Someone posts a plan, you join in, and the big city feels a little smaller. Coming November 2026.",
  robots: { index: false, follow: false },
};

/** Option 5: the team's agreed layout, rebuilt in the pixel brand. */
export default function TeamPage() {
  return (
    <SmoothScroll>
      <div className="tm">
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <TeamNav />
        <main id="main" tabIndex={-1} className="outline-none">
          <TeamHero />
          <div id="what" className="tm-anchor" aria-hidden="true" />
          <TeamWhat />
          <div id="how" className="tm-anchor" aria-hidden="true" />
          <TeamHow />
          <div id="who" className="tm-anchor" aria-hidden="true" />
          <TeamWho />
          <div id="contact" className="tm-anchor" aria-hidden="true" />
          <TeamPartners />
          <div id="creators" className="tm-anchor" aria-hidden="true" />
          <TeamCreators />
        </main>
        <TeamFooter />
        <ContactModal />
        <TeamStack />
      </div>
    </SmoothScroll>
  );
}
