'use client';
import Link from 'next/link';
import { ArrowRight, Clock, ShieldCheck, ShoppingBag, Sparkles, TrendingUp } from 'lucide-react';
import Hero from '../shared/components/organisms/homepage/hero';
import FeaturesSection from '../shared/components/organisms/homepage/features';
import { SectionTitle } from '../shared/components/molecules/section-title';
import useProducts from '../hooks/useProducts';
import { FaqSection, ProductCard, LatestProducts, TopShops } from '../shared/components/organisms';

const experienceHighlights = [
  {
    icon: Sparkles,
    title: 'Tailored discovery',
    description: 'AI-powered suggestions surface drops, staples, and essentials that match your vibe instantly.',
  },
  {
    icon: TrendingUp,
    title: 'Live trend radar',
    description: 'Stay ahead with real-time drops, limited collabs, and curated edits refreshed every hour.',
  },
  {
    icon: ShieldCheck,
    title: 'Protected & effortless',
    description: 'Secure checkout, easy returns, and concierge support that travels with you from cart to delivery.',
  },
];

const categoryDescriptions: Record<string, string> = {
  electronics: 'Dial into flagship devices, audio gear, and smart-home upgrades that blend power with polish.',
  fashion: 'Layer limited-run drops with everyday essentials curated by independent designers and stylists.',
  beauty: 'Skin, scent, and self-care rituals sourced from labs and makers that prioritise clean formulations.',
  'home & living': 'Create calm spaces with handcrafted decor, modular furniture, and purposeful storage ideas.',
  'home decor': 'Elevate every room with artisan decor, sculptural lighting, and sustainably sourced materials.',
  'health & wellness':
    'Build routines you can stick to with performance supplements, recovery tech, and mindful accessories.',
  outdoor: 'Gear up for weekends outside with weather-ready layers, trail equipment, and packable essentials.',
  kids: 'Playful fits and durable gear made for mini adventurers, from school days to weekend escapes.',
  'food & drink': 'Small-batch pantry staples, brewing kits, and tasting experiences to keep curiosity on the table.',
};

const getCategoryDescription = (label: string) => {
  const normalized = label.trim().toLowerCase();
  const description = categoryDescriptions[normalized];

  return description || `Discover standout ${normalized} pieces from emerging makers and modern mainstays.`;
};

const communityHighlights = [
  {
    metric: '48h',
    label: 'average delivery in major cities',
  },
  {
    metric: '120+',
    label: 'local makers spotlighted monthly',
  },
  {
    metric: '98%',
    label: 'orders rated 5 stars for packaging',
  },
];

