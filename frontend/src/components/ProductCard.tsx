import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { Product } from '../types';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { addToCart } from '../features/cartSlice';
import { addToWishlist, removeFromWishlist } from '../features/wishlistSlice';
import toast from 'react-hot-toast';

const ProductCard = ({ product }: { product: Product }) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);
  const wishlistProducts = useAppSelector((s) => s.wishlist.products);
  const isWishlisted = wishlistProducts.some((p) => p._id === product._id);

  const price = product.discountPrice || product.price;
  const hasDiscount = !!product.discountPrice && product.discountPrice < product.price;
  const discountPct = hasDiscount ? Math.round(100 - (product.discountPrice! / product.price) * 100) : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) return toast.error('Please log in to add items to your cart');
    dispatch(addToCart({ productId: product._id }));
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) return toast.error('Please log in to use your wishlist');
    isWishlisted ? dispatch(removeFromWishlist(product._id)) : dispatch(addToWishlist(product._id));
  };

  return (
    <Link to={`/products/${product._id}`} className="card group overflow-hidden flex flex-col">
      <div className="relative aspect-square bg-gray-100 overflow-hidden">
        <img
          src={product.images[0] || 'https://placehold.co/400x400?text=No+Image'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {hasDiscount && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded">
            -{discountPct}%
          </span>
        )}
        <button
          onClick={handleWishlist}
          className="absolute top-2 right-2 bg-white/90 hover:bg-white rounded-full p-2 shadow"
          aria-label="Toggle wishlist"
        >
          <Heart size={16} className={isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-600'} />
        </button>
        {product.stock === 0 && (
          <span className="absolute bottom-2 left-2 bg-gray-900/80 text-white text-xs px-2 py-1 rounded">
            Out of stock
          </span>
        )}
      </div>

      <div className="p-3 flex flex-col gap-1 flex-1">
        {product.brand && <span className="text-xs text-gray-500">{product.brand}</span>}
        <h3 className="font-medium text-sm text-gray-900 line-clamp-2">{product.name}</h3>

        <div className="flex items-center gap-1 text-xs text-gray-500">
          <Star size={12} className="fill-yellow-400 text-yellow-400" />
          {product.rating.toFixed(1)} ({product.numReviews})
        </div>

        <div className="mt-auto flex items-center justify-between pt-2">
          <div>
            <span className="font-semibold text-gray-900">Rs. {price.toLocaleString()}</span>
            {hasDiscount && (
              <span className="text-xs text-gray-400 line-through ml-1">Rs. {product.price.toLocaleString()}</span>
            )}
          </div>
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="bg-brand-600 hover:bg-brand-700 disabled:opacity-40 text-white p-2 rounded-lg"
            aria-label="Add to cart"
          >
            <ShoppingCart size={16} />
          </button>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
