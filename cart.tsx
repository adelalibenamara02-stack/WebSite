import { Link, createFileRoute } from "@tanstack/react-router";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/format";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your cart — Maison Noir" },
      {
        name: "description",
        content: "Review your selected items, adjust quantities and continue to the order form.",
      },
      { property: "og:title", content: "Your cart — Maison Noir" },
      { property: "og:description", content: "Review your items and order in under a minute." },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { lines, subtotal, setQuantity, remove, clear } = useCart();

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <div className="mx-auto grid size-16 place-items-center rounded-full bg-muted">
          <ShoppingBag className="size-6 text-muted-foreground" />
        </div>
        <h1 className="mt-5 font-display text-2xl">Your cart is empty</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Browse the collection and add the pieces you like.
        </p>
        <Button asChild className="mt-6 rounded-full">
          <Link to="/shop">Start shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="font-display text-3xl">Your cart</h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          {lines.map((line) => (
            <div key={line.productId} className="surface-card flex gap-4 p-4">
              <Link
                to="/product/$slug"
                params={{ slug: line.slug }}
                className="size-24 shrink-0 overflow-hidden rounded-xl bg-muted"
              >
                {line.image && (
                  <img src={line.image} alt={line.name} loading="lazy" className="h-full w-full object-cover" />
                )}
              </Link>
              <div className="flex-1">
                <Link
                  to="/product/$slug"
                  params={{ slug: line.slug }}
                  className="font-display text-base hover:text-gold"
                >
                  {line.name}
                </Link>
                <p className="mt-1 text-sm text-muted-foreground">{formatPrice(line.price)}</p>
                <div className="mt-3 flex items-center gap-3">
                  <div className="flex items-center rounded-full border">
                    <button
                      aria-label="Decrease quantity"
                      className="p-2 hover:text-gold"
                      onClick={() => setQuantity(line.productId, line.quantity - 1)}
                    >
                      <Minus className="size-3.5" />
                    </button>
                    <span className="w-8 text-center text-sm">{line.quantity}</span>
                    <button
                      aria-label="Increase quantity"
                      disabled={line.quantity >= line.stock}
                      className="p-2 hover:text-gold disabled:opacity-40"
                      onClick={() => setQuantity(line.productId, line.quantity + 1)}
                    >
                      <Plus className="size-3.5" />
                    </button>
                  </div>
                  <span className="text-sm font-medium">{formatPrice(line.price * line.quantity)}</span>
                  <button
                    aria-label="Remove item"
                    className="ml-auto rounded-full p-2 text-muted-foreground hover:text-destructive"
                    onClick={() => remove(line.productId)}
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
                {line.quantity >= line.stock && (
                  <p className="mt-2 text-xs text-gold">
                    Only {line.stock} item{line.stock === 1 ? "" : "s"} left in stock
                  </p>
                )}
              </div>
            </div>
          ))}
          <button onClick={clear} className="text-xs text-muted-foreground hover:text-destructive">
            Clear cart
          </button>
        </div>

        <aside className="surface-card h-fit space-y-4 p-5">
          <h2 className="font-display text-lg">Order summary</h2>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Delivery</span>
            <span>Confirmed by phone</span>
          </div>
          <div className="flex justify-between border-t pt-4 font-display text-lg">
            <span>Total</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <Button asChild size="lg" className="w-full rounded-full">
            <Link to="/checkout">Continue to order</Link>
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            No online payment. You pay on delivery.
          </p>
        </aside>
      </div>
    </div>
  );
}
