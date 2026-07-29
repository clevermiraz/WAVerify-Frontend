"use client";

/**
 * Presentation shared by the two places a lookup is shown: the live result
 * card and the history detail dialog. The two payloads differ in shape and in
 * which fields exist at all, so only the pieces that are genuinely identical —
 * the `number_info`, `email_info` and `gravatar` blocks, and the layout
 * primitives — live here.
 */

import {
  ExternalLink,
  Globe,
  MailCheck,
  MailX,
  UserRound,
} from "lucide-react";
import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { EmailInfo, GravatarProfile, NumberInfo } from "@/types/api";

/** Human wording for the documented `name_source` values. */
export const NAME_SOURCES: Record<string, string> = {
  business_verified: "Verified business",
  business_name: "Business name",
  contact_name: "Contact name",
};

/** Human wording for the documented `line_type` values. */
const LINE_TYPES: Record<string, string> = {
  mobile: "Mobile",
  fixed_line: "Landline",
  fixed_line_or_mobile: "Landline or mobile",
  toll_free: "Toll free",
  premium_rate: "Premium rate",
  shared_cost: "Shared cost",
  personal_number: "Personal number",
  pager: "Pager",
  uan: "Universal access number",
  voicemail: "Voicemail",
  unknown: "Unknown",
};

/** Turn an unrecognised backend value into something readable. */
export function humanise(value: string) {
  return value.replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase());
}

/**
 * Links and images come from third parties (WhatsApp, Gravatar), so only
 * plain web URLs are ever handed to the browser.
 */
export function webUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? value : null;
  } catch {
    return null;
  }
}

export function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-6 border-t pt-6">
      <h3 className="text-muted-foreground text-xs tracking-wide uppercase">
        {title}
      </h3>
      <dl className="mt-4 grid gap-5 sm:grid-cols-3">{children}</dl>
    </section>
  );
}

export function Detail({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <dt className="text-muted-foreground text-xs tracking-wide uppercase">
        {label}
      </dt>
      <dd className="mt-1.5 text-sm font-medium wrap-break-word">{children}</dd>
    </div>
  );
}

export function Muted({ children }: { children: React.ReactNode }) {
  return <span className="text-muted-foreground font-normal">{children}</span>;
}

export function Unknown() {
  return <Muted>Unknown</Muted>;
}

/** Derived from the number alone, so it is filled in even with no account. */
export function NumberDetails({ info }: { info: NumberInfo }) {
  const place = [info.location, info.region && `(${info.region})`]
    .filter(Boolean)
    .join(" ");

  return (
    <Section title="About this number">
      <Detail label="Country">
        {place ? (
          <span className="flex items-center gap-1.5">
            <Globe className="size-3.5" aria-hidden />
            {place}
          </span>
        ) : (
          <Unknown />
        )}
      </Detail>

      <Detail label="Carrier">{info.carrier ?? <Unknown />}</Detail>

      <Detail label="Line type">
        {LINE_TYPES[info.line_type] ?? humanise(info.line_type)}
      </Detail>

      <Detail label="Time zone">
        {info.timezones.length > 0 ? info.timezones.join(", ") : <Unknown />}
      </Detail>

      <Detail label="International">
        {info.international_format ? (
          <span className="font-mono">{info.international_format}</span>
        ) : (
          <Unknown />
        )}
      </Detail>

      <Detail label="National">
        {info.national_format ? (
          <span className="font-mono">{info.national_format}</span>
        ) : (
          <Unknown />
        )}
      </Detail>
    </Section>
  );
}

/**
 * How each `email_info.status` is worded and coloured.
 *
 * `disposable` is amber rather than red on purpose: those addresses receive
 * mail perfectly well, so calling them broken would be wrong — they are a
 * caution, not a failure. `unknown` is neutral for the same reason in
 * reverse: it says nothing about the address, only about our check.
 */
const EMAIL_STATUSES: Record<
  string,
  { label: string; variant: "success" | "warning" | "destructive" | "muted" }
> = {
  valid: { label: "Looks good", variant: "success" },
  invalid_syntax: { label: "Not a valid address", variant: "destructive" },
  domain_not_found: { label: "Domain does not exist", variant: "destructive" },
  no_mail_server: { label: "Cannot receive mail", variant: "destructive" },
  disposable: { label: "Throwaway address", variant: "warning" },
  unknown: { label: "Could not check", variant: "muted" },
};

/**
 * Text colour for an `email_info.status`, for the compact places that show the
 * address without room for a badge. Anything unproblematic stays muted so a
 * list is not covered in colour.
 */
export function emailStatusTone(status: string): string {
  const variant = EMAIL_STATUSES[status]?.variant;
  if (variant === "destructive") return "text-destructive";
  if (variant === "warning") return "text-warning";
  return "text-muted-foreground";
}

/**
 * The backend's verdict on the email that was searched with.
 *
 * `deliverable` is deliberately read as three states. A null means the DNS
 * check could not be completed, which is our problem, not the address's —
 * showing it as "no" would accuse a perfectly good email.
 */
