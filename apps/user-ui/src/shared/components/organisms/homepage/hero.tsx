import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import React from 'react';

const heroProduct = {
  name: 'Aurora Pulse Headset',
  collection: 'Nebula Series',
  tagline: 'Immersive 4D spatial audio tuned for gaming and focus sessions.',
  price: '$249',
  originalPrice: '$329',
  imageUrl: 'https://ik.imagekit.io/wajahatx1/products/aura_pulse_headset.webp?updatedAt=1758511822673',
};

const pillars = [
  {
    title: 'Verified independent shops',
    description: 'Discover handpicked boutiques and makers vetted by our community team.',
  },
  {
    title: 'Unified multi-shop cart',
    description: 'Checkout once even when your finds span multiple sellers and categories.',
  },
];

const Hero = () => {
  return (
    <section className="relative overflow-hidden border-b border-border/50 bg-background">
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background"
        aria-hidden
      />

      <div className="relative mx-auto flex max-w-[1440px] flex-col-reverse items-center gap-12 px-6 py-24 sm:px-8 lg:flex-row lg:justify-between">
        <div className="max-w-xl space-y-8 text-center lg:text-left">
          <div className="inline-flex items-center justify-center rounded-full border border-border/60 bg-background/70 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground lg:justify-start">
            NextCart marketplace
          </div>

          <div className="space-y-5">
            <h1 className="font-Poppins text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Shop emerging brands without the noise
            </h1>
            <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
              Clean, confident browsing that keeps the focus on thoughtful products, verified sellers, and a checkout
              you can trust.
            </p>
          </div>

          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-start">
            <a
              href="#featured"
              className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-transform duration-200 hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:w-auto"
            >
              Browse marketplace
              <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="#features"
              className="flex w-full items-center justify-center gap-2 rounded-full border border-border bg-background/80 px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:border-primary/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border focus-visible:ring-offset-2 sm:w-auto"
            >
              Why people switch
            </a>
          </div>

          <ul className="grid gap-3 sm:grid-cols-2">
            {pillars.map((item) => (
              <li
                key={item.title}
                className="rounded-2xl border border-border/60 bg-background/80 p-4 text-left shadow-sm backdrop-blur"
              >
                <p className="text-sm font-semibold text-foreground">{item.title}</p>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{item.description}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative w-full max-w-sm">
          <div className="overflow-hidden rounded-[32px] border border-border/60 bg-card shadow-xl">
            <div className="relative aspect-[4/5]">
              <Image
                src={heroProduct.imageUrl}
                alt={heroProduct.name}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 420px"
              />
            </div>
            <div className="space-y-3 p-6 text-left">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {heroProduct.collection}
              </p>
              <div className="flex items-center justify-between">
                <p className="text-lg font-semibold text-foreground">{heroProduct.name}</p>
                <div className="text-right">
                  <span className="text-sm font-semibold text-primary">{heroProduct.price}</span>
                  <span className="ml-2 text-xs text-muted-foreground line-through">{heroProduct.originalPrice}</span>
                </div>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">{heroProduct.tagline}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
