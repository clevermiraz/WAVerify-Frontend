"use client";

import { Check, Clock, Copy, RotateCcw } from "lucide-react";
import * as React from "react";

import {
  Detail,
  EmailDetails,
  GravatarDetails,
} from "@/components/dashboard/lookup-details";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCopy } from "@/hooks/use-copy";
import type { EmailCheckResult } from "@/types/api";

export function EmailResultSkeleton() {
  return (
    <Card>
      <CardContent className="space-y-6 p-6">
        <div className="space-y-2">
          <Skeleton className="h-5 w-52" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface EmailResultCardProps {
  result: EmailCheckResult;
  onSearchAgain: () => void;
}

/**
 * The standalone email check. Everything on show comes from the same blocks
 * the phone result uses, so the two read as one product rather than two
 * features that happen to share a page.
 */
export function EmailResultCard({
  result,
  onSearchAgain,
}: EmailResultCardProps) {
  const { copied, copy } = useCopy();
  const [showJson, setShowJson] = React.useState(false);

  // What the public API returns, so "Copy JSON" matches the documented shape.
  const rawJson = React.useMemo(
    () =>
      JSON.stringify(
        {
          success: result.success,
          email: result.email,
          email_info: result.email_info,
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
        {/* The block already carries the address and its badge, so there is no
            separate header repeating them. Its leading border and spacing are
            dropped so it sits flush at the top of the card. */}
        <div className="[&>section]:mt-0 [&>section]:border-t-0 [&>section]:pt-0">
          <EmailDetails info={result.email_info} />
        </div>

        {result.gravatar && <GravatarDetails profile={result.gravatar} />}

        <dl className="mt-6 grid gap-5 border-t pt-6 sm:grid-cols-3">
          <Detail label="Response time">
            <span className="flex items-center gap-1.5">
              <Clock className="size-3.5" aria-hidden />
              {result.response_time_ms} ms
            </span>
          </Detail>

          <Detail label="Checked at">
            {new Date(result.checked_at).toLocaleTimeString()}
          </Detail>

          <Detail label="Cost">
            {/* Worth stating plainly — it is the difference from a number check. */}
            <span className="text-muted-foreground font-normal">
              Free, no request used
            </span>
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
