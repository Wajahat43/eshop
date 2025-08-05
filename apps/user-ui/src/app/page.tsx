'use client';
import Hero from '../shared/components/organisms/homepage/hero';
import { SectionTitle } from '../shared/components/molecules/section-title';
import useProducts from '../hooks/useProducts';
import { ProductCard } from '../shared/components/organisms';

export default function Index() {
  const {
    getProductsQuery: { data, isLoading, isError, isPlaceholderData, isSuccess },
  } = useProducts({ page: 1, limit: 10 });
  const products = data?.products;
  const {
    getProductsQuery: {
      data: latestProducts,
      isLoading: latestProductsLoading,
      isError: latestProductsError,
      isPlaceholderData: latestProductsPlaceholderData,
    },
  } = useProducts({ page: 1, limit: 10, type: 'latest' });

  return (
    <div className="isolate">
      <Hero />

      <div className="md:w-[80%] w-[90%] my-10 m-auto">
        <div className="mb-8">
          <SectionTitle title="Suggested Products" />
        </div>

        {/**Product Skeleton */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-5 gap-5">
            {Array.from({ length: 10 }).map((_, index) => (
              <div key={index} className="h-[250px] bg-gray-400 animate-pulse rounded"></div>
            ))}
          </div>
        )}

        {isSuccess && (
          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-5 gap-5">
            {console.log('Products', products)}
            {products?.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
