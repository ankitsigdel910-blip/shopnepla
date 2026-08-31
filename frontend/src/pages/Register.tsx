import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import {
  Link,
  useNavigate,
} from 'react-router-dom';

import toast from 'react-hot-toast';

import {
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Phone,
  ShieldCheck,
  ShoppingBag,
  User,
  UserPlus,
} from 'lucide-react';

import { useAppDispatch } from '../hooks/redux';
import { register as registerThunk } from '../features/authSlice';

import registerBackground from '../assets/register-bg.jpg';

/* =====================================================
   VALIDATION
===================================================== */

const schema = z
  .object({
    name: z
      .string()
      .trim()
      .min(
        2,
        'Full name is required'
      ),

    email: z
      .string()
      .trim()
      .email(
        'Enter a valid email'
      ),

    phone: z
      .string()
      .trim()
      .min(
        7,
        'Enter a valid phone number'
      ),

    password: z
      .string()
      .min(
        8,
        'Password must be at least 8 characters'
      ),

    confirmPassword:
      z.string(),
  })
  .refine(
    (data) =>
      data.password ===
      data.confirmPassword,
    {
      message:
        'Passwords do not match',
      path: [
        'confirmPassword',
      ],
    }
  );

type FormData =
  z.infer<typeof schema>;

/* =====================================================
   REGISTER
===================================================== */

