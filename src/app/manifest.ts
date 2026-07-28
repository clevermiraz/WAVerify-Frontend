import type { MetadataRoute } from "next";

/**
 * Makes the dashboard installable. Next.js serves this at `/manifest.webmanifest`
 * and emits the `<link rel="manifest">` tag, so nothing needs wiring in `layout.tsx`.
 *
 * The icons here are deliberately *not* the `app/` metadata files: those are
 * served from content-hashed URLs that change on every asset edit, which breaks
 * an installed app's cached icon. `public/brand/` gives them stable paths.
 *
 * Only square art belongs in this list — `mark-*.png` is 512x352 by design and
 * would be letterboxed on a home screen.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "WAVerify — Verify WhatsApp Numbers Instantly",
    short_name: "WAVerify",
    description:
      "Fast, reliable WhatsApp number verification for developers and businesses.",
    start_url: "/dashboard",
    display: "standalone",
    // Matches the light-scheme `themeColor` in the root layout's viewport.
    background_color: "#ffffff",
    theme_color: "#ffffff",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
      {
        src: "/brand/tile.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
      {
        src: "/brand/tile-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
