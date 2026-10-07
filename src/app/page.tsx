import type { Metadata } from "next";
import "@/components/chooser/chooser.css";
import { asset } from "@/lib/asset";
import ChooserFox from "@/components/chooser/ChooserFox";
import OptionCard from "@/components/chooser/OptionCard";
import { OPTIONS } from "@/components/chooser/options";

export const metadata: Metadata = {
  title: "Questita: landing options",
  description: "Seven directions for the Questita launch page. Pick one to explore; each runs live.",
  robots: { index: false, follow: false },
  // openGraph and twitter replace the layout's objects wholesale, so the image is repeated here.
  openGraph: {
    title: "Questita: landing options",
    description: "Seven directions for the Questita launch page.",
    images: [{ url: "og.png", width: 1200, height: 630, alt: "The Questita fox above the line Find the thing. Find your people." }],
    type: "website",
    siteName: "Questita",
  },
  twitter: { card: "summary_large_image", title: "Questita: landing options", description: "Seven directions for the Questita launch page.", images: ["og.png"] },
};

/** The chooser: the team's entry point to every landing option. Small DOM, CSS-only motion. */
export default function Chooser() {
  return (
    <div className="ch">
      <a href="#options" className="skip-link">
        Skip to the options
      </a>

      <header className="ch-head on-dark">
        <div className="ch-wrap">
          {/* eslint-disable-next-line @next/next/no-img-element -- static export SVG */}
          <img src={asset("/fox/Questita_wordmark_coconutmilk.svg")} alt="Questita" width={132} height={22} className="ch-mark ch-rise" />
          <div className="ch-head-grid">
            <div className="ch-head-text">
              <p className="ch-kicker font-px t-px1 ch-rise" style={{ "--d": 1 } as React.CSSProperties}>
                <span>{OPTIONS.length} options</span>
                <span className="ch-kicker-sq" aria-hidden="true" />
                <span>All live</span>
              </p>
              <h1 className="ch-title ch-rise" style={{ "--d": 2 } as React.CSSProperties}>
                Questita <span>landing options</span>
              </h1>
              <p className="ch-lede ch-rise" style={{ "--d": 3 } as React.CSSProperties}>
                Seven directions for the Questita launch page. Pick one to explore; each runs live.
              </p>
            </div>
            <ChooserFox className="ch-rise" />
          </div>
        </div>
        <span className="ch-steps" aria-hidden="true" />
      </header>

      <main id="options" tabIndex={-1} className="ch-main outline-none">
        <div className="ch-wrap">
          <ul className="ch-grid">
            {OPTIONS.map((o, i) => (
              <OptionCard key={o.slug} option={o} index={i} />
            ))}
            <li className="ch-note px-corners" style={{ "--i": OPTIONS.length } as React.CSSProperties}>
              <div className="ch-note-text">
                <h2 className="ch-note-title">Every option runs from this one site.</h2>
                <p>
                  On any option, the{" "}
                  <span className="ch-note-pill px-corners">
                    <GridIcon /> All options
                  </span>{" "}
                  button at the bottom left brings you back here. Thumbnails are captured at 1440 by 900.
                </p>
              </div>
              <nav className="ch-quick" aria-label="Jump straight to an option">
                <p className="font-px t-px1">Jump straight in</p>
                <ul>
                  {OPTIONS.map((o) => (
                    <li key={o.slug}>
                      <a href={asset(`/${o.slug}/`)} className="ch-quick-link">
                        <span className="font-px t-px1">{o.number}</span>
                        <span>{o.name}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </li>
          </ul>
        </div>
      </main>

      <footer className="ch-foot on-dark">
        <span className="ch-steps" aria-hidden="true" />
        <div className="ch-wrap ch-foot-row">
          <p className="ch-foot-made">
            {/* eslint-disable-next-line @next/next/no-img-element -- static export SVG */}
            <img src={asset("/fox/Questita_app_icon.svg")} alt="" width={40} height={40} />
            Made in Cairo. Made by Anglet.
          </p>
          <p className="font-px t-px1 text-coconut-78">Questita 2026</p>
        </div>
      </footer>
    </div>
  );
}

function GridIcon() {
  return (
    <svg viewBox="0 0 9 9" width="14" height="14" shapeRendering="crispEdges" aria-hidden="true" focusable="false">
      <rect x="0" y="0" width="4" height="4" fill="currentColor" />
      <rect x="5" y="0" width="4" height="4" fill="currentColor" />
      <rect x="0" y="5" width="4" height="4" fill="currentColor" />
      <rect x="5" y="5" width="4" height="4" fill="currentColor" />
    </svg>
  );
}
