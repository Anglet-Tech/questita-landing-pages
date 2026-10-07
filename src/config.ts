/**
 * Site configuration. The two values most likely to change before launch are
 * LAUNCH_ISO (drives the hero countdown) and FORM_ACCESS_KEY (Web3Forms).
 */

/** Exact launch instant in Cairo time (Africa/Cairo is UTC+2). */
export const LAUNCH_ISO = "2026-11-30T00:00:00+02:00";

/** Web3Forms access key, registered to marketing@questita.com. */
export const FORM_ACCESS_KEY = "f968539d-719c-44fa-b503-6f9ad1fb4c58";

/** Shown as the fallback contact address in form error states. */
export const PARTNERSHIPS_EMAIL = "marketing@questita.com";

export const FORM_SUBJECT = "Questita partnership enquiry";
export const FORM_FROM_NAME = "Questita landing page";

/**
 * Public URL of the deployed site (origin plus base path), used as the
 * metadataBase for absolute Open Graph and Twitter image URLs and in the .ics
 * file. The deploy workflow sets NEXT_PUBLIC_SITE_URL from configure-pages'
 * `base_url`, so it follows whichever repo the site is pushed to. Always ends
 * in "/" so relative paths like "og.png" resolve under the base path. Local dev
 * and builds without the variable fall back to the dev server.
 */
export const SITE_URL = (() => {
  const raw = (process.env.NEXT_PUBLIC_SITE_URL ?? "").trim();
  const url = raw || "http://localhost:3000/";
  return url.endsWith("/") ? url : `${url}/`;
})();
