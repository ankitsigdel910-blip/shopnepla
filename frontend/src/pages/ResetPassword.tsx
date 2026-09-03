import {
  FormEvent,
  useMemo,
  useState,
} from 'react';

import {
  Link,
  useNavigate,
  useParams,
} from 'react-router-dom';

import toast from 'react-hot-toast';

import {
  Check,
  Eye,
  EyeOff,
  KeyRound,
  LockKeyhole,
  X,
} from 'lucide-react';

import {
  authApi,
} from '../services/authService';

import {
  getErrorMessage,
} from '../services/api';

import resetPasswordBackground from '../assets/reset-password-bg.jpg';

/* ============================================================
   RESET PASSWORD
============================================================ */

const ResetPassword = () => {
  const {
    token,
  } = useParams<{
    token: string;
  }>();

  const navigate =
    useNavigate();

  /* ==========================================================
     FORM
  ========================================================== */

  const [
    form,
    setForm,
  ] = useState({
    password: '',
    confirmPassword: '',
  });

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

  /* ==========================================================
     VALIDATION
  ========================================================== */

  const passwordValid =
    form.password.length >= 8;

  const passwordsMatch =
    form.confirmPassword.length >
      0 &&
    form.password ===
      form.confirmPassword;

  const passwordMismatch =
    form.confirmPassword.length >
      0 &&
    form.password !==
      form.confirmPassword;

  const canSubmit =
    useMemo(
      () =>
        Boolean(token) &&
        form.password.length >=
          8 &&
        form.password ===
          form.confirmPassword &&
        !loading,
      [
        token,
        form.password,
        form.confirmPassword,
        loading,
      ]
    );

  /* ==========================================================
     SUBMIT
  ========================================================== */

  const submit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!token) {
      toast.error(
        'Invalid password reset link'
      );

      return;
    }

    if (
      form.password.length <
      8
    ) {
      toast.error(
        'Password must be at least 8 characters'
      );

      return;
    }

    if (
      form.password !==
      form.confirmPassword
    ) {
      toast.error(
        'Passwords do not match'
      );

      return;
    }

    setLoading(true);

    try {
      await authApi.resetPassword(
        token,
        {
          password:
            form.password,

          confirmPassword:
            form.confirmPassword,
        }
      );

      toast.success(
        'Password reset successfully. Please log in.'
      );

      navigate(
        '/login',
        {
          replace: true,
        }
      );
    } catch (error) {
      toast.error(
        getErrorMessage(
          error
        )
      );
    } finally {
      setLoading(false);
    }
  };

  /* ==========================================================
     UI
  ========================================================== */

  return (
    <div className="relative -mx-4 -my-6 flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden sm:-mx-6 sm:-my-8 lg:-mx-8">
      {/* =====================================================
          BACKGROUND
      ====================================================== */}

      <div className="absolute inset-0">
        <img
          src={
            resetPasswordBackground
          }
          alt=""
          aria-hidden="true"
          className="h-full w-full object-cover"
        />

        <div className="absolute inset-0 bg-black/60 dark:bg-black/75" />
      </div>

      {/* =====================================================
          CARD
      ====================================================== */}

      <div className="relative z-10 my-8 w-full max-w-md px-4 sm:my-10">
        <div className="overflow-hidden rounded-2xl border border-white/20 bg-white/95 shadow-2xl backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/95">
          {/* =================================================
              BRAND
          ================================================== */}

          <div className="border-b border-gray-100 px-6 pb-5 pt-6 text-center dark:border-zinc-800 sm:px-8 sm:pt-7">
            <Link
              to="/"
              className="inline-flex items-center gap-2"
              aria-label="ShopNepal home"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600 text-white shadow-sm">
                <KeyRound
                  size={20}
                />
              </div>

              <span className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">
                Shop
                <span className="text-red-600 dark:text-red-400">
                  Nepal
                </span>
              </span>
            </Link>
          </div>

          {/* =================================================
              CONTENT
          ================================================== */}

          <div className="p-6 sm:p-8">
            <div className="mb-6">
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                Reset your password
              </h1>

              <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-zinc-400">
                Create a new password
                for your ShopNepal
                account.
              </p>
            </div>

            {/* INVALID TOKEN */}

            {!token && (
              <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
                This password reset
                link is invalid.
                Please request a new
                one.
              </div>
            )}

            {/* =================================================
                FORM
            ================================================== */}

            <form
              onSubmit={submit}
              className="space-y-5"
            >
              {/* ===============================================
                  NEW PASSWORD
              ================================================ */}

              <div>
                <label
                  htmlFor="new-password"
                  className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-zinc-200"
                >
                  New Password
                </label>

                <div className="relative">
                  <LockKeyhole
                    size={18}
                    aria-hidden="true"
                    className="pointer-events-none absolute left-3.5 top-1/2 z-10 -translate-y-1/2 text-gray-400 dark:text-zinc-500"
                  />

                  <input
                    id="new-password"
                    type={
                      showPassword
                        ? 'text'
                        : 'password'
                    }
                    value={
                      form.password
                    }
                    onChange={(
                      event
                    ) =>
                      setForm(
                        (
                          current
                        ) => ({
                          ...current,

                          password:
                            event
                              .target
                              .value,
                        })
                      )
                    }
                    placeholder="Enter new password"
                    minLength={8}
                    autoComplete="new-password"
                    required
                    disabled={
                      loading
                    }
                    className="
                      h-12
                      w-full
                      rounded-xl
                      border
                      border-gray-300
                      bg-white
                      py-2
                      pl-11
                      pr-12
                      text-sm
                      text-gray-900
                      outline-none
                      transition
                      placeholder:text-gray-400
                      focus:border-red-500
                      focus:ring-2
                      focus:ring-red-500/20
                      disabled:cursor-not-allowed
                      disabled:opacity-60
                      dark:border-zinc-700
                      dark:bg-zinc-900
                      dark:text-white
                      dark:placeholder:text-zinc-500
                      dark:focus:border-red-500
                    "
                  />

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
                    disabled={
                      loading
                    }
                    className="absolute right-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500/30 dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-red-400"
                    aria-label={
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

                {/* PASSWORD REQUIREMENT */}

                <div
                  className={`mt-2 flex items-center gap-1.5 text-xs ${
                    form.password
                      .length === 0
                      ? 'text-gray-400 dark:text-zinc-500'
                      : passwordValid
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {form.password
                    .length ===
                  0 ? (
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  ) : passwordValid ? (
                    <Check
                      size={14}
                    />
                  ) : (
                    <X
                      size={14}
                    />
                  )}

                  <span>
                    At least 8
                    characters
                  </span>
                </div>
              </div>

              {/* ===============================================
                  CONFIRM PASSWORD
              ================================================ */}

              <div>
                <label
                  htmlFor="confirm-password"
                  className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-zinc-200"
                >
                  Confirm New Password
                </label>

                <div className="relative">
                  <LockKeyhole
                    size={18}
                    aria-hidden="true"
                    className="pointer-events-none absolute left-3.5 top-1/2 z-10 -translate-y-1/2 text-gray-400 dark:text-zinc-500"
                  />

                  <input
                    id="confirm-password"
                    type={
                      showConfirmPassword
                        ? 'text'
                        : 'password'
                    }
                    value={
                      form.confirmPassword
                    }
                    onChange={(
                      event
                    ) =>
                      setForm(
                        (
                          current
                        ) => ({
                          ...current,

                          confirmPassword:
                            event
                              .target
                              .value,
                        })
                      )
                    }
                    placeholder="Re-enter new password"
                    minLength={8}
                    autoComplete="new-password"
                    required
                    disabled={
                      loading
                    }
                    className={`
                      h-12
                      w-full
                      rounded-xl
                      border
                      bg-white
                      py-2
                      pl-11
                      pr-12
                      text-sm
                      text-gray-900
                      outline-none
                      transition
                      placeholder:text-gray-400
                      focus:ring-2
                      disabled:cursor-not-allowed
                      disabled:opacity-60
                      dark:bg-zinc-900
                      dark:text-white
                      dark:placeholder:text-zinc-500
                      ${
                        passwordMismatch
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20 dark:border-red-500'
                          : passwordsMatch
                            ? 'border-green-500 focus:border-green-500 focus:ring-green-500/20 dark:border-green-500'
                            : 'border-gray-300 focus:border-red-500 focus:ring-red-500/20 dark:border-zinc-700 dark:focus:border-red-500'
                      }
                    `}
                  />

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
                    disabled={
                      loading
                    }
                    className="absolute right-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500/30 dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-red-400"
                    aria-label={
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

                {/* MATCH STATUS */}

                {passwordMismatch && (
                  <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-red-600 dark:text-red-400">
                    <X size={14} />

                    <span>
                      Passwords do
                      not match
                    </span>
                  </div>
                )}

                {passwordsMatch && (
                  <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-green-600 dark:text-green-400">
                    <Check
                      size={14}
                    />

                    <span>
                      Passwords
                      match
                    </span>
                  </div>
                )}
              </div>

              {/* ===============================================
                  SUBMIT
              ================================================ */}

              <button
                type="submit"
                disabled={
                  !canSubmit
                }
                className="
                  flex
                  h-12
                  w-full
                  items-center
                  justify-center
                  rounded-xl
                  bg-red-600
                  px-4
                  text-sm
                  font-bold
                  text-white
                  shadow-sm
                  transition
                  hover:bg-red-700
                  focus:outline-none
                  focus:ring-2
                  focus:ring-red-500
                  focus:ring-offset-2
                  disabled:cursor-not-allowed
                  disabled:bg-red-400
                  disabled:opacity-60
                  dark:focus:ring-offset-zinc-950
                "
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />

                    Resetting...
                  </span>
                ) : (
                  'Reset Password'
                )}
              </button>
            </form>

            {/* =================================================
                LOGIN
            ================================================== */}

            <div className="mt-6 border-t border-gray-100 pt-5 text-center dark:border-zinc-800">
              <Link
                to="/login"
                className="inline-flex text-sm font-semibold text-red-600 transition hover:text-red-700 hover:underline dark:text-red-400 dark:hover:text-red-300"
              >
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;