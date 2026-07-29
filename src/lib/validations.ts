/** Zod schemas shared by every form. Mirrors the backend's rules. */

import { z } from "zod";

const password = z
  .string()
  .min(8, "Use at least 8 characters.")
  .max(72, "Use at most 72 characters.")
  .refine((value) => /[a-zA-Z]/.test(value), "Include at least one letter.")
  .refine((value) => /\d/.test(value), "Include at least one number.");

const email = z.email("Enter a valid email address.").max(320);

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Enter your password."),
});

export const registerSchema = z.object({
  email,
  password,
  full_name: z.string().max(150).optional(),
  company: z.string().max(150).optional(),
});

export const forgotPasswordSchema = z.object({ email });

export const resetPasswordSchema = z
  .object({
    password,
    confirm_password: z.string(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords do not match.",
    path: ["confirm_password"],
  });

export const changePasswordSchema = z
  .object({
    current_password: z.string().min(1, "Enter your current password."),
    new_password: password,
    confirm_password: z.string(),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Passwords do not match.",
    path: ["confirm_password"],
  });

export const profileSchema = z.object({
  full_name: z.string().max(150).optional(),
  company: z.string().max(150).optional(),
  profile_image_url: z.string().url("Enter a valid URL.").optional().or(z.literal("")),
});

/**
 * Password is optional at the schema level because a Google-only account has
 * none. The form requires it when the account actually has a password —
 * conditional on data the schema cannot see.
 */
export const deleteAccountSchema = z.object({
  password: z.string().optional(),
});

export const apiKeySchema = z.object({
  name: z
    .string()
    .min(1, "Give the key a name.")
    .max(80, "Use at most 80 characters."),
});

/**
 * Phone validation is intentionally permissive here — the backend does the
 * authoritative libphonenumber check. The client only catches obviously
 * malformed input so a request is not wasted.
 */
export const checkSchema = z.object({
  phone: z
    .string()
    .trim()
    .min(7, "Enter a full number including the country code.")
    .max(20, "That number is too long.")
    .regex(/^\+?[\d\s\-()]+$/, "Only digits, spaces and + - ( ) are allowed."),
  /**
   * Optional, and deliberately not checked for shape — same reasoning as
   * `phone`. The backend now verifies the address itself and reports the
   * verdict in `email_info`, so rejecting a typo here would suppress the very
   * answer the user asked for. It would also block the phone lookup, which is
   * the part they actually came for. An empty field means "not supplied".
   */
  email: z.string().trim().max(254, "That email is too long.").optional(),
});

/**
 * The standalone email check. Only emptiness is caught here — the shape is
 * the backend's answer to give, and rejecting it locally would hide the very
 * verdict the user asked for.
 */
export const emailCheckSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Enter an email address.")
    .max(254, "That email is too long."),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type DeleteAccountInput = z.infer<typeof deleteAccountSchema>;
export type ApiKeyInput = z.infer<typeof apiKeySchema>;
export type CheckInput = z.infer<typeof checkSchema>;
export type EmailCheckInput = z.infer<typeof emailCheckSchema>;
