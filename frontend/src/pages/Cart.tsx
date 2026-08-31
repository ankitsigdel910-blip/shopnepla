import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchCart, updateCartItem, removeCartItem } from '../features/cartSlice';

const Cart = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((s) => s.auth);
  const { cart, status } = useAppSelector((s) => s.cart);

  useEffect(() => {
    if (user) dispatch(fetchCart());
  }, [user, dispatch]);

  if (!user) {
    return (
      <div className="py-20 text-center">
        <p className="text-gray-600 mb-4">Please log in to view your cart.</p>
        <Link to="/login" className="btn-primary">Log In</Link>
      </div>
    );
  }

  if (status === 'loading') return <div className="py-20 text-center text-gray-500">Loading cart...</div>;

  if (cart.items.length === 0) {
    return (
      <div className="py-20 text-center">
        <p className="text-gray-600 mb-4">Your cart is empty.</p>
        <Link to="/shop" className="btn-primary">Continue Shopping</Link>
      </div>
    );
  }

  const shippingFee = 100;
  const total = cart.totalAmount + shippingFee;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Shopping Cart</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => {
            const outOfStock = item.quantity > item.product.stock;
            return (
              <div key={item.product._id} className="card p-4 flex gap-4">
                <img
                  src={item.product.images[0] || 'https://placehold.co/100x100'}
                  className="w-20 h-20 rounded-lg object-cover"
                  alt={item.product.name}
                />
                <div className="flex-1">
                  <Link to={`/products/${item.product._id}`} className="font-medium text-sm hover:underline">
                    {item.product.name}
                  </Link>
                  <p className="text-sm text-gray-500 mt-1">Rs. {item.price.toLocaleString()} each</p>
                  {outOfStock && (
                    <p className="text-xs text-red-600 mt-1">Only {item.product.stock} left — reduce quantity</p>
                  )}
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center border border-gray-300 rounded-lg">
                      <button
                        className="p-1.5"
                        onClick={() => dispatch(updateCartItem({ productId: item.product._id, quantity: Math.max(1, item.quantity - 1) }))}
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-8 text-center text-sm">{item.quantity}</span>
                      <button
                        className="p-1.5"
                        onClick={() =>
                          dispatch(updateCartItem({ productId: item.product._id, quantity: item.quantity + 1 }))
                        }
                        disabled={item.quantity >= item.product.stock}
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <button
                      className="text-red-500 text-sm flex items-center gap-1"
                      onClick={() => dispatch(removeCartItem(item.product._id))}
                    >
                      <Trash2 size={14} /> Remove
                    </button>
                  </div>
                </div>
                <div className="font-semibold text-sm">Rs. {(item.price * item.quantity).toLocaleString()}</div>
              </div>
            );
          })}
          <Link to="/shop" className="text-brand-600 text-sm hover:underline inline-block mt-2">
            ← Continue Shopping
          </Link>
        </div>

        <div className="card p-5 h-fit">
          <h2 className="font-semibold mb-4">Order Summary</h2>
          <div className="space-y-2 text-sm text-gray-700">
            <div className="flex justify-between"><span>Subtotal</span><span>Rs. {cart.totalAmount.toLocaleString()}</span></div>
            <div className="flex justify-between"><span>Shipping</span><span>Rs. {shippingFee.toLocaleString()}</span></div>
          </div>
          <div className="flex justify-between font-bold text-base border-t mt-3 pt-3">
            <span>Total</span><span>Rs. {total.toLocaleString()}</span>
          </div>
          <button
            className="btn-primary w-full mt-5"
            onClick={() => navigate('/checkout')}
            disabled={cart.items.some((i) => i.quantity > i.product.stock)}
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
