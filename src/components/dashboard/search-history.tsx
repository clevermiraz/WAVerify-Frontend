"use client";

import { SearchX } from "lucide-react";
import * as React from "react";

import { EmptyState } from "@/components/dashboard/empty-state";
import { Pagination } from "@/components/dashboard/pagination";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useSearchHistory } from "@/hooks/use-api";
import { formatDateTime } from "@/lib/utils";
import type { LookupStatus } from "@/types/api";

const PAGE_SIZE = 10;

export function SearchHistory() {
  const [page, setPage] = React.useState(1);
  const [status, setStatus] = React.useState<LookupStatus | "">("");
  const [query, setQuery] = React.useState("");
  const [debouncedQuery, setDebouncedQuery] = React.useState("");

  // Debounced so typing a number doesn't fire a request per keystroke.
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [query]);

  const { data, isLoading, isError } = useSearchHistory({
    page,
    page_size: PAGE_SIZE,
    status,
    q: debouncedQuery,
  });

  const hasFilters = Boolean(status || debouncedQuery);

  return (
    <Card>
      <div className="flex flex-col gap-3 border-b p-4 sm:flex-row">
        <Input
          placeholder="Filter by number…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          aria-label="Filter search history by phone number"
          className="sm:max-w-xs"
        />
        <Select
          value={status}
          onChange={(event) => {
            setStatus(event.target.value as LookupStatus | "");
            setPage(1);
          }}
          aria-label="Filter by status"
          className="sm:w-44"
        >
          <option value="">All statuses</option>
          <option value="exists">Exists</option>
          <option value="not_found">Not found</option>
          <option value="failed">Failed</option>
        </Select>
      </div>

      {isError ? (
        <p className="text-muted-foreground px-4 py-12 text-center text-sm">
          Could not load your search history. Please refresh the page.
        </p>
      ) : isLoading ? (
        <div className="space-y-3 p-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-11 w-full" />
          ))}
        </div>
      ) : data && data.items.length > 0 ? (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Phone number</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden sm:table-cell">Date</TableHead>
                <TableHead className="text-right">Response</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.items.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    <span className="font-mono text-sm">
                      {log.phone_number}
                    </span>
                    {log.display_name && (
                      <span className="text-muted-foreground block truncate text-xs">
                        {log.display_name}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={log.status} />
                  </TableCell>
                  <TableCell className="text-muted-foreground hidden text-sm whitespace-nowrap sm:table-cell">
                    {formatDateTime(log.created_at)}
                  </TableCell>
                  <TableCell className="text-right text-sm whitespace-nowrap tabular-nums">
                    {log.response_time_ms} ms
                    {log.cached && (
                      <span className="text-muted-foreground block text-xs">
                        cached
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Pagination meta={data} onPageChange={setPage} label="searches" />
        </>
      ) : (
        <EmptyState
          icon={SearchX}
          title={hasFilters ? "No matching searches" : "No searches yet"}
          description={
            hasFilters
              ? "Try a different number or clear the status filter."
              : "Run your first lookup above and it will appear here."
          }
        />
      )}
    </Card>
  );
}
