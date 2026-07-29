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
  API_BASE_URL,
  CHECK_SAMPLES,
  CHECK_WITH_EMAIL_SAMPLE,
  EMAIL_INFO_FIELDS,
  EMAIL_INFO_INVALID_RESPONSE,
  EMAIL_INFO_RESPONSE,
  EMAIL_STATUSES,
  ERROR_CODES,
  ERROR_RESPONSE,
  GRAVATAR_FIELDS,
  GRAVATAR_RESPONSE,
  LINE_TYPES,
  NOT_FOUND_RESPONSE,
  NUMBER_INFO_FIELDS,
  RESPONSE_FIELDS,
  SUCCESS_RESPONSE,
} from "@/lib/code-samples";

export const metadata: Metadata = {
  title: "API Documentation",
  description:
    "How to use the WAVerify API: get a key, check a phone number, and understand the answer.",
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
              You send a phone number. We tell you if it has a WhatsApp
              account, plus what we know about the number. That is the whole
              API.
            </p>
          </header>

          <Section id="quickstart" title="Start here">
            <p>Three steps to your first result:</p>
            <ol className="mt-4 ml-5 list-decimal space-y-2">
              <li>Create a free account.</li>
              <li>Make an API key in your dashboard.</li>
              <li>Send your first request.</li>
            </ol>
            <p className="mt-4">
              Every request needs an API key. There is no way to use the API
              without one.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Button asChild size="sm">
                <Link href="/register">Create an account</Link>
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link href="/dashboard/api-keys">Make a key</Link>
              </Button>
            </div>
          </Section>

          <Section id="base-url" title="Base URL">
            <p>Send all requests to this address:</p>
            <CodeBlock className="mt-5" code={API_BASE_URL} />
            <p className="mt-4">
              Add the path to the end. For example, the check endpoint is{" "}
              <Code>{`${API_BASE_URL}/api/v1/check`}</Code>.
            </p>
            <p className="mt-4">
              Always use <Code>https</Code>. Plain <Code>http</Code> does not
              work.
            </p>
          </Section>

          <Section id="authentication" title="Your API key">
            <p>
              Send your key in a header called <Code>X-API-Key</Code>:
            </p>
            <CodeBlock
              className="mt-5"
              code={`X-API-Key: wav_live_xxxxxxxxxxxxxxxxxxxxxxxx`}
            />
            <p className="mt-4">
              You see the full key only once — when you create it. We do not
              keep a copy, so we cannot show it to you again. Save it somewhere
              safe straight away.
            </p>
            <p className="mt-4">
              Keep the key in an environment variable. Do not write it directly
              in your code, and do not upload it to GitHub. If someone else
              gets your key, delete it in the dashboard and make a new one.
            </p>
            <p className="mt-4">
              If you are signed in to the dashboard, your session uses a
              short-lived Bearer token instead of a key. Both work on the same
              endpoint. We record which one you used for each request.
            </p>
          </Section>

          <Section id="check" title="Check a number">
            <p className="flex flex-wrap items-center gap-2">
              <Badge>POST</Badge>
              <Code>/api/v1/check</Code>
            </p>
            <p className="mt-4">
              Send one phone number. Write it in international format: a{" "}
              <Code>+</Code> sign, then the country code, then the number.
            </p>
            <p className="mt-4">
              Spaces, dashes and brackets are fine — we remove them for you. A
              number without a country code is rejected. We never guess the
              country.
            </p>

            <h3 className="mt-8 mb-3 font-medium">What you send</h3>
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
                    Required. International format, for example{" "}
                    <Code>+8801712345678</Code>.
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono text-xs">email</TableCell>
                  <TableCell className="text-muted-foreground font-mono text-xs">
                    string
                  </TableCell>
                  <TableCell className="text-sm">
                    Optional. If you know an email for this person, send it and
                    we check whether it is a real, working address — and look it
                    up on Gravatar. Leave it out and nothing changes.
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>

            <h3 className="mt-8 mb-3 font-medium">Example request</h3>
            <CodeTabs samples={CHECK_SAMPLES} />

            <h3 className="mt-8 mb-3 font-medium">With an email</h3>
            <p className="mb-3">
              The email is extra. It never changes the WhatsApp part of the
              answer. A bad email does not fail the request either: you still
              get status <Code>200</Code>, with the problem described in{" "}
              <Code>email_info</Code>. See <Code>Email lookup</Code> below.
            </p>
            <CodeBlock code={CHECK_WITH_EMAIL_SAMPLE} />
          </Section>

          <Section id="responses" title="What you get back">
            <h3 className="mb-3 font-medium">The number is on WhatsApp</h3>
            <CodeBlock code={SUCCESS_RESPONSE} language="200 OK" />

            <h3 className="mt-8 mb-3 font-medium">
              The number is not on WhatsApp
            </h3>
            <p className="mb-3">
              This is still a successful request. You get status{" "}
              <Code>200</Code> with <Code>exists: false</Code>, and it uses one
              request from your monthly total.
            </p>
            <CodeBlock code={NOT_FOUND_RESPONSE} language="200 OK" />

            <h3 className="mt-8 mb-3 font-medium">Fields in the answer</h3>
            <FieldTable fields={RESPONSE_FIELDS} />

            <h3 className="mt-8 mb-3 font-medium">Names, and why they are missing</h3>
            <p>
              Business accounts give you a real name. Personal accounts almost
              never do: WhatsApp does not show a personal name to someone who
              is not a contact. So <Code>display_name</Code> is usually{" "}
              <Code>null</Code> for a normal person.
            </p>
            <p className="mt-4">
              This is not an error. Do not show it to your users as one. Use{" "}
              <Code>name_source</Code> to explain what you did get.
            </p>
            <p className="mt-4">
              <Code>about</Code> and <Code>profile_photo</Code> do come back
              for personal accounts, as long as the person kept the normal
              privacy setting. They are <Code>null</Code> if the person hid
              them.
            </p>

            <h3 className="mt-8 mb-3 font-medium">Profile pictures expire</h3>
            <p>
              <Code>profile_photo</Code> is a WhatsApp link that stops working
              after a few hours. Do not save the link. If you need the picture,
              download it and keep your own copy.
            </p>
            <p className="mt-4">
              To spot a new picture without downloading anything, save{" "}
              <Code>profile_photo_id</Code> and compare it next time.
            </p>
          </Section>

          <Section id="number-info" title="Number details">
            <p>
              Every answer has a <Code>number_info</Code> object. It comes from
              the number itself, not from WhatsApp, so it is filled in even
              when <Code>exists</Code> is <Code>false</Code>.
            </p>
            <div className="mt-6">
              <FieldTable fields={NUMBER_INFO_FIELDS} />
            </div>

            <h3 className="mt-8 mb-3 font-medium">Values for line_type</h3>
            <div className="flex flex-wrap gap-2">
              {LINE_TYPES.map((type) => (
                <Code key={type}>{type}</Code>
              ))}
            </div>
          </Section>

          <Section id="gravatar" title="Email lookup">
            <p>
              Send an <Code>email</Code> and you get two things back:{" "}
              <Code>email_info</Code>, our verdict on the address itself, and{" "}
              <Code>gravatar</Code>, the public profile behind it.
            </p>

            <h3 className="mt-8 mb-3 font-medium">Is the email real?</h3>
            <p>
              We check two things without ever sending a message: the address
              is written correctly, and its domain publishes somewhere to
              deliver mail.
            </p>
            <p className="mt-4">
              That is as far as anyone can honestly go. The only way to prove
              one exact mailbox exists is to try to send to it, which gets the
              sender blocked, so we do not do it. Read{" "}
              <Code>deliverable</Code> as “this domain accepts mail”, not “this
              person exists”.
            </p>
            <CodeBlock className="mt-5" code={EMAIL_INFO_RESPONSE} />

            <h3 className="mt-8 mb-3 font-medium">A bad email is not an error</h3>
            <p>
              You still get status <Code>200</Code>, and the WhatsApp part of
              the answer is unaffected. The problem is described in{" "}
              <Code>email_info</Code> instead.
            </p>
            <CodeBlock
              className="mt-5"
              code={EMAIL_INFO_INVALID_RESPONSE}
              language="200 OK"
            />

            <h3 className="mt-8 mb-3 font-medium">
              <Code>deliverable</Code> has three values
            </h3>
            <p>
              <Code>true</Code> and <Code>false</Code> mean what you expect.{" "}
              <Code>null</Code> means we could not find out — usually the
              domain lookup timed out.
            </p>
            <p className="mt-4">
              <Code>null</Code> is not <Code>false</Code>. If your code does{" "}
              <Code>if (!deliverable)</Code> it will call good addresses bad
              whenever a lookup is slow. Check the three cases separately.
            </p>

            <div className="mt-6">
              <FieldTable fields={EMAIL_INFO_FIELDS} />
            </div>

            <h3 className="mt-8 mb-3 font-medium">Values for status</h3>
            <div className="flex flex-wrap gap-2">
              {EMAIL_STATUSES.map((status) => (
                <Code key={status}>{status}</Code>
              ))}
            </div>
            <p className="mt-4">
              <Code>disposable</Code> wins over <Code>valid</Code> when both
              apply. Those addresses do receive mail — that is exactly why they
              are worth flagging.
            </p>

            <h3 className="mt-8 mb-3 font-medium">Gravatar profile</h3>
            <p>
              We also look the address up on Gravatar and put any public
              profile in <Code>gravatar</Code>.
            </p>
            <p className="mt-4">
              Most emails have no Gravatar profile, so expect <Code>null</Code>{" "}
              often. It is also <Code>null</Code> when you sent no email, or
              when the address was too malformed to look up.
            </p>
            <CodeBlock className="mt-5" code={GRAVATAR_RESPONSE} />
            <p className="mt-5">
              Every field inside can be <Code>null</Code> — people fill in only
              what they want to.
            </p>
            <div className="mt-6">
              <FieldTable fields={GRAVATAR_FIELDS} />
            </div>
          </Section>

          <Section id="errors" title="Errors">
            <p>
              Every error looks the same. In your code, check{" "}
              <Code>error.code</Code>. Do not check the message text — the
              wording can change, but the code will not.
            </p>
            <CodeBlock
              className="mt-5"
              code={ERROR_RESPONSE}
              language="402 Payment Required"
            />

            <h3 className="mt-8 mb-3 font-medium">List of error codes</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>What it means</TableHead>
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

          <Section id="rate-limits" title="Limits">
            <p>There are two separate limits. Please plan for both.</p>

            <h3 className="mt-6 mb-3 font-medium">1. Requests per minute</h3>
            <p>
              Free: 10. Starter: 60. Pro: 300. Enterprise: your own limit.
            </p>
            <p className="mt-3">
              If you go over, you get status <Code>429</Code> with the code{" "}
              <Code>rate_limit_exceeded</Code>. Wait a short time, then send the
              request again.
            </p>

            <h3 className="mt-6 mb-3 font-medium">2. Requests per month</h3>
            <p>
              Each plan includes a number of requests per month. When you use
              them all, you get status <Code>402</Code> with the code{" "}
              <Code>quota_exceeded</Code>. You can upgrade your plan at any
              time.
            </p>
            <p className="mt-3">
              If you check the same number twice in a short time, the second
              answer comes from our saved results and is marked{" "}
              <Code>cached: true</Code>. It is faster, but it still counts
              towards your monthly total.
            </p>
          </Section>

          <Section id="help" title="Need help?">
            <p>
              This page is the full reference. There is one endpoint, and
              everything it can return is listed above.
            </p>
            <p className="mt-4">
              If something does not work the way this page describes, email{" "}
              <a
                className="text-foreground underline underline-offset-4"
                href="mailto:support@waverify.app"
              >
                support@waverify.app
              </a>
              . Please include the <Code>error.code</Code> you received and the
              time of the request — that is enough for us to find it in our
              logs.
            </p>
          </Section>
        </main>
      </div>

      <SiteFooter />
    </div>
  );
}

interface FieldRow {
  name: string;
  type: string;
  description: string;
}

/** Shared shape for the three "fields in this object" reference tables. */
function FieldTable({ fields }: { fields: FieldRow[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Field</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Description</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {fields.map((field) => (
          <TableRow key={field.name}>
            <TableCell className="font-mono text-xs whitespace-nowrap">
              {field.name}
            </TableCell>
            <TableCell className="text-muted-foreground font-mono text-xs whitespace-nowrap">
              {field.type}
            </TableCell>
            <TableCell className="text-sm">{field.description}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
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
