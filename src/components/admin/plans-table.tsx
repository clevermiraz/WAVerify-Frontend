"use client";

import { CreditCard, Edit, Plus, Trash2 } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import { DataTableShell } from "@/components/admin/data-table-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
  useAdminPlans,
  useCreateAdminPlan,
  useRemoveAdminPlan,
  useUpdateAdminPlan,
} from "@/hooks/use-api";
import type { Plan } from "@/types/api";

export function AdminPlansTable() {
  const { data: plans, isLoading, isError } = useAdminPlans();
  const { mutate: removePlan, isPending: isRemoving } = useRemoveAdminPlan();
  const { mutate: updatePlan } = useUpdateAdminPlan();

  const [activePlan, setActivePlan] = React.useState<Plan | null>(null);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  const handleTogglePublic = (id: string, is_public: boolean) => {
    updatePlan(
      { id, data: { is_public } },
      { onError: (error) => toastApiError(error) }
    );
  };

  const handleToggleActive = (id: string, is_active: boolean) => {
    updatePlan(
      { id, data: { is_active } },
      { onError: (error) => toastApiError(error) }
    );
  };

  const handleToggleRecommended = (id: string, is_recommended: boolean) => {
    updatePlan(
      { id, data: { is_recommended } },
      { onError: (error) => toastApiError(error) }
    );
  };

  const handleEdit = (plan: Plan) => {
    setActivePlan(plan);
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setActivePlan(null);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this plan? This will fail if users are subscribed."
      )
    )
      return;
    removePlan(id, {
      onSuccess: () => toast.success("Plan deleted successfully."),
      onError: (error) => toastApiError(error),
    });
  };

  return (
    <>
      <DataTableShell
        isLoading={isLoading}
        isError={isError}
        isEmpty={!plans || plans.length === 0}
        onPageChange={() => {}}
        emptyIcon={CreditCard}
        emptyTitle="No plans found"
        emptyDescription="Create your first pricing plan to offer subscriptions."
        label="pricing plans"
        toolbar={
          <div className="flex w-full justify-between items-center">
            <h2 className="text-lg font-semibold">Pricing Plans</h2>
            <Button onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Add Plan
            </Button>
          </div>
        }
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Plan</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Quota</TableHead>
              <TableHead className="text-center">Settings</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {plans?.map((plan) => (
              <TableRow key={plan.id}>
                <TableCell>
                  <div className="font-medium flex items-center gap-2">
                    {plan.name}
                    {plan.is_recommended && (
                      <Badge
                        variant="secondary"
                        className="text-[10px] px-1 py-0 h-4"
                      >
                        Recommended
                      </Badge>
                    )}
                  </div>
                  <div className="text-muted-foreground text-xs">
                    {plan.slug}
                  </div>
                </TableCell>
                <TableCell>
                  ${(plan.price_cents / 100).toFixed(2)}{" "}
                  {plan.currency.toUpperCase()}
                </TableCell>
                <TableCell>
                  {plan.monthly_request_quota
                    ? plan.monthly_request_quota.toLocaleString()
                    : "Unlimited"}
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-center gap-4">
                    <div className="flex flex-col items-center gap-1">
                      <Switch
                        className="scale-75"
                        checked={plan.is_active !== false}
                        onCheckedChange={(c) => handleToggleActive(plan.id, c)}
                        aria-label="Toggle active status"
                      />
                      <span className="text-[10px] text-muted-foreground leading-none">
                        Active
                      </span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <Switch
                        className="scale-75"
                        checked={plan.is_public !== false}
                        onCheckedChange={(c) => handleTogglePublic(plan.id, c)}
                        aria-label="Toggle public status"
                      />
                      <span className="text-[10px] text-muted-foreground leading-none">
                        Public
                      </span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <Switch
                        className="scale-75"
                        checked={plan.is_recommended === true}
                        onCheckedChange={(c) =>
                          handleToggleRecommended(plan.id, c)
                        }
                        aria-label="Toggle recommended status"
                      />
                      <span className="text-[10px] text-muted-foreground leading-none">
                        Rec.
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(plan)}
                  >
                    <Edit className="h-4 w-4 text-muted-foreground" />
                    <span className="sr-only">Edit</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive/90"
                    onClick={() => handleDelete(plan.id)}
                    disabled={isRemoving}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DataTableShell>

      <PlanDialog
        plan={activePlan}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </>
  );
}

function PlanDialog({
  plan,
  open,
  onOpenChange,
}: {
  plan: Plan | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { mutate: createPlan, isPending: isCreating } = useCreateAdminPlan();
  const { mutate: updatePlan, isPending: isUpdating } = useUpdateAdminPlan();
  const isPending = isCreating || isUpdating;

  const [formData, setFormData] = React.useState({
    name: "",
    slug: "",
    description: "",
    price_cents: 0,
    currency: "usd",
    monthly_request_quota: 0 as number | null,
    rate_limit_per_minute: 60,
    features: "",
    is_contact_sales: false,
    sort_order: 0,
    is_active: true,
    is_public: true,
    is_recommended: false,
  });

  React.useEffect(() => {
    if (plan && open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        name: plan.name,
        slug: plan.slug,
        description: plan.description,
        price_cents: plan.price_cents,
        currency: plan.currency,
        monthly_request_quota: plan.monthly_request_quota,
        rate_limit_per_minute: plan.rate_limit_per_minute,
        features: plan.features.join("\n"),
        is_contact_sales: plan.is_contact_sales,
        sort_order: plan.sort_order,
        is_active: plan.is_active !== false,
        is_public: plan.is_public !== false,
        is_recommended: plan.is_recommended ?? false,
      });
    } else if (!plan && open) {
      setFormData({
        name: "",
        slug: "",
        description: "",
        price_cents: 0,
        currency: "usd",
        monthly_request_quota: 1000,
        rate_limit_per_minute: 60,
        features: "",
        is_contact_sales: false,
        sort_order: 0,
        is_active: true,
        is_public: true,
        is_recommended: false,
      });
    }
  }, [plan, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      ...formData,
      features: formData.features
        .split("\n")
        .map((f) => f.trim())
        .filter(Boolean),
    };

    if (plan) {
      updatePlan(
        { id: plan.id, data: payload },
        {
          onSuccess: () => {
            toast.success("Plan updated.");
            onOpenChange(false);
          },
          onError: (error) => toastApiError(error),
        }
      );
    } else {
      createPlan(payload, {
        onSuccess: () => {
          toast.success("Plan created.");
          onOpenChange(false);
        },
        onError: (error) => toastApiError(error),
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-150 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{plan ? "Edit Plan" : "Create Plan"}</DialogTitle>
          <DialogDescription>
            {plan
              ? "Update pricing and features."
              : "Add a new pricing tier to your platform."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Plan Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug (e.g., summer-promo)</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) =>
                  setFormData({ ...formData, slug: e.target.value })
                }
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price_cents">Price (in cents)</Label>
              <Input
                id="price_cents"
                type="number"
                value={formData.price_cents}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    price_cents: parseInt(e.target.value) || 0,
                  })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Input
                id="currency"
                value={formData.currency}
                onChange={(e) =>
                  setFormData({ ...formData, currency: e.target.value })
                }
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="monthly_request_quota">
                Monthly Quota (0 for unlimited)
              </Label>
              <Input
                id="monthly_request_quota"
                type="number"
                value={
                  formData.monthly_request_quota === null
                    ? 0
                    : formData.monthly_request_quota
                }
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setFormData({
                    ...formData,
                    monthly_request_quota: val === 0 ? null : val,
                  });
                }}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rate_limit_per_minute">
                Rate Limit (per min)
              </Label>
              <Input
                id="rate_limit_per_minute"
                type="number"
                value={formData.rate_limit_per_minute}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    rate_limit_per_minute: parseInt(e.target.value) || 0,
                  })
                }
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sort_order">Sort Order</Label>
              <Input
                id="sort_order"
                type="number"
                value={formData.sort_order}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    sort_order: parseInt(e.target.value) || 0,
                  })
                }
                required
              />
            </div>
            <div className="flex items-center space-x-2 pt-8">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(c) =>
                  setFormData({ ...formData, is_active: c })
                }
              />
              <Label htmlFor="is_active">Active</Label>
            </div>
            <div className="flex items-center space-x-2 pt-8">
              <Switch
                id="is_public"
                checked={formData.is_public}
                onCheckedChange={(c) =>
                  setFormData({ ...formData, is_public: c })
                }
              />
              <Label htmlFor="is_public">Public (New Signups)</Label>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="features">Features (One per line)</Label>
            <textarea
              id="features"
              value={formData.features}
              onChange={(e) =>
                setFormData({ ...formData, features: e.target.value })
              }
              rows={4}
              className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="is_contact_sales"
              checked={formData.is_contact_sales}
              onCheckedChange={(c) =>
                setFormData({ ...formData, is_contact_sales: c })
              }
            />
            <Label htmlFor="is_contact_sales">
              Is &quot;Contact Sales&quot; custom plan?
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="is_recommended"
              checked={formData.is_recommended}
              onCheckedChange={(c) =>
                setFormData({ ...formData, is_recommended: c })
              }
            />
            <Label htmlFor="is_recommended">
              Highlight as Recommended Plan
            </Label>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {plan ? "Update Plan" : "Create Plan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
