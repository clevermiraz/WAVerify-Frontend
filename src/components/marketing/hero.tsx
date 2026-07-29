import { ArrowRight, Check } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const SAMPLE_RESPONSE = `{
  "success": true,
  "exists": true,
  "display_name": "Acme Store",
  "name_source": "business_verified",
  "about": "Open 9-6, Sat closed",
  "business": true,
  "device_count": 2,
  "number_info": {
    "location": "Bangladesh",
    "carrier": "Grameenphone",
    "line_type": "mobile"
  },
  "response_time_ms": 214
}`;

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Decorative grid, faded out towards the edges. */}
      <div
        className="bg-grid pointer-events-none absolute inset-0 opacity-40 mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_60%,transparent_100%)]"
        aria-hidden
      />

      <div className="relative mx-auto max-w-6xl px-6 pt-20 pb-16 sm:pt-28 sm:pb-24">
        <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_1fr]">
          <div>
            <Badge variant="secondary" className="mb-6 border-border">
              <span className="bg-success size-1.5 rounded-full" aria-hidden />
              100 free requests every month
            </Badge>

            <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-[3.4rem] lg:leading-[1.08]">
              Verify WhatsApp Numbers Instantly
            </h1>

            <p className="text-muted-foreground mt-6 max-w-xl text-lg leading-relaxed text-balance">
              Fast, reliable WhatsApp number verification for developers and
              businesses.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/register">
                  Start Free
                  <ArrowRight />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/docs">API Docs</Link>
              </Button>
            </div>

            <ul className="text-muted-foreground mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm">
              {[
                "No credit card required",
                "REST API",
                "Sub-second responses",
              ].map((item) => (
                <li key={item} className="flex items-center gap-1.5">
                  <Check className="text-success size-4" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Illustrative request/response pair. */}
          <div className="bg-card rounded-xl border shadow-sm">
            <div className="flex items-center gap-2 border-b px-4 py-3">
              <span className="flex gap-1.5" aria-hidden>
                <span className="bg-border size-2.5 rounded-full" />
                <span className="bg-border size-2.5 rounded-full" />
                <span className="bg-border size-2.5 rounded-full" />
              </span>
              <span className="text-muted-foreground ml-1 font-mono text-xs">
                POST /api/v1/check
              </span>
            </div>

            <div className="space-y-4 overflow-x-auto p-5">
              <pre className="text-muted-foreground font-mono text-xs leading-relaxed">
                <code>{`curl https://api.waverify.app/api/v1/check \\
  -H "X-API-Key: wav_live_…" \\
  -d '{"phone":"+8801712345678"}'`}</code>
              </pre>

              <div className="border-t pt-4">
                <pre className="font-mono text-xs leading-relaxed">
                  <code>{SAMPLE_RESPONSE}</code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
