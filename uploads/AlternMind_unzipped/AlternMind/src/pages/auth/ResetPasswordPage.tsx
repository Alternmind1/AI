import { Helmet } from '@dr.pogodin/react-helmet';
import { useState, FormEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router';
import { motion } from 'motion/react';
import { ArrowLeft, Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = new URLSearchParams(location.search).get('token') || '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  function validatePassword(pwd: string): string | null {
    if (pwd.length < 8) return 'Password must be at least 8 characters';
    if (!/[A-Z]/.test(pwd)) return 'Must contain at least one uppercase letter';
    if (!/[0-9]/.test(pwd)) return 'Must contain at least one number';
    if (!/[!@#$%^&*(),.?":{}|<>_\-+=[\]\\/`~]/.test(pwd)) return 'Must contain at least one special character';
    return null;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    const pwdError = validatePassword(password);
    if (pwdError) { setError(pwdError); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    if (!token) { setError('Invalid or expired reset link. Please request a new one.'); return; }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword: password, token }),
        credentials: 'include',
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError((result as { message?: string }).message || 'Reset failed. The link may have expired.');
        return;
      }
      setDone(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Helmet>
        <title>Reset Password — AlternMind</title>
        <meta name="description" content="Set a new password for your AlternMind account" />
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="min-h-screen bg-background flex flex-col">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-5">
          <Link to="/" className="inline-flex items-center">
            <img
              src="/airo-assets/images/logo/horizontal/dark"
              alt="AlternMind"
              className="block h-auto max-h-8 w-auto object-contain self-center"
            />
          </Link>
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={14} />
            Back to sign in
          </Link>
        </div>

        {/* Main content */}
        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut' as const }}
            className="w-full max-w-md"
          >
            <div className="relative rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm p-8 overflow-hidden">
              <div
                className="absolute -top-20 -right-20 w-64 h-64 rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, hsl(var(--primary) / 0.08) 0%, transparent 70%)' }}
              />

              <div className="relative">
                {done ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="text-center py-4"
                  >
                    <CheckCircle2 className="w-12 h-12 text-primary mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-foreground mb-2">Password updated</h1>
                    <p className="text-sm text-muted-foreground mb-6">
                      Your password has been reset. Redirecting you to sign in…
                    </p>
                    <Link
                      to="/login"
                      className="inline-flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 font-medium transition-colors"
                    >
                      <ArrowLeft size={14} />
                      Sign in now
                    </Link>
                  </motion.div>
                ) : (
                  <>
                    <div className="mb-8">
                      <h1 className="text-2xl font-bold text-foreground mb-1.5">Set new password</h1>
                      <p className="text-sm text-muted-foreground">
                        Choose a strong password for your account.
                      </p>
                    </div>

                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-5 px-4 py-3 rounded-lg border border-destructive/30 bg-destructive/10 text-destructive text-sm"
                      >
                        {error}
                      </motion.div>
                    )}

                    {!token && (
                      <div className="mb-5 px-4 py-3 rounded-lg border border-destructive/30 bg-destructive/10 text-destructive text-sm">
                        Invalid or missing reset token.{' '}
                        <Link to="/forgot-password" className="underline">
                          Request a new link
                        </Link>
                        .
                      </div>
                    )}

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="password" className="text-sm font-medium text-foreground/80">
                          New password
                        </label>
                        <div className="relative">
                          <input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={loading || !token}
                            placeholder="Min 8 chars, A-Z, 0-9, special"
                            className="w-full px-4 py-2.5 pr-10 rounded-lg border border-border bg-background/60 text-foreground placeholder:text-muted-foreground/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60 transition-all disabled:opacity-50"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                          >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Must include uppercase, number, and special character
                        </p>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="confirm" className="text-sm font-medium text-foreground/80">
                          Confirm password
                        </label>
                        <input
                          id="confirm"
                          type={showPassword ? 'text' : 'password'}
                          value={confirm}
                          onChange={(e) => setConfirm(e.target.value)}
                          required
                          disabled={loading || !token}
                          placeholder="Re-enter your new password"
                          className="w-full px-4 py-2.5 rounded-lg border border-border bg-background/60 text-foreground placeholder:text-muted-foreground/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60 transition-all disabled:opacity-50"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={loading || !token}
                        className="mt-2 w-full flex items-center justify-center gap-2 py-2.5 rounded-full text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 disabled:opacity-60 ring-1 ring-primary/40"
                      >
                        {loading ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            <span>Updating…</span>
                          </>
                        ) : (
                          <span>Update password</span>
                        )}
                      </button>
                    </form>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
