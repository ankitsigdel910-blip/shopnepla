import { useState } from 'react';
import {
  Link,
  useParams,
  useNavigate,
} from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Eye,
  EyeOff,
  KeyRound,
  LockKeyhole,
} from 'lucide-react';

import { authApi } from '../services/authService';
import { getErrorMessage } from '../services/api';

import resetPasswordBackground from '../assets/reset-password-bg.jpg';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    password: '',
    confirmPassword: '',
  });

  const [loading, setLoading] =
    useState(false);

  const [showPassword, setShowPassword] =
    useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const submit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!token) {
      toast.error(
        'Invalid password reset link'
      );
      return;
    }

    if (form.password.length < 8) {
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
        form
      );

      toast.success(
        'Password reset. Please log in.'
      );

      navigate('/login');
    } catch (err) {
      toast.error(
        getErrorMessage(err)
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] -mx-4 sm:-mx-6 lg:-mx-8 -my-6 sm:-my-8 overflow-hidden flex items-center justify-center">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src={resetPasswordBackground}
          alt=""
          className="w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-black/55 dark:bg-black/70" />
      </div>

      {/* Reset password card */}
      <div className="relative z-10 w-full max-w-md mx-4 my-10">
        <div className="bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/30 dark:border-zinc-800 p-6 sm:p-8">
          {/* Icon */}
          <div className="w-12 h-12 bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 rounded-xl flex items-center justify-center mb-5">
            <KeyRound size={23} />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Reset your password
          </h1>

          <p className="text-sm text-gray-500 dark:text-zinc-400 mt-2 mb-6">
            Enter your new password below.
          </p>

          <form
            onSubmit={submit}
            className="space-y-4"
          >
            {/* New password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-200 mb-1.5">
                New Password
              </label>

              <div className="relative">
                <LockKeyhole
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  className="input-field pl-10 pr-11"
                  type={
                    showPassword
                      ? 'text'
                      : 'password'
                  }
                  placeholder="New password"
                  value={form.password}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      password:
                        e.target.value,
                    }))
                  }
                  minLength={8}
                  autoComplete="new-password"
                  required
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      (value) => !value
                    )
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                  aria-label={
                    showPassword
                      ? 'Hide password'
                      : 'Show password'
                  }
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>

              <p className="text-xs text-gray-400 mt-1">
                Minimum 8 characters
              </p>
            </div>

            {/* Confirm password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-200 mb-1.5">
                Confirm New Password
              </label>

              <div className="relative">
                <LockKeyhole
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  className="input-field pl-10 pr-11"
                  type={
                    showConfirmPassword
                      ? 'text'
                      : 'password'
                  }
                  placeholder="Confirm new password"
                  value={
                    form.confirmPassword
                  }
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      confirmPassword:
                        e.target.value,
                    }))
                  }
                  minLength={8}
                  autoComplete="new-password"
                  required
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(
                      (value) => !value
                    )
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                  aria-label={
                    showConfirmPassword
                      ? 'Hide password'
                      : 'Show password'
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>

              {form.confirmPassword &&
                form.password !==
                  form.confirmPassword && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                    Passwords do not match
                  </p>
                )}
            </div>

            <button
              type="submit"
              className="btn-primary w-full"
              disabled={loading}
            >
              {loading
                ? 'Resetting...'
                : 'Reset Password'}
            </button>
          </form>

          <p className="text-center mt-6">
            <Link
              to="/login"
              className="text-sm font-medium text-red-600 dark:text-red-400 hover:underline"
            >
              Back to Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;