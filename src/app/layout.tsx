import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { asset } from "@/lib/asset";
import { SITE_URL } from "@/config";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-manrope",
  display: "swap",
});

const pixel = localFont({
  src: "../fonts/QuestitaPixelExtended.woff",
  variable: "--font-pixel",
  display: "swap",
  weight: "400",
});

const description =
  "Questita is a social quest app for Cairo. Someone posts a plan, you join in, and the big city feels a little smaller. Coming November 2026.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Questita: Find the thing. Find your people.",
  description,
  robots: { index: false, follow: false },
  icons: { icon: asset("/fox/Questita_app_icon.svg") },
  openGraph: {
    title: "Questita: Find the thing. Find your people.",
    description: "A social quest app for Cairo. Coming November 2026.",
    images: [{ url: "og.png", width: 1200, height: 630, alt: "The Questita fox above the line Find the thing. Find your people." }],
    type: "website",
    siteName: "Questita",
  },
  twitter: {
    card: "summary_large_image",
    title: "Questita: Find the thing. Find your people.",
    description: "A social quest app for Cairo. Coming November 2026.",
    images: ["og.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#681B2B",
  width: "device-width",
  initialScale: 1,
};

/*
 * Runs before first paint. Decides whether the preloader shows (once per
 * session, never under reduced motion) and hides intro elements so the hero
 * choreography never flashes its final state first.
 */
const bootScript = `(function(){try{var d=document.documentElement;if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;d.classList.add('intro');var seen=null;try{seen=sessionStorage.getItem('questita:preloaded')}catch(e){}if(!seen)d.setAttribute('data-preload','');setTimeout(function(){d.classList.remove('intro')},6000)}catch(e){}})();`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${manrope.variable} ${pixel.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
        <link rel="preload" as="image" href={asset("/img/felucca.png")} fetchPriority="high" />
      </head>
      <body>{children}</body>
    </html>
  );
}
