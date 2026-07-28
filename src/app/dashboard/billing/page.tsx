import type { Metadata } from "next";
import { Suspense } from "react";

import { BillingView } from "@/components/dashboard/billing-view";

export const metadata: Metadata = { title: "Billing" };

export default function BillingPage() {
  // `BillingView` reads the `checkout_id` Polar appends on return, and
  // `useSearchParams` needs a Suspense boundary above it or the build fails.
  return (
    <Suspense>
      <BillingView />
    </Suspense>
  );
}
