import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import {
  ArrowUpRight,
  BoxesIcon,
  Clock,
  DollarSign,
  LogOut,
  Package,
  TrendingUp,
} from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";

import { Button } from "@/components/ui/button";
import { catalogQueryOptions } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";
import { getAdminOrders } from "@/lib/shop.functions";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/")({
  head: () => ({
    meta: [{ title: "Admin Dashboard — Maison Noir" }],
  }),
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(catalogQueryOptions),
      context.queryClient.ensureQueryData({
        queryKey: ["admin", "orders"],
        queryFn: async () => {
          const fn = useServerFn(getAdminOrders);
          return fn({});
        },
      }),
    ]),
  component: AdminDashboard,
});

function AdminDashboard() {
  const navigate = useNavigate();
  const { data: catalog } = useSuspenseQuery(catalogQueryOptions);
  const { data: orders } = useSuspenseQuery({
    queryKey: ["admin", "orders"],
    queryFn: async () => {
      const fn = useServerFn(getAdminOrders);
      return fn({});
    },
  });

  const handleLogout = async () => {
    await supabase.auth.signOut();
    void navigate({ to: "/auth" });
  };

  const stats = {
    newOrders: orders.filter((o) => o.status === "new").length,
    revenue: orders.reduce((sum, o) => sum + Number(o.total), 0),
    products: catalog.products.length,
    lowStock: catalog.products.filter((p) => p.stock > 0 && p.stock <= 5).length,
  };

  const recentOrders = orders.slice(0, 5);

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="border-b bg-card p-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div>
            <h1 className="font-display text-3xl">Dashboard</h1>
            <p className="mt-1 text-sm text-muted-foreground">Welcome back to Maison Noir</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="mr-2 size-4" /> Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <div className="mx-auto max-w-6xl space-y-8">
          {/* Stats Grid */}
          <div className="grid gap-4 sm:grid-cols-4">
            <div className="surface-card p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                    New Orders
                  </p>
                  <p className="mt-2 font-display text-2xl">{stats.newOrders}</p>
                </div>
                <Clock className="size-5 text-blue-600" />
              </div>
            </div>

            <div className="surface-card p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                    Revenue (All)
                  </p>
                  <p className="mt-2 font-display text-2xl">{formatPrice(stats.revenue)}</p>
                </div>
                <DollarSign className="size-5 text-green-600" />
              </div>
            </div>

            <div className="surface-card p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                    Products
                  </p>
                  <p className="mt-2 font-display text-2xl">{stats.products}</p>
                </div>
                <Package className="size-5 text-gold" />
              </div>
            </div>

            <div className="surface-card p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                    Low Stock
                  </p>
                  <p className="mt-2 font-display text-2xl">{stats.lowStock}</p>
                </div>
                <TrendingUp className="size-5 text-yellow-600" />
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Link
              to="/admin/orders"
              className="surface-card group block p-6 transition-all hover:shadow-[var(--shadow-lift)]"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-display text-lg">Orders</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    View and manage customer orders
                  </p>
                </div>
                <ArrowUpRight className="size-5 text-gold opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
            </Link>

            <Link
              to="/admin/products"
              className="surface-card group block p-6 transition-all hover:shadow-[var(--shadow-lift)]"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-display text-lg">Products</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Manage inventory and product details
                  </p>
                </div>
                <ArrowUpRight className="size-5 text-gold opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
            </Link>
          </div>

          {/* Recent Orders */}
          <div className="surface-card">
            <div className="border-b p-6">
              <h2 className="font-display text-lg">Recent Orders</h2>
              <p className="mt-1 text-sm text-muted-foreground">Last 5 orders received</p>
            </div>

            {recentOrders.length === 0 ? (
              <div className="p-12 text-center">
                <BoxesIcon className="mx-auto size-8 text-muted-foreground opacity-40" />
                <p className="mt-2 text-sm text-muted-foreground">No orders yet</p>
              </div>
            ) : (
              <div className="divide-y">
                {recentOrders.map((order) => (
                  <Link
                    key={order.id}
                    to="/admin/orders"
                    className="flex items-center justify-between p-6 transition-colors hover:bg-muted/50"
                  >
                    <div>
                      <p className="font-display text-sm">{order.reference}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{order.customer_name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-display text-sm">{formatPrice(Number(order.total))}</p>
                      <p className="text-xs text-muted-foreground">
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
