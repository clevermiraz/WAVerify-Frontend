"use client";

import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import * as React from "react";

import { AuthCard } from "@/components/auth/auth-card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { ApiError } from "@/lib/api-client";
import { authService } from "@/services";

type Status = "pending" | "success" | "error";

export function VerifyEmail() {
  const token = useSearchParams().get("token");
  const { isAuthenticated, refreshUser } = useAuth();
  const [status, setStatus] = React.useState<Status>(
    token ? "pending" : "error"
  );
  const [message, setMessage] = React.useState(
    token ? "" : "This verification link is missing its token."
  );

  React.useEffect(() => {
    if (!token) return;
    let cancelled = false;

    void (async () => {
      try {
        await authService.verifyEmail(token);
        if (cancelled) return;
        setStatus("success");
        // Keep the signed-in session's `is_email_verified` flag in step.
        if (isAuthenticated) await refreshUser().catch(() => undefined);
      } catch (error) {
        if (cancelled) return;
        setStatus("error");
        setMessage(
          error instanceof ApiError
            ? error.message
            : "We couldn't verify this link."
        );
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token, isAuthenticated, refreshUser]);

  if (status === "pending") {
    return (
      <AuthCard
        title="Verifying your email"
        description="This will only take a moment."
      >
        <div className="text-muted-foreground flex items-center justify-center gap-2 py-4 text-sm">
          <Loader2 className="size-4 animate-spin" aria-hidden />
          Checking your link…
        </div>
      </AuthCard>
    );
  }

  if (status === "success") {
    return (
      <AuthCard
        title="Email verified"
        description="Your address is confirmed and your account is fully active."
      >
        <Alert variant="success">
          <CheckCircle2 />
          <AlertDescription>You&apos;re all set.</AlertDescription>
        </Alert>
        <Button asChild className="mt-4 w-full">
          <Link href={isAuthenticated ? "/dashboard" : "/login"}>
            {isAuthenticated ? "Go to dashboard" : "Sign in"}
          </Link>
        </Button>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Verification failed"
      description="This link may have expired or already been used."
      footer={
        <Link
          href="/dashboard/settings"
          className="text-foreground underline underline-offset-4"
        >
          Request a new link from settings
        </Link>
      }
    >
      <Alert variant="destructive">
        <XCircle />
        <AlertDescription>{message}</AlertDescription>
      </Alert>
    </AuthCard>
  );
}
