"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Check,
  Copy,
  KeyRound,
  MoreHorizontal,
  Plus,
  TriangleAlert,
} from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { EmptyState } from "@/components/dashboard/empty-state";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { queryKeys, toastApiError, useApiKeys } from "@/hooks/use-api";
import { useCopy } from "@/hooks/use-copy";
import { ApiError } from "@/lib/api-client";
import { formatDate, formatRelativeTime } from "@/lib/utils";
import { apiKeySchema, type ApiKeyInput } from "@/lib/validations";
import { apiKeyService } from "@/services";
import type { ApiKey, CreatedApiKey } from "@/types/api";

export function ApiKeysManager() {
  const { data: keys, isLoading, isError } = useApiKeys();
  const [createOpen, setCreateOpen] = React.useState(false);
  const [created, setCreated] = React.useState<CreatedApiKey | null>(null);
  const [renaming, setRenaming] = React.useState<ApiKey | null>(null);
  const [deleting, setDeleting] = React.useState<ApiKey | null>(null);

  return (
    <>
      <div className="mb-6 flex justify-end">
        <Button onClick={() => setCreateOpen(true)}>
          <Plus />
          Create API key
        </Button>
      </div>

      <Card>
        {isError ? (
          <p className="text-muted-foreground px-4 py-12 text-center text-sm">
            Could not load your API keys. Please refresh the page.
          </p>
        ) : isLoading ? (
          <div className="space-y-3 p-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-12 w-full" />
            ))}
          </div>
        ) : keys && keys.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Key</TableHead>
                <TableHead className="hidden md:table-cell">Created</TableHead>
                <TableHead className="hidden sm:table-cell">
                  Last used
                </TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {keys.map((key) => (
                <TableRow key={key.id}>
                  <TableCell className="font-medium">{key.name}</TableCell>
                  <TableCell>
                    <code className="text-muted-foreground font-mono text-xs">
                      {key.prefix}••••••••
                    </code>
                  </TableCell>
                  <TableCell className="text-muted-foreground hidden text-sm whitespace-nowrap md:table-cell">
                    {formatDate(key.created_at)}
                  </TableCell>
                  <TableCell className="text-muted-foreground hidden text-sm whitespace-nowrap sm:table-cell">
                    {formatRelativeTime(key.last_used_at)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Actions for ${key.name}`}
                        >
                          <MoreHorizontal />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setRenaming(key)}>
                          Rename
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => setDeleting(key)}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <EmptyState
            icon={KeyRound}
            title="No API keys yet"
            description="Create a key to call the verification API from your own servers."
            action={
              <Button onClick={() => setCreateOpen(true)}>
                <Plus />
                Create API key
              </Button>
            }
          />
        )}
      </Card>

      <CreateKeyDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={(key) => {
          setCreateOpen(false);
          setCreated(key);
        }}
      />
      <RevealKeyDialog created={created} onClose={() => setCreated(null)} />
      <RenameKeyDialog apiKey={renaming} onClose={() => setRenaming(null)} />
      <DeleteKeyDialog apiKey={deleting} onClose={() => setDeleting(null)} />
    </>
  );
}

function CreateKeyDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (key: CreatedApiKey) => void;
}) {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<ApiKeyInput>({
    resolver: zodResolver(apiKeySchema),
    defaultValues: { name: "" },
  });

  const mutation = useMutation({
    mutationFn: (values: ApiKeyInput) => apiKeyService.create(values.name),
    onSuccess: (key) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.apiKeys });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.dashboardStats,
      });
      reset();
      onCreated(key);
    },
    onError: (error) => {
      // A duplicate name or a key-limit breach belongs on the field itself;
      // anything else is an unexpected failure worth a toast.
      if (
        error instanceof ApiError &&
        (error.status === 409 || error.status === 422)
      ) {
        setError("name", { message: error.message });
        return;
      }
      toastApiError(error);
    },
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create API key</DialogTitle>
          <DialogDescription>
            Name it after where it will be used, so you can revoke the right one
            later.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit((values) => mutation.mutate(values))}
          className="space-y-4"
          noValidate
        >
          <Field
            label="Key name"
            htmlFor="key-name"
            error={errors.name?.message}
          >
            <Input
              placeholder="Production server"
              autoFocus
              {...register("name")}
            />
          </Field>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" loading={mutation.isPending}>
              Create key
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function RevealKeyDialog({
  created,
  onClose,
}: {
  created: CreatedApiKey | null;
  onClose: () => void;
}) {
  const { copied, copy } = useCopy();

  return (
    <Dialog open={created !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Your new API key</DialogTitle>
          <DialogDescription>
            Copy it now — for your security we only store a hash, so it cannot
            be shown again.
          </DialogDescription>
        </DialogHeader>

        <Alert variant="warning">
          <TriangleAlert />
          <AlertDescription>
            Treat this like a password. Anyone with it can spend your quota.
          </AlertDescription>
        </Alert>

        <div className="bg-muted flex items-center gap-2 rounded-lg p-3">
          <code className="min-w-0 flex-1 font-mono text-xs break-all">
            {created?.key}
          </code>
          <Button
            size="sm"
            variant="outline"
            onClick={() => created && void copy(created.key, "API key copied")}
          >
            {copied ? <Check /> : <Copy />}
            Copy
          </Button>
        </div>

        <DialogFooter>
          <Button onClick={onClose}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function RenameKeyDialog({
  apiKey,
  onClose,
}: {
  apiKey: ApiKey | null;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ApiKeyInput>({
    resolver: zodResolver(apiKeySchema),
    defaultValues: { name: "" },
  });

  // Seed the field whenever a different key is selected.
  React.useEffect(() => {
    if (apiKey) reset({ name: apiKey.name });
  }, [apiKey, reset]);

  const mutation = useMutation({
    mutationFn: (values: ApiKeyInput) =>
      apiKeyService.rename(apiKey!.id, values.name),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.apiKeys });
      toast.success("API key renamed.");
      onClose();
    },
    onError: (error) => toastApiError(error),
  });

  return (
    <Dialog open={apiKey !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename API key</DialogTitle>
          <DialogDescription>
            This only changes the label — the key itself stays the same.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit((values) => mutation.mutate(values))}
          className="space-y-4"
          noValidate
        >
          <Field
            label="Key name"
            htmlFor="rename-key"
            error={errors.name?.message}
          >
            <Input autoFocus {...register("name")} />
          </Field>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={mutation.isPending}>
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DeleteKeyDialog({
  apiKey,
  onClose,
}: {
  apiKey: ApiKey | null;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => apiKeyService.remove(apiKey!.id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.apiKeys });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.dashboardStats,
      });
      toast.success("API key deleted.");
      onClose();
    },
    onError: (error) => toastApiError(error),
  });

  return (
    <Dialog open={apiKey !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete “{apiKey?.name}”?</DialogTitle>
          <DialogDescription>
            Any application still using this key will start receiving 401 errors
            immediately. This cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2">
          <Badge variant="muted" className="font-mono">
            {apiKey?.prefix}••••••••
          </Badge>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            loading={mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            Delete key
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
