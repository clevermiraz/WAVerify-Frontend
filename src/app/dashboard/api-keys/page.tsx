import type { Metadata } from "next";

import { ApiKeysManager } from "@/components/dashboard/api-keys-manager";
import { PageHeader } from "@/components/dashboard/page-header";

export const metadata: Metadata = { title: "API Keys" };

export default function ApiKeysPage() {
  return (
    <>
      <PageHeader
        title="API Keys"
        description="Create a key per environment and revoke any one of them instantly."
      />
      <ApiKeysManager />
    </>
  );
}
