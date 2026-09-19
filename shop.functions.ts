import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

import type { Database } from "@/integrations/supabase/types";

export type Category = {
  id: string;
  name: string;
  slug: string;
  image: string | null;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  images: string[];
  price: number;
  compare_at_price: number | null;
  stock: number;
  featured: boolean;
  best_seller: boolean;
  created_at: string;
  category_id: string | null;
  category_name: string | null;
  category_slug: string | null;
};

function publicClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  const url = process.env["SUPABASE_URL"]!;
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) {
          headers.delete("Authorization");
        }
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      },
    },
  });
}

export const getCatalog = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = publicClient();

  const [productsRes, categoriesRes] = await Promise.all([
    supabase
      .from("products")
      .select(
        "id, name, slug, description, images, price, compare_at_price, stock, featured, best_seller, created_at, category_id, categories(name, slug)",
      )
      .eq("active", true)
      .order("created_at", { ascending: false }),
    supabase.from("categories").select("id, name, slug, image").order("name"),
  ]);

  if (productsRes.error) throw new Error(productsRes.error.message);
  if (categoriesRes.error) throw new Error(categoriesRes.error.message);

  const products: Product[] = (productsRes.data ?? []).map((row) => {
    const category = row.categories as { name: string; slug: string } | null;
    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      description: row.description,
      images: row.images ?? [],
      price: Number(row.price),
      compare_at_price: row.compare_at_price == null ? null : Number(row.compare_at_price),
      stock: row.stock,
      featured: row.featured,
      best_seller: row.best_seller,
      created_at: row.created_at,
      category_id: row.category_id,
      category_name: category?.name ?? null,
      category_slug: category?.slug ?? null,
    };
  });

  return { products, categories: (categoriesRes.data ?? []) as Category[] };
});

const orderSchema = z.object({
  customer_name: z.string().trim().min(2).max(120),
  phone: z
    .string()
    .trim()
    .min(8)
    .max(25)
    .regex(/^[0-9+\s-]+$/, "Invalid phone number"),
  address: z.string().trim().min(4).max(400),
  wilaya: z.string().trim().min(2).max(80),
  commune: z.string().trim().min(2).max(80),
  notes: z.string().trim().max(600).optional().default(""),
  items: z
    .array(
      z.object({
        product_id: z.string().uuid(),
        quantity: z.number().int().min(1).max(99),
      }),
    )
    .min(1)
    .max(50),
});

export type OrderInput = z.input<typeof orderSchema>;

function friendlyError(message: string): string {
  if (message.includes("OUT_OF_STOCK")) {
    const name = message.split("OUT_OF_STOCK:")[1]?.trim();
    return name
      ? `Sorry, "${name}" no longer has enough stock. Please update your cart.`
      : "One of the items in your cart just sold out. Please update your cart.";
  }
  if (message.includes("PRODUCT_UNAVAILABLE"))
    return "An item in your cart is no longer available. Please remove it and try again.";
  if (message.includes("EMPTY_CART")) return "Your cart is empty.";
  if (message.includes("INVALID_PHONE")) return "Please enter a valid phone number.";
  return "We couldn't place your order. Please try again in a moment.";
}

export const submitOrder = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => orderSchema.parse(data))
  .handler(async ({ data }) => {
    const supabase = publicClient();

    const { data: result, error } = await supabase.rpc("place_order", {
      _customer_name: data.customer_name,
      _phone: data.phone,
      _address: data.address,
      _wilaya: data.wilaya,
      _commune: data.commune,
      _notes: data.notes ?? "",
      _items: data.items,
    });

    if (error) {
      console.error("[place_order]", error.message);
      throw new Error(friendlyError(error.message));
    }

    const row = Array.isArray(result) ? result[0] : result;
    if (!row) throw new Error("We couldn't place your order. Please try again.");

    return {
      reference: row.reference as string,
      total: Number(row.total),
    };
  });

// Admin functions
export const getAdminOrders = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = publicClient();

  const { data, error } = await supabase
    .from("orders")
    .select(
      `
      id,
      reference,
      customer_name,
      phone,
      address,
      wilaya,
      commune,
      notes,
      total,
      status,
      created_at,
      order_items (
        id,
        product_name,
        quantity,
        price_at_purchase
      )
    `
    )
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
});

const updateOrderStatusSchema = z.object({
  orderId: z.string().uuid(),
  status: z.enum(["new", "contacted", "confirmed", "delivered", "cancelled"]),
});

export const updateOrderStatus = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => updateOrderStatusSchema.parse(data))
  .handler(async ({ data }) => {
    const supabase = publicClient();

    const { error } = await supabase
      .from("orders")
      .update({ status: data.status })
      .eq("id", data.orderId);

    if (error) throw new Error(error.message);
    return { success: true };
  });

const deleteOrderSchema = z.object({
  orderId: z.string().uuid(),
});

export const deleteOrder = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => deleteOrderSchema.parse(data))
  .handler(async ({ data }) => {
    const supabase = publicClient();

    const { error } = await supabase
      .from("orders")
      .delete()
      .eq("id", data.orderId);

    if (error) throw new Error(error.message);
    return { success: true };
  });

// Product management functions
const updateProductSchema = z.object({
  productId: z.string().uuid(),
  data: z.object({
    name: z.string().min(1),
    price: z.number().min(0),
    stock: z.number().int().min(0),
    compare_at_price: z.number().min(0).nullable().optional(),
    featured: z.boolean(),
    best_seller: z.boolean(),
  }),
});

export const updateProduct = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => updateProductSchema.parse(data))
  .handler(async ({ data }) => {
    const supabase = publicClient();

    const { error } = await supabase
      .from("products")
      .update({
        name: data.data.name,
        price: data.data.price,
        stock: data.data.stock,
        compare_at_price: data.data.compare_at_price,
        featured: data.data.featured,
        best_seller: data.data.best_seller,
      })
      .eq("id", data.productId);

    if (error) throw new Error(error.message);
    return { success: true };
  });

const createProductSchema = z.object({
  data: z.object({
    name: z.string().min(1),
    slug: z.string().min(1),
    description: z.string(),
    images: z.array(z.string()),
    price: z.number().min(0),
    stock: z.number().int().min(0),
    compare_at_price: z.number().min(0).nullable().optional(),
    featured: z.boolean(),
    best_seller: z.boolean(),
    category_id: z.string().uuid().nullable().optional(),
  }),
});

export const createProduct = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => createProductSchema.parse(data))
  .handler(async ({ data }) => {
    const supabase = publicClient();

    const { error } = await supabase.from("products").insert({
      name: data.data.name,
      slug: data.data.slug,
      description: data.data.description,
      images: data.data.images,
      price: data.data.price,
      stock: data.data.stock,
      compare_at_price: data.data.compare_at_price,
      featured: data.data.featured,
      best_seller: data.data.best_seller,
      category_id: data.data.category_id,
      active: true,
    });

    if (error) throw new Error(error.message);
    return { success: true };
  });

const deleteProductSchema = z.object({
  productId: z.string().uuid(),
});

export const deleteProduct = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => deleteProductSchema.parse(data))
  .handler(async ({ data }) => {
    const supabase = publicClient();

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", data.productId);

    if (error) throw new Error(error.message);
    return { success: true };
  });
