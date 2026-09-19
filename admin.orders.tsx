import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Badge,
  CheckCircle2,
  Clock,
  MessageSquare,
  Phone,
  Trash2,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatPrice } from "@/lib/format";
import { getAdminOrders, updateOrderStatus, deleteOrder } from "@/lib/shop.functions";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type Order = Database["public"]["Tables"]["orders"]["Row"];
type OrderStatus = Order["status"];

const statusColors: Record<OrderStatus, string> = {
  new: "bg-blue-50 border-blue-200 text-blue-700",
  contacted: "bg-yellow-50 border-yellow-200 text-yellow-700",
  confirmed: "bg-green-50 border-green-200 text-green-700",
  delivered: "bg-slate-50 border-slate-200 text-slate-700",
  cancelled: "bg-red-50 border-red-200 text-red-700",
};

const statusIcons: Record<OrderStatus, React.ReactNode> = {
  new: <Clock className="size-3.5" />,
  contacted: <Phone className="size-3.5" />,
  confirmed: <CheckCircle2 className="size-3.5" />,
  delivered: <TrendingUp className="size-3.5" />,
  cancelled: <MessageSquare className="size-3.5" />,
};

export const Route = createFileRoute("/_authenticated/admin/orders")({
  head: () => ({
    meta: [{ title: "Orders — Admin — Maison Noir" }],
  }),
  loader: ({ context }) =>
    context.queryClient.ensureQueryData({
      queryKey: ["admin", "orders"],
      queryFn: async () => {
        const fn = useServerFn(getAdminOrders);
        return fn({});
      },
    }),
  component: AdminOrdersPage,
});

function AdminOrdersPage() {
  const queryClient = useQueryClient();
  const getOrders = useServerFn(getAdminOrders);
  const updateStatus = useServerFn(updateOrderStatus);
  const removeOrder = useServerFn(deleteOrder);
  const [filter, setFilter] = useState<OrderStatus | "all">("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: orders = [] } = useSuspenseQuery({
    queryKey: ["admin", "orders"],
    queryFn: async () => getOrders({}),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: OrderStatus }) => {
      return updateStatus({ orderId, status });
    },
    onSuccess: () => {
      toast.success("Order updated");
      queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to update order");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (orderId: string) => {
      return removeOrder({ orderId });
    },
    onSuccess: () => {
      toast.success("Order deleted");
      queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to delete order");
    },
  });

  const filtered = orders.filter((order) => filter === "all" || order.status === filter);
  const stats = {
    total: orders.length,
    new: orders.filter((o) => o.status === "new").length,
    revenue: orders.reduce((sum, o) => sum + Number(o.total), 0),
  };

  return (
    <div className="min-h-screen bg-muted/30 p-6">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-4xl">Orders</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Manage incoming orders and update status
          </p>
        </div>

        {/* Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="surface-card flex items-start justify-between p-5">
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                Total Orders
              </p>
              <p className="mt-2 font-display text-2xl">{stats.total}</p>
            </div>
            <TrendingUp className="size-5 text-gold" />
          </div>

          <div className="surface-card flex items-start justify-between p-5">
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                New Orders
              </p>
              <p className="mt-2 font-display text-2xl">{stats.new}</p>
            </div>
            <Clock className="size-5 text-blue-600" />
          </div>

          <div className="surface-card flex items-start justify-between p-5">
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                Revenue
              </p>
              <p className="mt-2 font-display text-2xl">{formatPrice(stats.revenue)}</p>
            </div>
            <TrendingUp className="size-5 text-green-600" />
          </div>
        </div>

        {/* Filter */}
        <div className="mb-6 flex items-center gap-3">
          <Select value={filter} onValueChange={(v) => setFilter(v as OrderStatus | "all")}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All orders</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="contacted">Contacted</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground">{filtered.length} orders</span>
        </div>

        {/* Orders List */}
        <div className="surface-card divide-y">
          {filtered.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-muted-foreground">No orders yet</p>
            </div>
          ) : (
            filtered.map((order) => (
              <div key={order.id} className="p-5">
                {/* Order Header */}
                <button
                  onClick={() =>
                    setExpandedId(expandedId === order.id ? null : order.id)
                  }
                  className="w-full text-left"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="font-display text-lg">{order.reference}</span>
                        <Badge
                          variant="outline"
                          className={`border ${statusColors[order.status]}`}
                        >
                          <span className="mr-1">{statusIcons[order.status]}</span>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                      </div>
                      <p className="mt-2 text-sm font-medium">{order.customer_name}</p>
                      <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="size-3.5" /> {order.phone}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {order.address} · {order.commune}, {order.wilaya}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-display text-lg">{formatPrice(Number(order.total))}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </button>

                {/* Order Details */}
                {expandedId === order.id && (
                  <div className="mt-5 border-t pt-5">
                    <h4 className="font-display text-sm">Items</h4>
                    <div className="mt-3 space-y-2 text-sm">
                      {order.order_items && order.order_items.length > 0 ? (
                        order.order_items.map((item) => (
                          <div key={item.id} className="flex justify-between">
                            <span>
                              {item.product_name} × {item.quantity}
                            </span>
                            <span className="font-medium">
                              {formatPrice(Number(item.price_at_purchase) * item.quantity)}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-muted-foreground">No items found</p>
                      )}
                    </div>

                    {order.notes && (
                      <div className="mt-4 border-t pt-4">
                        <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                          Customer Notes
                        </p>
                        <p className="mt-2 text-sm">{order.notes}</p>
                      </div>
                    )}

                    {/* Status Update */}
                    <div className="mt-4 border-t pt-4">
                      <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                        Update Status
                      </p>
                      <div className="mt-3 flex gap-2">
                        {(["new", "contacted", "confirmed", "delivered", "cancelled"] as const).map(
                          (status) => (
                            <Button
                              key={status}
                              size="sm"
                              variant={order.status === status ? "default" : "outline"}
                              disabled={
                                updateMutation.isPending ||
                                order.status === status ||
                                order.status === "cancelled"
                              }
                              onClick={() =>
                                updateMutation.mutate({ orderId: order.id, status })
                              }
                            >
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </Button>
                          )
                        )}
                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={deleteMutation.isPending}
                          onClick={() => {
                            if (
                              confirm(`Delete order ${order.reference}? This cannot be undone.`)
                            ) {
                              deleteMutation.mutate(order.id);
                            }
                          }}
                          className="ml-auto"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
