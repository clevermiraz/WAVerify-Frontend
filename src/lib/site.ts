/**
 * Canonical public origin of the marketing site and dashboard.
 *
 * Server-side only (metadata, sitemap, robots), so it deliberately has no
 * `NEXT_PUBLIC_` prefix — but it is still read during the build, which is when
 * these routes are generated. Set it in the build environment for staging or
 * preview deployments; the default is production.
 */
export const SITE_URL = (
  process.env.SITE_URL ?? "https://waverify.app"
).replace(/\/+$/, "");
