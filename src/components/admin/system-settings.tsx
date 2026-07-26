"use client";

import { Info } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useSystemSettings } from "@/hooks/use-api";

export function AdminSystemSettings() {
  const { data, isLoading, isError } = useSystemSettings();

  if (isError) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground text-sm">
            System settings could not be loaded.
          </p>
        </CardContent>
      </Card>
    );
  }

  const rows = data
    ? [
        { label: "Environment", value: data.environment },
        { label: "Verification provider", value: data.whatsapp_provider },
        {
          label: "Lookup cache TTL",
          value: `${data.verification_cache_ttl_seconds}s`,
        },
        {
          label: "Rate limiting",
          value: data.rate_limit_enabled ? "Enabled" : "Disabled",
        },
        {
          label: "Default rate limit",
          value: `${data.rate_limit_per_minute} req/min`,
        },
        { label: "Email backend", value: data.email_backend },
      ]
    : [];

  return (
    <div className="space-y-4">
      <Alert>
        <Info />
        <AlertDescription>
          These values come from the deployment&apos;s environment variables and
          are read-only, so configuration stays reproducible across deploys.
        </AlertDescription>
      </Alert>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-3 p-4">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-10 w-full" />
              ))}
            </div>
          ) : (
            <dl className="divide-y">
              {rows.map((row) => (
                <div
                  key={row.label}
                  className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5"
                >
                  <dt className="text-sm font-medium">{row.label}</dt>
                  <dd>
                    <Badge variant="muted" className="font-mono">
                      {row.value}
                    </Badge>
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
