import { Metadata } from 'next';
import { cache } from 'react';
import axiosInstance from 'apps/user-ui/src/utils/axiosInstance';
import ShopDetails from 'apps/user-ui/src/shared/components/organisms/shop-details';

interface PageProps {
  params: {
    shopId: string;
  };
}

const fetchShopDetails = cache(async (shopId: string) => {
  try {
    const response = await axiosInstance.get(`/api/shop-info/${shopId}`);
    return response.data?.shop ?? null;
  } catch (error) {
    console.error('Error fetching shop details:', error);
    return null;
  }
});

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const shop = await fetchShopDetails(params.shopId);

  if (!shop) {
    return {
      title: 'Shop Not Found',
      description: 'The requested shop could not be found.',
    };
  }

  const bannerImage = shop.coverBanner || '/images/shop-banner-placeholder.png';

  return {
    title: `${shop.name} | Shop`,
    description: shop.bio || 'Discover the latest products from this shop.',
    openGraph: {
      title: `${shop.name} | Shop`,
      description: shop.bio || 'Discover the latest products from this shop.',
      images: bannerImage ? [bannerImage] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${shop.name} | Shop`,
      description: shop.bio || 'Discover the latest products from this shop.',
      images: bannerImage ? [bannerImage] : [],
    },
  };
}

const Page = async ({ params }: PageProps) => {
  const shop = await fetchShopDetails(params.shopId);

  return <ShopDetails shop={shop} />;
};

export default Page;
