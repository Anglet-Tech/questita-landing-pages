# Questita landing page

The pre-launch landing page for Questita, a social quest app for Cairo. It is built in the brand's poster language: a pixel fennec fox, colour blocks, Manrope with the Questita Pixel Extended typeface, and pixel scenes of the Nile, the skyline and a night street.

Stack: Next.js (App Router, static export), TypeScript, Tailwind CSS v4, GSAP 3 (ScrollTrigger, SplitText, `@gsap/react`) and Lenis smooth scroll on the GSAP ticker. GSAP is the only animation engine.

## The options

The site opens on a chooser at `/` that presents every option. Each option is its own route in the same app:

| Route | What |
| --- | --- |
| `/` | The chooser: all seven options, with thumbnails, tags and an Open button each |
| `/poster/` | Option 1, Kinetic poster: the full pixel scroll story (this used to be `/`) |
| `/minimal/` | Option 2, Minimal: coconut throughout with small playful moments |
| `/quest/` | Option 3, The Quest v1 (original): a tiny retro RPG across a pixel map of Cairo. Frozen |
| `/quest-v2/` | Option 3b, The Quest v2: the same game, polished |
| `/wall/` | Option 4, Poster Wall: sections wheat-pasted like Cairo street posters, draggable sticker collage |
| `/team/` | Option 5, Team, refined: the team's agreed layout rebuilt in the pixel brand |
| `/film/` | Option 6, Cinematic: a scrolling film with a camera push, pixel iris and crew credits |

Every route except `/` shows a small **All options** button fixed bottom-left (`src/components/OptionsPill.tsx`, rendered from `layout.tsx`). Routes with their own bottom-left UI get an offset from the map at the top of that file, so route files never need to change.

The chooser thumbnails live in `public/chooser/` (`<route>.webp` hero frame and `<route>-tall.webp`, four 1440 x 900 frames stitched, both 720px wide). They are captured from a running dev server with a headless Chrome plus Pillow script (`chooser-thumbs.mjs`, kept outside the repo with the build scratch files); the card list is `src/components/chooser/options.ts`.

The last three follow the team version's sections (What, How, Who, Partners, About the creators) and use the creators' pixel nameplates from `public/nameplates/`.

The options share PixelFox, PixelDigit and `useCountdown`, the join logic (`useJoin`), the contact modal, Lenis and the `.ics` helper. The minimal and quest pages never load the preloader, reveal canvas, seams, pins or marquee. The quest map is generated procedurally from a fixed seed (`src/components/quest/mapgen.ts`), drawn once offscreen, and panned by a camera as the fox walks; under reduced motion it becomes a static strip plus plain panels.

The countdown is driven by one shared clock (`src/lib/countdown.ts`). After `LAUNCH_ISO` passes, every counter reads "The board is open" and the Add to calendar buttons disappear. To preview that state, override `Date.now` in the browser console (or in a test harness) rather than editing the config.

## Sharing with the team

The whole site, chooser and every option, deploys as one GitHub Pages site.

1. Create a repository on GitHub (any name, public or private with Pages enabled).
2. Push this app to its `main` branch:
   ```bash
   git remote add origin https://github.com/<user>/<repo>.git
   git push -u origin main
   ```
3. In the repository, open **Settings, Pages** and set **Source** to **GitHub Actions**.
4. The `Deploy to GitHub Pages` workflow runs on every push to `main` (or by hand from the Actions tab). When it finishes, the site is at:

   `https://<user>.github.io/<repo>/`

   with the options at `https://<user>.github.io/<repo>/poster/`, `.../minimal/`, `.../quest/` and so on.

The base path comes from the repository automatically (see Deploy below), so nothing needs editing for a new repo name. A user or organisation site (a repo named `<user>.github.io`) is served from the root and works too.

Note: the old home page at `/` is now `/poster/`. Links that pointed at the root now land on the chooser, one click away.

## Develop

```bash
npm install
npm run dev        # http://localhost:3000
```

Useful during development:

- The preloader (on `/poster/` only) shows once per browser session. To see it again, clear session storage (or open a new tab).
- Type `fox` anywhere outside a form field and every fox on the page winks.
- Turn on "reduce motion" in your OS to check the reduced-motion version: no preloader, no smooth scroll, no pins or scrubs, static pixel windows.

