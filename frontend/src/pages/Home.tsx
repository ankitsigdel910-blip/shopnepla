import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import { Link } from 'react-router-dom';

import {
  ArrowRight,
  BadgePercent,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Truck,
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
import PromoBannerSlider from '../components/PromoBannerSlider';

/* ======================================================
   PRODUCT SECTION
====================================================== */

interface SectionProps {
  title: string;
  subtitle?: string;
  products: Product[];
  viewAllHref: string;
}

const Section = ({
  title,
  subtitle,
  products,
  viewAllHref,
}: SectionProps) => {
  return (
    <section className="mb-8 sm:mb-10 lg:mb-12">
      <div className="mb-4 flex items-start justify-between gap-3 sm:mb-5 sm:items-end">
        <div className="min-w-0">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white sm:text-xl md:text-2xl">
            {title}
          </h2>

          {subtitle && (
            <p className="mt-1 text-xs leading-5 text-gray-500 dark:text-zinc-400 sm:text-sm">
              {subtitle}
            </p>
          )}
        </div>

        <Link
          to={viewAllHref}
          className="flex shrink-0 items-center gap-1 whitespace-nowrap text-xs font-semibold text-red-600 transition-colors hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 sm:text-sm"
        >
          View all
          <ArrowRight size={14} />
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="rounded-xl border border-gray-200 p-6 text-center text-sm text-gray-500 dark:border-zinc-800 dark:text-zinc-400 sm:p-8">
          Nothing to show here yet.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
          {products.map(
            (product) => (
              <ProductCard
                key={product._id}
                product={product}
              />
            )
          )}
        </div>
      )}
    </section>
  );
};

/* ======================================================
   HOME PAGE
====================================================== */

