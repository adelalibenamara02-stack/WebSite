import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { Heart, Minus, Plus, ShieldCheck, ShoppingBag, Truck } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { ProductCard } from "@/components/ProductCard";
import { Reveal } from "@/components/Reveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { catalogQueryOptions } from "@/lib/catalog";
import { formatPrice, stockLabel } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/product/$slug")({
  loader: async ({ context, params }) => {
    const catalog = await context.queryClient.ensureQueryData(catalogQueryOptions);
    const product = catalog.products.find((item) => item.slug === params.slug);
    if (!product) throw notFound();
    return { name: product.name, description: product.description };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Product unavailable — Maison Noir" }, { name: "robots", content: "noindex" }],
      };
    }
    const description = loaderData.description.slice(0, 160);
    return {
      meta: [
        { title: `${loaderData.name} — Maison Noir` },
        { name: "description", content: description },
        { property: "og:title", content: `${loaderData.name} — Maison Noir` },
        { property: "og:description", content: description },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <h1 className="font-display text-2xl">This product is no longer available</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        It may have sold out or been removed from the catalogue.
      </p>
      <Button asChild className="mt-6 rounded-full">
        <Link to="/shop">Back to the shop</Link>
      </Button>
    </div>
  ),
  component: ProductPage,
});

function ProductPage() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(catalogQueryOptions);
  const { add, wishlist, toggleWishlist, trackView, recentlyViewed } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  const product = data.products.find((item) => item.slug === slug);

  useEffect(() => {
    if (product) trackView(product.id);
  }, [product, trackView]);

  if (!product) return null;

  const related = data.products
    .filter((item) => item.id !== product.id && item.category_id === product.category_id)
    .slice(0, 4);
  const viewed = data.products
    .filter((item) => recentlyViewed.includes(item.id) && item.id !== product.id)
    .slice(0, 4);
  const wished = wishlist.includes(product.id);
  const onSale = product.compare_at_price != null && product.compare_at_price > product.price;
  const low = stockLabel(product.stock);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <nav className="mb-6 text-xs text-muted-foreground">
        <Link to="/" className="hover:text-gold">
          Home
        </Link>{" "}
        /{" "}
        <Link to="/shop" className="hover:text-gold">
          Shop
        </Link>{" "}
        / <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-3">
          <div className="zoom-media surface-card aspect-square bg-muted">
            {product.images[activeImage] ? (
              <img
                src={product.images[activeImage]}
                alt={product.name}
                width={1200}
                height={1200}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="grid h-full place-items-center text-sm text-muted-foreground">
                No image
              </div>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-3">
              {product.images.map((image, index) => (
                <button
                  key={image}
                  onClick={() => setActiveImage(index)}
                  className={cn(
                    "size-20 overflow-hidden rounded-xl border-2 transition-colors",
                    index === activeImage ? "border-gold" : "border-transparent",
                  )}
                >
                  <img src={image} alt="" loading="lazy" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="fade-up">
          <div className="flex flex-wrap gap-2">
            {product.category_name && <Badge variant="outline">{product.category_name}</Badge>}
            {onSale && <Badge className="bg-gold text-gold-foreground">Sale</Badge>}
            {product.best_seller && <Badge className="bg-primary text-primary-foreground">Best seller</Badge>}
          </div>

          <h1 className="mt-4 font-display text-3xl md:text-4xl">{product.name}</h1>

          <div className="mt-4 flex items-end gap-3">
            <p className="font-display text-3xl">{formatPrice(product.price)}</p>
            {onSale && (
              <p className="pb-1 text-sm text-muted-foreground line-through">
                {formatPrice(product.compare_at_price!)}
              </p>
            )}
          </div>

          <p className="mt-5 text-sm leading-relaxed text-muted-foreground">{product.description}</p>

          <p
            className={cn(
              "mt-5 text-sm",
              product.stock <= 0 ? "text-destructive" : low ? "text-gold" : "text-success",
            )}
          >
            {product.stock <= 0
              ? "Out of stock — check back soon"
              : (low ?? `In stock · ${product.stock} available`)}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="flex items-center rounded-full border">
              <button
                aria-label="Decrease quantity"
                className="p-3 hover:text-gold"
                onClick={() => setQuantity((value) => Math.max(1, value - 1))}
              >
                <Minus className="size-4" />
              </button>
              <span className="w-10 text-center">{quantity}</span>
              <button
                aria-label="Increase quantity"
                disabled={quantity >= product.stock}
                className="p-3 hover:text-gold disabled:opacity-40"
                onClick={() => setQuantity((value) => Math.min(product.stock, value + 1))}
              >
                <Plus className="size-4" />
              </button>
            </div>

            <Button
              size="lg"
              disabled={product.stock <= 0}
              className="flex-1 rounded-full"
              onClick={() => {
                add(
                  {
                    productId: product.id,
                    slug: product.slug,
                    name: product.name,
                    price: product.price,
                    image: product.images[0] ?? null,
                    stock: product.stock,
                  },
                  quantity,
                );
                toast.success(`${product.name} added to cart`);
              }}
            >
              <ShoppingBag className="mr-2 size-4" /> Add to cart
            </Button>

            <Button
              size="lg"
              variant="outline"
              aria-label="Save to wishlist"
              className="rounded-full"
              onClick={() => toggleWishlist(product.id)}
            >
              <Heart className={cn("size-4", wished && "fill-gold text-gold")} />
            </Button>
          </div>

          <div className="mt-8 grid gap-3 text-sm text-muted-foreground">
            <p className="inline-flex items-center gap-2">
              <Truck className="size-4 text-gold" /> Delivery in 48h across Algeria
            </p>
            <p className="inline-flex items-center gap-2">
              <ShieldCheck className="size-4 text-gold" /> Pay on delivery — we call to confirm
            </p>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="py-14">
          <h2 className="mb-6 font-display text-2xl">You may also like</h2>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {related.map((item, index) => (
              <Reveal key={item.id} delay={index * 60}>
                <ProductCard product={item} />
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {viewed.length > 0 && (
        <section className="pb-14">
          <h2 className="mb-6 font-display text-2xl">Recently viewed</h2>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {viewed.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
