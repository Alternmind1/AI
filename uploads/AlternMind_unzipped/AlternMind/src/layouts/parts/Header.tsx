import { useState, useEffect } from 'react';
import { Link, useNavigate } from "react-router";
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, LogOut } from 'lucide-react';
import { useSession, authClient } from '@/lib/auth/auth-client';

const navLinks = [{
  label: 'Features',
  href: '#features'
}, {
  label: 'How It Works',
  href: '#how-it-works'
}, {
  label: 'Pricing',
  href: '#pricing'
}];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, isAuthenticated } = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleAnchor = (href: string) => {
    setMobileOpen(false);
    if (href.startsWith('#')) {
      const el = document.querySelector(href);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSignOut = async () => {
    setMobileOpen(false);
    await authClient.signOut();
    navigate('/');
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-background/95 backdrop-blur-md border-b border-border/60 shadow-lg shadow-black/30' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center shrink-0">
            <img src="/airo-assets/images/logo/horizontal/dark" alt="AlternMind" className="block h-auto max-h-9 md:max-h-11 w-auto max-w-full object-contain self-center" />
          </Link>

          {/* Desktop Nav */}
          <nav aria-label="Main navigation" className="hidden md:flex items-center gap-8">
            {navLinks.map(link => (
              <button key={link.label} onClick={() => handleAnchor(link.href)} className="relative text-sm font-medium text-foreground/70 hover:text-foreground transition-colors duration-200 group">
                {link.label}
                <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-primary transition-all duration-300 group-hover:w-full" />
              </button>
            ))}
          </nav>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors">
                  {user?.name || user?.email}
                </Link>
                <button
                  onClick={handleSignOut}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold border border-border/60 text-foreground/80 hover:text-foreground hover:border-border transition-all duration-200"
                >
                  <LogOut size={14} />
                  Sign Out
                </button>
              </>
            ) : (
              <Link to="/register" className="inline-flex items-center px-5 py-2 rounded-full text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 hover:-translate-y-0.5 ring-1 ring-primary/50">
                Sign Up / Login
              </Link>
            )}
          </div>

          {/* Mobile toggle */}
          <button className="md:hidden text-foreground/80 hover:text-foreground transition-colors" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-background/98 backdrop-blur-md border-b border-border/60"
          >
            <div className="px-6 py-5 flex flex-col gap-4">
              {navLinks.map(link => (
                <button key={link.label} onClick={() => handleAnchor(link.href)} className="text-left text-base font-medium text-foreground/80 hover:text-foreground transition-colors">
                  {link.label}
                </button>
              ))}
              <div className="pt-2 border-t border-border/40">
                {isAuthenticated ? (
                  <div className="flex flex-col gap-2">
                    <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="text-sm text-muted-foreground text-center">
                      {user?.name || user?.email}
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="inline-flex justify-center items-center gap-2 w-full px-5 py-2.5 rounded-full text-sm font-semibold border border-border/60 text-foreground/80"
                    >
                      <LogOut size={14} />
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <Link to="/register" onClick={() => setMobileOpen(false)} className="inline-flex justify-center items-center w-full px-5 py-2.5 rounded-full text-sm font-semibold bg-primary text-primary-foreground">
                    Sign Up / Login
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
