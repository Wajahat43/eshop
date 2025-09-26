import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Clock, Globe, Phone, Mail, ExternalLink, ShoppingBag, Users } from 'lucide-react';
import Ratings from '../molecules/ratings';
import ProductCard from './product-card';

type SocialLink = {
  platform?: string;
  url?: string;
};

type NormalizedSocialLink = {
  platform: string;
  url: string;
};

type SellerInfo = {
  id: string;
  name: string;
  email?: string;
  phone_number?: string;
  country?: string;
};

type ShopProduct = {
  id: string;
  title: string;
  slug: string;
  images: Array<{ url: string }>;
  sale_price: number;
  regular_price: number;
  rating: number;
  totalSales?: number;
  shop?: {
    id: string;
    name: string;
  };
};

type ShopDetailsProps = {
  shop: {
    id: string;
    name: string;
    bio?: string;
    category?: string;
    coverBanner?: string;
    address?: string;
    opening_hours?: string;
    website?: string;
    social_links?: SocialLink[];
    ratings?: number;
    averageRating?: number;
    totalProducts?: number;
    totalReviews?: number;
    avatar?: {
      url: string;
    } | null;
    sellers?: SellerInfo | null;
    products?: ShopProduct[];
    reviews?: Array<{ id: string }>;
  } | null;
};

