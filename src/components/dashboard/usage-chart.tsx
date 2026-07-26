"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import type { UsagePoint } from "@/types/api";

/**
 * A dependency-free bar chart.
 *
 * The usage view needs one simple series, so plain elements beat pulling in a
 * charting library: it stays accessible, themeable and tiny.
 */
export function UsageChart({ data }: { data: UsagePoint[] }) {
  const max = React.useMemo(
    () => Math.max(1, ...data.map((point) => point.total)),
    [data]
  );

  const total = data.reduce((sum, point) => sum + point.total, 0);

  if (total === 0) {
    return (
      <p className="text-muted-foreground py-12 text-center text-sm">
        No requests recorded in this period yet.
      </p>
    );
  }

  return (
    <figure>
      <div className="flex h-40 items-end gap-0.75" role="img" aria-hidden>
        {data.map((point) => {
          const height = (point.total / max) * 100;
          const failed = point.failed > 0;

          return (
            <div
              key={point.date}
              className="group relative flex flex-1 items-end justify-center"
              style={{ height: "100%" }}
            >
              <div
                className={cn(
                  "w-full rounded-t-sm transition-colors",
                  point.total === 0
                    ? "bg-muted"
                    : failed
                      ? "bg-destructive/70"
                      : "bg-primary/80 group-hover:bg-primary"
                )}
                style={{
                  height: `${Math.max(point.total === 0 ? 2 : 6, height)}%`,
                }}
              />

              <span className="bg-popover pointer-events-none absolute bottom-full mb-1.5 hidden rounded-md border px-2 py-1 text-xs whitespace-nowrap shadow-sm group-hover:block">
                <strong className="tabular-nums">{point.total}</strong> on{" "}
                {new Date(point.date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
          );
        })}
      </div>

      <div className="text-muted-foreground mt-3 flex justify-between text-xs">
        <span>
          {new Date(data[0].date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
        </span>
        <span>
          {new Date(data[data.length - 1].date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
        </span>
      </div>

      {/* The visual is decorative; this is the accessible equivalent. */}
      <figcaption className="sr-only">
        Daily request volume over the last {data.length} days, totalling {total}{" "}
        requests. Peak day: {max} requests.
      </figcaption>
    </figure>
  );
}
