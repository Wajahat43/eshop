import axiosInstance from 'apps/user-ui/src/utils/axiosInstance';
import React from 'react';
import { Metadata } from 'next';
import { ProductDetails } from 'apps/user-ui/src/shared/components/organisms';

interface PageProps {
  params: {
    slug: string;
  };
}

async function fetchProductDetails(slug: string) {
  const productSlug = slug;
  const response = await axiosInstance.get(`/product/api/get-product/${productSlug}`);
  return response.data?.product;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const productSlug = (await params).slug;
    const product = await fetchProductDetails(productSlug);

    if (!product) {
      return {
        title: 'Product Not Found',
        description: 'The requested product could not be found.',
      };
    }

    return {
      title: product.name || 'Product Details',
      description: product.short_description || product.description || 'Product details and information',
      openGraph: {
        title: product.name || 'Product Details',
        description: product.short_description || product.description || 'Product details and information',
        images: product.images?.[0]?.url ? [product.images[0].url] : ['/placeholder-image.jpg'],
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: product.name || 'Product Details',
        description: product.short_description || product.description || 'Product details and information',
        images: product.images?.[0]?.url ? [product.images[0].url] : ['/placeholder-image.jpg'],
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Product Details',
      description: 'Product details and information',
    };
  }
}

const Page = async ({ params }: PageProps) => {
  const productSlug = (await params).slug;
  const product = await fetchProductDetails(productSlug);

  return <ProductDetails product={product} />;
};

export default Page;
