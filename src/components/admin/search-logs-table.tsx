"use client";

import { ScrollText } from "lucide-react";
import * as React from "react";

import { DataTableShell } from "@/components/admin/data-table-shell";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAdminSearchLogs } from "@/hooks/use-api";
import { formatDateTime } from "@/lib/utils";

const PAGE_SIZE = 15;

export function AdminSearchLogsTable() {
  const [page, setPage] = React.useState(1);
  const [query, setQuery] = React.useState("");
  const [debounced, setDebounced] = React.useState("");

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebounced(query);
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [query]);

  const { data, isLoading, isError } = useAdminSearchLogs({
    page,
    page_size: PAGE_SIZE,
    q: debounced,
  });

  return (
    <DataTableShell
      isLoading={isLoading}
      isError={isError}
      isEmpty={!data || data.items.length === 0}
      meta={data}
      onPageChange={setPage}
      emptyIcon={ScrollText}
      emptyTitle={debounced ? "No matching lookups" : "No lookups recorded"}
      emptyDescription={
        debounced
          ? "Try a different search term."
          : "Verification requests across all accounts appear here."
      }
      label="log entries"
      toolbar={
        <Input
          placeholder="Search by phone or email…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          aria-label="Filter search logs"
          className="sm:max-w-xs"
        />
      }
    >
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Phone number</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="hidden sm:table-cell">Source</TableHead>
            <TableHead className="hidden md:table-cell">Date</TableHead>
            <TableHead className="text-right">Response</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.items.map((log) => (
            <TableRow key={log.id}>
              <TableCell className="font-mono text-sm">
                {log.phone_number}
              </TableCell>
              <TableCell>
                <span
                  className="block truncate max-w-50"
                  title={log.user_email || log.user_id}
                >
                  {log.user_email || (
                    <span className="text-muted-foreground text-xs">
                      {log.user_id}
                    </span>
                  )}
                </span>
              </TableCell>
              <TableCell>
                <StatusBadge status={log.status} />
              </TableCell>
              <TableCell className="text-muted-foreground hidden text-sm capitalize sm:table-cell">
                {log.source}
              </TableCell>
              <TableCell className="text-muted-foreground hidden text-sm whitespace-nowrap md:table-cell">
                {formatDateTime(log.created_at)}
              </TableCell>
              <TableCell className="text-right text-sm tabular-nums">
                {log.response_time_ms} ms
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </DataTableShell>
  );
}
