import SmoothScroll from "@/components/SmoothScroll";
import Preloader from "@/components/Preloader";
import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Why from "@/components/Why";
import Board from "@/components/Board";
import How from "@/components/How";
import Belief from "@/components/Belief";
import Safety from "@/components/Safety";
import Who from "@/components/Who";
import Launch from "@/components/Launch";
import Partners from "@/components/Partners";
import Creators from "@/components/Creators";
import Footer from "@/components/Footer";
import ContactModal from "@/components/ContactModal";

/** Option 1: the kinetic poster story (formerly the home page at "/"). */
export default function PosterPage() {
  return (
    <SmoothScroll>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <Preloader />
      <Nav />
      <main id="main" tabIndex={-1} className="outline-none">
        <Hero />
        <Why />
        <Board />
        <How />
        <Belief />
        <Safety />
        <Who />
        <Launch />
        <Partners />
        <Creators />
      </main>
      <Footer />
      <ContactModal />
    </SmoothScroll>
  );
}
