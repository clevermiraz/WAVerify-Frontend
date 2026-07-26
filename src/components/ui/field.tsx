import * as React from "react";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FieldProps {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  optional?: boolean;
  className?: string;
  children: React.ReactNode;
}

/**
 * Label + control + error message, wired for screen readers.
 *
 * Every form in the app uses this so validation feedback is announced
 * consistently rather than being styled ad hoc per page.
 */
function Field({
  label,
  htmlFor,
  error,
  hint,
  optional,
  className,
  children,
}: FieldProps) {
  const errorId = `${htmlFor}-error`;
  const hintId = `${htmlFor}-hint`;

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-baseline justify-between gap-2">
        <Label htmlFor={htmlFor}>{label}</Label>
        {optional && (
          <span className="text-muted-foreground text-xs">Optional</span>
        )}
      </div>

      {React.isValidElement(children)
        ? React.cloneElement(
            children as React.ReactElement<Record<string, unknown>>,
            {
              id: htmlFor,
              "aria-invalid": error ? true : undefined,
              "aria-describedby":
                [error ? errorId : null, hint ? hintId : null]
                  .filter(Boolean)
                  .join(" ") || undefined,
            }
          )
        : children}

      {hint && !error && (
        <p id={hintId} className="text-muted-foreground text-xs">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="text-destructive text-xs">
          {error}
        </p>
      )}
    </div>
  );
}

export { Field };