const Register = () => {
  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const dispatch =
    useAppDispatch();

  const navigate =
    useNavigate();

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
     REGISTER SUBMIT
  =================================================== */

  const onSubmit = async (
    data: FormData
  ) => {
    setLoading(true);

    try {
      const result =
        await dispatch(
          registerThunk({
            ...data,

            name:
              data.name.trim(),

            email:
              data.email
                .trim()
                .toLowerCase(),

            phone:
              data.phone.trim(),
          })
        );

      if (
        registerThunk.fulfilled.match(
          result
        )
      ) {
        toast.success(
          'Account created successfully'
        );

        navigate('/');
      } else {
        toast.error(
          (result.payload as string) ||
            'Registration failed'
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
          src={registerBackground}
          alt=""
          className="w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-red-950/80 via-black/60 to-black/75" />
      </div>

      {/* ===============================================
          PAGE CONTENT
      ================================================ */}

      <div className="relative min-h-[calc(100vh-4rem)] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14 grid lg:grid-cols-2 items-center gap-10">
        {/* =============================================
            LEFT SIDE
        ============================================== */}

        <div className="hidden lg:block text-white max-w-xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-600/90 rounded-full text-sm font-semibold mb-6 shadow-lg">
            <ShoppingBag
              size={16}
            />

            Join ShopNepal
          </div>

          {/* Heading */}
          <h1 className="text-4xl xl:text-5xl font-black leading-tight">
            Start shopping

            <span className="block text-red-400 mt-1">
              smarter today.
            </span>
          </h1>

          {/* Description */}
          <p className="mt-5 text-gray-200 text-base xl:text-lg leading-8 max-w-lg">
            Create your account
            to save favorites,
            manage deliveries and
            enjoy a smoother
            checkout experience.
          </p>

          {/* Security box */}
          <div className="mt-8 flex items-start gap-3 bg-white/10 backdrop-blur-md border border-white/10 rounded-xl p-4 max-w-md">
            <ShieldCheck
              className="text-red-400 shrink-0 mt-0.5"
              size={23}
            />

            <div>
              <div className="font-semibold">
                Secure account
              </div>

              <div className="text-sm text-gray-300 mt-1 leading-6">
                Your ShopNepal
                account helps keep
                orders and delivery
                details organized.
              </div>
            </div>
          </div>
        </div>

        {/* =============================================
            REGISTER CARD
        ============================================== */}

        <div className="w-full max-w-lg mx-auto lg:ml-auto">
          <div className="bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl border border-white/40 dark:border-zinc-800 shadow-2xl rounded-2xl p-6 sm:p-8">
            {/* Register icon */}
            <div className="w-12 h-12 bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 rounded-xl flex items-center justify-center mb-4">
              <UserPlus
                size={23}
              />
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Create your account
            </h2>

            <p className="text-gray-500 dark:text-zinc-400 text-sm mt-2 mb-6">
              Join ShopNepal in
              seconds.
            </p>

            {/* =========================================
                REGISTER FORM
            ========================================== */}

            <form
              onSubmit={handleSubmit(
                onSubmit
              )}
              className="space-y-4"
            >
              {/* =======================================
                  FULL NAME
              ======================================== */}

              <div>
                <label
                  htmlFor="register-name"
                  className="block text-sm font-semibold text-gray-700 dark:text-zinc-200 mb-1.5"
                >
                  Full Name
                </label>

                <div className="relative">
                  {/* Fixed icon area */}
                  <div className="absolute inset-y-0 left-0 w-11 flex items-center justify-center pointer-events-none z-10">
                    <User
                      size={18}
                      strokeWidth={
                        1.8
                      }
                      className="text-gray-400 dark:text-zinc-500"
                    />
                  </div>

                  <input
                    id="register-name"
                    type="text"
                    className="input-field !pl-11 !pr-3"
                    {...rhfRegister(
                      'name'
                    )}
                    placeholder="Your full name"
                    autoComplete="name"
                  />
                </div>

                {errors.name && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1.5">
                    {
                      errors.name
                        .message
                    }
                  </p>
                )}
              </div>

              {/* =======================================
                  EMAIL
              ======================================== */}

              <div>
                <label
                  htmlFor="register-email"
                  className="block text-sm font-semibold text-gray-700 dark:text-zinc-200 mb-1.5"
                >
                  Email
                </label>

                <div className="relative">
                  {/* Fixed icon area */}
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
                    id="register-email"
                    type="email"
                    className="input-field !pl-11 !pr-3"
                    {...rhfRegister(
                      'email'
                    )}
                    placeholder="you@example.com"
                    autoComplete="email"
                    spellCheck={false}
                  />
                </div>

                {errors.email && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1.5">
                    {
                      errors.email
                        .message
                    }
                  </p>
                )}
              </div>

              {/* =======================================
                  PHONE
              ======================================== */}

              <div>
                <label
                  htmlFor="register-phone"
                  className="block text-sm font-semibold text-gray-700 dark:text-zinc-200 mb-1.5"
                >
                  Phone Number
                </label>

                <div className="relative">
                  {/* Fixed icon area */}
                  <div className="absolute inset-y-0 left-0 w-11 flex items-center justify-center pointer-events-none z-10">
                    <Phone
                      size={18}
                      strokeWidth={
                        1.8
                      }
                      className="text-gray-400 dark:text-zinc-500"
                    />
                  </div>

                  <input
                    id="register-phone"
                    type="tel"
                    inputMode="tel"
                    className="input-field !pl-11 !pr-3"
                    {...rhfRegister(
                      'phone'
                    )}
                    placeholder="98XXXXXXXX"
                    autoComplete="tel"
                  />
                </div>

                {errors.phone && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1.5">
                    {
                      errors.phone
                        .message
                    }
                  </p>
                )}
              </div>

              {/* =======================================
                  PASSWORD
              ======================================== */}

              <div>
                <label
                  htmlFor="register-password"
                  className="block text-sm font-semibold text-gray-700 dark:text-zinc-200 mb-1.5"
                >
                  Password
                </label>

                <div className="relative">
                  {/* Fixed lock area */}
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
                    id="register-password"
                    type={
                      showPassword
                        ? 'text'
                        : 'password'
                    }
                    className="input-field !pl-11 !pr-12"
                    {...rhfRegister(
                      'password'
                    )}
                    placeholder="Minimum 8 characters"
                    autoComplete="new-password"
                  />

                  {/* Show / hide */}
                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (
                          current
                        ) =>
                          !current
                      )
                    }
                    className="absolute inset-y-0 right-0 w-11 flex items-center justify-center text-gray-400 dark:text-zinc-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
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
                  CONFIRM PASSWORD
              ======================================== */}

              <div>
                <label
                  htmlFor="register-confirm-password"
                  className="block text-sm font-semibold text-gray-700 dark:text-zinc-200 mb-1.5"
                >
                  Confirm Password
                </label>

                <div className="relative">
                  {/* Fixed lock area */}
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
                    id="register-confirm-password"
                    type={
                      showConfirmPassword
                        ? 'text'
                        : 'password'
                    }
                    className="input-field !pl-11 !pr-12"
                    {...rhfRegister(
                      'confirmPassword'
                    )}
                    placeholder="Re-enter your password"
                    autoComplete="new-password"
                  />

                  {/* Show / hide */}
                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(
                        (
                          current
                        ) =>
                          !current
                      )
                    }
                    className="absolute inset-y-0 right-0 w-11 flex items-center justify-center text-gray-400 dark:text-zinc-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    aria-label={
                      showConfirmPassword
                        ? 'Hide password'
                        : 'Show password'
                    }
                    title={
                      showConfirmPassword
                        ? 'Hide password'
                        : 'Show password'
                    }
                  >
                    {showConfirmPassword ? (
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

                {errors.confirmPassword && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1.5">
                    {
                      errors
                        .confirmPassword
                        .message
                    }
                  </p>
                )}
              </div>

              {/* =======================================
                  SUBMIT
              ======================================== */}

              <button
                type="submit"
                className="btn-primary w-full h-11 flex items-center justify-center gap-2"
                disabled={loading}
              >
                <UserPlus
                  size={18}
                />

                {loading
                  ? 'Creating account...'
                  : 'Create Account'}
              </button>
            </form>

            {/* =========================================
                LOGIN LINK
            ========================================== */}

            <div className="border-t border-gray-100 dark:border-zinc-800 mt-6 pt-5">
              <p className="text-sm text-gray-500 dark:text-zinc-400 text-center">
                Already have an
                account?{' '}

                <Link
                  to="/login"
                  className="text-red-600 dark:text-red-400 font-semibold hover:text-red-700 dark:hover:text-red-300 hover:underline"
                >
                  Log In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;