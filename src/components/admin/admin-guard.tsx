"use client";

import { ShieldAlert } from "lucide-react";
import Link from "next/link";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";

/**
 * Hides the admin UI from non-admins.
 *
 * Cosmetic only — every `/admin` endpoint independently requires the admin
 * role, so bypassing this reveals nothing.
 */
export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (user?.role !== "admin") {
    return (
      <Alert variant="destructive">
        <ShieldAlert />
        <div className="flex-1">
          <AlertTitle>Administrator access required</AlertTitle>
          <AlertDescription className="mt-1">
            Your account doesn&apos;t have permission to view this area.
          </AlertDescription>
          <Button asChild variant="outline" size="sm" className="mt-4">
            <Link href="/dashboard">Back to dashboard</Link>
          </Button>
        </div>
      </Alert>
    );
  }

  return <>{children}</>;
}
