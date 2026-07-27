"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, Info } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/dashboard/page-header";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  queryKeys,
  toastApiError,
  useBilling,
  usePlans,
} from "@/hooks/use-api";
import { cn, formatCurrency, formatDate, formatNumber } from "@/lib/utils";
import { billingService } from "@/services";
import type { Plan } from "@/types/api";

export function BillingView() {
  const { data: billing, isLoading: billingLoading } = useBilling();
  const { data: plans, isLoading: plansLoading } = usePlans();
  const [pendingPlan, setPendingPlan] = React.useState<Plan | null>(null);
  const queryClient = useQueryClient();

  const changePlan = useMutation({
    mutationFn: (slug: string) => billingService.changePlan(slug),
    onSuccess: (subscription) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.billing });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.dashboardStats,
      });
      void queryClient.invalidateQueries({ queryKey: ["usage"] });
      toast.success(`You're now on the ${subscription.plan.name} plan.`);
      setPendingPlan(null);
    },
    onError: (error) => {
      toastApiError(error);
      setPendingPlan(null);
    },
  });

  const currentSlug = billing?.subscription.plan.slug;

  return (
    <>
      <PageHeader
        title="Billing"
        description="Your plan, quota and billing period."
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
          <CardTitle>Current plan</CardTitle>
          <CardDescription>
            {billing
              ? `Renews ${formatDate(billing.subscription.current_period_end)}`
              : "Loading…"}
          </CardDescription>
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
                <span className="text-2xl font-semibold tracking-tight">
                  {billing.subscription.plan.name}
                </span>
                <Badge
                  variant={
                    billing.subscription.status === "active"
                      ? "success"
                      : "muted"
                  }
                >
                  {billing.subscription.status}
                </Badge>
              </div>

              <div className="mt-5">
                <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2 text-sm">
                  <span className="text-muted-foreground">Requests used</span>
                  <span className="tabular-nums">
                    {formatNumber(billing.requests_used)}
                    {billing.quota !== null &&
                      ` / ${formatNumber(billing.quota)}`}
                  </span>
                </div>

                {billing.quota !== null ? (
                  <Progress
                    value={billing.requests_used}
                    max={billing.quota}
                    label="Requests used this billing period"
                  />
                ) : (
                  <p className="text-muted-foreground text-sm">
                    Your plan has no monthly request limit.
                  </p>
                )}
              </div>

              <p className="text-muted-foreground mt-3 text-sm">
                Billing period{" "}
                {formatDate(billing.subscription.current_period_start)} –{" "}
                {formatDate(billing.subscription.current_period_end)}
              </p>
            </>
          )}
        </CardContent>
      </Card>

      <h2 className="mb-4 text-lg font-semibold tracking-tight">
        Available plans
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
          : plans.map((plan) => {
              const isCurrent = plan.slug === currentSlug;

              return (
                <Card
                  key={plan.id}
                  className={cn(
                    "flex flex-col p-5",
                    isCurrent && "border-primary"
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-medium">{plan.name}</h3>
                    {isCurrent && <Badge variant="secondary">Current</Badge>}
                  </div>

                  <p className="mt-3 text-2xl font-semibold tracking-tight">
                    {plan.is_contact_sales
                      ? "Custom"
                      : formatCurrency(plan.price_cents, plan.currency)}
                    {!plan.is_contact_sales && (
                      <span className="text-muted-foreground text-sm font-normal">
                        /mo
                      </span>
                    )}
                  </p>

                  <p className="text-muted-foreground mt-1 text-sm">
                    {plan.monthly_request_quota === null
                      ? "Unlimited requests"
                      : `${formatNumber(plan.monthly_request_quota)} requests`}
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

                  {plan.is_contact_sales ? (
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
                      variant={isCurrent ? "outline" : "default"}
                      disabled={isCurrent}
                      className="mt-5 w-full"
                      onClick={() => setPendingPlan(plan)}
                    >
                      {isCurrent ? "Current plan" : `Switch to ${plan.name}`}
                    </Button>
                  )}
                </Card>
              );
            })}
      </div>

      <Dialog
        open={pendingPlan !== null}
        onOpenChange={(open) => !open && setPendingPlan(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Switch to {pendingPlan?.name}?</DialogTitle>
            <DialogDescription>
              Your quota changes immediately and a new billing period starts
              today. Nothing is charged.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={() => setPendingPlan(null)}>
              Cancel
            </Button>
            <Button
              loading={changePlan.isPending}
              onClick={() => pendingPlan && changePlan.mutate(pendingPlan.slug)}
            >
              Confirm switch
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
