import type { Metadata } from "next";
import Link from "next/link";

import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Refund Policy",
  description:
    "WAVerify's 30-day money-back guarantee. Email us within 30 days for a full refund — no questions asked, and credits you've already used don't reduce what you get back.",
};

const SUPPORT_EMAIL = "support@waverify.app";

export default function RefundPolicyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-16">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          30-day money-back guarantee
        </h1>

        <p className="text-muted-foreground mt-5 text-lg leading-relaxed">
          If WAVerify isn&apos;t right for you, email us within 30 days of your
          purchase and we&apos;ll refund it in full. No questions, no forms, no
          back-and-forth.
        </p>

        <div className="bg-muted/40 mt-8 rounded-lg border p-6">
          <h2 className="font-semibold tracking-tight">
            Already used some credits? You still get everything back.
          </h2>
          <p className="text-muted-foreground mt-3 leading-relaxed">
            Run 1,000 lookups, or 50,000, and then decide it isn&apos;t for you
            — we still refund <strong className="text-foreground">100% of
            what you paid</strong>. We don&apos;t subtract the value of the
            credits you&apos;ve already spent, and we don&apos;t prorate. You
            keep the results you got; you get all of your money back.
          </p>
        </div>

        <div className="mt-6 rounded-lg border p-5">
          <p className="text-sm leading-relaxed">
            To claim it, email{" "}
            <a
              href={`mailto:${SUPPORT_EMAIL}?subject=Refund%20request`}
              className="font-medium underline underline-offset-4"
            >
              {SUPPORT_EMAIL}
            </a>{" "}
            from the address on your account and tell us which purchase to
            refund. That&apos;s the whole process — we won&apos;t ask you why.
          </p>
        </div>

        <section className="mt-12 space-y-8">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">
              What you get back
            </h2>
            <p className="text-muted-foreground mt-3 leading-relaxed">
              The full amount you paid for that credit pack, returned to the
              original payment method. No fees deducted, no usage subtracted.
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
              The credits from a refunded purchase are removed from your wallet
              when the refund is issued. If you&apos;ve already spent some of
              them, your balance simply drops to zero rather than going
              negative, and your account stays open on the free plan.
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
