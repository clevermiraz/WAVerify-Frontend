"use client";

import { Building2, Clock, TriangleAlert, UserRound, Zap } from "lucide-react";
import * as React from "react";

import {
  Detail,
  EmailDetails,
  GravatarDetails,
  Muted,
  NumberDetails,
  ProfileAvatar,
  Section,
} from "@/components/dashboard/lookup-details";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useSearchDetail } from "@/hooks/use-api";
import { ApiError } from "@/lib/api-client";
import { formatDateTime } from "@/lib/utils";
import type { SearchLog, SearchLogDetail } from "@/types/api";

interface SearchDetailDialogProps {
  /**
   * The last row clicked. It deliberately outlives `open` so the header keeps
   * its text through the closing animation.
   */
  log: SearchLog | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchDetailDialog({
  log,
  open,
  onOpenChange,
}: SearchDetailDialogProps) {
  const { data, isLoading, error } = useSearchDetail(
    open && log ? log.id : null
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-mono">
            {log?.phone_number ?? "Search"}
          </DialogTitle>
          <DialogDescription>
            {log ? formatDateTime(log.created_at) : "Loading…"}
          </DialogDescription>
        </DialogHeader>

        {error ? (
          <Alert variant="destructive">
            <TriangleAlert />
            <AlertDescription>
              {error instanceof ApiError && error.status === 404
                ? "This search is no longer available."
                : "Could not load this search. Please try again."}
            </AlertDescription>
          </Alert>
        ) : isLoading || !data ? (
          <DetailSkeleton />
        ) : (
          <DetailBody detail={data} />
        )}
      </DialogContent>
    </Dialog>
  );
}

function DetailBody({ detail }: { detail: SearchLogDetail }) {
  const exists = detail.exists_on_whatsapp === true;

  return (
    <div className="-mt-2">
      <div className="flex flex-wrap items-center gap-4">
        <ProfileAvatar
          name={detail.display_name}
          photo={detail.profile_photo_url}
          exists={exists}
        />

        <div className="min-w-0 flex-1">
          <p className="truncate text-lg font-semibold">
            {exists ? (detail.display_name ?? "Name not public") : "No account"}
          </p>
          {detail.source && (
            <p className="text-muted-foreground text-xs">
              Checked from{" "}
              {detail.source === "api" ? "the API" : "the dashboard"}
            </p>
          )}
        </div>

        <StatusBadge status={detail.status} />
      </div>

      {detail.error_code && (
        <Alert variant="destructive" className="mt-5">
          <TriangleAlert />
          <AlertDescription>
            This check did not finish. The reason we recorded was{" "}
            <span className="font-mono">{detail.error_code}</span>.
          </AlertDescription>
        </Alert>
      )}

      {exists && (
        <Section title="WhatsApp profile">
          <Detail label="Account type">
            <span className="flex items-center gap-1.5">
              {detail.is_business ? (
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
            {detail.about ?? <Muted>Not set</Muted>}
          </Detail>
        </Section>
      )}

      {/* Null on lookups made before the backend started storing these. */}
      {detail.number_info ? (
        <NumberDetails info={detail.number_info} />
      ) : (
        <p className="text-muted-foreground mt-6 border-t pt-6 text-sm">
          Number and profile details were not saved for this search. Newer
          searches have them.
        </p>
      )}

      {detail.email_info && <EmailDetails info={detail.email_info} />}

      {detail.gravatar && <GravatarDetails profile={detail.gravatar} />}

      <dl className="mt-6 grid gap-5 border-t pt-6 sm:grid-cols-3">
        <Detail label="Response time">
          <span className="flex items-center gap-1.5">
            <Clock className="size-3.5" aria-hidden />
            {detail.response_time_ms} ms
          </span>
        </Detail>

        <Detail label="Source">
          {detail.cached ? (
            <span className="flex items-center gap-1.5">
              <Zap className="size-3.5" aria-hidden />
              Cached
            </span>
          ) : (
            "Live lookup"
          )}
        </Detail>

        <Detail label="Checked at">{formatDateTime(detail.created_at)}</Detail>
      </dl>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="-mt-2 space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="size-14 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="space-y-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}
