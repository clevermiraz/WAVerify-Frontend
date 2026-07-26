import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export function Cta() {
  return (
    <section className="border-t">
      <div className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
        <div className="bg-card rounded-xl border px-8 py-14 text-center shadow-sm">
          <h2 className="text-3xl font-semibold tracking-tight text-balance">
            Start verifying in under a minute
          </h2>
          <p className="text-muted-foreground mx-auto mt-4 max-w-xl text-lg leading-relaxed text-balance">
            Create an account, generate a key, and make your first call. The
            free tier needs no card.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/register">
                Start Free
                <ArrowRight />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/docs">Read the docs</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
