import { Helmet } from '@dr.pogodin/react-helmet';
import { useState, FormEvent } from 'react';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import { ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';


export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/request-password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, redirectTo: '/reset-password' }),
        credentials: 'include',
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError((result as { message?: string }).message || 'Something went wrong. Please try again.');
        return;
      }
      setSent(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Helmet>
        <title>Forgot Password — AlternMind</title>
        <meta name="description" content="Reset your AlternMind password" />
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
              {/* Subtle glow */}
              <div
                className="absolute -top-20 -right-20 w-64 h-64 rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, hsl(var(--primary) / 0.08) 0%, transparent 70%)' }}
              />

              <div className="relative">
                {sent ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="text-center py-4"
                  >
                    <CheckCircle2 className="w-12 h-12 text-primary mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-foreground mb-2">Check your email</h1>
                    <p className="text-sm text-muted-foreground mb-6">
                      If an account exists for <span className="text-foreground font-medium">{email}</span>, you'll
                      receive a password reset link shortly.
                    </p>
                    <Link
                      to="/login"
                      className="inline-flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 font-medium transition-colors"
                    >
                      <ArrowLeft size={14} />
                      Back to sign in
                    </Link>
                  </motion.div>
                ) : (
                  <>
                    <div className="mb-8">
                      <h1 className="text-2xl font-bold text-foreground mb-1.5">Reset your password</h1>
                      <p className="text-sm text-muted-foreground">
                        Enter your email address and we'll send you a reset link.
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

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="email" className="text-sm font-medium text-foreground/80">
                          Email address
                        </label>
                        <input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          disabled={loading}
                          placeholder="you@company.com"
                          className="w-full px-4 py-2.5 rounded-lg border border-border bg-background/60 text-foreground placeholder:text-muted-foreground/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60 transition-all disabled:opacity-50"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="mt-2 w-full flex items-center justify-center gap-2 py-2.5 rounded-full text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 disabled:opacity-60 ring-1 ring-primary/40"
                      >
                        {loading ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            <span>Sending…</span>
                          </>
                        ) : (
                          <span>Send reset link</span>
                        )}
                      </button>
                    </form>

                    <p className="mt-6 text-center text-sm text-muted-foreground">
                      Remember your password?{' '}
                      <Link to="/login" className="text-primary hover:text-primary/80 font-medium transition-colors">
                        Sign in
                      </Link>
                    </p>
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
