import { Link } from "@tanstack/react-router";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/format";

export function CartDrawer() {
  const { isOpen, close, lines, subtotal, setQuantity, remove, count } = useCart();

  return (
    <div className="pointer-events-none fixed inset-0 z-50" aria-hidden={!isOpen}>
      <div
        onClick={close}
        className={`absolute inset-0 bg-primary/40 backdrop-blur-sm transition-opacity duration-400 ${
          isOpen ? "pointer-events-auto opacity-100" : "opacity-0"
        }`}
      />
      <aside
        role="dialog"
        aria-label="Shopping cart"
        className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-card shadow-[var(--shadow-lift)] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isOpen ? "pointer-events-auto translate-x-0" : "translate-x-full"
        }`}
      >
        <header className="flex items-center justify-between border-b px-5 py-4">
          <h2 className="font-display text-lg">Your cart ({count})</h2>
          <button onClick={close} aria-label="Close cart" className="rounded-full p-2 hover:bg-muted">
            <X className="size-4" />
          </button>
        </header>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <div className="grid size-16 place-items-center rounded-full bg-muted">
              <ShoppingBag className="size-6 text-muted-foreground" />
            </div>
            <div>
              <p className="font-display text-base">Your cart is empty</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Add a piece you love and we will call you to confirm.
              </p>
            </div>
            <Button asChild onClick={close} className="rounded-full">
              <Link to="/shop">Browse the shop</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
              {lines.map((line) => (
                <div key={line.productId} className="flex gap-3">
                  <Link
                    to="/product/$slug"
                    params={{ slug: line.slug }}
                    onClick={close}
                    className="size-20 shrink-0 overflow-hidden rounded-xl bg-muted"
                  >
                    {line.image && (
                      <img src={line.image} alt={line.name} className="h-full w-full object-cover" />
                    )}
                  </Link>
                  <div className="flex-1">
                    <p className="text-sm font-medium leading-snug">{line.name}</p>
                    <p className="mt-0.5 text-sm text-muted-foreground">{formatPrice(line.price)}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex items-center rounded-full border">
                        <button
                          aria-label="Decrease quantity"
                          className="p-1.5 hover:text-gold"
                          onClick={() => setQuantity(line.productId, line.quantity - 1)}
                        >
                          <Minus className="size-3.5" />
                        </button>
                        <span className="w-7 text-center text-sm">{line.quantity}</span>
                        <button
                          aria-label="Increase quantity"
                          disabled={line.quantity >= line.stock}
                          className="p-1.5 hover:text-gold disabled:opacity-40"
                          onClick={() => setQuantity(line.productId, line.quantity + 1)}
                        >
                          <Plus className="size-3.5" />
                        </button>
                      </div>
                      <button
                        aria-label="Remove item"
                        className="ml-auto rounded-full p-2 text-muted-foreground hover:text-destructive"
                        onClick={() => remove(line.productId)}
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                    {line.quantity >= line.stock && (
                      <p className="mt-1 text-xs text-gold">Max available stock reached</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <footer className="space-y-3 border-t px-5 py-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-display text-lg">{formatPrice(subtotal)}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Pay on delivery — we call you to confirm every order.
              </p>
              <div className="grid gap-2">
                <Button asChild size="lg" className="rounded-full" onClick={close}>
                  <Link to="/checkout">Complete order</Link>
                </Button>
                <Button asChild variant="outline" className="rounded-full" onClick={close}>
                  <Link to="/cart">View cart</Link>
                </Button>
              </div>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}
