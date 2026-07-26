"use client";

import type { LucideIcon } from "lucide-react";
import * as React from "react";

import { EmptyState } from "@/components/dashboard/empty-state";
import { Pagination } from "@/components/dashboard/pagination";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { PageMeta } from "@/types/api";

interface DataTableShellProps {
  isLoading: boolean;
  isError: boolean;
  isEmpty: boolean;
  meta?: PageMeta;
  onPageChange: (page: number) => void;
  emptyIcon: LucideIcon;
  emptyTitle: string;
  emptyDescription: string;
  label: string;
  toolbar?: React.ReactNode;
  children: React.ReactNode;
}

/** Shared loading / empty / error / pagination frame for the admin tables. */
export function DataTableShell({
  isLoading,
  isError,
  isEmpty,
  meta,
  onPageChange,
  emptyIcon,
  emptyTitle,
  emptyDescription,
  label,
  toolbar,
  children,
}: DataTableShellProps) {
  return (
    <Card>
      {toolbar && (
        <div className="flex flex-col gap-3 border-b p-4 sm:flex-row">
          {toolbar}
        </div>
      )}

      {isError ? (
        <p className="text-muted-foreground px-4 py-12 text-center text-sm">
          Could not load {label}. Please refresh the page.
        </p>
      ) : isLoading ? (
        <div className="space-y-3 p-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-11 w-full" />
          ))}
        </div>
      ) : isEmpty ? (
        <EmptyState
          icon={emptyIcon}
          title={emptyTitle}
          description={emptyDescription}
        />
      ) : (
        <>
          {children}
          {meta && (
            <Pagination meta={meta} onPageChange={onPageChange} label={label} />
          )}
        </>
      )}
    </Card>
  );
}