export default function Index() {
  const {
    getProductsQuery: { data, isLoading, isSuccess },
    getCategoriesQuery: { data: categoriesData, isLoading: isCategoriesLoading },
  } = useProducts({ page: 1, limit: 10 });
  const products = data?.products;
  const categories = categoriesData?.categories ?? [];
  const featuredCategories = categories.slice(0, 6);
  // const {
  //   getProductsQuery: {
  //     data: latestProducts,
  //     isLoading: latestProductsLoading,
  //     isError: latestProductsError,
  //     isPlaceholderData: latestProductsPlaceholderData,
  //   },
  // } = useProducts({ page: 1, limit: 10, type: 'latest' });

  return (
    <main className="isolate bg-background text-foreground">
      <Hero />
      <FeaturesSection />
      <section id="experience" className="relative mx-auto -mt-12 w-[90%] max-w-10xl space-y-10 pb-16 sm:-mt-16">
        <div className="grid gap-8 mt-24">
          <div className="rounded-3xl border border-border/60 bg-card/80 p-6 shadow-xl backdrop-blur sm:p-10">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Shop by category</p>
                <h2 className="font-Poppins text-2xl font-semibold text-foreground sm:text-3xl">
                  Browse collections tailored to how you discover
                </h2>
              </div>
              <a
                href="/products"
                className="inline-flex items-center gap-2 rounded-full border border-primary/50 px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/10"
              >
                View all categories
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {isCategoriesLoading && (
                <>
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div
                      key={`category-skeleton-${index}`}
                      className="h-32 rounded-2xl border border-border/50 bg-muted/40 animate-pulse"
                    />
                  ))}
                </>
              )}

              {!isCategoriesLoading &&
                featuredCategories.map((category) => {
                  const label = String(category);

                  return (
                    <Link
                      key={label}
                      href={`/products?categories=${encodeURIComponent(label)}`}
                      className="group flex h-full flex-col justify-between rounded-2xl border border-border/60 bg-background/85 p-6 text-left shadow-lg transition-transform duration-200 hover:-translate-y-1 hover:border-primary/40"
                    >
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Category</p>
                        <h3 className="mt-2 text-lg font-semibold text-foreground">{label}</h3>
                        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                          {getCategoryDescription(label)}
                        </p>
                      </div>
                      <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                        Shop {label}
                        <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                      </span>
                    </Link>
                  );
                })}

              {!isCategoriesLoading && featuredCategories.length === 0 && (
                <div className="rounded-2xl border border-dashed border-border/70 bg-background/70 p-6 text-center text-sm text-muted-foreground">
                  Categories are on the way. Check back soon to browse tailored collections.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section id="featured" className="bg-gradient-to-b from-background via-background to-primary/5 py-16">
        <div className="mx-auto w-[90%] max-w-10xl">
          <div className="mb-10 flex flex-col gap-4 text-center lg:flex-row lg:items-center lg:justify-between lg:text-left">
            <div className="space-y-3">
              <SectionTitle title="Suggested Products" />
              <p className="text-sm text-muted-foreground">
                Personalized picks refreshed every visit so you always see what&apos;s trending just for you.
              </p>
            </div>
            <a
              href="/offers"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-primary/50 px-5 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/10"
            >
              View all offers
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>

          {isLoading && (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 10 }).map((_, index) => (
                <div key={index} className="h-[250px] rounded-2xl bg-muted animate-pulse" />
              ))}
            </div>
          )}

          {isSuccess && (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products?.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {isSuccess && (!products || products.length === 0) && (
            <div className="mx-auto mt-10 max-w-lg rounded-3xl border border-dashed border-primary/40 bg-card/80 p-10 text-center shadow-lg">
              <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-primary/15 text-primary">
                <ShoppingBag className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">We&apos;re curating fresh picks</h3>
              <p className="mt-3 text-sm text-muted-foreground">
                New drops are in transit. Explore the marketplace or check back in a moment for a refreshed lineup.
              </p>
              <a
                href="/offers"
                className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Browse all products
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          )}
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto w-[90%] max-w-10xl">
          <div className="mb-10 flex flex-col gap-4 text-center lg:flex-row lg:items-center lg:justify-between lg:text-left">
            <div className="space-y-3">
              <SectionTitle title="Latest Products" />
              <p className="text-sm text-muted-foreground">
                Daily new arrivals curated by our partnerships team and verified community tastemakers.
              </p>
            </div>
            <a
              href="/offers"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-primary/50 px-5 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/10"
            >
              Discover fresh arrivals
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>

          <LatestProducts />
        </div>
      </section>

      <section className="bg-primary/5 py-16">
        <div className="mx-auto w-[90%] max-w-10xl">
          <div className="mb-10 flex flex-col gap-4 text-center lg:flex-row lg:items-center lg:justify-between lg:text-left">
            <div className="space-y-3">
              <SectionTitle title="Top Shops" />
              <p className="text-sm text-muted-foreground">
                Follow visionary brands, unlock community rewards, and shop exclusives you won&apos;t find elsewhere.
              </p>
            </div>
            <a
              href="/shops"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-primary/50 px-5 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/10"
            >
              Meet the creators
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>

          <TopShops />
        </div>
      </section>

      <FaqSection />

    </main>
  );
}
