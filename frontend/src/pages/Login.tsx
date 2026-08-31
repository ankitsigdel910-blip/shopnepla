import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import {
  Link,
  useLocation,
  useNavigate,
} from 'react-router-dom';

import toast from 'react-hot-toast';

import {
  Eye,
  EyeOff,
  LockKeyhole,
  LogIn,
  Mail,
  ShieldCheck,
  ShoppingBag,
  Truck,
} from 'lucide-react';

import { useAppDispatch } from '../hooks/redux';
import { login } from '../features/authSlice';
import { fetchCart } from '../features/cartSlice';
import { fetchWishlist } from '../features/wishlistSlice';

import loginBackground from '../assets/login-bg.jpg';

/* =====================================================
   VALIDATION
===================================================== */

const schema = z.object({
  identifier: z
    .string()
    .min(
      1,
      'Email or phone is required'
    ),

  password: z
    .string()
    .min(
      1,
      'Password is required'
    ),
});

type FormData =
  z.infer<typeof schema>;

/* =====================================================
   LOGIN
===================================================== */

const Login = () => {
  const [loading, setLoading] =
    useState(false);

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const dispatch =
    useAppDispatch();

  const navigate =
    useNavigate();

  const location =
    useLocation();

  const {
    register: rhfRegister,
    handleSubmit,

    formState: {
      errors,
    },
  } = useForm<FormData>({
    resolver:
      zodResolver(schema),
  });

  /* ===================================================
     LOGIN SUBMIT
  =================================================== */

  const onSubmit = async (
    data: FormData
  ) => {
    setLoading(true);

    const identifier =
      data.identifier.trim();

    const isEmail =
      identifier.includes('@');

    const payload = isEmail
      ? {
          email: identifier,
          password:
            data.password,
        }
      : {
          phone: identifier,
          password:
            data.password,
        };

    try {
      const result =
        await dispatch(
          login(payload)
        );

      if (
        login.fulfilled.match(
          result
        )
      ) {
        toast.success(
          'Logged in successfully'
        );

        dispatch(fetchCart());
        dispatch(
          fetchWishlist()
        );

        const redirectTo =
          (
            location.state as {
              from?: string;
            } | null
          )?.from || '/';

        navigate(
          redirectTo,
          {
            replace: true,
          }
        );
      } else {
        toast.error(
          (result.payload as string) ||
            'Login failed'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] -mx-4 sm:-mx-6 lg:-mx-8 -my-6 sm:-my-8 overflow-hidden">
      {/* ===============================================
          BACKGROUND
      ================================================ */}

      <div className="absolute inset-0">
        <img
          src={loginBackground}
          alt=""
          className="w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/65 to-red-950/55" />
      </div>

      {/* ===============================================
          PAGE CONTENT
      ================================================ */}

      <div className="relative min-h-[calc(100vh-4rem)] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16 grid lg:grid-cols-2 items-center gap-10">
        {/* =============================================
            LEFT CONTENT
        ============================================== */}

        <div className="hidden lg:block text-white max-w-xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-600/90 rounded-full text-sm font-semibold mb-6 shadow-lg">
            <ShoppingBag
              size={16}
            />

            Welcome to ShopNepal
          </div>

          {/* Title */}
          <h1 className="text-4xl xl:text-5xl font-black leading-tight">
            Your favorite
            products,
            <span className="block text-red-400 mt-1">
              one login away.
            </span>
          </h1>

          {/* Description */}
          <p className="mt-5 text-gray-200 text-base xl:text-lg leading-8 max-w-lg">
            Sign in to manage your
            orders, wishlist, cart and
            delivery addresses.
          </p>

          {/* Features */}
          <div className="grid grid-cols-2 gap-4 mt-8">
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/10 rounded-xl p-4">
              <Truck
                size={22}
                className="text-red-400 shrink-0"
              />

              <span className="text-sm font-medium">
                Delivery across
                Nepal
              </span>
            </div>

            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/10 rounded-xl p-4">
              <ShieldCheck
                size={22}
                className="text-red-400 shrink-0"
              />

              <span className="text-sm font-medium">
                Secure shopping
              </span>
            </div>
          </div>
        </div>

        {/* =============================================
            LOGIN CARD
        ============================================== */}

        <div className="w-full max-w-md mx-auto lg:ml-auto">
          <div className="bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl border border-white/40 dark:border-zinc-800 shadow-2xl rounded-2xl p-6 sm:p-8">
            {/* Login icon */}
            <div className="w-12 h-12 bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 rounded-xl flex items-center justify-center mb-5">
              <LogIn
                size={23}
              />
            </div>

            {/* Heading */}
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Welcome back
            </h2>

            <p className="text-gray-500 dark:text-zinc-400 text-sm mt-2 mb-7">
              Log in with your
              email or phone number.
            </p>

            {/* =========================================
                LOGIN FORM
            ========================================== */}

            <form
              onSubmit={handleSubmit(
                onSubmit
              )}
              className="space-y-5"
            >
              {/* =======================================
                  EMAIL / PHONE
              ======================================== */}

              <div>
                <label
                  htmlFor="login-identifier"
                  className="block text-sm font-semibold text-gray-700 dark:text-zinc-200 mb-1.5"
                >
                  Email or Phone
                </label>

                <div className="relative">
                  {/* Icon area */}
                  <div className="absolute inset-y-0 left-0 w-11 flex items-center justify-center pointer-events-none z-10">
                    <Mail
                      size={18}
                      strokeWidth={
                        1.8
                      }
                      className="text-gray-400 dark:text-zinc-500"
                    />
                  </div>

                  <input
                    id="login-identifier"
                    type="text"
                    className="input-field !pl-11 !pr-3"
                    {...rhfRegister(
                      'identifier'
                    )}
                    placeholder="you@example.com or 98XXXXXXXX"
                    autoComplete="username"
                    spellCheck={false}
                  />
                </div>

                {errors.identifier && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1.5">
                    {
                      errors
                        .identifier
                        .message
                    }
                  </p>
                )}
              </div>

              {/* =======================================
                  PASSWORD
              ======================================== */}

              <div>
                <div className="flex items-center justify-between gap-3 mb-1.5">
                  <label
                    htmlFor="login-password"
                    className="text-sm font-semibold text-gray-700 dark:text-zinc-200"
                  >
                    Password
                  </label>

                  <Link
                    to="/forgot-password"
                    className="text-xs sm:text-sm font-semibold text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>

                <div className="relative">
                  {/* Left password icon */}
                  <div className="absolute inset-y-0 left-0 w-11 flex items-center justify-center pointer-events-none z-10">
                    <LockKeyhole
                      size={18}
                      strokeWidth={
                        1.8
                      }
                      className="text-gray-400 dark:text-zinc-500"
                    />
                  </div>

                  <input
                    id="login-password"
                    type={
                      showPassword
                        ? 'text'
                        : 'password'
                    }
                    className="input-field !pl-11 !pr-12"
                    {...rhfRegister(
                      'password'
                    )}
                    autoComplete="current-password"
                  />

                  {/* Show / Hide */}
                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (current) =>
                          !current
                      )
                    }
                    className="absolute inset-y-0 right-0 w-11 flex items-center justify-center text-gray-400 hover:text-red-600 dark:text-zinc-500 dark:hover:text-red-400 transition-colors"
                    aria-label={
                      showPassword
                        ? 'Hide password'
                        : 'Show password'
                    }
                    title={
                      showPassword
                        ? 'Hide password'
                        : 'Show password'
                    }
                  >
                    {showPassword ? (
                      <EyeOff
                        size={18}
                      />
                    ) : (
                      <Eye
                        size={18}
                      />
                    )}
                  </button>
                </div>

                {errors.password && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1.5">
                    {
                      errors.password
                        .message
                    }
                  </p>
                )}
              </div>

              {/* =======================================
                  LOGIN BUTTON
              ======================================== */}

              <button
                type="submit"
                className="btn-primary w-full h-11 flex items-center justify-center gap-2"
                disabled={loading}
              >
                <LogIn
                  size={18}
                />

                {loading
                  ? 'Logging in...'
                  : 'Log In'}
              </button>
            </form>

            {/* =========================================
                DIVIDER
            ========================================== */}

            <div className="relative my-6">
              <div className="border-t border-gray-200 dark:border-zinc-800" />

              <span className="absolute left-1/2 -translate-x-1/2 -top-2.5 bg-white dark:bg-zinc-950 px-3 text-[11px] sm:text-xs text-gray-400 dark:text-zinc-500 whitespace-nowrap">
                NEW TO SHOPNEPAL?
              </span>
            </div>

            {/* =========================================
                CREATE ACCOUNT
            ========================================== */}

            <p className="text-sm text-gray-500 dark:text-zinc-400 text-center">
              Don't have an
              account?{' '}

              <Link
                to="/register"
                className="text-red-600 dark:text-red-400 font-semibold hover:text-red-700 dark:hover:text-red-300 hover:underline"
              >
                Create account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;