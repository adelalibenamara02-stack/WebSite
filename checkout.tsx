import { useMutation } from "@tanstack/react-query";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { AlertTriangle, Loader2, Lock, PhoneCall, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/lib/cart";
import { STORE, WILAYAS, formatPrice } from "@/lib/format";
import { saveReceipt } from "@/lib/order-receipt";
import { submitOrder } from "@/lib/shop.functions";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: `Checkout — ${STORE.name}` },
      {
        name: "description",
        content:
          "Enter your delivery details and place your order. No account, no prepayment — we call you to confirm.",
      },
      { property: "og:title", content: `Checkout — ${STORE.name}` },
      {
        property: "og:description",
        content: "Place your order in under a minute. Pay on delivery across Algeria.",
      },
    ],
  }),
  component: CheckoutPage,
});

type Errors = Partial<Record<"customer_name" | "phone" | "wilaya" | "commune" | "address", string>>;

function CheckoutPage() {
  const { lines, subtotal, clear } = useCart();
  const navigate = useNavigate();
  const placeOrder = useServerFn(submitOrder);

  const [form, setForm] = useState({
    customer_name: "",
    phone: "",
    wilaya: "",
    commune: "",
    address: "",
    notes: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [failure, setFailure] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async () => {
      return placeOrder({
        data: {
          customer_name: form.customer_name,
          phone: form.phone,
          wilaya: form.wilaya,
          commune: form.commune,
          address: form.address,
          notes: form.notes,
          items: lines.map((line) => ({ product_id: line.productId, quantity: line.quantity })),
        },
      });
    },
    onSuccess: (result) => {
      saveReceipt({
        reference: result.reference,
        total: result.total,
        customer_name: form.customer_name,
        phone: form.phone,
        wilaya: form.wilaya,
        commune: form.commune,
        address: form.address,
        items: lines.map((line) => ({
          name: line.name,
          quantity: line.quantity,
          price: line.price,
        })),
      });
      clear();
      void navigate({ to: "/order-confirmed" });
    },
    onError: (error: Error) => {
      setFailure(error.message);
      toast.error(error.message);
    },
  });

  function validate(): boolean {
    const next: Errors = {};
    if (form.customer_name.trim().length < 2) next.customer_name = "Please enter your full name.";
    if (!/^[0-9+\s-]{8,25}$/.test(form.phone.trim()))
      next.phone = "Enter a valid phone number we can call.";
    if (!form.wilaya) next.wilaya = "Select your wilaya.";
    if (form.commune.trim().length < 2) next.commune = "Enter your commune.";
    if (form.address.trim().length < 4) next.address = "Enter a delivery address.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  const overStock = lines.filter((line) => line.quantity > line.stock);

  if (lines.length === 0 && !mutation.isPending) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <div className="mx-auto grid size-16 place-items-center rounded-full bg-muted">
          <ShoppingBag className="size-6 text-muted-foreground" />
        </div>
        <h1 className="mt-5 font-display text-2xl">Nothing to order yet</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Add products to your cart, then come back to complete your order.
        </p>
        <Button asChild className="mt-6 rounded-full">
          <Link to="/shop">Browse products</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:py-12">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">
        <span>Cart</span>
        <span className="text-gold">—</span>
        <span className="text-foreground">Your details</span>
        <span className="text-gold">—</span>
        <span>Confirmation</span>
      </div>
      <h1 className="mt-3 font-display text-3xl md:text-4xl">Complete your order</h1>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">
        No account and no online payment. We call you to confirm your order and arrange delivery.
      </p>

      <form
        className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]"
        onSubmit={(event) => {
          event.preventDefault();
          setFailure(null);
          if (!validate()) return;
          if (overStock.length > 0) {
            toast.error("Some quantities exceed available stock. Update your cart first.");
            return;
          }
          mutation.mutate();
        }}
      >
        <div className="space-y-5">
          {failure && (
            <div className="flex gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm">
              <AlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" />
              <div>
                <p className="font-medium">{failure}</p>
                <Link to="/cart" className="mt-1 inline-block text-xs underline">
                  Review my cart
                </Link>
              </div>
            </div>
          )}

          {overStock.length > 0 && (
            <div className="flex gap-3 rounded-2xl border border-gold/40 bg-gold/10 p-4 text-sm">
              <AlertTriangle className="mt-0.5 size-4 shrink-0 text-gold" />
              <div>
                <p className="font-medium">Stock changed for some items</p>
                <ul className="mt-1 text-xs text-muted-foreground">
                  {overStock.map((line) => (
                    <li key={line.productId}>
                      {line.name} — only {line.stock} left
                    </li>
                  ))}
                </ul>
                <Link to="/cart" className="mt-1 inline-block text-xs underline">
                  Update my cart
                </Link>
              </div>
            </div>
          )}

          <div className="surface-card space-y-5 p-5">
            <h2 className="font-display text-lg">Delivery details</h2>

            <Field label="Full name" error={errors.customer_name}>
              <Input
                autoComplete="name"
                inputMode="text"
                className="h-12 rounded-xl"
                value={form.customer_name}
                onChange={(event) => setForm({ ...form, customer_name: event.target.value })}
                placeholder="Amine Bensalem"
              />
            </Field>

            <Field label="Phone number" error={errors.phone}>
              <Input
                autoComplete="tel"
                inputMode="tel"
                type="tel"
                className="h-12 rounded-xl"
                value={form.phone}
                onChange={(event) => setForm({ ...form, phone: event.target.value })}
                placeholder="0555 12 34 56"
              />
            </Field>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Wilaya" error={errors.wilaya}>
                <Select
                  value={form.wilaya}
                  onValueChange={(value) => setForm({ ...form, wilaya: value })}
                >
                  <SelectTrigger className="h-12 rounded-xl">
                    <SelectValue placeholder="Select wilaya" />
                  </SelectTrigger>
                  <SelectContent>
                    {WILAYAS.map((wilaya) => (
                      <SelectItem key={wilaya} value={wilaya}>
                        {wilaya}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field label="Commune" error={errors.commune}>
                <Input
                  className="h-12 rounded-xl"
                  value={form.commune}
                  onChange={(event) => setForm({ ...form, commune: event.target.value })}
                  placeholder="Bab Ezzouar"
                />
              </Field>
            </div>

            <Field label="Delivery address" error={errors.address}>
              <Textarea
                autoComplete="street-address"
                className="min-h-24 rounded-xl"
                value={form.address}
                onChange={(event) => setForm({ ...form, address: event.target.value })}
                placeholder="Street, building, landmark…"
              />
            </Field>

            <Field label="Order notes (optional)">
              <Textarea
                className="min-h-20 rounded-xl"
                value={form.notes}
                onChange={(event) => setForm({ ...form, notes: event.target.value })}
                placeholder="Preferred call time, size preference, delivery instructions…"
              />
            </Field>
          </div>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:h-fit">
          <div className="surface-card space-y-4 p-5">
            <h2 className="font-display text-lg">Order summary</h2>
            <ul className="space-y-3">
              {lines.map((line) => (
                <li key={line.productId} className="flex gap-3">
                  <div className="size-14 shrink-0 overflow-hidden rounded-xl bg-muted">
                    {line.image && (
                      <img
                        src={line.image}
                        alt={line.name}
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{line.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {line.quantity} × {formatPrice(line.price)}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {line.stock <= 0
                        ? "Out of stock"
                        : line.stock <= 3
                          ? `Only ${line.stock} left`
                          : "In stock"}
                    </p>
                  </div>
                  <p className="text-sm font-medium">{formatPrice(line.price * line.quantity)}</p>
                </li>
              ))}
            </ul>
            <div className="space-y-2 border-t pt-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery</span>
                <span>Confirmed by phone</span>
              </div>
              <div className="flex justify-between border-t pt-3 font-display text-lg">
                <span>Total</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Final total is recalculated and confirmed by our team.
              </p>
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={mutation.isPending}
              className="h-14 w-full rounded-full text-base"
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" /> Placing order…
                </>
              ) : (
                "Place order"
              )}
            </Button>
            <p className="flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
              <Lock className="size-3.5" /> No payment online — you pay on delivery
            </p>
          </div>

          <div className="flex items-start gap-3 rounded-2xl bg-muted/60 p-4 text-xs text-muted-foreground">
            <PhoneCall className="mt-0.5 size-4 shrink-0 text-gold" />
            <p>
              Our team calls you on the number you provide to confirm your order. Questions?{" "}
              {STORE.phone}
            </p>
          </div>
        </aside>
      </form>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string | undefined;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
