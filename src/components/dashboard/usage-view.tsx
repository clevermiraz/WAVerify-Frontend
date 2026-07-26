"use client";

import { Activity, CalendarDays, Clock, Gauge, TrendingUp } from "lucide-react";
import Link from "next/link";

import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard, StatCardSkeleton } from "@/components/dashboard/stat-card";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { UsageChart } from "@/components/dashboard/usage-chart";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useUsage } from "@/hooks/use-api";
import { formatDate, formatDateTime, formatNumber } from "@/lib/utils";

export function UsageView() {
  const { data, isLoading, isError } = useUsage(30);
  const summary = data?.summary;

  return (
    <>
      <PageHeader
        title="Usage"
        description="Request volume, success rate and remaining credits."
      />

      {isError && (
        <p className="text-muted-foreground mb-6 text-sm">
          Usage data could not be loaded. Please refresh the page.
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading || !summary ? (
          Array.from({ length: 4 }).map((_, index) => (
            <StatCardSkeleton key={index} />
          ))
        ) : (
          <>
            <StatCard
              label="Today"
              value={formatNumber(summary.today_requests)}
              hint="Requests so far"
              icon={CalendarDays}
            />
            <StatCard
              label="This period"
              value={formatNumber(summary.month_requests)}
              hint={
                summary.quota === null
                  ? "Unlimited plan"
                  : `of ${formatNumber(summary.quota)}`
              }
              icon={Activity}
            />
            <StatCard
              label="Remaining credits"
              value={
                summary.remaining_credits === null
                  ? "Unlimited"
                  : formatNumber(summary.remaining_credits)
              }
              hint={`Resets ${formatDate(summary.period_end)}`}
              icon={Gauge}
            />
            <StatCard
              label="Success rate"
              value={`${summary.success_rate}%`}
              hint={`Avg. ${summary.average_response_time_ms} ms`}
              icon={TrendingUp}
            />
          </>
        )}
      </div>

      {summary && summary.quota !== null && (
        <Card className="mt-6">
          <CardContent className="p-6">
            <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
              <span className="text-sm font-medium">
                Quota used this period
              </span>
              <span className="text-muted-foreground text-sm tabular-nums">
                {formatNumber(summary.month_requests)} /{" "}
                {formatNumber(summary.quota)}
              </span>
            </div>
            <Progress
              value={summary.month_requests}
              max={summary.quota}
              label="Quota used this billing period"
            />
            <p className="text-muted-foreground mt-3 text-xs">
              Billing period {formatDate(summary.period_start)} –{" "}
              {formatDate(summary.period_end)}.{" "}
              <Link
                href="/dashboard/billing"
                className="text-foreground underline underline-offset-4"
              >
                Change plan
              </Link>
            </p>
          </CardContent>
        </Card>
      )}

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Requests over time</CardTitle>
          <CardDescription>Daily volume for the last 30 days.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading || !data ? (
            <Skeleton className="h-40 w-full" />
          ) : (
            <UsageChart data={data.daily} />
          )}
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Recent requests</CardTitle>
          <CardDescription>
            Your last 10 lookups across all sources.
          </CardDescription>
        </CardHeader>

        {isLoading || !data ? (
          <CardContent className="space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-10 w-full" />
            ))}
          </CardContent>
        ) : data.recent.length === 0 ? (
          <CardContent>
            <p className="text-muted-foreground py-6 text-center text-sm">
              No requests yet.{" "}
              <Link
                href="/dashboard/search"
                className="text-foreground underline underline-offset-4"
              >
                Run your first search
              </Link>
              .
            </p>
          </CardContent>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Phone number</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden sm:table-cell">Source</TableHead>
                <TableHead className="hidden md:table-cell">Date</TableHead>
                <TableHead className="text-right">Response</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.recent.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-mono text-sm">
                    {log.phone_number}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={log.status} />
                  </TableCell>
                  <TableCell className="text-muted-foreground hidden text-sm capitalize sm:table-cell">
                    {log.source}
                  </TableCell>
                  <TableCell className="text-muted-foreground hidden text-sm whitespace-nowrap md:table-cell">
                    {formatDateTime(log.created_at)}
                  </TableCell>
                  <TableCell className="text-right text-sm tabular-nums">
                    {log.response_time_ms} ms
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <p className="text-muted-foreground mt-6 flex items-center gap-1.5 text-xs">
        <Clock className="size-3.5" aria-hidden />
        Counts include cached responses, which are billed as normal requests.
      </p>

      <div className="mt-4">
        <Button asChild variant="outline" size="sm">
          <Link href="/dashboard/search">Run a search</Link>
        </Button>
      </div>
    </>
  );
}
