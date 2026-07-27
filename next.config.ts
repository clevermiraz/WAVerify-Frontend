import type { NextConfig } from "next";

const isProduction = process.env.NODE_ENV === "production";

/**
 * Origin the browser is allowed to call. Read here rather than hard-coded so
 * `connect-src` follows whatever the build was pointed at.
 */
const apiOrigin = (() => {
  const raw = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
  try {
    return new URL(raw).origin;
  } catch {
    return "http://localhost:8000";
  }
})();

const GOOGLE_ACCOUNTS = "https://accounts.google.com";

/**
 * Static Content-Security-Policy.
 *
 * `'unsafe-inline'` for scripts is the price of keeping every route
 * statically rendered: a nonce has to be minted per request, which forces
 * dynamic rendering across the whole site. The policy still does the heavy
 * lifting — an injected script cannot be *fetched* from an attacker's origin
 * and, more importantly, `connect-src` stops the tokens in localStorage from
 * being exfiltrated anywhere except this API.
 *
 * To upgrade to a nonce-based policy later, move this into `proxy.ts` and
 * accept that pages become dynamically rendered.
 */
function contentSecurityPolicy() {
  const scriptSrc = [
    "'self'",
    "'unsafe-inline'",
    GOOGLE_ACCOUNTS,
    "https://apis.google.com",
    // React's dev build uses eval for better stack traces; production doesn't.
    ...(isProduction ? [] : ["'unsafe-eval'"]),
  ];

  const connectSrc = [
    "'self'",
    apiOrigin,
    GOOGLE_ACCOUNTS,
    // Turbopack's HMR socket.
    ...(isProduction ? [] : ["ws:", "http://localhost:*"]),
  ];

  const directives = [
    "default-src 'self'",
    `script-src ${scriptSrc.join(" ")}`,
    // Radix and next/font both emit inline styles.
    `style-src 'self' 'unsafe-inline' ${GOOGLE_ACCOUNTS}`,
    // Remote avatars come from WhatsApp/Google CDNs whose hosts are not fixed.
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    `connect-src ${connectSrc.join(" ")}`,
    // The "Sign in with Google" button renders inside an iframe.
    `frame-src ${GOOGLE_ACCOUNTS}`,
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
    // Keyed off the API scheme, not NODE_ENV: `next start` against a local
    // http backend is a production build, and upgrading that request to https
    // would silently break every call.
    ...(apiOrigin.startsWith("https://") ? ["upgrade-insecure-requests"] : []),
  ];

  return directives.join("; ");
}

const nextConfig: NextConfig = {
  // Emits a minimal self-contained server bundle for the Docker image.
  output: "standalone",
  reactStrictMode: true,
  poweredByHeader: false,

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Superseded by frame-ancestors in modern browsers; kept for old ones.
          { key: "X-Frame-Options", value: "DENY" },
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
          },
          { key: "Content-Security-Policy", value: contentSecurityPolicy() },
          // Only meaningful over TLS, and pinning localhost to https would
          // make the dev server unreachable.
          ...(isProduction
            ? [
                {
                  key: "Strict-Transport-Security",
                  value: "max-age=63072000; includeSubDomains; preload",
                },
              ]
            : []),
        ],
      },
    ];
  },
};

export default nextConfig;
