import {
  Link,
} from 'react-router-dom';

import {
  Heart,
  ShoppingCart,
  Star,
} from 'lucide-react';

import {
  Product,
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

import toast from 'react-hot-toast';

// ============================================================
// PRODUCT CARD
// ============================================================

const ProductCard = ({
  product,
}: {
  product: Product;
}) => {
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
  // WISHLIST
  // ==========================================================

  const isWishlisted =
    wishlistProducts.some(
      (
        wishlistProduct
      ) =>
        wishlistProduct._id ===
        product._id
    );

  // ==========================================================
  // PRICE / DISCOUNT
  // ==========================================================

  /*
   * A discount is valid only when:
   *
   * - discountPrice exists
   * - discountPrice > 0
   * - discountPrice < regular price
   */

  const hasDiscount =
    product.discountPrice !=
      null &&
    product.discountPrice >
      0 &&
    product.discountPrice <
      product.price;

  /*
   * Price actually paid by customer.
   */

  const sellingPrice =
    hasDiscount
      ? product.discountPrice!
      : product.price;

  /*
   * Discount percentage.
   */

  const discountPct =
    hasDiscount
      ? Math.round(
          ((product.price -
            product.discountPrice!) /
            product.price) *
            100
        )
      : 0;

  // ==========================================================
  // ADD TO CART
  // ==========================================================

  const handleAddToCart = (
    event: React.MouseEvent
  ) => {
    event.preventDefault();

    /*
     * Prevent the button click
     * from navigating through
     * the parent Link.
     */
    event.stopPropagation();

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
      })
    );
  };

  // ==========================================================
  // WISHLIST
  // ==========================================================

  const handleWishlist = (
    event: React.MouseEvent
  ) => {
    event.preventDefault();

    event.stopPropagation();

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
  // UI
  // ==========================================================

  return (
    <Link
      to={`/products/${product._id}`}
      className="
        card
        group
        overflow-hidden
        flex
        flex-col
        bg-white
        dark:bg-zinc-900
        border
        border-gray-200
        dark:border-zinc-800
        hover:shadow-lg
        transition-shadow
      "
    >

      {/* =====================================================
          PRODUCT IMAGE
      ====================================================== */}

      <div className="relative aspect-square bg-gray-100 dark:bg-zinc-800 overflow-hidden">

        <img
          src={
            product.images?.[0] ||
            'https://placehold.co/400x400?text=No+Image'
          }
          alt={
            product.name
          }
          className="
            w-full
            h-full
            object-cover
            group-hover:scale-105
            transition-transform
            duration-300
          "
        />

        {/* ===================================================
            DISCOUNT BADGE
        ==================================================== */}

        {hasDiscount && (
          <span
            className="
              absolute
              top-2
              left-2
              bg-red-500
              text-white
              text-xs
              font-bold
              px-2
              py-1
              rounded-md
              shadow-sm
            "
          >
            -{discountPct}%
          </span>
        )}

        {/* ===================================================
            WISHLIST BUTTON
        ==================================================== */}

        <button
          type="button"
          onClick={
            handleWishlist
          }
          className="
            absolute
            top-2
            right-2
            bg-white/95
            hover:bg-white
            rounded-full
            p-2
            shadow
            transition
          "
          aria-label={
            isWishlisted
              ? 'Remove from wishlist'
              : 'Add to wishlist'
          }
        >
          <Heart
            size={16}
            className={
              isWishlisted
                ? 'fill-red-500 text-red-500'
                : 'text-gray-600'
            }
          />
        </button>

        {/* ===================================================
            OUT OF STOCK
        ==================================================== */}

        {product.stock ===
          0 && (
          <span
            className="
              absolute
              bottom-2
              left-2
              bg-gray-900/85
              text-white
              text-xs
              font-medium
              px-2
              py-1
              rounded
            "
          >
            Out of stock
          </span>
        )}

      </div>

      {/* =====================================================
          PRODUCT INFORMATION
      ====================================================== */}

      <div className="p-3 flex flex-col gap-1 flex-1">

        {/* ===================================================
            BRAND
        ==================================================== */}

        {product.brand && (
          <span
            className="
              text-xs
              text-gray-500
              dark:text-gray-400
            "
          >
            {
              product.brand
            }
          </span>
        )}

        {/* ===================================================
            PRODUCT NAME
        ==================================================== */}

        <h3
          className="
            font-semibold
            text-sm
            text-gray-900
            dark:text-white
            line-clamp-2
            leading-5
          "
        >
          {
            product.name
          }
        </h3>

        {/* ===================================================
            RATING
        ==================================================== */}

        <div
          className="
            flex
            items-center
            gap-1
            text-xs
            text-gray-500
            dark:text-gray-400
            mt-1
          "
        >
          <Star
            size={13}
            className="
              fill-yellow-400
              text-yellow-400
            "
          />

          <span>
            {product.rating.toFixed(
              1
            )}
          </span>

          <span>
            (
            {
              product.numReviews
            }
            )
          </span>
        </div>

        {/* ===================================================
            PRICE + CART
        ==================================================== */}

        <div
          className="
            mt-auto
            flex
            items-end
            justify-between
            gap-2
            pt-3
          "
        >

          {/* =================================================
              PRICE
          ================================================== */}

          <div className="min-w-0">

            {/* SELLING PRICE */}

            <span
              className="
                font-bold
                text-base
                text-gray-900
                dark:text-white
                whitespace-nowrap
              "
            >
              Rs.{' '}
              {sellingPrice.toLocaleString()}
            </span>

            {/* ORIGINAL PRICE */}

            {hasDiscount && (
              <span
                className="
                  text-xs
                  text-gray-400
                  dark:text-gray-500
                  line-through
                  ml-2
                  whitespace-nowrap
                "
              >
                Rs.{' '}
                {product.price.toLocaleString()}
              </span>
            )}

          </div>

          {/* =================================================
              CART BUTTON
          ================================================== */}

          <button
            type="button"
            onClick={
              handleAddToCart
            }
            disabled={
              product.stock ===
              0
            }
            className="
              shrink-0
              bg-brand-600
              hover:bg-brand-700
              disabled:opacity-40
              disabled:cursor-not-allowed
              text-white
              p-2
              rounded-lg
              transition
            "
            aria-label={`Add ${product.name} to cart`}
          >
            <ShoppingCart
              size={16}
            />
          </button>

        </div>

      </div>

    </Link>
  );
};

export default ProductCard;