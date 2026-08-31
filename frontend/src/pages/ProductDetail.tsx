import {
  useEffect,
  useState,
} from 'react';

import {
  useParams,
  useNavigate,
} from 'react-router-dom';

import toast from 'react-hot-toast';

import {
  Heart,
  Minus,
  Plus,
  ShoppingCart,
} from 'lucide-react';

import {
  productApi,
} from '../services/productService';

import {
  Product,
  Review,
} from '../types';

import {
  useAppDispatch,
  useAppSelector,
} from '../hooks/redux';

import {
  addToCart,
} from '../features/cartSlice';

import {
  addToWishlist,
  removeFromWishlist,
} from '../features/wishlistSlice';

import ProductCard from '../components/ProductCard';
import StarRating from '../components/StarRating';

import {
  getErrorMessage,
} from '../services/api';

// ============================================================
// PRODUCT DETAIL
// ============================================================

const ProductDetail = () => {
  const { id } =
    useParams();

  const navigate =
    useNavigate();

  const dispatch =
    useAppDispatch();

  const { user } =
    useAppSelector(
      (state) =>
        state.auth
    );

  const wishlistProducts =
    useAppSelector(
      (state) =>
        state.wishlist
          .products
    );

  // ==========================================================
  // STATE
  // ==========================================================

  const [
    product,
    setProduct,
  ] =
    useState<Product | null>(
      null
    );

  const [
    reviews,
    setReviews,
  ] =
    useState<Review[]>([]);

  const [
    related,
    setRelated,
  ] =
    useState<Product[]>([]);

  const [
    activeImage,
    setActiveImage,
  ] =
    useState(0);

  const [
    qty,
    setQty,
  ] =
    useState(1);

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    reviewForm,
    setReviewForm,
  ] =
    useState({
      rating: 5,
      comment: '',
    });

  const [
    submittingReview,
    setSubmittingReview,
  ] =
    useState(false);

  // ==========================================================
  // LOAD PRODUCT
  // ==========================================================

  useEffect(() => {
    if (!id) {
      return;
    }

    setLoading(true);

    productApi
      .get(id)
      .then(
        (response) => {
          setProduct(
            response.data.data
              .product
          );

          setReviews(
            response.data.data
              .reviews
          );

          setRelated(
            response.data.data
              .related
          );

          setActiveImage(
            0
          );

          setQty(1);
        }
      )
      .catch(
        (error) => {
          toast.error(
            getErrorMessage(
              error
            )
          );
        }
      )
      .finally(() => {
        setLoading(
          false
        );
      });
  }, [id]);

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div className="py-24 text-center text-gray-500 dark:text-gray-400">
        Loading...
      </div>
    );
  }

  // ==========================================================
  // PRODUCT NOT FOUND
  // ==========================================================

  if (!product) {
    return (
      <div className="py-24 text-center text-gray-500 dark:text-gray-400">
        Product not found.
      </div>
    );
  }

  // ==========================================================
  // PRODUCT VALUES
  // ==========================================================

  const price =
    product.discountPrice ||
    product.price;

  const hasDiscount =
    !!product.discountPrice;

  const isWishlisted =
    wishlistProducts.some(
      (wishlistProduct) =>
        wishlistProduct._id ===
        product._id
    );

  // ==========================================================
  // ADD TO CART
  // ==========================================================

  const handleAddToCart =
    () => {
      if (!user) {
        toast.error(
          'Please log in to add items to your cart'
        );

        return;
      }

      dispatch(
        addToCart({
          productId:
            product._id,

          quantity:
            qty,
        })
      );
    };

  // ==========================================================
  // BUY NOW
  // ==========================================================

  const handleBuyNow =
    () => {
      if (!user) {
        toast.error(
          'Please log in to continue'
        );

        return;
      }

      dispatch(
        addToCart({
          productId:
            product._id,

          quantity:
            qty,
        })
      );

      navigate(
        '/cart'
      );
    };

  // ==========================================================
  // WISHLIST
  // ==========================================================

  const handleWishlist =
    () => {
      if (!user) {
        toast.error(
          'Please log in to use your wishlist'
        );

        return;
      }

      if (isWishlisted) {
        dispatch(
          removeFromWishlist(
            product._id
          )
        );
      } else {
        dispatch(
          addToWishlist(
            product._id
          )
        );
      }
    };

  // ==========================================================
  // REVIEW
  // ==========================================================

  const submitReview =
    async (
      e: React.FormEvent
    ) => {
      e.preventDefault();

      if (!user) {
        toast.error(
          'Please log in to leave a review'
        );

        return;
      }

      setSubmittingReview(
        true
      );

      try {
        await productApi.review(
          product._id,
          reviewForm
        );

        toast.success(
          'Review submitted'
        );

        const response =
          await productApi.get(
            product._id
          );

        setProduct(
          response.data.data
            .product
        );

        setReviews(
          response.data.data
            .reviews
        );

        setReviewForm({
          rating: 5,
          comment: '',
        });
      } catch (error) {
        toast.error(
          getErrorMessage(
            error
          )
        );
      } finally {
        setSubmittingReview(
          false
        );
      }
    };

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <div className="text-gray-900 dark:text-gray-100">

      {/* =====================================================
          PRODUCT
      ====================================================== */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

        {/* ===================================================
            IMAGES
        ==================================================== */}

        <div>

          <div className="aspect-square bg-gray-100 dark:bg-gray-900 rounded-xl overflow-hidden mb-3">

            <img
              src={
                product.images[
                  activeImage
                ] ||
                'https://placehold.co/600x600?text=No+Image'
              }
              alt={
                product.name
              }
              className="w-full h-full object-cover"
            />

          </div>

          {/* IMAGE THUMBNAILS */}

          {product.images.length >
            1 && (
            <div className="flex flex-wrap gap-2">

              {product.images.map(
                (
                  image,
                  index
                ) => (
                  <button
                    type="button"
                    key={
                      image +
                      index
                    }
                    onClick={() =>
                      setActiveImage(
                        index
                      )
                    }
                    className={`
                      w-16
                      h-16
                      rounded-lg
                      overflow-hidden
                      border-2
                      transition
                      ${
                        index ===
                        activeImage
                          ? 'border-brand-600'
                          : 'border-gray-200 dark:border-gray-700'
                      }
                    `}
                  >
                    <img
                      src={
                        image
                      }
                      className="w-full h-full object-cover"
                      alt={`${product.name} ${
                        index +
                        1
                      }`}
                    />
                  </button>
                )
              )}

            </div>
          )}

        </div>

        {/* ===================================================
            PRODUCT INFORMATION
        ==================================================== */}

        <div>

          {/* BRAND */}

          {product.brand && (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {
                product.brand
              }
            </span>
          )}

          {/* =================================================
              PRODUCT NAME
              FIXED: WHITE IN DARK MODE
          ================================================== */}

          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mt-1">
            {
              product.name
            }
          </h1>

          {/* RATING */}

          <div className="flex items-center gap-2 mt-2">

            <StarRating
              value={Math.round(
                product.rating
              )}
              size={
                16
              }
            />

            <span className="text-sm text-gray-500 dark:text-gray-400">
              {product.rating.toFixed(
                1
              )}{' '}
              (
              {
                product.numReviews
              }{' '}
              reviews)
            </span>

          </div>

          {/* PRICE */}

          <div className="flex items-baseline gap-3 mt-4">

            <span className="text-3xl font-bold text-gray-900 dark:text-white">
              Rs.{' '}
              {price.toLocaleString()}
            </span>

            {hasDiscount && (
              <span className="text-lg text-gray-400 dark:text-gray-500 line-through">
                Rs.{' '}
                {product.price.toLocaleString()}
              </span>
            )}

          </div>

          {/* STOCK */}

          <p
            className={`
              mt-2
              text-sm
              font-medium
              ${
                product.stock >
                0
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
              }
            `}
          >
            {product.stock >
            0
              ? `In stock (${product.stock} available)`
              : 'Out of stock'}
          </p>

          {/* DESCRIPTION */}

          <p className="mt-4 text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
            {
              product.description
            }
          </p>

          {/* =================================================
              QUANTITY + CART
          ================================================== */}

          <div className="flex items-center gap-3 mt-6">

            {/* QUANTITY */}

            <div className="flex items-center border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white">

              <button
                type="button"
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-l-lg"
                onClick={() =>
                  setQty(
                    (
                      current
                    ) =>
                      Math.max(
                        1,
                        current -
                          1
                      )
                  )
                }
              >
                <Minus
                  size={
                    16
                  }
                />
              </button>

              <span className="w-10 text-center">
                {
                  qty
                }
              </span>

              <button
                type="button"
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-r-lg"
                onClick={() =>
                  setQty(
                    (
                      current
                    ) =>
                      Math.min(
                        product.stock,
                        current +
                          1
                      )
                  )
                }
              >
                <Plus
                  size={
                    16
                  }
                />
              </button>

            </div>

            {/* ADD TO CART */}

            <button
              type="button"
              onClick={
                handleAddToCart
              }
              disabled={
                product.stock ===
                0
              }
              className="btn-primary flex items-center gap-2 flex-1 justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingCart
                size={
                  18
                }
              />

              Add to Cart
            </button>

            {/* WISHLIST */}

            <button
              type="button"
              onClick={
                handleWishlist
              }
              className="btn-secondary p-3"
              aria-label={
                isWishlisted
                  ? 'Remove from wishlist'
                  : 'Add to wishlist'
              }
            >
              <Heart
                size={
                  18
                }
                className={
                  isWishlisted
                    ? 'fill-red-500 text-red-500'
                    : ''
                }
              />
            </button>

          </div>

          {/* BUY NOW */}

          <button
            type="button"
            onClick={
              handleBuyNow
            }
            disabled={
              product.stock ===
                0
            }
            className="btn-secondary w-full mt-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Buy Now
          </button>

          {/* =================================================
              PRODUCT META
          ================================================== */}

          <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4 text-sm text-gray-600 dark:text-gray-400 space-y-1">

            <p>
              <span className="font-medium text-gray-800 dark:text-gray-200">
                SKU:
              </span>{' '}
              {
                product.sku
              }
            </p>

            <p>
              <span className="font-medium text-gray-800 dark:text-gray-200">
                Category:
              </span>{' '}

              {typeof product.category ===
              'object'
                ? product
                    .category
                    .name
                : ''}
            </p>

          </div>

        </div>

      </div>

      {/* =====================================================
          CUSTOMER REVIEWS
      ====================================================== */}

      <section className="mt-14">

        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Customer Reviews
        </h2>

        {/* REVIEW FORM */}

        {user && (
          <form
            onSubmit={
              submitReview
            }
            className="card p-4 mb-6 max-w-lg space-y-3"
          >
            <h3 className="font-medium text-sm text-gray-900 dark:text-white">
              Write a review
            </h3>

            <StarRating
              value={
                reviewForm.rating
              }
              onChange={(
                value
              ) =>
                setReviewForm(
                  (
                    current
                  ) => ({
                    ...current,
                    rating:
                      value,
                  })
                )
              }
            />

            <textarea
              className="input-field"
              rows={
                3
              }
              placeholder="Share your thoughts about this product..."
              value={
                reviewForm.comment
              }
              onChange={(
                e
              ) =>
                setReviewForm(
                  (
                    current
                  ) => ({
                    ...current,

                    comment:
                      e.target
                        .value,
                  })
                )
              }
              required
            />

            <button
              type="submit"
              className="btn-primary text-sm"
              disabled={
                submittingReview
              }
            >
              {submittingReview
                ? 'Submitting...'
                : 'Submit Review'}
            </button>

          </form>
        )}

        {/* NO REVIEWS */}

        {reviews.length ===
        0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            No reviews yet.
            Be the first to
            review this
            product.
          </p>
        ) : (
          <div className="space-y-4">

            {reviews.map(
              (
                review
              ) => (
                <div
                  key={
                    review._id
                  }
                  className="card p-4"
                >

                  <div className="flex items-center justify-between">

                    <span className="font-medium text-sm text-gray-900 dark:text-white">
                      {
                        review
                          .user
                          .name
                      }
                    </span>

                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      {new Date(
                        review.createdAt
                      ).toLocaleDateString()}
                    </span>

                  </div>

                  <StarRating
                    value={
                      review.rating
                    }
                    size={
                      14
                    }
                  />

                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
                    {
                      review.comment
                    }
                  </p>

                </div>
              )
            )}

          </div>
        )}

      </section>

      {/* =====================================================
          RELATED PRODUCTS
      ====================================================== */}

      {related.length >
        0 && (
        <section className="mt-14">

          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Related Products
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">

            {related.map(
              (
                relatedProduct
              ) => (
                <ProductCard
                  key={
                    relatedProduct._id
                  }
                  product={
                    relatedProduct
                  }
                />
              )
            )}

          </div>

        </section>
      )}

    </div>
  );
};

export default ProductDetail;