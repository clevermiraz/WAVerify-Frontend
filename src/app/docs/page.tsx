import type { Metadata } from "next";
import Link from "next/link";

import { CodeBlock } from "@/components/docs/code-block";
import { CodeTabs } from "@/components/docs/code-tabs";
import { DocsNav } from "@/components/docs/docs-nav";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CHECK_SAMPLES,
  ERROR_CODES,
  ERROR_RESPONSE,
  NOT_FOUND_RESPONSE,
  RESPONSE_FIELDS,
  SUCCESS_RESPONSE,
} from "@/lib/code-samples";

export const metadata: Metadata = {
  title: "API Documentation",
  description:
    "REST API reference for WAVerify: authenticate, check a number, and handle errors.",
};

export default function DocsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <div className="mx-auto flex w-full max-w-6xl flex-1 gap-12 px-6 py-12">
        <DocsNav />

        <main id="main" className="min-w-0 flex-1">
          <header>
            <Badge variant="secondary" className="border-border mb-4">
              v1
            </Badge>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              API Documentation
            </h1>
            <p className="text-muted-foreground mt-4 text-lg leading-relaxed">
              One endpoint, predictable JSON, and errors you can branch on.
            </p>
          </header>

          <Section id="quickstart" title="Quickstart">
            <p>
              Create an account, generate an API key in the dashboard, then make
              your first request. Every call needs a key — there is no
              unauthenticated tier.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Button asChild size="sm">
                <Link href="/register">Create an account</Link>
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link href="/dashboard/api-keys">Generate a key</Link>
              </Button>
            </div>
          </Section>

          <Section id="authentication" title="Authentication">
            <p>
              Pass your key in the <Code>X-API-Key</Code> header. Keys are shown
              once at creation and stored only as a hash, so keep them in an
              environment variable and never commit them.
            </p>
            <CodeBlock
              className="mt-5"
              code={`X-API-Key: wav_live_xxxxxxxxxxxxxxxxxxxxxxxx`}
            />
            <p className="mt-4">
              Dashboard sessions use a short-lived Bearer access token instead.
              Both credentials reach the same endpoint; the API records which
              one made each request.
            </p>
          </Section>

          <Section id="check" title="Check a number">
            <p className="flex flex-wrap items-center gap-2">
              <Badge>POST</Badge>
              <Code>/api/v1/check</Code>
            </p>
            <p className="mt-4">
              Send a phone number in international format. Spaces, dashes and
              brackets are accepted and stripped; a number without a country
              code is rejected rather than guessed at.
            </p>

            <h3 className="mt-8 mb-3 font-medium">Request body</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Field</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-mono text-xs">phone</TableCell>
                  <TableCell className="text-muted-foreground font-mono text-xs">
                    string
                  </TableCell>
                  <TableCell className="text-sm">
                    Required. E.164 format, e.g. <Code>+8801712345678</Code>.
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>

            <h3 className="mt-8 mb-3 font-medium">Example request</h3>
            <CodeTabs samples={CHECK_SAMPLES} />
          </Section>

          <Section id="responses" title="Responses">
            <h3 className="mb-3 font-medium">Number found</h3>
            <CodeBlock code={SUCCESS_RESPONSE} language="200 OK" />

            <h3 className="mt-8 mb-3 font-medium">Number not on WhatsApp</h3>
            <p className="mb-3">
              A number with no account is still a successful lookup — it returns
              200 with <Code>exists: false</Code>, and it consumes one request.
            </p>
            <CodeBlock code={NOT_FOUND_RESPONSE} language="200 OK" />

            <h3 className="mt-8 mb-3 font-medium">Response fields</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Field</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {RESPONSE_FIELDS.map((field) => (
                  <TableRow key={field.name}>
                    <TableCell className="font-mono text-xs whitespace-nowrap">
                      {field.name}
                    </TableCell>
                    <TableCell className="text-muted-foreground font-mono text-xs whitespace-nowrap">
                      {field.type}
                    </TableCell>
                    <TableCell className="text-sm">
                      {field.description}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Section>

          <Section id="errors" title="Errors">
            <p>
              Every non-2xx response uses the same envelope, so you can branch
              on <Code>error.code</Code> without parsing prose.
            </p>
            <CodeBlock
              className="mt-5"
              code={ERROR_RESPONSE}
              language="402 Payment Required"
            />

            <h3 className="mt-8 mb-3 font-medium">Error codes</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Meaning</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ERROR_CODES.map((error) => (
                  <TableRow key={error.code}>
                    <TableCell className="font-mono text-xs">
                      {error.status}
                    </TableCell>
                    <TableCell className="font-mono text-xs whitespace-nowrap">
                      {error.code}
                    </TableCell>
                    <TableCell className="text-sm">
                      {error.description}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Section>

          <Section id="rate-limits" title="Rate limits">
            <p>
              Limits are per minute and set by your plan: 10 on Free, 60 on
              Starter, 300 on Pro, and custom on Enterprise. Exceeding one
              returns <Code>429</Code> with the <Code>rate_limit_exceeded</Code>{" "}
              code — back off and retry.
            </p>
            <p className="mt-4">
              Separately, each plan has a monthly request quota. Repeat lookups
              of the same number inside the cache window are marked{" "}
              <Code>cached: true</Code> and still count towards it.
            </p>
          </Section>

          <Section id="openapi" title="OpenAPI schema">
            <p>
              The API publishes a machine-readable schema you can feed into a
              client generator or import into Postman or Insomnia.
            </p>
            <CodeBlock className="mt-5" code={`GET /openapi.json`} />
            <p className="mt-4">
              Interactive docs are served at <Code>/docs</Code> and{" "}
              <Code>/redoc</Code> on the API host.
            </p>
          </Section>
        </main>
      </div>

      <SiteFooter />
    </div>
  );
}

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 border-t py-10">
      <h2 className="mb-4 text-2xl font-semibold tracking-tight">{title}</h2>
      <div className="text-muted-foreground [&_p]:leading-relaxed">
        {children}
      </div>
    </section>
  );
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.8125rem]">
      {children}
    </code>
  );
}
