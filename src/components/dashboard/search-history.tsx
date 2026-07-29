"use client";

import { AtSign, SearchX, UserRound } from "lucide-react";
import * as React from "react";

import { EmptyState } from "@/components/dashboard/empty-state";
import { emailStatusTone } from "@/components/dashboard/lookup-details";
import { Pagination } from "@/components/dashboard/pagination";
import { SearchDetailDialog } from "@/components/dashboard/search-detail-dialog";
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
import { cn, formatDateTime } from "@/lib/utils";
import type { LookupStatus, SearchLog } from "@/types/api";

const PAGE_SIZE = 10;

export function SearchHistory() {
  const [page, setPage] = React.useState(1);
  const [status, setStatus] = React.useState<LookupStatus | "">("");
  const [query, setQuery] = React.useState("");
  const [debouncedQuery, setDebouncedQuery] = React.useState("");
  // The selected row is kept after closing so the dialog can animate out with
  // its header intact.
  const [selected, setSelected] = React.useState<SearchLog | null>(null);
  const [detailOpen, setDetailOpen] = React.useState(false);

  const openDetail = React.useCallback((log: SearchLog) => {
    setSelected(log);
    setDetailOpen(true);
  }, []);

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
    <>
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
                  <TableHead className="hidden md:table-cell">
                    Location
                  </TableHead>
                  <TableHead className="hidden sm:table-cell">Date</TableHead>
                  <TableHead className="text-right">Response</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.map((log) => (
                  // The whole row opens the detail: it holds no other control,
                  // so there is nothing for a nested button to compete with.
                  <TableRow
                    key={log.id}
                    role="button"
                    tabIndex={0}
                    aria-label={`Show details for ${log.phone_number}`}
                    onClick={() => openDetail(log)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        openDetail(log);
                      }
                    }}
                    className="focus-visible:ring-ring cursor-pointer focus-visible:ring-2 focus-visible:outline-none"
                  >
                    <TableCell>
                      <span className="font-mono text-sm">
                        {log.phone_number}
                      </span>
                      {log.display_name && (
                        <span className="text-muted-foreground block truncate text-xs">
                          {log.display_name}
                        </span>
                      )}
                      {/* The address that was checked, tinted when there was
                        something wrong with it — so a bad email is visible
                        without opening every row. */}
                      {log.email_info && (
                        <span
                          className={cn(
                            "flex items-center gap-1 truncate text-xs",
                            emailStatusTone(log.email_info.status)
                          )}
                        >
                          <AtSign className="size-3 shrink-0" aria-hidden />
                          {log.email_info.email}
                        </span>
                      )}
                      {/* Named separately from the WhatsApp name so the two
                        sources are never confused. */}
                      {log.gravatar && (
                        <span className="text-muted-foreground flex items-center gap-1 truncate text-xs">
                          <UserRound className="size-3 shrink-0" aria-hidden />
                          {log.gravatar.display_name ?? "Gravatar profile"}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={log.status} />
                    </TableCell>
                    {/* Older rows were saved before the backend stored this. */}
                    <TableCell className="hidden text-sm md:table-cell">
                      {log.number_info?.location ?? (
                        <span className="text-muted-foreground">—</span>
                      )}
                      {log.number_info?.carrier && (
                        <span className="text-muted-foreground block truncate text-xs">
                          {log.number_info.carrier}
                        </span>
                      )}
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

      <SearchDetailDialog
        log={selected}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </>
  );
}
