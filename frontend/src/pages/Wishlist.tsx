import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchWishlist, removeFromWishlist } from '../features/wishlistSlice';
import { addToCart } from '../features/cartSlice';
import ProductCard from '../components/ProductCard';

const Wishlist = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);
  const { products } = useAppSelector((s) => s.wishlist);

  useEffect(() => {
    if (user) dispatch(fetchWishlist());
  }, [user, dispatch]);

  if (!user) {
    return (
      <div className="py-20 text-center">
        <p className="text-gray-600 mb-4">Please log in to view your wishlist.</p>
        <Link to="/login" className="btn-primary">Log In</Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">My Wishlist ({products.length})</h1>
      {products.length === 0 ? (
        <div className="py-16 text-center text-gray-500">Your wishlist is empty.</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((p) => (
            <div key={p._id} className="relative">
              <ProductCard product={p} />
              <div className="flex gap-2 mt-2">
                <button
                  className="btn-primary flex-1 text-xs py-1.5"
                  onClick={() => {
                    dispatch(addToCart({ productId: p._id }));
                    dispatch(removeFromWishlist(p._id));
                  }}
                >
                  Move to Cart
                </button>
                <button className="btn-secondary text-xs py-1.5 px-3" onClick={() => dispatch(removeFromWishlist(p._id))}>
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
