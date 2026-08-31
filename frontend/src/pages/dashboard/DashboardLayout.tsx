import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { User, Package, Heart, MapPin, KeyRound, LogOut } from 'lucide-react';
import { useAppDispatch } from '../../hooks/redux';
import { logout } from '../../features/authSlice';
import { resetCart } from '../../features/cartSlice';
import { resetWishlist } from '../../features/wishlistSlice';

const links = [
  { to: '/dashboard/profile', label: 'Profile', icon: User },
  { to: '/dashboard/orders', label: 'Orders', icon: Package },
  { to: '/wishlist', label: 'Wishlist', icon: Heart },
  { to: '/dashboard/addresses', label: 'Addresses', icon: MapPin },
  { to: '/dashboard/change-password', label: 'Change Password', icon: KeyRound },
];

const DashboardLayout = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await dispatch(logout());
    dispatch(resetCart());
    dispatch(resetWishlist());
    navigate('/');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
      <aside className="card p-4 h-fit">
        <nav className="flex flex-col gap-1">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${isActive ? 'bg-brand-50 text-brand-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`
              }
            >
              <Icon size={16} /> {label}
            </NavLink>
          ))}
          <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 mt-2">
            <LogOut size={16} /> Logout
          </button>
        </nav>
      </aside>
      <div className="md:col-span-3">
        <Outlet />
      </div>
    </div>
  );
};

export default DashboardLayout;
