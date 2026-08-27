import { Helmet } from '@dr.pogodin/react-helmet';
import { useState, FormEvent } from 'react';
import { Link, Navigate, useNavigate, useLocation } from "react-router";
import { motion } from 'motion/react';
import { Eye, EyeOff, Loader2, ArrowLeft } from 'lucide-react';
import { signIn, signUp, useSession } from '@/lib/auth/auth-client';
import { toSafeInternalPath } from '@/lib/auth/safe-redirect';
import { auth } from 'virtual:content';
interface AuthPageProps {
  mode: 'login' | 'signup';
}
export default function AuthPage({
  mode
}: AuthPageProps) {
  const {
    isAuthenticated,
    isPending
  } = useSession();
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const searchFrom = toSafeInternalPath(params.get('from') || params.get('redirect'));
  const from: string = (location.state as {
    from?: Location;
  })?.from?.pathname || searchFrom || '/dashboard';
  const isLogin = mode === 'login';
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  if (isAuthenticated) return <Navigate to={from} replace />;
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
    if (!isLogin) {
      const pwdError = validatePassword(password);
      if (pwdError) {
        setError(pwdError);
        return;
      }
    }
    setLoading(true);
    try {
      const result = isLogin ? await signIn.email({
        email,
        password
      }) : await signUp.email({
        email,
        password,
        name: name || email.split('@')[0]
      });
      if (result.error) {
        setError(result.error.message || 'Authentication failed. Please try again.');
        return;
      }
      navigate(from, {
        replace: true
      });
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }
  if (isPending) {
    return <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>;
  }
  const title = isLogin ? auth.login.title : auth.signup.title;
  const subtitle = isLogin ? auth.login.subtitle : auth.signup.subtitle;
  return <>
      <Helmet>
        <title>{isLogin ? 'Sign In' : 'Sign Up'} — AlternMind</title>
        <meta name="description" content={subtitle} />
        <link rel="canonical" href={`https://alternmind.com${isLogin ? '/login' : '/register'}`} />
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="min-h-screen bg-background flex flex-col">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-5">
          <Link to="/" className="inline-flex items-center">
            <img src="/airo-assets/images/logo/horizontal/dark" alt="AlternMind" className="block h-auto max-h-8 w-auto object-contain self-center" />
          </Link>
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft size={14} />
            {auth.backToHome}
          </Link>
        </div>

        {/* Main content */}
        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.45,
          ease: 'easeOut' as const
        }} className="w-full max-w-md">
            {/* Card */}
            <div className="relative rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm p-8 overflow-hidden">
              {/* Subtle glow */}
              <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full pointer-events-none" style={{
              background: 'radial-gradient(circle, hsl(var(--primary) / 0.08) 0%, transparent 70%)'
            }} />

              <div className="relative">
                {/* Header */}
                <div className="mb-8">
                  <h1 className="text-2xl font-bold text-foreground mb-1.5">{title}</h1>
                  <p className="text-sm text-muted-foreground">{subtitle}</p>
                </div>

                {/* Error */}
                {error && <motion.div initial={{
                opacity: 0,
                y: -6
              }} animate={{
                opacity: 1,
                y: 0
              }} className="mb-5 px-4 py-3 rounded-lg border border-destructive/30 bg-destructive/10 text-destructive text-sm">
                    {error}
                  </motion.div>}

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  {!isLogin && <div className="flex flex-col gap-1.5">
                      <label htmlFor="name" className="text-sm font-medium text-foreground/80">
                        Full name
                      </label>
                      <input id="name" type="text" value={name} onChange={e => setName(e.target.value)} disabled={loading} placeholder="Jane Smith" className="w-full px-4 py-2.5 rounded-lg border border-border bg-background/60 text-foreground placeholder:text-muted-foreground/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60 transition-all disabled:opacity-50" />
                    </div>}

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="email" className="text-sm font-medium text-foreground/80">
                      Email address
                    </label>
                    <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required disabled={loading} placeholder="you@company.com" className="w-full px-4 py-2.5 rounded-lg border border-border bg-background/60 text-foreground placeholder:text-muted-foreground/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60 transition-all disabled:opacity-50" />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <label htmlFor="password" className="text-sm font-medium text-foreground/80">
                        Password
                      </label>
                      {isLogin && <Link to="/forgot-password" className="text-xs text-primary hover:text-primary/80 transition-colors">
                          {auth.forgotPassword}
                        </Link>}
                    </div>
                    <div className="relative">
                      <input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required disabled={loading} placeholder={isLogin ? '••••••••' : 'Min 8 chars, A-Z, 0-9, special'} className="w-full px-4 py-2.5 pr-10 rounded-lg border border-border bg-background/60 text-foreground placeholder:text-muted-foreground/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60 transition-all disabled:opacity-50" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors" aria-label={showPassword ? 'Hide password' : 'Show password'}>
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {!isLogin && <p className="text-xs text-muted-foreground">
                        {auth.passwordHint}
                      </p>}
                  </div>

                  <button type="submit" disabled={loading} className="mt-2 w-full flex items-center justify-center gap-2 py-2.5 rounded-full text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 disabled:opacity-60 ring-1 ring-primary/40">
                    {loading ? <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>{isLogin ? 'Signing in…' : 'Creating account…'}</span>
                      </> : <span>{isLogin ? auth.login.submitLabel : auth.signup.submitLabel}</span>}
                  </button>
                </form>

                {/* Switch mode */}
                <p className="mt-6 text-center text-sm text-muted-foreground">
                  {isLogin ? auth.login.switchPrompt : auth.signup.switchPrompt}{' '}
                  <Link to={isLogin ? '/register' : '/login'} className="text-primary hover:text-primary/80 font-medium transition-colors">
                    {isLogin ? auth.login.switchLabel : auth.signup.switchLabel}
                  </Link>
                </p>
              </div>
            </div>

            {/* Legal */}
            <p className="mt-5 text-center text-xs text-muted-foreground/60">
              By continuing, you agree to AlternMind's{' '}
              <Link to="/terms" className="underline underline-offset-2 hover:text-muted-foreground transition-colors">
                Terms
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="underline underline-offset-2 hover:text-muted-foreground transition-colors">
                Privacy Policy
              </Link>
              .
            </p>
          </motion.div>
        </div>
      </div>
    </>;
}
