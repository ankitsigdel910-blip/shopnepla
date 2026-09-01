import {
  FormEvent,
  useEffect,
  useState,
} from 'react';

import {
  Link,
  useLocation,
  useNavigate,
} from 'react-router-dom';

import {
  Heart,
  Home,
  Menu,
  Moon,
  Search,
  ShoppingBag,
  ShoppingCart,
  Sun,
  User,
  X,
} from 'lucide-react';

import {
  useAppDispatch,
  useAppSelector,
} from '../hooks/redux';

import {
  logout,
} from '../features/authSlice';

import {
  resetCart,
} from '../features/cartSlice';

import {
  resetWishlist,
} from '../features/wishlistSlice';

/* ============================================================
   NAVBAR
============================================================ */

const Navbar = () => {
  const [
    query,
    setQuery,
  ] = useState('');

  const [
    mobileOpen,
    setMobileOpen,
  ] = useState(false);

  const [
    darkMode,
    setDarkMode,
  ] = useState(() => {
    if (
      typeof window ===
      'undefined'
    ) {
      return false;
    }

    return (
      localStorage.getItem(
        'theme'
      ) === 'dark'
    );
  });

  const navigate =
    useNavigate();

  const location =
    useLocation();

  const dispatch =
    useAppDispatch();

  /* ==========================================================
     USER
  ========================================================== */

  const { user } =
    useAppSelector(
      (state) =>
        state.auth
    );

  /* ==========================================================
     COUNTS
  ========================================================== */

  const cartCount =
    useAppSelector(
      (state) =>
        state.cart.cart.items.reduce(
          (
            total,
            item
          ) =>
            total +
            Number(
              item.quantity ||
                0
            ),
          0
        )
    );

  const wishlistCount =
    useAppSelector(
      (state) =>
        state.wishlist
          .products.length
    );

  /* ==========================================================
     THEME
  ========================================================== */

  useEffect(() => {
    const root =
      document.documentElement;

    root.classList.toggle(
      'dark',
      darkMode
    );

    localStorage.setItem(
      'theme',
      darkMode
        ? 'dark'
        : 'light'
    );
  }, [darkMode]);

  /* ==========================================================
     CLOSE MENU AFTER NAVIGATION
  ========================================================== */

  useEffect(() => {
    setMobileOpen(
      false
    );
  }, [
    location.pathname,
    location.search,
  ]);

  /* ==========================================================
     SEARCH
  ========================================================== */

  const handleSearch = (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const trimmed =
      query.trim();

    navigate(
      trimmed
        ? `/shop?search=${encodeURIComponent(
            trimmed
          )}`
        : '/shop'
    );

    setMobileOpen(false);
  };

  /* ==========================================================
     LOGOUT
  ========================================================== */

  const handleLogout =
    async () => {
      try {
        await dispatch(
          logout()
        );
      } catch (error) {
        console.error(
          'Logout failed:',
          error
        );
      } finally {
        dispatch(
          resetCart()
        );

        dispatch(
          resetWishlist()
        );

        setMobileOpen(
          false
        );

        navigate('/');
      }
    };

  /* ==========================================================
     NAVIGATION
  ========================================================== */

  const navLinks = [
    {
      to: '/',
      label: 'Home',
    },

    {
      to: '/shop',
      label: 'Shop',
    },

    {
      to: '/shop?deals=true',
      label: 'Deals',
    },
  ];

  const isActive = (
    path: string
  ) => {
    if (path === '/') {
      return (
        location.pathname ===
        '/'
      );
    }

    return location.pathname.startsWith(
      path
    );
  };

  return (
    <>
      {/* =====================================================
          HEADER
      ====================================================== */}

      <header className="sticky top-0 z-40 bg-red-600 text-white shadow-md dark:bg-red-950">
        <div className="mx-auto max-w-7xl px-3 sm:px-4">
          <div className="flex h-14 items-center justify-between gap-2 sm:h-16 sm:gap-4">
            {/* LOGO */}

            <Link
              to="/"
              className="shrink-0 text-lg font-black tracking-tight sm:text-2xl"
              aria-label="ShopNepal home"
            >
              Shop
              <span className="text-red-100">
                Nepal
              </span>
            </Link>

            {/* DESKTOP LINKS */}

            <nav
              className="hidden items-center gap-6 text-sm font-semibold lg:flex"
              aria-label="Main navigation"
            >
              {navLinks.map(
                (link) => (
                  <Link
                    key={
                      link.label
                    }
                    to={
                      link.to
                    }
                    className="text-white/90 transition-colors hover:text-white"
                  >
                    {
                      link.label
                    }
                  </Link>
                )
              )}
            </nav>

            {/* DESKTOP SEARCH */}

            <form
              onSubmit={
                handleSearch
              }
              className="relative hidden max-w-xl flex-1 md:block"
              role="search"
            >
              <input
                type="search"
                value={query}
                onChange={(
                  event
                ) =>
                  setQuery(
                    event.target
                      .value
                  )
                }
                placeholder="Search products..."
                aria-label="Search products"
                className="h-11 w-full rounded-xl border-0 bg-white pl-4 pr-14 text-gray-900 outline-none ring-2 ring-transparent transition focus:ring-red-200 dark:bg-zinc-900 dark:text-white dark:placeholder:text-zinc-400"
              />

              <button
                type="submit"
                aria-label="Search"
                className="absolute right-1.5 top-1.5 flex h-8 w-11 items-center justify-center rounded-lg bg-red-100 text-red-600 transition-colors hover:bg-red-200 dark:bg-red-900 dark:text-red-200 dark:hover:bg-red-800"
              >
                <Search
                  size={19}
                />
              </button>
            </form>

            {/* ACTIONS */}

            <div className="flex shrink-0 items-center gap-0.5 sm:gap-2">
              {/* THEME */}

              <button
                type="button"
                onClick={() =>
                  setDarkMode(
                    (
                      current
                    ) =>
                      !current
                  )
                }
                className="flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-white/10"
                aria-label={
                  darkMode
                    ? 'Switch to light mode'
                    : 'Switch to dark mode'
                }
              >
                {darkMode ? (
                  <Sun
                    size={18}
                  />
                ) : (
                  <Moon
                    size={18}
                  />
                )}
              </button>

              {/* WISHLIST TOP:
                  hide only on very small mobile,
                  because bottom nav already has it */}

              <Link
                to="/wishlist"
                className="relative hidden h-9 w-9 items-center justify-center rounded-full transition hover:bg-white/10 sm:flex"
                aria-label="Wishlist"
              >
                <Heart
                  size={20}
                />

                {wishlistCount >
                  0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-white px-1 text-[9px] font-bold text-red-600">
                    {wishlistCount >
                    99
                      ? '99+'
                      : wishlistCount}
                  </span>
                )}
              </Link>

              {/* CART TOP */}

              <Link
                to="/cart"
                className="relative hidden h-9 w-9 items-center justify-center rounded-full transition hover:bg-white/10 sm:flex"
                aria-label="Cart"
              >
                <ShoppingCart
                  size={21}
                />

                {cartCount >
                  0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-white px-1 text-[9px] font-bold text-red-600">
                    {cartCount >
                    99
                      ? '99+'
                      : cartCount}
                  </span>
                )}
              </Link>

              {/* DESKTOP USER */}

              {user ? (
                <div className="hidden items-center gap-2 md:flex">
                  <Link
                    to="/dashboard/profile"
                    className="flex items-center justify-center rounded-full transition hover:ring-2 hover:ring-white/60"
                    aria-label="My Profile"
                    title={
                      user.name ||
                      'My Profile'
                    }
                  >
                    {user.avatar ? (
                      <img
                        src={
                          user.avatar
                        }
                        alt={
                          user.name ||
                          'Profile'
                        }
                        className="h-9 w-9 rounded-full border-2 border-white/80 bg-white object-cover shadow-sm"
                      />
                    ) : (
                      <div className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-white/10">
                        <User
                          size={20}
                        />
                      </div>
                    )}
                  </Link>

                  <button
                    type="button"
                    onClick={
                      handleLogout
                    }
                    className="rounded-lg px-2 py-2 text-sm font-medium transition hover:bg-white/10"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="hidden rounded-lg bg-white px-4 py-2 font-semibold text-red-600 transition hover:bg-red-50 md:inline-flex"
                >
                  Login
                </Link>
              )}

              {/* MOBILE MENU */}

              <button
                type="button"
                onClick={() =>
                  setMobileOpen(
                    (
                      current
                    ) =>
                      !current
                  )
                }
                className="flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-white/10 lg:hidden"
                aria-label={
                  mobileOpen
                    ? 'Close menu'
                    : 'Open menu'
                }
                aria-expanded={
                  mobileOpen
                }
                aria-controls="mobile-menu"
              >
                {mobileOpen ? (
                  <X
                    size={20}
                  />
                ) : (
                  <Menu
                    size={20}
                  />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ===================================================
            ALWAYS-VISIBLE MOBILE SEARCH
        ==================================================== */}

        <div className="border-t border-white/10 px-3 pb-3 pt-2 md:hidden">
          <form
            onSubmit={
              handleSearch
            }
            className="relative mx-auto max-w-7xl"
            role="search"
          >
            <Search
              size={17}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="search"
              value={query}
              onChange={(
                event
              ) =>
                setQuery(
                  event.target
                    .value
                )
              }
              placeholder="Search products..."
              aria-label="Search products"
              className="h-10 w-full rounded-xl border-0 bg-white pl-9 pr-4 text-sm text-gray-900 shadow-sm outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-red-200 dark:bg-zinc-900 dark:text-white dark:placeholder:text-zinc-500"
            />
          </form>
        </div>

        {/* ===================================================
            HAMBURGER PANEL
        ==================================================== */}

        {mobileOpen && (
          <div
            id="mobile-menu"
            className="border-t border-white/10 bg-red-600 dark:bg-red-950 lg:hidden"
          >
            <div className="mx-auto max-w-7xl px-4 py-2">
              <nav className="flex flex-col text-sm font-semibold">
                {navLinks.map(
                  (link) => (
                    <Link
                      key={
                        link.label
                      }
                      to={
                        link.to
                      }
                      className="border-b border-white/10 py-3"
                    >
                      {
                        link.label
                      }
                    </Link>
                  )
                )}

                {user ? (
                  <>
                    <Link
                      to="/dashboard/profile"
                      className="flex items-center gap-3 border-b border-white/10 py-3"
                    >
                      {user.avatar ? (
                        <img
                          src={
                            user.avatar
                          }
                          alt={
                            user.name ||
                            'Profile'
                          }
                          className="h-9 w-9 rounded-full border-2 border-white/80 bg-white object-cover"
                        />
                      ) : (
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10">
                          <User
                            size={18}
                          />
                        </div>
                      )}

                      <div className="min-w-0">
                        <div>
                          My Profile
                        </div>

                        {user.name && (
                          <div className="truncate text-xs font-normal text-white/70">
                            {
                              user.name
                            }
                          </div>
                        )}
                      </div>
                    </Link>

                    <button
                      type="button"
                      onClick={
                        handleLogout
                      }
                      className="py-3 text-left text-red-100"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <Link
                    to="/login"
                    className="py-3"
                  >
                    Login / Register
                  </Link>
                )}
              </nav>
            </div>
          </div>
        )}
      </header>

      {/* =====================================================
          BOTTOM MOBILE NAV
      ====================================================== */}

      <nav
        className="fixed inset-x-0 bottom-0 z-50 border-t border-gray-200 bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_18px_rgba(0,0,0,0.07)] backdrop-blur-lg dark:border-zinc-800 dark:bg-zinc-950/95 md:hidden"
        aria-label="Mobile navigation"
      >
        <div className="mx-auto grid h-16 max-w-lg grid-cols-5">
          {/* HOME */}

          <Link
            to="/"
            className={`flex flex-col items-center justify-center gap-1 text-[10px] font-semibold ${
              isActive('/')
                ? 'text-red-600 dark:text-red-400'
                : 'text-gray-500 dark:text-zinc-400'
            }`}
          >
            <Home
              size={20}
              strokeWidth={
                isActive('/')
                  ? 2.5
                  : 2
              }
            />

            Home
          </Link>

          {/* SHOP */}

          <Link
            to="/shop"
            className={`flex flex-col items-center justify-center gap-1 text-[10px] font-semibold ${
              isActive('/shop')
                ? 'text-red-600 dark:text-red-400'
                : 'text-gray-500 dark:text-zinc-400'
            }`}
          >
            <ShoppingBag
              size={20}
              strokeWidth={
                isActive(
                  '/shop'
                )
                  ? 2.5
                  : 2
              }
            />

            Shop
          </Link>

          {/* WISHLIST */}

          <Link
            to="/wishlist"
            className={`flex flex-col items-center justify-center gap-1 text-[10px] font-semibold ${
              isActive(
                '/wishlist'
              )
                ? 'text-red-600 dark:text-red-400'
                : 'text-gray-500 dark:text-zinc-400'
            }`}
          >
            <div className="relative">
              <Heart
                size={20}
              />

              {wishlistCount >
                0 && (
                <span className="absolute -right-2.5 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[8px] font-bold text-white">
                  {wishlistCount >
                  99
                    ? '99+'
                    : wishlistCount}
                </span>
              )}
            </div>

            Wishlist
          </Link>

          {/* CART */}

          <Link
            to="/cart"
            className={`flex flex-col items-center justify-center gap-1 text-[10px] font-semibold ${
              isActive('/cart')
                ? 'text-red-600 dark:text-red-400'
                : 'text-gray-500 dark:text-zinc-400'
            }`}
          >
            <div className="relative">
              <ShoppingCart
                size={20}
              />

              {cartCount >
                0 && (
                <span className="absolute -right-2.5 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[8px] font-bold text-white">
                  {cartCount >
                  99
                    ? '99+'
                    : cartCount}
                </span>
              )}
            </div>

            Cart
          </Link>

          {/* ACCOUNT */}

          <Link
            to={
              user
                ? '/dashboard/profile'
                : '/login'
            }
            className={`flex flex-col items-center justify-center gap-1 text-[10px] font-semibold ${
              isActive(
                '/dashboard'
              ) ||
              isActive('/login')
                ? 'text-red-600 dark:text-red-400'
                : 'text-gray-500 dark:text-zinc-400'
            }`}
          >
            {user?.avatar ? (
              <img
                src={
                  user.avatar
                }
                alt="Account"
                className="h-5 w-5 rounded-full object-cover"
              />
            ) : (
              <User
                size={20}
              />
            )}

            Account
          </Link>
        </div>
      </nav>
    </>
  );
};

export default Navbar;