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
    <section className="mb-12">
      <div className="flex items-end justify-between gap-4 mb-5">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
            {title}
          </h2>

          {subtitle && (
            <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
              {subtitle}
            </p>
          )}
        </div>

        <Link
          to={viewAllHref}
          className="text-sm font-semibold text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 flex items-center gap-1 shrink-0"
        >
          View all
          <ArrowRight size={15} />
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="rounded-xl border border-gray-200 dark:border-zinc-800 p-8 text-center text-gray-500 dark:text-zinc-400">
          Nothing to show here yet.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
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
     LOAD HOME PAGE DATA
  ==================================================== */

  useEffect(() => {
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
            /* Featured */
            productApi.list({
              featured: true,
              limit: 5,
            }),

            /* Popular */
            productApi.list({
              sort: 'popular',
              limit: 5,
            }),

            /* Real deals */
            productApi.list({
              deals: true,
              sort: 'newest',
              limit: 10,
            }),

            /* New arrivals */
            productApi.list({
              sort: 'newest',
              limit: 5,
            }),

            /* Categories */
            categoryApi.list(),
          ]);

          const featuredProducts:
            Product[] =
              featuredRes.data.data
                .products;

          const popularProducts:
            Product[] =
              popularRes.data.data
                .products;

          const dealProducts:
            Product[] =
              dealsRes.data.data
                .products;

          const newestProducts:
            Product[] =
              newRes.data.data
                .products;

          const categoryList:
            Category[] =
              categoryRes.data.data
                .categories;

          setFeatured(
            featuredProducts
          );

          setPopular(
            popularProducts
          );

          setDiscounted(
            dealProducts
          );

          setNewArrivals(
            newestProducts
          );

          setCategories(
            categoryList
          );
        } catch (error) {
          console.error(
            'Failed to load homepage:',
            error
          );
        } finally {
          setLoading(false);
        }
      };

    loadHome();
  }, []);

  /* ====================================================
     POPULAR CATEGORIES

     Currently the first 8 active categories.
     If sales analytics are added later, this can
     be replaced by actual popularity ranking.
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

  /*
   * The deals table shows at most
   * four actual discounted products.
   */
  const tableDeals =
    useMemo(
      () =>
        discounted.slice(
          0,
          4
        ),
      [discounted]
    );

  /* ====================================================
     LOADING
  ==================================================== */

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-gray-500 dark:text-zinc-400">
        <div className="loading-spinner mb-3" />

        Loading ShopNepal...
      </div>
    );
  }

  return (
    <div className="text-gray-900 dark:text-zinc-100">
      {/* =================================================
          PROMOTIONAL BANNER SLIDER
      ================================================== */}

      <div className="mb-8">
        <PromoBannerSlider />
      </div>

      {/* =================================================
          BENEFITS
      ================================================== */}

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-12">
        {/* Delivery */}
        <div className="flex items-center gap-3 bg-red-50 dark:bg-zinc-900 border border-red-100 dark:border-zinc-800 rounded-xl p-4">
          <div className="w-10 h-10 shrink-0 bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 rounded-lg flex items-center justify-center">
            <Truck size={20} />
          </div>

          <div>
            <div className="font-semibold">
              Delivery Across Nepal
            </div>

            <div className="text-xs text-gray-500 dark:text-zinc-400">
              Convenient nationwide
              shopping
            </div>
          </div>
        </div>

        {/* Payment */}
        <div className="flex items-center gap-3 bg-red-50 dark:bg-zinc-900 border border-red-100 dark:border-zinc-800 rounded-xl p-4">
          <div className="w-10 h-10 shrink-0 bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 rounded-lg flex items-center justify-center">
            <ShieldCheck
              size={20}
            />
          </div>

          <div>
            <div className="font-semibold">
              Secure Payments
            </div>

            <div className="text-xs text-gray-500 dark:text-zinc-400">
              eSewa, and COD
            </div>
          </div>
        </div>

        {/* Deals */}
        <Link
          to="/shop?deals=true"
          className="flex items-center gap-3 bg-red-50 dark:bg-zinc-900 border border-red-100 dark:border-zinc-800 rounded-xl p-4 hover:border-red-300 dark:hover:border-red-800 hover:shadow-sm transition-all"
        >
          <div className="w-10 h-10 shrink-0 bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 rounded-lg flex items-center justify-center">
            <BadgePercent
              size={20}
            />
          </div>

          <div>
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

      <section className="mb-12">
        <div className="flex items-end justify-between gap-4 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl md:text-2xl font-bold dark:text-white">
                Popular Categories
              </h2>

              <span className="hidden sm:inline-flex bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 text-xs font-bold px-2 py-1 rounded-full">
                POPULAR
              </span>
            </div>

            <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
              Explore customer-favorite
              shopping categories
            </p>
          </div>

          <Link
            to="/shop"
            className="text-sm font-semibold text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
          >
            Browse all
          </Link>
        </div>

        {popularCategories.length ===
        0 ? (
          <div className="card p-8 text-center text-sm text-gray-500 dark:text-zinc-400">
            No categories available.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
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
                  className="group relative bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-4 text-center hover:border-red-300 dark:hover:border-red-800 hover:shadow-md transition-all"
                >
                  {index <
                    3 && (
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
                  )}

                  <img
                    src={
                      category.image ||
                      'https://placehold.co/100x100?text=%20'
                    }
                    alt={
                      category.name
                    }
                    className="w-16 h-16 object-cover rounded-full mx-auto mb-3 ring-2 ring-red-50 dark:ring-red-950 group-hover:ring-red-200 dark:group-hover:ring-red-800 transition"
                  />

                  <span className="text-xs sm:text-sm font-semibold group-hover:text-red-600 dark:group-hover:text-red-400 transition">
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
          DEAL PRODUCTS
      ================================================== */}

      {discounted.length > 0 && (
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
          SPECIAL OFFERS TABLE
      ================================================== */}

      <section className="mb-12">
        <div className="rounded-2xl border border-red-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-sm">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 md:p-6 bg-gradient-to-r from-red-50 to-white dark:from-red-950/50 dark:to-zinc-900 border-b border-red-100 dark:border-zinc-800">
            <div>
              <div className="flex items-center gap-2">
                <BadgePercent className="text-red-600 dark:text-red-400" />

                <h2 className="text-xl md:text-2xl font-bold">
                  Special Offers &
                  Deals
                </h2>
              </div>

              <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
                Real discounts currently
                available on ShopNepal
              </p>
            </div>

            <Link
              to="/shop?deals=true"
              className="text-sm font-semibold text-red-600 dark:text-red-400 hover:text-red-700 flex items-center gap-1"
            >
              See all deals
              <ArrowRight
                size={15}
              />
            </Link>
          </div>

          {tableDeals.length ===
          0 ? (
            <div className="p-8 text-center">
              <BadgePercent
                size={32}
                className="mx-auto text-gray-300 dark:text-zinc-700 mb-2"
              />

              <p className="text-sm text-gray-500 dark:text-zinc-400">
                No special offers
                available right now.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[650px] text-sm">
                <thead className="bg-gray-50 dark:bg-zinc-950/60 text-gray-600 dark:text-zinc-300">
                  <tr>
                    <th className="text-left font-semibold px-5 py-4">
                      Product
                    </th>

                    <th className="text-left font-semibold px-5 py-4">
                      Regular Price
                    </th>

                    <th className="text-left font-semibold px-5 py-4">
                      Deal Price
                    </th>

                    <th className="text-left font-semibold px-5 py-4">
                      You Save
                    </th>

                    <th className="text-left font-semibold px-5 py-4">
                      Offer
                    </th>

                    <th className="text-right font-semibold px-5 py-4">
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

                      const amountSaved =
                        Math.max(
                          0,
                          regularPrice -
                            salePrice
                        );

                      const discountPercent =
                        regularPrice >
                        0
                          ? Math.round(
                              (amountSaved /
                                regularPrice) *
                                100
                            )
                          : 0;

                      return (
                        <tr
                          key={
                            product._id
                          }
                          className="hover:bg-red-50/50 dark:hover:bg-red-950/20 transition-colors"
                        >
                          {/* Product */}
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
                                  className="w-10 h-10 rounded-lg object-cover bg-gray-100 dark:bg-zinc-800"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-lg bg-red-50 dark:bg-red-950 flex items-center justify-center text-red-500">
                                  <BadgePercent
                                    size={
                                      17
                                    }
                                  />
                                </div>
                              )}

                              <div className="font-semibold text-gray-900 dark:text-white max-w-[220px] truncate">
                                {
                                  product.name
                                }
                              </div>
                            </div>
                          </td>

                          {/* Regular */}
                          <td className="px-5 py-4 text-gray-500 dark:text-zinc-400 line-through">
                            Rs.{' '}
                            {regularPrice.toLocaleString()}
                          </td>

                          {/* Deal */}
                          <td className="px-5 py-4 font-bold text-red-600 dark:text-red-400">
                            Rs.{' '}
                            {salePrice.toLocaleString()}
                          </td>

                          {/* Saved */}
                          <td className="px-5 py-4 text-green-600 dark:text-green-400 font-medium">
                            Rs.{' '}
                            {amountSaved.toLocaleString()}
                          </td>

                          {/* Offer */}
                          <td className="px-5 py-4">
                            <span className="inline-flex bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 font-bold text-xs px-3 py-1.5 rounded-full whitespace-nowrap">
                              {
                                discountPercent
                              }
                              % OFF
                            </span>
                          </td>

                          {/* Action */}
                          <td className="px-5 py-4 text-right">
                            <Link
                              to={`/product/${product._id}`}
                              className="inline-flex bg-red-600 hover:bg-red-700 text-white font-semibold px-3 py-2 rounded-lg transition whitespace-nowrap"
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
          CONTACT US
      ================================================== */}

      <section
        id="contact"
        className="mb-6 rounded-2xl overflow-hidden bg-gray-950 dark:bg-black text-white"
      >
        <div className="grid md:grid-cols-2">
          {/* Left */}
          <div className="p-7 md:p-10">
            <span className="text-red-400 font-bold text-sm uppercase tracking-wider">
              Contact Us
            </span>

            <h2 className="text-2xl md:text-3xl font-bold mt-2">
              Need help with your
              order?
            </h2>

            <p className="text-gray-400 mt-3 max-w-md leading-7">
              Our support team is
              here to help with
              products, orders,
              payments, delivery and
              your ShopNepal account.
            </p>

            <Link
              to="/shop"
              className="inline-flex mt-6 bg-red-600 hover:bg-red-700 text-white font-semibold px-5 py-3 rounded-xl transition"
            >
              Continue Shopping
            </Link>
          </div>

          {/* Right */}
          <div className="bg-white/5 p-7 md:p-10 space-y-5">
            {/* Phone */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 shrink-0 rounded-lg bg-red-600/20 text-red-400 flex items-center justify-center">
                <Phone
                  size={19}
                />
              </div>

              <div>
                <div className="text-sm text-gray-400">
                  Phone
                </div>

                <a
                  href="tel:+9779702828652"
                  className="font-semibold hover:text-red-400"
                >
                  +977 9702828652
                </a>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 shrink-0 rounded-lg bg-red-600/20 text-red-400 flex items-center justify-center">
                <Mail
                  size={19}
                />
              </div>

              <div>
                <div className="text-sm text-gray-400">
                  Email
                </div>

                <a
                  href="mailto:ankitsigdel910@gmail.com"
                  className="font-semibold hover:text-red-400 break-all"
                >
                  ankitsigdel910@gmail.com
                </a>
              </div>
            </div>

            {/* Address */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 shrink-0 rounded-lg bg-red-600/20 text-red-400 flex items-center justify-center">
                <MapPin
                  size={19}
                />
              </div>

              <div>
                <div className="text-sm text-gray-400">
                  Address
                </div>

                <div className="font-semibold">
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