const Home = () => {
  const [
    featured,
    setFeatured,
  ] = useState<Product[]>([]);

  const [
    popular,
    setPopular,
  ] = useState<Product[]>([]);

  const [
    discounted,
    setDiscounted,
  ] = useState<Product[]>([]);

  const [
    newArrivals,
    setNewArrivals,
  ] = useState<Product[]>([]);

  const [
    categories,
    setCategories,
  ] = useState<Category[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  /* ====================================================
     LOAD HOME DATA
  ==================================================== */

  useEffect(() => {
    let active = true;

    const loadHome =
      async () => {
        try {
          const [
            featuredRes,
            popularRes,
            dealsRes,
            newRes,
            categoryRes,
          ] = await Promise.all([
            productApi.list({
              featured: true,
              limit: 5,
            }),

            productApi.list({
              sort: 'popular',
              limit: 5,
            }),

            productApi.list({
              deals: true,
              sort: 'newest',
              limit: 10,
            }),

            productApi.list({
              sort: 'newest',
              limit: 5,
            }),

            categoryApi.list(),
          ]);

          if (!active) {
            return;
          }

          setFeatured(
            featuredRes.data?.data
              ?.products ?? []
          );

          setPopular(
            popularRes.data?.data
              ?.products ?? []
          );

          setDiscounted(
            dealsRes.data?.data
              ?.products ?? []
          );

          setNewArrivals(
            newRes.data?.data
              ?.products ?? []
          );

          setCategories(
            categoryRes.data?.data
              ?.categories ?? []
          );
        } catch (error) {
          console.error(
            'Failed to load homepage:',
            error
          );
        } finally {
          if (active) {
            setLoading(false);
          }
        }
      };

    void loadHome();

    return () => {
      active = false;
    };
  }, []);

  /* ====================================================
     POPULAR CATEGORIES
  ==================================================== */

  const popularCategories =
    useMemo(
      () =>
        categories.slice(
          0,
          8
        ),
      [categories]
    );

  /* ====================================================
     VALID TABLE DEALS
  ==================================================== */

  const tableDeals =
    useMemo(
      () =>
        discounted
          .filter(
            (product) => {
              const regular =
                Number(
                  product.price
                );

              const sale =
                Number(
                  product.discountPrice
                );

              return (
                Number.isFinite(
                  regular
                ) &&
                Number.isFinite(
                  sale
                ) &&
                regular > 0 &&
                sale >= 0 &&
                sale < regular
              );
            }
          )
          .slice(0, 4),
      [discounted]
    );

  /* ====================================================
     LOADING
  ==================================================== */

  if (loading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center py-20 text-gray-500 dark:text-zinc-400">
        <div className="loading-spinner mb-3" />

        <span className="text-sm">
          Loading ShopNepal...
        </span>
      </div>
    );
  }

  return (
    <div className="pb-20 text-gray-900 dark:text-zinc-100 md:pb-0">
      {/* =================================================
          PROMO
      ================================================== */}

      <div className="mb-4 sm:mb-6 lg:mb-8">
        <PromoBannerSlider />
      </div>

      {/* =================================================
          MOBILE BENEFITS
      ================================================== */}

      <section className="mb-8 grid grid-cols-3 gap-2 sm:hidden">
        <div className="flex min-w-0 flex-col items-center rounded-xl border border-red-100 bg-red-50 px-1 py-2.5 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-1 flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400">
            <Truck size={17} />
          </div>

          <span className="whitespace-nowrap text-[11px] font-semibold">
            Delivery
          </span>
        </div>

        <div className="flex min-w-0 flex-col items-center rounded-xl border border-red-100 bg-red-50 px-1 py-2.5 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-1 flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400">
            <ShieldCheck
              size={17}
            />
          </div>

          <span className="whitespace-nowrap text-[11px] font-semibold">
            Secure
          </span>
        </div>

        <Link
          to="/shop?deals=true"
          className="flex min-w-0 flex-col items-center rounded-xl border border-red-100 bg-red-50 px-1 py-2.5 text-center transition hover:border-red-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-red-800"
        >
          <div className="mb-1 flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400">
            <BadgePercent
              size={17}
            />
          </div>

          <span className="whitespace-nowrap text-[11px] font-semibold">
            Deals
          </span>
        </Link>
      </section>

      {/* =================================================
          TABLET / DESKTOP BENEFITS
      ================================================== */}

      <section className="mb-10 hidden grid-cols-3 gap-3 sm:grid lg:mb-12">
        <div className="flex items-center gap-3 rounded-xl border border-red-100 bg-red-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400">
            <Truck size={20} />
          </div>

          <div className="min-w-0">
            <div className="font-semibold">
              Delivery Across Nepal
            </div>

            <div className="text-xs text-gray-500 dark:text-zinc-400">
              Convenient nationwide
              shopping
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-red-100 bg-red-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400">
            <ShieldCheck
              size={20}
            />
          </div>

          <div className="min-w-0">
            <div className="font-semibold">
              Secure Payments
            </div>

            <div className="text-xs text-gray-500 dark:text-zinc-400">
              eSewa and COD
            </div>
          </div>
        </div>

        <Link
          to="/shop?deals=true"
          className="flex items-center gap-3 rounded-xl border border-red-100 bg-red-50 p-4 transition-all hover:border-red-300 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-red-800"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400">
            <BadgePercent
              size={20}
            />
          </div>

          <div className="min-w-0">
            <div className="font-semibold">
              Great Deals
            </div>

            <div className="text-xs text-gray-500 dark:text-zinc-400">
              Special offers and
              discounts
            </div>
          </div>
        </Link>
      </section>

      {/* =================================================
          POPULAR CATEGORIES
      ================================================== */}

      <section className="mb-8 sm:mb-10 lg:mb-12">
        <div className="mb-4 flex items-start justify-between gap-2 sm:mb-5 sm:items-end">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold dark:text-white sm:text-xl md:text-2xl">
                Popular Categories
              </h2>

              <span className="hidden rounded-full bg-red-100 px-2 py-1 text-xs font-bold text-red-600 dark:bg-red-950 dark:text-red-400 sm:inline-flex">
                POPULAR
              </span>
            </div>

            <p className="mt-1 text-xs text-gray-500 dark:text-zinc-400 sm:text-sm">
              <span className="sm:hidden">
                Explore our collections
              </span>

              <span className="hidden sm:inline">
                Explore customer-favorite
                shopping categories
              </span>
            </p>
          </div>

          <Link
            to="/shop"
            className="flex shrink-0 items-center gap-1 whitespace-nowrap text-xs font-semibold text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 sm:text-sm"
          >
            Browse all
            <ArrowRight size={14} />
          </Link>
        </div>

        {popularCategories.length ===
        0 ? (
          <div className="rounded-xl border border-gray-200 p-6 text-center text-sm text-gray-500 dark:border-zinc-800 dark:text-zinc-400">
            No categories available.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3 lg:grid-cols-8">
            {popularCategories.map(
              (
                category,
                index
              ) => (
                <Link
                  key={
                    category._id
                  }
                  to={`/shop?category=${category._id}`}
                  className="group relative flex min-w-0 items-center gap-3 rounded-xl border border-gray-200 bg-white p-3 transition-all hover:border-red-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-red-800 sm:block sm:p-4 sm:text-center"
                >
                  {index <
                    3 && (
                    <span
                      className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500"
                      aria-hidden="true"
                    />
                  )}

                  <img
                    src={
                      category.image ||
                      'https://placehold.co/100x100?text=%20'
                    }
                    alt={
                      category.name
                    }
                    loading="lazy"
                    className="h-12 w-12 shrink-0 rounded-full object-cover ring-2 ring-red-50 transition group-hover:ring-red-200 dark:ring-red-950 dark:group-hover:ring-red-800 sm:mx-auto sm:mb-3 sm:h-16 sm:w-16"
                  />

                  <span className="line-clamp-2 min-w-0 text-xs font-semibold leading-4 group-hover:text-red-600 dark:group-hover:text-red-400 sm:text-sm">
                    {
                      category.name
                    }
                  </span>
                </Link>
              )
            )}
          </div>
        )}
      </section>

      {/* =================================================
          DEALS
      ================================================== */}

      {discounted.length >
        0 && (
        <Section
          title="Today's Deals"
          subtitle="Limited-time savings on selected products"
          products={discounted.slice(
            0,
            5
          )}
          viewAllHref="/shop?deals=true"
        />
      )}

      {/* =================================================
          POPULAR PRODUCTS
      ================================================== */}

      <Section
        title="Popular Products"
        subtitle="Products shoppers are checking out"
        products={popular}
        viewAllHref="/shop?sort=popular"
      />

      {/* =================================================
          SPECIAL OFFERS
      ================================================== */}

      <section className="mb-8 sm:mb-10 lg:mb-12">
        <div className="overflow-hidden rounded-2xl border border-red-100 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-start justify-between gap-3 border-b border-red-100 bg-gradient-to-r from-red-50 to-white p-4 dark:border-zinc-800 dark:from-red-950/50 dark:to-zinc-900 sm:items-center sm:p-5 md:p-6">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <BadgePercent
                  size={20}
                  className="shrink-0 text-red-600 dark:text-red-400"
                />

                <h2 className="text-lg font-bold sm:text-xl md:text-2xl">
                  Special Offers &amp;
                  Deals
                </h2>
              </div>

              <p className="mt-1 text-xs text-gray-500 dark:text-zinc-400 sm:text-sm">
                Real discounts currently
                available on ShopNepal
              </p>
            </div>

            <Link
              to="/shop?deals=true"
              className="flex shrink-0 items-center gap-1 whitespace-nowrap text-xs font-semibold text-red-600 hover:text-red-700 dark:text-red-400 sm:text-sm"
            >
              <span className="sm:hidden">
                See all
              </span>

              <span className="hidden sm:inline">
                See all deals
              </span>

              <ArrowRight
                size={14}
              />
            </Link>
          </div>

          {tableDeals.length ===
          0 ? (
            <div className="p-7 text-center">
              <BadgePercent
                size={30}
                className="mx-auto mb-2 text-gray-300 dark:text-zinc-700"
              />

              <p className="text-sm text-gray-500 dark:text-zinc-400">
                No special offers
                available right now.
              </p>
            </div>
          ) : (
            <>
              {/* MOBILE */}

              <div className="divide-y divide-gray-100 dark:divide-zinc-800 md:hidden">
                {tableDeals.map(
                  (product) => {
                    const regularPrice =
                      Number(
                        product.price
                      );

                    const salePrice =
                      Number(
                        product.discountPrice
                      );

                    const saved =
                      Math.max(
                        0,
                        regularPrice -
                          salePrice
                      );

                    const percent =
                      regularPrice > 0
                        ? Math.round(
                            (saved /
                              regularPrice) *
                              100
                          )
                        : 0;

                    return (
                      <Link
                        key={
                          product._id
                        }
                        to={`/product/${product._id}`}
                        className="flex items-center gap-3 p-3.5 transition hover:bg-red-50/50 dark:hover:bg-red-950/20"
                      >
                        {product
                          .images?.[0] ? (
                          <img
                            src={
                              product
                                .images[0]
                            }
                            alt={
                              product.name
                            }
                            loading="lazy"
                            className="h-16 w-16 shrink-0 rounded-xl bg-gray-100 object-cover dark:bg-zinc-800"
                          />
                        ) : (
                          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-500 dark:bg-red-950">
                            <BadgePercent
                              size={21}
                            />
                          </div>
                        )}

                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-semibold">
                            {
                              product.name
                            }
                          </div>

                          <div className="mt-1 flex flex-wrap items-baseline gap-2">
                            <span className="text-sm font-bold text-red-600 dark:text-red-400">
                              Rs.{' '}
                              {salePrice.toLocaleString()}
                            </span>

                            <span className="text-[11px] text-gray-400 line-through">
                              Rs.{' '}
                              {regularPrice.toLocaleString()}
                            </span>
                          </div>

                          <div className="mt-1.5 flex items-center gap-2">
                            <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700 dark:bg-red-950 dark:text-red-300">
                              {
                                percent
                              }
                              % OFF
                            </span>

                            <span className="text-[10px] font-medium text-green-600 dark:text-green-400">
                              Save Rs.{' '}
                              {saved.toLocaleString()}
                            </span>
                          </div>
                        </div>

                        <ArrowRight
                          size={16}
                          className="shrink-0 text-gray-400"
                        />
                      </Link>
                    );
                  }
                )}
              </div>

              {/* DESKTOP */}

              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[650px] text-sm">
                  <thead className="bg-gray-50 text-gray-600 dark:bg-zinc-950/60 dark:text-zinc-300">
                    <tr>
                      <th className="px-5 py-4 text-left font-semibold">
                        Product
                      </th>

                      <th className="px-5 py-4 text-left font-semibold">
                        Regular Price
                      </th>

                      <th className="px-5 py-4 text-left font-semibold">
                        Deal Price
                      </th>

                      <th className="px-5 py-4 text-left font-semibold">
                        You Save
                      </th>

                      <th className="px-5 py-4 text-left font-semibold">
                        Offer
                      </th>

                      <th className="px-5 py-4 text-right font-semibold">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                    {tableDeals.map(
                      (product) => {
                        const regularPrice =
                          Number(
                            product.price
                          );

                        const salePrice =
                          Number(
                            product.discountPrice
                          );

                        const saved =
                          Math.max(
                            0,
                            regularPrice -
                              salePrice
                          );

                        const percent =
                          regularPrice > 0
                            ? Math.round(
                                (saved /
                                  regularPrice) *
                                  100
                              )
                            : 0;

                        return (
                          <tr
                            key={
                              product._id
                            }
                            className="transition-colors hover:bg-red-50/50 dark:hover:bg-red-950/20"
                          >
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                {product
                                  .images?.[0] ? (
                                  <img
                                    src={
                                      product
                                        .images[0]
                                    }
                                    alt={
                                      product.name
                                    }
                                    loading="lazy"
                                    className="h-10 w-10 rounded-lg bg-gray-100 object-cover dark:bg-zinc-800"
                                  />
                                ) : (
                                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 text-red-500 dark:bg-red-950">
                                    <BadgePercent
                                      size={
                                        17
                                      }
                                    />
                                  </div>
                                )}

                                <div className="max-w-[220px] truncate font-semibold">
                                  {
                                    product.name
                                  }
                                </div>
                              </div>
                            </td>

                            <td className="px-5 py-4 text-gray-500 line-through dark:text-zinc-400">
                              Rs.{' '}
                              {regularPrice.toLocaleString()}
                            </td>

                            <td className="px-5 py-4 font-bold text-red-600 dark:text-red-400">
                              Rs.{' '}
                              {salePrice.toLocaleString()}
                            </td>

                            <td className="px-5 py-4 font-medium text-green-600 dark:text-green-400">
                              Rs.{' '}
                              {saved.toLocaleString()}
                            </td>

                            <td className="px-5 py-4">
                              <span className="inline-flex whitespace-nowrap rounded-full bg-red-100 px-3 py-1.5 text-xs font-bold text-red-700 dark:bg-red-950 dark:text-red-300">
                                {
                                  percent
                                }
                                % OFF
                              </span>
                            </td>

                            <td className="px-5 py-4 text-right">
                              <Link
                                to={`/product/${product._id}`}
                                className="inline-flex whitespace-nowrap rounded-lg bg-red-600 px-3 py-2 font-semibold text-white transition hover:bg-red-700"
                              >
                                Shop now
                              </Link>
                            </td>
                          </tr>
                        );
                      }
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </section>

      {/* =================================================
          FEATURED
      ================================================== */}

      <Section
        title="Featured Products"
        subtitle="Handpicked products for you"
        products={featured}
        viewAllHref="/shop?featured=true"
      />

      {/* =================================================
          NEW ARRIVALS
      ================================================== */}

      <Section
        title="New Arrivals"
        subtitle="Fresh additions to ShopNepal"
        products={newArrivals}
        viewAllHref="/shop?sort=newest"
      />

      {/* =================================================
          CONTACT
      ================================================== */}

      <section
        id="contact"
        className="mb-4 overflow-hidden rounded-2xl bg-gray-950 text-white dark:bg-black sm:mb-6"
      >
        <div className="grid md:grid-cols-2">
          <div className="p-6 md:p-10">
            <span className="text-xs font-bold uppercase tracking-wider text-red-400 sm:text-sm">
              Contact Us
            </span>

            <h2 className="mt-2 text-xl font-bold sm:text-2xl md:text-3xl">
              Need help with your
              order?
            </h2>

            <p className="mt-3 max-w-md text-sm leading-6 text-gray-400 md:leading-7">
              Our support team is
              here to help with
              products, orders,
              payments, delivery and
              your ShopNepal account.
            </p>

            <Link
              to="/shop"
              className="mt-5 inline-flex rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 md:mt-6 md:px-5 md:py-3"
            >
              Continue Shopping
            </Link>
          </div>

          <div className="space-y-4 bg-white/5 p-6 md:space-y-5 md:p-10">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-600/20 text-red-400">
                <Phone size={18} />
              </div>

              <div>
                <div className="text-xs text-gray-400 sm:text-sm">
                  Phone
                </div>

                <a
                  href="tel:+9779702828652"
                  className="text-sm font-semibold hover:text-red-400 sm:text-base"
                >
                  +977 9702828652
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-600/20 text-red-400">
                <Mail size={18} />
              </div>

              <div className="min-w-0">
                <div className="text-xs text-gray-400 sm:text-sm">
                  Email
                </div>

                <a
                  href="mailto:ankitsigdel910@gmail.com"
                  className="break-all text-sm font-semibold hover:text-red-400 sm:text-base"
                >
                  ankitsigdel910@gmail.com
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-600/20 text-red-400">
                <MapPin size={18} />
              </div>

              <div>
                <div className="text-xs text-gray-400 sm:text-sm">
                  Address
                </div>

                <div className="text-sm font-semibold sm:text-base">
                  Kathmandu, Nepal
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;