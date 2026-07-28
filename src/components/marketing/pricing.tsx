"use client";

import { Check } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { usePlans } from "@/hooks/use-api";
import { cn, formatCurrency, formatNumber } from "@/lib/utils";

export function Pricing() {
  const { data: plans, isLoading, isError } = usePlans();

  return (
    <section id="pricing" className="scroll-mt-20 border-t">
      <div className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            Simple, predictable pricing
          </h2>
          <p className="text-muted-foreground mt-4 text-lg leading-relaxed">
            Start free. Top up when you need more. No subscription, no per-seat
            charges — your credits never expire.
          </p>
        </div>

        {isError && (
          <p className="text-muted-foreground mt-12 text-center text-sm">
            Pricing could not be loaded right now. Please refresh the page.
          </p>
        )}

        <div className="mt-14 grid gap-6 lg:grid-cols-4">
          {isLoading
            ? Array.from({ length: 4 }).map((_, index) => (
                <Card key={index} className="p-6">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="mt-4 h-9 w-28" />
                  <Skeleton className="mt-6 h-9 w-full" />
                  <div className="mt-6 space-y-3">
                    {Array.from({ length: 4 }).map((__, row) => (
                      <Skeleton key={row} className="h-4 w-full" />
                    ))}
                  </div>
                </Card>
              ))
            : plans?.map((plan) => {
                const highlighted = plan.is_recommended;

                return (
                  <Card
                    key={plan.id}
                    className={cn(
                      "relative flex flex-col p-6",
                      highlighted && "border-primary shadow-md"
                    )}
                  >
                    {highlighted && (
                      <Badge className="absolute -top-2.5 left-6">
                        Most popular
                      </Badge>
                    )}

                    <h3 className="font-medium">{plan.name}</h3>

                    <div className="mt-4 flex items-baseline gap-1">
                      {plan.is_contact_sales ? (
                        <span className="text-3xl font-semibold tracking-tight">
                          Custom
                        </span>
                      ) : (
                        <>
                          <span className="text-3xl font-semibold tracking-tight">
                            {formatCurrency(plan.price_cents, plan.currency)}
                          </span>
                          <span className="text-muted-foreground text-sm">
                            one-time
                          </span>
                        </>
                      )}
                    </div>

                    <p className="text-muted-foreground mt-2 text-sm">
                      {plan.credits_awarded === null
                        ? "Unlimited credits"
                        : `Adds ${formatNumber(plan.credits_awarded)} credits`}
                    </p>

                    <Button
                      asChild
                      className="mt-6 w-full"
                      variant={highlighted ? "default" : "outline"}
                    >
                      <Link
                        href={
                          plan.is_contact_sales
                            ? "mailto:sales@waverify.app?subject=WAVerify%20Enterprise"
                            : "/register"
                        }
                      >
                        {plan.is_contact_sales
                          ? "Contact Sales"
                          : plan.price_cents === 0
                            ? "Start Free"
                            : `Get ${plan.name}`}
                      </Link>
                    </Button>

                    <ul className="mt-6 space-y-3 border-t pt-6">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex gap-2.5 text-sm">
                          <Check
                            className="text-success mt-0.5 size-4 shrink-0"
                            aria-hidden
                          />
                          <span className="text-muted-foreground">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                );
              })}
        </div>

        <div className="mt-10 text-center">
          <p className="text-sm font-medium">
            30-day refund policy — no questions asked.
          </p>
          <p className="text-muted-foreground mx-auto mt-2 max-w-md text-xs leading-relaxed">
            Every pack is a one-time purchase and your credits never expire.
            Haven&apos;t used them? Get every penny back within 30 days. Used
            some? We refund the value of what&apos;s left.{" "}
            <Link
              href="/refund-policy"
              className="underline underline-offset-4 hover:text-foreground"
            >
              Read the policy
            </Link>
            .
          </p>
        </div>
      </div>
    </section>
  );
}
