import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight, BadgeCheck, PhoneCall, Sparkles, Truck } from "lucide-react";

import heroImage from "@/assets/hero.jpg";
import { ProductCard } from "@/components/ProductCard";
import { Reveal } from "@/components/Reveal";
import { Button } from "@/components/ui/button";
import { catalogQueryOptions } from "@/lib/catalog";
import { STORE } from "@/lib/format";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Maison Noir — Premium essentials, delivered in Algeria" },
      {
        name: "description",
        content:
          "Shop curated watches, fragrances, leather goods and audio. Order in one minute, we confirm by phone, you pay on delivery.",
      },
      { property: "og:title", content: "Maison Noir — Premium essentials, delivered in Algeria" },
      {
        property: "og:description",
        content: "Curated watches, fragrances, leather goods and audio. Cash on delivery across Algeria.",
      },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(catalogQueryOptions),
  component: Home,
});

function Home() {
  const { data } = useSuspenseQuery(catalogQueryOptions);
  const featured = data.products.filter((product) => product.featured).slice(0, 4);
  const bestSellers = data.products.filter((product) => product.best_seller).slice(0, 4);

  return (
    <div>
      <section className="hero-gradient relative overflow-hidden text-primary-foreground">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-2 md:py-24">
          <div className="fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-gold">
              <Sparkles className="size-3.5" /> New season selection
            </span>
            <h1 className="text-balance-tight mt-5 font-display text-4xl leading-[1.05] md:text-6xl">
              Quiet luxury for <span className="text-gold">everyday</span> life.
            </h1>
            <p className="mt-5 max-w-md text-sm text-primary-foreground/75 md:text-base">
              {STORE.tagline} No account, no online payment — fill a short form and we call you to
              confirm your order.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-full bg-gold text-gold-foreground hover:bg-gold/90">
                <Link to="/shop">
                  Shop the collection <ArrowRight className="ml-1 size-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-full border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10"
              >
                <a href={`tel:${STORE.phone.replace(/\s/g, "")}`}>Call us</a>
              </Button>
            </div>
            <div className="mt-10 flex flex-wrap gap-6 text-xs text-primary-foreground/70">
              <span className="inline-flex items-center gap-2">
                <Truck className="size-4 text-gold" /> 48h delivery
              </span>
              <span className="inline-flex items-center gap-2">
                <BadgeCheck className="size-4 text-gold" /> Authentic products
              </span>
              <span className="inline-flex items-center gap-2">
                <PhoneCall className="size-4 text-gold" /> Phone confirmation
              </span>
            </div>
          </div>

          <div className="fade-up overflow-hidden rounded-[2rem] shadow-[var(--shadow-lift)]">
            <img
              src={heroImage}
              alt="Watch, perfume and leather goods on a dark marble surface"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      <Section title="Shop by category" subtitle="Four edits, carefully kept small.">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {data.categories.map((category, index) => (
            <Reveal key={category.id} delay={index * 60}>
              <Link
                to="/shop"
                search={{ category: category.slug }}
                className="zoom-media surface-card group relative block aspect-[4/3] overflow-hidden"
              >
                {category.image && (
                  <img src={category.image} alt={category.name} className="h-full w-full object-cover" />
                )}
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-primary/85 to-transparent p-3 font-display text-sm text-primary-foreground">
                  {category.name}
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section title="Featured pieces" subtitle="Hand-picked this week." action={{ to: "/shop", label: "View all" }}>
        <ProductGrid products={featured} />
      </Section>

      <section className="mx-auto max-w-6xl px-4">
        <Reveal>
          <div className="hero-gradient flex flex-col items-start gap-4 rounded-[2rem] px-6 py-10 text-primary-foreground md:flex-row md:items-center md:px-12">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-gold">Limited offer</p>
              <h3 className="mt-2 font-display text-2xl md:text-3xl">
                Up to 20% off selected pieces
              </h3>
              <p className="mt-2 text-sm text-primary-foreground/75">
                Free delivery on orders above 20 000 DA.
              </p>
            </div>
            <Button asChild className="md:ml-auto rounded-full bg-gold text-gold-foreground hover:bg-gold/90">
              <Link to="/shop">See the deals</Link>
            </Button>
          </div>
        </Reveal>
      </section>

      <Section title="Best sellers" subtitle="What our customers keep ordering." action={{ to: "/shop", label: "View all" }}>
        <ProductGrid products={bestSellers} />
      </Section>

      <Section title="Why customers trust us" subtitle="Local service, real people on the phone.">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              icon: PhoneCall,
              title: "We call before delivery",
              text: "Every order is confirmed by phone, so nothing arrives unexpected.",
            },
            {
              icon: Truck,
              title: "Pay on delivery",
              text: "No card, no prepayment. You pay only when your parcel is in your hands.",
            },
            {
              icon: BadgeCheck,
              title: "Checked before shipping",
              text: "Each piece is inspected and packed by hand in our workshop.",
            },
          ].map((item, index) => (
            <Reveal key={item.title} delay={index * 80}>
              <div className="surface-card h-full p-6">
                <item.icon className="size-5 text-gold" />
                <p className="mt-4 font-display text-base">{item.title}</p>
                <p className="mt-2 text-sm text-muted-foreground">{item.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section title="Talk to us" subtitle="Questions about sizing, stock or delivery?">
        <div className="surface-card flex flex-col gap-4 p-6 sm:flex-row sm:items-center">
          <div className="text-sm">
            <p className="font-display text-lg">{STORE.phone}</p>
            <p className="text-muted-foreground">
              {STORE.email} · {STORE.hours}
            </p>
          </div>
          <Button asChild className="rounded-full sm:ml-auto">
            <a href={`tel:${STORE.phone.replace(/\s/g, "")}`}>Call now</a>
          </Button>
        </div>
      </Section>
    </div>
  );
}

function ProductGrid({ products }: { products: { id: string }[] & unknown[] }) {
  if (products.length === 0) {
    return (
      <p className="surface-card p-8 text-center text-sm text-muted-foreground">
        Nothing here yet — new pieces are on their way.
      </p>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {products.map((product, index) => (
        <Reveal key={(product as { id: string }).id} delay={index * 70}>
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <ProductCard product={product as any} />
        </Reveal>
      ))}
    </div>
  );
}

function Section({
  title,
  subtitle,
  action,
  children,
}: {
  title: string;
  subtitle?: string;
  action?: { to: "/shop"; label: string };
  children: React.ReactNode;
}) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-14">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl md:text-3xl">{title}</h2>
          {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        {action && (
          <Link to={action.to} className="shrink-0 text-sm text-gold hover:underline">
            {action.label}
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}
