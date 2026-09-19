import { Link, useRouterState } from "@tanstack/react-router";
import { ShoppingBag } from "lucide-react";

import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/format";

export function StickyMobileCart() {
  const { count, subtotal } = useCart();
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  if (count === 0 || pathname.startsWith("/checkout") || pathname.startsWith("/admin")) return null;

  return (
    <div className="fade-up fixed inset-x-3 bottom-3 z-40 md:hidden">
      <Link
        to="/checkout"
        className="flex items-center gap-3 rounded-full bg-primary px-5 py-3.5 text-primary-foreground shadow-[var(--shadow-lift)]"
      >
        <ShoppingBag className="size-5" />
        <span className="text-sm font-medium">
          {count} item{count === 1 ? "" : "s"}
        </span>
        <span className="ml-auto font-display text-sm">{formatPrice(subtotal)}</span>
        <span className="text-xs uppercase tracking-[0.15em] text-gold">Order</span>
      </Link>
    </div>
  );
}
