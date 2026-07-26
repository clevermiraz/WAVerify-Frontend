"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Search } from "lucide-react";
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
  const check = useCheckNumber();
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    setError: setFieldError,
    reset,
    formState: { errors },
  } = useForm<CheckInput>({
    resolver: zodResolver(checkSchema),
    defaultValues: { phone: "" },
  });

  const { ref: phoneRef, ...phoneField } = register("phone");

  const onSubmit = handleSubmit((values) => {
    setError(null);
    setResult(null);

    check.mutate(values.phone, {
      onSuccess: setResult,
      onError: (mutationError) => {
        if (mutationError instanceof ApiError) {
          const fieldMessage = mutationError.fieldErrors.phone;
          if (fieldMessage) {
            setFieldError("phone", { message: fieldMessage });
          } else if (mutationError.status === 422) {
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
    });
  });

  const searchAgain = React.useCallback(() => {
    setResult(null);
    setError(null);
    reset({ phone: "" });
    inputRef.current?.focus();
  }, [reset]);

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <form
            onSubmit={onSubmit}
            className="flex flex-col gap-3 sm:flex-row sm:items-end"
            noValidate
          >
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
          </form>

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
