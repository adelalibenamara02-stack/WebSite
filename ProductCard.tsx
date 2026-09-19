import { Link } from "@tanstack/react-router";
import { Heart, ShoppingBag } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/lib/shop.functions";
import { cn } from "@/lib/utils";

function isNew(product: Product) {
  return Date.now() - new Date(product.created_at).getTime() < 1000 * 60 * 60 * 24 * 21;
}

export function ProductCard({ product }: { product: Product }) {
  const { add, wishlist, toggleWishlist } = useCart();
  const wished = wishlist.includes(product.id);
  const onSale = product.compare_at_price != null && product.compare_at_price > product.price;
  const soldOut = product.stock <= 0;
  const saving = onSale 
    ? Math.round(((product.compare_at_price! - product.price) / product.compare_at_price!) * 100)
    : 0;

  return (
    <article className="group surface-card relative flex flex-col overflow-hidden rounded-2xl transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]">
      <Link
        to="/product/$slug"
        params={{ slug: product.slug }}
        className="zoom-media relative block aspect-[4/5] bg-muted overflow-hidden"
      >
        {product.images[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
            No image
          </div>
        )}
        
        {/* Overlay gradient on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        
        <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
          {isNew(product) && (
            <Badge className="bg-blue-600 text-white shadow-lg animate-pulse">
              ✨ New
            </Badge>
          )}
          {onSale && (
            <Badge className="bg-gold text-gold-foreground font-bold shadow-lg">
              Save {saving}%
            </Badge>
          )}
          {!soldOut && product.stock <= 3 && !onSale && (
            <Badge variant="outline" className="bg-card/90 backdrop-blur border-gold/50 text-gold font-medium">
              ⚡ {product.stock} left
            </Badge>
          )}
          {soldOut && <Badge variant="destructive" className="shadow-lg">
            Out of stock
          </Badge>}
        </div>
      </Link>

      <button
        type="button"
        aria-label={wished ? "Remove from wishlist" : "Save to wishlist"}
        onClick={() => {
          toggleWishlist(product.id);
          toast.success(wished ? "Removed from wishlist" : "Saved to wishlist");
        }}
        className="absolute right-3 top-3 grid size-10 place-items-center rounded-full bg-card/90 backdrop-blur transition-all hover:scale-110 hover:bg-card shadow-lg hover:shadow-xl active:scale-95"
      >
        <Heart className={cn("size-5 transition-colors", wished ? "fill-gold text-gold" : "text-muted-foreground hover:text-gold")} />
      </button>

      <div className="flex flex-1 flex-col gap-2.5 p-4">
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-semibold">
          {product.category_name ?? "Collection"}
        </p>
        <Link
          to="/product/$slug"
          params={{ slug: product.slug }}
          className="font-display text-base leading-tight hover:text-gold transition-colors line-clamp-2"
        >
          {product.name}
        </Link>
        <div className="mt-auto flex items-end justify-between gap-2 pt-1">
          <div className="flex-1">
            <div className="flex items-baseline gap-2">
              <p className="font-display text-lg font-bold">{formatPrice(product.price)}</p>
              {onSale && (
                <p className="text-xs text-muted-foreground line-through">
                  {formatPrice(product.compare_at_price!)}
                </p>
              )}
            </div>
            {!soldOut && product.stock <= 5 && (
              <p className="text-[11px] text-gold mt-1 font-medium">
                {product.stock === 1 ? "Last item!" : `Only ${product.stock} left`}
              </p>
            )}
          </div>
          <Button
            size="icon"
            disabled={soldOut}
            aria-label="Add to cart"
            className={cn(
              "rounded-full transition-all hover:scale-110 active:scale-95 h-10 w-10",
              soldOut
                ? "opacity-50 cursor-not-allowed"
                : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover:shadow-xl"
            )}
            onClick={() => {
              add({
                productId: product.id,
                slug: product.slug,
                name: product.name,
                price: product.price,
                image: product.images[0] ?? null,
                stock: product.stock,
              });
              toast.success(`${product.name} added to cart`);
            }}
          >
            <ShoppingBag className="size-5" />
          </Button>
        </div>
      </div>
    </article>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="surface-card overflow-hidden">
      <div className="skeleton-shimmer aspect-[4/5]" />
      <div className="space-y-3 p-4">
        <div className="skeleton-shimmer h-3 w-20 rounded-full" />
        <div className="skeleton-shimmer h-4 w-3/4 rounded-full" />
        <div className="skeleton-shimmer h-5 w-24 rounded-full" />
      </div>
    </div>
  );
}
