import { Link } from 'react-router-dom';

const Footer = () => (
  <footer className="bg-gray-900 text-gray-300 mt-16">
    <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
      <div>
        <h4 className="text-white font-semibold mb-3">ShopNepal</h4>
        <p className="text-gray-400">Your one-stop online store for electronics, fashion, home and beauty.</p>
      </div>
      <div>
        <h4 className="text-white font-semibold mb-3">Shop</h4>
        <ul className="space-y-2">
          <li><Link to="/shop" className="hover:text-white">All Products</Link></li>
          <li><Link to="/shop?featured=true" className="hover:text-white">Deals</Link></li>
        </ul>
      </div>
      <div>
        <h4 className="text-white font-semibold mb-3">Account</h4>
        <ul className="space-y-2">
          <li><Link to="/dashboard/orders" className="hover:text-white">My Orders</Link></li>
          <li><Link to="/wishlist" className="hover:text-white">Wishlist</Link></li>
        </ul>
      </div>
      <div>
        <h4 className="text-white font-semibold mb-3">Payments</h4>
        <p className="text-gray-400">eSewa · Cash on Delivery</p>
      </div>
    </div>
    <div className="border-t border-gray-800 text-center text-xs text-gray-500 py-4">
      © {new Date().getFullYear()} ShopNepal. All rights reserved.
    </div>
  </footer>
);

export default Footer;
