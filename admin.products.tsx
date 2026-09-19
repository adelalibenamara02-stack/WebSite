import { useSuspenseQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Edit2, Loader2, Plus, Trash2, TrendingUp } from "lucide-react";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import z from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formatPrice } from "@/lib/format";
import { catalogQueryOptions } from "@/lib/catalog";
import {
  updateProduct,
  createProduct,
  deleteProduct,
  type Product,
} from "@/lib/shop.functions";

export const Route = createFileRoute("/_authenticated/admin/products")({
  head: () => ({
    meta: [{ title: "Products — Admin — Maison Noir" }],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(catalogQueryOptions),
  component: AdminProductsPage,
});

type ProductFormData = {
  name: string;
  price: string;
  stock: string;
  compare_at_price?: string;
  featured: boolean;
  best_seller: boolean;
};

function AdminProductsPage() {
  const queryClient = useQueryClient();
  const { data } = useSuspenseQuery(catalogQueryOptions);
  const updateFn = useServerFn(updateProduct);
  const createFn = useServerFn(createProduct);
  const deleteFn = useServerFn(deleteProduct);

  const [isOpen, setIsOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    price: "",
    stock: "",
    featured: false,
    best_seller: false,
  });

  const updateMutation = useMutation({
    mutationFn: async (product: Product) => {
      return updateFn({
        productId: product.id,
        data: {
          name: formData.name,
          price: Number(formData.price),
          stock: Number(formData.stock),
          compare_at_price: formData.compare_at_price
            ? Number(formData.compare_at_price)
            : null,
          featured: formData.featured,
          best_seller: formData.best_seller,
        },
      });
    },
    onSuccess: () => {
      toast.success("Product updated");
      queryClient.invalidateQueries({ queryKey: ["catalog"] });
      setIsOpen(false);
      resetForm();
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to update product");
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      return createFn({
        data: {
          name: formData.name,
          price: Number(formData.price),
          stock: Number(formData.stock),
          compare_at_price: formData.compare_at_price
            ? Number(formData.compare_at_price)
            : null,
          featured: formData.featured,
          best_seller: formData.best_seller,
          slug: formData.name.toLowerCase().replace(/\s+/g, "-"),
          description: "",
          images: [],
          category_id: null,
        },
      });
    },
    onSuccess: () => {
      toast.success("Product created");
      queryClient.invalidateQueries({ queryKey: ["catalog"] });
      setIsOpen(false);
      resetForm();
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to create product");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (productId: string) => {
      return deleteFn({ productId });
    },
    onSuccess: () => {
      toast.success("Product deleted");
      queryClient.invalidateQueries({ queryKey: ["catalog"] });
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to delete product");
    },
  });

  function resetForm() {
    setFormData({
      name: "",
      price: "",
      stock: "",
      featured: false,
      best_seller: false,
    });
    setEditingProduct(null);
  }

  function openEditDialog(product: Product) {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: String(product.price),
      stock: String(product.stock),
      compare_at_price: product.compare_at_price ? String(product.compare_at_price) : "",
      featured: product.featured,
      best_seller: product.best_seller,
    });
    setIsOpen(true);
  }

  function openCreateDialog() {
    setEditingProduct(null);
    resetForm();
    setIsOpen(true);
  }

  const stats = {
    total: data.products.length,
    inStock: data.products.filter((p) => p.stock > 0).length,
    lowStock: data.products.filter((p) => p.stock > 0 && p.stock <= 5).length,
  };

  return (
    <div className="min-h-screen bg-muted/30 p-6">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl">Products</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Manage inventory and product details
            </p>
          </div>
          <Button onClick={openCreateDialog} size="lg" className="rounded-full">
            <Plus className="mr-2 size-4" /> New Product
          </Button>
        </div>

        {/* Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="surface-card flex items-start justify-between p-5">
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                Total Products
              </p>
              <p className="mt-2 font-display text-2xl">{stats.total}</p>
            </div>
            <TrendingUp className="size-5 text-gold" />
          </div>

          <div className="surface-card flex items-start justify-between p-5">
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                In Stock
              </p>
              <p className="mt-2 font-display text-2xl">{stats.inStock}</p>
            </div>
            <TrendingUp className="size-5 text-green-600" />
          </div>

          <div className="surface-card flex items-start justify-between p-5">
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                Low Stock (&lt;= 5)
              </p>
              <p className="mt-2 font-display text-2xl">{stats.lowStock}</p>
            </div>
            <TrendingUp className="size-5 text-yellow-600" />
          </div>
        </div>

        {/* Products Table */}
        <div className="surface-card divide-y overflow-hidden rounded-2xl">
          <div className="grid grid-cols-5 gap-4 bg-muted/50 px-5 py-4 text-xs uppercase tracking-[0.14em] text-muted-foreground">
            <div>Name</div>
            <div>Price</div>
            <div>Stock</div>
            <div>Flags</div>
            <div className="text-right">Actions</div>
          </div>

          {data.products.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-muted-foreground">No products yet</p>
            </div>
          ) : (
            data.products.map((product) => (
              <div
                key={product.id}
                className="grid grid-cols-5 gap-4 px-5 py-4 items-center border-t first:border-t-0"
              >
                <div className="min-w-0">
                  <p className="truncate font-display text-sm">{product.name}</p>
                  <p className="text-xs text-muted-foreground">{product.slug}</p>
                </div>
                <div>
                  <p className="font-medium">{formatPrice(product.price)}</p>
                  {product.compare_at_price && (
                    <p className="text-xs text-muted-foreground line-through">
                      {formatPrice(product.compare_at_price)}
                    </p>
                  )}
                </div>
                <div>
                  <p
                    className={`font-medium ${
                      product.stock <= 0
                        ? "text-destructive"
                        : product.stock <= 5
                          ? "text-yellow-600"
                          : "text-green-600"
                    }`}
                  >
                    {product.stock}
                  </p>
                </div>
                <div className="flex gap-1">
                  {product.featured && (
                    <span className="inline-block rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
                      Featured
                    </span>
                  )}
                  {product.best_seller && (
                    <span className="inline-block rounded-full bg-gold/20 px-2 py-1 text-xs font-medium text-gold">
                      Bestseller
                    </span>
                  )}
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEditDialog(product)}
                  >
                    <Edit2 className="size-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    disabled={deleteMutation.isPending}
                    onClick={() => {
                      if (confirm(`Delete "${product.name}"? This cannot be undone.`)) {
                        deleteMutation.mutate(product.id);
                      }
                    }}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Edit/Create Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? "Edit Product" : "Create Product"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label className="text-xs uppercase tracking-[0.14em]">Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-2 rounded-xl"
                placeholder="Product name"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs uppercase tracking-[0.14em]">Price</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="mt-2 rounded-xl"
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label className="text-xs uppercase tracking-[0.14em]">Compare Price</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.compare_at_price}
                  onChange={(e) =>
                    setFormData({ ...formData, compare_at_price: e.target.value })
                  }
                  className="mt-2 rounded-xl"
                  placeholder="Optional"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs uppercase tracking-[0.14em]">Stock</Label>
              <Input
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                className="mt-2 rounded-xl"
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) =>
                    setFormData({ ...formData, featured: e.target.checked })
                  }
                />
                <span className="text-sm">Featured</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.best_seller}
                  onChange={(e) =>
                    setFormData({ ...formData, best_seller: e.target.checked })
                  }
                />
                <span className="text-sm">Best Seller</span>
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsOpen(false)}
                className="flex-1 rounded-full"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (editingProduct) {
                    updateMutation.mutate(editingProduct);
                  } else {
                    createMutation.mutate();
                  }
                }}
                disabled={updateMutation.isPending || createMutation.isPending}
                className="flex-1 rounded-full"
              >
                {updateMutation.isPending || createMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" /> Saving…
                  </>
                ) : (
                  (editingProduct ? "Update" : "Create") + " Product"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
