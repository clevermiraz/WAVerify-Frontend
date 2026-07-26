"use client";

import {
  ArrowRight,
  CheckCircle2,
  Clock,
  KeyRound,
  MailWarning,
  Search,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/dashboard/page-header";
import { SearchHistory } from "@/components/dashboard/search-history";
import { StatCard, StatCardSkeleton } from "@/components/dashboard/stat-card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useDashboardStats } from "@/hooks/use-api";
import { useAuth } from "@/hooks/use-auth";
import { formatNumber } from "@/lib/utils";
import { authService } from "@/services";

export function DashboardOverview() {
  const { user } = useAuth();
  const { data: stats, isLoading, isError } = useDashboardStats();

  const firstName = user?.full_name?.split(" ")[0];

  return (
    <>
      <PageHeader
        title={firstName ? `Welcome back, ${firstName}` : "Dashboard"}
        description="An overview of your verification activity."
        action={
          <Button asChild>
            <Link href="/dashboard/search">
              <Search />
              New search
            </Link>
          </Button>
        }
      />

      {user && !user.is_email_verified && (
        <VerifyEmailBanner email={user.email} />
      )}

      {isError && (
        <p className="text-muted-foreground mb-6 text-sm">
          Your statistics could not be loaded. Please refresh the page.
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading || !stats ? (
          Array.from({ length: 4 }).map((_, index) => (
            <StatCardSkeleton key={index} />
          ))
        ) : (
          <>
            <StatCard
              label="Total searches"
              value={formatNumber(stats.total_searches)}
              hint="All time"
              icon={Search}
            />
            <StatCard
              label="On WhatsApp"
              value={formatNumber(stats.numbers_on_whatsapp)}
              hint="Numbers with an account"
              icon={CheckCircle2}
            />
            <StatCard
              label="Success rate"
              value={`${stats.success_rate}%`}
              hint="This billing period"
              icon={TrendingUp}
            />
            <StatCard
              label="Avg. response"
              value={`${stats.average_response_time_ms} ms`}
              hint="This billing period"
              icon={Clock}
            />
          </>
        )}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Monthly usage</CardTitle>
            <CardDescription>
              {stats
                ? `You're on the ${stats.plan_name} plan.`
                : "Loading your plan…"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats ? (
              <>
                <div className="mb-2 flex items-baseline justify-between gap-2">
                  <span className="text-2xl font-semibold tabular-nums">
                    {formatNumber(stats.month_requests)}
                  </span>
                  <span className="text-muted-foreground text-sm">
                    {stats.quota === null
                      ? "of unlimited"
                      : `of ${formatNumber(stats.quota)} requests`}
                  </span>
                </div>

                {stats.quota !== null && (
                  <Progress
                    value={stats.month_requests}
                    max={stats.quota}
                    label="Monthly request usage"
                  />
                )}

                <p className="text-muted-foreground mt-3 text-sm">
                  {stats.remaining_credits === null
                    ? "No monthly limit on your plan."
                    : `${formatNumber(stats.remaining_credits)} requests remaining this period.`}
                </p>

                <Button asChild variant="outline" size="sm" className="mt-5">
                  <Link href="/dashboard/billing">
                    Manage plan
                    <ArrowRight />
                  </Link>
                </Button>
              </>
            ) : (
              <StatCardSkeleton />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>API keys</CardTitle>
            <CardDescription>
              Credentials for server-to-server calls.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <span
                className="bg-secondary inline-flex size-9 items-center justify-center rounded-lg border"
                aria-hidden
              >
                <KeyRound className="size-4" />
              </span>
              <div>
                <p className="text-xl font-semibold tabular-nums">
                  {stats?.active_api_keys ?? "—"}
                </p>
                <p className="text-muted-foreground text-xs">active</p>
              </div>
            </div>

            <Button asChild variant="outline" size="sm" className="mt-5 w-full">
              <Link href="/dashboard/api-keys">Manage keys</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <section className="mt-10">
        <h2 className="mb-4 text-lg font-semibold tracking-tight">
          Recent searches
        </h2>
        <SearchHistory />
      </section>
    </>
  );
}

function VerifyEmailBanner({ email }: { email: string }) {
  const [sending, setSending] = React.useState(false);

  const resend = async () => {
    setSending(true);
    try {
      const response = await authService.resendVerification(email);
      toast.success(response.message);
    } catch {
      toast.error("Could not send the email. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <Alert variant="warning" className="mb-6">
      <MailWarning />
      <AlertDescription className="flex flex-1 flex-wrap items-center justify-between gap-3">
        <span>Confirm your email address to secure your account.</span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => void resend()}
          loading={sending}
        >
          Resend link
        </Button>
      </AlertDescription>
    </Alert>
  );
}
