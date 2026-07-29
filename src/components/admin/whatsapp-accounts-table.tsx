"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Loader2,
  Plus,
  QrCode,
  RefreshCcw,
  Trash2,
  TriangleAlert,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  toastApiError,
  useAdminWhatsAppAccounts,
  useInitWhatsAppAccount,
  useRemoveWhatsAppAccount,
  useReverifyWhatsAppAccount,
} from "@/hooks/use-api";
import { adminWhatsAppService } from "@/services";

function QRCodeModal({
  accountId,
  open,
  onOpenChange,
}: {
  accountId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "whatsapp", "status", accountId],
    queryFn: () => adminWhatsAppService.status(accountId!),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (
        status === "connected" ||
        status === "disconnected" ||
        status === "error"
      ) {
        return false;
      }
      return 3000;
    },
    enabled: !!accountId && open,
  });

  const { mutate: reverify, isPending: isReverifying } =
    useReverifyWhatsAppAccount();

  // If status becomes connected, invalidate accounts list and maybe close modal
  if (data?.status === "connected") {
    // Optionally close automatically or just show success
    // toast.success("WhatsApp account connected!");
    // onOpenChange(false);
  }

  const handleReverify = () => {
    if (!accountId) return;
    reverify(accountId, {
      onSuccess: () => {
        toast.success("Requested new QR code.");
        void queryClient.invalidateQueries({
          queryKey: ["admin", "whatsapp", "status", accountId],
        });
      },
      onError: (error) => toastApiError(error),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md text-center">
        <DialogHeader>
          <DialogTitle>Pair WhatsApp Account</DialogTitle>
          <DialogDescription>
            Scan this QR code using the WhatsApp app on your phone.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center py-6 min-h-75">
          {isLoading && !data ? (
            <div className="flex flex-col items-center gap-4 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p>Fetching QR code...</p>
            </div>
          ) : data?.status === "pairing" && data.qr_data ? (
            <div className="bg-white p-4 rounded-xl shadow-sm border">
              <QRCodeSVG value={data.qr_data} size={256} />
            </div>
          ) : data?.status === "connected" ? (
            <div className="flex flex-col items-center gap-4 text-emerald-600">
              <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center">
                <QrCode className="h-8 w-8" />
              </div>
              <p className="font-medium">Account connected successfully!</p>
              <p className="text-sm text-muted-foreground">
                Paired number: {data.paired_number}
              </p>
            </div>
          ) : data?.status === "error" || data?.status === "disconnected" ? (
            <div className="flex flex-col items-center gap-4">
              <div className="text-destructive font-medium">
                Session failed or disconnected
              </div>
              <Button
                onClick={handleReverify}
                disabled={isReverifying}
                variant="outline"
              >
                {isReverifying ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCcw className="h-4 w-4 mr-2" />
                )}
                Try Again
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p>Initializing...</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function AdminWhatsAppAccounts() {
  const { data, isLoading } = useAdminWhatsAppAccounts();
  const { mutate: initAccount, isPending: isInitializing } =
    useInitWhatsAppAccount();
  const { mutate: removeAccount, isPending: isRemoving } =
    useRemoveWhatsAppAccount();

  const [activeAccountId, setActiveAccountId] = useState<string | null>(null);

  const handleAddAccount = () => {
    initAccount(undefined, {
      onSuccess: (res) => {
        toast.success("Session initialized.");
        setActiveAccountId(res.id);
      },
      onError: (error) => toastApiError(error),
    });
  };

  const handleRemove = (id: string) => {
    if (!confirm("Are you sure you want to remove this account?")) return;
    removeAccount(id, {
      onSuccess: () => toast.success("Account removed."),
      onError: (error) => toastApiError(error),
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div className="space-y-1.5">
          <CardTitle>WhatsApp Accounts</CardTitle>
          <CardDescription className="max-w-150 leading-relaxed">
            Manage your pool of WhatsApp sessions. Lookups are automatically
            distributed across all connected accounts to prevent bans and
            improve reliability.
          </CardDescription>
        </div>
        <Button
          onClick={handleAddAccount}
          disabled={isInitializing}
          className="shrink-0"
        >
          {isInitializing ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Plus className="mr-2 h-4 w-4" />
          )}
          Add Account
        </Button>
      </CardHeader>
      <CardContent>
        {/* The single fact that matters: with no usable account, every number
            lookup returns 502 no matter how healthy the rows below look. */}
        {!isLoading && data && data.usable_accounts === 0 && (
          <div className="border-destructive/40 bg-destructive/10 text-destructive mb-4 flex items-start gap-2 rounded-lg border p-3 text-sm">
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <div>
              <p className="font-medium">No account is connected.</p>
              <p className="mt-0.5">
                Phone number checks are failing right now. Pair an account, or
                re-pair one showing <span className="font-mono">disconnected</span>{" "}
                or <span className="font-mono">not_loaded</span>. Email checks are
                unaffected.
              </p>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex h-32 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Phone Number</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total Lookups</TableHead>
                <TableHead className="text-right">This Month</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.accounts.map((account) => (
                <TableRow key={account.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {account.phone_number || "Unpaired"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        account.status === "connected"
                          ? "default"
                          : account.status === "error" ||
                              account.status === "disconnected" ||
                              account.status === "not_loaded"
                            ? "destructive"
                            : "secondary"
                      }
                      className={
                        account.status === "connected"
                          ? "bg-emerald-500 hover:bg-emerald-600"
                          : ""
                      }
                    >
                      {account.status}
                    </Badge>
                    {/* The saved status outlives a restart, so when it
                        disagrees it is stale — say so rather than showing two
                        badges that look equally authoritative. */}
                    {account.stored_status &&
                      account.stored_status !== account.status && (
                        <p className="text-muted-foreground mt-1 text-xs">
                          Last saved as {account.stored_status}
                        </p>
                      )}
                  </TableCell>
                  <TableCell className="text-right">
                    {account.total_lookups_performed.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    {account.lookups_this_month.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {account.status !== "connected" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setActiveAccountId(account.id)}
                        >
                          <QrCode className="h-4 w-4 mr-2" />
                          Pair
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive/90"
                        onClick={() => handleRemove(account.id)}
                        disabled={isRemoving}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Remove</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {!data?.accounts.length && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center text-muted-foreground py-8"
                  >
                    No WhatsApp accounts connected. Add one to start processing
                    lookups.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}

        <QRCodeModal
          accountId={activeAccountId}
          open={!!activeAccountId}
          onOpenChange={(open) => {
            if (!open) setActiveAccountId(null);
          }}
        />
      </CardContent>
    </Card>
  );
}
