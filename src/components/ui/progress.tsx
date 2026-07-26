import { cn } from "@/lib/utils";

interface ProgressProps extends React.ComponentProps<"div"> {
  value: number;
  max?: number;
  indicatorClassName?: string;
  label?: string;
}

function Progress({
  value,
  max = 100,
  className,
  indicatorClassName,
  label,
  ...props
}: ProgressProps) {
  const percent = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;

  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(percent)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className={cn(
        "bg-muted h-2 w-full overflow-hidden rounded-full",
        className
      )}
      {...props}
    >
      <div
        className={cn(
          "bg-primary h-full rounded-full transition-[width]",
          indicatorClassName
        )}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}

export { Progress };