const ShopDetails = ({ shop }: ShopDetailsProps) => {
  if (!shop) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="max-w-md text-center space-y-4">
          <h1 className="text-2xl font-semibold text-foreground">Shop not found</h1>
          <p className="text-muted-foreground">
            We couldn&apos;t find the shop you were looking for. It may have been removed or is temporarily unavailable.
          </p>
          <Link
            href="/shops"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Browse other shops
          </Link>
        </div>
      </div>
    );
  }

  const averageRating = typeof shop.averageRating === 'number' ? shop.averageRating : shop.ratings || 0;
  const totalProducts = shop.totalProducts ?? shop.products?.length ?? 0;
  const totalReviews = shop.totalReviews ?? shop.reviews?.length ?? 0;
  const avatarUrl = shop.avatar?.url || '/images/shop-logo-placeholder.svg';
  const coverUrl = shop.coverBanner || '/images/shop-banner-placeholder.svg';

  const socialLinks: NormalizedSocialLink[] = Array.isArray(shop.social_links)
    ? (shop.social_links as SocialLink[])
        .filter(
          (link): link is SocialLink & { url: string } =>
            !!link && typeof link === 'object' && typeof link.url === 'string' && link.url.trim().length > 0,
        )
        .map((link) => {
          const cleanedUrl = link.url.trim();
          let platformLabel =
            typeof link.platform === 'string' && link.platform.trim().length > 0 ? link.platform.trim() : cleanedUrl;

          if (platformLabel === cleanedUrl) {
            try {
              const parsed = new URL(cleanedUrl);
              platformLabel = parsed.hostname.replace(/^www\./, '');
            } catch {
              platformLabel = cleanedUrl;
            }
          }

          return {
            platform: platformLabel,
            url: cleanedUrl,
          };
        })
    : [];

  return (
    <div className="min-h-screen bg-background">
      <div className="relative h-64 w-full bg-muted">
        <Image src={coverUrl} alt={`${shop.name} cover`} fill priority className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="-mt-2 flex flex-col gap-6 rounded-2xl bg-card px-6 py-8 shadow-lg border border-border sm:flex-row sm:items-end">
          <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-2xl border-4 border-background shadow-xl">
            <Image src={avatarUrl} alt={`${shop.name} avatar`} fill className="object-cover" />
          </div>

          <div className="flex-1 space-y-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="space-y-2">
                <h1 className="text-3xl font-semibold text-foreground sm:text-4xl">{shop.name}</h1>
                {shop.bio && <p className="text-muted-foreground max-w-2xl">{shop.bio}</p>}
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
                  <ShoppingBag className="h-4 w-4" />
                  <span>
                    {totalProducts} product{totalProducts === 1 ? '' : 's'}
                  </span>
                </div>
                <div className="flex items-center gap-2 rounded-full bg-muted px-4 py-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>
                    {totalReviews} review{totalReviews === 1 ? '' : 's'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <Ratings rating={averageRating} />
              {shop.category && (
                <span className="inline-flex items-center rounded-full border border-border px-3 py-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {shop.category}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="py-12 space-y-12">
          <section className="grid gap-8 lg:grid-cols-[2fr,1fr]">
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-foreground">About</h2>
                {shop.bio ? (
                  <p className="mt-3 text-muted-foreground leading-relaxed">{shop.bio}</p>
                ) : (
                  <p className="mt-3 text-muted-foreground">This shop hasn&apos;t provided a description yet.</p>
                )}
              </div>

              {shop.opening_hours && (
                <div className="rounded-2xl border border-dashed border-border/80 bg-muted/30 p-6">
                  <div className="flex items-center gap-3 text-sm font-medium text-foreground">
                    <Clock className="h-5 w-5 text-primary" />
                    Opening hours
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground whitespace-pre-line">{shop.opening_hours}</p>
                </div>
              )}
            </div>

            <aside className="space-y-6">
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-foreground">Shop details</h3>
                <ul className="mt-4 space-y-4 text-sm text-muted-foreground">
                  {shop.address && (
                    <li className="flex items-start gap-3">
                      <MapPin className="mt-0.5 h-4 w-4 text-primary" />
                      <span>{shop.address}</span>
                    </li>
                  )}
                  {shop.sellers?.name && (
                    <li className="flex items-start gap-3">
                      <Users className="mt-0.5 h-4 w-4 text-primary" />
                      <span>{shop.sellers.name}</span>
                    </li>
                  )}
                  {shop.website && (
                    <li className="flex items-start gap-3">
                      <Globe className="mt-0.5 h-4 w-4 text-primary" />
                      <a href={shop.website} className="inline-flex items-center gap-1 text-primary hover:underline">
                        Visit website
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </li>
                  )}
                  {shop.sellers?.country && (
                    <li className="flex items-start gap-3">
                      <MapPin className="mt-0.5 h-4 w-4 text-primary" />
                      <span>{shop.sellers.country}</span>
                    </li>
                  )}
                  {shop.sellers?.phone_number && (
                    <li className="flex items-start gap-3">
                      <Phone className="mt-0.5 h-4 w-4 text-primary" />
                      <a href={`tel:${shop.sellers.phone_number}`} className="text-primary hover:underline">
                        {shop.sellers.phone_number}
                      </a>
                    </li>
                  )}
                  {shop.sellers?.email && (
                    <li className="flex items-start gap-3">
                      <Mail className="mt-0.5 h-4 w-4 text-primary" />
                      <a href={`mailto:${shop.sellers.email}`} className="text-primary hover:underline">
                        {shop.sellers.email}
                      </a>
                    </li>
                  )}
                </ul>
              </div>

              {socialLinks.length > 0 && (
                <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-foreground">Social links</h3>
                  <ul className="mt-4 space-y-3 text-sm text-primary">
                    {socialLinks.map((link) => (
                      <li key={`${link.platform}-${link.url}`}>
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 hover:underline"
                        >
                          <ExternalLink className="h-4 w-4" />
                          <span>{link.platform}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </aside>
          </section>

          <section>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 className="text-xl font-semibold text-foreground">Products</h2>
              <Link href="/shops" className="text-sm font-medium text-primary hover:underline">
                Back to shops
              </Link>
            </div>

            {shop.products && shop.products.length > 0 ? (
              <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {shop.products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="mt-6 rounded-2xl border border-dashed border-border/80 bg-muted/30 p-10 text-center text-muted-foreground">
                This shop hasn&apos;t added any products yet.
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default ShopDetails;
