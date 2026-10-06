import type { Metadata } from "next";
import "./wall.css";
import { asset } from "@/lib/asset";
import SmoothScroll from "@/components/SmoothScroll";
import ContactModal from "@/components/ContactModal";
import PasteStack from "@/components/wall/PasteStack";
import Poster from "@/components/wall/Poster";
import WallNav from "@/components/wall/WallNav";
import WallHero from "@/components/wall/WallHero";
import WallWhat from "@/components/wall/WallWhat";
import WallHow from "@/components/wall/WallHow";
import WallWho from "@/components/wall/WallWho";
import WallSafety from "@/components/wall/WallSafety";
import WallPartners from "@/components/wall/WallPartners";
import WallCreators from "@/components/wall/WallCreators";
import WallFooter from "@/components/wall/WallFooter";

export const metadata: Metadata = {
  title: "Questita",
  description:
    "Questita is a social quest app for Cairo. Someone posts a plan, you join in, and the big city feels a little smaller. Coming November 2026.",
  robots: { index: false, follow: false },
};

/** Option 4: the page is a Cairo street wall, and every section is a poster pasted over the last. */
export default function WallPage() {
  return (
    <SmoothScroll>
      <div className="wl-root">
        <a href="#start" className="skip-link">
          Skip to content
        </a>
        <div className="wl-bricks" aria-hidden="true" />
        <WallNav />
        <PasteStack>
          <main id="main">
            <Poster id="start" first fill={false} paper="var(--merlot)" labelledBy="wl-h1">
              <WallHero />
            </Poster>
            <Poster id="what" paper="var(--blue)" light labelledBy="wl-what-t">
              <WallWhat />
            </Poster>
            <Poster id="how" paper="var(--merlot)" labelledBy="wl-how-t" paperClassName="wl-how-paper" fill={false}>
              <WallHow />
            </Poster>
            <Poster id="who" paper="var(--yellow)" light labelledBy="wl-who-t">
              <WallWho />
            </Poster>
            <Poster id="safety" paper="var(--coconut)" light frame labelledBy="wl-safety-t">
              <WallSafety />
            </Poster>
            <Poster id="contact" paper="var(--blue)" light fill={false} labelledBy="wl-partners-t">
              <WallPartners />
            </Poster>
            <Poster id="creators" paper="var(--coconut)" light frame labelledBy="wl-creators-t">
              <WallCreators />
            </Poster>
          </main>
          <WallFooter />
        </PasteStack>
        <div className="wl-grain" aria-hidden="true" style={{ backgroundImage: `url(${asset("/wall/grain.png")})` }} />
        <ContactModal />
      </div>
    </SmoothScroll>
  );
}
