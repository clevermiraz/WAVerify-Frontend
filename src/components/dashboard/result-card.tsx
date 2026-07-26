"use client";

import {
  Building2,
  Check,
  Clock,
  Copy,
  RotateCcw,
  UserRound,
  XCircle,
  Zap,
} from "lucide-react";
import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCopy } from "@/hooks/use-copy";
import { cn } from "@/lib/utils";
import type { CheckResult } from "@/types/api";

export function ResultSkeleton() {
  return (
    <Card>
      <CardContent className="space-y-6 p-6">
        <div className="flex items-center gap-4">
          <Skeleton className="size-14 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-28" />
          </div>
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </div>

        <Skeleton className="h-32 w-full" />
      </CardContent>
    </Card>
  );
}

interface ResultCardProps {
  result: CheckResult;
  onSearchAgain: () => void;
}

export function ResultCard({ result, onSearchAgain }: ResultCardProps) {
  const { copied, copy } = useCopy();
  const [showJson, setShowJson] = React.useState(false);

  // What the public API returns, so "Copy JSON" matches the documented shape.
  const rawJson = React.useMemo(
    () =>
      JSON.stringify(
        {
          success: result.success,
          exists: result.exists,
          display_name: result.display_name,
          about: result.about,
          business: result.business,
          profile_photo: result.profile_photo,
          response_time_ms: result.response_time_ms,
        },
        null,
        2
      ),
    [result]
  );

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-wrap items-start gap-4">
          <Avatar result={result} />

          <div className="min-w-0 flex-1">
            <p className="font-mono text-sm font-medium">{result.phone}</p>
            <p className="mt-1 truncate text-lg font-semibold">
              {result.exists
                ? (result.display_name ?? "Name not public")
                : "No account"}
            </p>
          </div>

          <Badge variant={result.exists ? "success" : "muted"} className="mt-1">
            {result.exists ? (
              <>
                <Check className="size-3" aria-hidden />
                Exists on WhatsApp
              </>
            ) : (
              <>
                <XCircle className="size-3" aria-hidden />
                Not found
              </>
            )}
          </Badge>
        </div>

        {result.exists && (
          <dl className="mt-6 grid gap-5 border-t pt-6 sm:grid-cols-3">
            <Detail label="Account type">
              <span className="flex items-center gap-1.5">
                {result.business ? (
                  <>
                    <Building2 className="size-3.5" aria-hidden />
                    Business
                  </>
                ) : (
                  <>
                    <UserRound className="size-3.5" aria-hidden />
                    Personal
                  </>
                )}
              </span>
            </Detail>

            <Detail label="About" className="sm:col-span-2">
              {result.about ?? (
                <span className="text-muted-foreground">Not set</span>
              )}
            </Detail>
          </dl>
        )}

        <dl className="mt-6 grid gap-5 border-t pt-6 sm:grid-cols-3">
          <Detail label="Response time">
            <span className="flex items-center gap-1.5">
              <Clock className="size-3.5" aria-hidden />
              {result.response_time_ms} ms
            </span>
          </Detail>

          <Detail label="Source">
            {result.cached ? (
              <span className="flex items-center gap-1.5">
                <Zap className="size-3.5" aria-hidden />
                Cached
              </span>
            ) : (
              "Live lookup"
            )}
          </Detail>

          <Detail label="Checked at">
            {new Date(result.checked_at).toLocaleTimeString()}
          </Detail>
        </dl>

        <div className="mt-6 flex flex-wrap gap-2 border-t pt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowJson((v) => !v)}
          >
            {showJson ? "Hide" : "Show"} raw JSON
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => void copy(rawJson, "JSON copied")}
          >
            {copied ? <Check /> : <Copy />}
            Copy JSON
          </Button>
          <Button size="sm" onClick={onSearchAgain} className="ml-auto">
            <RotateCcw />
            Search again
          </Button>
        </div>

        {showJson && (
          <pre className="bg-muted mt-4 overflow-x-auto rounded-lg p-4 font-mono text-xs leading-relaxed">
            <code>{rawJson}</code>
          </pre>
        )}
      </CardContent>
    </Card>
  );
}

function Detail({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <dt className="text-muted-foreground text-xs tracking-wide uppercase">
        {label}
      </dt>
      <dd className="mt-1.5 text-sm font-medium">{children}</dd>
    </div>
  );
}

function initials(name: string | null): string | null {
  if (!name?.trim()) return null;
  const parts = name.trim().split(/\s+/);
  return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
}

function Avatar({ result }: { result: CheckResult }) {
  const [failed, setFailed] = React.useState(false);
  const showImage = result.exists && result.profile_photo && !failed;
  const label = initials(result.display_name);

  return (
    <div
      className={cn(
        "relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-full border",
        result.exists ? "bg-success-muted" : "bg-muted"
      )}
    >
      {/* Rendered underneath the photo rather than instead of it, so a slow
          or blocked image never leaves an empty circle. */}
      {result.exists && label ? (
        <span className="text-success text-sm font-semibold">{label}</span>
      ) : (
        <UserRound
          className={cn(
            "size-6",
            result.exists ? "text-success" : "text-muted-foreground"
          )}
          aria-hidden
        />
      )}

      {showImage && (
        // A plain <img>: the URL comes from the provider at runtime and is
        // not a known remote pattern, so next/image cannot optimise it.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={result.profile_photo!}
          alt=""
          className="absolute inset-0 size-full object-cover"
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}
