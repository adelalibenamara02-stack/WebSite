import { Link, createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, PhoneCall, Truck } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { STORE, formatPrice } from "@/lib/format";
import { readReceipt, type OrderReceipt } from "@/lib/order-receipt";

export const Route = createFileRoute("/order-confirmed")({
  head: () => ({
    meta: [
      { title: `Order received — ${STORE.name}` },
      {
        name: "description",
        content: "Your order was received. Our team will call you shortly to confirm delivery.",
      },
      { property: "og:title", content: `Order received — ${STORE.name}` },
      { property: "og:description", content: "We received your order and will call to confirm." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: OrderConfirmedPage,
});

function OrderConfirmedPage() {
  const [receipt, setReceipt] = useState<OrderReceipt | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReceipt(readReceipt());
    setReady(true);
  }, []);

  if (!ready) {
    return <div className="mx-auto max-w-xl px-4 py-24" />;
  }

  if (!receipt) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="font-display text-2xl">No recent order found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          If you just placed an order, our team will still call you to confirm it.
        </p>
        <Button asChild className="mt-6 rounded-full">
          <Link to="/shop">Continue shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 md:py-16">
      <div className="fade-up text-center">
        <div className="mx-auto grid size-16 place-items-center rounded-full bg-success/10">
          <CheckCircle2 className="size-8 text-success" />
        </div>
        <h1 className="mt-5 font-display text-3xl md:text-4xl">Order received</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Thank you {receipt.customer_name.split(" ")[0]} — your order is registered and our team is
          on it.
        </p>
        <div className="mt-6 inline-flex flex-col items-center rounded-2xl border border-gold/40 bg-gold/10 px-6 py-3">
          <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            Order reference
          </span>
          <span className="font-display text-2xl tracking-wide">{receipt.reference}</span>
        </div>
      </div>

      <div className="surface-card mt-8 divide-y">
        <div className="p-5">
          <h2 className="font-display text-lg">Your items</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {receipt.items.map((item) => (
              <li key={item.name} className="flex justify-between gap-3">
                <span className="min-w-0 truncate">
                  {item.name} <span className="text-muted-foreground">× {item.quantity}</span>
                </span>
                <span>{formatPrice(item.price * item.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex justify-between border-t pt-4 font-display text-lg">
            <span>Total to pay on delivery</span>
            <span>{formatPrice(receipt.total)}</span>
          </div>
        </div>

        <div className="p-5 text-sm">
          <h2 className="font-display text-lg">Delivery to</h2>
          <p className="mt-2 text-muted-foreground">
            {receipt.customer_name} · {receipt.phone}
            <br />
            {receipt.address}
            <br />
            {receipt.commune}, {receipt.wilaya}
          </p>
        </div>

        <div className="space-y-3 p-5 text-sm">
          <p className="flex items-start gap-3">
            <PhoneCall className="mt-0.5 size-4 shrink-0 text-gold" />
            <span>
              <strong className="font-medium">We will call you</strong> on {receipt.phone} to confirm
              your order, address and delivery time. Keep your phone reachable.
            </span>
          </p>
          <p className="flex items-start gap-3">
            <Truck className="mt-0.5 size-4 shrink-0 text-gold" />
            <span>Payment is made in cash when your order is delivered.</span>
          </p>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button asChild size="lg" className="h-12 rounded-full">
          <Link to="/shop">Continue shopping</Link>
        </Button>
        <Button asChild size="lg" variant="outline" className="h-12 rounded-full">
          <a href={`tel:${STORE.phone.replace(/\s/g, "")}`}>Call {STORE.name}</a>
        </Button>
      </div>
    </div>
  );
}
