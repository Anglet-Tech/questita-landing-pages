import type { Metadata } from "next";
import "./film.css";
import SmoothScroll from "@/components/SmoothScroll";
import ContactModal from "@/components/ContactModal";
import { FilmBar, Timecode } from "@/components/film/FilmChrome";
import HeroChapter from "@/components/film/HeroChapter";
import WhatChapter from "@/components/film/WhatChapter";
import HowChapter from "@/components/film/HowChapter";
import WhoChapter from "@/components/film/WhoChapter";
import SafetyChapter from "@/components/film/SafetyChapter";
import CrewChapter from "@/components/film/CrewChapter";
import LaunchChapter, { FilmFooter } from "@/components/film/LaunchChapter";

export const metadata: Metadata = {
  title: "Questita",
  description: "Questita is a social quest app for Cairo. Someone posts a plan, you join in, and the big city feels a little smaller. Coming November 2026.",
  robots: { index: false, follow: false },
};

/** Option 6: Cinematic. A scrolling film in six pinned chapters. */
export default function FilmPage() {
  return (
    <SmoothScroll>
      <div className="film bg-merlot" data-top="dark" data-bottom="dark">
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <FilmBar />
        <main id="main" tabIndex={-1} className="outline-none">
          <HeroChapter />
          <WhatChapter />
          <HowChapter />
          <WhoChapter />
          <SafetyChapter />
          <CrewChapter />
          <LaunchChapter />
        </main>
        <FilmFooter />
        <Timecode />
        <ContactModal />
      </div>
    </SmoothScroll>
  );
}
