"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Plus, Search, X } from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { useForm } from "react-hook-form";

import { ResultCard, ResultSkeleton } from "@/components/dashboard/result-card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useCheckNumber } from "@/hooks/use-api";
import { ApiError } from "@/lib/api-client";
import { checkSchema, type CheckInput } from "@/lib/validations";
import type { CheckResult } from "@/types/api";

const EXAMPLES = ["+8801712345678", "+14155552671", "+442071838750"];

export function SearchPanel() {
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
                hint="If you know an email for this person, we also look it up on Gravatar."
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
                Add an email for more details
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
          </AlertDescription>
        </Alert>
      )}

      {result && !check.isPending && (
        <ResultCard result={result} onSearchAgain={searchAgain} />
      )}
    </div>
  );
}
