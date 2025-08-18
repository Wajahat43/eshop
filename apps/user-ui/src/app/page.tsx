'use client';
import Hero from '../shared/components/organisms/homepage/hero';
import { SectionTitle } from '../shared/components/molecules/section-title';
import useProducts from '../hooks/useProducts';
import { ProductCard, LatestProducts, TopShops, LatestEvents } from '../shared/components/organisms';

export default function Index() {
  const {
    getProductsQuery: { data, isLoading, isError, isPlaceholderData, isSuccess },
  } = useProducts({ page: 1, limit: 10 });
  console.log('data', data);
  const products = data?.products;
  // const {
  //   getProductsQuery: {
  //     data: latestProducts,
  //     isLoading: latestProductsLoading,
  //     isError: latestProductsError,
  //     isPlaceholderData: latestProductsPlaceholderData,
  //   },
  // } = useProducts({ page: 1, limit: 10, type: 'latest' });

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

        {/**Empty State */}
        {isSuccess && (!products || products.length === 0) && (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-4">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-500 mb-6">We couldn&apos;t find any products to display at the moment.</p>
            <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              Browse all products
            </button>
          </div>
        )}
      </div>

      {/* Latest Products Section */}
      <div className="md:w-[80%] w-[90%] my-10 m-auto">
        <div className="mb-8">
          <SectionTitle title="Latest Products" />
        </div>

        {/**Latest Products */}
        <LatestProducts />
      </div>

      {/* Top Shops Section */}
      <div className="md:w-[80%] w-[90%] my-10 m-auto">
        <div className="mb-8">
          <SectionTitle title="Top Shops" />
        </div>

        {/**Top Shops */}
        <TopShops />
      </div>

      {/* Latest Events Section */}
      <div className="md:w-[80%] w-[90%] my-10 m-auto">
        <div className="mb-8">
          <SectionTitle title="Latest Events" />
        </div>

        {/**Latest Events */}
        <LatestEvents />
      </div>
    </div>
  );
}
