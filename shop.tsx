import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useMemo } from "react";
import { z } from "zod";

import { ProductCard, ProductCardSkeleton } from "@/components/ProductCard";
import { Reveal } from "@/components/Reveal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { catalogQueryOptions } from "@/lib/catalog";
import { cn } from "@/lib/utils";

const searchSchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  sort: z.enum(["newest", "price-asc", "price-desc", "name"]).optional(),
  stock: z.enum(["all", "in"]).optional(),
});

export const Route = createFileRoute("/shop")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Shop all products — Maison Noir" },
      {
        name: "description",
        content:
          "Browse every watch, fragrance, leather piece and audio product in stock. Search, filter and order with delivery across Algeria.",
      },
      { property: "og:title", content: "Shop all products — Maison Noir" },
      {
        property: "og:description",
        content: "Search and filter our full catalogue. Cash on delivery, phone confirmation.",
      },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(catalogQueryOptions),
  pendingComponent: () => (
    <div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 px-4 py-14 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  ),
  component: Shop,
});

function Shop() {
  const { data } = useSuspenseQuery(catalogQueryOptions);
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });

  const query = search.q ?? "";
  const sort = search.sort ?? "newest";
  const stockFilter = search.stock ?? "all";

  const products = useMemo(() => {
    const term = query.trim().toLowerCase();
    let list = data.products.filter((product) => {
      const matchesTerm =
        !term ||
        product.name.toLowerCase().includes(term) ||
        product.description.toLowerCase().includes(term) ||
        (product.category_name ?? "").toLowerCase().includes(term);
      const matchesCategory = !search.category || product.category_slug === search.category;
      const matchesStock = stockFilter === "all" || product.stock > 0;
      return matchesTerm && matchesCategory && matchesStock;
    });

    list = [...list].sort((a, b) => {
      if (sort === "price-asc") return a.price - b.price;
      if (sort === "price-desc") return b.price - a.price;
      if (sort === "name") return a.name.localeCompare(b.name);
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
    return list;
  }, [data.products, query, search.category, sort, stockFilter]);

  const activeFilters = Boolean(query || search.category || stockFilter === "in" || sort !== "newest");

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <header className="mb-8">
        <h1 className="font-display text-3xl md:text-4xl">The shop</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {products.length} product{products.length === 1 ? "" : "s"} available for delivery.
        </p>
      </header>

      <div className="surface-card mb-8 space-y-4 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            placeholder="Search products…"
            className="rounded-full pl-9"
            onChange={(event) =>
              navigate({
                search: (previous) => ({ ...previous, q: event.target.value || undefined }),
                replace: true,
              })
            }
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => navigate({ search: (previous) => ({ ...previous, category: undefined }) })}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-xs transition-colors",
              !search.category ? "bg-primary text-primary-foreground" : "hover:border-gold",
            )}
          >
            All
          </button>
          {data.categories.map((category) => (
            <button
              key={category.id}
              onClick={() =>
                navigate({ search: (previous) => ({ ...previous, category: category.slug }) })
              }
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-xs transition-colors",
                search.category === category.slug
                  ? "bg-primary text-primary-foreground"
                  : "hover:border-gold",
              )}
            >
              {category.name}
            </button>
          ))}

          <div className="ml-auto flex items-center gap-2">
            <SlidersHorizontal className="size-4 text-muted-foreground" />
            <Select
              value={stockFilter}
              onValueChange={(value) =>
                navigate({
                  search: (previous) => ({
                    ...previous,
                    stock: value === "all" ? undefined : ("in" as const),
                  }),
                })
              }
            >
              <SelectTrigger className="w-[150px] rounded-full text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All items</SelectItem>
                <SelectItem value="in">In stock only</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={sort}
              onValueChange={(value) =>
                navigate({
                  search: (previous) => ({
                    ...previous,
                    sort: value === "newest" ? undefined : (value as "price-asc"),
                  }),
                })
              }
            >
              <SelectTrigger className="w-[160px] rounded-full text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest first</SelectItem>
                <SelectItem value="price-asc">Price: low to high</SelectItem>
                <SelectItem value="price-desc">Price: high to low</SelectItem>
                <SelectItem value="name">Name A–Z</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {activeFilters && (
          <button
            onClick={() => navigate({ search: {} })}
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-gold"
          >
            <X className="size-3.5" /> Clear filters
          </button>
        )}
      </div>

      {products.length === 0 ? (
        <div className="surface-card flex flex-col items-center gap-3 p-12 text-center">
          <p className="font-display text-lg">No products match your search</p>
          <p className="text-sm text-muted-foreground">
            Try a different word, or browse the whole collection.
          </p>
          <Button className="rounded-full" onClick={() => navigate({ search: {} })}>
            Reset filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {products.map((product, index) => (
            <Reveal key={product.id} delay={Math.min(index, 8) * 50}>
              <ProductCard product={product} />
            </Reveal>
          ))}
        </div>
      )}

      <p className="mt-10 text-center text-sm text-muted-foreground">
        Can't find what you need?{" "}
        <Link to="/" className="text-gold hover:underline">
          Contact us
        </Link>{" "}
        and we'll source it.
      </p>
    </div>
  );
}
