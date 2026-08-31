import {
  useEffect,
  useState,
} from 'react';

import {
  Link,
  useNavigate,
} from 'react-router-dom';

import {
  Search,
  Heart,
  ShoppingCart,
  User,
  Menu,
  X,
  Moon,
  Sun,
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

// ============================================================
// NAVBAR
// ============================================================

const Navbar = () => {
  const [
    query,
    setQuery,
  ] =
    useState('');

  const [
    mobileOpen,
    setMobileOpen,
  ] =
    useState(false);

  // ==========================================================
  // DARK MODE
  // ==========================================================

  const [
    darkMode,
    setDarkMode,
  ] =
    useState(() => {
      return (
        localStorage.getItem(
          'theme'
        ) === 'dark'
      );
    });

  const navigate =
    useNavigate();

  const dispatch =
    useAppDispatch();

  // ==========================================================
  // USER
  // ==========================================================

  const { user } =
    useAppSelector(
      (state) =>
        state.auth
    );

  // ==========================================================
  // CART COUNT
  // ==========================================================

  const cartCount =
    useAppSelector(
      (state) =>
        state.cart.cart.items.reduce(
          (
            total,
            item
          ) =>
            total +
            item.quantity,

          0
        )
    );

  // ==========================================================
  // WISHLIST COUNT
  // ==========================================================

  const wishlistCount =
    useAppSelector(
      (state) =>
        state.wishlist
          .products.length
    );

  // ==========================================================
  // APPLY THEME
  // ==========================================================

  useEffect(() => {
    const root =
      document.documentElement;

    if (darkMode) {
      root.classList.add(
        'dark'
      );

      localStorage.setItem(
        'theme',
        'dark'
      );
    } else {
      root.classList.remove(
        'dark'
      );

      localStorage.setItem(
        'theme',
        'light'
      );
    }
  }, [darkMode]);

  // ==========================================================
  // SEARCH
  // ==========================================================

  const handleSearch = (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    const trimmedQuery =
      query.trim();

    navigate(
      trimmedQuery
        ? `/shop?search=${encodeURIComponent(
            trimmedQuery
          )}`
        : '/shop'
    );

    setMobileOpen(
      false
    );
  };

  // ==========================================================
  // LOGOUT
  // ==========================================================

  const handleLogout =
    async () => {
      await dispatch(
        logout()
      );

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
    };

  // ==========================================================
  // NAVIGATION LINKS
  // ==========================================================

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

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <header className="sticky top-0 z-40 bg-red-600 dark:bg-red-950 text-white shadow-md">

      <div className="max-w-7xl mx-auto px-4">

        <div className="h-16 flex items-center justify-between gap-4">

          {/* =================================================
              LOGO
          ================================================== */}

          <Link
            to="/"
            className="text-xl sm:text-2xl font-black tracking-tight shrink-0"
          >
            Shop

            <span className="text-red-100">
              Nepal
            </span>
          </Link>

          {/* =================================================
              DESKTOP NAVIGATION
          ================================================== */}

          <nav className="hidden lg:flex items-center gap-6 text-sm font-semibold">

            {navLinks.map(
              (
                link
              ) => (
                <Link
                  key={
                    link.label
                  }
                  to={
                    link.to
                  }
                  className="text-white/90 hover:text-white transition-colors"
                >
                  {
                    link.label
                  }
                </Link>
              )
            )}

          </nav>

          {/* =================================================
              DESKTOP SEARCH
          ================================================== */}

          <form
            onSubmit={
              handleSearch
            }
            className="hidden md:flex flex-1 max-w-xl relative"
          >

            <input
              value={
                query
              }
              onChange={(
                event
              ) =>
                setQuery(
                  event.target
                    .value
                )
              }
              placeholder="Search products..."
              className="
                w-full
                h-11
                rounded-xl
                border-0
                bg-white
                text-gray-900
                dark:bg-zinc-900
                dark:text-white
                dark:placeholder:text-zinc-400
                pl-4
                pr-14
                outline-none
                ring-2
                ring-transparent
                focus:ring-red-200
                transition
              "
            />

            <button
              type="submit"
              aria-label="Search"
              className="
                absolute
                right-1.5
                top-1.5
                w-11
                h-8
                rounded-lg
                bg-red-100
                hover:bg-red-200
                dark:bg-red-900
                dark:hover:bg-red-800
                text-red-600
                dark:text-red-200
                flex
                items-center
                justify-center
                transition-colors
              "
            >
              <Search
                size={
                  19
                }
              />
            </button>

          </form>

          {/* =================================================
              ACTIONS
          ================================================== */}

          <div className="flex items-center gap-1 sm:gap-2 shrink-0">

            {/* ===============================================
                THEME
            ================================================ */}

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
              className="p-2 rounded-lg hover:bg-white/10 transition"
              aria-label={
                darkMode
                  ? 'Switch to light mode'
                  : 'Switch to dark mode'
              }
              title={
                darkMode
                  ? 'Light mode'
                  : 'Dark mode'
              }
            >
              {darkMode ? (
                <Sun
                  size={
                    20
                  }
                />
              ) : (
                <Moon
                  size={
                    20
                  }
                />
              )}
            </button>

            {/* ===============================================
                WISHLIST
            ================================================ */}

            <Link
              to="/wishlist"
              className="relative p-2 rounded-lg hover:bg-white/10 transition"
              aria-label="Wishlist"
            >
              <Heart
                size={
                  20
                }
              />

              {wishlistCount >
                0 && (
                <span className="absolute -top-1 -right-1 bg-white text-red-600 font-bold text-[10px] rounded-full min-w-4 h-4 px-1 flex items-center justify-center">
                  {
                    wishlistCount
                  }
                </span>
              )}
            </Link>

            {/* ===============================================
                CART
            ================================================ */}

            <Link
              to="/cart"
              className="relative p-2 rounded-lg hover:bg-white/10 transition"
              aria-label="Cart"
            >
              <ShoppingCart
                size={
                  21
                }
              />

              {cartCount >
                0 && (
                <span className="absolute -top-1 -right-1 bg-white text-red-600 font-bold text-[10px] rounded-full min-w-4 h-4 px-1 flex items-center justify-center">
                  {
                    cartCount
                  }
                </span>
              )}
            </Link>

            {/* ===============================================
                LOGGED IN USER - DESKTOP
            ================================================ */}

            {user ? (
              <div className="hidden md:flex items-center gap-2">

                {/* ===========================================
                    PROFILE AVATAR
                ============================================ */}

                <Link
                  to="/dashboard/profile"
                  className="
                    flex
                    items-center
                    justify-center
                    rounded-full
                    hover:ring-2
                    hover:ring-white/60
                    transition
                  "
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
                      className="
                        w-9
                        h-9
                        rounded-full
                        object-cover
                        border-2
                        border-white/80
                        shadow-sm
                        bg-white
                      "
                    />
                  ) : (
                    <div
                      className="
                        w-9
                        h-9
                        rounded-full
                        flex
                        items-center
                        justify-center
                        hover:bg-white/10
                      "
                    >
                      <User
                        size={
                          20
                        }
                      />
                    </div>
                  )}

                </Link>

                {/* ===========================================
                    LOGOUT
                ============================================ */}

                <button
                  type="button"
                  onClick={
                    handleLogout
                  }
                  className="text-sm font-medium px-2 py-2 rounded-lg hover:bg-white/10 transition"
                >
                  Logout
                </button>

              </div>
            ) : (
              <Link
                to="/login"
                className="
                  hidden
                  md:inline-flex
                  bg-white
                  text-red-600
                  hover:bg-red-50
                  font-semibold
                  px-4
                  py-2
                  rounded-lg
                  transition
                "
              >
                Login
              </Link>
            )}

            {/* ===============================================
                MOBILE MENU BUTTON
            ================================================ */}

            <button
              type="button"
              className="lg:hidden p-2 rounded-lg hover:bg-white/10"
              onClick={() =>
                setMobileOpen(
                  (
                    current
                  ) =>
                    !current
                )
              }
              aria-label="Menu"
            >
              {mobileOpen ? (
                <X
                  size={
                    22
                  }
                />
              ) : (
                <Menu
                  size={
                    22
                  }
                />
              )}
            </button>

          </div>

        </div>

      </div>

      {/* =====================================================
          MOBILE PANEL
      ====================================================== */}

      {mobileOpen && (
        <div className="lg:hidden border-t border-red-500/50 dark:border-red-900 bg-red-600 dark:bg-red-950">

          <div className="max-w-7xl mx-auto px-4 py-4 space-y-4">

            {/* ===============================================
                MOBILE SEARCH
            ================================================ */}

            <form
              onSubmit={
                handleSearch
              }
              className="relative md:hidden"
            >

              <input
                value={
                  query
                }
                onChange={(
                  event
                ) =>
                  setQuery(
                    event.target
                      .value
                  )
                }
                placeholder="Search products..."
                className="
                  w-full
                  h-11
                  rounded-xl
                  border-0
                  bg-white
                  text-gray-900
                  dark:bg-zinc-900
                  dark:text-white
                  dark:placeholder:text-zinc-400
                  pl-4
                  pr-14
                  outline-none
                "
              />

              <button
                type="submit"
                aria-label="Search"
                className="
                  absolute
                  right-1.5
                  top-1.5
                  w-11
                  h-8
                  rounded-lg
                  bg-red-100
                  dark:bg-red-900
                  text-red-600
                  dark:text-red-200
                  flex
                  items-center
                  justify-center
                "
              >
                <Search
                  size={
                    19
                  }
                />
              </button>

            </form>

            {/* ===============================================
                MOBILE LINKS
            ================================================ */}

            <nav className="flex flex-col text-sm font-semibold">

              {navLinks.map(
                (
                  link
                ) => (
                  <Link
                    key={
                      link.label
                    }
                    to={
                      link.to
                    }
                    onClick={() =>
                      setMobileOpen(
                        false
                      )
                    }
                    className="py-2.5 border-b border-white/10"
                  >
                    {
                      link.label
                    }
                  </Link>
                )
              )}

              {/* =============================================
                  MOBILE USER
              ============================================== */}

              {user ? (
                <>

                  {/* PROFILE */}

                  <Link
                    to="/dashboard/profile"
                    onClick={() =>
                      setMobileOpen(
                        false
                      )
                    }
                    className="
                      py-3
                      border-b
                      border-white/10
                      flex
                      items-center
                      gap-3
                    "
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
                        className="
                          w-9
                          h-9
                          rounded-full
                          object-cover
                          border-2
                          border-white/80
                          bg-white
                        "
                      />
                    ) : (
                      <div
                        className="
                          w-9
                          h-9
                          rounded-full
                          bg-white/10
                          flex
                          items-center
                          justify-center
                        "
                      >
                        <User
                          size={
                            19
                          }
                        />
                      </div>
                    )}

                    <div className="flex flex-col">

                      <span>
                        My Profile
                      </span>

                      {user.name && (
                        <span className="text-xs font-normal text-white/70">
                          {
                            user.name
                          }
                        </span>
                      )}

                    </div>

                  </Link>

                  {/* LOGOUT */}

                  <button
                    type="button"
                    onClick={
                      handleLogout
                    }
                    className="text-left py-2.5 text-red-100"
                  >
                    Logout
                  </button>

                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() =>
                    setMobileOpen(
                      false
                    )
                  }
                  className="py-2.5"
                >
                  Login / Register
                </Link>
              )}

            </nav>

          </div>

        </div>
      )}

    </header>
  );
};

export default Navbar;