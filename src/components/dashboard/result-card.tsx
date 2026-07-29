"use client";

import {
  BadgeCheck,
  Building2,
  Check,
  Clock,
  Copy,
  MonitorSmartphone,
  RotateCcw,
  UserRound,
  XCircle,
  Zap,
} from "lucide-react";
import * as React from "react";

import {
  Detail,
  GravatarDetails,
  humanise,
  Muted,
  NAME_SOURCES,
  NumberDetails,
  ProfileAvatar,
  Section,
  Unknown,
} from "@/components/dashboard/lookup-details";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCopy } from "@/hooks/use-copy";
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
          phone: result.phone,
          exists: result.exists,
          display_name: result.display_name,
          name_source: result.name_source,
          about: result.about,
          business: result.business,
          profile_photo: result.profile_photo,
          profile_photo_id: result.profile_photo_id,
          device_count: result.device_count,
          number_info: result.number_info,
          gravatar: result.gravatar,
          response_time_ms: result.response_time_ms,
          cached: result.cached,
          checked_at: result.checked_at,
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
          <ProfileAvatar
            name={result.display_name}
            photo={result.profile_photo}
            exists={result.exists}
          />

          <div className="min-w-0 flex-1">
            <p className="font-mono text-sm font-medium">{result.phone}</p>
            <p className="mt-1 flex items-center gap-1.5 text-lg font-semibold">
              <span className="truncate">
                {result.exists
                  ? (result.display_name ?? "Name not public")
                  : "No account"}
              </span>
              {result.name_source === "business_verified" && (
                <BadgeCheck
                  className="text-success size-4 shrink-0"
                  aria-label="Verified business"
                />
              )}
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
          <Section title="WhatsApp profile">
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

            <Detail label="Name from">
              <NameSource result={result} />
            </Detail>

            <Detail label="Devices">
              {result.device_count === null ? (
                <Unknown />
              ) : (
                <span className="flex items-center gap-1.5">
                  <MonitorSmartphone className="size-3.5" aria-hidden />
                  {result.device_count === 1
                    ? "Phone only"
                    : `${result.device_count} devices`}
                </span>
              )}
            </Detail>

            <Detail label="About" className="sm:col-span-3">
              {result.about ?? <Muted>Not set</Muted>}
            </Detail>
          </Section>
        )}

        {result.number_info && <NumberDetails info={result.number_info} />}

        {result.gravatar && <GravatarDetails profile={result.gravatar} />}

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

/**
 * A missing name on a personal account is the normal case — WhatsApp does not
 * give a stranger the name — so it is explained rather than shown as a gap.
 */
function NameSource({ result }: { result: CheckResult }) {
  if (result.name_source) {
    return (
      <>{NAME_SOURCES[result.name_source] ?? humanise(result.name_source)}</>
    );
  }
  if (!result.display_name && !result.business) {
    return <Muted>Personal accounts do not share a name</Muted>;
  }
  return <Unknown />;
}
