import Link from "next/link";

import { Logo } from "@/components/brand/logo";

const SECTIONS = [
  {
    title: "Product",
    links: [
      { href: "/#features", label: "Features" },
      { href: "/#pricing", label: "Pricing" },
      { href: "/refund-policy", label: "Refund policy" },
      { href: "/docs", label: "API Docs" },
      { href: "/#faq", label: "FAQ" },
    ],
  },
  {
    title: "Account",
    links: [
      { href: "/register", label: "Create account" },
      { href: "/login", label: "Sign in" },
      { href: "/dashboard", label: "Dashboard" },
      { href: "/forgot-password", label: "Reset password" },
    ],
  },
  {
    title: "Developers",
    links: [
      { href: "/docs#quickstart", label: "Quickstart" },
      { href: "/docs#authentication", label: "Authentication" },
      { href: "/docs#errors", label: "Error reference" },
      { href: "/docs#rate-limits", label: "Rate limits" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-10 md:grid-cols-[1.5fr_repeat(3,1fr)]">
          <div className="space-y-3">
            <Logo />
            <p className="text-muted-foreground max-w-xs text-sm leading-relaxed">
              Fast, reliable WhatsApp number verification for developers and
              businesses.
            </p>
          </div>

          {SECTIONS.map((section) => (
            <div key={section.title}>
              <h2 className="text-sm font-medium">{section.title}</h2>
              <ul className="mt-4 space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.href + link.label}>
                    <Link
                      href={link.href}
                      className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="text-muted-foreground mt-12 flex flex-col gap-2 border-t pt-6 text-xs sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} WAVerify. All rights reserved.</p>
          <p>
            Not affiliated with, endorsed by, or connected to WhatsApp or Meta
            Platforms, Inc.
          </p>
        </div>
      </div>
    </footer>
  );
}
