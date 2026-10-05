# Questita landing page

The pre-launch landing page for Questita, a social quest app for Cairo. It is built in the brand's poster language: a pixel fennec fox, colour blocks, Manrope with the Questita Pixel Extended typeface, and pixel scenes of the Nile, the skyline and a night street.

Stack: Next.js (App Router, static export), TypeScript, Tailwind CSS v4, GSAP 3 (ScrollTrigger, SplitText, `@gsap/react`) and Lenis smooth scroll on the GSAP ticker. GSAP is the only animation engine.

## Two versions

| Route | Local | GitHub Pages |
| --- | --- | --- |
| Main, the full pixel scroll story | http://localhost:3000/ | https://abdelrahmantarekm.github.io/questita_landing/ |
| Minimal, coconut throughout with small playful moments | http://localhost:3000/minimal/ | https://abdelrahmantarekm.github.io/questita_landing/minimal/ |

Both share PixelFox, PixelDigit and `useCountdown`, the join logic (`useJoin`), the contact modal, Lenis and the `.ics` helper. The minimal page never loads the preloader, reveal canvas, seams, pins or marquee.

The countdown is driven by one shared clock (`src/lib/countdown.ts`). After `LAUNCH_ISO` passes, every counter reads "The board is open" and the Add to calendar buttons disappear. To preview that state, override `Date.now` in the browser console (or in a test harness) rather than editing the config.

## Develop

```bash
npm install
npm run dev        # http://localhost:3000
```

Useful during development:

- The preloader shows once per browser session. To see it again, clear session storage (or open a new tab).
- Type `fox` anywhere outside a form field and every fox on the page winks.
- Turn on "reduce motion" in your OS to check the reduced-motion version: no preloader, no smooth scroll, no pins or scrubs, static pixel windows.

## Build

```bash
npm run lint
npm run build      # static export to out/
```

To preview the build exactly as GitHub Pages serves it, build with the base path and serve `out/` under `/questita_landing/`:

```bash
NEXT_PUBLIC_BASE_PATH=/questita_landing npm run build
```

In Git Bash on Windows, prefix that with `MSYS_NO_PATHCONV=1` so the path is not rewritten.

## Deploy (GitHub Pages)

`.github/workflows/deploy.yml` builds on every push to `main` with `NEXT_PUBLIC_BASE_PATH=/questita_landing`, uploads `out/` and deploys it with `actions/deploy-pages`. In the repository settings, set Pages to "GitHub Actions" as the source. `public/.nojekyll` keeps Pages from ignoring the `_next/` folder.

Every hard-coded public asset URL goes through `asset()` in `src/lib/asset.ts`, which prefixes the base path.

## Configuration

Everything that may change before launch lives in `src/config.ts`:

| Value | What it does |
| --- | --- |
| `LAUNCH_ISO` | The launch instant in Cairo time (`2026-11-30T00:00:00+02:00`). Drives the hero countdown. After it passes, the countdown reads "The board is open." |
| `FORM_ACCESS_KEY` | The Web3Forms access key for the contact form. Messages go to the address the key is registered to. |
| `PARTNERSHIPS_EMAIL` | Fallback address shown when the form fails. |

## Theming

There is no dark mode, on purpose. The page is a colour-block story taken from the poster series: merlot, coconut, coconut, merlot, merlot at night, coconut, yellow, coconut, then a merlot footer. Each block change is marked with a pixel dissolve seam. The blocks are the theme. Tokens are defined in `src/app/globals.css`.

## Structure

```
src/
  app/            layout (fonts, metadata, pre-paint boot script), page, globals.css
  components/     one file per section plus shared pieces
                  (Preloader, Nav, Hero, PixelFox, PixelReveal, Marquee, PixelSeam,
                   Why, Board, QuestCard, How, Belief, Safety, Who, Partners,
                   Footer, ContactModal, SmoothScroll, Countdown, ui)
  data/           fox-pixels.json (the four fox expressions as pixel rects)
  fonts/          Questita Pixel Extended (woff and ttf)
  lib/            asset(), GSAP registration, fox data helpers, a tiny store,
                  pixel burst, stepped clip-path helper
  config.ts
public/           pixel scenes, fox and wordmark SVGs, og.png, .nojekyll
```

## Notes

- The pixel font sits on a 70/1000 em grid, so it is crisp at multiples of `100/7` px. The `t-px1` to `t-px4` utilities use those sizes.
- Pixel art always renders with `image-rendering: pixelated`.
- Pointer tracking uses `gsap.quickTo`. There are no window scroll listeners: scroll-driven work goes through ScrollTrigger.