## Performance notes

Measure performance on the production build (`npm run build`, then serve `out/`), not on `npm run dev`. Dev mode runs React in development mode with extra checks and is roughly four times slower, so frame timings there are not representative.

What keeps the pages fast:

- Pixel art is drawn as one SVG `<path>` per colour (fox sprites, countdown digits), not one element per pixel. Only the two foxes that pop in pixel by pixel (preloader and hero) render individual rects, and that pop animates SVG attributes rather than transforms.
- Countdown digits re-form with a few temporary rects and settle back into a single path. Components subscribe to the derived countdown value they need (`useCountdownValue`), so a section re-renders on the minute, not every second.
- Lenis runs first in the GSAP ticker, so its `scrollTo` never forces a synchronous layout, and hit-testing is skipped while it is scrolling.
- Below-the-fold GSAP setup runs in idle callbacks (`useIdleGSAP`) after hydration; the quest map is generated in an idle slot and only redraws when something moves.
- Canvases cap the device pixel ratio at 1.5 and pause when off screen.

## Build

```bash
npm run lint
npm run build      # static export to out/
```

To preview the build exactly as GitHub Pages serves it, build with a base path (your repo name) and serve `out/` under that prefix, for example `/questita_landing/`:

```bash
NEXT_PUBLIC_BASE_PATH=/questita_landing npm run build
```

In Git Bash on Windows, prefix that with `MSYS_NO_PATHCONV=1` so the path is not rewritten.

## Deploy (GitHub Pages)

`.github/workflows/deploy.yml` builds on every push to `main`. It reads the base path from `actions/configure-pages` (`steps.pages.outputs.base_path`: `/<repo>` for a project site, empty for a user or org root site) and passes it to the build as `NEXT_PUBLIC_BASE_PATH`, then uploads `out/` and deploys it with `actions/deploy-pages`. In the repository settings, set Pages to "GitHub Actions" as the source. `public/.nojekyll` keeps Pages from ignoring the `_next/` folder, and `trailingSlash: true` gives every route its own `index.html`.

Every hard-coded public asset URL goes through `asset()` in `src/lib/asset.ts`, which prefixes the base path. Links between routes use `next/link` (which adds the base path itself) or `asset()`.

`SITE_URL` in `src/config.ts` (absolute Open Graph and Twitter image URLs, and the `.ics` link) comes from `NEXT_PUBLIC_SITE_URL`, which the workflow sets from `steps.pages.outputs.base_url`. Local builds without it fall back to `http://localhost:3000/`; to preview real link previews locally, build with both variables, e.g. `NEXT_PUBLIC_BASE_PATH=/repo NEXT_PUBLIC_SITE_URL=https://user.github.io/repo npm run build`.

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
  app/            layout (fonts, metadata, route-aware pre-paint boot script, All options pill),
                  page.tsx (the chooser), poster/ minimal/ quest/ quest-v2/ wall/ team/ film/, globals.css
  components/     one file per section plus shared pieces; chooser/ holds the chooser cards,
                  its CSS and option list; OptionsPill is the All options button
                  (Preloader, Nav, Hero, PixelFox, PixelReveal, Marquee, PixelSeam,
                   Why, Board, QuestCard, How, Belief, Safety, Who, Partners,
                   Footer, ContactModal, SmoothScroll, Countdown, ui)
  data/           fox-pixels.json (the four fox expressions as pixel rects)
  fonts/          Questita Pixel Extended (woff and ttf)
  lib/            asset(), GSAP registration, fox data helpers, a tiny store,
                  pixel burst, stepped clip-path helper
  config.ts
public/           pixel scenes, fox and wordmark SVGs, chooser/ thumbnails, og.png, .nojekyll
```

## Notes

- The pixel font sits on a 70/1000 em grid, so it is crisp at multiples of `100/7` px. The `t-px1` to `t-px4` utilities use those sizes.
- Pixel art always renders with `image-rendering: pixelated`.
- Pointer tracking uses `gsap.quickTo`. There are no window scroll listeners: scroll-driven work goes through ScrollTrigger.
