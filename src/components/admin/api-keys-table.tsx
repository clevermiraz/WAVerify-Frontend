"use client";

import { KeyRound } from "lucide-react";
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
import { useAdminApiKeys } from "@/hooks/use-api";
import { formatDate, formatRelativeTime } from "@/lib/utils";

const PAGE_SIZE = 15;

export function AdminApiKeysTable() {
  const [page, setPage] = React.useState(1);
  const { data, isLoading, isError } = useAdminApiKeys({
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
      emptyIcon={KeyRound}
      emptyTitle="No API keys"
      emptyDescription="Keys created by any user will be listed here."
      label="API keys"
    >
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Prefix</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="hidden md:table-cell">Created</TableHead>
            <TableHead className="hidden sm:table-cell">Last used</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.items.map((key) => (
            <TableRow key={key.id}>
              <TableCell className="font-medium">{key.name}</TableCell>
              <TableCell>
                <code className="text-muted-foreground font-mono text-xs">
                  {key.prefix}••••
                </code>
              </TableCell>
              <TableCell>
                <Badge variant={key.is_active ? "success" : "muted"}>
                  {key.is_active ? "Active" : "Revoked"}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground hidden text-sm whitespace-nowrap md:table-cell">
                {formatDate(key.created_at)}
              </TableCell>
              <TableCell className="text-muted-foreground hidden text-sm whitespace-nowrap sm:table-cell">
                {formatRelativeTime(key.last_used_at)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </DataTableShell>
  );
}
