import type { LucideIcon } from "lucide-react";
import * as React from "react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <span
        className="bg-secondary text-muted-foreground mb-4 inline-flex size-11 items-center justify-center rounded-full border"
        aria-hidden
      >
        <Icon className="size-5" />
      </span>
      <h3 className="font-medium">{title}</h3>
      <p className="text-muted-foreground mt-1.5 max-w-sm text-sm leading-relaxed">
        {description}
      </p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
