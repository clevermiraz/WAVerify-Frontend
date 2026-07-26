"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Users } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import { DataTableShell } from "@/components/admin/data-table-shell";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toastApiError, useAdminUsers } from "@/hooks/use-api";
import { useAuth } from "@/hooks/use-auth";
import { formatDate, formatRelativeTime } from "@/lib/utils";
import { adminService } from "@/services";

const PAGE_SIZE = 15;

export function AdminUsersTable() {
  const [page, setPage] = React.useState(1);
  const [query, setQuery] = React.useState("");
  const [debounced, setDebounced] = React.useState("");
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebounced(query);
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [query]);

  const { data, isLoading, isError } = useAdminUsers({
    page,
    page_size: PAGE_SIZE,
    q: debounced,
  });

  const toggleActive = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      adminService.updateUser(id, { is_active: isActive }),
    onSuccess: (updated) => {
      void queryClient.invalidateQueries({ queryKey: ["admin"] });
      toast.success(
        `${updated.email} is now ${updated.is_active ? "active" : "deactivated"}.`
      );
    },
    onError: (error) => toastApiError(error),
  });

  return (
    <DataTableShell
      isLoading={isLoading}
      isError={isError}
      isEmpty={!data || data.items.length === 0}
      meta={data}
      onPageChange={setPage}
      emptyIcon={Users}
      emptyTitle={debounced ? "No matching users" : "No users yet"}
      emptyDescription={
        debounced
          ? "Try a different email or name."
          : "Registered accounts will appear here."
      }
      label="users"
      toolbar={
        <Input
          placeholder="Search by email or name…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          aria-label="Search users"
          className="sm:max-w-xs"
        />
      }
    >
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Role</TableHead>
            <TableHead className="text-right">Total Lookups</TableHead>
            <TableHead className="hidden md:table-cell">Joined</TableHead>
            <TableHead className="hidden lg:table-cell">Last login</TableHead>
            <TableHead className="text-right">Active</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.items.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <span className="block truncate font-medium">{user.email}</span>
                <span className="text-muted-foreground block truncate text-xs">
                  {user.full_name ?? "—"}
                  {user.is_email_verified ? " · verified" : " · unverified"}
                </span>
              </TableCell>
              <TableCell>
                <Badge variant={user.role === "admin" ? "default" : "muted"}>
                  {user.role}
                </Badge>
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {user.total_lookups?.toLocaleString() ?? "—"}
              </TableCell>
              <TableCell className="text-muted-foreground hidden text-sm whitespace-nowrap md:table-cell">
                {formatDate(user.created_at)}
              </TableCell>
              <TableCell className="text-muted-foreground hidden text-sm whitespace-nowrap lg:table-cell">
                {formatRelativeTime(user.last_login_at)}
              </TableCell>
              <TableCell className="text-right">
                <Switch
                  checked={user.is_active}
                  // The API also refuses this, but disabling it avoids
                  // offering an action that can only fail.
                  disabled={
                    user.id === currentUser?.id || toggleActive.isPending
                  }
                  onCheckedChange={(checked) =>
                    toggleActive.mutate({ id: user.id, isActive: checked })
                  }
                  aria-label={`${user.is_active ? "Deactivate" : "Activate"} ${user.email}`}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </DataTableShell>
  );
}
