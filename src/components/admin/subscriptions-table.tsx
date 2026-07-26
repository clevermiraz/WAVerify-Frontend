"use client";

import { CreditCard } from "lucide-react";
import * as React from "react";

import { DataTableShell } from "@/components/admin/data-table-shell";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAdminSubscriptions } from "@/hooks/use-api";
import { formatDate } from "@/lib/utils";

const PAGE_SIZE = 15;

export function AdminSubscriptionsTable() {
  const [page, setPage] = React.useState(1);
  const { data, isLoading, isError } = useAdminSubscriptions({
    page,
    page_size: PAGE_SIZE,
  });

  return (
    <DataTableShell
      isLoading={isLoading}
      isError={isError}
      isEmpty={!data || data.items.length === 0}
      meta={data}
      onPageChange={setPage}
      emptyIcon={CreditCard}
      emptyTitle="No subscriptions"
      emptyDescription="Subscriptions are created automatically when users register."
      label="subscriptions"
    >
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Plan</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="hidden sm:table-cell">Renews</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.items.map((subscription) => (
            <TableRow key={subscription.id}>
              <TableCell className="truncate font-medium">
                {subscription.user_email}
              </TableCell>
              <TableCell>{subscription.plan_name}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    subscription.status === "active" ? "success" : "muted"
                  }
                >
                  {subscription.status}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground hidden text-sm whitespace-nowrap sm:table-cell">
                {formatDate(subscription.current_period_end)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </DataTableShell>
  );
}
