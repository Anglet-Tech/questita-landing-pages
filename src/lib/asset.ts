/** Base path the site is served from ("" locally, "/questita_landing" on Pages). */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** Prefix a public asset path with the base path. Use for every hard-coded public URL. */
export function asset(path: string): string {
  return `${BASE_PATH}${path.startsWith("/") ? path : `/${path}`}`;
}
