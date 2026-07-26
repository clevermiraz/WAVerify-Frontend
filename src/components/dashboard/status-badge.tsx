import { Check, MinusCircle, TriangleAlert } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { LookupStatus } from "@/types/api";

const CONFIG = {
  exists: { label: "Exists", variant: "success", icon: Check },
  not_found: { label: "Not found", variant: "muted", icon: MinusCircle },
  failed: { label: "Failed", variant: "destructive", icon: TriangleAlert },
} as const;

export function StatusBadge({ status }: { status: LookupStatus | string }) {
  const config = CONFIG[status as LookupStatus] ?? CONFIG.failed;
  const Icon = config.icon;

  return (
    <Badge variant={config.variant}>
      <Icon className="size-3" aria-hidden />
      {config.label}
    </Badge>
  );
}
