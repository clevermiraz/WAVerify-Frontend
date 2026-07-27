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
import { useAdminWallets } from "@/hooks/use-api";
import { formatNumber } from "@/lib/utils";

const PAGE_SIZE = 15;

export function AdminWalletsTable() {
  const [page, setPage] = React.useState(1);
  const { data, isLoading, isError } = useAdminWallets({
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
      emptyTitle="No wallets"
      emptyDescription="Wallets are created automatically when users register."
      label="wallets"
    >
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Balance</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.items.map((wallet) => (
            <TableRow key={wallet.id}>
              <TableCell className="truncate font-medium">
                {wallet.user_email}
              </TableCell>
              <TableCell>
                <Badge variant={wallet.credits_balance > 0 ? "success" : "muted"}>
                  {formatNumber(wallet.credits_balance)} credits
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </DataTableShell>
  );
}
