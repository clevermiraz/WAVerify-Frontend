"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, AtSign, Phone, Plus, Search, X } from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { useForm } from "react-hook-form";

import {
  EmailResultCard,
  EmailResultSkeleton,
} from "@/components/dashboard/email-result-card";
import { ResultCard, ResultSkeleton } from "@/components/dashboard/result-card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCheckEmail, useCheckNumber } from "@/hooks/use-api";
import { ApiError } from "@/lib/api-client";
import {
  checkSchema,
  emailCheckSchema,
  type CheckInput,
  type EmailCheckInput,
} from "@/lib/validations";
import type { CheckResult, EmailCheckResult } from "@/types/api";

const EXAMPLES = ["+8801712345678", "+14155552671", "+442071838750"];

type Mode = "phone" | "email";

export function SearchPanel() {
  const [mode, setMode] = React.useState<Mode>("phone");

  return (
    <div className="space-y-6">
      <Tabs value={mode} onValueChange={(value) => setMode(value as Mode)}>
        <TabsList>
          <TabsTrigger value="phone">
            <Phone className="size-3.5" aria-hidden />
            Phone number
          </TabsTrigger>
          <TabsTrigger value="email">
            <AtSign className="size-3.5" aria-hidden />
            Email
          </TabsTrigger>
        </TabsList>

        {/* Each panel keeps its own form and result, so switching tabs to
            compare does not throw away what the other one found. */}
        <TabsContent value="phone" className="mt-6">
          <PhoneSearch />
        </TabsContent>

        <TabsContent value="email" className="mt-6">
          <EmailSearch />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function PhoneSearch() {
  const [result, setResult] = React.useState<CheckResult | null>(null);
  const [error, setError] = React.useState<ApiError | null>(null);
  // The email is extra enrichment, so it stays out of the way until asked for.
  const [showEmail, setShowEmail] = React.useState(false);
  const check = useCheckNumber();
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    setError: setFieldError,
    clearErrors,
    reset,
    formState: { errors },
  } = useForm<CheckInput>({
    resolver: zodResolver(checkSchema),
    defaultValues: { phone: "", email: "" },
  });

  const { ref: phoneRef, ...phoneField } = register("phone");

  const onSubmit = handleSubmit((values) => {
    setError(null);
    setResult(null);

    check.mutate(
      { phone: values.phone, email: values.email || undefined },
      {
        onSuccess: setResult,
        onError: (mutationError) => {
          if (mutationError instanceof ApiError) {
            const { phone, email } = mutationError.fieldErrors;
            if (phone || email) {
              if (phone) setFieldError("phone", { message: phone });
              if (email) setFieldError("email", { message: email });
            } else if (mutationError.status === 422) {
              // A 422 with no field breakdown is still about the input; the
              // phone number is the only field always present.
              setFieldError("phone", { message: mutationError.message });
            } else {
              setError(mutationError);
            }
          } else {
            setError(
              new ApiError(
                0,
                "unknown",
                "Something went wrong. Please try again."
              )
            );
          }
        },
      }
    );
  });

  const searchAgain = React.useCallback(() => {
    setResult(null);
    setError(null);
    reset({ phone: "", email: "" });
    setShowEmail(false);
    inputRef.current?.focus();
  }, [reset]);

  const hideEmail = React.useCallback(() => {
    setShowEmail(false);
    // Clear the value too, so a hidden field can never be submitted.
    setValue("email", "");
    clearErrors("email");
  }, [clearErrors, setValue]);

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <Field
                label="Phone number"
                htmlFor="phone"
                error={errors.phone?.message}
                hint="Include the country code, e.g. +8801712345678"
                className="flex-1"
              >
                <Input
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="+8801712345678"
                  {...phoneField}
                  ref={(element) => {
                    phoneRef(element);
                    inputRef.current = element;
                  }}
                />
              </Field>

              <Button
                type="submit"
                size="lg"
                loading={check.isPending}
                className="sm:mb-6"
              >
                {!check.isPending && <Search />}
                Search
              </Button>
            </div>

            {showEmail && (
              <Field
                label="Email"
                htmlFor="email"
                optional
                error={errors.email?.message}
                hint="We check whether the address is real and can receive mail, and look it up on Gravatar."
              >
                <Input
                  type="email"
                  autoComplete="off"
                  placeholder="someone@example.com"
                  // Revealed by a click, so the caret follows it there.
                  autoFocus
                  {...register("email")}
                />
              </Field>
            )}
          </form>

          <button
            type="button"
            onClick={showEmail ? hideEmail : () => setShowEmail(true)}
            aria-expanded={showEmail}
            aria-controls="email"
            className="text-muted-foreground hover:text-foreground mt-4 flex items-center gap-1.5 text-xs transition-colors"
          >
            {showEmail ? (
              <>
                <X className="size-3.5" aria-hidden />
                Remove email
              </>
            ) : (
              <>
                <Plus className="size-3.5" aria-hidden />
                Add an email to verify it too
              </>
            )}
          </button>

          <div className="text-muted-foreground mt-4 flex flex-wrap items-center gap-2 text-xs">
            <span>Try:</span>
            {EXAMPLES.map((example) => (
              <button
                key={example}
                type="button"
                onClick={() =>
                  setValue("phone", example, { shouldValidate: true })
                }
                className="hover:bg-secondary rounded-md border px-2 py-1 font-mono transition-colors"
              >
                {example}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {check.isPending && <ResultSkeleton />}

      {error && !check.isPending && (
        <Alert variant="destructive">
          <AlertCircle />
          <AlertDescription className="space-y-2">
            <p>{error.message}</p>
            {error.code === "quota_exceeded" && (
              <Link
                href="/dashboard/billing"
                className="inline-block font-medium underline underline-offset-4"
              >
                Upgrade your plan →
              </Link>
            )}
            {/* The email tab does not touch WhatsApp, so it still works when
                the account pool is down — worth saying at the moment it fails
                rather than leaving them stuck. */}
            {error.code === "no_accounts" && (
              <p>
                Checking an email on its own is unaffected — use the Email tab
                above.
              </p>
            )}
          </AlertDescription>
        </Alert>
      )}

      {result && !check.isPending && (
        <ResultCard result={result} onSearchAgain={searchAgain} />
      )}
    </div>
  );
}

/**
 * The email on its own. Hits a route that never contacts WhatsApp, so it keeps
 * working when a number lookup cannot, and it spends no quota.
 */
function EmailSearch() {
  const [result, setResult] = React.useState<EmailCheckResult | null>(null);
  const [error, setError] = React.useState<ApiError | null>(null);
  const check = useCheckEmail();
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  const {
    register,
    handleSubmit,
    setError: setFieldError,
    reset,
    formState: { errors },
  } = useForm<EmailCheckInput>({
    resolver: zodResolver(emailCheckSchema),
    defaultValues: { email: "" },
  });

  const { ref: emailRef, ...emailField } = register("email");

  const onSubmit = handleSubmit((values) => {
    setError(null);
    setResult(null);

    check.mutate(values.email, {
      onSuccess: setResult,
      onError: (mutationError) => {
        if (mutationError instanceof ApiError) {
          // The only 422 left is a too-long address; a malformed one comes
          // back as a normal result with the problem described in it.
          if (mutationError.fieldErrors.email) {
            setFieldError("email", {
              message: mutationError.fieldErrors.email,
            });
          } else if (mutationError.status === 422) {
            setFieldError("email", { message: mutationError.message });
          } else {
            setError(mutationError);
          }
        } else {
          setError(
            new ApiError(0, "unknown", "Something went wrong. Please try again.")
          );
        }
      },
    });
  });

  const searchAgain = React.useCallback(() => {
    setResult(null);
    setError(null);
    reset({ email: "" });
    inputRef.current?.focus();
  }, [reset]);

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <Field
                label="Email address"
                htmlFor="email-only"
                error={errors.email?.message}
                hint="We check the address is well formed and its domain can receive mail."
                className="flex-1"
              >
                <Input
                  id="email-only"
                  type="email"
                  autoComplete="off"
                  placeholder="someone@example.com"
                  {...emailField}
                  ref={(element) => {
                    emailRef(element);
                    inputRef.current = element;
                  }}
                />
              </Field>

              <Button
                type="submit"
                size="lg"
                loading={check.isPending}
                className="sm:mb-6"
              >
                {!check.isPending && <Search />}
                Check email
              </Button>
            </div>
          </form>

          <p className="text-muted-foreground mt-4 text-xs">
            Checking an email does not use any of your monthly requests.
          </p>
        </CardContent>
      </Card>

      {check.isPending && <EmailResultSkeleton />}

      {error && !check.isPending && (
        <Alert variant="destructive">
          <AlertCircle />
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}

      {result && !check.isPending && (
        <EmailResultCard result={result} onSearchAgain={searchAgain} />
      )}
    </div>
  );
}
