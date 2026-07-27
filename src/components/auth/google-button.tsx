"use client";

import { Loader2 } from "lucide-react";
import Script from "next/script";
import { useRouter } from "next/navigation";
import * as React from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { ApiError } from "@/lib/api-client";
import type { GoogleCredentialResponse } from "@/types/google-identity";

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

/**
 * False when no client ID was baked into the build, which lets the auth forms
 * drop the Google option entirely rather than render a button that cannot work.
 */
export const isGoogleLoginEnabled = CLIENT_ID.length > 0;

const GSI_SRC = "https://accounts.google.com/gsi/client";
/** Google rejects a requested width above this. */
const MAX_BUTTON_WIDTH = 400;
/** Matches Google's `size: "large"` button so the two layers line up exactly. */
const BUTTON_HEIGHT = 40;

type ButtonText = "signin_with" | "signup_with" | "continue_with";

const LABELS: Record<ButtonText, string> = {
  signin_with: "Sign in with Google",
  signup_with: "Sign up with Google",
  continue_with: "Continue with Google",
};

interface GoogleButtonProps {
  /** Wording on the button; the flow is identical either way. */
  text?: ButtonText;
  /** Where to go once the session is established. */
  redirectTo?: string;
  onError: (message: string | null) => void;
}

/**
 * "Sign in with Google", styled to match the rest of the app.
 *
 * Google only exposes the ID-token flow through `renderButton`, which draws
 * its own iframe that cannot be restyled. So the real button is stretched over
 * this one at `opacity-0` and takes the click, while the visible layer below
 * is ours. The visible layer still follows Google's branding rules — official
 * mark, approved wording, 40px tall — which is what those rules actually
 * require; they do not require Google's own rendering.
 */
export function GoogleButton({
  text = "continue_with",
  redirectTo = "/dashboard",
  onError,
}: GoogleButtonProps) {
  const { loginWithGoogle } = useAuth();
  const router = useRouter();

  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const targetRef = React.useRef<HTMLDivElement>(null);
  const [scriptReady, setScriptReady] = React.useState(false);
  const [rendered, setRendered] = React.useState(false);
  const [pending, setPending] = React.useState(false);
  const [width, setWidth] = React.useState(0);

  // Google keeps whichever callback it was handed at `initialize` time, so the
  // live one is reached through a ref instead of being captured.
  const handleCredential = React.useCallback(
    async (response: GoogleCredentialResponse) => {
      setPending(true);
      onError(null);
      try {
        await loginWithGoogle(response.credential);
        router.push(redirectTo);
      } catch (error) {
        onError(
          error instanceof ApiError
            ? error.message
            : "Could not sign in with Google. Please try again."
        );
        setPending(false);
      }
    },
    [loginWithGoogle, onError, redirectTo, router]
  );

  const callbackRef = React.useRef(handleCredential);
  React.useEffect(() => {
    callbackRef.current = handleCredential;
  }, [handleCredential]);

  // The invisible layer has to track the visible one, or clicks land outside it.
  React.useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const measure = () => setWidth(Math.round(wrapper.offsetWidth));
    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(wrapper);
    return () => observer.disconnect();
  }, []);

  React.useEffect(() => {
    if (!scriptReady || !isGoogleLoginEnabled || width === 0) return;

    const target = targetRef.current;
    const gsi = window.google?.accounts.id;
    if (!target || !gsi) return;

    gsi.initialize({
      client_id: CLIENT_ID,
      callback: (response) => void callbackRef.current(response),
      // No One Tap: the button is an explicit action, and silent re-sign-in
      // after an explicit sign-out is hostile.
      auto_select: false,
      cancel_on_tap_outside: true,
      itp_support: true,
    });

    target.replaceChildren();

    // The styled layer is only shown once Google has actually drawn its button
    // behind it. A visible button with no working click target underneath is
    // worse than no button at all.
    let drawn = false;
    try {
      gsi.renderButton(target, {
        type: "standard",
        theme: "outline",
        size: "large",
        shape: "rectangular",
        logo_alignment: "center",
        text,
        width: Math.min(MAX_BUTTON_WIDTH, width),
      });
      drawn = target.childElementCount > 0;
    } catch {
      onError("Could not load Google sign-in. Try email and password instead.");
    }
    setRendered(drawn);
  }, [scriptReady, text, width, onError]);

  if (!isGoogleLoginEnabled) return null;

  return (
    <div
      ref={wrapperRef}
      className="group relative w-full"
      style={{ height: BUTTON_HEIGHT }}
    >
      <Script
        src={GSI_SRC}
        strategy="afterInteractive"
        // `onReady` also fires when the script is already cached from a
        // previous page, which `onLoad` alone would miss.
        onReady={() => setScriptReady(true)}
        onError={() =>
          onError("Could not reach Google. Try email and password instead.")
        }
      />

      {rendered ? (
        <div
          aria-hidden
          className="border-border bg-background text-foreground shadow-xs group-hover:bg-accent group-focus-within:ring-ring group-focus-within:ring-offset-background pointer-events-none absolute inset-0 flex items-center justify-center gap-3 rounded-lg border text-sm font-medium transition-colors group-focus-within:ring-2 group-focus-within:ring-offset-2"
        >
          <GoogleMark />
          <span>{LABELS[text]}</span>
        </div>
      ) : (
        <Skeleton className="absolute inset-0 rounded-lg" />
      )}

      {/* Google's real button: invisible, on top, and the actual click target. */}
      <div
        ref={targetRef}
        className="absolute inset-0 flex cursor-pointer justify-center overflow-hidden opacity-0"
      />

      {pending && (
        <div
          role="status"
          className="border-border bg-background text-muted-foreground absolute inset-0 flex items-center justify-center gap-2 rounded-lg border text-sm"
        >
          <Loader2 className="size-4 animate-spin" aria-hidden />
          Signing you in…
        </div>
      )}
    </div>
  );
}

/** The official Google mark. Colours and paths must not be altered. */
function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden focusable="false">
      <path
        fill="#4285F4"
        d="M17.64 9.2045c0-.6381-.0573-1.2518-.1636-1.8409H9v3.4814h4.8436c-.2086 1.125-.8427 2.0782-1.7959 2.7164v2.2581h2.9087c1.7018-1.5668 2.6836-3.874 2.6836-6.615z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.4673-.806 5.9564-2.1805l-2.9087-2.2581c-.8059.54-1.8368.859-3.0477.859-2.344 0-4.3282-1.5831-5.036-3.7104H.9573v2.3318C2.4382 15.9832 5.4818 18 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.964 10.71c-.18-.54-.2822-1.1168-.2822-1.71s.1022-1.17.2822-1.71V4.9582H.9573A8.9965 8.9965 0 0 0 0 9c0 1.4523.3477 2.8268.9573 4.0418L3.964 10.71z"
      />
      <path
        fill="#EA4335"
        d="M9 3.5795c1.3214 0 2.5077.4541 3.4405 1.346l2.5813-2.5814C13.4632.8918 11.426 0 9 0 5.4818 0 2.4382 2.0168.9573 4.9582L3.964 7.29C4.6718 5.1627 6.656 3.5795 9 3.5795z"
      />
    </svg>
  );
}

/** Visual divider between the Google button and the email form. */
export function AuthDivider() {
  return (
    <div className="flex items-center gap-3">
      <span className="bg-border h-px flex-1" />
      <span className="text-muted-foreground text-xs">or</span>
      <span className="bg-border h-px flex-1" />
    </div>
  );
}
