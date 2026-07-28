import type { Metadata } from "next";
import Link from "next/link";

import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Refund Policy",
  description:
    "WAVerify's 30-day refund policy. Haven't used your credits? Get every penny back. Used some? We refund the value of what's left.",
};

const SUPPORT_EMAIL = "support@waverify.app";

export default function RefundPolicyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-16">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          30-day refund policy
        </h1>

        <p className="text-muted-foreground mt-5 text-lg leading-relaxed">
          Credit packs are refundable for 30 days. If you haven&apos;t used
          them, you get every penny back. If you&apos;ve used some, we refund
          what&apos;s left.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="bg-muted/40 rounded-lg border p-5">
            <h2 className="font-semibold tracking-tight">
              Nothing used? Full refund.
            </h2>
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
              Bought a pack and haven&apos;t spent a single credit? Email us
              within 30 days and we return 100% of what you paid. No questions,
              no forms.
            </p>
          </div>

          <div className="bg-muted/40 rounded-lg border p-5">
            <h2 className="font-semibold tracking-tight">
              Used some? We refund the rest.
            </h2>
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
              We deduct only the credits you actually spent and refund the
              value of the ones you didn&apos;t, at the rate you paid for them.
            </p>
          </div>
        </div>

        <section className="mt-12 space-y-8">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">
              How the amount is worked out
            </h2>
            <p className="text-muted-foreground mt-3 leading-relaxed">
              Every pack has a simple per-credit rate: the price divided by the
              credits it contains. Your refund is that rate multiplied by the
              credits you have left.
            </p>
            <div className="bg-muted/40 mt-4 rounded-lg border p-5">
              <p className="text-sm font-medium">Example</p>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                Starter is <strong className="text-foreground">$9 for 7,500
                credits</strong>, so each credit is worth $0.0012. If you use
                1,500 credits and then ask for a refund, 6,000 credits remain
                and you get back{" "}
                <strong className="text-foreground">$7.20</strong>.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold tracking-tight">
              How to ask
            </h2>
            <p className="text-muted-foreground mt-3 leading-relaxed">
              Email{" "}
              <a
                href={`mailto:${SUPPORT_EMAIL}?subject=Refund%20request`}
                className="text-foreground font-medium underline underline-offset-4"
              >
                {SUPPORT_EMAIL}
              </a>{" "}
              from the address on your account and tell us which purchase to
              refund. We won&apos;t ask you to justify it.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold tracking-tight">
              How long it takes
            </h2>
            <p className="text-muted-foreground mt-3 leading-relaxed">
              We issue the refund as soon as we see your email, usually the same
              working day. Your bank or card issuer then takes its own time to
              post it — typically five to ten working days.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold tracking-tight">
              What happens to your credits
            </h2>
            <p className="text-muted-foreground mt-3 leading-relaxed">
              The credits remaining from a refunded purchase are removed from
              your wallet when the refund is issued — you&apos;ve been paid for
              them, so they don&apos;t stay in your balance. Your account stays
              open on the free plan.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold tracking-tight">
              After 30 days
            </h2>
            <p className="text-muted-foreground mt-3 leading-relaxed">
              Credits never expire, so a pack you bought is still yours to use
              whenever you need it. Past 30 days we can&apos;t refund it, but
              we&apos;d still like to hear what went wrong — email us anyway.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold tracking-tight">
              Who you&apos;re buying from
            </h2>
            <p className="text-muted-foreground mt-3 leading-relaxed">
              Payments are processed by Polar, which acts as the merchant of
              record for WAVerify. Refunds are issued through Polar and appear
              on your statement under its name. Your invoices are downloadable
              from the billing page at any time.
            </p>
          </div>
        </section>

        <div className="mt-14 flex flex-wrap gap-3 border-t pt-8">
          <Button asChild>
            <Link href="/#pricing">See pricing</Link>
          </Button>
          <Button asChild variant="outline">
            <a href={`mailto:${SUPPORT_EMAIL}?subject=Refund%20request`}>
              Request a refund
            </a>
          </Button>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
