import type { Metadata } from "next";
import SmoothScroll from "@/components/SmoothScroll";
import ContactModal from "@/components/ContactModal";
import MinimalNav from "@/components/minimal/MinimalNav";
import MinimalHero from "@/components/minimal/MinimalHero";
import Problem from "@/components/minimal/Problem";
import BoardList from "@/components/minimal/BoardList";
import Steps from "@/components/minimal/Steps";
import { MinimalFooter, PartnersLine, SafetyList, WhoMinimal } from "@/components/minimal/MinimalRest";
import MadeBy from "@/components/minimal/MadeBy";

export const metadata: Metadata = {
  title: "Questita",
  description:
    "Questita is a social quest app for Cairo. Someone posts a plan, you join in, and the big city feels a little smaller. Coming November 2026.",
  robots: { index: false, follow: false },
};

/** The minimal version: same brand, coconut throughout, small surprising moments. */
export default function MinimalPage() {
  return (
    <SmoothScroll>
      <div className="minimal bg-coconut">
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <MinimalNav />
        <main id="main" tabIndex={-1} className="outline-none">
          <MinimalHero />
          <Problem />
          <BoardList />
          <Steps />
          <SafetyList />
          <WhoMinimal />
          <PartnersLine />
          <MadeBy />
        </main>
        <MinimalFooter />
        <ContactModal />
      </div>
    </SmoothScroll>
  );
}
