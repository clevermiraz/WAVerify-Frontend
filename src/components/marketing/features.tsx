import {
  BarChart3,
  Building2,
  KeyRound,
  ShieldCheck,
  Terminal,
  Zap,
} from "lucide-react";

const FEATURES = [
  {
    icon: Zap,
    title: "Instant results",
    description:
      "Lookups return in well under a second, with recent results served from cache so repeat checks are effectively free.",
  },
  {
    icon: Terminal,
    title: "One clean endpoint",
    description:
      "A single POST returns everything: existence, profile details, and the country, carrier and line type behind the number.",
  },
  {
    icon: Building2,
    title: "Business detection",
    description:
      "Tell WhatsApp Business accounts apart from personal ones so you can route conversations correctly.",
  },
  {
    icon: KeyRound,
    title: "Scoped API keys",
    description:
      "Create a key per environment, see when each was last used, and revoke any one of them instantly.",
  },
  {
    icon: BarChart3,
    title: "Usage you can trust",
    description:
      "Daily and monthly request counts, success rate and average response time — no guessing what you have spent.",
  },
  {
    icon: ShieldCheck,
    title: "Built for production",
    description:
      "Predictable errors, per-plan rate limits and request IDs on every response for straightforward debugging.",
  },
];

export function Features() {
  return (
    <section id="features" className="scroll-mt-20 border-t">
      <div className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            Everything you need, nothing you don&apos;t
          </h2>
          <p className="text-muted-foreground mt-4 text-lg leading-relaxed">
            WAVerify does one job properly: telling you whether a number is
            reachable on WhatsApp, and what it looks like.
          </p>
        </div>

        <div className="mt-14 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <div key={title}>
              <span
                className="bg-secondary text-foreground mb-4 inline-flex size-9 items-center justify-center rounded-lg border"
                aria-hidden
              >
                <Icon className="size-4" />
              </span>
              <h3 className="font-medium">{title}</h3>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
