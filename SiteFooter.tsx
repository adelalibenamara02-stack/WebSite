import { Link } from "@tanstack/react-router";
import { Clock, Mail, Phone, ShieldCheck } from "lucide-react";

import { STORE } from "@/lib/format";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t bg-card">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-display text-lg">{STORE.name}</p>
          <p className="mt-2 text-sm text-muted-foreground">{STORE.tagline}</p>
          <p className="mt-4 inline-flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="size-4 text-gold" /> Cash on delivery, no prepayment
          </p>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Shop</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link to="/shop" className="hover:text-gold">
                All products
              </Link>
            </li>
            <li>
              <Link to="/cart" className="hover:text-gold">
                Cart
              </Link>
            </li>
            <li>
              <Link to="/wishlist" className="hover:text-gold">
                Wishlist
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Contact</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <Phone className="size-4 text-gold" />
              <a href={`tel:${STORE.phone.replace(/\s/g, "")}`} className="hover:text-gold">
                {STORE.phone}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="size-4 text-gold" />
              <a href={`mailto:${STORE.email}`} className="hover:text-gold">
                {STORE.email}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Clock className="size-4 text-gold" />
              {STORE.hours}
            </li>
          </ul>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">How it works</p>
          <ol className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>1. Add items to your cart</li>
            <li>2. Send your details — no account needed</li>
            <li>3. We call you to confirm delivery</li>
          </ol>
        </div>
      </div>
      <div className="border-t px-4 py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} {STORE.name}. Delivered across Algeria.{" "}
        <Link to="/auth" className="hover:text-gold">
          Owner access
        </Link>
      </div>
    </footer>
  );
}
