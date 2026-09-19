import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { Heart } from "lucide-react";

import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { catalogQueryOptions } from "@/lib/catalog";
import { STORE } from "@/lib/format";

export const Route = createFileRoute("/wishlist")({
  head: () => ({
    meta: [
      { title: `Wishlist — ${STORE.name}` },
      {
        name: "description",
        content: "Products you saved for later, kept on this device.",
      },
      { property: "og:title", content: `Wishlist — ${STORE.name}` },
      { property: "og:description", content: "Your saved products, ready when you are." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(catalogQueryOptions),
  component: WishlistPage,
});

function WishlistPage() {
  const { data } = useSuspenseQuery(catalogQueryOptions);
  const { wishlist } = useCart();
  const saved = data.products.filter((product) => wishlist.includes(product.id));

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-display text-3xl md:text-4xl">Your wishlist</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Saved on this device — no account needed.
      </p>

      {saved.length === 0 ? (
        <div className="mx-auto max-w-md py-20 text-center">
          <div className="mx-auto grid size-16 place-items-center rounded-full bg-muted">
            <Heart className="size-6 text-muted-foreground" />
          </div>
          <h2 className="mt-5 font-display text-2xl">Nothing saved yet</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Tap the heart on any product to keep it here for later.
          </p>
          <Button asChild className="mt-6 rounded-full">
            <Link to="/shop">Browse products</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {saved.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
