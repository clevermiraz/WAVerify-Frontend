import Link from "next/link";

import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  href?: string;
  showWordmark?: boolean;
}

/**
 * The mark: two ticks — delivered, then confirmed.
 *
 * The rear tick stops short of the front tick's descent so the pair never
 * crosses and tangles; both long arms share the same slope. The rear tick takes
 * `currentColor` so it flips with the theme, and the front tick uses the same
 * `--success` token the UI already reserves for a positive verification.
 *
 * Wide rather than square by design — for tabs and avatars use `app/icon.svg`,
 * which sets the same mark inside a tile.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 5 32 22"
      fill="none"
      className={cn("h-[1.15rem] w-auto", className)}
      aria-hidden
    >
      <path
        d="M2.8 18.2 7.9 23.3 11.2 19"
        stroke="currentColor"
        strokeWidth="3.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12.4 18.2 17.5 23.3 29 8.4"
        stroke="var(--success)"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Logo({
  className,
  href = "/",
  showWordmark = true,
}: LogoProps) {
  return (
    <Link
      href={href}
      className={cn("inline-flex items-center gap-2", className)}
    >
      <LogoMark />
      {showWordmark && (
        // Geist is loaded as a variable font, so the 620/450 pairing is real
        // rather than a snapped fallback. The weight shift explains the name.
        <span className="text-[0.95rem] leading-none tracking-[-0.03em]">
          <span className="font-[620]">WA</span>
          <span className="font-[450]">Verify</span>
        </span>
      )}
      <span className="sr-only">WAVerify home</span>
    </Link>
  );
}
