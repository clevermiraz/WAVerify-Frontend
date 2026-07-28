"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, Download, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  queryKeys,
  toastApiError,
  useBilling,
  usePayments,
  usePlans,
} from "@/hooks/use-api";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { billingService } from "@/services";
import type { Plan } from "@/types/api";

/** Polar's webhook usually lands within a second or two of the buyer being
 *  redirected back, but it is a separate network path and can lag. Re-check
 *  the balance on this schedule before giving up and telling them to reload. */
const SETTLEMENT_POLL_MS = [1_000, 2_000, 4_000, 8_000];

/** Polar builds invoice PDFs on demand; observed latency is 4–6s. */
const INVOICE_POLL_MS = 1_500;
const INVOICE_POLL_ATTEMPTS = 10;

export function BillingView() {
  const { data: billing, isLoading: billingLoading } = useBilling();
  const { data: plans, isLoading: plansLoading } = usePlans();
  const { data: payments } = usePayments();
  const [pendingPlan, setPendingPlan] = React.useState<Plan | null>(null);
  const queryClient = useQueryClient();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Captured once, on mount. The effect below strips `checkout_id` from the
  // URL, and reading the live value here would re-run that effect and cancel
  // the settlement timers the moment they were scheduled.
  const [arrivedFromCheckout] = React.useState(
    () => searchParams.get("checkout_id") !== null
  );
  const [awaitingCredits, setAwaitingCredits] =
    React.useState(arrivedFromCheckout);

  const checkout = useMutation({
    mutationFn: (slug: string) => billingService.checkout(slug),
    onSuccess: (response) => {
      // Leaves the SPA entirely — Polar hosts the payment page. Deliberately
      // not `router.push`, which would try to route this internally.
      window.location.href = response.checkout_url;
    },
    onError: (error) => {
      toastApiError(error);
      setPendingPlan(null);
    },
  });

  const portal = useMutation({
    mutationFn: () => billingService.portal(),
    onSuccess: (response) => {
      // Polar-hosted, so a full navigation rather than a client-side route.
      window.location.href = response.portal_url;
    },
    onError: (error) => toastApiError(error),
  });

  const [invoiceBusy, setInvoiceBusy] = React.useState<string | null>(null);

  const downloadInvoice = React.useCallback(async (paymentId: string) => {
    setInvoiceBusy(paymentId);
    try {
      // The first request only schedules the PDF, so poll until it exists.
      for (let attempt = 0; attempt < INVOICE_POLL_ATTEMPTS; attempt++) {
        const invoice = await billingService.invoice(paymentId);
        if (invoice.status === "ready" && invoice.url) {
          // Served as `Content-Disposition: attachment`, so this downloads
          // in place rather than navigating away, and no popup is opened.
          window.location.href = invoice.url;
          return;
        }
        await new Promise((resolve) => setTimeout(resolve, INVOICE_POLL_MS));
      }
      toast.error(
        "The invoice is still being prepared. Please try again shortly."
      );
    } catch (error) {
      toastApiError(error);
    } finally {
      setInvoiceBusy(null);
    }
  }, []);

  // Returning from a completed checkout. The credits are granted by Polar's
  // webhook, not by this page, so the balance may still be stale for a moment.
  React.useEffect(() => {
    if (!arrivedFromCheckout) return;

    toast.success("Payment received — adding your credits.");
    // Drop the query param so a refresh does not replay this.
    router.replace("/dashboard/billing");

    const timers = SETTLEMENT_POLL_MS.map((delay) =>
      setTimeout(() => {
        void queryClient.invalidateQueries({ queryKey: queryKeys.billing });
        void queryClient.invalidateQueries({ queryKey: queryKeys.payments });
        void queryClient.invalidateQueries({
          queryKey: queryKeys.dashboardStats,
        });
      }, delay)
    );
    const done = setTimeout(
      () => setAwaitingCredits(false),
      SETTLEMENT_POLL_MS[SETTLEMENT_POLL_MS.length - 1] + 1_000
    );

    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(done);
    };
  }, [arrivedFromCheckout, queryClient, router]);

  return (
    <>
      <PageHeader
        title="Wallet & Top-up"
        description="Manage your credit balance and top up when needed."
      />

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Current balance</CardTitle>
          <CardDescription>Your credits never expire.</CardDescription>
        </CardHeader>

        <CardContent>
          {billingLoading || !billing ? (
            <div className="space-y-3">
              <Skeleton className="h-8 w-40" />
              <Skeleton className="h-2 w-full" />
              <Skeleton className="h-4 w-52" />
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-4xl font-bold tracking-tight tabular-nums">
                {formatNumber(billing.wallet.credits_balance)}
              </span>
              <span className="text-muted-foreground font-medium">
                credits remaining
              </span>
              {awaitingCredits && (
                <span className="text-muted-foreground text-sm">
                  Confirming your payment…
                </span>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <h2 className="mb-4 text-lg font-semibold tracking-tight">
        Top-up packages
      </h2>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {plansLoading || !plans
          ? Array.from({ length: 4 }).map((_, index) => (
              <Card key={index} className="p-5">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="mt-3 h-8 w-24" />
                <Skeleton className="mt-5 h-9 w-full" />
              </Card>
            ))
          : plans.map((plan) => (
              <Card key={plan.id} className="flex flex-col p-5">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-medium">{plan.name}</h3>
                </div>

                <p className="mt-3 text-2xl font-semibold tracking-tight">
                  {plan.is_contact_sales
                    ? "Custom"
                    : formatCurrency(plan.price_cents, plan.currency)}
                  {!plan.is_contact_sales && (
                    <span className="text-muted-foreground text-sm font-normal">
                      {" "}
                      one-time
                    </span>
                  )}
                </p>

                <p className="text-muted-foreground mt-1 text-sm">
                  {plan.credits_awarded === null
                    ? "Unlimited credits"
                    : `Adds ${formatNumber(plan.credits_awarded)} credits`}
                </p>

                <ul className="mt-4 flex-1 space-y-2">
                  {plan.features.slice(0, 3).map((feature) => (
                    <li
                      key={feature}
                      className="text-muted-foreground flex gap-2 text-xs"
                    >
                      <Check
                        className="text-success mt-0.5 size-3 shrink-0"
                        aria-hidden
                      />
                      {feature}
                    </li>
                  ))}
                </ul>

                {plan.slug === "free" ? null : plan.is_contact_sales ? (
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="mt-5 w-full"
                  >
                    <a href="mailto:sales@waverify.app?subject=WAVerify%20Enterprise">
                      Contact Sales
                    </a>
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    className="mt-5 w-full"
                    onClick={() => setPendingPlan(plan)}
                  >
                    Buy {plan.name}
                  </Button>
                )}
              </Card>
            ))}
      </div>

      {payments && payments.length > 0 && (
        <>
          <div className="mt-10 mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold tracking-tight">
              Purchase history
            </h2>
            <Button
              variant="outline"
              size="sm"
              loading={portal.isPending}
              onClick={() => portal.mutate()}
            >
              <ExternalLink aria-hidden />
              Manage billing
            </Button>
          </div>
          <Card>
            <CardContent className="divide-border divide-y p-0">
              {payments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
                >
                  <div>
                    <p className="font-medium">
                      {payment.plan?.name ?? "Unrecognised purchase"}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      {new Date(payment.created_at).toLocaleDateString()} ·{" "}
                      {formatNumber(payment.credits_granted)} credits
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {payment.status !== "paid" && (
                      <Badge variant="outline">{payment.status}</Badge>
                    )}
                    <span className="font-medium tabular-nums">
                      {formatCurrency(payment.amount_cents, payment.currency)}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      loading={invoiceBusy === payment.id}
                      disabled={invoiceBusy !== null}
                      onClick={() => void downloadInvoice(payment.id)}
                    >
                      <Download aria-hidden />
                      Invoice
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </>
      )}

      <Dialog
        open={pendingPlan !== null}
        onOpenChange={(open) => !open && setPendingPlan(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Buy {pendingPlan?.name}?</DialogTitle>
            <DialogDescription>
              You will be taken to our payment provider to complete the
              purchase. Your credits are added as soon as the payment clears.
            </DialogDescription>
          </DialogHeader>

          <p className="text-muted-foreground text-sm leading-relaxed">
            Covered by our 30-day refund policy — unused credits come back in
            full, no questions asked.{" "}
            <Link
              href="/refund-policy"
              className="hover:text-foreground underline underline-offset-4"
            >
              Read the policy
            </Link>
            .
          </p>

          <DialogFooter>
            <Button variant="outline" onClick={() => setPendingPlan(null)}>
              Cancel
            </Button>
            <Button
              loading={checkout.isPending}
              onClick={() => pendingPlan && checkout.mutate(pendingPlan.slug)}
            >
              Continue to payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
