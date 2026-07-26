import type { Metadata } from "next";

import { PageHeader } from "@/components/dashboard/page-header";
import { SearchHistory } from "@/components/dashboard/search-history";
import { SearchPanel } from "@/components/dashboard/search-panel";

export const metadata: Metadata = { title: "Search" };

export default function SearchPage() {
  return (
    <>
      <PageHeader
        title="Search"
        description="Check whether a phone number has a WhatsApp account."
      />
      <SearchPanel />

      <section className="mt-12">
        <h2 className="mb-4 text-lg font-semibold tracking-tight">
          Recent searches
        </h2>
        <SearchHistory />
      </section>
    </>
  );
}
