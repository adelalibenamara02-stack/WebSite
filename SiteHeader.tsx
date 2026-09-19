import { Link } from "@tanstack/react-router";
import { Heart, Menu, Search, ShoppingBag, X } from "lucide-react";
import { useState } from "react";

import { useCart } from "@/lib/cart";
import { STORE } from "@/lib/format";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "Shop" },
  { to: "/cart", label: "Cart" },
] as const;

export function SiteHeader() {
  const { count, open } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4">
        <button
          className="rounded-full p-2 hover:bg-muted md:hidden"
          aria-label="Open menu"
          onClick={() => setMenuOpen((value) => !value)}
        >
          {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>

        <Link to="/" className="flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-full bg-primary font-display text-sm text-primary-foreground">
            M
          </span>
          <span className="font-display text-lg tracking-tight">{STORE.name}</span>
        </Link>

        <nav className="ml-6 hidden items-center gap-6 text-sm md:flex">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeProps={{ className: "text-gold" }}
              className="transition-colors hover:text-gold"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <Link to="/shop" aria-label="Search products" className="rounded-full p-2 hover:bg-muted">
            <Search className="size-5" />
          </Link>
          <Link to="/wishlist" aria-label="Wishlist" className="rounded-full p-2 hover:bg-muted">
            <Heart className="size-5" />
          </Link>
          <button
            onClick={open}
            aria-label="Open cart"
            className="relative rounded-full p-2 hover:bg-muted"
          >
            <ShoppingBag className="size-5" />
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid size-5 place-items-center rounded-full bg-gold text-[10px] font-semibold text-gold-foreground">
                {count}
              </span>
            )}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="fade-in-soft border-t bg-card px-4 py-3 md:hidden">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setMenuOpen(false)}
              className="block py-2 text-sm"
            >
              {item.label}
            </Link>
          ))}
          <Link to="/wishlist" onClick={() => setMenuOpen(false)} className="block py-2 text-sm">
            Wishlist
          </Link>
        </nav>
      )}
    </header>
  );
}
