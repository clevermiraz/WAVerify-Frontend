"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import * as React from "react";
import { useForm } from "react-hook-form";

import { AuthCard } from "@/components/auth/auth-card";
import { FormError } from "@/components/auth/form-error";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ApiError } from "@/lib/api-client";
import {
  resetPasswordSchema,
  type ResetPasswordInput,
} from "@/lib/validations";
import { authService } from "@/services";

export function ResetPasswordForm() {
  const token = useSearchParams().get("token");
  const [done, setDone] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirm_password: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    if (!token) return;
    setFormError(null);
    try {
      await authService.resetPassword({ token, password: values.password });
      setDone(true);
    } catch (error) {
      setFormError(
        error instanceof ApiError ? error.message : "Something went wrong."
      );
    }
  });

  if (!token) {
    return (
      <AuthCard
        title="Link is incomplete"
        description="This password reset link is missing its token."
        footer={
          <Link
            href="/forgot-password"
            className="text-foreground underline underline-offset-4"
          >
            Request a new link
          </Link>
        }
      >
        <FormError message="Open the link directly from the email you received." />
      </AuthCard>
    );
  }

  if (done) {
    return (
      <AuthCard
        title="Password updated"
        description="You can now sign in with your new password."
        footer={
          <Link
            href="/login"
            className="text-foreground underline underline-offset-4"
          >
            Go to sign in
          </Link>
        }
      >
        <Alert variant="success">
          <CheckCircle2 />
          <AlertDescription>
            For your security, the reset link has now been used up.
          </AlertDescription>
        </Alert>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Set a new password"
      description="Choose a password you haven't used before."
      footer={
        <Link
          href="/login"
          className="text-foreground underline underline-offset-4"
        >
          Back to sign in
        </Link>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <FormError message={formError} />

        <Field
          label="New password"
          htmlFor="password"
          error={errors.password?.message}
          hint="At least 8 characters, with a letter and a number."
        >
          <Input
            type="password"
            autoComplete="new-password"
            {...register("password")}
          />
        </Field>

        <Field
          label="Confirm password"
          htmlFor="confirm_password"
          error={errors.confirm_password?.message}
        >
          <Input
            type="password"
            autoComplete="new-password"
            {...register("confirm_password")}
          />
        </Field>

        <Button type="submit" className="w-full" loading={isSubmitting}>
          Update password
        </Button>
      </form>
    </AuthCard>
  );
}
