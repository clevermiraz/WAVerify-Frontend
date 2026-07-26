"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatNumber } from "@/lib/utils";
import type { PageMeta } from "@/types/api";

interface PaginationProps {
  meta: PageMeta;
  onPageChange: (page: number) => void;
  label?: string;
}

export function Pagination({
  meta,
  onPageChange,
  label = "results",
}: PaginationProps) {
  // Support both flattened response (new API) and nested `.meta` (old API)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fallbackMeta = meta as any;
  const actualMeta = fallbackMeta.meta ?? meta;

  const total = actualMeta.total ?? 0;
  if (total === 0) return null;

  const page = actualMeta.page ?? 1;
  const pageSize = actualMeta.page_size ?? 15;
  const pages = actualMeta.pages ?? actualMeta.total_pages ?? 1;

  const first = (page - 1) * pageSize + 1;
  const last = Math.min(page * pageSize, total);

  return (
    <nav
      aria-label="Pagination"
      className="flex flex-col gap-3 border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <p className="text-muted-foreground text-sm" aria-live="polite">
        Showing {formatNumber(first)}–{formatNumber(last)} of{" "}
        {formatNumber(total)} {label}
      </p>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft />
          Previous
        </Button>
        <span className="text-muted-foreground px-1 text-sm">
          Page {page} of {Math.max(1, pages)}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= pages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
          <ChevronRight />
        </Button>
      </div>
    </nav>
  );
}
