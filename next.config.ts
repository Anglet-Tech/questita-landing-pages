import type { NextConfig } from "next";

// GitHub Pages serves the site from /questita_landing. The deploy workflow sets
// NEXT_PUBLIC_BASE_PATH; locally it stays empty so the dev server runs at "/".
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
  basePath: basePath || undefined,
  assetPrefix: basePath || undefined,
};

export default nextConfig;
