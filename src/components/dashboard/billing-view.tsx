"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, Info } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/dashboard/page-header";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  usePlans,
} from "@/hooks/use-api";
import { ApiError } from "@/lib/api-client";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { billingService } from "@/services";
import type { Plan } from "@/types/api";

export function BillingView() {
  const { data: billing, isLoading: billingLoading } = useBilling();
  const { data: plans, isLoading: plansLoading } = usePlans();
  const [pendingPlan, setPendingPlan] = React.useState<Plan | null>(null);
  const queryClient = useQueryClient();

  const topup = useMutation({
    mutationFn: (slug: string) => billingService.topup(slug),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.billing });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.dashboardStats,
      });
      void queryClient.invalidateQueries({ queryKey: ["usage"] });
      toast.success(`Credits successfully added to your wallet.`);
      setPendingPlan(null);
    },
    onError: (error) => {
      if (
        error instanceof ApiError &&
        error.code === "free_trial_already_claimed"
      ) {
        toast.info(
          "You already received your free credits when you signed up."
        );
      } else {
        toastApiError(error);
      }
      setPendingPlan(null);
    },
  });

  return (
    <>
      <PageHeader
        title="Wallet & Top-up"
        description="Manage your credit balance and top up when needed."
      />

      <Alert className="mb-6">
        <Info />
        <AlertDescription>
          Payment processing isn&apos;t enabled in this release. Plan changes
          apply immediately and nothing is charged.
        </AlertDescription>
      </Alert>

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
            <>
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-4xl font-bold tracking-tight tabular-nums">
                  {formatNumber(billing.wallet.credits_balance)}
                </span>
                <span className="text-muted-foreground font-medium">
                  credits remaining
                </span>
              </div>
            </>
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
                    Top-up {plan.name}
                  </Button>
                )}
              </Card>
            ))}
      </div>

      <Dialog
        open={pendingPlan !== null}
        onOpenChange={(open) => !open && setPendingPlan(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Buy {pendingPlan?.name}?</DialogTitle>
            <DialogDescription>
              Your credits will be added immediately. Nothing is actually
              charged in this demo.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={() => setPendingPlan(null)}>
              Cancel
            </Button>
            <Button
              loading={topup.isPending}
              onClick={() => pendingPlan && topup.mutate(pendingPlan.slug)}
            >
              Confirm top-up
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
