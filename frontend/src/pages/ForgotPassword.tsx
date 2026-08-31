import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../services/authService';
import { getErrorMessage } from '../services/api';
import toast from 'react-hot-toast';
import { KeyRound, ArrowRight } from 'lucide-react';

import resetPasswordBackground from '../assets/reset-password-bg.jpg';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [resetToken, setResetToken] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authApi.forgotPassword(email);
      
      // Capture the reset token returned by backend for local testing
      if (res.data?.data?.resetToken) {
        setResetToken(res.data.data.resetToken);
      }

      setSent(true);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="relative min-h-[calc(100vh-4rem)] -mx-4 sm:-mx-6 lg:-mx-8 -my-6 sm:-my-8 flex items-center justify-center bg-cover bg-center"
      style={{
        backgroundImage: `url(${resetPasswordBackground})`,
      }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/55 dark:bg-black/70" />

      {/* Forgot password card */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/30 dark:border-zinc-800 p-6 sm:p-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            Forgot your password?
          </h1>

          <p className="text-gray-500 dark:text-zinc-400 text-sm mb-6">
            We'll provide a link to reset your password.
          </p>

          {sent ? (
            <div className="space-y-4">
              <p className="text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-900 rounded-lg p-3 text-sm">
                If an account with that email exists, a reset link has been generated.
              </p>

              {resetToken ? (
                <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-xl text-center space-y-3">
                  <p className="text-xs text-gray-600 dark:text-zinc-300 font-medium">
                    (Local Development Mode) Click below to test your Reset Password page:
                  </p>
                  <Link
                    to={`/reset-password/${resetToken}`}
                    className="btn-primary inline-flex items-center justify-center gap-2 w-full"
                  >
                    <KeyRound size={17} />
                    Open Reset Password Page
                    <ArrowRight size={16} />
                  </Link>
                </div>
              ) : (
                <p className="text-xs text-gray-400">
                  Check your email client inbox for the live reset link.
                </p>
              )}

              <button
                type="button"
                onClick={() => {
                  setSent(false);
                  setResetToken(null);
                }}
                className="block mx-auto text-sm text-red-600 dark:text-red-400 hover:underline pt-2"
              >
                Try another email
              </button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 dark:text-zinc-200 mb-1"
                >
                  Email Address
                </label>

                <input
                  id="email"
                  className="input-field"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>

              <button
                type="submit"
                className="btn-primary w-full"
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          )}

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

export default ForgotPassword;