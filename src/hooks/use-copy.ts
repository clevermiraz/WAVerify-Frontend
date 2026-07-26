"use client";

import * as React from "react";
import { toast } from "sonner";

import { copyToClipboard } from "@/lib/utils";

/** Copy-to-clipboard with a short-lived "copied" state for button feedback. */
export function useCopy(resetAfterMs = 2000) {
  const [copied, setCopied] = React.useState(false);
  const timeout = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(
    () => () => {
      if (timeout.current) clearTimeout(timeout.current);
    },
    []
  );

  const copy = React.useCallback(
    async (value: string, message = "Copied to clipboard") => {
      const ok = await copyToClipboard(value);
      if (!ok) {
        toast.error("Could not copy — copy it manually instead.");
        return false;
      }

      setCopied(true);
      toast.success(message);
      if (timeout.current) clearTimeout(timeout.current);
      timeout.current = setTimeout(() => setCopied(false), resetAfterMs);
      return true;
    },
    [resetAfterMs]
  );

  return { copied, copy };
}
