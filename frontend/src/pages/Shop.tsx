import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  BadgePercent,
  SlidersHorizontal,
  X,
} from 'lucide-react';

import {
  productApi,
  categoryApi,
} from '../services/productService';

import {
  Product,
  Category,
} from '../types';

import ProductCard from '../components/ProductCard';

const SORT_OPTIONS = [
  {
    value: 'newest',
    label: 'Newest',
  },
  {
    value: 'price_asc',
    label: 'Price: Low to High',
  },
  {
    value: 'price_desc',
    label: 'Price: High to Low',
  },
  {
    value: 'rating',
    label: 'Highest Rated',
  },
  {
    value: 'popular',
    label: 'Most Popular',
  },
];

const Shop = () => {
  const [params, setParams] =
    useSearchParams();

  const [products, setProducts] =
    useState<Product[]>([]);

  const [categories, setCategories] =
    useState<Category[]>([]);

  const [totalPages, setTotalPages] =
    useState(1);

  const [loading, setLoading] =
    useState(true);

  const [
    filtersOpen,
    setFiltersOpen,
  ] = useState(false);

  /*
   * Read URL filters
   */
  const search =
    params.get('search') || '';

  const category =
    params.get('category') || '';

  const brand =
    params.get('brand') || '';

  const minPrice =
    params.get('minPrice') || '';

  const maxPrice =
    params.get('maxPrice') || '';

  const rating =
    params.get('rating') || '';

  const inStock =
    params.get('inStock') === 'true';

  const featured =
    params.get('featured') === 'true';

  const deals =
    params.get('deals') === 'true';

  const sort =
    params.get('sort') || 'newest';

  const page = Number(
    params.get('page') || '1'
  );

  /*
   * Load categories
   */
  useEffect(() => {
    categoryApi
      .list()
      .then((res) => {
        setCategories(
          res.data.data.categories
        );
      })
      .catch((error) => {
        console.error(
          'Unable to load categories:',
          error
        );
      });
  }, []);

  /*
   * Load products
   */
  useEffect(() => {
    setLoading(true);

    productApi
      .list({
        search:
          search || undefined,

        category:
          category || undefined,

        brand:
          brand || undefined,

        minPrice: minPrice
          ? Number(minPrice)
          : undefined,

        maxPrice: maxPrice
          ? Number(maxPrice)
          : undefined,

        rating: rating
          ? Number(rating)
          : undefined,

        inStock:
          inStock || undefined,

        featured:
          featured || undefined,

        deals:
          deals || undefined,

        sort,
        page,
        limit: 12,
      })
      .then((res) => {
        setProducts(
          res.data.data.products
        );

        setTotalPages(
          res.data.data.pagination
            .totalPages
        );
      })
      .catch((error) => {
        console.error(
          'Unable to load products:',
          error
        );

        setProducts([]);
        setTotalPages(1);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [
    search,
    category,
    brand,
    minPrice,
    maxPrice,
    rating,
    inStock,
    featured,
    deals,
    sort,
    page,
  ]);

  /*
   * Update one URL parameter while
   * retaining all the others.
   */
  const updateParam = (
    key: string,
    value:
      | string
      | boolean
      | undefined
  ) => {
    const next =
      new URLSearchParams(params);

    if (
      value === undefined ||
      value === '' ||
      value === false
    ) {
      next.delete(key);
    } else {
      next.set(
        key,
        String(value)
      );
    }

    /*
     * Changing a filter should return
     * to page one.
     *
     * Don't delete page when the user
     * is specifically changing page.
     */
    if (key !== 'page') {
      next.delete('page');
    }

    setParams(next);
  };

  /*
   * Clear filters while keeping the
   * current page type.
   *
   * For Deals, retain deals=true.
   */
  const clearFilters = () => {
    const next =
      new URLSearchParams();

    if (deals) {
      next.set('deals', 'true');
    } else if (featured) {
      next.set(
        'featured',
        'true'
      );
    }

    setParams(next);
  };

  const FiltersPanel = (
    <div className="space-y-5">
      {/* Category */}
      <div>
        <h4 className="font-semibold text-sm mb-2 text-gray-900 dark:text-zinc-100">
          Category
        </h4>

        <select
          className="input-field"
          value={category}
          onChange={(e) =>
            updateParam(
              'category',
              e.target.value
            )
          }
        >
          <option value="">
            All categories
          </option>

          {categories.map(
            (categoryItem) => (
              <option
                key={
                  categoryItem._id
                }
                value={
                  categoryItem._id
                }
              >
                {categoryItem.name}
              </option>
            )
          )}
        </select>
      </div>

      {/* Brand */}
      <div>
        <h4 className="font-semibold text-sm mb-2 text-gray-900 dark:text-zinc-100">
          Brand
        </h4>

        <input
          className="input-field"
          placeholder="e.g. Nova"
          value={brand}
          onChange={(e) =>
            updateParam(
              'brand',
              e.target.value
            )
          }
        />
      </div>

      {/* Price */}
      <div>
        <h4 className="font-semibold text-sm mb-2 text-gray-900 dark:text-zinc-100">
          Price range (Rs.)
        </h4>

        <div className="flex gap-2">
          <input
            className="input-field"
            type="number"
            min="0"
            placeholder="Min"
            value={minPrice}
            onChange={(e) =>
              updateParam(
                'minPrice',
                e.target.value
              )
            }
          />

          <input
            className="input-field"
            type="number"
            min="0"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) =>
              updateParam(
                'maxPrice',
                e.target.value
              )
            }
          />
        </div>
      </div>

      {/* Rating */}
      <div>
        <h4 className="font-semibold text-sm mb-2 text-gray-900 dark:text-zinc-100">
          Minimum Rating
        </h4>

        <select
          className="input-field"
          value={rating}
          onChange={(e) =>
            updateParam(
              'rating',
              e.target.value
            )
          }
        >
          <option value="">
            Any rating
          </option>

          {[4, 3, 2, 1].map(
            (ratingOption) => (
              <option
                key={ratingOption}
                value={
                  ratingOption
                }
              >
                {ratingOption}+
                stars
              </option>
            )
          )}
        </select>
      </div>

      {/* Stock */}
      <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-zinc-300 cursor-pointer">
        <input
          type="checkbox"
          checked={inStock}
          onChange={(e) =>
            updateParam(
              'inStock',
              e.target.checked
            )
          }
        />

        In stock only
      </label>

      <button
        type="button"
        className="btn-secondary w-full text-sm"
        onClick={clearFilters}
      >
        Clear all filters
      </button>
    </div>
  );

  /*
   * Page title
   */
  let title = 'Shop';
  let subtitle =
    'Explore all products';

  if (deals) {
    title =
      'Deals & Special Offers';

    subtitle =
      'Save more on discounted products and limited-time offers.';
  } else if (search) {
    title = `Results for "${search}"`;

    subtitle =
      'Products matching your search';
  } else if (featured) {
    title =
      'Featured Products';

    subtitle =
      'Handpicked products from ShopNepal';
  }

  return (
    <div>
      {/* ==================================
          PAGE HEADER
      =================================== */}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            {deals && (
              <div className="w-9 h-9 rounded-lg bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 flex items-center justify-center">
                <BadgePercent
                  size={20}
                />
              </div>
            )}

            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              {title}
            </h1>
          </div>

          <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
            {subtitle}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            className="input-field text-sm min-w-[170px]"
            value={sort}
            onChange={(e) =>
              updateParam(
                'sort',
                e.target.value
              )
            }
          >
            {SORT_OPTIONS.map(
              (option) => (
                <option
                  key={
                    option.value
                  }
                  value={
                    option.value
                  }
                >
                  {option.label}
                </option>
              )
            )}
          </select>

          <button
            type="button"
            className="lg:hidden btn-secondary flex items-center gap-2 text-sm"
            onClick={() =>
              setFiltersOpen(true)
            }
          >
            <SlidersHorizontal
              size={16}
            />

            Filters
          </button>
        </div>
      </div>

      {/* Deals banner */}
      {deals && (
        <div className="mb-6 rounded-xl bg-gradient-to-r from-red-600 to-red-700 dark:from-red-900 dark:to-red-950 text-white px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="font-bold text-lg">
              ShopNepal Deals
            </div>

            <p className="text-sm text-red-100 mt-0.5">
              Special prices while
              stocks last.
            </p>
          </div>

          <BadgePercent
            size={30}
            className="hidden sm:block text-red-100"
          />
        </div>
      )}

      {/* ==================================
          SHOP BODY
      =================================== */}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Desktop filters */}
        <aside className="hidden lg:block card p-5 h-fit">
          {FiltersPanel}
        </aside>

        {/* Mobile filters */}
        {filtersOpen && (
          <div
            className="fixed inset-0 z-50 bg-black/50 flex"
            onClick={() =>
              setFiltersOpen(false)
            }
          >
            <div
              className="bg-white dark:bg-zinc-900 w-80 max-w-[85vw] p-5 overflow-y-auto shadow-2xl"
              onClick={(e) =>
                e.stopPropagation()
              }
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Filters
                </h3>

                <button
                  type="button"
                  onClick={() =>
                    setFiltersOpen(
                      false
                    )
                  }
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800"
                  aria-label="Close filters"
                >
                  <X size={20} />
                </button>
              </div>

              {FiltersPanel}
            </div>
          </div>
        )}

        {/* Products */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-gray-500 dark:text-zinc-400">
              <div className="loading-spinner mb-3" />

              Loading products...
            </div>
          ) : products.length ===
            0 ? (
            <div className="card py-20 px-6 text-center">
              {deals && (
                <BadgePercent
                  size={36}
                  className="mx-auto text-red-400 mb-3"
                />
              )}

              <h3 className="font-semibold text-gray-900 dark:text-white">
                {deals
                  ? 'No deals found'
                  : 'No products found'}
              </h3>

              <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
                {deals
                  ? 'There are no discounted products matching these filters.'
                  : 'No products match your filters.'}
              </p>

              <button
                type="button"
                onClick={
                  clearFilters
                }
                className="btn-secondary mt-4"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {products.map(
                  (product) => (
                    <ProductCard
                      key={
                        product._id
                      }
                      product={
                        product
                      }
                    />
                  )
                )}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex flex-wrap justify-center gap-2 mt-8">
                  {Array.from(
                    {
                      length:
                        totalPages,
                    },
                    (_, index) =>
                      index + 1
                  ).map(
                    (
                      pageNumber
                    ) => (
                      <button
                        key={
                          pageNumber
                        }
                        type="button"
                        onClick={() =>
                          updateParam(
                            'page',
                            String(
                              pageNumber
                            )
                          )
                        }
                        className={`w-9 h-9 rounded-lg text-sm transition-colors ${
                          pageNumber ===
                          page
                            ? 'bg-red-600 text-white'
                            : 'bg-white dark:bg-zinc-900 text-gray-700 dark:text-zinc-300 border border-gray-200 dark:border-zinc-700 hover:border-red-300 dark:hover:border-red-800'
                        }`}
                      >
                        {
                          pageNumber
                        }
                      </button>
                    )
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Shop;