export function EmailDetails({ info }: { info: EmailInfo }) {
  const status = EMAIL_STATUSES[info.status] ?? {
    label: humanise(info.status),
    variant: "muted" as const,
  };

  // Neither is a fault, so they are listed as plain facts rather than warnings.
  const traits = [
    info.role_account && "Shared or automated mailbox",
    info.free_provider && "Consumer email provider",
  ].filter(Boolean) as string[];

  return (
    <section className="mt-6 border-t pt-6">
      <div className="flex flex-wrap items-center gap-3">
        <h3 className="text-muted-foreground text-xs tracking-wide uppercase">
          Email
        </h3>
        <Badge variant={status.variant}>{status.label}</Badge>
      </div>

      <p className="mt-3 font-mono text-sm break-all">{info.email}</p>

      {info.reason && (
        <p className="text-muted-foreground mt-1.5 text-sm">{info.reason}</p>
      )}

      <dl className="mt-5 grid gap-5 sm:grid-cols-3">
        <Detail label="Can receive mail">
          {info.deliverable === true ? (
            <span className="flex items-center gap-1.5">
              <MailCheck className="size-3.5" aria-hidden />
              Yes
            </span>
          ) : info.deliverable === false ? (
            <span className="flex items-center gap-1.5">
              <MailX className="size-3.5" aria-hidden />
              No
            </span>
          ) : (
            // Not "No" — we did not find out.
            <Muted>Could not check</Muted>
          )}
        </Detail>

        <Detail label="Domain">
          {info.domain ? (
            <span className="font-mono">{info.domain}</span>
          ) : (
            <Unknown />
          )}
        </Detail>

        <Detail label="Mail server">
          {info.mx_hosts.length > 0 ? (
            <span className="font-mono break-all">{info.mx_hosts[0]}</span>
          ) : (
            <Muted>None</Muted>
          )}
        </Detail>

        {traits.length > 0 && (
          <Detail label="Also worth knowing" className="sm:col-span-3">
            {traits.join(" · ")}
          </Detail>
        )}
      </dl>
    </section>
  );
}

/** Public Gravatar profile, shown only when an email was searched with. */
export function GravatarDetails({ profile }: { profile: GravatarProfile }) {
  const avatar = webUrl(profile.avatar_url);
  const profileUrl = webUrl(profile.profile_url);
  const role = [profile.job_title, profile.company].filter(Boolean).join(" · ");
  const accounts = profile.verified_accounts.filter((account) =>
    webUrl(account.url)
  );

  return (
    <section className="mt-6 border-t pt-6">
      <h3 className="text-muted-foreground text-xs tracking-wide uppercase">
        Gravatar profile
      </h3>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        {avatar && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatar}
            alt=""
            className="bg-muted size-10 shrink-0 rounded-full border object-cover"
          />
        )}

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">
            {profile.display_name ?? "Name not set"}
            {profile.pronouns && (
              <span className="text-muted-foreground ml-1.5 font-normal">
                ({profile.pronouns})
              </span>
            )}
          </p>
          {role && (
            <p className="text-muted-foreground truncate text-xs">{role}</p>
          )}
        </div>

        {profileUrl && (
          <a
            href={profileUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-xs transition-colors"
          >
            View profile
            <ExternalLink className="size-3.5" aria-hidden />
          </a>
        )}
      </div>

      {(profile.location || profile.about) && (
        <dl className="mt-5 grid gap-5 sm:grid-cols-3">
          {profile.location && (
            <Detail label="Location">{profile.location}</Detail>
          )}
          {profile.about && (
            <Detail label="About" className="sm:col-span-2">
              {profile.about}
            </Detail>
          )}
        </dl>
      )}

      {accounts.length > 0 && (
        <div className="mt-5">
          <p className="text-muted-foreground text-xs tracking-wide uppercase">
            Verified accounts
          </p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {accounts.map((account) => (
              <li key={`${account.service}-${account.url}`}>
                <a
                  href={account.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="hover:bg-secondary flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs transition-colors"
                >
                  {account.service}
                  <ExternalLink className="size-3" aria-hidden />
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

function initials(name: string | null): string | null {
  if (!name?.trim()) return null;
  const parts = name.trim().split(/\s+/);
  return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
}

/**
 * WhatsApp photo URLs expire within hours, so a stored one from history has
 * usually died by the time it is rendered — hence the fallback underneath
 * rather than beside it.
 */
export function ProfileAvatar({
  name,
  photo,
  exists,
  className,
}: {
  name: string | null;
  photo: string | null;
  exists: boolean;
  className?: string;
}) {
  // The failing URL is stored rather than a flag, so a new photo is tried
  // again instead of inheriting the last one's failure.
  const [failedSrc, setFailedSrc] = React.useState<string | null>(null);
  const src = webUrl(photo);
  const label = initials(name);
  const failed = src !== null && src === failedSrc;

  return (
    <div
      className={cn(
        "relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-full border",
        exists ? "bg-success-muted" : "bg-muted",
        className
      )}
    >
      {/* Rendered underneath the photo rather than instead of it, so a slow
          or blocked image never leaves an empty circle. */}
      {exists && label ? (
        <span className="text-success text-sm font-semibold">{label}</span>
      ) : (
        <UserRound
          className={cn(
            "size-6",
            exists ? "text-success" : "text-muted-foreground"
          )}
          aria-hidden
        />
      )}

      {exists && src && !failed && (
        // A plain <img>: the URL comes from the provider at runtime, is not a
        // known remote pattern, and expires within hours — so next/image can
        // neither optimise nor cache it.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt=""
          className="absolute inset-0 size-full object-cover"
          onError={() => setFailedSrc(src)}
        />
      )}
    </div>
  );
}
