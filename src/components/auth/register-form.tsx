"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import { useForm } from "react-hook-form";

import { AuthCard } from "@/components/auth/auth-card";
import { FormError } from "@/components/auth/form-error";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { ApiError } from "@/lib/api-client";
import { registerSchema, type RegisterInput } from "@/lib/validations";

export function RegisterForm() {
  const { register: createAccount } = useAuth();
  const router = useRouter();
  const [formError, setFormError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: "", password: "", full_name: "", company: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await createAccount({
        email: values.email,
        password: values.password,
        full_name: values.full_name || undefined,
        company: values.company || undefined,
      });
      router.push("/dashboard");
    } catch (error) {
      if (error instanceof ApiError) {
        for (const [field, message] of Object.entries(error.fieldErrors)) {
          setError(field as keyof RegisterInput, { message });
        }
        setFormError(
          Object.keys(error.fieldErrors).length ? null : error.message
        );
      } else {
        setFormError("Something went wrong. Please try again.");
      }
    }
  });

  return (
    <AuthCard
      title="Create your account"
      description="100 free requests every month. No card required."
      footer={
        <>
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-foreground underline underline-offset-4"
          >
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <FormError message={formError} />

        <Field
          label="Full name"
          htmlFor="full_name"
          error={errors.full_name?.message}
          optional
        >
          <Input
            autoComplete="name"
            placeholder="Jane Cooper"
            {...register("full_name")}
          />
        </Field>

        <Field label="Email" htmlFor="email" error={errors.email?.message}>
          <Input
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            {...register("email")}
          />
        </Field>

        <Field
          label="Company"
          htmlFor="company"
          error={errors.company?.message}
          optional
        >
          <Input
            autoComplete="organization"
            placeholder="Acme Inc."
            {...register("company")}
          />
        </Field>

        <Field
          label="Password"
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

        <Button type="submit" className="w-full" loading={isSubmitting}>
          Create account
        </Button>

        <p className="text-muted-foreground text-center text-xs leading-relaxed">
          By creating an account you agree to our Terms of Service and Privacy
          Policy.
        </p>
      </form>
    </AuthCard>
  );
}
