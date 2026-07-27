"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { MailCheck, MailWarning, TriangleAlert } from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { PageHeader } from "@/components/dashboard/page-header";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { toastApiError } from "@/hooks/use-api";
import { useAuth } from "@/hooks/use-auth";
import { ApiError, tokenStore } from "@/lib/api-client";
import { formatDate } from "@/lib/utils";
import {
  changePasswordSchema,
  deleteAccountSchema,
  profileSchema,
  type ChangePasswordInput,
  type DeleteAccountInput,
  type ProfileInput,
} from "@/lib/validations";
import { authService, userService } from "@/services";

export function SettingsView() {
  return (
    <>
      <PageHeader
        title="Settings"
        description="Manage your profile and account."
      />
      <div className="space-y-6">
        <ProfileSection />
        <EmailSection />
        <PasswordSection />
        <DangerZone />
      </div>
    </>
  );
}

function ProfileSection() {
  const { user, setUser } = useAuth();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: { full_name: "", company: "" },
  });

  // Populate once the session has loaded.
  React.useEffect(() => {
    if (user) {
      reset({ full_name: user.full_name ?? "", company: user.company ?? "" });
    }
  }, [user, reset]);

  const mutation = useMutation({
    mutationFn: (values: ProfileInput) =>
      userService.update({
        full_name: values.full_name || undefined,
        company: values.company || undefined,
      }),
    onSuccess: (updated) => {
      setUser(updated);
      reset({
        full_name: updated.full_name ?? "",
        company: updated.company ?? "",
      });
      toast.success("Profile updated.");
    },
    onError: (error) => toastApiError(error),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>
          {user ? `Member since ${formatDate(user.created_at)}.` : "Loading…"}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form
          onSubmit={handleSubmit((values) => mutation.mutate(values))}
          className="space-y-4"
          noValidate
        >
          <Field
            label="Email"
            htmlFor="profile-email"
            hint="Email cannot be changed."
          >
            <Input value={user?.email ?? ""} disabled readOnly />
          </Field>

          <Field
            label="Full name"
            htmlFor="full_name"
            error={errors.full_name?.message}
          >
            <Input autoComplete="name" {...register("full_name")} />
          </Field>

          <Field
            label="Company"
            htmlFor="company"
            error={errors.company?.message}
          >
            <Input autoComplete="organization" {...register("company")} />
          </Field>

          <Button
            type="submit"
            loading={mutation.isPending}
            disabled={!isDirty}
          >
            Save changes
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function EmailSection() {
  const { user } = useAuth();
  const [sending, setSending] = React.useState(false);

  if (!user) return null;

  const resend = async () => {
    setSending(true);
    try {
      const response = await authService.resendVerification(user.email);
      toast.success(response.message);
    } catch (error) {
      toastApiError(error, "Could not send the email.");
    } finally {
      setSending(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Email verification</CardTitle>
        <CardDescription>
          A verified address lets us reach you about your account.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {user.is_email_verified ? (
          <Alert variant="success">
            <MailCheck />
            <AlertDescription className="flex flex-wrap items-center gap-2">
              <span>{user.email} is verified.</span>
              <Badge variant="success">Verified</Badge>
            </AlertDescription>
          </Alert>
        ) : (
          <Alert variant="warning">
            <MailWarning />
            <AlertDescription className="flex flex-1 flex-wrap items-center justify-between gap-3">
              <span>{user.email} is not verified yet.</span>
              <Button
                variant="outline"
                size="sm"
                loading={sending}
                onClick={() => void resend()}
              >
                Send link
              </Button>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}

function PasswordSection() {
  const { user } = useAuth();
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      current_password: "",
      new_password: "",
      confirm_password: "",
    },
  });

  const mutation = useMutation({
    mutationFn: (values: ChangePasswordInput) =>
      authService.changePassword({
        current_password: values.current_password,
        new_password: values.new_password,
      }),
    onSuccess: () => {
      reset();
      toast.success("Password updated.");
    },
    onError: (error) => {
      if (error instanceof ApiError && error.status === 401) {
        setError("current_password", { message: error.message });
        return;
      }
      toastApiError(error);
    },
  });

  // A Google-only account has no password to change. Offer the reset flow
  // instead, which is how such a user sets a first one.
  if (user && !user.has_password) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Password</CardTitle>
          <CardDescription>
            You sign in with Google, so there&apos;s no password on this
            account.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <p className="text-muted-foreground text-sm">
            Want to sign in with an email and password as well? Use the
            password reset link — it lets you set one for the first time.
          </p>
          <Button asChild variant="outline" size="sm" className="mt-4">
            <Link href="/forgot-password">Set a password</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Change password</CardTitle>
        <CardDescription>
          You&apos;ll stay signed in on this device after changing it.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form
          onSubmit={handleSubmit((values) => mutation.mutate(values))}
          className="space-y-4"
          noValidate
        >
          <Field
            label="Current password"
            htmlFor="current_password"
            error={errors.current_password?.message}
          >
            <Input
              type="password"
              autoComplete="current-password"
              {...register("current_password")}
            />
          </Field>

          <Field
            label="New password"
            htmlFor="new_password"
            error={errors.new_password?.message}
            hint="At least 8 characters, with a letter and a number."
          >
            <Input
              type="password"
              autoComplete="new-password"
              {...register("new_password")}
            />
          </Field>

          <Field
            label="Confirm new password"
            htmlFor="confirm_password"
            error={errors.confirm_password?.message}
          >
            <Input
              type="password"
              autoComplete="new-password"
              {...register("confirm_password")}
            />
          </Field>

          <Button type="submit" loading={mutation.isPending}>
            Update password
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function DangerZone() {
  const [open, setOpen] = React.useState(false);
  const { user } = useAuth();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<DeleteAccountInput>({
    resolver: zodResolver(deleteAccountSchema),
    defaultValues: { password: "" },
  });

  // Google-only accounts have nothing to type here; the backend accepts the
  // deletion on the strength of the access token alone.
  const requiresPassword = user?.has_password !== false;

  const mutation = useMutation({
    mutationFn: (values: DeleteAccountInput) =>
      userService.remove(values.password),
    onSuccess: () => {
      // Skip the logout call — the session it would revoke is already gone.
      tokenStore.clear();
      window.location.href = "/";
    },
    onError: (error) => {
      if (error instanceof ApiError && error.status === 401) {
        setError("password", { message: error.message });
        return;
      }
      toastApiError(error);
    },
  });

  const onSubmit = handleSubmit((values) => {
    // Required-ness depends on the account, which the schema cannot see.
    if (requiresPassword && !values.password) {
      setError("password", { message: "Enter your password to confirm." });
      return;
    }
    mutation.mutate(values);
  });

  return (
    <>
      <Card className="border-destructive/40">
        <CardHeader>
          <CardTitle className="text-destructive">Delete account</CardTitle>
          <CardDescription>
            Permanently removes your account, API keys, search history and usage
            records. This cannot be undone.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Button
            variant="destructive"
            onClick={() => setOpen(true)}
            disabled={user?.role === "admin"}
          >
            Delete my account
          </Button>
          {user?.role === "admin" && (
            <p className="text-muted-foreground mt-3 text-xs">
              Administrator accounts can&apos;t be deleted from the dashboard.
            </p>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={open}
        onOpenChange={(next) => {
          if (!next) reset();
          setOpen(next);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete your account?</DialogTitle>
            <DialogDescription>
              Everything tied to {user?.email} will be erased immediately.
            </DialogDescription>
          </DialogHeader>

          <Alert variant="destructive">
            <TriangleAlert />
            <AlertDescription>
              This is permanent. There is no recovery and no export.
            </AlertDescription>
          </Alert>

          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            {requiresPassword && (
              <Field
                label="Confirm with your password"
                htmlFor="delete-password"
                error={errors.password?.message}
              >
                <Input
                  type="password"
                  autoComplete="current-password"
                  {...register("password")}
                />
              </Field>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="destructive"
                loading={mutation.isPending}
              >
                Delete permanently
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
